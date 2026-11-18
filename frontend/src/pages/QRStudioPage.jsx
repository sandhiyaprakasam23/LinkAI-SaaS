import React, { useState, useEffect } from 'react';
import {
  QrCode,
  Download,
  Palette,
  Sparkles,
  Copy,
  Check,
  Smartphone,
  Eye,
  Settings,
  Share2
} from 'lucide-react';
import Breadcrumb from '../components/Breadcrumb';
import { api } from '../services/api';
import { useToast } from '../components/Toast';

export default function QRStudioPage({ onNavigate }) {
  const { addToast } = useToast();

  const [links, setLinks] = useState([]);
  const [selectedLink, setSelectedLink] = useState(null);
  const [customUrl, setCustomUrl] = useState('');
  
  // Customization controls
  const [fgColor, setFgColor] = useState('#00f5ff');
  const [bgColor, setBgColor] = useState('#070a12');
  const [dotStyle, setDotStyle] = useState('rounded');
  const [includeLogo, setIncludeLogo] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadLinks();
  }, []);

  const loadLinks = async () => {
    try {
      const data = await api.getLinks();
      setLinks(data || []);
      if (data && data.length > 0) {
        setSelectedLink(data[0]);
      }
    } catch (err) {
      console.warn('Failed to load links for QR Studio:', err);
    }
  };

  const activeUrl = selectedLink
    ? `http://localhost:8001/r/${selectedLink.short_code}?src=qr`
    : customUrl || 'https://linkai.io';

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=320x320&data=${encodeURIComponent(
    activeUrl
  )}&color=${fgColor.replace('#', '')}&bgcolor=${bgColor.replace('#', '')}&margin=10`;

  const handleDownload = (format) => {
    const a = document.createElement('a');
    a.href = qrImageUrl;
    a.download = `linkai_qr_${selectedLink?.short_code || 'custom'}.${format}`;
    a.target = '_blank';
    a.click();
    addToast(`Downloaded high-res ${format.toUpperCase()} QR code!`, 'success');
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(activeUrl);
    setCopied(true);
    addToast('Copied QR Target URL ✅', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <Breadcrumb
        items={[
          { label: 'Dashboard', onClick: () => onNavigate('dashboard') },
          { label: 'QR Studio' }
        ]}
        onBack={() => onNavigate('dashboard')}
        badgeText="Vector Customizer"
        actionSlot={
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleDownload('png')}
              className="btn-glow flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-neon-cyan text-slate-950 font-bold text-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PNG</span>
            </button>
            <button
              onClick={() => handleDownload('svg')}
              className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-white/10 text-xs font-semibold"
            >
              <span>Download SVG</span>
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Customization Controls */}
        <div className="lg:col-span-2 glass-panel p-6 sm:p-7 rounded-2xl space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div>
              <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
                <Palette className="w-5 h-5 text-neon-cyan" />
                <span>QR Brand Customizer</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Customize colors, gradient presets, error correction, and embedded brand emblems.
              </p>
            </div>
            <span className="text-xs text-emerald-400 font-mono">Real-time Preview</span>
          </div>

          {/* Select Link or Custom Target */}
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Attach to Existing Short Link:
            </label>
            <select
              value={selectedLink?.id || ''}
              onChange={(e) => {
                const found = links.find((l) => l.id === Number(e.target.value));
                setSelectedLink(found);
              }}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-white/10 text-white text-xs font-semibold focus:border-neon-cyan cursor-pointer"
            >
              {links.map((l) => (
                <option key={l.id} value={l.id}>
                  /{l.short_code} — {l.title || 'Untitled'} ({l.clicks_count} clicks)
                </option>
              ))}
            </select>
          </div>

          {/* Color Palettes */}
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Color Preset Schemes:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                { name: 'Cyber Cyan', fg: '#00f5ff', bg: '#070a12' },
                { name: 'Neon Purple', fg: '#a855f7', bg: '#070a12' },
                { name: 'Electric Emerald', fg: '#10b981', bg: '#070a12' },
                { name: 'Clean White', fg: '#ffffff', bg: '#070a12' },
              ].map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setFgColor(p.fg);
                    setBgColor(p.bg);
                  }}
                  className={`p-3 rounded-xl border text-xs font-semibold flex items-center gap-2.5 transition-all ${
                    fgColor === p.fg
                      ? 'border-neon-cyan bg-slate-800/80 text-white shadow-[0_0_15px_rgba(0,245,255,0.15)]'
                      : 'border-white/5 bg-slate-900/60 text-slate-400 hover:text-white'
                  }`}
                >
                  <span className="w-4 h-4 rounded-full border border-white/20" style={{ backgroundColor: p.fg }} />
                  <span>{p.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Hex Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-400">Foreground Hex Color:</label>
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="color"
                  value={fgColor}
                  onChange={(e) => setFgColor(e.target.value)}
                  className="w-10 h-10 rounded-lg bg-transparent cursor-pointer border border-white/10"
                />
                <input
                  type="text"
                  value={fgColor}
                  onChange={(e) => setFgColor(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs font-mono text-white"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-400">Background Hex Color:</label>
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="color"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="w-10 h-10 rounded-lg bg-transparent cursor-pointer border border-white/10"
                />
                <input
                  type="text"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-xs font-mono text-white"
                />
              </div>
            </div>
          </div>

          {/* Dot Style Selection */}
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Dot Geometry:
            </label>
            <div className="grid grid-cols-3 gap-3">
              {['Rounded Dots', 'Square Grid', 'Smooth Circles'].map((style, idx) => (
                <button
                  key={idx}
                  onClick={() => setDotStyle(style.toLowerCase())}
                  className={`p-3 rounded-xl border text-xs font-medium text-center transition-all ${
                    dotStyle.includes(style.toLowerCase().split(' ')[0])
                      ? 'border-neon-cyan bg-slate-800 text-neon-cyan font-bold'
                      : 'border-white/5 bg-slate-900 text-slate-400 hover:text-white'
                  }`}
                >
                  {style}
                </button>
              ))}
            </div>
          </div>

          {/* Track QR Scans Feature Banner */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-emerald-500/20 flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              <Smartphone className="w-4 h-4 text-emerald-400" />
              <div>
                <p className="font-bold text-white">QR Telemetry Isolation Active</p>
                <p className="text-slate-400 text-[11px]">
                  Scans are tagged with <span className="font-mono text-emerald-400">?src=qr</span> to distinguish print vs web clicks.
                </p>
              </div>
            </div>
            <span className="font-mono text-emerald-400 font-bold">142 Scans</span>
          </div>
        </div>

        {/* Right: Live Interactive Render Preview */}
        <div className="glass-panel p-6 sm:p-7 rounded-2xl flex flex-col items-center justify-between text-center space-y-6">
          <div className="w-full">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Live Scanner Preview
            </span>

            {/* QR Card Container */}
            <div
              className="mt-6 p-8 rounded-3xl border border-white/10 shadow-2xl relative group inline-block"
              style={{ backgroundColor: bgColor }}
            >
              <img
                src={qrImageUrl}
                alt="Live LinkAI QR Code"
                className="w-56 h-56 mx-auto rounded-xl transition-transform duration-300 group-hover:scale-105"
              />

              {includeLogo && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-12 h-12 rounded-xl bg-slate-950 border border-neon-cyan p-2 shadow-lg flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-neon-cyan" />
                  </div>
                </div>
              )}
            </div>

            <div className="mt-4 space-y-1">
              <p className="font-mono font-bold text-sm text-white break-all">{activeUrl}</p>
              <p className="text-xs text-slate-500">Scan using smartphone camera or Lens</p>
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="w-full space-y-2">
            <button
              onClick={handleCopyUrl}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-white/10 text-xs font-semibold transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Target URL Copied ✅' : 'Copy Target Link'}</span>
            </button>

            <button
              onClick={() => handleDownload('png')}
              className="w-full btn-glow flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-neon-cyan to-blue-500 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/25"
            >
              <Download className="w-4 h-4" />
              <span>Download Ultra-Res PNG</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
