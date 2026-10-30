# TAMO Creative Studio Website

Open `index.html` in a browser or run the folder through a local static web server such as VS Code Live Server. The Supabase JavaScript client is loaded from jsDelivr, so an internet connection is required.

## Inquiry storage

The project inquiry form saves submissions to the Supabase `public.inquiries` table. Every form field is optional, and the form does not impose character-count limits. The dashboard at `admin.html` uses Supabase password authentication and only accepts the configured administrator email.

Before the form and dashboard can work:

1. In the Supabase SQL Editor for the project, run `supabase-setup.sql`
2. In Supabase Authentication, disable public sign-ups, then create and confirm a user for `taimaa.openu@gmail.com` with a password. Set that password privately in Supabase and never put it in website code
3. Keep the Supabase URL and publishable key in `supabase-config.js`. A publishable key is intended for browser use; never use a secret or service-role key in this website
4. In Supabase Authentication URL Configuration, set the deployed site URL and add the deployed site and local development URLs to the allowed redirect URLs
5. Deploy the entire folder, including the SQL setup file, configuration, scripts, and styles

Row-level security permits anonymous visitors to insert inquiry details only. Only authenticated sessions with the configured administrator email can view, update the status of, or delete inquiries. The dashboard displays the latest 100 inquiries. Email delivery is not automatic; the saved inquiry appears in the dashboard, and the visitor may use the displayed email address to contact the studio separately.

For a public production deployment, consider adding an abuse-prevention measure such as CAPTCHA and publish an appropriate privacy notice before collecting personal information.

## Other features

- Hebrew and English website content
- Interactive service, product-thinking, process, and inquiry sections
- Contact email: `taimaa.openu@gmail.com`
