import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from 'src/components/ui/button'
import { Input } from 'src/components/ui/input'
import { Label } from 'src/components/ui/label'
import { api } from '../../../lib/api-client'

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      await api('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) })
      setSent(true)
    } catch {}
    setLoading(false)
  }

  if (sent) {
    return (
      <div className="text-center">
        <h2 className="text-xl font-display font-bold text-gray-900 mb-2">Email envoye</h2>
        <p className="text-sm text-gray-500 mb-6">
          Si un compte existe avec l'adresse <strong>{email}</strong>, vous recevrez un lien de reinitialisation.
        </p>
        <Link to="/login" className="text-sm text-muted-foreground hover:text-foreground font-medium">
          Retour a la connexion
        </Link>
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-xl font-display font-bold text-gray-900 mb-1">Mot de passe oublie</h2>
      <p className="text-sm text-gray-500 mb-6">Entrez votre email pour recevoir un lien de reinitialisation.</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label className="text-gray-700 text-sm">Email</Label>
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus className="h-10" />
        </div>
        <Button type="submit" className="w-full h-10 bg-primary text-primary-foreground hover:bg-primary/90" disabled={loading}>
          {loading ? 'Envoi...' : 'Envoyer le lien'}
        </Button>
      </form>
      <p className="text-center text-xs text-gray-400 mt-4">
        <Link to="/login" className="text-muted-foreground hover:text-foreground">Retour a la connexion</Link>
      </p>
    </div>
  )
}
