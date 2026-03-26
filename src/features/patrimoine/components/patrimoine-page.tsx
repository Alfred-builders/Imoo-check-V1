import { useState } from 'react'
import { Search, Map, List, Building2, ChevronRight, ChevronDown, Home, Store, Landmark, Plus } from 'lucide-react'
import { Input } from 'src/components/ui/input'
import { Badge } from 'src/components/ui/badge'
import { Button } from 'src/components/ui/button'
import { Skeleton } from 'src/components/ui/skeleton'
import { useBatiments, useBatimentLots } from '../api'
import { formatDate } from '../../../lib/formatters'
import { useNavigate } from 'react-router-dom'
import { CreateBuildingModal } from './create-building-modal'
import { CreateLotModal } from './create-lot-modal'
import { PatrimoineMap } from './patrimoine-map'
import { ColumnConfig, useColumnPreferences, type ColumnDef } from '../../../components/shared/column-config'
import type { Batiment, Lot } from '../types'

const BATIMENT_COLUMNS: ColumnDef[] = [
  { id: 'designation', label: 'Designation', defaultVisible: true },
  { id: 'type', label: 'Type', defaultVisible: true },
  { id: 'adresse', label: 'Adresse', defaultVisible: true },
  { id: 'nb_lots', label: 'Lots', defaultVisible: true },
  { id: 'derniere_mission', label: 'Derniere mission', defaultVisible: true },
  { id: 'missions_a_venir', label: 'A venir', defaultVisible: true },
  { id: 'annee_construction', label: 'Annee construction', defaultVisible: false },
  { id: 'nb_etages', label: 'Etages', defaultVisible: false },
  { id: 'num_batiment', label: 'N batiment', defaultVisible: false },
  { id: 'created_at', label: 'Cree le', defaultVisible: false },
]

const typeIcons: Record<string, typeof Building2> = {
  immeuble: Building2,
  maison: Home,
  local_commercial: Store,
  mixte: Landmark,
  autre: Building2,
}

const typeLabels: Record<string, string> = {
  immeuble: 'Immeuble',
  maison: 'Maison',
  local_commercial: 'Local commercial',
  mixte: 'Mixte',
  autre: 'Autre',
}

function useDebounce(value: string, delay: number) {
  const [debounced, setDebounced] = useState(value)
  useState(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  })
  // Simple immediate for now — React 19 can use useDeferredValue
  if (debounced !== value) setDebounced(value)
  return debounced
}

export function PatrimoinePage() {
  const [search, setSearch] = useState('')
  const [view, setView] = useState<'table' | 'carte'>('table')
  const [showCreateBuilding, setShowCreateBuilding] = useState(false)
  const [showCreateLot, setShowCreateLot] = useState(false)
  const debouncedSearch = useDebounce(search, 300)
  const navigate = useNavigate()
  const { visible: visibleCols, setVisible: setVisibleCols } = useColumnPreferences('patrimoine_batiments', BATIMENT_COLUMNS)

  const { data, isLoading } = useBatiments({ search: debouncedSearch || undefined })
  const batiments = data?.data ?? []

  const isColVisible = (id: string) => visibleCols.includes(id)

  return (
    <div className="p-6 space-y-4">
      {/* Modals */}
      <CreateBuildingModal
        open={showCreateBuilding}
        onOpenChange={setShowCreateBuilding}
        onCreated={(id) => navigate(`/app/patrimoine/batiments/${id}`)}
      />
      <CreateLotModal
        open={showCreateLot}
        onOpenChange={setShowCreateLot}
        onCreated={(id) => navigate(`/app/patrimoine/lots/${id}`)}
        onCreateBatiment={() => { setShowCreateLot(false); setShowCreateBuilding(true) }}
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold">Parc immobilier</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {isLoading ? '...' : `${batiments.length} bâtiment${batiments.length > 1 ? 's' : ''}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={() => setShowCreateLot(true)} className="bg-amber-600 hover:bg-amber-700 text-white">
            <Plus className="h-4 w-4 mr-1" /> Nouveau lot
          </Button>
          <ColumnConfig
            page="patrimoine_batiments"
            columns={BATIMENT_COLUMNS}
            visibleColumns={visibleCols}
            onColumnsChange={setVisibleCols}
          />
          <button
            onClick={() => setView('table')}
            className={`p-2 rounded-lg transition-colors ${view === 'table' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-accent'}`}
          >
            <List className="h-4 w-4" />
          </button>
          <button
            onClick={() => setView('carte')}
            className={`p-2 rounded-lg transition-colors ${view === 'carte' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-accent'}`}
          >
            <Map className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher un bâtiment, lot, adresse, propriétaire..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Table view */}
      {view === 'table' && (
        <div className="border border-border rounded-lg overflow-hidden bg-card shadow-sm">
          {/* Header row */}
          <div className="grid grid-cols-[1fr_120px_200px_80px_120px_100px] gap-4 px-4 py-2.5 bg-gray-50 text-[11px] font-semibold text-gray-500 uppercase tracking-wider border-b border-border">
            <div>Désignation</div>
            <div>Type</div>
            <div>Adresse</div>
            <div className="text-center">Lots</div>
            <div>Dernière mission</div>
            <div className="text-center">À venir</div>
          </div>

          {/* Loading */}
          {isLoading && (
            <div className="divide-y divide-border">
              {[1, 2, 3].map((i) => (
                <div key={i} className="grid grid-cols-[1fr_120px_200px_80px_120px_100px] gap-4 px-4 py-3">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-5 w-8 mx-auto" />
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-5 w-8 mx-auto" />
                </div>
              ))}
            </div>
          )}

          {/* Data */}
          {!isLoading && batiments.length === 0 && (
            <div className="py-12 text-center text-muted-foreground">
              {search ? 'Aucun résultat pour cette recherche' : 'Aucun bâtiment'}
            </div>
          )}

          {!isLoading && batiments.map((bat) => (
            <BatimentRow key={bat.id} batiment={bat} />
          ))}
        </div>
      )}

      {/* Map view */}
      {view === 'carte' && <PatrimoineMap batiments={batiments} />}
    </div>
  )
}

