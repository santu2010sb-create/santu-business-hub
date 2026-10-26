import { useRef, useState } from "react";
import { Loader2, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { errorMessage, uploadMedia } from "@/lib/admin-api";
import type { MediaItem } from "@/lib/content";
import { validateImageFile } from "@/lib/media-validation";

export function MediaUploader({ onUploaded }: { onUploaded: (m: MediaItem) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [alt, setAlt] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function pick(f: File | undefined) {
    setError(null);
    if (!f) return setFile(null);
    const check = validateImageFile(f);
    if (!check.ok) {
      setFile(null);
      if (inputRef.current) inputRef.current.value = "";
      return setError(check.error);
    }
    setFile(f);
  }

  async function upload() {
    if (!file) return;
    if (!alt.trim()) return setError("Please describe the image for people using screen readers.");
    setBusy(true);
    try {
      const m = await uploadMedia(file, alt);
      toast.success("Image uploaded");
      setFile(null);
      setAlt("");
      if (inputRef.current) inputRef.current.value = "";
      onUploaded(m);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="media-file">Image file</Label>
        <Input
          id="media-file"
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={(e) => pick(e.target.files?.[0])}
        />
        <p className="text-xs text-muted-foreground">PNG, JPG or WebP, up to 2 MB.</p>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="media-alt">Alt text (image description)</Label>
        <Input id="media-alt" value={alt} maxLength={250} onChange={(e) => setAlt(e.target.value)} placeholder="e.g. SANTU BUSINESS SERVICES logo" />
      </div>
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      <Button type="button" onClick={upload} disabled={!file || busy} className="justify-self-start">
        {busy ? <Loader2 className="animate-spin" /> : <Upload />} Upload image
      </Button>
    </div>
  );
}
