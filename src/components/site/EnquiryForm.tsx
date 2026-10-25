import { useEffect, useState, type FormEvent } from "react";
import { useServerFn } from "@tanstack/react-start";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { enquirySchema } from "@/lib/enquiry-schema";
import { submitEnquiry } from "@/lib/enquiry.functions";
import type { Service } from "@/lib/content";

type Fields = {
  name: string;
  business_name: string;
  email: string;
  phone: string;
  service: string;
  message: string;
  website: string;
};
const EMPTY: Fields = { name: "", business_name: "", email: "", phone: "", service: "", message: "", website: "" };

const selectClass =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 text-base shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring md:text-sm";

export function EnquiryForm({ services, disabled = false }: { services: Service[]; disabled?: boolean }) {
  const submit = useServerFn(submitEnquiry);
  const [fields, setFields] = useState<Fields>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof Fields, string>>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [startedAt, setStartedAt] = useState(0);

  useEffect(() => setStartedAt(Date.now()), []);

  const set = (k: keyof Fields) => (e: { target: { value: string } }) =>
    setFields((f) => ({ ...f, [k]: e.target.value }));

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (disabled) return;
    setFormError(null);
    const parsed = enquirySchema.safeParse({ ...fields, started_at: startedAt || Date.now() });
    if (!parsed.success) {
      const next: typeof errors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof Fields;
        if (!next[key]) next[key] = issue.message;
      }
      setErrors(next);
      return;
    }
    setErrors({});
    setStatus("sending");
    try {
      const res = await submit({ data: parsed.data });
      if (res.ok) {
        setStatus("sent");
        setFields(EMPTY);
      } else {
        setStatus("idle");
        setFormError(res.error);
      }
    } catch {
      setStatus("idle");
      setFormError("We couldn't send your enquiry. Please check your details and try again.");
    }
  }

  if (status === "sent") {
    return (
      <div role="status" className="mt-6 rounded-2xl bg-accent p-6 text-accent-foreground">
        <CheckCircle2 className="size-8 text-teal" aria-hidden />
        <h3 className="mt-3 text-xl font-medium text-navy">Thank you — your enquiry has been sent.</h3>
        <p className="mt-2">We have received your message and will get back to you.</p>
        <Button variant="outline" className="mt-5" onClick={() => { setStatus("idle"); setStartedAt(Date.now()); }}>
          Send another enquiry
        </Button>
      </div>
    );
  }

  const field = (k: keyof Fields) => ({
    id: `enq-${k}`,
    name: k,
    value: fields[k],
    onChange: set(k),
    "aria-invalid": !!errors[k] || undefined,
    "aria-describedby": errors[k] ? `enq-${k}-err` : undefined,
  });
  const err = (k: keyof Fields) =>
    errors[k] ? (
      <p id={`enq-${k}-err`} className="text-sm text-destructive">
        {errors[k]}
      </p>
    ) : null;

  return (
    <form onSubmit={onSubmit} noValidate className="mt-6 grid gap-5">
      {disabled && (
        <p className="rounded-md bg-warning/30 p-3 text-sm text-warning-foreground">
          Preview mode — the form is shown for layout only and does not send.
        </p>
      )}
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="enq-name">Your name *</Label>
          <Input {...field("name")} autoComplete="name" maxLength={100} required />
          {err("name")}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="enq-business_name">Business name</Label>
          <Input {...field("business_name")} autoComplete="organization" maxLength={150} />
          {err("business_name")}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="enq-email">Email *</Label>
          <Input {...field("email")} type="email" autoComplete="email" inputMode="email" maxLength={255} required />
          {err("email")}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="enq-phone">Phone</Label>
          <Input {...field("phone")} type="tel" autoComplete="tel" inputMode="tel" maxLength={30} placeholder="+91" />
          {err("phone")}
        </div>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="enq-service">Service you're interested in</Label>
        <select {...field("service")} className={selectClass}>
          <option value="">Choose a service (optional)</option>
          {services.filter((s) => s.published).map((s) => (
            <option key={s.id} value={s.title}>
              {s.title}
            </option>
          ))}
          <option value="Not sure / other">Not sure / other</option>
        </select>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="enq-message">How can we help? *</Label>
        <Textarea {...field("message")} rows={5} maxLength={2000} required />
        <div className="flex justify-between gap-4">
          {err("message") ?? <span />}
          <span className="text-xs text-muted-foreground">{fields.message.length}/2000</span>
        </div>
      </div>
      {/* Honeypot: hidden from people, often filled by bots. */}
      <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="enq-website">Website</label>
        <input id="enq-website" name="website" tabIndex={-1} autoComplete="off" value={fields.website} onChange={set("website")} />
      </div>
      {formError && (
        <p role="alert" className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {formError}
        </p>
      )}
      <p className="text-xs text-muted-foreground">
        Your details are used only to respond to your enquiry.
      </p>
      <Button type="submit" size="lg" disabled={disabled || status === "sending"} className="w-full sm:w-auto sm:justify-self-start">
        {status === "sending" ? (
          <>
            <Loader2 className="animate-spin" /> Sending…
          </>
        ) : (
          "Send enquiry"
        )}
      </Button>
    </form>
  );
}
