import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Archive, ArchiveRestore, User, Building2, Home, ChevronRight, ChevronUp, ChevronDown, Pencil, AlertTriangle, Plus, X, Search, Users, ClipboardList } from 'lucide-react'
import { Button } from 'src/components/ui/button'
import { Badge } from 'src/components/ui/badge'
import { Skeleton } from 'src/components/ui/skeleton'
import { Input } from 'src/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from 'src/components/ui/select'
import { Textarea } from 'src/components/ui/textarea'
import { Switch } from 'src/components/ui/switch'
import { FloatingSaveBar } from '../../../components/shared/floating-save-bar'
import { useLotDetail, useUpdateLot, useSearchTiers, useLinkProprietaire, useUnlinkProprietaire } from '../api'
import { CreateTiersModal } from '../../tiers/components/create-tiers-modal'
import { formatDate } from '../../../lib/formatters'
import { toast } from 'sonner'

const typeBienLabels: Record<string, string> = {
  appartement: 'Appartement', maison: 'Maison', studio: 'Studio',
  local_commercial: 'Local commercial', parking: 'Parking', cave: 'Cave', autre: 'Autre',
}

const typeBienOptions = [
  { value: 'appartement', label: 'Appartement' },
  { value: 'maison', label: 'Maison' },
  { value: 'studio', label: 'Studio' },
  { value: 'local_commercial', label: 'Local commercial' },
  { value: 'parking', label: 'Parking' },
  { value: 'cave', label: 'Cave' },
  { value: 'autre', label: 'Autre' },
]

const dpeOptions = ['', 'A', 'B', 'C', 'D', 'E', 'F', 'G']

const ENERGY_TYPE_OPTIONS = [
  { value: '', label: '\u2014' },
  { value: 'electrique', label: 'Électrique' },
  { value: 'gaz', label: 'Gaz' },
  { value: 'fioul', label: 'Fioul' },
  { value: 'bois', label: 'Bois' },
  { value: 'pompe_a_chaleur', label: 'Pompe à chaleur' },
  { value: 'autre', label: 'Autre' },
]

const ENERGY_MODE_OPTIONS = [
  { value: '', label: '\u2014' },
  { value: 'individuel', label: 'Individuel' },
  { value: 'collectif', label: 'Collectif' },
]

const energyLabels: Record<string, string> = {
  individuel: 'Individuel', collectif: 'Collectif',
  gaz: 'Gaz', electrique: 'Électrique', fioul: 'Fioul', bois: 'Bois',
  pompe_a_chaleur: 'Pompe à chaleur', autre: 'Autre',
}

