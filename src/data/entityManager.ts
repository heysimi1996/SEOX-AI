import { SITE_ORIGIN, SITE_URL, ENTITY_IDENTITY } from './siteIdentity';

export const ENTITY_MANAGER_PATH = '/entity-manager';
export const ENTITY_PROFILE_STORAGE_KEY = 'seox-ai.entity-profile.v1';
export const ENTITY_AUDIT_STORAGE_KEY = 'seox-ai.entity-audit.v1';
export const LEGACY_DOMAIN_PATTERN = /(?:https?:\/\/)?(?:www\.)?seox\.ai|www\.seox-ai\.site/iu;

export type EntityKind = 'Organization' | 'SoftwareApplication' | 'Brand' | 'Product';

export interface SocialProfile {
  id: string;
  platform: string;
  url: string;
  approved: boolean;
}

export interface OfficialProfile {
  id: string;
  platform: string;
  url: string;
  official: boolean;
  verified: boolean;
  isPublic: boolean;
}

export interface EntityProfile {
  entityName: string;
  websiteUrl: string;
  shortDescription: string;
  longDescription: string;
  entityType: EntityKind;
  primaryCategory: string;
  secondaryCategories: string[];
  country: string;
  language: string;
  aliases: string[];
  logoUrl: string;
  faviconUrl: string;
  brandImageUrl: string;
  primaryColor: string;
  secondaryColor: string;
  tagline: string;
  legalName: string;
  alternateName: string;
  founder: string;
  foundingDate: string;
  organizationType: string;
  address: string;
  city: string;
  organizationCountry: string;
  postalCode: string;
  email: string;
  phone: string;
  contactUrl: string;
  socialProfiles: SocialProfile[];
  officialProfiles: OfficialProfile[];
  applicationName: string;
  applicationCategory: string;
  operatingSystem: string;
  applicationUrl: string;
  applicationDescription: string;
  price: string;
  currency: string;
  sourceUrls: string[];
  otherIdentifiers: string[];
  aboutDraft: string;
  productDraft: string;
  toolsDraft: string;
  contactDraft: string;
}

export interface EntityAuditEvent {
  id: string;
  action: 'Created' | 'Updated' | 'Validated' | 'Exported';
  createdAt: string;
}

export type ValidationStatus = 'PASS' | 'WARNING' | 'ERROR';

export interface ValidationIssue {
  status: ValidationStatus;
  code: string;
  path: string;
  message: string;
}

export interface CompletenessCategory {
  name: string;
  percent: number;
}

export const DEFAULT_ENTITY_PROFILE: EntityProfile = {
  entityName: ENTITY_IDENTITY.entityName,
  websiteUrl: SITE_URL,
  shortDescription: '',
  longDescription: '',
  entityType: 'SoftwareApplication',
  primaryCategory: 'SEO Software',
  secondaryCategories: [],
  country: '',
  language: 'vi-VN',
  aliases: [],
  logoUrl: '',
  faviconUrl: '',
  brandImageUrl: '',
  primaryColor: '#FF5E00',
  secondaryColor: '#0D0D0D',
  tagline: '',
  legalName: '',
  alternateName: '',
  founder: '',
  foundingDate: '',
  organizationType: '',
  address: '',
  city: '',
  organizationCountry: '',
  postalCode: '',
  email: '',
  phone: '',
  contactUrl: '',
  socialProfiles: [],
  officialProfiles: [],
  applicationName: ENTITY_IDENTITY.entityName,
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  applicationUrl: SITE_URL,
  applicationDescription: '',
  price: '0',
  currency: 'USD',
  sourceUrls: [],
  otherIdentifiers: [],
  aboutDraft: 'SEOX AI is a web-based SEO platform. Add only reviewed facts from the entity profile before publishing this draft.',
  productDraft: '',
  toolsDraft: '',
  contactDraft: '',
};

const stringFields: Array<keyof EntityProfile> = [
  'entityName', 'websiteUrl', 'shortDescription', 'longDescription', 'entityType',
  'primaryCategory', 'country', 'language', 'logoUrl', 'faviconUrl', 'brandImageUrl',
  'primaryColor', 'secondaryColor', 'tagline', 'legalName', 'alternateName',
  'founder', 'foundingDate', 'organizationType', 'address', 'city', 'organizationCountry',
  'postalCode', 'email', 'phone', 'contactUrl', 'applicationName', 'applicationCategory',
  'operatingSystem', 'applicationUrl', 'applicationDescription', 'price', 'currency',
  'aboutDraft', 'productDraft', 'toolsDraft', 'contactDraft',
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function stringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === 'string').map((item) => item.trim()).filter(Boolean);
}

