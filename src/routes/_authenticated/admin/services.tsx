import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AdminPage, LoadingBlock } from "@/components/admin/AdminPage";
import { OrderedRows, moveIds } from "@/components/admin/OrderedRows";
import { errorMessage } from "@/lib/admin-api";
import type { Service } from "@/lib/content";
import { SERVICE_ICONS, serviceIcon } from "@/lib/service-icons";

export const Route = createFileRoute("/_authenticated/admin/services")({ component: ServicesAdmin });

const serviceSchema = z.object({
  title: z.string().trim().min(1, "Title is required.").max(120),
  summary: z.string().trim().min(1, "Short description is required.").max(400),
  details: z.string().trim().max(3000),
  icon: z.string().refine((v) => v in SERVICE_ICONS),
  published: z.boolean(),
});
type ServiceForm = z.infer<typeof serviceSchema>;
const EMPTY: ServiceForm = { title: "", summary: "", details: "", icon: "briefcase", published: false };

async function fetchServices(): Promise<Service[]> {
  const { data, error } = await supabase
    .from("services")
    .select("id, title, summary, details, icon, sort_order, published")
    .order("sort_order");
  if (error) throw error;
  return data;
}

function ServicesAdmin() {
  const qc = useQueryClient();
  const { data: rows, isLoading } = useQuery({ queryKey: ["admin", "services"], queryFn: fetchServices });
  const [editing, setEditing] = useState<{ id: string | null; form: ServiceForm } | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["admin", "services"] });
    qc.invalidateQueries({ queryKey: ["site"] });
  };
  const run = useMutation({
    mutationFn: async (fn: () => Promise<unknown>) => fn(),
    onSuccess: refresh,
    onError: (e) => toast.error(errorMessage(e)),
  });

  async function save() {
    if (!editing) return;
    const parsed = serviceSchema.safeParse(editing.form);
    if (!parsed.success) return setFormError(parsed.error.issues[0]?.message ?? "Please check the form.");
    const nextOrder = Math.max(0, ...(rows ?? []).map((r) => r.sort_order)) + 1;
    run.mutate(
      async () => {
        const res = editing.id
          ? await supabase.from("services").update(parsed.data).eq("id", editing.id)
          : await supabase.from("services").insert({ ...parsed.data, sort_order: nextOrder });
        if (res.error) throw res.error;
      },
      {
        onSuccess: () => {
          toast.success(editing.id ? "Service updated" : "Service added");
          setEditing(null);
        },
      },
    );
  }

  const f = editing?.form;
  const setF = (patch: Partial<ServiceForm>) => editing && setEditing({ ...editing, form: { ...editing.form, ...patch } });

  return (
    <AdminPage
      title="Services"
      description="Add, edit, reorder and publish the services shown on your website. Hidden services are never shown to visitors. Changes here go live immediately."
      actions={
        <Button onClick={() => { setFormError(null); setEditing({ id: null, form: EMPTY }); }}>
          <Plus /> Add service
        </Button>
      }
    >
      {isLoading || !rows ? (
        <LoadingBlock />
      ) : rows.length === 0 ? (
        <p className="text-muted-foreground">No services yet. Add your first one.</p>
      ) : (
        <OrderedRows
          rows={rows}
          itemName="service"
          busy={run.isPending}
          render={(s) => {
            const Icon = serviceIcon(s.icon);
            return (
              <div className="flex gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-accent text-accent-foreground">
                  <Icon className="size-5" aria-hidden />
                </span>
                <div className="min-w-0">
                  <p className="font-semibold text-navy">{s.title}</p>
                  <p className="line-clamp-2 text-sm text-muted-foreground">{s.summary}</p>
                </div>
              </div>
            );
          }}
          onMove={(i, dir) =>
            run.mutate(async () => {
              const ids = moveIds(rows, i, dir);
              for (const [idx, id] of ids.entries()) {
                const { error } = await supabase.from("services").update({ sort_order: idx + 1 }).eq("id", id);
                if (error) throw error;
              }
            })
          }
          onTogglePublished={(s, published) =>
            run.mutate(async () => {
              const { error } = await supabase.from("services").update({ published }).eq("id", s.id);
              if (error) throw error;
              toast.success(published ? "Service published" : "Service hidden");
            })
          }
          onEdit={(s) => {
            setFormError(null);
            setEditing({ id: s.id, form: { title: s.title, summary: s.summary, details: s.details, icon: s.icon, published: s.published } });
          }}
          onDelete={(s) =>
            run.mutate(async () => {
              const { error } = await supabase.from("services").delete().eq("id", s.id);
              if (error) throw error;
              toast.success("Service deleted");
            })
          }
        />
      )}

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing?.id ? "Edit service" : "Add service"}</DialogTitle>
          </DialogHeader>
          {f && (
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="svc-title">Title *</Label>
                <Input id="svc-title" value={f.title} maxLength={120} onChange={(e) => setF({ title: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="svc-summary">Short description *</Label>
                <Textarea id="svc-summary" rows={3} value={f.summary} maxLength={400} onChange={(e) => setF({ summary: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="svc-details">More details (shown on the Services page)</Label>
                <Textarea id="svc-details" rows={5} value={f.details} maxLength={3000} onChange={(e) => setF({ details: e.target.value })} />
              </div>
              <fieldset className="grid gap-2">
                <legend className="mb-2 text-sm font-medium">Icon</legend>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(SERVICE_ICONS).map(([key, { label, icon: Icon }]) => (
                    <button
                      key={key}
                      type="button"
                      aria-label={label}
                      aria-pressed={f.icon === key}
                      onClick={() => setF({ icon: key })}
                      className="grid size-10 place-items-center rounded-lg border border-border text-navy aria-pressed:border-navy aria-pressed:bg-accent"
                    >
                      <Icon className="size-5" />
                    </button>
                  ))}
                </div>
              </fieldset>
              <label className="flex items-center gap-3 text-sm">
                <Switch checked={f.published} onCheckedChange={(v) => setF({ published: v })} />
                Show on website
              </label>
              {formError && <p role="alert" className="text-sm text-destructive">{formError}</p>}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
            <Button onClick={save} disabled={run.isPending}>Save service</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminPage>
  );
}
