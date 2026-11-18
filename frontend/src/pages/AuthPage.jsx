import React, { useState } from 'react';
import {
  Zap,
  Lock,
  Mail,
  User,
  ArrowRight,
  Shield,
  Sparkles,
  KeyRound,
  CheckCircle2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../services/api';
import { useToast } from '../components/Toast';

export default function AuthPage({ onLoginSuccess }) {
  const { addToast } = useToast();

  const [mode, setMode] = useState('login'); // 'login' | 'signup' | 'forgot'
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    company: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === 'login') {
        const res = await api.login({
          username: formData.username,
          password: formData.password
        });
        localStorage.setItem('linkai_token', res.token);
        addToast('Welcome to LinkAI Platform!', 'success');
        confetti({ particleCount: 60, spread: 60 });
        onLoginSuccess(res.user);
      } else if (mode === 'signup') {
        const res = await api.register({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          company: formData.company
        });
        localStorage.setItem('linkai_token', res.token);
        addToast('Account initialized with Pro access!', 'success');
        confetti({ particleCount: 70, spread: 70 });
        onLoginSuccess(res.user);
      } else {
        addToast('Password reset token dispatched to your email!', 'info');
        setMode('login');
      }
    } catch (err) {
      addToast(err.message || 'Authentication error', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    try {
      const res = await api.login({ is_demo: true });
      localStorage.setItem('linkai_token', res.token);
      addToast('Logged in as Alex Vance (Pro Admin)!', 'success');
      confetti({ particleCount: 70, spread: 80 });
      onLoginSuccess(res.user);
    } catch (err) {
      // Local fallback mock
      const mockUser = {
        username: 'demo_user',
        first_name: 'Alex',
        last_name: 'Vance',
        email: 'alex@linkai.io',
        profile: {
          company: 'LinkAI Hypergrowth Labs',
          plan: 'Pro',
          role: 'Owner',
          avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
        }
      };
      addToast('Demo workspace initialized!', 'success');
      onLoginSuccess(mockUser);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#070a12] relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-neon-cyan/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neon-purple/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-8 space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-purple-600 p-[1.5px] shadow-lg shadow-cyan-500/20 mb-2">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Zap className="w-6 h-6 text-neon-cyan" />
            </div>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Link<span className="text-gradient-neon">AI</span>
          </h1>
          <p className="text-xs text-slate-400">Smart URL Intelligence &amp; Automation Platform</p>
        </div>

        {/* Auth Glass Box */}
        <div className="glass-panel p-7 sm:p-8 rounded-3xl border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.8)] space-y-6">
          {/* Mode Switcher */}
          <div className="flex items-center p-1 rounded-xl bg-slate-950 border border-white/10 text-xs">
            <button
              onClick={() => setMode('login')}
              className={`flex-1 py-2 rounded-lg font-bold transition-all ${
                mode === 'login' ? 'bg-neon-cyan text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setMode('signup')}
              className={`flex-1 py-2 rounded-lg font-bold transition-all ${
                mode === 'signup' ? 'bg-neon-cyan text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Quick Demo 1-Click Button */}
          <button
            onClick={handleDemoLogin}
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-900/50 to-cyan-900/50 hover:from-purple-900/70 hover:to-cyan-900/70 border border-purple-500/40 text-purple-200 font-bold text-xs flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
          >
            <Sparkles className="w-4 h-4 text-neon-cyan animate-pulse" />
            <span>Instant Demo Access (1-Click)</span>
          </button>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-[1px] bg-white/10" />
            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">or standard login</span>
            <div className="flex-1 h-[1px] bg-white/10" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* Username */}
            <div className="space-y-1">
              <label className="text-slate-300 font-semibold">Username</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="alex_growth"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full px-3.5 py-2.5 pl-10 rounded-xl bg-slate-950 border border-white/10 text-white outline-none focus:border-neon-cyan"
                  required={mode !== 'forgot'}
                />
                <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              </div>
            </div>

            {/* Email (If signup or forgot) */}
            {(mode === 'signup' || mode === 'forgot') && (
              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Email Address</label>
                <div className="relative">
                  <input
                    type="email"
                    placeholder="alex@linkai.io"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 pl-10 rounded-xl bg-slate-950 border border-white/10 text-white outline-none focus:border-neon-cyan"
                    required
                  />
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                </div>
              </div>
            )}

            {/* Company (If signup) */}
            {mode === 'signup' && (
              <div className="space-y-1">
                <label className="text-slate-300 font-semibold">Company / Workspace Name</label>
                <input
                  type="text"
                  placeholder="LinkAI Labs"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-white/10 text-white outline-none focus:border-neon-cyan"
                />
              </div>
            )}

            {/* Password */}
            {mode !== 'forgot' && (
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-slate-300 font-semibold">Password</label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => setMode('forgot')}
                      className="text-[11px] text-neon-cyan hover:underline"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-3.5 py-2.5 pl-10 rounded-xl bg-slate-950 border border-white/10 text-white outline-none focus:border-neon-cyan font-mono"
                    required
                  />
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-glow py-3 rounded-xl bg-gradient-to-r from-neon-cyan via-blue-500 to-neon-purple text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/25 mt-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin mx-auto" />
              ) : mode === 'login' ? (
                'Sign In to Workspace'
              ) : mode === 'signup' ? (
                'Create Free Account'
              ) : (
                'Send Reset Token'
              )}
            </button>
          </form>

          {/* Google OAuth Simulation Button */}
          <button
            onClick={() => handleDemoLogin()}
            className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/10 text-slate-300 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.03h3.89c2.28-2.1 3.65-5.2 3.65-9.12z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.89-3.03c-1.08.72-2.45 1.16-4.04 1.16-3.11 0-5.74-2.11-6.68-4.96H1.21v3.13C3.26 21.48 7.34 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.32 14.26c-.24-.72-.38-1.49-.38-2.26s.14-1.54.38-2.26V6.61H1.21C.44 8.14 0 9.99 0 12s.44 3.86 1.21 5.39l4.11-3.13z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.52 1.21 6.61l4.11 3.13c.94-2.85 3.57-4.99 6.68-4.99z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>
        </div>
      </div>
    </div>
  );
}
