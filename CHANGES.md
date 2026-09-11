# Add TikTok, YouTube, X (Twitter) Social Links — What Changed

## How to apply

1. Copy all 8 files into your project at the same paths (1 new, 7 modified).
2. Run `supabase/migrations/0005_social_links.sql` in Supabase SQL Editor (after 0001–0004).
3. No new environment variables. Redeploy when ready.

## What's new

- **Settings** page now has fields for TikTok, YouTube, and X (Twitter) URLs, alongside the existing
  Instagram and Facebook fields.
- The **footer** (every page) and the **Contact page** now show icons for all five platforms — only the ones
  you've actually filled in appear, so leaving a field blank just hides that icon rather than showing a broken
  link.
- TikTok and X don't have official icons in the icon library this project uses (lucide-react), so
  `src/components/site/brand-icons.tsx` adds two small custom SVG icons for those two; Instagram, Facebook, and
  YouTube use the existing icon library as before.

## Files in this update

**New:**
- `supabase/migrations/0005_social_links.sql`
- `src/components/site/brand-icons.tsx`

**Modified:**
- `src/lib/types.ts` — added `tiktok_url`, `youtube_url`, `twitter_url` fields
- `src/lib/data/settings.ts` — fallback defaults for the new fields
- `src/lib/validations/admin.ts` — validation for the new fields
- `src/components/admin/settings-form.tsx` — new input fields in the Settings page
- `src/components/site/footer.tsx` — shows all 5 social icons when set
- `src/app/(site)/contact/page.tsx` — new "Follow Us" section with all 5 icons
