import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, MapPin, Pencil, Archive, ArchiveRestore } from 'lucide-react'
import { Button } from 'src/components/ui/button'
import { Badge } from 'src/components/ui/badge'
import { Card } from 'src/components/ui/card'
import { Skeleton } from 'src/components/ui/skeleton'
import { useBatimentDetail, useBatimentLots, useUpdateBatiment } from '../api'
import { formatDate } from '../../../lib/formatters'

export function BuildingDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data: batiment, isLoading } = useBatimentDetail(id)
  const { data: lots } = useBatimentLots(id)
  const updateMutation = useUpdateBatiment()

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-2 gap-6">
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
        </div>
      </div>
    )
  }

  if (!batiment) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">Bâtiment introuvable</p>
      </div>
    )
  }

  const adresses = batiment.adresses ?? []
  const principale = adresses.find(a => a.type === 'principale')

  async function handleArchive() {
    if (!id) return
    await updateMutation.mutateAsync({ id, est_archive: !batiment!.est_archive })
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/app/patrimoine')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-display font-bold">{batiment.designation}</h1>
            <Badge variant="secondary">{batiment.type}</Badge>
            {batiment.est_archive && <Badge variant="destructive">Archivé</Badge>}
          </div>
          {principale && (
            <p className="text-sm text-muted-foreground mt-0.5 flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {principale.rue}, {principale.code_postal} {principale.ville}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleArchive}>
            {batiment.est_archive ? <ArchiveRestore className="h-4 w-4 mr-1" /> : <Archive className="h-4 w-4 mr-1" />}
            {batiment.est_archive ? 'Restaurer' : 'Archiver'}
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Lots</p>
          <p className="text-2xl font-bold">{batiment.nb_lots}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Type</p>
          <p className="text-2xl font-bold capitalize">{batiment.type}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Étages</p>
          <p className="text-2xl font-bold">{batiment.nb_etages ?? '-'}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Année</p>
          <p className="text-2xl font-bold">{batiment.annee_construction ?? '-'}</p>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Adresses */}
        <Card className="p-5">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">Adresses</h2>
          <div className="space-y-3">
            {adresses.map((a) => (
              <div key={a.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-sm font-medium">{a.rue}</p>
                  {a.complement && <p className="text-xs text-muted-foreground">{a.complement}</p>}
                  <p className="text-xs text-muted-foreground">{a.code_postal} {a.ville}</p>
                  <Badge variant="outline" className="mt-1 text-xs">{a.type}</Badge>
                </div>
              </div>
            ))}
            {adresses.length === 0 && <p className="text-sm text-muted-foreground">Aucune adresse</p>}
          </div>
        </Card>

        {/* Info */}
        <Card className="p-5">
          <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">Informations</h2>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Numéro bâtiment</dt>
              <dd>{batiment.num_batiment || '-'}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Nombre d'étages</dt>
              <dd>{batiment.nb_etages ?? '-'}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Année construction</dt>
              <dd>{batiment.annee_construction ?? '-'}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Créé le</dt>
              <dd>{formatDate(batiment.created_at)}</dd>
            </div>
            {batiment.commentaire && (
              <div className="pt-2 border-t border-border">
                <dt className="text-muted-foreground mb-1">Commentaire</dt>
                <dd className="text-foreground">{batiment.commentaire}</dd>
              </div>
            )}
          </dl>
        </Card>
      </div>

      {/* Lots table */}
      <Card className="p-5">
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">
          Lots ({lots?.length ?? 0})
        </h2>
        {lots && lots.length > 0 ? (
          <div className="border border-border rounded-lg overflow-hidden">
            <div className="grid grid-cols-[1fr_100px_80px_80px_80px_150px] gap-3 px-4 py-2 bg-muted/50 text-xs text-muted-foreground uppercase tracking-wider">
              <div>Désignation</div>
              <div>Type</div>
              <div>Étage</div>
              <div>Surface</div>
              <div>Meublé</div>
              <div>Propriétaire</div>
            </div>
            {lots.map((lot) => {
              const propLabel = lot.proprietaires?.map(p => p.prenom ? `${p.prenom} ${p.nom}` : p.nom).join(', ') || '-'
              return (
                <div
                  key={lot.id}
                  className="grid grid-cols-[1fr_100px_80px_80px_80px_150px] gap-3 px-4 py-2.5 border-t border-border hover:bg-accent/30 cursor-pointer text-sm"
                  onClick={() => navigate(`/app/patrimoine/lots/${lot.id}`)}
                >
                  <div className="font-medium">{lot.designation}</div>
                  <div className="text-muted-foreground capitalize">{lot.type_bien.replace('_', ' ')}</div>
                  <div className="text-muted-foreground">{lot.etage || '-'}</div>
                  <div className="text-muted-foreground">{lot.surface ? `${lot.surface} m²` : '-'}</div>
                  <div className="text-muted-foreground">{lot.meuble ? 'Oui' : 'Non'}</div>
                  <div className="text-muted-foreground truncate">{propLabel}</div>
                </div>
              )
            })}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Aucun lot dans ce bâtiment</p>
        )}
      </Card>
    </div>
  )
}
