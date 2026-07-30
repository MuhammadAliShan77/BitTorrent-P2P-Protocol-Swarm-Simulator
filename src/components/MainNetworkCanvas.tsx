import React, { useRef, useState } from 'react';
import { 
  Radio, 
  Server, 
  Database, 
  Download, 
  Upload, 
  ShieldAlert, 
  Wifi, 
  CheckCircle2, 
  Lock,
  Zap,
  Globe,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { PeerNode, DataPacket, SimulationConfig, PacketType } from '../types/p2p';

interface MainNetworkCanvasProps {
  peers: PeerNode[];
  packets: DataPacket[];
  selectedPeerId: string | null;
  onSelectPeer: (peer: PeerNode) => void;
  onSelectPacket: (packet: DataPacket) => void;
  config: SimulationConfig;
  topology: string;
}

export const MainNetworkCanvas: React.FC<MainNetworkCanvasProps> = ({
  peers,
  packets,
  selectedPeerId,
  onSelectPeer,
  onSelectPacket,
  config,
  topology
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [hoveredPeerId, setHoveredPeerId] = useState<string | null>(null);
  const [hoveredPacketId, setHoveredPacketId] = useState<string | null>(null);

  const canvasWidth = 960;
  const canvasHeight = 560;

  // Helper to compute quadratic Bezier curve path string & point at progress t
  const getCurvePath = (p1: { x: number; y: number }, p2: { x: number; y: number }) => {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    // Curvature factor
    const cx = (p1.x + p2.x) / 2 - dy * 0.15;
    const cy = (p1.y + p2.y) / 2 + dx * 0.15;
    return {
      pathD: `M ${p1.x} ${p1.y} Q ${cx} ${cy} ${p2.x} ${p2.y}`,
      cx,
      cy
    };
  };

  const getPointOnCurve = (
    p1: { x: number; y: number }, 
    p2: { x: number; y: number }, 
    cx: number, 
    cy: number, 
    t: number
  ) => {
    // Quadratic Bezier B(t) = (1-t)^2 P0 + 2(1-t)t P1 + t^2 P2
    const oneMinusT = 1 - t;
    const x = oneMinusT * oneMinusT * p1.x + 2 * oneMinusT * t * cx + t * t * p2.x;
    const y = oneMinusT * oneMinusT * p1.y + 2 * oneMinusT * t * cy + t * t * p2.y;
    return { x, y };
  };

  // Node Color map
  const getNodeStyles = (peer: PeerNode) => {
    switch (peer.type) {
      case 'tracker':
        return {
          stroke: '#a855f7',
          fill: '#581c87',
          glow: 'rgba(168, 85, 247, 0.6)',
          textColor: 'text-purple-300',
          badgeBg: 'bg-purple-900/60 border-purple-500/40 text-purple-300'
        };
      case 'bootstrap':
        return {
          stroke: '#14b8a6',
          fill: '#115e59',
          glow: 'rgba(20, 184, 166, 0.6)',
          textColor: 'text-teal-300',
          badgeBg: 'bg-teal-900/60 border-teal-500/40 text-teal-300'
        };
      case 'seeder':
        return {
          stroke: '#22c55e',
          fill: '#14532d',
          glow: 'rgba(34, 197, 94, 0.6)',
          textColor: 'text-emerald-300',
          badgeBg: 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300'
        };
      case 'leecher':
        return {
          stroke: '#06b6d4',
          fill: '#164e63',
          glow: 'rgba(6, 182, 212, 0.6)',
          textColor: 'text-cyan-300',
          badgeBg: 'bg-cyan-950/80 border-cyan-500/40 text-cyan-300'
        };
      case 'slow':
        return {
          stroke: '#f97316',
          fill: '#7c2d12',
          glow: 'rgba(249, 115, 22, 0.6)',
          textColor: 'text-orange-300',
          badgeBg: 'bg-orange-950/80 border-orange-500/40 text-orange-300'
        };
      case 'malicious':
        return {
          stroke: '#ef4444',
          fill: '#7f1d1d',
          glow: 'rgba(239, 68, 68, 0.8)',
          textColor: 'text-rose-300',
          badgeBg: 'bg-rose-950/80 border-rose-500/40 text-rose-300'
        };
      default:
        return {
          stroke: '#64748b',
          fill: '#1e293b',
          glow: 'rgba(100, 116, 139, 0.3)',
          textColor: 'text-slate-400',
          badgeBg: 'bg-slate-900/80 border-slate-700 text-slate-400'
        };
    }
  };

  const getPacketColor = (packet: DataPacket) => {
    if (packet.status === 'dropped') {
      return 'bg-rose-600 text-white border-rose-400 shadow-[0_0_12px_rgba(244,63,94,0.9)] animate-pulse';
    }
    if (packet.isCorrupted) {
      return 'bg-red-700 text-white border-red-400 shadow-[0_0_12px_rgba(239,68,68,0.9)] animate-ping';
    }
    if (packet.isDuplicate) {
      return 'bg-amber-500 text-slate-950 border-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.8)]';
    }
    if (packet.isRetry) {
      return 'bg-cyan-500 text-slate-950 border-cyan-300 font-bold shadow-[0_0_14px_rgba(6,182,212,0.9)] ring-2 ring-cyan-400/50';
    }
    if (packet.isDhtFallback) {
      return 'bg-fuchsia-600 text-white border-fuchsia-300 shadow-[0_0_12px_rgba(192,38,211,0.9)] font-bold';
    }

    switch (packet.type) {
      case 'piece':
        return 'bg-emerald-500 text-slate-950 border-emerald-300 shadow-[0_0_10px_rgba(52,211,153,0.8)]';
      case 'request':
        return 'bg-cyan-500 text-slate-950 border-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.8)]';
      case 'tracker_announce':
        return 'bg-purple-500 text-slate-950 border-purple-300 shadow-[0_0_10px_rgba(168,85,247,0.8)]';
      case 'dht_find_node':
        return 'bg-fuchsia-500 text-white border-fuchsia-300 shadow-[0_0_10px_rgba(217,70,239,0.8)]';
      case 'choke':
        return 'bg-rose-500 text-slate-950 border-rose-300 shadow-[0_0_10px_rgba(244,63,94,0.8)]';
      case 'unchoke':
        return 'bg-amber-400 text-slate-950 border-amber-200 shadow-[0_0_10px_rgba(251,191,36,0.8)]';
      default:
        return 'bg-blue-500 text-slate-950 border-blue-300 shadow-[0_0_10px_rgba(59,130,246,0.8)]';
    }
  };

  return (
    <div className="relative w-full min-h-[480px] lg:h-[580px] bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl bg-grid-pattern flex flex-col justify-between">
      
      {/* Top Overlay Bar */}
      <div className="absolute top-3 left-4 right-4 z-20 flex flex-wrap items-center justify-between gap-3 pointer-events-none pr-44 sm:pr-56">
        <div className="flex items-center space-x-2 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 text-xs pointer-events-auto shadow-md">
          <Globe className="w-3.5 h-3.5 text-cyan-400" />
          <span className="font-semibold text-slate-200 uppercase tracking-wider font-mono">Topology:</span>
          <span className="text-cyan-400 font-bold capitalize font-mono">{topology}</span>
        </div>

        {/* Legend - Positioned cleanly to left of MiniMap area */}
        <div className="hidden sm:flex items-center space-x-2.5 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 text-[10px] sm:text-[11px] pointer-events-auto font-mono shadow-md">
          <span className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
            <span className="text-purple-300">Tracker</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-emerald-300">Seeder</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-500" />
            <span className="text-cyan-300">Leecher</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
            <span className="text-orange-300">Slow</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span className="text-rose-300">Blocked</span>
          </span>
        </div>
      </div>

      {/* Main Interactive SVG Workspace */}
      <svg
        ref={svgRef}
        viewBox={`0 0 ${canvasWidth} ${canvasHeight}`}
        className="w-full h-full select-none"
      >
        <defs>
          {/* Custom Glow Filters */}
          <filter id="glow-emerald" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <filter id="glow-cyan" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <filter id="glow-purple" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          {/* Linear Gradients for Edge Flow */}
          <linearGradient id="edge-gradient-seeder" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#22c55e" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.4" />
          </linearGradient>
          <linearGradient id="edge-gradient-leecher" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.3" />
          </linearGradient>
        </defs>

        {/* 1. Draw Network Connections (Edges) */}
        {peers.map(peer => {
          return peer.connectedPeers.map(targetId => {
            const targetPeer = peers.find(p => p.id === targetId);
            if (!targetPeer) return null;

            // Prevent duplicate line drawing
            if (peer.id > targetPeer.id) return null;

            const { pathD } = getCurvePath(peer, targetPeer);

            const isHighlighted = 
              hoveredPeerId === peer.id || 
              hoveredPeerId === targetPeer.id || 
              selectedPeerId === peer.id || 
              selectedPeerId === targetPeer.id;

            const isSeederEdge = peer.type === 'seeder' || targetPeer.type === 'seeder';
            const isTrackerEdge = peer.type === 'tracker' || targetPeer.type === 'tracker';

            let strokeColor = isSeederEdge ? 'url(#edge-gradient-seeder)' : 'url(#edge-gradient-leecher)';
            if (isTrackerEdge) strokeColor = 'rgba(168, 85, 247, 0.4)';

            return (
              <g key={`edge-${peer.id}-${targetPeer.id}`}>
                {/* Outer Glow Path when highlighted */}
                {isHighlighted && (
                  <path
                    d={pathD}
                    fill="none"
                    stroke="#06b6d4"
                    strokeWidth="4"
                    strokeOpacity="0.4"
                    className="animate-pulse"
                  />
                )}
                {/* Core Edge Line */}
                <path
                  d={pathD}
                  fill="none"
                  stroke={strokeColor}
                  strokeWidth={isHighlighted ? '2.5' : '1.5'}
                  strokeDasharray="6, 4"
                  className={config.isRunning ? 'animate-dash' : ''}
                />
              </g>
            );
          });
        })}

        {/* 2. Draw Moving Data Packets */}
        {packets.map(packet => {
          const sourcePeer = peers.find(p => p.id === packet.sourceId);
          const targetPeer = peers.find(p => p.id === packet.targetId);

          if (!sourcePeer || !targetPeer) return null;

          const { cx, cy } = getCurvePath(sourcePeer, targetPeer);
          const point = getPointOnCurve(sourcePeer, targetPeer, cx, cy, packet.progress);

          const isHovered = hoveredPacketId === packet.id;

          return (
            <g
              key={packet.id}
              transform={`translate(${point.x}, ${point.y})`}
              className="cursor-pointer z-30"
              onClick={(e) => {
                e.stopPropagation();
                onSelectPacket(packet);
              }}
              onMouseEnter={() => setHoveredPacketId(packet.id)}
              onMouseLeave={() => setHoveredPacketId(null)}
            >
              {/* Pulse aura */}
              <circle r={isHovered ? "16" : "12"} fill="none" stroke="#22c55e" strokeWidth={isHovered ? "3" : "2"} className="animate-ping opacity-75" />
              
              {/* Packet Badge */}
              <foreignObject x="-36" y="-12" width="72" height="24">
                <div className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono text-center truncate border transition-all ${isHovered ? 'ring-2 ring-white scale-105' : ''} ${getPacketColor(packet)}`}>
                  {packet.label}
                </div>
              </foreignObject>
            </g>
          );
        })}

        {/* 3. Draw Peer Nodes */}
        {peers.map(peer => {
          const isSelected = selectedPeerId === peer.id;
          const isHovered = hoveredPeerId === peer.id;
          const style = getNodeStyles(peer);

          // Progress donut calculations
          const radius = 24;
          const circumference = 2 * Math.PI * radius;
          const strokeDashoffset = circumference - (peer.progress / 100) * circumference;

          return (
            <g
              key={peer.id}
              transform={`translate(${peer.x}, ${peer.y})`}
              className="cursor-pointer z-20"
              onClick={(e) => {
                e.stopPropagation();
                onSelectPeer(peer);
              }}
              onMouseEnter={() => setHoveredPeerId(peer.id)}
              onMouseLeave={() => setHoveredPeerId(null)}
            >
              {/* Selection / Hover Outer Ring */}
              {(isSelected || isHovered) && (
                <circle
                  r={radius + 10}
                  fill="none"
                  stroke={style.stroke}
                  strokeWidth={isHovered ? "3" : "2"}
                  strokeDasharray="4, 4"
                  className="animate-spin"
                  style={{ animationDuration: '8s' }}
                />
              )}

              {/* Background Outer Glow */}
              <circle
                r={isHovered ? radius + 4 : radius + 2}
                fill={style.fill}
                stroke={style.stroke}
                strokeWidth={isHovered ? "3" : "2"}
                style={{ filter: `drop-shadow(0 0 ${isHovered ? '20px' : '12px'} ${style.glow})` }}
              />

              {/* Leecher Progress Donut Bar */}
              {peer.type === 'leecher' && (
                <circle
                  r={radius}
                  fill="none"
                  stroke="#22c55e"
                  strokeWidth="3"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  transform="rotate(-90)"
                />
              )}

              {/* Node Icon */}
              <g transform="translate(-10, -10)">
                <foreignObject width="20" height="20">
                  <div className="w-full h-full flex items-center justify-center text-slate-100">
                    {peer.type === 'tracker' && <Server className="w-4 h-4 text-purple-300" />}
                    {peer.type === 'bootstrap' && <Database className="w-4 h-4 text-teal-300" />}
                    {peer.type === 'seeder' && <CheckCircle2 className="w-4 h-4 text-emerald-300" />}
                    {peer.type === 'leecher' && <Download className="w-4 h-4 text-cyan-300" />}
                    {peer.type === 'slow' && <Wifi className="w-4 h-4 text-orange-400" />}
                    {peer.type === 'malicious' && <ShieldAlert className="w-4 h-4 text-rose-400" />}
                  </div>
                </foreignObject>
              </g>

              {/* Progress / Status Tag Below Node */}
              <foreignObject x="-60" y="30" width="120" height="36">
                <div className="flex flex-col items-center">
                  <span className={`text-[11px] font-bold font-mono tracking-tight text-center px-2 py-0.5 rounded-lg border backdrop-blur-md shadow-md ${style.badgeBg}`}>
                    {peer.flag} {peer.name}
                  </span>
                  
                  {/* Speed / Percentage Badge */}
                  <div className="flex items-center space-x-1 mt-0.5 text-[9px] font-mono text-slate-300">
                    {peer.type === 'seeder' && (
                      <span className="text-emerald-400 font-bold">100% (SEEDING)</span>
                    )}
                    {peer.type === 'leecher' && (
                      <span className="text-cyan-400 font-bold">{peer.progress}% [{(peer.downloadRate / 1024).toFixed(1)} MB/s]</span>
                    )}
                    {peer.type === 'tracker' && (
                      <span className="text-purple-300">{peer.connectedPeers.length} Peers Registered</span>
                    )}
                  </div>
                </div>
              </foreignObject>
            </g>
          );
        })}
      </svg>
    </div>
  );
};