export function LotDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [editing, setEditing] = useState(false)
  const { data: lot, isLoading } = useLotDetail(id)
  const updateMutation = useUpdateLot()

  // Collapsible section states
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    general: true,
    energie: false,
    annexes: false,
    tiers: false,
    commentaire: false,
  })

  function toggleSection(key: string) {
    setOpenSections(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const [formData, setFormData] = useState({
    designation: '', type_bien: '', etage: '', surface: '', nb_pieces: '',
    meuble: false, emplacement_palier: '', num_cave: '', num_parking: '',
    dpe_classe: '', ges_classe: '', commentaire: '', reference_interne: '',
    eau_chaude_type: '', eau_chaude_mode: '', chauffage_type: '', chauffage_mode: '',
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (lot) {
      setFormData({
        designation: lot.designation || '',
        type_bien: lot.type_bien || '',
        etage: lot.etage || '',
        surface: lot.surface?.toString() || '',
        nb_pieces: lot.nb_pieces || '',
        meuble: lot.meuble || false,
        emplacement_palier: lot.emplacement_palier || '',
        num_cave: lot.num_cave || '',
        num_parking: lot.num_parking || '',
        dpe_classe: lot.dpe_classe || '',
        ges_classe: lot.ges_classe || '',
        commentaire: lot.commentaire || '',
        reference_interne: lot.reference_interne || '',
        eau_chaude_type: lot.eau_chaude_type || '',
        eau_chaude_mode: lot.eau_chaude_mode || '',
        chauffage_type: lot.chauffage_type || '',
        chauffage_mode: lot.chauffage_mode || '',
      })
    }
  }, [lot, editing])

  if (isLoading) {
    return (
      <div className="p-6 space-y-5 max-w-4xl mx-auto">
        <Skeleton className="h-12 w-72" />
        <Skeleton className="h-64 rounded-xl" />
        <Skeleton className="h-14 rounded-xl" />
        <Skeleton className="h-14 rounded-xl" />
      </div>
    )
  }

  if (!lot) return <div className="p-6"><p className="text-muted-foreground">Lot introuvable</p></div>

  const proprietaires = lot.proprietaires ?? []
  const mandataire = lot.mandataire

  async function handleArchive() {
    if (!id) return
    try {
      await updateMutation.mutateAsync({ id, est_archive: !lot!.est_archive })
      toast.success(lot!.est_archive ? 'Lot restauré' : 'Lot archivé')
    } catch (err: any) {
      toast.error(err.message || 'Erreur')
    }
  }

  function handleCancel() {
    if (lot) {
      setFormData({
        designation: lot.designation || '',
        type_bien: lot.type_bien || '',
        etage: lot.etage || '',
        surface: lot.surface?.toString() || '',
        nb_pieces: lot.nb_pieces || '',
        meuble: lot.meuble || false,
        emplacement_palier: lot.emplacement_palier || '',
        num_cave: lot.num_cave || '',
        num_parking: lot.num_parking || '',
        dpe_classe: lot.dpe_classe || '',
        ges_classe: lot.ges_classe || '',
        commentaire: lot.commentaire || '',
        reference_interne: lot.reference_interne || '',
        eau_chaude_type: lot.eau_chaude_type || '',
        eau_chaude_mode: lot.eau_chaude_mode || '',
        chauffage_type: lot.chauffage_type || '',
        chauffage_mode: lot.chauffage_mode || '',
      })
    }
    setEditing(false)
  }

  async function handleSave() {
    setSaving(true)
    try {
      await updateMutation.mutateAsync({
        id: lot!.id,
        designation: formData.designation,
        type_bien: formData.type_bien,
        etage: formData.etage || null,
        surface: formData.surface ? parseFloat(formData.surface) : null,
        nb_pieces: formData.nb_pieces || null,
        meuble: formData.meuble,
        emplacement_palier: formData.emplacement_palier || null,
        num_cave: formData.num_cave || null,
        num_parking: formData.num_parking || null,
        dpe_classe: formData.dpe_classe || null,
        ges_classe: formData.ges_classe || null,
        commentaire: formData.commentaire || null,
        reference_interne: formData.reference_interne || null,
        eau_chaude_type: formData.eau_chaude_type || null,
        eau_chaude_mode: formData.eau_chaude_mode || null,
        chauffage_type: formData.chauffage_type || null,
        chauffage_mode: formData.chauffage_mode || null,
      })
      toast.success('Lot mis à jour')
      setTimeout(() => setEditing(false), 400)
    } catch {
      toast.error('Erreur')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-6 space-y-5 max-w-4xl mx-auto">
      {/* Header — icon + name + badge + actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <ClipboardList className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">{lot.designation}</h1>
            <div className="mt-1 flex items-center gap-2">
              <Badge className="bg-primary/10 text-primary border-primary/20 capitalize">
                {typeBienLabels[lot.type_bien] || lot.type_bien}
              </Badge>
              {lot.meuble && <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]">Meublé</Badge>}
              {lot.est_archive && <Badge variant="destructive" className="text-[10px]">Archivé</Badge>}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {!lot.est_archive && !editing && (
            <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
              <Pencil className="h-3.5 w-3.5 mr-1.5" /> Modifier
            </Button>
          )}
          <Button variant="outline" size="sm" className={lot.est_archive ? '' : 'text-destructive hover:text-destructive'} onClick={handleArchive}>
            {lot.est_archive ? <ArchiveRestore className="h-3.5 w-3.5 mr-1.5" /> : <Archive className="h-3.5 w-3.5 mr-1.5" />}
            {lot.est_archive ? 'Restaurer' : 'Archiver'}
          </Button>
        </div>
      </div>

      {lot.est_archive && (
        <div className="flex items-center gap-2 px-3 py-2.5 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-xs">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
          Ce lot est archivé. Les modifications sont désactivées.
        </div>
      )}

      {/* ── Section: Informations générales (open by default) ── */}
      <CollapsibleSection title="Informations générales" open={openSections.general} onToggle={() => toggleSection('general')}>
        <div className="divide-y divide-border/50">
          <InfoRow label="Désignation" editing={editing} value={lot.designation}>
            <Input value={formData.designation} onChange={(e) => setFormData(prev => ({ ...prev, designation: e.target.value }))} className="h-8 w-48 text-sm" />
          </InfoRow>
          <InfoRow label="Type de bien" editing={editing} value={lot.type_bien}>
            <Select value={formData.type_bien} onValueChange={(v) => setFormData(prev => ({ ...prev, type_bien: v }))}>
              <SelectTrigger className="h-8 w-48 text-sm"><SelectValue /></SelectTrigger>
              <SelectContent>
                {typeBienOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </InfoRow>
          <InfoRow label="Réf. interne" editing={editing} value={lot.reference_interne || '--'}>
            <Input value={formData.reference_interne} onChange={(e) => setFormData(prev => ({ ...prev, reference_interne: e.target.value }))} className="h-8 w-48 text-sm" />
          </InfoRow>
          <InfoRow label="N° appartement" editing={false} value={lot.designation || '--'}>
            <span />
          </InfoRow>
          <InfoRow label="Nb pièces" editing={editing} value={lot.nb_pieces || '--'}>
            <Input value={formData.nb_pieces} onChange={(e) => setFormData(prev => ({ ...prev, nb_pieces: e.target.value }))} className="h-8 w-48 text-sm" />
          </InfoRow>
          <InfoRow label="Étage" editing={editing} value={lot.etage || '--'}>
            <Input value={formData.etage} onChange={(e) => setFormData(prev => ({ ...prev, etage: e.target.value }))} className="h-8 w-48 text-sm" />
          </InfoRow>
          <InfoRow label="Emplacement / palier" editing={editing} value={lot.emplacement_palier || '--'}>
            <Input value={formData.emplacement_palier} onChange={(e) => setFormData(prev => ({ ...prev, emplacement_palier: e.target.value }))} className="h-8 w-48 text-sm" />
          </InfoRow>
          <InfoRow label="Surface" editing={editing} value={lot.surface ? `${lot.surface} m²` : '--'}>
            <Input type="number" value={formData.surface} onChange={(e) => setFormData(prev => ({ ...prev, surface: e.target.value }))} className="h-8 w-48 text-sm" />
          </InfoRow>
          <InfoRow label="Meublé" editing={editing} value={lot.meuble ? 'Oui' : 'Non'}>
            <Switch checked={formData.meuble} onCheckedChange={(checked) => setFormData(prev => ({ ...prev, meuble: checked }))} />
          </InfoRow>
        </div>
      </CollapsibleSection>

      {/* ── Section: Énergie ── */}
      <CollapsibleSection title="Énergie" open={openSections.energie} onToggle={() => toggleSection('energie')}>
        <div className="divide-y divide-border/50">
          <InfoRow label="DPE" editing={editing} value={lot.dpe_classe || '--'}>
            <Select value={formData.dpe_classe} onValueChange={(v) => setFormData(prev => ({ ...prev, dpe_classe: v }))}>
              <SelectTrigger className="h-8 w-48 text-sm"><SelectValue placeholder="--" /></SelectTrigger>
              <SelectContent>{dpeOptions.map(o => <SelectItem key={o || '__empty'} value={o}>{o || '--'}</SelectItem>)}</SelectContent>
            </Select>
          </InfoRow>
          <InfoRow label="GES" editing={editing} value={lot.ges_classe || '--'}>
            <Select value={formData.ges_classe} onValueChange={(v) => setFormData(prev => ({ ...prev, ges_classe: v }))}>
              <SelectTrigger className="h-8 w-48 text-sm"><SelectValue placeholder="--" /></SelectTrigger>
              <SelectContent>{dpeOptions.map(o => <SelectItem key={o || '__empty'} value={o}>{o || '--'}</SelectItem>)}</SelectContent>
            </Select>
          </InfoRow>
          <InfoRow label="Eau chaude" editing={editing} value={lot.eau_chaude_type ? `${energyLabels[lot.eau_chaude_type] || lot.eau_chaude_type}${lot.eau_chaude_mode ? ` (${energyLabels[lot.eau_chaude_mode] || lot.eau_chaude_mode})` : ''}` : '--'}>
            <div className="flex items-center gap-1.5">
              <select value={formData.eau_chaude_type} onChange={(e) => setFormData(prev => ({ ...prev, eau_chaude_type: e.target.value }))} className="h-8 text-sm rounded-md border border-border bg-card px-2 focus:outline-none focus:ring-1 focus:ring-primary">
                {ENERGY_TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <select value={formData.eau_chaude_mode} onChange={(e) => setFormData(prev => ({ ...prev, eau_chaude_mode: e.target.value }))} className="h-8 text-sm rounded-md border border-border bg-card px-2 focus:outline-none focus:ring-1 focus:ring-primary">
                {ENERGY_MODE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </InfoRow>
          <InfoRow label="Chauffage" editing={editing} value={lot.chauffage_type ? `${energyLabels[lot.chauffage_type] || lot.chauffage_type}${lot.chauffage_mode ? ` (${energyLabels[lot.chauffage_mode] || lot.chauffage_mode})` : ''}` : '--'}>
            <div className="flex items-center gap-1.5">
              <select value={formData.chauffage_type} onChange={(e) => setFormData(prev => ({ ...prev, chauffage_type: e.target.value }))} className="h-8 text-sm rounded-md border border-border bg-card px-2 focus:outline-none focus:ring-1 focus:ring-primary">
                {ENERGY_TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <select value={formData.chauffage_mode} onChange={(e) => setFormData(prev => ({ ...prev, chauffage_mode: e.target.value }))} className="h-8 text-sm rounded-md border border-border bg-card px-2 focus:outline-none focus:ring-1 focus:ring-primary">
                {ENERGY_MODE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </InfoRow>
        </div>
      </CollapsibleSection>

      {/* ── Section: Annexes ── */}
      <CollapsibleSection title="Annexes" open={openSections.annexes} onToggle={() => toggleSection('annexes')}>
        <div className="divide-y divide-border/50">
          <InfoRow label="N° cave" editing={editing} value={lot.num_cave || '--'}>
            <Input value={formData.num_cave} onChange={(e) => setFormData(prev => ({ ...prev, num_cave: e.target.value }))} className="h-8 w-48 text-sm" />
          </InfoRow>
          <InfoRow label="N° parking" editing={editing} value={lot.num_parking || '--'}>
            <Input value={formData.num_parking} onChange={(e) => setFormData(prev => ({ ...prev, num_parking: e.target.value }))} className="h-8 w-48 text-sm" />
          </InfoRow>
        </div>
      </CollapsibleSection>

      {/* ── Section: Tiers liés ── */}
      <CollapsibleSection title={`Tiers liés (${(proprietaires.length + (mandataire ? 1 : 0))})`} open={openSections.tiers} onToggle={() => toggleSection('tiers')}>
        <TiersLiesContent lotId={lot.id} proprietaires={proprietaires} mandataire={mandataire} isArchived={lot.est_archive} />
      </CollapsibleSection>

      {/* ── Section: Commentaire ── */}
      <CollapsibleSection title="Commentaire" open={openSections.commentaire} onToggle={() => toggleSection('commentaire')}>
        <div className="px-5 py-4">
          {editing ? (
            <Textarea value={formData.commentaire} onChange={(e) => setFormData(prev => ({ ...prev, commentaire: e.target.value }))} rows={3} className="text-sm" placeholder="Ajouter un commentaire..." />
          ) : (
            <p className="text-sm text-foreground">{lot.commentaire || <span className="text-muted-foreground">--</span>}</p>
          )}
        </div>
      </CollapsibleSection>

      {/* Meta */}
      <p className="text-[10px] text-muted-foreground/50 px-1">
        Créé {formatDate(lot.created_at)} — Modifié {formatDate(lot.updated_at)}
      </p>

      <FloatingSaveBar visible={editing} onSave={handleSave} onCancel={handleCancel} saving={saving} />
    </div>
  )
}

/* ── Collapsible Section ── */
function CollapsibleSection({ title, open, onToggle, children }: { title: string; open: boolean; onToggle: () => void; children: React.ReactNode }) {
  return (
    <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-accent/30 transition-colors"
      >
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
        {open ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
      </button>
      {open && <div className="border-t border-border/50">{children}</div>}
    </div>
  )
}

/* ── Info Row ── */
function InfoRow({ label, value, editing, children }: { label: string; value: React.ReactNode; editing: boolean; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between px-5 py-3">
      <span className="text-sm text-muted-foreground">{label}</span>
      {editing ? <div>{children}</div> : <span className="text-sm font-medium text-foreground">{value}</span>}
    </div>
  )
}

/* ── Tiers Liés Content ── */
function TiersLiesContent({ lotId, proprietaires, mandataire, isArchived }: {
  lotId: string
  proprietaires: Array<{ id: string; nom: string; prenom?: string | null; raison_sociale?: string | null; email?: string | null; tel?: string | null; est_principal?: boolean }>
  mandataire: { id: string; nom: string; prenom?: string | null; raison_sociale?: string | null; email?: string | null } | null
  isArchived: boolean
}) {
  const [showAdd, setShowAdd] = useState(false)
  const [showCreateTiers, setShowCreateTiers] = useState(false)
  const [searchQ, setSearchQ] = useState('')
  const { data: searchResults } = useSearchTiers(searchQ)
  const linkMutation = useLinkProprietaire()
  const unlinkMutation = useUnlinkProprietaire()

  async function handleLink(tiersId: string) {
    await linkMutation.mutateAsync({ lotId, tiersId, estPrincipal: proprietaires.length === 0 })
    setShowAdd(false)
    setSearchQ('')
  }

  const totalTiers = proprietaires.length + (mandataire ? 1 : 0)

  return (
    <div className="px-5 py-4 space-y-3">
      {!isArchived && (
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => setShowCreateTiers(true)}>
            <Plus className="h-3 w-3 mr-1" /> Nouveau tiers
          </Button>
          <Button variant="ghost" size="sm" className="h-7 text-xs text-primary hover:text-primary" onClick={() => setShowAdd(!showAdd)}>
            {showAdd ? 'Fermer' : <><Plus className="h-3 w-3 mr-1" /> Ajouter propriétaire</>}
          </Button>
        </div>
      )}

      {showAdd && (
        <div className="p-3 bg-primary/5 border border-primary/30 rounded-lg space-y-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input value={searchQ} onChange={(e) => setSearchQ(e.target.value)} placeholder="Rechercher un tiers..." className="pl-8 h-8 text-xs" autoFocus />
          </div>
          {searchResults && searchResults.length > 0 && (
            <div className="max-h-32 overflow-y-auto space-y-1">
              {searchResults.filter(t => !proprietaires.some(p => p.id === t.id)).map(t => (
                <button key={t.id} onClick={() => handleLink(t.id)} className="w-full flex items-center gap-2 px-2 py-1.5 text-xs hover:bg-primary/10 rounded transition-colors text-left">
                  <User className="h-3 w-3 text-muted-foreground shrink-0" />
                  <span className="font-medium text-foreground">{t.prenom ? `${t.prenom} ${t.nom}` : t.raison_sociale || t.nom}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {totalTiers > 0 ? (
        <div className="space-y-2">
          {proprietaires.map((p) => (
            <div key={p.id} className="flex items-center justify-between py-2 group">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-primary">{(p.prenom?.[0] || p.nom[0]).toUpperCase()}</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{p.prenom ? `${p.prenom} ${p.nom}` : p.raison_sociale || p.nom}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Badge className="bg-amber-50 text-amber-700 border-amber-200 text-[9px]">Propriétaire</Badge>
                    {p.est_principal && <Badge className="bg-primary/5 text-primary border-primary/30 text-[9px]">Principal</Badge>}
                  </div>
                </div>
              </div>
              {!isArchived && (
                <button onClick={() => unlinkMutation.mutate({ lotId, tiersId: p.id })} className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-red-500 transition-all" title="Retirer">
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          ))}

          {mandataire && (
            <div className="flex items-center gap-3 py-2">
              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                <span className="text-xs font-bold text-blue-700">{(mandataire.nom[0]).toUpperCase()}</span>
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  {mandataire.prenom ? `${mandataire.prenom} ${mandataire.nom}` : mandataire.raison_sociale || mandataire.nom}
                </p>
                <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-[9px] mt-0.5">Mandataire</Badge>
              </div>
            </div>
          )}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">Aucun tiers lié</p>
      )}

      <CreateTiersModal
        open={showCreateTiers}
        onOpenChange={setShowCreateTiers}
        onCreated={() => toast.success('Tiers créé — vous pouvez maintenant le lier au lot')}
      />
    </div>
  )
}
