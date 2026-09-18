import type { Metadata } from "next"
import { MODELS } from "@/lib/ai/models"
import { checkAllModels, type ModelStatus } from "@/lib/ai/status-check"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

// Unlisted diagnostics page — no nav/footer/sitemap entry, noindex below.
// Re-checks at most once a day so it never spends chat budget on crawlers.
export const revalidate = 86400

export const metadata: Metadata = {
  title: "MLBot status",
  robots: { index: false, follow: false },
}

export default async function StatusPage() {
  const apiKey = process.env.OPENROUTER_API_KEY
  const results = apiKey ? await checkAllModels(MODELS, apiKey) : null
  const checkedAt = new Date().toISOString()

  return (
    <main className="relative z-10 mx-auto min-h-screen max-w-3xl bg-background px-4 py-16">
      <h1 className="text-2xl font-semibold tracking-tight">MLBot status</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Live check of every model in the free-tier OpenRouter cascade used by{" "}
        <code>app/api/chat/route.ts</code>.
      </p>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">Chat configured</CardTitle>
        </CardHeader>
        <CardContent>
          <Badge variant={apiKey ? "default" : "destructive"}>
            {apiKey ? "yes — OPENROUTER_API_KEY present" : "no — OPENROUTER_API_KEY missing"}
          </Badge>
        </CardContent>
      </Card>

      <div className="mt-6 space-y-3">
        {results === null && (
          <Card>
            <CardContent className="pt-6 text-sm text-muted-foreground">
              Chat is not configured — no API key, so no models were checked.
            </CardContent>
          </Card>
        )}
        {results?.map((r) => <ModelRow key={r.model} result={r} />)}
      </div>

      <p className="mt-8 text-xs text-muted-foreground">Checked at {checkedAt} UTC</p>
    </main>
  )
}

function ModelRow({ result }: { result: ModelStatus }) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between gap-4 pt-6">
        <div className="min-w-0">
          <div className="truncate font-mono text-sm">{result.model}</div>
          {!result.ok && (
            <div className="mt-1 truncate text-xs text-destructive">
              {result.status ? `HTTP ${result.status}: ` : ""}
              {result.error}
            </div>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-3 text-xs text-muted-foreground">
          <span>{result.latencyMs}ms</span>
          <Badge
            variant={result.ok ? "default" : "destructive"}
            className={cn(result.ok && "bg-emerald-600 hover:bg-emerald-600/80")}
          >
            {result.ok ? "OK" : "FAIL"}
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}
