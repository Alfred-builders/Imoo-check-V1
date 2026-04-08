import { useState } from 'react'
import { Search, Plus, User, Building2, Users, Briefcase } from 'lucide-react'
import { Input } from 'src/components/ui/input'
import { Button } from 'src/components/ui/button'
import { Badge } from 'src/components/ui/badge'
import { Skeleton } from 'src/components/ui/skeleton'
import { useTiers, useTiersStats } from '../api'
import { CreateTiersModal } from './create-tiers-modal'
import { useNavigate } from 'react-router-dom'
import type { Tiers } from '../types'

type Tab = 'tous' | 'proprietaire' | 'locataire' | 'mandataire'

export function TiersPage() {
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState<Tab>('tous')
  const [showCreate, setShowCreate] = useState(false)
  const navigate = useNavigate()

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

      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-[12px] text-muted-foreground">
        <span>Referentiel</span>
        <span>/</span>
        <span className="text-foreground font-medium">Tiers</span>
      </div>

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
        <div className="flex items-center gap-4 px-4 py-2.5 bg-muted/50 border-b border-border text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
          <div className="w-8" />
          <div className="flex-1 min-w-[150px]">Nom / Raison sociale</div>
          <div className="w-24">Type</div>
          <div className="w-40">Email</div>
          <div className="w-28">Telephone</div>
          <div className="w-20 text-center">Lots</div>
          <div className="w-28">Ville</div>
        </div>

        {isLoading && (
          <div className="divide-y divide-border/30">{[1,2,3,4].map(i => (
            <div key={i} className="flex items-center gap-4 px-4 py-3"><div className="w-8" /><Skeleton className="h-4 flex-1" /><Skeleton className="h-4 w-20" /></div>
          ))}</div>
        )}

        {!isLoading && tiersList.length === 0 && (
          <div className="py-12 text-center text-muted-foreground text-sm">
            {search ? 'Aucun resultat' : 'Aucun tiers'}
          </div>
        )}

        {!isLoading && tiersList.map((tiers) => (
          <TiersRow key={tiers.id} tiers={tiers} onClick={() => navigate(`/app/tiers/${tiers.id}`)} />
        ))}
      </div>
    </div>
  )
}

function TiersRow({ tiers: t, onClick }: { tiers: Tiers; onClick: () => void }) {
  const displayName = t.type_personne === 'morale'
    ? t.raison_sociale || t.nom
    : `${t.prenom || ''} ${t.nom}`.trim()

  const nbLots = (t.nb_lots_proprio || 0) + (t.nb_lots_mandataire || 0)

  return (
    <div
      className="flex items-center gap-4 px-4 py-2.5 hover:bg-accent/50 cursor-pointer transition-colors text-sm border-b border-border/30 last:border-b-0"
      onClick={onClick}
    >
      <div className="w-8 flex justify-center">
        <div className={`h-7 w-7 rounded-full flex items-center justify-center shrink-0 ${t.type_personne === 'morale' ? 'bg-emerald-100' : 'bg-primary/10'}`}>
          {t.type_personne === 'morale'
            ? <Building2 className="h-3.5 w-3.5 text-emerald-700" />
            : <span className="text-[10px] font-bold text-primary">{(t.prenom?.[0] || t.nom[0]).toUpperCase()}</span>
          }
        </div>
      </div>
      <div className="flex-1 min-w-[150px] min-w-0">
        <p className="font-medium text-foreground truncate">{displayName}</p>
        {t.est_archive && <Badge variant="outline" className="text-[9px] text-muted-foreground">Archive</Badge>}
      </div>
      <div className="w-24">
        <Badge className={`text-[10px] font-normal border ${t.type_personne === 'morale' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-primary/10 text-primary border-primary/20'}`}>
          {t.type_personne === 'morale' ? 'Morale' : 'Physique'}
        </Badge>
      </div>
      <div className="w-40 text-xs text-muted-foreground truncate">{t.email || '—'}</div>
      <div className="w-28 text-xs text-muted-foreground">{t.tel || '—'}</div>
      <div className="w-20 text-center text-xs text-foreground font-medium">{nbLots || '—'}</div>
      <div className="w-28 text-xs text-muted-foreground truncate">{t.ville || '—'}</div>
    </div>
  )
}
