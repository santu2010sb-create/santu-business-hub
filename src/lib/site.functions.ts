import { createServerFn } from "@tanstack/react-start";
import { queryOptions } from "@tanstack/react-query";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import {
  SECTION_KEYS,
  mergeSection,
  referencedMediaIds,
  type MediaItem,
  type SectionMap,
  type SiteData,
} from "./content";
import { publicContact } from "./contact";

/** Read-only client using the publishable key; RLS limits it to published rows. */
function publicClient() {
  const url = process.env["SUPABASE_URL"]!;
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, storage: undefined },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) {
          h.delete("Authorization");
        }
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

export const getPublicSite = createServerFn({ method: "GET" }).handler(
  async (): Promise<SiteData> => {
    const sb = publicClient();
    const [content, services, faqs] = await Promise.all([
      sb.from("site_content").select("section, data").eq("status", "published"),
      sb
        .from("services")
        .select("id, title, summary, details, icon, sort_order, published")
        .eq("published", true)
        .order("sort_order"),
      sb
        .from("faqs")
        .select("id, question, answer, sort_order, published")
        .eq("published", true)
        .order("sort_order"),
    ]);
    if (content.error) throw new Error("Could not load site content");

    const sections = {} as SectionMap;
    for (const key of SECTION_KEYS) {
      const row = content.data?.find((r) => r.section === key);
      (sections as Record<string, unknown>)[key] = mergeSection(key, row?.data);
    }
    sections.contact = publicContact(sections.contact);

    const ids = referencedMediaIds(sections);
    const media: Record<string, MediaItem> = {};
    if (ids.length) {
      const { data } = await sb
        .from("media")
        .select("id, path, alt_text, mime_type, size_bytes, file_name, created_at")
        .in("id", ids);
      for (const m of data ?? []) media[m.id] = m;
    }

    return {
      ...sections,
      services: services.data ?? [],
      faqs: faqs.data ?? [],
      media,
    };
  },
);

export const publicSiteQuery = queryOptions({
  queryKey: ["site", "public"],
  queryFn: () => getPublicSite(),
  staleTime: 30_000,
});
