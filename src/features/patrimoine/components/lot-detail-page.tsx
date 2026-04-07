import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Archive, ArchiveRestore, User, Building2, Home, Ruler, BedDouble, Zap, ChevronRight, ChevronDown, Pencil, AlertTriangle, Thermometer, Car, Warehouse, Plus, X, Search, Flame, Droplets, Users } from 'lucide-react'
import { Button } from 'src/components/ui/button'
import { Badge } from 'src/components/ui/badge'
import { Card, CardContent } from 'src/components/ui/card'
import { Skeleton } from 'src/components/ui/skeleton'
import { Separator } from 'src/components/ui/separator'
import { Input } from 'src/components/ui/input'
import { useLotDetail, useUpdateLot, useSearchTiers, useLinkProprietaire, useUnlinkProprietaire } from '../api'
import { EditLotForm } from './edit-lot-form'
import { CreateTiersModal } from '../../tiers/components/create-tiers-modal'
import { formatDate } from '../../../lib/formatters'
import { toast } from 'sonner'

const typeBienLabels: Record<string, string> = {
  appartement: 'Appartement', maison: 'Maison', studio: 'Studio',
  local_commercial: 'Local commercial', parking: 'Parking', cave: 'Cave', autre: 'Autre',
}

function InfoItem({ label, value, className }: { label: string; value: React.ReactNode; className?: string }) {
  return (
    <div className={`flex items-center justify-between py-2 ${className ?? ''}`}>
      <span className="text-xs text-gray-400">{label}</span>
      <span className="text-sm font-medium text-gray-800">{value || '—'}</span>
    </div>
  )
}

