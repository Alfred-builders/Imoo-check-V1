import { useState } from 'react'
import { Users, Mail, Send, Loader2, Shield, Building2, UserPlus, Clock, CheckCircle, AlertCircle, Copy, X, Pencil, Save, MapPin, Phone, AtSign, Hash, Palette } from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from 'src/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from 'src/components/ui/tabs'
import { Badge } from 'src/components/ui/badge'
import { Button } from 'src/components/ui/button'
import { Input } from 'src/components/ui/input'
import { Label } from 'src/components/ui/label'
import { Separator } from 'src/components/ui/separator'
import { Skeleton } from 'src/components/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from 'src/components/ui/select'
import { useWorkspaceDetails, useUpdateWorkspace, useWorkspaceUsers, useInvitations, useSendInvitation, useChangeRole, useResendInvitation, useCancelInvitation } from '../api'
import type { WorkspaceUser, Invitation } from '../api'

const ROLES = ['admin', 'gestionnaire', 'technicien'] as const
type Role = (typeof ROLES)[number]

const roleConfig: Record<Role, { label: string; color: string; bg: string; border: string; description: string }> = {
  admin: { label: 'Admin', color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200', description: 'Acces complet' },
  gestionnaire: { label: 'Gestionnaire', color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200', description: 'Back-office' },
  technicien: { label: 'Technicien', color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200', description: 'App mobile' },
}

const typeLabels: Record<string, string> = {
  societe_edl: 'Societe EDL', bailleur: 'Bailleur', agence: 'Agence immobiliere',
}

export function SettingsPage() {
  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Parametres</h1>
        <p className="text-xs text-gray-400 mt-0.5">Gerez votre workspace, vos utilisateurs et vos invitations</p>
      </div>

      <Tabs defaultValue="workspace" className="w-full">
        <TabsList className="bg-gray-100 p-0.5 h-9">
          <TabsTrigger value="workspace" className="text-xs h-8 px-4"><Building2 className="h-3.5 w-3.5 mr-1.5" /> Workspace</TabsTrigger>
          <TabsTrigger value="utilisateurs" className="text-xs h-8 px-4"><Users className="h-3.5 w-3.5 mr-1.5" /> Utilisateurs</TabsTrigger>
          <TabsTrigger value="invitations" className="text-xs h-8 px-4"><Mail className="h-3.5 w-3.5 mr-1.5" /> Invitations</TabsTrigger>
        </TabsList>

        <TabsContent value="workspace" className="mt-4"><WorkspaceTab /></TabsContent>
        <TabsContent value="utilisateurs" className="mt-4"><UsersTab /></TabsContent>
        <TabsContent value="invitations" className="mt-4"><InvitationsTab /></TabsContent>
      </Tabs>
    </div>
  )
}

// ── Workspace Tab ──
function WorkspaceTab() {
  const { data: ws, isLoading } = useWorkspaceDetails()
  const updateMutation = useUpdateWorkspace()
  const [editing, setEditing] = useState(false)
  const [nom, setNom] = useState('')
  const [siret, setSiret] = useState('')
  const [email, setEmail] = useState('')
  const [telephone, setTelephone] = useState('')
  const [adresse, setAdresse] = useState('')
  const [codePostal, setCodePostal] = useState('')
  const [ville, setVille] = useState('')
  const [couleurPrimaire, setCouleurPrimaire] = useState('')

  function startEdit() {
    if (!ws) return
    setNom(ws.nom)
    setSiret(ws.siret || '')
    setEmail(ws.email || '')
    setTelephone(ws.telephone || '')
    setAdresse(ws.adresse || '')
    setCodePostal(ws.code_postal || '')
    setVille(ws.ville || '')
    setCouleurPrimaire(ws.couleur_primaire || '')
    setEditing(true)
  }

  async function handleSave() {
    try {
      await updateMutation.mutateAsync({
        nom, siret: siret || null, email: email || null, telephone: telephone || null,
        adresse: adresse || null, code_postal: codePostal || null, ville: ville || null,
        couleur_primaire: couleurPrimaire || null,
      } as any)
      toast.success('Workspace mis a jour')
      setEditing(false)
    } catch (err: any) { toast.error(err.message || 'Erreur') }
  }

  if (isLoading) return <div className="space-y-4">{[1,2].map(i => <Skeleton key={i} className="h-40 rounded-xl" />)}</div>
  if (!ws) return <p className="text-gray-400">Workspace introuvable</p>

  return (
    <div className="space-y-5">
      {/* Header actions */}
      <div className="flex justify-end">
        {!editing ? (
          <Button variant="outline" size="sm" className="h-8 text-xs" onClick={startEdit}>
            <Pencil className="h-3 w-3 mr-1.5" /> Modifier
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => setEditing(false)}>Annuler</Button>
            <Button size="sm" className="h-8 text-xs bg-primary text-primary-foreground hover:bg-primary/90" onClick={handleSave} disabled={updateMutation.isPending}>
              <Save className="h-3 w-3 mr-1.5" /> Enregistrer
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-5">
        {/* Informations generales */}
        <Card className="shadow-sm border-gray-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Building2 className="h-4 w-4 text-gray-400" /> Informations generales
            </CardTitle>
          </CardHeader>
          <CardContent>
            {editing ? (
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-xs text-gray-500">Nom du workspace *</Label>
                  <Input value={nom} onChange={(e) => setNom(e.target.value)} className="h-9" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-gray-500">Type</Label>
                  <Input value={typeLabels[ws.type_workspace] || ws.type_workspace} disabled className="h-9 bg-gray-50 text-gray-400" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-gray-500">SIRET</Label>
                  <Input value={siret} onChange={(e) => setSiret(e.target.value)} placeholder="12345678901234" className="h-9" />
                </div>
              </div>
            ) : (
              <dl className="space-y-3">
                <InfoRow icon={Building2} label="Nom" value={ws.nom} />
                <InfoRow icon={Hash} label="Type" value={
                  <Badge variant="outline" className="text-[10px] capitalize">{typeLabels[ws.type_workspace] || ws.type_workspace}</Badge>
                } />
                <InfoRow icon={Hash} label="SIRET" value={ws.siret} />
                <InfoRow icon={Hash} label="Statut" value={
                  <Badge className={ws.statut === 'actif' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]' : 'text-[10px]'}>{ws.statut}</Badge>
                } />
              </dl>
            )}
          </CardContent>
        </Card>

        {/* Contact */}
        <Card className="shadow-sm border-gray-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <AtSign className="h-4 w-4 text-gray-400" /> Contact
            </CardTitle>
          </CardHeader>
          <CardContent>
            {editing ? (
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-xs text-gray-500">Email de contact</Label>
                  <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="contact@exemple.com" className="h-9" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-gray-500">Telephone</Label>
                  <Input value={telephone} onChange={(e) => setTelephone(e.target.value)} placeholder="01 23 45 67 89" className="h-9" />
                </div>
              </div>
            ) : (
              <dl className="space-y-3">
                <InfoRow icon={AtSign} label="Email" value={ws.email} />
                <InfoRow icon={Phone} label="Telephone" value={ws.telephone} />
              </dl>
            )}
          </CardContent>
        </Card>

        {/* Adresse */}
        <Card className="shadow-sm border-gray-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-gray-400" /> Adresse
            </CardTitle>
          </CardHeader>
          <CardContent>
            {editing ? (
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-xs text-gray-500">Adresse</Label>
                  <Input value={adresse} onChange={(e) => setAdresse(e.target.value)} placeholder="12 Rue de la Paix" className="h-9" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-gray-500">Code postal</Label>
                    <Input value={codePostal} onChange={(e) => setCodePostal(e.target.value)} placeholder="75001" className="h-9" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-gray-500">Ville</Label>
                    <Input value={ville} onChange={(e) => setVille(e.target.value)} placeholder="Paris" className="h-9" />
                  </div>
                </div>
              </div>
            ) : (
              <dl className="space-y-3">
                <InfoRow icon={MapPin} label="Adresse" value={ws.adresse} />
                <InfoRow icon={MapPin} label="CP / Ville" value={ws.code_postal || ws.ville ? `${ws.code_postal || ''} ${ws.ville || ''}`.trim() : null} />
              </dl>
            )}
          </CardContent>
        </Card>

        {/* Branding */}
        <Card className="shadow-sm border-gray-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Palette className="h-4 w-4 text-gray-400" /> Branding
            </CardTitle>
          </CardHeader>
          <CardContent>
            {editing ? (
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-xs text-gray-500">Couleur primaire</Label>
                  <div className="flex items-center gap-2">
                    <input type="color" value={couleurPrimaire || '#d97706'} onChange={(e) => setCouleurPrimaire(e.target.value)} className="h-9 w-12 rounded border border-gray-200 cursor-pointer" />
                    <Input value={couleurPrimaire} onChange={(e) => setCouleurPrimaire(e.target.value)} placeholder="#d97706" className="h-9 flex-1" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-gray-500">Logo URL</Label>
                  <Input value={ws.logo_url || ''} disabled placeholder="Upload a venir..." className="h-9 bg-gray-50 text-gray-400" />
                  <p className="text-[10px] text-gray-300">L'upload de logo sera disponible prochainement</p>
                </div>
              </div>
            ) : (
              <dl className="space-y-3">
                <div className="flex items-center justify-between py-2">
                  <span className="text-xs text-gray-400 flex items-center gap-1.5"><Palette className="h-3.5 w-3.5" /> Couleur</span>
                  <div className="flex items-center gap-2">
                    {ws.couleur_primaire ? (
                      <>
                        <div className="h-5 w-5 rounded border border-gray-200" style={{ background: ws.couleur_primaire }} />
                        <span className="text-xs font-mono text-gray-600">{ws.couleur_primaire}</span>
                      </>
                    ) : <span className="text-xs text-gray-300">Par defaut</span>}
                  </div>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-xs text-gray-400">Logo</span>
                  <span className="text-xs text-gray-300">{ws.logo_url ? 'Configure' : 'Non configure'}</span>
                </div>
              </dl>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Meta */}
      <p className="text-[10px] text-gray-300">
        Cree le {new Date(ws.created_at).toLocaleDateString('fr-FR')} — Derniere modification {new Date(ws.updated_at).toLocaleDateString('fr-FR')}
      </p>
    </div>
  )
}

function InfoRow({ icon: Icon, label, value }: { icon: any; label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-xs text-gray-400 flex items-center gap-1.5"><Icon className="h-3.5 w-3.5" /> {label}</span>
      <span className="text-sm font-medium text-gray-800">{value || <span className="text-gray-300">—</span>}</span>
    </div>
  )
}

// ── Users Tab ──
function UsersTab() {
  const { data: users, isLoading } = useWorkspaceUsers()
  const changeRole = useChangeRole()

  function handleRoleChange(user: WorkspaceUser, newRole: string) {
    changeRole.mutate(
      { userId: user.id, role: newRole as Role },
      {
        onSuccess: () => toast.success(`Role de ${user.prenom} ${user.nom} mis a jour`),
        onError: () => toast.error('Erreur'),
      }
    )
  }

  if (isLoading) return <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-16 rounded-xl" />)}</div>

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
                  <span className="text-xs font-bold text-gray-600">{user.prenom[0]}{user.nom[0]}</span>
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
                          <Shield className="h-3 w-3" /> {roleConfig[r].label}
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

// ── Invitations Tab ──
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
    toast.success('Lien copie')
  }

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
                <SelectContent>{ROLES.map((r) => <SelectItem key={r} value={r} className="text-xs">{roleConfig[r].label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <Button type="submit" disabled={sendInvitation.isPending} className="bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4">
              {sendInvitation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4 mr-1.5" />}
              Envoyer
            </Button>
          </form>
          <p className="text-[10px] text-gray-400 mt-2">L'invitation expire apres 7 jours.</p>
        </CardContent>
      </Card>

      <Card className="shadow-sm border-gray-200 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-gray-400" />
            <h3 className="text-sm font-semibold text-gray-900">Invitations</h3>
          </div>
          <div className="flex items-center bg-gray-100 rounded-md p-0.5 text-[10px]">
            {([
              { key: 'all' as const, label: 'Toutes' },
              { key: 'pending' as const, label: 'En attente' },
              { key: 'accepted' as const, label: 'Acceptees' },
              { key: 'expired' as const, label: 'Expirees' },
            ]).map(({ key, label }) => (
              <button key={key} onClick={() => setFilter(key)}
                className={`px-2.5 py-1 rounded transition-colors font-medium ${filter === key ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}`}>
                {label} {counts[key] > 0 && <span className="text-gray-400 ml-0.5">{counts[key]}</span>}
              </button>
            ))}
          </div>
        </div>

        {isLoading && <div className="p-5 space-y-3">{[1,2].map(i => <Skeleton key={i} className="h-14 rounded" />)}</div>}

        {!isLoading && filtered.length === 0 && (
          <div className="py-8 text-center"><Mail className="h-8 w-8 text-gray-300 mx-auto mb-2" /><p className="text-sm text-gray-400">Aucune invitation</p></div>
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
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${isAccepted ? 'bg-emerald-100' : isExpired ? 'bg-red-50' : 'bg-primary/5'}`}>
                    {isAccepted ? <CheckCircle className="h-4 w-4 text-emerald-600" /> : isExpired ? <AlertCircle className="h-4 w-4 text-red-400" /> : <Clock className="h-4 w-4 text-primary" />}
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
                  <div className="flex items-center gap-1 shrink-0">
                    {isPending && (
                      <>
                        <Button variant="ghost" size="sm" className="h-7 px-2 text-[10px] text-gray-400" onClick={() => copyInviteLink(inv.token)}><Copy className="h-3 w-3 mr-0.5" /> Lien</Button>
                        <Button variant="ghost" size="sm" className="h-7 px-2 text-[10px] text-blue-500" onClick={() => resendInvitation.mutate(inv.id, { onSuccess: () => toast.success('Relance envoyee') })}><Send className="h-3 w-3 mr-0.5" /> Relancer</Button>
                        <Button variant="ghost" size="sm" className="h-7 px-1.5 text-red-400" onClick={() => cancelInvitation.mutate(inv.id, { onSuccess: () => toast.success('Annulee') })}><X className="h-3 w-3" /></Button>
                      </>
                    )}
                    {isExpired && (
                      <>
                        <Button variant="ghost" size="sm" className="h-7 px-2 text-[10px] text-blue-500" onClick={() => resendInvitation.mutate(inv.id, { onSuccess: () => toast.success('Relance envoyee') })}><Send className="h-3 w-3 mr-0.5" /> Relancer</Button>
                        <Button variant="ghost" size="sm" className="h-7 px-1.5 text-red-400" onClick={() => cancelInvitation.mutate(inv.id, { onSuccess: () => toast.success('Annulee') })}><X className="h-3 w-3" /></Button>
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
