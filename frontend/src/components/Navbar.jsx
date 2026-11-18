import React from 'react';
import { Sparkles, Plus, Zap, Terminal, Shield, LogOut, Menu, User } from 'lucide-react';

export default function Navbar({ onNavigate, currentPage, user, onToggleSidebar }) {
  return (
    <header className="sticky top-0 z-40 w-full h-16 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl px-4 lg:px-8 flex items-center justify-between">
      {/* Left: Hamburger & Brand */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div
          onClick={() => onNavigate('dashboard')}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 via-purple-500 to-pink-500 p-[1.5px] transition-transform duration-300 group-hover:scale-105">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Zap className="w-5 h-5 text-neon-cyan fill-neon-cyan/20 group-hover:text-neon-purple transition-colors" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg tracking-tight text-white group-hover:text-neon-cyan transition-colors">
                Link<span className="text-gradient-neon">AI</span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/20">
                PRO 2.0
              </span>
            </div>
            <p className="text-[10px] text-slate-400 -mt-1 hidden sm:block">Smart URL Intelligence Platform</p>
          </div>
        </div>
      </div>

      {/* Middle: Live Telemetry Indicator */}
      <div className="hidden md:flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-900/90 border border-white/10 text-xs text-slate-300">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <span className="font-mono text-slate-400">Live Telemetry:</span>
        <span className="font-semibold text-emerald-400">Active Stream</span>
        <span className="text-slate-600">|</span>
        <span className="text-slate-400">Low Latency Redirect Engine</span>
      </div>

      {/* Right: Quick Action, API Docs, Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        <button
          onClick={() => onNavigate('create-link')}
          className="btn-glow flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-neon-cyan via-blue-500 to-neon-purple text-slate-950 font-bold text-xs sm:text-sm tracking-wide shadow-lg shadow-cyan-500/20 hover:opacity-95"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Create Link</span>
        </button>

        <button
          onClick={() => onNavigate('api-docs')}
          className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-white/10 text-xs font-medium transition-colors"
          title="Developer API & Playground"
        >
          <Terminal className="w-3.5 h-3.5 text-neon-purple" />
          <span>API</span>
        </button>

        {/* Profile Pill */}
        <div
          onClick={() => onNavigate('settings')}
          className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-xl bg-slate-900/80 border border-white/10 hover:border-neon-cyan/40 cursor-pointer transition-colors"
        >
          <img
            src={user?.profile?.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"}
            alt="Avatar"
            className="w-7 h-7 rounded-lg object-cover border border-neon-cyan/40"
          />
          <div className="hidden lg:block text-left">
            <p className="text-xs font-semibold text-white leading-tight">{user?.first_name || 'Alex Vance'}</p>
            <p className="text-[10px] text-neon-cyan font-mono leading-tight">{user?.profile?.plan || 'Pro Tier'}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
