# LEAD DNA 🧬 — SaaS starter
**Lead Quality Intelligence • Campaign-to-revenue analytics**

This is a functional first MVP, not a production-complete subscription business.

## Features
- Responsive React dashboard: spend, leads, qualified leads, won sales and revenue.
- Interface language selector for English, Hebrew and Arabic. The page layout remains left-to-right, the Campaign DNA page heading stays in English, and the preference is saved in the browser.
- Campaign-level CPL, cost per qualified lead (CPQL), CAC, revenue and observed ROAS.
- Rules-based Lead Investigator with transparent evidence and actions.
- Reporting-date filters and explicit data-coverage indicators for lead dates, CRM outcomes, campaign ID matching, source labels, and campaign reporting windows.
- Lead-source comparison for Meta Instant Forms, Website Leads and unspecified records. Spend-based source metrics are intentionally unavailable unless source-level spend attribution is reliable.
- Guided campaigns + CRM CSV flow with suggested/manual field mapping, safe preview, validation, duplicate detection, date normalization, currency checks and import confirmation.
- Ad-platform connection center for Meta Ads, TikTok Ads and Google Ads, with provider-specific setup requirements and a secure-sync boundary.
- Campaign-linked Investigator actions that open the matching Campaign DNA view.
- Clerk authentication gates the dashboard; enable Google as a social connection in the Clerk Dashboard to offer Google sign-in.
- Supabase Auth/data integration, personal workspaces and RLS remain in place independently of Clerk.
- Demo mode: sample data and imports reset on page reload after signing in.
- Atomic live imports via a database function. Imports **replace** current workspace data.

## Quick start
1. Install Node 20.19+ (or supported Node 22+).
2. Run `npm install` and `npm run dev` in this folder.
3. Add `VITE_CLERK_PUBLISHABLE_KEY` to `.env.local` (copy the publishable key from Clerk; never put a secret key in a `VITE_*` variable), then restart Vite.
4. Visit the local URL printed by Vite and sign in.
5. Test CSV imports with the files in `public/`.

## Clerk sign-in
Create a Clerk application, enable Google as a social connection in its Dashboard, and set `VITE_CLERK_PUBLISHABLE_KEY` in `.env.local`. The key is a browser-safe publishable key; never expose Clerk secret keys. Sign-in and sign-up both use the current app URL as their explicit post-auth return URL. In the Clerk Dashboard, allow the exact local/deployed app origins used to start sign-in. The React UI displays the existing dashboard only for a signed-in Clerk user.

**Important security boundary:** This Clerk integration only gates the React UI. It does not authenticate Supabase requests, map Clerk users to Supabase users, or secure database access. Existing Supabase integration is unchanged, and no backend authorization has been implemented or tested as part of this change. Do not treat Clerk sign-in as database protection.

## Enable persistent accounts
1. Create a Supabase project.
2. Paste `supabase/schema.sql` into Supabase SQL Editor **once on a new project**.
3. Copy `.env.example` to `.env` and fill the project URL and **publishable/anon** key (never service_role).
4. In Supabase → Authentication → Providers, enable email magic link and optionally Google OAuth.
5. In Authentication → URL Configuration, set Site URL and redirect allow-list for local and deployed addresses.
6. Restart Vite; use the existing Supabase-backed workspace behavior where configured. Clerk sign-in does not create a Supabase session.

If you already have an MVP database, run the updated `supabase/schema.sql` again to add campaign reporting dates/currencies, lead source metadata, and expanded CRM status support. The script is safe to re-run and replaces the import RPC and owner policies.

Google login requires setting up Google's OAuth consent screen and credentials in Supabase. Auth login alone **does not give this app Google Ads permissions**; Google Ads API integration is a separate, future task.

## Direct ad-platform sync status
The Data Sources page now documents the Meta Ads, TikTok Ads and Google Ads connection requirements. **No direct API connection or sync is active yet.** A production connector still requires provider developer apps/API access, approved permissions, server-side OAuth callbacks and token handling, account selection, scheduled/manual sync, and provider-specific error/retry handling. Never add advertising-provider client secrets or access tokens to `VITE_*` variables or browser code.

The intended first sync is daily, campaign-level reporting (spend, impressions, clicks and platform-reported results) into the selected workspace. CRM qualification, closed deals and revenue remain separate data until a verified stable-ID mapping exists. Fetching named/email/phone lead records from lead forms is a distinct, higher-risk integration that requires additional provider permissions and privacy controls; it is not part of aggregate campaign reporting.

## Hosting
Set the production Clerk publishable key in the build environment before running `npm run build`; Vite embeds `VITE_*` values into the public frontend bundle, so use only a publishable key there. The static app is generated in `site/` with relative asset paths and is linked from the 30 Days 30 Projects home page. For GitHub Pages, commit the generated `site/` output along with the source. Configure Supabase redirect URL for the deployed app URL.

## Data contract
`campaigns.csv`: `Campaign ID,Campaign Name,Platform,Amount Spent,Impressions,Clicks,Currency,Reporting Date`
`leads.csv`: `Lead ID,Campaign ID,Lead Status,Qualification Status,Deal Status,Deal Value,First Response Time,Lead Creation Date,Lead Source Type`

The importer suggests mappings for common export headers and allows manual mapping. It accepts quoted CSV fields and reordered columns, validates numeric/date values, skips identical duplicate lead IDs, rejects conflicting duplicates and missing campaign matches, and blocks mixed campaign currencies. CRM statuses normalize to `new`, `contacted`, `qualified`, `unqualified`, `won` or `lost`; revenue is attributed only to records marked `won`. If a won record has no deal value, revenue and ROAS are shown as unavailable rather than treating missing revenue as zero. Leave personal identifiers out of both files. IDs are stable pseudonymous identifiers, and every lead must match a campaign ID.

**Privacy**: Do not upload personally identifiable customer data. Import only pseudonymized/aggregated operational data you have permission to process. This starter is not certified for regulated or production data.

## Current limitations / roadmap
- This version does not connect to Meta Ads, TikTok Ads, Google Ads, GA4 or a CRM API; it uses CSVs. The Data Sources connection center is setup guidance, not an active OAuth connector.
- Lead matching by campaign ID is provided by the input data, not an attribution identity graph.
- Rules-based insights are **not causal inference**, not predictive scoring, and are not an AI model.
- Campaign spend can only be attributed to a selected date range when the campaign report's complete reporting window is contained in that range. Partial overlap and missing report dates are explicitly shown as unavailable.
- Source-level CPL, CPQL, CAC and ROAS remain unavailable because campaign spend is not currently split reliably by Instant Form versus Website Lead source.
- Supabase schema creates owner-only workspaces (no invited team members or billing yet).
- Live CSV upload overwrites previous workspace dataset. Confirmation/version history is a future improvement.
- Remaining roadmap: provider OAuth and server-side sync functions, encrypted token storage, advertiser-account selection, import history, workspace membership, role-based access, secure CRM API connectors, subscriptions and ML scoring.
