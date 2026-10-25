import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ServicesPage } from "@/components/site/pages";
import { publicSiteQuery } from "@/lib/site.functions";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/_site/services")({
  head: () =>
    seo(
      "Services",
      "Administrative support, data entry, documentation assistance and other back-office services for small businesses.",
    ),
  component: () => {
    const { data } = useSuspenseQuery(publicSiteQuery);
    return <ServicesPage site={data} />;
  },
});
