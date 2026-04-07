import React, { useState } from 'react'
import {
  LayoutDashboard, Building2, Users, Users2, ClipboardList, Settings,
  Plus, Download, Search, MoreHorizontal, MoreVertical, Home, TrendingUp,
  ArrowUpRight, ArrowDownRight, Bell, ChevronRight, Filter, MapPin, LayoutGrid
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
   VIBE D — "Rounded Pastel"
   Violet primary, pastel KPI cards, very rounded, playful
   ═══════════════════════════════════════════════════════════════ */

function VibeD() {
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
    { id: 'A', name: 'Zaant Modern', desc: 'Blue primary, gradient icons, multi-layer shadows, sticky header, Intercom/Linear energy', color: 'ring-blue-500' },
    { id: 'B', name: 'Notion Clean', desc: 'Ultra-minimal, whitespace-heavy, indigo accent, typography-driven, Vercel/Cal.com energy', color: 'ring-indigo-500' },
    { id: 'D', name: 'Rounded Pastel', desc: 'Violet primary, pastel KPI cards, very rounded (32px), colorful icon pills, Figma/Loom energy', color: 'ring-violet-500' },
  ]
  const components: Record<string, React.FC> = { A: VibeA, B: VibeB, D: VibeD }

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8 font-sans">
      <div className="max-w-[1400px] mx-auto space-y-12">
        <div className="text-center space-y-3 pt-8">
          <h1 className="text-4xl font-bold">Choisissez votre Design System</h1>
          <p className="text-gray-400 text-lg">Cliquez sur le design qui vous plaît. Chaque vibe montre le layout complet (sidebar + dashboard + table).</p>
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
                <span className="text-xs text-gray-400">{vibe.desc}</span>
              </div>
              <Comp />
            </div>
          )
        })}

        {selected && (
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-white text-gray-900 px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-4 z-50 animate-bounce">
            <span className="font-bold text-lg">Vibe {selected} sélectionnée</span>
            <span className="text-gray-500">→ Dites-moi "vibe {selected}" pour l'appliquer à toute l'app</span>
          </div>
        )}
      </div>
    </div>
  )
}
