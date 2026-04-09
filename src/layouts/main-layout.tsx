import { useState } from 'react'
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom'
import { LayoutGrid, CalendarCheck, Building, UsersRound, SlidersHorizontal, LogOut, ChevronRight, Pin, PinOff, Bell, PanelLeftClose, PanelLeft } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../hooks/use-auth'

const SIDEBAR_COLLAPSED_W = 64
const SIDEBAR_EXPANDED_W = 240
const ICON_PL = 'pl-[22px]' // fixed left padding so icons stay aligned in both states

const navigation = [
  {
    group: 'Opérationnel',
    items: [
      { label: 'Tableau de bord', icon: LayoutGrid, href: '/app/dashboard', disabled: true },
      { label: 'Missions', icon: CalendarCheck, href: '/app/missions', disabled: true },
    ],
  },
  {
    group: 'Référentiel',
    items: [
      { label: 'Parc immobilier', icon: Building, href: '/app/patrimoine', disabled: false },
      { label: 'Tiers', icon: UsersRound, href: '/app/tiers', disabled: false },
    ],
  },
  {
    group: 'Administration',
    items: [
      { label: 'Paramètres', icon: SlidersHorizontal, href: '/app/parametres', disabled: false },
    ],
  },
]

// Breadcrumb path mapping
const pathLabels: Record<string, string> = {
  app: '',
  patrimoine: 'Parc immobilier',
  batiments: 'Bâtiments',
  lots: 'Lots',
  tiers: 'Tiers',
  parametres: 'Paramètres',
  dashboard: 'Tableau de bord',
  missions: 'Missions',
}

function NavItem({ to, icon: Icon, label, disabled, expanded }: { to: string; icon: React.ElementType; label: string; disabled?: boolean; expanded: boolean }) {
  const location = useLocation()
  const isActive = location.pathname.startsWith(to)

  if (disabled) {
    return (
      <div className={`flex items-center gap-3 py-2.5 ${ICON_PL} pr-3 text-muted-foreground/40 cursor-not-allowed border-l-[3px] border-transparent`}>
        <Icon size={18} strokeWidth={1.5} className="shrink-0" />
        {expanded && (
          <>
            <span className="text-[13px] font-medium whitespace-nowrap">{label}</span>
            <span className="ml-auto text-[9px] font-semibold bg-muted px-1.5 py-0.5 rounded-full text-muted-foreground/50">Bientôt</span>
          </>
        )}
      </div>
    )
  }

  return (
    <Link
      to={to}
      className={`flex items-center gap-3 py-2.5 ${ICON_PL} pr-3 transition-colors duration-150 border-l-[3px] ${
        isActive
          ? 'bg-primary/8 text-primary border-primary'
          : 'text-muted-foreground border-transparent hover:bg-accent hover:text-foreground'
      }`}
    >
      <Icon size={18} strokeWidth={isActive ? 2 : 1.5} className="shrink-0" />
      {expanded && (
        <>
          <span className="text-[13px] font-medium whitespace-nowrap">{label}</span>
          {isActive && <ChevronRight size={14} className="ml-auto text-primary/60" />}
        </>
      )}
    </Link>
  )
}

export function MainLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, workspace, logout } = useAuth()
  const [hovered, setHovered] = useState(false)
  const [pinned, setPinned] = useState(false)

  const expanded = pinned || hovered

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  const initials = user ? `${user.prenom[0]}${user.nom[0]}`.toUpperCase() : '?'
  const sidebarWidth = expanded ? SIDEBAR_EXPANDED_W : SIDEBAR_COLLAPSED_W

  // Build breadcrumb from path
  const pathParts = location.pathname.split('/').filter(Boolean)
  const breadcrumbs: { label: string; href?: string }[] = []
  let href = ''
  for (const part of pathParts) {
    href += `/${part}`
    const label = pathLabels[part]
    if (label) breadcrumbs.push({ label, href })
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <aside
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{ width: sidebarWidth }}
        className="fixed left-0 top-0 bottom-0 bg-card border-r border-border flex flex-col z-50 transition-[width] duration-200 ease-in-out overflow-hidden"
      >
        {/* Top — Logo icon + Pin */}
        <div className={`h-14 flex items-center ${ICON_PL} pr-3 border-b border-border shrink-0`}>
          <Link to="/app/patrimoine" className="flex items-center gap-3 group">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shrink-0 transition-transform group-hover:scale-105">
              <Building size={16} className="text-primary-foreground" strokeWidth={2} />
            </div>
            {expanded && (
              <span className="text-[15px] font-bold tracking-tight text-foreground whitespace-nowrap">
                IC
              </span>
            )}
          </Link>
          {expanded && (
            <button
              onClick={() => setPinned(!pinned)}
              title={pinned ? 'Détacher la sidebar' : 'Épingler la sidebar'}
              className={`ml-auto h-7 w-7 rounded-md flex items-center justify-center transition-all duration-150 shrink-0
                ${pinned
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground/50 hover:text-muted-foreground hover:bg-accent'
                }`}
            >
              {pinned ? <PanelLeftClose size={15} strokeWidth={1.5} /> : <PanelLeft size={15} strokeWidth={1.5} />}
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 space-y-5">
          {navigation.map((group) => (
            <section key={group.group}>
              {expanded && (
                <div className={`${ICON_PL} mb-1.5`}>
                  <h3 className="text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-widest whitespace-nowrap">
                    {group.group}
                  </h3>
                </div>
              )}
              <div className="flex flex-col">
                {group.items.map((item) => (
                  <NavItem key={item.href} to={item.href} icon={item.icon} label={item.label} disabled={item.disabled} expanded={expanded} />
                ))}
              </div>
            </section>
          ))}
        </nav>

        {/* User section */}
        <div className={`border-t border-border py-3 ${ICON_PL} pr-3`}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-[11px] shrink-0">
              {initials}
            </div>
            {expanded && (
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-foreground truncate">
                  {user?.prenom} {user?.nom}
                </p>
                <p className="text-[11px] text-muted-foreground truncate">
                  {workspace?.nom}
                </p>
              </div>
            )}
          </div>
          {expanded && (
            <button
              onClick={handleLogout}
              className="mt-2 w-full flex items-center gap-2 px-1 py-1.5 text-[12px] text-muted-foreground hover:text-destructive hover:bg-destructive/5 rounded-md transition-colors"
            >
              <LogOut size={14} strokeWidth={1.5} />
              <span>Déconnexion</span>
            </button>
          )}
        </div>
      </aside>

      {/* Main content area */}
      <div
        style={{ marginLeft: sidebarWidth }}
        className="min-h-screen transition-[margin-left] duration-200 ease-in-out flex flex-col"
      >
        {/* Top header bar — breadcrumb + notification */}
        <header className="h-14 border-b border-border bg-card flex items-center justify-between px-6 shrink-0 sticky top-0 z-40">
          <nav className="flex items-center gap-1.5 text-[13px]">
            {breadcrumbs.map((b, i) => (
              <span key={i} className="flex items-center gap-1.5">
                {i > 0 && <ChevronRight className="h-3 w-3 text-muted-foreground/40" />}
                {i < breadcrumbs.length - 1 ? (
                  <Link to={b.href!} className="text-muted-foreground hover:text-foreground transition-colors">{b.label}</Link>
                ) : (
                  <span className="text-foreground font-medium">{b.label}</span>
                )}
              </span>
            ))}
          </nav>
          <button className="relative h-8 w-8 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
            <Bell size={18} strokeWidth={1.5} />
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-destructive" />
          </button>
        </header>

        {/* Page content */}
        <main className="flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}
