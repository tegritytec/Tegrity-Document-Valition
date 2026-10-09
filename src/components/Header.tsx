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
  Layers,
  Briefcase,
  SlidersHorizontal,
  ChevronDown
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
  viewMode: 'executive' | 'tactical';
  setViewMode: (mode: 'executive' | 'tactical') => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  currentRole,
  setCurrentRole,
  activeCase,
  cases,
  setActiveCaseId,
  viewMode,
  setViewMode
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
    { id: 'dashboard', label: 'Executive Dashboard (F5)', icon: Scale },
    { id: 'ingestion', label: 'Document Ingestion (F3)', icon: FileCheck2 },
    { id: 'rules', label: 'Rules & Governance (F1)', icon: BookOpenCheck },
    { id: 'intelligence', label: 'Clause Intel (F2)', icon: Layers },
    { id: 'sme-review', label: 'SME & What-If (F6)', icon: Sliders },
    { id: 'lineage', label: 'Lineage & Audit (F7)', icon: History },
    { id: 'learning', label: 'Self-Learning (F8)', icon: BrainCircuit },
    { id: 'reports', label: 'Reports & Export (F9)', icon: FileSpreadsheet },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#080c14]/90 backdrop-blur-md border-b border-white/10 px-6 py-3 space-y-3">
      {/* Top Meta Bar */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800/80 text-xs">
        {/* Left Brand & Case Switcher */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-sky-500 to-cyan-400 text-slate-950 shadow-lg shadow-sky-500/20">
              <ShieldCheck className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="font-extrabold text-base text-white tracking-tight leading-none">
                Tegrity <span className="text-sky-400 font-medium">TDV</span>
              </div>
              <div className="text-[10px] text-slate-400 tracking-wider uppercase mt-1 font-semibold">
                Contract Validation & Risk Engine
              </div>
            </div>
          </div>

          <div className="h-5 w-px bg-slate-800 mx-1" />

          {/* Active Case Selector */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400 text-xs font-medium">Active Case:</span>
            <div className="relative">
              <select
                value={activeCase.id}
                onChange={(e) => setActiveCaseId(e.target.value)}
                className="glass-input text-xs font-semibold py-1 px-3 pr-7 bg-slate-900 border-slate-700/80 cursor-pointer appearance-none text-sky-300"
              >
                {cases.map((c) => (
                  <option key={c.id} value={c.id} className="bg-slate-900 text-slate-200">
                    {c.id} — {c.title} ({c.riskBand})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 absolute right-2 top-2 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Right View Mode & Persona Controls */}
        <div className="flex items-center gap-4">
          {/* Executive vs Tactical Mode Switcher */}
          <div className="segmented-bar">
            <button
              onClick={() => {
                setViewMode('executive');
                setActiveTab('dashboard');
              }}
              className={`segmented-btn flex items-center gap-1.5 ${viewMode === 'executive' ? 'active' : ''}`}
            >
              <Briefcase className="w-3.5 h-3.5" /> Executive View
            </button>
            <button
              onClick={() => setViewMode('tactical')}
              className={`segmented-btn flex items-center gap-1.5 ${viewMode === 'tactical' ? 'active' : ''}`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" /> Tactical SME View
            </button>
          </div>

          <div className="h-4 w-px bg-slate-800" />

          {/* Role Persona Switcher */}
          <div className="flex items-center gap-2 bg-slate-900/90 px-3 py-1.5 rounded-xl border border-slate-800">
            <UserCheck className="w-3.5 h-3.5 text-sky-400" />
            <span className="text-slate-400 text-[11px] font-semibold">Persona:</span>
            <select
              value={currentRole}
              onChange={(e) => setCurrentRole(e.target.value as Role)}
              className="bg-transparent text-sky-400 font-bold text-xs focus:outline-none cursor-pointer"
            >
              {roles.map((r) => (
                <option key={r} value={r} className="bg-slate-900 text-slate-200">
                  {r}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Tab Navigation */}
      <nav className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-sky-500/15 text-sky-300 border border-sky-500/40 shadow-sm shadow-sky-500/10'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-sky-400' : 'text-slate-500'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </header>
  );
};
