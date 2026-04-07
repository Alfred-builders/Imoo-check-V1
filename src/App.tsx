import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './hooks/use-auth'
import { AuthLayout } from './layouts/auth-layout'
import { MainLayout } from './layouts/main-layout'
import { LoginPage } from './features/auth/components/login-page'
import { RegisterPage } from './features/auth/components/register-page'
import { ForgotPasswordPage } from './features/auth/components/forgot-password-page'
import { ResetPasswordPage } from './features/auth/components/reset-password-page'
import { WorkspaceSelectPage } from './features/auth/components/workspace-select-page'
import { PatrimoinePage } from './features/patrimoine/components/patrimoine-page'
import { BuildingDetailPage } from './features/patrimoine/components/building-detail-page'
import { LotDetailPage } from './features/patrimoine/components/lot-detail-page'
import { SettingsPage } from './features/admin/components/settings-page'
import { TiersPage } from './features/tiers/components/tiers-page'
import VibesSelection from './vibes-selection'

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-muted-foreground">Chargement...</div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register/:token" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
      </Route>
      <Route path="/workspace-select" element={<WorkspaceSelectPage />} />
      <Route path="/vibes" element={<VibesSelection />} />

      {/* Protected routes */}
      <Route element={<RequireAuth><MainLayout /></RequireAuth>}>
        <Route path="/app/patrimoine" element={<PatrimoinePage />} />
        <Route path="/app/patrimoine/batiments/:id" element={<BuildingDetailPage />} />
        <Route path="/app/patrimoine/lots/:id" element={<LotDetailPage />} />
        <Route path="/app/tiers" element={<TiersPage />} />
        <Route path="/app/tiers/:id" element={<div className="p-6"><p className="text-gray-400">Fiche tiers — Sprint 2 en cours</p></div>} />
        <Route path="/app/parametres" element={<SettingsPage />} />
        <Route path="/app" element={<Navigate to="/app/patrimoine" replace />} />
      </Route>

      {/* Default redirect */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}
