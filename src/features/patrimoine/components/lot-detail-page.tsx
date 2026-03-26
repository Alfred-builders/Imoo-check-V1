import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Archive, ArchiveRestore, User, Building2, MapPin } from 'lucide-react'
import { Button } from 'src/components/ui/button'
import { Badge } from 'src/components/ui/badge'
import { Card } from 'src/components/ui/card'
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
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-2 gap-6">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
      </div>
    )
  }

  if (!lot) {
    return <div className="p-6"><p className="text-muted-foreground">Lot introuvable</p></div>
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
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-display font-bold">{lot.designation}</h1>
            <Badge variant="secondary">{typeBienLabels[lot.type_bien] || lot.type_bien}</Badge>
            {lot.est_archive && <Badge variant="destructive">Archivé</Badge>}
          </div>
          {lot.batiment && (
            <button
              className="text-sm text-muted-foreground mt-0.5 flex items-center gap-1 hover:text-foreground transition-colors"
              onClick={() => navigate(`/app/patrimoine/batiments/${lot.batiment!.id}`)}
            >
              <Building2 className="h-3 w-3" />
              {lot.batiment.designation}
            </button>
          )}
        </div>
        <Button variant="outline" size="sm" onClick={handleArchive}>
          {lot.est_archive ? <ArchiveRestore className="h-4 w-4 mr-1" /> : <Archive className="h-4 w-4 mr-1" />}
          {lot.est_archive ? 'Restaurer' : 'Archiver'}
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Informations */}
        <Card className="p-5">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">Informations</h2>
          <dl className="space-y-3 text-sm">
            {[
              ['Référence', lot.reference_interne],
              ['Type de bien', typeBienLabels[lot.type_bien] || lot.type_bien],
              ['Étage', lot.etage],
              ['Emplacement', lot.emplacement_palier],
              ['Surface', lot.surface ? `${lot.surface} m²` : null],
              ['Nb pièces', lot.nb_pieces],
              ['Meublé', lot.meuble ? 'Oui' : 'Non'],
              ['DPE', lot.dpe_classe],
              ['GES', lot.ges_classe],
              ['N° cave', lot.num_cave],
              ['N° parking', lot.num_parking],
              ['Créé le', formatDate(lot.created_at)],
            ].map(([label, value]) => (
              <div key={label as string} className="flex justify-between">
                <dt className="text-muted-foreground">{label}</dt>
                <dd>{(value as string) || '-'}</dd>
              </div>
            ))}
            {lot.commentaire && (
              <div className="pt-2 border-t border-border">
                <dt className="text-muted-foreground mb-1">Commentaire</dt>
                <dd>{lot.commentaire}</dd>
              </div>
            )}
          </dl>
        </Card>

        {/* Tiers */}
        <div className="space-y-6">
          {/* Propriétaires */}
          <Card className="p-5">
            <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">
              Propriétaire{proprietaires.length > 1 ? 's' : ''}
            </h2>
            {proprietaires.length > 0 ? (
              <div className="space-y-3">
                {proprietaires.map((p) => (
                  <div key={p.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">
                        {p.prenom ? `${p.prenom} ${p.nom}` : p.raison_sociale || p.nom}
                      </p>
                      {p.email && <p className="text-xs text-muted-foreground truncate">{p.email}</p>}
                    </div>
                    {p.est_principal && <Badge variant="outline" className="ml-auto text-xs">Principal</Badge>}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Aucun propriétaire lié</p>
            )}
          </Card>

          {/* Mandataire */}
          <Card className="p-5">
            <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">Mandataire</h2>
            {mandataire ? (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <div className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                  <Building2 className="h-4 w-4 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-medium">
                    {mandataire.prenom ? `${mandataire.prenom} ${mandataire.nom}` : mandataire.raison_sociale || mandataire.nom}
                  </p>
                  {mandataire.email && <p className="text-xs text-muted-foreground">{mandataire.email}</p>}
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Aucun mandataire</p>
            )}
          </Card>
        </div>
      </div>

      {/* Missions - placeholder */}
      <Card className="p-5">
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">Missions</h2>
        <p className="text-sm text-muted-foreground">Aucune mission pour ce lot</p>
      </Card>
    </div>
  )
}
