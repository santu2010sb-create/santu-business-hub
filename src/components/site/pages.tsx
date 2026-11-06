import { Link } from "@tanstack/react-router";
import { ArrowRight, Check, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import founderFallback from "@/assets/founder-santu.webp";
import brandLogo from "@/assets/santu-logo.webp";
import { cn } from "@/lib/utils";
import { mediaUrl, paragraphs, pricePlans, rows, type Service, type SiteData } from "@/lib/content";
import { telLink, visibleContact, whatsappLink } from "@/lib/contact";
import { serviceIcon } from "@/lib/service-icons";
import { EnquiryForm } from "./EnquiryForm";

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
        <p className="eyebrow text-gold">{eyebrow}</p>
        <h1 className="mt-3 max-w-3xl text-4xl font-extrabold md:text-5xl">{title}</h1>
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
      <h3 className="mt-5 text-xl font-extrabold text-navy">
        {service.title}
        <UnpublishedBadge published={service.published} />
      </h3>
      <p className="mt-2 text-[0.95rem] text-muted-foreground">{service.summary}</p>
    </article>
  );
}

/** Highlight the last two words of the headline in gold, like the brand design. */
function HeroTitle({ text }: { text: string }) {
  const words = text.trim().split(/\s+/);
  if (words.length < 4) return <>{text}</>;
  const tail = words.slice(-2).join(" ");
  return (
    <>
      {words.slice(0, -2).join(" ")}{" "}
      <em className="rounded-[0.12em] bg-gold px-[0.15em] not-italic text-gold-foreground [box-decoration-break:clone]">
        {tail}
      </em>
    </>
  );
}

function WorkSlip({ site }: { site: SiteData }) {
  const items = rows(site.home.slip_items);
  if (items.length === 0) return null;
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-card sm:rotate-1">
      <div className="flex justify-between gap-3 bg-navy px-5 py-3.5 font-mono text-[0.72rem] uppercase tracking-[0.12em] text-navy-foreground">
        <span>Work slip</span>
        <span>{site.branding.location.split(",")[0]}</span>
      </div>
      <ul className="px-5 pb-3 pt-1">
        {items.map(([task, code = ""], i) => (
          <li
            key={i}
            className="grid grid-cols-[26px_1fr_auto] items-center gap-3 border-b border-dashed border-border py-3 text-[0.98rem] last:border-0"
          >
            <span className="grid size-[22px] place-items-center rounded-md bg-teal text-navy-foreground">
              <Check
                className="size-3.5 animate-tick"
                strokeWidth={3}
                style={{ animationDelay: `${400 + i * 350}ms` }}
                aria-hidden
              />
            </span>
            <span className="text-muted-foreground line-through decoration-teal">{task}</span>
            <span className="font-mono text-[0.7rem] tracking-[0.08em] text-muted-foreground">{code}</span>
          </li>
        ))}
      </ul>
      <div className="flex justify-between gap-3 border-t border-border px-5 py-3 font-mono text-[0.78rem] text-muted-foreground">
        <span>{items.length} tasks</span>
        <span className="text-teal">Handed off ✓</span>
      </div>
    </div>
  );
}

function SectionHead({ eyebrow, title, intro }: { eyebrow: string; title: string; intro?: string }) {
  return (
    <div className="max-w-2xl">
      <p className="eyebrow text-teal">{eyebrow}</p>
      <h2 className="mt-3 text-3xl font-extrabold text-navy md:text-5xl">{title}</h2>
      {intro && <p className="mt-4 text-lg text-muted-foreground">{intro}</p>}
    </div>
  );
}

