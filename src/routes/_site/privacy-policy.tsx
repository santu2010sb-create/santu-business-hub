
import { createFileRoute } from "@tanstack/react-router";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/_site/privacy-policy")({
  head: () =>
    seo(
      "Privacy Policy",
      "Privacy Policy for SANTU BUSINESS SERVICES.",
    ),
  component: PrivacyPolicyPage,
});

function PrivacyPolicyPage() {
  return (
    <article className="container-page mx-auto max-w-3xl px-4 py-12 md:py-16">
      <h1 className="text-4xl font-medium text-navy">
        Privacy Policy
      </h1>

      <p className="mt-3 text-sm text-muted-foreground">
        Last updated: 27 October 2026
      </p>

      <div className="mt-8 space-y-6 leading-7">
        <section>
          <h2 className="text-xl font-semibold">1. Introduction</h2>
          <p className="mt-2">
            SANTU BUSINESS SERVICES respects your privacy. This policy
            explains how we handle information submitted through our website.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">2. Information collected</h2>
          <p className="mt-2">
            When you send an enquiry, we may collect your name, contact
            details, requested services, and the message you submit.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">3. How we use information</h2>
          <p className="mt-2">
            We use enquiry information to respond to your questions, discuss
            services, provide support, and manage business enquiries.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">4. Storage and security</h2>
          <p className="mt-2">
            We use access controls and reasonable safeguards to protect
            information. We retain it only for as long as reasonably needed
            for business, operational, or legal purposes.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">5. Sharing information</h2>
          <p className="mt-2">
            Information may be processed by service providers that help
            operate our website, or disclosed where required by law.
            We do not sell personal information.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">6. Your choices</h2>
          <p className="mt-2">
            You may contact us to ask about your personal information or
            request correction or deletion, subject to applicable legal
            requirements and records we must retain.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold">7. Contact us</h2>
          <p className="mt-2">
            For privacy-related questions, contact SANTU BUSINESS SERVICES:
          </p>
          <p className="mt-2">
            <a
              className="text-teal underline"
              href="mailto:santu2010.sb@gmail.com"
            >
              santu2010.sb@gmail.com
            </a>
          </p>
          <p>
            6B, Clive Row, Kolkata – 700001, West Bengal, India
          </p>
        </section>
      </div>
    </article>
  );
}
