import React, { useState } from 'react';
import {
  Terminal,
  Code2,
  Copy,
  Check,
  Play,
  Key,
  Shield,
  Send,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import Breadcrumb from '../components/Breadcrumb';
import { useToast } from '../components/Toast';

export default function DeveloperApiPage({ onNavigate }) {
  const { addToast } = useToast();

  const [activeLang, setActiveLang] = useState('curl'); // 'curl' | 'python' | 'js'
  const [selectedEndpoint, setSelectedEndpoint] = useState('create_link');
  const [copied, setCopied] = useState(false);
  const [responseOutput, setResponseOutput] = useState(null);
  const [loading, setLoading] = useState(false);

  const endpoints = [
    {
      id: 'create_link',
      method: 'POST',
      path: '/api/links/',
      desc: 'Create an intelligent short link with UTM tags and AI suggestions.',
      payload: {
        original_url: 'https://example.com/product-launch',
        short_code: 'promo-2026',
        title: 'Launch 2026',
        tags: ['Marketing', 'Product']
      }
    },
    {
      id: 'get_analytics',
      method: 'GET',
      path: '/api/analytics/link/1/',
      desc: 'Retrieve deep click metrics, device breakdowns, and 24-hour heatmaps.',
      payload: null
    },
    {
      id: 'ai_diagnosis',
      method: 'POST',
      path: '/api/ai/insights/',
      desc: 'Execute AI telemetry diagnosis, best time to share, and CTR suggestions.',
      payload: {
        link_id: 1
      }
    }
  ];

  const currentEp = endpoints.find((e) => e.id === selectedEndpoint);

  const getCodeSnippet = () => {
    const key = 'lk_live_9281a8fb1283c74892';
    if (activeLang === 'curl') {
      if (currentEp.method === 'POST') {
        return `curl -X POST http://localhost:8001${currentEp.path} \\
  -H "Authorization: Token ${key}" \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify(currentEp.payload, null, 2)}'`;
      }
      return `curl -X GET http://localhost:8001${currentEp.path} \\
  -H "Authorization: Token ${key}"`;
    }

    if (activeLang === 'python') {
      return `import requests

url = "http://localhost:8001${currentEp.path}"
headers = {
    "Authorization": "Token ${key}",
    "Content-Type": "application/json"
}
${currentEp.payload ? `data = ${JSON.stringify(currentEp.payload, null, 4)}

response = requests.post(url, headers=headers, json=data)` : 'response = requests.get(url, headers=headers)'}

print(response.status_code)
print(response.json())`;
    }

    if (activeLang === 'js') {
      return `const response = await fetch("http://localhost:8001${currentEp.path}", {
  method: "${currentEp.method}",
  headers: {
    "Authorization": "Token ${key}",
    "Content-Type": "application/json"
  }${currentEp.payload ? `,\n  body: JSON.stringify(${JSON.stringify(currentEp.payload, null, 2)})` : ''}
});

const data = await response.json();
console.log(data);`;
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(getCodeSnippet());
    setCopied(true);
    addToast('Copied code snippet to clipboard ✅', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRunRequest = async () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (selectedEndpoint === 'create_link') {
        setResponseOutput({
          status: 201,
          time_ms: 38,
          body: {
            id: 42,
            short_code: "promo-2026",
            short_url: "http://localhost:8001/r/promo-2026",
            original_url: "https://example.com/product-launch",
            clicks_count: 0,
            ai_intelligence_active: true
          }
        });
      } else if (selectedEndpoint === 'get_analytics') {
        setResponseOutput({
          status: 200,
          time_ms: 22,
          body: {
            total_clicks: 1420,
            unique_clicks: 1180,
            devices: { Mobile: "65%", Desktop: "29%", Tablet: "6%" },
            top_country: "India (42%)",
            top_referrer: "WhatsApp"
          }
        });
      } else {
        setResponseOutput({
          status: 200,
          time_ms: 112,
          body: {
            health_score: 92,
            best_time_to_post: "6:30 PM - 8:30 PM",
            audience: "Mobile Social Explorers",
            recommended_actions: [
              "Double down on WhatsApp broadcast",
              "Activate Geo-routing for Indian visitors"
            ]
          }
        });
      }
      addToast('Simulated 200 OK Response received!', 'success');
    }, 400);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <Breadcrumb
        items={[
          { label: 'Dashboard', onClick: () => onNavigate('dashboard') },
          { label: 'Developer API' }
        ]}
        onBack={() => onNavigate('dashboard')}
        badgeText="REST v2.0"
        actionSlot={
          <button
            onClick={() => onNavigate('settings')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-white/10 text-xs font-semibold text-slate-300 hover:text-white"
          >
            <Key className="w-3.5 h-3.5 text-neon-cyan" />
            <span>Manage API Keys</span>
          </button>
        }
      />

      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl p-6 sm:p-7 bg-gradient-to-r from-slate-900 via-purple-950/40 to-slate-900 border border-purple-500/30">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 text-xs font-semibold mb-2">
              <Terminal className="w-3.5 h-3.5 text-neon-purple" />
              <span>Public Developer SDK & Playground</span>
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              LinkAI REST API & Developer Console
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              Integrate LinkAI intelligence programmatically into your React apps, Python scripts, Telegram bots, or CI/CD pipelines.
            </p>
          </div>

          <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20">
            Base URL: http://localhost:8001
          </span>
        </div>
      </div>

      {/* Interactive Testing Sandbox */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Endpoints Sidebar */}
        <div className="glass-panel p-5 rounded-2xl space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Available Endpoints:
          </span>

          <div className="space-y-1.5">
            {endpoints.map((ep) => (
              <button
                key={ep.id}
                onClick={() => {
                  setSelectedEndpoint(ep.id);
                  setResponseOutput(null);
                }}
                className={`w-full p-3 rounded-xl border text-left text-xs transition-all ${
                  selectedEndpoint === ep.id
                    ? 'bg-slate-800 text-white border-neon-cyan/40 shadow-sm'
                    : 'bg-slate-900/60 text-slate-400 hover:text-white border-white/5'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`font-mono font-bold px-1.5 py-0.5 rounded text-[10px] ${
                      ep.method === 'POST' ? 'bg-cyan-500/20 text-neon-cyan' : 'bg-emerald-500/20 text-emerald-300'
                    }`}
                  >
                    {ep.method}
                  </span>
                  <span className="font-mono font-semibold text-slate-200">{ep.path}</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">{ep.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Code Snippet & Live Execution Console */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              {['curl', 'python', 'js'].map((lang) => (
                <button
                  key={lang}
                  onClick={() => setActiveLang(lang)}
                  className={`px-3 py-1 rounded-lg uppercase text-xs font-bold transition-all ${
                    activeLang === lang
                      ? 'bg-neon-cyan text-slate-950 font-bold'
                      : 'bg-slate-900 text-slate-400 hover:text-white border border-white/10'
                  }`}
                >
                  {lang === 'js' ? 'JavaScript' : lang}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyCode}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>

              <button
                onClick={handleRunRequest}
                disabled={loading}
                className="btn-glow flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-neon-cyan text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/25"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{loading ? 'Sending...' : 'Test Request'}</span>
              </button>
            </div>
          </div>

          {/* Code Window */}
          <div className="p-4 rounded-xl bg-slate-950 border border-white/10 overflow-x-auto">
            <pre className="font-mono text-xs text-slate-300 leading-relaxed">
              <code>{getCodeSnippet()}</code>
            </pre>
          </div>

          {/* Response Inspector */}
          {responseOutput && (
            <div className="space-y-2 pt-2 animate-in fade-in">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-emerald-400 font-bold">HTTP {responseOutput.status} OK</span>
                <span className="text-slate-400">{responseOutput.time_ms} ms</span>
              </div>
              <div className="p-4 rounded-xl bg-slate-950 border border-emerald-500/30 overflow-x-auto">
                <pre className="font-mono text-xs text-emerald-300">
                  {JSON.stringify(responseOutput.body, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
