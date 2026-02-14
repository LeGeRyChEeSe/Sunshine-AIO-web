import { handler } from '../netlify/functions/check-update.js';
import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';

async function runTests() {
  const SECRET = 'test-secret';
  process.env.ROOKIE_UPDATE_SECRET = SECRET;

  const mockContext = {};

  console.log('--- Testing check-update.js ---');

  // Test 1: Missing signature
  console.log('Test 1: Missing signature');
  const event1 = {
    httpMethod: 'GET',
    headers: {}
  };
  const res1 = await handler(event1, mockContext);
  console.log('Status:', res1.statusCode);
  console.log('Body:', res1.body);
  if (res1.statusCode === 401) console.log('✅ Passed');
  else console.log('❌ Failed');

  // Test 2: Invalid signature
  console.log('\nTest 2: Invalid signature');
  const event2 = {
    httpMethod: 'GET',
    headers: {
      'x-rookie-signature': 'invalid',
      'x-rookie-date': '2026-02-14T00:00:00Z'
    }
  };
  const res2 = await handler(event2, mockContext);
  console.log('Status:', res2.statusCode);
  if (res2.statusCode === 403) console.log('✅ Passed');
  else console.log('❌ Failed');

  // Test 3: Valid signature
  console.log('\nTest 3: Valid signature');
  const date = new Date().toISOString();
  const signature = crypto
    .createHmac('sha256', SECRET)
    .update(date)
    .digest('hex');

  const event3 = {
    httpMethod: 'GET',
    headers: {
      'x-rookie-signature': signature,
      'x-rookie-date': date,
      'host': 'localhost:8888',
      'x-forwarded-proto': 'http'
    }
  };
  const res3 = await handler(event3, mockContext);
  console.log('Status:', res3.statusCode);
  console.log('Body:', res3.body);
  if (res3.statusCode === 200) {
    const body = JSON.parse(res3.body);
    if (body.version === '2.5.0' && body.downloadUrl.includes('localhost:8888')) {
        console.log('✅ Passed');
    } else {
        console.log('❌ Failed: unexpected body content');
    }
  } else {
    console.log('❌ Failed');
  }

  // Test 4: OPTIONS request
  console.log('\nTest 4: OPTIONS request');
  const event4 = {
    httpMethod: 'OPTIONS',
    headers: {}
  };
  const res4 = await handler(event4, mockContext);
  console.log('Status:', res4.statusCode);
  if (res4.statusCode === 200 && res4.headers['Access-Control-Allow-Methods']) console.log('✅ Passed');
  else console.log('❌ Failed');
}

runTests().catch(err => {
    console.error('Test suite failed:', err);
    process.exit(1);
});