export function LotDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [editing, setEditing] = useState(false)
  const { data: lot, isLoading } = useLotDetail(id)
  const updateMutation = useUpdateLot()

  if (isLoading) {
    return (
      <div className="p-6 space-y-5 max-w-6xl mx-auto">
        <Skeleton className="h-10 w-72" />
        <Skeleton className="h-16 w-full rounded-xl" />
        <div className="grid grid-cols-3 gap-4"><Skeleton className="h-64 rounded-xl" /><Skeleton className="h-64 rounded-xl" /><Skeleton className="h-64 rounded-xl" /></div>
      </div>
    )
  }

  if (!lot) return <div className="p-6"><p className="text-gray-400">Lot introuvable</p></div>

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

  return (
    <div className="p-6 space-y-5 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-start gap-3">
        <Button variant="ghost" size="icon" className="mt-0.5 shrink-0 h-8 w-8" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-bold text-gray-900">{lot.designation}</h1>
            <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-[10px] font-medium">
              {typeBienLabels[lot.type_bien] || lot.type_bien}
            </Badge>
            {lot.meuble && <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]">Meublé</Badge>}
            {lot.est_archive && <Badge variant="destructive" className="text-[10px]">Archivé</Badge>}
          </div>
          {lot.batiment && (
            <button
              className="text-xs text-gray-400 mt-0.5 flex items-center gap-1 hover:text-primary transition-colors group"
              onClick={() => navigate(`/app/patrimoine/batiments/${lot.batiment!.id}`)}
            >
              <Building2 className="h-3 w-3" />
              {lot.batiment.designation}
              <ChevronRight className="h-2.5 w-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          )}
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {!lot.est_archive && (
            <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => setEditing(!editing)}>
              <Pencil className="h-3 w-3 mr-1" /> {editing ? 'Annuler' : 'Modifier'}
            </Button>
          )}
          <Button variant="outline" size="sm" className="h-8 text-xs" onClick={handleArchive}>
            {lot.est_archive ? <ArchiveRestore className="h-3 w-3 mr-1" /> : <Archive className="h-3 w-3 mr-1" />}
            {lot.est_archive ? 'Restaurer' : 'Archiver'}
          </Button>
        </div>
      </div>

      {lot.est_archive && (
        <div className="flex items-center gap-2 px-3 py-2.5 bg-primary/5 border border-primary/30 rounded-lg text-primary text-xs">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
          Ce lot est archivé. Les modifications sont désactivées.
        </div>
      )}

      {/* Quick stats band */}
      <div className="flex items-center gap-0 bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden divide-x divide-gray-100">
        {[
          { icon: Home, label: 'Étage', value: lot.etage || 'RDC', bg: 'bg-blue-500' },
          { icon: Building2, label: 'Type', value: typeBienLabels[lot.type_bien], bg: 'bg-primary' },
          { icon: Ruler, label: 'Surface', value: lot.surface ? `${lot.surface} m²` : '—', bg: 'bg-emerald-500' },
          { icon: BedDouble, label: 'Pièces', value: lot.nb_pieces || '—', bg: 'bg-violet-500' },
          { icon: Zap, label: 'DPE', value: lot.dpe_classe || '—', bg: 'bg-orange-500' },
          { icon: Thermometer, label: 'GES', value: lot.ges_classe || '—', bg: 'bg-rose-500' },
        ].map(({ icon: Icon, label, value, bg }) => (
          <div key={label} className="flex-1 flex items-center gap-2.5 px-4 py-3">
            <div className={`h-7 w-7 rounded-md flex items-center justify-center shrink-0 ${bg}`}>
              <Icon className="h-3.5 w-3.5 text-white" />
            </div>
            <div>
              <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider leading-none">{label}</p>
              <p className="text-sm font-bold text-gray-900 leading-tight">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Edit form */}
      {editing && (
        <Card className="shadow-sm border-primary/30 bg-primary/5">
          <CardContent className="pt-5">
            <EditLotForm
              lot={lot}
              onSave={async (data) => {
                await updateMutation.mutateAsync({ id: lot.id, ...data })
                toast.success('Lot mis à jour')
                setEditing(false)
              }}
              onCancel={() => setEditing(false)}
            />
          </CardContent>
        </Card>
      )}

      {/* Content — single-page layout */}
      {!editing && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            {/* Left sidebar — Énergie + Annexes */}
            <div className="space-y-4">
              <EnergieSection lot={lot} editing={false} onSave={async (data) => {
                await updateMutation.mutateAsync({ id: lot.id, ...data })
                toast.success('Lot mis à jour')
              }} />
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                <button
                  onClick={() => {}}
                  className="w-full flex items-center justify-between px-5 py-3.5"
                >
                  <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Annexes</h2>
                </button>
                <div className="px-5 pb-5 space-y-2">
                  <div className="flex items-center gap-3 p-2.5 rounded-lg bg-gray-50 border border-gray-100">
                    <Warehouse className="h-4 w-4 text-gray-500" />
                    <span className="text-xs text-gray-500 flex-1">Cave</span>
                    <span className="text-sm font-medium text-gray-900">{lot.num_cave || '—'}</span>
                  </div>
                  <div className="flex items-center gap-3 p-2.5 rounded-lg bg-gray-50 border border-gray-100">
                    <Car className="h-4 w-4 text-gray-500" />
                    <span className="text-xs text-gray-500 flex-1">Parking</span>
                    <span className="text-sm font-medium text-gray-900">{lot.num_parking || '—'}</span>
                  </div>
                </div>
              </div>
              <p className="text-[10px] text-gray-300 px-1">
                Créé {formatDate(lot.created_at)} — Modifié {formatDate(lot.updated_at)}
              </p>
            </div>

            {/* Right main — Détails complémentaires */}
            <div className="col-span-2 bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Détails complémentaires</h2>
              <div className="grid grid-cols-2 gap-x-8 divide-y divide-gray-50">
                <InfoItem label="Désignation" value={lot.designation} />
                <InfoItem label="Référence" value={lot.reference_interne} />
                <InfoItem label="Meublé" value={lot.meuble ? <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]">Oui</Badge> : 'Non'} />
                <InfoItem label="Emplacement palier" value={lot.emplacement_palier} />
                <InfoItem label="N° cave" value={lot.num_cave} />
                <InfoItem label="N° parking" value={lot.num_parking} />
              </div>
              {lot.commentaire && (
                <>
                  <Separator className="my-3" />
                  <p className="text-xs text-gray-400 mb-1.5">Commentaire</p>
                  <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3 border border-gray-100 leading-relaxed">{lot.commentaire}</p>
                </>
              )}
            </div>
          </div>

          {/* Tiers liés */}
          <TiersLiesSection lotId={lot.id} proprietaires={proprietaires} mandataire={mandataire} isArchived={lot.est_archive} />

          {/* Missions placeholder */}
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
            <div className="px-5 py-3.5">
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Missions</h2>
            </div>
            <div className="py-10 text-center">
              <div className="h-12 w-12 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-3">
                <Building2 className="h-5 w-5 text-gray-400" />
              </div>
              <p className="text-sm font-medium text-gray-500">Aucune mission pour ce lot</p>
              <p className="text-xs text-gray-400 mt-1">Sprint 3</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Collapsible Énergie section with inline edit support
const ENERGY_TYPE_OPTIONS = [
  { value: '', label: '—' },
  { value: 'electrique', label: 'Électrique' },
  { value: 'gaz', label: 'Gaz' },
  { value: 'fioul', label: 'Fioul' },
  { value: 'bois', label: 'Bois' },
  { value: 'pompe_a_chaleur', label: 'Pompe à chaleur' },
  { value: 'autre', label: 'Autre' },
]

const ENERGY_MODE_OPTIONS = [
  { value: '', label: '—' },
  { value: 'individuel', label: 'Individuel' },
  { value: 'collectif', label: 'Collectif' },
]

function EnergieSection({ lot, editing, onSave }: { lot: any; editing: boolean; onSave: (data: any) => Promise<void> }) {
  const [open, setOpen] = useState(true)
  const [energyEditing, setEnergyEditing] = useState(false)
  const [eauChaudeType, setEauChaudeType] = useState(lot.eau_chaude_type || '')
  const [eauChaudeMode, setEauChaudeMode] = useState(lot.eau_chaude_mode || '')
  const [chauffageType, setChauffageType] = useState(lot.chauffage_type || '')
  const [chauffageMode, setChauffageMode] = useState(lot.chauffage_mode || '')
  const [saving, setSaving] = useState(false)

  const energyLabels: Record<string, string> = {
    individuelle: 'Individuelle', collective: 'Collective', aucun: 'Aucun', autre: 'Autre',
    individuel: 'Individuel', collectif: 'Collectif',
    gaz: 'Gaz', electrique: 'Électrique', fioul: 'Fioul', bois: 'Bois',
    pompe_a_chaleur: 'Pompe à chaleur',
  }

  async function handleEnergySave() {
    setSaving(true)
    try {
      await onSave({
        eau_chaude_type: eauChaudeType || null,
        eau_chaude_mode: eauChaudeMode || null,
        chauffage_type: chauffageType || null,
        chauffage_mode: chauffageMode || null,
      })
      setEnergyEditing(false)
    } finally {
      setSaving(false)
    }
  }

  function handleEnergyCancel() {
    setEauChaudeType(lot.eau_chaude_type || '')
    setEauChaudeMode(lot.eau_chaude_mode || '')
    setChauffageType(lot.chauffage_type || '')
    setChauffageMode(lot.chauffage_mode || '')
    setEnergyEditing(false)
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-gray-50/50 transition-colors"
      >
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Énergie</h2>
        <div className="flex items-center gap-1">
          {open && !energyEditing && !editing && (
            <span
              role="button"
              className="p-1 text-gray-300 hover:text-primary transition-colors"
              onClick={(e) => { e.stopPropagation(); setEnergyEditing(true) }}
            >
              <Pencil className="h-3 w-3" />
            </span>
          )}
          {open ? <ChevronDown className="h-4 w-4 text-gray-300" /> : <ChevronRight className="h-4 w-4 text-gray-300" />}
        </div>
      </button>
      {open && (
        <div className="px-5 pb-5 space-y-2">
          <div className="flex items-center gap-3 p-2.5 rounded-lg bg-gray-50 border border-gray-100">
            <Zap className="h-4 w-4 text-orange-500" />
            <span className="text-xs text-gray-500 flex-1">DPE</span>
            <span className="text-sm font-bold text-gray-900">{lot.dpe_classe || '—'}</span>
          </div>
          <div className="flex items-center gap-3 p-2.5 rounded-lg bg-gray-50 border border-gray-100">
            <Thermometer className="h-4 w-4 text-rose-500" />
            <span className="text-xs text-gray-500 flex-1">GES</span>
            <span className="text-sm font-bold text-gray-900">{lot.ges_classe || '—'}</span>
          </div>

          {/* Eau chaude */}
          <div className={`flex items-center gap-3 p-2.5 rounded-lg border ${energyEditing ? 'bg-primary/5 border-primary/30' : 'bg-gray-50 border-gray-100'}`}>
            <Droplets className="h-4 w-4 text-blue-500 shrink-0" />
            <span className="text-xs text-gray-500 shrink-0">Eau chaude</span>
            {energyEditing ? (
              <div className="flex-1 flex items-center gap-1.5 justify-end">
                <select value={eauChaudeType} onChange={(e) => setEauChaudeType(e.target.value)} className="h-7 text-xs rounded-md border border-gray-200 bg-white px-2 focus:outline-none focus:ring-1 focus:ring-primary">
                  {ENERGY_TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                <select value={eauChaudeMode} onChange={(e) => setEauChaudeMode(e.target.value)} className="h-7 text-xs rounded-md border border-gray-200 bg-white px-2 focus:outline-none focus:ring-1 focus:ring-primary">
                  {ENERGY_MODE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
            ) : (
              <span className="text-sm font-medium text-gray-900 flex-1 text-right">
                {lot.eau_chaude_type ? `${energyLabels[lot.eau_chaude_type] || lot.eau_chaude_type}${lot.eau_chaude_mode ? ` (${energyLabels[lot.eau_chaude_mode] || lot.eau_chaude_mode})` : ''}` : '—'}
              </span>
            )}
          </div>

          {/* Chauffage */}
          <div className={`flex items-center gap-3 p-2.5 rounded-lg border ${energyEditing ? 'bg-primary/5 border-primary/30' : 'bg-gray-50 border-gray-100'}`}>
            <Flame className="h-4 w-4 text-red-500 shrink-0" />
            <span className="text-xs text-gray-500 shrink-0">Chauffage</span>
            {energyEditing ? (
              <div className="flex-1 flex items-center gap-1.5 justify-end">
                <select value={chauffageType} onChange={(e) => setChauffageType(e.target.value)} className="h-7 text-xs rounded-md border border-gray-200 bg-white px-2 focus:outline-none focus:ring-1 focus:ring-primary">
                  {ENERGY_TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                <select value={chauffageMode} onChange={(e) => setChauffageMode(e.target.value)} className="h-7 text-xs rounded-md border border-gray-200 bg-white px-2 focus:outline-none focus:ring-1 focus:ring-primary">
                  {ENERGY_MODE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
            ) : (
              <span className="text-sm font-medium text-gray-900 flex-1 text-right">
                {lot.chauffage_type ? `${energyLabels[lot.chauffage_type] || lot.chauffage_type}${lot.chauffage_mode ? ` (${energyLabels[lot.chauffage_mode] || lot.chauffage_mode})` : ''}` : '—'}
              </span>
            )}
          </div>

          {/* Save/Cancel buttons for energy edit */}
          {energyEditing && (
            <div className="flex items-center justify-end gap-2 pt-1">
              <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={handleEnergyCancel}>Annuler</Button>
              <Button size="sm" className="h-7 text-xs" onClick={handleEnergySave} disabled={saving}>
                {saving ? 'Enregistrement...' : 'Enregistrer'}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Unified Tiers liés section — proprietaires + mandataire as cards
function TiersLiesSection({ lotId, proprietaires, mandataire, isArchived }: {
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
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-gray-400" />
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Tiers liés ({totalTiers})
          </h2>
        </div>
        {!isArchived && (
          <div className="flex items-center gap-1.5">
            <Button variant="outline" size="sm" className="h-6 text-xs px-2" onClick={() => setShowCreateTiers(true)}>
              <Plus className="h-3 w-3 mr-1" /> Nouveau tiers
            </Button>
            <Button variant="ghost" size="sm" className="h-6 text-xs text-primary hover:text-primary px-2" onClick={() => setShowAdd(!showAdd)}>
              {showAdd ? 'Fermer' : <><Plus className="h-3 w-3 mr-1" /> Ajouter propriétaire</>}
            </Button>
          </div>
        )}
      </div>

      {showAdd && (
        <div className="mb-4 p-3 bg-primary/5 border border-primary/30 rounded-lg space-y-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
            <Input value={searchQ} onChange={(e) => setSearchQ(e.target.value)} placeholder="Rechercher un tiers..." className="pl-8 h-8 text-xs" autoFocus />
          </div>
          {searchResults && searchResults.length > 0 && (
            <div className="max-h-32 overflow-y-auto space-y-1">
              {searchResults.filter(t => !proprietaires.some(p => p.id === t.id)).map(t => (
                <button key={t.id} onClick={() => handleLink(t.id)} className="w-full flex items-center gap-2 px-2 py-1.5 text-xs hover:bg-primary/10 rounded transition-colors text-left">
                  <User className="h-3 w-3 text-gray-400 shrink-0" />
                  <span className="font-medium text-gray-800">{t.prenom ? `${t.prenom} ${t.nom}` : t.raison_sociale || t.nom}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {totalTiers > 0 ? (
        <div className="grid grid-cols-2 gap-3">
          {/* Propriétaire cards */}
          {proprietaires.map((p) => (
            <div key={p.id} className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:border-primary/30 transition-colors group">
              <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <span className="text-xs font-bold text-primary">{(p.prenom?.[0] || p.nom[0]).toUpperCase()}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-sm font-medium text-gray-900 truncate">{p.prenom ? `${p.prenom} ${p.nom}` : p.raison_sociale || p.nom}</p>
                  {p.est_principal && <Badge className="bg-primary/5 text-primary border-primary/30 text-[9px] shrink-0">Principal</Badge>}
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <Badge className="bg-amber-50 text-amber-700 border-amber-200 text-[9px] font-medium">Propriétaire</Badge>
                  <span className="text-xs text-gray-400 truncate">{p.email || p.tel || ''}</span>
                </div>
              </div>
              {!isArchived && (
                <button onClick={() => unlinkMutation.mutate({ lotId, tiersId: p.id })} className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-all shrink-0" title="Retirer">
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          ))}

          {/* Mandataire card */}
          {mandataire && (
            <div className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:border-blue-200 transition-colors">
              <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                <span className="text-xs font-bold text-blue-700">{(mandataire.nom[0]).toUpperCase()}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {mandataire.prenom ? `${mandataire.prenom} ${mandataire.nom}` : mandataire.raison_sociale || mandataire.nom}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-[9px] font-medium">Mandataire</Badge>
                  <span className="text-xs text-gray-400 truncate">{mandataire.email || ''}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-6">
          <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-2"><Users className="h-4 w-4 text-gray-400" /></div>
          <p className="text-xs text-gray-400">Aucun tiers lié</p>
        </div>
      )}

      <CreateTiersModal
        open={showCreateTiers}
        onOpenChange={setShowCreateTiers}
        onCreated={() => {
          toast.success('Tiers créé — vous pouvez maintenant le lier au lot')
        }}
      />
    </div>
  )
}
