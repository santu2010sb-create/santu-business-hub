import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { z } from "zod";
import { Loader2, Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/auth")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Staff sign in | SANTU BUSINESS SERVICES" },
      { name: "description", content: "Sign in to manage the SANTU BUSINESS SERVICES website." },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Staff sign in | SANTU BUSINESS SERVICES" },
      { property: "og:description", content: "Website administration sign in." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

const credsSchema = z.object({
  email: z.string().trim().email("Enter a valid email address.").max(255),
  password: z.string().min(8, "Password must be at least 8 characters.").max(72),
});

type Mode = "signin" | "setup" | "forgot";

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("signin");
  const [ownerMissing, setOwnerMissing] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) navigate({ to: "/admin", replace: true });
    });
    supabase.rpc("admin_exists").then(({ data }) => {
      if (data === false) {
        setOwnerMissing(true);
        setMode("setup");
      }
    });
  }, [navigate]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setNotice(null);

    if (mode === "forgot") {
      const parsed = z.string().trim().email().safeParse(email);
      if (!parsed.success) return setError("Enter a valid email address.");
      setBusy(true);
      const { error } = await supabase.auth.resetPasswordForEmail(parsed.data, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      setBusy(false);
      if (error) return setError(error.message);
      return setNotice("If an account exists for that email, a reset link is on its way.");
    }

    const parsed = credsSchema.safeParse({ email, password });
    if (!parsed.success) return setError(parsed.error.issues[0].message);
    setBusy(true);

    if (mode === "setup") {
      const { data, error } = await supabase.auth.signUp({
        email: parsed.data.email,
        password: parsed.data.password,
        options: { emailRedirectTo: `${window.location.origin}/admin` },
      });
      setBusy(false);
      if (error) return setError(error.message);
      if (data.session) return navigate({ to: "/admin", replace: true });
      setMode("signin");
      return setNotice("Owner account created. Check your email and click the confirmation link, then sign in.");
    }

    const { error } = await supabase.auth.signInWithPassword(parsed.data);
    setBusy(false);
    if (error) return setError(error.message === "Invalid login credentials" ? "Incorrect email or password." : error.message);
    navigate({ to: "/admin", replace: true });
  }

  const title =
    mode === "setup" ? "Create the owner account" : mode === "forgot" ? "Reset your password" : "Staff sign in";

  return (
    <div className="flex min-h-screen items-center justify-center bg-hero px-4 py-10">
      <div className="w-full max-w-md rounded-3xl bg-card p-7 shadow-card md:p-9">
        <span className="grid size-12 place-items-center rounded-xl bg-accent text-accent-foreground">
          <Lock className="size-6" aria-hidden />
        </span>
        <h1 className="mt-5 text-3xl font-medium text-navy">{title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {mode === "setup"
            ? "No administrator exists yet. The first account created here becomes the website owner with full admin access."
            : mode === "forgot"
              ? "We'll email you a link to choose a new password."
              : "For authorised SANTU BUSINESS SERVICES staff only."}
        </p>

        <form onSubmit={onSubmit} noValidate className="mt-6 grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          {mode !== "forgot" && (
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete={mode === "setup" ? "new-password" : "current-password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          )}
          {error && (
            <p role="alert" className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </p>
          )}
          {notice && (
            <p role="status" className="rounded-md bg-accent p-3 text-sm text-accent-foreground">
              {notice}
            </p>
          )}
          <Button type="submit" size="lg" disabled={busy}>
            {busy && <Loader2 className="animate-spin" />}
            {mode === "setup" ? "Create owner account" : mode === "forgot" ? "Send reset link" : "Sign in"}
          </Button>
        </form>

        <div className="mt-5 flex flex-wrap justify-between gap-3 text-sm">
          {mode === "signin" ? (
            <button type="button" className="text-navy underline-offset-4 hover:underline" onClick={() => setMode("forgot")}>
              Forgot password?
            </button>
          ) : (
            <button type="button" className="text-navy underline-offset-4 hover:underline" onClick={() => setMode("signin")}>
              Back to sign in
            </button>
          )}
          {ownerMissing && mode === "signin" && (
            <button type="button" className="text-navy underline-offset-4 hover:underline" onClick={() => setMode("setup")}>
              Create owner account
            </button>
          )}
          <Link to="/" className="text-muted-foreground hover:text-navy">
            ← Back to website
          </Link>
        </div>
      </div>
    </div>
  );
}
