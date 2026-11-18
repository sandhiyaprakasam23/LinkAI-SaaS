import React, { useState, useEffect } from 'react';
import {
  Link2,
  Search,
  Filter,
  Copy,
  Check,
  QrCode,
  BarChart3,
  Edit2,
  Trash2,
  Archive,
  History,
  CheckSquare,
  Square,
  Sparkles,
  ExternalLink,
  Shield,
  Clock,
  Layers,
  MoreVertical,
  CheckCircle2
} from 'lucide-react';
import Breadcrumb from '../components/Breadcrumb';
import Modal from '../components/Modal';
import { api } from '../services/api';
import { useToast } from '../components/Toast';

export default function LinkControlCenterPage({ onNavigate, onSelectLinkForAnalytics }) {
  const { addToast } = useToast();

  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showArchived, setShowArchived] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [copiedId, setCopiedId] = useState(null);

  // Modals
  const [qrModalLink, setQrModalLink] = useState(null);
  const [historyModalLink, setHistoryModalLink] = useState(null);
  const [deleteModalLink, setDeleteModalLink] = useState(null);
  const [editModalLink, setEditModalLink] = useState(null);

  useEffect(() => {
    loadLinks();
  }, [search, statusFilter, showArchived]);

  const loadLinks = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (showArchived) params.append('archived', 'true');

      const query = params.toString() ? `?${params.toString()}` : '';
      const data = await api.getLinks(query);
      setLinks(data || []);
    } catch (err) {
      console.warn('Failed to load links:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (shortCode, id) => {
    const fullUrl = `http://localhost:8001/r/${shortCode}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedId(id);
    addToast('Copied link to clipboard ✅', 'success');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleToggleStatus = async (link) => {
    try {
      const updated = await api.updateLink(link.id, { is_active: !link.is_active });
      setLinks((prev) => prev.map((l) => (l.id === link.id ? updated : l)));
      addToast(`Link is now ${updated.is_active ? 'Active' : 'Paused'}`, 'info');
    } catch (err) {
      addToast('Failed to toggle status', 'error');
    }
  };

  const handleDelete = async () => {
    if (!deleteModalLink) return;
    try {
      await api.deleteLink(deleteModalLink.id);
      setLinks((prev) => prev.filter((l) => l.id !== deleteModalLink.id));
      addToast('Link deleted successfully', 'success');
      setDeleteModalLink(null);
    } catch (err) {
      addToast('Failed to delete link', 'error');
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const updated = await api.updateLink(editModalLink.id, {
        title: editModalLink.title,
        original_url: editModalLink.original_url,
      });
      setLinks((prev) => prev.map((l) => (l.id === editModalLink.id ? updated : l)));
      addToast('Link updated successfully', 'success');
      setEditModalLink(null);
    } catch (err) {
      addToast('Failed to update link', 'error');
    }
  };

  // Bulk Actions
  const handleBulkAction = async (action) => {
    if (selectedIds.length === 0) return;
    try {
      await api.bulkAction(action, selectedIds);
      addToast(`Bulk ${action} executed successfully`, 'success');
      setSelectedIds([]);
      loadLinks();
    } catch (err) {
      addToast('Bulk action failed', 'error');
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === links.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(links.map((l) => l.id));
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <Breadcrumb
        items={[
          { label: 'Dashboard', onClick: () => onNavigate('dashboard') },
          { label: 'Link Control Center' }
        ]}
        onBack={() => onNavigate('dashboard')}
        badgeText={`${links.length} Links Active`}
        actionSlot={
          <button
            onClick={() => onNavigate('create-link')}
            className="btn-glow flex items-center gap-2 px-4 py-2 rounded-xl bg-neon-cyan text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20"
          >
            <span>+ Create New Link</span>
          </button>
        }
      />

      {/* Control Toolbar */}
      <div className="glass-panel p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Search by title, alias, or URL..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2 pl-10 rounded-xl bg-slate-900 border border-white/10 text-xs text-white placeholder:text-slate-500 outline-none focus:border-neon-cyan"
          />
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
        </div>

        {/* Filters & Archive Toggle */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-end">
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-white/10 text-xs">
            {['all', 'active', 'disabled', 'expired'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 rounded-lg capitalize font-medium transition-colors ${
                  statusFilter === st ? 'bg-neon-cyan text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowArchived(!showArchived)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-colors ${
              showArchived ? 'bg-purple-900/40 text-purple-300 border-purple-500/50' : 'bg-slate-900 text-slate-400 border-white/10'
            }`}
          >
            <Archive className="w-3.5 h-3.5" />
            <span>{showArchived ? 'Viewing Archived' : 'Show Archived'}</span>
          </button>
        </div>
      </div>

      {/* Bulk Action Bar (Reveals when items are selected) */}
      {selectedIds.length > 0 && (
        <div className="p-3 rounded-xl bg-gradient-to-r from-cyan-950/80 to-purple-950/80 border border-neon-cyan/40 flex items-center justify-between text-xs animate-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white px-2 py-0.5 rounded bg-neon-cyan/20 text-neon-cyan">
              {selectedIds.length} Selected
            </span>
            <span className="text-slate-300 hidden sm:inline">Apply bulk operations:</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleBulkAction('activate')}
              className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30 font-semibold"
            >
              Activate All
            </button>
            <button
              onClick={() => handleBulkAction('disable')}
              className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30 font-semibold"
            >
              Disable All
            </button>
            <button
              onClick={() => handleBulkAction('archive')}
              className="px-2.5 py-1 rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/30 hover:bg-purple-500/30 font-semibold"
            >
              Archive
            </button>
            <button
              onClick={() => handleBulkAction('delete')}
              className="px-2.5 py-1 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:bg-rose-500/30 font-semibold"
            >
              Delete
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="glass-panel rounded-2xl overflow-hidden border border-white/10">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/90 text-slate-400 font-bold uppercase tracking-wider border-b border-white/10">
              <tr>
                <th className="p-4 w-10">
                  <button onClick={toggleSelectAll} className="text-slate-400 hover:text-white">
                    {selectedIds.length > 0 && selectedIds.length === links.length ? (
                      <CheckSquare className="w-4 h-4 text-neon-cyan" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                </th>
                <th className="p-4">Short Link & Title</th>
                <th className="p-4">Destination Target</th>
                <th className="p-4 text-center">Clicks</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4">Tags & Routing</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-slate-400">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-neon-cyan border-t-transparent rounded-full animate-spin" />
                      <span>Loading links inventory...</span>
                    </div>
                  </td>
                </tr>
              ) : links.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-slate-400">
                    <p className="text-sm font-semibold text-slate-300">No links matched your query</p>
                    <p className="text-xs text-slate-500 mt-1">Try resetting filters or creating a new link</p>
                  </td>
                </tr>
              ) : (
                links.map((link) => {
                  const isSelected = selectedIds.includes(link.id);

                  return (
                    <tr
                      key={link.id}
                      className={`hover:bg-slate-800/40 transition-colors ${
                        isSelected ? 'bg-slate-800/60' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="p-4">
                        <button
                          onClick={() => {
                            if (isSelected) {
                              setSelectedIds((prev) => prev.filter((id) => id !== link.id));
                            } else {
                              setSelectedIds((prev) => [...prev, link.id]);
                            }
                          }}
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-neon-cyan" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-600 hover:text-slate-400" />
                          )}
                        </button>
                      </td>

                      {/* Short Link & Title */}
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-white text-sm">
                            /{link.short_code}
                          </span>
                          <button
                            onClick={() => handleCopy(link.short_code, link.id)}
                            className="p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-neon-cyan transition-colors"
                            title="Copy Short Link"
                          >
                            {copiedId === link.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                        <p className="text-slate-400 font-medium truncate max-w-xs mt-0.5">
                          {link.title || 'Untitled Campaign'}
                        </p>
                      </td>

                      {/* Target */}
                      <td className="p-4">
                        <a
                          href={link.original_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-slate-400 hover:text-neon-cyan truncate max-w-[200px] flex items-center gap-1 group font-mono text-[11px]"
                        >
                          <span className="truncate">{link.original_url}</span>
                          <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 shrink-0" />
                        </a>
                      </td>

                      {/* Clicks */}
                      <td className="p-4 text-center">
                        <span className="font-mono font-bold text-white text-sm">
                          {link.clicks_count?.toLocaleString()}
                        </span>
                        <p className="text-[10px] text-slate-400">{link.unique_clicks_count || 0} unique</p>
                      </td>

                      {/* Status Toggle Switch */}
                      <td className="p-4 text-center">
                        <button
                          onClick={() => handleToggleStatus(link)}
                          className={`px-2.5 py-1 rounded-full text-[11px] font-bold border transition-all ${
                            link.is_active
                              ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/25'
                              : 'bg-rose-500/15 text-rose-400 border-rose-500/30 hover:bg-rose-500/25'
                          }`}
                        >
                          {link.is_active ? 'Active' : 'Paused'}
                        </button>
                      </td>

                      {/* Tags & Routing Badges */}
                      <td className="p-4">
                        <div className="flex flex-wrap gap-1">
                          {(link.tags || []).map((t, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] border border-white/5"
                            >
                              {t}
                            </span>
                          ))}
                          {link.enable_geo_routing && (
                            <span className="px-1.5 py-0.5 rounded bg-cyan-950 text-neon-cyan text-[10px] border border-neon-cyan/30">
                              Geo-Routed
                            </span>
                          )}
                          {link.enable_ab_testing && (
                            <span className="px-1.5 py-0.5 rounded bg-purple-950 text-neon-purple text-[10px] border border-neon-purple/30">
                              A/B Test
                            </span>
                          )}
                          {link.has_password && (
                            <span className="px-1.5 py-0.5 rounded bg-amber-950 text-amber-400 text-[10px] border border-amber-500/30 flex items-center gap-0.5">
                              <Shield className="w-2.5 h-2.5" /> PIN
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Row Actions */}
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => {
                              onSelectLinkForAnalytics?.(link.id);
                              onNavigate('analytics');
                            }}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-neon-cyan transition-colors"
                            title="Deep Analytics"
                          >
                            <BarChart3 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => setQrModalLink(link)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                            title="Generate QR Code"
                          >
                            <QrCode className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => setHistoryModalLink(link)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                            title="Version History (Git-like Log)"
                          >
                            <History className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => setEditModalLink(link)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                            title="Edit Link"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => setDeleteModalLink(link)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/50 text-slate-400 hover:text-rose-400 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* QR Code Modal Preview */}
      <Modal
        isOpen={!!qrModalLink}
        onClose={() => setQrModalLink(null)}
        title={`QR Studio Preview: /${qrModalLink?.short_code}`}
      >
        {qrModalLink && (
          <div className="text-center space-y-4">
            <div className="p-6 bg-slate-950 rounded-2xl border border-neon-cyan/30 inline-block shadow-[0_0_30px_rgba(0,245,255,0.15)]">
              <img
                src={`http://localhost:8001/api/links/${qrModalLink.id}/qr/`}
                alt="QR Code"
                className="w-48 h-48 mx-auto rounded-lg"
                onError={(e) => {
                  e.target.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=http://localhost:8001/r/${qrModalLink.short_code}`;
                }}
              />
            </div>
            <div>
              <p className="font-mono text-sm font-bold text-white">http://localhost:8001/r/{qrModalLink.short_code}</p>
              <p className="text-xs text-slate-400 mt-1">High-density Vector QR with error correction</p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => onNavigate('qr-studio')}
                className="px-4 py-2 rounded-xl bg-neon-cyan text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/25"
              >
                Open in Full QR Studio →
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Version History Modal */}
      <Modal
        isOpen={!!historyModalLink}
        onClose={() => setHistoryModalLink(null)}
        title={`Version History & Audit Log: /${historyModalLink?.short_code}`}
      >
        {historyModalLink && (
          <div className="space-y-3">
            <p className="text-xs text-slate-400">Audit trail of changes made to this shortened link:</p>
            <div className="space-y-2.5 max-h-72 overflow-y-auto">
              {(historyModalLink.history || [
                { id: 1, action: 'Created', details: 'Initialized short link destination', created_at: '2026-10-01 10:00' },
                { id: 2, action: 'Updated', details: 'Enabled UTM campaign and geo-routing', created_at: '2026-10-02 14:20' },
              ]).map((h, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-950/80 border border-white/5 text-xs">
                  <div className="flex items-center justify-between text-neon-cyan font-semibold">
                    <span>{h.action}</span>
                    <span className="text-slate-400 font-mono text-[10px]">{new Date(h.created_at).toLocaleString()}</span>
                  </div>
                  <p className="text-slate-300 mt-1">{h.details}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={!!editModalLink}
        onClose={() => setEditModalLink(null)}
        title="Edit Smart Link Parameters"
      >
        {editModalLink && (
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-300">Campaign Title</label>
              <input
                type="text"
                value={editModalLink.title || ''}
                onChange={(e) => setEditModalLink({ ...editModalLink, title: e.target.value })}
                className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white text-xs"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-300">Destination URL</label>
              <input
                type="url"
                value={editModalLink.original_url || ''}
                onChange={(e) => setEditModalLink({ ...editModalLink, original_url: e.target.value })}
                className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white text-xs font-mono"
              />
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setEditModalLink(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-neon-cyan text-slate-950 font-bold text-xs"
              >
                Save Changes
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteModalLink}
        onClose={() => setDeleteModalLink(null)}
        title="Confirm Link Deletion"
      >
        {deleteModalLink && (
          <div className="space-y-4 text-xs text-slate-300">
            <p>
              Are you sure you want to permanently delete short code{' '}
              <span className="font-mono font-bold text-rose-400">/{deleteModalLink.short_code}</span>?
            </p>
            <p className="text-slate-400">
              All incoming traffic will receive a 404 response. Historical click telemetry will be unlinked.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setDeleteModalLink(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs"
              >
                Permanently Delete
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
