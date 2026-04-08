import { useState, useMemo, useEffect, useRef, useCallback } from 'react'
import { Search, Map, List, Building2, ChevronRight, ChevronDown, Home, Store, Landmark, Plus, Upload, Loader2 } from 'lucide-react'
import { Input } from 'src/components/ui/input'
import { Badge } from 'src/components/ui/badge'
import { Button } from 'src/components/ui/button'
import { Skeleton } from 'src/components/ui/skeleton'
import { useBatiments, useBatimentLots } from '../api'
import { formatDate } from '../../../lib/formatters'
import { useNavigate, useLocation } from 'react-router-dom'
import { CreateBuildingModal } from './create-building-modal'
import { CreateLotModal } from './create-lot-modal'
import { ImportCSVModal } from './import-csv-modal'
import { PatrimoineMap } from './patrimoine-map'
import { ColumnConfig, useColumnPreferences, type ColumnDef } from '../../../components/shared/column-config'
import { DynamicFilter, type FilterField, type ActiveFilter } from '../../../components/shared/dynamic-filter'
import type { Batiment, Lot } from '../types'

const BATCH_SIZE = 20

const BATIMENT_COLUMNS: ColumnDef[] = [
  { id: 'designation', label: 'Désignation', defaultVisible: true },
  { id: 'type', label: 'Type', defaultVisible: true },
  { id: 'adresse', label: 'Adresse', defaultVisible: true },
  { id: 'nb_lots', label: 'Lots', defaultVisible: true },
  { id: 'derniere_mission', label: 'Dernière mission', defaultVisible: true },
  { id: 'missions_a_venir', label: 'À venir', defaultVisible: true },
  { id: 'annee_construction', label: 'Année construction', defaultVisible: false },
  { id: 'nb_etages', label: 'Étages', defaultVisible: false },
  { id: 'created_at', label: 'Créé le', defaultVisible: false },
]

const FILTER_FIELDS: FilterField[] = [
  { id: 'type', label: 'Type', type: 'select', options: [
    { value: 'immeuble', label: 'Immeuble' },
    { value: 'maison', label: 'Maison' },
    { value: 'local_commercial', label: 'Local commercial' },
    { value: 'mixte', label: 'Mixte' },
  ]},
  { id: 'ville', label: 'Ville', type: 'text' },
  { id: 'designation', label: 'Désignation', type: 'text' },
  { id: 'nb_lots', label: 'Nb lots', type: 'number' },
  { id: 'nb_etages', label: 'Étages', type: 'number' },
  { id: 'annee_construction', label: 'Année', type: 'number' },
  { id: 'derniere_mission', label: 'Dernière mission', type: 'text' },
  { id: 'missions_a_venir', label: 'Missions à venir', type: 'number' },
  { id: 'created_at', label: 'Créé le', type: 'text' },
  { id: 'est_archive', label: 'Archivé', type: 'boolean' },
]

const typeIcons: Record<string, typeof Building2> = {
  immeuble: Building2, maison: Home, local_commercial: Store, mixte: Landmark, autre: Building2,
}

const typeLabels: Record<string, string> = {
  immeuble: 'Immeuble', maison: 'Maison', local_commercial: 'Local commercial', mixte: 'Mixte', autre: 'Autre',
}

const DEFAULT_COL_WIDTHS: Record<string, number> = {
  designation: 200,
  type: 112,
  adresse: 192,
  nb_lots: 56,
  nb_etages: 56,
  annee_construction: 64,
  derniere_mission: 96,
  missions_a_venir: 64,
  created_at: 96,
}