function normalizeSocialProfiles(value: unknown): SocialProfile[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item, index) => {
    if (!isRecord(item)) return [];
    return [{
      id: typeof item.id === 'string' && item.id ? item.id : `social-${index + 1}`,
      platform: typeof item.platform === 'string' ? item.platform : '',
      url: typeof item.url === 'string' ? item.url : '',
      approved: item.approved === true,
    }];
  });
}

function normalizeOfficialProfiles(value: unknown): OfficialProfile[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item, index) => {
    if (!isRecord(item)) return [];
    return [{
      id: typeof item.id === 'string' && item.id ? item.id : `official-${index + 1}`,
      platform: typeof item.platform === 'string' ? item.platform : '',
      url: typeof item.url === 'string' ? item.url : '',
      official: item.official === true,
      verified: item.verified === true,
      isPublic: item.isPublic === true,
    }];
  });
}

export function normalizeEntityProfile(value: unknown): EntityProfile | null {
  if (!isRecord(value)) return null;
  const raw = isRecord(value.profile) ? value.profile : value;
  const profile = { ...DEFAULT_ENTITY_PROFILE };
  for (const field of stringFields) {
    const item = raw[field];
    if (typeof item !== 'string') continue;
    if (field === 'entityType' && !['Organization', 'SoftwareApplication', 'Brand', 'Product'].includes(item)) continue;
    profile[field] = item as never;
  }
  profile.secondaryCategories = stringArray(raw.secondaryCategories);
  profile.aliases = stringArray(raw.aliases);
  profile.sourceUrls = stringArray(raw.sourceUrls);
  profile.otherIdentifiers = stringArray(raw.otherIdentifiers);
  profile.socialProfiles = normalizeSocialProfiles(raw.socialProfiles);
  profile.officialProfiles = normalizeOfficialProfiles(raw.officialProfiles);
  return profile;
}

