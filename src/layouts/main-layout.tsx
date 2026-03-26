import { Outlet } from 'react-router-dom'
import { Building2, LayoutDashboard, ClipboardList, Users, Settings, LogOut } from 'lucide-react'
import { cn } from '../lib/cn'
import { useLocation, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/use-auth'
import { Button } from '../components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
      { label: 'Paramètres', icon: Settings, href: '/app/parametres', disabled: true },
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
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-card flex flex-col shrink-0">
        <div className="p-5 border-b border-border">
          <h1 className="text-lg font-display font-bold text-primary">ImmoChecker</h1>
          {workspace && (
            <p className="text-xs text-muted-foreground mt-0.5 truncate">{workspace.nom}</p>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-6">
          {navigation.map((group) => (
            <div key={group.group}>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider px-3 mb-2">
                {group.group}
              </p>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const isActive = location.pathname.startsWith(item.href)
                  return item.disabled ? (
                    <div
                      key={item.href}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-muted-foreground/40 cursor-not-allowed"
                      title="Bientôt disponible"
                    >
                      <item.icon className="h-4 w-4" />
                      {item.label}
                    </div>
                  ) : (
                    <Link
                      key={item.href}
                      to={item.href}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
                        isActive
                          ? 'bg-primary/10 text-primary font-medium'
                          : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                      )}
                    >
                      <item.icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="h-14 border-b border-border bg-card flex items-center justify-between px-6 shrink-0">
          <div className="text-sm text-muted-foreground">
            {workspace?.nom}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 rounded-full p-0">
                <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-medium text-primary">
                  {initials}
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <div className="px-2 py-1.5 text-sm">
                <p className="font-medium">{user?.prenom} {user?.nom}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
              <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                <LogOut className="h-4 w-4 mr-2" />
                Se déconnecter
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
