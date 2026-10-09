import React from 'react';
import { 
  ShieldCheck, 
  FileCheck2, 
  BookOpenCheck, 
  Scale, 
  Sliders, 
  History, 
  BrainCircuit, 
  FileSpreadsheet, 
  UserCheck, 
  Bell, 
  Layers 
} from 'lucide-react';
import { Role, CaseData } from '../types/tdv';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentRole: Role;
  setCurrentRole: (role: Role) => void;
  activeCase: CaseData;
  cases: CaseData[];
  setActiveCaseId: (id: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  currentRole,
  setCurrentRole,
  activeCase,
  cases,
  setActiveCaseId
}) => {
  const roles: Role[] = [
    'Submitter',
    'Rules Steward',
    'Clause Curator',
    'SME Reviewer',
    'Approver',
    'Platform Auditor'
  ];

  const navItems = [
    { id: 'dashboard', label: 'Risk Dashboard (F5)', icon: Scale },
    { id: 'ingestion', label: 'Ingestion (F3)', icon: FileCheck2 },
    { id: 'rules', label: 'Rules (F1)', icon: BookOpenCheck },
    { id: 'intelligence', label: 'Clause Intel (F2)', icon: Layers },
    { id: 'sme-review', label: 'SME & What-If (F6)', icon: Sliders },
    { id: 'lineage', label: 'Lineage (F7)', icon: History },
    { id: 'learning', label: 'Learning (F8)', icon: BrainCircuit },
    { id: 'reports', label: 'Reports (F9)', icon: FileSpreadsheet },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#070c14]/90 backdrop-blur-md border-b border-white/10 px-6 py-3">
      {/* Top Meta Bar */}
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/5 text-xs text-slate-400">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 font-extrabold text-lg text-white tracking-tight">
            <div className="p-1.5 rounded-lg bg-gradient-to-tr from-sky-500 to-cyan-400 text-white shadow-lg shadow-sky-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <span>Tegrity <span className="text-sky-400 font-normal">TDV</span></span>
            <span className="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20 ml-1">
              v0.1 Standalone
            </span>
          </div>

          <div className="h-4 w-px bg-slate-800 mx-1" />

          {/* Active Case Selector */}
          <div className="flex items-center gap-2">
            <span className="text-slate-500">Active Case:</span>
            <select
              value={activeCase.id}
              onChange={(e) => setActiveCaseId(e.target.value)}
              className="bg-slate-900 text-slate-200 border border-slate-700/60 rounded px-2.5 py-1 text-xs focus:outline-none focus:border-sky-500 font-medium cursor-pointer"
            >
              {cases.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.id} — {c.title} ({c.riskBand})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Persona Selector & User Controls */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-slate-900/80 px-3 py-1 rounded-full border border-slate-700/50">
            <UserCheck className="w-3.5 h-3.5 text-sky-400" />
            <span className="text-slate-400">Role Persona:</span>
            <select
              value={currentRole}
              onChange={(e) => setCurrentRole(e.target.value as Role)}
              className="bg-transparent text-sky-400 font-semibold text-xs focus:outline-none cursor-pointer"
            >
              {roles.map((r) => (
                <option key={r} value={r} className="bg-slate-900 text-slate-200">
                  {r}
                </option>
              ))}
            </select>
          </div>

          <button className="relative p-1.5 rounded-lg bg-slate-800/60 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
          </button>
        </div>
      </div>

      {/* Main Tab Navigation */}
      <nav className="flex items-center gap-1 overflow-x-auto no-scrollbar">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-gradient-to-r from-sky-600/30 to-cyan-500/20 text-sky-300 border border-sky-500/40 shadow-sm shadow-sky-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-sky-400' : 'text-slate-500'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </header>
  );
};
