-- ===== Roles =====
CREATE TYPE public.app_role AS ENUM ('admin');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE OR REPLACE FUNCTION public.admin_exists()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin')
$$;
GRANT EXECUTE ON FUNCTION public.admin_exists() TO anon, authenticated;

-- First account ever created becomes the owner/admin. Later sign-ups get no role.
CREATE OR REPLACE FUNCTION public.assign_first_admin()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  LOCK TABLE public.user_roles IN SHARE ROW EXCLUSIVE MODE;
  IF NOT EXISTS (SELECT 1 FROM public.user_roles WHERE role = 'admin') THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin');
  END IF;
  RETURN NEW;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.assign_first_admin() FROM PUBLIC, anon, authenticated;

CREATE TRIGGER on_auth_user_created_assign_admin
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.assign_first_admin();

-- ===== Shared updated_at trigger =====
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- ===== Site content (draft + published copies per section) =====
CREATE TABLE public.site_content (
  section text NOT NULL CHECK (section IN ('home','about','footer','contact','branding')),
  status text NOT NULL CHECK (status IN ('draft','published')),
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid,
  PRIMARY KEY (section, status)
);
GRANT SELECT ON public.site_content TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.site_content TO authenticated;
GRANT ALL ON public.site_content TO service_role;
ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published content is public" ON public.site_content
  FOR SELECT TO anon, authenticated USING (status = 'published');
CREATE POLICY "Admins read all content" ON public.site_content
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins insert content" ON public.site_content
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update content" ON public.site_content
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete content" ON public.site_content
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER site_content_touch BEFORE UPDATE ON public.site_content
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ===== Services =====
CREATE TABLE public.services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL CHECK (char_length(title) BETWEEN 1 AND 120),
  summary text NOT NULL DEFAULT '' CHECK (char_length(summary) <= 400),
  details text NOT NULL DEFAULT '' CHECK (char_length(details) <= 3000),
  icon text NOT NULL DEFAULT 'briefcase',
  sort_order integer NOT NULL DEFAULT 0,
  published boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.services TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.services TO authenticated;
GRANT ALL ON public.services TO service_role;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published services are public" ON public.services
  FOR SELECT TO anon, authenticated USING (published = true);
CREATE POLICY "Admins read all services" ON public.services
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins insert services" ON public.services
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update services" ON public.services
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete services" ON public.services
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER services_touch BEFORE UPDATE ON public.services
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ===== FAQs =====
CREATE TABLE public.faqs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question text NOT NULL CHECK (char_length(question) BETWEEN 1 AND 300),
  answer text NOT NULL DEFAULT '' CHECK (char_length(answer) <= 3000),
  sort_order integer NOT NULL DEFAULT 0,
  published boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.faqs TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.faqs TO authenticated;
GRANT ALL ON public.faqs TO service_role;
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published FAQs are public" ON public.faqs
  FOR SELECT TO anon, authenticated USING (published = true);
CREATE POLICY "Admins read all FAQs" ON public.faqs
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins insert FAQs" ON public.faqs
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update FAQs" ON public.faqs
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete FAQs" ON public.faqs
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER faqs_touch BEFORE UPDATE ON public.faqs
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ===== Media library =====
CREATE TABLE public.media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  path text NOT NULL UNIQUE,
  file_name text NOT NULL DEFAULT '',
  alt_text text NOT NULL DEFAULT '' CHECK (char_length(alt_text) <= 250),
  mime_type text NOT NULL CHECK (mime_type IN ('image/png','image/jpeg','image/webp')),
  size_bytes integer NOT NULL CHECK (size_bytes > 0 AND size_bytes <= 2097152),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.media TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.media TO authenticated;
GRANT ALL ON public.media TO service_role;
ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Media metadata is public" ON public.media
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins insert media" ON public.media
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update media" ON public.media
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete media" ON public.media
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER media_touch BEFORE UPDATE ON public.media
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ===== Enquiries (private) =====
CREATE TYPE public.enquiry_status AS ENUM ('new','in_progress','responded','closed','spam');

CREATE TABLE public.enquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL CHECK (char_length(name) BETWEEN 1 AND 100),
  business_name text NOT NULL DEFAULT '' CHECK (char_length(business_name) <= 150),
  email text NOT NULL CHECK (char_length(email) BETWEEN 3 AND 255),
  phone text NOT NULL DEFAULT '' CHECK (char_length(phone) <= 30),
  service text NOT NULL DEFAULT '' CHECK (char_length(service) <= 150),
  message text NOT NULL CHECK (char_length(message) BETWEEN 1 AND 2000),
  status public.enquiry_status NOT NULL DEFAULT 'new',
  ip_hash text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX enquiries_created_at_idx ON public.enquiries (created_at DESC);
