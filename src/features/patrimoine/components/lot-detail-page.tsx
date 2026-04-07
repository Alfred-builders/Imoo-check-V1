import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Archive, ArchiveRestore, User, Building2, Home, Ruler, BedDouble, Zap, ChevronRight, Pencil, AlertTriangle, Thermometer, Car, Warehouse, Plus, X, Search, Flame, Droplets, Users } from 'lucide-react'
import { Button } from 'src/components/ui/button'
import { Badge } from 'src/components/ui/badge'
import { Skeleton } from 'src/components/ui/skeleton'
import { Separator } from 'src/components/ui/separator'
import { Input } from 'src/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from 'src/components/ui/select'
import { Textarea } from 'src/components/ui/textarea'
import { Switch } from 'src/components/ui/switch'
import { InlineField } from '../../../components/shared/inline-field'
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
const gesOptions = ['', 'A', 'B', 'C', 'D', 'E', 'F', 'G']

// Option A card style
const cardClass = 'bg-white rounded-xl border border-[#e2e8f0] shadow-[0_1px_3px_rgba(0,0,0,0.04)]'
const labelClass = 'text-[11px] font-bold uppercase tracking-wider text-[#94a3b8]'

export function LotDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [editing, setEditing] = useState(false)
  const { data: lot, isLoading } = useLotDetail(id)
  const updateMutation = useUpdateLot()

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
      <div className="p-6 space-y-5 max-w-6xl mx-auto">
        <Skeleton className="h-4 w-64" />
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
      toast.success(lot!.est_archive ? 'Lot restaure' : 'Lot archive')
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
      toast.success('Lot mis a jour')
      document.querySelectorAll('[data-card]').forEach(c => {
        c.classList.add('animate-save-success')
        setTimeout(() => c.classList.remove('animate-save-success'), 600)
      })
      setTimeout(() => setEditing(false), 400)
    } catch {
      toast.error('Erreur')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-6 space-y-5 max-w-6xl mx-auto">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-[12px] text-[#94a3b8]">
        <button onClick={() => navigate('/app/patrimoine')} className="hover:text-foreground transition-colors">Referentiel</button>
        <ChevronRight className="h-3 w-3" />
        <button onClick={() => navigate('/app/patrimoine')} className="hover:text-foreground transition-colors">Parc immobilier</button>
        {lot.batiment && (
          <>
            <ChevronRight className="h-3 w-3" />
            <button onClick={() => navigate(`/app/patrimoine/batiments/${lot.batiment!.id}`)} className="hover:text-foreground transition-colors">{lot.batiment.designation}</button>
          </>
        )}
        <ChevronRight className="h-3 w-3" />
        <span className="text-foreground font-medium">{lot.designation}</span>
      </nav>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="shrink-0 h-8 w-8" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-[28px] font-bold tracking-[-0.5px] text-foreground">{lot.designation}</h1>
              <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-[10px] font-medium">
                {typeBienLabels[lot.type_bien] || lot.type_bien}
              </Badge>
              {lot.meuble && <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]">Meuble</Badge>}
              {lot.est_archive && <Badge variant="destructive" className="text-[10px]">Archive</Badge>}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {!lot.est_archive && (
            <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => editing ? handleCancel() : setEditing(true)}>
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
          Ce lot est archive. Les modifications sont desactivees.
        </div>
      )}

      {/* Quick stats band */}
      <motion.div layout>
        <div data-card className="bg-slate-50 rounded-lg border border-slate-100 flex items-center gap-0 overflow-hidden divide-x divide-slate-200/60">
          {/* Etage */}
          <div className="flex-1 flex items-center gap-2.5 px-4 py-3">
            <div className="h-7 w-7 rounded-md flex items-center justify-center shrink-0 bg-blue-500">
              <Home className="h-3.5 w-3.5 text-white" />
            </div>
            <div>
              <p className={labelClass}>Etage</p>
              {editing ? (
                <Input value={formData.etage} onChange={(e) => setFormData(prev => ({ ...prev, etage: e.target.value }))} className="h-6 w-16 text-xs text-center mt-0.5" />
              ) : (
                <p className="text-sm font-bold text-gray-900 leading-tight">{lot.etage || 'RDC'}</p>
              )}
            </div>
          </div>

          {/* Type */}
          <div className="flex-1 flex items-center gap-2.5 px-4 py-3">
            <div className="h-7 w-7 rounded-md flex items-center justify-center shrink-0 bg-primary">
              <Building2 className="h-3.5 w-3.5 text-white" />
            </div>
            <div>
              <p className={labelClass}>Type</p>
              {editing ? (
                <Select value={formData.type_bien} onValueChange={(val) => setFormData(prev => ({ ...prev, type_bien: val }))}>
                  <SelectTrigger className="h-6 w-28 text-xs mt-0.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {typeBienOptions.map(o => (
                      <SelectItem key={o.value} value={o.value} className="text-xs">{o.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-sm font-bold text-gray-900 leading-tight">{typeBienLabels[lot.type_bien]}</p>
              )}
            </div>
          </div>

          {/* Surface */}
          <div className="flex-1 flex items-center gap-2.5 px-4 py-3">
            <div className="h-7 w-7 rounded-md flex items-center justify-center shrink-0 bg-emerald-500">
              <Ruler className="h-3.5 w-3.5 text-white" />
            </div>
            <div>
              <p className={labelClass}>Surface</p>
              {editing ? (
                <Input type="number" value={formData.surface} onChange={(e) => setFormData(prev => ({ ...prev, surface: e.target.value }))} className="h-6 w-16 text-xs text-center mt-0.5" />
              ) : (
                <p className="text-sm font-bold text-gray-900 leading-tight">{lot.surface ? `${lot.surface} m2` : '\u2014'}</p>
              )}
            </div>
          </div>

          {/* Pieces */}
          <div className="flex-1 flex items-center gap-2.5 px-4 py-3">
            <div className="h-7 w-7 rounded-md flex items-center justify-center shrink-0 bg-violet-500">
              <BedDouble className="h-3.5 w-3.5 text-white" />
            </div>
            <div>
              <p className={labelClass}>Pieces</p>
              {editing ? (
                <Input value={formData.nb_pieces} onChange={(e) => setFormData(prev => ({ ...prev, nb_pieces: e.target.value }))} className="h-6 w-16 text-xs text-center mt-0.5" />
              ) : (
                <p className="text-sm font-bold text-gray-900 leading-tight">{lot.nb_pieces || '\u2014'}</p>
              )}
            </div>
          </div>

          {/* DPE */}
          <div className="flex-1 flex items-center gap-2.5 px-4 py-3">
            <div className="h-7 w-7 rounded-md flex items-center justify-center shrink-0 bg-orange-500">
              <Zap className="h-3.5 w-3.5 text-white" />
            </div>
            <div>
              <p className={labelClass}>DPE</p>
              {editing ? (
                <Select value={formData.dpe_classe} onValueChange={(val) => setFormData(prev => ({ ...prev, dpe_classe: val }))}>
                  <SelectTrigger className="h-6 w-16 text-xs mt-0.5">
                    <SelectValue placeholder="\u2014" />
                  </SelectTrigger>
                  <SelectContent>
                    {dpeOptions.map(o => (
                      <SelectItem key={o || '__empty'} value={o} className="text-xs">{o || '\u2014'}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-sm font-bold text-gray-900 leading-tight">{lot.dpe_classe || '\u2014'}</p>
              )}
            </div>
          </div>

          {/* GES */}
          <div className="flex-1 flex items-center gap-2.5 px-4 py-3">
            <div className="h-7 w-7 rounded-md flex items-center justify-center shrink-0 bg-rose-500">
              <Thermometer className="h-3.5 w-3.5 text-white" />
            </div>
            <div>
              <p className={labelClass}>GES</p>
              {editing ? (
                <Select value={formData.ges_classe} onValueChange={(val) => setFormData(prev => ({ ...prev, ges_classe: val }))}>
                  <SelectTrigger className="h-6 w-16 text-xs mt-0.5">
                    <SelectValue placeholder="\u2014" />
                  </SelectTrigger>
                  <SelectContent>
                    {gesOptions.map(o => (
                      <SelectItem key={o || '__empty'} value={o} className="text-xs">{o || '\u2014'}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-sm font-bold text-gray-900 leading-tight">{lot.ges_classe || '\u2014'}</p>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Content */}
      <motion.div layout className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          {/* Left sidebar -- Energie + Annexes */}
          <div className="space-y-4">
            <EnergieSection lot={lot} editing={editing} formData={formData} setFormData={setFormData} />

            <div data-card className={`${cardClass} overflow-hidden`}>
              <div className="px-5 py-3.5">
                <h2 className={labelClass}>Annexes</h2>
              </div>
              <div className="px-5 pb-5 space-y-2">
                <div className="flex items-center gap-3 p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                  <Warehouse className="h-4 w-4 text-gray-500" />
                  <span className="text-xs text-gray-500 flex-1">Cave</span>
                  {editing ? (
                    <Input value={formData.num_cave} onChange={(e) => setFormData(prev => ({ ...prev, num_cave: e.target.value }))} className="h-6 w-20 text-xs text-right" />
                  ) : (
                    <span className="text-sm font-medium text-gray-900">{lot.num_cave || '\u2014'}</span>
                  )}
                </div>
                <div className="flex items-center gap-3 p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                  <Car className="h-4 w-4 text-gray-500" />
                  <span className="text-xs text-gray-500 flex-1">Parking</span>
                  {editing ? (
                    <Input value={formData.num_parking} onChange={(e) => setFormData(prev => ({ ...prev, num_parking: e.target.value }))} className="h-6 w-20 text-xs text-right" />
                  ) : (
                    <span className="text-sm font-medium text-gray-900">{lot.num_parking || '\u2014'}</span>
                  )}
                </div>
              </div>
            </div>

            <p className="text-[10px] text-gray-300 px-1">
              Cree {formatDate(lot.created_at)} — Modifie {formatDate(lot.updated_at)}
            </p>
          </div>

          {/* Right main -- Details complementaires */}
          <div data-card className={`col-span-2 ${cardClass} p-5`}>
            <h2 className={`${labelClass} mb-3`}>Details complementaires</h2>
            <div className="grid grid-cols-2 gap-x-8">
              <InlineField label="Designation" editing={editing} value={lot.designation}>
                <Input value={formData.designation} onChange={(e) => setFormData(prev => ({ ...prev, designation: e.target.value }))} className="h-7 text-sm" />
              </InlineField>
              <InlineField label="Reference" editing={editing} value={lot.reference_interne}>
                <Input value={formData.reference_interne} onChange={(e) => setFormData(prev => ({ ...prev, reference_interne: e.target.value }))} className="h-7 text-sm" />
              </InlineField>
              <InlineField label="Meuble" editing={editing} value={lot.meuble ? <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]">Oui</Badge> : 'Non'}>
                <Switch checked={formData.meuble} onCheckedChange={(checked) => setFormData(prev => ({ ...prev, meuble: checked }))} />
              </InlineField>
              <InlineField label="Emplacement palier" editing={editing} value={lot.emplacement_palier}>
                <Input value={formData.emplacement_palier} onChange={(e) => setFormData(prev => ({ ...prev, emplacement_palier: e.target.value }))} className="h-7 text-sm" />
              </InlineField>
              <InlineField label="N. cave" editing={editing} value={lot.num_cave}>
                <Input value={formData.num_cave} onChange={(e) => setFormData(prev => ({ ...prev, num_cave: e.target.value }))} className="h-7 text-sm" />
              </InlineField>
              <InlineField label="N. parking" editing={editing} value={lot.num_parking}>
                <Input value={formData.num_parking} onChange={(e) => setFormData(prev => ({ ...prev, num_parking: e.target.value }))} className="h-7 text-sm" />
              </InlineField>
            </div>
            <Separator className="my-3" />
            <InlineField label="Commentaire" editing={editing} value={lot.commentaire ? (
              <p className="text-sm text-gray-700 bg-slate-50 rounded-lg p-3 border border-slate-100 leading-relaxed">{lot.commentaire}</p>
            ) : null} horizontal={false}>
              <Textarea value={formData.commentaire} onChange={(e) => setFormData(prev => ({ ...prev, commentaire: e.target.value }))} rows={3} className="text-sm" />
            </InlineField>
          </div>
        </div>

        {/* Tiers lies */}
        <TiersLiesSection lotId={lot.id} proprietaires={proprietaires} mandataire={mandataire} isArchived={lot.est_archive} />

        {/* Missions placeholder */}
        <div data-card className={cardClass}>
          <div className="px-5 py-3.5">
            <h2 className={labelClass}>Missions</h2>
          </div>
          <div className="py-10 text-center">
            <div className="h-12 w-12 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-3">
              <Building2 className="h-5 w-5 text-gray-400" />
            </div>
            <p className="text-sm font-medium text-gray-500">Aucune mission pour ce lot</p>
            <p className="text-xs text-gray-400 mt-1">Sprint 3</p>
          </div>
        </div>
      </motion.div>

      {/* Floating save bar */}
      <FloatingSaveBar visible={editing} onSave={handleSave} onCancel={handleCancel} saving={saving} />
    </div>
  )
}

// Energy type/mode options
const ENERGY_TYPE_OPTIONS = [
  { value: '', label: '\u2014' },
  { value: 'electrique', label: 'Electrique' },
  { value: 'gaz', label: 'Gaz' },
  { value: 'fioul', label: 'Fioul' },
  { value: 'bois', label: 'Bois' },
  { value: 'pompe_a_chaleur', label: 'Pompe a chaleur' },
  { value: 'autre', label: 'Autre' },
]

const ENERGY_MODE_OPTIONS = [
  { value: '', label: '\u2014' },
  { value: 'individuel', label: 'Individuel' },
  { value: 'collectif', label: 'Collectif' },
]

const energyLabels: Record<string, string> = {
  individuelle: 'Individuelle', collective: 'Collective', aucun: 'Aucun', autre: 'Autre',
  individuel: 'Individuel', collectif: 'Collectif',
  gaz: 'Gaz', electrique: 'Electrique', fioul: 'Fioul', bois: 'Bois',
  pompe_a_chaleur: 'Pompe a chaleur',
}

function EnergieSection({ lot, editing, formData, setFormData }: {
  lot: any
  editing: boolean
  formData: any
  setFormData: React.Dispatch<React.SetStateAction<any>>
}) {
  return (
    <div data-card className={`${cardClass} overflow-hidden`}>
      <div className="px-5 py-3.5">
        <h2 className={labelClass}>Energie</h2>
      </div>
      <div className="px-5 pb-5 space-y-2">
        <div className="flex items-center gap-3 p-2.5 rounded-lg bg-slate-50 border border-slate-100">
          <Zap className="h-4 w-4 text-orange-500" />
          <span className="text-xs text-gray-500 flex-1">DPE</span>
          <span className="text-sm font-bold text-gray-900">{lot.dpe_classe || '\u2014'}</span>
        </div>
        <div className="flex items-center gap-3 p-2.5 rounded-lg bg-slate-50 border border-slate-100">
          <Thermometer className="h-4 w-4 text-rose-500" />
          <span className="text-xs text-gray-500 flex-1">GES</span>
          <span className="text-sm font-bold text-gray-900">{lot.ges_classe || '\u2014'}</span>
        </div>

        {/* Eau chaude */}
        <div className={`flex items-center gap-3 p-2.5 rounded-lg border ${editing ? 'bg-primary/5 border-primary/30' : 'bg-slate-50 border-slate-100'}`}>
          <Droplets className="h-4 w-4 text-blue-500 shrink-0" />
          <span className="text-xs text-gray-500 shrink-0">Eau chaude</span>
          {editing ? (
            <div className="flex-1 flex items-center gap-1.5 justify-end">
              <select value={formData.eau_chaude_type} onChange={(e) => setFormData((prev: any) => ({ ...prev, eau_chaude_type: e.target.value }))} className="h-7 text-xs rounded-md border border-gray-200 bg-white px-2 focus:outline-none focus:ring-1 focus:ring-primary">
                {ENERGY_TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <select value={formData.eau_chaude_mode} onChange={(e) => setFormData((prev: any) => ({ ...prev, eau_chaude_mode: e.target.value }))} className="h-7 text-xs rounded-md border border-gray-200 bg-white px-2 focus:outline-none focus:ring-1 focus:ring-primary">
                {ENERGY_MODE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          ) : (
            <span className="text-sm font-medium text-gray-900 flex-1 text-right">
              {lot.eau_chaude_type ? `${energyLabels[lot.eau_chaude_type] || lot.eau_chaude_type}${lot.eau_chaude_mode ? ` (${energyLabels[lot.eau_chaude_mode] || lot.eau_chaude_mode})` : ''}` : '\u2014'}
            </span>
          )}
        </div>

        {/* Chauffage */}
        <div className={`flex items-center gap-3 p-2.5 rounded-lg border ${editing ? 'bg-primary/5 border-primary/30' : 'bg-slate-50 border-slate-100'}`}>
          <Flame className="h-4 w-4 text-red-500 shrink-0" />
          <span className="text-xs text-gray-500 shrink-0">Chauffage</span>
          {editing ? (
            <div className="flex-1 flex items-center gap-1.5 justify-end">
              <select value={formData.chauffage_type} onChange={(e) => setFormData((prev: any) => ({ ...prev, chauffage_type: e.target.value }))} className="h-7 text-xs rounded-md border border-gray-200 bg-white px-2 focus:outline-none focus:ring-1 focus:ring-primary">
                {ENERGY_TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <select value={formData.chauffage_mode} onChange={(e) => setFormData((prev: any) => ({ ...prev, chauffage_mode: e.target.value }))} className="h-7 text-xs rounded-md border border-gray-200 bg-white px-2 focus:outline-none focus:ring-1 focus:ring-primary">
                {ENERGY_MODE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          ) : (
            <span className="text-sm font-medium text-gray-900 flex-1 text-right">
              {lot.chauffage_type ? `${energyLabels[lot.chauffage_type] || lot.chauffage_type}${lot.chauffage_mode ? ` (${energyLabels[lot.chauffage_mode] || lot.chauffage_mode})` : ''}` : '\u2014'}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

// Unified Tiers lies section -- proprietaires + mandataire as cards
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
    <div data-card className={`${cardClass} p-5`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-[#94a3b8]" />
          <h2 className={labelClass}>
            Tiers lies ({totalTiers})
          </h2>
        </div>
        {!isArchived && (
          <div className="flex items-center gap-1.5">
            <Button variant="outline" size="sm" className="h-6 text-xs px-2" onClick={() => setShowCreateTiers(true)}>
              <Plus className="h-3 w-3 mr-1" /> Nouveau tiers
            </Button>
            <Button variant="ghost" size="sm" className="h-6 text-xs text-primary hover:text-primary px-2" onClick={() => setShowAdd(!showAdd)}>
              {showAdd ? 'Fermer' : <><Plus className="h-3 w-3 mr-1" /> Ajouter proprietaire</>}
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
          {/* Proprietaire cards */}
          {proprietaires.map((p) => (
            <div key={p.id} className="flex items-center gap-3 p-3 rounded-lg border border-[#e2e8f0] hover:border-primary/30 transition-colors group">
              <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <span className="text-xs font-bold text-primary">{(p.prenom?.[0] || p.nom[0]).toUpperCase()}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-sm font-medium text-gray-900 truncate">{p.prenom ? `${p.prenom} ${p.nom}` : p.raison_sociale || p.nom}</p>
                  {p.est_principal && <Badge className="bg-primary/5 text-primary border-primary/30 text-[9px] shrink-0">Principal</Badge>}
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <Badge className="bg-amber-50 text-amber-700 border-amber-200 text-[9px] font-medium">Proprietaire</Badge>
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
            <div className="flex items-center gap-3 p-3 rounded-lg border border-[#e2e8f0] hover:border-blue-200 transition-colors">
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
          <p className="text-xs text-gray-400">Aucun tiers lie</p>
        </div>
      )}

      <CreateTiersModal
        open={showCreateTiers}
        onOpenChange={setShowCreateTiers}
        onCreated={() => {
          toast.success('Tiers cree — vous pouvez maintenant le lier au lot')
        }}
      />
    </div>
  )
}
