# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

SEOX AI administrators and brand owners preparing accurate, reusable entity and brand identity information.

## Product Purpose

SEOX AI provides website and SEO analysis tools. Entity Manager helps a user maintain one reviewable brand profile, check its consistency, generate structured data and social metadata, and prepare manual exports.

## Positioning

Entity Manager derives every preview and export from user-provided profile data, labels unavailable or unverified facts instead of inventing them, and keeps the working profile in the user's browser until they explicitly export it.

## Operating Context

Users edit a profile in the SEOX AI web application, review validation findings and generated previews, then copy or download material for manual publication. No automated third-party submission is part of the workflow.

## Capabilities and Constraints

- Platform identity defaults are SEOX AI, `https://seox-ai.site/`, `vi-VN`, and a web-based `SoftwareApplication`.
- Entity profile persistence is browser-local only. The current sign-in interface is not a real authentication system; Entity Manager must not add public server storage or expose profile data through an unauthenticated API.
- Generated schema, social metadata, profile text and exports must use supplied facts only. Founder, legal name, founding date, address, contact details, reviews and social profiles are not presumed.
- User-entered legacy domain references are preserved in the editor, identified by validation, and excluded from export until resolved; never silently rewrite them.
- Do not claim Knowledge Panel eligibility, notability, ranking gains, or successful external publication.
- Do not automate account creation, posting, directory submissions, or Wikidata edits.
- Keep entity data and audit events local to the browser. Never store API keys or secrets in the profile.

## Brand Commitments

The product is SEOX AI. The requested module name is Entity Manager. Existing interface identity and navigation remain authoritative.

## Evidence on Hand

The repository contains a React/Vite web application, an Express server, a dark interface with orange accents, and SEO Tools pages. No real authentication service or general-purpose persistence backend is present. User-provided brand facts for the entity profile are limited to SEOX AI, `https://seox-ai.site/`, `vi-VN`, `SoftwareApplication`, `BusinessApplication`, Web, and the explicitly specified free offer values.

## Product Principles

- Preserve factual provenance.
- Surface uncertainty instead of turning it into a pass.
- Require review before external use.
- Keep user-controlled data local unless a protected persistence layer is deliberately introduced.

