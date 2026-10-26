import { Eye, Loader2, Save, Send, Undo2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const STATE_TEXT = {
  loading: { label: "Loading…", cls: "bg-muted text-muted-foreground" },
  unsaved: { label: "Unsaved changes", cls: "bg-warning text-warning-foreground" },
  draft: { label: "Draft saved — not yet live", cls: "bg-accent text-accent-foreground" },
  live: { label: "Live on website", cls: "bg-success text-success-foreground" },
} as const;

export function PublishBar({
  state,
  saving,
  publishing,
  onSave,
  onPublish,
  onPreview,
  onDiscard,
  canSave = true,
}: {
  state: keyof typeof STATE_TEXT;
  saving: boolean;
  publishing: boolean;
  onSave: () => void;
  onPublish: () => void;
  onPreview?: () => void;
  onDiscard: () => void;
  canSave?: boolean;
}) {
  const s = STATE_TEXT[state];
  return (
    <div className="sticky bottom-0 z-10 -mx-4 mt-8 border-t border-border bg-card/95 px-4 py-3 backdrop-blur md:mx-0 md:rounded-2xl md:border md:shadow-card">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <span className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${s.cls}`} role="status">
          {s.label}
        </span>
        <div className="flex flex-wrap gap-2">
          {state !== "live" && state !== "loading" && (
            <Button type="button" variant="ghost" size="sm" onClick={onDiscard} title="Revert to what's currently live">
              <Undo2 /> Revert to live
            </Button>
          )}
          <Button type="button" variant="outline" size="sm" onClick={onSave} disabled={!canSave || saving || state === "loading"}>
            {saving ? <Loader2 className="animate-spin" /> : <Save />} Save draft
          </Button>
          {onPreview && (
            <Button type="button" variant="outline" size="sm" onClick={onPreview} disabled={!canSave || saving || state === "loading"}>
              <Eye /> Preview
            </Button>
          )}
          <Button type="button" size="sm" onClick={onPublish} disabled={!canSave || publishing || state === "loading" || state === "live"}>
            {publishing ? <Loader2 className="animate-spin" /> : <Send />} Publish
          </Button>
        </div>
      </div>
    </div>
  );
}
