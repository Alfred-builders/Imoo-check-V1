import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from 'src/components/ui/dialog'
import { Button } from 'src/components/ui/button'
import { Input } from 'src/components/ui/input'
import { Label } from 'src/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from 'src/components/ui/select'
import { Textarea } from 'src/components/ui/textarea'
import { AddressAutocomplete } from 'src/components/shared/address-autocomplete'
import { useCreateBatiment } from '../api'
import { toast } from 'sonner'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated?: (id: string) => void
  onMaisonCreated?: (batimentId: string) => void // Triggers lot form after maison building
}

export function CreateBuildingModal({ open, onOpenChange, onCreated, onMaisonCreated }: Props) {
  const [designation, setDesignation] = useState('')
  const [type, setType] = useState<string>('immeuble')
  const [rue, setRue] = useState('')
  const [codePostal, setCodePostal] = useState('')
  const [ville, setVille] = useState('')
  const [complement, setComplement] = useState('')
  const [latitude, setLatitude] = useState<number | undefined>()
  const [longitude, setLongitude] = useState<number | undefined>()
  const [numBatiment, setNumBatiment] = useState('')
  const [nbEtages, setNbEtages] = useState('')
  const [anneeConstruction, setAnneeConstruction] = useState('')
  const [commentaire, setCommentaire] = useState('')
  const [showSecondary, setShowSecondary] = useState(false)
  const [secRue, setSecRue] = useState('')
  const [secCodePostal, setSecCodePostal] = useState('')
  const [secVille, setSecVille] = useState('')
  const [secLat, setSecLat] = useState<number | undefined>()
  const [secLng, setSecLng] = useState<number | undefined>()

  const createMutation = useCreateBatiment()

  function reset() {
    setDesignation('')
    setType('immeuble')
    setRue('')
    setCodePostal('')
    setVille('')
    setComplement('')
    setNbEtages('')
    setAnneeConstruction('')
    setCommentaire('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      const result = await createMutation.mutateAsync({
        designation,
        type,
        num_batiment: numBatiment || undefined,
        nb_etages: nbEtages ? parseInt(nbEtages) : undefined,
        annee_construction: anneeConstruction ? parseInt(anneeConstruction) : undefined,
        commentaire: commentaire || undefined,
        adresses: [
          { type: 'principale', rue, complement: complement || undefined, code_postal: codePostal, ville, latitude, longitude },
          ...(showSecondary && secRue ? [{ type: 'secondaire', rue: secRue, code_postal: secCodePostal, ville: secVille, latitude: secLat, longitude: secLng }] : []),
        ],
      })
      toast.success(`Bâtiment "${designation}" créé`)
      reset()
      onOpenChange(false)
      // If type=maison, chain to lot creation (US-585)
      if (type === 'maison' && onMaisonCreated) {
        onMaisonCreated(result.id)
      } else {
        onCreated?.(result.id)
      }
    } catch (err: any) {
      toast.error(err.message || 'Erreur lors de la création')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Nouveau bâtiment</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-2">
              <Label>Désignation *</Label>
              <Input value={designation} onChange={(e) => setDesignation(e.target.value)} placeholder="Résidence Les Lilas" required />
            </div>
            <div className="space-y-2">
              <Label>Type *</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="immeuble">Immeuble</SelectItem>
                  <SelectItem value="maison">Maison</SelectItem>
                  <SelectItem value="local_commercial">Local commercial</SelectItem>
                  <SelectItem value="mixte">Mixte</SelectItem>
                  <SelectItem value="autre">Autre</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>N batiment</Label>
              <Input value={numBatiment} onChange={(e) => setNumBatiment(e.target.value)} placeholder="A, B, C..." />
            </div>
            <div className="space-y-2">
              <Label>Nombre d'etages</Label>
              <Input type="number" value={nbEtages} onChange={(e) => setNbEtages(e.target.value)} placeholder="5" />
            </div>
          </div>

          <div className="border-t border-border pt-4">
            <p className="text-sm font-medium mb-3">Adresse principale</p>
            <div className="space-y-3">
              <div className="space-y-2">
                <Label>Adresse *</Label>
                <AddressAutocomplete
                  onChange={(addr) => {
                    if (addr) {
                      setRue(addr.rue)
                      setCodePostal(addr.code_postal)
                      setVille(addr.ville)
                      setLatitude(addr.latitude)
                      setLongitude(addr.longitude)
                    }
                  }}
                  placeholder="Rechercher une adresse..."
                />
              </div>
              <div className="space-y-2">
                <Label>Complement</Label>
                <Input value={complement} onChange={(e) => setComplement(e.target.value)} placeholder="Bat. A, Entree 2" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Code postal *</Label>
                  <Input value={codePostal} onChange={(e) => setCodePostal(e.target.value)} placeholder="75011" required />
                </div>
                <div className="space-y-2">
                  <Label>Ville *</Label>
                  <Input value={ville} onChange={(e) => setVille(e.target.value)} placeholder="Paris" required />
                </div>
              </div>
            </div>
          </div>

          {/* Secondary address */}
          {!showSecondary ? (
            <button type="button" onClick={() => setShowSecondary(true)} className="text-xs text-primary hover:text-primary font-medium">
              + Ajouter une adresse secondaire
            </button>
          ) : (
            <div className="border-t border-border pt-3">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium">Adresse secondaire</p>
                <button type="button" onClick={() => { setShowSecondary(false); setSecRue('') }} className="text-xs text-gray-400 hover:text-red-500">Retirer</button>
              </div>
              <div className="space-y-2">
                <AddressAutocomplete
                  onChange={(addr) => {
                    if (addr) { setSecRue(addr.rue); setSecCodePostal(addr.code_postal); setSecVille(addr.ville); setSecLat(addr.latitude); setSecLng(addr.longitude) }
                  }}
                  placeholder="Rechercher adresse secondaire..."
                />
                <div className="grid grid-cols-2 gap-3">
                  <Input value={secCodePostal} onChange={(e) => setSecCodePostal(e.target.value)} placeholder="Code postal" />
                  <Input value={secVille} onChange={(e) => setSecVille(e.target.value)} placeholder="Ville" />
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label>Annee construction</Label>
            <Input type="number" value={anneeConstruction} onChange={(e) => setAnneeConstruction(e.target.value)} placeholder="1990" />
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
