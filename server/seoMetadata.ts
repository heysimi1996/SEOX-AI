import { getSeoPageMetadata } from '../src/data/seoPageMetadata.ts';
import { canonicalUrlForPath } from '../src/data/canonicalUrl.ts';

export { getSeoPageMetadata } from '../src/data/seoPageMetadata.ts';

function escapeHtmlAttribute(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

export function renderSeoPageHtml(template: string, rawPath: string): string | null {
  const metadata = getSeoPageMetadata(rawPath);
  if (!metadata) return null;
  const description = escapeHtmlAttribute(metadata.description);
  const canonical = escapeHtmlAttribute(metadata.canonical);
  const title = metadata.title.replaceAll('<', '&lt;').replaceAll('>', '&gt;');
  const structuredData = JSON.stringify(metadata.structuredData).replaceAll('<', '\\u003c');

  let html = template
    .replace(/<title>[\s\S]*?<\/title>/iu, `<title>${title}</title>`)
    .replace(/<meta name="description" content="[^"]*"\s*\/?>/iu, `<meta name="description" content="${description}" />`)
    .replace(/<meta property="og:title" content="[^"]*"\s*\/?>/iu, `<meta property="og:title" content="${escapeHtmlAttribute(metadata.title)}" />`)
    .replace(/<meta property="og:description" content="[^"]*"\s*\/?>/iu, `<meta property="og:description" content="${description}" />`)
    .replace(/<meta property="og:url" content="[^"]*"\s*\/?>/iu, `<meta property="og:url" content="${canonical}" />`)
    .replace(/<meta property="og:image" content="[^"]*"\s*\/?>/iu, `<meta property="og:image" content="${escapeHtmlAttribute(metadata.socialImage)}" />`)
    .replace(/<meta name="twitter:url" content="[^"]*"\s*\/?>/iu, `<meta name="twitter:url" content="${canonical}" />`)
    .replace(/<meta name="twitter:image" content="[^"]*"\s*\/?>/iu, `<meta name="twitter:image" content="${escapeHtmlAttribute(metadata.socialImage)}" />`)
    .replace(/<link rel="canonical" href="[^"]*"\s*\/?>/iu, `<link rel="canonical" href="${canonical}" />`)
    .replace(/<html lang="[^"]*"/iu, '<html lang="en"');

  const jsonLdTag = `<script type="application/ld+json">${structuredData}</script>`;
  html = html.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/iu, jsonLdTag);
  return html;
}

export function renderLocalizedHomepageHtml(template: string, rawPath: string): string | null {
  if (rawPath !== '/en' && rawPath !== '/en/') return null;
  const canonical = canonicalUrlForPath(rawPath);
  return template
    .replace(/<html lang="[^"]*"/iu, '<html lang="en"')
    .replace(/<link rel="canonical" href="[^"]*"\s*\/?>/iu, `<link rel="canonical" href="${canonical}" />`)
    .replace(/<meta property="og:url" content="[^"]*"\s*\/?>/iu, `<meta property="og:url" content="${canonical}" />`)
    .replace(/<meta name="twitter:url" content="[^"]*"\s*\/?>/iu, `<meta name="twitter:url" content="${canonical}" />`);
}
