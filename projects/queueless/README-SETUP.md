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

Use VS Code Live Server for local testing, or publish all six files to GitHub Pages. Do not open the HTML using `file://`; auth redirect and dynamic module imports need an HTTP(S) page. After setup, sign up using an email + password, open the confirmation email, confirm the address, then sign in. Forgot-password sends a recovery email. The round Q icon shows signed-in account details and sign-out.

## 3. Guest and QR flow

The QR links to `?view=guest`; visitors do NOT need accounts. This build retains the prior queue-data architecture: **tickets and settings are stored in localStorage on that device**, not in Supabase. Email authentication itself is real, but it DOES NOT make queues live across different devices. If business owners and customers use different devices, shared queue data, real-time subscription, business isolation and authorization require Supabase database tables, policies (RLS), and realtime or another secure backend architecture.

**Security boundary:** Owner screens are gated by a verified Supabase sign-in in the user interface. The queue records in localStorage are NOT a server-side protected datastore; never rely on front-end hiding as data security. For a production service, move all protected records into Supabase tables with appropriate RLS and server-side authorization. Do not store sensitive customer information in this local demo.

## 4. Included

- `index.html`, `styles.css`, `app.js`, `qr.js`: existing project and styling, extended with an auth layout
- `auth.js`: sign-up, email confirmation / password sign-in, password recovery, persistent session, sign-out, guest access; EN/HE/AR
- `supabase-config.js`: user-configured public project identifiers only

**Notes**: Email confirmation and recovery depend on Supabase service configuration and redirects. No database or Supabase credentials have been created for you. This ZIP cannot independently send verification emails until you configure your project.

## 5. Google OAuth sign-in (optional, alongside email/password)

1. In **Supabase → Authentication → Sign In / Providers → Google**, find and copy the **Callback URL**. It normally looks like `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`.
2. In **Google Cloud Console** (`https://console.cloud.google.com/`), select/create a Google Cloud project. Open **Google Auth Platform** and configure **Branding** and **Audience** (external for public users; in Testing add your own Google account as a test user).
3. Open **Clients → Create client → Web application**. For **Authorized JavaScript origins**, add `http://127.0.0.1:5500` (origin only, **no path**). For **Authorized redirect URIs**, paste the **Supabase Callback URL from step 1**, **not** the Live Server URL. For published GitHub Pages add `https://YOUR_USERNAME.github.io` as another authorized JavaScript origin.
4. Copy the Google **Client ID** and **Client Secret** into the **Google provider settings inside Supabase**, then enable/save the provider. **Never place the Google Client Secret in JavaScript or GitHub.**
5. In **Supabase → Authentication → URL Configuration**, set the Site URL or add the full Live Server page URL under **Redirect URLs**: `http://127.0.0.1:5500/projects/queueless/index.html`. Set the live GitHub Pages full path too when deploying.
6. Open Live Server, choose **Continue with Google**, select an account, and verify that it redirects back to QUEUELESS as a signed-in business owner. Email/password works unchanged. Guests use `?view=guest` without an account.

The Google login button is real OAuth; it cannot authenticate until Google Cloud and Supabase provider settings are configured. **Do not confuse the Google OAuth callback (Supabase URL) with the site return URL (Live Server / GitHub Pages)**. OAuth adds a third-party account integration intentionally requested for this version. Queue data remains device-local pending a secure shared backend.
