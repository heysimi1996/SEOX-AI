import assert from 'node:assert/strict';
import dns from 'dns/promises';
import { createServer, type IncomingMessage, type Server, type ServerResponse } from 'node:http';
import type { AddressInfo } from 'node:net';
import test from 'node:test';
import { checkRedirect, normalizeCanonicalDomain, normalizeRedirectInput } from './redirectChecker.ts';
import { validateSafeUrl } from './security.ts';

interface TestServer {
  origin: string;
  server: Server;
  close: () => Promise<void>;
}

async function startServer(
  handler: (request: IncomingMessage, response: ServerResponse) => void,
): Promise<TestServer> {
  const server = createServer(handler);
  await new Promise<void>((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });
  const address = server.address() as AddressInfo;
  return {
    server,
    origin: `http://127.0.0.1:${address.port}`,
    close: () => new Promise<void>((resolve, reject) => {
      server.close((error) => error ? reject(error) : resolve());
      server.closeAllConnections();
    }),
  };
}

function allowMockOrigin(origin: string): typeof validateSafeUrl {
  const mock = new URL(origin);
  return async (rawUrl) => {
    const url = new URL(rawUrl);
    if (url.hostname === mock.hostname && url.port === mock.port) return { safe: true, url };
    return validateSafeUrl(rawUrl);
  };
}

async function withServer<T>(
  handler: (request: IncomingMessage, response: ServerResponse) => void,
  run: (mock: TestServer) => Promise<T>,
): Promise<T> {
  const mock = await startServer(handler);
  try {
    return await run(mock);
  } finally {
    await mock.close();
  }
}

test('normalizes domains without a protocol and removes fragments', () => {
  assert.equal(normalizeRedirectInput('example.com/path#section').toString(), 'https://example.com/path');
  assert.equal(normalizeCanonicalDomain('https://www.example.com/path').toString(), 'https://www.example.com/');
});

test('rejects unsupported and malformed URLs without making a network request', async () => {
  const targets = [
    'ftp://example.com',
    'file:///etc/passwd',
    'javascript:alert(1)',
    'data:text/plain,hello',
    'https://[malformed',
    'not a valid URL with spaces',
  ];
  let networkRequests = 0;
  const fetch: typeof globalThis.fetch = async () => {
    networkRequests += 1;
    throw new Error('fetch must not be called for invalid inputs');
  };

  for (const target of targets) {
    const result = await checkRedirect(target, 'https://example.com', { fetch });
    assert.equal(result.errorCode, 'INVALID_URL', target);
    assert.equal(result.result, 'ERROR', target);
    assert.equal(result.message, 'Invalid URL. Enter a valid domain or URL.', target);
    assert.equal('stack' in result, false, target);
  }
  assert.equal(networkRequests, 0);
});

test('blocks loopback, private, link-local and cloud metadata targets before DNS or HTTP requests', async (context) => {
  const targets = [
    'http://127.0.0.1',
    'http://localhost',
    'http://0.0.0.0',
    'http://[::1]',
    'http://10.0.0.1',
    'http://172.16.0.1',
    'http://172.31.255.254',
    'http://192.168.1.1',
    'http://169.254.0.1',
    'http://169.254.169.254',
  ];
  let networkRequests = 0;
  let dnsRequests = 0;
  context.mock.method(dns, 'lookup', async () => {
    dnsRequests += 1;
    return [{ address: '8.8.8.8', family: 4 }];
  });
  const fetch: typeof globalThis.fetch = async () => {
    networkRequests += 1;
    throw new Error('blocked targets must not reach fetch');
  };

  for (const target of targets) {
    const first = await checkRedirect(target, target, { fetch });
    const second = await checkRedirect(target, target, { fetch });
    assert.equal(first.errorCode, 'SSRF_BLOCKED', target);
    assert.equal(first.result, 'ERROR', target);
    assert.equal(first.message, 'The requested URL is not allowed.', target);
    assert.deepEqual(
      { errorCode: second.errorCode, result: second.result, message: second.message, chain: second.chain },
      { errorCode: first.errorCode, result: first.result, message: first.message, chain: first.chain },
      `stable error response for ${target}`,
    );
    assert.equal(JSON.stringify(first).includes('stack'), false, target);
  }
  assert.equal(networkRequests, 0);
  assert.equal(dnsRequests, 0);
});

