import { SignInCard } from '@/components/auth/sign-in-card'

export default function Page() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-6 py-16 text-foreground">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.2),transparent_60%)]" aria-hidden />
      <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-10 text-center">
        <div className="space-y-4">
          <p className="text-sm uppercase tracking-[0.4em] text-primary/70">Shape Kit</p>
          <h1 className="text-balance text-4xl font-bold leading-tight sm:text-5xl">
            Experiment faster with collaborative CAD in the browser
          </h1>
          <p className="max-w-2xl text-balance text-base text-muted-foreground sm:text-lg">
            Sign in to sync your sessions, invite teammates, and keep iterating on parametric designs without losing your work.
          </p>
        </div>
        <SignInCard />
      </div>
    </main>
  )
}
