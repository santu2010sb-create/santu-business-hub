const BRAND = "SANTU BUSINESS SERVICES";

export function seo(title: string, description: string) {
  const full = title === BRAND ? title : `${title} | ${BRAND}`;
  return {
    meta: [
      { title: full },
      { name: "description", content: description },
      { property: "og:title", content: full },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: full },
      { name: "twitter:description", content: description },
    ],
  };
}
