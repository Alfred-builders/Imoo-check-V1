import { useState, useRef, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Archive, ArchiveRestore, User, Building2, Home, Ruler, BedDouble, Zap, ChevronRight, ChevronDown, Pencil, AlertTriangle, Thermometer, Car, Warehouse, Plus, X, Search, Flame, Droplets, Check, UserPlus } from 'lucide-react'
import { Button } from 'src/components/ui/button'
import { Badge } from 'src/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from 'src/components/ui/card'
import { Skeleton } from 'src/components/ui/skeleton'
import { Separator } from 'src/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from 'src/components/ui/tabs'
import { Input } from 'src/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from 'src/components/ui/select'
import { Switch } from 'src/components/ui/switch'
import { Textarea } from 'src/components/ui/textarea'
import { useLotDetail, useUpdateLot, useSearchTiers, useLinkProprietaire, useUnlinkProprietaire } from '../api'
import { CreateTiersModal } from '../../tiers/components/create-tiers-modal'
import { formatDate } from '../../../lib/formatters'
import { toast } from 'sonner'

const typeBienLabels: Record<string, string> = {
  appartement: 'Appartement', maison: 'Maison', studio: 'Studio',
  local_commercial: 'Local commercial', parking: 'Parking', cave: 'Cave', autre: 'Autre',
}

const NONE_VALUE = '__none__'

