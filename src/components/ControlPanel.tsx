import React from 'react';
import { 
  UserPlus, 
  UserMinus, 
  AlertTriangle, 
  CheckCircle, 
  Zap, 
  Trash2, 
  Flame, 
  Activity, 
  Share2, 
  Network,
  RotateCcw
} from 'lucide-react';
import { TopologyType, FailureType } from '../types/p2p';

interface ControlPanelProps {
  onAddSeeder: () => void;
  onAddLeecher: () => void;
  onDisconnectRandom: () => void;
  onSpawnSwarm: () => void;
  onClearNetwork: () => void;
  topology: TopologyType;
  onChangeTopology: (topo: TopologyType) => void;
  activeFailure: FailureType;
  onSetFailure: (failure: FailureType) => void;
  onRecoverNetwork: () => void;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({
  onAddSeeder,
  onAddLeecher,
  onDisconnectRandom,
  onSpawnSwarm,
  onClearNetwork,
  topology,
  onChangeTopology,
  activeFailure,
  onSetFailure,
  onRecoverNetwork
}) => {
  const topologies: TopologyType[] = ['mesh', 'star', 'hybrid', 'ring', 'tree', 'random'];

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl">
      <div className="flex items-center space-x-2 mb-3 pb-2 border-b border-slate-800">
        <Zap className="w-4 h-4 text-cyan-400" />
        <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider font-mono">
          NETWORK INJECTION & TOPOLOGY CONTROL
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Swarm Dynamics Actions */}
        <div>
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2 font-mono">
            Swarm Dynamics
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={onAddSeeder}
              className="px-3 py-2 bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500/20 text-emerald-300 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all shadow-sm"
            >
              <UserPlus className="w-3.5 h-3.5 text-emerald-400" />
              <span>+ Seeder</span>
            </button>

            <button
              onClick={onAddLeecher}
              className="px-3 py-2 bg-cyan-500/10 border border-cyan-500/30 hover:bg-cyan-500/20 text-cyan-300 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all shadow-sm"
            >
              <UserPlus className="w-3.5 h-3.5 text-cyan-400" />
              <span>+ Leecher</span>
            </button>

            <button
              onClick={onDisconnectRandom}
              className="px-3 py-2 bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all"
            >
              <UserMinus className="w-3.5 h-3.5 text-amber-400" />
              <span>Drop Peer</span>
            </button>

            <button
              onClick={onSpawnSwarm}
              className="px-3 py-2 bg-purple-500/10 border border-purple-500/30 hover:bg-purple-500/20 text-purple-300 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all shadow-sm"
            >
              <Flame className="w-3.5 h-3.5 text-purple-400" />
              <span>+20 Swarm</span>
            </button>
          </div>
        </div>

        {/* Network Topology Selectors */}
        <div>
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2 font-mono">
            Mesh Topology Layout
          </span>
          <div className="grid grid-cols-3 gap-1.5">
            {topologies.map(t => (
              <button
                key={t}
                onClick={() => onChangeTopology(t)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-mono capitalize transition-all border ${
                  topology === t
                    ? 'bg-cyan-500 text-slate-950 font-bold border-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.4)]'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Failure & Chaos Engine */}
        <div className="md:col-span-1">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2 font-mono">
            Chaos & Network Failure Injection
          </span>
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => onSetFailure('high_latency')}
              className={`px-2 py-1 rounded-lg text-[11px] font-mono transition-all border ${
                activeFailure === 'high_latency'
                  ? 'bg-amber-500 text-slate-950 font-bold border-amber-300 shadow-md'
                  : 'bg-slate-950 text-amber-400 border-amber-500/20 hover:bg-amber-500/10'
              }`}
            >
              Ping Spike
            </button>

            <button
              onClick={() => onSetFailure('packet_loss_spike')}
              className={`px-2 py-1 rounded-lg text-[11px] font-mono transition-all border ${
                activeFailure === 'packet_loss_spike'
                  ? 'bg-rose-500 text-slate-950 font-bold border-rose-300 shadow-md'
                  : 'bg-slate-950 text-rose-400 border-rose-500/20 hover:bg-rose-500/10'
              }`}
            >
              Loss Spike
            </button>

            <button
              onClick={() => onSetFailure('jitter')}
              className={`px-2 py-1 rounded-lg text-[11px] font-mono transition-all border ${
                activeFailure === 'jitter'
                  ? 'bg-yellow-500 text-slate-950 font-bold border-yellow-300 shadow-md'
                  : 'bg-slate-950 text-yellow-400 border-yellow-500/20 hover:bg-yellow-500/10'
              }`}
            >
              Jitter
            </button>

            <button
              onClick={() => onSetFailure('node_failure')}
              className={`px-2 py-1 rounded-lg text-[11px] font-mono transition-all border ${
                activeFailure === 'node_failure'
                  ? 'bg-red-600 text-white font-bold border-red-400 shadow-md'
                  : 'bg-slate-950 text-red-400 border-red-500/20 hover:bg-red-500/10'
              }`}
            >
              Node Failure
            </button>

            <button
              onClick={() => onSetFailure('peer_disconnect')}
              className={`px-2 py-1 rounded-lg text-[11px] font-mono transition-all border ${
                activeFailure === 'peer_disconnect'
                  ? 'bg-orange-600 text-white font-bold border-orange-400 shadow-md'
                  : 'bg-slate-950 text-orange-400 border-orange-500/20 hover:bg-orange-500/10'
              }`}
            >
              Sever Links
            </button>

            <button
              onClick={() => onSetFailure('network_partition')}
              className={`px-2 py-1 rounded-lg text-[11px] font-mono transition-all border ${
                activeFailure === 'network_partition'
                  ? 'bg-red-500 text-slate-950 font-bold border-red-300 shadow-md'
                  : 'bg-slate-950 text-red-400 border-red-500/20 hover:bg-red-500/10'
              }`}
            >
              Partition
            </button>

            <button
              onClick={() => onSetFailure('duplicate_packets')}
              className={`px-2 py-1 rounded-lg text-[11px] font-mono transition-all border ${
                activeFailure === 'duplicate_packets'
                  ? 'bg-purple-500 text-slate-950 font-bold border-purple-300 shadow-md'
                  : 'bg-slate-950 text-purple-400 border-purple-500/20 hover:bg-purple-500/10'
              }`}
            >
              Dup Packets
            </button>

            <button
              onClick={() => onSetFailure('corrupted_packets')}
              className={`px-2 py-1 rounded-lg text-[11px] font-mono transition-all border ${
                activeFailure === 'corrupted_packets'
                  ? 'bg-emerald-600 text-white font-bold border-emerald-400 shadow-md'
                  : 'bg-slate-950 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/10'
              }`}
            >
              Poison Attack
            </button>

            <button
              onClick={() => onSetFailure('tracker_down')}
              className={`px-2 py-1 rounded-lg text-[11px] font-mono transition-all border ${
                activeFailure === 'tracker_down'
                  ? 'bg-fuchsia-600 text-white font-bold border-fuchsia-400 shadow-md'
                  : 'bg-slate-950 text-fuchsia-400 border-fuchsia-500/20 hover:bg-fuchsia-500/10'
              }`}
            >
              Kill Tracker
            </button>

            <button
              onClick={onRecoverNetwork}
              className="px-3 py-1 bg-emerald-500 text-slate-950 hover:bg-emerald-400 rounded-lg text-xs font-bold font-mono flex items-center space-x-1 shadow-[0_0_10px_rgba(52,211,153,0.4)]"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>RECOVER</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
