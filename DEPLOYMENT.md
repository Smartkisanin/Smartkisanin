# Smart Kisan Bharat: setup and deployment

## Local development

The web app and API each default to port `3000` when `PORT` is not set. The
Replit preview assigns managed ports to its workflows; keep those values when
running inside Replit.

```sh
pnpm install
pnpm --filter @workspace/api-server run dev
pnpm --filter @workspace/smart-kisan-bharat run dev
```

Local API records are saved outside the repository in `/tmp`. Set
`DEV_DB_FILE` if you need a different local file. Local JSON persistence is for
development only.

## Vercel

1. Import the repository into Vercel with the repository root as the project
   root. The checked-in `vercel.json` runs the web build and serves its static
   output; the `/api/*` function forwards requests to the API application.
2. Create a Supabase project and run `supabase/schema.sql` against its database.
   The application stores one JSON state row in `public.app_state`; a missing
   table or unavailable database produces an error instead of demo or
   in-memory production data.
3. Add these values in Vercel's environment-variable settings. Keep secrets
   out of this repository and out of chat:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY` (server-side only; never use a browser/public key)
   - `PII_HASH_SALT` (a long random value, kept stable while retaining the same
     buyer records)
   - `SESSION_SECRET` (a separate long random value for signing admin sessions)
   - `ADMIN_MOBILE_HASH` and `ADMIN_PIN_HASH` (generated as described below)
4. Use separate Supabase projects and secrets for Preview and Production.
   Configure `SESSION_SECRET`, the buyer-hash salt, and admin hashes in both
   environments before using the corresponding workflows.

Vercel Functions do not bind a user-selected port. `PORT=3000` is the default
for local development; Vercel routes the serverless API function directly.
For Replit, its workflow configuration supplies the port required by the
preview proxy.

## Configure administrator credentials

Set `PII_HASH_SALT` in the shell environment using your secret manager, then run:

```sh
node scripts/hash-admin-credentials.mjs
```

The script prompts without echoing the mobile number or PIN and prints only
their salted hashes. Put those outputs into `ADMIN_MOBILE_HASH` and
`ADMIN_PIN_HASH` in the target deployment's secret settings. Do not commit the
hashes or plaintext credentials.

## What is and is not connected

- Buyer GSTIN and PAN inputs receive format checks and are stored as salted
  hashes plus masked display values. This does not query an official registry;
  an administrator must approve the application.
- Admin can approve or reject buyer applications and draft listings, and
  resolve reported order issues.
- Accepting an offer creates an order record. Payment processing, shipment
  updates, and official government/MSP/mandi feeds are not connected.
- The Government portal reports marketplace records only. It displays an
  explicit empty-source state for official compliance data rather than
  inventing figures.
- Offline support covers the app shell, browser-saved listing drafts, and
  previously fetched public GET data. Private account, order, and admin API
  responses are not cached. Writes need a network connection.

The Supabase table currently contains the app's complete JSON state in one row.
This keeps the imported app portable for a small deployment, but is not a
normalized, high-concurrency marketplace database. Move to transactional
per-entity tables before handling substantial concurrent traffic or payment
settlement.
