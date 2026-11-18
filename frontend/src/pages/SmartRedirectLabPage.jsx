import React, { useState, useEffect } from 'react';
import {
  GitCompare,
  Globe2,
  Sparkles,
  ArrowRight,
  Plus,
  Trash2,
  CheckCircle2,
  ExternalLink,
  Split,
  Percent,
  Compass
} from 'lucide-react';
import Breadcrumb from '../components/Breadcrumb';
import { api } from '../services/api';
import { useToast } from '../components/Toast';

export default function SmartRedirectLabPage({ onNavigate }) {
  const { addToast } = useToast();

  const [links, setLinks] = useState([]);
  const [selectedLinkId, setSelectedLinkId] = useState(null);
  const [activeLink, setActiveLink] = useState(null);
  const [loading, setLoading] = useState(true);

  // Geo-Routing Rules
  const [geoRules, setGeoRules] = useState([
    { country_code: 'IN', target_url: 'https://linkai.io/india-special' },
    { country_code: 'US', target_url: 'https://linkai.io/us-enterprise' },
  ]);

  // A/B Testing Variants
  const [variants, setVariants] = useState([
    { id: 'A', name: 'Variant A (Hero Dark)', target_url: 'https://linkai.io/product?v=dark', weight: 50, clicks: 730 },
    { id: 'B', name: 'Variant B (Minimalist White)', target_url: 'https://linkai.io/product?v=white', weight: 50, clicks: 690 },
  ]);

  // Routing Simulator
  const [simulatedCountry, setSimulatedCountry] = useState('IN');
  const [simResult, setSimResult] = useState(null);

  useEffect(() => {
    loadLinks();
  }, []);

  const loadLinks = async () => {
    try {
      setLoading(true);
      const data = await api.getLinks();
      setLinks(data || []);
      if (data && data.length > 0) {
        setSelectedLinkId(data[0].id);
        setActiveLink(data[0]);
        if (data[0].geo_rules?.length) setGeoRules(data[0].geo_rules);
        if (data[0].ab_variants?.length) setVariants(data[0].ab_variants);
      }
    } catch (err) {
      console.warn('Failed to load links for Smart Redirect:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectLink = (id) => {
    const l = links.find((item) => item.id === Number(id));
    setSelectedLinkId(id);
    setActiveLink(l);
    if (l?.geo_rules?.length) setGeoRules(l.geo_rules);
    if (l?.ab_variants?.length) setVariants(l.ab_variants);
  };

  const handleAddGeoRule = () => {
    setGeoRules([...geoRules, { country_code: 'GB', target_url: 'https://linkai.io/uk-portal' }]);
  };

  const handleSaveGeoRules = async () => {
    if (!activeLink) return;
    try {
      await api.updateLink(activeLink.id, {
        enable_geo_routing: true,
        geo_rules: geoRules,
      });
      addToast('Smart Geo-Routing rules saved & deployed to edge!', 'success');
    } catch (err) {
      addToast('Failed to save geo rules', 'error');
    }
  };

  const handleSaveVariants = async () => {
    if (!activeLink) return;
    try {
      await api.updateLink(activeLink.id, {
        enable_ab_testing: true,
        ab_variants: variants,
      });
      addToast('A/B Split Test parameters saved & armed!', 'success');
    } catch (err) {
      addToast('Failed to save A/B testing variants', 'error');
    }
  };

  const handleSimulate = () => {
    const matched = geoRules.find((r) => r.country_code.toUpperCase() === simulatedCountry.toUpperCase());
    const target = matched ? matched.target_url : (activeLink?.original_url || 'https://linkai.io/default');

    setSimResult({
      country: simulatedCountry,
      matchedRule: matched ? `Rule: ${matched.country_code}` : 'Default Global Fallback',
      redirectTarget: target,
      latency: '18ms (Edge Evaluated)'
    });
    addToast(`Evaluated redirect for visitor from ${simulatedCountry}!`, 'info');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <Breadcrumb
        items={[
          { label: 'Dashboard', onClick: () => onNavigate('dashboard') },
          { label: 'Smart Redirect & A/B Studio' }
        ]}
        onBack={() => onNavigate('dashboard')}
        badgeText="Next-Gen Traffic Director"
      />

      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl p-6 sm:p-7 bg-gradient-to-r from-cyan-950/60 via-slate-900 to-purple-950/60 border border-neon-cyan/30">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neon-cyan/15 border border-neon-cyan/40 text-neon-cyan text-xs font-semibold mb-2">
              <Compass className="w-3.5 h-3.5" />
              <span>Smart Dynamic Traffic Router</span>
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              Geo-Routing & A/B Split Testing Studio
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              Direct visitors by country location (e.g. India → Razorpay/INR page, US → Stripe/USD page) or dynamically split incoming traffic between two landing variants with conversion tracking.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Targeting:</span>
            <select
              value={selectedLinkId || ''}
              onChange={(e) => handleSelectLink(e.target.value)}
              className="px-3.5 py-2 rounded-xl bg-slate-900 border border-neon-cyan/40 text-white text-xs font-mono font-bold"
            >
              {links.map((l) => (
                <option key={l.id} value={l.id}>
                  /{l.short_code} ({l.title || 'Untitled'})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* MODULE 1: SMART GEO-ROUTING */}
      <div className="glass-panel p-6 sm:p-7 rounded-2xl space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Globe2 className="w-5 h-5 text-neon-cyan" />
              <span>Country-Specific Geo-Routing Rules</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Visitors are routed instantly based on IP geolocation before page load.
            </p>
          </div>

          <button
            onClick={handleAddGeoRule}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-neon-cyan border border-neon-cyan/30 text-xs font-semibold"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Country Rule</span>
          </button>
        </div>

        <div className="space-y-3">
          {geoRules.map((rule, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-slate-900/80 border border-white/5 flex flex-col sm:flex-row items-center gap-3"
            >
              <div className="w-full sm:w-40 flex items-center gap-2">
                <span className="text-xs text-slate-400 font-bold">Country:</span>
                <input
                  type="text"
                  value={rule.country_code}
                  onChange={(e) => {
                    const updated = [...geoRules];
                    updated[idx].country_code = e.target.value.toUpperCase();
                    setGeoRules(updated);
                  }}
                  placeholder="IN, US, GB"
                  className="w-20 px-2.5 py-1.5 rounded-lg bg-slate-950 border border-white/10 text-xs text-neon-cyan font-mono font-bold text-center"
                />
              </div>

              <div className="flex-1 w-full">
                <input
                  type="url"
                  value={rule.target_url}
                  onChange={(e) => {
                    const updated = [...geoRules];
                    updated[idx].target_url = e.target.value;
                    setGeoRules(updated);
                  }}
                  placeholder="Destination URL for this region..."
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-white/10 text-xs text-white font-mono"
                />
              </div>

              <button
                onClick={() => setGeoRules(geoRules.filter((_, i) => i !== idx))}
                className="p-1.5 text-slate-400 hover:text-rose-400"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between pt-2">
          <span className="text-xs text-slate-400">
            Fallback target: <span className="font-mono text-white">{activeLink?.original_url}</span>
          </span>
          <button
            onClick={handleSaveGeoRules}
            className="btn-glow px-4 py-2 rounded-xl bg-neon-cyan text-slate-950 font-bold text-xs"
          >
            Deploy Geo Rules
          </button>
        </div>
      </div>

      {/* MODULE 2: A/B TESTING ENGINE */}
      <div className="glass-panel p-6 sm:p-7 rounded-2xl space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Split className="w-5 h-5 text-neon-purple" />
              <span>A/B Split Testing & Winner Detection</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Split incoming visitor traffic probabilistically between Variant A and Variant B.
            </p>
          </div>
          <span className="text-xs text-purple-300 font-mono">50% / 50% Split</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {variants.map((v, idx) => (
            <div key={idx} className="p-5 rounded-2xl bg-slate-900/80 border border-purple-500/20 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-neon-purple uppercase">
                  {v.name || `Variant ${v.id}`}
                </span>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-bold">
                  Weight: {v.weight}%
                </span>
              </div>

              <div>
                <label className="text-[11px] text-slate-400">Variant Destination URL:</label>
                <input
                  type="url"
                  value={v.target_url}
                  onChange={(e) => {
                    const up = [...variants];
                    up[idx].target_url = e.target.value;
                    setVariants(up);
                  }}
                  className="w-full mt-1 px-3 py-1.5 rounded-lg bg-slate-950 border border-white/10 text-xs text-white font-mono"
                />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs text-slate-400">
                <span>Recorded Clicks: <strong className="text-white font-mono">{v.clicks || 0}</strong></span>
                <span className="text-emerald-400 font-semibold">Active Variant</span>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-end pt-2">
          <button
            onClick={handleSaveVariants}
            className="btn-glow px-4 py-2 rounded-xl bg-neon-purple text-white font-bold text-xs"
          >
            Arm A/B Split Test
          </button>
        </div>
      </div>

      {/* MODULE 3: LIVE REDIRECTION SIMULATOR */}
      <div className="glass-panel p-6 sm:p-7 rounded-2xl space-y-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-neon-cyan" />
          <span>Interactive Edge Dispatch Simulator</span>
        </h3>
        <p className="text-xs text-slate-400">
          Simulate a real user clicking your short link from any country to verify redirect rules in real time.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <div className="w-full sm:w-48">
            <label className="text-xs text-slate-400">Simulate Country IP:</label>
            <select
              value={simulatedCountry}
              onChange={(e) => setSimulatedCountry(e.target.value)}
              className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs font-bold"
            >
              <option value="IN">India (IN)</option>
              <option value="US">United States (US)</option>
              <option value="GB">United Kingdom (GB)</option>
              <option value="DE">Germany (DE)</option>
              <option value="JP">Japan (JP)</option>
            </select>
          </div>

          <button
            onClick={handleSimulate}
            className="w-full sm:w-auto mt-auto btn-glow px-5 py-2.5 rounded-xl bg-gradient-to-r from-neon-cyan to-blue-500 text-slate-950 font-bold text-xs"
          >
            Simulate Hit →
          </button>
        </div>

        {simResult && (
          <div className="p-4 rounded-xl bg-slate-950 border border-emerald-500/30 text-xs font-mono space-y-1.5 animate-in fade-in">
            <div className="flex items-center justify-between text-emerald-400 font-bold">
              <span>Redirect Evaluation: {simResult.matchedRule}</span>
              <span>{simResult.latency}</span>
            </div>
            <p className="text-white">
              Target Destination: <span className="text-neon-cyan underline">{simResult.redirectTarget}</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
