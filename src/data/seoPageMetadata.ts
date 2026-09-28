import {
  SEO_PRODUCTION_ORIGIN,
  SEO_TOOLS_BASE,
  normalizeSeoToolsPath,
  seoToolByPath,
  type SeoToolPage,
} from './seoTools';
import { ENTITY_MANAGER_PATH } from './entityManager';

export const SEO_SOCIAL_IMAGE = `${SEO_PRODUCTION_ORIGIN}/seox-ai-banner.png`;

export interface SeoPageMetadata {
  title: string;
  description: string;
  canonical: string;
  socialImage: string;
  structuredData: Record<string, unknown>;
}

function breadcrumbSchema(tool?: SeoToolPage): Record<string, unknown> {
  const items = [
    { '@type': 'ListItem', position: 1, name: 'Home', item: `${SEO_PRODUCTION_ORIGIN}/` },
    { '@type': 'ListItem', position: 2, name: 'SEO Tools', item: `${SEO_PRODUCTION_ORIGIN}${SEO_TOOLS_BASE}` },
  ];
  if (tool) {
    items.push({
      '@type': 'ListItem',
      position: 3,
      name: tool.name,
      item: `${SEO_PRODUCTION_ORIGIN}${tool.path}`,
    });
  }
  return { '@type': 'BreadcrumbList', itemListElement: items };
}

export function getSeoPageMetadata(rawPath: string): SeoPageMetadata | null {
  const entityManagerPath = rawPath.replace(/\/+$/u, '') || '/';
  if (entityManagerPath === ENTITY_MANAGER_PATH || entityManagerPath === `/en${ENTITY_MANAGER_PATH}`) {
    const canonical = `${SEO_PRODUCTION_ORIGIN}${entityManagerPath}`;
    return {
      title: 'Entity Manager - SEOX AI | Brand & Structured Data',
      description: 'Manage brand identity, structured data, official profiles and SEO entity information with SEOX AI.',
      canonical,
      socialImage: SEO_SOCIAL_IMAGE,
      structuredData: {
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'WebApplication',
            '@id': `${canonical}#application`,
            url: canonical,
            name: 'Entity Manager',
            description: 'Manage brand identity, structured data, official profiles and SEO entity information with SEOX AI.',
            image: SEO_SOCIAL_IMAGE,
            applicationCategory: 'BusinessApplication',
            operatingSystem: 'Web',
            inLanguage: 'en',
          },
          {
            '@type': 'BreadcrumbList',
            '@id': `${canonical}#breadcrumb`,
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: `${SEO_PRODUCTION_ORIGIN}/` },
              { '@type': 'ListItem', position: 2, name: 'SEO Tools', item: `${SEO_PRODUCTION_ORIGIN}${SEO_TOOLS_BASE}` },
              { '@type': 'ListItem', position: 3, name: 'Entity Manager', item: canonical },
            ],
          },
        ],
      },
    };
  }

  const path = normalizeSeoToolsPath(rawPath);
  if (path === SEO_TOOLS_BASE) {
    const canonical = `${SEO_PRODUCTION_ORIGIN}${SEO_TOOLS_BASE}`;
    return {
      title: 'Free SEO Tools | SEOX AI',
      description: 'Free SEO tools to analyze websites, keywords, backlinks, technical SEO and search performance.',
      canonical,
      socialImage: SEO_SOCIAL_IMAGE,
      structuredData: {
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'CollectionPage',
            '@id': `${canonical}#collection`,
            url: canonical,
            name: 'Free SEO Tools',
            description: 'Free tools for practical website and SEO analysis.',
            image: SEO_SOCIAL_IMAGE,
            inLanguage: 'en',
          },
          breadcrumbSchema(),
        ],
      },
    };
  }

  const tool = seoToolByPath.get(path);
  if (!tool) return null;
  const canonical = `${SEO_PRODUCTION_ORIGIN}${tool.path}`;
  return {
    title: tool.metaTitle,
    description: tool.metaDescription,
    canonical,
    socialImage: SEO_SOCIAL_IMAGE,
    structuredData: {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'WebApplication',
          '@id': `${canonical}#application`,
          url: canonical,
          name: tool.name,
          description: tool.metaDescription,
          image: SEO_SOCIAL_IMAGE,
          applicationCategory: 'BusinessApplication',
          operatingSystem: 'Web',
          isAccessibleForFree: true,
          inLanguage: 'en',
        },
        breadcrumbSchema(tool),
      ],
    },
  };
}
