import type { Metadata } from "next"
import Link from "next/link"
import { TaagGenerator } from "@/components/tools/taag-generator"

export const metadata: Metadata = {
  title: "Go WTF — FIGlet Text Art | Misha Lubich",
  description: "Make terminal text art with more than 300 FIGlet fonts, custom font files, and color. Inspired by patorjk/figlet.js and TAAG.",
  alternates: { canonical: "https://www.mishalubich.com/go-wtf" },
}

export default function GoWtfPage() {
  return (
    <main className="min-h-screen bg-background px-4 pb-20 pt-28 text-foreground sm:px-8">
      <div className="mx-auto max-w-6xl">
        <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">← Portfolio</Link>
        <p className="mt-10 font-mono text-sm uppercase tracking-[0.24em] text-cyan-300">Developer Tools · Terminal Art</p>
        <h1 className="mt-3 text-5xl font-semibold tracking-tight sm:text-7xl">Go WTF</h1>
        <p className="mb-8 mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground">Isometric worlds, block letters, shadows, slants. Give your words the big dramatic terminal treatment — right here in your browser, or directly in Python and your terminal.</p>
        <TaagGenerator />
        <section className="mt-8 grid gap-5 md:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Use it in your terminal</p>
            <pre className="mt-4 overflow-x-auto rounded-xl bg-black/40 p-4 font-mono text-sm leading-7 text-emerald-200"><code>{`brew install ml-lubich/tap/taag\ntaag render Hello -f Isometric1\ntaag render Hello -f Block --color\ntaag fonts`}</code></pre>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Use it from Python</p>
            <pre className="mt-4 overflow-x-auto rounded-xl bg-black/40 p-4 font-mono text-sm leading-7 text-cyan-100"><code>{`from taag import render\n\nart = render("Hello", "Isometric1")\ncolored = render("Hello", "Block", color=True)`}</code></pre>
          </div>
        </section>
        <section className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">
          <h2 className="text-2xl font-semibold">A little TAAG, right in your terminal.</h2>
          <p className="mt-3 max-w-4xl leading-relaxed text-muted-foreground">Inspired by <a className="underline decoration-cyan-400 underline-offset-4 hover:text-foreground" href="https://github.com/patorjk/figlet.js">Patrick Gillespie’s figlet.js</a>, the JavaScript FIGfont driver behind <a className="underline decoration-cyan-400 underline-offset-4 hover:text-foreground" href="https://patorjk.com/software/taag/">TAAG</a>. The ANSI color fonts are rendered with <a className="underline decoration-cyan-400 underline-offset-4 hover:text-foreground" href="https://github.com/cognitivegears/tdfonts">tdfonts</a>, based on TDFiglet by Trollforge. Thanks to these authors and contributors. Font files retain their upstream notices.</p>
          <a href="https://github.com/ml-lubich/taag-cli" className="mt-6 inline-flex rounded-full border border-white/15 px-5 py-2.5 font-mono text-sm transition hover:border-cyan-300 hover:text-cyan-200">View taag-cli on GitHub ↗</a>
        </section>
      </div>
    </main>
  )
}
