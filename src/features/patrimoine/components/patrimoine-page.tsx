import { useState, useMemo } from 'react'
import { Search, Map, List, Building2, ChevronRight, ChevronDown, Home, Store, Landmark, Plus, Upload } from 'lucide-react'
import { Input } from 'src/components/ui/input'
import { Badge } from 'src/components/ui/badge'
import { Button } from 'src/components/ui/button'
import { Skeleton } from 'src/components/ui/skeleton'
import { useBatiments, useBatimentLots } from '../api'
import { formatDate } from '../../../lib/formatters'
import { useNavigate } from 'react-router-dom'
import { CreateBuildingModal } from './create-building-modal'
import { CreateLotModal } from './create-lot-modal'
import { ImportCSVModal } from './import-csv-modal'
import { PatrimoineMap } from './patrimoine-map'
import { ColumnConfig, useColumnPreferences, type ColumnDef } from '../../../components/shared/column-config'
import { DynamicFilter, type FilterField, type ActiveFilter } from '../../../components/shared/dynamic-filter'
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

const FILTER_FIELDS: FilterField[] = [
  { id: 'type', label: 'Type', type: 'select', options: [
    { value: 'immeuble', label: 'Immeuble' },
    { value: 'maison', label: 'Maison' },
    { value: 'local_commercial', label: 'Local commercial' },
    { value: 'mixte', label: 'Mixte' },
  ]},
  { id: 'ville', label: 'Ville', type: 'text' },
  { id: 'designation', label: 'Designation', type: 'text' },
  { id: 'nb_lots', label: 'Nb lots', type: 'number' },
  { id: 'nb_etages', label: 'Etages', type: 'number' },
  { id: 'annee_construction', label: 'Annee', type: 'number' },
  { id: 'est_archive', label: 'Archive', type: 'boolean' },
]

const typeIcons: Record<string, typeof Building2> = {
  immeuble: Building2, maison: Home, local_commercial: Store, mixte: Landmark, autre: Building2,
}

const typeLabels: Record<string, string> = {
  immeuble: 'Immeuble', maison: 'Maison', local_commercial: 'Local commercial', mixte: 'Mixte', autre: 'Autre',
}

function useDebounce(value: string, delay: number) {
  const [debounced, setDebounced] = useState(value)
  useState(() => { const t = setTimeout(() => setDebounced(value), delay); return () => clearTimeout(t) })
  if (debounced !== value) setDebounced(value)
  return debounced
}

// Client-side filter logic
function applyFilters(batiments: Batiment[], filters: ActiveFilter[]): Batiment[] {
  if (filters.length === 0) return batiments
  return batiments.filter(bat => {
    return filters.every(f => {
      const val = getFieldValue(bat, f.field)
      return matchFilter(val, f.operator, f.value, f.field)
    })
  })
}

function getFieldValue(bat: Batiment, field: string): string | number | boolean | null {
  switch (field) {
    case 'type': return bat.type
    case 'ville': return bat.adresse_principale?.ville ?? null
    case 'designation': return bat.designation
    case 'nb_lots': return bat.nb_lots
    case 'nb_etages': return bat.nb_etages ?? null
    case 'annee_construction': return bat.annee_construction ?? null
    case 'est_archive': return bat.est_archive
    default: return null
  }
}

function matchFilter(val: string | number | boolean | null, op: string, target: string, _field: string): boolean {
  if (!target) return true
  if (val === null || val === undefined) return false
  const sVal = String(val).toLowerCase()
  const sTarget = target.toLowerCase()

  switch (op) {
    case 'contains': return sVal.includes(sTarget)
    case 'equals': return sVal === sTarget
    case 'not_equals': return sVal !== sTarget
    case 'starts_with': return sVal.startsWith(sTarget)
    case 'gt': return Number(val) > Number(target)
    case 'lt': return Number(val) < Number(target)
    case 'gte': return Number(val) >= Number(target)
    case 'lte': return Number(val) <= Number(target)
    default: return true
  }
}

