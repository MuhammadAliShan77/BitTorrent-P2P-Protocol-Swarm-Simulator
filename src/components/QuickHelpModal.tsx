import React from 'react';
import { X, BookOpen, ShieldCheck, Cpu, Database, Network, ArrowRight } from 'lucide-react';

interface QuickHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenFullGuide?: () => void;
}

export const QuickHelpModal: React.FC<QuickHelpModalProps> = ({ isOpen, onClose, onOpenFullGuide }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl max-h-[85vh] overflow-y-auto animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-cyan-500/10 border border-cyan-500/30 rounded-xl">
              <BookOpen className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wide font-mono">
                BITTORRENT PROTOCOL CONCEPTS & ARCHITECTURE
              </h2>
              <p className="text-xs text-slate-400">Educational guide for networking courses & professors</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Modules */}
        <div className="space-y-4 text-xs font-mono text-slate-300">
          
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <h3 className="text-sm font-bold text-cyan-400 mb-1 flex items-center space-x-2">
              <Cpu className="w-4 h-4" />
              <span>1. Tit-for-Tat Choking & Unchoking Algorithm</span>
            </h3>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              To prevent free-riding (leechers downloading without uploading), BitTorrent peers rank connected neighbors by the upload speed received from them. Every 10 seconds, a peer unchokes the top 4 uploaders and chokes the rest.
            </p>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <h3 className="text-sm font-bold text-emerald-400 mb-1 flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4" />
              <span>2. Optimistic Unchoking Slot</span>
            </h3>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Every 30 seconds, a peer randomly unchokes 1 peer regardless of its current upload rate. This allows discovering newly joined peers who might have high-speed bandwidth potential.
            </p>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <h3 className="text-sm font-bold text-purple-400 mb-1 flex items-center space-x-2">
              <Network className="w-4 h-4" />
              <span>3. Rarest-First Piece Selection</span>
            </h3>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Peers request pieces that are rarest across the entire swarm first. This prevents rare pieces from vanishing if the only seeders leave the network, ensuring maximum payload survival.
            </p>
          </div>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
            <h3 className="text-sm font-bold text-teal-400 mb-1 flex items-center space-x-2">
              <Database className="w-4 h-4" />
              <span>4. Mainline DHT (Distributed Hash Table)</span>
            </h3>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Trackerless torrents use a Kademlia-based DHT where each peer acts as a mini-tracker. Peer infohashes and node IDs are organized in metric distance space using XOR arithmetic <code className="text-teal-300">d(x,y) = x ⊕ y</code>.
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between">
          {onOpenFullGuide && (
            <button
              onClick={() => {
                onClose();
                onOpenFullGuide();
              }}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-400 font-bold rounded-xl text-xs font-mono transition-colors border border-slate-700 flex items-center space-x-1"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Open Full Beginner Guide</span>
            </button>
          )}

          <button
            onClick={onClose}
            className="px-6 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs font-mono transition-colors shadow-lg shadow-cyan-500/20"
          >
            Got it, return to simulation
          </button>
        </div>

      </div>
    </div>
  );
};