// ── Inline editable field ──
function InlineField({ label, value, onSave, type = 'text', editing, selectOptions, suffix }: {
  label: string; value: string | number | null | undefined; onSave: (val: string) => void;
  type?: 'text' | 'number' | 'select'; editing: boolean; selectOptions?: { value: string; label: string }[]; suffix?: string
}) {
  const [localVal, setLocalVal] = useState(String(value ?? ''))
  useEffect(() => { setLocalVal(String(value ?? '')) }, [value])

  function handleBlur() {
    if (localVal !== String(value ?? '')) onSave(localVal)
  }
  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') (e.target as HTMLElement).blur()
    if (e.key === 'Escape') { setLocalVal(String(value ?? '')); (e.target as HTMLElement).blur() }
  }

  if (!editing) {
    return (
      <div className="flex items-center justify-between py-2.5 transition-edit">
        <span className="text-xs text-gray-400">{label}</span>
        <span className="text-sm font-medium text-gray-800">{value ? `${value}${suffix ? ` ${suffix}` : ''}` : '—'}</span>
      </div>
    )
  }

  if (type === 'select' && selectOptions) {
    return (
      <div className="flex items-center justify-between py-1.5 animate-fade-in">
        <span className="text-xs text-gray-400">{label}</span>
        <Select value={localVal || NONE_VALUE} onValueChange={(v) => { const val = v === NONE_VALUE ? '' : v; setLocalVal(val); onSave(val) }}>
          <SelectTrigger className="w-40 h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value={NONE_VALUE}>—</SelectItem>
            {selectOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-between py-1.5 animate-fade-in">
      <span className="text-xs text-gray-400">{label}</span>
      <Input
        type={type}
        value={localVal}
        onChange={(e) => setLocalVal(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className="w-40 h-8 text-xs text-right"
      />
    </div>
  )
}

export function LotDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [editing, setEditing] = useState(false)
  const [savedFlash, setSavedFlash] = useState(false)
  const [showCreateTiers, setShowCreateTiers] = useState(false)
  const { data: lot, isLoading } = useLotDetail(id)
  const updateMutation = useUpdateLot()

  async function handleInlineSave(field: string, value: string) {
    if (!id) return
    let parsed: unknown = value || undefined
    if (['surface'].includes(field) && value) parsed = parseFloat(value)
    if (field === 'meuble') parsed = value === 'true'
    try {
      await updateMutation.mutateAsync({ id, [field]: parsed })
      setSavedFlash(true)
      setTimeout(() => setSavedFlash(false), 800)
    } catch (err: any) {
      toast.error(err.message || 'Erreur')
    }
  }

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
    <div className={`p-6 space-y-5 max-w-6xl mx-auto ${savedFlash ? 'animate-save-flash' : ''}`}>
      {/* Header */}
      <div className="flex items-start gap-3">
        <Button variant="ghost" size="icon" className="mt-0.5 shrink-0 h-8 w-8" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-bold text-foreground">{lot.designation}</h1>
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
            <Button
              variant={editing ? 'default' : 'outline'}
              size="sm"
              className={`h-8 text-xs transition-all ${editing ? 'bg-primary text-primary-foreground hover:bg-primary/90' : ''}`}
              onClick={() => setEditing(!editing)}
            >
              {editing ? <><Check className="h-3 w-3 mr-1" /> Terminé</> : <><Pencil className="h-3 w-3 mr-1" /> Modifier</>}
            </Button>
          )}
          <Button variant="outline" size="sm" className="h-8 text-xs" onClick={handleArchive}>
            {lot.est_archive ? <ArchiveRestore className="h-3 w-3 mr-1" /> : <Archive className="h-3 w-3 mr-1" />}
            {lot.est_archive ? 'Restaurer' : 'Archiver'}
          </Button>
        </div>
      </div>

      {lot.est_archive && (
        <div className="flex items-center gap-2 px-3 py-2.5 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-xs animate-fade-in">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
          Ce lot est archivé. Les modifications sont désactivées.
        </div>
      )}

      {/* Quick stats band — summary only (no duplication with details) */}
      <div className="flex items-center gap-0 bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden divide-x divide-gray-100">
        {[
          { icon: Home, label: 'Étage', value: lot.etage || 'RDC', bg: 'bg-blue-500' },
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

      {/* Content — single scrollable page (Informations + Tiers merged) */}
      <Tabs defaultValue="infos" className="w-full">
        <TabsList className="bg-gray-100 p-0.5 h-9">
          <TabsTrigger value="infos" className="text-xs h-8 px-4">Informations</TabsTrigger>
          <TabsTrigger value="missions" className="text-xs h-8 px-4">Missions</TabsTrigger>
        </TabsList>

        <TabsContent value="infos" className="mt-4 space-y-4">
          <div className="grid grid-cols-3 gap-4">
            {/* Left — Énergie + Annexes */}
            <div className="space-y-4">
              <EnergieSection lot={lot} editing={editing} onSave={handleInlineSave} />
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                <div className="px-5 py-3.5">
                  <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Annexes</h2>
                </div>
                <div className="px-5 pb-5 space-y-2">
                  <div className="flex items-center gap-3 p-2.5 rounded-lg bg-gray-50 border border-gray-100">
                    <Warehouse className="h-4 w-4 text-gray-500" />
                    <span className="text-xs text-gray-500 flex-1">Cave</span>
                    {editing ? (
                      <Input defaultValue={lot.num_cave || ''} onBlur={(e) => { if (e.target.value !== (lot.num_cave || '')) handleInlineSave('num_cave', e.target.value) }} className="w-20 h-7 text-xs text-right" />
                    ) : (
                      <span className="text-sm font-medium text-gray-900">{lot.num_cave || '—'}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 p-2.5 rounded-lg bg-gray-50 border border-gray-100">
                    <Car className="h-4 w-4 text-gray-500" />
                    <span className="text-xs text-gray-500 flex-1">Parking</span>
                    {editing ? (
                      <Input defaultValue={lot.num_parking || ''} onBlur={(e) => { if (e.target.value !== (lot.num_parking || '')) handleInlineSave('num_parking', e.target.value) }} className="w-20 h-7 text-xs text-right" />
                    ) : (
                      <span className="text-sm font-medium text-gray-900">{lot.num_parking || '—'}</span>
                    )}
                  </div>
                </div>
              </div>
              <p className="text-[10px] text-gray-300 px-1">
                Créé {formatDate(lot.created_at)} — Modifié {formatDate(lot.updated_at)}
              </p>
            </div>

            {/* Right — Caractéristiques (deduplicated: no type/étage/surface already in bandeau) */}
            <div className={`col-span-2 bg-white border border-gray-200 rounded-xl p-5 shadow-sm transition-all ${editing ? 'ring-2 ring-ring border-primary' : ''}`}>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Caractéristiques</h2>
                {editing && <Badge variant="secondary" className="text-[9px] animate-scale-in">Édition</Badge>}
              </div>
              <div className="grid grid-cols-2 gap-x-8 divide-y divide-gray-50">
                <InlineField label="Désignation" value={lot.designation} onSave={(v) => handleInlineSave('designation', v)} editing={editing} />
                <InlineField label="Référence" value={lot.reference_interne} onSave={(v) => handleInlineSave('reference_interne', v)} editing={editing} />
                <InlineField label="Emplacement" value={lot.emplacement_palier} onSave={(v) => handleInlineSave('emplacement_palier', v)} editing={editing} />
                <InlineField
                  label="Pièces"
                  value={lot.nb_pieces}
                  onSave={(v) => handleInlineSave('nb_pieces', v)}
                  type="select"
                  editing={editing}
                  selectOptions={[
                    { value: 'studio', label: 'Studio' }, { value: 'T1', label: 'T1' }, { value: 'T2', label: 'T2' },
                    { value: 'T3', label: 'T3' }, { value: 'T4', label: 'T4' }, { value: 'T5', label: 'T5' }, { value: 'T6', label: 'T6+' },
                  ]}
                />
                {editing ? (
                  <div className="flex items-center justify-between py-1.5 animate-fade-in col-span-2">
                    <span className="text-xs text-gray-400">Meublé</span>
                    <Switch checked={lot.meuble} onCheckedChange={(v) => handleInlineSave('meuble', String(v))} />
                  </div>
                ) : (
                  <div className="flex items-center justify-between py-2.5">
                    <span className="text-xs text-gray-400">Meublé</span>
                    <span className="text-sm font-medium text-gray-800">
                      {lot.meuble ? <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]">Oui</Badge> : 'Non'}
                    </span>
                  </div>
                )}
              </div>
              {(lot.commentaire || editing) && (
                <>
                  <Separator className="my-3" />
                  <p className="text-xs text-gray-400 mb-1.5">Commentaire</p>
                  {editing ? (
                    <Textarea
                      defaultValue={lot.commentaire || ''}
                      onBlur={(e) => { if (e.target.value !== (lot.commentaire || '')) handleInlineSave('commentaire', e.target.value) }}
                      placeholder="Notes..."
                      rows={3}
                      className="text-sm animate-fade-in"
                    />
                  ) : (
                    <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3 border border-gray-100 leading-relaxed">{lot.commentaire}</p>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Tiers section — integrated into Informations page */}
          <div className="grid grid-cols-2 gap-4">
            {/* Propriétaires */}
            <ProprietaireSection lotId={lot.id} proprietaires={proprietaires} isArchived={lot.est_archive} onCreateTiers={() => setShowCreateTiers(true)} />

            {/* All mandataires regrouped in a single card-based block */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Mandataires & Gestionnaires</h2>
              </div>
              {mandataire ? (
                <div className="space-y-2">
                  <TiersCard tiers={mandataire} roleLabel="Mandataire" color="blue" />
                </div>
              ) : (
                <div className="text-center py-6">
                  <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-2">
                    <Building2 className="h-4 w-4 text-gray-400" />
                  </div>
                  <p className="text-xs text-gray-400">Aucun mandataire</p>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="missions" className="mt-4">
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
            <div className="py-10 text-center">
              <div className="h-12 w-12 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-3">
                <Building2 className="h-5 w-5 text-gray-400" />
              </div>
              <p className="text-sm font-medium text-gray-500">Aucune mission pour ce lot</p>
              <p className="text-xs text-gray-400 mt-1">Sprint 3</p>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Create Tiers Modal */}
      <CreateTiersModal
        open={showCreateTiers}
        onOpenChange={setShowCreateTiers}
        onCreated={() => { /* tiers created, will be linkable */ }}
      />
    </div>
  )
}

// ── Tiers Card component ──
function TiersCard({ tiers, roleLabel, color }: { tiers: { nom: string; prenom?: string | null; raison_sociale?: string | null; email?: string | null; est_principal?: boolean }; roleLabel: string; color: 'slate' | 'blue' | 'emerald' }) {
  const bgMap = { slate: 'bg-slate-100', blue: 'bg-blue-100', emerald: 'bg-emerald-100' }
  const textMap = { slate: 'text-slate-700', blue: 'text-blue-700', emerald: 'text-emerald-700' }
  const badgeBg = { slate: 'bg-slate-50 text-slate-600 border-slate-200', blue: 'bg-blue-50 text-blue-600 border-blue-200', emerald: 'bg-emerald-50 text-emerald-600 border-emerald-200' }

  const displayName = tiers.prenom ? `${tiers.prenom} ${tiers.nom}` : tiers.raison_sociale || tiers.nom

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors card-hover">
      <div className={`h-9 w-9 rounded-full ${bgMap[color]} flex items-center justify-center shrink-0`}>
        <span className={`text-xs font-bold ${textMap[color]}`}>
          {(tiers.prenom?.[0] || tiers.nom[0]).toUpperCase()}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">{displayName}</p>
        <p className="text-xs text-gray-400 truncate">{tiers.email || '—'}</p>
      </div>
      <Badge variant="outline" className={`text-[9px] shrink-0 ${badgeBg[color]}`}>{roleLabel}</Badge>
    </div>
  )
}

// Énergie section — eau chaude & chauffage editable
function EnergieSection({ lot, editing, onSave }: { lot: any; editing: boolean; onSave: (field: string, value: string) => void }) {
  const [open, setOpen] = useState(true)

  const energyLabels: Record<string, string> = {
    individuelle: 'Individuelle', collective: 'Collective', aucun: 'Aucun', autre: 'Autre',
    individuel: 'Individuel', collectif: 'Collectif',
    gaz: 'Gaz', electrique: 'Électrique', fioul: 'Fioul',
  }

  const eauChaudeTypes = [
    { value: 'individuelle', label: 'Individuelle' }, { value: 'collective', label: 'Collective' }, { value: 'aucun', label: 'Aucun' },
  ]
  const eauChaudeModes = [
    { value: 'gaz', label: 'Gaz' }, { value: 'electrique', label: 'Électrique' }, { value: 'fioul', label: 'Fioul' }, { value: 'autre', label: 'Autre' },
  ]
  const chauffageTypes = [
    { value: 'individuel', label: 'Individuel' }, { value: 'collectif', label: 'Collectif' }, { value: 'aucun', label: 'Aucun' },
  ]
  const chauffageModes = [
    { value: 'gaz', label: 'Gaz' }, { value: 'electrique', label: 'Électrique' }, { value: 'fioul', label: 'Fioul' }, { value: 'autre', label: 'Autre' },
  ]

  return (
    <div className={`bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden transition-all ${editing ? 'ring-2 ring-ring border-primary' : ''}`}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-gray-50/50 transition-colors"
      >
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Énergie</h2>
        {open ? <ChevronDown className="h-4 w-4 text-gray-300" /> : <ChevronRight className="h-4 w-4 text-gray-300" />}
      </button>
      {open && (
        <div className="px-5 pb-5 space-y-2">
          {/* DPE */}
          <div className="flex items-center gap-3 p-2.5 rounded-lg bg-gray-50 border border-gray-100">
            <Zap className="h-4 w-4 text-orange-500" />
            <span className="text-xs text-gray-500 flex-1">DPE</span>
            {editing ? (
              <Select defaultValue={lot.dpe_classe || NONE_VALUE} onValueChange={(v) => onSave('dpe_classe', v === NONE_VALUE ? '' : v)}>
                <SelectTrigger className="w-20 h-7 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE_VALUE}>—</SelectItem>
                  {['A','B','C','D','E','F','G'].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            ) : (
              <span className="text-sm font-bold text-gray-900">{lot.dpe_classe || '—'}</span>
            )}
          </div>
          {/* GES */}
          <div className="flex items-center gap-3 p-2.5 rounded-lg bg-gray-50 border border-gray-100">
            <Thermometer className="h-4 w-4 text-rose-500" />
            <span className="text-xs text-gray-500 flex-1">GES</span>
            {editing ? (
              <Select defaultValue={lot.ges_classe || NONE_VALUE} onValueChange={(v) => onSave('ges_classe', v === NONE_VALUE ? '' : v)}>
                <SelectTrigger className="w-20 h-7 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE_VALUE}>—</SelectItem>
                  {['A','B','C','D','E','F','G'].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            ) : (
              <span className="text-sm font-bold text-gray-900">{lot.ges_classe || '—'}</span>
            )}
          </div>
          {/* Eau chaude — now editable */}
          <div className="flex items-center gap-3 p-2.5 rounded-lg bg-gray-50 border border-gray-100">
            <Droplets className="h-4 w-4 text-blue-500" />
            <span className="text-xs text-gray-500 flex-1">Eau chaude</span>
            {editing ? (
              <div className="flex gap-1">
                <Select defaultValue={lot.eau_chaude_type || NONE_VALUE} onValueChange={(v) => onSave('eau_chaude_type', v === NONE_VALUE ? '' : v)}>
                  <SelectTrigger className="w-28 h-7 text-xs"><SelectValue placeholder="Type" /></SelectTrigger>
                  <SelectContent>{eauChaudeTypes.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
                </Select>
                <Select defaultValue={lot.eau_chaude_mode || NONE_VALUE} onValueChange={(v) => onSave('eau_chaude_mode', v === NONE_VALUE ? '' : v)}>
                  <SelectTrigger className="w-24 h-7 text-xs"><SelectValue placeholder="Mode" /></SelectTrigger>
                  <SelectContent>{eauChaudeModes.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            ) : (
              <span className="text-sm font-medium text-gray-900">
                {lot.eau_chaude_type ? `${energyLabels[lot.eau_chaude_type] || lot.eau_chaude_type}${lot.eau_chaude_mode ? ` (${energyLabels[lot.eau_chaude_mode] || lot.eau_chaude_mode})` : ''}` : '—'}
              </span>
            )}
          </div>
          {/* Chauffage — now editable */}
          <div className="flex items-center gap-3 p-2.5 rounded-lg bg-gray-50 border border-gray-100">
            <Flame className="h-4 w-4 text-red-500" />
            <span className="text-xs text-gray-500 flex-1">Chauffage</span>
            {editing ? (
              <div className="flex gap-1">
                <Select defaultValue={lot.chauffage_type || NONE_VALUE} onValueChange={(v) => onSave('chauffage_type', v === NONE_VALUE ? '' : v)}>
                  <SelectTrigger className="w-28 h-7 text-xs"><SelectValue placeholder="Type" /></SelectTrigger>
                  <SelectContent>{chauffageTypes.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
                </Select>
                <Select defaultValue={lot.chauffage_mode || NONE_VALUE} onValueChange={(v) => onSave('chauffage_mode', v === NONE_VALUE ? '' : v)}>
                  <SelectTrigger className="w-24 h-7 text-xs"><SelectValue placeholder="Mode" /></SelectTrigger>
                  <SelectContent>{chauffageModes.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            ) : (
              <span className="text-sm font-medium text-gray-900">
                {lot.chauffage_type ? `${energyLabels[lot.chauffage_type] || lot.chauffage_type}${lot.chauffage_mode ? ` (${energyLabels[lot.chauffage_mode] || lot.chauffage_mode})` : ''}` : '—'}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// Propriétaire management sub-component with create tiers button
function ProprietaireSection({ lotId, proprietaires, isArchived, onCreateTiers }: { lotId: string; proprietaires: Array<{ id: string; nom: string; prenom?: string | null; raison_sociale?: string | null; email?: string | null; tel?: string | null; est_principal?: boolean }>; isArchived: boolean; onCreateTiers: () => void }) {
  const [showAdd, setShowAdd] = useState(false)
  const [searchQ, setSearchQ] = useState('')
  const { data: searchResults } = useSearchTiers(searchQ)
  const linkMutation = useLinkProprietaire()
  const unlinkMutation = useUnlinkProprietaire()

  async function handleLink(tiersId: string) {
    await linkMutation.mutateAsync({ lotId, tiersId, estPrincipal: proprietaires.length === 0 })
    setShowAdd(false)
    setSearchQ('')
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          Propriétaire{proprietaires.length > 1 ? 's' : ''}
        </h2>
        {!isArchived && (
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" className="h-6 text-xs text-gray-500 hover:text-gray-700 px-2" onClick={onCreateTiers}>
              <UserPlus className="h-3 w-3 mr-1" /> Créer
            </Button>
            <Button variant="ghost" size="sm" className="h-6 text-xs text-primary hover:text-primary/80 px-2" onClick={() => setShowAdd(!showAdd)}>
              {showAdd ? 'Fermer' : <><Plus className="h-3 w-3 mr-1" /> Lier</>}
            </Button>
          </div>
        )}
      </div>
      {showAdd && (
        <div className="mb-3 p-3 bg-muted/50 border border-border rounded-lg space-y-2 animate-scale-in">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
            <Input value={searchQ} onChange={(e) => setSearchQ(e.target.value)} placeholder="Rechercher un tiers..." className="pl-8 h-8 text-xs" autoFocus />
          </div>
          {searchResults && searchResults.length > 0 && (
            <div className="max-h-32 overflow-y-auto space-y-1">
              {searchResults.filter(t => !proprietaires.some(p => p.id === t.id)).map(t => (
                <button key={t.id} onClick={() => handleLink(t.id)} className="w-full flex items-center gap-2 px-2 py-1.5 text-xs hover:bg-accent rounded transition-colors text-left">
                  <User className="h-3 w-3 text-gray-400 shrink-0" />
                  <span className="font-medium text-gray-800">{t.prenom ? `${t.prenom} ${t.nom}` : t.raison_sociale || t.nom}</span>
                </button>
              ))}
            </div>
          )}
          {searchResults && searchResults.length === 0 && searchQ.length >= 2 && (
            <div className="text-center py-2">
              <p className="text-xs text-gray-400 mb-1.5">Aucun résultat</p>
              <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => { setShowAdd(false); onCreateTiers() }}>
                <UserPlus className="h-3 w-3 mr-1" /> Créer un nouveau tiers
              </Button>
            </div>
          )}
        </div>
      )}
      {proprietaires.length > 0 ? (
        <div className="space-y-2">
          {proprietaires.map((p) => (
            <div key={p.id} className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:border-gray-300 transition-colors group card-hover">
              <div className="h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                <span className="text-xs font-bold text-slate-700">{(p.prenom?.[0] || p.nom[0]).toUpperCase()}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{p.prenom ? `${p.prenom} ${p.nom}` : p.raison_sociale || p.nom}</p>
                <p className="text-xs text-gray-400 truncate">{p.email || p.tel || '—'}</p>
              </div>
              {p.est_principal && <Badge variant="secondary" className="text-[9px] shrink-0">Principal</Badge>}
              {!isArchived && (
                <button onClick={() => unlinkMutation.mutate({ lotId, tiersId: p.id })} className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-all" title="Retirer">
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-6">
          <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-2"><User className="h-4 w-4 text-gray-400" /></div>
          <p className="text-xs text-gray-400 mb-2">Aucun propriétaire lié</p>
          {!isArchived && (
            <Button variant="outline" size="sm" className="h-7 text-xs" onClick={onCreateTiers}>
              <UserPlus className="h-3 w-3 mr-1" /> Créer un tiers
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
