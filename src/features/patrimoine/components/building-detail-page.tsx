import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, MapPin, Archive, ArchiveRestore, Plus, Building2, Layers, Calendar, Hash } from 'lucide-react'
import { Button } from 'src/components/ui/button'
import { Badge } from 'src/components/ui/badge'
import { Skeleton } from 'src/components/ui/skeleton'
import { useBatimentDetail, useBatimentLots, useUpdateBatiment } from '../api'
import { CreateLotModal } from './create-lot-modal'
import { formatDate } from '../../../lib/formatters'

const typeLabels: Record<string, string> = {
  immeuble: 'Immeuble',
  maison: 'Maison',
  local_commercial: 'Local commercial',
  mixte: 'Mixte',
  autre: 'Autre',
}

export function BuildingDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [showCreateLot, setShowCreateLot] = useState(false)
  const { data: batiment, isLoading } = useBatimentDetail(id)
  const { data: lots } = useBatimentLots(id)
  const updateMutation = useUpdateBatiment()

  if (isLoading) {
    return (
      <div className="p-6 space-y-6 max-w-5xl mx-auto">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    )
  }

  if (!batiment) {
    return <div className="p-6"><p className="text-muted-foreground">Bâtiment introuvable</p></div>
  }

  const adresses = batiment.adresses ?? []
  const principale = adresses.find(a => a.type === 'principale')

  async function handleArchive() {
    if (!id) return
    await updateMutation.mutateAsync({ id, est_archive: !batiment!.est_archive })
  }

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Button variant="ghost" size="icon" className="mt-1 shrink-0" onClick={() => navigate('/app/patrimoine')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-display font-bold text-gray-900">{batiment.designation}</h1>
            <Badge className="bg-gray-100 text-gray-600 border-gray-200 font-medium">{typeLabels[batiment.type] || batiment.type}</Badge>
            {batiment.est_archive && <Badge variant="destructive">Archivé</Badge>}
          </div>
          {principale && (
            <p className="text-sm text-gray-500 mt-1 flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" />
              {principale.rue}, {principale.code_postal} {principale.ville}
            </p>
          )}
        </div>
        <Button variant="outline" size="sm" onClick={handleArchive} className="shrink-0">
          {batiment.est_archive ? <ArchiveRestore className="h-4 w-4 mr-1.5" /> : <Archive className="h-4 w-4 mr-1.5" />}
          {batiment.est_archive ? 'Restaurer' : 'Archiver'}
        </Button>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { icon: Layers, label: 'Lots', value: batiment.nb_lots, color: 'bg-blue-50 text-blue-600' },
          { icon: Building2, label: 'Type', value: typeLabels[batiment.type] || batiment.type, color: 'bg-amber-50 text-amber-600' },
          { icon: Hash, label: 'Étages', value: batiment.nb_etages ?? '—', color: 'bg-emerald-50 text-emerald-600' },
          { icon: Calendar, label: 'Année', value: batiment.annee_construction ?? '—', color: 'bg-purple-50 text-purple-600' },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2.5 mb-2">
              <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${color}`}>
                <Icon className="h-4 w-4" />
              </div>
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-5 gap-5">
        {/* Adresses */}
        <div className="col-span-3 bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Adresses</h2>
          <div className="space-y-3">
            {adresses.map((a) => (
              <div key={a.id} className="flex items-start gap-3 p-3.5 rounded-lg bg-gray-50 border border-gray-100">
                <div className="h-9 w-9 rounded-lg bg-blue-50 flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin className="h-4 w-4 text-blue-500" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">{a.rue}</p>
                  {a.complement && <p className="text-xs text-gray-500 mt-0.5">{a.complement}</p>}
                  <p className="text-xs text-gray-500">{a.code_postal} {a.ville}</p>
                </div>
                <Badge variant="outline" className="text-[10px] mt-0.5 capitalize">{a.type}</Badge>
              </div>
            ))}
            {adresses.length === 0 && <p className="text-sm text-gray-400">Aucune adresse</p>}
          </div>
        </div>

        {/* Informations */}
        <div className="col-span-2 bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Informations</h2>
          <dl className="space-y-3.5">
            {[
              ['Numéro bâtiment', batiment.num_batiment],
              ['Nombre d\'étages', batiment.nb_etages],
              ['Année construction', batiment.annee_construction],
              ['Créé le', formatDate(batiment.created_at)],
            ].map(([label, val]) => (
              <div key={label as string} className="flex items-center justify-between text-sm">
                <dt className="text-gray-500">{label}</dt>
                <dd className="font-medium text-gray-900">{(val as string | number) ?? '—'}</dd>
              </div>
            ))}
            {batiment.commentaire && (
              <div className="pt-3 border-t border-gray-100">
                <dt className="text-xs text-gray-500 mb-1">Commentaire</dt>
                <dd className="text-sm text-gray-700">{batiment.commentaire}</dd>
              </div>
            )}
          </dl>
        </div>
      </div>

      {/* Create lot modal */}
      <CreateLotModal
        open={showCreateLot}
        onOpenChange={setShowCreateLot}
        preselectedBatimentId={id}
        onCreated={(lotId) => navigate(`/app/patrimoine/lots/${lotId}`)}
      />

      {/* Lots table */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-900">
            Lots <span className="text-gray-400 font-normal">({lots?.length ?? 0})</span>
          </h2>
          <Button size="sm" onClick={() => setShowCreateLot(true)} className="bg-amber-600 hover:bg-amber-700 text-white">
            <Plus className="h-4 w-4 mr-1" /> Ajouter un lot
          </Button>
        </div>
        {lots && lots.length > 0 ? (
          <>
            <div className="grid grid-cols-[1fr_100px_70px_80px_70px_150px] gap-3 px-5 py-2.5 bg-gray-50 text-[11px] font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">
              <div>Désignation</div>
              <div>Type</div>
              <div>Étage</div>
              <div>Surface</div>
              <div>Meublé</div>
              <div>Propriétaire</div>
            </div>
            {lots.map((lot) => {
              const propLabel = lot.proprietaires?.map(p => p.prenom ? `${p.prenom} ${p.nom}` : p.raison_sociale || p.nom).join(', ') || '—'
              return (
                <div
                  key={lot.id}
                  className="grid grid-cols-[1fr_100px_70px_80px_70px_150px] gap-3 px-5 py-3 border-b border-gray-50 hover:bg-amber-50/40 cursor-pointer transition-colors text-sm"
                  onClick={() => navigate(`/app/patrimoine/lots/${lot.id}`)}
                >
                  <div className="font-medium text-gray-900">{lot.designation}</div>
                  <div className="text-gray-500 capitalize">{lot.type_bien.replace('_', ' ')}</div>
                  <div className="text-gray-500">{lot.etage || '—'}</div>
                  <div className="text-gray-500">{lot.surface ? `${lot.surface} m²` : '—'}</div>
                  <div>{lot.meuble ? <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]">Oui</Badge> : <span className="text-gray-400">Non</span>}</div>
                  <div className="text-gray-500 truncate">{propLabel}</div>
                </div>
              )
            })}
          </>
        ) : (
          <div className="px-5 py-8 text-center text-gray-400 text-sm">Aucun lot dans ce bâtiment</div>
        )}
      </div>
    </div>
  )
}
