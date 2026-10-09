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
    { id: 'dashboard', label: 'Risk Console (F5)', icon: Scale },
    { id: 'ingestion', label: 'Ingestion (F3)', icon: FileCheck2 },
    { id: 'rules', label: 'Rules Engine (F1)', icon: BookOpenCheck },
    { id: 'intelligence', label: 'Clause Intel (F2)', icon: Layers },
    { id: 'sme-review', label: 'SME & What-If (F6)', icon: Sliders },
    { id: 'lineage', label: 'Lineage (F7)', icon: History },
    { id: 'learning', label: 'Self-Learning (F8)', icon: BrainCircuit },
    { id: 'reports', label: 'Reports (F9)', icon: FileSpreadsheet },
  ];

  return (
    <header className="sticky top-0 z-50 ribbon">
      {/* Top Meta Bar */}
      <div className="flex items-center justify-between w-full pb-2 border-b border-[var(--edge)] text-xs">
        {/* Left Branding & Case Selector */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            {/* Tegrity Intelligence Glowing Orb */}
            <div className="orb">
              <ShieldCheck className="w-5 h-5 text-[#062012]" />
            </div>

            <div className="wordmark">
              <b>TEGRITY</b>
              <span>DOCUMENT VALIDATION ENGINE</span>
            </div>
          </div>

          <div className="h-5 w-px bg-[var(--surface-3)] mx-1" />

          {/* Active Case Selector */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-[var(--ink-3)] font-mono uppercase text-[10px] tracking-wider">Active Case:</span>
            <select
              value={activeCase.id}
              onChange={(e) => setActiveCaseId(e.target.value)}
              className="bg-[var(--surface)] text-[var(--ink)] border border-[var(--edge)] rounded px-2.5 py-1 text-xs font-mono font-semibold cursor-pointer focus:outline-none focus:border-[var(--signal)]"
            >
              {cases.map((c) => (
                <option key={c.id} value={c.id} className="bg-[var(--deep)] text-[var(--ink)]">
                  {c.id} — {c.title} [{c.riskBand}]
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Persona Selector & Live Signal */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-[var(--surface)] px-3 py-1 rounded border border-[var(--edge)]">
            <UserCheck className="w-3.5 h-3.5 text-[var(--signal)]" />
            <span className="text-[var(--ink-3)] text-[10px] font-mono uppercase">Role Persona:</span>
            <select
              value={currentRole}
              onChange={(e) => setCurrentRole(e.target.value as Role)}
              className="bg-transparent text-[var(--signal)] font-bold text-xs focus:outline-none cursor-pointer"
            >
              {roles.map((r) => (
                <option key={r} value={r} className="bg-[var(--deep)] text-[var(--ink)]">
                  {r}
                </option>
              ))}
            </select>
          </div>

          <span className="pip live dot">PILOT BUILD v0.1</span>
        </div>
      </div>

      {/* Main Tab Navigation Bar */}
      <nav className="flex items-center gap-1.5 overflow-x-auto w-full pt-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-[var(--surface-2)] text-[var(--signal)] border border-[var(--signal)] shadow-sm'
                  : 'text-[var(--ink-2)] hover:text-[var(--ink)] hover:bg-[var(--surface)] border border-transparent'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[var(--signal)]' : 'text-[var(--ink-3)]'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </header>
  );
};
