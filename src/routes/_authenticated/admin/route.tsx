import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import {
  ExternalLink,
  FileText,
  HelpCircle,
  Image,
  Inbox,
  LayoutDashboard,
  LayoutGrid,
  LogOut,
  Phone,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Admin | SANTU BUSINESS SERVICES" },
      { name: "description", content: "Website administration." },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Admin | SANTU BUSINESS SERVICES" },
      { property: "og:description", content: "Website administration." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  beforeLoad: async ({ context }) => {
    const { data } = await supabase.rpc("has_role", { _user_id: context.user.id, _role: "admin" });
    return { isAdmin: data === true };
  },
  component: AdminLayout,
});

const NAV = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/enquiries", label: "Enquiries", icon: Inbox },
  { to: "/admin/content", label: "Website text", icon: FileText },
  { to: "/admin/services", label: "Services", icon: LayoutGrid },
  { to: "/admin/faqs", label: "FAQs", icon: HelpCircle },
  { to: "/admin/media", label: "Logo & images", icon: Image },
  { to: "/admin/contact", label: "Contact details", icon: Phone },
] as const;

function useSignOut() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  return async () => {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  };
}

function AdminLayout() {
  const { isAdmin, user } = Route.useRouteContext();
  const signOut = useSignOut();

  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted px-4">
        <div className="max-w-md rounded-3xl bg-card p-8 text-center shadow-card">
          <h1 className="text-2xl font-medium text-navy">No admin access</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            You're signed in as {user.email}, but this account isn't an authorised administrator.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Button variant="outline" asChild>
              <Link to="/">Go to website</Link>
            </Button>
            <Button onClick={signOut}>Sign out</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/50 md:grid md:grid-cols-[15rem_1fr]">
      <aside className="bg-sidebar text-sidebar-foreground md:sticky md:top-0 md:h-screen md:overflow-y-auto">
        <div className="flex items-center justify-between gap-3 px-4 py-4 md:block md:px-5 md:py-6">
          <div>
            <p className="font-display text-lg leading-tight">SANTU</p>
            <p className="eyebrow text-[0.6rem] text-navy-muted">Website admin</p>
          </div>
          <Button variant="on-navy" size="sm" onClick={signOut} className="md:hidden">
            <LogOut /> Sign out
          </Button>
        </div>
        <nav aria-label="Admin" className="flex gap-1 overflow-x-auto px-3 pb-3 md:flex-col md:px-3 md:pb-0">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: "exact" in item }}
              className="flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground data-[status=active]:bg-sidebar-accent data-[status=active]:font-semibold data-[status=active]:text-sidebar-foreground"
            >
              <item.icon className="size-4 text-teal" aria-hidden /> {item.label}
            </Link>
          ))}
        </nav>
        <div className="hidden space-y-2 px-3 py-6 md:block">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-sidebar-foreground/80 hover:bg-sidebar-accent"
          >
            <ExternalLink className="size-4" aria-hidden /> View website
          </a>
          <button
            type="button"
            onClick={signOut}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-sidebar-foreground/80 hover:bg-sidebar-accent"
          >
            <LogOut className="size-4" aria-hidden /> Sign out
          </button>
          <p className="truncate px-3 pt-2 text-xs text-navy-muted">{user.email}</p>
        </div>
      </aside>
      <main className="min-w-0 px-4 py-6 md:px-10 md:py-10">
        <Outlet />
      </main>
    </div>
  );
}
