import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminPage, LoadingBlock, Panel } from "@/components/admin/AdminPage";
import { ImagePicker } from "@/components/admin/ImagePicker";
import { PublishBar } from "@/components/admin/PublishBar";
import { useSectionEditor } from "@/components/admin/useSectionEditor";
import type { SectionKey } from "@/lib/content";

type FieldDef = {
  key: string;
  label: string;
  type: "text" | "textarea" | "image";
  max: number;
  help?: string;
  required?: boolean;
};

const FIELDS: Record<"home" | "about" | "footer" | "branding", FieldDef[]> = {
  home: [
    { key: "hero_eyebrow", label: "Small heading above headline", type: "text", max: 80 },
    { key: "hero_title", label: "Main headline", type: "text", max: 120, required: true },
    { key: "hero_subtitle", label: "Subheading", type: "textarea", max: 400 },
    { key: "primary_cta_label", label: "Main button text", type: "text", max: 40, required: true },
    { key: "secondary_cta_label", label: "Second button text", type: "text", max: 40, required: true },
    { key: "hero_image_id", label: "Main image", type: "image", max: 0, help: "Shown beside the headline. A built-in photo is used if empty." },
    { key: "intro_title", label: "Introduction heading", type: "text", max: 120 },
    { key: "intro_body", label: "Introduction text", type: "textarea", max: 1200 },
    { key: "services_title", label: "Services heading", type: "text", max: 120 },
    { key: "services_intro", label: "Services intro", type: "textarea", max: 400 },
    { key: "cta_title", label: "Bottom banner heading", type: "text", max: 120 },
    { key: "cta_body", label: "Bottom banner text", type: "textarea", max: 400 },
    { key: "cta_label", label: "Bottom banner button text", type: "text", max: 40, required: true },
  ],
  about: [
    { key: "title", label: "Page heading", type: "text", max: 120, required: true },
    { key: "intro", label: "Short introduction", type: "textarea", max: 300 },
    { key: "body", label: "Main text", type: "textarea", max: 5000, help: "Leave a blank line between paragraphs." },
    { key: "image_id", label: "Image", type: "image", max: 0 },
    { key: "focus_title", label: "Highlight box heading", type: "text", max: 120 },
    { key: "focus_body", label: "Highlight box text", type: "textarea", max: 600 },
  ],
  footer: [
    { key: "blurb", label: "Footer description", type: "textarea", max: 300 },
    { key: "note", label: "Extra line after copyright (optional)", type: "text", max: 200 },
  ],
  branding: [
    { key: "business_name", label: "Business name", type: "text", max: 80, required: true },
    { key: "tagline", label: "Tagline", type: "text", max: 120 },
    { key: "location", label: "Location shown on the site", type: "text", max: 120 },
    { key: "logo_id", label: "Logo", type: "image", max: 0, help: "A text logo is shown when no image is chosen. Transparent PNG works best." },
  ],
};

const PREVIEW_PAGE: Record<string, string> = { home: "home", about: "about", footer: "home", branding: "home" };

export const Route = createFileRoute("/_authenticated/admin/content")({
  validateSearch: z.object({ tab: z.enum(["home", "about", "footer", "branding"]).optional() }),
  component: ContentPage,
});

function ContentPage() {
  const { tab = "home" } = Route.useSearch();
  const navigate = Route.useNavigate();
  return (
    <AdminPage
      title="Website text"
      description="Edit text and images. Save a draft to preview it privately, then publish when you're happy."
    >
      <Tabs value={tab} onValueChange={(v) => navigate({ search: { tab: v as typeof tab } })}>
        <TabsList className="mb-6 flex h-auto flex-wrap justify-start">
          <TabsTrigger value="home">Home page</TabsTrigger>
          <TabsTrigger value="about">About page</TabsTrigger>
          <TabsTrigger value="footer">Footer</TabsTrigger>
          <TabsTrigger value="branding">Business & logo</TabsTrigger>
        </TabsList>
        {(["home", "about", "footer", "branding"] as const).map((k) => (
          <TabsContent key={k} value={k}>
            <SectionForm sectionKey={k} />
          </TabsContent>
        ))}
      </Tabs>
    </AdminPage>
  );
}

function SectionForm({ sectionKey }: { sectionKey: "home" | "about" | "footer" | "branding" }) {
  const ed = useSectionEditor(sectionKey as SectionKey);
  if (!ed.value) return <LoadingBlock />;
  const v = ed.value as Record<string, unknown>;
  const setField = (k: string, val: unknown) => ed.setValue({ ...(ed.value as object), [k]: val } as never);

  const missing = FIELDS[sectionKey].filter((f) => f.required && !String(v[f.key] ?? "").trim());
  const canSave = missing.length === 0;

  return (
    <>
      <Panel className="grid gap-6">
        {FIELDS[sectionKey].map((f) => {
          const id = `${sectionKey}-${f.key}`;
          return (
            <div key={f.key} className="grid gap-2">
              <Label htmlFor={id}>
                {f.label}
                {f.required && " *"}
              </Label>
              {f.type === "image" ? (
                <ImagePicker value={(v[f.key] as string | null) ?? null} onChange={(id) => setField(f.key, id)} />
              ) : f.type === "textarea" ? (
                <Textarea id={id} value={String(v[f.key] ?? "")} maxLength={f.max} rows={f.max > 1000 ? 8 : 3} onChange={(e) => setField(f.key, e.target.value)} />
              ) : (
                <Input id={id} value={String(v[f.key] ?? "")} maxLength={f.max} onChange={(e) => setField(f.key, e.target.value)} />
              )}
              {f.help && <p className="text-xs text-muted-foreground">{f.help}</p>}
              {f.required && !String(v[f.key] ?? "").trim() && (
                <p className="text-xs text-destructive">This field is required.</p>
              )}
            </div>
          );
        })}
      </Panel>
      <PublishBar
        state={ed.state}
        canSave={canSave}
        saving={ed.save.isPending}
        publishing={ed.publish.isPending}
        onSave={() => ed.save.mutate(ed.value!)}
        onPublish={() => ed.publish.mutate(ed.value!)}
        onDiscard={ed.discard}
        onPreview={async () => {
          const w = window.open("about:blank", "_blank");
          await ed.save.mutateAsync(ed.value!);
          if (w) w.location.href = `/preview/${PREVIEW_PAGE[sectionKey]}`;
        }}
      />
    </>
  );
}
