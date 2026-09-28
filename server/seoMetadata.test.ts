import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import test from 'node:test';
import { seoToolPages, SEO_PRODUCTION_ORIGIN, SEO_TOOLS_BASE } from '../src/data/seoTools.ts';
import { getSeoPageMetadata, SEO_SOCIAL_IMAGE } from '../src/data/seoPageMetadata.ts';
import { canonicalUrlForPath } from '../src/data/canonicalUrl.ts';
import { getMetaFieldStatus, hasAuditedScore } from '../src/data/seoPageQuality.ts';
import { ENTITY_MANAGER_PATH } from '../src/data/entityManager.ts';
import { renderLocalizedHomepageHtml, renderSeoPageHtml } from './seoMetadata.ts';

const root = process.cwd();
const html = readFileSync(join(root, 'index.html'), 'utf8');
const toolsComponent = readFileSync(join(root, 'src/components/SeoToolsSite.tsx'), 'utf8');
const robots = readFileSync(join(root, 'public/robots.txt'), 'utf8');
const sitemap = readFileSync(join(root, 'public/sitemap.xml'), 'utf8');
const productionUrl = 'https://seox-ai.site/';

test('homepage metadata uses the production canonical URL', () => {
  assert.match(html, /<link rel="canonical" href="https:\/\/seox-ai\.site\/"\s*\/>/u);
  assert.match(html, /<meta property="og:url" content="https:\/\/seox-ai\.site\/"\s*\/>/u);
  assert.match(html, /<meta name="twitter:url" content="https:\/\/seox-ai\.site\/"\s*\/>/u);
  assert.match(html, /<meta property="og:image" content="https:\/\/seox-ai\.site\/seox-ai-banner\.png"\s*\/>/u);
  assert.match(html, /<meta name="twitter:image" content="https:\/\/seox-ai\.site\/seox-ai-banner\.png"\s*\/>/u);
  assert.doesNotMatch(html, /https?:\/\/(?:www\.)?seox\.ai/iu);
});

test('JSON-LD contains one production WebSite and SoftwareApplication in the existing graph', () => {
  const jsonLd = html.match(/<script type="application\/ld\+json">\s*([\s\S]*?)\s*<\/script>/u)?.[1];
  assert.ok(jsonLd, 'JSON-LD script exists');
  const schema = JSON.parse(jsonLd) as {
    '@graph': Array<Record<string, unknown>>;
  };
  const graph = schema['@graph'];
  assert.equal(graph.length, 2);
  assert.deepEqual(graph.map((entity) => entity['@type']), ['WebSite', 'SoftwareApplication']);
  assert.deepEqual(graph[0], {
    '@type': 'WebSite',
    '@id': 'https://seox-ai.site/#website',
    url: productionUrl,
    name: 'SEOX AI',
    inLanguage: 'vi-VN',
    description: 'Nền tảng kiểm tra SEO kỹ thuật và trí tuệ nhân tạo hàng đầu',
  });
  assert.deepEqual(graph[1], {
    '@type': 'SoftwareApplication',
    '@id': 'https://seox-ai.site/#application',
    name: 'SEOX AI',
    url: productionUrl,
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    inLanguage: 'vi-VN',
  });
});

test('robots and sitemap reference only the production site origin', () => {
  assert.match(robots.trimEnd(), /^User-agent: \*\nAllow: \/\n\nSitemap: https:\/\/seox-ai\.site\/sitemap\.xml$/u);
  assert.match(sitemap, /<loc>https:\/\/seox-ai\.site\/<\/loc>/u);
  assert.doesNotMatch(`${robots}\n${sitemap}`, /https?:\/\/(?:www\.)?seox\.ai/iu);
});

test('every SEO tool has unique production metadata and a sitemap entry', () => {
  const paths = [SEO_TOOLS_BASE, ...seoToolPages.map((tool) => tool.path)];
  const canonicals = paths.map((route) => getSeoPageMetadata(route)?.canonical);
  assert.equal(new Set(canonicals).size, paths.length);
  for (const canonical of canonicals) {
    assert.ok(canonical);
    assert.ok(sitemap.includes(`<loc>${canonical}</loc>`), `sitemap includes ${canonical}`);
  }
  for (const tool of seoToolPages) {
    const metadata = getSeoPageMetadata(tool.path);
    assert.ok(metadata);
    assert.equal(metadata.canonical, `${SEO_PRODUCTION_ORIGIN}${tool.path}`);
    assert.equal(metadata.title, tool.metaTitle);
  }
});

