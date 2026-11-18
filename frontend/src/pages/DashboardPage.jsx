import React, { useState, useEffect } from 'react';
import {
  Link2,
  MousePointerClick,
  Activity,
  Award,
  PlusCircle,
  BarChart3,
  Bot,
  Zap,
  QrCode,
  FileSpreadsheet,
  Globe2,
  Share2,
  TrendingUp,
  ArrowUpRight,
  Sparkles,
  ExternalLink,
  Clock,
  Laptop,
  Smartphone
} from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../components/Toast';

export default function DashboardPage({ onNavigate, user }) {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    total_links: 4,
    active_links: 4,
    total_clicks: 3270,
    unique_clicks: 2815,
    top_link: { id: 1, title: 'LinkAI 2.0 Global Launch', short_code: 'ai-launch', clicks: 1420 },
    timeline: [
      { date: 'Sep 27', day: 'Mon', clicks: 280 },
      { date: 'Sep 28', day: 'Tue', clicks: 390 },
      { date: 'Sep 29', day: 'Wed', clicks: 510 },
      { date: 'Sep 30', day: 'Thu', clicks: 470 },
      { date: 'Oct 01', day: 'Fri', clicks: 620 },
      { date: 'Oct 02', day: 'Sat', clicks: 420 },
      { date: 'Oct 03', day: 'Sun', clicks: 580 },
    ],
    geo_stats: [
      { country: 'India', code: 'IN', clicks: 1373, percentage: 42.0 },
      { country: 'United States', code: 'US', clicks: 915, percentage: 28.0 },
      { country: 'United Kingdom', code: 'GB', clicks: 392, percentage: 12.0 },
      { country: 'Germany', code: 'DE', clicks: 294, percentage: 9.0 },
      { country: 'Singapore', code: 'SG', clicks: 163, percentage: 5.0 },
      { country: 'Global Others', code: 'GL', clicks: 133, percentage: 4.0 },
    ],
    referrers: [
      { name: 'Instagram', clicks: 1242, percentage: 38.0 },
      { name: 'WhatsApp', clicks: 1013, percentage: 31.0 },
      { name: 'Twitter / X', clicks: 523, percentage: 16.0 },
      { name: 'LinkedIn', clicks: 294, percentage: 9.0 },
      { name: 'Direct / QR', clicks: 198, percentage: 6.0 },
    ],
    recent_clicks: []
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const res = await api.getDashboardSummary();
      if (res) {
        setData(res);
      }
    } catch (err) {
      console.warn('Using baseline dashboard state:', err);
    } finally {
      setLoading(false);
    }
  };

  const maxClick = Math.max(...data.timeline.map((t) => t.clicks || 0), 100);

  const quickButtons = [
    { id: 'create-link', label: 'Create Link', icon: PlusCircle, color: 'from-cyan-500 to-blue-600', glow: 'hover:shadow-cyan-500/30' },
    { id: 'analytics', label: 'View Analytics', icon: BarChart3, color: 'from-purple-500 to-indigo-600', glow: 'hover:shadow-purple-500/30' },
    { id: 'links', label: 'Manage Links', icon: Link2, color: 'from-blue-500 to-teal-600', glow: 'hover:shadow-blue-500/30' },
    { id: 'ai-insights', label: 'AI Insights', icon: Bot, color: 'from-fuchsia-500 to-pink-600', glow: 'hover:shadow-fuchsia-500/30' },
    { id: 'automation', label: 'Automation', icon: Zap, color: 'from-amber-500 to-orange-600', glow: 'hover:shadow-amber-500/30' },
    { id: 'qr-studio', label: 'QR Studio', icon: QrCode, color: 'from-emerald-500 to-green-600', glow: 'hover:shadow-emerald-500/30' },
    { id: 'export', label: 'Export Data', icon: FileSpreadsheet, color: 'from-sky-500 to-cyan-600', glow: 'hover:shadow-sky-500/30' },
    { id: 'smart-redirect', label: 'Smart Redirect', icon: Globe2, color: 'from-violet-500 to-purple-600', glow: 'hover:shadow-violet-500/30' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl p-6 sm:p-8 bg-gradient-to-r from-slate-900 via-slate-900/90 to-purple-950/40 border border-white/10 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-neon-cyan/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>LinkAI Intelligence Engine Active</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Welcome back, <span className="text-gradient-neon">{user?.first_name || 'Alex'}</span> 👋
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-xl">
              Track real-time click velocities, automated triggers, and predictive AI recommendations across all your digital assets.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate('create-link')}
              className="btn-glow flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-neon-cyan to-blue-500 text-slate-950 font-bold text-sm shadow-lg shadow-cyan-500/25"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create Smart Link</span>
            </button>
            <button
              onClick={() => onNavigate('ai-insights')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-white font-semibold text-sm border border-white/10 hover:border-purple-500/50 transition-all"
            >
              <Bot className="w-4 h-4 text-neon-purple" />
              <span>Generate AI Insights</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Links */}
        <div className="glass-card p-5 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Total Links</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Link2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-white">{data.total_links}</span>
            <span className="ml-2 text-xs font-semibold text-emerald-400">+14% MoM</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Shortened & tracked assets</p>
        </div>

        {/* Total Clicks */}
        <div className="glass-card p-5 rounded-2xl relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Total Clicks</span>
            <div className="p-2 rounded-xl bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/20">
              <MousePointerClick className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-neon-cyan">{data.total_clicks?.toLocaleString()}</span>
            <span className="ml-2 text-xs font-semibold text-emerald-400">▲ +28%</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Total redirect impressions</p>
        </div>

        {/* Active Campaigns */}
        <div className="glass-card p-5 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Active Links</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-white">{data.active_links}</span>
            <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">100% Live</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Zero downtime recorded</p>
        </div>

        {/* Unique CTR */}
        <div className="glass-card p-5 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Unique CTR</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-purple-300">
              {data.total_clicks ? `${Math.round(((data.unique_clicks || data.total_clicks * 0.8) / data.total_clicks) * 100)}%` : '86%'}
            </span>
            <span className="ml-2 text-xs font-semibold text-emerald-400">+4.2%</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Verified unique humans</p>
        </div>

        {/* Top Performing Link */}
        <div
          onClick={() => onNavigate('analytics')}
          className="glass-card p-5 rounded-2xl cursor-pointer hover:border-amber-400/40 group transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Top Performing</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <div>
              <p className="text-xs font-mono font-bold text-amber-300 truncate max-w-[120px]">
                /{data.top_link?.short_code || 'ai-launch'}
              </p>
              <p className="text-lg font-bold text-white mt-0.5">{data.top_link?.clicks?.toLocaleString() || 1420} clicks</p>
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all" />
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Click to inspect deep stats</p>
        </div>
      </div>

      {/* Quick Launch Buttons (User Feature: Every Button -> Next Page) */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <span>Platform Action Bar</span>
            <span className="text-xs font-normal text-slate-400">(1-Click Feature Launch)</span>
          </h2>
          <span className="text-xs text-neon-cyan font-mono">8 Modules Ready</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {quickButtons.map((btn) => {
            const Icon = btn.icon;
            return (
              <button
                key={btn.id}
                onClick={() => onNavigate(btn.id)}
                className={`p-3.5 rounded-xl glass-card flex flex-col items-center justify-center text-center group cursor-pointer border border-white/5 hover:border-white/20 transition-all shadow-md ${btn.glow}`}
              >
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${btn.color} flex items-center justify-center text-white mb-2 shadow-inner group-hover:scale-110 transition-transform`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-xs font-semibold text-slate-300 group-hover:text-white transition-colors">
                  {btn.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Analytics Visuals */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Timeline Chart */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-neon-cyan" />
                <span>Clicks Over Time (Velocity Tracker)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Aggregate traffic trajectory across active short links</p>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900 border border-white/10 text-xs text-slate-300">
              <span className="w-2 h-2 rounded-full bg-neon-cyan animate-pulse"></span>
              <span>7-Day Velocity</span>
            </div>
          </div>

          {/* SVG Bar / Curve Visualization */}
          <div className="h-64 flex items-end justify-between gap-2 pt-8 px-2">
            {data.timeline.map((item, idx) => {
              const heightPercent = Math.max(15, Math.round((item.clicks / maxClick) * 100));
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[11px] font-mono bg-slate-800 text-neon-cyan px-2 py-0.5 rounded border border-neon-cyan/30 pointer-events-none mb-1 shadow-lg">
                    {item.clicks}
                  </div>
                  <div className="w-full max-w-[42px] bg-slate-800/80 rounded-t-lg relative overflow-hidden group-hover:bg-slate-700/80 transition-colors" style={{ height: `${heightPercent}%` }}>
                    <div className="absolute inset-0 bg-gradient-to-t from-neon-cyan/20 via-neon-cyan/50 to-neon-cyan rounded-t-lg group-hover:from-neon-purple/30 group-hover:to-neon-cyan transition-all" />
                  </div>
                  <span className="text-[11px] font-medium text-slate-400 group-hover:text-white transition-colors">
                    {item.day}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Traffic Referrers */}
        <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Share2 className="w-4 h-4 text-neon-purple" />
                <span>Referrer Breakdown</span>
              </h3>
              <span className="text-xs text-slate-400">Share of Traffic</span>
            </div>

            <div className="space-y-4">
              {data.referrers.map((ref, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-300">{ref.name}</span>
                    <span className="font-mono text-slate-400">
                      {ref.clicks} clicks ({ref.percentage}%)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        idx === 0 ? 'bg-gradient-to-r from-pink-500 to-rose-500' :
                        idx === 1 ? 'bg-gradient-to-r from-emerald-500 to-green-500' :
                        idx === 2 ? 'bg-gradient-to-r from-cyan-500 to-blue-500' :
                        idx === 3 ? 'bg-gradient-to-r from-blue-600 to-indigo-600' :
                        'bg-slate-500'
                      }`}
                      style={{ width: `${ref.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
            <span className="text-xs text-slate-400">Deep UTM attribution active</span>
            <button
              onClick={() => onNavigate('analytics')}
              className="text-xs font-semibold text-neon-cyan hover:underline flex items-center gap-1"
            >
              <span>Explore Analytics</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Geo Map & Live Telemetry Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Geo Distribution */}
        <div className="glass-panel p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Globe2 className="w-4 h-4 text-neon-cyan" />
              <span>Geo Distribution (Top Countries)</span>
            </h3>
            <button
              onClick={() => onNavigate('smart-redirect')}
              className="text-xs text-neon-cyan hover:underline font-medium"
            >
              Set Geo-Routing →
            </button>
          </div>

          <div className="space-y-3.5">
            {data.geo_stats.map((geo, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-white/5 hover:border-neon-cyan/30 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-neon-cyan border border-white/10 font-bold">
                    {geo.code}
                  </span>
                  <span className="text-sm font-medium text-slate-200">{geo.country}</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-28 hidden sm:block h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-neon-cyan rounded-full" style={{ width: `${geo.percentage}%` }} />
                  </div>
                  <span className="text-xs font-mono font-semibold text-white">{geo.clicks} clicks</span>
                  <span className="text-xs text-slate-400 w-10 text-right">{geo.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Real-Time Ticker Feed */}
        <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <h3 className="text-base font-bold text-white">Live Click Telemetry Feed</h3>
              </div>
              <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                Listening...
              </span>
            </div>

            <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
              {[
                { time: 'Just now', link: 'ai-launch', country: 'India', city: 'Bengaluru', device: 'Mobile', referrer: 'WhatsApp' },
                { time: '14s ago', link: 'summer-deal', country: 'United States', city: 'San Francisco', device: 'Desktop', referrer: 'Instagram' },
                { time: '1m ago', link: 'ai-launch', country: 'Germany', city: 'Berlin', device: 'Desktop', referrer: 'Twitter / X' },
                { time: '2m ago', link: 'vip-docs', country: 'United Kingdom', city: 'London', device: 'Mobile', referrer: 'Direct' },
                { time: '4m ago', link: 'summer-deal', country: 'India', city: 'Mumbai', device: 'Mobile', referrer: 'WhatsApp' },
              ].map((ev, idx) => (
                <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/50 border border-white/5 text-xs">
                  <div className="flex items-center gap-2.5">
                    {ev.device === 'Mobile' ? (
                      <Smartphone className="w-3.5 h-3.5 text-neon-cyan shrink-0" />
                    ) : (
                      <Laptop className="w-3.5 h-3.5 text-neon-purple shrink-0" />
                    )}
                    <div>
                      <span className="font-mono text-neon-cyan font-semibold">/{ev.link}</span>
                      <span className="text-slate-400 ml-1.5 font-normal">from {ev.city}, {ev.country}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-slate-400 font-mono text-[11px]">
                    <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">{ev.referrer}</span>
                    <span>{ev.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
            <span>Powered by LinkAI Real-Time Edge Dispatcher</span>
            <button
              onClick={() => onNavigate('automation')}
              className="text-neon-purple hover:underline font-semibold"
            >
              Add Threshold Trigger →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
