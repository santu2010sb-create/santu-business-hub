import { mediaUrl, type SiteData } from "@/lib/content";
import { cn } from "@/lib/utils";

/** Uploaded logo when set; otherwise a typographic monogram mark. */
export function Logo({ site, inverted = false }: { site: SiteData; inverted?: boolean }) {
  const logo = site.branding.logo_id ? site.media[site.branding.logo_id] : undefined;
  const name = site.branding.business_name;

  if (logo) {
    return (
      <img
        src={mediaUrl(logo.path)}
        alt={logo.alt_text || name}
        className="h-10 w-auto max-w-[180px] object-contain"
        height={40}
      />
    );
  }

  const [first = "", ...rest] = name.split(" ");
  return (
    <span className="flex items-center gap-2.5">
      <span
        aria-hidden
        className={cn(
          "grid h-10 w-10 shrink-0 place-items-center rounded-lg font-display text-lg font-semibold",
          inverted ? "bg-teal text-navy-deep" : "bg-navy text-navy-foreground",
        )}
      >
        <span className="flex leading-none">
          {first.charAt(0)}
          <span className="text-teal">{rest[0]?.charAt(0) ?? ""}</span>
        </span>
      </span>
      <span className="flex flex-col leading-none">
        <span
          className={cn(
            "font-display text-[0.95rem] font-semibold tracking-tight",
            inverted ? "text-navy-foreground" : "text-navy",
          )}
        >
          {first}
        </span>
        <span
          className={cn(
            "mt-1 text-[0.6rem] font-bold uppercase tracking-[0.2em]",
            inverted ? "text-navy-muted" : "text-muted-foreground",
          )}
        >
          {rest.join(" ")}
        </span>
      </span>
    </span>
  );
}
