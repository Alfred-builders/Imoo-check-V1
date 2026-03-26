import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Archive, ArchiveRestore, User, Building2, Home, Ruler, BedDouble, Zap, Flame, Droplets } from 'lucide-react'
import { Button } from 'src/components/ui/button'
import { Badge } from 'src/components/ui/badge'
import { Skeleton } from 'src/components/ui/skeleton'
import { useLotDetail, useUpdateLot } from '../api'
import { formatDate } from '../../../lib/formatters'

const typeBienLabels: Record<string, string> = {
  appartement: 'Appartement',
  maison: 'Maison',
  studio: 'Studio',
  local_commercial: 'Local commercial',
  parking: 'Parking',
  cave: 'Cave',
  autre: 'Autre',
}

export function LotDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data: lot, isLoading } = useLotDetail(id)
  const updateMutation = useUpdateLot()

  if (isLoading) {
    return (
      <div className="p-6 space-y-6 max-w-5xl mx-auto">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-2 gap-6">
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </div>
    )
  }

  if (!lot) {
    return <div className="p-6"><p className="text-gray-400">Lot introuvable</p></div>
  }

  const proprietaires = lot.proprietaires ?? []
  const mandataire = lot.mandataire

  async function handleArchive() {
    if (!id) return
    try {
      await updateMutation.mutateAsync({ id, est_archive: !lot!.est_archive })
    } catch {
      // Error handled by mutation
    }
  }

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Button variant="ghost" size="icon" className="mt-1 shrink-0" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-display font-bold text-gray-900">{lot.designation}</h1>
            <Badge className="bg-blue-50 text-blue-700 border-blue-200 font-medium">
              {typeBienLabels[lot.type_bien] || lot.type_bien}
            </Badge>
            {lot.meuble && <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">Meublé</Badge>}
            {lot.est_archive && <Badge variant="destructive">Archivé</Badge>}
          </div>
          {lot.batiment && (
            <button
              className="text-sm text-gray-500 mt-1 flex items-center gap-1.5 hover:text-amber-600 transition-colors"
              onClick={() => navigate(`/app/patrimoine/batiments/${lot.batiment!.id}`)}
            >
              <Building2 className="h-3.5 w-3.5" />
              {lot.batiment.designation}
            </button>
          )}
        </div>
        <Button variant="outline" size="sm" onClick={handleArchive} className="shrink-0">
          {lot.est_archive ? <ArchiveRestore className="h-4 w-4 mr-1.5" /> : <Archive className="h-4 w-4 mr-1.5" />}
          {lot.est_archive ? 'Restaurer' : 'Archiver'}
        </Button>
      </div>

      {/* Quick stats bar */}
      <div className="flex items-center gap-6 px-5 py-3.5 bg-white border border-gray-200 rounded-xl shadow-sm">
        {[
          { icon: Home, label: lot.etage ? `Étage ${lot.etage}` : 'RDC', show: true },
          { icon: Ruler, label: lot.surface ? `${lot.surface} m²` : null, show: !!lot.surface },
          { icon: BedDouble, label: lot.nb_pieces || null, show: !!lot.nb_pieces },
          { icon: Zap, label: lot.dpe_classe ? `DPE ${lot.dpe_classe}` : null, show: !!lot.dpe_classe },
        ].filter(s => s.show && s.label).map(({ icon: Icon, label }) => (
          <div key={label} className="flex items-center gap-2 text-sm text-gray-600">
            <Icon className="h-4 w-4 text-gray-400" />
            <span className="font-medium">{label}</span>
          </div>
        ))}
        {lot.emplacement_palier && (
          <div className="text-sm text-gray-500">
            {lot.emplacement_palier}
          </div>
        )}
      </div>

      <div className="grid grid-cols-5 gap-5">
        {/* Informations — left 3 cols */}
        <div className="col-span-3 space-y-5">
          {/* General info */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Informations générales</h2>
            <div className="grid grid-cols-2 gap-x-8 gap-y-3.5">
              {[
                ['Désignation', lot.designation],
                ['Référence', lot.reference_interne],
                ['Type de bien', typeBienLabels[lot.type_bien]],
                ['Étage', lot.etage],
                ['Surface', lot.surface ? `${lot.surface} m²` : null],
                ['Nb pièces', lot.nb_pieces],
                ['Meublé', lot.meuble ? 'Oui' : 'Non'],
                ['Emplacement', lot.emplacement_palier],
              ].map(([label, val]) => (
                <div key={label as string} className="flex items-center justify-between text-sm">
                  <dt className="text-gray-500">{label}</dt>
                  <dd className="font-medium text-gray-900">{(val as string) || '—'}</dd>
                </div>
              ))}
            </div>
          </div>

          {/* Energy & equipments */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Énergie & Annexes</h2>
            <div className="grid grid-cols-2 gap-x-8 gap-y-3.5">
              {[
                ['DPE', lot.dpe_classe ? `Classe ${lot.dpe_classe}` : null],
                ['GES', lot.ges_classe ? `Classe ${lot.ges_classe}` : null],
                ['N° cave', lot.num_cave],
                ['N° parking', lot.num_parking],
              ].map(([label, val]) => (
                <div key={label as string} className="flex items-center justify-between text-sm">
                  <dt className="text-gray-500">{label}</dt>
                  <dd className="font-medium text-gray-900">{(val as string) || '—'}</dd>
                </div>
              ))}
            </div>
            {lot.commentaire && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs font-medium text-gray-500 mb-1">Commentaire</p>
                <p className="text-sm text-gray-700 leading-relaxed">{lot.commentaire}</p>
              </div>
            )}
          </div>

          {/* Meta */}
          <div className="text-xs text-gray-400 px-1">
            Créé le {formatDate(lot.created_at)} — Dernière modification {formatDate(lot.updated_at)}
          </div>
        </div>

        {/* Tiers — right 2 cols */}
        <div className="col-span-2 space-y-5">
          {/* Propriétaires */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
              Propriétaire{proprietaires.length > 1 ? 's' : ''}
            </h2>
            {proprietaires.length > 0 ? (
              <div className="space-y-2.5">
                {proprietaires.map((p) => (
                  <div key={p.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 border border-gray-100">
                    <div className="h-9 w-9 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                      <User className="h-4 w-4 text-amber-700" />
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
              <div className="text-center py-4">
                <User className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-400">Aucun propriétaire lié</p>
              </div>
            )}
          </div>

          {/* Mandataire */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Mandataire</h2>
            {mandataire ? (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 border border-gray-100">
                <div className="h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                  <Building2 className="h-4 w-4 text-blue-700" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900">
                    {mandataire.prenom ? `${mandataire.prenom} ${mandataire.nom}` : mandataire.raison_sociale || mandataire.nom}
                  </p>
                  {mandataire.email && <p className="text-xs text-gray-500 truncate">{mandataire.email}</p>}
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <Building2 className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-400">Aucun mandataire</p>
              </div>
            )}
          </div>

          {/* Missions */}
          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Missions</h2>
            <div className="text-center py-4">
              <div className="h-8 w-8 rounded-lg bg-gray-100 flex items-center justify-center mx-auto mb-2">
                <Building2 className="h-4 w-4 text-gray-400" />
              </div>
              <p className="text-sm text-gray-400">Aucune mission pour ce lot</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
