// Content model for every editable website section.
// Defaults mirror the seed data so the site still renders if a field is missing.

export type SectionKey = "home" | "about" | "footer" | "contact" | "branding";

export type ContactField = { value: string; verified: boolean };

export type BrandingContent = {
  business_name: string;
  tagline: string;
  location: string;
  logo_id: string | null;
};

export type HomeContent = {
  hero_eyebrow: string;
  hero_title: string;
  hero_subtitle: string;
  primary_cta_label: string;
  secondary_cta_label: string;
  hero_image_id: string | null;
  intro_title: string;
  intro_body: string;
  services_title: string;
  services_intro: string;
  cta_title: string;
  cta_body: string;
  cta_label: string;
};

export type AboutContent = {
  title: string;
  intro: string;
  body: string;
  image_id: string | null;
  focus_title: string;
  focus_body: string;
};

export type FooterContent = { blurb: string; note: string };

export const CONTACT_KEYS = [
  "email",
  "phone",
  "whatsapp",
  "address",
  "facebook",
  "instagram",
  "linkedin",
  "x",
  "youtube",
] as const;
export type ContactKey = (typeof CONTACT_KEYS)[number];

export type ContactContent = { intro: string } & Record<ContactKey, ContactField>;

export type SectionMap = {
  home: HomeContent;
  about: AboutContent;
  footer: FooterContent;
  contact: ContactContent;
  branding: BrandingContent;
};

const emptyField = (): ContactField => ({ value: "", verified: false });

export const DEFAULT_CONTENT: SectionMap = {
  branding: {
    business_name: "SANTU BUSINESS SERVICES",
    tagline: "YOUR OUTSOURCED OPERATIONS PARTNER",
    location: "Kolkata, West Bengal, India",
    logo_id: null,
  },
  home: {
    hero_eyebrow: "YOUR OUTSOURCED OPERATIONS PARTNER",
    hero_title: "More Focus on Growth. Less Time on Busywork.",
    hero_subtitle:
      "Reliable back-office support for small businesses—so you can spend less time managing paperwork and more time moving your business forward.",
    primary_cta_label: "Send an enquiry",
    secondary_cta_label: "Explore services",
    hero_image_id: null,
    intro_title: "Back-office support, handled with care",
    intro_body:
      "Paperwork, data and day-to-day admin can quietly take over a small business. SANTU BUSINESS SERVICES takes on that routine work so you and your team can focus on customers and growth.",
    services_title: "How we can help",
    services_intro: "Flexible support for the tasks that keep your business running.",
    cta_title: "Ready to hand off the busywork?",
    cta_body:
      "Tell us about the tasks taking up your time, and we will get back to you to talk through how we can help.",
    cta_label: "Contact us",
  },
  about: {
    title: "About SANTU BUSINESS SERVICES",
    intro: "Your outsourced operations partner, based in Kolkata.",
    body: "",
    image_id: null,
    focus_title: "What we focus on",
    focus_body: "",
  },
  footer: { blurb: "Reliable back-office support for small businesses.", note: "" },
  contact: {
    intro: "Tell us a little about your business and the support you need. We will get back to you.",
    email: emptyField(),
    phone: emptyField(),
    whatsapp: emptyField(),
    address: emptyField(),
    facebook: emptyField(),
    instagram: emptyField(),
    linkedin: emptyField(),
    x: emptyField(),
    youtube: emptyField(),
  },
};

export const SECTION_KEYS: SectionKey[] = ["home", "about", "footer", "contact", "branding"];

/** Merge stored JSON over defaults, keeping only known keys and correct value types. */
export function mergeSection<K extends SectionKey>(key: K, raw: unknown): SectionMap[K] {
  const base = DEFAULT_CONTENT[key] as Record<string, unknown>;
  const src = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const out: Record<string, unknown> = {};
  for (const [k, def] of Object.entries(base)) {
    const v = src[k];
    if (def !== null && typeof def === "object") {
      const f = v && typeof v === "object" ? (v as Record<string, unknown>) : {};
      out[k] = {
        value: typeof f["value"] === "string" ? f["value"] : "",
        verified: f["verified"] === true,
      };
    } else if (k.endsWith("_id")) {
      out[k] = typeof v === "string" && v.length > 0 ? v : null;
    } else {
      out[k] = typeof v === "string" ? v : def;
    }
  }
  return out as SectionMap[K];
}

export type Service = {
  id: string;
  title: string;
  summary: string;
  details: string;
  icon: string;
  sort_order: number;
  published: boolean;
};

export type Faq = {
  id: string;
  question: string;
  answer: string;
  sort_order: number;
  published: boolean;
};

export type MediaItem = {
  id: string;
  path: string;
  alt_text: string;
  mime_type: string;
  size_bytes: number;
  file_name: string;
  created_at: string;
};

export type SiteData = SectionMap & {
  services: Service[];
  faqs: Faq[];
  media: Record<string, MediaItem>;
};

/** Public URL for an uploaded image, served by the site's own media route. */
export function mediaUrl(path: string): string {
  return `/api/public/media/${encodeURIComponent(path)}`;
}

/** Collect every media id referenced by sections, so only those rows are loaded. */
export function referencedMediaIds(sections: SectionMap): string[] {
  return [sections.branding.logo_id, sections.home.hero_image_id, sections.about.image_id].filter(
    (v): v is string => !!v,
  );
}

/** Split long-form text into paragraphs on blank lines. */
export function paragraphs(text: string): string[] {
  return text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}
