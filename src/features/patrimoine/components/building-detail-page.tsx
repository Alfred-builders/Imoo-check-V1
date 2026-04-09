import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { MapPin, Archive, ArchiveRestore, Plus, Building2, Pencil, AlertTriangle, ExternalLinkIcon, ArrowUpCircle, ClipboardList } from 'lucide-react'
import { Button } from 'src/components/ui/button'
import { Badge } from 'src/components/ui/badge'
import { Skeleton } from 'src/components/ui/skeleton'
import { Input } from 'src/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from 'src/components/ui/select'
import { Textarea } from 'src/components/ui/textarea'
import { useBatimentDetail, useBatimentLots, useUpdateBatiment, useUpdateAddress, useAddAddress, useDeleteAddress } from '../api'
import { AddressAutocomplete } from 'src/components/shared/address-autocomplete'
import { FloatingSaveBar } from '../../../components/shared/floating-save-bar'
import { ResizeHandle, useResizableColumns } from '../../../components/shared/resizable-columns'
import { CreateLotModal } from './create-lot-modal'
import { toast } from 'sonner'
import { Trash2, Save, X as XIcon } from 'lucide-react'

const typeLabels: Record<string, string> = {
  immeuble: 'Immeuble', maison: 'Maison', local_commercial: 'Local commercial', mixte: 'Mixte', autre: 'Autre',
}

