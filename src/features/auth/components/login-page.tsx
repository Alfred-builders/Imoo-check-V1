import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Building2, Mail, Lock } from 'lucide-react'
import { useAuth } from '../../../hooks/use-auth'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { Label } from '../../../components/ui/label'

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await login(email, password)

      if (result.requireWorkspaceSelect) {
        navigate('/workspace-select', {
          state: { workspaces: result.workspaces, user: result.user },
        })
      } else {
        navigate('/app/patrimoine')
      }
    } catch (err: any) {
      setError(err.message || 'Email ou mot de passe incorrect')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      {/* Logo + subtitle (visible on desktop — hidden on mobile since auth-layout shows it) */}
      <div className="hidden lg:block text-center mb-8">
        <div className="h-11 w-11 rounded-lg bg-primary flex items-center justify-center mx-auto mb-3 shadow-lg shadow-primary/20">
          <Building2 className="h-6 w-6 text-primary-foreground" />
        </div>
        <h2 className="text-xl font-bold text-foreground">ImmoChecker</h2>
        <p className="text-sm text-muted-foreground mt-1">Gestion d'états des lieux simplifiée</p>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-[12px] font-bold uppercase tracking-wider text-muted-foreground">
            Email
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@flatchecker.fr"
              required
              autoFocus
              className="h-11 pl-10 bg-muted/50 border-border rounded-lg"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password" className="text-[12px] font-bold uppercase tracking-wider text-muted-foreground">
            Mot de passe
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="h-11 pl-10 bg-muted/50 border-border rounded-lg"
            />
          </div>
        </div>

        <Button
          type="submit"
          className="w-full h-11 rounded-lg font-bold shadow-lg shadow-primary/20 transition-all"
          disabled={loading}
        >
          {loading ? 'Connexion...' : 'Se connecter'}
        </Button>
      </form>

      <div className="text-center mt-6 space-y-2">
        <Link to="/forgot-password" className="text-xs font-medium text-primary hover:text-primary/80">
          Mot de passe oublié ?
        </Link>
        <p className="text-xs text-muted-foreground">Pas de compte ? Contactez votre administrateur.</p>
      </div>
    </div>
  )
}
