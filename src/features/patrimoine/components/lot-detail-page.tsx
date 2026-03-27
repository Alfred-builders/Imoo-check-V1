import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Archive, ArchiveRestore, User, Building2, Home, Ruler, BedDouble, Zap, ChevronRight, Pencil, AlertTriangle } from 'lucide-react'
import { Button } from 'src/components/ui/button'
import { Badge } from 'src/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from 'src/components/ui/card'
import { Skeleton } from 'src/components/ui/skeleton'
import { Separator } from 'src/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from 'src/components/ui/tabs'
import { useLotDetail, useUpdateLot } from '../api'
import { EditLotForm } from './edit-lot-form'
import { formatDate } from '../../../lib/formatters'
import { toast } from 'sonner'

const typeBienLabels: Record<string, string> = {
  appartement: 'Appartement', maison: 'Maison', studio: 'Studio',
  local_commercial: 'Local commercial', parking: 'Parking', cave: 'Cave', autre: 'Autre',
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-2">
      <dt className="text-sm text-gray-500">{label}</dt>
      <dd className="text-sm font-medium text-gray-900">{value || '—'}</dd>
    </div>
  )
}

export function LotDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [editing, setEditing] = useState(false)
  const { data: lot, isLoading } = useLotDetail(id)
  const updateMutation = useUpdateLot()

  if (isLoading) {
    return (
      <div className="p-6 space-y-6 max-w-6xl mx-auto">
        <Skeleton className="h-10 w-72" />
        <Skeleton className="h-14 w-full rounded-xl" />
        <div className="grid grid-cols-5 gap-5"><Skeleton className="col-span-3 h-72 rounded-xl" /><Skeleton className="col-span-2 h-72 rounded-xl" /></div>
      </div>
    )
  }

  if (!lot) return <div className="p-6"><p className="text-gray-400">Lot introuvable</p></div>

  const proprietaires = lot.proprietaires ?? []
  const mandataire = lot.mandataire

  async function handleArchive() {
    if (!id) return
    try { await updateMutation.mutateAsync({ id, est_archive: !lot!.est_archive }) } catch {}
  }

  const propLabel = proprietaires.length > 0
    ? proprietaires.map(p => p.prenom ? `${p.prenom} ${p.nom}` : p.raison_sociale || p.nom).join(', ')
    : null

  const quickStats = [
    { icon: Home, text: lot.etage ? `Etage ${lot.etage}` : 'RDC', show: true },
    { icon: Ruler, text: `${lot.surface} m²`, show: !!lot.surface },
    { icon: BedDouble, text: lot.nb_pieces || '', show: !!lot.nb_pieces },
    { icon: Building2, text: typeBienLabels[lot.type_bien] || lot.type_bien, show: true },
    { icon: Zap, text: `DPE ${lot.dpe_classe}`, show: !!lot.dpe_classe },
    { icon: User, text: propLabel || '', show: !!propLabel },
  ].filter(s => s.show) as { icon: typeof Home; text: string; show: boolean }[]

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Button variant="ghost" size="icon" className="mt-0.5 shrink-0 h-9 w-9" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-2xl font-display font-bold text-gray-900">{lot.designation}</h1>
            <Badge variant="outline" className="font-medium text-xs">{typeBienLabels[lot.type_bien] || lot.type_bien}</Badge>
            {lot.meuble && <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs">Meuble</Badge>}
            {lot.est_archive && <Badge variant="destructive" className="text-xs">Archive</Badge>}
          </div>
          {lot.batiment && (
            <button
              className="text-[13px] text-gray-500 mt-1 flex items-center gap-1 hover:text-amber-600 transition-colors group"
              onClick={() => navigate(`/app/patrimoine/batiments/${lot.batiment!.id}`)}
            >
              <Building2 className="h-3.5 w-3.5" />
              {lot.batiment.designation}
              <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {!lot.est_archive && (
            <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
              <Pencil className="h-3.5 w-3.5 mr-1.5" /> Modifier
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={handleArchive}>
            {lot.est_archive ? <ArchiveRestore className="h-3.5 w-3.5 mr-1.5" /> : <Archive className="h-3.5 w-3.5 mr-1.5" />}
            {lot.est_archive ? 'Restaurer' : 'Archiver'}
          </Button>
        </div>
      </div>

      {/* Archive banner */}
      {lot.est_archive && (
        <div className="flex items-center gap-2 px-4 py-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          Ce lot est archive. Les modifications et la creation de missions sont desactivees.
        </div>
      )}

      {/* Quick stats bar */}
      <div className="grid grid-cols-6 gap-3">
        {[
          { icon: Home, label: 'Etage', value: lot.etage || 'RDC', bg: 'bg-blue-50', color: 'text-blue-600' },
          { icon: Building2, label: 'Type', value: typeBienLabels[lot.type_bien] || lot.type_bien, bg: 'bg-amber-50', color: 'text-amber-600' },
          { icon: Ruler, label: 'Surface', value: lot.surface ? `${lot.surface} m²` : '—', bg: 'bg-emerald-50', color: 'text-emerald-600' },
          { icon: BedDouble, label: 'Pieces', value: lot.nb_pieces || '—', bg: 'bg-violet-50', color: 'text-violet-600' },
          { icon: Zap, label: 'DPE', value: lot.dpe_classe || '—', bg: 'bg-orange-50', color: 'text-orange-600' },
          { icon: User, label: 'Proprietaire', value: propLabel || '—', bg: 'bg-rose-50', color: 'text-rose-600' },
        ].map(({ icon: Icon, label, value, bg, color }) => (
          <Card key={label} className="shadow-sm border-gray-200">
            <CardContent className="p-3">
              <div className="flex items-center gap-2 mb-1.5">
                <div className={`h-6 w-6 rounded flex items-center justify-center ${bg}`}>
                  <Icon className={`h-3.5 w-3.5 ${color}`} />
                </div>
                <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">{label}</span>
              </div>
              <p className="text-sm font-semibold text-gray-900 truncate">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit mode */}
      {editing && (
        <Card className="shadow-sm border-gray-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-gray-700">Modifier le lot</CardTitle>
          </CardHeader>
          <CardContent>
            <EditLotForm
              lot={lot}
              onSave={async (data) => {
                await updateMutation.mutateAsync({ id: lot.id, ...data })
                toast.success('Lot mis a jour')
                setEditing(false)
              }}
              onCancel={() => setEditing(false)}
            />
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      {!editing && <Tabs defaultValue="infos" className="w-full">
        <TabsList className="bg-gray-100/80 p-1">
          <TabsTrigger value="infos" className="text-xs">Informations</TabsTrigger>
          <TabsTrigger value="tiers" className="text-xs">Tiers ({proprietaires.length + (mandataire ? 1 : 0)})</TabsTrigger>
          <TabsTrigger value="missions" className="text-xs">Missions</TabsTrigger>
        </TabsList>

        {/* Info tab */}
        <TabsContent value="infos" className="mt-4">
          <div className="grid grid-cols-2 gap-5">
            <Card className="shadow-sm border-gray-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-gray-700">Informations generales</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="divide-y divide-gray-50">
                  <InfoRow label="Designation" value={lot.designation} />
                  <InfoRow label="Reference" value={lot.reference_interne} />
                  <InfoRow label="Type de bien" value={typeBienLabels[lot.type_bien]} />
                  <InfoRow label="Etage" value={lot.etage} />
                  <InfoRow label="Surface" value={lot.surface ? `${lot.surface} m²` : null} />
                  <InfoRow label="Nb pieces" value={lot.nb_pieces} />
                  <InfoRow label="Meuble" value={lot.meuble ? 'Oui' : 'Non'} />
                  <InfoRow label="Emplacement" value={lot.emplacement_palier} />
                </dl>
              </CardContent>
            </Card>

            <Card className="shadow-sm border-gray-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-gray-700">Energie & Annexes</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="divide-y divide-gray-50">
                  <InfoRow label="DPE" value={lot.dpe_classe ? <Badge variant="outline" className="text-xs font-bold">{lot.dpe_classe}</Badge> : null} />
                  <InfoRow label="GES" value={lot.ges_classe ? <Badge variant="outline" className="text-xs font-bold">{lot.ges_classe}</Badge> : null} />
                  <InfoRow label="N cave" value={lot.num_cave} />
                  <InfoRow label="N parking" value={lot.num_parking} />
                </dl>
                {lot.commentaire && (
                  <>
                    <Separator className="my-3" />
                    <div>
                      <p className="text-xs font-medium text-gray-500 mb-1.5">Commentaire</p>
                      <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 rounded-lg p-3 border border-gray-100">{lot.commentaire}</p>
                    </div>
                  </>
                )}
                <Separator className="my-3" />
                <div className="text-xs text-gray-400">
                  Cree le {formatDate(lot.created_at)} — Modifie le {formatDate(lot.updated_at)}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tiers tab */}
        <TabsContent value="tiers" className="mt-4">
          <div className="grid grid-cols-2 gap-5">
            {/* Proprietaires */}
            <Card className="shadow-sm border-gray-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-gray-700">
                  Proprietaire{proprietaires.length > 1 ? 's' : ''}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {proprietaires.length > 0 ? (
                  <div className="space-y-2">
                    {proprietaires.map((p) => (
                      <div key={p.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50/80 border border-gray-100 hover:border-amber-200 transition-colors">
                        <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                          <User className="h-4.5 w-4.5 text-amber-700" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">
                            {p.prenom ? `${p.prenom} ${p.nom}` : p.raison_sociale || p.nom}
                          </p>
                          {p.email && <p className="text-xs text-gray-500 truncate">{p.email}</p>}
                          {p.tel && <p className="text-xs text-gray-400">{p.tel}</p>}
                        </div>
                        {p.est_principal && (
                          <Badge className="bg-amber-50 text-amber-700 border-amber-200 text-[10px] shrink-0">Principal</Badge>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <p className="text-sm font-medium text-gray-500">Aucun proprietaire lie</p>
                    <p className="text-xs text-gray-400 mt-1">Ajoutez un proprietaire depuis l'onglet Tiers</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Mandataire */}
            <Card className="shadow-sm border-gray-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-gray-700">Mandataire</CardTitle>
              </CardHeader>
              <CardContent>
                {mandataire ? (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50/80 border border-gray-100 hover:border-blue-200 transition-colors">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                      <Building2 className="h-4.5 w-4.5 text-blue-700" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900">
                        {mandataire.prenom ? `${mandataire.prenom} ${mandataire.nom}` : mandataire.raison_sociale || mandataire.nom}
                      </p>
                      {mandataire.email && <p className="text-xs text-gray-500 truncate">{mandataire.email}</p>}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                      <Building2 className="h-5 w-5 text-gray-400" />
                    </div>
                    <p className="text-sm font-medium text-gray-500">Aucun mandataire</p>
                    <p className="text-xs text-gray-400 mt-1">Associez un mandataire de gestion</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Missions tab */}
        <TabsContent value="missions" className="mt-4">
          <Card className="shadow-sm border-gray-200">
            <CardContent className="py-12">
              <div className="text-center">
                <div className="h-14 w-14 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
                  <Building2 className="h-6 w-6 text-gray-400" />
                </div>
                <p className="text-sm font-medium text-gray-500">Aucune mission pour ce lot</p>
                <p className="text-xs text-gray-400 mt-1">Les missions seront disponibles au Sprint 3</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>}
    </div>
  )
}
