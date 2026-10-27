DROP POLICY IF EXISTS "Site media is readable" ON storage.objects;

CREATE POLICY "Admins read site media" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'site-media' AND public.has_role(auth.uid(), 'admin'));