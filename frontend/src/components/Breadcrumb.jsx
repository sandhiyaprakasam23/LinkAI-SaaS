import React from 'react';
import { ArrowLeft, ChevronRight, Sparkles } from 'lucide-react';

export default function Breadcrumb({ items, onBack, badgeText, actionSlot }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-white/5">
      <div className="flex items-center gap-2 text-sm text-slate-400">
        {onBack && (
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border border-white/10 hover:border-neon-cyan/40 transition-all text-xs font-medium mr-2 group"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform text-neon-cyan" />
            <span>Back</span>
          </button>
        )}

        {items.map((item, idx) => (
          <React.Fragment key={idx}>
            {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-slate-600" />}
            {idx === items.length - 1 ? (
              <span className="text-white font-medium flex items-center gap-1.5">
                {item.label}
                {badgeText && (
                  <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-neon-cyan/15 text-neon-cyan border border-neon-cyan/30 flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5" />
                    {badgeText}
                  </span>
                )}
              </span>
            ) : (
              <button
                onClick={item.onClick}
                className="hover:text-slate-200 transition-colors"
              >
                {item.label}
              </button>
            )}
          </React.Fragment>
        ))}
      </div>

      {actionSlot && <div className="flex items-center gap-2">{actionSlot}</div>}
    </div>
  );
}
