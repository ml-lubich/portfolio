"use client"

import type { ComponentProps } from "react"
import { X } from "lucide-react"
import { SiteLogoMark } from "@/components/site-logo-mark"

/** Fixed bottom-right stack the launcher (and, once loaded, the back-to-top
 *  button) sits in. Shared so the pre-chunk launcher and MLBot's own render
 *  occupy the identical box: no layout shift when the chat chunk swaps in. */
export const LAUNCHER_STACK_CLASS = "fixed bottom-6 right-6 z-[60] flex flex-col items-end gap-3"

/** The launcher button alone, with no chat logic, so it can ship in the initial
 *  bundle while the heavy chat module (markdown, recharts) waits for intent. */
export function LauncherButton({ open = false, ...props }: { open?: boolean } & ComponentProps<"button">) {
  return (
    <button
      type="button"
      aria-label={open ? "Close MLBot" : "Chat with MLBot"}
      aria-expanded={open}
      className="mlbot-launcher group relative flex h-14 w-14 items-center justify-center rounded-2xl transition-transform duration-300 hover:scale-[1.06] active:scale-95"
      {...props}
    >
      {open ? (
        <X className="h-5 w-5 text-foreground" />
      ) : (
        <SiteLogoMark width={40} height={40} sizes="40px" alt="" className="h-9 w-9 object-contain" />
      )}
      {!open && <span className="mlbot-pulse" aria-hidden />}
      {/* Names the button. A bare logo does not tell a first-time
          visitor that this is a chat they can talk to. */}
      {!open && (
        <span className="mlbot-tag" aria-hidden>
          AI Chat
        </span>
      )}
    </button>
  )
}