test('maps DNS resolution failures to a stable DNS_ERROR response', async () => {
  let networkRequests = 0;
  const validateUrl: typeof validateSafeUrl = async (rawUrl) => ({ safe: true, url: new URL(rawUrl) });
  const fetch: typeof globalThis.fetch = async () => {
    networkRequests += 1;
    throw new Error('fetch failed', {
      cause: Object.assign(new Error('getaddrinfo ENOTFOUND missing.example.test'), { code: 'ENOTFOUND' }),
    });
  };
  const result = await checkRedirect(
    'https://missing.example.test',
    'https://missing.example.test',
    { validateUrl, fetch },
  );
  assert.equal(result.errorCode, 'DNS_ERROR');
  assert.equal(result.result, 'ERROR');
  assert.equal(result.message, 'The URL could not be reached.');
  assert.equal(networkRequests, 1);
});

test('rejects DNS lookup failures before making an HTTP request', async (context) => {
  let dnsRequests = 0;
  let networkRequests = 0;
  context.mock.method(dns, 'lookup', async () => {
    dnsRequests += 1;
    throw Object.assign(new Error('getaddrinfo ENOTFOUND missing.example'), { code: 'ENOTFOUND' });
  });
  const fetch: typeof globalThis.fetch = async () => {
    networkRequests += 1;
    throw new Error('DNS-rejected hosts must not reach fetch');
  };
  const result = await checkRedirect('https://missing.example', 'https://missing.example', { fetch });
  assert.equal(result.errorCode, 'SSRF_BLOCKED');
  assert.equal(result.result, 'ERROR');
  assert.equal(result.message, 'The requested URL is not allowed.');
  assert.equal(dnsRequests, 1);
  assert.equal(networkRequests, 0);
});

test('blocks a private redirect destination before making a second HTTP request', async () => {
  let networkRequests = 0;
  await withServer((_request, response) => {
    networkRequests += 1;
    response.writeHead(301, { Location: 'http://127.0.0.1/' });
    response.end();
  }, async ({ origin }) => {
    const result = await checkRedirect(`${origin}/to-private`, origin, {
      validateUrl: allowMockOrigin(origin),
    });
    assert.equal(result.errorCode, 'SSRF_BLOCKED');
    assert.equal(result.chain.length, 1);
    assert.equal(networkRequests, 1);
  });
});

test('blocks non-HTTP redirect destinations before validating or requesting them', async () => {
  const destinations = [
    'ftp://example.com/file',
    'file:///etc/passwd',
    'javascript:alert(1)',
    'data:text/plain,blocked',
  ];
  let networkRequests = 0;
  await withServer((_request, response) => {
    networkRequests += 1;
    response.writeHead(302, { Location: destinations[networkRequests - 1] });
    response.end();
  }, async ({ origin }) => {
    for (const [index, destination] of destinations.entries()) {
      const result = await checkRedirect(`${origin}/unsafe-${index}`, origin, {
        validateUrl: allowMockOrigin(origin),
      });
      assert.equal(result.errorCode, 'SSRF_BLOCKED', destination);
      assert.equal(result.message, 'Redirect target is not allowed.', destination);
      assert.equal(result.chain.length, 1, destination);
    }
    assert.equal(networkRequests, destinations.length);
  });
});

test('detects a two-URL redirect loop', async () => {
  let requests = 0;
  await withServer((request, response) => {
    requests += 1;
    response.writeHead(301, { Location: request.url === '/a' ? '/b' : '/a' });
    response.end();
  }, async ({ origin }) => {
    const result = await checkRedirect(`${origin}/a`, origin, { validateUrl: allowMockOrigin(origin) });
    assert.equal(result.errorCode, 'REDIRECT_LOOP');
    assert.equal(result.result, 'ERROR');
    assert.equal(requests, 2);
    assert.equal(result.redirectCount, 2);
  });
});