test('route HTML receives matching canonical, title, Open Graph and JSON-LD metadata', () => {
  for (const route of seoToolPages) {
    const rendered = renderSeoPageHtml(html, route.path);
    assert.ok(rendered);
    assert.ok(rendered.includes(`<title>${route.metaTitle}</title>`));
    assert.ok(rendered.includes(`<link rel="canonical" href="${SEO_PRODUCTION_ORIGIN}${route.path}"`));
    assert.ok(rendered.includes(`<meta property="og:url" content="${SEO_PRODUCTION_ORIGIN}${route.path}"`));
    assert.ok(rendered.includes(`<meta property="og:image" content="${SEO_SOCIAL_IMAGE}"`));
    assert.ok(rendered.includes(`<meta name="twitter:url" content="${SEO_PRODUCTION_ORIGIN}${route.path}"`));
    assert.ok(rendered.includes(`<meta name="twitter:image" content="${SEO_SOCIAL_IMAGE}"`));
    const schemaText = rendered.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/u)?.[1];
    assert.ok(schemaText);
    const schema = JSON.parse(schemaText) as { '@graph': Array<Record<string, unknown>> };
    const types = schema['@graph'].map((entity) => entity['@type']);
    assert.equal(new Set(types).size, types.length, `${route.path} has duplicate schema types`);
    assert.deepEqual(types, ['WebApplication', 'BreadcrumbList']);
    assert.ok(schemaText.includes(`${SEO_PRODUCTION_ORIGIN}${route.path}#application`));
    assert.equal([...rendered.matchAll(/<script type="application\/ld\+json">/giu)].length, 1);
  }
  assert.doesNotMatch(toolsComponent, /createElement\(['"]script['"]\)|data-seox-seo-tools-schema/u);
  assert.equal(renderSeoPageHtml(html, '/seo-tools/not-a-tool/'), null);
});

test('all shareable SEO routes use the same production banner thumbnail', () => {
  const paths = [SEO_TOOLS_BASE, ...seoToolPages.map((tool) => tool.path), ENTITY_MANAGER_PATH, `/en${ENTITY_MANAGER_PATH}`];
  for (const route of paths) {
    const metadata = getSeoPageMetadata(route);
    assert.ok(metadata);
    assert.equal(metadata.socialImage, SEO_SOCIAL_IMAGE);
    const rendered = renderSeoPageHtml(html, route);
    assert.ok(rendered?.includes(`<meta property="og:image" content="${SEO_SOCIAL_IMAGE}"`));
    assert.ok(rendered?.includes(`<meta name="twitter:image" content="${SEO_SOCIAL_IMAGE}"`));
  }
});

test('Entity Manager metadata is server-rendered once for its actual route', () => {
  for (const route of [ENTITY_MANAGER_PATH, `/en${ENTITY_MANAGER_PATH}`]) {
    const rendered = renderSeoPageHtml(html, route);
    assert.ok(rendered);
    const canonical = `${SEO_PRODUCTION_ORIGIN}${route}`;
    assert.ok(rendered.includes('<title>Entity Manager - SEOX AI | Brand & Structured Data</title>'));
    assert.ok(rendered.includes(`<link rel="canonical" href="${canonical}"`));
    assert.ok(rendered.includes(`<meta property="og:url" content="${canonical}"`));
    assert.equal([...rendered.matchAll(/<script type="application\/ld\+json">/giu)].length, 1);
    const schemaText = rendered.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/u)?.[1];
    assert.ok(schemaText);
    const graph = (JSON.parse(schemaText) as { '@graph': Array<Record<string, unknown>> })['@graph'];
    assert.deepEqual(graph.map((entity) => entity['@type']), ['WebApplication', 'BreadcrumbList']);
    assert.ok(graph.every((entity) => typeof entity['@id'] === 'string'));
    assert.equal(new Set(graph.map((entity) => entity['@id'])).size, graph.length);
  }
});

test('canonical URL follows the actual locale route, not the selected interface language', () => {
  assert.equal(canonicalUrlForPath('/'), `${SEO_PRODUCTION_ORIGIN}/`);
  assert.equal(canonicalUrlForPath('/en/'), `${SEO_PRODUCTION_ORIGIN}/en/`);
  assert.equal(canonicalUrlForPath('/en'), `${SEO_PRODUCTION_ORIGIN}/en/`);
  assert.equal(canonicalUrlForPath('/vi/'), `${SEO_PRODUCTION_ORIGIN}/vi/`);
  assert.equal(canonicalUrlForPath('/seo-tools/keyword-volume/'), `${SEO_PRODUCTION_ORIGIN}/seo-tools/keyword-volume/`);
  assert.equal(canonicalUrlForPath('/seo-tools/keyword-volume/?locale=en'), `${SEO_PRODUCTION_ORIGIN}/seo-tools/keyword-volume/`);
});

test('English homepage server response has its own canonical and exactly one base identity graph', () => {
  const rendered = renderLocalizedHomepageHtml(html, '/en/');
  assert.ok(rendered);
  assert.match(rendered, /<link rel="canonical" href="https:\/\/seox-ai\.site\/en\/"/u);
  assert.match(rendered, /<meta property="og:url" content="https:\/\/seox-ai\.site\/en\/"/u);
  assert.equal([...rendered.matchAll(/<script type="application\/ld\+json">/giu)].length, 1);
  const schemaText = rendered.match(/<script type="application\/ld\+json">\s*([\s\S]*?)\s*<\/script>/u)?.[1];
  assert.ok(schemaText);
  const graph = (JSON.parse(schemaText) as { '@graph': Array<Record<string, unknown>> })['@graph'];
  const types = graph.map((entity) => entity['@type']);
  assert.equal(types.filter((type) => type === 'WebSite').length, 1);
  assert.equal(types.filter((type) => type === 'SoftwareApplication').length, 1);
  assert.equal(types.filter((type) => type === 'Organization').length, 0);
  assert.equal(renderLocalizedHomepageHtml(html, '/vi/'), null);
});

test('meta tag field states distinguish present, missing, and unavailable data', () => {
  const htmlType = 'text/html; charset=utf-8';
  assert.equal(getMetaFieldStatus('Page title', htmlType), 'Available');
  assert.equal(getMetaFieldStatus(null, htmlType), 'Missing');
  assert.equal(getMetaFieldStatus(['en', 'vi'], htmlType), 'Available');
  assert.equal(getMetaFieldStatus([], htmlType), 'Missing');
  assert.equal(getMetaFieldStatus('Page title', 'application/pdf'), 'Unavailable');
  assert.equal(getMetaFieldStatus(null, ''), 'Unavailable');
  assert.equal(getMetaFieldStatus(null, '', true), 'Error');
});

test('SEO score is displayed only when real audit checks are present', () => {
  assert.equal(hasAuditedScore(85, 24), true);
  assert.equal(hasAuditedScore(85, 0), false);
  assert.equal(hasAuditedScore(Number.NaN, 24), false);
});
