import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, MapPin, Archive, ArchiveRestore, Plus, Building2, Layers, Calendar, Hash, ExternalLink, Pencil, AlertTriangle, ExternalLinkIcon } from 'lucide-react'
import { Button } from 'src/components/ui/button'
import { Badge } from 'src/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from 'src/components/ui/card'
import { Skeleton } from 'src/components/ui/skeleton'
import { Separator } from 'src/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from 'src/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from 'src/components/ui/table'
import { useBatimentDetail, useBatimentLots, useUpdateBatiment } from '../api'
import { CreateLotModal } from './create-lot-modal'
import { EditBuildingForm } from './edit-building-form'
import { formatDate } from '../../../lib/formatters'
import { toast } from 'sonner'

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

  if (isLoading) {
    return (
      <div className="p-6 space-y-6 max-w-6xl mx-auto">
        <Skeleton className="h-10 w-72" />
        <div className="grid grid-cols-4 gap-4">{[1,2,3,4].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}</div>
        <Skeleton className="h-80 rounded-xl" />
      </div>
    )
  }

  if (!batiment) return <div className="p-6"><p className="text-gray-400">Batiment introuvable</p></div>

  const adresses = batiment.adresses ?? []
  const principale = adresses.find(a => a.type === 'principale')

  async function handleArchive() {
    if (!id) return
    await updateMutation.mutateAsync({ id, est_archive: !batiment!.est_archive })
  }

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Button variant="ghost" size="icon" className="mt-0.5 shrink-0 h-9 w-9" onClick={() => navigate('/app/patrimoine')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-2xl font-display font-bold text-gray-900">{batiment.designation}</h1>
            <Badge variant="outline" className="font-medium text-xs">{typeLabels[batiment.type] || batiment.type}</Badge>
            {batiment.est_archive && <Badge variant="destructive" className="text-xs">Archive</Badge>}
          </div>
          {principale && (
            <p className="text-[13px] text-gray-500 mt-1 flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              {principale.rue}, {principale.code_postal} {principale.ville}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {!batiment.est_archive && (
            <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
              <Pencil className="h-3.5 w-3.5 mr-1.5" /> Modifier
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={handleArchive}>
            {batiment.est_archive ? <ArchiveRestore className="h-3.5 w-3.5 mr-1.5" /> : <Archive className="h-3.5 w-3.5 mr-1.5" />}
            {batiment.est_archive ? 'Restaurer' : 'Archiver'}
          </Button>
        </div>
      </div>

      {/* Archive banner */}
      {batiment.est_archive && (
        <div className="flex items-center gap-2 px-4 py-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          Ce batiment est archive. Les modifications sont desactivees.
        </div>
      )}

      {/* Edit mode */}
      {editing && (
        <Card className="shadow-sm border-gray-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-gray-700">Modifier le batiment</CardTitle>
          </CardHeader>
          <CardContent>
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

      {/* KPI row */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { icon: Layers, label: 'Lots', value: batiment.nb_lots, iconBg: 'bg-blue-50', iconColor: 'text-blue-600' },
          { icon: Building2, label: 'Type', value: typeLabels[batiment.type], iconBg: 'bg-amber-50', iconColor: 'text-amber-600' },
          { icon: Hash, label: 'Etages', value: batiment.nb_etages ?? '—', iconBg: 'bg-emerald-50', iconColor: 'text-emerald-600' },
          { icon: Calendar, label: 'Construction', value: batiment.annee_construction ?? '—', iconBg: 'bg-violet-50', iconColor: 'text-violet-600' },
        ].map(({ icon: Icon, label, value, iconBg, iconColor }) => (
          <Card key={label} className="shadow-sm border-gray-200">
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${iconBg}`}>
                <Icon className={`h-5 w-5 ${iconColor}`} />
              </div>
              <div>
                <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">{label}</p>
                <p className="text-lg font-bold text-gray-900 -mt-0.5">{value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="bg-gray-100/80 p-1">
          <TabsTrigger value="overview" className="text-xs">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="lots" className="text-xs">Lots ({lots?.length ?? 0})</TabsTrigger>
        </TabsList>

        {/* Overview tab */}
        <TabsContent value="overview" className="mt-4">
          <div className="grid grid-cols-5 gap-5">
            {/* Addresses */}
            <Card className="col-span-3 shadow-sm border-gray-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-gray-700">Adresses</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2.5">
                {adresses.map((a) => (
                  <div key={a.id} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50/80 border border-gray-100">
                    <div className="h-8 w-8 rounded-md bg-blue-50 flex items-center justify-center shrink-0 mt-0.5">
                      <MapPin className="h-4 w-4 text-blue-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{a.rue}</p>
                      {a.complement && <p className="text-xs text-gray-500">{a.complement}</p>}
                      <p className="text-xs text-gray-400">{a.code_postal} {a.ville}</p>
                      {a.latitude && a.longitude ? (
                        <a
                          href={`https://maps.google.com/?q=${a.latitude},${a.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] text-blue-500 hover:text-blue-700 flex items-center gap-0.5 mt-1"
                        >
                          <ExternalLinkIcon className="h-3 w-3" /> Voir sur Google Maps
                        </a>
                      ) : (
                        <p className="text-[10px] text-gray-300 mt-1">(coordonnees manquantes)</p>
                      )}
                    </div>
                    <Badge variant="outline" className="text-[10px] capitalize shrink-0">{a.type}</Badge>
                  </div>
                ))}
                {adresses.length === 0 && <p className="text-sm text-gray-400 py-2">Aucune adresse</p>}
              </CardContent>
            </Card>

            {/* Info */}
            <Card className="col-span-2 shadow-sm border-gray-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-gray-700">Informations</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="space-y-3">
                  {[
                    ['Numero batiment', batiment.num_batiment],
                    ['Nombre d\'etages', batiment.nb_etages],
                    ['Annee construction', batiment.annee_construction],
                    ['Cree le', formatDate(batiment.created_at)],
                  ].map(([label, val]) => (
                    <div key={label as string} className="flex items-center justify-between text-sm">
                      <dt className="text-gray-500">{label}</dt>
                      <dd className="font-medium text-gray-900">{(val as string | number) ?? '—'}</dd>
                    </div>
                  ))}
                </dl>
                {batiment.commentaire && (
                  <>
                    <Separator className="my-3" />
                    <div>
                      <p className="text-xs font-medium text-gray-500 mb-1">Commentaire</p>
                      <p className="text-sm text-gray-700 leading-relaxed">{batiment.commentaire}</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Lots tab */}
        <TabsContent value="lots" className="mt-4">
          <Card className="shadow-sm border-gray-200 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-gray-400" />
                <h3 className="text-sm font-semibold text-gray-900">Lots</h3>
                <Badge variant="secondary" className="text-[10px] h-5 px-1.5">{lots?.length ?? 0}</Badge>
              </div>
              <Button size="sm" onClick={() => setShowCreateLot(true)} className="bg-amber-600 hover:bg-amber-700 text-white h-8 text-xs">
                <Plus className="h-3.5 w-3.5 mr-1" /> Ajouter un lot
              </Button>
            </div>
            <div>
              {lots && lots.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50 hover:bg-gray-50">
                      <TableHead className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Designation</TableHead>
                      <TableHead className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Type</TableHead>
                      <TableHead className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Etage</TableHead>
                      <TableHead className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Surface</TableHead>
                      <TableHead className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Meuble</TableHead>
                      <TableHead className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Proprietaire</TableHead>
                      <TableHead className="w-8" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lots.map((lot) => {
                      const propLabel = lot.proprietaires?.map(p => p.prenom ? `${p.prenom} ${p.nom}` : p.raison_sociale || p.nom).join(', ') || '—'
                      return (
                        <TableRow key={lot.id} className="cursor-pointer hover:bg-amber-50/40 transition-colors" onClick={() => navigate(`/app/patrimoine/lots/${lot.id}`)}>
                          <TableCell className="font-medium text-gray-900 text-sm">{lot.designation}</TableCell>
                          <TableCell><Badge variant="outline" className="text-[10px] capitalize font-normal">{lot.type_bien.replace('_', ' ')}</Badge></TableCell>
                          <TableCell className="text-gray-600 text-sm">{lot.etage || '—'}</TableCell>
                          <TableCell className="text-gray-600 text-sm">{lot.surface ? `${lot.surface} m²` : '—'}</TableCell>
                          <TableCell>{lot.meuble ? <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]">Meuble</Badge> : <span className="text-gray-400 text-xs">Non</span>}</TableCell>
                          <TableCell className="text-gray-600 text-sm truncate max-w-[160px]">{propLabel}</TableCell>
                          <TableCell><ExternalLink className="h-3.5 w-3.5 text-gray-300" /></TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              ) : (
                <div className="py-10 text-center text-gray-400 text-sm">Aucun lot dans ce batiment</div>
              )}
            </div>
          </Card>
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
