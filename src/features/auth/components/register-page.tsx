import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Button } from 'src/components/ui/button'
import { Input } from 'src/components/ui/input'
import { Label } from 'src/components/ui/label'
import { Building2 } from 'lucide-react'
import { api } from '../../../lib/api-client'
import { useAuth } from '../../../hooks/use-auth'

interface InvitationInfo {
  valid: boolean
  expired?: boolean
  email?: string
  role?: string
  workspace_nom?: string
  workspace_logo?: string | null
}

export function RegisterPage() {
  const { token } = useParams()
  const navigate = useNavigate()
  const { switchWorkspace } = useAuth()
  const [invitation, setInvitation] = useState<InvitationInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [nom, setNom] = useState('')
  const [prenom, setPrenom] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!token) return
    api<InvitationInfo>(`/auth/invitation/${token}`, { skipAuthRedirect: true })
      .then(setInvitation)
      .catch(() => setInvitation({ valid: false, expired: true }))
      .finally(() => setLoading(false))
  }, [token])

  if (loading) return <div className="text-center text-gray-500">Chargement...</div>

  if (!invitation?.valid) {
    return (
      <div className="text-center">
        <h2 className="text-xl font-display font-bold text-gray-900 mb-2">Invitation expiree</h2>
        <p className="text-sm text-gray-500 mb-6">Ce lien d'invitation n'est plus valide. Contactez votre administrateur pour en recevoir un nouveau.</p>
        <Link to="/login" className="text-sm text-amber-600 hover:text-amber-700 font-medium">Retour a la connexion</Link>
      </div>
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (password !== confirm) { setError('Les mots de passe ne correspondent pas'); return }
    if (password.length < 8 || !/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
      setError('8 caracteres min, 1 majuscule, 1 chiffre'); return
    }

    setSubmitting(true)
    try {
      await api('/auth/register', { method: 'POST', body: JSON.stringify({ token, nom, prenom, password }) })
      navigate('/app/patrimoine')
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'inscription')
    }
    setSubmitting(false)
  }

  return (
    <div>
      <div className="text-center mb-6">
        {invitation.workspace_logo ? (
          <img src={invitation.workspace_logo} alt="" className="h-12 w-12 mx-auto rounded-xl object-cover mb-3" />
        ) : (
          <div className="h-12 w-12 mx-auto rounded-xl bg-amber-500 flex items-center justify-center mb-3">
            <Building2 className="h-6 w-6 text-white" />
          </div>
        )}
        <h2 className="text-lg font-display font-bold text-gray-900">Rejoindre {invitation.workspace_nom}</h2>
        <p className="text-sm text-gray-500 mt-1">Role : <span className="capitalize font-medium">{invitation.role}</span></p>
      </div>

      {error && <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label className="text-gray-700 text-sm">Email</Label>
          <Input value={invitation.email || ''} disabled className="h-10 bg-gray-50" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-gray-700 text-sm">Prenom *</Label>
            <Input value={prenom} onChange={(e) => setPrenom(e.target.value)} required className="h-10" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-gray-700 text-sm">Nom *</Label>
            <Input value={nom} onChange={(e) => setNom(e.target.value)} required className="h-10" />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label className="text-gray-700 text-sm">Mot de passe *</Label>
          <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="h-10" placeholder="8 car. min, 1 maj, 1 chiffre" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-gray-700 text-sm">Confirmer *</Label>
          <Input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required className="h-10" />
        </div>
        <Button type="submit" className="w-full h-10 bg-amber-600 hover:bg-amber-700 text-white" disabled={submitting}>
          {submitting ? 'Inscription...' : 'Creer mon compte'}
        </Button>
      </form>
    </div>
  )
}
