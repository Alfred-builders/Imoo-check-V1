import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './hooks/use-auth'
import { AuthLayout } from './layouts/auth-layout'
import { MainLayout } from './layouts/main-layout'
import { LoginPage } from './features/auth/components/login-page'
import { WorkspaceSelectPage } from './features/auth/components/workspace-select-page'

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
        <Route path="/app/patrimoine" element={
          <div className="p-6">
            <h1 className="text-2xl font-display font-bold">Parc immobilier</h1>
            <p className="text-muted-foreground mt-2">Page en construction...</p>
          </div>
        } />
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