function ResizeHandle({ colId, onResizeStart, onResize }: {
  colId: string
  onResizeStart: () => void
  onResize: (id: string, delta: number) => void
}) {
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const startX = e.clientX
    onResizeStart()
    const onMouseMove = (ev: MouseEvent) => {
      onResize(colId, ev.clientX - startX)
    }
    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
    }
    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
  }
  return (
    <div
      onMouseDown={handleMouseDown}
      className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-primary/30 active:bg-primary/40 transition-colors z-10"
    />
  )
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
  const [colWidths, setColWidths] = useState<Record<string, number>>({ ...DEFAULT_COL_WIDTHS })
  const startWidths = useRef<Record<string, number>>({})
  const [displayCount, setDisplayCount] = useState(BATCH_SIZE)
  const sentinelRef = useRef<HTMLDivElement>(null)

  const handleResizeStart = useCallback(() => {
    startWidths.current = { ...colWidths }
  }, [colWidths])

  const handleResize = useCallback((colId: string, delta: number) => {
    setColWidths(prev => ({
      ...prev,
      [colId]: Math.max(40, (startWidths.current[colId] || prev[colId]) + delta),
    }))
  }, [])

  const debouncedSearch = useDebounce(search, 300)
  const navigate = useNavigate()
  const location = useLocation()
  const { visible: visibleCols, setVisible: setVisibleCols } = useColumnPreferences('patrimoine_batiments', BATIMENT_COLUMNS)

  // Restore map view when navigating back from a building detail
  useEffect(() => {
    if (location.state?.from === 'carte') setView('carte')
  }, [location.state])

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

  // Reset display count when filters/search change
  useEffect(() => {
    setDisplayCount(BATCH_SIZE)
  }, [debouncedSearch, dynamicFilters])

  const displayedBatiments = useMemo(
    () => filteredBatiments.slice(0, displayCount),
    [filteredBatiments, displayCount]
  )

  const hasMore = displayCount < filteredBatiments.length

  // Infinite scroll via IntersectionObserver
  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasMore) {
          setDisplayCount(prev => Math.min(prev + BATCH_SIZE, filteredBatiments.length))
        }
      },
      { threshold: 0.1 }
    )

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [hasMore, filteredBatiments.length])

  const isCol = (id: string) => visibleCols.includes(id)

  return (
    <div className="p-6 space-y-5">
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

      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-[13px] text-muted-foreground">
        <span>Référentiel</span>
        <ChevronRight className="h-3 w-3 text-border" />
        <span className="text-foreground font-medium">Parc immobilier</span>
      </nav>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[28px] font-bold tracking-[-0.5px] text-foreground">Parc immobilier</h1>
          <p className="text-[13px] text-muted-foreground mt-0.5">
            {isLoading ? '...' : `${filteredBatiments.length} bâtiment${filteredBatiments.length > 1 ? 's' : ''}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs"
            onClick={() => setShowImportCSV(true)}
          >
            <Upload className="h-3.5 w-3.5 mr-1.5" /> Import CSV
          </Button>
          <Button
            size="sm"
            onClick={() => setShowCreateLot(true)}
            className="h-8 text-xs shadow-lg shadow-primary/15"
          >
            <Plus className="h-3.5 w-3.5 mr-1.5" /> Nouveau lot
          </Button>
          <ColumnConfig
            page="patrimoine_batiments"
            columns={BATIMENT_COLUMNS}
            visibleColumns={visibleCols}
            onColumnsChange={setVisibleCols}
          />
          <div className="flex items-center bg-muted rounded-lg p-0.5 ml-1">
            <button
              onClick={() => setView('table')}
              className={`p-1.5 rounded-md transition-colors ${view === 'table' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <List className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setView('carte')}
              className={`p-1.5 rounded-md transition-colors ${view === 'carte' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
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
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
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
        <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
          {/* Table header */}
          <div className="flex items-center gap-4 px-4 py-2.5 bg-muted/50 border-b border-border text-[11px] font-bold text-muted-foreground uppercase tracking-wider select-none">
            <div className="w-6 shrink-0" /> {/* expand */}
            {isCol('designation') && (
              <div className="relative overflow-visible shrink-0" style={{ width: colWidths.designation, minWidth: 40 }}>
                Désignation
                <ResizeHandle colId="designation" onResizeStart={handleResizeStart} onResize={handleResize} />
              </div>
            )}
            {isCol('type') && (
              <div className="relative overflow-visible shrink-0" style={{ width: colWidths.type, minWidth: 40 }}>
                Type
                <ResizeHandle colId="type" onResizeStart={handleResizeStart} onResize={handleResize} />
              </div>
            )}
            {isCol('adresse') && (
              <div className="relative overflow-visible shrink-0" style={{ width: colWidths.adresse, minWidth: 40 }}>
                Adresse
                <ResizeHandle colId="adresse" onResizeStart={handleResizeStart} onResize={handleResize} />
              </div>
            )}
            {isCol('nb_lots') && (
              <div className="relative overflow-visible shrink-0 text-center" style={{ width: colWidths.nb_lots, minWidth: 40 }}>
                Lots
                <ResizeHandle colId="nb_lots" onResizeStart={handleResizeStart} onResize={handleResize} />
              </div>
            )}
            {isCol('nb_etages') && (
              <div className="relative overflow-visible shrink-0 text-center" style={{ width: colWidths.nb_etages, minWidth: 40 }}>
                Étages
                <ResizeHandle colId="nb_etages" onResizeStart={handleResizeStart} onResize={handleResize} />
              </div>
            )}
            {isCol('annee_construction') && (
              <div className="relative overflow-visible shrink-0 text-center" style={{ width: colWidths.annee_construction, minWidth: 40 }}>
                Année
                <ResizeHandle colId="annee_construction" onResizeStart={handleResizeStart} onResize={handleResize} />
              </div>
            )}
            {isCol('derniere_mission') && (
              <div className="relative overflow-visible shrink-0" style={{ width: colWidths.derniere_mission, minWidth: 40 }}>
                Dern. mission
                <ResizeHandle colId="derniere_mission" onResizeStart={handleResizeStart} onResize={handleResize} />
              </div>
            )}
            {isCol('missions_a_venir') && (
              <div className="relative overflow-visible shrink-0 text-center" style={{ width: colWidths.missions_a_venir, minWidth: 40 }}>
                À venir
                <ResizeHandle colId="missions_a_venir" onResizeStart={handleResizeStart} onResize={handleResize} />
              </div>
            )}
            {isCol('created_at') && (
              <div className="relative overflow-visible shrink-0" style={{ width: colWidths.created_at, minWidth: 40 }}>
                Créé le
                <ResizeHandle colId="created_at" onResizeStart={handleResizeStart} onResize={handleResize} />
              </div>
            )}
          </div>

          {isLoading && (
            <div className="divide-y divide-border/50">
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
            <div className="py-16 text-center text-muted-foreground text-sm">
              {search || dynamicFilters.length > 0 ? 'Aucun résultat' : 'Aucun bâtiment'}
            </div>
          )}

          {!isLoading && displayedBatiments.map((bat) => (
            <BatimentRow key={bat.id} batiment={bat} visibleCols={visibleCols} colWidths={colWidths} />
          ))}

          {/* Infinite scroll sentinel */}
          {!isLoading && hasMore && (
            <div ref={sentinelRef} className="py-4 text-center">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground mx-auto" />
            </div>
          )}

          {/* End of list indicator */}
          {!isLoading && !hasMore && filteredBatiments.length > BATCH_SIZE && (
            <div className="py-3 text-center text-[12px] text-muted-foreground/50">
              {filteredBatiments.length} bâtiment{filteredBatiments.length > 1 ? 's' : ''} affichés
            </div>
          )}
        </div>
      )}

      {view === 'carte' && <PatrimoineMap batiments={filteredBatiments} />}
    </div>
  )
}

function BatimentRow({ batiment, visibleCols, colWidths }: { batiment: Batiment; visibleCols: string[]; colWidths: Record<string, number> }) {
  const [expanded, setExpanded] = useState(false)
  const navigate = useNavigate()
  const Icon = typeIcons[batiment.type] || Building2
  const adresse = batiment.adresse_principale
  const isCol = (id: string) => visibleCols.includes(id)

  return (
    <div className="border-b border-border/50 last:border-b-0">
      <div
        className="flex items-center gap-4 px-4 py-2.5 hover:bg-accent/50 transition-colors cursor-pointer text-sm"
        onClick={() => navigate(`/app/patrimoine/batiments/${batiment.id}`)}
      >
        <button
          onClick={(e) => { e.stopPropagation(); setExpanded(!expanded) }}
          className="w-6 shrink-0 flex items-center justify-center p-0.5 rounded hover:bg-muted"
        >
          {expanded ? <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" /> : <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />}
        </button>
        {isCol('designation') && (
          <div className="shrink-0 flex items-center gap-2 min-w-0 overflow-hidden group" style={{ width: colWidths.designation }}>
            <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="font-bold text-foreground group-hover:text-primary truncate transition-colors">{batiment.designation}</span>
            {batiment.est_archive && <Badge variant="outline" className="text-[9px] text-muted-foreground">Archive</Badge>}
          </div>
        )}
        {isCol('type') && (
          <div className="shrink-0" style={{ width: colWidths.type }}>
            <Badge variant="outline" className="text-[10px] font-normal capitalize">{typeLabels[batiment.type]}</Badge>
          </div>
        )}
        {isCol('adresse') && (
          <div className="shrink-0 text-xs text-muted-foreground truncate" style={{ width: colWidths.adresse }}>
            {adresse ? `${adresse.rue}, ${adresse.ville}` : '—'}
          </div>
        )}
        {isCol('nb_lots') && <div className="shrink-0 text-center" style={{ width: colWidths.nb_lots }}><Badge variant="outline" className="text-[10px] font-medium">{batiment.nb_lots}</Badge></div>}
        {isCol('nb_etages') && <div className="shrink-0 text-center text-muted-foreground text-xs" style={{ width: colWidths.nb_etages }}>{batiment.nb_etages ?? '—'}</div>}
        {isCol('annee_construction') && <div className="shrink-0 text-center text-muted-foreground text-xs" style={{ width: colWidths.annee_construction }}>{batiment.annee_construction ?? '—'}</div>}
        {isCol('derniere_mission') && (
          <div className="shrink-0 text-xs text-muted-foreground" style={{ width: colWidths.derniere_mission }}>{batiment.derniere_mission ? formatDate(batiment.derniere_mission) : '—'}</div>
        )}
        {isCol('missions_a_venir') && (
          <div className="shrink-0 text-center" style={{ width: colWidths.missions_a_venir }}>
            {batiment.missions_a_venir > 0 ? (
              <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px]">{batiment.missions_a_venir}</Badge>
            ) : <span className="text-xs text-muted-foreground/50">—</span>}
          </div>
        )}
        {isCol('created_at') && (
          <div className="shrink-0 text-xs text-muted-foreground" style={{ width: colWidths.created_at }}>{formatDate(batiment.created_at)}</div>
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
      <div className="pl-10 pr-4 py-2 bg-muted/50">
        {[1, 2].map((i) => (
          <div key={i} className="grid grid-cols-[1fr_100px_60px_80px_70px_140px] gap-3 py-2">
            <Skeleton className="h-4" /><Skeleton className="h-4" /><Skeleton className="h-4" /><Skeleton className="h-4" /><Skeleton className="h-4" /><Skeleton className="h-4" />
          </div>
        ))}
      </div>
    )
  }

  if (!lots || lots.length === 0) return <div className="pl-10 pr-4 py-3 bg-muted/50 text-xs text-muted-foreground">Aucun lot</div>

  return (
    <div className="bg-muted/50 border-t border-border">
      {/* Sub-row column headers */}
      <div className="grid grid-cols-[1fr_100px_60px_80px_70px_140px] gap-3 pl-10 pr-4 py-1.5 text-[9px] font-bold text-muted-foreground uppercase tracking-wider border-b border-border/60">
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
            className="grid grid-cols-[1fr_100px_60px_80px_70px_140px] gap-3 pl-10 pr-4 py-2 hover:bg-accent/50 cursor-pointer transition-colors text-xs border-b border-border/30 last:border-b-0 items-center"
            onClick={() => navigate(`/app/patrimoine/lots/${lot.id}`)}
          >
            <div className="flex items-center gap-2 min-w-0 group">
              <Home className="h-3 w-3 text-muted-foreground/50 shrink-0" />
              <span className="font-bold text-foreground group-hover:text-primary truncate transition-colors">{lot.designation}</span>
            </div>
            <div><Badge variant="outline" className="text-[9px] capitalize font-normal">{lot.type_bien.replace('_', ' ')}</Badge></div>
            <div className="text-muted-foreground">{lot.etage || '—'}</div>
            <div className="text-muted-foreground">{lot.surface ? `${lot.surface} m²` : '—'}</div>
            <div>{lot.meuble ? <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[9px]">Meublé</Badge> : <span className="text-muted-foreground/50">—</span>}</div>
            <div className="text-muted-foreground truncate">{propLabel}</div>
          </div>
        )
      })}
    </div>
  )
}
