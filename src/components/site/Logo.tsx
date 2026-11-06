import { mediaUrl, type SiteData } from "@/lib/content";
import { cn } from "@/lib/utils";
import brandLogo from "@/assets/santu-logo.webp";

/** Uploaded logo when set; otherwise the built-in round SBS badge with the business name. */
export function Logo({ site, inverted = false }: { site: SiteData; inverted?: boolean }) {
  const logo = site.branding.logo_id ? site.media[site.branding.logo_id] : undefined;
  const name = site.branding.business_name;

  if (logo) {
    return (
      <img
        src={mediaUrl(logo.path)}
        alt={logo.alt_text || name}
        className="h-11 w-auto max-w-[180px] object-contain"
        height={44}
      />
    );
  }

  return (
    <span className="flex items-center gap-2.5">
      <img src={brandLogo} alt="" width={44} height={44} className="size-11 shrink-0 rounded-full" />
      <span
        className={cn(
          "font-display text-[1.02rem] font-extrabold leading-tight tracking-tight",
          inverted ? "text-navy-foreground" : "text-navy",
        )}
      >
        {name}
      </span>
    </span>
  );
}
