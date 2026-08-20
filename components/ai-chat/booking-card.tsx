"use client"

/**
 * Calendar hand-off card, rendered when MLBot calls `request_consultation`.
 *
 * Deliberately not a confirmation. Nothing here says a time is booked,
 * because nothing has been — the visitor still picks a slot on Misha's real
 * Google Calendar page. A card that implied otherwise would be a fabricated
 * record of an appointment that does not exist.
 *
 * The .ics is a genuine calendar file (a hold the visitor can drop into their
 * own calendar while they arrange the real slot), not a stand-in for booking.
 */

import { CalendarPlus, Clock, ExternalLink } from "lucide-react"
import type { BookingSpec } from "@/lib/ai/profile-tools"

/** RFC 5545 escaping — commas, semicolons and newlines are field separators. */
function icsEscape(text: string): string {
    return text.replace(/\\/g, "\\\\").replace(/[,;]/g, (m) => `\\${m}`).replace(/\n/g, "\\n")
}

function icsStamp(d: Date): string {
    return `${d.toISOString().replace(/[-:]/g, "").split(".")[0]}Z`
}

/** A tentative hold on the next weekday morning; the real time comes from the calendar page. */
function buildIcs(booking: BookingSpec): string {
    const start = new Date()
    start.setDate(start.getDate() + 1)
    if (start.getDay() === 6) start.setDate(start.getDate() + 2)
    if (start.getDay() === 0) start.setDate(start.getDate() + 1)
    start.setHours(10, 0, 0, 0)

    const end = new Date(start.getTime() + booking.durationMin * 60_000)

    return [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//mishalubich.com//MLBot//EN",
        "BEGIN:VEVENT",
        `UID:${Date.now()}@mishalubich.com`,
        `DTSTAMP:${icsStamp(new Date())}`,
        `DTSTART:${icsStamp(start)}`,
        `DTEND:${icsStamp(end)}`,
        `SUMMARY:${icsEscape(`Misha Lubich — ${booking.topic}`)}`,
        `DESCRIPTION:${icsEscape(`${booking.summary}\n\nConfirm a time: ${booking.url}`)}`,
        `URL:${booking.url}`,
        "STATUS:TENTATIVE",
        "END:VEVENT",
        "END:VCALENDAR",
    ].join("\r\n")
}

export function BookingCard({ booking }: { booking: BookingSpec }) {
    const ics = `data:text/calendar;charset=utf-8,${encodeURIComponent(buildIcs(booking))}`

    return (
        <figure className="mlbot-booking my-2 overflow-hidden rounded-xl">
            <div className="flex items-center gap-2 border-b border-[var(--line-soft)] px-3 py-2">
                <CalendarPlus className="h-3.5 w-3.5 text-[var(--accent-glow)]" aria-hidden />
                <p className="text-[11px] font-medium text-foreground">Book time with Misha</p>
            </div>

            <div className="space-y-2 px-3 py-2.5">
                <p className="text-[12.5px] font-medium leading-snug text-foreground">{booking.topic}</p>
                <p className="text-[11px] leading-relaxed text-muted-foreground">{booking.summary}</p>

                <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <Clock className="h-3 w-3" aria-hidden />
                    {booking.durationMin} min · you pick the slot
                </p>

                <div className="flex flex-wrap gap-2 pt-0.5">
                    <a
                        href={booking.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-full bg-foreground px-3 py-1.5 text-[11px] font-medium text-background transition-opacity hover:opacity-90"
                    >
                        Choose a time
                        <ExternalLink className="h-3 w-3" aria-hidden />
                    </a>
                    <a
                        href={ics}
                        download="misha-lubich-call.ics"
                        className="inline-flex items-center gap-1.5 rounded-full border border-[var(--line-soft)] px-3 py-1.5 text-[11px] text-muted-foreground transition-colors hover:border-[var(--line-strong)] hover:text-foreground"
                    >
                        Add a hold (.ics)
                    </a>
                </div>
            </div>
        </figure>
    )
}
