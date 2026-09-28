import { validateSafeUrl } from './security.ts';

export type RedirectCheckStatus = 'PASS' | 'WARNING' | 'ERROR';
export type RedirectErrorCode =
  | 'DNS_ERROR'
  | 'TIMEOUT'
  | 'SSL_ERROR'
  | 'SSRF_BLOCKED'
  | 'INVALID_URL'
  | 'REDIRECT_LOOP'
  | 'TOO_MANY_REDIRECTS'
  | 'CONNECTION_ERROR'
  | 'HTTP_4XX'
  | 'HTTP_5XX';

export interface RedirectHop {
  url: string;
  status: number | null;
  location?: string;
}

export interface RedirectCheckResult {
  inputUrl: string;
  canonicalDomain: string;
  status: number | null;
  finalUrl: string | null;
  redirectCount: number;
  chain: RedirectHop[];
  responseTimeMs: number;
  result: RedirectCheckStatus;
  message: string;
  errorCode?: RedirectErrorCode;
}

const MAX_REDIRECT_HOPS = 10;
const REQUEST_TIMEOUT_MS = 10000;

export function normalizeRedirectInput(raw: string): URL {
  const value = raw.trim();
  if (!value) throw new Error('URL is required.');
  if (/^[a-z][a-z\d+.-]*:/iu.test(value) && !/^https?:\/\//iu.test(value)) {
    throw new Error('Only HTTP and HTTPS URLs are supported.');
  }
  const withProtocol = /^https?:\/\//iu.test(value) ? value : `https://${value}`;
  const url = new URL(withProtocol);
  if (url.protocol !== 'http:' && url.protocol !== 'https:') throw new Error('Only HTTP and HTTPS URLs are supported.');
  url.hash = '';
  return url;
}

export function normalizeCanonicalDomain(raw: string): URL {
  const url = normalizeRedirectInput(raw);
  url.pathname = '/';
  url.search = '';
  return url;
}

function sameCanonicalUrl(left: URL, right: URL): boolean {
  return left.protocol === right.protocol
    && left.hostname.toLowerCase() === right.hostname.toLowerCase()
    && left.port === right.port;
}

function isRedirect(status: number): boolean {
  return [301, 302, 303, 307, 308].includes(status);
}

function errorCodeFor(error: unknown): RedirectErrorCode {
  if (error instanceof DOMException && error.name === 'TimeoutError') return 'TIMEOUT';
  const message = error instanceof Error ? error.message.toLowerCase() : '';
  if (message.includes('not allowed') || message.includes('private') || message.includes('localhost')) return 'SSRF_BLOCKED';
  if (message.includes('ssl') || message.includes('certificate') || message.includes('tls')) return 'SSL_ERROR';
  if (message.includes('dns') || message.includes('resolve')) return 'DNS_ERROR';
  return 'CONNECTION_ERROR';
}

function statusResult(
  status: number | null,
  redirectCount: number,
  finalUrl: URL | null,
  canonical: URL,
  firstUrl: URL,
  firstRedirectStatus?: number,
): { result: RedirectCheckStatus; message: string; errorCode?: RedirectErrorCode } {
  if (status === null) return { result: 'ERROR', message: 'Redirect could not be checked.' };
  if (status >= 500) return { result: 'ERROR', message: 'Server returned an HTTP 5xx error.', errorCode: 'HTTP_5XX' };
  if (status >= 400) return { result: 'ERROR', message: 'URL returned an HTTP 4xx error.', errorCode: 'HTTP_4XX' };
  if (redirectCount > 1) return { result: 'WARNING', message: `Redirect chain detected: ${redirectCount} redirects.` };
  if (redirectCount === 1 && finalUrl && !sameCanonicalUrl(finalUrl, canonical)) {
    return { result: 'WARNING', message: 'Redirect points to a different domain.' };
  }
  if (redirectCount === 1 && firstRedirectStatus === 301 && status === 200 && finalUrl && sameCanonicalUrl(finalUrl, canonical)) {
    return { result: 'PASS', message: '301 Redirect đúng.' };
  }
  if (redirectCount === 1) return { result: 'WARNING', message: 'Redirect hoạt động nhưng chưa tối ưu.' };
  if (redirectCount === 0 && status === 200 && sameCanonicalUrl(firstUrl, canonical)) {
    return { result: 'PASS', message: 'Canonical URL responds with 200 OK.' };
  }
  return { result: 'WARNING', message: 'URL responds, but redirect configuration needs review.' };
}