function BatimentRow({ batiment }: { batiment: Batiment }) {
  const [expanded, setExpanded] = useState(false)
  const navigate = useNavigate()
  const Icon = typeIcons[batiment.type] || Building2
  const adresse = batiment.adresse_principale

  return (
    <div className="border-b border-border last:border-b-0">
      {/* Building row */}
      <div
        className="grid grid-cols-[1fr_120px_200px_80px_120px_100px] gap-4 px-4 py-3 hover:bg-accent/50 transition-colors cursor-pointer group"
        onClick={() => navigate(`/app/patrimoine/batiments/${batiment.id}`)}
      >
        <div className="flex items-center gap-2 min-w-0">
          <button
            onClick={(e) => {
              e.stopPropagation()
              setExpanded(!expanded)
            }}
            className="shrink-0 p-0.5 rounded hover:bg-accent"
          >
            {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>
          <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
          <span className="font-medium truncate">{batiment.designation}</span>
        </div>
        <div>
          <Badge variant="secondary" className="text-xs">
            {typeLabels[batiment.type] || batiment.type}
          </Badge>
        </div>
        <div className="text-sm text-muted-foreground truncate">
          {adresse ? `${adresse.rue}, ${adresse.ville}` : '-'}
        </div>
        <div className="text-center text-sm">{batiment.nb_lots}</div>
        <div className="text-sm text-muted-foreground">
          {batiment.derniere_mission ? formatDate(batiment.derniere_mission) : '-'}
        </div>
        <div className="text-center">
          {batiment.missions_a_venir > 0 ? (
            <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20">{batiment.missions_a_venir}</Badge>
          ) : (
            <span className="text-sm text-muted-foreground">-</span>
          )}
        </div>
      </div>

      {/* Expanded lots */}
      {expanded && <LotSubRows batimentId={batiment.id} />}
    </div>
  )
}

function LotSubRows({ batimentId }: { batimentId: string }) {
  const { data: lots, isLoading } = useBatimentLots(batimentId)
  const navigate = useNavigate()

  if (isLoading) {
    return (
      <div className="pl-10 pr-4 py-2 bg-muted/30">
        {[1, 2].map((i) => (
          <div key={i} className="flex gap-4 py-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-20" />
          </div>
        ))}
      </div>
    )
  }

  if (!lots || lots.length === 0) {
    return (
      <div className="pl-10 pr-4 py-3 bg-muted/30 text-sm text-muted-foreground">
        Aucun lot
      </div>
    )
  }

  return (
    <div className="bg-muted/30 border-t border-border/50">
      {/* Lot header */}
      <div className="grid grid-cols-[1fr_80px_80px_80px_80px_150px_120px] gap-3 pl-10 pr-4 py-2 text-xs text-muted-foreground uppercase tracking-wider">
        <div>Lot</div>
        <div>Type</div>
        <div>Étage</div>
        <div>Surface</div>
        <div>Meublé</div>
        <div>Propriétaire</div>
        <div>Dernière mission</div>
      </div>
      {lots.map((lot) => (
        <LotRow key={lot.id} lot={lot} onClick={() => navigate(`/app/patrimoine/lots/${lot.id}`)} />
      ))}
    </div>
  )
}

function LotRow({ lot, onClick }: { lot: Lot; onClick: () => void }) {
  const proprietaires = lot.proprietaires ?? []
  const proprietaireLabel = proprietaires.length > 0
    ? proprietaires.map(p => p.prenom ? `${p.prenom} ${p.nom}` : p.nom).join(', ')
    : '-'

  return (
    <div
      className="grid grid-cols-[1fr_80px_80px_80px_80px_150px_120px] gap-3 pl-10 pr-4 py-2.5 hover:bg-accent/30 cursor-pointer text-sm border-t border-border/30"
      onClick={onClick}
    >
      <div className="font-medium truncate">{lot.designation}</div>
      <div className="text-muted-foreground capitalize">{lot.type_bien.replace('_', ' ')}</div>
      <div className="text-muted-foreground">{lot.etage || '-'}</div>
      <div className="text-muted-foreground">{lot.surface ? `${lot.surface} m²` : '-'}</div>
      <div>{lot.meuble ? <Badge variant="secondary" className="text-xs">Oui</Badge> : <span className="text-muted-foreground">Non</span>}</div>
      <div className="text-muted-foreground truncate">{proprietaireLabel}</div>
      <div className="text-muted-foreground">{lot.derniere_mission ? formatDate(lot.derniere_mission) : '-'}</div>
    </div>
  )
}
