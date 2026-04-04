"use client"

import { useEffect, useRef } from "react"

const LOBSTER_WEBM = "/media/openclaw-lobster.webm"

const WRAP = "relative inline-flex shrink-0 items-center justify-center"

const VIDEO =
  "h-[7.25rem] w-[7.25rem] max-w-[min(11rem,42vw)] object-contain drop-shadow-[0_8px_28px_rgba(193,30,58,0.55)] sm:h-[9.25rem] sm:w-[9.25rem] sm:max-w-[13rem] md:h-[10.25rem] md:w-[10.25rem] md:max-w-[14rem]"

/**
 * OpenClaw motif — single WebM source (`public/media/openclaw-lobster.webm`).
 * (Still images elsewhere use WebP via `next/image`; this asset is video, not WebP.)
 */
export function AnimatedLobsterClaw({ className = "" }: { className?: string }) {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const el = videoRef.current
    if (!el) return
    const tryPlay = () => {
      void el.play().catch(() => {})
    }
    tryPlay()
    el.addEventListener("loadeddata", tryPlay)
    return () => el.removeEventListener("loadeddata", tryPlay)
  }, [])

  return (
    <div className={`${WRAP} ${className}`.trim()} aria-hidden="true">
      <video
        ref={videoRef}
        className={VIDEO}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
      >
        <source src={LOBSTER_WEBM} type="video/webm" />
      </video>
    </div>
  )
}
