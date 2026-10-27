DROP POLICY IF EXISTS "Media metadata is public" ON public.media;

CREATE POLICY "Admins read all media" ON public.media
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Published media is public" ON public.media
  FOR SELECT TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.site_content sc
      WHERE sc.status = 'published'
        AND media.id::text IN (
          sc.data->>'logo_id',
          sc.data->>'hero_image_id',
          sc.data->>'image_id'
        )
    )
  );