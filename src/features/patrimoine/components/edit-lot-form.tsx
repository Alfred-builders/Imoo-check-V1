import { useState } from 'react'
import { Button } from 'src/components/ui/button'
import { Input } from 'src/components/ui/input'
import { Label } from 'src/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from 'src/components/ui/select'
import { Switch } from 'src/components/ui/switch'
import { Textarea } from 'src/components/ui/textarea'
import type { LotDetail } from '../types'

interface Props {
  lot: LotDetail
  onSave: (data: Record<string, unknown>) => void
  onCancel: () => void
}

const NONE_VALUE = '__none__'

export function EditLotForm({ lot, onSave, onCancel }: Props) {
  const [designation, setDesignation] = useState(lot.designation)
  const [referenceInterne, setReferenceInterne] = useState(lot.reference_interne || '')
  const [typeBien, setTypeBien] = useState(lot.type_bien)
  const [etage, setEtage] = useState(lot.etage || '')
  const [emplacementPalier, setEmplacementPalier] = useState(lot.emplacement_palier || '')
  const [surface, setSurface] = useState(lot.surface?.toString() || '')
  const [nbPieces, setNbPieces] = useState(lot.nb_pieces || '')
  const [meuble, setMeuble] = useState(lot.meuble)
  const [dpeClasse, setDpeClasse] = useState(lot.dpe_classe || '')
  const [gesClasse, setGesClasse] = useState(lot.ges_classe || '')
  const [eauChaudeType, setEauChaudeType] = useState(lot.eau_chaude_type || '')
  const [eauChaudeMode, setEauChaudeMode] = useState(lot.eau_chaude_mode || '')
  const [chauffageType, setChauffageType] = useState(lot.chauffage_type || '')
  const [chauffageMode, setChauffageMode] = useState(lot.chauffage_mode || '')
  const [numCave, setNumCave] = useState(lot.num_cave || '')
  const [numParking, setNumParking] = useState(lot.num_parking || '')
  const [commentaire, setCommentaire] = useState(lot.commentaire || '')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSave({
      designation,
      reference_interne: referenceInterne || undefined,
      type_bien: typeBien,
      etage: etage || undefined,
      emplacement_palier: emplacementPalier || undefined,
      surface: surface ? parseFloat(surface) : undefined,
      nb_pieces: nbPieces || undefined,
      meuble,
      dpe_classe: dpeClasse || undefined,
      ges_classe: gesClasse || undefined,
      eau_chaude_type: eauChaudeType || undefined,
      eau_chaude_mode: eauChaudeMode || undefined,
      chauffage_type: chauffageType || undefined,
      chauffage_mode: chauffageMode || undefined,
      num_cave: numCave || undefined,
      num_parking: numParking || undefined,
      commentaire: commentaire || undefined,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2 space-y-2">
          <Label>Désignation *</Label>
          <Input value={designation} onChange={(e) => setDesignation(e.target.value)} placeholder="Appartement 201" required />
        </div>
        <div className="space-y-2">
          <Label>Référence interne</Label>
          <Input value={referenceInterne} onChange={(e) => setReferenceInterne(e.target.value)} placeholder="REF-001" />
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
          <Label>Emplacement palier</Label>
          <Input value={emplacementPalier} onChange={(e) => setEmplacementPalier(e.target.value)} placeholder="Gauche" />
        </div>
        <div className="space-y-2">
          <Label>Surface (m²)</Label>
          <Input type="number" step="0.01" value={surface} onChange={(e) => setSurface(e.target.value)} placeholder="65" />
        </div>
        <div className="space-y-2">
          <Label>Nombre de pièces</Label>
          <Select value={nbPieces || NONE_VALUE} onValueChange={(v) => setNbPieces(v === NONE_VALUE ? '' : v)}>
            <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
            <SelectContent>
              <SelectItem value={NONE_VALUE}>—</SelectItem>
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

      {/* Énergie */}
      <div className="border-t border-border pt-4">
        <p className="text-sm font-medium mb-3">Énergie</p>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>DPE</Label>
            <Select value={dpeClasse || NONE_VALUE} onValueChange={(v) => setDpeClasse(v === NONE_VALUE ? '' : v)}>
              <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE_VALUE}>—</SelectItem>
                {['A','B','C','D','E','F','G'].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>GES</Label>
            <Select value={gesClasse || NONE_VALUE} onValueChange={(v) => setGesClasse(v === NONE_VALUE ? '' : v)}>
              <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE_VALUE}>—</SelectItem>
                {['A','B','C','D','E','F','G'].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Eau chaude — type</Label>
            <Select value={eauChaudeType || NONE_VALUE} onValueChange={(v) => setEauChaudeType(v === NONE_VALUE ? '' : v)}>
              <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE_VALUE}>—</SelectItem>
                <SelectItem value="individuelle">Individuelle</SelectItem>
                <SelectItem value="collective">Collective</SelectItem>
                <SelectItem value="aucun">Aucun</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Eau chaude — mode</Label>
            <Select value={eauChaudeMode || NONE_VALUE} onValueChange={(v) => setEauChaudeMode(v === NONE_VALUE ? '' : v)}>
              <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE_VALUE}>—</SelectItem>
                <SelectItem value="gaz">Gaz</SelectItem>
                <SelectItem value="electrique">Électrique</SelectItem>
                <SelectItem value="fioul">Fioul</SelectItem>
                <SelectItem value="autre">Autre</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Chauffage — type</Label>
            <Select value={chauffageType || NONE_VALUE} onValueChange={(v) => setChauffageType(v === NONE_VALUE ? '' : v)}>
              <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE_VALUE}>—</SelectItem>
                <SelectItem value="individuel">Individuel</SelectItem>
                <SelectItem value="collectif">Collectif</SelectItem>
                <SelectItem value="aucun">Aucun</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Chauffage — mode</Label>
            <Select value={chauffageMode || NONE_VALUE} onValueChange={(v) => setChauffageMode(v === NONE_VALUE ? '' : v)}>
              <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
              <SelectContent>
                <SelectItem value={NONE_VALUE}>—</SelectItem>
                <SelectItem value="gaz">Gaz</SelectItem>
                <SelectItem value="electrique">Électrique</SelectItem>
                <SelectItem value="fioul">Fioul</SelectItem>
                <SelectItem value="autre">Autre</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Annexes */}
      <div className="border-t border-border pt-4">
        <p className="text-sm font-medium mb-3">Annexes</p>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>N° cave</Label>
            <Input value={numCave} onChange={(e) => setNumCave(e.target.value)} placeholder="C12" />
          </div>
          <div className="space-y-2">
            <Label>N° parking</Label>
            <Input value={numParking} onChange={(e) => setNumParking(e.target.value)} placeholder="P05" />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Commentaire</Label>
        <Textarea value={commentaire} onChange={(e) => setCommentaire(e.target.value)} placeholder="Notes..." rows={3} />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>Annuler</Button>
        <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90">Enregistrer</Button>
      </div>
    </form>
  )
}