function Pricing({ site }: { site: SiteData }) {
  const h = site.home;
  const plans = pricePlans(h.pricing_monthly);
  const creative = rows(h.pricing_creative);
  if (plans.length === 0 && creative.length === 0) return null;
  return (
    <section className="container-page py-16 md:py-24">
      <SectionHead eyebrow="Pricing" title={h.pricing_title} intro={h.pricing_intro} />
      {plans.length > 0 && (
        <>
          <h3 className="mt-10 text-lg font-bold text-navy">Monthly back-office support</h3>
          <div className="mt-4 grid gap-5 md:grid-cols-3">
            {plans.map((p) => (
              <article
                key={p.name}
                className={cn(
                  "relative flex flex-col rounded-2xl border bg-card p-6 shadow-soft",
                  p.featured ? "border-gold ring-2 ring-gold/40" : "border-border",
                )}
              >
                {p.featured && (
                  <span className="absolute -top-3 left-6 rounded-full bg-gold px-3 py-1 font-mono text-[0.7rem] uppercase tracking-wider text-gold-foreground">
                    Most chosen
                  </span>
                )}
                <h4 className="font-display text-xl font-bold text-navy">{p.name}</h4>
                <p className="mt-3">
                  <span className="font-display text-4xl font-extrabold text-navy">{p.amount}</span>{" "}
                  <span className="text-muted-foreground">{p.per}</span>
                </p>
                {p.hours && <p className="mt-1 font-mono text-sm text-teal">{p.hours}</p>}
                <ul className="mt-5 space-y-2 text-[0.95rem] text-muted-foreground">
                  {p.points.map((pt) => (
                    <li key={pt} className="flex gap-2">
                      <Check className="mt-1 size-4 shrink-0 text-teal" aria-hidden /> {pt}
                    </li>
                  ))}
                </ul>
                <Button asChild variant={p.featured ? "teal" : "outline"} className="mt-6 rounded-full">
                  <Link to="/contact">Ask for this</Link>
                </Button>
              </article>
            ))}
          </div>
          {h.pricing_note && <p className="mt-4 text-sm text-muted-foreground">{h.pricing_note}</p>}
        </>
      )}
      {creative.length > 0 && (
        <>
          <h3 className="mt-12 text-lg font-bold text-navy">Creative work, starting from</h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {creative.map(([name = "", amount = "", unit = ""]) => (
              <div key={name} className="rounded-2xl border border-border bg-card p-5 shadow-soft">
                <p className="font-semibold text-navy">{name}</p>
                <p className="mt-2">
                  <span className="font-display text-2xl font-extrabold text-navy">{amount}</span>{" "}
                  <span className="text-sm text-muted-foreground">{unit}</span>
                </p>
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  );
}

export function HomePage({ site }: { site: SiteData }) {
  const h = site.home;
  const custom = sectionImage(site, h.hero_image_id);
  const founderImg = sectionImage(site, h.founder_image_id) ?? {
    src: founderFallback,
    alt: `${h.founder_name}, ${h.founder_role}`,
  };
  const facts = rows(h.facts);
  const why = rows(h.why_points);
  const steps = rows(h.process_steps);
  const values = h.founder_values.split(",").map((v) => v.trim()).filter(Boolean);

  return (
    <>
      <section className="relative isolate overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-light-glow" aria-hidden />
        <div className="container-page grid items-center gap-12 py-14 md:grid-cols-[1.1fr_0.9fr] md:py-20">
          <div className="animate-rise">
            <p className="eyebrow text-teal">{h.hero_eyebrow}</p>
            <h1 className="mt-4 text-[2.6rem] leading-[1.05] text-navy sm:text-6xl lg:text-7xl">
              <HeroTitle text={h.hero_title} />
            </h1>
            <p className="mt-6 max-w-xl text-lg text-muted-foreground">{h.hero_subtitle}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild variant="teal" size="lg">
                <Link to="/contact">
                  {h.primary_cta_label} <ArrowRight />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="rounded-full">
                <Link to="/services">{h.secondary_cta_label}</Link>
              </Button>
            </div>
            <p className="mt-8 flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="size-4 text-teal" aria-hidden /> {site.branding.location}
            </p>
          </div>
          <div className="animate-rise [animation-delay:120ms]">
            {custom ? (
              <img
                src={custom.src}
                alt={custom.alt}
                fetchPriority="high"
                className="aspect-[4/3] w-full rounded-3xl object-cover shadow-card"
              />
            ) : (
              <WorkSlip site={site} />
            )}
          </div>
        </div>
        <div className="flex justify-center pb-4">
          <span className="bg-gold px-8 py-2.5 font-display text-[0.7rem] font-bold whitespace-nowrap sm:text-sm uppercase tracking-[0.08em] text-gold-foreground [clip-path:polygon(0_0,100%_0,96%_50%,100%_100%,0_100%,4%_50%)] md:text-base">
            {site.branding.tagline}
          </span>
        </div>
      </section>

      {facts.length > 0 && (
        <section className="container-page mt-8">
          <dl className="grid grid-cols-2 border-y border-border md:grid-cols-4">
            {facts.map(([n = "", label = ""], i) => (
              <div key={i} className="border-border px-4 py-6 [&:nth-child(n+3)]:border-t md:[&:nth-child(n+3)]:border-t-0 md:[&:not(:first-child)]:border-l">
                <dt className="font-display text-3xl font-extrabold text-navy">{n}</dt>
                <dd className="mt-1 text-sm text-muted-foreground">{label}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      <section className="container-page grid gap-10 py-16 md:grid-cols-2 md:py-24">
        <SectionHead eyebrow="Why us" title={h.intro_title} intro={h.intro_body} />
        {why.length > 0 && (
          <ul className="space-y-5">
            {why.map(([t = "", d = ""], i) => (
              <li key={i} className="flex gap-4 rounded-2xl border border-border bg-card p-5 shadow-soft">
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-accent text-teal">
                  <Check className="size-4" strokeWidth={3} aria-hidden />
                </span>
                <span>
                  <h3 className="text-lg font-bold text-navy">{t}</h3>
                  <p className="mt-1 text-muted-foreground">{d}</p>
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {h.founder_name && (
        <section className="container-page pb-16 md:pb-24">
          <div className="grid items-center gap-10 rounded-3xl border border-border bg-card p-6 shadow-card md:grid-cols-[0.8fr_1.2fr] md:p-10">
            <div className="relative">
              <div className="absolute -inset-3 rounded-[2rem] bg-light-glow" aria-hidden />
              <img
                src={founderImg.src}
                alt={founderImg.alt}
                width={600}
                height={750}
                loading="lazy"
                className="relative mx-auto aspect-[4/5] w-full max-w-sm rounded-3xl bg-accent object-cover"
              />
              <span className="absolute bottom-4 left-4 rounded-full bg-gold px-3 py-1 font-mono text-xs uppercase tracking-wider text-gold-foreground">
                Founder
              </span>
            </div>
            <div>
              <p className="eyebrow text-teal">About us</p>
              <h2 className="mt-3 text-3xl font-extrabold text-navy md:text-4xl">{h.founder_name}</h2>
              <p className="mt-1 font-mono text-sm text-muted-foreground">{h.founder_role}</p>
              <div className="mt-5 space-y-4">
                {paragraphs(h.founder_body).map((p, i) => (
                  <p key={i} className="prose-copy">
                    {p}
                  </p>
                ))}
              </div>
              {h.founder_quote && (
                <blockquote className="mt-6 border-l-4 border-gold pl-4 font-display text-xl font-bold text-navy">
                  “{h.founder_quote}”
                </blockquote>
              )}
              {values.length > 0 && (
                <ul className="mt-6 flex flex-wrap gap-2">
                  {values.map((v) => (
                    <li key={v} className="flex items-center gap-1.5 rounded-full bg-accent px-3 py-1.5 text-sm font-semibold text-teal">
                      <Check className="size-4" aria-hidden /> {v}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </section>
      )}

      <section className="bg-muted/60 py-16 md:py-24">
        <div className="container-page">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="eyebrow text-teal">Services</p>
              <h2 className="mt-2 text-3xl font-extrabold text-navy md:text-5xl">{h.services_title}</h2>
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

      {steps.length > 0 && (
        <section className="container-page py-16 md:py-24">
          <SectionHead eyebrow="How it works" title={h.process_title} />
          <ol className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map(([t = "", d = ""], i) => (
              <li key={i}>
                <span className="font-mono text-xs tracking-[0.14em] text-teal">STEP {i + 1}</span>
                <div className="my-3 h-1 rounded-full bg-gradient-to-r from-teal to-gold" aria-hidden />
                <h3 className="text-lg font-bold text-navy">{t}</h3>
                <p className="mt-1 text-muted-foreground">{d}</p>
              </li>
            ))}
          </ol>
        </section>
      )}

      <Pricing site={site} />

      <CtaBand site={site} />
    </>
  );
}

function CtaBand({ site }: { site: SiteData }) {
  const h = site.home;
  return (
    <section className="container-page py-16 md:py-24">
      <div className="relative flex flex-col items-start gap-6 overflow-hidden rounded-3xl bg-hero p-8 text-navy-foreground shadow-card md:flex-row md:items-center md:justify-between md:p-12">
        <img src={brandLogo} alt="" width={96} height={96} loading="lazy" className="size-20 rounded-full md:size-24" />
        <div className="max-w-2xl md:flex-1">
          <h2 className="text-3xl font-extrabold md:text-4xl">{h.cta_title}</h2>
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
                    <h2 className="text-xl font-extrabold text-navy">
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
              <h2 className="text-2xl font-extrabold text-navy">{a.focus_title}</h2>
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
          <h2 className="text-2xl font-extrabold text-navy">Contact details</h2>
          <ul className="space-y-4 text-[0.98rem]">
            <li className="flex gap-3">
              <MapPin className="mt-1 size-5 shrink-0 text-teal" aria-hidden />
              <span>{address ?? site.branding.location}</span>
            </li>
            {email && (
              <li className="flex gap-3">
                <Mail className="mt-1 size-5 shrink-0 text-teal" aria-hidden />
                <a href={`mailto:${email}`} className="break-all font-extrabold text-navy hover:text-teal">
                  {email}
                </a>
              </li>
            )}
            {phone && (
              <li className="flex gap-3">
                <Phone className="mt-1 size-5 shrink-0 text-teal" aria-hidden />
                <a href={telLink(phone)} className="font-extrabold text-navy hover:text-teal">
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
          <h2 className="text-2xl font-extrabold text-navy">Send an enquiry</h2>
          <p className="mt-1 text-sm text-muted-foreground">Fields marked * are required.</p>
          <EnquiryForm services={site.services} disabled={preview} />
        </div>
      </section>
    </>
  );
}
