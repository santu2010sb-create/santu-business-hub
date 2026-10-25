-- Website images are public content; they are served through the app's media route.
CREATE POLICY "Site media is readable" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'site-media');

CREATE POLICY "Admins upload site media" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'site-media'
    AND public.has_role(auth.uid(), 'admin')
    AND lower(storage.extension(name)) IN ('png','jpg','jpeg','webp')
  );

CREATE POLICY "Admins update site media" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'site-media' AND public.has_role(auth.uid(), 'admin'))
  WITH CHECK (
    bucket_id = 'site-media'
    AND public.has_role(auth.uid(), 'admin')
    AND lower(storage.extension(name)) IN ('png','jpg','jpeg','webp')
  );

CREATE POLICY "Admins delete site media" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'site-media' AND public.has_role(auth.uid(), 'admin'));
