import React, { useState, useEffect } from 'react';
import {
  User,
  Key,
  Users,
  Shield,
  CreditCard,
  Plus,
  Trash2,
  Copy,
  Check,
  Sparkles,
  Layers,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import Breadcrumb from '../components/Breadcrumb';
import Modal from '../components/Modal';
import { api } from '../services/api';
import { useToast } from '../components/Toast';

export default function UserSettingsPage({ onNavigate, user, onUpdateUser }) {
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'api_keys' | 'team' | 'plans'
  const [profileData, setProfileData] = useState({
    first_name: user?.first_name || 'Alex',
    last_name: user?.last_name || 'Vance',
    email: user?.email || 'alex@linkai.io',
    company: user?.profile?.company || 'LinkAI Hypergrowth Labs',
    role: user?.profile?.role || 'Owner',
    plan: user?.profile?.plan || 'Pro'
  });

  // API Keys
  const [apiKeys, setApiKeys] = useState([]);
  const [newKeyName, setNewKeyName] = useState('');
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);
  const [copiedKey, setCopiedKey] = useState(null);

  // Team Members
  const [teamMembers, setTeamMembers] = useState([]);
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('Editor');
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);

  useEffect(() => {
    loadSettingsData();
  }, []);

  const loadSettingsData = async () => {
    try {
      const [keysRes, teamRes] = await Promise.all([
        api.getApiKeys(),
        api.getTeam()
      ]);
      setApiKeys(keysRes || []);
      setTeamMembers(teamRes || []);
    } catch (err) {
      console.warn('Failed to load settings data:', err);
    }
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    try {
      await api.updateProfile({
        company: profileData.company,
        role: profileData.role,
        plan: profileData.plan,
      });
      addToast('Profile changes saved successfully!', 'success');
    } catch (err) {
      addToast('Failed to update profile', 'error');
    }
  };

  const handleCreateApiKey = async (e) => {
    e.preventDefault();
    try {
      const key = await api.createApiKey(newKeyName || 'Live Gateway Secret');
      setApiKeys([...apiKeys, key]);
      addToast('Generated new API Secret Key!', 'success');
      setNewKeyName('');
      setIsKeyModalOpen(false);
    } catch (err) {
      addToast('Failed to create key', 'error');
    }
  };

  const handleRevokeKey = async (id) => {
    try {
      await api.revokeApiKey(id);
      setApiKeys(apiKeys.filter((k) => k.id !== id));
      addToast('Revoked API Key', 'success');
    } catch (err) {
      addToast('Failed to revoke key', 'error');
    }
  };

  const handleInviteMember = async (e) => {
    e.preventDefault();
    try {
      const member = await api.inviteTeamMember({
        email: newMemberEmail,
        role: newMemberRole,
      });
      setTeamMembers([...teamMembers, member]);
      addToast(`Invited ${newMemberEmail} to LinkAI Workspace!`, 'success');
      setNewMemberEmail('');
      setIsMemberModalOpen(false);
    } catch (err) {
      addToast('Failed to invite member', 'error');
    }
  };

  const copyKeyToClipboard = (keyStr, id) => {
    navigator.clipboard.writeText(keyStr);
    setCopiedKey(id);
    addToast('Copied API Key to clipboard ✅', 'success');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const plans = [
    {
      name: 'Free (Starter)',
      price: '$0',
      desc: 'Ideal for personal hobby projects & basic short links',
      features: ['500 Short Links / mo', 'Basic Click Count', 'Standard QR Code', 'Community Support'],
      active: profileData.plan === 'Free'
    },
    {
      name: 'Pro (Growth)',
      price: '$29',
      desc: 'Full AI insights, custom domains, and automations',
      features: [
        'Unlimited Links',
        'AI Predictive Insights & Peak Times',
        'Smart Geo-Routing (IN, US, UK)',
        'A/B Split Testing Engine',
        'Event Automation Webhooks',
        'Custom Vector QR Studio'
      ],
      active: profileData.plan === 'Pro',
      popular: true
    },
    {
      name: 'Enterprise Cloud',
      price: '$149',
      desc: 'Mission critical infrastructure for scaling SaaS companies',
      features: [
        'Dedicated Edge Redirection Clusters',
        'Custom SSL Wildcard Certificates',
        'Role-Based Team Governance',
        '99.99% Uptime SLA',
        '24/7 Priority Tech Lead Support'
      ],
      active: profileData.plan === 'Enterprise'
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <Breadcrumb
        items={[
          { label: 'Dashboard', onClick: () => onNavigate('dashboard') },
          { label: 'User Settings' }
        ]}
        onBack={() => onNavigate('dashboard')}
        badgeText={`${profileData.plan} Tier`}
      />

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-4 overflow-x-auto">
        {[
          { id: 'profile', label: 'User Profile', icon: User },
          { id: 'api_keys', label: 'API Keys', icon: Key },
          { id: 'team', label: 'Team Members', icon: Users },
          { id: 'plans', label: 'Plans & Billing (SaaS)', icon: CreditCard },
        ].map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                active
                  ? 'bg-neon-cyan text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: PROFILE */}
      {activeTab === 'profile' && (
        <div className="glass-panel p-6 sm:p-8 rounded-2xl max-w-2xl space-y-6">
          <div className="flex items-center gap-4">
            <img
              src={user?.profile?.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"}
              alt="Avatar"
              className="w-16 h-16 rounded-2xl object-cover border-2 border-neon-cyan"
            />
            <div>
              <h3 className="text-base font-bold text-white">{profileData.first_name} {profileData.last_name}</h3>
              <p className="text-xs text-slate-400">{profileData.email}</p>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-bold mt-1 inline-block">
                {profileData.role}
              </span>
            </div>
          </div>

          <form onSubmit={handleProfileSave} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-slate-300 font-bold">First Name</label>
                <input
                  type="text"
                  value={profileData.first_name}
                  onChange={(e) => setProfileData({ ...profileData, first_name: e.target.value })}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white text-xs"
                />
              </div>
              <div>
                <label className="text-slate-300 font-bold">Last Name</label>
                <input
                  type="text"
                  value={profileData.last_name}
                  onChange={(e) => setProfileData({ ...profileData, last_name: e.target.value })}
                  className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white text-xs"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-300 font-bold">Workspace / Company</label>
              <input
                type="text"
                value={profileData.company}
                onChange={(e) => setProfileData({ ...profileData, company: e.target.value })}
                className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white text-xs"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="btn-glow px-5 py-2.5 rounded-xl bg-neon-cyan text-slate-950 font-bold text-xs"
              >
                Save Profile Changes
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 2: API KEYS */}
      {activeTab === 'api_keys' && (
        <div className="glass-panel p-6 sm:p-8 rounded-2xl space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Key className="w-4 h-4 text-neon-cyan" />
                <span>Secret API Keys</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Authenticate programmatically with LinkAI REST endpoints.</p>
            </div>
            <button
              onClick={() => setIsKeyModalOpen(true)}
              className="btn-glow flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-neon-cyan text-slate-950 font-bold text-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Generate New Key</span>
            </button>
          </div>

          <div className="space-y-3">
            {apiKeys.map((k) => (
              <div
                key={k.id}
                className="p-4 rounded-xl bg-slate-900/80 border border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <p className="font-bold text-white">{k.name}</p>
                  <p className="font-mono text-neon-cyan text-xs mt-0.5">{k.key}</p>
                  <span className="text-[10px] text-slate-500 font-mono">
                    Created {new Date(k.created_at).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => copyKeyToClipboard(k.key, k.id)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium"
                  >
                    {copiedKey === k.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === k.id ? 'Copied' : 'Copy'}</span>
                  </button>

                  <button
                    onClick={() => handleRevokeKey(k.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800"
                    title="Revoke Key"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: TEAM MEMBERS */}
      {activeTab === 'team' && (
        <div className="glass-panel p-6 sm:p-8 rounded-2xl space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-neon-purple" />
                <span>Team Collaboration &amp; Roles</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Invite teammates to manage and monitor link campaigns.</p>
            </div>
            <button
              onClick={() => setIsMemberModalOpen(true)}
              className="btn-glow flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-neon-purple text-white font-bold text-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Invite Teammate</span>
            </button>
          </div>

          <div className="space-y-3">
            {teamMembers.map((member) => (
              <div
                key={member.id}
                className="p-4 rounded-xl bg-slate-900/80 border border-white/5 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-500 to-indigo-600 flex items-center justify-center font-bold text-white">
                    {member.name.substring(0, 1).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-white">{member.name}</p>
                    <p className="text-slate-400">{member.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-purple-300 font-mono font-bold">
                    {member.role}
                  </span>
                  <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    {member.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: PLANS & BILLING */}
      {activeTab === 'plans' && (
        <div className="space-y-6">
          <div className="text-center max-w-lg mx-auto space-y-1">
            <h2 className="text-2xl font-extrabold text-white">Choose Your Scale</h2>
            <p className="text-xs text-slate-400">Unlock advanced AI insights, geo-routing clusters, and unlimited automations.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((p, idx) => (
              <div
                key={idx}
                className={`glass-card p-6 rounded-2xl flex flex-col justify-between space-y-6 relative ${
                  p.popular ? 'border-neon-cyan shadow-[0_0_30px_rgba(0,245,255,0.15)]' : ''
                }`}
              >
                {p.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-neon-cyan text-slate-950 font-bold text-[10px] uppercase tracking-wider">
                    Most Popular
                  </span>
                )}

                <div>
                  <h3 className="text-base font-bold text-white">{p.name}</h3>
                  <div className="flex items-baseline gap-1 mt-2">
                    <span className="text-3xl font-extrabold text-white font-mono">{p.price}</span>
                    <span className="text-xs text-slate-400">/ month</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-2">{p.desc}</p>

                  <div className="mt-6 space-y-2.5 pt-4 border-t border-white/5">
                    {p.features.map((f, fIdx) => (
                      <div key={fIdx} className="flex items-center gap-2 text-xs text-slate-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-neon-cyan shrink-0" />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => {
                    setProfileData({ ...profileData, plan: p.name.split(' ')[0] });
                    addToast(`Switched plan to ${p.name}!`, 'success');
                  }}
                  className={`w-full py-2.5 rounded-xl font-bold text-xs transition-all ${
                    p.active
                      ? 'bg-slate-800 text-emerald-400 border border-emerald-500/30 cursor-default'
                      : 'bg-gradient-to-r from-neon-cyan to-blue-500 text-slate-950 hover:opacity-90'
                  }`}
                >
                  {p.active ? 'Current Active Tier' : 'Upgrade Plan →'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal: New Key */}
      <Modal isOpen={isKeyModalOpen} onClose={() => setIsKeyModalOpen(false)} title="Generate Secret API Key">
        <form onSubmit={handleCreateApiKey} className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-slate-300">Key Identifier / Name</label>
            <input
              type="text"
              placeholder="e.g. Production Server Gateway"
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
              className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white text-xs"
              required
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsKeyModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300"
            >
              Cancel
            </button>
            <button type="submit" className="px-5 py-2 rounded-xl bg-neon-cyan text-slate-950 font-bold">
              Generate Key
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Invite Team Member */}
      <Modal isOpen={isMemberModalOpen} onClose={() => setIsMemberModalOpen(false)} title="Invite Team Member">
        <form onSubmit={handleInviteMember} className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-slate-300">Teammate Email Address</label>
            <input
              type="email"
              placeholder="colleague@company.com"
              value={newMemberEmail}
              onChange={(e) => setNewMemberEmail(e.target.value)}
              className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white text-xs"
              required
            />
          </div>
          <div>
            <label className="font-bold text-slate-300">Role & Permissions</label>
            <select
              value={newMemberRole}
              onChange={(e) => setNewMemberRole(e.target.value)}
              className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white text-xs"
            >
              <option value="Admin">Admin (Full Control)</option>
              <option value="Editor">Editor (Create &amp; Edit Links)</option>
              <option value="Analyst">Analyst (View Analytics &amp; Reports)</option>
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsMemberModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300"
            >
              Cancel
            </button>
            <button type="submit" className="px-5 py-2 rounded-xl bg-neon-purple text-white font-bold">
              Send Workspace Invite
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
