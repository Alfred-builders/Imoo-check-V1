import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, MapPin, Archive, ArchiveRestore, Plus, Building2, Layers, Calendar, Hash, ExternalLink, Pencil, AlertTriangle, ExternalLinkIcon, Home, Armchair, Ruler } from 'lucide-react'
import { Button } from 'src/components/ui/button'
import { Badge } from 'src/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from 'src/components/ui/card'
import { Skeleton } from 'src/components/ui/skeleton'
import { Separator } from 'src/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from 'src/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from 'src/components/ui/table'
import { Input } from 'src/components/ui/input'
import { Label } from 'src/components/ui/label'
import { useBatimentDetail, useBatimentLots, useUpdateBatiment, useUpdateAddress, useAddAddress, useDeleteAddress } from '../api'
import { AddressAutocomplete } from 'src/components/shared/address-autocomplete'
import { CreateLotModal } from './create-lot-modal'
import { EditBuildingForm } from './edit-building-form'
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

export function BuildingDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [showCreateLot, setShowCreateLot] = useState(false)
  const [editing, setEditing] = useState(false)
  const { data: batiment, isLoading } = useBatimentDetail(id)
  const { data: lots } = useBatimentLots(id)
  const updateMutation = useUpdateBatiment()

  if (isLoading) {
    return (
      <div className="p-6 space-y-6 max-w-6xl mx-auto">
        <Skeleton className="h-10 w-72" />
        <div className="grid grid-cols-4 gap-3">{[1,2,3,4].map(i => <Skeleton key={i} className="h-20 rounded-xl" />)}</div>
        <Skeleton className="h-80 rounded-xl" />
      </div>
    )
  }

  if (!batiment) return <div className="p-6"><p className="text-gray-400">Batiment introuvable</p></div>

  const adresses = batiment.adresses ?? []
  const principale = adresses.find(a => a.type === 'principale')

  async function handleArchive() {
    if (!id) return
    try {
      await updateMutation.mutateAsync({ id, est_archive: !batiment!.est_archive })
      toast.success(batiment!.est_archive ? 'Batiment restaure' : 'Batiment archive')
    } catch (err: any) {
      toast.error(err.message || 'Erreur')
    }
  }

  return (
    <div className="p-6 space-y-5 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-start gap-3">
        <Button variant="ghost" size="icon" className="mt-0.5 shrink-0 h-8 w-8" onClick={() => navigate('/app/patrimoine')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-display font-bold text-gray-900">{batiment.designation}</h1>
            <Badge variant="outline" className="text-[10px] font-medium">{typeLabels[batiment.type]}</Badge>
            {batiment.est_archive && <Badge variant="destructive" className="text-[10px]">Archive</Badge>}
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
            <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => setEditing(!editing)}>
              <Pencil className="h-3 w-3 mr-1" /> {editing ? 'Annuler' : 'Modifier'}
            </Button>
          )}
          <Button variant="outline" size="sm" className="h-8 text-xs" onClick={handleArchive}>
            {batiment.est_archive ? <ArchiveRestore className="h-3 w-3 mr-1" /> : <Archive className="h-3 w-3 mr-1" />}
            {batiment.est_archive ? 'Restaurer' : 'Archiver'}
          </Button>
        </div>
      </div>

      {batiment.est_archive && (
        <div className="flex items-center gap-2 px-3 py-2.5 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-xs">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
          Ce batiment est archive.
        </div>
      )}

      {/* KPI row — always visible */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { icon: Layers, label: 'Lots', value: batiment.nb_lots, bg: 'bg-blue-500', text: 'text-white' },
          { icon: Building2, label: 'Type', value: typeLabels[batiment.type], bg: 'bg-amber-500', text: 'text-white' },
          { icon: Hash, label: 'Etages', value: batiment.nb_etages ?? '—', bg: 'bg-emerald-500', text: 'text-white' },
          { icon: Calendar, label: 'Construction', value: batiment.annee_construction ?? '—', bg: 'bg-violet-500', text: 'text-white' },
        ].map(({ icon: Icon, label, value, bg, text }) => (
          <div key={label} className="flex items-center gap-3 p-3.5 bg-white border border-gray-200 rounded-xl shadow-sm">
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

      {/* Tabs — always visible */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="bg-gray-100 p-0.5 h-9">
          <TabsTrigger value="overview" className="text-xs h-8 px-4">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="lots" className="text-xs h-8 px-4">Lots ({lots?.length ?? 0})</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          {/* Edit form inside tab content */}
          {editing && (
            <Card className="shadow-sm border-amber-200 bg-amber-50/30 mb-4">
              <CardContent className="pt-5">
                <EditBuildingForm
                  batiment={batiment}
                  onSave={async (data) => {
                    await updateMutation.mutateAsync({ id: batiment.id, ...data })
                    toast.success('Batiment mis a jour')
                    setEditing(false)
                  }}
                  onCancel={() => setEditing(false)}
                />
              </CardContent>
            </Card>
          )}
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

              {/* Infos */}
              <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Informations</h2>
                <dl className="space-y-3">
                  {([
                    ['N batiment', batiment.num_batiment],
                    ['Etages', batiment.nb_etages],
                    ['Annee', batiment.annee_construction],
                    ['Cree le', formatDate(batiment.created_at)],
                  ] as [string, string | number | null | undefined][]).map(([label, val]) => (
                    <div key={label} className="flex items-center justify-between text-sm">
                      <dt className="text-gray-400">{label}</dt>
                      <dd className="font-medium text-gray-800">{val ?? '—'}</dd>
                    </div>
                  ))}
                </dl>
                {batiment.commentaire && (
                  <>
                    <Separator className="my-3" />
                    <p className="text-xs text-gray-400 mb-1">Commentaire</p>
                    <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-2.5 border border-gray-100">{batiment.commentaire}</p>
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
                <Button size="sm" onClick={() => setShowCreateLot(true)} className="bg-amber-600 hover:bg-amber-700 text-white h-7 text-xs px-3">
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
                        className="flex items-center gap-4 px-4 py-3 hover:bg-amber-50/40 cursor-pointer transition-colors"
                        onClick={() => navigate(`/app/patrimoine/lots/${lot.id}`)}
                      >
                        <div className="h-9 w-9 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                          <LotIcon className="h-4 w-4 text-gray-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">{lot.designation}</p>
                          <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-400">
                            <span className="capitalize">{lot.type_bien.replace('_', ' ')}</span>
                            {lot.etage && <span>Et. {lot.etage}</span>}
                            {lot.surface && <span>{lot.surface} m²</span>}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {lot.meuble && <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[9px] h-5">Meuble</Badge>}
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

// ── Address Card (view + inline edit + delete) ──
function AddressCard({ address: a, batimentId, isArchived, totalAddresses }: { address: any; batimentId: string; isArchived: boolean; totalAddresses: number }) {
  const [editing, setEditing] = useState(false)
  const [rue, setRue] = useState(a.rue)
  const [complement, setComplement] = useState(a.complement || '')
  const [cp, setCp] = useState(a.code_postal)
  const [ville, setVille] = useState(a.ville)
  const [lat, setLat] = useState<number | undefined>(a.latitude)
  const [lng, setLng] = useState<number | undefined>(a.longitude)
  const updateAddr = useUpdateAddress()
  const deleteAddr = useDeleteAddress()

  async function handleSave() {
    try {
      await updateAddr.mutateAsync({ batimentId, adresseId: a.id, rue, complement: complement || undefined, code_postal: cp, ville, latitude: lat, longitude: lng })
      toast.success('Adresse mise a jour')
      setEditing(false)
    } catch (err: any) { toast.error(err.message || 'Erreur') }
  }

  async function handleDelete() {
    try {
      await deleteAddr.mutateAsync({ batimentId, adresseId: a.id })
      toast.success('Adresse supprimee')
    } catch (err: any) { toast.error(err.message || 'Erreur') }
  }

  if (editing) {
    return (
      <div className="p-3 rounded-lg border border-amber-200 bg-amber-50/30 space-y-2">
        <AddressAutocomplete
          value={rue}
          onChange={(addr) => {
            if (addr) { setRue(addr.rue); setCp(addr.code_postal); setVille(addr.ville); setLat(addr.latitude); setLng(addr.longitude) }
          }}
        />
        <Input value={complement} onChange={(e) => setComplement(e.target.value)} placeholder="Complement..." className="h-8 text-xs" />
        <div className="grid grid-cols-2 gap-2">
          <Input value={cp} onChange={(e) => setCp(e.target.value)} placeholder="Code postal" className="h-8 text-xs" />
          <Input value={ville} onChange={(e) => setVille(e.target.value)} placeholder="Ville" className="h-8 text-xs" />
        </div>
        <div className="flex justify-end gap-1.5">
          <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setEditing(false)}>
            <XIcon className="h-3 w-3 mr-1" /> Annuler
          </Button>
          <Button size="sm" className="h-7 text-xs bg-amber-600 hover:bg-amber-700 text-white" onClick={handleSave} disabled={updateAddr.isPending}>
            <Save className="h-3 w-3 mr-1" /> Enregistrer
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-3.5 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors group">
      <div className="flex items-start gap-3">
        <div className="h-9 w-9 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
          <MapPin className="h-4 w-4 text-blue-600" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-gray-900">{a.rue}</p>
            <Badge variant="outline" className="text-[9px] capitalize shrink-0">{a.type}</Badge>
          </div>
          {a.complement && <p className="text-xs text-gray-500 mt-0.5">{a.complement}</p>}
          <p className="text-xs text-gray-500 mt-0.5">{a.code_postal} {a.ville}</p>
        </div>
        {!isArchived && (
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
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
      {/* Additional info row */}
      <div className="flex items-center gap-4 mt-2 pl-12 text-[11px]">
        {a.latitude && a.longitude ? (
          <>
            <a href={`https://maps.google.com/?q=${a.latitude},${a.longitude}`} target="_blank" rel="noopener noreferrer"
              className="text-blue-500 hover:text-blue-700 flex items-center gap-0.5">
              <ExternalLinkIcon className="h-3 w-3" /> Voir sur Google Maps
            </a>
            <span className="text-gray-300">|</span>
            <span className="text-gray-400">GPS: {a.latitude.toFixed(4)}, {a.longitude.toFixed(4)}</span>
          </>
        ) : (
          <span className="text-gray-300">Coordonnees GPS non disponibles — saisie manuelle</span>
        )}
      </div>
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
      toast.success('Adresse ajoutee')
      setAdding(false); setRue(''); setComplement(''); setCp(''); setVille(''); setLat(undefined); setLng(undefined)
    } catch (err: any) { toast.error(err.message || 'Erreur') }
  }

  if (!adding) {
    return (
      <Button variant="ghost" size="sm" className="h-7 text-xs text-amber-600 hover:text-amber-700" onClick={() => setAdding(true)}>
        <Plus className="h-3 w-3 mr-1" /> Adresse
      </Button>
    )
  }

  return (
    <div className="w-full mt-2 p-3 rounded-lg border border-amber-200 bg-amber-50/30 space-y-2">
      <p className="text-xs font-medium text-gray-600">Nouvelle adresse secondaire</p>
      <AddressAutocomplete
        onChange={(addr) => {
          if (addr) { setRue(addr.rue); setCp(addr.code_postal); setVille(addr.ville); setLat(addr.latitude); setLng(addr.longitude) }
        }}
      />
      <Input value={complement} onChange={(e) => setComplement(e.target.value)} placeholder="Complement..." className="h-8 text-xs" />
      <div className="grid grid-cols-2 gap-2">
        <Input value={cp} onChange={(e) => setCp(e.target.value)} placeholder="Code postal" className="h-8 text-xs" />
        <Input value={ville} onChange={(e) => setVille(e.target.value)} placeholder="Ville" className="h-8 text-xs" />
      </div>
      <div className="flex justify-end gap-1.5">
        <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setAdding(false)}>Annuler</Button>
        <Button size="sm" className="h-7 text-xs bg-amber-600 hover:bg-amber-700 text-white" onClick={handleAdd} disabled={addAddr.isPending}>
          <Plus className="h-3 w-3 mr-1" /> Ajouter
        </Button>
      </div>
    </div>
  )
}
