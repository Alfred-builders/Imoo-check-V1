import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Archive, ArchiveRestore, User, Building2, Home, Ruler, BedDouble, Zap, ChevronRight, Pencil, AlertTriangle, Thermometer, Car, Warehouse } from 'lucide-react'
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

function InfoItem({ label, value, className }: { label: string; value: React.ReactNode; className?: string }) {
  return (
    <div className={`flex items-center justify-between py-2 ${className ?? ''}`}>
      <span className="text-xs text-gray-400">{label}</span>
      <span className="text-sm font-medium text-gray-800">{value || '—'}</span>
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
      <div className="p-6 space-y-5 max-w-6xl mx-auto">
        <Skeleton className="h-10 w-72" />
        <Skeleton className="h-16 w-full rounded-xl" />
        <div className="grid grid-cols-3 gap-4"><Skeleton className="h-64 rounded-xl" /><Skeleton className="h-64 rounded-xl" /><Skeleton className="h-64 rounded-xl" /></div>
      </div>
    )
  }

  if (!lot) return <div className="p-6"><p className="text-gray-400">Lot introuvable</p></div>

  const proprietaires = lot.proprietaires ?? []
  const mandataire = lot.mandataire

  async function handleArchive() {
    if (!id) return
    try {
      await updateMutation.mutateAsync({ id, est_archive: !lot!.est_archive })
      toast.success(lot!.est_archive ? 'Lot restaure' : 'Lot archive')
    } catch (err: any) {
      toast.error(err.message || 'Erreur')
    }
  }

  return (
    <div className="p-6 space-y-5 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-start gap-3">
        <Button variant="ghost" size="icon" className="mt-0.5 shrink-0 h-8 w-8" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-display font-bold text-gray-900">{lot.designation}</h1>
            <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-[10px] font-medium">
              {typeBienLabels[lot.type_bien] || lot.type_bien}
            </Badge>
            {lot.meuble && <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]">Meuble</Badge>}
            {lot.est_archive && <Badge variant="destructive" className="text-[10px]">Archive</Badge>}
          </div>
          {lot.batiment && (
            <button
              className="text-xs text-gray-400 mt-0.5 flex items-center gap-1 hover:text-amber-600 transition-colors group"
              onClick={() => navigate(`/app/patrimoine/batiments/${lot.batiment!.id}`)}
            >
              <Building2 className="h-3 w-3" />
              {lot.batiment.designation}
              <ChevronRight className="h-2.5 w-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          )}
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {!lot.est_archive && (
            <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => setEditing(!editing)}>
              <Pencil className="h-3 w-3 mr-1" /> {editing ? 'Annuler' : 'Modifier'}
            </Button>
          )}
          <Button variant="outline" size="sm" className="h-8 text-xs" onClick={handleArchive}>
            {lot.est_archive ? <ArchiveRestore className="h-3 w-3 mr-1" /> : <Archive className="h-3 w-3 mr-1" />}
            {lot.est_archive ? 'Restaurer' : 'Archiver'}
          </Button>
        </div>
      </div>

      {lot.est_archive && (
        <div className="flex items-center gap-2 px-3 py-2.5 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-xs">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
          Ce lot est archive. Les modifications sont desactivees.
        </div>
      )}

      {/* Quick stats band */}
      <div className="flex items-center gap-0 bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden divide-x divide-gray-100">
        {[
          { icon: Home, label: 'Etage', value: lot.etage || 'RDC', bg: 'bg-blue-500' },
          { icon: Building2, label: 'Type', value: typeBienLabels[lot.type_bien], bg: 'bg-amber-500' },
          { icon: Ruler, label: 'Surface', value: lot.surface ? `${lot.surface} m²` : '—', bg: 'bg-emerald-500' },
          { icon: BedDouble, label: 'Pieces', value: lot.nb_pieces || '—', bg: 'bg-violet-500' },
          { icon: Zap, label: 'DPE', value: lot.dpe_classe || '—', bg: 'bg-orange-500' },
          { icon: Thermometer, label: 'GES', value: lot.ges_classe || '—', bg: 'bg-rose-500' },
        ].map(({ icon: Icon, label, value, bg }) => (
          <div key={label} className="flex-1 flex items-center gap-2.5 px-4 py-3">
            <div className={`h-7 w-7 rounded-md flex items-center justify-center shrink-0 ${bg}`}>
              <Icon className="h-3.5 w-3.5 text-white" />
            </div>
            <div>
              <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider leading-none">{label}</p>
              <p className="text-sm font-bold text-gray-900 leading-tight">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Edit form */}
      {editing && (
        <Card className="shadow-sm border-amber-200 bg-amber-50/30">
          <CardContent className="pt-5">
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

      {/* Content */}
      {!editing && (
        <Tabs defaultValue="infos" className="w-full">
          <TabsList className="bg-gray-100 p-0.5 h-9">
            <TabsTrigger value="infos" className="text-xs h-8 px-4">Informations</TabsTrigger>
            <TabsTrigger value="tiers" className="text-xs h-8 px-4">Tiers ({proprietaires.length + (mandataire ? 1 : 0)})</TabsTrigger>
            <TabsTrigger value="missions" className="text-xs h-8 px-4">Missions</TabsTrigger>
          </TabsList>

          <TabsContent value="infos" className="mt-4">
            <div className="grid grid-cols-3 gap-4">
              {/* General */}
              <div className="col-span-2 bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Caracteristiques</h2>
                <div className="grid grid-cols-2 gap-x-8 divide-y divide-gray-50">
                  <InfoItem label="Designation" value={lot.designation} />
                  <InfoItem label="Reference" value={lot.reference_interne} />
                  <InfoItem label="Type" value={typeBienLabels[lot.type_bien]} />
                  <InfoItem label="Etage" value={lot.etage} />
                  <InfoItem label="Emplacement" value={lot.emplacement_palier} />
                  <InfoItem label="Surface" value={lot.surface ? `${lot.surface} m²` : null} />
                  <InfoItem label="Pieces" value={lot.nb_pieces} />
                  <InfoItem label="Meuble" value={lot.meuble ? <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]">Oui</Badge> : 'Non'} />
                </div>
                {lot.commentaire && (
                  <>
                    <Separator className="my-3" />
                    <p className="text-xs text-gray-400 mb-1.5">Commentaire</p>
                    <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3 border border-gray-100 leading-relaxed">{lot.commentaire}</p>
                  </>
                )}
              </div>

              {/* Energie + Annexes */}
              <div className="space-y-4">
                <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                  <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Energie</h2>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 p-2.5 rounded-lg bg-gray-50 border border-gray-100">
                      <Zap className="h-4 w-4 text-orange-500" />
                      <span className="text-xs text-gray-500 flex-1">DPE</span>
                      <span className="text-sm font-bold text-gray-900">{lot.dpe_classe || '—'}</span>
                    </div>
                    <div className="flex items-center gap-3 p-2.5 rounded-lg bg-gray-50 border border-gray-100">
                      <Thermometer className="h-4 w-4 text-rose-500" />
                      <span className="text-xs text-gray-500 flex-1">GES</span>
                      <span className="text-sm font-bold text-gray-900">{lot.ges_classe || '—'}</span>
                    </div>
                  </div>
                </div>
                <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                  <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Annexes</h2>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 p-2.5 rounded-lg bg-gray-50 border border-gray-100">
                      <Warehouse className="h-4 w-4 text-gray-500" />
                      <span className="text-xs text-gray-500 flex-1">Cave</span>
                      <span className="text-sm font-medium text-gray-900">{lot.num_cave || '—'}</span>
                    </div>
                    <div className="flex items-center gap-3 p-2.5 rounded-lg bg-gray-50 border border-gray-100">
                      <Car className="h-4 w-4 text-gray-500" />
                      <span className="text-xs text-gray-500 flex-1">Parking</span>
                      <span className="text-sm font-medium text-gray-900">{lot.num_parking || '—'}</span>
                    </div>
                  </div>
                </div>
                <p className="text-[10px] text-gray-300 px-1">
                  Cree {formatDate(lot.created_at)} — Modifie {formatDate(lot.updated_at)}
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="tiers" className="mt-4">
            <div className="grid grid-cols-2 gap-4">
              {/* Proprietaires */}
              <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                  Proprietaire{proprietaires.length > 1 ? 's' : ''}
                </h2>
                {proprietaires.length > 0 ? (
                  <div className="space-y-2">
                    {proprietaires.map((p) => (
                      <div key={p.id} className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:border-amber-200 transition-colors">
                        <div className="h-9 w-9 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                          <span className="text-xs font-bold text-amber-700">
                            {(p.prenom?.[0] || p.nom[0]).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {p.prenom ? `${p.prenom} ${p.nom}` : p.raison_sociale || p.nom}
                          </p>
                          <p className="text-xs text-gray-400 truncate">{p.email || p.tel || '—'}</p>
                        </div>
                        {p.est_principal && <Badge className="bg-amber-50 text-amber-700 border-amber-200 text-[9px] shrink-0">Principal</Badge>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-2">
                      <User className="h-4 w-4 text-gray-400" />
                    </div>
                    <p className="text-xs text-gray-400">Aucun proprietaire lie</p>
                  </div>
                )}
              </div>

              {/* Mandataire */}
              <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Mandataire</h2>
                {mandataire ? (
                  <div className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:border-blue-200 transition-colors">
                    <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                      <span className="text-xs font-bold text-blue-700">
                        {(mandataire.nom[0]).toUpperCase()}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {mandataire.prenom ? `${mandataire.prenom} ${mandataire.nom}` : mandataire.raison_sociale || mandataire.nom}
                      </p>
                      <p className="text-xs text-gray-400 truncate">{mandataire.email || '—'}</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-2">
                      <Building2 className="h-4 w-4 text-gray-400" />
                    </div>
                    <p className="text-xs text-gray-400">Aucun mandataire</p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="missions" className="mt-4">
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
              <div className="py-10 text-center">
                <div className="h-12 w-12 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-3">
                  <Building2 className="h-5 w-5 text-gray-400" />
                </div>
                <p className="text-sm font-medium text-gray-500">Aucune mission pour ce lot</p>
                <p className="text-xs text-gray-400 mt-1">Sprint 3</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}