export async function checkRedirect(rawUrl: string, rawCanonicalDomain: string): Promise<RedirectCheckResult> {
  let inputUrl: URL;
  let canonicalDomain: URL;
  try {
    inputUrl = normalizeRedirectInput(rawUrl);
    canonicalDomain = normalizeCanonicalDomain(rawCanonicalDomain);
  } catch {
    return {
      inputUrl: rawUrl,
      canonicalDomain: rawCanonicalDomain,
      status: null,
      finalUrl: null,
      redirectCount: 0,
      chain: [],
      responseTimeMs: 0,
      result: 'ERROR',
      message: 'Invalid URL. Enter a valid domain or URL.',
      errorCode: 'INVALID_URL',
    };
  }

  const safeInput = await validateSafeUrl(inputUrl.toString());
  if (!safeInput.safe) {
    return {
      inputUrl: inputUrl.toString(),
      canonicalDomain: canonicalDomain.toString(),
      status: null,
      finalUrl: null,
      redirectCount: 0,
      chain: [],
      responseTimeMs: 0,
      result: 'ERROR',
      message: 'The requested URL is not allowed.',
      errorCode: 'SSRF_BLOCKED',
    };
  }

  const startedAt = Date.now();
  const chain: RedirectHop[] = [];
  const visited = new Set<string>();
  let current = inputUrl;
  let finalStatus: number | null = null;

  try {
    for (let hop = 0; hop <= MAX_REDIRECT_HOPS; hop += 1) {
      const currentKey = current.toString();
      if (visited.has(currentKey)) {
        return {
          inputUrl: inputUrl.toString(),
          canonicalDomain: canonicalDomain.toString(),
          status: finalStatus,
          finalUrl: current.toString(),
          redirectCount: chain.length,
          chain,
          responseTimeMs: Date.now() - startedAt,
          result: 'ERROR',
          message: 'Redirect loop detected.',
          errorCode: 'REDIRECT_LOOP',
        };
      }
      visited.add(currentKey);

      const response = await fetch(current, {
        method: 'GET',
        redirect: 'manual',
        headers: {
          'User-Agent': 'SEOX-AI-RedirectChecker/1.0',
          Range: 'bytes=0-4095',
        },
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });
      finalStatus = response.status;
      const location = response.headers.get('location') || undefined;
      chain.push({ url: current.toString(), status: response.status, ...(location ? { location } : {}) });
      response.body?.cancel();

      if (!isRedirect(response.status) || !location) {
        const evaluated = statusResult(
          response.status,
          chain.length - 1,
          current,
          canonicalDomain,
          inputUrl,
          chain[0]?.status ?? undefined,
        );
        return {
          inputUrl: inputUrl.toString(),
          canonicalDomain: canonicalDomain.toString(),
          status: response.status,
          finalUrl: current.toString(),
          redirectCount: chain.length - 1,
          chain,
          responseTimeMs: Date.now() - startedAt,
          ...evaluated,
        };
      }

      const next = new URL(location, current);
      const safeNext = await validateSafeUrl(next.toString());
      if (!safeNext.safe) {
        return {
          inputUrl: inputUrl.toString(),
          canonicalDomain: canonicalDomain.toString(),
          status: response.status,
          finalUrl: next.toString(),
          redirectCount: chain.length,
          chain,
          responseTimeMs: Date.now() - startedAt,
          result: 'ERROR',
          message: 'Redirect target is not allowed.',
          errorCode: 'SSRF_BLOCKED',
        };
      }
      current = next;
    }

    return {
      inputUrl: inputUrl.toString(),
      canonicalDomain: canonicalDomain.toString(),
      status: finalStatus,
      finalUrl: current.toString(),
      redirectCount: chain.length,
      chain,
      responseTimeMs: Date.now() - startedAt,
      result: 'ERROR',
      message: 'Too many redirects.',
      errorCode: 'TOO_MANY_REDIRECTS',
    };
  } catch (error) {
    const errorCode = errorCodeFor(error);
    return {
      inputUrl: inputUrl.toString(),
      canonicalDomain: canonicalDomain.toString(),
      status: finalStatus,
      finalUrl: current.toString(),
      redirectCount: chain.length,
      chain,
      responseTimeMs: Date.now() - startedAt,
      result: 'ERROR',
      message: errorCode === 'TIMEOUT' ? 'The request timed out.' : 'The URL could not be reached.',
      errorCode,
    };
  }
}
