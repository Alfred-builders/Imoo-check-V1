import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../../hooks/use-auth'
import { Card } from '../../../components/ui/card'
import { Building2 } from 'lucide-react'
import { useState } from 'react'

interface Workspace {
  id: string
  nom: string
  type_workspace: string
  logo_url: string | null
  role: string
}

export function WorkspaceSelectPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { switchWorkspace } = useAuth()
  const [loading, setLoading] = useState<string | null>(null)

  const state = location.state as { workspaces: Workspace[]; user: { id: string } } | undefined
  const workspaces = state?.workspaces ?? []
  const userId = state?.user?.id

  if (!workspaces.length) {
    navigate('/login')
    return null
  }

  async function handleSelect(ws: Workspace) {
    setLoading(ws.id)
    try {
      await switchWorkspace(ws.id, userId)
      navigate('/app/patrimoine')
    } catch {
      setLoading(null)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-display font-bold text-primary">ImmoChecker</h1>
          <p className="text-muted-foreground mt-2">Choisissez votre workspace</p>
        </div>
        <div className="grid gap-3">
          {workspaces.map((ws) => (
            <Card
              key={ws.id}
              className={`p-4 cursor-pointer transition-all hover:border-primary/50 hover:bg-accent ${
                loading === ws.id ? 'opacity-50 pointer-events-none' : ''
              }`}
              onClick={() => handleSelect(ws)}
            >
              <div className="flex items-center gap-4">
                {ws.logo_url ? (
                  <img src={ws.logo_url} alt="" className="h-10 w-10 rounded-lg object-cover" />
                ) : (
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Building2 className="h-5 w-5 text-primary" />
                  </div>
                )}
                <div className="flex-1">
                  <p className="font-medium">{ws.nom}</p>
                  <p className="text-sm text-muted-foreground capitalize">{ws.type_workspace.replace('_', ' ')}</p>
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-secondary text-secondary-foreground capitalize">
                  {ws.role}
                </span>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