function parseUrl(value: string): URL | null {
  try {
    const parsed = new URL(value.trim());
    if (!parsed.hostname || parsed.username || parsed.password) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function isValidHttpsUrl(value: string): boolean {
  const parsed = parseUrl(value);
  return parsed?.protocol === 'https:' && !LEGACY_DOMAIN_PATTERN.test(value);
}

function normalizeUrlForDuplicateCheck(value: string): string | null {
  const parsed = parseUrl(value);
  if (!parsed || !['https:', 'http:'].includes(parsed.protocol)) return null;
  parsed.hash = '';
  return parsed.href.replace(/\/$/u, '').toLowerCase();
}

export function findLegacyDomainReferences(value: unknown, path = 'profile'): Array<{ path: string; value: string }> {
  if (typeof value === 'string') {
    return LEGACY_DOMAIN_PATTERN.test(value) ? [{ path, value }] : [];
  }
  if (Array.isArray(value)) {
    return value.flatMap((item, index) => findLegacyDomainReferences(item, `${path}[${index}]`));
  }
  if (!isRecord(value)) return [];
  return Object.entries(value).flatMap(([key, item]) => findLegacyDomainReferences(item, `${path}.${key}`));
}

export function approvedSameAs(profile: EntityProfile): string[] {
  const candidates = [
    ...profile.socialProfiles.filter((item) => item.approved).map((item) => item.url),
    ...profile.officialProfiles
      .filter((item) => item.official && item.verified && item.isPublic)
      .map((item) => item.url),
  ];
  const seen = new Set<string>();
  return candidates.flatMap((candidate) => {
    const parsed = parseUrl(candidate);
    const key = normalizeUrlForDuplicateCheck(candidate);
    if (!parsed || parsed.protocol !== 'https:' || !key || LEGACY_DOMAIN_PATTERN.test(candidate) || seen.has(key)) return [];
    seen.add(key);
    return [parsed.href];
  });
}

export function generateEntitySchema(profile: EntityProfile): Record<string, unknown> {
  const entityName = profile.entityName.trim();
  const applicationName = profile.applicationName.trim();
  const graph: Array<Record<string, unknown>> = [
    {
      '@type': 'WebSite',
      '@id': ENTITY_IDENTITY.websiteId,
      url: SITE_URL,
      ...(entityName ? { name: entityName } : {}),
      inLanguage: profile.language.trim() || 'vi-VN',
      ...(profile.shortDescription.trim() ? { description: profile.shortDescription.trim() } : {}),
      publisher: { '@id': ENTITY_IDENTITY.organizationId },
    },
    {
      '@type': 'Organization',
      '@id': ENTITY_IDENTITY.organizationId,
      ...(entityName ? { name: entityName } : {}),
      url: SITE_URL,
      ...(profile.legalName.trim() ? { legalName: profile.legalName.trim() } : {}),
      ...(profile.alternateName.trim() ? { alternateName: profile.alternateName.trim() } : {}),
      ...(isValidHttpsUrl(profile.logoUrl) ? { logo: { '@type': 'ImageObject', url: profile.logoUrl.trim() } } : {}),
      ...(profile.founder.trim() ? { founder: profile.founder.trim() } : {}),
      ...(profile.foundingDate.trim() ? { foundingDate: profile.foundingDate.trim() } : {}),
      ...(profile.email.trim() ? { email: profile.email.trim() } : {}),
      ...(profile.phone.trim() ? { telephone: profile.phone.trim() } : {}),
      ...(approvedSameAs(profile).length ? { sameAs: approvedSameAs(profile) } : {}),
      ...(profile.address.trim() || profile.city.trim() || profile.organizationCountry.trim() || profile.postalCode.trim()
        ? {
            address: {
              '@type': 'PostalAddress',
              ...(profile.address.trim() ? { streetAddress: profile.address.trim() } : {}),
              ...(profile.city.trim() ? { addressLocality: profile.city.trim() } : {}),
              ...(profile.organizationCountry.trim() ? { addressCountry: profile.organizationCountry.trim() } : {}),
              ...(profile.postalCode.trim() ? { postalCode: profile.postalCode.trim() } : {}),
            },
          }
        : {}),
    },
    {
      '@type': 'SoftwareApplication',
      '@id': ENTITY_IDENTITY.applicationId,
      ...(applicationName ? { name: applicationName } : {}),
      url: SITE_URL,
      applicationCategory: profile.applicationCategory.trim() || 'BusinessApplication',
      operatingSystem: profile.operatingSystem.trim() || 'Web',
      inLanguage: profile.language.trim() || 'vi-VN',
      ...(profile.applicationDescription.trim() ? { description: profile.applicationDescription.trim() } : {}),
      ...(Number.isFinite(Number(profile.price)) && Number(profile.price) >= 0 && /^[A-Z]{3}$/u.test(profile.currency.trim())
        ? { offers: { '@type': 'Offer', price: String(Number(profile.price)), priceCurrency: profile.currency.trim() } }
        : {}),
      publisher: { '@id': ENTITY_IDENTITY.organizationId },
    },
    {
      '@type': 'BreadcrumbList',
      '@id': ENTITY_IDENTITY.breadcrumbId,
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
        { '@type': 'ListItem', position: 2, name: 'SEO Tools', item: `${SITE_ORIGIN}/seo-tools/` },
        { '@type': 'ListItem', position: 3, name: 'Entity Manager', item: `${SITE_ORIGIN}${ENTITY_MANAGER_PATH}` },
      ],
    },
  ];
  return { '@context': 'https://schema.org', '@graph': graph };
}

export function findDuplicateSchemaIds(schema: unknown): string[] {
  if (!isRecord(schema) || !Array.isArray(schema['@graph'])) return [];
  const seen = new Set<string>();
  const duplicates = new Set<string>();
  for (const entity of schema['@graph']) {
    if (!isRecord(entity) || typeof entity['@id'] !== 'string') continue;
    if (seen.has(entity['@id'])) duplicates.add(entity['@id']);
    seen.add(entity['@id']);
  }
  return [...duplicates];
}

export function generateOpenGraph(profile: EntityProfile): Record<string, string> {
  const title = profile.entityName.trim();
  const description = profile.shortDescription.trim() || profile.longDescription.trim();
  const image = isValidHttpsUrl(profile.brandImageUrl)
    ? profile.brandImageUrl.trim()
    : isValidHttpsUrl(profile.logoUrl) ? profile.logoUrl.trim() : '';
  return {
    'og:title': title,
    'og:description': description,
    'og:url': SITE_URL,
    'og:site_name': title,
    'og:locale': (profile.language.trim() || 'vi-VN').replace('-', '_'),
    ...(image ? { 'og:image': image } : {}),
  };
}

export function generateTwitterCard(profile: EntityProfile): Record<string, string> {
  const openGraph = generateOpenGraph(profile);
  return {
    'twitter:card': openGraph['og:image'] ? 'summary_large_image' : 'summary',
    'twitter:title': openGraph['og:title'],
    'twitter:description': openGraph['og:description'],
    ...(openGraph['og:image'] ? { 'twitter:image': openGraph['og:image'] } : {}),
  };
}

function publicLogo(profile: EntityProfile): string | undefined {
  return isValidHttpsUrl(profile.logoUrl) ? profile.logoUrl.trim() : undefined;
}

export function generateEntityJson(profile: EntityProfile): Record<string, unknown> {
  const entityName = profile.entityName.trim();
  const description = profile.shortDescription.trim() || profile.longDescription.trim();
  const logo = publicLogo(profile);
  return {
    ...(entityName ? { name: entityName } : {}),
    type: profile.entityType,
    url: SITE_URL,
    ...(description ? { description } : {}),
    ...(logo ? { logo } : {}),
    sameAs: approvedSameAs(profile),
    ...(profile.country.trim() ? { country: profile.country.trim() } : {}),
    ...(profile.primaryCategory.trim() ? { category: profile.primaryCategory.trim() } : {}),
  };
}

export function generateWikidataExport(profile: EntityProfile): Record<string, unknown> {
  const entityName = profile.entityName.trim();
  const description = profile.shortDescription.trim() || profile.longDescription.trim();
  const aliases = profile.aliases.filter(Boolean);
  const logo = publicLogo(profile);
  const sameAs = approvedSameAs(profile);
  return {
    ...(entityName ? { label: entityName } : {}),
    ...(description ? { description } : {}),
    ...(aliases.length ? { aliases } : {}),
    officialWebsite: SITE_URL,
    ...(logo ? { image: logo } : {}),
    ...(profile.country.trim() ? { country: profile.country.trim() } : {}),
    ...(profile.primaryCategory.trim() ? { industry: profile.primaryCategory.trim() } : {}),
    instanceOf: profile.entityType,
    officialProfiles: sameAs,
    ...(profile.otherIdentifiers.length ? { identifiers: profile.otherIdentifiers } : {}),
    references: profile.sourceUrls.filter(isValidHttpsUrl),
  };
}

export function generateDirectoryExport(profile: EntityProfile): Record<string, unknown> {
  const entityName = profile.entityName.trim();
  const description = profile.longDescription.trim() || profile.shortDescription.trim();
  const logo = publicLogo(profile);
  return {
    ...(entityName ? { name: entityName } : {}),
    ...(description ? { description } : {}),
    website: SITE_URL,
    ...(profile.primaryCategory.trim() ? { category: profile.primaryCategory.trim() } : {}),
    ...(logo ? { logo } : {}),
    ...(profile.country.trim() ? { country: profile.country.trim() } : {}),
    ...(profile.email.trim() ? { email: profile.email.trim() } : {}),
    ...(profile.phone.trim() ? { phone: profile.phone.trim() } : {}),
    socialProfiles: approvedSameAs(profile),
  };
}

export function toCsv(rows: Array<[string, string]>): string {
  const quote = (value: string) => `"${value.replaceAll('"', '""')}"`;
  return [['Field', 'Value'], ...rows].map((row) => row.map(quote).join(',')).join('\r\n');
}

export function entityJsonCsv(profile: EntityProfile): string {
  const exported = generateEntityJson(profile);
  return toCsv(Object.entries(exported).map(([key, value]) => [
    key,
    Array.isArray(value) || (typeof value === 'object' && value !== null) ? JSON.stringify(value) : String(value),
  ]));
}

export function directoryCsv(profile: EntityProfile): string {
  const exported = generateDirectoryExport(profile);
  return toCsv(Object.entries(exported).map(([key, value]) => [
    key,
    Array.isArray(value) || (typeof value === 'object' && value !== null) ? JSON.stringify(value) : String(value),
  ]));
}

export function validateEntityProfile(profile: EntityProfile): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const add = (status: ValidationStatus, code: string, path: string, message: string) => {
    issues.push({ status, code, path, message });
  };

  if (!profile.entityName.trim()) add('ERROR', 'NAME_REQUIRED', 'entityName', 'Entity or brand name is required.');
  if (!profile.applicationName.trim()) add('ERROR', 'APPLICATION_NAME_REQUIRED', 'applicationName', 'Application name is required.');
  if (!profile.websiteUrl.trim()) {
    add('ERROR', 'WEBSITE_REQUIRED', 'websiteUrl', 'Official website is required.');
  } else if (!isValidHttpsUrl(profile.websiteUrl)) {
    add('ERROR', 'WEBSITE_INVALID', 'websiteUrl', `Official website must be a valid HTTPS URL on the production domain ${SITE_URL}.`);
  } else if (new URL(profile.websiteUrl).href !== SITE_URL) {
    add('ERROR', 'WEBSITE_DOMAIN_MISMATCH', 'websiteUrl', `Official website must exactly match the production canonical URL ${SITE_URL}.`);
  }
  if (profile.applicationUrl.trim() && !isValidHttpsUrl(profile.applicationUrl)) {
    add('ERROR', 'APPLICATION_URL_INVALID', 'applicationUrl', 'Application URL must be a valid HTTPS URL without a legacy domain.');
  } else if (profile.applicationUrl.trim() && new URL(profile.applicationUrl).href !== SITE_URL) {
    add('ERROR', 'APPLICATION_DOMAIN_MISMATCH', 'applicationUrl', `Application URL must exactly match ${SITE_URL}.`);
  }
  if (!profile.shortDescription.trim() && !profile.longDescription.trim()) {
    add('WARNING', 'DESCRIPTION_MISSING', 'shortDescription', 'Add a description before using this profile publicly.');
  }
  if (!profile.logoUrl.trim()) add('WARNING', 'LOGO_MISSING', 'logoUrl', 'Logo URL is optional but recommended for a complete organization profile.');
  for (const [path, value] of [
    ['logoUrl', profile.logoUrl],
    ['faviconUrl', profile.faviconUrl],
    ['brandImageUrl', profile.brandImageUrl],
    ['contactUrl', profile.contactUrl],
    ...profile.sourceUrls.map((url, index) => [`sourceUrls[${index}]`, url] as [string, string]),
  ] as Array<[string, string]>) {
    if (!value.trim()) continue;
    if (!parseUrl(value)) add('ERROR', 'URL_INVALID', path, 'Enter a valid absolute URL.');
    else {
      if (path === 'logoUrl' && !isValidHttpsUrl(value)) add('ERROR', 'LOGO_HTTPS_REQUIRED', path, 'Logo URL must be a valid absolute HTTPS URL without a legacy domain.');
      if (parseUrl(value)?.protocol !== 'https:') add('WARNING', 'HTTPS_RECOMMENDED', path, 'Use HTTPS for public profile URLs.');
    }
  }
  if (profile.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/u.test(profile.email.trim())) {
    add('ERROR', 'EMAIL_INVALID', 'email', 'Enter a valid email address or leave this field blank.');
  }
  if (profile.foundingDate.trim() && !/^\d{4}(?:-\d{2}(?:-\d{2})?)?$/u.test(profile.foundingDate.trim())) {
    add('ERROR', 'FOUNDING_DATE_INVALID', 'foundingDate', 'Use a valid date in YYYY, YYYY-MM or YYYY-MM-DD format.');
  }
  if (!/^[A-Z]{3}$/u.test(profile.currency.trim())) add('ERROR', 'CURRENCY_INVALID', 'currency', 'Currency must be a three-letter ISO code such as USD.');
  if (!Number.isFinite(Number(profile.price)) || Number(profile.price) < 0) add('ERROR', 'PRICE_INVALID', 'price', 'Price must be a non-negative number.');

  const profileUrls = [
    ...profile.socialProfiles.map((item, index) => ({ path: `socialProfiles[${index}].url`, url: item.url })),
    ...profile.officialProfiles.map((item, index) => ({ path: `officialProfiles[${index}].url`, url: item.url })),
  ];
  const seenUrls = new Map<string, string>();
  for (const item of profileUrls) {
    if (!item.url.trim()) {
      add('WARNING', 'PROFILE_URL_MISSING', item.path, 'Profile URL is empty and will not be exported.');
      continue;
    }
    const parsed = parseUrl(item.url);
    if (!parsed || !['http:', 'https:'].includes(parsed.protocol)) {
      add('ERROR', 'PROFILE_URL_INVALID', item.path, 'Profile URL must be an absolute HTTP or HTTPS URL.');
      continue;
    }
    if (parsed.protocol !== 'https:') add('WARNING', 'PROFILE_URL_HTTPS', item.path, 'Use HTTPS for social and official profiles.');
    const duplicateKey = normalizeUrlForDuplicateCheck(item.url);
    const previousPath = duplicateKey ? seenUrls.get(duplicateKey) : undefined;
    if (previousPath) add('ERROR', 'PROFILE_URL_DUPLICATE', item.path, `Duplicate profile URL; it is also listed at ${previousPath}.`);
    else if (duplicateKey) seenUrls.set(duplicateKey, item.path);
  }
  profile.socialProfiles.forEach((item, index) => {
    if (item.approved && !isValidHttpsUrl(item.url)) {
      add('ERROR', 'SOCIAL_APPROVAL_INVALID', `socialProfiles[${index}].url`, 'Only valid, non-legacy HTTPS social profile URLs can be approved for sameAs.');
    }
  });
  profile.officialProfiles.forEach((item, index) => {
    if ((item.official || item.verified || item.isPublic) && !isValidHttpsUrl(item.url)) {
      add('ERROR', 'OFFICIAL_APPROVAL_INVALID', `officialProfiles[${index}].url`, 'Official, verified or public profiles must have a valid non-legacy HTTPS URL.');
    }
  });

  const legacyReferences = findLegacyDomainReferences(profile);
  legacyReferences.forEach((reference) => {
    add('ERROR', 'LEGACY_DOMAIN', reference.path, `Legacy domain reference detected at ${reference.path}: ${reference.value}`);
  });

  const schema = generateEntitySchema(profile);
  if (findDuplicateSchemaIds(schema).length) add('ERROR', 'SCHEMA_DUPLICATE_ID', '@graph', 'Generated schema contains duplicate @id values.');
  const graph = isRecord(schema) && Array.isArray(schema['@graph']) ? schema['@graph'] : [];
  if (graph.length !== 4) add('ERROR', 'SCHEMA_INVALID', '@graph', 'Generated schema graph is incomplete.');
  const sameAs = approvedSameAs(profile);
  if (sameAs.some((url) => !isValidHttpsUrl(url))) add('ERROR', 'SAME_AS_INVALID', 'sameAs', 'Generated sameAs contains a malformed or non-HTTPS URL.');
  if (!sameAs.length) add('WARNING', 'SAME_AS_EMPTY', 'sameAs', 'No approved official profiles are available for sameAs.');

  if (!issues.some((issue) => issue.status === 'ERROR')) {
    add('PASS', 'CANONICAL_CONSISTENT', 'websiteUrl', 'Production canonical domain is consistent.');
    if (profile.entityName.trim() === profile.applicationName.trim()) {
      add('PASS', 'BRAND_NAME_CONSISTENT', 'applicationName', 'Brand and application names are consistent.');
    } else {
      add('WARNING', 'BRAND_NAME_MISMATCH', 'applicationName', 'Application name differs from the entity name; review before export.');
    }
  }
  return issues;
}

