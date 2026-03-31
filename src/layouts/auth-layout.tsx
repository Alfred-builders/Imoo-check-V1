import { Outlet } from 'react-router-dom'
import { Building2 } from 'lucide-react'

export function AuthLayout() {
  return (
    <div className="min-h-screen flex">
      {/* Left panel — brand */}
      <div className="hidden lg:flex lg:w-1/2 bg-gray-900 items-center justify-center p-12">
        <div className="max-w-md text-center">
          <div className="h-16 w-16 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-6">
            <Building2 className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-display font-bold text-white">ImmoChecker</h1>
          <p className="text-gray-400 mt-3 text-lg">
            Etats des lieux & Inventaires
          </p>
          <p className="text-gray-500 mt-6 text-sm leading-relaxed">
            Plateforme de gestion des états des lieux immobiliers. Créez, planifiez et suivez vos interventions en toute simplicité.
          </p>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-sm">
          <div className="lg:hidden text-center mb-8">
            <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center mx-auto mb-3">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-display font-bold text-gray-900">ImmoChecker</h1>
          </div>
          <Outlet />
        </div>
      </div>
    </div>
  )
}
