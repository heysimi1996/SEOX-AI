import {
  SEO_PRODUCTION_ORIGIN,
  SEO_TOOLS_BASE,
  normalizeSeoToolsPath,
  seoToolByPath,
  type SeoToolPage,
} from './seoTools';

export interface SeoPageMetadata {
  title: string;
  description: string;
  canonical: string;
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
  const path = normalizeSeoToolsPath(rawPath);
  if (path === SEO_TOOLS_BASE) {
    const canonical = `${SEO_PRODUCTION_ORIGIN}${SEO_TOOLS_BASE}`;
    return {
      title: 'Free SEO Tools | SEOX AI',
      description: 'Free SEO tools to analyze websites, keywords, backlinks, technical SEO and search performance.',
      canonical,
      structuredData: {
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'CollectionPage',
            '@id': `${canonical}#collection`,
            url: canonical,
            name: 'Free SEO Tools',
            description: 'Free tools for practical website and SEO analysis.',
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
    structuredData: {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'WebApplication',
          '@id': `${canonical}#application`,
          url: canonical,
          name: tool.name,
          description: tool.metaDescription,
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
