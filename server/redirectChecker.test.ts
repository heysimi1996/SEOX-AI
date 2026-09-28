import assert from 'node:assert/strict';
import test from 'node:test';
import { normalizeCanonicalDomain, normalizeRedirectInput } from './redirectChecker.ts';

test('normalizes domains without a protocol and removes fragments', () => {
  assert.equal(normalizeRedirectInput('example.com/path#section').toString(), 'https://example.com/path');
  assert.equal(normalizeCanonicalDomain('https://www.example.com/path').toString(), 'https://www.example.com/');
});

test('rejects unsupported protocols', () => {
  assert.throws(() => normalizeRedirectInput('ftp://example.com'), /Only HTTP and HTTPS/u);
});
