import assert from 'node:assert/strict';
import test from 'node:test';
import {
  DEFAULT_ENTITY_PROFILE,
  approvedSameAs,
  entityJsonCsv,
  findDuplicateSchemaIds,
  findLegacyDomainReferences,
  generateEntityJson,
  generateEntitySchema,
  generateOpenGraph,
  generateTwitterCard,
  normalizeEntityProfile,
  toCsv,
  validateEntityProfile,
} from './entityManager.ts';
import { ENTITY_IDENTITY, SITE_ORIGIN } from './siteIdentity.ts';

test('production entity identity uses one canonical host and stable IDs', () => {
  assert.equal(ENTITY_IDENTITY.canonicalUrl, 'https://seox-ai.site/');
  assert.equal(ENTITY_IDENTITY.websiteId, 'https://seox-ai.site/#website');
  assert.equal(ENTITY_IDENTITY.organizationId, 'https://seox-ai.site/#organization');
  assert.equal(ENTITY_IDENTITY.applicationId, 'https://seox-ai.site/#application');
  assert.equal(SITE_ORIGIN, 'https://seox-ai.site');
  assert.equal(DEFAULT_ENTITY_PROFILE.websiteUrl, ENTITY_IDENTITY.canonicalUrl);
});

test('profile normalization preserves user values and supplies only declared product defaults', () => {
  const profile = normalizeEntityProfile({
    entityName: 'Example Brand',
    websiteUrl: 'https://example.org/',
    founder: 'User supplied',
    foundingDate: '2020',
    unknownSecret: 'must not be copied',
  });
  assert.ok(profile);
  assert.equal(profile.entityName, 'Example Brand');
  assert.equal(profile.websiteUrl, 'https://example.org/');
  assert.equal(profile.founder, 'User supplied');
  assert.equal(profile.foundingDate, '2020');
  assert.equal('unknownSecret' in profile, false);
  assert.deepEqual(profile.socialProfiles, []);
});

test('URL, HTTPS, domain and email validation identify invalid values', () => {
  const profile = {
    ...DEFAULT_ENTITY_PROFILE,
    websiteUrl: 'https://www.seox-ai.site/',
    applicationUrl: 'ftp://seox-ai.site/',
    logoUrl: 'http://assets.example/logo.png',
    email: 'not-an-email',
  };
  const issues = validateEntityProfile(profile);
  assert.ok(issues.some((issue) => issue.code === 'WEBSITE_INVALID'));
  assert.ok(issues.some((issue) => issue.code === 'APPLICATION_URL_INVALID'));
  assert.ok(issues.some((issue) => issue.code === 'HTTPS_RECOMMENDED'));
  assert.ok(issues.some((issue) => issue.code === 'LOGO_HTTPS_REQUIRED'));
  assert.ok(issues.some((issue) => issue.code === 'EMAIL_INVALID'));
  assert.ok(issues.some((issue) => issue.code === 'LOGO_MISSING') === false);
});

test('production website and application URLs must be the exact canonical homepage', () => {
  const issues = validateEntityProfile({
    ...DEFAULT_ENTITY_PROFILE,
    websiteUrl: 'https://seox-ai.site/entity-manager',
    applicationUrl: 'https://seox-ai.site/app',
  });
  assert.ok(issues.some((issue) => issue.code === 'WEBSITE_DOMAIN_MISMATCH'));
  assert.ok(issues.some((issue) => issue.code === 'APPLICATION_DOMAIN_MISMATCH'));
});

test('legacy-domain references are located and preserved instead of rewritten', () => {
  const profile = normalizeEntityProfile({
    ...DEFAULT_ENTITY_PROFILE,
    socialProfiles: [{ id: 'legacy', platform: 'Old site', url: 'https://seox.ai/profile', approved: false }],
  });
  assert.ok(profile);
  assert.equal(profile.socialProfiles[0].url, 'https://seox.ai/profile');
  assert.deepEqual(findLegacyDomainReferences(profile).map(({ path }) => path), ['profile.socialProfiles[0].url']);
  assert.ok(validateEntityProfile(profile).some((issue) => issue.code === 'LEGACY_DOMAIN'));
});

