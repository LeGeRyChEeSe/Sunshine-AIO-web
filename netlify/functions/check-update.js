import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const handler = async (event, context) => {
  const secret = process.env.ROOKIE_UPDATE_SECRET;

  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, X-Rookie-Signature, X-Rookie-Date, X-Purge',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers };

  const signature = event.headers['x-rookie-signature'];
  const rookieDate = event.headers['x-rookie-date'] || '';

  if (!signature || !rookieDate) {
    return { statusCode: 401, headers, body: JSON.stringify({ error: 'Unauthorized: Missing headers' }) };
  }

  if (!secret) {
    console.error("ROOKIE_UPDATE_SECRET is not set");
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Server configuration error' }) };
  }

  const expectedSignature = crypto.createHmac('sha256', secret).update(rookieDate).digest('hex');
  if (signature !== expectedSignature) {
    console.warn("Invalid signature", { received: signature, expected: expectedSignature });
    return { statusCode: 403, headers, body: JSON.stringify({ error: 'Forbidden: Invalid signature' }) };
  }

  try {
    // Dans Netlify, les fichiers inclus sont au même niveau que la fonction
    const versionPath = path.join(__dirname, 'version.json');
    console.log("Reading version from:", versionPath);
    
    const data = await fs.readFile(versionPath, 'utf8');
    const updateInfo = JSON.parse(data);

    updateInfo.timestamp = new Date().toISOString();
    const host = event.headers.host;
    const protocol = event.headers['x-forwarded-proto'] || 'https';

    if (updateInfo.downloadUrl.startsWith('/')) {
      updateInfo.downloadUrl = `${protocol}://${host}${updateInfo.downloadUrl}`;
    }

    return { statusCode: 200, headers, body: JSON.stringify(updateInfo) };
  } catch (err) {
    console.error("Error processing update metadata:", err.message);
    return { statusCode: 500, headers, body: JSON.stringify({ error: `Internal Server Error: ${err.message}` }) };
  }
};
