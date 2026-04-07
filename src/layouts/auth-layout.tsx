import { Outlet } from 'react-router-dom'
import { Building2 } from 'lucide-react'

export function AuthLayout() {
  return (
    <div className="min-h-screen flex">
      {/* Left panel — dark navy brand */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#0f172a] items-center justify-center p-12">
        <div className="text-center">
          <div className="h-16 w-16 rounded-2xl bg-[#2563eb] flex items-center justify-center shadow-lg shadow-blue-500/20 mx-auto mb-6">
            <Building2 className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">ImmoChecker</h1>
          <p className="text-slate-400 mt-3 text-lg">
            Gestion d'états des lieux simplifiée
          </p>
        </div>
      </div>

      {/* Right panel — light form area */}
      <div className="flex-1 flex items-center justify-center p-8 bg-[#f1f5f9]">
        <div className="w-full max-w-sm">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8">
            {/* Mobile-only logo */}
            <div className="lg:hidden text-center mb-8">
              <div className="h-12 w-12 rounded-xl bg-[#2563eb] flex items-center justify-center mx-auto mb-3 shadow-lg shadow-blue-500/20">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900">ImmoChecker</h1>
              <p className="text-slate-400 text-sm mt-1">Gestion d'états des lieux simplifiée</p>
            </div>
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  )
}
