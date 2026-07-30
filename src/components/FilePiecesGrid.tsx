import React, { useState } from 'react';
import { TOTAL_PIECES } from '../utils/p2pDefaults';
import { PeerNode, PieceStrategy } from '../types/p2p';
import { Grid, Sparkles, Filter, CheckCircle2, Shield, Info } from 'lucide-react';

interface FilePiecesGridProps {
  peers: PeerNode[];
  strategy: PieceStrategy;
  onSetStrategy: (strategy: PieceStrategy) => void;
}

export const FilePiecesGrid: React.FC<FilePiecesGridProps> = ({
  peers,
  strategy,
  onSetStrategy
}) => {
  const [hoveredPieceIndex, setHoveredPieceIndex] = useState<number | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [showRarityMap, setShowRarityMap] = useState<boolean>(true);

  // Calculate piece rarity across all active peers
  const pieceCounts = Array(TOTAL_PIECES).fill(0);
  const seederPieceCounts = Array(TOTAL_PIECES).fill(0);

  let activePeerCount = 0;
  let activeSeederCount = 0;

  peers.forEach(p => {
    if (p.status !== 'disconnected' && p.status !== 'blocked') {
      activePeerCount++;
      if (p.type === 'seeder') activeSeederCount++;

      p.pieces.forEach((has, idx) => {
        if (has) {
          pieceCounts[idx]++;
          if (p.type === 'seeder') seederPieceCounts[idx]++;
        }
      });
    }
  });

  // Global piece completion status
  const pieceInSwarmCount = pieceCounts.filter(c => c > 0).length;

  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-2xl relative overflow-hidden">
      
      {/* Header & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
            <Grid className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-100 font-mono tracking-wide flex items-center space-x-2">
              <span>TORRENT FILE PAYLOAD BITFIELD</span>
              <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full border border-slate-700">
                100 MB (100x 1MB Pieces)
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Swarm Piece Propagation Matrix & Rarest-First Algorithm Heatmap
            </p>
          </div>
        </div>

        {/* Algorithm Strategy Selector */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-mono">
            <span className="text-slate-400 px-2 font-semibold">Strategy:</span>
            <button
              onClick={() => onSetStrategy('rarest_first')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                strategy === 'rarest_first'
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-[0_0_10px_rgba(52,211,153,0.4)]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Rarest-First
            </button>
            <button
              onClick={() => onSetStrategy('random')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                strategy === 'random'
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-[0_0_10px_rgba(6,182,212,0.4)]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Random
            </button>
            <button
              onClick={() => onSetStrategy('sequential')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                strategy === 'sequential'
                  ? 'bg-purple-500 text-slate-950 font-bold shadow-[0_0_10px_rgba(168,85,247,0.4)]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Sequential
            </button>
          </div>

          <button
            onClick={() => setShowRarityMap(!showRarityMap)}
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-semibold border transition-all ${
              showRarityMap
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-[0_0_10px_rgba(251,191,36,0.3)]'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
            }`}
          >
            {showRarityMap ? 'Heatmap: ON' : 'Heatmap: OFF'}
          </button>
        </div>
      </div>

      {/* Bitfield Matrix Grid (10x10) */}
      <div 
        onMouseMove={handleMouseMove}
        className="grid grid-cols-10 gap-1.5 p-2 bg-slate-950 rounded-xl border border-slate-800 max-w-2xl mx-auto relative"
      >
        {Array.from({ length: TOTAL_PIECES }).map((_, index) => {
          const count = pieceCounts[index];
          const rarityRatio = activePeerCount > 0 ? count / activePeerCount : 0;
          const isHovered = hoveredPieceIndex === index;

          // Exact 5-state color calculation requested
          let bgClass = '';
          if (count === 0) {
            // ⚫ Missing in Swarm (0%) - Dark/Black
            bgClass = 'bg-slate-950 border-slate-800 text-slate-700 shadow-inner';
          } else if (rarityRatio <= 0.2) {
            // 🟠 Rare (1-20%)
            bgClass = 'bg-orange-500 border-orange-400 text-slate-950 font-bold shadow-[0_0_8px_rgba(249,115,22,0.6)] animate-pulse';
          } else if (rarityRatio <= 0.4) {
            // 🟡 Limited (20-40%)
            bgClass = 'bg-yellow-400 border-yellow-300 text-slate-950 font-bold shadow-[0_0_8px_rgba(250,204,21,0.5)]';
          } else if (rarityRatio <= 0.8) {
            // 🔵 Available (40-80%)
            bgClass = 'bg-blue-500 border-blue-400 text-slate-950 font-bold shadow-[0_0_8px_rgba(59,130,246,0.5)]';
          } else {
            // 🟢 Abundant (>80%)
            bgClass = 'bg-emerald-500 border-emerald-400 text-slate-950 font-bold shadow-[0_0_8px_rgba(34,197,94,0.5)]';
          }

          return (
            <div
              key={index}
              onMouseEnter={() => setHoveredPieceIndex(index)}
              onMouseLeave={() => setHoveredPieceIndex(null)}
              className={`aspect-square rounded-md border flex items-center justify-center text-[10px] font-mono cursor-pointer transition-all duration-300 transform hover:scale-125 hover:z-20 ${bgClass} ${
                isHovered ? 'ring-2 ring-white z-30 scale-125' : ''
              }`}
            >
              {index + 1}
            </div>
          );
        })}
      </div>

      {/* Floating Tooltip beside hovered piece */}
      {hoveredPieceIndex !== null && (() => {
        const pIndex = hoveredPieceIndex;
        const ownedPeers = pieceCounts[pIndex] || 0;
        const missingFromPeers = Math.max(0, activePeerCount - ownedPeers);
        const availPct = activePeerCount > 0 ? Math.round((ownedPeers / activePeerCount) * 100) : 0;
        const rarityRatio = activePeerCount > 0 ? ownedPeers / activePeerCount : 0;

        let priorityText = 'Low';
        let rarityLabel = '🟢 Abundant';
        let rarityBadge = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';

        if (ownedPeers === 0) {
          rarityLabel = '⚫ Missing in Swarm';
          rarityBadge = 'bg-slate-800 text-slate-300 border-slate-700';
          priorityText = 'Critical';
        } else if (rarityRatio <= 0.2) {
          rarityLabel = '🟠 Rare (1–20%)';
          rarityBadge = 'bg-orange-500/20 text-orange-300 border-orange-500/40 animate-pulse';
          priorityText = 'Highest (Rarest First)';
        } else if (rarityRatio <= 0.4) {
          rarityLabel = '🟡 Limited (20–40%)';
          rarityBadge = 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40';
          priorityText = 'High';
        } else if (rarityRatio <= 0.8) {
          rarityLabel = '🔵 Available (40–80%)';
          rarityBadge = 'bg-blue-500/20 text-blue-300 border-blue-500/40';
          priorityText = 'Medium';
        }

        return (
          <div
            className="fixed z-50 pointer-events-none bg-slate-950/95 border border-cyan-500/40 text-slate-100 rounded-xl p-3 text-xs font-mono shadow-[0_10px_30px_rgba(0,0,0,0.9)] backdrop-blur-md w-64 space-y-2"
            style={{
              top: Math.max(10, Math.min(window.innerHeight - 200, mousePos.y - 130)),
              left: Math.max(10, Math.min(window.innerWidth - 270, mousePos.x + 15)),
            }}
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
              <span className="font-bold text-cyan-400 flex items-center space-x-1">
                <Grid className="w-3.5 h-3.5" />
                <span>Piece #{pIndex + 1}</span>
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${rarityBadge}`}>
                {rarityLabel}
              </span>
            </div>

            <div className="space-y-1.5 text-[11px] text-slate-300">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Availability:</span>
                <span className="font-bold text-white">{availPct}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Stored on:</span>
                <span className="font-bold text-emerald-400">{ownedPeers} peers</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Missing from:</span>
                <span className="font-bold text-slate-400">{missingFromPeers} peers</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Priority:</span>
                <span className="font-bold text-cyan-400">{priorityText}</span>
              </div>
              <div className="flex justify-between items-center pt-1 border-t border-slate-800/80">
                <span className="text-slate-400">Integrity:</span>
                <span className="font-bold text-emerald-400">Verified (SHA-1)</span>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Piece Legend & Statistics Footer */}
      <div className="mt-4 pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between text-xs font-mono text-slate-300 gap-2">
        <div className="flex items-center space-x-3 flex-wrap gap-y-1.5">
          <span className="flex items-center space-x-1">
            <span className="w-3 h-3 rounded bg-emerald-500 inline-block" />
            <span>🟢 Abundant (&gt;80%)</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-3 h-3 rounded bg-blue-500 inline-block" />
            <span>🔵 Available (40–80%)</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-3 h-3 rounded bg-yellow-400 inline-block" />
            <span>🟡 Limited (20–40%)</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-3 h-3 rounded bg-orange-500 inline-block animate-pulse" />
            <span>🟠 Rare (1–20%)</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-3 h-3 rounded bg-slate-950 border border-slate-800 inline-block" />
            <span>⚫ Missing (0%)</span>
          </span>
        </div>

        <div className="flex items-center space-x-2 text-slate-400 font-mono text-[11px]">
          <span className="bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 text-slate-300">
            Swarm Availability: <strong className="text-emerald-400">{pieceInSwarmCount} / {TOTAL_PIECES}</strong> pieces
          </span>
        </div>
      </div>

    </div>
  );
};
