import { Link } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { Menu, X, MapPin, Mail, Phone, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "./Logo";
import type { SiteData } from "@/lib/content";
import { SOCIAL_KEYS, telLink, visibleContact, whatsappLink } from "@/lib/contact";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/services", label: "Services" },
  { to: "/about", label: "About" },
  { to: "/faq", label: "FAQ" },
  { to: "/contact", label: "Contact" },
] as const;

const SOCIAL_LABELS: Record<(typeof SOCIAL_KEYS)[number], string> = {
  facebook: "Facebook",
  instagram: "Instagram",
  linkedin: "LinkedIn",
  x: "X",
  youtube: "YouTube",
};

export function SiteShell({
  site,
  children,
  banner,
}: {
  site: SiteData;
  children: ReactNode;
  banner?: ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-card focus:px-4 focus:py-2"
      >
        Skip to content
      </a>
      {banner}
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/90 backdrop-blur">
        <div className="container-page flex h-16 items-center justify-between gap-4 md:h-20">
          <Link to="/" aria-label={`${site.branding.business_name} home`} onClick={() => setOpen(false)}>
            <Logo site={site} />
          </Link>
          <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                activeOptions={{ exact: item.to === "/" }}
                className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground data-[status=active]:text-navy data-[status=active]:font-semibold"
              >
                {item.label}
              </Link>
            ))}
            <Button asChild className="ml-3">
              <Link to="/contact">{site.home.primary_cta_label}</Link>
            </Button>
          </nav>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X /> : <Menu />}
          </Button>
        </div>
        {open && (
          <nav id="mobile-nav" aria-label="Mobile" className="border-t border-border bg-background md:hidden">
            <div className="container-page flex flex-col py-3">
              {NAV.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  activeOptions={{ exact: item.to === "/" }}
                  onClick={() => setOpen(false)}
                  className="rounded-md px-2 py-3 text-base font-medium text-foreground data-[status=active]:text-teal"
                >
                  {item.label}
                </Link>
              ))}
              <Button asChild size="lg" className="mt-2">
                <Link to="/contact" onClick={() => setOpen(false)}>
                  {site.home.primary_cta_label}
                </Link>
              </Button>
            </div>
          </nav>
        )}
      </header>

      <main id="main" className="flex-1">
        {children}
      </main>

      <SiteFooter site={site} />
    </div>
  );
}

function SiteFooter({ site }: { site: SiteData }) {
  const email = visibleContact(site.contact, "email");
  const phone = visibleContact(site.contact, "phone");
  const whatsapp = visibleContact(site.contact, "whatsapp");
  const address = visibleContact(site.contact, "address");
  const socials = SOCIAL_KEYS.map((k) => ({ key: k, url: visibleContact(site.contact, k) })).filter(
    (s): s is { key: (typeof SOCIAL_KEYS)[number]; url: string } => !!s.url,
  );

  return (
    <footer className="bg-navy-deep text-navy-foreground">
      <div className="container-page grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr]">
        <div className="space-y-4">
          <Logo site={site} inverted />
          <p className="max-w-sm text-sm text-navy-muted">{site.footer.blurb}</p>
          <p className="eyebrow text-teal">{site.branding.tagline}</p>
        </div>
        <div>
          <h2 className="eyebrow mb-4 text-navy-muted">Explore</h2>
          <ul className="space-y-2 text-sm">
            {NAV.map((item) => (
              <li key={item.to}>
                <Link to={item.to} className="text-navy-foreground/90 hover:text-teal">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="eyebrow mb-4 text-navy-muted">Get in touch</h2>
          <ul className="space-y-3 text-sm">
            <li className="flex gap-2">
              <MapPin className="mt-0.5 size-4 shrink-0 text-teal" aria-hidden />
              <span>{address ?? site.branding.location}</span>
            </li>
            {email && (
              <li className="flex gap-2">
                <Mail className="mt-0.5 size-4 shrink-0 text-teal" aria-hidden />
                <a href={`mailto:${email}`} className="break-all hover:text-teal">
                  {email}
                </a>
              </li>
            )}
            {phone && (
              <li className="flex gap-2">
                <Phone className="mt-0.5 size-4 shrink-0 text-teal" aria-hidden />
                <a href={telLink(phone)} className="hover:text-teal">
                  {phone}
                </a>
              </li>
            )}
            {whatsapp && (
              <li className="flex gap-2">
                <MessageCircle className="mt-0.5 size-4 shrink-0 text-teal" aria-hidden />
                <a href={whatsappLink(whatsapp)} target="_blank" rel="noopener noreferrer" className="hover:text-teal">
                  WhatsApp
                </a>
              </li>
            )}
            <li>
              <Link to="/contact" className="font-semibold text-teal hover:underline">
                Send an enquiry →
              </Link>
            </li>
          </ul>
          {socials.length > 0 && (
            <ul className="mt-5 flex flex-wrap gap-x-4 gap-y-2 text-sm">
              {socials.map((s) => (
                <li key={s.key}>
                  <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-navy-muted hover:text-teal">
                    {SOCIAL_LABELS[s.key]}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <div className="border-t border-navy-foreground/10">
        <div className="container-page flex flex-col gap-2 py-5 text-xs text-navy-muted sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {site.branding.business_name}. {site.footer.note}
          </p>
          <Link to="/admin" className="hover:text-teal">
            Staff login
          </Link>
        </div>
      </div>
    </footer>
  );
}
