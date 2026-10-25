import { z } from "zod";

export const ENQUIRY_STATUSES = ["new", "in_progress", "responded", "closed", "spam"] as const;
export type EnquiryStatus = (typeof ENQUIRY_STATUSES)[number];

export const STATUS_LABELS: Record<EnquiryStatus, string> = {
  new: "New",
  in_progress: "In progress",
  responded: "Responded",
  closed: "Closed",
  spam: "Spam",
};

/** Submissions faster than this after the form loads are treated as bots. */
export const MIN_FILL_MS = 3000;
/** Max enquiries accepted from one network address per hour. */
export const MAX_PER_HOUR = 5;

export const enquirySchema = z.object({
  name: z.string().trim().min(2, "Please enter your name.").max(100, "Name is too long."),
  business_name: z.string().trim().max(150, "Business name is too long.").default(""),
  email: z
    .string()
    .trim()
    .min(1, "Please enter your email.")
    .email("Please enter a valid email address.")
    .max(255, "Email is too long."),
  phone: z
    .string()
    .trim()
    .max(30, "Phone number is too long.")
    .refine((v) => v === "" || /^\+?[\d\s()-]{8,30}$/.test(v), "Please enter a valid phone number.")
    .default(""),
  service: z.string().trim().max(150).default(""),
  message: z
    .string()
    .trim()
    .min(10, "Please tell us a little more (at least 10 characters).")
    .max(2000, "Message must be under 2000 characters."),
  // Spam traps: `website` must stay empty; `started_at` is when the form was shown.
  website: z.string().max(0, "Spam detected.").default(""),
  started_at: z.number().int().positive(),
});

export type EnquiryInput = z.input<typeof enquirySchema>;

export type SpamCheck = { ok: true } | { ok: false; reason: string };

export function checkTiming(startedAt: number, now: number): SpamCheck {
  if (now - startedAt < MIN_FILL_MS) return { ok: false, reason: "too_fast" };
  if (now - startedAt > 24 * 60 * 60 * 1000) return { ok: false, reason: "expired" };
  return { ok: true };
}
