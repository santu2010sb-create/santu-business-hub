import { Link } from "@tanstack/react-router";
import { ArrowRight, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import heroFallback from "@/assets/hero-desk.jpg";
import { mediaUrl, paragraphs, type Service, type SiteData } from "@/lib/content";
import { telLink, visibleContact, whatsappLink } from "@/lib/contact";
import { serviceIcon } from "@/lib/service-icons";
import { EnquiryForm } from "./EnquiryForm";

const FALLBACK_HERO_ALT = "A tidy office desk with neatly stacked documents and a laptop";

function sectionImage(site: SiteData, id: string | null) {
  const m = id ? site.media[id] : undefined;
  return m ? { src: mediaUrl(m.path), alt: m.alt_text } : null;
}

function UnpublishedBadge({ published }: { published: boolean }) {
  if (published) return null;
  return (
    <span className="ml-2 rounded-full bg-warning px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wide text-warning-foreground">
      Hidden from public
    </span>
  );
}

export function PageIntro({ eyebrow, title, intro }: { eyebrow: string; title: string; intro?: string }) {
  return (
    <section className="bg-hero text-navy-foreground">
      <div className="container-page py-14 md:py-20">
        <p className="eyebrow text-teal">{eyebrow}</p>
        <h1 className="mt-3 max-w-3xl text-4xl font-medium md:text-5xl">{title}</h1>
        {intro && <p className="mt-4 max-w-2xl text-lg text-navy-muted">{intro}</p>}
      </div>
    </section>
  );
}

function ServiceCard({ service }: { service: Service }) {
  const Icon = serviceIcon(service.icon);
  return (
    <article className="group flex h-full flex-col rounded-2xl border border-border bg-card p-6 shadow-soft transition-shadow hover:shadow-card">
      <span className="grid size-12 place-items-center rounded-xl bg-accent text-accent-foreground">
        <Icon className="size-6" aria-hidden />
      </span>
      <h3 className="mt-5 text-xl font-medium text-navy">
        {service.title}
        <UnpublishedBadge published={service.published} />
      </h3>
      <p className="mt-2 text-[0.95rem] text-muted-foreground">{service.summary}</p>
    </article>
  );
}

export function HomePage({ site }: { site: SiteData }) {
  const h = site.home;
  const img = sectionImage(site, h.hero_image_id) ?? { src: heroFallback, alt: FALLBACK_HERO_ALT };

  return (
    <>
      <section className="bg-hero text-navy-foreground">
        <div className="container-page grid items-center gap-10 py-14 md:grid-cols-[1.1fr_1fr] md:py-24">
          <div className="animate-rise">
            <p className="eyebrow text-teal">{h.hero_eyebrow}</p>
            <h1 className="mt-4 text-[2.5rem] font-medium leading-[1.05] sm:text-5xl lg:text-6xl">{h.hero_title}</h1>
            <p className="mt-6 max-w-xl text-lg text-navy-muted">{h.hero_subtitle}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild variant="teal" size="lg">
                <Link to="/contact">
                  {h.primary_cta_label} <ArrowRight />
                </Link>
              </Button>
              <Button asChild variant="on-navy" size="lg">
                <Link to="/services">{h.secondary_cta_label}</Link>
              </Button>
            </div>
            <p className="mt-8 flex items-center gap-2 text-sm text-navy-muted">
              <MapPin className="size-4 text-teal" aria-hidden /> {site.branding.location}
            </p>
          </div>
          <div className="relative animate-rise [animation-delay:120ms]">
            <div className="absolute -inset-3 -z-0 rounded-[1.75rem] bg-teal/15 blur-2xl" aria-hidden />
            <img
              src={img.src}
              alt={img.alt}
              width={1600}
              height={1072}
              fetchPriority="high"
              className="relative aspect-[4/3] w-full rounded-3xl object-cover shadow-card"
            />
          </div>
        </div>
      </section>

      <section className="container-page grid gap-6 py-16 md:grid-cols-[1fr_1.4fr] md:py-24">
        <h2 className="text-3xl font-medium text-navy md:text-4xl">{h.intro_title}</h2>
        <p className="prose-copy">{h.intro_body}</p>
      </section>

      <section className="bg-muted/60 py-16 md:py-24">
        <div className="container-page">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="eyebrow text-teal">Services</p>
              <h2 className="mt-2 text-3xl font-medium text-navy md:text-4xl">{h.services_title}</h2>
              <p className="mt-3 max-w-xl text-muted-foreground">{h.services_intro}</p>
            </div>
            <Button asChild variant="outline">
              <Link to="/services">
                All services <ArrowRight />
              </Link>
            </Button>
          </div>
          {site.services.length > 0 ? (
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {site.services.map((s) => (
                <ServiceCard key={s.id} service={s} />
              ))}
            </div>
          ) : (
            <p className="mt-10 text-muted-foreground">Service details are coming soon.</p>
          )}
        </div>
      </section>

      <CtaBand site={site} />
    </>
  );
}

function CtaBand({ site }: { site: SiteData }) {
  const h = site.home;
  return (
    <section className="container-page py-16 md:py-24">
      <div className="flex flex-col items-start gap-6 rounded-3xl bg-navy p-8 text-navy-foreground shadow-card md:flex-row md:items-center md:justify-between md:p-12">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-medium md:text-4xl">{h.cta_title}</h2>
          <p className="mt-3 text-navy-muted">{h.cta_body}</p>
        </div>
        <Button asChild variant="teal" size="lg">
          <Link to="/contact">
            {h.cta_label} <ArrowRight />
          </Link>
        </Button>
      </div>
    </section>
  );
}

export function ServicesPage({ site }: { site: SiteData }) {
  return (
    <>
      <PageIntro eyebrow="Services" title={site.home.services_title} intro={site.home.services_intro} />
      <section className="container-page py-14 md:py-20">
        {site.services.length === 0 ? (
          <p className="text-muted-foreground">Service details are coming soon. Please get in touch to discuss your needs.</p>
        ) : (
          <ul className="grid gap-5 md:grid-cols-2">
            {site.services.map((s) => {
              const Icon = serviceIcon(s.icon);
              return (
                <li key={s.id} className="flex gap-5 rounded-2xl border border-border bg-card p-6 shadow-soft">
                  <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-accent text-accent-foreground">
                    <Icon className="size-6" aria-hidden />
                  </span>
                  <div>
                    <h2 className="text-xl font-medium text-navy">
                      {s.title}
                      <UnpublishedBadge published={s.published} />
                    </h2>
                    <p className="mt-2 text-muted-foreground">{s.summary}</p>
                    {paragraphs(s.details).map((p, i) => (
                      <p key={i} className="mt-3 text-[0.95rem] text-muted-foreground">
                        {p}
                      </p>
                    ))}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
      <CtaBand site={site} />
    </>
  );
}

export function AboutPage({ site }: { site: SiteData }) {
  const a = site.about;
  const img = sectionImage(site, a.image_id);
  return (
    <>
      <PageIntro eyebrow="About" title={a.title} intro={a.intro} />
      <section className="container-page grid gap-10 py-14 md:grid-cols-[1.3fr_1fr] md:py-20">
        <div className="space-y-5">
          {paragraphs(a.body).map((p, i) => (
            <p key={i} className="prose-copy">
              {p}
            </p>
          ))}
        </div>
        <aside className="space-y-6">
          {img && (
            <img
              src={img.src}
              alt={img.alt}
              loading="lazy"
              className="aspect-[4/3] w-full rounded-2xl object-cover shadow-card"
            />
          )}
          {(a.focus_title || a.focus_body) && (
            <div className="rounded-2xl border border-border bg-accent/60 p-6">
              <h2 className="text-2xl font-medium text-navy">{a.focus_title}</h2>
              <p className="mt-2 text-accent-foreground">{a.focus_body}</p>
            </div>
          )}
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="size-4 text-teal" aria-hidden /> {site.branding.location}
          </p>
        </aside>
      </section>
      <CtaBand site={site} />
    </>
  );
}

export function FaqPage({ site }: { site: SiteData }) {
  return (
    <>
      <PageIntro eyebrow="FAQ" title="Frequently asked questions" />
      <section className="container-page max-w-3xl py-14 md:py-20">
        {site.faqs.length === 0 ? (
          <p className="text-muted-foreground">No questions have been published yet.</p>
        ) : (
          <Accordion type="single" collapsible className="divide-y divide-border rounded-2xl border border-border bg-card px-5 shadow-soft">
            {site.faqs.map((f) => (
              <AccordionItem key={f.id} value={f.id} className="border-0">
                <AccordionTrigger className="py-5 text-left text-base font-semibold text-navy">
                  <span>
                    {f.question}
                    <UnpublishedBadge published={f.published} />
                  </span>
                </AccordionTrigger>
                <AccordionContent className="pb-5 text-[0.98rem] text-muted-foreground">
                  {paragraphs(f.answer).map((p, i) => (
                    <p key={i} className={i ? "mt-3" : ""}>
                      {p}
                    </p>
                  ))}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
        <p className="mt-10 text-muted-foreground">
          Have another question?{" "}
          <Link to="/contact" className="font-semibold text-navy underline underline-offset-4 hover:text-teal">
            Send us an enquiry
          </Link>
          .
        </p>
      </section>
    </>
  );
}

export function ContactPage({ site, preview = false }: { site: SiteData; preview?: boolean }) {
  const c = site.contact;
  const email = visibleContact(c, "email");
  const phone = visibleContact(c, "phone");
  const whatsapp = visibleContact(c, "whatsapp");
  const address = visibleContact(c, "address");

  return (
    <>
      <PageIntro eyebrow="Contact" title="Let's talk about your business" intro={c.intro} />
      <section className="container-page grid gap-10 py-14 md:grid-cols-[1fr_1.5fr] md:py-20">
        <aside className="space-y-4">
          <h2 className="text-2xl font-medium text-navy">Contact details</h2>
          <ul className="space-y-4 text-[0.98rem]">
            <li className="flex gap-3">
              <MapPin className="mt-1 size-5 shrink-0 text-teal" aria-hidden />
              <span>{address ?? site.branding.location}</span>
            </li>
            {email && (
              <li className="flex gap-3">
                <Mail className="mt-1 size-5 shrink-0 text-teal" aria-hidden />
                <a href={`mailto:${email}`} className="break-all font-medium text-navy hover:text-teal">
                  {email}
                </a>
              </li>
            )}
            {phone && (
              <li className="flex gap-3">
                <Phone className="mt-1 size-5 shrink-0 text-teal" aria-hidden />
                <a href={telLink(phone)} className="font-medium text-navy hover:text-teal">
                  {phone}
                </a>
              </li>
            )}
          </ul>
          {whatsapp && (
            <Button asChild variant="teal" size="lg" className="w-full sm:w-auto">
              <a href={whatsappLink(whatsapp)} target="_blank" rel="noopener noreferrer">
                <MessageCircle /> Chat on WhatsApp
              </a>
            </Button>
          )}
          {!email && !phone && !whatsapp && (
            <p className="rounded-xl bg-muted p-4 text-sm text-muted-foreground">
              The quickest way to reach us is the enquiry form. We will reply using the details you provide.
            </p>
          )}
        </aside>
        <div className="rounded-3xl border border-border bg-card p-6 shadow-card md:p-8">
          <h2 className="text-2xl font-medium text-navy">Send an enquiry</h2>
          <p className="mt-1 text-sm text-muted-foreground">Fields marked * are required.</p>
          <EnquiryForm services={site.services} disabled={preview} />
        </div>
      </section>
    </>
  );
}
