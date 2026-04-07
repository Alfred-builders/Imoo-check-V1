import { Outlet, useLocation, Link, useNavigate } from 'react-router-dom'
import { Building2, LayoutDashboard, ClipboardList, Users, Settings, LogOut, ChevronsUpDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../hooks/use-auth'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from '../components/ui/sidebar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu'

const navigation = [
  {
    group: 'OPÉRATIONNEL',
    items: [
      { label: 'Tableau de bord', icon: LayoutDashboard, href: '/app/dashboard', disabled: true },
      { label: 'Missions', icon: ClipboardList, href: '/app/missions', disabled: true },
    ],
  },
  {
    group: 'RÉFÉRENTIEL',
    items: [
      { label: 'Parc immobilier', icon: Building2, href: '/app/patrimoine', disabled: false },
      { label: 'Tiers', icon: Users, href: '/app/tiers', disabled: false },
    ],
  },
  {
    group: 'ADMINISTRATION',
    items: [
      { label: 'Paramètres', icon: Settings, href: '/app/parametres', disabled: false },
    ],
  },
]

const pageTransition = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -4 },
  transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] },
}

function AppSidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, workspace, logout } = useAuth()

  async function handleLogout() {
    await logout()
    navigate('/login')
  }

  const initials = user ? `${user.prenom[0]}${user.nom[0]}`.toUpperCase() : '?'

  return (
    <Sidebar>
      {/* Logo */}
      <SidebarHeader className="px-5 py-5">
        <Link to="/app/patrimoine" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#2563eb] shadow-lg shadow-blue-500/20">
            <Building2 className="h-5 w-5 text-white" />
          </div>
          <span className="text-[15px] font-medium text-slate-800">
            Immo<span className="text-[#2563eb] font-semibold">Checker</span>
          </span>
        </Link>
      </SidebarHeader>

      {/* Navigation */}
      <SidebarContent className="px-3">
        {navigation.map((group) => (
          <SidebarGroup key={group.group} className="py-1">
            <SidebarGroupLabel className="px-3 mb-1 text-[11px] font-semibold uppercase tracking-wider text-[#94a3b8]">
              {group.group}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const isActive = location.pathname.startsWith(item.href)
                  return (
                    <SidebarMenuItem key={item.href}>
                      {item.disabled ? (
                        <div className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-[#94a3b8] cursor-not-allowed border-l-[3px] border-transparent">
                          <item.icon className="h-[18px] w-[18px]" />
                          <span>{item.label}</span>
                        </div>
                      ) : (
                        <Link
                          to={item.href}
                          className={
                            isActive
                              ? 'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium bg-[#eff6ff] text-[#2563eb] border-l-[3px] border-[#2563eb] transition-colors'
                              : 'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-[#64748b] border-l-[3px] border-transparent hover:bg-slate-50 transition-colors'
                          }
                        >
                          <item.icon className="h-[18px] w-[18px]" />
                          <span>{item.label}</span>
                        </Link>
                      )}
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      {/* User footer */}
      <SidebarFooter className="border-t border-slate-100 px-4 py-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="w-full data-[state=open]:bg-slate-50"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-600">
                    {initials}
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold text-slate-800">{user?.prenom} {user?.nom}</span>
                    <span className="truncate text-xs text-[#94a3b8]">{user?.email}</span>
                  </div>
                  <ChevronsUpDown className="ml-auto h-4 w-4 text-[#94a3b8]" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56"
                side="bottom"
                align="end"
                sideOffset={4}
              >
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium text-slate-800">{user?.prenom} {user?.nom}</p>
                  <p className="text-xs text-[#94a3b8]">{workspace?.nom}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-500 focus:text-red-500">
                  <LogOut className="mr-2 h-4 w-4" />
                  Se déconnecter
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}

export function MainLayout() {
  const location = useLocation()

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <main className="flex-1 overflow-y-auto bg-[#f1f5f9]">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              {...pageTransition}
              className="min-h-full"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
