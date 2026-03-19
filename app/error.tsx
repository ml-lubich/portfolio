"use client"

import Link from "next/link"
import { useEffect } from "react"

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        console.error("Application error:", error.digest)
    }, [error])

    return (
        <main className="flex min-h-screen flex-col items-center justify-center bg-black p-8 text-white">
            <h1 className="mb-2 text-5xl font-bold tracking-tight">Oops</h1>
            <h2 className="mb-4 text-lg text-muted-foreground">Something went wrong</h2>
            <p className="mb-8 max-w-md text-center text-sm text-muted-foreground">
                An unexpected error occurred. Please try again or return to the homepage.
            </p>
            <div className="flex gap-4">
                <button
                    onClick={reset}
                    className="rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                >
                    Try again
                </button>
                <Link
                    href="/"
                    className="rounded-lg border border-white/10 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/5"
                >
                    Go home
                </Link>
            </div>
        </main>
    )
}
