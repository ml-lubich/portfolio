"use client"

import { useEffect } from "react"

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        console.error("[app/error.tsx]", error)
    }, [error])

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-black p-8 text-white">
            <h2 className="mb-4 text-2xl font-bold text-red-400">Something went wrong</h2>
            <pre className="mb-6 max-w-3xl overflow-auto rounded-lg bg-gray-900 p-4 text-sm text-red-300">
                {error.message}
                {"\n\n"}
                {error.stack}
            </pre>
            <button
                onClick={reset}
                className="rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-500"
            >
                Try again
            </button>
        </div>
    )
}
