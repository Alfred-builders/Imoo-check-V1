import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
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
      <div className="mb-8">
        <h2 className="text-xl font-display font-bold text-gray-900">Connexion</h2>
        <p className="text-sm text-gray-500 mt-1">Accédez à votre espace de travail</p>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-gray-700 text-sm font-medium">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@flatchecker.fr"
            required
            autoFocus
            className="h-10"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password" className="text-gray-700 text-sm font-medium">Mot de passe</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            className="h-10"
          />
        </div>
        <Button type="submit" className="w-full h-10 bg-amber-600 hover:bg-amber-700 text-white font-medium" disabled={loading}>
          {loading ? 'Connexion...' : 'Se connecter'}
        </Button>
      </form>

      <div className="text-center mt-6 space-y-2">
        <Link to="/forgot-password" className="text-xs text-amber-600 hover:text-amber-700">Mot de passe oublie ?</Link>
        <p className="text-xs text-gray-400">Pas de compte ? Contactez votre administrateur.</p>
      </div>
    </div>
  )
}
