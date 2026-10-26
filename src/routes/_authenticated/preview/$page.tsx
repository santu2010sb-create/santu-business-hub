import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { SiteShell } from "@/components/site/SiteShell";
import { AboutPage, ContactPage, FaqPage, HomePage, ServicesPage } from "@/components/site/pages";
import { loadDraftSite } from "@/lib/admin-api";

const PAGES = ["home", "about", "services", "faq", "contact"] as const;
type PageKey = (typeof PAGES)[number];

export const Route = createFileRoute("/_authenticated/preview/$page")({
  head: () => ({
    meta: [
      { title: "Preview | SANTU BUSINESS SERVICES" },
      { name: "description", content: "Private preview of unpublished website changes." },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Preview | SANTU BUSINESS SERVICES" },
      { property: "og:description", content: "Private preview of unpublished website changes." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  beforeLoad: async ({ params, context }) => {
    if (!(PAGES as readonly string[]).includes(params.page)) throw notFound();
    const { data } = await supabase.rpc("has_role", { _user_id: context.user.id, _role: "admin" });
    return { isAdmin: data === true };
  },
  component: PreviewPage,
});

function PreviewPage() {
  const { page } = Route.useParams() as { page: PageKey };
  const { isAdmin } = Route.useRouteContext();
  const { data: site, isLoading } = useQuery({
    queryKey: ["admin", "draft-site"],
    queryFn: loadDraftSite,
    enabled: isAdmin,
  });

  if (!isAdmin) return <p className="p-10 text-center">Only administrators can preview drafts.</p>;
  if (isLoading || !site) return <div className="p-10 text-center text-muted-foreground">Loading preview…</div>;

  const banner = (
    <div className="bg-warning text-warning-foreground">
      <div className="container-page flex flex-col gap-2 py-2.5 text-sm sm:flex-row sm:items-center sm:justify-between">
        <p className="flex items-center gap-2 font-semibold">
          <Eye className="size-4" aria-hidden /> Preview of saved drafts — visitors can't see this yet.
        </p>
        <nav className="flex flex-wrap gap-3" aria-label="Preview pages">
          {PAGES.map((p) => (
            <Link key={p} to="/preview/$page" params={{ page: p }} className="capitalize underline-offset-4 hover:underline data-[status=active]:font-bold data-[status=active]:underline">
              {p}
            </Link>
          ))}
          <Link to="/admin" className="font-semibold underline">Back to admin</Link>
        </nav>
      </div>
    </div>
  );

  return (
    <SiteShell site={site} banner={banner}>
      {page === "home" && <HomePage site={site} />}
      {page === "about" && <AboutPage site={site} />}
      {page === "services" && <ServicesPage site={site} />}
      {page === "faq" && <FaqPage site={site} />}
      {page === "contact" && <ContactPage site={site} preview />}
    </SiteShell>
  );
}
