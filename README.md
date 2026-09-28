# SEOX AI

SEOX AI uses the Google AI Studio React/Vite interface with an Express server for audits and provider integrations.

## Run locally

Prerequisites: Node.js and npm.

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env`.
3. Add provider credentials to `.env` as needed. The server loads these variables; do not put provider keys in React code or commit `.env`.
4. Start the complete application with `npm run dev` and open `http://localhost:3000`.

`npm run build` creates the production frontend, and `npm start` runs the Express server serving that build. Set `PORT` to change the server port.

## Free SEO Tools

The public SEO Tools hub is available at `/seo-tools/`. It links to the SEO Checker, Technical SEO Checker, On-Page SEO Checker, Keyword Research, Keyword Volume, Backlink Checker, Redirect 301 Checker, Domain Checker, Website Analyzer, Meta Tag Checker, Schema Checker, and Sitemap Checker. Each route uses the existing SEOX AI React/Vite interface and receives route-specific canonical, Open Graph, title, description, and structured data from Express.

Live URL audits, domain lookups, sitemap checks, redirect checks, and provider-based keyword/backlink data use the existing server-side integrations. Keyword Research requires `GEMINI_API_KEY`; it returns phrase suggestions and intent labels only, not measured search metrics. If an integration is not configured, the corresponding tool reports that it is unavailable rather than filling results with sample data.

The hub and tool routes are included in `public/sitemap.xml`. To verify the route metadata and sitemap entries locally, run `npm test`.

## Keyword intelligence

### Project Keywords

Create projects and track keywords from **Search & Rankings**. Projects, keyword configuration, and SERP check history are stored in browser `localStorage`; no database is required. Existing `seox_tracked_keywords` entries are retained and assigned to the initial project. Rankings are only shown when returned by the configured live SERP provider; unavailable positions are not estimated.

Set `SERP_API_KEY` to enable live SERP tracking.

### Keyword Volume

The **Keyword Volume** tool requests provider-estimated monthly search volume by country. Missing provider values are returned as `null` with an explanation; they are not treated as zero or included in the reported-value total. The total is `null` when no selected country has a returned value. The volume response cache is held in server memory for 15 minutes; volume lookup history is also held in memory and resets when the server restarts.

Configure either or both providers in server `.env`:

```dotenv
AHREFS_API_KEY=
DATAFORSEO_LOGIN=
DATAFORSEO_PASSWORD=
```

Ahrefs uses its Keywords Explorer volume-by-country API. DataForSEO uses the Google Ads Search Volume live endpoint with each country's location targeting. The credentials are only read by the Express server. Search volumes are estimates; Google Ads results use English as the requested language for each selected country.

API endpoints:

- `GET /api/keywords/volume?keyword=...&countries=vn,th&provider=ahrefs`
- `GET /api/keywords/volume/history?keyword=...`

Use `GET /api/integrations/status` to see which providers are configured. `npm test` runs the keyword-volume service and normalization tests; `npm run lint` performs the TypeScript check.

### Check Redirect 301

Open **Check Redirect 301** from **Search & Rankings** to verify a URL's redirect status, destination, redirect chain, response timing, and canonical-domain match. The server follows redirects manually (maximum 10 hops), blocks private/internal destinations, and never exposes outbound request credentials to the browser.

The checker accepts domains with or without `http://` or `https://`. It uses `POST /api/redirect-check` with `url` and `canonicalDomain`; checks are rate-limited to 10 requests per client per minute.
