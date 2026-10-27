# SANTU BUSINESS SERVICES — Setup, Deployment & Maintenance

## 1. What runs where

| Part | Technology | Notes |
|---|---|---|
| Website + admin panel | React 19 + TypeScript (TanStack Start), Tailwind CSS | Pages in `src/routes`, shared UI in `src/components` |
| Server logic | TanStack server functions (`src/lib/*.functions.ts`) and one server route (`src/routes/api/public/media.$file.ts`) | Runs on the hosting edge runtime |
| Database, login, file storage | Lovable Cloud (managed PostgreSQL + Auth + Storage) | Free tier usage-based; see section 6 |

Public pages: `/`, `/services`, `/about`, `/faq`, `/contact`.
Admin: `/admin` (sign in at `/auth`, password reset at `/reset-password`).

## 2. First-time setup (owner)

1. Open `/auth` on the site. While no administrator exists, the page shows **Create the owner account**.
2. Enter your email and a password (min. 8 characters) and submit.
3. Confirm your email using the link sent to you, then sign in. You land on the admin dashboard.
4. **Do this before sharing or publishing the site.** The first account created becomes the only owner;
   any later sign-up gets no access at all.
5. Optional hardening: once your account exists, ask Lovable to "disable new sign-ups". Existing
   accounts keep working. Extra staff can then be added under **More → Users → Add user**,
   and given admin access with:
   `insert into public.user_roles (user_id, role) values ('<user id>', 'admin');`

## 3. Using the admin panel

- **Dashboard** – enquiry totals by status, latest 5 enquiries, quick links.
- **Website text** – Home, About, Footer, Business & logo. *Save draft* stores changes privately,
  *Preview* opens a private preview of all saved drafts, *Publish* makes them live,
  *Revert to live* throws away unpublished edits.
- **Services / FAQs** – add, edit, move up/down, switch Published/Hidden, delete. These go live as soon
  as you save; use *Hidden* while preparing an item.
- **Logo & images** – upload PNG/JPG/WebP up to 2 MB, edit alt text, delete unused images. Choose where an
  image appears from *Website text* (logo is under *Business & logo*). Replacing an image = choose a new one.
- **Contact details** – email, phone, WhatsApp, address and social links. A detail only appears on the
  website when it is filled in **and** switched to *Verified*, then published. Unverified details are never
  sent to visitors (not even in the page source).
- **Enquiries** – search, filter, change status (New / In progress / Responded / Closed / Spam), delete.

## 4. Security model

- Every table has Row-Level Security. Visitors can read only published content, published services/FAQs
  and image metadata. Drafts, enquiries and all write actions require a signed-in account with the
  `admin` role (stored in `public.user_roles`, checked by `public.has_role`).
- Enquiries can only be created through the website's server function, which validates input, rejects
  bots (hidden honeypot field + minimum 3-second fill time) and allows max 5 enquiries per hour per
  network address (stored as a one-way hash, not the raw IP).
- Images live in a **private** storage bucket (`site-media`, 2 MB limit, PNG/JPG/WebP only enforced by
  storage policy). Only admins can read the bucket directly. The site serves images via
  `/api/public/media/<file>`, which reads them server-side and only serves files registered in the
  media library. (Public buckets are blocked by your workspace policy; this route works without them.)
- No service-role key is used in browser code. The only privileged server code is the enquiry insert
  in `src/lib/enquiry.functions.ts` and the media route, both loading it inside the handler.

## 5. Deployment

- **Publish**: in Lovable, click **Publish**. The site is hosted on a free `*.lovable.app` address.
- **Custom domain** (optional, requires a domain you own and may require a paid Lovable plan):
  Project Settings → Domains. Nothing is purchased automatically.
- Database changes are versioned in `drizzle/migrations/*.sql` and apply automatically.

## 6. Free-tier notes and limitations

- Lovable Cloud has a free usage allowance; heavy traffic or large storage can incur usage charges on
  your workspace. Nothing paid has been enabled.
- Auth emails (sign-up confirmation, password reset) use the default Lovable sender, which has an hourly
  sending limit and may land in spam. A branded sender needs a verified domain (paid plans).
- No email notification is sent when a new enquiry arrives — check the admin dashboard. Email alerts can
  be added later (requires an email domain setup).
- Enquiry list shows the latest 500 enquiries; export older ones via backup.

## 7. Backup & restore

- **Content & enquiries**: Lovable → More → Database → tables → export CSV for `site_content`,
  `services`, `faqs`, `media`, `enquiries` (do this monthly, and before big changes).
- **Images**: download from the Logo & images page, or More → Storage → `site-media`.
- **Code**: connect GitHub (Lovable → GitHub) so every change is committed to your own repository.
- **Restore**: re-import the CSVs into the same tables; re-upload images keeping the same file names.

## 8. Moving to another host later (portability)

The code is a standard Vite/TanStack Start project. To migrate:
1. Export code from GitHub and data as above.
2. Create a PostgreSQL + Supabase-compatible project and run `drizzle/migrations/*.sql` in order.
3. Create a private `site-media` bucket (2 MB limit) and upload images.
4. Set environment variables: `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
   (server only), `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`.
5. `npm install && npm run build`, deploy to any host that supports TanStack Start (e.g. Cloudflare Workers).

## 9. Maintenance checklist

- Weekly: review new enquiries, mark spam.
- Monthly: export backups; remove unused images.
- After editing: always *Preview* before *Publish*.
- Run the automated rule tests: `npm test` (enquiry validation, spam rules, contact visibility, image rules).
