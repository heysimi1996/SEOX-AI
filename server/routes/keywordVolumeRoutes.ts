import { Router, type Request, type Response, type NextFunction } from 'express';
import { keywordVolumeProviders, keywordVolumeService } from '../providers/keyword-volume/index.ts';
import { KeywordVolumeError } from '../providers/keyword-volume/types.ts';

const router = Router();
const requestsByClient = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 60_000;
const MAX_VOLUME_REQUESTS_PER_WINDOW = 10;

function limitVolumeRequests(req: Request, res: Response, next: NextFunction) {
  const now = Date.now();
  const client = req.ip || req.socket.remoteAddress || 'unknown';
  const recent = (requestsByClient.get(client) ?? []).filter((time) => now - time < RATE_LIMIT_WINDOW_MS);
  if (recent.length >= MAX_VOLUME_REQUESTS_PER_WINDOW) {
    requestsByClient.set(client, recent);
    return res.status(429).json({ error: 'Too many keyword volume requests. Please wait before trying again.' });
  }
  recent.push(now);
  requestsByClient.set(client, recent);
  if (requestsByClient.size > 1000) {
    for (const [key, timestamps] of requestsByClient) {
      if (!timestamps.some((time) => now - time < RATE_LIMIT_WINDOW_MS)) requestsByClient.delete(key);
    }
  }
  return next();
}

router.get('/volume', limitVolumeRequests, async (req, res) => {
  try {
    const result = await keywordVolumeService.getVolume(
      req.query.keyword,
      req.query.countries,
      req.query.provider,
    );
    return res.json(result);
  } catch (error) {
    const status = error instanceof KeywordVolumeError ? error.statusCode : 502;
    return res.status(status).json({
      error: error instanceof Error ? error.message : 'Keyword volume lookup failed.',
    });
  }
});

router.get('/volume/history', (req, res) => {
  if (typeof req.query.keyword === 'string' && req.query.keyword.length > 80) {
    return res.status(400).json({ error: 'Keyword cannot exceed 80 characters.' });
  }
  return res.json({ success: true, history: keywordVolumeService.getHistory(req.query.keyword) });
});

router.get('/providers/status', (_req, res) => {
  return res.json({
    ahrefs: { configured: keywordVolumeProviders.ahrefs.isConfigured() },
    dataforseo: { configured: keywordVolumeProviders.dataforseo.isConfigured() },
  });
});

export const keywordVolumeRouter = router;
