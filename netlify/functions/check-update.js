import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';

// In-memory cache for version metadata (persists between warm invocations)
let cachedVersionData = null;
let lastCacheUpdate = 0;

// Simple in-memory rate limiting (best effort)
// WARNING: This resets on cold starts and is not shared across function instances.
// This is sufficient for low-traffic protection, but for high-traffic or strict enforcement,
// use a persistent store like Redis (e.g., Upstash) or Netlify Edge Functions with a rate-limit provider.
const ipRequests = new Map();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 30; // 30 requests per minute

/**
 * Netlify Function: check-update
 * Handles secure update metadata retrieval for Rookie on Quest.
 * Validates requests using HMAC-SHA256 signature and timestamp.
 * 
 * @param {Object} event - Netlify Function event
 * @param {Object} context - Netlify Function context
 * @returns {Promise<{statusCode: number, headers: Object, body: string}>}
 */
export const handler = async (event, context) => {
  const requestId = context.awsRequestId || Math.random().toString(36).substring(7);
  const CACHE_TTL_SECONDS = parseInt(process.env.CACHE_TTL_SECONDS || '60', 10);
  const CACHE_TTL = CACHE_TTL_SECONDS * 1000;

  const log = (msg, data = {}) => console.log(JSON.stringify({ 
    timestamp: new Date().toISOString(), 
    requestId, 
    msg, 
    ...data 
  }));
  
  const logError = (msg, error = {}) => console.error(JSON.stringify({ 
    timestamp: new Date().toISOString(), 
    requestId, 
    level: 'ERROR', 
    msg, 
    error: error.message || error,
    stack: error.stack
  }));

  // CORS Configuration
  const allowedOrigins = [
    'https://rookie.vrpirates.org',
    'https://sunshine-aio.netlify.app',
    'http://localhost:8888',
    'http://localhost:3000'
  ];
  const origin = event.headers.origin || event.headers.Origin || '';

  // Allow explicit list or specific Netlify deploy previews
  // Note: This pattern is restricted to the sunshine-aio Netlify site.
  // While it allows previews from PRs, it prevents access from unauthorized domains.
  const isNetlifyPreview = origin.match(/^https:\/\/deploy-preview-\d+--sunshine-aio\.netlify\.app$/);
  const corsOrigin = (allowedOrigins.includes(origin) || isNetlifyPreview) ? origin : allowedOrigins[0];

  const headers = {
    'Access-Control-Allow-Origin': corsOrigin,
    'Access-Control-Allow-Headers': 'Content-Type, X-Rookie-Signature, X-Rookie-Date, X-Purge',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Vary': 'Origin',
    'X-Content-Type-Options': 'nosniff'
  };

  // 0. Rate Limiting
  const clientIp = event.headers['x-nf-client-connection-ip'] || event.headers['client-ip'] || 'unknown';
  const now = Date.now();
  const requestLog = ipRequests.get(clientIp) || [];

  // Filter out expired requests
  const validRequests = requestLog.filter(time => now - time < RATE_LIMIT_WINDOW);

  if (validRequests.length >= MAX_REQUESTS_PER_WINDOW) {
    log('Rate limit exceeded', { clientIp, count: validRequests.length });
    return {
      statusCode: 429,
      headers: { ...headers, 'Retry-After': '60' },
      body: JSON.stringify({ error: 'Too Many Requests: Please try again later.' })
    };
  }

  validRequests.push(now);
  ipRequests.set(clientIp, validRequests);

  // 1. Method Validation
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers
    };
  }

  if (event.httpMethod !== 'GET') {
    log('Method Not Allowed', { method: event.httpMethod });
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  // Security Validation
  const signature = event.headers['x-rookie-signature'];
  const rookieDate = event.headers['x-rookie-date'] || '';
  const purgeRequested = event.headers['x-purge'] === 'true' || event.queryStringParameters?.purge === 'true';
  const secret = process.env.ROOKIE_UPDATE_SECRET;

  if (!signature) {
    log('Unauthorized: Missing signature header');
    return {
      statusCode: 401,
      headers,
      body: JSON.stringify({ error: 'Unauthorized: Missing signature' })
    };
  }

  if (!rookieDate) {
    log('Unauthorized: Missing date header');
    return {
      statusCode: 401,
      headers,
      body: JSON.stringify({ error: 'Unauthorized: Missing timestamp' })
    };
  }

  if (!secret) {
    logError('ROOKIE_UPDATE_SECRET is not configured');
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal Server Error: Security configuration missing' })
    };
  }

  // 2. Timestamp Validation (Replay Attack Prevention)
  const requestTime = new Date(rookieDate).getTime();
  const serverTime = Date.now();
  const fiveMinutes = 5 * 60 * 1000;

  if (isNaN(requestTime) || Math.abs(serverTime - requestTime) > fiveMinutes) {
    log('Forbidden: Request timestamp out of sync', { rookieDate, serverTime: new Date(serverTime).toISOString() });
    return {
      statusCode: 403,
      headers,
      body: JSON.stringify({ error: 'Forbidden: Request timestamp out of sync' })
    };
  }

  // 3. HMAC Signature Validation
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(rookieDate)
    .digest('hex');

  try {
    const signatureBuffer = Buffer.from(signature, 'hex');
    const expectedBuffer = Buffer.from(expectedSignature, 'hex');

    if (signatureBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(signatureBuffer, expectedBuffer)) {
      log('Forbidden: Invalid signature', { received: signature, expected: expectedSignature });
      return {
        statusCode: 403,
        headers,
        body: JSON.stringify({ error: 'Forbidden: Invalid signature' })
      };
    }
  } catch (err) {
    logError('Signature format error', err);
    return {
      statusCode: 403,
      headers,
      body: JSON.stringify({ error: 'Forbidden: Signature format error' })
    };
  }

  // Metadata Response
  try {
    let updateInfo;
    const now = Date.now();

    // Use cache if available and not expired, unless purge requested
    if (!purgeRequested && cachedVersionData && (now - lastCacheUpdate < CACHE_TTL)) {
      updateInfo = { ...cachedVersionData };
      log('Serving from cache', { version: updateInfo.version });
    } else {
      if (purgeRequested) log('Cache purge requested - reloading from disk');
      const baseDir = process.cwd().endsWith('Sunshine-AIO-web') ? process.cwd() : path.join(process.cwd(), 'Sunshine-AIO-web');
      const versionPath = path.join(baseDir, 'public', 'updates', 'rookie', 'version.json');
      const data = await fs.readFile(versionPath, 'utf8');
      updateInfo = JSON.parse(data);

      // Schema Validation
      const requiredFields = ['version', 'changelog', 'downloadUrl', 'checksum'];
      for (const field of requiredFields) {
        if (!updateInfo[field]) {
          throw new Error(`Missing required field in version.json: ${field}`);
        }
      }

      // 4. Security Enforcement: Reject absolute URLs in version.json to ensure local verification
      if (!updateInfo.downloadUrl.startsWith('/')) {
        logError('Security violation: version.json contains absolute downloadUrl', { url: updateInfo.downloadUrl });
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Internal Server Error: Secure download path required' })
        };
      }

      // Verify APK existence and Checksum (internal safety check)
      const apkFileName = path.basename(updateInfo.downloadUrl);
      const apkPath = path.join(baseDir, 'public', 'updates', 'rookie', apkFileName);

      try {
        const apkBuffer = await fs.readFile(apkPath);
        const actualChecksum = crypto.createHash('sha256').update(apkBuffer).digest('hex');

        if (actualChecksum !== updateInfo.checksum) {
          logError('Checksum mismatch', { expected: updateInfo.checksum, actual: actualChecksum, apkPath });
          return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Internal Server Error: Integrity check failed' })
          };
        }
      } catch (e) {
        logError('APK file inaccessible or missing on server', { apkPath, error: e.message });
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Internal Server Error: Update package inaccessible' })
        };
      }

      // Update cache only after successful verification
      cachedVersionData = { ...updateInfo };
      lastCacheUpdate = now;
      log('Cache updated with verified metadata');
    }

    // Prepare response metadata
    updateInfo.timestamp = new Date().toISOString();
    const host = event.headers.host || 'rookie.vrpirates.org';
    const protocol = event.headers['x-forwarded-proto'] || 'https';

    // Convert relative to absolute for the client
    updateInfo.downloadUrl = `${protocol}://${host}${updateInfo.downloadUrl}`;
    log('Successfully served update metadata', { version: updateInfo.version });

    return {
      statusCode: 200,
      headers: {
        ...headers,
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300'
      },
      body: JSON.stringify(updateInfo)
    };
  } catch (err) {
    logError('Error processing update metadata', err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal Server Error: Failed to process update' })
    };
  }
};
