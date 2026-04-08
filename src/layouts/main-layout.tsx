import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom'
import { Building2, LayoutDashboard, ClipboardList, Users, Settings, LogOut, ChevronRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../hooks/use-auth'

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
      { label: 'Tiers', icon: Users, href: '/app/tiers', disabled: false },
    ],
  },
  {
    group: 'Administration',
    items: [
      { label: 'Paramètres', icon: Settings, href: '/app/parametres', disabled: false },
    ],
  },
]

function NavItem({ to, icon: Icon, label, disabled }: { to: string; icon: React.ElementType; label: string; disabled?: boolean }) {
  const location = useLocation()
  const isActive = location.pathname.startsWith(to)

  if (disabled) {
    return (
      <div className="flex items-center gap-3 px-6 py-2.5 text-muted-foreground/50 cursor-not-allowed border-l-[3px] border-transparent">
        <Icon size={18} strokeWidth={2} />
        <span className="text-[14px] font-medium">{label}</span>
        <span className="ml-auto text-[10px] font-bold bg-muted px-1.5 py-0.5 rounded text-muted-foreground/60">Bientôt</span>
      </div>
    )
  }

  return (
    <Link
      to={to}
      className={`flex items-center gap-3 px-6 py-2.5 transition-colors duration-200 border-l-[3px] ${
        isActive
          ? 'bg-primary/10 text-primary border-primary'
          : 'text-muted-foreground border-transparent hover:bg-accent hover:text-foreground'
      }`}
    >
      <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
      <span className="text-[14px] font-medium">{label}</span>
      {isActive && <ChevronRight size={14} className="ml-auto text-primary" />}
    </Link>
  )
}

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
    <div className="min-h-screen bg-background">
      {/* Sidebar — fixed, hand-coded, NOT shadcn */}
      <aside className="fixed left-0 top-0 bottom-0 w-[260px] bg-card border-r border-border flex flex-col z-50">
        {/* Logo */}
        <div className="p-6 mb-2">
          <Link to="/app/patrimoine" className="flex items-center gap-3 group">
            <div className="w-9 h-9 bg-primary rounded-lg shadow-lg shadow-primary/20 flex items-center justify-center transition-transform group-hover:scale-105">
              <Building2 size={20} className="text-primary-foreground" />
            </div>
            <span className="text-[19px] font-bold tracking-tight text-foreground">
              Immo<span className="text-primary">Checker</span>
            </span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto space-y-6 py-2">
          {navigation.map((group) => (
            <section key={group.group}>
              <div className="px-6 mb-2">
                <h3 className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  {group.group}
                </h3>
              </div>
              <div className="flex flex-col">
                {group.items.map((item) => (
                  <NavItem
                    key={item.href}
                    to={item.href}
                    icon={item.icon}
                    label={item.label}
                    disabled={item.disabled}
                  />
                ))}
              </div>
            </section>
          ))}
        </nav>

        {/* User section */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 p-2 rounded-xl">
            <div className="w-10 h-10 rounded-full bg-primary/10 border-2 border-card shadow-sm flex items-center justify-center text-primary font-bold text-[14px]">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-semibold text-foreground truncate">
                {user?.prenom} {user?.nom}
              </p>
              <p className="text-[12px] text-muted-foreground truncate">
                {workspace?.nom}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="mt-2 w-full flex items-center gap-2 px-3 py-2 text-[13px] text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
          >
            <LogOut size={16} />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="ml-[260px] min-h-screen">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  )
}
