import { useState, useRef, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { ArrowLeft, MapPin, Archive, ArchiveRestore, Plus, Building2, Layers, Calendar, Hash, ExternalLink, Pencil, AlertTriangle, ExternalLinkIcon, Home, Armchair, Ruler, Check, Star } from 'lucide-react'
import { Button } from 'src/components/ui/button'
import { Badge } from 'src/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from 'src/components/ui/card'
import { Skeleton } from 'src/components/ui/skeleton'
import { Separator } from 'src/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from 'src/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from 'src/components/ui/table'
import { Input } from 'src/components/ui/input'
import { Label } from 'src/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from 'src/components/ui/select'
import { Textarea } from 'src/components/ui/textarea'
import { useBatimentDetail, useBatimentLots, useUpdateBatiment, useUpdateAddress, useAddAddress, useDeleteAddress } from '../api'
import { AddressAutocomplete } from 'src/components/shared/address-autocomplete'
import { CreateLotModal } from './create-lot-modal'
import { formatDate } from '../../../lib/formatters'
import { toast } from 'sonner'
import { Trash2, Save, X as XIcon } from 'lucide-react'

const typeLabels: Record<string, string> = {
  immeuble: 'Immeuble', maison: 'Maison', local_commercial: 'Local commercial', mixte: 'Mixte', autre: 'Autre',
}

const typeBienIcons: Record<string, typeof Home> = {
  appartement: Home, maison: Home, studio: Home, local_commercial: Building2,
  parking: Layers, cave: Layers, autre: Building2,
}

// ── Inline editable field ──
function InlineField({ label, value, onSave, type = 'text', editing, selectOptions }: {
  label: string; value: string | number | null | undefined; onSave: (val: string) => void;
  type?: 'text' | 'number' | 'select'; editing: boolean; selectOptions?: { value: string; label: string }[]
}) {
  const [localVal, setLocalVal] = useState(String(value ?? ''))
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { setLocalVal(String(value ?? '')) }, [value])

  function handleBlur() {
    if (localVal !== String(value ?? '')) onSave(localVal)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') { (e.target as HTMLElement).blur() }
    if (e.key === 'Escape') { setLocalVal(String(value ?? '')); (e.target as HTMLElement).blur() }
  }

  if (!editing) {
    return (
      <div className="flex items-center justify-between py-2.5 transition-edit">
        <span className="text-xs text-gray-400">{label}</span>
        <span className="text-sm font-medium text-gray-800">{value || '—'}</span>
      </div>
    )
  }

  if (type === 'select' && selectOptions) {
    return (
      <div className="flex items-center justify-between py-1.5 animate-fade-in">
        <span className="text-xs text-gray-400">{label}</span>
        <Select value={localVal} onValueChange={(v) => { setLocalVal(v); onSave(v) }}>
          <SelectTrigger className="w-40 h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
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
        ref={inputRef}
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

export function BuildingDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const [showCreateLot, setShowCreateLot] = useState(false)
  const [editing, setEditing] = useState(false)
  const [savedFlash, setSavedFlash] = useState(false)
  const { data: batiment, isLoading } = useBatimentDetail(id)
  const { data: lots } = useBatimentLots(id)
  const updateMutation = useUpdateBatiment()

  function handleBack() {
    // If came from map view, go back to map
    if (location.key !== 'default') {
      navigate(-1)
    } else {
      navigate('/app/patrimoine')
    }
  }

  async function handleInlineSave(field: string, value: string) {
    if (!id) return
    const parsed = ['nb_etages', 'annee_construction'].includes(field) && value ? parseInt(value) : (value || undefined)
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
      <div className="p-6 space-y-6 max-w-6xl mx-auto">
        <Skeleton className="h-10 w-72" />
        <div className="grid grid-cols-4 gap-3">{[1,2,3,4].map(i => <Skeleton key={i} className="h-20 rounded-xl" />)}</div>
        <Skeleton className="h-80 rounded-xl" />
      </div>
    )
  }

  if (!batiment) return <div className="p-6"><p className="text-gray-400">Bâtiment introuvable</p></div>

  const adresses = batiment.adresses ?? []
  const principale = adresses.find(a => a.type === 'principale')

  async function handleArchive() {
    if (!id) return
    try {
      await updateMutation.mutateAsync({ id, est_archive: !batiment!.est_archive })
      toast.success(batiment!.est_archive ? 'Bâtiment restauré' : 'Bâtiment archivé')
    } catch (err: any) {
      toast.error(err.message || 'Erreur')
    }
  }

  return (
    <div className={`p-6 space-y-5 max-w-6xl mx-auto ${savedFlash ? 'animate-save-flash' : ''}`}>
      {/* Header */}
      <div className="flex items-start gap-3">
        <Button variant="ghost" size="icon" className="mt-0.5 shrink-0 h-8 w-8" onClick={handleBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-bold text-foreground">{batiment.designation}</h1>
            <Badge variant="outline" className="text-[10px] font-medium">{typeLabels[batiment.type]}</Badge>
            {batiment.est_archive && <Badge variant="destructive" className="text-[10px]">Archivé</Badge>}
          </div>
          {principale && (
            <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {principale.rue}, {principale.code_postal} {principale.ville}
            </p>
          )}
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {!batiment.est_archive && (
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
            {batiment.est_archive ? <ArchiveRestore className="h-3 w-3 mr-1" /> : <Archive className="h-3 w-3 mr-1" />}
            {batiment.est_archive ? 'Restaurer' : 'Archiver'}
          </Button>
        </div>
      </div>

      {batiment.est_archive && (
        <div className="flex items-center gap-2 px-3 py-2.5 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-xs animate-fade-in">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
          Ce bâtiment est archivé.
        </div>
      )}

      {/* KPI row */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { icon: Layers, label: 'Lots', value: batiment.nb_lots, bg: 'bg-blue-500', text: 'text-white' },
          { icon: Building2, label: 'Type', value: typeLabels[batiment.type], bg: 'bg-slate-500', text: 'text-white' },
          { icon: Hash, label: 'Étages', value: batiment.nb_etages ?? '—', bg: 'bg-emerald-500', text: 'text-white' },
          { icon: Calendar, label: 'Construction', value: batiment.annee_construction ?? '—', bg: 'bg-violet-500', text: 'text-white' },
        ].map(({ icon: Icon, label, value, bg, text }) => (
          <div key={label} className="flex items-center gap-3 p-3.5 bg-white border border-gray-200 rounded-xl shadow-sm card-hover">
            <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${bg}`}>
              <Icon className={`h-4 w-4 ${text}`} />
            </div>
            <div>
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{label}</p>
              <p className="text-base font-bold text-gray-900 -mt-0.5">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="bg-gray-100 p-0.5 h-9">
          <TabsTrigger value="overview" className="text-xs h-8 px-4">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="lots" className="text-xs h-8 px-4">Lots ({lots?.length ?? 0})</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <div className="grid grid-cols-3 gap-4">
            {/* Adresses */}
            <div className="col-span-2 bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Adresses</h2>
                {!batiment.est_archive && <AddAddressButton batimentId={batiment.id} />}
              </div>
              <div className="space-y-2">
                {adresses.map((a) => (
                  <AddressCard key={a.id} address={a} batimentId={batiment.id} isArchived={batiment.est_archive} totalAddresses={adresses.length} />
                ))}
              </div>
            </div>

            {/* Infos — inline editable */}
            <div className={`bg-white border border-gray-200 rounded-xl p-5 shadow-sm transition-all ${editing ? 'ring-2 ring-ring border-primary' : ''}`}>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Informations</h2>
                {editing && <Badge variant="secondary" className="text-[9px] animate-scale-in">Édition</Badge>}
              </div>
              <dl className="space-y-1 divide-y divide-gray-50">
                <InlineField
                  label="Étages"
                  value={batiment.nb_etages}
                  onSave={(v) => handleInlineSave('nb_etages', v)}
                  type="number"
                  editing={editing}
                />
                <InlineField
                  label="Année"
                  value={batiment.annee_construction}
                  onSave={(v) => handleInlineSave('annee_construction', v)}
                  type="number"
                  editing={editing}
                />
                <InlineField
                  label="Type"
                  value={batiment.type}
                  onSave={(v) => handleInlineSave('type', v)}
                  type="select"
                  editing={editing}
                  selectOptions={[
                    { value: 'immeuble', label: 'Immeuble' },
                    { value: 'maison', label: 'Maison' },
                    { value: 'local_commercial', label: 'Local commercial' },
                    { value: 'mixte', label: 'Mixte' },
                    { value: 'autre', label: 'Autre' },
                  ]}
                />
                <div className="flex items-center justify-between py-2.5">
                  <span className="text-xs text-gray-400">Créé le</span>
                  <span className="text-sm font-medium text-gray-800">{formatDate(batiment.created_at)}</span>
                </div>
              </dl>
              {/* Commentaire — inline editable */}
              {(batiment.commentaire || editing) && (
                <>
                  <Separator className="my-3" />
                  <p className="text-xs text-gray-400 mb-1">Commentaire</p>
                  {editing ? (
                    <Textarea
                      defaultValue={batiment.commentaire || ''}
                      onBlur={(e) => {
                        if (e.target.value !== (batiment.commentaire || '')) handleInlineSave('commentaire', e.target.value)
                      }}
                      placeholder="Notes..."
                      rows={3}
                      className="text-sm animate-fade-in"
                    />
                  ) : (
                    <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-2.5 border border-gray-100">{batiment.commentaire}</p>
                  )}
                </>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Lots tab */}
        <TabsContent value="lots" className="mt-4">
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-gray-400" />
                <h3 className="text-sm font-semibold text-gray-900">Lots</h3>
                <Badge variant="secondary" className="text-[10px] h-5 px-1.5">{lots?.length ?? 0}</Badge>
              </div>
              <Button size="sm" onClick={() => setShowCreateLot(true)} className="bg-primary text-primary-foreground hover:bg-primary/90 h-7 text-xs px-3">
                <Plus className="h-3 w-3 mr-1" /> Ajouter
              </Button>
            </div>
            {lots && lots.length > 0 ? (
              <div className="divide-y divide-gray-50">
                {lots.map((lot) => {
                  const propLabel = lot.proprietaires?.map(p => p.prenom ? `${p.prenom} ${p.nom}` : p.raison_sociale || p.nom).join(', ') || '—'
                  const LotIcon = typeBienIcons[lot.type_bien] || Building2
                  return (
                    <div
                      key={lot.id}
                      className="flex items-center gap-4 px-4 py-3 hover:bg-muted cursor-pointer transition-colors"
                      onClick={() => navigate(`/app/patrimoine/lots/${lot.id}`)}
                    >
                      <div className="h-9 w-9 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                        <LotIcon className="h-4 w-4 text-gray-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">{lot.designation}</p>
                        <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-400">
                          <span className="capitalize">{lot.type_bien.replace('_', ' ')}</span>
                          {lot.etage && <span>Ét. {lot.etage}</span>}
                          {lot.surface && <span>{lot.surface} m²</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {lot.meuble && <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[9px] h-5">Meublé</Badge>}
                        <span className="text-xs text-gray-400 max-w-[120px] truncate">{propLabel}</span>
                        <ExternalLink className="h-3.5 w-3.5 text-gray-300" />
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="py-10 text-center text-gray-400 text-sm">Aucun lot</div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <CreateLotModal
        open={showCreateLot}
        onOpenChange={setShowCreateLot}
        preselectedBatimentId={id}
        onCreated={(lotId) => navigate(`/app/patrimoine/lots/${lotId}`)}
      />
    </div>
  )
}

// ── Address Card — no GPS, no CP fields, with type toggle ──
function AddressCard({ address: a, batimentId, isArchived, totalAddresses }: { address: any; batimentId: string; isArchived: boolean; totalAddresses: number }) {
  const [editing, setEditing] = useState(false)
  const [rue, setRue] = useState(a.rue)
  const [complement, setComplement] = useState(a.complement || '')
  const [lat, setLat] = useState<number | undefined>(a.latitude)
  const [lng, setLng] = useState<number | undefined>(a.longitude)
  const updateAddr = useUpdateAddress()
  const deleteAddr = useDeleteAddress()

  async function handleSave() {
    try {
      await updateAddr.mutateAsync({ batimentId, adresseId: a.id, rue, complement: complement || undefined, code_postal: a.code_postal, ville: a.ville, latitude: lat, longitude: lng })
      toast.success('Adresse mise à jour')
      setEditing(false)
    } catch (err: any) { toast.error(err.message || 'Erreur') }
  }

  async function handleSetPrimary() {
    try {
      await updateAddr.mutateAsync({ batimentId, adresseId: a.id, type: 'principale' })
      toast.success('Adresse définie comme principale')
    } catch (err: any) { toast.error(err.message || 'Erreur') }
  }

  async function handleDelete() {
    try {
      await deleteAddr.mutateAsync({ batimentId, adresseId: a.id })
      toast.success('Adresse supprimée')
    } catch (err: any) { toast.error(err.message || 'Erreur') }
  }

  if (editing) {
    return (
      <div className="p-3 rounded-lg border border-border bg-muted/30 space-y-2 animate-scale-in">
        <AddressAutocomplete
          value={rue}
          onChange={(addr) => {
            if (addr) { setRue(addr.rue); setLat(addr.latitude); setLng(addr.longitude) }
          }}
        />
        <Input value={complement} onChange={(e) => setComplement(e.target.value)} placeholder="Complément d'adresse..." className="h-8 text-xs" />
        <div className="flex justify-end gap-1.5">
          <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setEditing(false)}>
            <XIcon className="h-3 w-3 mr-1" /> Annuler
          </Button>
          <Button size="sm" className="h-7 text-xs bg-primary text-primary-foreground hover:bg-primary/90" onClick={handleSave} disabled={updateAddr.isPending}>
            <Save className="h-3 w-3 mr-1" /> Enregistrer
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-3.5 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors group card-hover">
      <div className="flex items-start gap-3">
        <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${a.type === 'principale' ? 'bg-blue-100' : 'bg-gray-100'}`}>
          <MapPin className={`h-4 w-4 ${a.type === 'principale' ? 'text-blue-600' : 'text-gray-400'}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-gray-900">{a.rue}</p>
            <Badge variant="outline" className={`text-[9px] capitalize shrink-0 ${a.type === 'principale' ? 'bg-blue-50 text-blue-600 border-blue-200' : ''}`}>{a.type === 'principale' ? 'Principale' : 'Secondaire'}</Badge>
          </div>
          {a.complement && <p className="text-xs text-gray-500 mt-0.5">{a.complement}</p>}
          <p className="text-xs text-gray-500 mt-0.5">{a.code_postal} {a.ville}</p>
        </div>
        {!isArchived && (
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
            {a.type !== 'principale' && totalAddresses > 1 && (
              <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-blue-500 hover:text-blue-700" onClick={handleSetPrimary} title="Définir comme principale">
                <Star className="h-3 w-3 mr-1" /> Principale
              </Button>
            )}
            <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-gray-400 hover:text-gray-700" onClick={() => setEditing(true)}>
              <Pencil className="h-3 w-3 mr-1" /> Modifier
            </Button>
            {totalAddresses > 1 && (
              <Button variant="ghost" size="sm" className="h-7 px-1.5 text-red-400 hover:text-red-600" onClick={handleDelete}>
                <Trash2 className="h-3 w-3" />
              </Button>
            )}
          </div>
        )}
      </div>
      {/* Google Maps link only — no GPS coordinates */}
      {a.latitude && a.longitude && (
        <div className="mt-2 pl-12 text-[11px]">
          <a href={`https://maps.google.com/?q=${a.latitude},${a.longitude}`} target="_blank" rel="noopener noreferrer"
            className="text-blue-500 hover:text-blue-700 flex items-center gap-0.5 w-fit">
            <ExternalLinkIcon className="h-3 w-3" /> Voir sur Google Maps
          </a>
        </div>
      )}
    </div>
  )
}

// ── Add Address Button ──
function AddAddressButton({ batimentId }: { batimentId: string }) {
  const [adding, setAdding] = useState(false)
  const [rue, setRue] = useState('')
  const [complement, setComplement] = useState('')
  const [cp, setCp] = useState('')
  const [ville, setVille] = useState('')
  const [lat, setLat] = useState<number | undefined>()
  const [lng, setLng] = useState<number | undefined>()
  const addAddr = useAddAddress()

  async function handleAdd() {
    if (!rue || !cp || !ville) { toast.error('Rue, code postal et ville requis'); return }
    try {
      await addAddr.mutateAsync({ batimentId, type: 'secondaire', rue, complement: complement || undefined, code_postal: cp, ville, latitude: lat, longitude: lng })
      toast.success('Adresse ajoutée')
      setAdding(false); setRue(''); setComplement(''); setCp(''); setVille(''); setLat(undefined); setLng(undefined)
    } catch (err: any) { toast.error(err.message || 'Erreur') }
  }

  if (!adding) {
    return (
      <Button variant="ghost" size="sm" className="h-7 text-xs text-primary hover:text-primary/80" onClick={() => setAdding(true)}>
        <Plus className="h-3 w-3 mr-1" /> Adresse
      </Button>
    )
  }

  return (
    <div className="w-full mt-2 p-3 rounded-lg border border-border bg-muted/30 space-y-2 animate-scale-in">
      <p className="text-xs font-medium text-gray-600">Nouvelle adresse secondaire</p>
      <AddressAutocomplete
        onChange={(addr) => {
          if (addr) { setRue(addr.rue); setCp(addr.code_postal); setVille(addr.ville); setLat(addr.latitude); setLng(addr.longitude) }
        }}
      />
      <Input value={complement} onChange={(e) => setComplement(e.target.value)} placeholder="Complément..." className="h-8 text-xs" />
      <div className="flex justify-end gap-1.5">
        <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setAdding(false)}>Annuler</Button>
        <Button size="sm" className="h-7 text-xs bg-primary text-primary-foreground hover:bg-primary/90" onClick={handleAdd} disabled={addAddr.isPending}>
          <Plus className="h-3 w-3 mr-1" /> Ajouter
        </Button>
      </div>
    </div>
  )
}
