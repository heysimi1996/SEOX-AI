/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Router, type Request, type Response } from 'express';

export const gscRouter = Router();

function getBearerToken(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7).trim();
  }
  if (req.body?.accessToken && typeof req.body.accessToken === 'string') {
    return req.body.accessToken.trim();
  }
  return null;
}

// -------------------------------------------------------------
// 1. GSC Status & Configuration Check
// -------------------------------------------------------------
gscRouter.get('/status', (req: Request, res: Response) => {
  const clientId = process.env.GOOGLE_CLIENT_ID || '';
  return res.json({
    configured: Boolean(clientId),
    clientId: clientId || null,
    scope: 'https://www.googleapis.com/auth/webmasters.readonly',
    supportUrlInspection: true,
  });
});

// -------------------------------------------------------------
// 2. Fetch User's Verified Sites
// -------------------------------------------------------------
gscRouter.post('/sites', async (req: Request, res: Response) => {
  const token = getBearerToken(req);
  if (!token) {
    return res.status(401).json({
      error: 'Unauthorized: Google Search Console OAuth authorization token is required.',
      connected: false,
    });
  }

  try {
    const googleRes = await fetch('https://www.googleapis.com/webmasters/v3/sites', {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (googleRes.status === 401) {
      return res.status(401).json({
        error: 'Google OAuth token expired or invalid. Please re-authenticate.',
        connected: false,
      });
    }

    if (!googleRes.ok) {
      const errBody = await googleRes.text();
      return res.status(googleRes.status).json({
        error: `Google Search Console API error: ${errBody}`,
        connected: false,
      });
    }

    const data = await googleRes.json();
    const siteEntries = (data.siteEntry || []).map((s: any) => ({
      siteUrl: s.siteUrl,
      permissionLevel: s.permissionLevel,
    }));

    return res.json({
      connected: true,
      sites: siteEntries,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || 'Failed to communicate with Google Search Console API' });
  }
});

// -------------------------------------------------------------
// 3. Search Performance Query (Clicks, Impressions, CTR, Position)
// -------------------------------------------------------------
gscRouter.post('/analytics', async (req: Request, res: Response) => {
  const token = getBearerToken(req);
  if (!token) {
    return res.status(401).json({
      error: 'Google Search Console authorization required. Only display data after authorization.',
      connected: false,
    });
  }

  const { siteUrl, startDate, endDate } = req.body;
  if (!siteUrl) {
    return res.status(400).json({ error: 'siteUrl parameter is required' });
  }

  // Default to last 28 days
  const now = new Date();
  const end = endDate || now.toISOString().split('T')[0];
  const start = startDate || new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  try {
    const encodedSite = encodeURIComponent(siteUrl);
    const apiUrl = `https://www.googleapis.com/webmasters/v3/sites/${encodedSite}/searchAnalytics/query`;

    // Query 1: Overall totals & query breakdown
    const queryPayload = {
      startDate: start,
      endDate: end,
      dimensions: ['query'],
      rowLimit: 250,
    };

    const pagesPayload = {
      startDate: start,
      endDate: end,
      dimensions: ['page'],
      rowLimit: 100,
    };

    const devicePayload = {
      startDate: start,
      endDate: end,
      dimensions: ['device'],
    };

    const countryPayload = {
      startDate: start,
      endDate: end,
      dimensions: ['country'],
      rowLimit: 50,
    };

    const [qRes, pRes, dRes, cRes] = await Promise.all([
      fetch(apiUrl, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(queryPayload),
      }),
      fetch(apiUrl, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(pagesPayload),
      }),
      fetch(apiUrl, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(devicePayload),
      }),
      fetch(apiUrl, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(countryPayload),
      }),
    ]);

    if (!qRes.ok) {
      const errText = await qRes.text();
      return res.status(qRes.status).json({ error: `GSC Search Analytics error: ${errText}` });
    }

    const qData = await qRes.json();
    const pData = pRes.ok ? await pRes.json() : { rows: [] };
    const dData = dRes.ok ? await dRes.json() : { rows: [] };
    const cData = cRes.ok ? await cRes.json() : { rows: [] };

    const queryRows = (qData.rows || []).map((r: any) => ({
      query: r.keys?.[0] || 'unknown',
      clicks: r.clicks || 0,
      impressions: r.impressions || 0,
      ctr: r.ctr ? +(r.ctr * 100).toFixed(2) : 0,
      position: r.position ? +r.position.toFixed(1) : 0,
    }));

    const pageRows = (pData.rows || []).map((r: any) => ({
      page: r.keys?.[0] || 'unknown',
      clicks: r.clicks || 0,
      impressions: r.impressions || 0,
      ctr: r.ctr ? +(r.ctr * 100).toFixed(2) : 0,
      position: r.position ? +r.position.toFixed(1) : 0,
    }));

    const deviceRows = (dData.rows || []).map((r: any) => ({
      device: r.keys?.[0] || 'unknown',
      clicks: r.clicks || 0,
      impressions: r.impressions || 0,
      ctr: r.ctr ? +(r.ctr * 100).toFixed(2) : 0,
    }));

    const countryRows = (cData.rows || []).map((r: any) => ({
      country: r.keys?.[0] || 'unknown',
      clicks: r.clicks || 0,
      impressions: r.impressions || 0,
    }));

    const totalClicks = queryRows.reduce((a: number, b: any) => a + b.clicks, 0);
    const totalImpressions = queryRows.reduce((a: number, b: any) => a + b.impressions, 0);
    const avgCtr = totalImpressions > 0 ? +((totalClicks / totalImpressions) * 100).toFixed(2) : 0;
    const avgPosition = queryRows.length
      ? +(queryRows.reduce((a: number, b: any) => a + b.position, 0) / queryRows.length).toFixed(1)
      : 0;

    // -------------------------------------------------------------
    // OPPORTUNITY IDENTIFICATION ENGINE
    // -------------------------------------------------------------
    const medianImpressions = queryRows.length
      ? [...queryRows].sort((a, b) => a.impressions - b.impressions)[Math.floor(queryRows.length / 2)].impressions
      : 100;

    // 1. High Impressions / Low CTR (Title/Snippet optimization opportunities)
    const highImpressionsLowCtr = queryRows
      .filter((q: any) => q.impressions >= Math.max(50, medianImpressions) && q.ctr < 2.0 && q.position <= 20)
      .sort((a: any, b: any) => b.impressions - a.impressions)
      .slice(0, 15);

    // 2. Striking Distance (Position 4 - 15, high potential for Page 1 top spot)
    const strikingDistance = queryRows
      .filter((q: any) => q.position >= 4.0 && q.position <= 15.0)
      .sort((a: any, b: any) => b.impressions - a.impressions)
      .slice(0, 20);

    // 3. Declining queries (Low CTR despite top 5 position)
    const decliningQueries = queryRows
      .filter((q: any) => q.position <= 6.0 && q.ctr < 3.0 && q.impressions > 40)
      .slice(0, 10);

    // 4. Low performing pages
    const decliningPages = pageRows
      .filter((p: any) => p.impressions > 100 && p.ctr < 1.0)
      .slice(0, 10);

    return res.json({
      siteUrl,
      timeframe: { start, end },
      summary: {
        totalClicks,
        totalImpressions,
        avgCtr,
        avgPosition,
        totalKeywordsTracked: queryRows.length,
        totalPagesTracked: pageRows.length,
      },
      queries: queryRows,
      pages: pageRows,
      devices: deviceRows,
      countries: countryRows,
      opportunities: {
        highImpressionsLowCtr,
        strikingDistance,
        decliningQueries,
        decliningPages,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || 'Failed to query GSC search analytics' });
  }
});

