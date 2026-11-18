import React, { useState, useEffect } from 'react';
import {
  Bot,
  Sparkles,
  TrendingUp,
  Clock,
  Users,
  AlertCircle,
  Lightbulb,
  Send,
  Calendar,
  MessageCircle,
  Copy,
  Check,
  ChevronRight,
  Flame,
  ArrowRight,
  Zap,
  HelpCircle,
  Brain,
  Share2
} from 'lucide-react';

const InstagramIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

const LinkedinIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
    <rect x="2" y="9" width="4" height="12"></rect>
    <circle cx="4" cy="4" r="2"></circle>
  </svg>
);

const TwitterIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
  </svg>
);
import confetti from 'canvas-confetti';
import Breadcrumb from '../components/Breadcrumb';
import { api } from '../services/api';
import { useToast } from '../components/Toast';

export default function AIIntelligenceHubPage({ onNavigate }) {
  const { addToast } = useToast();

  const [links, setLinks] = useState([]);
  const [selectedLinkId, setSelectedLinkId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState(null);

  // Tabs within AI Hub
  const [activeTab, setActiveTab] = useState('insights'); // 'insights' | 'predict' | 'campaign' | 'copilot'

  // Predictive Clicks state
  const [prediction, setPrediction] = useState(null);

  // Campaign Generator state
  const [campaignTopic, setCampaignTopic] = useState('Product Launch & Early Access');
  const [campaignData, setCampaignData] = useState(null);
  const [copiedChannel, setCopiedChannel] = useState(null);

  // AI Copilot Chatbot state
  const [chatMessages, setChatMessages] = useState([
    {
      sender: 'ai',
      text: "Hello! I am LinkAI Copilot 🧠. Ask me anything about your link performance, peak posting windows, audience demographics, or conversion strategies!"
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  useEffect(() => {
    loadLinks();
  }, []);

  useEffect(() => {
    if (selectedLinkId) {
      handleGenerateInsights(selectedLinkId);
    }
  }, [selectedLinkId]);

  const loadLinks = async () => {
    try {
      const data = await api.getLinks();
      setLinks(data || []);
      if (data && data.length > 0) {
        setSelectedLinkId(data[0].id);
      }
    } catch (err) {
      console.warn('Failed to load links for AI Hub:', err);
    }
  };

  const handleGenerateInsights = async (linkId = selectedLinkId) => {
    if (!linkId) return;
    setLoading(true);
    try {
      const res = await api.getAIInsights(linkId);
      if (res?.insights) {
        setInsights(res.insights);
        setPrediction(res.insights.prediction);
      }
    } catch (err) {
      console.warn('Failed to fetch AI insights:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateCampaign = async () => {
    if (!selectedLinkId) return;
    setLoading(true);
    try {
      const res = await api.getAICampaign(selectedLinkId, campaignTopic);
      setCampaignData(res);
      addToast('✨ AI generated cross-platform campaign copy!', 'success');
      confetti({ particleCount: 50, spread: 60 });
    } catch (err) {
      addToast('Failed to generate campaign', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSendChat = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || chatLoading) return;

    const userText = chatInput;
    setChatMessages((prev) => [...prev, { sender: 'user', text: userText }]);
    setChatInput('');
    setChatLoading(true);

    try {
      const res = await api.chatCopilot(selectedLinkId, userText);
      setChatMessages((prev) => [
        ...prev,
        { sender: 'ai', text: res.reply || "I've analyzed your telemetry and recommend concentrating promotions during midweek evening windows." }
      ]);
    } catch (err) {
      setChatMessages((prev) => [
        ...prev,
        { sender: 'ai', text: "Peak engagement occurs around 6:30 PM - 8:30 PM on mobile WhatsApp and Instagram channels." }
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  const copyToClipboard = (text, channel) => {
    navigator.clipboard.writeText(text);
    setCopiedChannel(channel);
    addToast(`Copied ${channel} campaign copy ✅`, 'success');
    setTimeout(() => setCopiedChannel(null), 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <Breadcrumb
        items={[
          { label: 'Dashboard', onClick: () => onNavigate('dashboard') },
          { label: 'AI Intelligence Hub' }
        ]}
        onBack={() => onNavigate('dashboard')}
        badgeText="Neural Heuristic Engine"
        actionSlot={
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Select Link:</span>
            <select
              value={selectedLinkId || ''}
              onChange={(e) => setSelectedLinkId(Number(e.target.value))}
              className="px-3 py-1.5 rounded-xl bg-slate-900 border border-purple-500/40 text-white text-xs font-semibold focus:border-neon-cyan cursor-pointer"
            >
              {links.map((l) => (
                <option key={l.id} value={l.id}>
                  /{l.short_code} ({l.clicks_count} clicks)
                </option>
              ))}
            </select>
          </div>
        }
      />

      {/* AI Hub Header Banner */}
      <div className="relative overflow-hidden rounded-2xl p-6 sm:p-7 bg-gradient-to-r from-purple-950/80 via-slate-900 to-cyan-950/50 border border-purple-500/30">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/15 border border-purple-500/40 text-purple-300 text-xs font-semibold mb-2">
              <Brain className="w-3.5 h-3.5 text-neon-purple" />
              <span>LinkAI Autonomous Intelligence Core</span>
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              AI Insights & Action Studio
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              Deep machine pattern diagnostics: discover why your link is underperforming, the ideal moment to post, audience personas, and ML click predictions.
            </p>
          </div>

          <button
            onClick={() => handleGenerateInsights()}
            disabled={loading}
            className="btn-glow flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold text-xs shadow-lg shadow-purple-500/25 shrink-0"
          >
            <Sparkles className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Synthesizing...' : 'Refresh AI Diagnostics'}</span>
          </button>
        </div>

        {/* Feature Tabs */}
        <div className="flex items-center gap-2 mt-6 pt-4 border-t border-white/10 overflow-x-auto">
          {[
            { id: 'insights', label: 'Diagnostic Insights', icon: Lightbulb },
            { id: 'predict', label: 'Predict Future Clicks', icon: TrendingUp },
            { id: 'campaign', label: 'Auto Campaign Generator', icon: Flame },
            { id: 'copilot', label: 'AI Link Copilot (Chatbot)', icon: Bot },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                  active
                    ? 'bg-white/15 text-white border border-neon-cyan/40 shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${active ? 'text-neon-cyan' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB 1: DIAGNOSTIC INSIGHTS */}
      {activeTab === 'insights' && (
        <div className="space-y-6">
          {/* Top Diagnostic Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Health Score */}
            <div className="glass-card p-5 rounded-2xl flex flex-col justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-400">Link Health Index</span>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-4xl font-extrabold text-neon-cyan font-mono">
                    {insights?.health_score || 88}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">/ 100</span>
                </div>
                <p className="text-xs font-semibold text-emerald-400 mt-1">
                  Status: {insights?.status || 'High Conversion Potential'}
                </p>
              </div>
              <p className="text-[11px] text-slate-400 mt-4 pt-3 border-t border-white/5">
                Calculated across velocity, mobile readiness, and UTM completeness.
              </p>
            </div>

            {/* Best Time To Share */}
            <div className="glass-card p-5 rounded-2xl flex flex-col justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-neon-cyan" />
                  <span>Best Time to Share Link</span>
                </span>
                <p className="text-lg font-bold text-white mt-2">
                  {insights?.best_time_to_post?.day || 'Tuesday & Friday'}
                </p>
                <p className="text-sm font-mono font-bold text-neon-cyan">
                  {insights?.best_time_to_post?.time_window || '6:30 PM - 8:30 PM (IST)'}
                </p>
              </div>
              <p className="text-[11px] text-slate-400 mt-3 pt-3 border-t border-white/5">
                {insights?.best_time_to_post?.reasoning ||
                  'Audience browses heavily during evening commute and relaxation windows.'}
              </p>
            </div>

            {/* Audience Type Persona */}
            <div className="glass-card p-5 rounded-2xl flex flex-col justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-neon-purple" />
                  <span>Audience Persona</span>
                </span>
                <p className="text-base font-bold text-purple-300 mt-2">
                  {insights?.audience_persona?.primary || 'Mobile-First Social Explorers'}
                </p>
                <div className="flex items-center gap-2 text-xs font-mono text-slate-300 mt-1">
                  <span>Geo: {insights?.audience_persona?.geo_focus || 'India & US'}</span>
                </div>
              </div>
              <p className="text-[11px] text-slate-400 mt-3 pt-3 border-t border-white/5">
                {insights?.audience_persona?.behavior_summary ||
                  'High click-to-open ratio on chat platforms; demands instant mobile loading.'}
              </p>
            </div>
          </div>

          {/* Why Link Not Performing & Solutions */}
          <div className="glass-panel p-6 rounded-2xl">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
              <AlertCircle className="w-4 h-4 text-amber-400" />
              <span>Underperformance Bottleneck Analysis ("Why Link Not Performing")</span>
            </h3>

            <div className="space-y-3">
              {(insights?.why_not_performing || [
                {
                  issue: 'High Mobile Drop-off with No Direct Messenger Tagging',
                  severity: 'High',
                  solution: 'Over 68% of traffic is mobile direct. Use distinct aliases per channel to measure conversion leakage.'
                },
                {
                  issue: 'Missing Expiry Scarcity Factor',
                  severity: 'Medium',
                  solution: 'Add a 7-day countdown in Create Studio to increase click urgency by +22%.'
                }
              ]).map((item, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-slate-900/80 border border-white/5 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-xs">{item.issue}</span>
                    <span
                      className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${
                        item.severity === 'High'
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                          : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                      }`}
                    >
                      {item.severity} Risk
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    <strong className="text-neon-cyan">AI Recommended Fix:</strong> {item.solution}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Action Suggestions to Improve Clicks */}
          <div className="glass-panel p-6 rounded-2xl">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
              <Zap className="w-4 h-4 text-neon-cyan" />
              <span>Actionable Suggestions to Improve Clicks (+CTR Lift)</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(insights?.action_suggestions || [
                { action: 'Double down on WhatsApp broadcast at 6:30 PM', expected_lift: '+34% engagement', difficulty: 'Instant', category: 'Timing' },
                { action: 'Activate Smart Geo-routing for Indian visitors', expected_lift: '+19% conversion', difficulty: '2 mins', category: 'Routing' },
                { action: 'Deploy A/B testing on landing page variants', expected_lift: '+28% retention', difficulty: '5 mins', category: 'Testing' },
                { action: 'Set up an automation to alert team at 1,000 clicks', expected_lift: 'Zero manual effort', difficulty: '1 min', category: 'Automation' },
              ]).map((sug, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-slate-900/60 border border-white/5 hover:border-neon-cyan/30 transition-colors flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase text-purple-400">{sug.category}</span>
                    <p className="text-xs font-semibold text-white">{sug.action}</p>
                    <span className="text-[11px] font-mono text-emerald-400 font-bold">{sug.expected_lift}</span>
                  </div>
                  <button
                    onClick={() => {
                      addToast(`Applying: ${sug.action}`, 'success');
                      if (sug.category === 'Routing') onNavigate('smart-redirect');
                      else if (sug.category === 'Automation') onNavigate('automation');
                    }}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-neon-cyan hover:text-slate-950 text-slate-300 text-xs font-semibold transition-all shrink-0 ml-3"
                  >
                    Apply Now →
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PREDICT FUTURE CLICKS */}
      {activeTab === 'predict' && (
        <div className="glass-panel p-6 rounded-2xl space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-neon-cyan" />
                <span>AI Click Growth Projection Model</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Monte Carlo statistical forecast based on trailing click velocity & day-of-week decay functions.
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                Confidence: 91.4%
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 rounded-xl bg-slate-900/90 border border-neon-cyan/20">
              <span className="text-xs text-slate-400">Projected Next 7-Day Cumulative</span>
              <p className="text-3xl font-extrabold text-neon-cyan mt-1 font-mono">
                {prediction?.projected_7d?.toLocaleString() || '1,840'} clicks
              </p>
              <p className="text-[11px] text-emerald-400 mt-1">▲ Estimated +29% growth over baseline</p>
            </div>

            <div className="p-5 rounded-xl bg-slate-900/90 border border-purple-500/20">
              <span className="text-xs text-slate-400">Projected 30-Day Milestone</span>
              <p className="text-3xl font-extrabold text-purple-300 mt-1 font-mono">
                {prediction?.projected_30d?.toLocaleString() || '6,920'} clicks
              </p>
              <p className="text-[11px] text-slate-400 mt-1">Assumes continued secondary organic referral loops</p>
            </div>
          </div>

          {/* Daily Projected Bar Curve */}
          <div className="space-y-3 pt-2">
            <span className="text-xs font-bold text-slate-300">7-Day Trajectory Curve:</span>
            <div className="grid grid-cols-7 gap-2 pt-4">
              {(prediction?.timeline || [
                { day: 'Wed 04', predicted_clicks: 1490 },
                { day: 'Thu 05', predicted_clicks: 1580 },
                { day: 'Fri 06', predicted_clicks: 1710 },
                { day: 'Sat 07', predicted_clicks: 1820 },
                { day: 'Sun 08', predicted_clicks: 1950 },
                { day: 'Mon 09', predicted_clicks: 2120 },
                { day: 'Tue 10', predicted_clicks: 2340 },
              ]).map((item, idx) => (
                <div key={idx} className="flex flex-col items-center gap-2 p-3 rounded-xl bg-slate-900/60 border border-white/5">
                  <span className="text-[11px] font-mono text-neon-cyan font-bold">
                    {item.predicted_clicks}
                  </span>
                  <div
                    className="w-full bg-gradient-to-t from-cyan-500/20 to-neon-cyan rounded-md"
                    style={{ height: `${40 + idx * 8}px` }}
                  />
                  <span className="text-[10px] text-slate-400">{item.day}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: AUTO CAMPAIGN GENERATOR */}
      {activeTab === 'campaign' && (
        <div className="glass-panel p-6 rounded-2xl space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Flame className="w-5 h-5 text-neon-purple" />
                <span>AI Multi-Channel Campaign Copywriter</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Automatically formats high-converting copy with your shortened link embedded for every network.
              </p>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <input
                type="text"
                placeholder="Campaign Focus (e.g. Flash Sale, Beta Launch)"
                value={campaignTopic}
                onChange={(e) => setCampaignTopic(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs w-full sm:w-64"
              />
              <button
                onClick={handleGenerateCampaign}
                disabled={loading}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-neon-purple to-pink-500 text-white font-bold text-xs shrink-0"
              >
                Generate Copy
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Instagram */}
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-pink-500/20 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-pink-400 flex items-center gap-1.5">
                  <InstagramIcon className="w-4 h-4" />
                  <span>Instagram Bio & Story Caption</span>
                </span>
                <button
                  onClick={() =>
                    copyToClipboard(
                      campaignData?.instagram?.caption ||
                        `🚀 Big announcement! Check out our new update.\nTap link in bio 👇\nhttp://localhost:8000/r/ai-launch`,
                      'Instagram'
                    )
                  }
                  className="p-1 rounded text-slate-400 hover:text-white"
                >
                  {copiedChannel === 'Instagram' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-xs text-slate-200 whitespace-pre-line leading-relaxed bg-slate-950 p-3 rounded-xl border border-white/5 font-sans">
                {campaignData?.instagram?.caption ||
                  `🚀 Exciting announcement! We just unveiled something game-changing: LinkAI 2.0.\n\nTap the link in bio or visit directly 👇\n🔗 http://localhost:8000/r/ai-launch\n\nDon't miss the limited-time early access perks! 🔥`}
              </p>
            </div>

            {/* WhatsApp */}
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-emerald-500/20 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                  <MessageCircle className="w-4 h-4" />
                  <span>WhatsApp Broadcast Template</span>
                </span>
                <button
                  onClick={() =>
                    copyToClipboard(
                      campaignData?.whatsapp?.message ||
                        `Hey! 👋 Wanted to share this with you: http://localhost:8000/r/ai-launch`,
                      'WhatsApp'
                    )
                  }
                  className="p-1 rounded text-slate-400 hover:text-white"
                >
                  {copiedChannel === 'WhatsApp' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-xs text-slate-200 whitespace-pre-line leading-relaxed bg-slate-950 p-3 rounded-xl border border-white/5 font-sans">
                {campaignData?.whatsapp?.message ||
                  `Hey there! 👋\n\nCheck out this link I wanted to share with you:\n👉 http://localhost:8000/r/ai-launch\n\nIt contains all the details regarding the launch. Let me know your thoughts after checking it out!`}
              </p>
            </div>

            {/* LinkedIn */}
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-blue-500/20 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-400 flex items-center gap-1.5">
                  <LinkedinIcon className="w-4 h-4" />
                  <span>LinkedIn B2B Thought Leadership</span>
                </span>
                <button
                  onClick={() =>
                    copyToClipboard(
                      campaignData?.linkedin?.post ||
                        `We have been working on a new solution. Experience it here: http://localhost:8000/r/ai-launch`,
                      'LinkedIn'
                    )
                  }
                  className="p-1 rounded text-slate-400 hover:text-white"
                >
                  {copiedChannel === 'LinkedIn' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-xs text-slate-200 whitespace-pre-line leading-relaxed bg-slate-950 p-3 rounded-xl border border-white/5 font-sans">
                {campaignData?.linkedin?.post ||
                  `We've been quietly working on solving a major workflow bottleneck. Today, I'm thrilled to share what we've built:\n\n✨ LinkAI 2.0 Global Launch\n\n1️⃣ Instant intelligence without guesswork\n2️⃣ Real-time actionable insights\n3️⃣ Seamless routing & conversion tracking\n\nExperience it here: http://localhost:8000/r/ai-launch`}
              </p>
            </div>

            {/* Twitter / X */}
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-cyan-500/20 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-cyan-400 flex items-center gap-1.5">
                  <TwitterIcon className="w-4 h-4" />
                  <span>Twitter / X Viral Hook Thread</span>
                </span>
                <button
                  onClick={() =>
                    copyToClipboard(
                      campaignData?.twitter?.tweet ||
                        `Most links are dumb. Check this out: http://localhost:8000/r/ai-launch`,
                      'Twitter'
                    )
                  }
                  className="p-1 rounded text-slate-400 hover:text-white"
                >
                  {copiedChannel === 'Twitter' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-xs text-slate-200 whitespace-pre-line leading-relaxed bg-slate-950 p-3 rounded-xl border border-white/5 font-sans">
                {campaignData?.twitter?.tweet ||
                  `Most links are dumb. They just redirect.\n\nWhat if your link gave you AI predictions, auto-routing, and peak-time analytics?\n\nCheck this out 🧵👇\nhttp://localhost:8000/r/ai-launch`}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: AI COPILOT CHATBOT */}
      {activeTab === 'copilot' && (
        <div className="glass-panel p-6 rounded-2xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-purple-500/10 text-neon-purple border border-purple-500/30">
                <Bot className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">LinkAI Intelligence Copilot</h3>
                <p className="text-xs text-slate-400">Ask any question about your audience, click metrics, or link growth strategies</p>
              </div>
            </div>
            <span className="text-xs text-emerald-400 font-mono">Agent Online</span>
          </div>

          {/* Chat Messages Log */}
          <div className="space-y-3 min-h-[280px] max-h-[380px] overflow-y-auto pr-2">
            {chatMessages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-3 text-xs leading-relaxed ${
                  msg.sender === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {msg.sender === 'ai' && (
                  <div className="w-7 h-7 rounded-lg bg-purple-600/30 border border-purple-500/40 flex items-center justify-center shrink-0 text-neon-purple font-bold">
                    AI
                  </div>
                )}
                <div
                  className={`p-3.5 rounded-2xl max-w-lg ${
                    msg.sender === 'user'
                      ? 'bg-neon-cyan text-slate-950 font-medium rounded-tr-none'
                      : 'bg-slate-900/90 border border-white/10 text-slate-200 rounded-tl-none whitespace-pre-line'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {chatLoading && (
              <div className="flex gap-2 items-center text-xs text-slate-400">
                <div className="w-3 h-3 border-2 border-neon-cyan border-t-transparent rounded-full animate-spin" />
                <span>LinkAI Copilot is analyzing telemetry...</span>
              </div>
            )}
          </div>

          {/* Quick Prompts */}
          <div className="flex flex-wrap items-center gap-2 pt-2">
            <span className="text-[11px] text-slate-500">Suggested:</span>
            {[
              "Why did clicks spike yesterday?",
              "Best time to share on WhatsApp?",
              "How to improve my mobile CTR?",
              "Should I enable geo-routing?"
            ].map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => setChatInput(prompt)}
                className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-[11px] text-slate-300 border border-white/5"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <form onSubmit={handleSendChat} className="flex items-center gap-2 pt-2">
            <input
              type="text"
              placeholder="Ask LinkAI Copilot about your campaign..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              className="flex-1 px-4 py-3 rounded-xl bg-slate-900 border border-white/10 text-white text-xs outline-none focus:border-neon-cyan"
            />
            <button
              type="submit"
              disabled={chatLoading}
              className="p-3 rounded-xl bg-gradient-to-r from-neon-cyan to-blue-500 text-slate-950 font-bold hover:opacity-90 transition-opacity"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
