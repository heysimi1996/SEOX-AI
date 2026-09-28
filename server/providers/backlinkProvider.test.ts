import assert from 'node:assert/strict';
import test, { type TestContext } from 'node:test';
import {
  AhrefsAdapter,
  DataForSeoAdapter,
  MajesticAdapter,
  MozAdapter,
  SemrushAdapter,
} from './backlinkProvider.ts';

function preserveEnvironment(keys: string[], context: TestContext) {
  const previous = new Map(keys.map((key) => [key, process.env[key]]));
  context.after(() => {
    for (const [key, value] of previous) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  });
}

test('unconfigured DataForSEO returns no fabricated metrics or assessment', async (context) => {
  const keys = ['DATAFORSEO_LOGIN', 'DATAFORSEO_PASSWORD'];
  preserveEnvironment(keys, context);
  for (const key of keys) delete process.env[key];

  const result = await new DataForSeoAdapter().fetchBacklinks('example.com');
  assert.equal(result.status, 'not_configured');
  assert.equal(result.configured, false);
  assert.equal(result.metrics, null);
  assert.equal(result.riskAssessment, null);
  assert.deepEqual(result.backlinks, []);
});

test('provider credentials do not mark unimplemented integrations as available', async (context) => {
  const keys = [
    'AHREFS_API_KEY',
    'SEMRUSH_API_KEY',
    'MOZ_ACCESS_ID',
    'MOZ_SECRET_KEY',
    'MAJESTIC_API_KEY',
  ];
  preserveEnvironment(keys, context);
  for (const key of keys) process.env[key] = 'test-credential';

  for (const Adapter of [AhrefsAdapter, SemrushAdapter, MozAdapter, MajesticAdapter]) {
    const adapter = new Adapter();
    assert.equal(adapter.isConfigured(), false);
    const result = await adapter.fetchBacklinks('example.com');
    assert.equal(result.status, 'not_configured');
    assert.equal(result.configured, false);
    assert.equal(result.metrics, null);
    assert.equal(result.riskAssessment, null);
  }
});

test('DataForSEO preserves missing source fields instead of inventing backlink data', async (context) => {
  const keys = ['DATAFORSEO_LOGIN', 'DATAFORSEO_PASSWORD'];
  preserveEnvironment(keys, context);
  process.env.DATAFORSEO_LOGIN = 'test-login';
  process.env.DATAFORSEO_PASSWORD = 'test-password';

  context.mock.method(globalThis, 'fetch', async () => new Response(JSON.stringify({
    tasks: [{
      result: [{
        items: [{
          url_from: 'https://referrer.example/article',
          url_to: 'https://example.com/page',
          anchor: 'Example',
        }],
      }],
    }],
  }), { status: 200, headers: { 'Content-Type': 'application/json' } }));

  const result = await new DataForSeoAdapter().fetchBacklinks('example.com');
  assert.equal(result.status, 'configured');
  assert.equal(result.configured, true);
  assert.equal(result.metrics?.totalBacklinks, 1);
  assert.equal(result.metrics?.referringDomains, 1);
  assert.equal(result.metrics?.dofollowCount, null);
  assert.equal(result.metrics?.nofollowCount, null);
  assert.equal(result.metrics?.dofollowPercentage, null);
  assert.equal(result.riskAssessment?.summary, 'Clean backlink footprint. No manipulative anchor concentration or sitewide anomalies detected.');
  assert.deepEqual(result.backlinks[0], {
    id: 'dfs_0_https://referrer.example/article',
    sourceDomain: 'referrer.example',
    sourceUrl: 'https://referrer.example/article',
    targetUrl: 'https://example.com/page',
    anchor: 'Example',
    linkType: 'text',
    isFollow: null,
    providerRank: null,
    pageRank: null,
    firstSeen: null,
    lastSeen: null,
  });
});
