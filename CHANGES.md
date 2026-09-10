# Drag-and-Drop Image Upload — What Changed

## How to apply

1. Copy all 8 files into your project at the same paths, overwriting the 6 existing form files.
2. Run `supabase/migrations/0004_storage.sql` in your Supabase SQL Editor (after 0001, 0002, 0003).
   This creates a public `media` Storage bucket with a 5MB file size limit, restricted to JPEG/PNG/WEBP/GIF,
   and sets up permissions so only logged-in staff/admin can upload — anyone can view (required for images to
   show on the public site).
3. No new environment variables. Redeploy after applying.

## What changed for admins

Every place you previously had to paste an image URL now has a proper upload area instead:

- **Products**, **Categories**, **Experiences**, **Activities**, **Promotions** — each admin form
- **Settings** → Homepage hero image

You can either:
- **Drag and drop** an image file onto the box, or
- **Click the box** to open your device's file picker, or
- Click **"Paste a URL instead"** if you'd rather link to an image hosted elsewhere (kept as a fallback for
  flexibility)

Images upload directly to Supabase Storage, and the resulting public URL is filled in automatically. A preview
shows once uploaded, with a small × button to remove/replace it.

## Validation

- Only JPEG, PNG, WEBP, and GIF are accepted — enforced both in the browser (immediate feedback) and at the
  storage bucket level (so it can't be bypassed even by someone crafting a direct API request).
- Max file size: 5MB, same enforcement at both levels.

## Files in this update

**New:**
- `supabase/migrations/0004_storage.sql` — Storage bucket + access policies
- `src/components/admin/image-upload.tsx` — the reusable upload component

**Modified (each just swaps a plain "Image URL" text field for `<ImageUpload />`):**
- `src/components/admin/product-form-dialog.tsx`
- `src/components/admin/category-form-dialog.tsx`
- `src/components/admin/experience-form-dialog.tsx`
- `src/components/admin/activity-form-dialog.tsx`
- `src/components/admin/promotion-components.tsx`
- `src/components/admin/settings-form.tsx`
