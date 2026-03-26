import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from 'src/components/ui/dialog'
import { Button } from 'src/components/ui/button'
import { Input } from 'src/components/ui/input'
import { Label } from 'src/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from 'src/components/ui/select'
import { Switch } from 'src/components/ui/switch'
import { Textarea } from 'src/components/ui/textarea'
import { RecordPicker } from 'src/components/shared/record-picker'
import { useCreateLot, useBatiments } from '../api'
import { toast } from 'sonner'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  preselectedBatimentId?: string
  onCreated?: (id: string) => void
  onCreateBatiment?: () => void
}

export function CreateLotModal({ open, onOpenChange, preselectedBatimentId, onCreated, onCreateBatiment }: Props) {
  const [batimentId, setBatimentId] = useState(preselectedBatimentId || '')
  const [designation, setDesignation] = useState('')
  const [typeBien, setTypeBien] = useState('appartement')
  const [etage, setEtage] = useState('')
  const [surface, setSurface] = useState('')
  const [meuble, setMeuble] = useState(false)
  const [nbPieces, setNbPieces] = useState('')
  const [commentaire, setCommentaire] = useState('')

  const createMutation = useCreateLot()
  const { data: batimentsData } = useBatiments()

  const batimentOptions = (batimentsData?.data ?? []).map((b) => ({
    id: b.id,
    label: b.designation,
    sublabel: b.adresse_principale ? `${b.adresse_principale.rue}, ${b.adresse_principale.ville}` : undefined,
    meta: b.type,
  }))

  function reset() {
    if (!preselectedBatimentId) setBatimentId('')
    setDesignation('')
    setTypeBien('appartement')
    setEtage('')
    setSurface('')
    setMeuble(false)
    setNbPieces('')
    setCommentaire('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!batimentId) {
      toast.error('Veuillez sélectionner un bâtiment')
      return
    }
    try {
      const result = await createMutation.mutateAsync({
        batiment_id: batimentId,
        designation,
        type_bien: typeBien,
        etage: etage || undefined,
        surface: surface ? parseFloat(surface) : undefined,
        meuble,
        nb_pieces: nbPieces || undefined,
        commentaire: commentaire || undefined,
      })
      toast.success(`Lot "${designation}" créé`)
      reset()
      onOpenChange(false)
      onCreated?.(result.id)
    } catch (err: any) {
      toast.error(err.message || 'Erreur lors de la création')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Nouveau lot</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Bâtiment picker */}
          {!preselectedBatimentId && (
            <div className="space-y-2">
              <Label>Bâtiment *</Label>
              <RecordPicker
                options={batimentOptions}
                value={batimentId}
                onChange={(id) => setBatimentId(id || '')}
                placeholder="Sélectionner un bâtiment"
                searchPlaceholder="Chercher par nom ou adresse..."
                onCreateClick={onCreateBatiment}
                createLabel="Ajouter un bâtiment"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-2">
              <Label>Désignation *</Label>
              <Input value={designation} onChange={(e) => setDesignation(e.target.value)} placeholder="Appartement 201" required />
            </div>
            <div className="space-y-2">
              <Label>Type de bien *</Label>
              <Select value={typeBien} onValueChange={setTypeBien}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="appartement">Appartement</SelectItem>
                  <SelectItem value="maison">Maison</SelectItem>
                  <SelectItem value="studio">Studio</SelectItem>
                  <SelectItem value="local_commercial">Local commercial</SelectItem>
                  <SelectItem value="parking">Parking</SelectItem>
                  <SelectItem value="cave">Cave</SelectItem>
                  <SelectItem value="autre">Autre</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Étage</Label>
              <Input value={etage} onChange={(e) => setEtage(e.target.value)} placeholder="2" />
            </div>
            <div className="space-y-2">
              <Label>Surface (m²)</Label>
              <Input type="number" step="0.01" value={surface} onChange={(e) => setSurface(e.target.value)} placeholder="65" />
            </div>
            <div className="space-y-2">
              <Label>Nombre de pièces</Label>
              <Select value={nbPieces} onValueChange={setNbPieces}>
                <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="studio">Studio</SelectItem>
                  <SelectItem value="T1">T1</SelectItem>
                  <SelectItem value="T2">T2</SelectItem>
                  <SelectItem value="T3">T3</SelectItem>
                  <SelectItem value="T4">T4</SelectItem>
                  <SelectItem value="T5">T5</SelectItem>
                  <SelectItem value="T6">T6+</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Switch checked={meuble} onCheckedChange={setMeuble} />
            <Label>Meublé</Label>
          </div>

          <div className="space-y-2">
            <Label>Commentaire</Label>
            <Textarea value={commentaire} onChange={(e) => setCommentaire(e.target.value)} placeholder="Notes..." rows={2} />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Création...' : 'Créer'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
