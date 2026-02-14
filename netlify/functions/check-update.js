import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';

export const handler = async (event, context) => {
  // CORS Headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, X-Rookie-Signature, X-Rookie-Date',
    'Access-Control-Allow-Methods': 'GET, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers
    };
  }

  // Security Validation
  const signature = event.headers['x-rookie-signature'];
  const rookieDate = event.headers['x-rookie-date'] || '';
  const secret = process.env.ROOKIE_UPDATE_SECRET;

  if (!signature) {
    return {
      statusCode: 401,
      headers,
      body: JSON.stringify({ error: 'Unauthorized: Missing signature' })
    };
  }

  if (!secret) {
    console.error('ROOKIE_UPDATE_SECRET is not configured');
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal Server Error: Security configuration missing' })
    };
  }

  // Calculate expected signature
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(rookieDate)
    .digest('hex');

  try {
    // timingSafeEqual requires both buffers to have the same length
    const signatureBuffer = Buffer.from(signature, 'hex');
    const expectedBuffer = Buffer.from(expectedSignature, 'hex');

    if (signatureBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(signatureBuffer, expectedBuffer)) {
      return {
        statusCode: 403,
        headers,
        body: JSON.stringify({ error: 'Forbidden: Invalid signature' })
      };
    }
  } catch (err) {
    return {
      statusCode: 403,
      headers,
      body: JSON.stringify({ error: 'Forbidden: Signature format error' })
    };
  }

    // Metadata Response
    try {
      // Environment-aware path resolution using process.cwd()
      const versionPath = path.join(process.cwd(), 'public', 'updates', 'rookie', 'version.json');
      const data = await fs.readFile(versionPath, 'utf8');
      const updateInfo = JSON.parse(data);
  
      // Add server-side timestamp
      updateInfo.timestamp = new Date().toISOString();
  
      // Prepend host to downloadUrl if it's relative
      const host = event.headers.host || 'rookie.vrpirates.org';
      const protocol = event.headers['x-forwarded-proto'] || 'https';
      if (updateInfo.downloadUrl.startsWith('/')) {
          updateInfo.downloadUrl = `${protocol}://${host}${updateInfo.downloadUrl}`;
      }
      return {
      statusCode: 200,
      headers: {
        ...headers,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updateInfo)
    };
  } catch (err) {
    console.error('Error reading version metadata:', err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal Server Error: Failed to load update metadata' })
    };
  }
};
