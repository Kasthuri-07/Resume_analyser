import React from 'react';
import {
  LayoutDashboard,
  FilePlus2,
  Award,
  History,
  Settings,
  Cpu,
  Layers,
  Sparkles,
  Zap,
  CheckCircle2
} from 'lucide-react';

export default function Sidebar({ activePage, setActivePage }) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'new-analysis', label: 'New Resume Analysis', icon: FilePlus2, badge: 'AI Match' },
    { id: 'rankings', label: 'Candidate Rankings', icon: Award },
    { id: 'history', label: 'Analysis History', icon: History },
    { id: 'settings', label: 'System & Engine Config', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-white/95 backdrop-blur-md text-csl-text flex flex-col shrink-0 min-h-screen border-r border-[#F5B83D]/25 select-none shadow-[2px_0_15px_-3px_rgba(245,184,61,0.08)] relative z-20">

      {/* Brand Header */}
      <div className="p-5 border-b border-[#F5B83D]/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-csl-deep-blue to-csl-blue flex items-center justify-center text-white shadow-md shadow-csl-blue/25 border border-white/20">
            <Cpu className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-extrabold text-sm tracking-tight text-csl-text">
                ResumeMatcher
              </h1>
              <span className="font-bold text-[10px] bg-csl-gold/20 text-[#B45309] border border-[#F5B83D]/40 px-1.5 py-0.2 rounded-md">
                PRO
              </span>
            </div>
            <p className="text-[11px] text-csl-muted font-medium">Candidate Ranking System</p>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-3.5 space-y-1.5">
        <div className="px-3 py-1.5 text-[10px] font-extrabold tracking-wider text-csl-muted/80 uppercase">
          RECRUITMENT PLATFORM
        </div>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${isActive
                  ? 'bg-gradient-to-r from-csl-deep-blue to-csl-blue text-white shadow-md shadow-csl-blue/25 scale-[1.01]'
                  : 'text-csl-text hover:text-csl-deep-blue hover:bg-[#F5B83D]/10'
                }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-csl-blue'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className={`px-2 py-0.5 text-[10px] font-extrabold rounded-lg ${isActive ? 'bg-white/20 text-white' : 'bg-csl-gold/20 text-csl-text border border-csl-gold/40'
                  }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Creator Space Lab Signature Standout Blue Card */}
      <div className="p-3.5">
        <div className="csl-box-blue p-4 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
              </span>
              <span className="font-extrabold text-[10px] text-white uppercase tracking-wider">
                Model Ready
              </span>
            </div>
            <span className="font-mono text-[9px] bg-white/20 text-white px-1.5 py-0.5 rounded border border-white/25">
              384-D
            </span>
          </div>

          <div>
            <div className="font-bold text-xs text-white truncate">
              all-MiniLM-L6-v2
            </div>
            <p className="text-[11px] text-blue-100 font-normal leading-tight mt-0.5">
              Dense Semantic Vector Pipeline
            </p>
          </div>

          <div className="pt-2 border-t border-white/20 flex items-center justify-between text-[11px] text-blue-100">
            <span>Cosine Metric</span>
            <span className="bg-csl-gold text-csl-text font-black px-2 py-0.5 rounded-md text-[10px] shadow-sm">
              5-Factor
            </span>
          </div>
        </div>
      </div>

    </aside>
  );
}
