import React from 'react';
import { 
  Users, 
  ArrowDownCircle, 
  ArrowUpCircle, 
  Activity, 
  ShieldCheck, 
  Zap, 
  Layers,
  Wifi,
  Radio
} from 'lucide-react';
import { MetricsHistoryEntry, PeerNode } from '../types/p2p';
import { TOTAL_PIECES } from '../utils/p2pDefaults';

interface HeroMetricsBarProps {
  peers: PeerNode[];
  latestMetrics: MetricsHistoryEntry;
  activePacketCount: number;
}

export const HeroMetricsBar: React.FC<HeroMetricsBarProps> = ({
  peers,
  latestMetrics,
  activePacketCount
}) => {
  const seedersCount = peers.filter(p => p.type === 'seeder' && p.status !== 'disconnected').length;
  const leechersCount = peers.filter(p => p.type === 'leecher' && p.status !== 'disconnected').length;
  const offlineCount = peers.filter(p => p.status === 'disconnected' || p.type === 'offline').length;

  const totalPossiblePieces = peers.length * TOTAL_PIECES;
  const totalDownloadedPieces = peers.reduce((acc, p) => acc + p.pieces.filter(Boolean).length, 0);
  const totalSwarmProgress = totalPossiblePieces > 0 ? Math.round((totalDownloadedPieces / totalPossiblePieces) * 100) : 0;

  // Health color calculation
  const health = latestMetrics.networkHealth || 90;
  let healthColor = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
  if (health < 50) {
    healthColor = 'text-rose-400 bg-rose-500/10 border-rose-500/30';
  } else if (health < 75) {
    healthColor = 'text-amber-400 bg-amber-500/10 border-amber-500/30';
  }

  return (
    <section className="px-4 pt-4 pb-2 max-w-7xl mx-auto">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        
        {/* Total Swarm Peers */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3 shadow-md relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Swarm Peers</span>
            <Users className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-black font-mono text-slate-100">{peers.length}</span>
            <span className="text-xs font-semibold text-cyan-400 font-mono">nodes</span>
          </div>
          <div className="flex items-center space-x-1.5 mt-2 text-[10px] font-medium font-mono">
            <span className="text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">{seedersCount} Seeds</span>
            <span className="text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded border border-cyan-500/20">{leechersCount} Leech</span>
            {offlineCount > 0 && (
              <span className="text-slate-400 bg-slate-800 px-1 py-0.5 rounded">{offlineCount} Off</span>
            )}
          </div>
          <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-xl pointer-events-none group-hover:bg-cyan-500/10 transition-all" />
        </div>

        {/* Download Throughput */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3 shadow-md relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Swarm Download</span>
            <ArrowDownCircle className="w-4 h-4 text-emerald-400 animate-bounce" />
          </div>
          <div className="flex items-baseline space-x-1.5">
            <span className="text-2xl font-black font-mono text-emerald-400">
              {latestMetrics.downloadSpeedMB || '0.00'}
            </span>
            <span className="text-xs font-semibold text-emerald-500 font-mono">MB/s</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2.5 overflow-hidden">
            <div 
              className="bg-emerald-400 h-full rounded-full transition-all duration-300 shadow-[0_0_8px_rgba(52,211,153,0.8)]"
              style={{ width: `${Math.min(100, (latestMetrics.downloadSpeedMB / 50) * 100)}%` }}
            />
          </div>
        </div>

        {/* Upload Throughput */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3 shadow-md relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Swarm Upload</span>
            <ArrowUpCircle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline space-x-1.5">
            <span className="text-2xl font-black font-mono text-amber-400">
              {latestMetrics.uploadSpeedMB || '0.00'}
            </span>
            <span className="text-xs font-semibold text-amber-500 font-mono">MB/s</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2.5 overflow-hidden">
            <div 
              className="bg-amber-400 h-full rounded-full transition-all duration-300 shadow-[0_0_8px_rgba(251,191,36,0.8)]"
              style={{ width: `${Math.min(100, (latestMetrics.uploadSpeedMB / 50) * 100)}%` }}
            />
          </div>
        </div>

        {/* Active Connections & Packets */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3 shadow-md relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Mesh Pipes</span>
            <Radio className="w-4 h-4 text-purple-400" />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-black font-mono text-purple-300">{latestMetrics.totalConnections}</span>
            <span className="text-xs font-semibold text-purple-400 font-mono">links</span>
          </div>
          <div className="flex items-center space-x-1 mt-2 text-[10px] text-slate-400 font-mono">
            <Zap className="w-3 h-3 text-cyan-400" />
            <span>{activePacketCount} flying packets</span>
          </div>
        </div>

        {/* Average Latency */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3 shadow-md relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Avg Latency</span>
            <Wifi className="w-4 h-4 text-blue-400" />
          </div>
          <div className="flex items-baseline space-x-1.5">
            <span className="text-2xl font-black font-mono text-slate-100">{latestMetrics.avgLatency || 18}</span>
            <span className="text-xs font-semibold text-blue-400 font-mono">ms</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-2 font-mono">Round-Trip Time (RTT)</p>
        </div>

        {/* Network Health Score */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3 shadow-md relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Swarm Health</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-black font-mono text-slate-100">{health}%</span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border font-mono ${healthColor}`}>
              {health > 80 ? 'EXCELLENT' : health > 50 ? 'STABLE' : 'DEGRADED'}
            </span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2.5 overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-300 ${
                health > 80 ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]' : health > 50 ? 'bg-amber-400' : 'bg-rose-500'
              }`}
              style={{ width: `${health}%` }}
            />
          </div>
        </div>

      </div>
    </section>
  );
};
