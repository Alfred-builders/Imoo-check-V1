import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Archive, ArchiveRestore, Pencil, AlertTriangle, Building2, User, ChevronUp, ChevronDown, Home, Briefcase, ClipboardList, Plus } from 'lucide-react'
import { Button } from 'src/components/ui/button'
import { Badge } from 'src/components/ui/badge'
import { Skeleton } from 'src/components/ui/skeleton'
import { Input } from 'src/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from 'src/components/ui/select'
import { Textarea } from 'src/components/ui/textarea'
import { FloatingSaveBar } from '../../../components/shared/floating-save-bar'
import { ConfirmDialog } from '../../../components/shared/confirm-dialog'
import { ResizeHandle, useResizableColumns } from '../../../components/shared/resizable-columns'
import { CreateLotModal } from '../../patrimoine/components/create-lot-modal'
import { useTiersDetail, useUpdateTiers } from '../api'
import { toast } from 'sonner'

export function TiersDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [editing, setEditing] = useState(false)
  const { data: tiers, isLoading } = useTiersDetail(id)
  const updateMutation = useUpdateTiers()
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false)

  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    general: true,
    contact: false,
    lots: false,
    organisations: false,
  })

  function toggleSection(key: string) {
    setOpenSections(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const [formData, setFormData] = useState({
    nom: '', prenom: '', raison_sociale: '', type_personne: 'physique' as string,
    email: '', tel: '', adresse: '', code_postal: '', ville: '',
    siren: '', date_naissance: '', representant_nom: '', notes: '',
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (tiers) {
      setFormData({
        nom: tiers.nom || '', prenom: tiers.prenom || '', raison_sociale: tiers.raison_sociale || '',
        type_personne: tiers.type_personne, email: tiers.email || '', tel: tiers.tel || '',
        adresse: tiers.adresse || '', code_postal: tiers.code_postal || '', ville: tiers.ville || '',
        siren: tiers.siren || '', date_naissance: tiers.date_naissance || '',
        representant_nom: tiers.representant_nom || '', notes: tiers.notes || '',
      })
    }
  }, [tiers, editing])

  if (isLoading) {
    return (
      <div className="p-6 space-y-5">
        <Skeleton className="h-12 w-72" />
        <Skeleton className="h-64 rounded-xl" />
        <Skeleton className="h-14 rounded-xl" />
      </div>
    )
  }

  if (!tiers) return <div className="p-6"><p className="text-muted-foreground">Tiers introuvable</p></div>

  async function handleArchive() {
    if (!id) return
    try {
      await updateMutation.mutateAsync({ id, est_archive: !tiers!.est_archive })
      toast.success(tiers!.est_archive ? 'Tiers restauré' : 'Tiers archivé')
    } catch (err: any) { toast.error(err.message || 'Erreur') }
  }

  function handleCancel() {
    if (tiers) {
      setFormData({
        nom: tiers.nom || '', prenom: tiers.prenom || '', raison_sociale: tiers.raison_sociale || '',
        type_personne: tiers.type_personne, email: tiers.email || '', tel: tiers.tel || '',
        adresse: tiers.adresse || '', code_postal: tiers.code_postal || '', ville: tiers.ville || '',
        siren: tiers.siren || '', date_naissance: tiers.date_naissance || '',
        representant_nom: tiers.representant_nom || '', notes: tiers.notes || '',
      })
    }
    setEditing(false)
  }

  async function handleSave() {
    setSaving(true)
    try {
      await updateMutation.mutateAsync({
        id: tiers!.id,
        nom: formData.nom, prenom: formData.prenom || null,
        raison_sociale: formData.raison_sociale || null,
        email: formData.email || null, tel: formData.tel || null,
        adresse: formData.adresse || null, code_postal: formData.code_postal || null,
        ville: formData.ville || null, siren: formData.siren || null,
        date_naissance: formData.date_naissance || null,
        representant_nom: formData.representant_nom || null,
        notes: formData.notes || null,
      })
      toast.success('Tiers mis à jour')
      setTimeout(() => setEditing(false), 300)
    } catch { toast.error('Erreur') }
    finally { setSaving(false) }
  }

  const displayName = tiers.type_personne === 'morale'
    ? tiers.raison_sociale || tiers.nom
    : `${tiers.prenom || ''} ${tiers.nom}`.trim()

  const lotsProprietaire = tiers.lots_proprietaire ?? []
  const lotsMandataire = tiers.lots_mandataire ?? []
  const organisations = tiers.organisations ?? []
  const membres = tiers.membres ?? []
  const totalLots = lotsProprietaire.length + lotsMandataire.length

  // Determine roles
  const roles: string[] = []
  if (lotsProprietaire.length > 0) roles.push('Propriétaire')
  if (lotsMandataire.length > 0) roles.push('Mandataire')
  if ((tiers as any).nb_edl_locataire > 0) roles.push('Locataire')
  if (roles.length === 0) roles.push(tiers.type_personne === 'morale' ? 'Organisation' : 'Personne')

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 ${tiers.type_personne === 'morale' ? 'bg-emerald-100' : 'bg-primary/10'}`}>
            {tiers.type_personne === 'morale'
              ? <Building2 className="h-6 w-6 text-emerald-700" />
              : <User className="h-6 w-6 text-primary" />
            }
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">{displayName}</h1>
            <div className="mt-1 flex items-center gap-2">
              <Badge className={tiers.type_personne === 'morale' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-primary/10 text-primary border-primary/20'}>
                {tiers.type_personne === 'morale' ? 'Personne morale' : 'Personne physique'}
              </Badge>
              {roles.map(r => (
                <Badge key={r} variant="outline" className="text-[10px]">{r}</Badge>
              ))}
              {tiers.est_archive && <Badge variant="destructive" className="text-[10px]">Archivé</Badge>}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {!tiers.est_archive && !editing && (
            <Button variant="outline" size="sm" className="gap-1.5 border-border hover:border-foreground/20 hover:bg-accent" onClick={() => setEditing(true)}>
              <Pencil className="h-3.5 w-3.5" /> Modifier
            </Button>
          )}
          <Button variant="outline" size="sm"
            className={tiers.est_archive ? 'gap-1.5' : 'gap-1.5 border-destructive/30 text-destructive/80 hover:text-destructive hover:bg-destructive/5 hover:border-destructive/50'}
            onClick={() => setShowArchiveConfirm(true)}
          >
            {tiers.est_archive ? <ArchiveRestore className="h-3.5 w-3.5" /> : <Archive className="h-3.5 w-3.5" />}
            {tiers.est_archive ? 'Restaurer' : 'Archiver'}
          </Button>
        </div>
      </div>

      {tiers.est_archive && (
        <div className="flex items-center gap-2 px-3 py-2.5 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-xs">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
          Ce tiers est archivé.
        </div>
      )}

      {/* Section: Informations générales */}
      <CollapsibleSection title="Informations générales" open={openSections.general} onToggle={() => toggleSection('general')}>
        <div className="divide-y divide-border/50">
          {tiers.type_personne === 'physique' ? (
            <>
              <InfoRow label="Nom" editing={editing} value={tiers.nom}>
                <Input value={formData.nom} onChange={(e) => setFormData(prev => ({ ...prev, nom: e.target.value }))} className="h-8 w-48 text-sm" />
              </InfoRow>
              <InfoRow label="Prénom" editing={editing} value={tiers.prenom || '--'}>
                <Input value={formData.prenom} onChange={(e) => setFormData(prev => ({ ...prev, prenom: e.target.value }))} className="h-8 w-48 text-sm" />
              </InfoRow>
              <InfoRow label="Date de naissance" editing={editing} value={tiers.date_naissance || '--'}>
                <Input type="date" value={formData.date_naissance} onChange={(e) => setFormData(prev => ({ ...prev, date_naissance: e.target.value }))} className="h-8 w-48 text-sm" />
              </InfoRow>
            </>
          ) : (
            <>
              <InfoRow label="Raison sociale" editing={editing} value={tiers.raison_sociale || '--'}>
                <Input value={formData.raison_sociale} onChange={(e) => setFormData(prev => ({ ...prev, raison_sociale: e.target.value }))} className="h-8 w-48 text-sm" />
              </InfoRow>
              <InfoRow label="Nom (contact)" editing={editing} value={tiers.nom}>
                <Input value={formData.nom} onChange={(e) => setFormData(prev => ({ ...prev, nom: e.target.value }))} className="h-8 w-48 text-sm" />
              </InfoRow>
              <InfoRow label="SIREN" editing={editing} value={tiers.siren || '--'}>
                <Input value={formData.siren} onChange={(e) => setFormData(prev => ({ ...prev, siren: e.target.value }))} className="h-8 w-48 text-sm" />
              </InfoRow>
              <InfoRow label="Représentant" editing={editing} value={tiers.representant_nom || '--'}>
                <Input value={formData.representant_nom} onChange={(e) => setFormData(prev => ({ ...prev, representant_nom: e.target.value }))} className="h-8 w-48 text-sm" />
              </InfoRow>
            </>
          )}
          <InfoRow label="Notes" editing={editing} value={tiers.notes || '--'}>
            <Textarea value={formData.notes} onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))} rows={2} className="text-sm w-72" />
          </InfoRow>
        </div>
      </CollapsibleSection>

      {/* Section: Contact & Adresse */}
      <CollapsibleSection title="Contact & Adresse" open={openSections.contact} onToggle={() => toggleSection('contact')}>
        <div className="divide-y divide-border/50">
          <InfoRow label="Email" editing={editing} value={tiers.email || '--'}>
            <Input type="email" value={formData.email} onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))} className="h-8 w-48 text-sm" />
          </InfoRow>
          <InfoRow label="Téléphone" editing={editing} value={tiers.tel || '--'}>
            <Input value={formData.tel} onChange={(e) => setFormData(prev => ({ ...prev, tel: e.target.value }))} className="h-8 w-48 text-sm" />
          </InfoRow>
          <InfoRow label="Adresse" editing={editing} value={tiers.adresse || '--'}>
            <Input value={formData.adresse} onChange={(e) => setFormData(prev => ({ ...prev, adresse: e.target.value }))} className="h-8 w-60 text-sm" />
          </InfoRow>
          <InfoRow label="Code postal" editing={editing} value={tiers.code_postal || '--'}>
            <Input value={formData.code_postal} onChange={(e) => setFormData(prev => ({ ...prev, code_postal: e.target.value }))} className="h-8 w-48 text-sm" />
          </InfoRow>
          <InfoRow label="Ville" editing={editing} value={tiers.ville || '--'}>
            <Input value={formData.ville} onChange={(e) => setFormData(prev => ({ ...prev, ville: e.target.value }))} className="h-8 w-48 text-sm" />
          </InfoRow>
        </div>
      </CollapsibleSection>

      {/* Lots table — flat, with "Ajouter un lot" */}
      <LotsTable
        lotsProprietaire={lotsProprietaire}
        lotsMandataire={lotsMandataire}
        tiersId={tiers.id}
        tiersName={displayName}
        isArchived={tiers.est_archive}
      />

      {/* Section: Organisations liées (for physique) / Membres (for morale) */}
      {tiers.type_personne === 'physique' && organisations.length > 0 && (
        <CollapsibleSection title={`Organisations (${organisations.length})`} open={openSections.organisations} onToggle={() => toggleSection('organisations')}>
          <div className="divide-y divide-border/50">
            {organisations.map(org => (
              <div key={org.tiers_id} className="flex items-center justify-between px-5 py-3 hover:bg-accent/30 cursor-pointer transition-colors" onClick={() => navigate(`/app/tiers/${org.tiers_id}`)}>
                <div className="flex items-center gap-3">
                  <Building2 className="h-4 w-4 text-emerald-600" />
                  <p className="text-sm font-medium text-foreground">{org.raison_sociale || org.nom}</p>
                </div>
                <div className="flex items-center gap-2">
                  {org.fonction && <Badge variant="outline" className="text-[10px] capitalize">{org.fonction}</Badge>}
                  {org.est_principal && <Badge className="bg-primary/5 text-primary border-primary/30 text-[9px]">Principal</Badge>}
                </div>
              </div>
            ))}
          </div>
        </CollapsibleSection>
      )}

      {tiers.type_personne === 'morale' && membres.length > 0 && (
        <CollapsibleSection title={`Membres (${membres.length})`} open={openSections.organisations} onToggle={() => toggleSection('organisations')}>
          <div className="divide-y divide-border/50">
            {membres.map(m => (
              <div key={m.tiers_id} className="flex items-center justify-between px-5 py-3 hover:bg-accent/30 cursor-pointer transition-colors" onClick={() => navigate(`/app/tiers/${m.tiers_id}`)}>
                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 text-primary" />
                  <p className="text-sm font-medium text-foreground">{m.prenom ? `${m.prenom} ${m.nom}` : m.nom}</p>
                </div>
                <div className="flex items-center gap-2">
                  {m.fonction && <Badge variant="outline" className="text-[10px] capitalize">{m.fonction}</Badge>}
                  {m.est_principal && <Badge className="bg-primary/5 text-primary border-primary/30 text-[9px]">Principal</Badge>}
                </div>
              </div>
            ))}
          </div>
        </CollapsibleSection>
      )}

      <FloatingSaveBar visible={editing} onSave={handleSave} onCancel={handleCancel} saving={saving} />
      <ConfirmDialog
        open={showArchiveConfirm}
        onOpenChange={setShowArchiveConfirm}
        title={tiers.est_archive ? 'Restaurer ce tiers ?' : 'Archiver ce tiers ?'}
        description={tiers.est_archive
          ? 'Le tiers redeviendra visible dans les listes et les recherches.'
          : 'Le tiers sera masqué des listes, recherches et pickers. Les lots et missions liés restent consultables.'}
        confirmLabel={tiers.est_archive ? 'Restaurer' : 'Archiver'}
        variant={tiers.est_archive ? 'default' : 'destructive'}
        onConfirm={handleArchive}
      />
    </div>
  )
}

function CollapsibleSection({ title, open, onToggle, children }: { title: string; open: boolean; onToggle: () => void; children: React.ReactNode }) {
  return (
    <div className="elevation-raised rounded-xl overflow-hidden">
      <button onClick={onToggle} className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-accent/30 transition-colors">
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        {open ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
      </button>
      {open && <div className="border-t border-border/50">{children}</div>}
    </div>
  )
}

function InfoRow({ label, value, editing, children }: { label: string; value: React.ReactNode; editing: boolean; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between px-5 py-3">
      <span className="text-sm text-muted-foreground">{label}</span>
      {editing ? <div>{children}</div> : <span className="text-sm font-medium text-foreground">{value}</span>}
    </div>
  )
}

/* ── Lots Table (flat, with "Ajouter un lot") ── */
function LotsTable({ lotsProprietaire, lotsMandataire, tiersId, tiersName, isArchived }: {
  lotsProprietaire: Array<{ id: string; designation: string; type_bien: string; batiment_designation: string; est_principal: boolean }>
  lotsMandataire: Array<{ id: string; designation: string; type_bien: string; batiment_designation: string }>
  tiersId: string
  tiersName: string
  isArchived: boolean
}) {
  const navigate = useNavigate()
  const [showCreateLot, setShowCreateLot] = useState(false)
  const lotCols = useResizableColumns({ designation: 200, batiment: 180, type: 120, role: 120 })

  const allLots = [
    ...lotsProprietaire.map(l => ({ ...l, role: 'Propriétaire' as const })),
    ...lotsMandataire.map(l => ({ ...l, role: 'Mandataire' as const, est_principal: false })),
  ]

  function goToLot(lotId: string, lotName: string) {
    navigate(`/app/patrimoine/lots/${lotId}`, {
      state: {
        breadcrumbs: [
          { label: 'Tiers', href: '/app/tiers' },
          { label: tiersName, href: `/app/tiers/${tiersId}` },
          { label: lotName },
        ],
      },
    })
  }

  return (
    <>
      <div className="elevation-raised rounded-xl">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">Lots ({allLots.length})</h2>
          {!isArchived && (
            <Button size="sm" onClick={() => setShowCreateLot(true)}>
              <Plus className="h-3.5 w-3.5 mr-1.5" /> Ajouter un lot
            </Button>
          )}
        </div>

        {/* Table header */}
        <div className="flex items-center gap-3 px-5 py-2.5 text-xs font-medium text-muted-foreground border-b border-border/50 select-none">
          <div className="relative shrink-0" style={{ width: lotCols.colWidths.designation, minWidth: 40 }}>
            Désignation
            <ResizeHandle colId="designation" onResizeStart={lotCols.onResizeStart} onResize={lotCols.onResize} />
          </div>
          <div className="relative shrink-0" style={{ width: lotCols.colWidths.batiment, minWidth: 40 }}>
            Bâtiment
            <ResizeHandle colId="batiment" onResizeStart={lotCols.onResizeStart} onResize={lotCols.onResize} />
          </div>
          <div className="relative shrink-0" style={{ width: lotCols.colWidths.type, minWidth: 40 }}>
            Type
            <ResizeHandle colId="type" onResizeStart={lotCols.onResizeStart} onResize={lotCols.onResize} />
          </div>
          <div className="shrink-0" style={{ width: lotCols.colWidths.role, minWidth: 40 }}>
            Rôle
          </div>
        </div>

        {allLots.length > 0 ? (
          <div className="divide-y divide-border/30">
            {allLots.map(lot => (
              <div
                key={lot.id + lot.role}
                className="flex items-center gap-3 px-5 py-3 hover:bg-accent/50 cursor-pointer transition-colors"
                onClick={() => goToLot(lot.id, lot.designation)}
              >
                <div className="shrink-0 text-sm font-medium text-foreground truncate" style={{ width: lotCols.colWidths.designation }}>{lot.designation}</div>
                <div className="shrink-0 text-sm text-muted-foreground truncate" style={{ width: lotCols.colWidths.batiment }}>{lot.batiment_designation}</div>
                <div className="shrink-0" style={{ width: lotCols.colWidths.type }}>
                  <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px] capitalize">{lot.type_bien.replace('_', ' ')}</Badge>
                </div>
                <div className="shrink-0" style={{ width: lotCols.colWidths.role }}>
                  <Badge className={lot.role === 'Mandataire' ? 'bg-blue-50 text-blue-700 border-blue-200 text-[10px]' : 'bg-amber-50 text-amber-700 border-amber-200 text-[10px]'}>
                    {lot.role}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-muted-foreground text-sm">Aucun lot lié</div>
        )}
      </div>

      <CreateLotModal
        open={showCreateLot}
        onOpenChange={setShowCreateLot}
        onCreated={(lotId) => navigate(`/app/patrimoine/lots/${lotId}`)}
      />
    </>
  )
}
