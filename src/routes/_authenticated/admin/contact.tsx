import { createFileRoute } from "@tanstack/react-router";
import { ShieldCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { AdminPage, LoadingBlock, Panel } from "@/components/admin/AdminPage";
import { PublishBar } from "@/components/admin/PublishBar";
import { useSectionEditor } from "@/components/admin/useSectionEditor";
import { CONTACT_KEYS, type ContactKey } from "@/lib/content";
import { CONTACT_LABELS, validateContactValue } from "@/lib/contact";

export const Route = createFileRoute("/_authenticated/admin/contact")({ component: ContactAdmin });

const GROUPS: { title: string; keys: ContactKey[] }[] = [
  { title: "Direct contact", keys: ["email", "phone", "whatsapp", "address"] },
  { title: "Social media", keys: ["facebook", "instagram", "linkedin", "x", "youtube"] },
];

function ContactAdmin() {
  const ed = useSectionEditor("contact");
  if (!ed.value) return <AdminPage title="Contact details"><LoadingBlock /></AdminPage>;
  const c = ed.value;
  const errors = Object.fromEntries(CONTACT_KEYS.map((k) => [k, validateContactValue(k, c[k].value)])) as Record<ContactKey, string | null>;
  const hasErrors = Object.values(errors).some(Boolean);

  return (
    <AdminPage
      title="Contact details"
      description="Only details that are filled in and switched to Verified appear on the website. Leave anything you haven't confirmed as unverified."
    >
      <Panel className="mb-6 grid gap-2">
        <Label htmlFor="contact-intro">Contact page introduction</Label>
        <Textarea id="contact-intro" rows={3} maxLength={400} value={c.intro} onChange={(e) => ed.setValue({ ...c, intro: e.target.value })} />
      </Panel>
      {GROUPS.map((g) => (
        <Panel key={g.title} className="mb-6">
          <h2 className="mb-5 text-xl font-medium text-navy">{g.title}</h2>
          <div className="grid gap-6">
            {g.keys.map((k) => {
              const field = c[k];
              const err = errors[k];
              const live = field.verified && field.value.trim() && !err;
              return (
                <div key={k} className="grid gap-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <Label htmlFor={`c-${k}`}>{CONTACT_LABELS[k]}</Label>
                    <label className="flex items-center gap-2 text-sm">
                      <Switch
                        checked={field.verified}
                        onCheckedChange={(v) => ed.setValue({ ...c, [k]: { ...field, verified: v } })}
                        aria-label={`${CONTACT_LABELS[k]} verified`}
                      />
                      {field.verified ? (
                        <span className="flex items-center gap-1 font-semibold text-success">
                          <ShieldCheck className="size-4" aria-hidden /> Verified
                        </span>
                      ) : (
                        "Not verified (hidden)"
                      )}
                    </label>
                  </div>
                  {k === "address" ? (
                    <Textarea id={`c-${k}`} rows={2} maxLength={300} value={field.value} onChange={(e) => ed.setValue({ ...c, [k]: { ...field, value: e.target.value } })} />
                  ) : (
                    <Input
                      id={`c-${k}`}
                      value={field.value}
                      maxLength={255}
                      type={k === "email" ? "email" : k === "phone" || k === "whatsapp" ? "tel" : "url"}
                      placeholder={k === "phone" || k === "whatsapp" ? "+91 …" : k === "email" ? "" : "https://"}
                      aria-invalid={!!err || undefined}
                      onChange={(e) => ed.setValue({ ...c, [k]: { ...field, value: e.target.value } })}
                    />
                  )}
                  {err ? (
                    <p className="text-xs text-destructive">{err}</p>
                  ) : (
                    <p className="text-xs text-muted-foreground">{live ? "Will be shown on the website once published." : "Hidden from the website."}</p>
                  )}
                </div>
              );
            })}
          </div>
        </Panel>
      ))}
      <PublishBar
        state={ed.state}
        canSave={!hasErrors}
        saving={ed.save.isPending}
        publishing={ed.publish.isPending}
        onSave={() => ed.save.mutate(c)}
        onPublish={() => ed.publish.mutate(c)}
        onDiscard={ed.discard}
        onPreview={async () => {
          const w = window.open("about:blank", "_blank");
          await ed.save.mutateAsync(c);
          if (w) w.location.href = "/preview/contact";
        }}
      />
    </AdminPage>
  );
}
