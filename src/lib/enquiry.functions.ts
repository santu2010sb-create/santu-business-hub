import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";
import { MAX_PER_HOUR, checkTiming, enquirySchema } from "./enquiry-schema";

async function sha256(text: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export type SubmitResult = { ok: true } | { ok: false; error: string };

/**
 * Public endpoint for the contact form. Validates input, rejects bots (honeypot +
 * fill-time) and rate-limits per network address before storing the enquiry.
 */
export const submitEnquiry = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => enquirySchema.parse(input))
  .handler(async ({ data }): Promise<SubmitResult> => {
    const timing = checkTiming(data.started_at, Date.now());
    if (!timing.ok) {
      return { ok: false, error: "Please take a moment to complete the form, then try again." };
    }

    const ip =
      getRequestHeader("cf-connecting-ip") ||
      getRequestHeader("x-forwarded-for")?.split(",")[0]?.trim() ||
      "unknown";
    const ipHash = await sha256(`sbs-enquiry:${ip}`);

    // Privileged insert: enquiries are never writable from the browser.
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count } = await supabaseAdmin
      .from("enquiries")
      .select("id", { count: "exact", head: true })
      .eq("ip_hash", ipHash)
      .gte("created_at", since);
    if ((count ?? 0) >= MAX_PER_HOUR) {
      return {
        ok: false,
        error: "We have received several enquiries from you recently. Please try again later.",
      };
    }

    const { error } = await supabaseAdmin.from("enquiries").insert({
      name: data.name,
      business_name: data.business_name,
      email: data.email,
      phone: data.phone,
      service: data.service,
      message: data.message,
      ip_hash: ipHash,
    });
    if (error) {
      console.error("enquiry insert failed", error.message);
      return { ok: false, error: "Something went wrong sending your enquiry. Please try again." };
    }
    return { ok: true };
  });