test('detects a three-URL redirect loop', async () => {
  let requests = 0;
  const destinations: Record<string, string> = { '/a': '/b', '/b': '/c', '/c': '/a' };
  await withServer((request, response) => {
    requests += 1;
    response.writeHead(301, { Location: destinations[request.url ?? ''] });
    response.end();
  }, async ({ origin }) => {
    const result = await checkRedirect(`${origin}/a`, origin, { validateUrl: allowMockOrigin(origin) });
    assert.equal(result.errorCode, 'REDIRECT_LOOP');
    assert.equal(result.result, 'ERROR');
    assert.equal(requests, 3);
    assert.equal(result.redirectCount, 3);
  });
});

test('stops a redirect chain after the configured maximum instead of requesting indefinitely', async () => {
  let requests = 0;
  await withServer((request, response) => {
    requests += 1;
    const index = Number(new URL(request.url ?? '/', 'http://localhost').pathname.split('/').pop());
    response.writeHead(301, { Location: `/chain/${index + 1}` });
    response.end();
  }, async ({ origin }) => {
    const result = await checkRedirect(`${origin}/chain/0`, origin, { validateUrl: allowMockOrigin(origin) });
    assert.equal(result.errorCode, 'TOO_MANY_REDIRECTS');
    assert.equal(result.result, 'ERROR');
    assert.equal(requests, 11);
    assert.equal(result.chain.length, 11);
    assert.ok(requests <= 11, 'request count remains bounded');
  });
});

test('reports a successful single 301 redirect and its full chain', async () => {
  await withServer((request, response) => {
    if (request.url === '/source') {
      response.writeHead(301, { Location: '/destination' });
      response.end();
      return;
    }
    response.writeHead(200, { 'Content-Type': 'text/plain' });
    response.end('destination');
  }, async ({ origin }) => {
    const result = await checkRedirect(`${origin}/source`, origin, { validateUrl: allowMockOrigin(origin) });
    assert.equal(result.result, 'PASS');
    assert.equal(result.status, 200);
    assert.equal(result.finalUrl, `${origin}/destination`);
    assert.equal(result.redirectCount, 1);
    assert.deepEqual(result.chain, [
      { url: `${origin}/source`, status: 301, location: '/destination' },
      { url: `${origin}/destination`, status: 200 },
    ]);
  });
});

test('reports a single 302 redirect as a warning', async () => {
  await withServer((request, response) => {
    if (request.url === '/source') {
      response.writeHead(302, { Location: '/destination' });
      response.end();
      return;
    }
    response.writeHead(200);
    response.end('destination');
  }, async ({ origin }) => {
    const result = await checkRedirect(`${origin}/source`, origin, { validateUrl: allowMockOrigin(origin) });
    assert.equal(result.result, 'WARNING');
    assert.equal(result.status, 200);
    assert.equal(result.finalUrl, `${origin}/destination`);
    assert.equal(result.redirectCount, 1);
    assert.equal(result.chain[0]?.status, 302);
    assert.equal(result.chain[0]?.location, '/destination');
  });
});

test('classifies HTTP 404 and 500 responses', async () => {
  await withServer((request, response) => {
    response.writeHead(request.url === '/not-found' ? 404 : 500);
    response.end();
  }, async ({ origin }) => {
    const notFound = await checkRedirect(`${origin}/not-found`, origin, { validateUrl: allowMockOrigin(origin) });
    const serverError = await checkRedirect(`${origin}/server-error`, origin, { validateUrl: allowMockOrigin(origin) });
    assert.equal(notFound.errorCode, 'HTTP_4XX');
    assert.equal(notFound.status, 404);
    assert.equal(serverError.errorCode, 'HTTP_5XX');
    assert.equal(serverError.status, 500);
  });
});

test('returns a stable timeout error for a slow response', async () => {
  await withServer((_request, response) => {
    const timer = setTimeout(() => {
      if (!response.destroyed) response.end('late');
    }, 250);
    response.on('close', () => clearTimeout(timer));
  }, async ({ origin }) => {
    const result = await checkRedirect(`${origin}/slow`, origin, {
      validateUrl: allowMockOrigin(origin),
      timeoutMs: 20,
    });
    assert.equal(result.errorCode, 'TIMEOUT');
    assert.equal(result.result, 'ERROR');
    assert.equal(result.message, 'The request timed out.');
    assert.equal(JSON.stringify(result).includes('stack'), false);
  });
});
