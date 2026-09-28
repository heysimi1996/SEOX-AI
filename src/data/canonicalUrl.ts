import { SEO_PRODUCTION_ORIGIN } from './seoTools';

export function canonicalUrlForPath(pathname: string): string {
  const cleanPath = pathname.split(/[?#]/u, 1)[0] || '/';
  if (!cleanPath.startsWith('/')) return `${SEO_PRODUCTION_ORIGIN}/`;
  if (cleanPath === '/en') return `${SEO_PRODUCTION_ORIGIN}/en/`;
  return `${SEO_PRODUCTION_ORIGIN}${cleanPath}`;
}
