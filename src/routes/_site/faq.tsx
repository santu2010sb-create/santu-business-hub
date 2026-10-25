import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { FaqPage } from "@/components/site/pages";
import { publicSiteQuery } from "@/lib/site.functions";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/_site/faq")({
  head: () =>
    seo("FAQ", "Answers to common questions about SANTU BUSINESS SERVICES and how to get started."),
  component: () => {
    const { data } = useSuspenseQuery(publicSiteQuery);
    return <FaqPage site={data} />;
  },
});
