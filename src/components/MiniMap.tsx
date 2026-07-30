import React, { useState, useRef, useEffect } from 'react';
import { 
  Minimize2, 
  Maximize2, 
  EyeOff, 
  SlidersHorizontal,
  Compass,
  X,
  ExternalLink,
  Info,
  Layers,
  ZoomIn,
  ZoomOut,
  RefreshCw,
  Search,
  Filter
} from 'lucide-react';
import { PeerNode, DataPacket } from '../types/p2p';
import { getCountryDetails } from '../utils/p2pFlags';
import { ProtocolBadgeList } from './ProtocolBadgeList';

interface MiniMapProps {
  peers: PeerNode[];
  packets?: DataPacket[];
  selectedPeerId?: string | null;
  onSelectPeer?: (peer: PeerNode) => void;
}

export const MiniMap: React.FC<MiniMapProps> = ({ 
  peers, 
  packets = [], 
  selectedPeerId, 
  onSelectPeer 
}) => {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [isHidden, setIsHidden] = useState<boolean>(false);
  const [isExpandedModal, setIsExpandedModal] = useState<boolean>(false);
  const [size, setSize] = useState<'S' | 'M' | 'L'>('S'); // Default small to avoid covering canvas
  const [opacity, setOpacity] = useState<number>(90);
  const [dockPosition, setDockPosition] = useState<'TR' | 'BR'>('TR');
  const [showControls, setShowControls] = useState<boolean>(false);
  const [nodeFilter, setNodeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Viewport rectangle state (simulated viewing window across 960x560 canvas)
  const [viewport, setViewport] = useState<{ x: number; y: number; w: number; h: number }>({
    x: 180,
    y: 80,
    w: 600,
    h: 400
  });

  const [isDraggingViewport, setIsDraggingViewport] = useState<boolean>(false);
  const miniSvgRef = useRef<SVGSVGElement | null>(null);
  const modalSvgRef = useRef<SVGSVGElement | null>(null);

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isExpandedModal) {
        setIsExpandedModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isExpandedModal]);

  // Compact Dimension mapping for docked view
  const sizeStyles = {
    S: { width: 'w-48', height: 'h-28', svgW: 192, svgH: 112 },
    M: { width: 'w-56', height: 'h-32', svgW: 224, svgH: 128 },
    L: { width: 'w-64', height: 'h-40', svgW: 256, svgH: 160 }
  }[size];

  // Helper to color nodes on the minimap
  const getMiniNodeColor = (peer: PeerNode) => {
    if (peer.status === 'blocked' || peer.type === 'malicious') return '#ef4444'; // Red
    if (peer.status === 'disconnected') return '#64748b'; // Gray
    switch (peer.type) {
      case 'tracker': return '#a855f7'; // Purple
      case 'bootstrap': return '#14b8a6'; // Teal
      case 'seeder': return '#22c55e'; // Green
      case 'leecher': return '#06b6d4'; // Cyan
      case 'slow': return '#f97316'; // Orange
      default: return '#3b82f6';
    }
  };

  // Helper to calculate packet position on curve for live packet rendering
  const getPacketPosition = (pkt: DataPacket) => {
    const source = peers.find(p => p.id === pkt.sourceId);
    const target = peers.find(p => p.id === pkt.targetId);
    if (!source || !target) return null;

    const t = Math.max(0, Math.min(1, pkt.progress || 0.5));
    const dx = target.x - source.x;
    const dy = target.y - source.y;
    const cx = (source.x + target.x) / 2 - dy * 0.15;
    const cy = (source.y + target.y) / 2 + dx * 0.15;

    const oneMinusT = 1 - t;
    const x = oneMinusT * oneMinusT * source.x + 2 * oneMinusT * t * cx + t * t * target.x;
    const y = oneMinusT * oneMinusT * source.y + 2 * oneMinusT * t * cy + t * t * target.y;

    return { x, y };
  };

  // Handle click on minimap SVG to move viewport or select peer
  const processMapClick = (
    e: React.MouseEvent<SVGSVGElement>, 
    targetRef: React.RefObject<SVGSVGElement | null>
  ) => {
    if (!targetRef.current) return;
    const rect = targetRef.current.getBoundingClientRect();
    const clickXRatio = (e.clientX - rect.left) / rect.width;
    const clickYRatio = (e.clientY - rect.top) / rect.height;

    const canvasX = clickXRatio * 960;
    const canvasY = clickYRatio * 560;

    // Check if clicked near a peer (within 35 units radius)
    const clickedPeer = peers.find(p => {
      const dist = Math.hypot(p.x - canvasX, p.y - canvasY);
      return dist < 35;
    });

    if (clickedPeer && onSelectPeer) {
      onSelectPeer(clickedPeer);
    }

    // Move viewport center to clicked point
    const newX = Math.max(0, Math.min(960 - viewport.w, canvasX - viewport.w / 2));
    const newY = Math.max(0, Math.min(560 - viewport.h, canvasY - viewport.h / 2));
    setViewport(prev => ({ ...prev, x: newX, y: newY }));
  };

  const handleMouseDownViewport = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDraggingViewport(true);
  };

  const handleMouseMoveMap = (
    e: React.MouseEvent<SVGSVGElement>, 
    targetRef: React.RefObject<SVGSVGElement | null>
  ) => {
    if (!isDraggingViewport || !targetRef.current) return;
    const rect = targetRef.current.getBoundingClientRect();
    const clickXRatio = (e.clientX - rect.left) / rect.width;
    const clickYRatio = (e.clientY - rect.top) / rect.height;

    const canvasX = clickXRatio * 960;
    const canvasY = clickYRatio * 560;

    const newX = Math.max(0, Math.min(960 - viewport.w, canvasX - viewport.w / 2));
    const newY = Math.max(0, Math.min(560 - viewport.h, canvasY - viewport.h / 2));
    setViewport({ ...viewport, x: newX, y: newY });
  };

  const handleMouseUpMap = () => {
    setIsDraggingViewport(false);
  };

  // Filtered peers for full modal view
  const filteredPeers = peers.filter(p => {
    if (nodeFilter !== 'all' && p.type !== nodeFilter && !(nodeFilter === 'blocked' && p.status === 'blocked')) {
      return false;
    }
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      return p.name.toLowerCase().includes(query) || p.ip.toLowerCase().includes(query) || p.id.toLowerCase().includes(query);
    }
    return true;
  });

  if (isHidden) {
    return (
      <button
        onClick={() => setIsHidden(false)}
        className={`absolute ${dockPosition === 'TR' ? 'top-3 right-3' : 'bottom-3 right-3'} z-30 px-3 py-1.5 bg-slate-900/90 hover:bg-slate-800 text-cyan-400 border border-slate-700 rounded-xl text-xs font-mono flex items-center space-x-1.5 shadow-xl transition-all duration-300`}
        title="Show Mini Overview"
      >
        <Compass className="w-3.5 h-3.5 text-cyan-400" />
        <span>SHOW MINIMAP</span>
      </button>
    );
  }

  return (
    <>
      {/* 1. DOCKED COMPACT MINIMAP (Never covers main canvas nodes) */}
      <div 
        className={`absolute ${dockPosition === 'TR' ? 'top-3 right-3' : 'bottom-3 right-3'} z-20 bg-slate-950/90 backdrop-blur-md border border-slate-800 rounded-xl p-2 shadow-2xl transition-all duration-300 pointer-events-auto select-none`}
        style={{ opacity: opacity / 100 }}
      >
        {/* Header Controls */}
        <div className="flex items-center justify-between text-[10px] font-mono text-slate-300 pb-1 border-b border-slate-800/80 mb-1">
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
            <span className="font-bold tracking-wider text-slate-200">MINI OVERVIEW</span>
          </div>

          <div className="flex items-center space-x-1 text-slate-400">
            {/* Settings Toggle */}
            <button
              onClick={() => setShowControls(!showControls)}
              className={`p-0.5 rounded hover:text-white transition-colors ${showControls ? 'text-cyan-400 bg-slate-800' : ''}`}
              title="Minimap Settings"
            >
              <SlidersHorizontal className="w-3 h-3" />
            </button>

            {/* Expand to Fullscreen Modal Button (Option 3 - Doesn't obscure canvas) */}
            <button
              onClick={() => setIsExpandedModal(true)}
              className="p-0.5 hover:text-cyan-300 transition-colors"
              title="Expand into Dedicated Fullscreen View"
            >
              <Maximize2 className="w-3 h-3" />
            </button>

            {/* Collapse Button */}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-0.5 hover:text-white transition-colors"
              title={isCollapsed ? 'Uncollapse' : 'Collapse'}
            >
              <Minimize2 className="w-3 h-3" />
            </button>

            {/* Hide Button */}
            <button
              onClick={() => setIsHidden(true)}
              className="p-0.5 hover:text-rose-400 transition-colors"
              title="Hide Minimap"
            >
              <EyeOff className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Control Drawer */}
        {showControls && (
          <div className="p-1.5 mb-1 bg-slate-900/90 rounded-lg border border-slate-800 text-[9px] font-mono space-y-1.5 text-slate-300">
            {/* Size Selector */}
            <div className="flex items-center justify-between">
              <span className="text-slate-400">SIZE:</span>
              <div className="flex space-x-1">
                {(['S', 'M', 'L'] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setSize(s)}
                    className={`px-1.5 py-0.5 rounded ${
                      size === s ? 'bg-cyan-500 text-slate-950 font-bold' : 'bg-slate-800 hover:bg-slate-700'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Dock Position */}
            <div className="flex items-center justify-between">
              <span className="text-slate-400">DOCK:</span>
              <div className="flex space-x-1">
                <button
                  onClick={() => setDockPosition('TR')}
                  className={`px-1.5 py-0.5 rounded ${
                    dockPosition === 'TR' ? 'bg-cyan-500 text-slate-950 font-bold' : 'bg-slate-800 hover:bg-slate-700'
                  }`}
                >
                  Top-R
                </button>
                <button
                  onClick={() => setDockPosition('BR')}
                  className={`px-1.5 py-0.5 rounded ${
                    dockPosition === 'BR' ? 'bg-cyan-500 text-slate-950 font-bold' : 'bg-slate-800 hover:bg-slate-700'
                  }`}
                >
                  Bottom-R
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Compact Docked Minimap Canvas */}
        {!isCollapsed && (
          <div className={`relative ${sizeStyles.width} ${sizeStyles.height} transition-all duration-300`}>
            <svg
              ref={miniSvgRef}
              viewBox="0 0 960 560"
              onClick={(e) => processMapClick(e, miniSvgRef)}
              onMouseMove={(e) => handleMouseMoveMap(e, miniSvgRef)}
              onMouseUp={handleMouseUpMap}
              onMouseLeave={handleMouseUpMap}
              className="w-full h-full bg-slate-950 rounded-lg border border-slate-800/80 cursor-crosshair overflow-hidden"
            >
              {/* Background grid */}
              <rect width="960" height="560" fill="#020617" />

              {/* Connected Links */}
              {peers.map(p => {
                return p.connectedPeers.map(targetId => {
                  const target = peers.find(tp => tp.id === targetId);
                  if (!target) return null;
                  return (
                    <line
                      key={`mini-link-${p.id}-${target.id}`}
                      x1={p.x}
                      y1={p.y}
                      x2={target.x}
                      y2={target.y}
                      stroke={p.type === 'seeder' ? 'rgba(34,197,94,0.2)' : 'rgba(6,182,212,0.15)'}
                      strokeWidth="2"
                    />
                  );
                });
              })}

              {/* Live Flying Data Packets */}
              {packets.map(pkt => {
                const pos = getPacketPosition(pkt);
                if (!pos) return null;
                return (
                  <circle
                    key={`mini-pkt-${pkt.id}`}
                    cx={pos.x}
                    cy={pos.y}
                    r="8"
                    fill={
                      pkt.status === 'dropped' ? '#f43f5e' :
                      pkt.isCorrupted ? '#ef4444' :
                      pkt.isRetry ? '#06b6d4' :
                      pkt.type === 'piece' ? '#22c55e' : '#a855f7'
                    }
                  />
                );
              })}

              {/* Live Nodes */}
              {peers.map(p => {
                const isSelected = selectedPeerId === p.id;
                const color = getMiniNodeColor(p);
                return (
                  <g key={`mini-node-${p.id}`}>
                    {isSelected && (
                      <circle
                        cx={p.x}
                        cy={p.y}
                        r="24"
                        fill="none"
                        stroke="#38bdf8"
                        strokeWidth="4"
                        className="animate-ping opacity-80"
                      />
                    )}
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r={isSelected ? '18' : '14'}
                      fill={color}
                      stroke={isSelected ? '#ffffff' : '#0f172a'}
                      strokeWidth="3"
                    />
                  </g>
                );
              })}

              {/* Viewport Box */}
              <rect
                x={viewport.x}
                y={viewport.y}
                width={viewport.w}
                height={viewport.h}
                fill="rgba(6, 182, 212, 0.1)"
                stroke="#06b6d4"
                strokeWidth="3"
                strokeDasharray="8 6"
                rx="8"
                onMouseDown={handleMouseDownViewport}
                className="cursor-move hover:fill-cyan-500/20 transition-colors"
              />
            </svg>

            {/* Click to Expand Prompt */}
            <button
              onClick={() => setIsExpandedModal(true)}
              className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-slate-900/90 hover:bg-cyan-500 hover:text-slate-950 text-cyan-400 text-[8px] font-mono border border-cyan-500/30 rounded flex items-center space-x-1 shadow transition-all"
            >
              <ExternalLink className="w-2.5 h-2.5" />
              <span>EXPAND</span>
            </button>
          </div>
        )}
      </div>

      {/* 2. DEDICATED FULLSCREEN MODAL (Option 3 - Completely leaves main topology canvas unblocked) */}
      {isExpandedModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-xl flex flex-col p-4 sm:p-6 animate-fadeIn select-none overflow-y-auto">
          {/* Top Modal Navigation Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-cyan-500/10 rounded-xl border border-cyan-500/30">
                <Compass className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white font-mono flex items-center space-x-2">
                  <span>EXPANDED NETWORK MONITOR & TOPOLOGY INSPECTOR</span>
                  <span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 rounded-full text-[10px]">
                    LIVE SYNC
                  </span>
                </h2>
                <p className="text-xs text-slate-400">
                  Full-scale P2P swarm topology overview without obscuring main workspace
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => setIsExpandedModal(false)}
                className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-mono font-bold flex items-center space-x-1.5 transition-all shadow-lg hover:border-slate-500"
              >
                <span>CLOSE INSPECTOR (ESC)</span>
                <X className="w-4 h-4 text-rose-400" />
              </button>
            </div>
          </div>

          {/* Modal Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mt-4 flex-1">
            {/* Left 3 Columns: High Resolution Map Canvas */}
            <div className="lg:col-span-3 bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col relative overflow-hidden">
              <div className="flex items-center justify-between mb-3 text-xs font-mono">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="text-slate-200 font-bold">SWARM CANVAS HIGH-RES MAP</span>
                  <span className="text-slate-500">({peers.length} Nodes, {packets.length} Live Packets)</span>
                </div>

                {/* Legend */}
                <div className="flex flex-wrap items-center gap-3 text-[10px]">
                  <span className="flex items-center space-x-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span className="text-slate-300">Seeder</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <span className="w-2 h-2 rounded-full bg-cyan-500"></span>
                    <span className="text-slate-300">Leecher</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                    <span className="text-slate-300">Tracker</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <span className="w-2 h-2 rounded-full bg-teal-500"></span>
                    <span className="text-slate-300">Bootstrap</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                    <span className="text-slate-300">Slow Peer</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                    <span className="text-slate-300">Malicious/Blocked</span>
                  </span>
                </div>
              </div>

              {/* Full SVG Viewport */}
              <div className="flex-1 bg-slate-950 rounded-xl border border-slate-800 relative overflow-hidden">
                <svg
                  ref={modalSvgRef}
                  viewBox="0 0 960 560"
                  onClick={(e) => processMapClick(e, modalSvgRef)}
                  onMouseMove={(e) => handleMouseMoveMap(e, modalSvgRef)}
                  onMouseUp={handleMouseUpMap}
                  onMouseLeave={handleMouseUpMap}
                  className="w-full h-full cursor-crosshair"
                >
                  {/* Grid */}
                  <defs>
                    <pattern id="modalGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                    </pattern>
                  </defs>
                  <rect width="960" height="560" fill="url(#modalGrid)" />

                  {/* Mesh Connections */}
                  {peers.map(p => {
                    return p.connectedPeers.map(targetId => {
                      const target = peers.find(tp => tp.id === targetId);
                      if (!target) return null;
                      return (
                        <line
                          key={`modal-link-${p.id}-${target.id}`}
                          x1={p.x}
                          y1={p.y}
                          x2={target.x}
                          y2={target.y}
                          stroke={p.type === 'seeder' ? 'rgba(34,197,94,0.25)' : 'rgba(6,182,212,0.2)'}
                          strokeWidth="2"
                        />
                      );
                    });
                  })}

                  {/* Flying Packets */}
                  {packets.map(pkt => {
                    const pos = getPacketPosition(pkt);
                    if (!pos) return null;
                    return (
                      <g key={`modal-pkt-${pkt.id}`}>
                        <circle
                          cx={pos.x}
                          cy={pos.y}
                          r="10"
                          fill={
                            pkt.status === 'dropped' ? '#f43f5e' :
                            pkt.isCorrupted ? '#ef4444' :
                            pkt.isRetry ? '#06b6d4' :
                            pkt.type === 'piece' ? '#22c55e' : '#a855f7'
                          }
                          opacity="0.9"
                        />
                      </g>
                    );
                  })}

                  {/* Nodes with Labels */}
                  {filteredPeers.map(p => {
                    const isSelected = selectedPeerId === p.id;
                    const color = getMiniNodeColor(p);
                    return (
                      <g 
                        key={`modal-node-${p.id}`}
                        onClick={() => onSelectPeer && onSelectPeer(p)}
                        className="cursor-pointer group"
                      >
                        {isSelected && (
                          <circle
                            cx={p.x}
                            cy={p.y}
                            r="28"
                            fill="none"
                            stroke="#38bdf8"
                            strokeWidth="4"
                            className="animate-ping opacity-80"
                          />
                        )}
                        <circle
                          cx={p.x}
                          cy={p.y}
                          r={isSelected ? '20' : '16'}
                          fill={color}
                          stroke={isSelected ? '#ffffff' : '#0f172a'}
                          strokeWidth="3"
                        />
                        {/* Label */}
                        <text
                          x={p.x}
                          y={p.y + 32}
                          textAnchor="middle"
                          fill="#cbd5e1"
                          fontSize="11"
                          fontFamily="monospace"
                          fontWeight="bold"
                        >
                          {p.name}
                        </text>
                      </g>
                    );
                  })}

                  {/* Interactive Viewport Box */}
                  <rect
                    x={viewport.x}
                    y={viewport.y}
                    width={viewport.w}
                    height={viewport.h}
                    fill="rgba(6, 182, 212, 0.08)"
                    stroke="#06b6d4"
                    strokeWidth="3"
                    strokeDasharray="8 6"
                    rx="8"
                    onMouseDown={handleMouseDownViewport}
                    className="cursor-move hover:fill-cyan-500/20 transition-colors"
                  />
                </svg>
              </div>
            </div>

            {/* Right Column: Node Explorer & Filters */}
            <div className="lg:col-span-1 bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col space-y-4">
              <div className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-2 pb-2 border-b border-slate-800">
                <Filter className="w-4 h-4 text-cyan-400" />
                <span>INSPECTOR FILTERS & NODES</span>
              </div>

              {/* Search Box */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Filter nodes by name/IP..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Type Filter Tabs */}
              <div className="flex flex-wrap gap-1 text-[10px] font-mono">
                {['all', 'seeder', 'leecher', 'tracker', 'slow', 'blocked'].map((f) => (
                  <button
                    key={f}
                    onClick={() => setNodeFilter(f)}
                    className={`px-2 py-1 rounded-lg border transition-all ${
                      nodeFilter === f
                        ? 'bg-cyan-500 text-slate-950 font-bold border-cyan-400'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                    }`}
                  >
                    {f.toUpperCase()}
                  </button>
                ))}
              </div>

              {/* Node List */}
              <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                {filteredPeers.map(p => {
                  const isSelected = selectedPeerId === p.id;
                  const country = getCountryDetails(p.countryCode, p.country);
                  return (
                    <div
                      key={p.id}
                      onClick={() => onSelectPeer && onSelectPeer(p)}
                      className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                        isSelected 
                          ? 'bg-cyan-500/15 border-cyan-400 text-slate-100 shadow-lg' 
                          : 'bg-slate-950/70 border-slate-800/80 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs font-mono font-bold">
                        <span className="flex items-center space-x-1.5 truncate">
                          <span 
                            className="w-2 h-2 rounded-full shrink-0" 
                            style={{ backgroundColor: getMiniNodeColor(p) }}
                          ></span>
                          <span className="mr-1">{country.flag}</span>
                          <span className="truncate">{p.name}</span>
                        </span>
                        <span className="text-[10px] text-cyan-400 font-mono shrink-0">{p.type.toUpperCase()}</span>
                      </div>

                      <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mt-1">
                        <span>IP: {p.ip}</span>
                        <span>{p.clientVersion || 'qBittorrent v5.2'}</span>
                      </div>

                      <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mt-0.5">
                        <span className="text-slate-300">{country.name}</span>
                        <span className="text-emerald-400">Ping: {p.latency}ms</span>
                      </div>

                      {/* Protocol Flags */}
                      <div className="mt-1.5 pt-1.5 border-t border-slate-800/60">
                        <ProtocolBadgeList peer={p} maxFlags={5} compact />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
