"use client"

/**
 * Hand-off cards: the resume and the contact details.
 *
 * Same shape as `BookingCard` — a header strip, a line of context, and the
 * real action. The model is told not to paste the path or the address, so the
 * card is the only place either appears and there is one thing to click.
 *
 * Nothing here sends mail. The contact card hands over a `mailto:`, which
 * opens the visitor's own client with their own address on it; a form that
 * posted through the site would be an outbound channel with no sender.
 */

import { FileDown, Mail, Github, Linkedin } from "lucide-react"
import type { ContactSpec, ResumeSpec } from "@/lib/ai/profile-tools"

const CARD = "mlbot-booking my-2 overflow-hidden rounded-xl"
const HEAD = "flex items-center gap-2 border-b border-[var(--line-soft)] px-3 py-2"
const PRIMARY =
    "inline-flex items-center gap-1.5 rounded-full bg-foreground px-3 py-1.5 text-[11px] font-medium text-background transition-opacity hover:opacity-90"
const SECONDARY =
    "inline-flex items-center gap-1.5 rounded-full border border-[var(--line-soft)] px-3 py-1.5 text-[11px] text-muted-foreground transition-colors hover:border-[var(--line-strong)] hover:text-foreground"

export function ResumeCard({ resume }: { resume: ResumeSpec }) {
    return (
        <figure className={CARD}>
            <div className={HEAD}>
                <FileDown className="h-3.5 w-3.5 text-[var(--accent-glow)]" aria-hidden />
                <p className="text-[11px] font-medium text-foreground">Misha&rsquo;s resume</p>
            </div>

            <div className="space-y-2 px-3 py-2.5">
                <p className="text-[12.5px] font-medium leading-snug text-foreground">{resume.role}</p>
                <p className="text-[11px] leading-relaxed text-muted-foreground">{resume.summary}</p>

                <div className="flex flex-wrap gap-2 pt-0.5">
                    <a href={resume.url} download={resume.filename} className={PRIMARY}>
                        Download PDF
                        <FileDown className="h-3 w-3" aria-hidden />
                    </a>
                    <a href={resume.url} target="_blank" rel="noopener noreferrer" className={SECONDARY}>
                        Open in a tab
                    </a>
                </div>
            </div>
        </figure>
    )
}

export function ContactCard({ contact }: { contact: ContactSpec }) {
    return (
        <figure className={CARD}>
            <div className={HEAD}>
                <Mail className="h-3.5 w-3.5 text-[var(--accent-glow)]" aria-hidden />
                <p className="text-[11px] font-medium text-foreground">Get in touch</p>
            </div>

            <div className="space-y-2 px-3 py-2.5">
                <p className="text-[12.5px] font-medium leading-snug text-foreground">{contact.email}</p>
                <p className="text-[11px] leading-relaxed text-muted-foreground">{contact.summary}</p>

                <div className="flex flex-wrap gap-2 pt-0.5">
                    <a href={contact.mailto} className={PRIMARY}>
                        Email Misha
                        <Mail className="h-3 w-3" aria-hidden />
                    </a>
                    <a href={contact.linkedin} target="_blank" rel="noopener noreferrer" className={SECONDARY}>
                        <Linkedin className="h-3 w-3" aria-hidden />
                        LinkedIn
                    </a>
                    <a href={contact.github} target="_blank" rel="noopener noreferrer" className={SECONDARY}>
                        <Github className="h-3 w-3" aria-hidden />
                        GitHub
                    </a>
                </div>
            </div>
        </figure>
    )
}
