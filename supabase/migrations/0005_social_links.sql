-- =========================================================
-- Korea Mart Jos — Additional social links
-- (Instagram and Facebook already existed since 0001_init.sql)
-- =========================================================

alter table business_settings
  add column tiktok_url text,
  add column youtube_url text,
  add column twitter_url text;
