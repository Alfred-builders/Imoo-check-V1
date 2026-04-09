import { useState } from 'react'
import { Search, Plus, User, Building2, Users, Briefcase } from 'lucide-react'
import { Input } from 'src/components/ui/input'
import { Button } from 'src/components/ui/button'
import { Badge } from 'src/components/ui/badge'
import { Skeleton } from 'src/components/ui/skeleton'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from 'src/components/ui/table'
import { useTiers, useTiersStats } from '../api'
import { CreateTiersModal } from './create-tiers-modal'
import { ResizeHandle, useResizableColumns } from '../../../components/shared/resizable-columns'
import { useNavigate } from 'react-router-dom'
import type { Tiers } from '../types'

type Tab = 'tous' | 'proprietaire' | 'locataire' | 'mandataire'

const DEFAULT_COL_WIDTHS = { avatar: 32, nom: 220, type: 96, email: 180, tel: 130, lots: 80, ville: 130 }

export function TiersPage() {
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState<Tab>('tous')
  const [showCreate, setShowCreate] = useState(false)
  const navigate = useNavigate()
  const { colWidths, onResizeStart, onResize } = useResizableColumns(DEFAULT_COL_WIDTHS)

  const role = tab === 'tous' ? undefined : tab
  const { data, isLoading } = useTiers({ search: search || undefined, role })
  const { data: stats } = useTiersStats()
  const tiersList = data?.data ?? []

  const tabs: { key: Tab; label: string; icon: typeof Users; count?: number }[] = [
    { key: 'tous', label: 'Tous', icon: Users, count: stats?.total },
    { key: 'proprietaire', label: 'Proprietaires', icon: User, count: stats?.proprietaires },
    { key: 'locataire', label: 'Locataires', icon: User },
    { key: 'mandataire', label: 'Mandataires', icon: Briefcase, count: stats?.mandataires },
  ]

  return (
    <div className="p-6 space-y-4">
      <CreateTiersModal open={showCreate} onOpenChange={setShowCreate} onCreated={(id) => navigate(`/app/tiers/${id}`)} />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[28px] font-bold tracking-[-0.5px] text-foreground">Tiers</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Proprietaires, locataires, mandataires</p>
        </div>
        <Button size="sm" onClick={() => setShowCreate(true)} className="shadow-lg shadow-primary/15 h-8 text-xs">
          <Plus className="h-3.5 w-3.5 mr-1" /> Nouveau tiers
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-muted rounded-lg p-0.5 w-fit">
        {tabs.map(({ key, label, count }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              tab === key ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {label} {count !== undefined && <span className="text-muted-foreground/60 ml-0.5">{count}</span>}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative w-72">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
        <Input placeholder="Rechercher un tiers..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8 h-8 text-xs" />
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <Table className="table-fixed">
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead className="h-9 px-4 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider select-none" style={{ width: colWidths.avatar }} />
              <TableHead className="relative h-9 px-0 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider select-none" style={{ width: colWidths.nom, minWidth: 40 }}>
                Nom / Raison sociale
                <ResizeHandle colId="nom" onResizeStart={onResizeStart} onResize={onResize} />
              </TableHead>
              <TableHead className="relative h-9 px-0 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider select-none" style={{ width: colWidths.type, minWidth: 40 }}>
                Type
                <ResizeHandle colId="type" onResizeStart={onResizeStart} onResize={onResize} />
              </TableHead>
              <TableHead className="relative h-9 px-0 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider select-none" style={{ width: colWidths.email, minWidth: 40 }}>
                Email
                <ResizeHandle colId="email" onResizeStart={onResizeStart} onResize={onResize} />
              </TableHead>
              <TableHead className="relative h-9 px-0 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider select-none" style={{ width: colWidths.tel, minWidth: 40 }}>
                Telephone
                <ResizeHandle colId="tel" onResizeStart={onResizeStart} onResize={onResize} />
              </TableHead>
              <TableHead className="relative h-9 px-0 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider select-none text-center" style={{ width: colWidths.lots, minWidth: 40 }}>
                Lots
                <ResizeHandle colId="lots" onResizeStart={onResizeStart} onResize={onResize} />
              </TableHead>
              <TableHead className="relative h-9 px-0 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider select-none" style={{ width: colWidths.ville, minWidth: 40 }}>
                Ville
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && [1,2,3,4].map(i => (
              <TableRow key={i}>
                <TableCell className="px-4 py-3"><div className="w-8" /></TableCell>
                <TableCell className="py-3" colSpan={5}><Skeleton className="h-4 w-full" /></TableCell>
                <TableCell className="py-3"><Skeleton className="h-4 w-20" /></TableCell>
              </TableRow>
            ))}

            {!isLoading && tiersList.length === 0 && (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={7} className="py-12 text-center text-muted-foreground text-sm">
                  {search ? 'Aucun resultat' : 'Aucun tiers'}
                </TableCell>
              </TableRow>
            )}

            {!isLoading && tiersList.map((tiers) => (
              <TiersRow key={tiers.id} tiers={tiers} colWidths={colWidths} onClick={() => {
                const name = tiers.type_personne === 'morale' ? (tiers.raison_sociale || tiers.nom) : `${tiers.prenom || ''} ${tiers.nom}`.trim()
                navigate(`/app/tiers/${tiers.id}`, { state: { breadcrumbs: [{ label: 'Tiers', href: '/app/tiers' }, { label: name }] } })
              }} />
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

function TiersRow({ tiers: t, colWidths, onClick }: { tiers: Tiers; colWidths: Record<string, number>; onClick: () => void }) {
  const displayName = t.type_personne === 'morale'
    ? t.raison_sociale || t.nom
    : `${t.prenom || ''} ${t.nom}`.trim()

  const nbLots = (t.nb_lots_proprio || 0) + (t.nb_lots_mandataire || 0)

  return (
    <TableRow
      className="cursor-pointer hover:bg-accent/50 border-border/30 text-sm"
      onClick={onClick}
    >
      <TableCell className="px-4 py-2.5" style={{ width: colWidths.avatar }}>
        <div className="flex justify-center">
          <div className={`h-7 w-7 rounded-full flex items-center justify-center shrink-0 ${t.type_personne === 'morale' ? 'bg-emerald-100' : 'bg-primary/10'}`}>
            {t.type_personne === 'morale'
              ? <Building2 className="h-3.5 w-3.5 text-emerald-700" />
              : <span className="text-[10px] font-bold text-primary">{(t.prenom?.[0] || t.nom[0]).toUpperCase()}</span>
            }
          </div>
        </div>
      </TableCell>
      <TableCell className="px-0 py-2.5 min-w-0" style={{ width: colWidths.nom }}>
        <p className="font-medium text-foreground truncate">{displayName}</p>
        {t.est_archive && <Badge variant="outline" className="text-[9px] text-muted-foreground">Archive</Badge>}
      </TableCell>
      <TableCell className="px-0 py-2.5" style={{ width: colWidths.type }}>
        <Badge className={`text-[10px] font-normal border ${t.type_personne === 'morale' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-primary/10 text-primary border-primary/20'}`}>
          {t.type_personne === 'morale' ? 'Morale' : 'Physique'}
        </Badge>
      </TableCell>
      <TableCell className="px-0 py-2.5 text-xs text-muted-foreground truncate" style={{ width: colWidths.email }}>{t.email || '—'}</TableCell>
      <TableCell className="px-0 py-2.5 text-xs text-muted-foreground" style={{ width: colWidths.tel }}>{t.tel || '—'}</TableCell>
      <TableCell className="px-0 py-2.5 text-center text-xs text-foreground font-medium" style={{ width: colWidths.lots }}>{nbLots || '—'}</TableCell>
      <TableCell className="px-0 py-2.5 text-xs text-muted-foreground truncate" style={{ width: colWidths.ville }}>{t.ville || '—'}</TableCell>
    </TableRow>
  )
}
