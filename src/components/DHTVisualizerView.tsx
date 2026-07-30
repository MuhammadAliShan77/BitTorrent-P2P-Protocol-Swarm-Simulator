import React, { useState } from 'react';
import { 
  Database, 
  Cpu, 
  Key, 
  Network, 
  Wifi, 
  CheckCircle2, 
  XCircle, 
  ShieldCheck, 
  Activity, 
  Clock, 
  Globe, 
  Sliders, 
  Zap, 
  ArrowUpRight,
  Info
} from 'lucide-react';
import { PeerNode } from '../types/p2p';
import { getCountryDetails, getPeerCapabilitySummary, getPeerProtocolFlags } from '../utils/p2pFlags';
import { ProtocolBadgeList } from './ProtocolBadgeList';

interface DHTVisualizerViewProps {
  peers: PeerNode[];
}

export const DHTVisualizerView: React.FC<DHTVisualizerViewProps> = ({ peers }) => {
  const [selectedNodeId, setSelectedNodeId] = useState<string>(peers[0]?.id || 'tracker-01');

  // Convert peer string ID to pseudo 160-bit Hex hash
  const getInfoHash = (id: string) => {
    let hash = '';
    for (let i = 0; i < 8; i++) {
      hash += id.charCodeAt(i % id.length).toString(16).padStart(2, '0');
    }
    return hash + 'a4f891b2c3d4e5f6';
  };

  const targetNode = peers.find(p => p.id === selectedNodeId) || peers[0];
  const targetHash = targetNode ? getInfoHash(targetNode.id) : getInfoHash('tracker-01');

  // Calculate XOR distances to all other peers
  const peersWithXOR = peers.map(p => {
    const pHash = getInfoHash(p.id);
    let xorDistance = 0;
    for (let i = 0; i < Math.min(pHash.length, targetHash.length); i++) {
      xorDistance += Math.abs(pHash.charCodeAt(i) ^ targetHash.charCodeAt(i));
    }
    return {
      ...p,
      hash: pHash,
      xorDistance
    };
  }).sort((a, b) => a.xorDistance - b.xorDistance);

  // Selected peer details for summary panel
  const selectedPeer = peersWithXOR.find(p => p.id === selectedNodeId) || peersWithXOR[0];
  const selectedCapabilities = selectedPeer ? getPeerCapabilitySummary(selectedPeer) : null;
  const selectedCountry = selectedPeer ? getCountryDetails(selectedPeer.countryCode, selectedPeer.country) : null;

  // Helper for XOR distance badge styling and level names
  const getXorDistanceInfo = (xorDistance: number) => {
    if (xorDistance === 0) {
      return {
        level: 'Level 0',
        label: 'Exact Match',
        badgeStyle: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-emerald-500/10',
        dotColor: 'bg-emerald-400',
      };
    } else if (xorDistance <= 15) {
      return {
        level: 'Level 1',
        label: 'Nearby Peer',
        badgeStyle: 'bg-teal-500/20 text-teal-300 border-teal-500/40 shadow-teal-500/10',
        dotColor: 'bg-teal-400',
      };
    } else if (xorDistance <= 35) {
      return {
        level: 'Level 2',
        label: 'Local Bucket',
        badgeStyle: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-cyan-500/10',
        dotColor: 'bg-cyan-400',
      };
    } else if (xorDistance <= 60) {
      return {
        level: 'Level 3',
        label: 'Medium Distance',
        badgeStyle: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40 shadow-yellow-500/10',
        dotColor: 'bg-yellow-400',
      };
    } else if (xorDistance <= 90) {
      return {
        level: 'Level 4',
        label: 'Remote Bucket',
        badgeStyle: 'bg-orange-500/20 text-orange-300 border-orange-500/40 shadow-orange-500/10',
        dotColor: 'bg-orange-400',
      };
    } else {
      return {
        level: 'Level 5',
        label: 'Distant Peer',
        badgeStyle: 'bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-rose-500/10',
        dotColor: 'bg-rose-400',
      };
    }
  };

  const formatTruncatedHash = (hash: string) => {
    if (!hash || hash.length < 12) return hash;
    return `0x${hash.slice(0, 6)}...${hash.slice(-5)}`;
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-2xl min-h-[620px] flex flex-col space-y-4 font-mono">
      
      {/* 1. Header Section - Balanced, aligned on shared baseline */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between pb-4 border-b border-slate-800/90 gap-4">
        
        {/* Left: DHT Icon, Main Title, Subtitle, and Perfect 160-BIT XOR Metric Circle */}
        <div className="flex items-center space-x-3.5">
          <div className="p-3 bg-teal-500/10 border border-teal-500/30 rounded-2xl shadow-inner shrink-0 text-teal-400">
            <Database className="w-6 h-6" />
          </div>

          <div>
            <div className="flex items-center space-x-3">
              <h2 className="text-sm sm:text-base font-bold text-slate-100 uppercase tracking-wider font-mono">
                MAINLINE DHT <span className="text-slate-400 text-xs font-normal font-sans">(KADEMLIA DISTRIBUTED HASH TABLE)</span>
              </h2>

              {/* 160-BIT XOR METRIC Badge - Perfect Circle with subtle gradient & animated glow */}
              <div 
                className="relative flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-teal-500/25 via-cyan-500/15 to-emerald-500/25 border border-teal-400/60 shadow-[0_0_12px_rgba(20,184,166,0.3)] shrink-0 group cursor-help transition-transform hover:scale-110"
                title="160-Bit InfoHash XOR Distance Metric: Kademlia routes lookups using binary XOR metric space"
              >
                <span className="absolute inset-0 rounded-full bg-teal-400/20 animate-ping opacity-30 pointer-events-none" />
                <span className="text-[9px] font-extrabold text-teal-300 tracking-tighter leading-none">
                  160b
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-400 font-sans mt-0.5">
              Trackerless Peer Discovery • XOR Metric Routing Table • Logarithmic Lookup Space O(log N)
            </p>
          </div>
        </div>

        {/* Right: Selected Focus Node Selector */}
        <div className="flex items-center space-x-3 bg-slate-950 px-3.5 py-2 rounded-xl border border-slate-800 shadow-md shrink-0 self-stretch sm:self-auto justify-between sm:justify-start">
          <div className="flex items-center space-x-2 text-slate-400 font-semibold text-[11px] uppercase tracking-wider">
            <Cpu className="w-4 h-4 text-teal-400" />
            <span>Focus Node:</span>
          </div>
          <select
            value={selectedNodeId}
            onChange={(e) => setSelectedNodeId(e.target.value)}
            className="bg-slate-900 text-teal-300 font-bold border border-slate-700/80 rounded-lg px-3 py-1 focus:outline-none focus:border-teal-500 transition-colors cursor-pointer text-xs"
          >
            {peers.map(p => {
              const country = getCountryDetails(p.countryCode, p.country);
              return (
                <option key={p.id} value={p.id}>
                  {country.flag} {p.name} ({p.ip})
                </option>
              );
            })}
          </select>
        </div>
      </div>

      {/* 2. Target Infohash Card & K-Bucket Status Bar */}
      <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-3 shadow-inner">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-teal-500/10 rounded-lg border border-teal-500/20 text-teal-400">
            <Key className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">
              Focus Node 160-bit InfoHash
            </span>
            <div 
              className="text-xs text-teal-300 font-bold tracking-wider bg-slate-900 px-3 py-1 rounded-lg border border-teal-500/30 inline-block font-mono mt-0.5 cursor-help"
              title={`Full 160-Bit Target InfoHash:\n0x${targetHash}`}
            >
              0x{targetHash}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4 text-xs">
          <div className="text-right">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">
              K-Bucket Routing Radius
            </span>
            <span className="text-xs text-slate-200 font-bold bg-slate-900 px-3 py-1 rounded-lg border border-slate-800 inline-block mt-0.5">
              K = 8 Buckets (XOR Distance Metric)
            </span>
          </div>

          <div className="text-right hidden sm:block">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">
              Routing Table Depth
            </span>
            <span className="text-xs text-cyan-400 font-bold bg-cyan-950/60 px-3 py-1 rounded-lg border border-cyan-800/60 inline-block mt-0.5">
              O(log₂ {peers.length}) ≈ {(Math.log2(peers.length) || 3).toFixed(1)} Hops
            </span>
          </div>
        </div>
      </div>

      {/* 3. Redesigned 2-Column Split View: Left (Routing Table) & Right (Flag Summary & Peer Capabilities) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1">
        
        {/* Left Column (8 cols on lg): Polished Routing Table */}
        <div className="lg:col-span-8 bg-slate-950 border border-slate-800 rounded-xl overflow-hidden flex flex-col relative shadow-inner">
          
          {/* Table Container with Custom Scrollbar */}
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {/* Sticky Table Header */}
            <div className="sticky top-0 bg-slate-950/95 backdrop-blur-md z-10 grid grid-cols-12 text-[10px] uppercase text-slate-400 font-bold px-4 py-3 border-b border-slate-800 shadow-sm tracking-wider">
              <span className="col-span-3">Node / Client / IP</span>
              <span className="col-span-2">Network Status</span>
              <span className="col-span-2">160-bit InfoHash</span>
              <span className="col-span-3">Protocol Flags</span>
              <span className="col-span-2 text-right">XOR Distance</span>
            </div>

            {/* Table Rows */}
            <div className="divide-y divide-slate-800/50">
              {peersWithXOR.map((p, idx) => {
                const country = getCountryDetails(p.countryCode, p.country);
                const isSelected = p.id === selectedNodeId;
                const distInfo = getXorDistanceInfo(p.xorDistance);
                const bucketNum = Math.min(8, Math.floor(p.xorDistance / 12) + 1);

                return (
                  <div
                    key={p.id}
                    onClick={() => setSelectedNodeId(p.id)}
                    className={`grid grid-cols-12 items-center px-4 py-3 transition-all duration-200 cursor-pointer text-xs ${
                      isSelected
                        ? 'bg-teal-500/15 border-l-4 border-teal-400 text-slate-100 font-medium shadow-[0_0_20px_rgba(20,184,166,0.1)]'
                        : idx % 2 === 0
                        ? 'bg-slate-950 hover:bg-slate-900/90 hover:border-l-2 hover:border-cyan-500/40 hover:shadow-[0_0_15px_rgba(6,182,212,0.1)]'
                        : 'bg-slate-900/40 hover:bg-slate-900/90 hover:border-l-2 hover:border-cyan-500/40 hover:shadow-[0_0_15px_rgba(6,182,212,0.1)]'
                    }`}
                  >
                    {/* Column 1: Peer Name, Country, Client */}
                    <div className="col-span-3 flex flex-col pr-2 min-w-0 justify-center">
                      <div className="flex items-center space-x-1.5 truncate">
                        <span className="text-base shrink-0" title={country.name}>{country.flag}</span>
                        <span className={`font-bold truncate ${isSelected ? 'text-teal-200' : 'text-slate-200'}`}>
                          {p.name}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1.5 text-[10px] text-slate-400 mt-0.5 truncate font-mono">
                        <span className="truncate">{p.clientVersion || 'qBittorrent v4.6'}</span>
                      </div>
                    </div>

                    {/* Column 2: Network Indicators (🟢 Online, Latency, Signal, Bucket) */}
                    <div className="col-span-2 flex flex-col justify-center pr-2">
                      <div className="flex items-center space-x-1.5 text-[11px] font-mono">
                        <span className="relative flex h-2 w-2 shrink-0">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        <span className="text-slate-300 font-semibold">{p.ip}</span>
                      </div>

                      <div className="flex items-center space-x-2 text-[10px] text-slate-400 mt-0.5">
                        <span className="text-emerald-400 font-semibold">{p.latency}ms</span>
                        <span>•</span>
                        <span className="text-cyan-400 font-mono">Bucket K-{bucketNum}</span>
                      </div>
                    </div>

                    {/* Column 3: 160-bit InfoHash with ellipsis & tooltip */}
                    <div className="col-span-2 pr-2 min-w-0">
                      <span 
                        title={`Full 160-bit InfoHash:\n0x${p.hash}`}
                        className="font-mono text-[11px] text-teal-300 bg-slate-900 px-2 py-1 rounded border border-teal-500/20 block truncate hover:text-teal-100 hover:border-teal-400/50 transition-colors cursor-help"
                      >
                        {formatTruncatedHash(p.hash)}
                      </span>
                    </div>

                    {/* Column 4: Protocol Flags with interactive tooltips */}
                    <div className="col-span-3 flex items-center pr-2">
                      <ProtocolBadgeList peer={p} maxFlags={5} compact />
                    </div>

                    {/* Column 5: XOR Distance Badge - Equal Width & Styled Levels */}
                    <div className="col-span-2 text-right flex justify-end">
                      <div 
                        className={`w-28 flex flex-col items-center justify-center px-2 py-1 rounded-lg border text-center font-mono shadow-sm transition-transform ${distInfo.badgeStyle}`}
                      >
                        <div className="flex items-center space-x-1 text-[10px] font-bold">
                          <span className={`w-1.5 h-1.5 rounded-full ${distInfo.dotColor}`} />
                          <span>d = {p.xorDistance}</span>
                        </div>
                        <span className="text-[9px] opacity-80 uppercase tracking-tight font-sans">
                          {distInfo.label}
                        </span>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          </div>

          {/* Table Footer */}
          <div className="p-2.5 bg-slate-950 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
            <span className="flex items-center space-x-1.5">
              <Network className="w-3.5 h-3.5 text-teal-400" />
              <span>XOR Distance Metric = d(x, y) = x ⊕ y</span>
            </span>
            <span className="text-teal-400 font-semibold">Active Swarm Nodes: {peers.length}</span>
          </div>

        </div>

        {/* Right Column (4 cols on lg): Flag Summary & Peer Capabilities Panel */}
        <div className="lg:col-span-4 bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-4 shadow-xl">
          
          {selectedPeer && selectedCapabilities && selectedCountry ? (
            <>
              {/* Top Details Header */}
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center space-x-2.5">
                    <span className="text-2xl" title={selectedCountry.name}>{selectedCountry.flag}</span>
                    <div>
                      <h3 className="text-sm font-bold text-slate-100 font-mono flex items-center space-x-1.5">
                        <span>{selectedPeer.name}</span>
                        <span className="text-[10px] text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
                          {selectedPeer.type.toUpperCase()}
                        </span>
                      </h3>
                      <p className="text-[11px] text-slate-400 font-sans">
                        {selectedCountry.name} • {selectedPeer.ip}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] uppercase font-mono text-slate-400 block">Latency</span>
                    <span className="text-xs font-mono font-bold text-emerald-400">{selectedPeer.latency} ms</span>
                  </div>
                </div>

                {/* Connection Score & Compatibility Meter */}
                <div className="my-3 p-3 bg-slate-900/90 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-400 font-medium flex items-center space-x-1">
                      <Zap className="w-3.5 h-3.5 text-yellow-400" />
                      <span>Connection Score:</span>
                    </span>
                    <span className="font-bold text-teal-300 bg-teal-950 px-2 py-0.5 rounded border border-teal-800">
                      {selectedCapabilities.connectionScore}%
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                    <div 
                      className="bg-gradient-to-r from-teal-500 via-cyan-400 to-emerald-400 h-full transition-all duration-500 rounded-full"
                      style={{ width: `${selectedCapabilities.connectionScore}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[10px] font-sans pt-1">
                    <span className="text-slate-400">Protocol Compatibility:</span>
                    <span className="font-bold text-emerald-400 flex items-center space-x-1">
                      <ShieldCheck className="w-3 h-3" />
                      <span>{selectedCapabilities.compatibilityLabel}</span>
                    </span>
                  </div>
                </div>

                {/* Peer Capabilities Checklist */}
                <div>
                  <h4 className="text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-2 font-mono flex items-center justify-between">
                    <span>Peer Capabilities</span>
                    <span className="text-[10px] text-slate-500 font-normal">BEP Specifications</span>
                  </h4>

                  <div className="grid grid-cols-2 gap-1.5 text-xs font-mono">
                    <CapabilityBadge name="DHT Enabled" active={selectedCapabilities.dhtEnabled} />
                    <CapabilityBadge name="Kademlia Routing" active={selectedCapabilities.kademliaRouting} />
                    <CapabilityBadge name="Extension Proto" active={selectedCapabilities.extensionProtocol} />
                    <CapabilityBadge name="Peer Exchange" active={selectedCapabilities.peerExchange} />
                    <CapabilityBadge name="uTP Transport" active={selectedCapabilities.uTpTransport} />
                    <CapabilityBadge name="Hole Punching" active={selectedCapabilities.holePunching} />
                    <CapabilityBadge name="MSE/PE Encrypt" active={selectedCapabilities.encryption} />
                    <CapabilityBadge name="IPv6 Address" active={selectedCapabilities.ipv6Support} />
                  </div>
                </div>

                {/* Detailed Active Flags List */}
                <div className="mt-4 pt-3 border-t border-slate-800">
                  <h4 className="text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-2 font-mono">
                    Active Protocol Flags ({getPeerProtocolFlags(selectedPeer).length})
                  </h4>
                  <ProtocolBadgeList peer={selectedPeer} maxFlags={10} />
                </div>
              </div>

              {/* Bottom Routing Details Box */}
              <div className="pt-3 border-t border-slate-800 text-[11px] font-mono space-y-1.5 text-slate-400 bg-slate-900/50 p-2.5 rounded-xl border border-slate-800/80">
                <div className="flex justify-between">
                  <span>Client Version:</span>
                  <span className="text-teal-300 font-bold">{selectedPeer.clientVersion}</span>
                </div>
                <div className="flex justify-between">
                  <span>NAT Traversal:</span>
                  <span className="text-amber-300 font-bold">{selectedPeer.natType}</span>
                </div>
                <div className="flex justify-between">
                  <span>Routing Bucket:</span>
                  <span className="text-cyan-300 font-bold">
                    Bucket K-{Math.min(8, Math.floor((peersWithXOR.find(p=>p.id===selectedPeer.id)?.xorDistance || 0) / 12) + 1)}
                  </span>
                </div>
              </div>
            </>
          ) : (
            <div className="p-6 text-center text-slate-500 text-xs">
              Select a peer row to inspect protocol capabilities
            </div>
          )}

        </div>

      </div>

    </div>
  );
};

interface CapabilityBadgeProps {
  name: string;
  active: boolean;
}

const CapabilityBadge: React.FC<CapabilityBadgeProps> = ({ name, active }) => (
  <div 
    className={`flex items-center space-x-1.5 px-2 py-1 rounded-lg border text-[11px] font-medium transition-colors ${
      active 
        ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300' 
        : 'bg-slate-900/60 border-slate-800 text-slate-500'
    }`}
  >
    {active ? (
      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
    ) : (
      <XCircle className="w-3.5 h-3.5 text-slate-600 shrink-0" />
    )}
    <span className="truncate">{name}</span>
  </div>
);


