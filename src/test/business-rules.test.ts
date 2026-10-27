import { describe, expect, it } from "vitest";
import { DEFAULT_CONTENT, mergeSection } from "@/lib/content";
import { validateContactValue, visibleContact, whatsappLink } from "@/lib/contact";
import { checkTiming, enquirySchema, MAX_PER_HOUR } from "@/lib/enquiry-schema";
import { MAX_IMAGE_BYTES, validateImageFile } from "@/lib/media-validation";

const valid = {
  name: "Asha Roy",
  business_name: "Roy Traders",
  email: "asha@example.com",
  phone: "+91 98300 00000",
  service: "Data Entry",
  message: "I need help keeping my sales records up to date.",
  website: "",
  started_at: 1,
};

describe("enquiry validation", () => {
  it("accepts a complete enquiry", () => {
    expect(enquirySchema.safeParse(valid).success).toBe(true);
  });
  it("requires a name", () => {
    expect(enquirySchema.safeParse({ ...valid, name: " " }).success).toBe(false);
  });
  it("requires a valid email", () => {
    expect(enquirySchema.safeParse({ ...valid, email: "not-an-email" }).success).toBe(false);
  });
  it("rejects a filled honeypot field", () => {
    expect(enquirySchema.safeParse({ ...valid, website: "http://spam.example" }).success).toBe(false);
  });
  it("rejects forms submitted under 3 seconds after loading", () => {
    expect(checkTiming(10_000, 11_000).ok).toBe(false);
    expect(checkTiming(10_000, 14_000).ok).toBe(true);
  });
  it("limits each network address to 5 enquiries per hour", () => {
    expect(MAX_PER_HOUR).toBe(5);
  });
});

describe("contact visibility", () => {
  const contact = mergeSection("contact", {
    email: { value: "hello@example.com", verified: false },
    phone: { value: "+91 98300 00000", verified: true },
    whatsapp: { value: "", verified: true },
  });
  it("hides unverified details", () => {
    expect(visibleContact(contact, "email")).toBeNull();
  });
  it("shows verified, filled-in details", () => {
    expect(visibleContact(contact, "phone")).toBe("+91 98300 00000");
  });
  it("hides verified but empty details", () => {
    expect(visibleContact(contact, "whatsapp")).toBeNull();
  });
  it("starts with every contact detail unverified", () => {
    for (const key of ["email", "phone", "whatsapp", "address"] as const) {
      expect(DEFAULT_CONTENT.contact[key].verified).toBe(false);
    }
  });
  it("builds WhatsApp links from digits only", () => {
    expect(whatsappLink("+91 98300-00000")).toBe("https://wa.me/919830000000");
  });
  it("requires https for social links", () => {
    expect(validateContactValue("facebook", "http://facebook.com/x")).not.toBeNull();
    expect(validateContactValue("facebook", "https://facebook.com/x")).toBeNull();
  });
});

describe("image upload rules", () => {
  it("accepts PNG, JPG and WebP up to 2 MB", () => {
    expect(validateImageFile({ type: "image/jpeg", size: MAX_IMAGE_BYTES }).ok).toBe(true);
    expect(validateImageFile({ type: "image/webp", size: 1000 }).ok).toBe(true);
  });
  it("rejects files over 2 MB", () => {
    expect(validateImageFile({ type: "image/png", size: MAX_IMAGE_BYTES + 1 }).ok).toBe(false);
  });
  it("rejects SVG and other types", () => {
    expect(validateImageFile({ type: "image/svg+xml", size: 1000 }).ok).toBe(false);
    expect(validateImageFile({ type: "application/pdf", size: 1000 }).ok).toBe(false);
  });
});

describe("published contact data", () => {
  it("blanks unverified values so they never reach visitors", async () => {
    const { publicContact } = await import("@/lib/contact");
    const c = mergeSection("contact", {
      email: { value: "secret@example.com", verified: false },
      phone: { value: "+91 98300 00000", verified: true },
    });
    const pub = publicContact(c);
    expect(pub.email.value).toBe("");
    expect(pub.phone.value).toBe("+91 98300 00000");
  });
});
