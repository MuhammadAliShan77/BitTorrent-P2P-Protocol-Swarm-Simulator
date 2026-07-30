import React from 'react';
import { 
  X, 
  Server, 
  Download, 
  Upload, 
  Wifi, 
  ShieldCheck, 
  Activity, 
  Layers, 
  Globe, 
  Cpu, 
  CheckCircle2, 
  AlertOctagon,
  RefreshCw
} from 'lucide-react';
import { PeerNode } from '../types/p2p';
import { TOTAL_PIECES } from '../utils/p2pDefaults';
import { formatBytes } from '../utils/p2pSimulationEngine';
import { getCountryDetails } from '../utils/p2pFlags';
import { ProtocolBadgeList } from './ProtocolBadgeList';

interface PeerInspectorDrawerProps {
  peer: PeerNode | null;
  onClose: () => void;
  onDisconnectPeer: (peerId: string) => void;
  onToggleChokePeer: (peerId: string) => void;
}

export const PeerInspectorDrawer: React.FC<PeerInspectorDrawerProps> = ({
  peer,
  onClose,
  onDisconnectPeer,
  onToggleChokePeer
}) => {
  if (!peer) return null;

  const piecesOwned = peer.pieces.filter(Boolean).length;
  const country = getCountryDetails(peer.countryCode, peer.country);

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-96 bg-slate-900/95 backdrop-blur-2xl border-l border-slate-800 shadow-2xl z-50 p-5 flex flex-col space-y-5 overflow-y-auto animate-in slide-in-from-right duration-300">
      
      {/* Drawer Header */}
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
          <div className="flex items-center space-x-3">
            <span className="text-3xl" title={country.name}>{country.flag}</span>
            <div>
              <h3 className="text-sm font-bold text-slate-100 font-mono tracking-wide">
                {peer.name}
              </h3>
              <p className="text-xs text-slate-400 font-mono">{peer.ip}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Status Badges */}
        <div className="flex flex-wrap gap-2 mb-4 font-mono text-xs">
          <span className={`px-2.5 py-1 rounded-lg font-bold uppercase border ${
            peer.type === 'seeder' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' :
            peer.type === 'tracker' ? 'bg-purple-500/20 text-purple-300 border-purple-500/30' :
            peer.type === 'leecher' ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' :
            'bg-rose-500/20 text-rose-300 border-rose-500/30'
          }`}>
            {peer.type}
          </span>

          <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 font-semibold">
            NAT: {peer.natType}
          </span>

          <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 font-semibold text-emerald-400">
            Ping: {peer.latency} ms
          </span>
        </div>

        {/* Protocol Flags Section */}
        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 mb-4">
          <span className="text-[10px] uppercase font-mono text-slate-400 font-bold block mb-1.5">
            BitTorrent Protocol Badges
          </span>
          <ProtocolBadgeList peer={peer} maxFlags={12} />
        </div>

        {/* Real-time Bandwidth & Transfer Stats */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <span className="text-[10px] uppercase font-mono text-slate-400 flex items-center space-x-1 mb-1">
              <Download className="w-3 h-3 text-emerald-400" />
              <span>Download Speed</span>
            </span>
            <div className="text-lg font-black font-mono text-emerald-400">
              {(peer.downloadRate / 1024).toFixed(1)} <span className="text-xs text-emerald-500">MB/s</span>
            </div>
            <div className="text-[10px] text-slate-500 font-mono mt-1">
              Total DL: {formatBytes(peer.downloadedBytes)}
            </div>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <span className="text-[10px] uppercase font-mono text-slate-400 flex items-center space-x-1 mb-1">
              <Upload className="w-3 h-3 text-amber-400" />
              <span>Upload Speed</span>
            </span>
            <div className="text-lg font-black font-mono text-amber-400">
              {(peer.uploadRate / 1024).toFixed(1)} <span className="text-xs text-amber-500">MB/s</span>
            </div>
            <div className="text-[10px] text-slate-500 font-mono mt-1">
              Total UL: {formatBytes(peer.uploadedBytes)}
            </div>
          </div>
        </div>

        {/* Peer Bitfield Grid (10x10) */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs font-mono mb-2">
            <span className="font-semibold text-slate-300">Pieces Owned Bitfield:</span>
            <span className="text-cyan-400 font-bold">{piecesOwned} / {TOTAL_PIECES} ({peer.progress}%)</span>
          </div>

          <div className="grid grid-cols-10 gap-1 p-2 bg-slate-950 rounded-xl border border-slate-800">
            {peer.pieces.map((has, idx) => (
              <div
                key={idx}
                className={`aspect-square rounded-[2px] transition-all ${
                  has ? 'bg-emerald-400 shadow-[0_0_4px_rgba(52,211,153,0.8)]' : 'bg-slate-900 border border-slate-800'
                }`}
                title={`Piece #${idx + 1}: ${has ? 'Acquired' : 'Missing'}`}
              />
            ))}
          </div>
        </div>

        {/* Peer Technical Details List */}
        <div className="space-y-2 text-xs font-mono bg-slate-950 p-3 rounded-xl border border-slate-800 mb-4">
          <div className="flex items-center justify-between py-1 border-b border-slate-900">
            <span className="text-slate-400">Client Engine:</span>
            <span className="text-teal-300 font-bold">{peer.clientVersion}</span>
          </div>

          <div className="flex items-center justify-between py-1 border-b border-slate-900">
            <span className="text-slate-400">Geographic Location:</span>
            <span className="text-slate-200 font-semibold">{country.flag} {country.name} ({peer.countryCode})</span>
          </div>

          <div className="flex items-center justify-between py-1 border-b border-slate-900">
            <span className="text-slate-400">Packet Loss Rate:</span>
            <span className="text-slate-200 font-semibold">{peer.packetLoss}%</span>
          </div>

          <div className="flex items-center justify-between py-1 border-b border-slate-900">
            <span className="text-slate-400">Connected Mesh Neighbors:</span>
            <span className="text-cyan-400 font-bold">{peer.connectedPeers.length} peers</span>
          </div>

          <div className="flex items-center justify-between py-1">
            <span className="text-slate-400">BitTorrent Optimistic Unchoke:</span>
            <span className={peer.optimisticUnchoke ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
              {peer.optimisticUnchoke ? 'ACTIVE SLOT' : 'Standard'}
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-3 border-t border-slate-800 grid grid-cols-2 gap-2 font-mono text-xs">
        <button
          onClick={() => onToggleChokePeer(peer.id)}
          className="px-3 py-2 bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 rounded-xl font-bold border border-amber-500/30 transition-colors"
        >
          {peer.status === 'choked' ? 'Unchoke Peer' : 'Choke Peer'}
        </button>

        <button
          onClick={() => onDisconnectPeer(peer.id)}
          className="px-3 py-2 bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 rounded-xl font-bold border border-rose-500/30 transition-colors"
        >
          Disconnect Peer
        </button>
      </div>

    </div>
  );
};
