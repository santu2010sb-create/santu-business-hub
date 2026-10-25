import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { SiteShell } from "@/components/site/SiteShell";
import { publicSiteQuery } from "@/lib/site.functions";

export const Route = createFileRoute("/_site")({
  loader: ({ context }) => context.queryClient.ensureQueryData(publicSiteQuery),
  component: SiteLayout,
});

function SiteLayout() {
  const { data: site } = useSuspenseQuery(publicSiteQuery);
  return (
    <SiteShell site={site}>
      <Outlet />
    </SiteShell>
  );
}
