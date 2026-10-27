import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Mail, Phone, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
import { AdminPage, LoadingBlock } from "@/components/admin/AdminPage";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { errorMessage } from "@/lib/admin-api";
import { ENQUIRY_STATUSES, STATUS_LABELS, type EnquiryStatus } from "@/lib/enquiry-schema";
import { telLink } from "@/lib/contact";

export const Route = createFileRoute("/_authenticated/admin/enquiries")({
  validateSearch: z.object({ status: z.enum(ENQUIRY_STATUSES).optional() }),
  component: EnquiriesAdmin,
});

async function fetchEnquiries() {
  const { data, error } = await supabase
    .from("enquiries")
    .select("id, name, business_name, email, phone, service, message, status, created_at")
    .order("created_at", { ascending: false })
    .limit(500);
  if (error) throw error;
  return data;
}

function EnquiriesAdmin() {
  const { status } = Route.useSearch();
  const navigate = Route.useNavigate();
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const { data, isLoading } = useQuery({ queryKey: ["admin", "enquiries"], queryFn: fetchEnquiries });

  const update = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: EnquiryStatus }) => {
      const { error } = await supabase.from("enquiries").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Status updated"); qc.invalidateQueries({ queryKey: ["admin", "enquiries"] }); },
    onError: (e) => toast.error(errorMessage(e)),
  });
  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("enquiries").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Enquiry deleted"); qc.invalidateQueries({ queryKey: ["admin", "enquiries"] }); },
    onError: (e) => toast.error(errorMessage(e)),
  });

  const rows = useMemo(() => {
    const term = q.trim().toLowerCase();
    return (data ?? []).filter(
      (e) =>
        (!status || e.status === status) &&
        (!term || [e.name, e.business_name, e.email, e.phone, e.service, e.message].some((v) => v.toLowerCase().includes(term))),
    );
  }, [data, q, status]);

  return (
    <AdminPage title="Enquiries" description="Messages sent through the website's contact form. Only administrators can see these.">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input className="pl-9" placeholder="Search name, email, message…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search enquiries" />
        </div>
        <Select value={status ?? "all"} onValueChange={(v) => navigate({ search: { status: v === "all" ? undefined : (v as EnquiryStatus) } })}>
          <SelectTrigger className="sm:w-48" aria-label="Filter by status"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {ENQUIRY_STATUSES.map((s) => <SelectItem key={s} value={s}>{STATUS_LABELS[s]}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <LoadingBlock />
      ) : rows.length === 0 ? (
        <p className="rounded-2xl bg-card p-8 text-center text-muted-foreground">No enquiries {status || q ? "match these filters" : "yet"}.</p>
      ) : (
        <ul className="grid gap-4">
          {rows.map((e) => (
            <li key={e.id} className="rounded-2xl border border-border bg-card p-5 shadow-soft">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <p className="text-lg font-semibold text-navy">
                    {e.name}
                    {e.business_name && <span className="font-normal text-muted-foreground"> · {e.business_name}</span>}
                  </p>
                  <p className="text-xs text-muted-foreground">{format(new Date(e.created_at), "d MMM yyyy, h:mm a")}</p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={e.status} />
                  <Select value={e.status} onValueChange={(v) => update.mutate({ id: e.id, status: v as EnquiryStatus })}>
                    <SelectTrigger className="h-9 w-40" aria-label={`Change status for ${e.name}`}><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {ENQUIRY_STATUSES.map((s) => <SelectItem key={s} value={s}>{STATUS_LABELS[s]}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm">
                <a href={`mailto:${e.email}`} className="flex items-center gap-1.5 text-navy hover:text-teal"><Mail className="size-4" aria-hidden />{e.email}</a>
                {e.phone && <a href={telLink(e.phone)} className="flex items-center gap-1.5 text-navy hover:text-teal"><Phone className="size-4" aria-hidden />{e.phone}</a>}
                {e.service && <span className="text-muted-foreground">Service: <strong className="text-foreground">{e.service}</strong></span>}
              </div>
              <p className="mt-3 whitespace-pre-wrap rounded-xl bg-muted p-4 text-sm">{e.message}</p>
              <div className="mt-3 flex justify-end">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="sm" className="text-destructive"><Trash2 /> Delete</Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete this enquiry?</AlertDialogTitle>
                      <AlertDialogDescription>The customer's details and message will be permanently removed.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => remove.mutate(e.id)}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </li>
          ))}
        </ul>
      )}
    </AdminPage>
  );
}
