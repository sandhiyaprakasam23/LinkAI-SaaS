import React, { useState } from 'react';
import {
  Sparkles,
  Link2,
  Lock,
  Calendar,
  Tag,
  QrCode,
  Globe2,
  GitCompare,
  Copy,
  Check,
  ArrowRight,
  HelpCircle,
  Wand2,
  Shield,
  Layers
} from 'lucide-react';
import confetti from 'canvas-confetti';
import Breadcrumb from '../components/Breadcrumb';
import { api } from '../services/api';
import { useToast } from '../components/Toast';

export default function CreateLinkStudioPage({ onNavigate }) {
  const { addToast } = useToast();

  const [formData, setFormData] = useState({
    original_url: '',
    short_code: '',
    title: '',
    expires_at: '',
    password_hash: '',
    tags: ['Marketing'],
    utm_source: '',
    utm_medium: '',
    utm_campaign: '',
    utm_term: '',
    utm_content: '',
    enable_geo_routing: false,
    geo_rules: [
      { country_code: 'IN', target_url: '' },
      { country_code: 'US', target_url: '' }
    ],
    enable_ab_testing: false,
    ab_variants: [
      { id: 'A', name: 'Variant A (Control)', target_url: '', weight: 50 },
      { id: 'B', name: 'Variant B (Challenger)', target_url: '', weight: 50 }
    ]
  });

  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aliasSuggestions, setAliasSuggestions] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [showUtm, setShowUtm] = useState(false);
  const [createdLink, setCreatedLink] = useState(null);
  const [copied, setCopied] = useState(false);

  // AI Auto-Title & Tag Suggestion
  const handleAiAutoFill = async () => {
    if (!formData.original_url) {
      addToast('Please enter a target URL first', 'warning');
      return;
    }
    setAiLoading(true);
    try {
      const res = await api.suggestTitle(formData.original_url);
      if (res) {
        setFormData((prev) => ({
          ...prev,
          title: res.suggested_title || prev.title,
          tags: res.suggested_tags || prev.tags,
        }));
        addToast('✨ AI generated high-conversion title & tags!', 'info');
      }

      // Also get alias suggestions
      const aliasRes = await api.suggestAlias({ url: formData.original_url, title: res?.suggested_title });
      if (aliasRes?.suggestions) {
        setAliasSuggestions(aliasRes.suggestions);
      }
    } catch (err) {
      // Fallback local heuristic
      try {
        const u = new URL(formData.original_url.startsWith('http') ? formData.original_url : `https://${formData.original_url}`);
        setFormData((prev) => ({
          ...prev,
          title: `${u.hostname.replace('www.', '').split('.')[0].toUpperCase()} - Official Portal`,
          tags: ['Marketing', 'Product']
        }));
        setAliasSuggestions([
          { alias: 'exclusive-access', ctr_boost: '+32% CTR', style: 'Viral' },
          { alias: 'deal-2026', ctr_boost: '+28% CTR', style: 'Promo' },
          { alias: 'try-now', ctr_boost: '+22% CTR', style: 'Direct' }
        ]);
        addToast('✨ AI heuristic applied', 'info');
      } catch (e) {
        addToast('Invalid URL format', 'error');
      }
    } finally {
      setAiLoading(false);
    }
  };

  // Submit Link Creation
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.original_url) {
      addToast('Destination URL is required', 'warning');
      return;
    }

    setLoading(true);
    try {
      const payload = { ...formData };
      if (!showPassword) delete payload.password_hash;
      if (!payload.expires_at) delete payload.expires_at;

      const res = await api.createLink(payload);
      setCreatedLink(res);
      addToast('🎉 Smart link created successfully!', 'success');
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (err) {
      addToast(err.message || 'Failed to create link', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    addToast('Copied to clipboard ✅', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const applyUtmPreset = (preset) => {
    if (preset === 'instagram') {
      setFormData((p) => ({ ...p, utm_source: 'instagram', utm_medium: 'bio_link', utm_campaign: 'spring_promo' }));
    } else if (preset === 'whatsapp') {
      setFormData((p) => ({ ...p, utm_source: 'whatsapp', utm_medium: 'chat_share', utm_campaign: 'viral_blast' }));
    } else if (preset === 'google_ads') {
      setFormData((p) => ({ ...p, utm_source: 'google', utm_medium: 'cpc', utm_campaign: 'intent_search' }));
    }
    setShowUtm(true);
    addToast(`Applied ${preset} UTM preset`, 'info');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      <Breadcrumb
        items={[
          { label: 'Dashboard', onClick: () => onNavigate('dashboard') },
          { label: 'Create Link Studio' }
        ]}
        onBack={() => onNavigate('dashboard')}
        badgeText="Studio v2"
      />

      {/* Main Studio Card */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl relative overflow-hidden">
        <div className="flex items-center justify-between pb-6 mb-6 border-b border-white/10">
          <div>
            <h1 className="text-2xl font-extrabold text-white flex items-center gap-2.5">
              <span>Create Link Studio</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-neon-cyan/15 text-neon-cyan border border-neon-cyan/30 font-mono font-semibold">
                Advanced Mode
              </span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Shorten links with AI intelligence, password gates, UTM tags, geo-routing, and A/B split testing.
            </p>
          </div>

          <button
            type="button"
            onClick={handleAiAutoFill}
            disabled={aiLoading}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 border border-purple-500/40 text-xs font-semibold transition-all hover:scale-105"
          >
            <Wand2 className={`w-4 h-4 text-neon-purple ${aiLoading ? 'animate-spin' : ''}`} />
            <span>{aiLoading ? 'Analyzing...' : 'AI Auto-Fill'}</span>
          </button>
        </div>

        {/* Success Result Modal / Card */}
        {createdLink && (
          <div className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-cyan-950/60 to-purple-950/60 border border-neon-cyan/40 shadow-[0_0_30px_rgba(0,245,255,0.2)] animate-in zoom-in-95">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="w-full">
                <span className="text-xs font-semibold text-emerald-400 tracking-wider uppercase flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Your Smart Link is Ready
                </span>
                <p className="text-xl font-mono font-bold text-white mt-1 break-all">
                  http://localhost:8001/r/{createdLink.short_code}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">Points to: {createdLink.original_url}</p>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => handleCopy(`http://localhost:8001/r/${createdLink.short_code}`)}
                  className="btn-glow flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-neon-cyan text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/30"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'Copied ✅' : 'Copy Link'}</span>
                </button>
                <button
                  onClick={() => onNavigate('analytics')}
                  className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-white/10"
                >
                  Inspect Stats
                </button>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Destination URL */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center justify-between">
              <span>Destination URL <span className="text-rose-500">*</span></span>
              <span className="text-[11px] text-slate-400 normal-case font-normal">Supports https://, deep links, & app schemes</span>
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="https://example.com/product-launch-2026"
                value={formData.original_url}
                onChange={(e) => setFormData({ ...formData, original_url: e.target.value })}
                required
                className="w-full px-4 py-3 pl-11 rounded-xl bg-slate-900/90 border border-white/15 focus:border-neon-cyan focus:ring-1 focus:ring-neon-cyan outline-none text-white text-sm placeholder:text-slate-500 transition-all font-mono"
              />
              <Link2 className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
            </div>
          </div>

          {/* Title & Custom Alias */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Title */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Campaign / Link Title
              </label>
              <input
                type="text"
                placeholder="e.g. Q4 Growth Launch"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900/90 border border-white/15 focus:border-neon-cyan outline-none text-white text-sm"
              />
            </div>

            {/* Custom Alias */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center justify-between">
                <span>Custom Short Alias (Optional)</span>
                <span className="text-[11px] text-neon-cyan normal-case">linkai.io/r/alias</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. summer-deal"
                  value={formData.short_code}
                  onChange={(e) => setFormData({ ...formData, short_code: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900/90 border border-white/15 focus:border-neon-cyan outline-none text-white text-sm font-mono"
                />
              </div>
            </div>
          </div>

          {/* AI Alias Suggestions Pill List */}
          {aliasSuggestions.length > 0 && (
            <div className="p-3.5 rounded-xl bg-purple-950/20 border border-purple-500/30">
              <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-purple-300">
                <Sparkles className="w-3.5 h-3.5 text-neon-purple" />
                <span>AI Predicted High-CTR Aliases:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {aliasSuggestions.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setFormData({ ...formData, short_code: item.alias })}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-purple-500/40 text-xs font-mono text-purple-200 transition-colors"
                  >
                    <span>/{item.alias}</span>
                    <span className="text-[10px] px-1 rounded bg-purple-500/20 text-neon-cyan">{item.ctr_boost}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Expiry & Password Protection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Expiry Date */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-neon-cyan" />
                <span>Expiry Deadline (Optional)</span>
              </label>
              <input
                type="datetime-local"
                value={formData.expires_at}
                onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900/90 border border-white/15 focus:border-neon-cyan outline-none text-white text-sm"
              />
              <p className="text-[11px] text-slate-400">💡 AI Tip: Expiring links induce FOMO & boost clicks by +22%.</p>
            </div>

            {/* Password Protection */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                  <Lock className="w-3.5 h-3.5 text-neon-purple" />
                  <span>Password Gate</span>
                </label>
                <input
                  type="checkbox"
                  checked={showPassword}
                  onChange={(e) => setShowPassword(e.target.checked)}
                  className="rounded bg-slate-800 border-white/20 text-neon-cyan focus:ring-0 cursor-pointer"
                />
              </div>

              {showPassword ? (
                <input
                  type="password"
                  placeholder="Set Access PIN / Passcode"
                  value={formData.password_hash}
                  onChange={(e) => setFormData({ ...formData, password_hash: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-900/90 border border-white/15 focus:border-neon-purple outline-none text-white text-sm font-mono"
                />
              ) : (
                <div className="px-4 py-2.5 rounded-xl bg-slate-900/40 border border-white/5 text-slate-500 text-xs">
                  Public access (No password required)
                </div>
              )}
            </div>
          </div>

          {/* UTM Builder Accordion */}
          <div className="border border-white/10 rounded-xl p-4 bg-slate-900/40">
            <div className="flex items-center justify-between cursor-pointer" onClick={() => setShowUtm(!showUtm)}>
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-neon-cyan" />
                <span className="text-sm font-bold text-white">UTM Parameter Campaign Builder</span>
              </div>
              <span className="text-xs text-neon-cyan hover:underline">{showUtm ? 'Hide' : 'Expand'}</span>
            </div>

            {showUtm && (
              <div className="mt-4 space-y-4 pt-4 border-t border-white/5 animate-in fade-in">
                {/* UTM Presets */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs text-slate-400">Quick Presets:</span>
                  <button
                    type="button"
                    onClick={() => applyUtmPreset('instagram')}
                    className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs text-pink-400 border border-pink-500/20"
                  >
                    Instagram Bio
                  </button>
                  <button
                    type="button"
                    onClick={() => applyUtmPreset('whatsapp')}
                    className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs text-emerald-400 border border-emerald-500/20"
                  >
                    WhatsApp Blast
                  </button>
                  <button
                    type="button"
                    onClick={() => applyUtmPreset('google_ads')}
                    className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs text-blue-400 border border-blue-500/20"
                  >
                    Google Ads Search
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] text-slate-400">utm_source</label>
                    <input
                      type="text"
                      placeholder="e.g. newsletter"
                      value={formData.utm_source}
                      onChange={(e) => setFormData({ ...formData, utm_source: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-white/10 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400">utm_medium</label>
                    <input
                      type="text"
                      placeholder="e.g. email"
                      value={formData.utm_medium}
                      onChange={(e) => setFormData({ ...formData, utm_medium: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-white/10 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400">utm_campaign</label>
                    <input
                      type="text"
                      placeholder="e.g. summer_launch"
                      value={formData.utm_campaign}
                      onChange={(e) => setFormData({ ...formData, utm_campaign: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-white/10 text-xs text-white"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Super Future Features: Geo-Routing & A/B Testing Toggle Preview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Geo Routing Card */}
            <div className="p-4 rounded-xl bg-slate-900/50 border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Globe2 className="w-4 h-4 text-neon-cyan" />
                  <span className="text-xs font-bold text-white uppercase">Smart Geo-Routing</span>
                </div>
                <input
                  type="checkbox"
                  checked={formData.enable_geo_routing}
                  onChange={(e) => setFormData({ ...formData, enable_geo_routing: e.target.checked })}
                  className="rounded bg-slate-800 text-neon-cyan"
                />
              </div>
              <p className="text-[11px] text-slate-400">
                Route Indian visitors to INR checkout, and US visitors to Stripe USD.
              </p>
            </div>

            {/* A/B Split Testing Card */}
            <div className="p-4 rounded-xl bg-slate-900/50 border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <GitCompare className="w-4 h-4 text-neon-purple" />
                  <span className="text-xs font-bold text-white uppercase">A/B Split Testing</span>
                </div>
                <input
                  type="checkbox"
                  checked={formData.enable_ab_testing}
                  onChange={(e) => setFormData({ ...formData, enable_ab_testing: e.target.checked })}
                  className="rounded bg-slate-800 text-neon-purple"
                />
              </div>
              <p className="text-[11px] text-slate-400">
                Split incoming clicks 50/50 between two landing page variations.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="text-xs text-slate-400">
              Link will be auto-indexed in LinkAI Control Center with QR generation.
            </span>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => onNavigate('dashboard')}
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-semibold text-xs border border-white/10"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn-glow flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-neon-cyan via-blue-500 to-neon-purple text-slate-950 font-bold text-sm shadow-lg shadow-cyan-500/25"
              >
                {loading ? <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" /> : <Sparkles className="w-4 h-4" />}
                <span>{loading ? 'Creating Smart Link...' : 'Create Smart Link'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
