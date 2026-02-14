import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';

// In-memory cache for version metadata (persists between warm invocations)
let cachedVersionData = null;
let lastCacheUpdate = 0;
const CACHE_TTL = 60 * 1000; // 1 minute cache for file I/O

/**
 * Netlify Function: check-update
 * Handles secure update metadata retrieval for Rookie on Quest.
 * Validates requests using HMAC-SHA256 signature and timestamp.
 * 
 * @param {Object} event - Netlify Function event
 * @param {Object} context - Netlify Function context
 * @returns {Promise<Object>} - HTTP response
 */
export const handler = async (event, context) => {
  const requestId = context.awsRequestId || Math.random().toString(36).substring(7);
  const log = (msg, data = {}) => console.log(JSON.stringify({ timestamp: new Date().toISOString(), requestId, msg, ...data }));
  const logError = (msg, error = {}) => console.error(JSON.stringify({ timestamp: new Date().toISOString(), requestId, level: 'ERROR', msg, error: error.message || error }));

  // CORS Configuration
  const allowedOrigins = ['https://rookie.vrpirates.org', 'https://sunshine-aio.netlify.app'];
  const origin = event.headers.origin || event.headers.Origin;
  const corsOrigin = allowedOrigins.includes(origin) ? origin : allowedOrigins[0];

  const headers = {
    'Access-Control-Allow-Origin': corsOrigin,
    'Access-Control-Allow-Headers': 'Content-Type, X-Rookie-Signature, X-Rookie-Date',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Vary': 'Origin',
    'X-Content-Type-Options': 'nosniff'
  };

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

    // Use cache if available and not expired
    if (cachedVersionData && (now - lastCacheUpdate < CACHE_TTL)) {
      updateInfo = { ...cachedVersionData };
    } else {
      const versionPath = path.join(process.cwd(), 'public', 'updates', 'rookie', 'version.json');
      const data = await fs.readFile(versionPath, 'utf8');
      updateInfo = JSON.parse(data);
      
      // Update cache
      cachedVersionData = { ...updateInfo };
      lastCacheUpdate = now;
      log('Cache updated from disk');
    }

    // Verify APK existence (internal safety check)
    if (updateInfo.downloadUrl.startsWith('/')) {
      const apkFileName = path.basename(updateInfo.downloadUrl);
      const apkPath = path.join(process.cwd(), 'public', 'updates', 'rookie', apkFileName);
      
      try {
        await fs.access(apkPath);
      } catch (e) {
        logError('APK file missing on server', { apkPath });
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Internal Server Error: Update package not found' })
        };
      }
    }

    // Prepare response metadata
    updateInfo.timestamp = new Date().toISOString();
    const host = event.headers.host || 'rookie.vrpirates.org';
    const protocol = event.headers['x-forwarded-proto'] || 'https';
    
    if (updateInfo.downloadUrl.startsWith('/')) {
      updateInfo.downloadUrl = `${protocol}://${host}${updateInfo.downloadUrl}`;
    }

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
    logError('Error reading version metadata', err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal Server Error: Failed to load update metadata' })
    };
  }
};
