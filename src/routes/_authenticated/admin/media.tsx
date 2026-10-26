import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { AdminPage, LoadingBlock, Panel } from "@/components/admin/AdminPage";
import { MediaUploader } from "@/components/admin/MediaUploader";
import { mediaListQuery } from "@/components/admin/ImagePicker";
import { deleteMedia, errorMessage, mediaUsage } from "@/lib/admin-api";
import { mediaUrl, type MediaItem } from "@/lib/content";
import { formatBytes } from "@/lib/media-validation";

export const Route = createFileRoute("/_authenticated/admin/media")({ component: MediaAdmin });

function MediaAdmin() {
  const qc = useQueryClient();
  const { data: media, isLoading } = useQuery(mediaListQuery);
  const { data: used } = useQuery({ queryKey: ["admin", "media-usage"], queryFn: mediaUsage });
  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["admin", "media"] });
    qc.invalidateQueries({ queryKey: ["site"] });
  };

  return (
    <AdminPage
      title="Logo & images"
      description="Upload images to your library, edit their descriptions, then choose where they appear under Website text (logo is in Business & logo)."
      actions={
        <Button variant="outline" asChild>
          <Link to="/admin/content" search={{ tab: "branding" }}>Change logo</Link>
        </Button>
      }
    >
      <Panel className="mb-8">
        <h2 className="mb-4 text-xl font-medium text-navy">Upload a new image</h2>
        <MediaUploader onUploaded={refresh} />
      </Panel>
      {isLoading || !media ? (
        <LoadingBlock />
      ) : media.length === 0 ? (
        <p className="text-muted-foreground">Your library is empty.</p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {media.map((m) => (
            <MediaCard key={m.id} item={m} inUse={used?.has(m.id) ?? false} onChanged={refresh} />
          ))}
        </ul>
      )}
    </AdminPage>
  );
}

function MediaCard({ item, inUse, onChanged }: { item: MediaItem; inUse: boolean; onChanged: () => void }) {
  const [alt, setAlt] = useState(item.alt_text);
  const saveAlt = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("media").update({ alt_text: alt.trim().slice(0, 250) }).eq("id", item.id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Description saved"); onChanged(); },
    onError: (e) => toast.error(errorMessage(e)),
  });
  const remove = useMutation({
    mutationFn: () => deleteMedia(item),
    onSuccess: () => { toast.success("Image deleted"); onChanged(); },
    onError: (e) => toast.error(errorMessage(e)),
  });

  return (
    <li className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
      <div className="bg-muted">
        <img src={mediaUrl(item.path)} alt={item.alt_text} loading="lazy" className="aspect-[4/3] w-full object-contain" />
      </div>
      <div className="grid gap-3 p-4">
        <p className="flex justify-between gap-2 text-xs text-muted-foreground">
          <span className="truncate">{item.file_name}</span>
          <span>{formatBytes(item.size_bytes)}</span>
        </p>
        {inUse && <span className="w-fit rounded-full bg-accent px-2 py-0.5 text-xs font-semibold text-accent-foreground">In use on website</span>}
        <label className="grid gap-1 text-sm">
          Alt text
          <Input value={alt} maxLength={250} onChange={(e) => setAlt(e.target.value)} />
        </label>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" disabled={alt === item.alt_text || saveAlt.isPending} onClick={() => saveAlt.mutate()}>
            Save alt text
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button size="sm" variant="ghost" className="text-destructive" disabled={inUse} title={inUse ? "Remove it from the website first" : undefined}>
                <Trash2 /> Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete this image?</AlertDialogTitle>
                <AlertDialogDescription>The file is removed from storage permanently.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => remove.mutate()}>Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </li>
  );
}
