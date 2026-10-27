# QUEUELESS — Supabase Email + Google authentication

This package keeps the existing QUEUELESS interface, adding actual Supabase Auth for business owners, and preserving account-free visitor access.

## 1. Supabase setup (required for actual email authentication)

1. Create a project in https://supabase.com/dashboard
2. Go to **Project Settings → API Keys** and copy the **publishable** (`sb_publishable_...`) key (or legacy anon key). Copy the **Project URL** from the project dashboard/settings.
3. Paste both into `supabase-config.js`:

```js
window.QUEUELESS_SUPABASE = {
  url: 'https://YOUR_PROJECT.supabase.co',
  publishableKey: 'sb_publishable_...'
};
```

**NEVER publish a Supabase secret key or `service_role` key.** The publishable key is meant to be included in client applications.

4. In **Authentication → Providers → Email**, enable email/password and **Confirm email** (essential for verified email sign-in).
5. In **Authentication → URL Configuration**, set your **Site URL** to the deployed site (e.g. `https://YOUR_USERNAME.github.io/QUEUELESS/`). Add that full URL under **Redirect URLs**. When testing locally with VS Code Live Server also add e.g. `http://127.0.0.1:5500/` or your actual preview origin/path. Exact path depends on your folder.
6. If needed, adjust the signup confirmation and recovery email templates in Authentication. Default Supabase email delivery is rate-limited, especially for a production rollout.

## 2. Run

Use VS Code Live Server for local testing, or publish all files in this folder to GitHub Pages. Do not open the HTML using `file://`; auth redirect and dynamic module imports need an HTTP(S) page. After setup, sign up using an email + password, open the confirmation email, confirm the address, then sign in. Forgot-password sends a recovery email. The round Q icon shows signed-in account details and sign-out. Visitors can continue without an email using visitor mode.

## 3. Guest and QR flow

The QR links to `?view=guest`; visitors do NOT need accounts. This build retains the prior queue-data architecture: **tickets and settings are stored in localStorage on that device**, not in Supabase. Email authentication itself is real, but it DOES NOT make queues live across different devices. If business owners and customers use different devices, shared queue data, real-time subscription, business isolation and authorization require Supabase database tables, policies (RLS), and realtime or another secure backend architecture.

**Security boundary:** Owner screens are gated by a verified Supabase sign-in in the user interface. The queue records in localStorage are NOT a server-side protected datastore; never rely on front-end hiding as data security. For a production service, move all protected records into Supabase tables with appropriate RLS and server-side authorization. Do not store sensitive customer information in this local demo.

## 4. Online appointment booking (customer ↔ business owner)

The login screen offers two choices:

- **I'm a customer**: opens the booking screen. The customer picks a business, a day, and a free time slot. Slots come from the owner's business hours, and taken times are shown as unavailable. The customer then enters name and phone (required) plus an optional note. After booking, they get a confirmation page (`?booking=<id>`) that shows the live status and lets them cancel.
- **I'm the business owner**: signs in with email, Google, or **Continue without email**. The **Appointments** page in the dashboard shows the day's timeline: free and booked slots, customer name and phone, note, a "now" marker, and Arrived / Done / No-show / Cancel actions. New bookings appear instantly through Supabase Realtime. Owners set business hours and appointment length there and share their direct link `?book=<businessId>`.

One-time setup:

1. Open **Supabase → SQL Editor → New query**, paste all of `supabase-setup.sql`, and click **Run**. It creates the `businesses` and `appointments` tables, RLS policies, secure booking functions, and the realtime publication. It is safe to run again.
2. Optional, for owners without email: enable **Authentication → Sign In / Providers → Allow anonymous sign-ins**. A no-email owner then gets a real anonymous account tied to this browser; signing out loses access to it. If this is disabled, "Continue without email" falls back to the device-only queue demo.

Customers never read the appointments table directly. They can see only taken time ranges (`busy_slots`), and can read or cancel only the booking whose unguessable id they hold.

## 5. Included

- `index.html`, `styles.css`, `arabic.css`, `app.js`, `qr.js`: project UI, Arabic font and text layout, queue behavior, and QR support
- `auth.js`: login role chooser, sign-up, email confirmation / password sign-in, password recovery, persistent session, sign-out, no-email access; EN/HE/AR
- `booking.js`, `booking.css`: customer booking screen and the owner's live appointments board; EN/HE/AR
- `supabase-setup.sql`: database tables, security policies and functions for online booking
- `supabase-config.js`: user-configured public project identifiers only

**Notes**: Email confirmation and recovery depend on Supabase service configuration and redirects. No database or Supabase credentials have been created for you. This ZIP cannot independently send verification emails until you configure your project.

## 6. Google OAuth sign-in (optional, alongside email/password)

1. In **Supabase → Authentication → Sign In / Providers → Google**, find and copy the **Callback URL**. It normally looks like `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`.
2. In **Google Cloud Console** (`https://console.cloud.google.com/`), select/create a Google Cloud project. Open **Google Auth Platform** and configure **Branding** and **Audience** (external for public users; in Testing add your own Google account as a test user).
3. Open **Clients → Create client → Web application**. For **Authorized JavaScript origins**, add `http://127.0.0.1:5500` (origin only, **no path**). For **Authorized redirect URIs**, paste the **Supabase Callback URL from step 1**, **not** the Live Server URL. For published GitHub Pages add `https://YOUR_USERNAME.github.io` as another authorized JavaScript origin.
4. Copy the Google **Client ID** and **Client Secret** into the **Google provider settings inside Supabase**, then enable/save the provider. **Never place the Google Client Secret in JavaScript or GitHub.**
5. In **Supabase → Authentication → URL Configuration**, set the Site URL or add the full Live Server page URL under **Redirect URLs**: `http://127.0.0.1:5500/projects/queueless/index.html`. Set the live GitHub Pages full path too when deploying.
6. Open Live Server, choose **Continue with Google**, select an account, and verify that it redirects back to QUEUELESS as a signed-in business owner. Email/password works unchanged. Guests use `?view=guest` without an account.

The Google login button is real OAuth; it cannot authenticate until Google Cloud and Supabase provider settings are configured. **Do not confuse the Google OAuth callback (Supabase URL) with the site return URL (Live Server / GitHub Pages)**. OAuth adds a third-party account integration intentionally requested for this version. Queue data remains device-local pending a secure shared backend.
