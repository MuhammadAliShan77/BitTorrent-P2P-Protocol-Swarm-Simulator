import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Activity, 
  RefreshCw, 
  AlertTriangle, 
  ServerOff, 
  Unplug, 
  Globe, 
  ShieldAlert, 
  Copy, 
  Clock, 
  CheckCircle2, 
  Zap, 
  Sparkles,
  BookOpen,
  ArrowRight
} from 'lucide-react';
import { FailureType, FaultToleranceStats } from '../types/p2p';

interface FaultToleranceMonitorProps {
  stats: FaultToleranceStats;
  activeFailure: FailureType;
  onTriggerChaos: (failure: FailureType) => void;
  onRecover: () => void;
}

interface ChaosExplanation {
  type: FailureType;
  title: string;
  icon: React.ReactNode;
  color: string;
  badgeColor: string;
  problem: string;
  realBitTorrentResponse: string;
  simulatorResponse: string;
  bepSpec?: string;
}

const CHAOS_EXPLANATIONS: Record<FailureType, ChaosExplanation> = {
  packet_loss_spike: {
    type: 'packet_loss_spike',
    title: '1. Packet Loss Recovery',
    icon: <Activity className="w-4 h-4 text-rose-400" />,
    color: 'border-rose-500/40 bg-rose-500/10 text-rose-300',
    badgeColor: 'bg-rose-500/20 text-rose-400 border-rose-500/40',
    problem: 'Network congestion or noisy Wi-Fi drops piece request or data packets mid-transit.',
    realBitTorrentResponse: 'BitTorrent clients run a per-piece request timeout clock (~250-500ms). When a piece request expires without receiving data, the client marks the piece as unfulfilled, cancels the pending request to the slow/unresponsive peer, and re-dispatches the request to an alternate healthy peer in the swarm.',
    simulatorResponse: 'Watch the packet turn RED and disappear with a DROPPED tag. Within 1 tick, the self-healing timeout engine detects the missing piece and dispatches a blue/cyan 🔄 RETRY request to another active Seeder, continuing the download seamlessly.',
    bepSpec: 'BEP-0003 Core Protocol (Piece Request Pipeline & Timeouts)'
  },
  peer_disconnect: {
    type: 'peer_disconnect',
    title: '2. Peer Disconnect / Sever Links Recovery',
    icon: <Unplug className="w-4 h-4 text-orange-400" />,
    color: 'border-orange-500/40 bg-orange-500/10 text-orange-300',
    badgeColor: 'bg-orange-500/20 text-orange-400 border-orange-500/40',
    problem: 'A peer abruptly drops off the network, closing TCP sockets and terminating active download streams.',
    realBitTorrentResponse: 'BitTorrent clients periodically query the tracker or local peer list (PEX - Peer Exchange) to maintain an active pool of candidate connections. When a peer socket dies, the client automatically establishes new handshake connections with backup peers from its routing table.',
    simulatorResponse: 'Connected links turn RED and disconnect. The simulator\'s background discovery loop automatically searches for alternative active swarm peers, establishes new links, and resumes uploading without stopping the overall torrent job.',
    bepSpec: 'BEP-0011 Peer Exchange (PEX) & Socket Pool Management'
  },
  node_failure: {
    type: 'node_failure',
    title: '3. Node Failure Recovery',
    icon: <ServerOff className="w-4 h-4 text-red-400" />,
    color: 'border-red-500/40 bg-red-500/10 text-red-300',
    badgeColor: 'bg-red-500/20 text-red-400 border-red-500/40',
    problem: 'An entire node or seeder crashes or goes completely offline.',
    realBitTorrentResponse: 'BitTorrent operates as a decentralized mesh. No single node failure can collapse the swarm as long as all piece hashes are collectively held across remaining peers. Upload traffic automatically redistributes across surviving seeders and partial leechers.',
    simulatorResponse: 'The crashed node turns red with 0% health. The choking engine recalculates upload paths and load-balances the piece request pipeline across remaining online seeders.',
    bepSpec: 'Swarm Decentralization & Load Distribution'
  },
  tracker_down: {
    type: 'tracker_down',
    title: '4. Tracker Failure Recovery (DHT Fallback)',
    icon: <Globe className="w-4 h-4 text-fuchsia-400" />,
    color: 'border-fuchsia-500/40 bg-fuchsia-500/10 text-fuchsia-300',
    badgeColor: 'bg-fuchsia-500/20 text-fuchsia-400 border-fuchsia-500/40',
    problem: 'The central Tracker server crashes, returns HTTP 503 errors, or becomes unreachable due to ISP blocking.',
    realBitTorrentResponse: 'BitTorrent uses Mainline DHT (Kademlia distributed hash table). Each client becomes a node in a global DHT network. Peers find other peers sharing the same info-hash without ever contacting a central tracker server.',
    simulatorResponse: 'The Tracker node turns RED and unreachable. The simulator automatically switches to Kademlia DHT mode, spawning purple ⚡ DHT FIND_NODE packets to Bootstrap nodes to discover peers and keep the swarm alive.',
    bepSpec: 'BEP-0005 Kademlia DHT (Trackerless Swarms)'
  },
  network_partition: {
    type: 'network_partition',
    title: '5. Network Partition Recovery',
    icon: <AlertTriangle className="w-4 h-4 text-red-400" />,
    color: 'border-red-500/40 bg-red-500/10 text-red-300',
    badgeColor: 'bg-red-500/20 text-red-400 border-red-500/40',
    problem: 'Network routing tables split, creating an isolated WEST vs. EAST network partition.',
    realBitTorrentResponse: 'BitTorrent nodes behind restrictive NATs or partitions use Relay Bridges, STUN/TURN traversal, and UPnP/NAT-PMP port mapping to re-establish inter-mesh pathways as soon as routes become available.',
    simulatorResponse: 'Packets hitting the partition wall show a 🛑 WALL indicator. The self-healing loop buffers requests, establishes a STUN Relay Bridge, and flushes queued piece requests to synchronize missing pieces.',
    bepSpec: 'BEP-0055 Hole Punching & STUN Relay Traversal'
  },
  high_latency: {
    type: 'high_latency',
    title: '6. High Latency & Ping Spike Recovery',
    icon: <Clock className="w-4 h-4 text-amber-400" />,
    color: 'border-amber-500/40 bg-amber-500/10 text-amber-300',
    badgeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
    problem: 'Network ping spikes to 800+ ms on certain satellite or congested connections.',
    realBitTorrentResponse: 'BitTorrent clients monitor round-trip-time (RTT) and upload speeds for each connected peer. Instead of disconnecting, the client dynamically throttles the request pipeline window on slow peers and routes bulk requests to low-latency seeders.',
    simulatorResponse: 'Packets slow down with ⏳ LATENCY labels. The simulator dynamically throttles pipeline size to slow peers and shifts pending piece requests to low-ping seeders.',
    bepSpec: 'BitTorrent Dynamic Window Throttling & RTT Balancing'
  },
  duplicate_packets: {
    type: 'duplicate_packets',
    title: '7. Duplicate Packet Recovery',
    icon: <Copy className="w-4 h-4 text-purple-400" />,
    color: 'border-purple-500/40 bg-purple-500/10 text-purple-300',
    badgeColor: 'bg-purple-500/20 text-purple-400 border-purple-500/40',
    problem: 'Network race conditions send duplicate piece payloads to the same downloading peer.',
    realBitTorrentResponse: 'BitTorrent clients maintain an in-memory Bitfield and pending request list. When a duplicate piece payload arrives, the receiver checks its Bitfield, recognizes the piece is already owned, and drops the payload immediately to save storage write cycles and bandwidth.',
    simulatorResponse: 'Duplicate packets arrive tagged ♊ DUP. The simulator\'s Bitfield filter detects the duplicate piece index, discards the packet, logs bandwidth saved (1MB), and updates the Duplicates Discarded counter.',
    bepSpec: 'Bitfield Ownership Check & Duplicate Payload Rejection'
  },
  corrupted_packets: {
    type: 'corrupted_packets',
    title: '8. Corrupted Piece / Poison Attack Recovery',
    icon: <ShieldAlert className="w-4 h-4 text-emerald-400" />,
    color: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300',
    badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
    problem: 'A malicious peer or corrupted network link transmits fake or tampered piece data.',
    realBitTorrentResponse: 'Every torrent file contains cryptographic SHA-1 hashes for every piece in the torrent metainfo (.torrent). When a piece finishes downloading, the client calculates its SHA-1 hash. If it fails, the piece is discarded, the malicious peer is blacklisted/banned, and the piece is re-requested from a trusted peer.',
    simulatorResponse: 'Corrupted packets arrive marked ☣️ POISON. The SHA-1 hash check fails! The simulator discards the payload, blacklists the malicious node (status: blocked), and auto-requests a clean 🛡️ CLEAN piece from a verified Seeder.',
    bepSpec: 'BEP-0003 Cryptographic SHA-1 Piece Integrity Check'
  },
  widespread_choke: {
    type: 'widespread_choke',
    title: '9. Seeder Leaves / Choke Recovery',
    icon: <RefreshCw className="w-4 h-4 text-cyan-400" />,
    color: 'border-cyan-500/40 bg-cyan-500/10 text-cyan-300',
    badgeColor: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40',
    problem: 'The last active seeder disconnects from the torrent swarm.',
    realBitTorrentResponse: 'BitTorrent is designed for peer-to-peer reciprocity. Even with 0 seeders, leechers holding complementary pieces trade them using the Tit-for-Tat Choking Algorithm and Rarest-First piece selection until all leechers achieve 100% completion.',
    simulatorResponse: 'Leechers coordinate piece exchanges directly amongst themselves. Rarest pieces are prioritized, ensuring swarm progress continues without needing a dedicated seeder.',
    bepSpec: 'BEP-0003 Tit-for-Tat Choking & Rarest-First Piece Exchange'
  },
  jitter: {
    type: 'jitter',
    title: '10. Network Jitter & Packet Out-of-Order Recovery',
    icon: <Zap className="w-4 h-4 text-yellow-400" />,
    color: 'border-yellow-500/40 bg-yellow-500/10 text-yellow-300',
    badgeColor: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40',
    problem: 'Variable latency causes packets to arrive out of chronological sequence.',
    realBitTorrentResponse: 'BitTorrent downloads pieces in non-sequential blocks (sub-pieces of 16KB). The client re-assembles out-of-order blocks in memory buffer blocks prior to verifying the full 1MB piece hash.',
    simulatorResponse: 'Packets move with variable jitter speeds. The memory buffer re-orders blocks dynamically before verifying piece integrity.',
    bepSpec: 'Block Buffer Reassembly & Non-Sequential Piece Processing'
  },
  none: {
    type: 'none',
    title: 'Swarm Operating Normally (No Active Chaos)',
    icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" />,
    color: 'border-emerald-500/30 bg-emerald-500/5 text-slate-300',
    badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
    problem: 'No chaos or artificial failure injected. Network running at nominal capacity.',
    realBitTorrentResponse: 'Standard BitTorrent protocol operations: Tracker announces, optimistic unchoking rounds every 10-30 seconds, rarest-first piece scheduling.',
    simulatorResponse: 'All nodes health at 100%. High throughput P2P transfers active across swarm mesh.',
    bepSpec: 'BEP-0003 Core BitTorrent Protocol'
  }
};

