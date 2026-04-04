import type { Metadata } from "next"
import Link from "next/link"
import { SITE_URL } from "@/lib/site-config"

const CONTACT_EMAIL = "michaelle.lubich@gmail.com"
const EFFECTIVE_DATE = "April 4, 2026"

export const metadata: Metadata = {
  title: "Terms of Use",
  description:
    "Terms and conditions for using Misha Lubich’s portfolio website and blog, including acceptable use, disclaimers, and limitations of liability.",
  alternates: {
    canonical: `${SITE_URL}/terms`,
  },
  openGraph: {
    title: "Terms of Use | Misha Lubich",
    description:
      "Terms governing use of mishalubich.com — intellectual property, disclaimers, and liability limits.",
    url: `${SITE_URL}/terms`,
  },
}

export default function TermsPage() {
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
          <h1 className="text-3xl font-medium tracking-tight text-foreground sm:text-4xl">Terms of Use</h1>
          <p className="text-sm text-muted-foreground">
            Effective date: {EFFECTIVE_DATE}. Last updated: {EFFECTIVE_DATE}.
          </p>

          <p>
            These Terms of Use (&quot;Terms&quot;) govern your access to and use of{" "}
            <strong className="text-foreground">{SITE_URL.replace(/^https?:\/\//, "")}</strong> (the
            &quot;Site&quot;), operated by Misha Lubich (&quot;we,&quot; &quot;us,&quot; &quot;our&quot;). By
            accessing or using the Site, you agree to these Terms. If you do not agree, do not use the Site.
          </p>

          <h2 className="mt-10 text-lg font-medium tracking-tight text-foreground sm:text-xl">
            1. The Site and our content
          </h2>
          <p>
            The Site is a personal portfolio and blog. Unless we say otherwise, text, graphics, logos,
            layout, code, and other materials on the Site are owned by us or our licensors and are protected
            by copyright, trademark, and other intellectual property laws. We grant you a limited,
            non-exclusive, non-transferable, revocable license to view and download content for your
            personal, non-commercial use. You may not copy, scrape, redistribute, sell, or create derivative
            works from the Site or its content except as allowed by law or with our prior written consent.
          </p>

          <h2 className="mt-10 text-lg font-medium tracking-tight text-foreground sm:text-xl">
            2. Acceptable use
          </h2>
          <p>You agree not to:</p>
          <ul className="list-inside list-disc space-y-2 pl-1">
            <li>Use the Site in any way that violates applicable law or infringes others&apos; rights</li>
            <li>Attempt to gain unauthorized access to the Site, servers, or networks</li>
            <li>Introduce malware, overload, or interfere with the Site&apos;s operation</li>
            <li>Use automated means (including bots or scrapers) to access the Site in a way that impairs or
              circumvents normal use, except as permitted by public search engines indexing for discovery</li>
            <li>Impersonate any person or misrepresent your affiliation</li>
          </ul>

          <h2 className="mt-10 text-lg font-medium tracking-tight text-foreground sm:text-xl">
            3. Blog content and opinions
          </h2>
          <p>
            Articles and opinions on the blog reflect the author&apos;s views at the time of writing, not
            necessarily those of any employer or client. Blog posts are provided for general information only
            and are{" "}
            <strong className="text-foreground">
              not professional, legal, financial, or technical advice
            </strong>
            . You are solely responsible for how you use any information from the Site.
          </p>

          <h2 className="mt-10 text-lg font-medium tracking-tight text-foreground sm:text-xl">
            4. Third-party links and services
          </h2>
          <p>
            The Site may link to third-party websites or services (for example, GitHub, LinkedIn, or
            scheduling tools). We do not control and are not responsible for third-party content, policies, or
            practices. Your use of third-party sites is at your own risk and subject to their terms.
          </p>

          <h2 className="mt-10 text-lg font-medium tracking-tight text-foreground sm:text-xl">
            5. No warranties
          </h2>
          <p>
            THE SITE AND ALL CONTENT ARE PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE,&quot; WITHOUT
            WARRANTIES OF ANY KIND, WHETHER EXPRESS OR IMPLIED, INCLUDING IMPLIED WARRANTIES OF
            MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE, AND NON-INFRINGEMENT. WE DO NOT WARRANT
            THAT THE SITE WILL BE UNINTERRUPTED, ERROR-FREE, OR FREE OF HARMFUL COMPONENTS.
          </p>

          <h2 className="mt-10 text-lg font-medium tracking-tight text-foreground sm:text-xl">
            6. Limitation of liability
          </h2>
          <p>
            TO THE MAXIMUM EXTENT PERMITTED BY LAW, IN NO EVENT WILL WE OR OUR AFFILIATES BE LIABLE FOR ANY
            INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS, DATA,
            GOODWILL, OR OTHER INTANGIBLE LOSSES, ARISING OUT OF OR RELATED TO YOUR USE OF OR INABILITY TO USE
            THE SITE, EVEN IF WE HAVE BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES. OUR TOTAL LIABILITY FOR
            ANY CLAIM ARISING OUT OF THESE TERMS OR THE SITE SHALL NOT EXCEED THE GREATER OF (A) ONE HUNDRED
            U.S. DOLLARS (US $100) OR (B) THE AMOUNT YOU PAID US, IF ANY, FOR ACCESS TO THE SITE IN THE TWELVE
            (12) MONTHS PRECEDING THE CLAIM. SOME JURISDICTIONS DO NOT ALLOW CERTAIN LIMITATIONS; IN THOSE
            CASES, OUR LIABILITY WILL BE LIMITED TO THE FULLEST EXTENT PERMITTED BY LAW.
          </p>

          <h2 className="mt-10 text-lg font-medium tracking-tight text-foreground sm:text-xl">7. Indemnity</h2>
          <p>
            You agree to defend, indemnify, and hold harmless us and our affiliates from any claims,
            damages, losses, liabilities, and expenses (including reasonable attorneys&apos; fees) arising
            from your use of the Site or violation of these Terms, except to the extent caused by our gross
            negligence or willful misconduct.
          </p>

          <h2 className="mt-10 text-lg font-medium tracking-tight text-foreground sm:text-xl">8. Privacy</h2>
          <p>
            Our collection and use of personal information is described in the{" "}
            <Link href="/privacy" className="text-primary underline-offset-4 hover:underline">
              Privacy Policy
            </Link>
            , which is incorporated into these Terms by reference.
          </p>

          <h2 className="mt-10 text-lg font-medium tracking-tight text-foreground sm:text-xl">9. Changes</h2>
          <p>
            We may modify these Terms at any time. We will update the &quot;Last updated&quot; date above
            when we do. Your continued use of the Site after changes become effective constitutes acceptance
            of the revised Terms. If you do not agree, stop using the Site.
          </p>

          <h2 className="mt-10 text-lg font-medium tracking-tight text-foreground sm:text-xl">
            10. Governing law and disputes
          </h2>
          <p>
            These Terms are governed by the laws of the State of California, USA, without regard to its
            conflict-of-law principles, except where mandatory local law provides otherwise. You agree that
            courts located in San Francisco County, California shall have exclusive jurisdiction over disputes
            arising from these Terms or the Site, subject to any right you may have under applicable law to
            bring claims in your home jurisdiction.
          </p>

          <h2 className="mt-10 text-lg font-medium tracking-tight text-foreground sm:text-xl">11. General</h2>
          <p>
            If any provision of these Terms is held invalid or unenforceable, the remaining provisions remain
            in full force. Our failure to enforce a provision is not a waiver. These Terms constitute the
            entire agreement between you and us regarding the Site and supersede prior agreements on that
            subject.
          </p>

          <h2 className="mt-10 text-lg font-medium tracking-tight text-foreground sm:text-xl">12. Contact</h2>
          <p>
            Questions about these Terms:{" "}
            <a
              href={`mailto:${CONTACT_EMAIL}?subject=Terms%20of%20Use%20inquiry`}
              className="text-primary underline-offset-4 hover:underline"
            >
              {CONTACT_EMAIL}
            </a>
            .
          </p>

          <p className="mt-12 border-t border-border pt-8 text-xs text-muted-foreground">
            These Terms are provided for clarity and risk management. They are not a substitute for legal
            advice tailored to your situation. For specific questions, consult a qualified attorney.
          </p>
        </article>
      </main>
    </div>
  )
}
