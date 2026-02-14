import { handler } from '../netlify/functions/check-update.js';
import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert';

async function runTests() {
  const SECRET = 'test-secret';
  process.env.ROOKIE_UPDATE_SECRET = SECRET;

  const mockContext = { awsRequestId: 'test-req-123' };

  console.log('--- Testing check-update.js ---');

  // Test 1: Missing signature
  console.log('Test 1: Missing signature');
  const res1 = await handler({ httpMethod: 'GET', headers: {} }, mockContext);
  assert.strictEqual(res1.statusCode, 401, 'Should return 401 for missing signature');
  console.log('✅ Passed');

  // Test 2: Invalid signature
  console.log('\nTest 2: Invalid signature');
  const res2 = await handler({
    httpMethod: 'GET',
    headers: {
      'x-rookie-signature': 'invalid',
      'x-rookie-date': new Date().toISOString()
    }
  }, mockContext);
  assert.strictEqual(res2.statusCode, 403, 'Should return 403 for invalid signature');
  console.log('✅ Passed');

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
  
  assert.strictEqual(res3.statusCode, 200, 'Should return 200 for valid request');
  const body3 = JSON.parse(res3.body);
  assert.strictEqual(body3.version, '2.5.0', 'Version should be 2.5.0');
  assert.ok(body3.downloadUrl.includes('localhost:8888'), 'Download URL should include host');
  console.log('✅ Passed');

  // Test 4: OPTIONS request
  console.log('\nTest 4: OPTIONS request');
  const res4 = await handler({ 
    httpMethod: 'OPTIONS', 
    headers: { 'origin': 'https://rookie.vrpirates.org' } 
  }, mockContext);
  assert.strictEqual(res4.statusCode, 200, 'OPTIONS should return 200');
  assert.strictEqual(res4.headers['Access-Control-Allow-Origin'], 'https://rookie.vrpirates.org', 'CORS origin mismatch');
  console.log('✅ Passed');

  // Test 5: Expired timestamp (Replay Attack Prevention)
  console.log('\nTest 5: Expired timestamp (Replay Attack Prevention)');
  const oldDate = new Date(Date.now() - 10 * 60 * 1000).toISOString(); // 10 minutes ago
  const oldSig = crypto.createHmac('sha256', SECRET).update(oldDate).digest('hex');
  const res5 = await handler({
    httpMethod: 'GET',
    headers: {
      'x-rookie-signature': oldSig,
      'x-rookie-date': oldDate
    }
  }, mockContext);
  assert.strictEqual(res5.statusCode, 403, 'Should return 403 for expired timestamp');
  console.log('✅ Passed');

  // Test 6: Invalid Date Format
  console.log('\nTest 6: Invalid Date Format');
  const res6 = await handler({
    httpMethod: 'GET',
    headers: {
      'x-rookie-signature': 'somesig',
      'x-rookie-date': 'not-a-date'
    }
  }, mockContext);
  assert.strictEqual(res6.statusCode, 403, 'Should return 403 for invalid date format');
  console.log('✅ Passed');

  // Test 7: Method Not Allowed
  console.log('\nTest 7: Method Not Allowed (POST)');
  const res7 = await handler({ httpMethod: 'POST', headers: {} }, mockContext);
  assert.strictEqual(res7.statusCode, 405, 'Should return 405 for POST');
  console.log('✅ Passed');

  // Test 8: CORS Unauthorized Origin
  console.log('\nTest 8: CORS Unauthorized Origin');
  const res8 = await handler({
    httpMethod: 'OPTIONS',
    headers: { 'origin': 'https://malicious-site.com' }
  }, mockContext);
  assert.strictEqual(res8.headers['Access-Control-Allow-Origin'], 'https://rookie.vrpirates.org', 'Should default to safe origin');
  console.log('✅ Passed');

  // Test 9: CORS Localhost
  console.log('\nTest 9: CORS Localhost');
  const res9 = await handler({
    httpMethod: 'OPTIONS',
    headers: { 'origin': 'http://localhost:8888' }
  }, mockContext);
  assert.strictEqual(res9.headers['Access-Control-Allow-Origin'], 'http://localhost:8888', 'Should allow localhost');
  console.log('✅ Passed');

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

  const date10 = new Date().toISOString();
  const sig10 = crypto.createHmac('sha256', SECRET).update(date10).digest('hex');
  const res10 = await handler({
    httpMethod: 'GET',
    headers: {
      'x-rookie-signature': sig10,
      'x-rookie-date': date10
    }
  }, mockContext);

  assert.strictEqual(res10.statusCode, 500, 'Should return 500 for checksum mismatch');
  const body10 = JSON.parse(res10.body);
  assert.ok(body10.error.includes('Integrity check failed'), 'Error message should mention integrity check');
  console.log('✅ Passed');

  // Restore
  await fs.writeFile(versionPath, originalVersionData, 'utf8');

  // Test 11: Missing APK Validation
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

  assert.strictEqual(res11.statusCode, 500, 'Should return 500 for missing APK');
  const body11 = JSON.parse(res11.body);
  assert.ok(body11.error.includes('Update package inaccessible'), 'Error message should mention package inaccessible');
  console.log('✅ Passed');

  // Restore
  await fs.writeFile(versionPath, originalVersionData, 'utf8');

  // Test 12: CORS Netlify Preview
  console.log('\nTest 12: CORS Netlify Preview');
  const res12 = await handler({
    httpMethod: 'OPTIONS',
    headers: { 'origin': 'https://deploy-preview-42--sunshine-aio.netlify.app' }
  }, mockContext);
  assert.strictEqual(res12.headers['Access-Control-Allow-Origin'], 'https://deploy-preview-42--sunshine-aio.netlify.app', 'Should allow Netlify previews');
  console.log('✅ Passed');
}

runTests().catch(err => {
    console.error('Test suite failed:', err);
    process.exit(1);
});