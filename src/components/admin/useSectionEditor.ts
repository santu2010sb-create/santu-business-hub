import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { errorMessage, loadSection, publishSection, publishable, saveDraft } from "@/lib/admin-api";
import type { SectionKey, SectionMap } from "@/lib/content";

/** Shared state for editing one content section with draft / publish. */
export function useSectionEditor<K extends SectionKey>(key: K) {
  const qc = useQueryClient();
  const query = useQuery({ queryKey: ["admin", "section", key], queryFn: () => loadSection(key) });
  const [value, setValue] = useState<SectionMap[K] | null>(null);

  useEffect(() => {
    if (query.data && value === null) setValue(query.data.draft);
  }, [query.data, value]);

  const savedDraft = query.data ? JSON.stringify(query.data.draft) : "";
  const savedDraftLive = query.data ? JSON.stringify(publishable(key, query.data.draft)) : "";
  const published = query.data ? JSON.stringify(query.data.published) : "";
  const current = value ? JSON.stringify(value) : "";
  const state = useMemo(() => {
    if (!value) return "loading" as const;
    if (current !== savedDraft) return "unsaved" as const;
    if (savedDraftLive !== published) return "draft" as const;
    return "live" as const;
  }, [value, current, savedDraft, savedDraftLive, published]);

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["admin", "section", key] });
    qc.invalidateQueries({ queryKey: ["site"] });
  };

  const save = useMutation({
    mutationFn: (v: SectionMap[K]) => saveDraft(key, v),
    onSuccess: () => {
      toast.success("Draft saved");
      refresh();
    },
    onError: (e) => toast.error(errorMessage(e)),
  });

  const publish = useMutation({
    mutationFn: (v: SectionMap[K]) => publishSection(key, v),
    onSuccess: () => {
      toast.success("Published to the website");
      refresh();
    },
    onError: (e) => toast.error(errorMessage(e)),
  });

  return {
    query,
    value,
    setValue,
    state,
    save,
    publish,
    discard: () => query.data && setValue(query.data.published),
    published: query.data?.published,
  };
}
