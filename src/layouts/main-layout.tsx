import { Outlet } from 'react-router-dom'
import { Building2, LayoutDashboard, ClipboardList, Users, Settings, LogOut, ChevronDown } from 'lucide-react'
import { cn } from '../lib/cn'
import { useLocation, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/use-auth'
import { Button } from '../components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu'

const navigation = [
  {
    group: 'Opérationnel',
    items: [
      { label: 'Tableau de bord', icon: LayoutDashboard, href: '/app/dashboard', disabled: true },
      { label: 'Missions', icon: ClipboardList, href: '/app/missions', disabled: true },
    ],
  },
  {
    group: 'Référentiel',
    items: [
      { label: 'Parc immobilier', icon: Building2, href: '/app/patrimoine', disabled: false },
      { label: 'Tiers', icon: Users, href: '/app/tiers', disabled: true },
    ],
  },
  {
    group: 'Administration',
    items: [
      { label: 'Paramètres', icon: Settings, href: '/app/parametres', disabled: false },
    ],
  },
]

export function MainLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, workspace, logout } = useAuth()

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  const initials = user ? `${user.prenom[0]}${user.nom[0]}`.toUpperCase() : '?'

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar — dark */}
      <aside className="w-60 flex flex-col shrink-0" style={{ background: 'var(--color-sidebar-bg)' }}>
        {/* Logo */}
        <div className="px-5 py-4" style={{ borderBottom: '1px solid var(--color-sidebar-border)' }}>
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-amber-500 flex items-center justify-center">
              <Building2 className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold" style={{ color: 'var(--color-sidebar-foreground)' }}>ImmoChecker</p>
              {workspace && (
                <p className="text-[11px] truncate" style={{ color: 'var(--color-sidebar-muted)' }}>{workspace.nom}</p>
              )}
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
          {navigation.map((group) => (
            <div key={group.group}>
              <p
                className="text-[10px] font-semibold uppercase tracking-widest px-3 mb-1.5"
                style={{ color: 'var(--color-sidebar-muted)' }}
              >
                {group.group}
              </p>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const isActive = location.pathname.startsWith(item.href)
                  return item.disabled ? (
                    <div
                      key={item.href}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-md text-[13px] cursor-not-allowed opacity-50"
                      style={{ color: '#9ca3af' }}
                      title="Bientôt disponible"
                    >
                      <item.icon className="h-[18px] w-[18px]" />
                      {item.label}
                    </div>
                  ) : (
                    <Link
                      key={item.href}
                      to={item.href}
                      className={cn(
                        'flex items-center gap-2.5 px-3 py-2 rounded-md text-[13px] font-medium transition-colors',
                      )}
                      style={isActive ? {
                        background: 'var(--color-sidebar-active-bg)',
                        color: 'var(--color-sidebar-active-text)',
                      } : {
                        color: 'var(--color-sidebar-foreground)',
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive) e.currentTarget.style.background = 'var(--color-sidebar-hover-bg)'
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) e.currentTarget.style.background = 'transparent'
                      }}
                    >
                      <item.icon className="h-[18px] w-[18px]" />
                      {item.label}
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* User section */}
        <div className="px-3 py-3" style={{ borderTop: '1px solid var(--color-sidebar-border)' }}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-md transition-colors"
                style={{ color: 'var(--color-sidebar-foreground)' }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-sidebar-hover-bg)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <div className="h-7 w-7 rounded-full bg-amber-500/20 flex items-center justify-center text-[11px] font-bold text-amber-400 shrink-0">
                  {initials}
                </div>
                <div className="flex-1 text-left min-w-0">
                  <p className="text-[12px] font-medium truncate">{user?.prenom} {user?.nom}</p>
                  <p className="text-[10px] truncate" style={{ color: 'var(--color-sidebar-muted)' }}>{user?.email}</p>
                </div>
                <ChevronDown className="h-3.5 w-3.5 opacity-50 shrink-0" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" side="top" className="w-48 mb-1">
              <div className="px-2 py-1.5">
                <p className="text-sm font-medium">{user?.prenom} {user?.nom}</p>
                <p className="text-xs text-muted-foreground">{workspace?.nom} — {user?.email}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                <LogOut className="h-4 w-4 mr-2" />
                Se déconnecter
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* Main content — light */}
      <div className="flex-1 flex flex-col overflow-hidden bg-background">
        {/* Topbar */}
        <header className="h-12 border-b border-border bg-card flex items-center justify-between px-6 shrink-0">
          <div />
          <div className="text-xs text-muted-foreground">
            {workspace?.nom}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-background">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
