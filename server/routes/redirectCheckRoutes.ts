import { Router } from 'express';
import { checkRedirect } from '../redirectChecker.ts';

const router = Router();
const requestTimes = new Map<string, number[]>();
const WINDOW_MS = 60_000;
const MAX_REQUESTS = 10;

router.post('/redirect-check', async (req, res) => {
  const client = req.ip || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const recent = (requestTimes.get(client) ?? []).filter((time) => now - time < WINDOW_MS);
  if (recent.length >= MAX_REQUESTS) {
    return res.status(429).json({ error: 'Too many redirect checks. Please wait before trying again.' });
  }
  recent.push(now);
  requestTimes.set(client, recent);

  const { url, canonicalDomain } = req.body as { url?: unknown; canonicalDomain?: unknown };
  if (typeof url !== 'string' || typeof canonicalDomain !== 'string' || !url.trim() || !canonicalDomain.trim()) {
    return res.status(400).json({ error: 'url and canonicalDomain are required.' });
  }

  const result = await checkRedirect(url, canonicalDomain);
  const status = result.errorCode === 'INVALID_URL' ? 400 : result.errorCode === 'SSRF_BLOCKED' ? 403 : 200;
  return res.status(status).json({ success: status === 200, ...result });
});

export const redirectCheckRouter = router;
