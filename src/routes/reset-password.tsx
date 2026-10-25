import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/reset-password")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Choose a new password | SANTU BUSINESS SERVICES" },
      { name: "description", content: "Set a new password for your staff account." },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Choose a new password | SANTU BUSINESS SERVICES" },
      { property: "og:description", content: "Set a new password for your staff account." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ResetPassword,
});

function ResetPassword() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const isRecovery = window.location.hash.includes("type=recovery");
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setReady(true);
    });
    supabase.auth.getSession().then(({ data: s }) => {
      if (s.session && isRecovery) setReady(true);
    });
    if (isRecovery) setReady(true);
    return () => data.subscription.unsubscribe();
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 8) return setError("Password must be at least 8 characters.");
    if (password !== confirm) return setError("Passwords do not match.");
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) return setError(error.message);
    navigate({ to: "/admin", replace: true });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-hero px-4 py-10">
      <div className="w-full max-w-md rounded-3xl bg-card p-7 shadow-card md:p-9">
        <h1 className="text-3xl font-medium text-navy">Choose a new password</h1>
        {!ready ? (
          <p className="mt-4 text-sm text-muted-foreground">
            Open this page from the reset link in your email. If the link has expired, request a new one from the sign-in page.
          </p>
        ) : (
          <form onSubmit={onSubmit} className="mt-6 grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="pw">New password</Label>
              <Input id="pw" type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="pw2">Confirm new password</Label>
              <Input id="pw2" type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
            </div>
            {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
            <Button type="submit" size="lg" disabled={busy}>
              {busy && <Loader2 className="animate-spin" />} Save new password
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
