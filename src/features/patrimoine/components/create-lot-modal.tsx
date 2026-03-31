import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from 'src/components/ui/dialog'
import { Button } from 'src/components/ui/button'
import { Input } from 'src/components/ui/input'
import { Label } from 'src/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from 'src/components/ui/select'
import { Switch } from 'src/components/ui/switch'
import { Textarea } from 'src/components/ui/textarea'
import { RecordPicker } from 'src/components/shared/record-picker'
import { AddressAutocomplete } from 'src/components/shared/address-autocomplete'
import { useCreateLot, useCreateBatiment, useBatiments } from '../api'
import { toast } from 'sonner'
import { ArrowLeft, Plus, ChevronDown, ChevronRight } from 'lucide-react'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  preselectedBatimentId?: string
  preselectedTypeBien?: string
  onCreated?: (id: string) => void
  onCreateBatiment?: () => void
}

type Step = 'lot' | 'create-batiment'

export function CreateLotModal({ open, onOpenChange, preselectedBatimentId, preselectedTypeBien, onCreated }: Props) {
  const [step, setStep] = useState<Step>('lot')

  // Lot fields
  const [batimentId, setBatimentId] = useState(preselectedBatimentId || '')
  const [designation, setDesignation] = useState('')
  const [typeBien, setTypeBien] = useState(preselectedTypeBien || 'appartement')
  const [referenceInterne, setReferenceInterne] = useState('')
  const [etage, setEtage] = useState('')
  const [emplacementPalier, setEmplacementPalier] = useState('')
  const [surface, setSurface] = useState('')
  const [meuble, setMeuble] = useState(false)
  const [nbPieces, setNbPieces] = useState('')
  const [dpeClasse, setDpeClasse] = useState('')
  const [gesClasse, setGesClasse] = useState('')
  const [eauChaudeType, setEauChaudeType] = useState('')
  const [eauChaudeMode, setEauChaudeMode] = useState('')
  const [chauffageType, setChauffageType] = useState('')
  const [chauffageMode, setChauffageMode] = useState('')
  const [commentaire, setCommentaire] = useState('')
  const [energieOpen, setEnergieOpen] = useState(false)

  // Building creation fields (inline sub-form)
  const [batDesignation, setBatDesignation] = useState('')
  const [batType, setBatType] = useState('immeuble')
  const [batNumBatiment, setBatNumBatiment] = useState('')
  const [batNbEtages, setBatNbEtages] = useState('')
  const [batAnneeConstruction, setBatAnneeConstruction] = useState('')
  const [batCommentaire, setBatCommentaire] = useState('')
  const [batRue, setBatRue] = useState('')
  const [batCP, setBatCP] = useState('')
  const [batVille, setBatVille] = useState('')
  const [batComplement, setBatComplement] = useState('')
  const [batLat, setBatLat] = useState<number | undefined>()
  const [batLng, setBatLng] = useState<number | undefined>()

  const createLotMutation = useCreateLot()
  const createBatMutation = useCreateBatiment()
  const { data: batimentsData, refetch: refetchBatiments } = useBatiments()

  // Sync preselected when it changes
  useEffect(() => {
    if (preselectedBatimentId) setBatimentId(preselectedBatimentId)
  }, [preselectedBatimentId])

  useEffect(() => {
    if (preselectedTypeBien) setTypeBien(preselectedTypeBien)
  }, [preselectedTypeBien])

  const batimentOptions = (batimentsData?.data ?? []).map((b) => ({
    id: b.id,
    label: b.designation,
    sublabel: b.adresse_principale ? `${b.adresse_principale.rue}, ${b.adresse_principale.ville}` : undefined,
    meta: b.type,
  }))

  function resetLot() {
    if (!preselectedBatimentId) setBatimentId('')
    setDesignation('')
    setReferenceInterne('')
    setTypeBien(preselectedTypeBien || 'appartement')
    setEtage('')
    setEmplacementPalier('')
    setSurface('')
    setMeuble(false)
    setNbPieces('')
    setDpeClasse('')
    setGesClasse('')
    setEauChaudeType('')
    setEauChaudeMode('')
    setChauffageType('')
    setChauffageMode('')
    setCommentaire('')
    setStep('lot')
  }

  function resetBat() {
    setBatDesignation('')
    setBatType('immeuble')
    setBatNumBatiment('')
    setBatNbEtages('')
    setBatAnneeConstruction('')
    setBatCommentaire('')
    setBatRue('')
    setBatCP('')
    setBatVille('')
    setBatComplement('')
    setBatLat(undefined)
    setBatLng(undefined)
  }

  async function handleCreateBatiment(e: React.FormEvent) {
    e.preventDefault()
    try {
      const result = await createBatMutation.mutateAsync({
        designation: batDesignation,
        type: batType,
        num_batiment: batNumBatiment || undefined,
        nb_etages: batNbEtages ? parseInt(batNbEtages) : undefined,
        annee_construction: batAnneeConstruction ? parseInt(batAnneeConstruction) : undefined,
        commentaire: batCommentaire || undefined,
        adresses: [{ type: 'principale', rue: batRue, complement: batComplement || undefined, code_postal: batCP, ville: batVille, latitude: batLat, longitude: batLng }],
      })
      toast.success(`Batiment "${batDesignation}" cree`)
      const newId = result.id
      resetBat()
      // Refresh picker options first, then set the ID and switch step
      await refetchBatiments()
      setBatimentId(newId)
      setStep('lot')
    } catch (err: any) {
      toast.error(err.message || 'Erreur')
    }
  }

  async function handleCreateLot(e: React.FormEvent) {
    e.preventDefault()
    if (!batimentId) { toast.error('Selectionnez un batiment'); return }
    try {
      const result = await createLotMutation.mutateAsync({
        batiment_id: batimentId,
        designation,
        reference_interne: referenceInterne || undefined,
        type_bien: typeBien,
        etage: etage || undefined,
        emplacement_palier: emplacementPalier || undefined,
        surface: surface ? parseFloat(surface) : undefined,
        meuble,
        nb_pieces: nbPieces || undefined,
        dpe_classe: dpeClasse || undefined,
        ges_classe: gesClasse || undefined,
        eau_chaude_type: eauChaudeType || undefined,
        eau_chaude_mode: eauChaudeMode || undefined,
        chauffage_type: chauffageType || undefined,
        chauffage_mode: chauffageMode || undefined,
        commentaire: commentaire || undefined,
      })
      toast.success(`Lot "${designation}" cree`)
      resetLot()
      onOpenChange(false)
      onCreated?.(result.id)
    } catch (err: any) {
      toast.error(err.message || 'Erreur')
    }
  }

  const selectedBatiment = batimentsData?.data?.find(b => b.id === batimentId)

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) { resetLot(); resetBat() }; onOpenChange(v) }}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        {/* STEP: Create Lot */}
        {step === 'lot' && (
          <>
            <DialogHeader>
              <DialogTitle>Nouveau lot</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateLot} className="space-y-4">
              {/* Batiment picker */}
              {!preselectedBatimentId && (
                <div className="space-y-2">
                  <Label>Batiment *</Label>
                  <RecordPicker
                    options={batimentOptions}
                    value={batimentId}
                    onChange={(id) => setBatimentId(id || '')}
                    placeholder="Selectionner un batiment"
                    searchPlaceholder="Chercher par nom ou adresse..."
                    onCreateClick={() => setStep('create-batiment')}
                    createLabel="Creer un batiment"
                  />
                  {batimentId && selectedBatiment && (
                    <p className="text-[10px] text-emerald-600 flex items-center gap-1">
                      Selectionne : <span className="font-medium">{selectedBatiment.designation}</span>
                      — {selectedBatiment.adresse_principale?.rue}, {selectedBatiment.adresse_principale?.ville}
                    </p>
                  )}
                  {batimentId && !selectedBatiment && (
                    <p className="text-[10px] text-emerald-600">Batiment selectionne (chargement...)</p>
                  )}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Designation *</Label>
                  <Input value={designation} onChange={(e) => setDesignation(e.target.value)} placeholder="Appartement 201" required className="h-9" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Reference interne</Label>
                  <Input value={referenceInterne} onChange={(e) => setReferenceInterne(e.target.value)} placeholder="Bail, ref cadastrale..." className="h-9" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Type de bien *</Label>
                  <Select value={typeBien} onValueChange={setTypeBien}>
                    <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {['appartement','maison','studio','local_commercial','parking','cave','autre'].map(t =>
                        <SelectItem key={t} value={t} className="text-xs capitalize">{t.replace('_',' ')}</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Etage</Label>
                  <Input value={etage} onChange={(e) => setEtage(e.target.value)} placeholder="2, RDC, SS-1..." className="h-9" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Emplacement palier</Label>
                  <Input value={emplacementPalier} onChange={(e) => setEmplacementPalier(e.target.value)} placeholder="Porte gauche..." className="h-9" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Surface (m2)</Label>
                  <Input type="number" step="0.01" value={surface} onChange={(e) => setSurface(e.target.value)} placeholder="65" className="h-9" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Pieces</Label>
                  <Select value={nbPieces} onValueChange={setNbPieces}>
                    <SelectTrigger className="h-9"><SelectValue placeholder="—" /></SelectTrigger>
                    <SelectContent>
                      {['studio','T1','T2','T3','T4','T5','T6'].map(t => <SelectItem key={t} value={t} className="text-xs">{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">DPE</Label>
                  <Select value={dpeClasse} onValueChange={setDpeClasse}>
                    <SelectTrigger className="h-9"><SelectValue placeholder="—" /></SelectTrigger>
                    <SelectContent>{['A','B','C','D','E','F','G'].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">GES</Label>
                  <Select value={gesClasse} onValueChange={setGesClasse}>
                    <SelectTrigger className="h-9"><SelectValue placeholder="—" /></SelectTrigger>
                    <SelectContent>{['A','B','C','D','E','F','G'].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>

              {/* Energy section — collapsible */}
              <div className="border border-gray-100 rounded-lg overflow-hidden">
                <button
                  type="button"
                  onClick={() => setEnergieOpen(!energieOpen)}
                  className="w-full flex items-center justify-between px-3 py-2.5 bg-gray-50 hover:bg-gray-100/70 transition-colors"
                >
                  <span className="text-xs font-medium text-gray-500">Energie & Chauffage</span>
                  {energieOpen ? <ChevronDown className="h-3.5 w-3.5 text-gray-400" /> : <ChevronRight className="h-3.5 w-3.5 text-gray-400" />}
                </button>
                {energieOpen && <div className="grid grid-cols-2 gap-3 p-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Eau chaude type</Label>
                    <Select value={eauChaudeType} onValueChange={setEauChaudeType}>
                      <SelectTrigger className="h-9"><SelectValue placeholder="—" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="individuelle" className="text-xs">Individuelle</SelectItem>
                        <SelectItem value="collective" className="text-xs">Collective</SelectItem>
                        <SelectItem value="aucun" className="text-xs">Aucun</SelectItem>
                        <SelectItem value="autre" className="text-xs">Autre</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Eau chaude mode</Label>
                    <Select value={eauChaudeMode} onValueChange={setEauChaudeMode}>
                      <SelectTrigger className="h-9"><SelectValue placeholder="—" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gaz" className="text-xs">Gaz</SelectItem>
                        <SelectItem value="electrique" className="text-xs">Electrique</SelectItem>
                        <SelectItem value="autre" className="text-xs">Autre</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Chauffage type</Label>
                    <Select value={chauffageType} onValueChange={setChauffageType}>
                      <SelectTrigger className="h-9"><SelectValue placeholder="—" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="individuel" className="text-xs">Individuel</SelectItem>
                        <SelectItem value="collectif" className="text-xs">Collectif</SelectItem>
                        <SelectItem value="aucun" className="text-xs">Aucun</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Chauffage mode</Label>
                    <Select value={chauffageMode} onValueChange={setChauffageMode}>
                      <SelectTrigger className="h-9"><SelectValue placeholder="—" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gaz" className="text-xs">Gaz</SelectItem>
                        <SelectItem value="electrique" className="text-xs">Electrique</SelectItem>
                        <SelectItem value="fioul" className="text-xs">Fioul</SelectItem>
                        <SelectItem value="autre" className="text-xs">Autre</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>}
              </div>

              <div className="flex items-center gap-3">
                <Switch checked={meuble} onCheckedChange={setMeuble} />
                <Label className="text-xs">Meuble</Label>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Commentaire</Label>
                <Textarea value={commentaire} onChange={(e) => setCommentaire(e.target.value)} placeholder="Notes..." rows={2} />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)}>Annuler</Button>
                <Button type="submit" size="sm" disabled={createLotMutation.isPending} className="bg-primary text-primary-foreground hover:bg-primary/90">
                  {createLotMutation.isPending ? 'Creation...' : 'Creer le lot'}
                </Button>
              </div>
            </form>
          </>
        )}

        {/* STEP: Create Building (inline, stays in same modal) */}
        {step === 'create-batiment' && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <button onClick={() => setStep('lot')} className="p-1 rounded hover:bg-gray-100 transition-colors">
                  <ArrowLeft className="h-4 w-4" />
                </button>
                Nouveau batiment
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateBatiment} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 space-y-1.5">
                  <Label className="text-xs">Designation *</Label>
                  <Input value={batDesignation} onChange={(e) => setBatDesignation(e.target.value)} placeholder="Residence Les Lilas" required className="h-9" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Type *</Label>
                  <Select value={batType} onValueChange={setBatType}>
                    <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {['immeuble','maison','local_commercial','mixte','autre'].map(t =>
                        <SelectItem key={t} value={t} className="text-xs capitalize">{t.replace('_',' ')}</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">N batiment</Label>
                  <Input value={batNumBatiment} onChange={(e) => setBatNumBatiment(e.target.value)} placeholder="A, B, C..." className="h-9" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Nombre d'etages</Label>
                  <Input type="number" value={batNbEtages} onChange={(e) => setBatNbEtages(e.target.value)} placeholder="5" className="h-9" />
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-xs font-medium text-gray-500">Adresse principale</p>
                <AddressAutocomplete
                  onChange={(addr) => {
                    if (addr) { setBatRue(addr.rue); setBatCP(addr.code_postal); setBatVille(addr.ville); setBatLat(addr.latitude); setBatLng(addr.longitude) }
                  }}
                  placeholder="Rechercher une adresse..."
                />
                <div className="space-y-1.5">
                  <Label className="text-xs">Complement</Label>
                  <Input value={batComplement} onChange={(e) => setBatComplement(e.target.value)} placeholder="Bat. A, Entree 2" className="h-9" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Code postal *</Label>
                    <Input value={batCP} onChange={(e) => setBatCP(e.target.value)} placeholder="75011" required className="h-9" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Ville *</Label>
                    <Input value={batVille} onChange={(e) => setBatVille(e.target.value)} placeholder="Paris" required className="h-9" />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Annee construction</Label>
                <Input type="number" value={batAnneeConstruction} onChange={(e) => setBatAnneeConstruction(e.target.value)} placeholder="1990" className="h-9" />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Commentaire</Label>
                <Textarea value={batCommentaire} onChange={(e) => setBatCommentaire(e.target.value)} placeholder="Notes..." rows={2} />
              </div>

              <div className="flex justify-between pt-2">
                <Button type="button" variant="ghost" size="sm" onClick={() => setStep('lot')}>
                  <ArrowLeft className="h-3.5 w-3.5 mr-1" /> Retour au lot
                </Button>
                <Button type="submit" size="sm" disabled={createBatMutation.isPending} className="bg-primary text-primary-foreground hover:bg-primary/90">
                  {createBatMutation.isPending ? 'Creation...' : 'Creer et selectionner'}
                </Button>
              </div>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
