import { CONTACT_KEYS as CONTACT_KEY_LIST, type ContactContent, type ContactKey } from "./content";

export const CONTACT_LABELS: Record<ContactKey, string> = {
  email: "Business email",
  phone: "Phone",
  whatsapp: "WhatsApp number",
  address: "Address",
  facebook: "Facebook page URL",
  instagram: "Instagram profile URL",
  linkedin: "LinkedIn page URL",
  x: "X (Twitter) profile URL",
  youtube: "YouTube channel URL",
};

export const SOCIAL_KEYS = ["facebook", "instagram", "linkedin", "x", "youtube"] as const;

/** Only details that are both filled in AND marked verified by the owner are public. */
export function visibleContact(contact: ContactContent, key: ContactKey): string | null {
  const field = contact[key];
  if (!field || !field.verified) return null;
  const value = field.value.trim();
  return value.length > 0 ? value : null;
}

export function digitsOnly(value: string): string {
  return value.replace(/[^\d]/g, "");
}

export function whatsappLink(number: string): string {
  return `https://wa.me/${digitsOnly(number)}`;
}

export function telLink(number: string): string {
  const trimmed = number.trim();
  return `tel:${trimmed.startsWith("+") ? "+" : ""}${digitsOnly(trimmed)}`;
}

/** Validation for the admin contact settings form. Returns an error message or null. */
export function validateContactValue(key: ContactKey, value: string): string | null {
  const v = value.trim();
  if (!v) return null;
  if (key === "email") {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) && v.length <= 255
      ? null
      : "Enter a valid email address.";
  }
  if (key === "phone" || key === "whatsapp") {
    const d = digitsOnly(v);
    return /^\+?[\d\s()-]+$/.test(v) && d.length >= 8 && d.length <= 15
      ? null
      : "Enter a valid phone number, including the country code (e.g. +91).";
  }
  if (key === "address") return v.length <= 300 ? null : "Address is too long.";
  try {
    const url = new URL(v);
    return url.protocol === "https:" ? null : "Use a full link starting with https://";
  } catch {
    return "Use a full link starting with https://";
  }
}

/**
 * The copy of contact settings that may leave the admin area: unverified values
 * are blanked so they never reach the public database row or the page source.
 */
export function publicContact(contact: ContactContent): ContactContent {
  const out = { ...contact };
  for (const key of CONTACT_KEY_LIST) {
    const f = contact[key];
    out[key] = f.verified ? { ...f } : { value: "", verified: false };
  }
  return out;
}
