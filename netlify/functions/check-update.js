import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';

export const handler = async (event, context) => {
  const secret = process.env.VRHUB_UPDATE_SECRET;

  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, X-VRHub-Signature, X-VRHub-Date, X-Purge',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers };

  const signature = event.headers['x-vrhub-signature'] || event.headers['X-VRHub-Signature'];
  const vrhubDate = event.headers['x-vrhub-date'] || event.headers['X-VRHub-Date'] || '';

  if (!signature || !vrhubDate) {
    return { statusCode: 401, headers, body: JSON.stringify({ error: 'Unauthorized: Missing headers' }) };
  }

  if (!secret) {
    console.error("VRHUB_UPDATE_SECRET is not set");
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Server configuration error' }) };
  }

  const expectedSignature = crypto.createHmac('sha256', secret).update(vrhubDate).digest('hex');
  if (signature !== expectedSignature) {
    return { statusCode: 403, headers, body: JSON.stringify({ error: 'Forbidden: Invalid signature' }) };
  }

  try {
    // Read version from public/updates/vrhub/version.json (same location as APK)
    // This ensures the check-update function returns the same version as the deployed APK
    const versionPath = path.resolve('public/updates/vrhub/version.json');
    console.log("Attempting to read version from:", versionPath);

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
    
    // Fallback : Essayer de lire dans le dossier courant si le chemin complet échoue
    try {
       const fallbackPath = path.resolve('version.json');
       const data = await fs.readFile(fallbackPath, 'utf8');
       const updateInfo = JSON.parse(data);
       return { statusCode: 200, headers, body: JSON.stringify(updateInfo) };
    } catch (e) {
       return { statusCode: 500, headers, body: JSON.stringify({ error: `Internal Server Error: ${err.message}` }) };
    }
  }
};
