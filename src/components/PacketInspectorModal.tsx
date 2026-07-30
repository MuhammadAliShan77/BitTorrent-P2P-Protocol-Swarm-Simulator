import React from 'react';
import { X, Zap, Cpu, ArrowRight, ShieldCheck, Clock } from 'lucide-react';
import { DataPacket } from '../types/p2p';
import { formatBytes } from '../utils/p2pSimulationEngine';

interface PacketInspectorModalProps {
  packet: DataPacket | null;
  onClose: () => void;
}

export const PacketInspectorModal: React.FC<PacketInspectorModalProps> = ({ packet, onClose }) => {
  if (!packet) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl max-h-[85vh] overflow-y-auto animate-in zoom-in-95 duration-200 font-mono">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
          <div className="flex items-center space-x-2">
            <Zap className="w-5 h-5 text-cyan-400" />
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wide">
              PACKET FRAME INSPECTOR
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-3 text-xs">
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
            <span className="text-slate-400">Packet Type:</span>
            <span className="px-2.5 py-1 rounded-lg bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30 uppercase">
              {packet.type}
            </span>
          </div>

          {packet.pieceIndex !== undefined && (
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
              <span className="text-slate-400">Torrent Piece #:</span>
              <span className="text-emerald-400 font-extrabold text-sm">
                Piece #{packet.pieceIndex + 1} (1024 KB Payload)
              </span>
            </div>
          )}

          {/* Route Source -> Target */}
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <span className="text-[10px] uppercase text-slate-400 block mb-2 font-semibold">
              Packet Trajectory Vector
            </span>
            <div className="flex items-center justify-between bg-slate-900 p-2 rounded-lg border border-slate-800">
              <span className="text-cyan-300 font-bold">{packet.sourceId}</span>
              <ArrowRight className="w-4 h-4 text-slate-500 animate-pulse" />
              <span className="text-emerald-300 font-bold">{packet.targetId}</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between text-slate-400">
              <span>Delivery Progress:</span>
              <span className="text-slate-200 font-bold">{Math.round(packet.progress * 100)}%</span>
            </div>
            <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
              <div 
                className="bg-cyan-400 h-full rounded-full transition-all duration-150 shadow-[0_0_8px_rgba(6,182,212,0.8)]"
                style={{ width: `${Math.round(packet.progress * 100)}%` }}
              />
            </div>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1 text-slate-400 text-[11px]">
            <div className="flex justify-between">
              <span>Payload Size:</span>
              <span className="text-slate-200 font-semibold">{formatBytes(packet.sizeBytes)}</span>
            </div>
            <div className="flex justify-between">
              <span>Protocol Status:</span>
              <span className="text-emerald-400 font-semibold">IN_FLIGHT (SHA-1 Verified)</span>
            </div>
            <div className="flex justify-between">
              <span>Frame Timestamp:</span>
              <span className="text-slate-300">{new Date(packet.timestamp).toTimeString().split(' ')[0]}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-slate-800 text-center">
          <button
            onClick={onClose}
            className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-colors"
          >
            Close Inspector
          </button>
        </div>

      </div>
    </div>
  );
};
