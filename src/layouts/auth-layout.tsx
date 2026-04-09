import { Outlet } from 'react-router-dom'
import { Building2 } from 'lucide-react'

export function AuthLayout() {
  return (
    <div className="min-h-screen flex">
      {/* Left panel — dark brand */}
      <div className="hidden lg:flex lg:w-1/2 bg-foreground items-center justify-center p-12">
        <div className="text-center">
          <div className="h-16 w-16 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 mx-auto mb-6">
            <Building2 className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-background">ImmoChecker</h1>
          <p className="text-muted-foreground mt-3 text-lg">
            Gestion d'états des lieux simplifiée
          </p>
        </div>
      </div>

      {/* Right panel — light form area */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-sm">
          <div className="elevation-raised rounded-xl p-8">
            {/* Mobile-only logo */}
            <div className="lg:hidden text-center mb-8">
              <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center mx-auto mb-3 shadow-lg shadow-primary/20">
                <Building2 className="h-6 w-6 text-primary-foreground" />
              </div>
              <h1 className="text-2xl font-bold text-foreground">ImmoChecker</h1>
              <p className="text-muted-foreground text-sm mt-1">Gestion d'états des lieux simplifiée</p>
            </div>
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  )
}
