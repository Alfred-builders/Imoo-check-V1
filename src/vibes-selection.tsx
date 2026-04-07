import React, { useState } from 'react'
import {
  Building2, Layers, ClipboardCheck, Users, ArrowUpRight, ArrowDownRight,
  MoreHorizontal, ChevronRight, Filter, Plus, Home, Users2, TrendingUp,
  LayoutGrid, Settings, LayoutDashboard, MapPin, CalendarDays
} from 'lucide-react'

// ═══════════════════════════════════════════════════════════════
// VIBE 1: "Corporate Blue" — Stripe-like, clean, professional
// ═══════════════════════════════════════════════════════════════

function Vibe1() {
  const buildings = [
    { id: 1, name: "Résidence Les Pins", type: "Résidentiel", address: "14 Rue de la Paix, Paris", lots: 42 },
    { id: 2, name: "Le Central Business", type: "Tertiaire", address: "89 Ave de la République, Lyon", lots: 12 },
    { id: 3, name: "L'Oliveraie Fontaine", type: "Résidentiel", address: "42 Blvd Gambetta, Nice", lots: 28 },
    { id: 4, name: "Espace Tech Sud", type: "Mixte", address: "Zone Industrielle - Bât B, Montpellier", lots: 74 },
  ]
  return (
    <div className="bg-slate-50 p-8 font-sans antialiased text-slate-900 rounded-2xl">
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Parc immobilier</h1>
            <p className="text-sm text-slate-500 mt-1">Vous gérez <span className="font-semibold text-blue-600">24 bâtiments</span></p>
          </div>
          <div className="flex items-center gap-3">
            <button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-white border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-50 shadow-sm"><Filter className="w-4 h-4" />Filtrer</button>
            <button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm"><Plus className="w-4 h-4" />Ajouter</button>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-6">
          {[
            { title: 'Bâtiments', value: '24', icon: Building2, trend: '+2.5%', up: true },
            { title: 'Lots', value: '156', icon: Layers, trend: '+14', up: true },
            { title: 'Missions', value: '8', icon: ClipboardCheck, trend: '-12%', up: false },
            { title: 'Occupation', value: '92%', icon: Users, trend: '+0.8%', up: true },
          ].map((s, i) => (
            <div key={i} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-200 transition-all group">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2.5 bg-blue-50 rounded-lg group-hover:bg-blue-600 transition-colors"><s.icon className="w-5 h-5 text-blue-600 group-hover:text-white transition-colors" /></div>
                <div className={`flex items-center gap-0.5 text-xs font-semibold px-2 py-1 rounded-full ${s.up ? 'text-emerald-600 bg-emerald-50' : 'text-rose-600 bg-rose-50'}`}>
                  {s.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}{s.trend}
                </div>
              </div>
              <p className="text-sm font-medium text-slate-500 mb-1">{s.title}</p>
              <h3 className="text-2xl font-bold text-slate-900 tracking-tight">{s.value}</h3>
            </div>
          ))}
        </div>
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Détails du parc</h2>
            <button className="text-blue-600 text-sm font-medium hover:underline inline-flex items-center gap-1">Voir tout <ChevronRight className="w-4 h-4" /></button>
          </div>
          <table className="w-full text-left"><thead><tr className="bg-slate-50/50">
            <th className="px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Nom</th>
            <th className="px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Type</th>
            <th className="px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Adresse</th>
            <th className="px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Lots</th>
          </tr></thead><tbody className="divide-y divide-slate-100">
            {buildings.map(b => (
              <tr key={b.id} className="hover:bg-blue-50/30 transition-colors">
                <td className="px-6 py-4 text-sm font-semibold text-slate-900">{b.name}</td>
                <td className="px-6 py-4"><span className={`px-2 py-0.5 rounded-md text-xs font-medium border ${b.type === 'Tertiaire' ? 'bg-blue-50 text-blue-700 border-blue-100' : b.type === 'Résidentiel' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>{b.type}</span></td>
                <td className="px-6 py-4 text-sm text-slate-600">{b.address}</td>
                <td className="px-6 py-4"><div className="flex items-center gap-2"><span className="text-sm font-medium text-slate-700">{b.lots}</span><div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden"><div className="bg-blue-500 h-full rounded-full" style={{ width: `${Math.min((b.lots / 80) * 100, 100)}%` }} /></div></div></td>
              </tr>
            ))}
          </tbody></table>
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// VIBE 2: "Soft Gradient" — Glassmorphism, pastel gradients
// ═══════════════════════════════════════════════════════════════

function Vibe2() {
  return (
    <div className="bg-[#F8FAFF] p-8 font-sans rounded-2xl relative overflow-hidden">
      <div className="absolute top-[-10%] right-[-5%] w-[300px] h-[300px] bg-indigo-200/20 blur-[80px] rounded-full -z-0" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[300px] h-[300px] bg-cyan-200/20 blur-[80px] rounded-full -z-0" />
      <div className="relative z-10 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Parc immobilier</h1>
              <span className="px-3 py-1 bg-white border border-slate-200 text-slate-500 text-xs font-bold rounded-full shadow-sm">156 lots</span>
            </div>
            <p className="text-slate-500 font-medium">Gestion proactive de votre patrimoine.</p>
          </div>
          <button className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-blue-500 text-white px-5 py-2.5 rounded-2xl font-bold shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transition-all active:scale-95">
            <LayoutGrid className="w-4 h-4" />Nouveau lot
          </button>
        </div>
        <div className="grid grid-cols-4 gap-6">
          {[
            { title: 'Immeubles', value: '24', trend: '+12%', icon: Building2, grad: 'from-blue-400 to-cyan-400' },
            { title: 'Appartements', value: '156', trend: '+5%', icon: Home, grad: 'from-emerald-400 to-teal-400' },
            { title: 'Locataires', value: '89', trend: '+3.1%', icon: Users2, grad: 'from-fuchsia-400 to-pink-400' },
            { title: 'Inspections', value: '8', trend: '+18%', icon: ClipboardCheck, grad: 'from-orange-400 to-yellow-400' },
          ].map((s, i) => (
            <div key={i} className="relative overflow-hidden bg-white/60 backdrop-blur-xl border border-white/40 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] rounded-[20px] transition-transform duration-300 hover:scale-[1.02]">
              <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent pointer-events-none" />
              <div className="relative z-10 p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transform -rotate-3 bg-gradient-to-br ${s.grad}`}><s.icon className="w-6 h-6 text-white" /></div>
                  <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-50 border border-emerald-100/50"><TrendingUp className="w-3 h-3 text-emerald-500" /><span className="text-[11px] font-bold text-emerald-600">{s.trend}</span></div>
                </div>
                <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">{s.title}</p>
                <h3 className="text-2xl font-bold text-slate-800 tracking-tight">{s.value}</h3>
              </div>
            </div>
          ))}
        </div>
        <div className="relative overflow-hidden bg-white/60 backdrop-blur-xl border border-white/40 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] rounded-[20px]">
          <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent pointer-events-none" />
          <div className="relative z-10">
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-800">Dernières activités</h2>
              <button className="text-slate-400 hover:text-indigo-500 transition-colors"><MoreHorizontal className="w-5 h-5" /></button>
            </div>
            <table className="w-full text-left"><thead><tr className="text-slate-400 text-[11px] uppercase tracking-widest font-bold">
              <th className="px-6 py-4">Propriété</th><th className="px-6 py-4">Locataire</th><th className="px-6 py-4">Statut</th><th className="px-6 py-4">Date</th>
            </tr></thead><tbody className="divide-y divide-slate-50">
              {['Résidence Les Pins', 'Le Central', 'Villa Fontaine', 'Espace Tech'].map((n, i) => (
                <tr key={i} className="hover:bg-slate-50/50 cursor-pointer transition-colors">
                  <td className="px-6 py-5"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center"><Building2 className="w-5 h-5 text-slate-400" /></div><div><div className="font-bold text-slate-700 text-sm">{n}</div><div className="text-slate-400 text-xs">Lot B-{i + 1}</div></div></div></td>
                  <td className="px-6 py-5 text-sm text-slate-600">Nom Prénom</td>
                  <td className="px-6 py-5"><span className={`px-3 py-1 rounded-full text-[11px] font-bold border ${i % 2 === 0 ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-blue-100 text-blue-700 border-blue-200'}`}>{i % 2 === 0 ? 'Loué' : 'Disponible'}</span></td>
                  <td className="px-6 py-5 text-sm text-slate-500">12 Oct 2025</td>
                </tr>
              ))}
            </tbody></table>
          </div>
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// VIBE 3: "Dark Sidebar Luxe" — Banking, gold accents, serif
// ═══════════════════════════════════════════════════════════════

function Vibe3() {
  return (
    <div className="flex min-h-[520px] bg-[#F8FAFC] overflow-hidden rounded-2xl border border-slate-200 shadow-2xl">
      <aside className="w-56 flex flex-col shrink-0 bg-[#0F172A]">
        <div className="p-6 pb-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#D4AF37] flex items-center justify-center rounded-[2px] rotate-45"><Building2 size={16} className="-rotate-45 text-white" /></div>
            <span className="text-white font-serif text-lg tracking-tight">Immo<span className="text-[#D4AF37]">Checker</span></span>
          </div>
        </div>
        <nav className="flex-1 space-y-1">
          {[{ icon: LayoutDashboard, label: 'Tableau de bord', active: true }, { icon: Building2, label: 'Patrimoine' }, { icon: Users, label: 'Locataires' }, { icon: ClipboardCheck, label: 'États des lieux' }, { icon: Settings, label: 'Configuration' }].map((item, i) => (
            <div key={i} className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-all ${item.active ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
              <item.icon size={18} className={item.active ? 'text-[#D4AF37]' : ''} />
              <span className="text-sm font-medium tracking-wide">{item.label}</span>
              {item.active && <div className="ml-auto w-1 h-4 bg-[#D4AF37] rounded-full" />}
            </div>
          ))}
        </nav>
      </aside>
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-8 shrink-0">
          <div>
            <h1 className="text-lg font-serif text-[#0F172A]">Vue d'ensemble</h1>
            <p className="text-[10px] text-slate-400">Gestion du patrimoine</p>
          </div>
        </header>
        <div className="p-8 space-y-6 overflow-y-auto">
          <div className="grid grid-cols-4 gap-4">
            {[{ title: 'Actifs', value: '128', label: 'Unités', trend: '+4%' }, { title: 'Occupation', value: '98.2%', label: 'Total', trend: '+1.2%' }, { title: 'Revenus', value: '245k€', label: 'Mensuel', trend: '+12%' }, { title: 'Maintien', value: '14', label: 'Interventions', trend: '-2%' }].map((s, i) => (
              <div key={i} className="bg-white border border-slate-100 p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.08)] transition-all rounded-sm relative group overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-[#D4AF37]/5 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-150" />
                <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-semibold mb-3">{s.title}</p>
                <div className="flex items-end justify-between relative z-10">
                  <div><h3 className="text-2xl font-serif text-[#0F172A] mb-1">{s.value}</h3><p className="text-xs text-slate-500">{s.label}</p></div>
                  <div className="flex items-center text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100"><TrendingUp size={10} className="mr-1" />{s.trend}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="bg-white border border-slate-100 shadow-sm rounded-sm">
            <div className="px-6 py-4 border-b border-slate-50 flex items-center justify-between">
              <h2 className="font-serif text-[#0F172A]">Derniers États des Lieux</h2>
              <button className="text-[10px] flex items-center gap-1 uppercase tracking-widest text-[#D4AF37] font-bold hover:underline">Tout voir <ArrowUpRight size={12} /></button>
            </div>
            <table className="w-full text-left"><thead><tr className="bg-slate-50/50">
              <th className="px-6 py-3 text-[10px] uppercase tracking-widest text-slate-500 font-bold border-b border-slate-100">Propriété</th>
              <th className="px-6 py-3 text-[10px] uppercase tracking-widest text-slate-500 font-bold border-b border-slate-100">Locataire</th>
              <th className="px-6 py-3 text-[10px] uppercase tracking-widest text-slate-500 font-bold border-b border-slate-100">Date</th>
              <th className="px-6 py-3 text-[10px] uppercase tracking-widest text-slate-500 font-bold border-b border-slate-100 text-right">Statut</th>
            </tr></thead><tbody className="divide-y divide-slate-50">
              {[{ p: 'Ave Montaigne, Paris VIII', t: 'Jean-Pierre Dubois', d: '12 Oct', s: 'Terminé' }, { p: 'Villa Cap Ferrat, Nice', t: 'Sarah Hamilton', d: '15 Oct', s: 'En cours' }, { p: 'Quai des Orfèvres, Paris I', t: 'Marc-Antoine Roche', d: '18 Oct', s: 'À venir' }].map((r, i) => (
                <tr key={i} className="hover:bg-slate-50/80 transition-colors cursor-pointer">
                  <td className="px-6 py-4"><div className="flex items-center gap-3"><MapPin size={14} className="text-[#D4AF37]" /><span className="text-sm font-medium text-slate-700">{r.p}</span></div></td>
                  <td className="px-6 py-4 text-sm text-slate-600">{r.t}</td>
                  <td className="px-6 py-4"><div className="flex items-center gap-2 text-xs text-slate-500"><CalendarDays size={14} className="text-slate-400" />{r.d}</div></td>
                  <td className="px-6 py-4 text-right"><span className={`text-[10px] font-bold uppercase tracking-tight px-2.5 py-1 rounded-sm border ${r.s === 'Terminé' ? 'bg-slate-100 text-slate-700 border-slate-200' : r.s === 'En cours' ? 'bg-amber-50 text-amber-700 border-amber-200/50' : 'bg-white text-slate-400 border-slate-100'}`}>{r.s}</span></td>
                </tr>
              ))}
            </tbody></table>
          </div>
        </div>
      </main>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// VIBES SELECTION PAGE
// ═══════════════════════════════════════════════════════════════

export default function VibesSelection() {
  const [selected, setSelected] = useState<number | null>(null)

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-7xl mx-auto space-y-12">
        <div className="text-center space-y-3">
          <h1 className="text-4xl font-bold">Choisissez votre Design System</h1>
          <p className="text-gray-400 text-lg">Cliquez sur le vibe qui vous plaît pour ImmoChecker</p>
        </div>

        {/* Vibe 1 */}
        <div
          onClick={() => setSelected(1)}
          className={`cursor-pointer rounded-3xl overflow-hidden transition-all duration-300 ${selected === 1 ? 'ring-4 ring-blue-500 scale-[1.01]' : 'ring-1 ring-gray-700 hover:ring-gray-500'}`}
        >
          <div className="bg-gray-800 px-6 py-3 flex items-center justify-between">
            <span className="text-sm font-bold">Vibe 1 — Corporate Blue</span>
            <span className="text-xs text-gray-400">Stripe / Linear style — Clean, professionnel, trustworthy</span>
          </div>
          <Vibe1 />
        </div>

        {/* Vibe 2 */}
        <div
          onClick={() => setSelected(2)}
          className={`cursor-pointer rounded-3xl overflow-hidden transition-all duration-300 ${selected === 2 ? 'ring-4 ring-indigo-500 scale-[1.01]' : 'ring-1 ring-gray-700 hover:ring-gray-500'}`}
        >
          <div className="bg-gray-800 px-6 py-3 flex items-center justify-between">
            <span className="text-sm font-bold">Vibe 2 — Soft Gradient</span>
            <span className="text-xs text-gray-400">Glassmorphism, gradients pastels, créatif et moderne</span>
          </div>
          <Vibe2 />
        </div>

        {/* Vibe 3 */}
        <div
          onClick={() => setSelected(3)}
          className={`cursor-pointer rounded-3xl overflow-hidden transition-all duration-300 ${selected === 3 ? 'ring-4 ring-amber-500 scale-[1.01]' : 'ring-1 ring-gray-700 hover:ring-gray-500'}`}
        >
          <div className="bg-gray-800 px-6 py-3 flex items-center justify-between">
            <span className="text-sm font-bold">Vibe 3 — Dark Sidebar Luxe</span>
            <span className="text-xs text-gray-400">Banking / luxe — Sidebar sombre, accents dorés, serif</span>
          </div>
          <Vibe3 />
        </div>

        {selected && (
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-white text-gray-900 px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-4 z-50">
            <span className="font-bold">Vibe {selected} sélectionnée</span>
            <span className="text-gray-500 text-sm">Dites-moi "vibe {selected}" pour l'appliquer</span>
          </div>
        )}
      </div>
    </div>
  )
}
