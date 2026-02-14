import { handler } from '../netlify/functions/check-update.js';
import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';

async function runTests() {
  const SECRET = 'test-secret';
  process.env.ROOKIE_UPDATE_SECRET = SECRET;

  const mockContext = { awsRequestId: 'test-req-123' };

  console.log('--- Testing check-update.js ---');

  // Test 1: Missing signature
  console.log('Test 1: Missing signature');
  const res1 = await handler({ httpMethod: 'GET', headers: {} }, mockContext);
  console.log('Status:', res1.statusCode);
  if (res1.statusCode === 401) console.log('✅ Passed');
  else console.log('❌ Failed');

  // Test 2: Invalid signature
  console.log('\nTest 2: Invalid signature');
  const res2 = await handler({
    httpMethod: 'GET',
    headers: {
      'x-rookie-signature': 'invalid',
      'x-rookie-date': new Date().toISOString()
    }
  }, mockContext);
  console.log('Status:', res2.statusCode);
  if (res2.statusCode === 403) console.log('✅ Passed');
  else console.log('❌ Failed');

  // Test 3: Valid signature & timestamp
  console.log('\nTest 3: Valid signature & timestamp');
  const date3 = new Date().toISOString();
  const sig3 = crypto.createHmac('sha256', SECRET).update(date3).digest('hex');
  const res3 = await handler({
    httpMethod: 'GET',
    headers: {
      'x-rookie-signature': sig3,
      'x-rookie-date': date3,
      'host': 'localhost:8888',
      'x-forwarded-proto': 'http'
    }
  }, mockContext);
  console.log('Status:', res3.statusCode);
  if (res3.statusCode === 200) {
    const body = JSON.parse(res3.body);
    if (body.version === '2.5.0' && body.downloadUrl.includes('localhost:8888')) {
        console.log('✅ Passed');
    } else {
        console.log('❌ Failed: unexpected body content', body);
    }
  } else {
    console.log('❌ Failed', res3);
  }

  // Test 4: OPTIONS request
  console.log('\nTest 4: OPTIONS request');
  const res4 = await handler({ httpMethod: 'OPTIONS', headers: { 'origin': 'https://rookie.vrpirates.org' } }, mockContext);
  console.log('Status:', res4.statusCode);
  if (res4.statusCode === 200 && res4.headers['Access-Control-Allow-Origin'] === 'https://rookie.vrpirates.org') console.log('✅ Passed');
  else console.log('❌ Failed');

  // Test 5: Expired timestamp (Replay Attack)
  console.log('\nTest 5: Expired timestamp (Replay Attack)');
  const oldDate = new Date(Date.now() - 10 * 60 * 1000).toISOString(); // 10 minutes ago
  const oldSig = crypto.createHmac('sha256', SECRET).update(oldDate).digest('hex');
  const res5 = await handler({
    httpMethod: 'GET',
    headers: {
      'x-rookie-signature': oldSig,
      'x-rookie-date': oldDate
    }
  }, mockContext);
  console.log('Status:', res5.statusCode);
  if (res5.statusCode === 403) console.log('✅ Passed');
  else console.log('❌ Failed');

  // Test 6: Invalid Date Format
  console.log('\nTest 6: Invalid Date Format');
  const res6 = await handler({
    httpMethod: 'GET',
    headers: {
      'x-rookie-signature': 'somesig',
      'x-rookie-date': 'not-a-date'
    }
  }, mockContext);
  console.log('Status:', res6.statusCode);
  if (res6.statusCode === 403) console.log('✅ Passed');
  else console.log('❌ Failed');

  // Test 7: Method Not Allowed
  console.log('\nTest 7: Method Not Allowed (POST)');
  const res7 = await handler({ httpMethod: 'POST', headers: {} }, mockContext);
  console.log('Status:', res7.statusCode);
  if (res7.statusCode === 405) console.log('✅ Passed');
  else console.log('❌ Failed');

  // Test 8: CORS Unauthorized Origin
  console.log('\nTest 8: CORS Unauthorized Origin');
  const res8 = await handler({
    httpMethod: 'OPTIONS',
    headers: { 'origin': 'https://malicious-site.com' }
  }, mockContext);
  console.log('CORS Origin:', res8.headers['Access-Control-Allow-Origin']);
  if (res8.headers['Access-Control-Allow-Origin'] === 'https://rookie.vrpirates.org') console.log('✅ Passed (Defaulted to safe origin)');
  else console.log('❌ Failed');

  // Test 9: CORS Localhost
  console.log('\nTest 9: CORS Localhost');
  const res9 = await handler({
    httpMethod: 'OPTIONS',
    headers: { 'origin': 'http://localhost:8888' }
  }, mockContext);
  console.log('CORS Origin:', res9.headers['Access-Control-Allow-Origin']);
  if (res9.headers['Access-Control-Allow-Origin'] === 'http://localhost:8888') console.log('✅ Passed');
  else console.log('❌ Failed');

  // Test 10: Checksum Validation (Mismatched)
  console.log('\nTest 10: Checksum Validation (Mismatched)');
  process.env.CACHE_TTL_SECONDS = '0'; // Force cache bypass
  const baseDir = process.cwd().endsWith('Sunshine-AIO-web') ? process.cwd() : path.join(process.cwd(), 'Sunshine-AIO-web');
  const versionPath = path.join(baseDir, 'public', 'updates', 'rookie', 'version.json');
  
  // Backup
  const originalVersionData = await fs.readFile(versionPath, 'utf8');
  const corruptedData = JSON.parse(originalVersionData);
  corruptedData.checksum = 'mismatched-checksum';
  
  await fs.writeFile(versionPath, JSON.stringify(corruptedData), 'utf8');
  
  // Wait a bit for cache TTL or force cache bypass if we had one (here we don't because it's fresh process, but good practice)
  
  const date10 = new Date().toISOString();
  const sig10 = crypto.createHmac('sha256', SECRET).update(date10).digest('hex');
  const res10 = await handler({
    httpMethod: 'GET',
    headers: {
      'x-rookie-signature': sig10,
      'x-rookie-date': date10
    }
  }, mockContext);
  
  console.log('Status:', res10.statusCode);
  if (res10.statusCode === 500) {
      const body = JSON.parse(res10.body);
      if (body.error.includes('Integrity check failed')) {
          console.log('✅ Passed');
      } else {
          console.log('❌ Failed: unexpected error message', body);
      }
  } else {
      console.log('❌ Failed');
  }
  
  // Restore
  await fs.writeFile(versionPath, originalVersionData, 'utf8');

  // Test 11: Missing APK
  console.log('\nTest 11: Missing APK Validation');
  const corruptedData2 = JSON.parse(originalVersionData);
  corruptedData2.downloadUrl = '/non-existent.apk';
  await fs.writeFile(versionPath, JSON.stringify(corruptedData2), 'utf8');
  
  const date11 = new Date().toISOString();
  const sig11 = crypto.createHmac('sha256', SECRET).update(date11).digest('hex');
  const res11 = await handler({
    httpMethod: 'GET',
    headers: {
      'x-rookie-signature': sig11,
      'x-rookie-date': date11
    }
  }, mockContext);
  
  console.log('Status:', res11.statusCode);
  if (res11.statusCode === 500 && JSON.parse(res11.body).error.includes('Update package inaccessible')) {
      console.log('✅ Passed');
  } else {
      console.log('❌ Failed');
  }
  
  // Restore
  await fs.writeFile(versionPath, originalVersionData, 'utf8');

  // Test 12: CORS Netlify Preview
  console.log('\nTest 12: CORS Netlify Preview');
  const res12 = await handler({
    httpMethod: 'OPTIONS',
    headers: { 'origin': 'https://deploy-preview-42--sunshine-aio.netlify.app' }
  }, mockContext);
  console.log('CORS Origin:', res12.headers['Access-Control-Allow-Origin']);
  if (res12.headers['Access-Control-Allow-Origin'] === 'https://deploy-preview-42--sunshine-aio.netlify.app') console.log('✅ Passed');
  else console.log('❌ Failed');
}

runTests().catch(err => {
    console.error('Test suite failed:', err);
    process.exit(1);
});
