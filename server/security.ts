import dns from 'dns/promises';
import { URL } from 'url';

/**
 * Checks whether an IPv4 address is in a private, loopback, or reserved range.
 * Returns false if the input string is not an IPv4 address.
 */
function isPrivateIPv4(ip: string): boolean {
  const ipv4Regex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
  const match = ip.match(ipv4Regex);
  if (!match) return false;

  const parts = match.slice(1, 5).map(Number);
  if (parts.some((n) => n < 0 || n > 255)) return false;

  const [a, b] = parts;

  // 127.0.0.0/8 (Loopback)
  if (a === 127) return true;
  // 10.0.0.0/8 (Private)
  if (a === 10) return true;
  // 172.16.0.0/12 (Private: 172.16 - 172.31)
  if (a === 172 && b >= 16 && b <= 31) return true;
  // 192.168.0.0/16 (Private)
  if (a === 192 && b === 168) return true;
  // 169.254.0.0/16 (Link-Local / Cloud Metadata)
  if (a === 169 && b === 254) return true;
  // 0.0.0.0/8
  if (a === 0) return true;
  // 100.64.0.0/10 (Carrier-grade NAT)
  if (a === 100 && b >= 64 && b <= 127) return true;
  // 192.0.2.0/24 (TEST-NET-1)
  if (a === 192 && b === 0 && parts[2] === 2) return true;
  // 198.51.100.0/24 (TEST-NET-2)
  if (a === 198 && b === 51 && parts[2] === 100) return true;
  // 203.0.113.0/24 (TEST-NET-3)
  if (a === 203 && b === 0 && parts[2] === 113) return true;
  // 224.0.0.0/4 (Multicast)
  if (a >= 224) return true;

  return false;
}

/**
 * Checks whether an IPv6 address is in a private, loopback, or reserved range.
 * Returns false if the input string is not an IPv6 address.
 */
function isPrivateIPv6(ip: string): boolean {
  if (!ip.includes(':')) return false;
  const normalized = ip.toLowerCase().replace(/^\[|\]$/gu, '');
  // Loopback ::1
  if (normalized === '::1' || normalized === '0:0:0:0:0:0:0:1') return true;
  // Link-local fe80::/10
  if (normalized.startsWith('fe80:') || normalized.startsWith('fe9') || normalized.startsWith('fea') || normalized.startsWith('feb')) return true;
  // Unique local fc00::/7 (fc00 - fdff)
  if (normalized.startsWith('fc') || normalized.startsWith('fd')) return true;
  // IPv4-mapped IPv6 ::ffff:127.0.0.1
  if (normalized.includes('::ffff:')) {
    const ipv4Part = normalized.split('::ffff:')[1];
    if (ipv4Part && isPrivateIPv4(ipv4Part)) return true;
  }
  return false;
}

const BLOCKED_HOSTNAMES = new Set([
  'localhost',
  'localhost.localdomain',
  'metadata.google.internal',
  '169.254.169.254',
  'instance-data',
  'metadata',
  'internal',
  'docker.for.mac.localhost',
  'host.docker.internal',
]);

/**
 * Validates a target URL against SSRF attack vectors.
 * Resolves DNS to ensure the destination IP is public and accessible.
 */
export async function validateSafeUrl(rawUrl: string): Promise<{ safe: boolean; url: URL; error?: string }> {
  try {
    let target = rawUrl.trim();
    if (!target.startsWith('http://') && !target.startsWith('https://')) {
      target = 'https://' + target;
    }

    const parsed = new URL(target);

    // Only allow HTTP/HTTPS
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return { safe: false, url: parsed, error: 'Protocol not allowed. Use http or https.' };
    }

    const hostname = parsed.hostname.toLowerCase();

    // Block common internal patterns
    if (
      BLOCKED_HOSTNAMES.has(hostname) ||
      hostname.endsWith('.local') ||
      hostname.endsWith('.internal') ||
      hostname.endsWith('.lan') ||
      hostname.endsWith('.corp') ||
      hostname.endsWith('.home') ||
      hostname.endsWith('.test') ||
      hostname.endsWith('.invalid')
    ) {
      return { safe: false, url: parsed, error: `Access to internal hostname '${hostname}' is strictly forbidden.` };
    }

    // Direct IP validation
    if (isPrivateIPv4(hostname) || isPrivateIPv6(hostname)) {
      return { safe: false, url: parsed, error: `Access to private or link-local IP '${hostname}' is strictly forbidden.` };
    }

    // Resolve DNS to verify the resolved address
    try {
      const records = await dns.lookup(hostname, { all: true });
      if (!records || records.length === 0) {
        return { safe: false, url: parsed, error: `Could not resolve DNS records for '${hostname}'.` };
      }

      for (const rec of records) {
        if (rec.family === 4 && isPrivateIPv4(rec.address)) {
          return { safe: false, url: parsed, error: `Hostname resolved to non-routable private IP '${rec.address}'.` };
        }
        if (rec.family === 6 && isPrivateIPv6(rec.address)) {
          return { safe: false, url: parsed, error: `Hostname resolved to non-routable private IPv6 '${rec.address}'.` };
        }
      }
    } catch (dnsErr: any) {
      return { safe: false, url: parsed, error: `DNS resolution failed: ${dnsErr?.message || 'Host not found'}` };
    }

    return { safe: true, url: parsed };
  } catch (err: any) {
    return { safe: false, url: new URL('https://invalid.local'), error: `Invalid URL format: ${err?.message || 'unknown error'}` };
  }
}
