import React, { useState, useEffect, useRef } from 'react';
import { 
  Terminal, 
  Search, 
  Copy, 
  Check, 
  ShieldAlert, 
  CheckCircle2, 
  Info, 
  Globe, 
  Zap, 
  Activity, 
  AlertTriangle, 
  XCircle, 
  Sparkles, 
  Cpu,
  Radio,
  ArrowUpRight
} from 'lucide-react';
import { EventLog, EventLevel } from '../types/p2p';

interface LiveEventLogProps {
  logs: EventLog[];
  onClear: () => void;
}

export const LiveEventLog: React.FC<LiveEventLogProps> = ({ logs, onClear }) => {
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [autoScroll, setAutoScroll] = useState<boolean>(true);
  const logContainerRef = useRef<HTMLDivElement>(null);

  const filteredLogs = logs.filter(log => {
    if (activeFilter !== 'all') {
      if (activeFilter === 'info' && log.level !== 'info') return false;
      if (activeFilter === 'success' && log.level !== 'success') return false;
      if (activeFilter === 'tracker' && log.level !== 'tracker') return false;
      if (activeFilter === 'choke' && log.level !== 'choke') return false;
      if (activeFilter === 'warning' && log.level !== 'warning') return false;
      if (activeFilter === 'error' && log.level !== 'error') return false;
    }

    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      return (
        log.message.toLowerCase().includes(q) ||
        log.source.toLowerCase().includes(q) ||
        (log.details && log.details.toLowerCase().includes(q))
      );
    }
    return true;
  });

  // Smooth Auto-scroll to top when new logs arrive (since newest logs are prepended to logs array)
  useEffect(() => {
    if (autoScroll && logContainerRef.current) {
      logContainerRef.current.scrollTop = 0;
    }
  }, [logs, autoScroll]);

  const handleCopy = () => {
    const text = logs.map(l => `[${l.timestamp}] [${l.level.toUpperCase()}] ${l.source} -> ${l.message} ${l.details ? `(${l.details})` : ''}`).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getCategoryMeta = (level: EventLevel) => {
    switch (level) {
      case 'success':
        return {
          icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />,
          badge: <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 tracking-wider">SUCCESS</span>,
          border: 'border-emerald-500/30 bg-emerald-950/20'
        };
      case 'error':
        return {
          icon: <XCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />,
          badge: <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-red-950 text-red-300 border border-red-800 tracking-wider">ERROR</span>,
          border: 'border-red-500/40 bg-red-950/20'
        };
      case 'warning':
        return {
          icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />,
          badge: <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800 tracking-wider">WARNING</span>,
          border: 'border-amber-500/30 bg-amber-950/20'
        };
      case 'tracker':
        return {
          icon: <Globe className="w-3.5 h-3.5 text-purple-400 shrink-0" />,
          badge: <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800 tracking-wider">TRACKER</span>,
          border: 'border-purple-500/30 bg-purple-950/20'
        };
      case 'choke':
        return {
          icon: <ShieldAlert className="w-3.5 h-3.5 text-orange-400 shrink-0" />,
          badge: <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-orange-950 text-orange-300 border border-orange-800 tracking-wider">CHOKE</span>,
          border: 'border-orange-500/30 bg-orange-950/20'
        };
      case 'info':
      default:
        return {
          icon: <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0" />,
          badge: <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 tracking-wider">INFO</span>,
          border: 'border-slate-800 bg-slate-900/60'
        };
    }
  };

  const categories = [
    { id: 'all', label: 'ALL' },
    { id: 'info', label: 'INFO' },
    { id: 'success', label: 'SUCCESS' },
    { id: 'tracker', label: 'TRACKER' },
    { id: 'choke', label: 'CHOKE' },
    { id: 'warning', label: 'WARN' },
    { id: 'error', label: 'ERROR' },
  ];

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col min-h-[480px] lg:h-[580px]">
      
      {/* Console Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
        <div className="flex items-center space-x-2">
          <Terminal className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider font-mono">
            WIRESHARK PROTOCOL FEED
          </h3>
          <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full font-mono">
            {filteredLogs.length} events
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setAutoScroll(!autoScroll)}
            className={`px-2 py-1 rounded-lg text-[10px] font-mono border transition-all ${
              autoScroll 
                ? 'bg-emerald-950 text-emerald-400 border-emerald-800 font-bold' 
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
            title="Toggle auto-scroll to newest events"
          >
            {autoScroll ? 'AUTO-SCROLL ON' : 'PAUSED'}
          </button>

          <button
            onClick={handleCopy}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs transition-colors"
            title="Copy logs to clipboard"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={onClear}
            className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[11px] font-mono transition-colors"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="space-y-2 mb-3">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search protocol frames by source, message, piece..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 font-mono focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-1 font-mono text-[10px]">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveFilter(cat.id)}
              className={`px-2 py-0.5 rounded-md uppercase font-semibold transition-all ${
                activeFilter === cat.id
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-[0_0_8px_rgba(6,182,212,0.4)]'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Terminal Output Window */}
      <div 
        ref={logContainerRef}
        className="flex-1 bg-slate-950 border border-slate-800 rounded-xl p-3 overflow-y-auto font-mono text-[11px] space-y-2 custom-scrollbar"
      >
        {filteredLogs.length === 0 ? (
          <div className="text-slate-600 text-center py-12 italic">
            No matching protocol frames recorded yet...
          </div>
        ) : (
          filteredLogs.map((log, index) => {
            const meta = getCategoryMeta(log.level);
            const isNewest = index === 0;

            return (
              <div
                key={log.id}
                className={`p-2.5 rounded-xl border transition-all ${meta.border} ${
                  isNewest 
                    ? 'ring-1 ring-cyan-500/50 shadow-[0_0_12px_rgba(6,182,212,0.15)] opacity-100' 
                    : 'opacity-90 hover:opacity-100'
                }`}
              >
                {/* Header Row: Timestamp, Icon, Category Badge */}
                <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                  <div className="flex items-center space-x-1.5">
                    {meta.icon}
                    <span className="text-cyan-400 font-bold">{log.timestamp}</span>
                    <span className="text-slate-600">•</span>
                    <span className="text-slate-200 font-bold">{log.source}</span>
                    {log.target && (
                      <span className="flex items-center space-x-1 text-slate-400">
                        <ArrowUpRight className="w-3 h-3 text-slate-500" />
                        <span>{log.target}</span>
                      </span>
                    )}
                  </div>
                  {meta.badge}
                </div>

                {/* Message Body */}
                <div className="text-slate-100 leading-snug font-semibold pl-5">
                  {log.message}
                </div>

                {/* Details Breakdown */}
                {log.details && (
                  <div className="text-[10px] text-slate-400 mt-1 pl-5 border-l-2 border-slate-700/80">
                    {log.details}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
