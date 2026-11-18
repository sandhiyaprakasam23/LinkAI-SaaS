import React, { useState, useEffect } from 'react';
import {
  Zap,
  PlusCircle,
  Bell,
  Webhook,
  RefreshCw,
  PauseCircle,
  PlayCircle,
  CheckCircle2,
  Trash2,
  Send,
  Workflow,
  Sparkles,
  ArrowRight,
  Globe2,
  Share2
} from 'lucide-react';
import Breadcrumb from '../components/Breadcrumb';
import Modal from '../components/Modal';
import { api } from '../services/api';
import { useToast } from '../components/Toast';

export default function AutomationEnginePage({ onNavigate }) {
  const { addToast } = useToast();

  const [rules, setRules] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  // New Rule Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newRule, setNewRule] = useState({
    name: '1,000 Clicks Milestone Alert',
    trigger_type: 'clicks_exceed',
    trigger_value: '1000',
    action_type: 'send_alert',
    action_payload: { webhook_url: '', message: 'Milestone reached!' }
  });

  // Webhook Test modal
  const [testWebhookUrl, setTestWebhookUrl] = useState('https://webhook.site/linkai-demo');
  const [webhookResult, setWebhookResult] = useState(null);

  useEffect(() => {
    loadAutomationData();
  }, []);

  const loadAutomationData = async () => {
    try {
      setLoading(true);
      const [rulesRes, logsRes] = await Promise.all([
        api.getAutomationRules(),
        api.getAutomationLogs()
      ]);
      setRules(rulesRes || []);
      setLogs(logsRes || []);
    } catch (err) {
      console.warn('Failed to load automation data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRule = async (e) => {
    e.preventDefault();
    try {
      const created = await api.createAutomationRule(newRule);
      setRules([created, ...rules]);
      addToast('⚡ Automation rule created & armed!', 'success');
      setIsModalOpen(false);
    } catch (err) {
      addToast('Failed to create rule', 'error');
    }
  };

  const handleToggleRule = async (rule) => {
    try {
      const updated = await api.updateAutomationRule(rule.id, { is_active: !rule.is_active });
      setRules((prev) => prev.map((r) => (r.id === rule.id ? updated : r)));
      addToast(`Rule ${updated.is_active ? 'Activated' : 'Paused'}`, 'info');
    } catch (err) {
      addToast('Failed to toggle rule', 'error');
    }
  };

  const handleDeleteRule = async (id) => {
    try {
      await api.deleteAutomationRule(id);
      setRules((prev) => prev.filter((r) => r.id !== id));
      addToast('Automation rule removed', 'success');
    } catch (err) {
      addToast('Failed to delete rule', 'error');
    }
  };

  const handleTestWebhook = async () => {
    try {
      const res = await api.testWebhook(testWebhookUrl);
      setWebhookResult(res);
      addToast('Webhook test delivered successfully!', 'success');
    } catch (err) {
      addToast('Webhook test failed', 'error');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <Breadcrumb
        items={[
          { label: 'Dashboard', onClick: () => onNavigate('dashboard') },
          { label: 'Automation Engine' }
        ]}
        onBack={() => onNavigate('dashboard')}
        badgeText="Event-Driven Workflows"
        actionSlot={
          <button
            onClick={() => setIsModalOpen(true)}
            className="btn-glow flex items-center gap-2 px-4 py-2 rounded-xl bg-neon-cyan text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/25"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create Rule</span>
          </button>
        }
      />

      {/* Visual Workflow Canvas Card */}
      <div className="relative overflow-hidden rounded-2xl p-6 sm:p-7 bg-gradient-to-r from-amber-950/40 via-slate-900 to-purple-950/40 border border-amber-500/30">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-semibold mb-2">
              <Workflow className="w-3.5 h-3.5 text-amber-400" />
              <span>Real-Time Event Reactor</span>
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              Automation Rules & Action Triggers
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              Construct zero-code event workflows: auto-notify when clicks cross milestones, automatically renew expired campaigns, or trigger webhooks for Zapier and Slack.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20">
              ⚡ {rules.filter((r) => r.is_active).length} Active Reactors
            </span>
          </div>
        </div>

        {/* Visual Workflow Pipeline Graphic */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 pt-4 border-t border-white/10 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-white/10 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-neon-cyan flex items-center justify-center font-bold">
              1
            </div>
            <div>
              <p className="font-bold text-white">Event Trigger</p>
              <p className="text-[11px] text-slate-400">Click &gt; 1,000 / Expiry / Country</p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-white/10 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-neon-purple flex items-center justify-center font-bold">
              2
            </div>
            <div>
              <p className="font-bold text-white">Logic Filter</p>
              <p className="text-[11px] text-slate-400">Validate conditions &amp; anomaly checks</p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-white/10 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              3
            </div>
            <div>
              <p className="font-bold text-white">Action Execution</p>
              <p className="text-[11px] text-slate-400">Webhook ping, Renew link, Alert</p>
            </div>
          </div>
        </div>
      </div>

      {/* Rules List */}
      <div className="glass-panel p-6 rounded-2xl space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-neon-cyan" />
            <span>Configured Automation Workflows</span>
          </span>
          <span className="text-xs text-slate-400">{rules.length} Total Rules</span>
        </h3>

        <div className="space-y-3">
          {rules.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              No automation rules created yet. Click "+ Create Rule" to configure your first workflow!
            </div>
          ) : (
            rules.map((rule) => (
              <div
                key={rule.id}
                className="p-4 rounded-xl bg-slate-900/70 border border-white/5 hover:border-white/15 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-slate-800 text-neon-cyan border border-white/5 shrink-0 mt-0.5 sm:mt-0">
                    {rule.action_type === 'webhook_post' ? (
                      <Webhook className="w-4 h-4 text-neon-purple" />
                    ) : rule.action_type === 'auto_renew' ? (
                      <RefreshCw className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Bell className="w-4 h-4 text-amber-400" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-xs sm:text-sm">{rule.name}</h4>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mt-1">
                      <span className="px-2 py-0.5 rounded bg-slate-800 font-mono text-neon-cyan">
                        IF {rule.trigger_type.replace('_', ' ').toUpperCase()} ({rule.trigger_value})
                      </span>
                      <span>&rarr;</span>
                      <span className="px-2 py-0.5 rounded bg-slate-800 font-mono text-purple-300">
                        THEN {rule.action_type.replace('_', ' ').toUpperCase()}
                      </span>
                      {rule.link_short_code && (
                        <span className="text-slate-500 font-mono">on /{rule.link_short_code}</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-0 border-white/5">
                  <span className="text-xs font-mono text-slate-400">
                    Fired {rule.execution_count || 0} times
                  </span>

                  <button
                    onClick={() => handleToggleRule(rule)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                      rule.is_active
                        ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                        : 'bg-slate-800 text-slate-400 border-white/10'
                    }`}
                  >
                    {rule.is_active ? 'Active' : 'Paused'}
                  </button>

                  <button
                    onClick={() => handleDeleteRule(rule.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Webhook Tester & Execution History Log */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Interactive Webhook Ping Tester */}
        <div className="glass-panel p-6 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Webhook className="w-4 h-4 text-neon-purple" />
              <span>Webhook Dispatcher Console</span>
            </h3>
            <span className="text-xs text-slate-400">Zapier / Slack Ready</span>
          </div>

          <div className="space-y-2">
            <label className="text-xs text-slate-300">Target Webhook Endpoint (POST):</label>
            <div className="flex items-center gap-2">
              <input
                type="url"
                value={testWebhookUrl}
                onChange={(e) => setTestWebhookUrl(e.target.value)}
                placeholder="https://hooks.slack.com/services/..."
                className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-white text-xs font-mono"
              />
              <button
                onClick={handleTestWebhook}
                className="btn-glow px-4 py-2 rounded-xl bg-neon-purple text-white font-bold text-xs shrink-0"
              >
                Send Test Ping
              </button>
            </div>
          </div>

          {webhookResult && (
            <div className="p-3.5 rounded-xl bg-slate-950 border border-emerald-500/30 text-xs font-mono space-y-1">
              <div className="flex items-center justify-between text-emerald-400">
                <span>Status: {webhookResult.status} ({webhookResult.http_code})</span>
                <span>{webhookResult.response_time_ms}ms</span>
              </div>
              <p className="text-slate-400 text-[11px]">{webhookResult.message}</p>
            </div>
          )}
        </div>

        {/* Execution Activity Log */}
        <div className="glass-panel p-6 rounded-2xl space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center justify-between">
            <span>Execution Audit Trail</span>
            <span className="text-xs font-mono text-neon-cyan">Real-time Stream</span>
          </h3>

          <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
            {logs.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-4">No automation triggers recorded yet.</p>
            ) : (
              logs.map((log) => (
                <div key={log.id} className="p-2.5 rounded-xl bg-slate-900/60 border border-white/5 text-xs">
                  <div className="flex items-center justify-between font-semibold">
                    <span className="text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {log.rule_name || 'Workflow Rule'}
                    </span>
                    <span className="text-slate-500 font-mono text-[10px]">
                      {new Date(log.created_at).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-slate-300 mt-0.5 text-[11px]">{log.message}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Create Rule Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create Automation Rule"
      >
        <form onSubmit={handleCreateRule} className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-slate-300">Rule Name</label>
            <input
              type="text"
              value={newRule.name}
              onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
              className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white text-xs"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-300">Trigger Condition</label>
              <select
                value={newRule.trigger_type}
                onChange={(e) => setNewRule({ ...newRule, trigger_type: e.target.value })}
                className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white text-xs"
              >
                <option value="clicks_exceed">If Clicks Exceed Threshold</option>
                <option value="link_expired">If Link Expires</option>
                <option value="country_traffic">If Specific Country Visits</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-300">Trigger Parameter</label>
              <input
                type="text"
                placeholder="e.g. 1000 or US"
                value={newRule.trigger_value}
                onChange={(e) => setNewRule({ ...newRule, trigger_value: e.target.value })}
                className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white text-xs font-mono"
                required
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-300">Action to Execute</label>
            <select
              value={newRule.action_type}
              onChange={(e) => setNewRule({ ...newRule, action_type: e.target.value })}
              className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white text-xs"
            >
              <option value="send_alert">Send In-App & Email Notification</option>
              <option value="auto_renew">Auto-Renew Expiry (+30 Days)</option>
              <option value="pause_link">Auto-Pause Link Traffic</option>
              <option value="webhook_post">Trigger Webhook Payload</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-neon-cyan text-slate-950 font-bold"
            >
              Arm Automation Rule
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