export function BuildingDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [showCreateLot, setShowCreateLot] = useState(false)
  const [editing, setEditing] = useState(false)
  const { data: batiment, isLoading } = useBatimentDetail(id)
  const { data: lots } = useBatimentLots(id)
  const updateMutation = useUpdateBatiment()
  const lotCols = useResizableColumns({ designation: 250, type: 120, etage: 100, surface: 100, meuble: 80 })

  const [formData, setFormData] = useState({
    designation: '',
    type: '',
    nb_etages: '',
    annee_construction: '',
    commentaire: '',
  })
  const [saving, setSaving] = useState(false)

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
      toast.success('Bâtiment mis à jour')
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
      <div className="p-6 space-y-6 ">
        <Skeleton className="h-12 w-72" />
        <div className="grid grid-cols-2 gap-5">
          <Skeleton className="h-72 rounded-xl" />
          <Skeleton className="h-72 rounded-xl" />
        </div>
        <Skeleton className="h-60 rounded-xl" />
      </div>
    )
  }

  if (!batiment) return <div className="p-6"><p className="text-muted-foreground">Bâtiment introuvable</p></div>

  const adresses = batiment.adresses ?? []

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
    <div className="p-6 space-y-6 ">
      {/* Header — icon + name + badge + actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <ClipboardList className="h-6 w-6 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              {editing ? (
                <Input
                  value={formData.designation}
                  onChange={(e) => setFormData(prev => ({ ...prev, designation: e.target.value }))}
                  className="text-xl font-bold h-auto py-1 px-2 border-primary/30 bg-primary/[0.03] max-w-md"
                />
              ) : (
                <h1 className="text-xl font-bold text-foreground">{batiment.designation}</h1>
              )}
            </div>
            <div className="mt-1">
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
                <Badge className="bg-primary/10 text-primary border-primary/20 capitalize">{typeLabels[batiment.type]}</Badge>
              )}
              {batiment.est_archive && <Badge variant="destructive" className="text-[10px] ml-2">Archivé</Badge>}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {!batiment.est_archive && !editing && (
            <Button variant="outline" size="sm" className="gap-1.5 border-border hover:border-foreground/20 hover:bg-accent" onClick={() => setEditing(true)}>
              <Pencil className="h-3.5 w-3.5" /> Modifier
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            className={batiment.est_archive
              ? 'gap-1.5 border-border hover:border-foreground/20 hover:bg-accent'
              : 'gap-1.5 border-destructive/30 text-destructive/80 hover:text-destructive hover:bg-destructive/5 hover:border-destructive/50'}
            onClick={handleArchive}
          >
            {batiment.est_archive ? <ArchiveRestore className="h-3.5 w-3.5" /> : <Archive className="h-3.5 w-3.5" />}
            {batiment.est_archive ? 'Restaurer' : 'Archiver'}
          </Button>
        </div>
      </div>

      {batiment.est_archive && (
        <div className="flex items-center gap-2 px-3 py-2.5 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-xs">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
          Ce bâtiment est archivé.
        </div>
      )}

      {/* Two-column: Informations + Adresses */}
      <div className="grid grid-cols-2 gap-5">
        {/* Informations card */}
        <div data-card className="bg-card rounded-xl border border-border shadow-sm">
          <div className="px-5 py-4 border-b border-border">
            <h2 className="text-sm font-semibold text-foreground">Informations</h2>
          </div>
          <div className="divide-y divide-border/50">
            <InfoRow label="Type" editing={editing} value={typeLabels[batiment.type] || batiment.type}>
              <Select value={formData.type} onValueChange={(v) => setFormData(prev => ({ ...prev, type: v }))}>
                <SelectTrigger className="h-8 w-40 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(typeLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                </SelectContent>
              </Select>
            </InfoRow>
            <InfoRow label="N° bâtiment" editing={editing} value={batiment.designation}>
              <Input value={formData.designation} onChange={(e) => setFormData(prev => ({ ...prev, designation: e.target.value }))} className="h-8 w-40 text-sm" />
            </InfoRow>
            <InfoRow label="Nb étages" editing={editing} value={batiment.nb_etages ?? '--'}>
              <Input type="number" value={formData.nb_etages} onChange={(e) => setFormData(prev => ({ ...prev, nb_etages: e.target.value }))} className="h-8 w-40 text-sm" />
            </InfoRow>
            <InfoRow label="Année construction" editing={editing} value={batiment.annee_construction ?? '--'}>
              <Input type="number" value={formData.annee_construction} onChange={(e) => setFormData(prev => ({ ...prev, annee_construction: e.target.value }))} className="h-8 w-40 text-sm" />
            </InfoRow>
            <InfoRow label="Réf. interne" editing={false} value={batiment.reference_interne ?? '--'}>
              <span />
            </InfoRow>
            <InfoRow label="Commentaire" editing={editing} value={batiment.commentaire || '--'}>
              <Textarea value={formData.commentaire} onChange={(e) => setFormData(prev => ({ ...prev, commentaire: e.target.value }))} className="text-sm min-h-[40px] w-60" />
            </InfoRow>
          </div>
        </div>

        {/* Adresses card */}
        <div data-card className="bg-card rounded-xl border border-border shadow-sm">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">Adresses</h2>
            {!batiment.est_archive && <AddAddressButton batimentId={batiment.id} />}
          </div>

          {/* Address table header */}
          <div className="grid grid-cols-[100px_1fr_140px] gap-3 px-5 py-2.5 text-xs font-medium text-muted-foreground border-b border-border/50">
            <div>Type</div>
            <div>Adresse</div>
            <div className="text-right">CP / Ville</div>
          </div>

          {/* Address rows */}
          {adresses.length > 0 ? (
            <div className="divide-y divide-border/30">
              {adresses.map((a) => (
                <AddressRow key={a.id} address={a} batimentId={batiment.id} isArchived={batiment.est_archive} totalAddresses={adresses.length} />
              ))}
            </div>
          ) : (
            <div className="py-10 text-center text-muted-foreground text-sm">Aucune adresse</div>
          )}
        </div>
      </div>

      {/* Lots table — full width */}
      <div data-card className="bg-card rounded-xl border border-border shadow-sm">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">Lots ({lots?.length ?? 0})</h2>
          {!batiment.est_archive && (
            <Button size="sm" onClick={() => setShowCreateLot(true)}>
              <Plus className="h-3.5 w-3.5 mr-1.5" /> Ajouter un lot
            </Button>
          )}
        </div>

        {/* Lots table header */}
        <div className="flex items-center gap-3 px-5 py-2.5 text-xs font-medium text-muted-foreground border-b border-border/50 select-none">
          <div className="relative shrink-0" style={{ width: lotCols.colWidths.designation, minWidth: 40 }}>
            Désignation
            <ResizeHandle colId="designation" onResizeStart={lotCols.onResizeStart} onResize={lotCols.onResize} />
          </div>
          <div className="relative shrink-0" style={{ width: lotCols.colWidths.type, minWidth: 40 }}>
            Type
            <ResizeHandle colId="type" onResizeStart={lotCols.onResizeStart} onResize={lotCols.onResize} />
          </div>
          <div className="relative shrink-0" style={{ width: lotCols.colWidths.etage, minWidth: 40 }}>
            Étage
            <ResizeHandle colId="etage" onResizeStart={lotCols.onResizeStart} onResize={lotCols.onResize} />
          </div>
          <div className="relative shrink-0 text-right" style={{ width: lotCols.colWidths.surface, minWidth: 40 }}>
            Surface
            <ResizeHandle colId="surface" onResizeStart={lotCols.onResizeStart} onResize={lotCols.onResize} />
          </div>
          <div className="relative shrink-0" style={{ width: lotCols.colWidths.meuble, minWidth: 40 }}>
            Meublé
          </div>
        </div>

        {lots && lots.length > 0 ? (
          <div className="divide-y divide-border/30">
            {lots.map((lot) => (
              <div
                key={lot.id}
                className="flex items-center gap-3 px-5 py-3 hover:bg-accent/50 cursor-pointer transition-colors"
                onClick={() => navigate(`/app/patrimoine/lots/${lot.id}`)}
              >
                <div className="shrink-0 text-sm font-medium text-foreground truncate" style={{ width: lotCols.colWidths.designation }}>{lot.designation}</div>
                <div className="shrink-0" style={{ width: lotCols.colWidths.type }}>
                  <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px] capitalize">{lot.type_bien.replace('_', ' ')}</Badge>
                </div>
                <div className="shrink-0 text-sm text-muted-foreground" style={{ width: lotCols.colWidths.etage }}>{lot.etage || '--'}</div>
                <div className="shrink-0 text-sm text-muted-foreground text-right" style={{ width: lotCols.colWidths.surface }}>{lot.surface ? `${lot.surface} m²` : '--'}</div>
                <div className="shrink-0 text-sm text-muted-foreground" style={{ width: lotCols.colWidths.meuble }}>{lot.meuble ? 'Oui' : 'Non'}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-10 text-center text-muted-foreground text-sm">Aucun lot</div>
        )}
      </div>

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

/* ── Info Row (label + value) ── */
function InfoRow({ label, value, editing, children }: { label: string; value: React.ReactNode; editing: boolean; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between px-5 py-3">
      <span className="text-sm text-muted-foreground">{label}</span>
      {editing ? (
        <div>{children}</div>
      ) : (
        <span className="text-sm font-medium text-foreground">{value}</span>
      )}
    </div>
  )
}

/* ── Address Row (table-style) ── */
function AddressRow({ address: a, batimentId, isArchived, totalAddresses }: { address: any; batimentId: string; isArchived: boolean; totalAddresses: number }) {
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
      toast.success('Adresse mise à jour')
      setEditing(false)
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
      <div className="p-4 bg-primary/5 border-b border-border/30 space-y-2">
        <AddressAutocomplete
          value={rue}
          onChange={(addr) => {
            if (addr) { setRue(addr.rue); setCp(addr.code_postal); setVille(addr.ville); setLat(addr.latitude); setLng(addr.longitude) }
          }}
        />
        <Input value={complement} onChange={(e) => setComplement(e.target.value)} placeholder="Complément..." className="h-8 text-xs" />
        <Input value={ville} onChange={(e) => setVille(e.target.value)} placeholder="Ville" className="h-8 text-xs" />
        <div className="flex justify-end gap-1.5">
          <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setEditing(false)}>
            <XIcon className="h-3 w-3 mr-1" /> Annuler
          </Button>
          <Button size="sm" className="h-7 text-xs" onClick={handleSave} disabled={updateAddr.isPending}>
            <Save className="h-3 w-3 mr-1" /> Enregistrer
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-[100px_1fr_140px] gap-3 px-5 py-3 items-center group hover:bg-accent/30 transition-colors">
      <div>
        <Badge variant="outline" className="text-[10px] capitalize">{a.type}</Badge>
      </div>
      <div className="text-sm text-foreground truncate">
        {a.rue}{a.complement ? `, ${a.complement}` : ''}
      </div>
      <div className="flex items-center justify-end gap-2">
        <span className="text-sm text-foreground">{a.code_postal} {a.ville}</span>
        {!isArchived && (
          <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
            <Button variant="ghost" size="icon-xs" className="text-muted-foreground hover:text-foreground" onClick={(e) => { e.stopPropagation(); setEditing(true) }}>
              <Pencil className="h-3 w-3" />
            </Button>
            {totalAddresses > 1 && (
              <Button variant="ghost" size="icon-xs" className="text-destructive/60 hover:text-destructive" onClick={(e) => { e.stopPropagation(); handleDelete() }}>
                <Trash2 className="h-3 w-3" />
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

/* ── Add Address Button ── */
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
      toast.success('Adresse ajoutée')
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
      <p className="text-xs font-medium text-foreground/70">Nouvelle adresse secondaire</p>
      <AddressAutocomplete
        onChange={(addr) => {
          if (addr) { setRue(addr.rue); setCp(addr.code_postal); setVille(addr.ville); setLat(addr.latitude); setLng(addr.longitude) }
        }}
      />
      <Input value={complement} onChange={(e) => setComplement(e.target.value)} placeholder="Complément..." className="h-8 text-xs" />
      <Input value={ville} onChange={(e) => setVille(e.target.value)} placeholder="Ville" className="h-8 text-xs" />
      <div className="flex justify-end gap-1.5">
        <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setAdding(false)}>Annuler</Button>
        <Button size="sm" className="h-7 text-xs" onClick={handleAdd} disabled={addAddr.isPending}>
          <Plus className="h-3 w-3 mr-1" /> Ajouter
        </Button>
      </div>
    </div>
  )
}
