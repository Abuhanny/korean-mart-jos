-- =========================================================
-- Korea Mart Jos — Image uploads (Supabase Storage)
--
-- One shared public bucket, organized by folder prefix
-- (products/, categories/, experiences/, activities/,
-- promotions/, homepage/). Public read (storefront needs to
-- display images to anonymous visitors); only staff/admin can
-- upload, replace, or delete files.
-- =========================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'media',
  'media',
  true,
  5242880, -- 5MB
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Anyone (including anonymous storefront visitors) can view/download
-- images in this bucket — that's required for product photos etc. to
-- render on the public site.
create policy "media: public read"
on storage.objects for select
using (bucket_id = 'media');

-- Only staff/admin (rows in `profiles`, checked via the existing
-- is_staff() helper from 0001_init.sql) can upload, replace, or remove
-- files. Guests/customers never get write access to storage.
create policy "media: staff upload"
on storage.objects for insert
with check (bucket_id = 'media' and is_staff());

create policy "media: staff update"
on storage.objects for update
using (bucket_id = 'media' and is_staff());

create policy "media: staff delete"
on storage.objects for delete
using (bucket_id = 'media' and is_staff());