export function PatrimoinePage() {
  const [search, setSearch] = useState('')
  const [dynamicFilters, setDynamicFilters] = useState<ActiveFilter[]>([])
  const [view, setView] = useState<'table' | 'carte'>('table')
  const [showCreateBuilding, setShowCreateBuilding] = useState(false)
  const [showCreateLot, setShowCreateLot] = useState(false)
  const [showImportCSV, setShowImportCSV] = useState(false)
  const [maisonBatimentId, setMaisonBatimentId] = useState<string | null>(null)
  const debouncedSearch = useDebounce(search, 300)
  const navigate = useNavigate()
  const { visible: visibleCols, setVisible: setVisibleCols } = useColumnPreferences('patrimoine_batiments', BATIMENT_COLUMNS)

  // Check if archive filter is active
  const hasArchiveFilter = dynamicFilters.some(f => f.field === 'est_archive')
  const typeFilter = dynamicFilters.find(f => f.field === 'type' && f.operator === 'equals')?.value

  const { data, isLoading } = useBatiments({
    search: debouncedSearch || undefined,
    type: typeFilter || undefined,
    archived: hasArchiveFilter || undefined,
  })

  // Apply client-side filters (for ville, nb_lots, etc.)
  const filteredBatiments = useMemo(
    () => applyFilters(data?.data ?? [], dynamicFilters.filter(f => !['type', 'est_archive'].includes(f.field))),
    [data, dynamicFilters]
  )

  const isCol = (id: string) => visibleCols.includes(id)

  return (
    <div className="p-6 space-y-4">
      {/* Modals */}
      <CreateBuildingModal
        open={showCreateBuilding}
        onOpenChange={setShowCreateBuilding}
        onCreated={() => {}}
        onMaisonCreated={(batId) => { setMaisonBatimentId(batId); setShowCreateLot(true) }}
      />
      <CreateLotModal
        open={showCreateLot}
        onOpenChange={(open) => { setShowCreateLot(open); if (!open) setMaisonBatimentId(null) }}
        preselectedBatimentId={maisonBatimentId ?? undefined}
        preselectedTypeBien={maisonBatimentId ? 'maison' : undefined}
        onCreated={(id) => navigate(`/app/patrimoine/lots/${id}`)}
      />
      <ImportCSVModal
        open={showImportCSV}
        onOpenChange={setShowImportCSV}
        onImported={() => window.location.reload()}
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-display font-bold text-gray-900">Parc immobilier</h1>
          <p className="text-xs text-gray-400 mt-0.5">
            {isLoading ? '...' : `${filteredBatiments.length} batiment${filteredBatiments.length > 1 ? 's' : ''}`}
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => setShowImportCSV(true)}>
            <Upload className="h-3.5 w-3.5 mr-1" /> Import CSV
          </Button>
          <Button size="sm" onClick={() => setShowCreateLot(true)} className="bg-amber-600 hover:bg-amber-700 text-white h-8 text-xs">
            <Plus className="h-3.5 w-3.5 mr-1" /> Nouveau lot
          </Button>
          <ColumnConfig
            page="patrimoine_batiments"
            columns={BATIMENT_COLUMNS}
            visibleColumns={visibleCols}
            onColumnsChange={setVisibleCols}
          />
          <div className="flex items-center bg-gray-100 rounded-md p-0.5 ml-1">
            <button
              onClick={() => setView('table')}
              className={`p-1.5 rounded transition-colors ${view === 'table' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-400'}`}
            >
              <List className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setView('carte')}
              className={`p-1.5 rounded transition-colors ${view === 'carte' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-400'}`}
            >
              <Map className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Search + Dynamic filters */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="relative w-72">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
            <Input
              placeholder="Rechercher..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-8 text-xs"
            />
          </div>
          <DynamicFilter fields={FILTER_FIELDS} filters={dynamicFilters} onChange={setDynamicFilters} />
        </div>
      </div>

      {/* Table view */}
      {view === 'table' && (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          {/* Header */}
          <div className="flex items-center gap-4 px-4 py-2 bg-gray-50 border-b border-gray-100 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
            <div className="w-6" /> {/* expand */}
            {isCol('designation') && <div className="flex-1 min-w-[150px]">Designation</div>}
            {isCol('type') && <div className="w-28">Type</div>}
            {isCol('adresse') && <div className="w-48">Adresse</div>}
            {isCol('nb_lots') && <div className="w-14 text-center">Lots</div>}
            {isCol('nb_etages') && <div className="w-14 text-center">Etages</div>}
            {isCol('annee_construction') && <div className="w-16 text-center">Annee</div>}
            {isCol('derniere_mission') && <div className="w-24">Dern. mission</div>}
            {isCol('missions_a_venir') && <div className="w-16 text-center">A venir</div>}
            {isCol('created_at') && <div className="w-24">Cree le</div>}
          </div>

          {isLoading && (
            <div className="divide-y divide-gray-50">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-4 px-4 py-3">
                  <div className="w-6" />
                  <Skeleton className="h-4 flex-1" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-32" />
                </div>
              ))}
            </div>
          )}

          {!isLoading && filteredBatiments.length === 0 && (
            <div className="py-12 text-center text-gray-400 text-sm">
              {search || dynamicFilters.length > 0 ? 'Aucun resultat' : 'Aucun batiment'}
            </div>
          )}

          {!isLoading && filteredBatiments.map((bat) => (
            <BatimentRow key={bat.id} batiment={bat} visibleCols={visibleCols} />
          ))}
        </div>
      )}

      {view === 'carte' && <PatrimoineMap batiments={filteredBatiments} />}
    </div>
  )
}

