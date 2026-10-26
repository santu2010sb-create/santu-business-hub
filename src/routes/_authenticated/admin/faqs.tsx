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
import type { Faq } from "@/lib/content";

export const Route = createFileRoute("/_authenticated/admin/faqs")({ component: FaqAdmin });

const faqSchema = z.object({
  question: z.string().trim().min(1, "Question is required.").max(300),
  answer: z.string().trim().min(1, "Answer is required.").max(3000),
  published: z.boolean(),
});
type FaqForm = z.infer<typeof faqSchema>;
const EMPTY: FaqForm = { question: "", answer: "", published: false };

async function fetchFaqs(): Promise<Faq[]> {
  const { data, error } = await supabase.from("faqs").select("id, question, answer, sort_order, published").order("sort_order");
  if (error) throw error;
  return data;
}

function FaqAdmin() {
  const qc = useQueryClient();
  const { data: rows, isLoading } = useQuery({ queryKey: ["admin", "faqs"], queryFn: fetchFaqs });
  const [editing, setEditing] = useState<{ id: string | null; form: FaqForm } | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const run = useMutation({
    mutationFn: async (fn: () => Promise<unknown>) => fn(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "faqs"] });
      qc.invalidateQueries({ queryKey: ["site"] });
    },
    onError: (e) => toast.error(errorMessage(e)),
  });

  function save() {
    if (!editing) return;
    const parsed = faqSchema.safeParse(editing.form);
    if (!parsed.success) return setFormError(parsed.error.issues[0].message);
    const nextOrder = Math.max(0, ...(rows ?? []).map((r) => r.sort_order)) + 1;
    run.mutate(
      async () => {
        const res = editing.id
          ? await supabase.from("faqs").update(parsed.data).eq("id", editing.id)
          : await supabase.from("faqs").insert({ ...parsed.data, sort_order: nextOrder });
        if (res.error) throw res.error;
      },
      { onSuccess: () => { toast.success("FAQ saved"); setEditing(null); } },
    );
  }

  const f = editing?.form;
  const setF = (patch: Partial<FaqForm>) => editing && setEditing({ ...editing, form: { ...editing.form, ...patch } });

  return (
    <AdminPage
      title="FAQs"
      description="Questions and answers shown on the FAQ page. Changes here go live immediately; keep a question Hidden until it's ready."
      actions={<Button onClick={() => { setFormError(null); setEditing({ id: null, form: EMPTY }); }}><Plus /> Add question</Button>}
    >
      {isLoading || !rows ? (
        <LoadingBlock />
      ) : rows.length === 0 ? (
        <p className="text-muted-foreground">No questions yet.</p>
      ) : (
        <OrderedRows
          rows={rows}
          itemName="question"
          busy={run.isPending}
          render={(q) => (
            <div>
              <p className="font-semibold text-navy">{q.question}</p>
              <p className="line-clamp-2 text-sm text-muted-foreground">{q.answer}</p>
            </div>
          )}
          onMove={(i, dir) =>
            run.mutate(async () => {
              for (const [idx, id] of moveIds(rows, i, dir).entries()) {
                const { error } = await supabase.from("faqs").update({ sort_order: idx + 1 }).eq("id", id);
                if (error) throw error;
              }
            })
          }
          onTogglePublished={(q, published) =>
            run.mutate(async () => {
              const { error } = await supabase.from("faqs").update({ published }).eq("id", q.id);
              if (error) throw error;
            })
          }
          onEdit={(q) => { setFormError(null); setEditing({ id: q.id, form: { question: q.question, answer: q.answer, published: q.published } }); }}
          onDelete={(q) =>
            run.mutate(async () => {
              const { error } = await supabase.from("faqs").delete().eq("id", q.id);
              if (error) throw error;
              toast.success("Question deleted");
            })
          }
        />
      )}

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing?.id ? "Edit question" : "Add question"}</DialogTitle>
          </DialogHeader>
          {f && (
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="faq-q">Question *</Label>
                <Input id="faq-q" value={f.question} maxLength={300} onChange={(e) => setF({ question: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="faq-a">Answer *</Label>
                <Textarea id="faq-a" rows={6} value={f.answer} maxLength={3000} onChange={(e) => setF({ answer: e.target.value })} />
              </div>
              <label className="flex items-center gap-3 text-sm">
                <Switch checked={f.published} onCheckedChange={(v) => setF({ published: v })} /> Show on website
              </label>
              {formError && <p role="alert" className="text-sm text-destructive">{formError}</p>}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
            <Button onClick={save} disabled={run.isPending}>Save question</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminPage>
  );
}
