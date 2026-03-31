import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from 'src/components/ui/dialog'
import { Button } from 'src/components/ui/button'
import { Input } from 'src/components/ui/input'
import { Label } from 'src/components/ui/label'
import { Textarea } from 'src/components/ui/textarea'
import { Switch } from 'src/components/ui/switch'
import { useCreateTiers } from '../api'
import { toast } from 'sonner'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated?: (id: string) => void
}

export function CreateTiersModal({ open, onOpenChange, onCreated }: Props) {
  const [typePersonne, setTypePersonne] = useState<'physique' | 'morale'>('physique')
  const [nom, setNom] = useState('')
  const [prenom, setPrenom] = useState('')
  const [raisonSociale, setRaisonSociale] = useState('')
  const [siren, setSiren] = useState('')
  const [email, setEmail] = useState('')
  const [tel, setTel] = useState('')
  const [adresse, setAdresse] = useState('')
  const [codePostal, setCodePostal] = useState('')
  const [ville, setVille] = useState('')
  const [notes, setNotes] = useState('')
  const createMutation = useCreateTiers()

  function reset() {
    setTypePersonne('physique')
    setNom(''); setPrenom(''); setRaisonSociale(''); setSiren('')
    setEmail(''); setTel(''); setAdresse(''); setCodePostal(''); setVille(''); setNotes('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      const result = await createMutation.mutateAsync({
        type_personne: typePersonne,
        nom: typePersonne === 'morale' ? raisonSociale : nom,
        prenom: typePersonne === 'physique' ? prenom : undefined,
        raison_sociale: typePersonne === 'morale' ? raisonSociale : undefined,
        siren: typePersonne === 'morale' ? siren || undefined : undefined,
        email: email || undefined,
        tel: tel || undefined,
        adresse: adresse || undefined,
        code_postal: codePostal || undefined,
        ville: ville || undefined,
        notes: notes || undefined,
      })
      if (result.warning) toast.warning(result.warning)
      toast.success(`Tiers "${typePersonne === 'morale' ? raisonSociale : `${prenom} ${nom}`}" cree`)
      reset()
      onOpenChange(false)
      onCreated?.(result.id)
    } catch (err: any) {
      toast.error(err.message || 'Erreur')
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) reset(); onOpenChange(v) }}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nouveau tiers</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Type toggle */}
          <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg border border-gray-100">
            <span className="text-xs text-gray-500">Type :</span>
            <div className="flex items-center gap-2 bg-white rounded-md border border-gray-200 p-0.5">
              <button type="button" onClick={() => setTypePersonne('physique')}
                className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${typePersonne === 'physique' ? 'bg-amber-600 text-white' : 'text-gray-500 hover:text-gray-700'}`}>
                Personne physique
              </button>
              <button type="button" onClick={() => setTypePersonne('morale')}
                className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${typePersonne === 'morale' ? 'bg-amber-600 text-white' : 'text-gray-500 hover:text-gray-700'}`}>
                Personne morale
              </button>
            </div>
          </div>

          {/* Adaptive fields */}
          <div className="grid grid-cols-2 gap-3">
            {typePersonne === 'physique' ? (
              <>
                <div className="space-y-1.5">
                  <Label className="text-xs">Nom *</Label>
                  <Input value={nom} onChange={(e) => setNom(e.target.value)} placeholder="Dupont" required className="h-9" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Prenom *</Label>
                  <Input value={prenom} onChange={(e) => setPrenom(e.target.value)} placeholder="Jean" required className="h-9" />
                </div>
              </>
            ) : (
              <>
                <div className="col-span-2 space-y-1.5">
                  <Label className="text-xs">Raison sociale *</Label>
                  <Input value={raisonSociale} onChange={(e) => setRaisonSociale(e.target.value)} placeholder="SCI Les Hetres" required className="h-9" />
                </div>
                <div className="col-span-2 space-y-1.5">
                  <Label className="text-xs">SIREN</Label>
                  <Input value={siren} onChange={(e) => setSiren(e.target.value)} placeholder="123456789" className="h-9" />
                </div>
              </>
            )}
            <div className="space-y-1.5">
              <Label className="text-xs">Email</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@exemple.com" className="h-9" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Telephone</Label>
              <Input value={tel} onChange={(e) => setTel(e.target.value)} placeholder="06 12 34 56 78" className="h-9" />
            </div>
          </div>

          {/* Address */}
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Adresse</Label>
              <Input value={adresse} onChange={(e) => setAdresse(e.target.value)} placeholder="12 Rue de la Paix" className="h-9" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Code postal</Label>
                <Input value={codePostal} onChange={(e) => setCodePostal(e.target.value)} placeholder="75001" className="h-9" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Ville</Label>
                <Input value={ville} onChange={(e) => setVille(e.target.value)} placeholder="Paris" className="h-9" />
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Notes</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notes..." rows={2} />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)}>Annuler</Button>
            <Button type="submit" size="sm" disabled={createMutation.isPending} className="bg-amber-600 hover:bg-amber-700 text-white">
              {createMutation.isPending ? 'Creation...' : 'Creer'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
