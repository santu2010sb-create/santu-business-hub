import { createFileRoute } from "@tanstack/react-router";
import { MEDIA_PATH_PATTERN } from "@/lib/media-validation";

// Serves website images from the private storage bucket. Only flat
// "<uuid>.<ext>" names are accepted; reads use the publishable key and the
// public SELECT policy on site-media, so no privileged key is involved.
export const Route = createFileRoute("/api/public/media/$file")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const file = params.file;
        if (!MEDIA_PATH_PATTERN.test(file)) {
          return new Response("Not found", { status: 404 });
        }
        const url = process.env["SUPABASE_URL"]!.replace(/\/+$/, "");
        const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
        const res = await fetch(`${url}/storage/v1/object/site-media/${file}`, {
          headers: { apikey: key },
        });
        if (!res.ok || !res.body) {
          return new Response("Not found", { status: 404 });
        }
        const ext = file.split(".").pop();
        const type = ext === "png" ? "image/png" : ext === "webp" ? "image/webp" : "image/jpeg";
        return new Response(res.body, {
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
