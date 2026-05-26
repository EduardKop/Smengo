import { logoutAction } from '@/lib/actions/auth'

export default function DashboardPage() {
  return (
    <div className="p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
        <form action={logoutAction}>
          <button
            type="submit"
            className="rounded-md bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground hover:bg-destructive/90"
          >
            Выйти
          </button>
        </form>
      </div>
      <p className="mt-2 text-muted-foreground">
        {/* TODO: grid view goes here (Week 2+) */}
        Schedule grid coming soon.
      </p>
    </div>
  )
}
