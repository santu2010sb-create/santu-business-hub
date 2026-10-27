// Browser-side admin data access. Every call runs as the signed-in user, and
// database policies only allow these writes for accounts with the admin role.
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";
import {
  SECTION_KEYS,
  mergeSection,
  referencedMediaIds,
  type MediaItem,
  type SectionKey,
  type SectionMap,
  type SiteData,
} from "./content";
import { validateImageFile } from "./media-validation";
import { publicContact } from "./contact";
import type { ContactContent } from "./content";

export async function loadSection<K extends SectionKey>(key: K) {
  const { data, error } = await supabase
    .from("site_content")
    .select("status, data, updated_at")
    .eq("section", key);
  if (error) throw error;
  const draftRow = data.find((r) => r.status === "draft");
  const pubRow = data.find((r) => r.status === "published");
  return {
    draft: mergeSection(key, draftRow?.data ?? pubRow?.data),
    published: mergeSection(key, pubRow?.data),
    draftUpdatedAt: draftRow?.updated_at ?? null,
    publishedUpdatedAt: pubRow?.updated_at ?? null,
  };
}

async function upsertSection(key: SectionKey, status: "draft" | "published", value: unknown) {
  const { data: u } = await supabase.auth.getUser();
  const { error } = await supabase.from("site_content").upsert(
    { section: key, status, data: value as Json, updated_by: u.user?.id ?? null },
    { onConflict: "section,status" },
  );
  if (error) throw error;
}

export const saveDraft = (key: SectionKey, value: unknown) => upsertSection(key, "draft", value);

export async function publishSection(key: SectionKey, value: unknown) {
  await upsertSection(key, "draft", value);
  await upsertSection(key, "published", publishable(key, value));
}

/** What actually goes live for a section (contact strips unverified details). */
export function publishable(key: SectionKey, value: unknown): unknown {
  return key === "contact" ? publicContact(value as ContactContent) : value;
}

/** Assemble the whole site from drafts (falls back to published) for the preview screen. */
export async function loadDraftSite(): Promise<SiteData> {
  const [content, services, faqs] = await Promise.all([
    supabase.from("site_content").select("section, status, data"),
    supabase.from("services").select("id, title, summary, details, icon, sort_order, published").order("sort_order"),
    supabase.from("faqs").select("id, question, answer, sort_order, published").order("sort_order"),
  ]);
  if (content.error) throw content.error;
  const sections = {} as SectionMap;
  for (const key of SECTION_KEYS) {
    const draft = content.data.find((r) => r.section === key && r.status === "draft");
    const pub = content.data.find((r) => r.section === key && r.status === "published");
    (sections as Record<string, unknown>)[key] = mergeSection(key, draft?.data ?? pub?.data);
  }
  const ids = referencedMediaIds(sections);
  const media: Record<string, MediaItem> = {};
  if (ids.length) {
    const { data } = await supabase
      .from("media")
      .select("id, path, alt_text, mime_type, size_bytes, file_name, created_at")
      .in("id", ids);
    for (const m of data ?? []) media[m.id] = m;
  }
  return { ...sections, services: services.data ?? [], faqs: faqs.data ?? [], media };
}

export async function listMedia(): Promise<MediaItem[]> {
  const { data, error } = await supabase
    .from("media")
    .select("id, path, alt_text, mime_type, size_bytes, file_name, created_at")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function uploadMedia(file: File, altText: string): Promise<MediaItem> {
  const check = validateImageFile(file);
  if (!check.ok) throw new Error(check.error);
  const path = `${crypto.randomUUID()}.${check.ext}`;
  const up = await supabase.storage.from("site-media").upload(path, file, {
    contentType: file.type,
    cacheControl: "31536000",
    upsert: false,
  });
  if (up.error) throw new Error(up.error.message);
  const { data, error } = await supabase
    .from("media")
    .insert({
      path,
      file_name: file.name.slice(0, 200),
      alt_text: altText.trim().slice(0, 250),
      mime_type: file.type,
      size_bytes: file.size,
    })
    .select("id, path, alt_text, mime_type, size_bytes, file_name, created_at")
    .single();
  if (error) {
    await supabase.storage.from("site-media").remove([path]);
    throw error;
  }
  return data;
}

export async function deleteMedia(item: MediaItem) {
  const { error } = await supabase.from("media").delete().eq("id", item.id);
  if (error) throw error;
  await supabase.storage.from("site-media").remove([item.path]);
}

/** Section ids that currently reference a media item (draft or published). */
export async function mediaUsage(): Promise<Set<string>> {
  const { data } = await supabase.from("site_content").select("section, data");
  const used = new Set<string>();
  for (const row of data ?? []) {
    const d = (row.data ?? {}) as Record<string, unknown>;
    for (const k of ["logo_id", "hero_image_id", "image_id"]) {
      if (typeof d[k] === "string") used.add(d[k] as string);
    }
  }
  return used;
}

export function errorMessage(e: unknown): string {
  if (e && typeof e === "object" && "message" in e) return String((e as { message: unknown }).message);
  return "Something went wrong.";
}
