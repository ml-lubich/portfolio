import type { Metadata } from "next"
import { NotFoundContent } from "@/components/not-found/glitch-404"

export const metadata: Metadata = {
  title: "Page Not Found",
  description: "The page you're looking for doesn't exist. Return to Misha Lubich's AI Engineer portfolio.",
  robots: { index: false, follow: true },
}

export default function NotFound() {
  return <NotFoundContent />
}