export function entityCompleteness(profile: EntityProfile): CompletenessCategory[] {
  const issues = validateEntityProfile(profile);
  const hasError = issues.some((issue) => issue.status === 'ERROR');
  const schema = generateEntitySchema(profile);
  const categories: Array<[string, boolean]> = [
    ['Identity', Boolean(profile.entityName.trim() && profile.entityType)],
    ['Website', isValidHttpsUrl(profile.websiteUrl) && Boolean(parseUrl(profile.websiteUrl)?.href === SITE_URL)],
    ['Organization', Boolean(profile.legalName.trim() || profile.organizationType.trim() || profile.address.trim() || profile.country.trim())],
    ['Logo', isValidHttpsUrl(profile.logoUrl)],
    ['Social Profiles', approvedSameAs(profile).length > 0],
    ['Structured Data', !findDuplicateSchemaIds(schema).length && !hasError],
    ['Contact', Boolean(profile.email.trim() || profile.phone.trim() || profile.contactUrl.trim())],
    ['Consistency', !hasError],
    ['References', profile.sourceUrls.some(isValidHttpsUrl)],
  ];
  return categories.map(([name, complete]) => ({ name, percent: complete ? 100 : 0 }));
}

export function normalizeAuditEvents(value: unknown): EntityAuditEvent[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (!isRecord(item) || typeof item.id !== 'string' || typeof item.createdAt !== 'string') return [];
    if (!['Created', 'Updated', 'Validated', 'Exported'].includes(String(item.action))) return [];
    return [{ id: item.id, action: item.action as EntityAuditEvent['action'], createdAt: item.createdAt }];
  }).slice(-100);
}
