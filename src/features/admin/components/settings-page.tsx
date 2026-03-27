import { useState } from 'react'
import { Users, Mail, Send, Loader2, Shield, Building2, UserPlus, Clock, CheckCircle, AlertCircle, Copy, X } from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from 'src/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from 'src/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from 'src/components/ui/table'
import { Badge } from 'src/components/ui/badge'
import { Button } from 'src/components/ui/button'
import { Input } from 'src/components/ui/input'
import { Label } from 'src/components/ui/label'
import { Separator } from 'src/components/ui/separator'
import { Skeleton } from 'src/components/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from 'src/components/ui/select'
import { useAuth } from 'src/hooks/use-auth'
import { useWorkspaceUsers, useInvitations, useSendInvitation, useChangeRole, useResendInvitation, useCancelInvitation } from '../api'
import type { WorkspaceUser, Invitation } from '../api'

const ROLES = ['admin', 'gestionnaire', 'technicien'] as const
type Role = (typeof ROLES)[number]

const roleConfig: Record<Role, { label: string; color: string; bg: string; border: string; description: string }> = {
  admin: { label: 'Admin', color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200', description: 'Acces complet' },
  gestionnaire: { label: 'Gestionnaire', color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200', description: 'Back-office' },
  technicien: { label: 'Technicien', color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200', description: 'App mobile' },
}

export function SettingsPage() {
  const { workspace } = useAuth()

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-display font-bold text-gray-900">Parametres</h1>
        <p className="text-xs text-gray-400 mt-0.5">
          Gerez votre workspace, vos utilisateurs et vos invitations
        </p>
      </div>

      <Tabs defaultValue="workspace" className="w-full">
        <TabsList className="bg-gray-100 p-0.5 h-9">
          <TabsTrigger value="workspace" className="text-xs h-8 px-4">
            <Building2 className="h-3.5 w-3.5 mr-1.5" /> Workspace
          </TabsTrigger>
          <TabsTrigger value="utilisateurs" className="text-xs h-8 px-4">
            <Users className="h-3.5 w-3.5 mr-1.5" /> Utilisateurs
          </TabsTrigger>
          <TabsTrigger value="invitations" className="text-xs h-8 px-4">
            <Mail className="h-3.5 w-3.5 mr-1.5" /> Invitations
          </TabsTrigger>
        </TabsList>

        {/* Workspace tab */}
        <TabsContent value="workspace" className="mt-4">
          <Card className="shadow-sm border-gray-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-gray-700">Informations du workspace</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-x-8 gap-y-3">
                <InfoRow label="Nom" value={workspace?.nom || '—'} />
                <InfoRow label="Type" value={
                  <Badge variant="outline" className="text-[10px] capitalize">
                    {workspace?.type_workspace?.replace('_', ' ') || '—'}
                  </Badge>
                } />
              </div>
              <Separator className="my-4" />
              <p className="text-[10px] text-gray-300">Les autres parametres (logo, SIRET, adresse) seront configurables dans une prochaine version.</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Users tab */}
        <TabsContent value="utilisateurs" className="mt-4">
          <UsersTab />
        </TabsContent>

        {/* Invitations tab */}
        <TabsContent value="invitations" className="mt-4">
          <InvitationsTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-xs text-gray-400">{label}</span>
      <span className="text-sm font-medium text-gray-800">{value}</span>
    </div>
  )
}

function UsersTab() {
  const { data: users, isLoading, isError } = useWorkspaceUsers()
  const changeRole = useChangeRole()

  function handleRoleChange(user: WorkspaceUser, newRole: string) {
    changeRole.mutate(
      { userId: user.id, role: newRole as Role },
      {
        onSuccess: () => toast.success(`Role de ${user.prenom} ${user.nom} mis a jour`),
        onError: () => toast.error('Erreur lors du changement de role'),
      }
    )
  }

  if (isLoading) return <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>
  if (isError) return <p className="text-sm text-gray-400">Erreur de chargement.</p>

  return (
    <Card className="shadow-sm border-gray-200 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-gray-400" />
          <h3 className="text-sm font-semibold text-gray-900">Membres</h3>
          <Badge variant="secondary" className="text-[10px] h-5 px-1.5">{users?.length ?? 0}</Badge>
        </div>
      </div>
      {users && users.length > 0 ? (
        <div className="divide-y divide-gray-50">
          {users.map((user) => {
            const rc = roleConfig[user.role]
            return (
              <div key={user.id} className="flex items-center gap-4 px-5 py-3">
                <div className="h-9 w-9 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-gray-600">
                    {user.prenom[0]}{user.nom[0]}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{user.prenom} {user.nom}</p>
                  <p className="text-xs text-gray-400">{user.email}</p>
                </div>
                <Badge className={`${rc.bg} ${rc.color} ${rc.border} text-[10px]`}>{rc.label}</Badge>
                <Select value={user.role} onValueChange={(v) => handleRoleChange(user, v)}>
                  <SelectTrigger className="w-36 h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ROLES.map((r) => (
                      <SelectItem key={r} value={r} className="text-xs">
                        <div className="flex items-center gap-2">
                          <Shield className="h-3 w-3" />
                          {roleConfig[r].label}
                          <span className="text-gray-400 text-[10px]">— {roleConfig[r].description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="py-8 text-center text-gray-400 text-sm">Aucun membre</div>
      )}
    </Card>
  )
}

function InvitationsTab() {
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<Role>('gestionnaire')
  const [filter, setFilter] = useState<'all' | 'pending' | 'accepted' | 'expired'>('all')
  const { data: invitations, isLoading } = useInvitations()
  const sendInvitation = useSendInvitation()
  const resendInvitation = useResendInvitation()
  const cancelInvitation = useCancelInvitation()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = email.trim()
    if (!trimmed) { toast.error('Email requis'); return }
    sendInvitation.mutate(
      { email: trimmed, role },
      {
        onSuccess: () => { toast.success(`Invitation envoyee a ${trimmed}`); setEmail(''); setRole('gestionnaire') },
        onError: (err: any) => toast.error(err.message || "Erreur d'envoi"),
      }
    )
  }

  function copyInviteLink(token: string) {
    const url = `${window.location.origin}/register/${token}`
    navigator.clipboard.writeText(url)
    toast.success('Lien copie dans le presse-papiers')
  }

  function handleResend(inv: Invitation) {
    resendInvitation.mutate(inv.id, {
      onSuccess: () => toast.success(`Invitation relancee a ${inv.email}`),
      onError: () => toast.error('Erreur lors de la relance'),
    })
  }

  function handleCancel(inv: Invitation) {
    cancelInvitation.mutate(inv.id, {
      onSuccess: () => toast.success('Invitation annulee'),
      onError: () => toast.error('Erreur'),
    })
  }

  // Filter invitations
  const filtered = (invitations || []).filter(inv => {
    const isExpired = !inv.accepted_at && new Date(inv.expires_at) < new Date()
    const isAccepted = !!inv.accepted_at
    if (filter === 'pending') return !isAccepted && !isExpired
    if (filter === 'accepted') return isAccepted
    if (filter === 'expired') return isExpired
    return true
  })

  const counts = {
    all: invitations?.length ?? 0,
    pending: (invitations || []).filter(i => !i.accepted_at && new Date(i.expires_at) >= new Date()).length,
    accepted: (invitations || []).filter(i => !!i.accepted_at).length,
    expired: (invitations || []).filter(i => !i.accepted_at && new Date(i.expires_at) < new Date()).length,
  }

  return (
    <div className="space-y-5">
      {/* Invite form */}
      <Card className="shadow-sm border-gray-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <UserPlus className="h-4 w-4" /> Inviter un utilisateur
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex items-end gap-3">
            <div className="flex-1 space-y-1.5">
              <Label className="text-xs text-gray-500">Email</Label>
              <Input type="email" placeholder="nom@exemple.com" value={email} onChange={(e) => setEmail(e.target.value)} className="h-9" required />
            </div>
            <div className="w-44 space-y-1.5">
              <Label className="text-xs text-gray-500">Role</Label>
              <Select value={role} onValueChange={(v) => setRole(v as Role)}>
                <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ROLES.map((r) => <SelectItem key={r} value={r} className="text-xs">{roleConfig[r].label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" disabled={sendInvitation.isPending} className="bg-amber-600 hover:bg-amber-700 text-white h-9 px-4">
              {sendInvitation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4 mr-1.5" />}
              Envoyer
            </Button>
          </form>
          <div className="flex items-center gap-2 mt-2">
            <AlertCircle className="h-3 w-3 text-amber-500 shrink-0" />
            <p className="text-[10px] text-amber-600">
              Pour envoyer des emails, configurez RESEND_API_KEY. En attendant, copiez le lien d'invitation ci-dessous.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Invitations list */}
      <Card className="shadow-sm border-gray-200 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-gray-400" />
            <h3 className="text-sm font-semibold text-gray-900">Invitations</h3>
          </div>
          {/* Filter tabs */}
          <div className="flex items-center bg-gray-100 rounded-md p-0.5 text-[10px]">
            {([
              { key: 'all', label: 'Toutes' },
              { key: 'pending', label: 'En attente' },
              { key: 'accepted', label: 'Acceptees' },
              { key: 'expired', label: 'Expirees' },
            ] as { key: typeof filter; label: string }[]).map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`px-2.5 py-1 rounded transition-colors font-medium ${filter === key ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
              >
                {label} {counts[key] > 0 && <span className="text-gray-400 ml-0.5">{counts[key]}</span>}
              </button>
            ))}
          </div>
        </div>

        {isLoading && <div className="p-5 space-y-3">{[1,2].map(i => <Skeleton key={i} className="h-14 rounded" />)}</div>}

        {!isLoading && filtered.length === 0 && (
          <div className="py-8 text-center">
            <Mail className="h-8 w-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-400">Aucune invitation {filter !== 'all' ? `(${filter})` : ''}</p>
          </div>
        )}

        {filtered.length > 0 && (
          <div className="divide-y divide-gray-50">
            {filtered.map((inv) => {
              const rc = roleConfig[inv.role as Role] || roleConfig.gestionnaire
              const isExpired = !inv.accepted_at && new Date(inv.expires_at) < new Date()
              const isAccepted = !!inv.accepted_at
              const isPending = !isAccepted && !isExpired

              return (
                <div key={inv.id} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50/50 transition-colors">
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${
                    isAccepted ? 'bg-emerald-100' : isExpired ? 'bg-red-50' : 'bg-amber-50'
                  }`}>
                    {isAccepted ? <CheckCircle className="h-4 w-4 text-emerald-600" /> :
                     isExpired ? <AlertCircle className="h-4 w-4 text-red-400" /> :
                     <Clock className="h-4 w-4 text-amber-500" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{inv.email}</p>
                    <p className="text-[10px] text-gray-400">
                      {new Date(inv.created_at).toLocaleDateString('fr-FR')}
                      {inv.invited_by_nom && ` — par ${inv.invited_by_prenom} ${inv.invited_by_nom}`}
                      {isPending && ` — expire le ${new Date(inv.expires_at).toLocaleDateString('fr-FR')}`}
                    </p>
                  </div>
                  <Badge className={`${rc.bg} ${rc.color} ${rc.border} text-[10px]`}>{rc.label}</Badge>
                  <Badge variant={isAccepted ? 'default' : isExpired ? 'destructive' : 'outline'} className="text-[10px]">
                    {isAccepted ? 'Acceptee' : isExpired ? 'Expiree' : 'En attente'}
                  </Badge>
                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    {isPending && (
                      <>
                        <Button variant="ghost" size="sm" className="h-7 px-2 text-[10px] text-gray-400 hover:text-gray-700" onClick={() => copyInviteLink(inv.token)}>
                          <Copy className="h-3 w-3 mr-0.5" /> Lien
                        </Button>
                        <Button variant="ghost" size="sm" className="h-7 px-2 text-[10px] text-blue-500 hover:text-blue-700" onClick={() => handleResend(inv)}>
                          <Send className="h-3 w-3 mr-0.5" /> Relancer
                        </Button>
                        <Button variant="ghost" size="sm" className="h-7 px-2 text-[10px] text-red-400 hover:text-red-600" onClick={() => handleCancel(inv)}>
                          <X className="h-3 w-3" />
                        </Button>
                      </>
                    )}
                    {isExpired && (
                      <>
                        <Button variant="ghost" size="sm" className="h-7 px-2 text-[10px] text-blue-500 hover:text-blue-700" onClick={() => handleResend(inv)}>
                          <Send className="h-3 w-3 mr-0.5" /> Relancer
                        </Button>
                        <Button variant="ghost" size="sm" className="h-7 px-2 text-[10px] text-red-400 hover:text-red-600" onClick={() => handleCancel(inv)}>
                          <X className="h-3 w-3" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </Card>
    </div>
  )
}
