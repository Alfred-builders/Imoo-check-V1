import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './hooks/use-auth'
import { AuthLayout } from './layouts/auth-layout'
import { MainLayout } from './layouts/main-layout'
import { LoginPage } from './features/auth/components/login-page'
import { WorkspaceSelectPage } from './features/auth/components/workspace-select-page'
import { PatrimoinePage } from './features/patrimoine/components/patrimoine-page'
import { BuildingDetailPage } from './features/patrimoine/components/building-detail-page'
import { LotDetailPage } from './features/patrimoine/components/lot-detail-page'

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
      </Route>
      <Route path="/workspace-select" element={<WorkspaceSelectPage />} />

      {/* Protected routes */}
      <Route element={<RequireAuth><MainLayout /></RequireAuth>}>
        <Route path="/app/patrimoine" element={<PatrimoinePage />} />
        <Route path="/app/patrimoine/batiments/:id" element={<BuildingDetailPage />} />
        <Route path="/app/patrimoine/lots/:id" element={<LotDetailPage />} />
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
