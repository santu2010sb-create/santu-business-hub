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
  slip_items: string;
  facts: string;
  why_points: string;
  founder_name: string;
  founder_role: string;
  founder_body: string;
  founder_quote: string;
  founder_values: string;
  founder_image_id: string | null;
  process_title: string;
  process_steps: string;
  pricing_title: string;
  pricing_intro: string;
  pricing_monthly: string;
  pricing_note: string;
  pricing_creative: string;
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
    slip_items:
      "Reply to customer emails | ADMIN\nEnter this month's invoices | DATA\nFormat the client proposal | DOCS\nUpdate online business listing | DIGITAL\nDesign the festival offer poster | DESIGN",
    facts:
      "10 | services under one roof\n6 | back-office tasks we take off your desk\n4 | creative services: web, poster, video, audio\n1 | team for both admin and creative work",
    why_points:
      "Built for small businesses | Support sized for owners and small teams, not big departments.\nAdmin and data, done carefully | Accurate records, organised files and tidy documents you can find later.\nCreative work under one roof | Websites, posters, video ads and audio from the same team.\nTell us what you need | If a task is not on the list, describe it and we will discuss options.",
    founder_name: "Santu Narayan Bose",
    founder_role: "Founder, Santu Business Services",
    founder_body:
      "I am Santu Narayan Bose, Founder of Santu Business Services, dedicated to helping businesses grow through reliable back-office and digital support services.\n\nWith a commitment to professionalism, transparency and personalised service, I aim to simplify everyday business operations.",
    founder_quote: "Your business deserves dependable support, honest service and a partner you can trust.",
    founder_values: "Professionalism, Transparency, Personalised service",
    founder_image_id: null,
    process_title: "From first message to handed-off",
    process_steps:
      "Describe the tasks | Tell us which tasks are eating your time. Rough notes are fine.\nWe get back to you | We discuss what support fits and how we would handle it.\nAgree the scope | You confirm what is included before work begins.\nWe take it on | Work is done and delivered while you get back to your customers.",
    pricing_title: "Simple prices, agreed before we start",
    pricing_intro:
      "These are starting points. We confirm the final price in writing after we agree the scope with you.",
    pricing_monthly:
      "Starter | ₹2,999 | / month | 20 hours a month | Admin and email support; Data entry and documents; Hours can be split across tasks\n*Growth | ₹5,999 | / month | 50 hours a month | Everything in Starter; Billing, invoices and reports; A better rate per hour\nBusiness | ₹9,999 | / month | 100 hours a month | Everything in Growth; Back-office operations and customer support; The best rate per hour",
    pricing_note: "Need fewer hours, or just a one-off task? Ask for a per-task quote.",
    pricing_creative:
      "Poster or social creative | ₹200 | per design\nWebsite, up to 5 pages | ₹3,999 | one time\nVideo advertisement | ₹999 | short video\nAudio jingle | ₹999 | per jingle",
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
  return [
    sections.branding.logo_id,
    sections.home.hero_image_id,
    sections.home.founder_image_id,
    sections.about.image_id,
  ].filter(
    (v): v is string => !!v,
  );
}

/** Split "a | b | c" lines into trimmed cell arrays, skipping blank lines. */
export function rows(text: string): string[][] {
  return text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => l.split("|").map((c) => c.trim()));
}

export type PricePlan = { name: string; amount: string; per: string; hours: string; points: string[]; featured: boolean };

/** Parse pricing lines; a leading "*" marks the highlighted plan. */
export function pricePlans(text: string): PricePlan[] {
  return rows(text).map(([name = "", amount = "", per = "", hours = "", points = ""]) => ({
    name: name.replace(/^\*/, "").trim(),
    featured: name.startsWith("*"),
    amount,
    per,
    hours,
    points: points.split(";").map((p) => p.trim()).filter(Boolean),
  }));
}

/** Split long-form text into paragraphs on blank lines. */
export function paragraphs(text: string): string[] {
  return text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}