test('sameAs includes only approved, unique and safe HTTPS profiles', () => {
  const profile = {
    ...DEFAULT_ENTITY_PROFILE,
    socialProfiles: [
      { id: 'one', platform: 'X', url: 'https://social.example/seox', approved: true },
      { id: 'two', platform: 'X', url: 'https://social.example/seox/', approved: true },
      { id: 'three', platform: 'Legacy', url: 'https://seox.ai/profile', approved: true },
      { id: 'four', platform: 'HTTP', url: 'http://social.example/user', approved: true },
    ],
    officialProfiles: [
      { id: 'five', platform: 'Docs', url: 'https://docs.example/', official: true, verified: true, isPublic: true },
      { id: 'six', platform: 'Private', url: 'https://private.example/', official: true, verified: true, isPublic: false },
    ],
  };
  assert.deepEqual(approvedSameAs(profile), ['https://social.example/seox', 'https://docs.example/']);
});

test('schema generation creates one coherent graph without invented optional facts', () => {
  const schema = generateEntitySchema(DEFAULT_ENTITY_PROFILE) as {
    '@context': string;
    '@graph': Array<Record<string, unknown>>;
  };
  assert.equal(schema['@context'], 'https://schema.org');
  assert.deepEqual(schema['@graph'].map((entity) => entity['@type']), [
    'WebSite',
    'Organization',
    'SoftwareApplication',
    'BreadcrumbList',
  ]);
  assert.deepEqual(schema['@graph'].map((entity) => entity['@id']), [
    ENTITY_IDENTITY.websiteId,
    ENTITY_IDENTITY.organizationId,
    ENTITY_IDENTITY.applicationId,
    ENTITY_IDENTITY.breadcrumbId,
  ]);
  assert.equal(findDuplicateSchemaIds(schema).length, 0);
  const organization = schema['@graph'][1];
  assert.equal('founder' in organization, false);
  assert.equal('foundingDate' in organization, false);
  assert.equal('logo' in organization, false);
  assert.deepEqual(schema['@graph'][2].offers, { '@type': 'Offer', price: '0', priceCurrency: 'USD' });
  assert.equal(JSON.parse(JSON.stringify(schema))['@graph'].length, 4);
});

test('duplicate schema IDs are reported', () => {
  assert.deepEqual(findDuplicateSchemaIds({
    '@graph': [
      { '@id': 'https://seox-ai.site/#organization' },
      { '@id': 'https://seox-ai.site/#organization' },
      { '@id': 'https://seox-ai.site/#website' },
    ],
  }), ['https://seox-ai.site/#organization']);
});

test('Open Graph and Twitter metadata use canonical URL and supplied profile facts only', () => {
  const profile = {
    ...DEFAULT_ENTITY_PROFILE,
    shortDescription: 'User supplied description',
    brandImageUrl: 'https://assets.example/brand.png',
    socialProfiles: [{ id: 'social', platform: 'X', url: 'https://social.example/brand', approved: true }],
  };
  assert.deepEqual(generateOpenGraph(profile), {
    'og:title': 'SEOX AI',
    'og:description': 'User supplied description',
    'og:url': ENTITY_IDENTITY.canonicalUrl,
    'og:site_name': 'SEOX AI',
    'og:locale': 'vi_VN',
    'og:image': 'https://assets.example/brand.png',
  });
  assert.deepEqual(generateTwitterCard(profile), {
    'twitter:card': 'summary_large_image',
    'twitter:title': 'SEOX AI',
    'twitter:description': 'User supplied description',
    'twitter:image': 'https://assets.example/brand.png',
  });
  assert.deepEqual(generateEntityJson(profile).sameAs, ['https://social.example/brand']);
});

test('JSON and CSV exports contain only generated entity profile fields', () => {
  const profile = { ...DEFAULT_ENTITY_PROFILE, entityName: 'Brand, "One"', shortDescription: 'A description' };
  const entity = generateEntityJson(profile);
  assert.equal(entity.name, 'Brand, "One"');
  assert.equal(entity.url, 'https://seox-ai.site/');
  assert.equal(entity.description, 'A description');
  assert.equal(JSON.parse(JSON.stringify(entity)).type, 'SoftwareApplication');
  assert.match(entityJsonCsv(profile), /"name","Brand, ""One"""/u);
  assert.equal(toCsv([['label', 'line 1\nline 2']]), '"Field","Value"\r\n"label","line 1\nline 2"');
});
