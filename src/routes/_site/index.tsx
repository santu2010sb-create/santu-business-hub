import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { HomePage } from "@/components/site/pages";
import { publicSiteQuery } from "@/lib/site.functions";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/_site/")({
  head: () =>
    seo(
      "SANTU BUSINESS SERVICES",
      "Your outsourced operations partner in Kolkata. Reliable back-office support for small businesses — admin, data entry, documentation and more.",
    ),
  component: HomeRoute,
});

function HomeRoute() {
  const { data } = useSuspenseQuery(publicSiteQuery);
  return <HomePage site={data} />;
}
