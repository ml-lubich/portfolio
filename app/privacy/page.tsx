import type { Metadata } from "next"
import Link from "next/link"
import { SITE_URL } from "@/lib/site-config"

const CONTACT_EMAIL = "michaelle.lubich@gmail.com"
const EFFECTIVE_DATE = "April 4, 2026"

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How Misha Lubich’s portfolio site handles personal data, cookies, third-party services, and your privacy rights.",
  alternates: {
    canonical: `${SITE_URL}/privacy`,
  },
  openGraph: {
    title: "Privacy Policy | Misha Lubich",
    description:
      "Privacy practices for mishalubich.com — data collection, hosting, third parties, and your rights.",
    url: `${SITE_URL}/privacy`,
  },
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-6 py-6">
          <Link
            href="/"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            ← Back to portfolio
          </Link>
        </div>
      </header>

      <main id="main-content" role="main" className="mx-auto max-w-3xl px-6 py-12">
        <article className="space-y-6 text-sm leading-relaxed text-muted-foreground sm:text-base">
          <h1 className="text-3xl font-medium tracking-tight text-foreground sm:text-4xl">Privacy Policy</h1>
          <p className="text-sm text-muted-foreground">
            Effective date: {EFFECTIVE_DATE}. Last updated: {EFFECTIVE_DATE}.
          </p>

          <p>
            This policy describes how information is handled when you visit{" "}
            <strong className="text-foreground">{SITE_URL.replace(/^https?:\/\//, "")}</strong> (the
            &quot;Site&quot;), operated by Misha Lubich (&quot;we,&quot; &quot;us&quot;). This Site is a
            personal portfolio and blog. It is not directed at children under 16.
          </p>

          <h2 className="mt-10 text-lg font-medium tracking-tight text-foreground sm:text-xl">
            1. Information we collect
          </h2>
          <p>
            <strong className="text-foreground">You provide.</strong> If you choose to email or otherwise
            contact us, we receive whatever you send (for example, your name, email address, and message
            content).
          </p>
          <p>
            <strong className="text-foreground">Automatically.</strong> Like most websites, our hosting and
            infrastructure may log technical data when you load pages, such as your IP address, approximate
            location derived from IP, browser type, device type, referring URL, and timestamps. We use this
            information to operate, secure, and improve the Site.
          </p>

          <h2 className="mt-10 text-lg font-medium tracking-tight text-foreground sm:text-xl">
            2. Cookies and similar technologies
          </h2>
          <p>
            The Site may use cookies or local storage that are strictly necessary for basic functionality
            (for example, preferences or load balancing). If we add optional analytics or marketing tools
            in the future, we will update this policy and, where required, obtain consent before
            non-essential cookies are set.
          </p>

          <h2 className="mt-10 text-lg font-medium tracking-tight text-foreground sm:text-xl">
            3. Third-party services
          </h2>
          <p>
            The Site is hosted and delivered through service providers (for example, hosting and CDN
            vendors). Those providers process technical data on our behalf under their own terms and privacy
            policies. The Site also links to third-party sites and services (such as GitHub, LinkedIn, or
            scheduling tools). Their privacy practices apply when you leave the Site.
          </p>

          <h2 className="mt-10 text-lg font-medium tracking-tight text-foreground sm:text-xl">
            4. How we use information
          </h2>
          <p>We use the information above to:</p>
          <ul className="list-inside list-disc space-y-2 pl-1">
            <li>Provide and maintain the Site</li>
            <li>Respond to inquiries you send us</li>
            <li>Monitor security and prevent abuse</li>
            <li>Comply with legal obligations</li>
          </ul>

          <h2 className="mt-10 text-lg font-medium tracking-tight text-foreground sm:text-xl">
            5. Legal bases (EEA, UK, and similar jurisdictions)
          </h2>
          <p>
            Where applicable law requires a legal basis, we rely on: (a) our legitimate interests in
            operating a public portfolio and securing the Site, balanced against your rights; (b)
            performance of a contract or steps at your request when you contact us; and (c) compliance
            with legal obligations.
          </p>

          <h2 className="mt-10 text-lg font-medium tracking-tight text-foreground sm:text-xl">6. Retention</h2>
          <p>
            Server and security logs are kept only as long as needed for the purposes above or as required
            by law. Messages you send by email are retained as long as necessary to respond and manage our
            relationship, unless a longer period is required for legal, security, or compliance reasons.
          </p>

          <h2 className="mt-10 text-lg font-medium tracking-tight text-foreground sm:text-xl">7. Your rights</h2>
          <p>
            Depending on where you live, you may have rights to access, correct, delete, or restrict
            processing of your personal data, to object to certain processing, or to data portability. You may
            also have the right to lodge a complaint with a supervisory authority. To exercise these rights,
            contact us using the email below. California residents may have additional rights under the
            CCPA/CPRA (for example, to know what we collect and to request deletion, subject to exceptions).
          </p>

          <h2 className="mt-10 text-lg font-medium tracking-tight text-foreground sm:text-xl">
            8. International transfers
          </h2>
          <p>
            If you access the Site from outside the United States, your information may be processed in the
            United States or other countries where our providers operate. We take steps consistent with
            applicable law when transferring data across borders.
          </p>

          <h2 className="mt-10 text-lg font-medium tracking-tight text-foreground sm:text-xl">9. Security</h2>
          <p>
            We use reasonable administrative and technical measures to protect information. No method of
            transmission over the Internet is completely secure.
          </p>

          <h2 className="mt-10 text-lg font-medium tracking-tight text-foreground sm:text-xl">10. Changes</h2>
          <p>
            We may update this policy from time to time. The &quot;Last updated&quot; date at the top will
            change when we do. Continued use of the Site after changes means you accept the revised policy.
          </p>

          <h2 className="mt-10 text-lg font-medium tracking-tight text-foreground sm:text-xl">11. Contact</h2>
          <p>
            Questions about this policy:{" "}
            <a
              href={`mailto:${CONTACT_EMAIL}?subject=Privacy%20policy%20inquiry`}
              className="text-primary underline-offset-4 hover:underline"
            >
              {CONTACT_EMAIL}
            </a>
            .
          </p>

          <p className="mt-12 border-t border-border pt-8 text-xs text-muted-foreground">
            See also{" "}
            <Link href="/terms" className="text-primary underline-offset-4 hover:underline">
              Terms of Use
            </Link>
            . This page is provided for transparency and compliance purposes. It is not legal advice. For
            specific legal questions, consult a qualified attorney.
          </p>
        </article>
      </main>
    </div>
  )
}