// -------------------------------------------------------------
// 4. URL Inspection API
// -------------------------------------------------------------
gscRouter.post('/inspect', async (req: Request, res: Response) => {
  const token = getBearerToken(req);
  if (!token) {
    return res.status(401).json({
      error: 'Unauthorized: Google Search Console authorization token required.',
      connected: false,
    });
  }

  const { inspectionUrl, siteUrl } = req.body;
  if (!inspectionUrl || !siteUrl) {
    return res.status(400).json({ error: 'inspectionUrl and siteUrl parameters are required' });
  }

  try {
    const resGoogle = await fetch('https://searchconsole.googleapis.com/v1/urlInspection/index:inspect', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inspectionUrl,
        siteUrl,
      }),
    });

    if (!resGoogle.ok) {
      const errText = await resGoogle.text();
      return res.status(resGoogle.status).json({
        error: `URL Inspection API: ${errText}`,
        inspectionUrl,
      });
    }

    const json = await resGoogle.json();
    const result = json.inspectionResult || {};
    const indexResult = result.indexStatusResult || {};
    const mobileResult = result.mobileUsabilityResult || {};

    const formattedData = {
      inspectionUrl,
      siteUrl,
      // Index Status (Coverage State)
      indexStatus: indexResult.coverageState
        ? {
            status: 'Available',
            value: indexResult.coverageState,
            verdict: indexResult.verdict || 'NEUTRAL',
          }
        : {
            status: 'Unavailable',
            value: 'No index coverage data returned',
            verdict: 'UNAVAILABLE',
          },
      // Crawl Status
      crawlStatus: indexResult.crawledAs
        ? {
            status: 'Available',
            crawledAs: indexResult.crawledAs,
            robotsTxtState: indexResult.robotsTxtState || 'ALLOWED',
            indexingState: indexResult.indexingState || 'INDEXING_ALLOWED',
            pageFetchState: indexResult.pageFetchState || 'SUCCESSFUL',
          }
        : {
            status: 'Unavailable',
            crawledAs: 'Unavailable',
            robotsTxtState: 'Unavailable',
            indexingState: 'Unavailable',
            pageFetchState: 'Unavailable',
          },
      // Canonical
      canonical: {
        status: indexResult.userCanonical || indexResult.googleCanonical ? 'Available' : 'Unavailable',
        userCanonical: indexResult.userCanonical || 'Unavailable',
        googleCanonical: indexResult.googleCanonical || 'Unavailable',
        matches: indexResult.userCanonical && indexResult.googleCanonical
          ? indexResult.userCanonical === indexResult.googleCanonical
          : null,
      },
      // Mobile Usability
      mobileUsability: mobileResult.verdict
        ? {
            status: 'Available',
            verdict: mobileResult.verdict, // e.g. 'PASS', 'FAIL'
            issues: (mobileResult.issues || []).map((i: any) => i.issueType || 'Unknown issue'),
          }
        : {
            status: 'Unavailable',
            verdict: 'Unavailable',
            issues: [],
          },
      // Last Crawl
      lastCrawl: indexResult.lastCrawlTime
        ? {
            status: 'Available',
            timestamp: indexResult.lastCrawlTime,
          }
        : {
            status: 'Unavailable',
            timestamp: 'Unavailable',
          },
    };

    return res.json({
      success: true,
      data: formattedData,
      raw: result,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || 'Failed to inspect URL' });
  }
});
