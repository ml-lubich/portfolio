export function Footer() {
  return (
    <footer className="border-t border-border py-8 animate-fade-in" style={{ animationDelay: "0.2s", opacity: 0 }}>
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 sm:flex-row">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-[8px] overflow-hidden">
            <img src="/logo.png" alt="ML" className="h-full w-full object-cover" />
          </div>
          <span className="text-xs text-muted-foreground">
            Misha Lubich
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          Built with Next.js & Tailwind CSS
        </p>
      </div>
    </footer>
  )
}
