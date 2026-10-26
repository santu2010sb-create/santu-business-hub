import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { ArrowRight, FileText, HelpCircle, Image, LayoutGrid, Phone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AdminPage, LoadingBlock, Panel } from "@/components/admin/AdminPage";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { ENQUIRY_STATUSES, STATUS_LABELS } from "@/lib/enquiry-schema";

export const Route = createFileRoute("/_authenticated/admin/")({ component: Dashboard });

async function fetchStats() {
  const counts = await Promise.all(
    ENQUIRY_STATUSES.map(async (s) => {
      const { count, error } = await supabase.from("enquiries").select("id", { count: "exact", head: true }).eq("status", s);
      if (error) throw error;
      return [s, count ?? 0] as const;
    }),
  );
  const { data: recent, error } = await supabase
    .from("enquiries")
    .select("id, name, business_name, service, status, created_at")
    .order("created_at", { ascending: false })
    .limit(5);
  if (error) throw error;
  const byStatus = Object.fromEntries(counts) as Record<(typeof ENQUIRY_STATUSES)[number], number>;
  const total = counts.reduce((n, [, c]) => n + c, 0);
  return { byStatus, total, recent };
}

const LINKS = [
  { to: "/admin/content", label: "Edit website text", icon: FileText },
  { to: "/admin/services", label: "Manage services", icon: LayoutGrid },
  { to: "/admin/faqs", label: "Edit FAQs", icon: HelpCircle },
  { to: "/admin/media", label: "Logo & images", icon: Image },
  { to: "/admin/contact", label: "Contact details", icon: Phone },
] as const;

function Dashboard() {
  const { data, isLoading } = useQuery({ queryKey: ["admin", "stats"], queryFn: fetchStats });

  return (
    <AdminPage title="Dashboard" description="An overview of enquiries and quick links to manage your website.">
      {isLoading || !data ? (
        <LoadingBlock />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-6">
            <Panel className="col-span-2 bg-navy text-navy-foreground md:col-span-1">
              <p className="text-xs uppercase tracking-wider text-navy-muted">Total</p>
              <p className="mt-1 font-display text-4xl">{data.total}</p>
            </Panel>
            {ENQUIRY_STATUSES.map((s) => (
              <Link key={s} to="/admin/enquiries" search={{ status: s }} className="rounded-2xl border border-border bg-card p-5 shadow-soft transition-shadow hover:shadow-card">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">{STATUS_LABELS[s]}</p>
                <p className="mt-1 font-display text-3xl text-navy">{data.byStatus[s]}</p>
              </Link>
            ))}
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
            <Panel>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-medium text-navy">Recent enquiries</h2>
                <Link to="/admin/enquiries" className="text-sm font-semibold text-navy hover:text-teal">View all →</Link>
              </div>
              {data.recent.length === 0 ? (
                <p className="text-sm text-muted-foreground">No enquiries yet. They'll appear here when someone uses the contact form.</p>
              ) : (
                <ul className="divide-y divide-border">
                  {data.recent.map((e) => (
                    <li key={e.id} className="flex items-center justify-between gap-3 py-3">
                      <div className="min-w-0">
                        <p className="truncate font-medium">{e.name}{e.business_name && <span className="text-muted-foreground"> · {e.business_name}</span>}</p>
                        <p className="truncate text-xs text-muted-foreground">{format(new Date(e.created_at), "d MMM yyyy")}{e.service && ` · ${e.service}`}</p>
                      </div>
                      <StatusBadge status={e.status} />
                    </li>
                  ))}
                </ul>
              )}
            </Panel>
            <Panel>
              <h2 className="mb-4 text-xl font-medium text-navy">Manage website</h2>
              <ul className="grid gap-2">
                {LINKS.map((l) => (
                  <li key={l.to}>
                    <Link to={l.to} className="flex items-center justify-between rounded-xl border border-border px-4 py-3 text-sm font-medium hover:border-teal hover:bg-accent">
                      <span className="flex items-center gap-3"><l.icon className="size-4 text-teal" aria-hidden />{l.label}</span>
                      <ArrowRight className="size-4 text-muted-foreground" aria-hidden />
                    </Link>
                  </li>
                ))}
                <li>
                  <Link to="/preview/$page" params={{ page: "home" }} className="flex items-center justify-between rounded-xl border border-border px-4 py-3 text-sm font-medium hover:border-teal hover:bg-accent">
                    <span>Preview saved drafts</span>
                    <ArrowRight className="size-4 text-muted-foreground" aria-hidden />
                  </Link>
                </li>
              </ul>
            </Panel>
          </div>
        </>
      )}
    </AdminPage>
  );
}