CREATE INDEX enquiries_ip_hash_idx ON public.enquiries (ip_hash, created_at DESC);
GRANT SELECT, UPDATE, DELETE ON public.enquiries TO authenticated;
GRANT ALL ON public.enquiries TO service_role;
ALTER TABLE public.enquiries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read enquiries" ON public.enquiries
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update enquiries" ON public.enquiries
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete enquiries" ON public.enquiries
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER enquiries_touch BEFORE UPDATE ON public.enquiries
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ===== Seed content =====
INSERT INTO public.site_content (section, status, data)
SELECT s.section, st.status, s.data
FROM (VALUES
  ('branding', '{"business_name":"SANTU BUSINESS SERVICES","tagline":"YOUR OUTSOURCED OPERATIONS PARTNER","location":"Kolkata, West Bengal, India","logo_id":null}'::jsonb),
  ('home', '{"hero_eyebrow":"YOUR OUTSOURCED OPERATIONS PARTNER","hero_title":"More Focus on Growth. Less Time on Busywork.","hero_subtitle":"Reliable back-office support for small businesses—so you can spend less time managing paperwork and more time moving your business forward.","primary_cta_label":"Send an enquiry","secondary_cta_label":"Explore services","hero_image_id":null,"intro_title":"Back-office support, handled with care","intro_body":"Paperwork, data and day-to-day admin can quietly take over a small business. SANTU BUSINESS SERVICES takes on that routine work so you and your team can focus on customers and growth.","services_title":"How we can help","services_intro":"Flexible support for the tasks that keep your business running.","cta_title":"Ready to hand off the busywork?","cta_body":"Tell us about the tasks taking up your time, and we will get back to you to talk through how we can help.","cta_label":"Contact us"}'::jsonb),
  ('about', '{"title":"About SANTU BUSINESS SERVICES","intro":"Your outsourced operations partner, based in Kolkata.","body":"SANTU BUSINESS SERVICES provides back-office support for small businesses. We help with the administrative, data and documentation work that has to be done right but takes time away from running and growing your business.\n\nOur aim is simple: to be a dependable extension of your team, so you can spend less time managing paperwork and more time moving your business forward.","image_id":null,"focus_title":"What we focus on","focus_body":"Clear communication, careful handling of your information, and work delivered the way you need it."}'::jsonb),
  ('footer', '{"blurb":"Reliable back-office support for small businesses.","note":""}'::jsonb),
  ('contact', '{"intro":"Tell us a little about your business and the support you need. We will get back to you.","email":{"value":"","verified":false},"phone":{"value":"","verified":false},"whatsapp":{"value":"","verified":false},"address":{"value":"","verified":false},"facebook":{"value":"","verified":false},"instagram":{"value":"","verified":false},"linkedin":{"value":"","verified":false},"x":{"value":"","verified":false},"youtube":{"value":"","verified":false}}'::jsonb)
) AS s(section, data)
CROSS JOIN (VALUES ('draft'), ('published')) AS st(status);

INSERT INTO public.services (title, summary, icon, sort_order, published) VALUES
  ('Administrative Support', 'Day-to-day admin such as email and calendar management, scheduling, record keeping and correspondence.', 'clipboard', 1, true),
  ('Data Entry', 'Accurate entry, updating and organisation of business data in spreadsheets, systems and records.', 'keyboard', 2, true),
  ('Documentation Assistance', 'Help preparing, formatting, organising and maintaining business documents and files.', 'file', 3, true),
  ('Digital Business Assistance', 'Support with online tasks such as managing listings, simple content updates and digital records.', 'monitor', 4, true),
  ('Back-Office Operations', 'Routine operational work behind the scenes, so your processes keep moving smoothly.', 'building', 5, true),
  ('Custom Business Support', 'Have a task that does not fit a category? Tell us what you need and we will discuss how we can help.', 'puzzle', 6, true);

INSERT INTO public.faqs (question, answer, sort_order, published) VALUES
  ('Which services do you offer?', 'We offer administrative support, data entry, documentation assistance, digital business assistance, back-office operations and custom business support. See the Services page for details.', 1, true),
  ('Who do you work with?', 'We support small businesses that want reliable help with back-office and administrative work.', 2, true),
  ('Where are you based?', 'We are based in Kolkata, West Bengal, India.', 3, true),
  ('How do I get started?', 'Send us an enquiry through the Contact page with a short description of what you need. We will review it and get back to you.', 4, true);
