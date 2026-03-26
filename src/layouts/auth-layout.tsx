import { Outlet } from 'react-router-dom'

export function AuthLayout() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-display font-bold text-primary">ImmoChecker</h1>
          <p className="text-muted-foreground mt-2">Etats des lieux & Inventaires</p>
        </div>
        <Outlet />
      </div>
    </div>
  )
}
