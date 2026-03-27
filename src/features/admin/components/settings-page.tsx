import { useState } from 'react'
import { Users, Mail, Send, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from 'src/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from 'src/components/ui/table'
import { Badge } from 'src/components/ui/badge'
import { Button } from 'src/components/ui/button'
import { Input } from 'src/components/ui/input'
import { Label } from 'src/components/ui/label'
import { Skeleton } from 'src/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from 'src/components/ui/select'
import {
  useWorkspaceUsers,
  useInvitations,
  useSendInvitation,
  useChangeRole,
} from '../api'
import type { WorkspaceUser, Invitation } from '../api'

// ── Role helpers ──

const ROLES = ['admin', 'gestionnaire', 'technicien'] as const
type Role = (typeof ROLES)[number]

const roleLabels: Record<Role, string> = {
  admin: 'Admin',
  gestionnaire: 'Gestionnaire',
  technicien: 'Technicien',
}

const roleBadgeVariant: Record<Role, 'default' | 'secondary' | 'outline'> = {
  admin: 'default',
  gestionnaire: 'secondary',
  technicien: 'outline',
}

const statusLabels: Record<string, string> = {
  pending: 'En attente',
  accepted: 'Acceptee',
}

// ── Users Tab ──

function UsersTab() {
  const { data: users, isLoading, isError } = useWorkspaceUsers()
  const changeRole = useChangeRole()

  function handleRoleChange(user: WorkspaceUser, newRole: string) {
    changeRole.mutate(
      { userId: user.id, role: newRole as Role },
      {
        onSuccess: () => {
          toast.success(`Role de ${user.prenom} ${user.nom} mis a jour`)
        },
        onError: () => {
          toast.error('Erreur lors du changement de role')
        },
      }
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    )
  }

  if (isError) {
    return (
      <p className="text-sm text-muted-foreground">
        Erreur lors du chargement des utilisateurs.
      </p>
    )
  }

  if (!users || users.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Aucun utilisateur dans ce workspace.
      </p>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nom</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Role</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id}>
            <TableCell className="font-medium">
              {user.prenom} {user.nom}
            </TableCell>
            <TableCell className="text-muted-foreground">
              {user.email}
            </TableCell>
            <TableCell>
              <Badge variant={roleBadgeVariant[user.role]}>
                {roleLabels[user.role]}
              </Badge>
            </TableCell>
            <TableCell className="text-right">
              <Select
                value={user.role}
                onValueChange={(value) => handleRoleChange(user, value)}
              >
                <SelectTrigger size="sm" className="w-[160px] ml-auto">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map((role) => (
                    <SelectItem key={role} value={role}>
                      {roleLabels[role]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

// ── Invitations Tab ──

function InvitationsTab() {
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<Role>('gestionnaire')
  const { data: invitations, isLoading, isError } = useInvitations()
  const sendInvitation = useSendInvitation()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = email.trim()
    if (!trimmed) {
      toast.error('Veuillez saisir une adresse email')
      return
    }
    sendInvitation.mutate(
      { email: trimmed, role },
      {
        onSuccess: () => {
          toast.success(`Invitation envoyee a ${trimmed}`)
          setEmail('')
          setRole('gestionnaire')
        },
        onError: () => {
          toast.error("Erreur lors de l'envoi de l'invitation")
        },
      }
    )
  }

  function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  return (
    <div className="space-y-8">
      {/* Invite form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <h3 className="text-sm font-medium">Inviter un utilisateur</h3>
        <div className="flex items-end gap-3">
          <div className="flex-1 space-y-1.5">
            <Label htmlFor="invite-email">Email</Label>
            <Input
              id="invite-email"
              type="email"
              placeholder="nom@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="w-[180px] space-y-1.5">
            <Label htmlFor="invite-role">Role</Label>
            <Select value={role} onValueChange={(v) => setRole(v as Role)}>
              <SelectTrigger id="invite-role" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ROLES.map((r) => (
                  <SelectItem key={r} value={r}>
                    {roleLabels[r]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" disabled={sendInvitation.isPending}>
            {sendInvitation.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Send className="size-4" />
            )}
            Envoyer
          </Button>
        </div>
      </form>

      {/* Pending invitations table */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium">Invitations</h3>

        {isLoading && (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        )}

        {isError && (
          <p className="text-sm text-muted-foreground">
            Erreur lors du chargement des invitations.
          </p>
        )}

        {!isLoading && !isError && (!invitations || invitations.length === 0) && (
          <p className="text-sm text-muted-foreground">
            Aucune invitation en cours.
          </p>
        )}

        {invitations && invitations.length > 0 && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Statut</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invitations.map((inv: Invitation) => (
                <TableRow key={inv.id}>
                  <TableCell className="font-medium">{inv.email}</TableCell>
                  <TableCell>
                    <Badge variant={roleBadgeVariant[inv.role]}>
                      {roleLabels[inv.role]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(inv.created_at)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={inv.status === 'accepted' ? 'default' : 'outline'}
                    >
                      {statusLabels[inv.status] ?? inv.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  )
}

// ── Settings Page ──

export function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Parametres</h1>
        <p className="text-sm text-muted-foreground">
          Gerez les utilisateurs et les invitations de votre workspace.
        </p>
      </div>

      <Tabs defaultValue="utilisateurs">
        <TabsList>
          <TabsTrigger value="utilisateurs">
            <Users className="size-4" />
            Utilisateurs
          </TabsTrigger>
          <TabsTrigger value="invitations">
            <Mail className="size-4" />
            Invitations
          </TabsTrigger>
        </TabsList>

        <TabsContent value="utilisateurs" className="mt-4">
          <UsersTab />
        </TabsContent>

        <TabsContent value="invitations" className="mt-4">
          <InvitationsTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
