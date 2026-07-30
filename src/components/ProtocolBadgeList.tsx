import React, { useState } from 'react';
import { PeerNode } from '../types/p2p';
import { getPeerProtocolFlags, ProtocolFlag } from '../utils/p2pFlags';
import { CheckCircle2, Info } from 'lucide-react';

interface ProtocolBadgeListProps {
  peer: PeerNode;
  maxFlags?: number;
  compact?: boolean;
}

export const ProtocolBadgeList: React.FC<ProtocolBadgeListProps> = ({
  peer,
  maxFlags = 8,
  compact = false
}) => {
  const flags = getPeerProtocolFlags(peer);
  const displayFlags = flags.slice(0, maxFlags);
  const [hoveredFlagCode, setHoveredFlagCode] = useState<string | null>(null);

  return (
    <div className="flex flex-wrap items-center gap-1.5 relative">
      {displayFlags.map((flag) => {
        const isHovered = hoveredFlagCode === flag.code;
        return (
          <div
            key={`${peer.id}-flag-${flag.code}`}
            className="relative inline-block"
            onMouseEnter={() => setHoveredFlagCode(flag.code)}
            onMouseLeave={() => setHoveredFlagCode(null)}
          >
            <span
              className={`inline-flex items-center justify-center font-mono font-bold rounded-md border shadow-sm transition-all duration-200 cursor-pointer select-none ${
                compact ? 'px-1.5 py-0.5 text-[10px]' : 'px-2 py-0.5 text-[11px]'
              } ${flag.colorStyle} ${
                isHovered ? 'scale-110 ring-2 ring-cyan-400/50 shadow-cyan-500/20 z-20' : ''
              }`}
            >
              [{flag.code}]
            </span>

            {/* Custom Interactive Tooltip Popover */}
            {isHovered && (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-slate-950 border border-slate-700 rounded-xl shadow-2xl z-50 pointer-events-none animate-in fade-in zoom-in-95 duration-150 font-sans">
                {/* Arrow */}
                <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px border-8 border-transparent border-t-slate-950" />
                
                {/* Header */}
                <div className="flex items-center justify-between pb-1.5 border-b border-slate-800 mb-1.5">
                  <div className="flex items-center space-x-1.5">
                    <span className="font-mono font-bold text-xs text-cyan-400 bg-cyan-950 px-1.5 py-0.5 rounded border border-cyan-800">
                      [{flag.code}]
                    </span>
                    <span className="font-bold text-xs text-slate-100">{flag.name}</span>
                  </div>
                  <span className="flex items-center space-x-1 text-[10px] font-medium font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-800/60">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>{flag.status}</span>
                  </span>
                </div>

                {/* Description */}
                <p className="text-[11px] text-slate-300 leading-relaxed mb-2">
                  {flag.description}
                </p>

                {/* Technical Specs */}
                {flag.technicalDetail && (
                  <div className="pt-1.5 border-t border-slate-800/80 flex items-start space-x-1.5 text-[10px] font-mono text-teal-300/90">
                    <Info className="w-3 h-3 text-teal-400 shrink-0 mt-0.5" />
                    <span>{flag.technicalDetail}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
      {flags.length > maxFlags && (
        <span
          title={`${flags.length - maxFlags} more active protocol flags`}
          className="text-[10px] font-mono text-slate-400 px-1.5 py-0.5 bg-slate-900 rounded border border-slate-800 cursor-help"
        >
          +{flags.length - maxFlags}
        </span>
      )}
    </div>
  );
};