export const FaultToleranceMonitor: React.FC<FaultToleranceMonitorProps> = ({
  stats,
  activeFailure,
  onTriggerChaos,
  onRecover
}) => {
  const [selectedExplanation, setSelectedExplanation] = useState<FailureType>(
    activeFailure !== 'none' ? activeFailure : 'packet_loss_spike'
  );

  const activeExp = CHAOS_EXPLANATIONS[selectedExplanation] || CHAOS_EXPLANATIONS.packet_loss_spike;

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-emerald-500/10 rounded-xl border border-emerald-500/30">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-100 font-mono uppercase tracking-wide flex items-center space-x-2">
              <span>FAULT TOLERANCE & SELF-HEALING MONITOR</span>
              <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-full text-[10px]">
                LIVE AUTO-RECOVERY
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Demonstrating BitTorrent Protocol Resilience & Automatic Self-Healing Mechanisms
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {activeFailure !== 'none' ? (
            <button
              onClick={onRecover}
              className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold font-mono text-xs rounded-xl flex items-center space-x-1.5 shadow-[0_0_15px_rgba(52,211,153,0.3)] transition-all"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>RECOVER ALL CHAOS</span>
            </button>
          ) : (
            <div className="px-3 py-1 bg-slate-800 border border-slate-700 text-slate-400 text-xs font-mono rounded-xl flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Swarm Operating Normally</span>
            </div>
          )}
        </div>
      </div>

      {/* Live Self-Healing Dashboard Counters */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono">
            Live Fault Tolerance Counters & Recovery Metrics
          </span>
          <span className="text-xs font-mono text-cyan-400 flex items-center space-x-1">
            <Sparkles className="w-3 h-3" />
            <span>Resilience Score: {stats.resilienceScore}%</span>
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Recovered Packets */}
          <div className="bg-slate-950/80 border border-emerald-500/30 rounded-xl p-3 relative overflow-hidden">
            <div className="text-[10px] uppercase font-mono text-emerald-400 font-semibold mb-1">
              Recovered Packets
            </div>
            <div className="text-xl font-bold font-mono text-emerald-300 flex items-baseline space-x-1">
              <span>{stats.recoveredPacketsCount}</span>
              <span className="text-[10px] text-slate-500 font-normal">re-sent</span>
            </div>
            <div className="mt-1 text-[10px] text-slate-400 truncate">
              Auto-Retransmitted
            </div>
          </div>

          {/* Retransmissions & Retries */}
          <div className="bg-slate-950/80 border border-cyan-500/30 rounded-xl p-3">
            <div className="text-[10px] uppercase font-mono text-cyan-400 font-semibold mb-1">
              Retransmissions
            </div>
            <div className="text-xl font-bold font-mono text-cyan-300 flex items-baseline space-x-1">
              <span>{stats.retransmissionsCount}</span>
              <span className="text-[10px] text-slate-500 font-normal">timeouts</span>
            </div>
            <div className="mt-1 text-[10px] text-slate-400 truncate">
              Timeout Detection
            </div>
          </div>

          {/* Reconnected Peers */}
          <div className="bg-slate-950/80 border border-purple-500/30 rounded-xl p-3">
            <div className="text-[10px] uppercase font-mono text-purple-400 font-semibold mb-1">
              Reconnected Peers
            </div>
            <div className="text-xl font-bold font-mono text-purple-300 flex items-baseline space-x-1">
              <span>{stats.reconnectedPeersCount}</span>
              <span className="text-[10px] text-slate-500 font-normal">peers</span>
            </div>
            <div className="mt-1 text-[10px] text-slate-400 truncate">
              Swarm Auto-Discovery
            </div>
          </div>

          {/* SHA-1 Hash Failures & Blacklisted */}
          <div className="bg-slate-950/80 border border-rose-500/30 rounded-xl p-3">
            <div className="text-[10px] uppercase font-mono text-rose-400 font-semibold mb-1">
              SHA-1 Hash Rejections
            </div>
            <div className="text-xl font-bold font-mono text-rose-300 flex items-baseline space-x-1">
              <span>{stats.hashFailuresCount}</span>
              <span className="text-[10px] text-slate-500 font-normal">rejected</span>
            </div>
            <div className="mt-1 text-[10px] text-rose-400 font-mono truncate">
              {stats.maliciousPeersBlockedCount} Poison Node Blacklisted
            </div>
          </div>

          {/* Duplicates Discarded */}
          <div className="bg-slate-950/80 border border-amber-500/30 rounded-xl p-3">
            <div className="text-[10px] uppercase font-mono text-amber-400 font-semibold mb-1">
              Duplicates Removed
            </div>
            <div className="text-xl font-bold font-mono text-amber-300 flex items-baseline space-x-1">
              <span>{stats.duplicatesDiscardedCount}</span>
              <span className="text-[10px] text-slate-500 font-normal">({stats.duplicatesDiscardedCount} MB)</span>
            </div>
            <div className="mt-1 text-[10px] text-slate-400 truncate">
              Bandwidth Preserved
            </div>
          </div>

          {/* DHT Fallbacks */}
          <div className="bg-slate-950/80 border border-fuchsia-500/30 rounded-xl p-3">
            <div className="text-[10px] uppercase font-mono text-fuchsia-400 font-semibold mb-1">
              DHT Fallbacks
            </div>
            <div className="text-xl font-bold font-mono text-fuchsia-300 flex items-baseline space-x-1">
              <span>{stats.dhtFallbacksCount}</span>
              <span className="text-[10px] text-slate-500 font-normal">queries</span>
            </div>
            <div className="mt-1 text-[10px] text-slate-400 truncate">
              BEP-0005 Trackerless
            </div>
          </div>
        </div>
      </div>

      {/* Live Self-Healing Action Ticker */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex items-center space-x-3 font-mono text-xs">
        <div className="px-2 py-1 bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 rounded-lg text-[10px] font-bold uppercase shrink-0">
          STATUS TICKER
        </div>
        <div className="text-slate-300 truncate">
          {stats.lastSelfHealingAction}
        </div>
      </div>

      {/* Educational Explanation Panel Section */}
      <div className="border border-slate-800 bg-slate-950/60 rounded-xl p-4 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <BookOpen className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
              EDUCATIONAL MODE: HOW BITTORRENT HANDLES THIS CHAOS
            </h3>
          </div>

          {/* Quick Select Buttons for 10 Chaos Scenarios */}
          <div className="flex flex-wrap gap-1">
            {Object.keys(CHAOS_EXPLANATIONS).filter(k => k !== 'none').map((key) => {
              const fKey = key as FailureType;
              const isSelected = selectedExplanation === fKey;
              return (
                <button
                  key={fKey}
                  onClick={() => setSelectedExplanation(fKey)}
                  className={`px-2 py-1 rounded-md text-[10px] font-mono transition-all border ${
                    isSelected
                      ? 'bg-cyan-500 text-slate-950 font-bold border-cyan-300 shadow-sm'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  {fKey.replace('_', ' ').toUpperCase()}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Explanation Card */}
        <div className={`p-4 rounded-xl border ${activeExp.color} transition-all space-y-3`}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 bg-slate-950/80 rounded-lg">
                {activeExp.icon}
              </div>
              <h4 className="text-sm font-bold text-white font-mono">
                {activeExp.title}
              </h4>
            </div>

            <div className="flex items-center space-x-2">
              {activeExp.bepSpec && (
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono border font-semibold ${activeExp.badgeColor}`}>
                  {activeExp.bepSpec}
                </span>
              )}

              {activeFailure !== activeExp.type && (
                <button
                  onClick={() => onTriggerChaos(activeExp.type)}
                  className="px-2.5 py-1 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 rounded-lg text-xs font-mono font-semibold flex items-center space-x-1 transition-all"
                >
                  <span>Inject This Chaos</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 text-xs font-sans">
            {/* Problem */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3">
              <div className="text-[10px] font-mono font-bold text-rose-400 uppercase tracking-wider mb-1 flex items-center space-x-1">
                <AlertTriangle className="w-3 h-3" />
                <span>Problem (Chaos Event)</span>
              </div>
              <p className="text-slate-300 leading-relaxed">
                {activeExp.problem}
              </p>
            </div>

            {/* Real BitTorrent Response */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3">
              <div className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-wider mb-1 flex items-center space-x-1">
                <Globe className="w-3 h-3" />
                <span>Real BitTorrent Protocol Mechanism</span>
              </div>
              <p className="text-slate-300 leading-relaxed">
                {activeExp.realBitTorrentResponse}
              </p>
            </div>

            {/* Simulator Response */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3">
              <div className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wider mb-1 flex items-center space-x-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>Simulator Self-Healing Action</span>
              </div>
              <p className="text-slate-300 leading-relaxed">
                {activeExp.simulatorResponse}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
