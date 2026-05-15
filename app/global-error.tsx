"use client"

/* eslint-disable @next/next/no-html-link-for-pages */

export default function GlobalError(props: {
  error?: Error & { digest?: string }
  reset?: () => void
} = {}) {
  const { reset } = props

  return (
    <html lang="en" dir="ltr">
      <body>
        <main className="flex min-h-screen flex-col items-center justify-center bg-black p-8 text-center text-white">
          <h1 className="mb-3 text-4xl font-semibold tracking-tight">Something went wrong</h1>
          <p className="mb-7 max-w-md text-sm text-white/70">
            The page hit an unexpected error. You can retry or return to the homepage.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {reset ? (
              <button
                type="button"
                onClick={() => reset()}
                className="min-h-11 rounded-lg bg-white px-5 py-2.5 text-sm font-semibold text-black"
              >
                Try again
              </button>
            ) : null}
            <a
              href="/"
              className="inline-flex min-h-11 items-center rounded-lg border border-white/20 px-5 py-2.5 text-sm font-semibold text-white"
            >
              Go home
            </a>
          </div>
        </main>
      </body>
    </html>
  )
}
