import { createFileRoute } from "@tanstack/react-router";
import { MEDIA_PATH_PATTERN } from "@/lib/media-validation";

// Serves website images from the private storage bucket. Visitors have no
// direct storage access; this route only serves flat "<uuid>.<ext>" names that
// are registered in the media library, reading them server-side.
export const Route = createFileRoute("/api/public/media/$file")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const file = params.file;
        if (!MEDIA_PATH_PATTERN.test(file)) {
          return new Response("Not found", { status: 404 });
        }
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data: row } = await supabaseAdmin
          .from("media")
          .select("mime_type")
          .eq("path", file)
          .maybeSingle();
        if (!row) return new Response("Not found", { status: 404 });

        const { data: blob, error } = await supabaseAdmin.storage.from("site-media").download(file);
        if (error || !blob) return new Response("Not found", { status: 404 });

        const ext = file.split(".").pop();
        const type = ext === "png" ? "image/png" : ext === "webp" ? "image/webp" : "image/jpeg";
        return new Response(blob.stream(), {
          headers: {
            "content-type": type,
            "cache-control": "public, max-age=31536000, immutable",
            "x-content-type-options": "nosniff",
          },
        });
      },
    },
  },
});
