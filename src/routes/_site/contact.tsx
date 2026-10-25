import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ContactPage } from "@/components/site/pages";
import { publicSiteQuery } from "@/lib/site.functions";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/_site/contact")({
  head: () =>
    seo(
      "Contact",
      "Send an enquiry to SANTU BUSINESS SERVICES in Kolkata and tell us about the back-office support you need.",
    ),
  component: () => {
    const { data } = useSuspenseQuery(publicSiteQuery);
    return <ContactPage site={data} />;
  },
});
