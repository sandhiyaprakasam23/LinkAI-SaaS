import React from 'react';
import {
  LayoutDashboard,
  PlusCircle,
  Link2,
  BarChart3,
  Bot,
  Zap,
  QrCode,
  GitCompare,
  FileSpreadsheet,
  Terminal,
  Settings,
  Sparkles,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

export default function Sidebar({ currentPage, onNavigate, isOpen, onClose }) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, badge: null },
    { id: 'create-link', label: 'Create Link Studio', icon: PlusCircle, badge: 'Studio' },
    { id: 'links', label: 'Link Control Center', icon: Link2, badge: null },
    { id: 'analytics', label: 'Deep Analytics Lab', icon: BarChart3, badge: null },
    { id: 'ai-insights', label: 'AI Intelligence Hub', icon: Bot, badge: 'AI HOT', badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40' },
    { id: 'automation', label: 'Automation Engine', icon: Zap, badge: 'Auto' },
    { id: 'qr-studio', label: 'QR Studio', icon: QrCode, badge: null },
    { id: 'smart-redirect', label: 'Smart Redirect & A/B', icon: GitCompare, badge: 'Future', badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' },
    { id: 'export', label: 'Data Export Center', icon: FileSpreadsheet, badge: null },
    { id: 'api-docs', label: 'Developer API', icon: Terminal, badge: 'v2' },
    { id: 'settings', label: 'Settings & Team', icon: Settings, badge: null },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-16 bottom-0 left-0 z-40 w-64 bg-slate-950/95 border-r border-white/10 p-4 flex flex-col justify-between transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Navigation List */}
        <div className="space-y-1 overflow-y-auto pr-1">
          <p className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Platform Modules
          </p>

          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  if (onClose) onClose();
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                  isActive
                    ? 'bg-gradient-to-r from-neon-cyan/15 to-purple-500/10 text-white border border-neon-cyan/40 shadow-[0_0_15px_rgba(0,245,255,0.1)]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive ? 'text-neon-cyan' : 'text-slate-400 group-hover:text-slate-300'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider ${
                      item.badgeColor || 'bg-slate-800 text-slate-300 border-white/10'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Bottom Future SaaS Upgrade Card */}
        <div className="mt-4 pt-4 border-t border-white/10">
          <div className="p-3.5 rounded-xl bg-gradient-to-br from-purple-900/30 to-cyan-900/20 border border-purple-500/30 text-left relative overflow-hidden">
            <div className="flex items-center gap-2 mb-1.5">
              <Sparkles className="w-4 h-4 text-neon-cyan" />
              <span className="text-xs font-bold text-white">LinkAI Intelligence</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-snug mb-3">
              Predictive CTR, Geo-Routing & Custom Branded Domains active.
            </p>
            <div className="flex items-center justify-between text-[11px] font-semibold text-neon-cyan group cursor-pointer hover:underline" onClick={() => onNavigate('settings')}>
              <span>View SaaS Limits</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
