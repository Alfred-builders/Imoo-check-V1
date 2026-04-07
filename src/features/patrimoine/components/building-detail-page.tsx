import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { MapPin, Archive, ArchiveRestore, Plus, Building2, Layers, Calendar, Hash, ExternalLink, Pencil, AlertTriangle, ExternalLinkIcon, Home, ArrowUpCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from 'src/components/ui/button'
import { Badge } from 'src/components/ui/badge'
import { Skeleton } from 'src/components/ui/skeleton'
import { Separator } from 'src/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from 'src/components/ui/tabs'
import { Input } from 'src/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from 'src/components/ui/select'
import { Textarea } from 'src/components/ui/textarea'
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from 'src/components/ui/breadcrumb'
import { useBatimentDetail, useBatimentLots, useUpdateBatiment, useUpdateAddress, useAddAddress, useDeleteAddress } from '../api'
import { AddressAutocomplete } from 'src/components/shared/address-autocomplete'
import { InlineField } from '../../../components/shared/inline-field'
import { FloatingSaveBar } from '../../../components/shared/floating-save-bar'
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

export function BuildingDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [showCreateLot, setShowCreateLot] = useState(false)
  const [editing, setEditing] = useState(false)
  const { data: batiment, isLoading } = useBatimentDetail(id)
  const { data: lots } = useBatimentLots(id)
  const updateMutation = useUpdateBatiment()

  const [formData, setFormData] = useState({
    designation: '',
    type: '',
    nb_etages: '',
    annee_construction: '',
    commentaire: '',
  })
  const [saving, setSaving] = useState(false)

  // Sync form data when batiment loads or editing starts
  useEffect(() => {
    if (batiment) {
      setFormData({
        designation: batiment.designation || '',
        type: batiment.type || '',
        nb_etages: batiment.nb_etages?.toString() || '',
        annee_construction: batiment.annee_construction?.toString() || '',
        commentaire: batiment.commentaire || '',
      })
    }
  }, [batiment, editing])

  async function handleSave() {
    setSaving(true)
    try {
      await updateMutation.mutateAsync({
        id: batiment!.id,
        designation: formData.designation,
        type: formData.type,
        nb_etages: formData.nb_etages ? parseInt(formData.nb_etages) : null,
        annee_construction: formData.annee_construction ? parseInt(formData.annee_construction) : null,
        commentaire: formData.commentaire || null,
      })
      toast.success('Batiment mis a jour')
      // Flash animation on all cards
      const cards = document.querySelectorAll('[data-card]')
      cards.forEach(c => {
        c.classList.add('animate-save-success')
        setTimeout(() => c.classList.remove('animate-save-success'), 600)
      })
      // Smooth close after delay
      setTimeout(() => setEditing(false), 400)
    } catch {
      toast.error('Erreur')
    } finally {
      setSaving(false)
    }
  }

  function handleCancel() {
    if (batiment) {
      setFormData({
        designation: batiment.designation || '',
        type: batiment.type || '',
        nb_etages: batiment.nb_etages?.toString() || '',
        annee_construction: batiment.annee_construction?.toString() || '',
        commentaire: batiment.commentaire || '',
      })
    }
    setEditing(false)
  }

  if (isLoading) {
    return (
      <div className="p-6 space-y-6 max-w-6xl mx-auto">
        <Skeleton className="h-4 w-48" />
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
      {/* Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList className="text-xs">
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/app/patrimoine" className="text-[#94a3b8] hover:text-slate-600">Referentiel</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/app/patrimoine" className="text-[#94a3b8] hover:text-slate-600">Parc immobilier</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="text-slate-700 font-medium">{batiment.designation}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <motion.div layout transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}>
              {editing ? (
                <Input
                  value={formData.designation}
                  onChange={(e) => setFormData(prev => ({ ...prev, designation: e.target.value }))}
                  className="text-[28px] font-bold tracking-[-0.5px] h-auto py-1 px-2 border-primary/30 bg-primary/[0.03] max-w-md"
                />
              ) : (
                <h1 className="text-[28px] font-bold tracking-[-0.5px] text-foreground">{batiment.designation}</h1>
              )}
            </motion.div>
            {editing ? (
              <Select value={formData.type} onValueChange={(v) => setFormData(prev => ({ ...prev, type: v }))}>
                <SelectTrigger className="h-7 w-32 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="immeuble">Immeuble</SelectItem>
                  <SelectItem value="maison">Maison</SelectItem>
                  <SelectItem value="local_commercial">Local commercial</SelectItem>
                  <SelectItem value="mixte">Mixte</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <Badge variant="outline" className="capitalize">{typeLabels[batiment.type]}</Badge>
            )}
            {batiment.est_archive && <Badge variant="destructive" className="text-[10px]">Archive</Badge>}
          </div>
          {principale && (
            <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {principale.rue}, {principale.ville}
            </p>
          )}
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {!batiment.est_archive && !editing && (
            <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => setEditing(true)}>
              <Pencil className="h-3 w-3 mr-1" /> Modifier
            </Button>
          )}
          <Button variant="outline" size="sm" className="h-8 text-xs" onClick={handleArchive}>
            {batiment.est_archive ? <ArchiveRestore className="h-3 w-3 mr-1" /> : <Archive className="h-3 w-3 mr-1" />}
            {batiment.est_archive ? 'Restaurer' : 'Archiver'}
          </Button>
        </div>
      </div>

      {batiment.est_archive && (
        <div className="flex items-center gap-2 px-3 py-2.5 bg-primary/5 border border-primary/30 rounded-lg text-primary text-xs">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
          Ce batiment est archive.
        </div>
      )}

      {/* KPI row — Option A Minimal Pro style */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { icon: Layers, label: 'Lots', value: batiment.nb_lots },
          { icon: Building2, label: 'Type', value: typeLabels[batiment.type] },
          { icon: Hash, label: 'Etages', value: batiment.nb_etages ?? '---' },
          { icon: Calendar, label: 'Construction', value: batiment.annee_construction ?? '---' },
        ].map(({ icon: Icon, label, value }) => (
          <motion.div
            key={label}
            layout
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            data-card
            className="flex items-center gap-3 p-3.5 bg-slate-50 rounded-lg border border-slate-100"
          >
            <div className="h-9 w-9 rounded-lg bg-white border border-slate-100 flex items-center justify-center shrink-0">
              <Icon className="h-4 w-4 text-slate-400" />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-[#94a3b8]">{label}</p>
              <p className="text-[14px] font-bold text-slate-700 -mt-0.5">{value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="bg-gray-100 p-0.5 h-9">
          <TabsTrigger value="overview" className="text-xs h-8 px-4">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="lots" className="text-xs h-8 px-4">Lots ({lots?.length ?? 0})</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <motion.div
            layout
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="grid grid-cols-3 gap-4"
          >
            {/* Adresses */}
            <motion.div
              layout
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              data-card
              className="col-span-2 bg-white rounded-xl border border-[#e2e8f0] shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-5"
            >
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-[11px] font-bold uppercase tracking-wider text-[#94a3b8]">Adresses</h2>
                {!batiment.est_archive && <AddAddressButton batimentId={batiment.id} />}
              </div>
              <div className="space-y-2">
                {adresses.map((a) => (
                  <AddressCard key={a.id} address={a} batimentId={batiment.id} isArchived={batiment.est_archive} totalAddresses={adresses.length} />
                ))}
              </div>
            </motion.div>

            {/* Infos */}
            <motion.div
              layout
              transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
              data-card
              className="bg-white rounded-xl border border-[#e2e8f0] shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-5"
            >
              <h2 className="text-[11px] font-bold uppercase tracking-wider text-[#94a3b8] mb-3">Informations</h2>
              <div className="space-y-1">
                <InlineField label="Etages" editing={editing} value={batiment.nb_etages ?? '---'}>
                  <Input type="number" value={formData.nb_etages} onChange={(e) => setFormData(prev => ({ ...prev, nb_etages: e.target.value }))} className="h-7 text-sm" />
                </InlineField>
                <InlineField label="Annee" editing={editing} value={batiment.annee_construction ?? '---'}>
                  <Input type="number" value={formData.annee_construction} onChange={(e) => setFormData(prev => ({ ...prev, annee_construction: e.target.value }))} className="h-7 text-sm" />
                </InlineField>
                <InlineField label="Cree le" editing={false} value={formatDate(batiment.created_at)}>
                  <span />
                </InlineField>
                <Separator className="my-2" />
                <InlineField label="Commentaire" editing={editing} value={batiment.commentaire || '---'} horizontal={false}>
                  <Textarea value={formData.commentaire} onChange={(e) => setFormData(prev => ({ ...prev, commentaire: e.target.value }))} className="text-sm min-h-[60px]" />
                </InlineField>
              </div>
            </motion.div>
          </motion.div>
        </TabsContent>

        {/* Lots tab */}
        <TabsContent value="lots" className="mt-4">
          <div data-card className="bg-white rounded-xl border border-[#e2e8f0] shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
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
                  const propLabel = lot.proprietaires?.map(p => p.prenom ? `${p.prenom} ${p.nom}` : p.raison_sociale || p.nom).join(', ') || '---'
                  const LotIcon = typeBienIcons[lot.type_bien] || Building2
                  return (
                    <div
                      key={lot.id}
                      className="flex items-center gap-4 px-4 py-3 hover:bg-muted/50 cursor-pointer transition-colors"
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
                          {lot.surface && <span>{lot.surface} m2</span>}
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

      <FloatingSaveBar visible={editing} onSave={handleSave} onCancel={handleCancel} saving={saving} />
    </div>
  )
}

// -- Address Card (view + inline edit + delete) --
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

  async function handleSetPrimary() {
    try {
      await updateAddr.mutateAsync({ batimentId, adresseId: a.id, type: 'principale' })
      toast.success('Adresse definie comme principale')
    } catch (err: any) { toast.error(err.message || 'Erreur') }
  }

  if (editing) {
    return (
      <div className="p-3 rounded-lg border border-primary/30 bg-primary/5 space-y-2">
        <AddressAutocomplete
          value={rue}
          onChange={(addr) => {
            if (addr) { setRue(addr.rue); setCp(addr.code_postal); setVille(addr.ville); setLat(addr.latitude); setLng(addr.longitude) }
          }}
        />
        <Input value={complement} onChange={(e) => setComplement(e.target.value)} placeholder="Complement..." className="h-8 text-xs" />
        <Input value={ville} onChange={(e) => setVille(e.target.value)} placeholder="Ville" className="h-8 text-xs" />
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
          <p className="text-xs text-gray-500 mt-0.5">{a.ville}</p>
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
          <a href={`https://maps.google.com/?q=${a.latitude},${a.longitude}`} target="_blank" rel="noopener noreferrer"
            className="text-blue-500 hover:text-blue-700 flex items-center gap-0.5">
            <ExternalLinkIcon className="h-3 w-3" /> Voir sur Google Maps
          </a>
        ) : (
          <span className="text-gray-300">Coordonnees GPS non disponibles --- saisie manuelle</span>
        )}
        {!isArchived && a.type === 'secondaire' && (
          <>
            {a.latitude && a.longitude && <span className="text-gray-300">|</span>}
            <button
              className="text-primary hover:text-primary/80 flex items-center gap-0.5 font-medium cursor-pointer"
              onClick={handleSetPrimary}
              disabled={updateAddr.isPending}
            >
              <ArrowUpCircle className="h-3 w-3" /> Definir comme principale
            </button>
          </>
        )}
      </div>
    </div>
  )
}

// -- Add Address Button --
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
    if (!rue || !cp || !ville) { toast.error('Rue, code postal et ville sont requis'); return }
    try {
      await addAddr.mutateAsync({ batimentId, type: 'secondaire', rue, complement: complement || undefined, code_postal: cp, ville, latitude: lat, longitude: lng })
      toast.success('Adresse ajoutee')
      setAdding(false); setRue(''); setComplement(''); setCp(''); setVille(''); setLat(undefined); setLng(undefined)
    } catch (err: any) { toast.error(err.message || 'Erreur') }
  }

  if (!adding) {
    return (
      <Button variant="ghost" size="sm" className="h-7 text-xs text-primary hover:text-primary" onClick={() => setAdding(true)}>
        <Plus className="h-3 w-3 mr-1" /> Adresse
      </Button>
    )
  }

  return (
    <div className="w-full mt-2 p-3 rounded-lg border border-primary/30 bg-primary/5 space-y-2">
      <p className="text-xs font-medium text-gray-600">Nouvelle adresse secondaire</p>
      <AddressAutocomplete
        onChange={(addr) => {
          if (addr) { setRue(addr.rue); setCp(addr.code_postal); setVille(addr.ville); setLat(addr.latitude); setLng(addr.longitude) }
        }}
      />
      <Input value={complement} onChange={(e) => setComplement(e.target.value)} placeholder="Complement..." className="h-8 text-xs" />
      <Input value={ville} onChange={(e) => setVille(e.target.value)} placeholder="Ville" className="h-8 text-xs" />
      <div className="flex justify-end gap-1.5">
        <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setAdding(false)}>Annuler</Button>
        <Button size="sm" className="h-7 text-xs bg-primary text-primary-foreground hover:bg-primary/90" onClick={handleAdd} disabled={addAddr.isPending}>
          <Plus className="h-3 w-3 mr-1" /> Ajouter
        </Button>
      </div>
    </div>
  )
}
