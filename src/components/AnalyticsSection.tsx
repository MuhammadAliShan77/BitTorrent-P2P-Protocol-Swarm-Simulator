import React from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Legend 
} from 'recharts';
import { MetricsHistoryEntry } from '../types/p2p';
import { BarChart3, Activity, TrendingUp, Zap } from 'lucide-react';

interface AnalyticsSectionProps {
  metricsHistory: MetricsHistoryEntry[];
}

export const AnalyticsSection: React.FC<AnalyticsSectionProps> = ({ metricsHistory }) => {
  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-2xl min-h-[500px] flex flex-col justify-between font-mono">
      
      {/* Header */}
      <div className="flex items-center space-x-2.5 pb-3 border-b border-slate-800 mb-4">
        <div className="p-2 bg-purple-500/10 border border-purple-500/30 rounded-xl">
          <BarChart3 className="w-5 h-5 text-purple-400" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wide">
            GRAFANA NETWORK TELEMETRY & SWARM METRICS
          </h2>
          <p className="text-xs text-slate-400 font-sans">
            Real-time Bandwidth Throughput, Peer Ratio Evolution, and RTT Latency Analysis
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
        
        {/* Chart 1: Swarm Throughput (Download vs Upload Speed MB/s) */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col justify-between h-[220px]">
          <div className="flex items-center justify-between text-xs font-bold text-slate-200 mb-2">
            <span className="flex items-center space-x-1">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              <span>Bandwidth Velocity (MB/s)</span>
            </span>
            <span className="text-[10px] text-slate-500">30-second rolling window</span>
          </div>

          <div className="w-full h-36">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={metricsHistory}>
                <defs>
                  <linearGradient id="dlGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="ulGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#fbbf24" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="timeLabel" stroke="#64748b" fontSize={9} />
                <YAxis stroke="#64748b" fontSize={9} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }}
                />
                <Area type="monotone" dataKey="downloadSpeedMB" name="Download (MB/s)" stroke="#22c55e" fillOpacity={1} fill="url(#dlGrad)" />
                <Area type="monotone" dataKey="uploadSpeedMB" name="Upload (MB/s)" stroke="#fbbf24" fillOpacity={1} fill="url(#ulGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Swarm Peer Composition (Seeders vs Leechers) */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col justify-between h-[220px]">
          <div className="flex items-center justify-between text-xs font-bold text-slate-200 mb-2">
            <span className="flex items-center space-x-1">
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              <span>Swarm Population Ratio</span>
            </span>
            <span className="text-[10px] text-slate-500">Seeders vs Leechers</span>
          </div>

          <div className="w-full h-36">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metricsHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="timeLabel" stroke="#64748b" fontSize={9} />
                <YAxis stroke="#64748b" fontSize={9} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }}
                />
                <Bar dataKey="seeders" name="Seeders (100%)" fill="#22c55e" stackId="a" />
                <Bar dataKey="leechers" name="Leechers (&lt;100%)" fill="#06b6d4" stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Average Network Latency (ms) */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col justify-between h-[220px]">
          <div className="flex items-center justify-between text-xs font-bold text-slate-200 mb-2">
            <span className="flex items-center space-x-1">
              <Zap className="w-3.5 h-3.5 text-blue-400" />
              <span>Swarm RTT Latency (ms)</span>
            </span>
          </div>

          <div className="w-full h-36">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={metricsHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="timeLabel" stroke="#64748b" fontSize={9} />
                <YAxis stroke="#64748b" fontSize={9} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }}
                />
                <Area type="monotone" dataKey="avgLatency" name="Latency (ms)" stroke="#3b82f6" fill="#1e3a8a" fillOpacity={0.3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Swarm Health Index */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col justify-between h-[220px]">
          <div className="flex items-center justify-between text-xs font-bold text-slate-200 mb-2">
            <span className="flex items-center space-x-1">
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              <span>Swarm Health Score (%)</span>
            </span>
          </div>

          <div className="w-full h-36">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={metricsHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="timeLabel" stroke="#64748b" fontSize={9} />
                <YAxis domain={[0, 100]} stroke="#64748b" fontSize={9} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }}
                />
                <Area type="monotone" dataKey="networkHealth" name="Health (%)" stroke="#10b981" fill="#064e3b" fillOpacity={0.4} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
};
