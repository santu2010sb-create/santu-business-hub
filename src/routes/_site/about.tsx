import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { AboutPage } from "@/components/site/pages";
import { publicSiteQuery } from "@/lib/site.functions";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/_site/about")({
  head: () =>
    seo(
      "About",
      "About SANTU BUSINESS SERVICES — a Kolkata-based back-office support partner for small businesses.",
    ),
  component: () => {
    const { data } = useSuspenseQuery(publicSiteQuery);
    return <AboutPage site={data} />;
  },
});
