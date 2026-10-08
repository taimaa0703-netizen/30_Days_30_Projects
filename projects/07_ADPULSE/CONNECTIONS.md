# ADPULSE advertising connections

The Connections page imports campaign data from Meta Ads, Google Ads or TikTok Ads through a local Node server. It does not implement a public OAuth login flow. Each platform must first authorize your developer application and account, and its credentials must be configured on the server.

1. Install Node.js 22.6 or newer.
2. Copy `.env.example` to `.env` in this folder and fill in credentials for the platform you want to use. Never commit `.env`.
3. From this folder, run `node server.mjs`.
4. Open `http://127.0.0.1:3070`. The dashboard opens directly without sign-in. Select **Connections / חיבורים**, enter the advertising account ID and click **Connect & import / חיבור וייבוא**.

The site still works as a CSV/demo dashboard with Live Server. API imports require the Node server above. No additional npm packages are required.

After changing `.env`, restart `node server.mjs` and use **Check service** on the Connections page.

## Platform setup

- **Meta:** authorized access token with `ads_read` for the selected ad account. Set one `META_CONVERSION_ACTION` for the objective you measure. The same action's monetary value is mapped to revenue. Do not sum overlapping purchase action types. [Official Meta Insights documentation](https://developers.facebook.com/docs/marketing-api/insights/).
- **Google:** developer token plus OAuth client ID, client secret and refresh token with the `https://www.googleapis.com/auth/adwords` scope. Provide the manager ID when accessing a client account through a manager. [Official authentication documentation](https://developers.google.com/google-ads/api/rest/auth). `metrics.conversions_value` is mapped to revenue: this is the configured conversion value, which may differ from recognized sales revenue.
- **TikTok:** approved API for Business access token for the advertiser. Configure the advertiser's actual currency and supported conversion/value metrics for its objective. Names vary by report and account; the adapter fails if the configured metrics are unavailable. [Official reporting SDK](https://github.com/tiktok/tiktok-business-api-sdk/blob/main/js_sdk/docs/ReportingApi.md).

API versions are configurable in `.env`. Access approval, valid credentials and permissions are requirements of the platforms, not provided by this project. Tokens may expire or be revoked.

## Data behavior

- Imports cover the last 30 completed calendar dates, ending yesterday in UTC; daily buckets follow the platform's account reporting rules.
- One account is displayed at a time. A successful import replaces demo, CSV or previously imported account data; failed imports leave it intact.
- The dashboard uses the selected account's currency. CSV and demo data continue to use ILS.
- Status becomes **Connected** only after a successful API response and dataset validation. **Ready to connect** only indicates that server settings are present.
- Refresh imports the account again. No automatic background sync is scheduled.
- Removing a connection from the dashboard restores demo data. It does not revoke the platform token; revoke access in the platform's account settings when needed.
- Loaded reports are held in browser memory and disappear on reload. Credentials stay in the Node process and are never returned to the browser.
- Campaign IDs are included in labels to distinguish campaigns with identical names.
- The server binds to loopback, serves only public page files and checks same-origin requests and a per-process request token. It is for local single-user use. Public hosting requires user authentication, account authorization and durable secure credential storage.

## Verification

Run `node --test connections.test.mjs`. These tests use mocked platform responses; validating real account access requires your credentials.
