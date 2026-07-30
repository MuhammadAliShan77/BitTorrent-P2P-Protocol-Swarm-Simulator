import React, { useState } from 'react';
import { Globe, MapPin, Radio, Zap, ShieldCheck } from 'lucide-react';
import { PeerNode, DataPacket } from '../types/p2p';
import { formatBytes } from '../utils/p2pSimulationEngine';
import { getCountryDetails } from '../utils/p2pFlags';

interface WorldMapGlobeViewProps {
  peers: PeerNode[];
  packets: DataPacket[];
  onSelectPeer: (peer: PeerNode) => void;
}

export const WorldMapGlobeView: React.FC<WorldMapGlobeViewProps> = ({
  peers,
  packets,
  onSelectPeer
}) => {
  const [hoveredPeer, setHoveredPeer] = useState<PeerNode | null>(null);

  // Group peers by country code to calculate offsets so they never overlap
  const countryCounts: Record<string, number> = {};

  // Base Equirectangular projection mapping from lat/lng to 900x500 SVG coordinates
  const getPeerMapCoords = (peer: PeerNode) => {
    const code = peer.countryCode || 'US';
    const cIdx = countryCounts[code] || 0;
    countryCounts[code] = cIdx + 1;

    // Angle spread offset for peers in the same country
    const offsetX = cIdx === 0 ? 0 : (cIdx % 2 === 1 ? 1 : -1) * Math.ceil(cIdx / 2) * 22;
    const offsetY = cIdx === 0 ? 0 : (cIdx % 3 === 1 ? -16 : 16);

    const baseMaxX = 860;
    const baseMaxY = 440;

    let x = ((peer.lng + 180) / 360) * baseMaxX + 20 + offsetX;
    let y = ((90 - peer.lat) / 180) * baseMaxY + 30 + offsetY;

    // Boundary containment
    x = Math.max(50, Math.min(850, x));
    y = Math.max(50, Math.min(450, y));

    return { x, y };
  };

  // Precompute clean map coordinates for all peers
  const peerCoordsMap = new Map<string, { x: number; y: number }>();
  peers.forEach((peer) => {
    peerCoordsMap.set(peer.id, getPeerMapCoords(peer));
  });

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl relative overflow-hidden">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-cyan-500/10 border border-cyan-500/30 rounded-xl">
            <Globe className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-100 font-mono tracking-wide flex items-center space-x-2">
              <span>GEOGRAPHIC P2P SWARM MAP (IP GEOLOCATION)</span>
              <span className="text-[10px] bg-cyan-950 text-cyan-300 px-2 py-0.5 rounded-full border border-cyan-800">
                {peers.length} Global Nodes
              </span>
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              Real-time Transcontinental Peer Latency & BitTorrent Data Piece Transfer Arcs
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 text-xs font-mono">
          <span className="flex items-center space-x-1 text-slate-300">
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>Active Swarm Mesh</span>
          </span>
        </div>
      </div>

      {/* World Map SVG Canvas */}
      <div className="relative w-full h-[480px] bg-slate-950 rounded-xl border border-slate-800 overflow-hidden">
        
        <svg viewBox="0 0 900 500" className="w-full h-full select-none">
          <defs>
            <linearGradient id="world-arc-grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#22c55e" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#a855f7" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.8" />
            </linearGradient>
          </defs>

          {/* Grid Latitude/Longitude Lines */}
          {Array.from({ length: 9 }).map((_, i) => (
            <line
              key={`lat-${i}`}
              x1="0"
              y1={i * 55 + 30}
              x2="900"
              y2={i * 55 + 30}
              stroke="rgba(255, 255, 255, 0.04)"
              strokeWidth="1"
              strokeDasharray="4, 4"
            />
          ))}
          {Array.from({ length: 12 }).map((_, i) => (
            <line
              key={`lng-${i}`}
              x1={i * 75 + 37.5}
              y1="0"
              x2={i * 75 + 37.5}
              y2="500"
              stroke="rgba(255, 255, 255, 0.04)"
              strokeWidth="1"
              strokeDasharray="4, 4"
            />
          ))}

          {/* Stylized Vector World Continents Backdrop */}
          <g fill="rgba(30, 41, 59, 0.55)" stroke="rgba(51, 65, 85, 0.8)" strokeWidth="1">
            {/* North America */}
            <path d="M 120 100 L 260 80 L 290 140 L 240 220 L 180 240 L 140 180 Z" />
            {/* South America */}
            <path d="M 230 270 L 300 280 L 280 410 L 240 430 L 220 340 Z" />
            {/* Europe */}
            <path d="M 420 80 L 520 70 L 540 150 L 440 160 L 410 110 Z" />
            {/* Africa */}
            <path d="M 420 180 L 520 180 L 540 330 L 480 390 L 420 280 Z" />
            {/* Asia */}
            <path d="M 530 80 L 780 70 L 820 190 L 700 240 L 550 180 Z" />
            {/* Australia / Oceania */}
            <path d="M 720 320 L 820 310 L 830 400 L 730 410 Z" />
          </g>

          {/* Transcontinental Active Connection Lines & Transfer Arcs */}
          {packets.map(packet => {
            const p1 = peerCoordsMap.get(packet.sourceId);
            const p2 = peerCoordsMap.get(packet.targetId);

            if (!p1 || !p2) return null;

            // Arc curvature calculation
            const dx = p2.x - p1.x;
            const dy = p2.y - p1.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const midX = (p1.x + p2.x) / 2;
            const midY = (p1.y + p2.y) / 2 - Math.min(90, dist * 0.3);

            const pathD = `M ${p1.x} ${p1.y} Q ${midX} ${midY} ${p2.x} ${p2.y}`;

            return (
              <g key={`world-arc-${packet.id}`}>
                <path
                  d={pathD}
                  fill="none"
                  stroke="url(#world-arc-grad)"
                  strokeWidth="1.5"
                  strokeDasharray="4, 4"
                  className="animate-dash opacity-75"
                />
              </g>
            );
          })}

          {/* Peer Nodes on World Map */}
          {peers.map(peer => {
            const coords = peerCoordsMap.get(peer.id) || { x: 450, y: 250 };
            const isHovered = hoveredPeer?.id === peer.id;

            const nodeColor = peer.type === 'seeder' ? '#22c55e' : peer.type === 'tracker' ? '#a855f7' : peer.type === 'malicious' ? '#ef4444' : '#06b6d4';

            return (
              <g
                key={`map-node-${peer.id}`}
                transform={`translate(${coords.x}, ${coords.y})`}
                className="cursor-pointer group z-20"
                onClick={() => onSelectPeer(peer)}
                onMouseEnter={() => setHoveredPeer(peer)}
                onMouseLeave={() => setHoveredPeer(null)}
              >
                {/* Glowing Outer Ring */}
                <circle
                  r={isHovered ? "16" : "10"}
                  fill="none"
                  stroke={nodeColor}
                  strokeWidth="2"
                  className="animate-ping opacity-75"
                />

                {/* Node Center Marker */}
                <circle
                  r={isHovered ? "8" : "5.5"}
                  fill={nodeColor}
                  stroke="#ffffff"
                  strokeWidth="1.5"
                  style={{ filter: `drop-shadow(0 0 6px ${nodeColor})` }}
                />

                {/* Country Flag & Label Box */}
                <foreignObject x="-40" y="10" width="80" height="24">
                  <div className="text-[10px] font-bold font-mono text-center text-slate-200 bg-slate-950/90 border border-slate-800 rounded px-1 py-0.5 shadow-lg truncate group-hover:border-cyan-500 group-hover:text-white">
                    {peer.flag} {peer.name.split(' ')[0]}
                  </div>
                </foreignObject>
              </g>
            );
          })}
        </svg>

        {/* Interactive Hover Card Tooltip */}
        {hoveredPeer && (() => {
          const country = getCountryDetails(hoveredPeer.countryCode, hoveredPeer.country);
          const piecesOwned = hoveredPeer.pieces.filter(Boolean).length;
          return (
            <div className="absolute top-3 right-3 z-30 bg-slate-950/95 border border-cyan-500/40 rounded-xl p-3 shadow-2xl w-60 font-mono text-xs text-slate-200 backdrop-blur-md space-y-2 pointer-events-none">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center space-x-2">
                  <span className="text-xl">{country.flag}</span>
                  <div>
                    <span className="font-bold text-slate-100 block">{hoveredPeer.name}</span>
                    <span className="text-[10px] text-slate-400">{country.name} • {hoveredPeer.ip}</span>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                  hoveredPeer.type === 'seeder' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' :
                  hoveredPeer.type === 'leecher' ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' :
                  'bg-purple-500/20 text-purple-300 border-purple-500/30'
                }`}>
                  {hoveredPeer.type}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[10px]">
                <div className="bg-slate-900 p-1.5 rounded border border-slate-800">
                  <span className="text-slate-400 block">DL Speed</span>
                  <strong className="text-emerald-400 font-bold">{(hoveredPeer.downloadRate / 1024).toFixed(1)} MB/s</strong>
                </div>
                <div className="bg-slate-900 p-1.5 rounded border border-slate-800">
                  <span className="text-slate-400 block">UL Speed</span>
                  <strong className="text-amber-400 font-bold">{(hoveredPeer.uploadRate / 1024).toFixed(1)} MB/s</strong>
                </div>
                <div className="bg-slate-900 p-1.5 rounded border border-slate-800">
                  <span className="text-slate-400 block">Latency</span>
                  <strong className="text-cyan-400 font-bold">{hoveredPeer.latency} ms</strong>
                </div>
                <div className="bg-slate-900 p-1.5 rounded border border-slate-800">
                  <span className="text-slate-400 block">Connected</span>
                  <strong className="text-slate-200 font-bold">{hoveredPeer.connectedPeers.length} peers</strong>
                </div>
              </div>

              <div className="pt-1.5 border-t border-slate-800 text-[10px] space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-400">Pieces Owned:</span>
                  <span className="text-emerald-400 font-bold">{piecesOwned} / 100 ({hoveredPeer.progress}%)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Client Engine:</span>
                  <span className="text-slate-300 font-semibold">{hoveredPeer.clientVersion}</span>
                </div>
              </div>
            </div>
          );
        })()}

      </div>

    </div>
  );
};
