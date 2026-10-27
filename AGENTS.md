<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Architecture rules

- Editable page text lives in `site_content` as one draft row and one published row per section; the public site reads only published rows, so publishing never exposes half-finished edits.
- Content shape and defaults are defined once in `src/lib/content.ts` (`mergeSection`); add new editable fields there so seed data, admin forms and public pages stay in sync.
- Public pages render through `src/components/site/pages.tsx` components that take `SiteData`, so the admin preview reuses the exact same rendering with draft data.
- Contact details pass through `publicContact` before publishing and in `getPublicSite`, so unverified values never reach visitors or page source.
- Admin writes use the browser client under RLS (`has_role(auth.uid(),'admin')`); the service-role client is used only for enquiry inserts (rate limiting) and the media route, loaded inside the handler.
- Images are in the private `site-media` bucket (storage reads are admin-only) and served by `/api/public/media/$file`, which only serves flat `<uuid>.<ext>` names registered in `media`, because the workspace blocks public buckets.
- Visitors can read `media` rows only when a published `site_content` row references them via `logo_id`, `hero_image_id` or `image_id`; when adding a new image field, add its key to that policy and to `referencedMediaIds`.
- The first auth user ever created is made admin by a trigger; later sign-ups get no role, so never grant roles from client code or user metadata.
- Business rules (validation, spam limits, contact visibility, upload limits) live in plain modules under `src/lib` and are covered by `src/test/business-rules.test.ts`.
- Operator documentation lives in `docs/OPERATIONS.md`; update it when setup, security or deployment steps change.
