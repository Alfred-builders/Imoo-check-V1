import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Button } from 'src/components/ui/button'
import { Input } from 'src/components/ui/input'
import { Label } from 'src/components/ui/label'
import { api } from '../../../lib/api-client'

export function ResetPasswordPage() {
  const { token } = useParams()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (password !== confirm) { setError('Les mots de passe ne correspondent pas'); return }
    if (password.length < 8) { setError('8 caracteres minimum'); return }
    if (!/[A-Z]/.test(password)) { setError('Au moins 1 majuscule'); return }
    if (!/[0-9]/.test(password)) { setError('Au moins 1 chiffre'); return }

    setLoading(true)
    try {
      await api('/auth/reset-password', { method: 'POST', body: JSON.stringify({ token, password }) })
      setDone(true)
    } catch (err: any) {
      setError(err.message || 'Lien invalide ou expire')
    }
    setLoading(false)
  }

  if (done) {
    return (
      <div className="text-center">
        <h2 className="text-xl font-display font-bold text-gray-900 mb-2">Mot de passe reinitialise</h2>
        <p className="text-sm text-gray-500 mb-6">Vous pouvez maintenant vous connecter.</p>
        <Link to="/login" className="text-sm text-amber-600 hover:text-amber-700 font-medium">Se connecter</Link>
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-xl font-display font-bold text-gray-900 mb-1">Nouveau mot de passe</h2>
      <p className="text-sm text-gray-500 mb-6">Min 8 caracteres, 1 majuscule, 1 chiffre.</p>
      {error && <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label className="text-gray-700 text-sm">Nouveau mot de passe</Label>
          <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="h-10" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-gray-700 text-sm">Confirmer</Label>
          <Input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required className="h-10" />
        </div>
        <Button type="submit" className="w-full h-10 bg-amber-600 hover:bg-amber-700 text-white" disabled={loading}>
          {loading ? 'Reinitialisation...' : 'Reinitialiser'}
        </Button>
      </form>
    </div>
  )
}
