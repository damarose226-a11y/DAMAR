SELECT
  to_regclass('public.admins') AS admins,
  to_regclass('public.products') AS products,
  to_regclass('public.product_variants') AS product_variants,
  to_regclass('public.offers') AS offers,
  to_regclass('public.settings') AS settings,
  to_regclass('public.sessions') AS sessions,
  to_regclass('public.auth_attempts') AS auth_attempts;
