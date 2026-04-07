import React, { useState } from 'react'
import {
  LayoutDashboard, Building2, Users, Users2, ClipboardList, Settings,
  Plus, Download, Search, MoreHorizontal, MoreVertical, Home, TrendingUp,
  ArrowUpRight, ArrowDownRight, Bell, ChevronRight, Filter, MapPin, LayoutGrid,
  Zap, BarChart3
} from 'lucide-react'

/* ═══════════════════════════════════════════════════════════════
   VIBE A — "Zaant Modern"
   Clean blue, gradient icons, multi-layer shadows, no borders
   ═══════════════════════════════════════════════════════════════ */

function VibeA() {
  const buildings = [
    { id: '1', designation: 'Résidence Belle-Vue', type: 'Immeuble' as const, address: '12 Rue de la Paix, 75002 Paris', lots: 24, lastMission: '12/05/2025' },
    { id: '2', designation: 'Villa des Pins', type: 'Maison' as const, address: '5 Av. des Fleurs, 06000 Nice', lots: 1, lastMission: '10/06/2025' },
    { id: '3', designation: 'Le Cristal', type: 'Immeuble' as const, address: '45 Blvd Haussmann, 75009 Paris', lots: 82, lastMission: '15/05/2025' },
    { id: '4', designation: 'Logis Vert', type: 'Immeuble' as const, address: '8 Rue Verte, 44000 Nantes', lots: 36, lastMission: '02/06/2025' },
    { id: '5', designation: "L'Alcôve", type: 'Maison' as const, address: '22 Chemin du Roy, 33000 Bordeaux', lots: 1, lastMission: '20/05/2025' },
  ]
  return (
    <div className="flex min-h-[700px] bg-[#f8fafc] font-sans antialiased text-slate-900">
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0">
        <div className="p-6 flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-blue-200"><Building2 size={22} /></div>
          <span className="text-xl font-bold tracking-tight">ImmoChecker</span>
        </div>
        <nav className="flex-1 mt-4">
          <div className="px-4 mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">Menu</div>
          {[{ icon: LayoutDashboard, label: 'Tableau de bord', active: false }, { icon: Building2, label: 'Parc immobilier', active: true }, { icon: Users, label: 'Tiers', active: false }, { icon: ClipboardList, label: 'Missions', active: false }, { icon: Settings, label: 'Paramètres', active: false }].map((item, i) => (
            <button key={i} className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all relative ${item.active ? 'text-blue-600 bg-blue-50/50' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}`}>
              {item.active && <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 rounded-r-full" />}
              <item.icon size={20} className={item.active ? 'text-blue-600' : 'text-slate-400'} />{item.label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50">
            <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">CD</div>
            <div className="flex-1 text-left"><p className="text-sm font-semibold">Cécile Dupont</p><p className="text-xs text-slate-500">Gestionnaire</p></div>
          </div>
        </div>
      </aside>
      <main className="flex-1">
        <header className="h-16 bg-white/80 backdrop-blur-md sticky top-0 z-40 border-b border-slate-200/50 px-8 flex items-center justify-between">
          <div><h1 className="text-xl font-bold">Parc immobilier</h1><p className="text-xs text-slate-500">Gestion de vos actifs</p></div>
          <div className="flex items-center gap-4">
            <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} /><input placeholder="Rechercher..." className="bg-slate-100 rounded-xl pl-10 pr-4 py-2 text-sm w-64 focus:ring-2 focus:ring-blue-500/20 focus:bg-white outline-none" /></div>
            <button className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-lg shadow-blue-200 active:scale-95"><Plus size={18} />Ajouter</button>
          </div>
        </header>
        <div className="p-8 space-y-8">
          <div className="grid grid-cols-4 gap-6">
            {[{ label: 'Bâtiments', value: '24', trend: '+12%', up: true, icon: Building2, grad: 'from-blue-500 to-indigo-600' },
              { label: 'Lots', value: '156', trend: '+4%', up: true, icon: Home, grad: 'from-emerald-400 to-teal-600' },
              { label: 'Missions', value: '8', trend: '-2', up: false, icon: ClipboardList, grad: 'from-violet-500 to-purple-600' },
              { label: 'Occupation', value: '92%', trend: '+1.2%', up: true, icon: TrendingUp, grad: 'from-orange-400 to-amber-600' },
            ].map((s, i) => (
              <div key={i} className="bg-white p-6 rounded-2xl shadow-[0_2px_4px_rgba(0,0,0,0.02),0_10px_20px_rgba(0,0,0,0.04)] hover:-translate-y-1 transition-transform">
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-2.5 rounded-xl bg-gradient-to-br ${s.grad} text-white shadow-lg`}><s.icon size={22} /></div>
                  <div className={`flex items-center gap-0.5 text-xs font-bold px-2 py-1 rounded-full ${s.up ? 'text-emerald-600 bg-emerald-50' : 'text-rose-600 bg-rose-50'}`}>{s.up ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}{s.trend}</div>
                </div>
                <p className="text-slate-500 text-sm font-medium">{s.label}</p>
                <h3 className="text-2xl font-bold text-slate-900">{s.value}</h3>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-2xl shadow-[0_2px_4px_rgba(0,0,0,0.02),0_10px_30px_rgba(0,0,0,0.04)] overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h2 className="font-bold text-slate-800">Liste des bâtiments</h2>
              <button className="flex items-center gap-2 text-xs font-bold text-slate-500 px-3 py-1.5 rounded-lg border border-slate-200 bg-white"><Download size={14} />Exporter</button>
            </div>
            <table className="w-full text-left"><thead><tr className="text-slate-400 text-[11px] font-bold uppercase tracking-wider">
              <th className="px-6 py-4">Désignation</th><th className="px-6 py-4">Type</th><th className="px-6 py-4">Adresse</th><th className="px-6 py-4 text-center">Lots</th><th className="px-6 py-4">Dernière mission</th><th className="px-6 py-4 text-right"></th>
            </tr></thead><tbody className="divide-y divide-slate-100">
              {buildings.map(b => (
                <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-4"><div className="flex items-center gap-3"><div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${b.type === 'Immeuble' ? 'bg-blue-100 text-blue-600' : 'bg-amber-100 text-amber-600'}`}>{b.designation.charAt(0)}</div><span className="font-semibold text-slate-900">{b.designation}</span></div></td>
                  <td className="px-6 py-4"><span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${b.type === 'Immeuble' ? 'bg-blue-50 text-blue-700' : 'bg-amber-50 text-amber-700'}`}>{b.type}</span></td>
                  <td className="px-6 py-4 text-sm text-slate-500">{b.address}</td>
                  <td className="px-6 py-4 text-center"><span className="bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full text-xs font-semibold">{b.lots}</span></td>
                  <td className="px-6 py-4"><div className="flex items-center gap-2 text-sm text-slate-600"><ClipboardList size={14} className="text-slate-400" />{b.lastMission}</div></td>
                  <td className="px-6 py-4 text-right"><button className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-200 rounded-lg"><MoreHorizontal size={18} /></button></td>
                </tr>
              ))}
            </tbody></table>
            <div className="p-4 border-t border-slate-100 flex items-center justify-between text-sm text-slate-500"><p>5 sur 24</p><div className="flex gap-2"><button disabled className="px-3 py-1 rounded-lg border border-slate-200 opacity-50">Précédent</button><button className="px-3 py-1 rounded-lg border border-slate-200 hover:bg-slate-50">Suivant</button></div></div>
          </div>
        </div>
      </main>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   VIBE B — "Notion Clean"
   Minimal, whitespace, indigo accent, shadow-only, big typo
   ═══════════════════════════════════════════════════════════════ */

function VibeB() {
  const NAV = [{ id: 'dashboard', label: 'Tableau de bord', icon: LayoutDashboard }, { id: 'property', label: 'Parc immobilier', icon: Building2 }, { id: 'tiers', label: 'Tiers', icon: Users }, { id: 'missions', label: 'Missions', icon: ClipboardList }, { id: 'settings', label: 'Paramètres', icon: Settings }]
  const STATS = [{ label: 'Bâtiments', value: '24' }, { label: 'Lots', value: '156' }, { label: 'Missions', value: '8' }, { label: 'Occupation', value: '92%' }]
  const PROPS = [{ name: 'Résidence les Lilas', address: '12 Rue de la Paix, Paris', units: 42, status: 'Complet' }, { name: 'Le Belvédère', address: '45 Avenue Foch, Lyon', units: 28, status: 'Maintenance' }, { name: 'Immeuble Haussmann', address: '8 Blvd Malesherbes, Paris', units: 12, status: 'Complet' }, { name: 'Technopole Sud', address: 'ZAC de la Plaine, Bordeaux', units: 5, status: 'Vacance' }, { name: 'Square des Arts', address: '3 Place du Capitole, Toulouse', units: 64, status: 'Complet' }]
  const active = 'property'
  return (
    <div className="flex min-h-[700px] bg-white text-slate-900 font-sans antialiased">
      <aside className="w-64 bg-[#fafafa] flex flex-col shrink-0 shadow-[20px_0_40px_-15px_rgba(0,0,0,0.03)]">
        <div className="p-8 flex items-center gap-3"><div className="w-8 h-8 bg-indigo-600 rounded flex items-center justify-center text-white font-bold text-lg">I</div><span className="font-bold text-xl uppercase italic tracking-tight">ImmoChecker</span></div>
        <nav className="flex-1 px-4 space-y-1 mt-4">
          {NAV.map(item => {
            const isActive = active === item.id
            return (<button key={item.id} className={`w-full flex items-center justify-between px-4 py-2.5 text-sm rounded-md ${isActive ? 'font-bold text-slate-900' : 'text-slate-500 hover:text-slate-900'}`}>
              <div className="flex items-center gap-3"><item.icon size={18} strokeWidth={isActive ? 2.5 : 2} className={isActive ? 'text-indigo-600' : 'text-slate-400'} /><span>{item.label}</span></div>
              {isActive && <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 mr-1" />}
            </button>)
          })}
        </nav>
        <div className="p-8 border-t border-slate-100"><div className="flex items-center gap-3"><div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center text-xs font-medium text-slate-600">JD</div><div><span className="text-sm font-semibold">Jean Dupont</span><br /><span className="text-xs text-slate-400">Admin</span></div></div></div>
      </aside>
      <main className="flex-1 overflow-y-auto">
        <header className="h-16 flex items-center justify-between px-10 border-b border-slate-50">
          <div className="flex items-center gap-2 text-xs text-slate-400 font-medium tracking-wide"><span>IMMOCHECKER</span><ChevronRight size={14} className="text-slate-300" /><span className="text-slate-600">PARC IMMOBILIER</span></div>
          <div className="flex items-center gap-6"><button className="text-slate-400 hover:text-slate-600"><Search size={20} /></button><button className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-indigo-700 active:scale-95"><Plus size={18} strokeWidth={3} />Nouveau</button></div>
        </header>
        <div className="p-10 max-w-7xl mx-auto">
          <div className="mb-12"><h1 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-2">Parc immobilier</h1><p className="text-slate-400 text-lg">Consultez et gérez l'ensemble de votre patrimoine.</p></div>
          <div className="grid grid-cols-4 gap-8 mb-16">
            {STATS.map((s, i) => (<div key={i} className="bg-white p-8 shadow-[0_1px_3px_rgba(0,0,0,0.05),0_10px_40px_-15px_rgba(0,0,0,0.05)] rounded-xl hover:-translate-y-1 transition-transform"><div className="text-3xl font-bold text-slate-900 mb-1">{s.value}</div><div className="text-sm font-medium text-slate-400 uppercase tracking-widest">{s.label}</div></div>))}
          </div>
          <div className="bg-white shadow-[0_1px_3px_rgba(0,0,0,0.05),0_20px_60px_-20px_rgba(0,0,0,0.1)] rounded-xl overflow-hidden">
            <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between"><h2 className="font-bold text-lg">Liste des actifs</h2><div className="flex gap-2"><button className="px-3 py-1.5 text-xs font-semibold text-slate-500 hover:bg-slate-50 rounded">Filtrer</button><button className="px-3 py-1.5 text-xs font-semibold text-slate-500 hover:bg-slate-50 rounded">Exporter</button></div></div>
            <table className="w-full text-left"><thead><tr className="border-b border-slate-100"><th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Bâtiment</th><th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Adresse</th><th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-center">Lots</th><th className="px-8 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Statut</th></tr></thead><tbody className="divide-y divide-slate-50">
              {PROPS.map((p, i) => (<tr key={i} className="hover:bg-slate-50/50 even:bg-[#fafafa]/40 transition-colors"><td className="px-8 py-6 font-bold text-base">{p.name}</td><td className="px-8 py-6 text-sm text-slate-500">{p.address}</td><td className="px-8 py-6 text-sm text-center font-medium">{p.units}</td><td className="px-8 py-6"><span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${p.status === 'Complet' ? 'text-emerald-700 bg-emerald-50' : p.status === 'Maintenance' ? 'text-amber-700 bg-amber-50' : 'text-indigo-700 bg-indigo-50'}`}>{p.status}</span></td></tr>))}
            </tbody></table>
            <div className="px-8 py-6 border-t border-slate-50 flex items-center justify-between text-sm text-slate-400"><span>5 sur 24</span><div className="flex gap-4"><button disabled className="opacity-30">Précédent</button><button className="hover:text-slate-900">Suivant</button></div></div>
          </div>
        </div>
      </main>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   VIBE C — "Dark Elite"
   Dark sidebar with purple glow, expanding hover, Apple+Vercel
   ═══════════════════════════════════════════════════════════════ */

function VibeC() {
  const NAV = [
    { id: 'dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
    { id: 'properties', label: 'Parc immobilier', icon: Building2 },
    { id: 'tiers', label: 'Tiers', icon: Users },
    { id: 'missions', label: 'Missions', icon: ClipboardList },
    { id: 'settings', label: 'Paramètres', icon: Settings },
  ]
  const active = 'properties'
  const KPI = [
    { label: 'Bâtiments', value: '24', icon: Building2 },
    { label: 'Lots', value: '156', icon: Home },
    { label: 'Missions', value: '8', icon: ClipboardList },
    { label: 'Occupation', value: '92%', icon: TrendingUp },
  ]
  const BLDG = [
    { name: 'Résidence Horizon', type: 'Immeuble', address: '12 Rue de la Paix, Paris', lots: 42, status: 'Actif' },
    { name: 'Villa des Pins', type: 'Maison', address: '5 Av. des Fleurs, Nice', lots: 1, status: 'Actif' },
    { name: 'Le Cristal', type: 'Immeuble', address: '45 Blvd Haussmann, Paris', lots: 82, status: 'Maintenance' },
    { name: 'Logis Vert', type: 'Immeuble', address: '8 Rue Verte, Nantes', lots: 36, status: 'Actif' },
    { name: "L'Alcôve", type: 'Maison', address: '22 Chemin du Roy, Bordeaux', lots: 1, status: 'Vacance' },
  ]

  return (
    <div className="flex min-h-[700px] bg-[#f5f5f7] font-sans antialiased text-slate-900">
      {/* Dark sidebar — hover expands from w-20 to w-64 */}
      <aside className="group/sidebar w-20 hover:w-64 bg-[#0c0f1a] flex flex-col shrink-0 transition-all duration-300 overflow-hidden">
        <div className="p-4 flex items-center gap-3 mb-6">
          <div className="w-12 h-12 shrink-0 bg-gradient-to-br from-purple-500 to-violet-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-purple-500/30">
            <Building2 size={22} />
          </div>
          <span className="text-white font-bold text-lg whitespace-nowrap opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-300">ImmoChecker</span>
        </div>
        <nav className="flex-1 px-3 space-y-1">
          {NAV.map(item => {
            const isA = active === item.id
            return (
              <button key={item.id} className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all whitespace-nowrap ${isA ? 'bg-purple-600/20 text-purple-400' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}>
                <item.icon size={20} className={`shrink-0 ${isA ? 'text-purple-400' : ''}`} />
                <span className={`text-sm opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-300 ${isA ? 'font-bold' : 'font-medium'}`}>{item.label}</span>
                {isA && <div className="ml-auto w-2 h-2 rounded-full bg-purple-400 shrink-0 opacity-0 group-hover/sidebar:opacity-100 transition-opacity" />}
              </button>
            )
          })}
        </nav>
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 shrink-0 rounded-full bg-slate-700 flex items-center justify-center text-white text-sm font-bold">ML</div>
            <div className="whitespace-nowrap opacity-0 group-hover/sidebar:opacity-100 transition-opacity duration-300">
              <p className="text-sm font-semibold text-white">Marie Laurent</p>
              <p className="text-xs text-slate-500">Admin</p>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <header className="h-16 bg-white/80 backdrop-blur-md px-8 flex items-center justify-between border-b border-slate-200/50">
          <h1 className="text-xl font-bold text-slate-900">Parc immobilier</h1>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input placeholder="Rechercher..." className="bg-slate-100 rounded-lg pl-9 pr-4 py-2 text-sm w-56 outline-none focus:ring-2 focus:ring-purple-500/20" />
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-[#0c0f1a] text-white rounded-lg text-sm font-semibold hover:bg-[#1a1f35] active:scale-95">
              <Plus size={16} />Ajouter
            </button>
          </div>
        </header>

        <div className="p-8 space-y-8">
          {/* KPI with dark icon circles */}
          <div className="grid grid-cols-4 gap-6">
            {KPI.map((k, i) => (
              <div key={i} className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-11 h-11 bg-slate-900 rounded-xl flex items-center justify-center">
                    <k.icon size={20} className="text-white" />
                  </div>
                  <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">+5%</span>
                </div>
                <p className="text-sm text-slate-500 font-medium">{k.label}</p>
                <h3 className="text-2xl font-bold text-slate-900 mt-1">{k.value}</h3>
              </div>
            ))}
          </div>

          {/* Table with alternating rows + status dots */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-5 flex items-center justify-between border-b border-slate-100">
              <h2 className="font-bold text-slate-800">Liste des bâtiments</h2>
              <button className="text-xs font-semibold text-slate-500 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50"><Download size={14} className="inline mr-1.5" />Exporter</button>
            </div>
            <table className="w-full text-left">
              <thead>
                <tr className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="px-6 py-4">Désignation</th><th className="px-6 py-4">Type</th><th className="px-6 py-4">Adresse</th><th className="px-6 py-4 text-center">Lots</th><th className="px-6 py-4">Statut</th><th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody>
                {BLDG.map((b, i) => (
                  <tr key={i} className={`${i % 2 === 1 ? 'bg-slate-50/60' : ''} hover:bg-slate-100/50 transition-colors`}>
                    <td className="px-6 py-4 font-semibold text-slate-900">{b.name}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{b.type}</td>
                    <td className="px-6 py-4 text-sm text-slate-500">{b.address}</td>
                    <td className="px-6 py-4 text-center text-sm font-medium text-slate-700">{b.lots}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${b.status === 'Actif' ? 'bg-emerald-500' : b.status === 'Maintenance' ? 'bg-amber-500' : 'bg-slate-400'}`} />
                        <span className="text-sm text-slate-600">{b.status}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right"><button className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"><MoreHorizontal size={16} /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between text-sm text-slate-500">
              <span>5 sur 24</span>
              <div className="flex gap-2">
                <button disabled className="px-3 py-1 rounded-lg border border-slate-200 opacity-50 text-sm">Précédent</button>
                <button className="px-3 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 text-sm">Suivant</button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   VIBE D — "Stripe Refined"
   Pure white sidebar, text-only nav, Stripe purple-blue, sparklines
   ═══════════════════════════════════════════════════════════════ */

function VibeD_Stripe() {
  const NAV = [
    { id: 'dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
    { id: 'properties', label: 'Parc immobilier', icon: Building2 },
    { id: 'tiers', label: 'Tiers', icon: Users },
    { id: 'missions', label: 'Missions', icon: ClipboardList },
    { id: 'settings', label: 'Paramètres', icon: Settings },
  ]
  const active = 'properties'
  const KPI = [
    { label: 'Bâtiments', value: '24', pct: 72 },
    { label: 'Lots', value: '156', pct: 85 },
    { label: 'Missions', value: '8', pct: 45 },
    { label: 'Occupation', value: '92%', pct: 92 },
  ]
  const BLDG = [
    { name: 'Résidence Horizon', address: '12 Rue de la Paix, Paris', lots: 42, status: 'Actif' },
    { name: 'Villa des Pins', address: '5 Av. des Fleurs, Nice', lots: 1, status: 'Actif' },
    { name: 'Le Cristal', address: '45 Blvd Haussmann, Paris', lots: 82, status: 'Maintenance' },
    { name: 'Logis Vert', address: '8 Rue Verte, Nantes', lots: 36, status: 'Actif' },
    { name: "L'Alcôve", address: '22 Chemin du Roy, Bordeaux', lots: 1, status: 'Vacance' },
  ]

  return (
    <div className="flex min-h-[700px] bg-[#f7f7f8] font-sans antialiased text-slate-900">
      {/* Pure white sidebar, text-only nav */}
      <aside className="w-60 bg-white flex flex-col shrink-0 border-r border-slate-200">
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-[#635bff] rounded-md flex items-center justify-center text-white text-sm font-bold shadow-sm">IC</div>
          <span className="text-lg font-semibold tracking-tight text-slate-800">ImmoChecker</span>
        </div>
        <nav className="flex-1 mt-2 px-3 space-y-0.5">
          {NAV.map(item => {
            const isA = active === item.id
            return (
              <button key={item.id} className={`group w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-md transition-all relative ${isA ? 'font-semibold text-[#635bff]' : 'text-slate-500 hover:text-slate-800'}`}>
                {isA && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-[#635bff] rounded-r" />}
                <item.icon size={18} className={`${isA ? 'text-[#635bff]' : 'text-slate-400 opacity-0 group-hover:opacity-100'} transition-opacity`} />
                <span>{item.label}</span>
              </button>
            )
          })}
        </nav>
        <div className="p-5 border-t border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#635bff]/10 flex items-center justify-center text-[#635bff] text-xs font-bold">PD</div>
            <div><p className="text-sm font-medium text-slate-700">Pierre Duval</p><p className="text-xs text-slate-400">Admin</p></div>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <header className="h-14 bg-white px-8 flex items-center justify-between border-b border-slate-200">
          <h1 className="text-base font-semibold text-slate-800">Parc immobilier</h1>
          <div className="flex items-center gap-3">
            <button className="text-slate-400 hover:text-slate-600"><Search size={18} /></button>
            <button className="flex items-center gap-2 px-4 py-2 bg-[#635bff] text-white rounded-md text-sm font-medium hover:bg-[#524de8] active:scale-95"><Plus size={16} />Ajouter</button>
          </div>
        </header>

        <div className="p-8 space-y-8">
          {/* Stat cards with sparkline progress bars */}
          <div className="grid grid-cols-4 gap-5">
            {KPI.map((k, i) => (
              <div key={i} className="bg-white p-5 rounded-xl border border-slate-200 hover:border-[#635bff]/30 transition-colors">
                <p className="text-sm text-slate-500 mb-1">{k.label}</p>
                <h3 className="text-2xl font-bold text-slate-900 mb-3">{k.value}</h3>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-[#635bff] rounded-full transition-all" style={{ width: `${k.pct}%` }} />
                </div>
              </div>
            ))}
          </div>

          {/* Table with no header bg, just border */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 flex items-center justify-between">
              <h2 className="font-semibold text-slate-800">Liste des bâtiments</h2>
              <div className="flex gap-2">
                <button className="text-xs text-slate-500 hover:text-slate-800 px-3 py-1.5 rounded border border-slate-200 hover:border-slate-300">Filtrer</button>
                <button className="text-xs text-slate-500 hover:text-slate-800 px-3 py-1.5 rounded border border-slate-200 hover:border-slate-300">Exporter</button>
              </div>
            </div>
            <table className="w-full text-left">
              <thead>
                <tr className="border-t border-b border-slate-200">
                  <th className="px-6 py-3 text-xs font-medium text-slate-500">Désignation</th>
                  <th className="px-6 py-3 text-xs font-medium text-slate-500">Adresse</th>
                  <th className="px-6 py-3 text-xs font-medium text-slate-500 text-center">Lots</th>
                  <th className="px-6 py-3 text-xs font-medium text-slate-500">Statut</th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {BLDG.map((b, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-slate-900">{b.name}</td>
                    <td className="px-6 py-4 text-sm text-slate-500">{b.address}</td>
                    <td className="px-6 py-4 text-sm text-center text-slate-700">{b.lots}</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded ${b.status === 'Actif' ? 'text-emerald-700 bg-emerald-50' : b.status === 'Maintenance' ? 'text-amber-700 bg-amber-50' : 'text-slate-600 bg-slate-100'}`}>{b.status}</span>
                    </td>
                    <td className="px-6 py-4 text-right"><button className="p-1 text-slate-400 hover:text-slate-700"><MoreHorizontal size={16} /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between text-sm text-slate-500">
              <span>5 sur 24</span>
              <div className="flex gap-2">
                <button disabled className="px-3 py-1 text-sm border border-slate-200 rounded opacity-50">Précédent</button>
                <button className="px-3 py-1 text-sm border border-slate-200 rounded hover:border-slate-300">Suivant</button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   VIBE E — "Warm Neutral"
   Warm white sidebar, stone palette, orange primary, Airbnb energy
   ═══════════════════════════════════════════════════════════════ */

function VibeE() {
  const NAV = [
    { id: 'dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
    { id: 'properties', label: 'Parc immobilier', icon: Building2 },
    { id: 'tiers', label: 'Tiers', icon: Users },
    { id: 'missions', label: 'Missions', icon: ClipboardList },
    { id: 'settings', label: 'Paramètres', icon: Settings },
  ]
  const active = 'properties'
  const KPI = [
    { label: 'Bâtiments', value: '24', icon: Building2, pct: 72 },
    { label: 'Lots', value: '156', icon: Home, pct: 85 },
    { label: 'Missions actives', value: '8', icon: ClipboardList, pct: 45 },
    { label: 'Taux occupation', value: '92%', icon: TrendingUp, pct: 92 },
  ]
  const BLDG = [
    { name: 'Résidence Horizon', type: 'Immeuble', address: '12 Rue de la Paix, Paris', lots: 42, health: 95 },
    { name: 'Villa des Pins', type: 'Maison', address: '5 Av. des Fleurs, Nice', lots: 1, health: 88 },
    { name: 'Le Cristal', type: 'Immeuble', address: '45 Blvd Haussmann, Paris', lots: 82, health: 72 },
    { name: 'Logis Vert', type: 'Immeuble', address: '8 Rue Verte, Nantes', lots: 36, health: 91 },
    { name: "L'Alcôve", type: 'Maison', address: '22 Chemin du Roy, Bordeaux', lots: 1, health: 60 },
  ]

  return (
    <div className="flex min-h-[700px] bg-stone-50 font-sans antialiased text-stone-900">
      {/* Warm white sidebar */}
      <aside className="w-64 bg-[#fefdfb] flex flex-col shrink-0 border-r border-stone-200">
        <div className="p-6 flex items-center gap-3">
          <div className="w-9 h-9 bg-orange-600 rounded-lg flex items-center justify-center text-white shadow-sm">
            <Building2 size={20} />
          </div>
          <span className="text-lg font-bold tracking-tight text-stone-800">ImmoChecker</span>
        </div>
        <nav className="flex-1 mt-4 px-3 space-y-1">
          {NAV.map(item => {
            const isA = active === item.id
            return (
              <button key={item.id} className={`w-full flex items-center gap-3 px-4 py-3 text-sm rounded-lg transition-all relative ${isA ? 'bg-stone-100 text-stone-900 font-semibold' : 'text-stone-500 hover:text-stone-800 hover:bg-stone-50'}`}>
                {isA && <div className="absolute left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-orange-500 rounded-full" />}
                <item.icon size={18} className={isA ? 'text-orange-600' : 'text-stone-400'} />
                <span>{item.label}</span>
              </button>
            )
          })}
        </nav>
        <div className="p-5 border-t border-stone-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center text-orange-700 text-sm font-bold">AL</div>
            <div><p className="text-sm font-semibold text-stone-700">Anne Leclerc</p><p className="text-xs text-stone-400">Gestionnaire</p></div>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <header className="h-16 bg-[#fefdfb]/80 backdrop-blur-md px-8 flex items-center justify-between border-b border-stone-200/50">
          <div>
            <h1 className="text-xl font-bold text-stone-900">Parc immobilier</h1>
            <p className="text-xs text-stone-400">Vos actifs en un coup d'oeil</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={16} />
              <input placeholder="Rechercher..." className="bg-stone-100 rounded-lg pl-9 pr-4 py-2 text-sm w-56 outline-none focus:ring-2 focus:ring-orange-500/20" />
            </div>
            <button className="flex items-center gap-2 px-4 py-2.5 bg-orange-600 text-white rounded-lg text-sm font-semibold hover:bg-orange-700 active:scale-95"><Plus size={16} />Ajouter</button>
          </div>
        </header>

        <div className="p-8 space-y-8">
          {/* KPI as horizontal bars */}
          <div className="grid grid-cols-4 gap-5">
            {KPI.map((k, i) => (
              <div key={i} className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-stone-100 rounded-lg flex items-center justify-center">
                    <k.icon size={18} className="text-orange-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-stone-900">{k.value}</h3>
                    <p className="text-xs text-stone-500">{k.label}</p>
                  </div>
                </div>
                <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
                  <div className="h-full bg-orange-500 rounded-full" style={{ width: `${k.pct}%` }} />
                </div>
              </div>
            ))}
          </div>

          {/* Table with warm stone colors + health bars */}
          <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
            <div className="px-6 py-5 flex items-center justify-between border-b border-stone-100">
              <h2 className="font-bold text-stone-800">Liste des bâtiments</h2>
              <button className="text-xs font-medium text-stone-500 px-3 py-1.5 rounded-lg border border-stone-200 hover:bg-stone-50"><Download size={14} className="inline mr-1.5" />Exporter</button>
            </div>
            <table className="w-full text-left">
              <thead>
                <tr className="text-[11px] font-bold uppercase tracking-wider text-stone-400 border-b border-stone-100">
                  <th className="px-6 py-4">Désignation</th><th className="px-6 py-4">Type</th><th className="px-6 py-4">Adresse</th><th className="px-6 py-4 text-center">Lots</th><th className="px-6 py-4">Santé</th><th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {BLDG.map((b, i) => (
                  <tr key={i} className="hover:bg-stone-50/50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-stone-900">{b.name}</td>
                    <td className="px-6 py-4"><span className={`text-xs font-medium px-2 py-0.5 rounded ${b.type === 'Immeuble' ? 'bg-orange-50 text-orange-700' : 'bg-stone-100 text-stone-600'}`}>{b.type}</span></td>
                    <td className="px-6 py-4 text-sm text-stone-500">{b.address}</td>
                    <td className="px-6 py-4 text-center text-sm font-medium text-stone-700">{b.lots}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-stone-100 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${b.health >= 90 ? 'bg-emerald-500' : b.health >= 75 ? 'bg-orange-400' : 'bg-rose-500'}`} style={{ width: `${b.health}%` }} />
                        </div>
                        <span className="text-xs text-stone-500">{b.health}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right"><button className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100"><MoreHorizontal size={16} /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="px-6 py-4 border-t border-stone-100 flex items-center justify-between text-sm text-stone-500">
              <span>5 sur 24</span>
              <div className="flex gap-2">
                <button disabled className="px-3 py-1 rounded-lg border border-stone-200 opacity-50 text-sm">Précédent</button>
                <button className="px-3 py-1 rounded-lg border border-stone-200 hover:bg-stone-50 text-sm">Suivant</button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   VIBE F — "Rounded Pastel"
   Violet primary, pastel KPI cards, very rounded, playful
   ═══════════════════════════════════════════════════════════════ */

function VibeF() {
  const NAV = [{ id: 'dashboard', label: 'Tableau de bord', icon: LayoutDashboard, color: 'text-blue-500', pill: 'bg-blue-50' }, { id: 'properties', label: 'Parc immobilier', icon: Building2, color: 'text-violet-500', pill: 'bg-violet-50' }, { id: 'tiers', label: 'Tiers', icon: Users2, color: 'text-emerald-500', pill: 'bg-emerald-50' }, { id: 'missions', label: 'Missions', icon: ClipboardList, color: 'text-amber-500', pill: 'bg-amber-50' }, { id: 'settings', label: 'Paramètres', icon: Settings, color: 'text-gray-500', pill: 'bg-gray-50' }]
  const KPI = [{ label: 'Bâtiments', value: 24, icon: Building2, bg: 'bg-blue-50', ic: 'text-blue-600' }, { label: 'Lots', value: 156, icon: Home, bg: 'bg-emerald-50', ic: 'text-emerald-600' }, { label: 'Missions', value: 8, icon: ClipboardList, bg: 'bg-violet-50', ic: 'text-violet-600' }, { label: 'Occupation', value: '92%', icon: Users2, bg: 'bg-amber-50', ic: 'text-amber-600' }]
  const BLDG = [{ name: 'Résidence Horizon', address: '12 Rue de la Paix, Paris', units: 42, type: 'Résidentiel', status: 'Complet' }, { name: 'Espace Lumière', address: '45 Av. des Champs, Lyon', units: 12, type: 'Commercial', status: 'Maintenance' }, { name: 'Le Belvédère', address: '8 Blvd de la Mer, Marseille', units: 28, type: 'Mixte', status: 'Partiel' }, { name: 'Villa Jade', address: '5 Impasse des Pins, Nice', units: 4, type: 'Résidentiel', status: 'Complet' }, { name: 'Technopole Sud', address: "300 Rue de l'Innovation, Toulouse", units: 65, type: 'Commercial', status: 'Complet' }]
  const active = 'properties'
  return (
    <div className="flex min-h-[700px] bg-[#fffffe] font-sans text-slate-900">
      <aside className="w-72 bg-white border-r border-slate-100 p-6 flex flex-col shrink-0">
        <div className="flex items-center gap-3 px-2 mb-10"><div className="w-10 h-10 bg-violet-600 rounded-xl flex items-center justify-center shadow-md shadow-violet-200"><Building2 className="text-white w-6 h-6" /></div><h1 className="text-xl font-black tracking-tight uppercase">Immo<span className="text-violet-600">Checker</span></h1></div>
        <nav className="flex-1">
          {NAV.map(item => {
            const isA = active === item.id
            return (<button key={item.id} className={`group flex items-center w-full px-4 py-3 mb-2 transition-all rounded-xl ${isA ? 'bg-violet-600 text-white shadow-lg shadow-violet-200' : 'text-slate-600 hover:bg-slate-50'}`}>
              <div className={`flex items-center justify-center w-9 h-9 rounded-lg mr-3 ${isA ? 'bg-white/20' : item.pill}`}><item.icon className={`w-5 h-5 ${isA ? 'text-white' : item.color}`} /></div>
              <span className={`text-sm font-medium ${isA && 'font-bold'}`}>{item.label}</span>
              {isA && <div className="ml-auto w-1.5 h-1.5 bg-white rounded-full" />}
            </button>)
          })}
        </nav>
        <div className="mt-auto pt-6 border-t border-slate-100"><div className="bg-slate-50 rounded-2xl p-4 flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-violet-200 border-2 border-white flex items-center justify-center font-bold text-violet-700 text-sm">SB</div><div className="flex-1 min-w-0"><p className="text-sm font-bold truncate">Sophie Bernard</p><p className="text-xs text-slate-500">Admin</p></div></div></div>
      </aside>
      <main className="flex-1 overflow-y-auto p-8">
        <header className="flex items-center justify-between mb-10">
          <div><h2 className="text-2xl font-bold">Parc immobilier</h2><p className="text-slate-500 text-sm">Gérez vos actifs immobiliers.</p></div>
          <div className="flex items-center gap-4">
            <div className="relative"><Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" /><input placeholder="Rechercher..." className="pl-11 pr-6 py-2.5 bg-slate-50 rounded-full w-64 text-sm focus:ring-2 focus:ring-violet-200 outline-none" /></div>
            <button className="bg-violet-600 hover:bg-violet-700 text-white px-5 py-2.5 rounded-full flex items-center gap-2 font-bold text-sm shadow-lg shadow-violet-200 active:scale-95"><Plus className="w-4 h-4" />Ajouter</button>
          </div>
        </header>
        <div className="grid grid-cols-4 gap-6 mb-8">
          {KPI.map((k, i) => (<div key={i} className={`relative overflow-hidden p-6 rounded-3xl border border-white transition-transform hover:scale-[1.02] ${k.bg}`}><div className="flex items-start justify-between"><div><p className="text-slate-500 font-medium text-sm mb-1">{k.label}</p><h3 className="text-3xl font-bold text-slate-800">{k.value}</h3></div><div className="bg-white w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm"><k.icon className={`w-6 h-6 ${k.ic}`} /></div></div><div className="absolute -bottom-4 -right-4 w-24 h-24 bg-white/30 rounded-full blur-2xl" /></div>))}
        </div>
        <section className="bg-white rounded-[32px] border border-slate-100 shadow-xl shadow-slate-100/50 overflow-hidden">
          <div className="px-8 py-6 flex items-center justify-between border-b border-slate-50"><h3 className="font-bold">Liste des bâtiments</h3><div className="flex gap-2"><button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-xl"><Filter className="w-4 h-4" />Filtrer</button></div></div>
          <table className="w-full text-left"><thead><tr className="text-slate-400 uppercase text-[11px] font-bold tracking-wider"><th className="px-8 py-4">Bâtiment</th><th className="px-8 py-4">Localisation</th><th className="px-8 py-4 text-center">Unités</th><th className="px-8 py-4">Type</th><th className="px-8 py-4">Statut</th><th className="px-8 py-4"></th></tr></thead><tbody className="divide-y divide-slate-50">
            {BLDG.map((b, i) => (<tr key={i} className="group hover:bg-slate-50/50 transition-colors"><td className="px-8 py-5"><div className="flex items-center gap-3"><div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500 group-hover:bg-violet-100 group-hover:text-violet-600 transition-colors"><Home className="w-5 h-5" /></div><span className="font-bold text-slate-700">{b.name}</span></div></td><td className="px-8 py-5"><div className="flex items-center gap-1.5 text-slate-500 text-sm"><MapPin className="w-3.5 h-3.5" />{b.address}</div></td><td className="px-8 py-5 text-center font-semibold text-slate-700">{b.units}</td><td className="px-8 py-5"><span className={`px-3 py-1 rounded-full text-xs font-semibold ${b.type === 'Résidentiel' ? 'bg-blue-100 text-blue-700' : b.type === 'Commercial' ? 'bg-violet-100 text-violet-700' : 'bg-amber-100 text-amber-700'}`}>{b.type}</span></td><td className="px-8 py-5"><div className="flex items-center gap-2"><div className={`w-2 h-2 rounded-full ${b.status === 'Complet' ? 'bg-emerald-500' : b.status === 'Partiel' ? 'bg-amber-500' : 'bg-rose-500'}`} /><span className="text-sm font-medium text-slate-600">{b.status}</span></div></td><td className="px-8 py-5 text-right"><button className="p-2 text-slate-300 hover:text-slate-600 rounded-lg"><ChevronRight className="w-5 h-5" /></button></td></tr>))}
          </tbody></table>
          <div className="px-8 py-6 bg-slate-50/50 border-t border-slate-50 flex items-center justify-between"><p className="text-xs text-slate-500 font-medium">5 sur 24</p><div className="flex gap-2"><button disabled className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-400 opacity-50">Précédent</button><button className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:border-violet-300">Suivant</button></div></div>
        </section>
      </main>
    </div>
  )
}

/* ═══════════════════════════════════════════════════════════════
   VIBES SELECTION PAGE
   ═══════════════════════════════════════════════════════════════ */

export default function VibesSelection() {
  const [selected, setSelected] = useState<string | null>(null)
  const vibes = [
    { id: '1', name: 'Zaant Modern', desc: 'Blue primary, gradient icons, multi-layer shadows, sticky header, Intercom/Linear energy', color: 'ring-blue-500' },
    { id: '2', name: 'Notion Clean', desc: 'Ultra-minimal, whitespace-heavy, indigo accent, typography-driven, Vercel/Cal.com energy', color: 'ring-indigo-500' },
    { id: '3', name: 'Dark Elite', desc: 'Dark expanding sidebar, purple glow, dark icon circles, alternating rows, Apple/Vercel energy', color: 'ring-purple-500' },
    { id: '4', name: 'Stripe Refined', desc: 'Pure white sidebar, text-only nav, sparkline progress bars, ultra-polished, Stripe energy', color: 'ring-[#635bff]' },
    { id: '5', name: 'Warm Neutral', desc: 'Warm stone palette, orange primary, health percentage bars, horizontal KPI, Airbnb energy', color: 'ring-orange-500' },
    { id: '6', name: 'Rounded Pastel', desc: 'Violet primary, pastel KPI cards, very rounded (32px), colorful icon pills, Figma/Loom energy', color: 'ring-violet-500' },
  ]
  const components: Record<string, React.FC> = { '1': VibeA, '2': VibeB, '3': VibeC, '4': VibeD_Stripe, '5': VibeE, '6': VibeF }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8 font-sans">
      <div className="max-w-[1400px] mx-auto space-y-12">
        <div className="text-center space-y-3 pt-8">
          <h1 className="text-4xl font-bold">Choisissez votre Design System</h1>
          <p className="text-gray-400 text-lg">Cliquez sur le design qui vous plait. Chaque vibe montre le layout complet (sidebar + dashboard + table).</p>
        </div>

        {vibes.map(vibe => {
          const Comp = components[vibe.id]
          return (
            <div key={vibe.id} onClick={() => setSelected(vibe.id)} className={`cursor-pointer rounded-3xl overflow-hidden transition-all duration-300 ${selected === vibe.id ? `ring-4 ${vibe.color} scale-[1.005]` : 'ring-1 ring-gray-700 hover:ring-gray-500'}`}>
              <div className="bg-gray-800 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="bg-gray-700 text-white text-sm font-bold px-3 py-1 rounded-lg">Vibe {vibe.id}</span>
                  <span className="text-sm font-bold">{vibe.name}</span>
                </div>
                <span className="text-xs text-gray-400 max-w-[50%] text-right">{vibe.desc}</span>
              </div>
              <Comp />
            </div>
          )
        })}

        {selected && (
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-white text-gray-900 px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-4 z-50 animate-bounce">
            <span className="font-bold text-lg">Vibe {selected} selectionnee</span>
            <span className="text-gray-500">-- Dites-moi de l'appliquer a toute l'app</span>
          </div>
        )}
      </div>
    </div>
  )
}