function BatimentRow({ batiment, visibleCols }: { batiment: Batiment; visibleCols: string[] }) {
  const [expanded, setExpanded] = useState(false)
  const navigate = useNavigate()
  const Icon = typeIcons[batiment.type] || Building2
  const adresse = batiment.adresse_principale
  const isCol = (id: string) => visibleCols.includes(id)

  return (
    <div className="border-b border-gray-50 last:border-b-0">
      <div
        className="flex items-center gap-4 px-4 py-2.5 hover:bg-amber-50/40 transition-colors cursor-pointer text-sm"
        onClick={() => navigate(`/app/patrimoine/batiments/${batiment.id}`)}
      >
        <button
          onClick={(e) => { e.stopPropagation(); setExpanded(!expanded) }}
          className="w-6 shrink-0 flex items-center justify-center p-0.5 rounded hover:bg-gray-100"
        >
          {expanded ? <ChevronDown className="h-3.5 w-3.5 text-gray-400" /> : <ChevronRight className="h-3.5 w-3.5 text-gray-400" />}
        </button>
        {isCol('designation') && (
          <div className="flex-1 min-w-[150px] flex items-center gap-2 min-w-0">
            <Icon className="h-4 w-4 shrink-0 text-gray-400" />
            <span className="font-medium text-gray-900 truncate">{batiment.designation}</span>
            {batiment.est_archive && <Badge variant="outline" className="text-[9px] text-gray-400 border-gray-200">Archive</Badge>}
          </div>
        )}
        {isCol('type') && (
          <div className="w-28">
            <Badge variant="outline" className="text-[10px] font-normal capitalize">{typeLabels[batiment.type]}</Badge>
          </div>
        )}
        {isCol('adresse') && (
          <div className="w-48 text-xs text-gray-500 truncate">
            {adresse ? `${adresse.rue}, ${adresse.ville}` : '—'}
          </div>
        )}
        {isCol('nb_lots') && <div className="w-14 text-center text-gray-600 font-medium">{batiment.nb_lots}</div>}
        {isCol('nb_etages') && <div className="w-14 text-center text-gray-500 text-xs">{batiment.nb_etages ?? '—'}</div>}
        {isCol('annee_construction') && <div className="w-16 text-center text-gray-500 text-xs">{batiment.annee_construction ?? '—'}</div>}
        {isCol('derniere_mission') && (
          <div className="w-24 text-xs text-gray-500">{batiment.derniere_mission ? formatDate(batiment.derniere_mission) : '—'}</div>
        )}
        {isCol('missions_a_venir') && (
          <div className="w-16 text-center">
            {batiment.missions_a_venir > 0 ? (
              <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-[10px]">{batiment.missions_a_venir}</Badge>
            ) : <span className="text-xs text-gray-300">—</span>}
          </div>
        )}
        {isCol('created_at') && (
          <div className="w-24 text-xs text-gray-400">{formatDate(batiment.created_at)}</div>
        )}
      </div>

      {expanded && <LotSubRows batimentId={batiment.id} />}
    </div>
  )
}

function LotSubRows({ batimentId }: { batimentId: string }) {
  const { data: lots, isLoading } = useBatimentLots(batimentId)
  const navigate = useNavigate()

  if (isLoading) {
    return (
      <div className="pl-10 pr-4 py-2 bg-gray-50/60">
        {[1, 2].map((i) => (
          <div key={i} className="grid grid-cols-[1fr_100px_60px_80px_70px_140px] gap-3 py-2">
            <Skeleton className="h-4" /><Skeleton className="h-4" /><Skeleton className="h-4" /><Skeleton className="h-4" /><Skeleton className="h-4" /><Skeleton className="h-4" />
          </div>
        ))}
      </div>
    )
  }

  if (!lots || lots.length === 0) return <div className="pl-10 pr-4 py-3 bg-gray-50/60 text-xs text-gray-400">Aucun lot</div>

  return (
    <div className="bg-gray-50/60 border-t border-gray-100">
      {/* Sub-row column headers */}
      <div className="grid grid-cols-[1fr_100px_60px_80px_70px_140px] gap-3 pl-10 pr-4 py-1.5 text-[9px] font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-100/80">
        <div>Lot</div>
        <div>Type</div>
        <div>Etage</div>
        <div>Surface</div>
        <div>Meuble</div>
        <div>Proprietaire</div>
      </div>
      {lots.map((lot) => {
        const propLabel = lot.proprietaires?.map(p => p.prenom ? `${p.prenom} ${p.nom}` : p.nom).join(', ') || '—'
        return (
          <div
            key={lot.id}
            className="grid grid-cols-[1fr_100px_60px_80px_70px_140px] gap-3 pl-10 pr-4 py-2 hover:bg-amber-50/40 cursor-pointer transition-colors text-xs border-b border-gray-50 last:border-b-0 items-center"
            onClick={() => navigate(`/app/patrimoine/lots/${lot.id}`)}
          >
            <div className="flex items-center gap-2 min-w-0">
              <Home className="h-3 w-3 text-gray-300 shrink-0" />
              <span className="font-medium text-gray-800 truncate">{lot.designation}</span>
            </div>
            <div><Badge variant="outline" className="text-[9px] capitalize font-normal">{lot.type_bien.replace('_', ' ')}</Badge></div>
            <div className="text-gray-500">{lot.etage || '—'}</div>
            <div className="text-gray-500">{lot.surface ? `${lot.surface} m²` : '—'}</div>
            <div>{lot.meuble ? <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[9px]">Meuble</Badge> : <span className="text-gray-300">—</span>}</div>
            <div className="text-gray-400 truncate">{propLabel}</div>
          </div>
        )
      })}
    </div>
  )
}
