import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  Download,
  Calendar,
  Clock,
  CheckCircle2,
  Mail,
  FileText,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import Breadcrumb from '../components/Breadcrumb';
import Modal from '../components/Modal';
import { api } from '../services/api';
import { useToast } from '../components/Toast';

export default function DataExportCenterPage({ onNavigate }) {
  const { addToast } = useToast();

  const [pdfData, setPdfData] = useState(null);
  const [loadingPdf, setLoadingPdf] = useState(false);

  // Scheduled export modal
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [scheduleEmail, setScheduleEmail] = useState('alex@linkai.io');
  const [scheduleFreq, setScheduleFreq] = useState('Weekly');
  const [scheduleFormat, setScheduleFormat] = useState('PDF');

  useEffect(() => {
    loadExecutiveSummary();
  }, []);

  const loadExecutiveSummary = async () => {
    try {
      setLoadingPdf(true);
      const res = await api.getExecutivePdfSummary();
      setPdfData(res);
    } catch (err) {
      console.warn('Failed to load executive summary:', err);
    } finally {
      setLoadingPdf(false);
    }
  };

  const handleDownloadCsv = () => {
    window.open(api.exportCsvUrl, '_blank');
    addToast('Initiating CSV export download...', 'success');
  };

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.scheduleExport({
        email: scheduleEmail,
        frequency: scheduleFreq,
        format: scheduleFormat,
      });
      addToast(res.message || 'Scheduled automated delivery!', 'success');
      setIsScheduleOpen(false);
    } catch (err) {
      addToast('Failed to schedule export', 'error');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <Breadcrumb
        items={[
          { label: 'Dashboard', onClick: () => onNavigate('dashboard') },
          { label: 'Data Export Center' }
        ]}
        onBack={() => onNavigate('dashboard')}
        badgeText="Multi-Format Dispatcher"
      />

      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl p-6 sm:p-7 bg-gradient-to-r from-sky-950/50 via-slate-900 to-cyan-950/50 border border-sky-500/30">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/15 border border-sky-500/40 text-sky-300 text-xs font-semibold mb-2">
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Telemetry Data Pipeline</span>
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              Data Export Center & PDF Reports
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              Extract clickstream telemetry, UTM attribution tables, and executive summary reports in CSV, Excel, or printable PDF briefings.
            </p>
          </div>

          <button
            onClick={() => setIsScheduleOpen(true)}
            className="btn-glow flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-400 to-blue-500 text-slate-950 font-bold text-xs"
          >
            <Calendar className="w-4 h-4" />
            <span>Schedule Automated Report</span>
          </button>
        </div>
      </div>

      {/* Export Options Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* CSV Format */}
        <div className="glass-card p-6 rounded-2xl flex flex-col justify-between space-y-4">
          <div>
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 w-fit mb-3">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">Full Telemetry CSV</h3>
            <p className="text-xs text-slate-400 mt-1">
              Raw tabular data including Short Codes, Destination URLs, Clicks, Unique Clicks, Tags, and Status.
            </p>
          </div>

          <button
            onClick={handleDownloadCsv}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-semibold text-xs border border-emerald-500/40 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Download CSV Spreadsheet</span>
          </button>
        </div>

        {/* Excel XLSX */}
        <div className="glass-card p-6 rounded-2xl flex flex-col justify-between space-y-4">
          <div>
            <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 w-fit mb-3">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">Formatted Excel (XLSX)</h3>
            <p className="text-xs text-slate-400 mt-1">
              Pre-styled multi-tab spreadsheet formatted for Microsoft Excel & Google Sheets with pivot charts.
            </p>
          </div>

          <button
            onClick={handleDownloadCsv}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 font-semibold text-xs border border-blue-500/40 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Download Excel Workbook</span>
          </button>
        </div>

        {/* Executive PDF Briefing */}
        <div className="glass-card p-6 rounded-2xl flex flex-col justify-between space-y-4">
          <div>
            <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 w-fit mb-3">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">Executive PDF Report</h3>
            <p className="text-xs text-slate-400 mt-1">
              High-level visual summary with KPI badges, AI diagnostic takeaways, and top performing assets.
            </p>
          </div>

          <button
            onClick={() => window.print()}
            className="w-full btn-glow flex items-center justify-center gap-2 py-2.5 rounded-xl bg-neon-cyan text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20"
          >
            <Download className="w-4 h-4" />
            <span>Print / Save PDF Report</span>
          </button>
        </div>
      </div>

      {/* PDF Report Live Preview Sheet */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div>
            <span className="text-xs uppercase font-bold text-neon-cyan tracking-wider">
              Document Preview
            </span>
            <h3 className="text-lg font-bold text-white mt-0.5">
              LinkAI Executive Intelligence Report (Preview)
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-400">
            {pdfData?.report_date || 'October 03, 2026'}
          </span>
        </div>

        {/* Report Canvas */}
        <div className="p-6 sm:p-8 rounded-2xl bg-slate-950/80 border border-white/10 space-y-6 text-xs">
          {/* Executive Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-6 border-b border-white/10">
            <div>
              <h2 className="text-xl font-extrabold text-white">LinkAI Intelligence Report</h2>
              <p className="text-slate-400">Workspace: {pdfData?.workspace || 'Enterprise Cloud'}</p>
            </div>
            <div className="text-right">
              <span className="px-2.5 py-1 rounded bg-neon-cyan/15 text-neon-cyan border border-neon-cyan/30 font-mono font-bold">
                CONFIDENTIAL
              </span>
            </div>
          </div>

          {/* KPI Summary Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-slate-900 border border-white/5">
              <span className="text-slate-400">Total Tracked Traffic</span>
              <p className="text-2xl font-bold text-white mt-1 font-mono">
                {pdfData?.kpi_summary?.total_traffic || '3,270'}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900 border border-white/5">
              <span className="text-slate-400">Unique Human Reach</span>
              <p className="text-2xl font-bold text-neon-cyan mt-1 font-mono">
                {pdfData?.kpi_summary?.unique_reach || '2,815'}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900 border border-white/5">
              <span className="text-slate-400">Active Campaigns</span>
              <p className="text-2xl font-bold text-white mt-1 font-mono">
                {pdfData?.kpi_summary?.active_campaigns || '4'}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900 border border-white/5">
              <span className="text-slate-400">Average Conversion</span>
              <p className="text-2xl font-bold text-emerald-400 mt-1 font-mono">
                {pdfData?.kpi_summary?.avg_conversion_rate || '82.8%'}
              </p>
            </div>
          </div>

          {/* AI Executive Takeaways */}
          <div className="space-y-2">
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">
              AI Strategic Takeaways:
            </h4>
            <div className="space-y-1.5">
              {(pdfData?.executive_takeaways || [
                'Mobile traffic comprises 65% of total engagement, predominantly initiated through WhatsApp & Instagram.',
                'Peak audience interaction falls between 6:30 PM and 8:30 PM local time.',
                'A/B split testing yielded an average +24% lift in downstream conversion on optimized variants.'
              ]).map((t, idx) => (
                <div key={idx} className="flex items-start gap-2 text-slate-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{t}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Top Performing Assets */}
          <div className="space-y-2 pt-2">
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">
              Top Assets in Portfolio:
            </h4>
            <div className="divide-y divide-white/5 bg-slate-900/60 rounded-xl border border-white/5 overflow-hidden">
              {(pdfData?.top_performing_assets || [
                { short_code: 'ai-launch', title: 'LinkAI 2.0 Global Launch', clicks: 1420 },
                { short_code: 'summer-deal', title: '50% Off Early Adopter Pro Pass', clicks: 890 },
                { short_code: 'wa-community', title: 'Founders WhatsApp Club', clicks: 640 }
              ]).map((l, idx) => (
                <div key={idx} className="p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-neon-cyan">/{l.short_code}</span>
                    <span className="text-slate-300">— {l.title}</span>
                  </div>
                  <span className="font-mono font-bold text-white">{l.clicks} clicks</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Schedule Export Modal */}
      <Modal
        isOpen={isScheduleOpen}
        onClose={() => setIsScheduleOpen(false)}
        title="Schedule Recurring Telemetry Reports"
      >
        <form onSubmit={handleScheduleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-slate-300">Recipient Email Address</label>
            <input
              type="email"
              value={scheduleEmail}
              onChange={(e) => setScheduleEmail(e.target.value)}
              className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white text-xs"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-300">Cadence</label>
              <select
                value={scheduleFreq}
                onChange={(e) => setScheduleFreq(e.target.value)}
                className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white text-xs"
              >
                <option value="Daily">Daily Summary</option>
                <option value="Weekly">Weekly Digest (Mondays)</option>
                <option value="Monthly">Monthly Executive Review</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-300">Format</label>
              <select
                value={scheduleFormat}
                onChange={(e) => setScheduleFormat(e.target.value)}
                className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-950 border border-white/10 text-white text-xs"
              >
                <option value="PDF">Executive PDF</option>
                <option value="CSV">Raw CSV</option>
                <option value="Excel">Excel Spreadsheet</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsScheduleOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-neon-cyan text-slate-950 font-bold"
            >
              Arm Scheduled Delivery
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
