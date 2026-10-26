import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ImageIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { listMedia } from "@/lib/admin-api";
import { mediaUrl } from "@/lib/content";
import { MediaUploader } from "./MediaUploader";

export const mediaListQuery = { queryKey: ["admin", "media"], queryFn: listMedia };

export function ImagePicker({
  value,
  onChange,
  emptyLabel = "No image selected",
}: {
  value: string | null;
  onChange: (id: string | null) => void;
  emptyLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const qc = useQueryClient();
  const { data: media = [] } = useQuery(mediaListQuery);
  const current = media.find((m) => m.id === value);

  return (
    <div className="flex flex-wrap items-center gap-4">
      <div className="grid size-24 place-items-center overflow-hidden rounded-xl border border-border bg-muted">
        {current ? (
          <img src={mediaUrl(current.path)} alt={current.alt_text} className="size-full object-contain" />
        ) : (
          <ImageIcon className="size-6 text-muted-foreground" aria-hidden />
        )}
      </div>
      <div className="grid gap-2">
        <p className="text-sm text-muted-foreground">{current ? current.alt_text || current.file_name : emptyLabel}</p>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => setOpen(true)}>
            {current ? "Replace" : "Choose image"}
          </Button>
          {value && (
            <Button type="button" variant="ghost" size="sm" onClick={() => onChange(null)}>
              <X /> Remove
            </Button>
          )}
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Choose an image</DialogTitle>
            <DialogDescription>Pick from your library or upload a new one.</DialogDescription>
          </DialogHeader>
          <div className="rounded-xl border border-border p-4">
            <MediaUploader
              onUploaded={(m) => {
                qc.invalidateQueries({ queryKey: ["admin", "media"] });
                onChange(m.id);
                setOpen(false);
              }}
            />
          </div>
          {media.length > 0 && (
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {media.map((m) => (
                <li key={m.id}>
                  <button
                    type="button"
                    onClick={() => {
                      onChange(m.id);
                      setOpen(false);
                    }}
                    className="block w-full overflow-hidden rounded-lg border-2 border-transparent bg-muted text-left hover:border-teal aria-pressed:border-navy"
                    aria-pressed={m.id === value}
                  >
                    <img src={mediaUrl(m.path)} alt={m.alt_text} className="aspect-square w-full object-contain" loading="lazy" />
                    <span className="block truncate px-2 py-1 text-xs">{m.alt_text || m.file_name}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
