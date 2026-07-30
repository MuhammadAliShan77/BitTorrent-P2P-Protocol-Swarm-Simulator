import { 
  PeerNode, 
  DataPacket, 
  EventLog, 
  MetricsHistoryEntry, 
  SimulationConfig, 
  PacketType, 
  EventLevel,
  FaultToleranceStats
} from '../types/p2p';
import { 
  TOTAL_PIECES, 
  COUNTRIES, 
  CLIENT_VERSIONS, 
  NAT_TYPES, 
  getRandomIp 
} from './p2pDefaults';

export interface EngineResult {
  nextPeers: PeerNode[];
  nextPackets: DataPacket[];
  nextLogs: EventLog[];
  nextMetrics: MetricsHistoryEntry[];
  nextFaultStats: FaultToleranceStats;
  newDeliveredCount: number;
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function getRarestPieces(peers: PeerNode[]): { pieceIndex: number; rarity: number }[] {
  const counts = Array(TOTAL_PIECES).fill(0);
  
  peers.forEach(p => {
    if (p.status !== 'disconnected' && p.status !== 'blocked') {
      p.pieces.forEach((has, idx) => {
        if (has) counts[idx]++;
      });
    }
  });

  return counts.map((count, index) => ({ pieceIndex: index, rarity: count }))
               .sort((a, b) => a.rarity - b.rarity);
}

export function generateEventLog(
  level: EventLevel, 
  source: string, 
  message: string, 
  target?: string, 
  details?: string
): EventLog {
  const now = new Date();
  const timestamp = now.toTimeString().split(' ')[0] + '.' + String(now.getMilliseconds()).padStart(3, '0');
  return {
    id: 'log-' + Math.random().toString(36).substring(2, 9),
    timestamp,
    rawTime: Date.now(),
    level,
    source,
    target,
    message,
    details,
  };
}

let peerCounter = 5;

export function createNewRandomPeer(type: 'leecher' | 'seeder' = 'leecher'): PeerNode {
  peerCounter++;
  const id = `peer-${String(peerCounter).padStart(2, '0')}`;
  const countryObj = COUNTRIES[Math.floor(Math.random() * COUNTRIES.length)];
  const isSeeder = type === 'seeder';
  const emptyPieces = Array(TOTAL_PIECES).fill(false);
  const fullPieces = Array(TOTAL_PIECES).fill(true);

  let initialPieces = emptyPieces;
  let progress = 0;

  if (isSeeder) {
    initialPieces = fullPieces;
    progress = 100;
  } else {
    // Random initial partial pieces
    const initialCount = Math.floor(Math.random() * 25);
    initialPieces = [...emptyPieces];
    for (let i = 0; i < initialCount; i++) {
      const idx = Math.floor(Math.random() * TOTAL_PIECES);
      initialPieces[idx] = true;
    }
    progress = Math.round((initialCount / TOTAL_PIECES) * 100);
  }

  return {
    id,
    name: `${id.toUpperCase()} (${countryObj.code})`,
    ip: getRandomIp(),
    country: countryObj.name,
    countryCode: countryObj.code,
    flag: countryObj.flag,
    lat: countryObj.lat + (Math.random() - 0.5) * 4,
    lng: countryObj.lng + (Math.random() - 0.5) * 4,
    type: isSeeder ? 'seeder' : 'leecher',
    status: 'active',
    progress,
    pieces: initialPieces,
    downloadRate: isSeeder ? 0 : Math.floor(Math.random() * 2500) + 500,
    uploadRate: isSeeder ? Math.floor(Math.random() * 4000) + 2000 : Math.floor(Math.random() * 1200) + 200,
    latency: Math.floor(Math.random() * 80) + 15,
    packetLoss: parseFloat((Math.random() * 1.5).toFixed(1)),
    connectedPeers: ['tracker-01'],
    x: 100 + Math.random() * 700,
    y: 100 + Math.random() * 400,
    natType: NAT_TYPES[Math.floor(Math.random() * NAT_TYPES.length)],
    optimisticUnchoke: Math.random() > 0.7,
    health: Math.floor(Math.random() * 20) + 80,
    downloadedBytes: Math.floor((progress / 100) * 104857600),
    uploadedBytes: Math.floor(Math.random() * 20000000),
    clientVersion: CLIENT_VERSIONS[Math.floor(Math.random() * CLIENT_VERSIONS.length)],
    currentRequests: [],
    uploadQueue: [],
  };
}

export function runSimulationTick(
  peers: PeerNode[],
  packets: DataPacket[],
  logs: EventLog[],
  metricsHistory: MetricsHistoryEntry[],
  config: SimulationConfig,
  tickCount: number,
  prevFaultStats?: FaultToleranceStats
): EngineResult {
  const newLogs: EventLog[] = [];
  let newDeliveredCount = 0;

  // Initialize fault stats object
  const faultStats: FaultToleranceStats = prevFaultStats ? { ...prevFaultStats } : {
    retransmissionsCount: 14,
    recoveredPacketsCount: 12,
    failedNodesCount: 2,
    reconnectedPeersCount: 8,
    activeRetriesCount: 1,
    hashFailuresCount: 3,
    duplicatesDiscardedCount: 5,
    maliciousPeersBlockedCount: 1,
    dhtFallbacksCount: 4,
    avgRecoveryTimeMs: 240,
    resilienceScore: 96,
    lastSelfHealingAction: 'Swarm Monitor Active - All Self-Healing Subsystems Operational'
  };

  // Clone peers for manipulation
  let updatedPeers: PeerNode[] = peers.map(p => {
    let x = p.x;
    let y = p.y;
    if (p.targetX !== undefined && p.targetY !== undefined) {
      x += (p.targetX - p.x) * 0.15;
      y += (p.targetY - p.y) * 0.15;
    }

    let latency = p.latency;
    let packetLoss = p.packetLoss;
    let status = p.status;
    let health = p.health;

    if (config.activeFailure === 'high_latency') {
      latency = Math.min(850, p.latency + 400);
    } else if (config.activeFailure === 'packet_loss_spike') {
      packetLoss = Math.min(45, p.packetLoss + 30);
    } else if (config.activeFailure === 'tracker_down' && p.type === 'tracker') {
      status = 'disconnected';
      health = 0;
    } else if (config.activeFailure === 'widespread_choke' && p.type === 'leecher') {
      status = 'choked';
    } else if (config.activeFailure === 'node_failure' && (p.id.includes('leecher-03') || p.id.includes('slow-01') || p.id.includes('leecher-01'))) {
      status = 'disconnected';
      health = 0;
    } else if (config.activeFailure === 'peer_disconnect' && p.type !== 'tracker') {
      status = 'disconnected';
    } else if (config.activeFailure === 'none' && (p.status === 'disconnected' || p.status === 'choked') && p.type !== 'tracker') {
      status = 'active';
      health = 90;
    }

    return {
      ...p,
      x,
      y,
      latency,
      packetLoss,
      status,
      health,
      pieces: [...p.pieces],
      connectedPeers: config.activeFailure === 'peer_disconnect' ? [] : [...p.connectedPeers],
      currentRequests: [...p.currentRequests],
      uploadQueue: [...p.uploadQueue],
    };
  });

  // 1. Automatic Recovery & Self-Healing Triggers for Active Chaos
  if (config.activeFailure === 'tracker_down') {
    // TRACKER DOWN -> Kademlia DHT Fallback (BEP-0005)
    if (tickCount % 3 === 0) {
      faultStats.dhtFallbacksCount++;
      faultStats.lastSelfHealingAction = 'Tracker Down → Kademlia DHT (BEP-0005) Active Peer Discovery';
      
      const bootstrapNodes = updatedPeers.filter(p => p.type === 'bootstrap' || p.id.includes('seeder'));
      const activeLeechers = updatedPeers.filter(p => p.type === 'leecher' && p.status === 'active');

      if (bootstrapNodes.length > 0 && activeLeechers.length > 0) {
        const leecher = activeLeechers[Math.floor(Math.random() * activeLeechers.length)];
        const bNode = bootstrapNodes[Math.floor(Math.random() * bootstrapNodes.length)];
        
        newLogs.push(generateEventLog(
          'warning',
          'DHT-ENGINE',
          `[TRACKER UNREACHABLE] Tracker down → Switching to Kademlia DHT (BEP-0005) routing table.`,
          bNode.id,
          `Querying bootstrap node ${bNode.id} for torrent info-hash peer list`
        ));

        packets.push({
          id: `dht-${Math.random().toString(36).substring(2, 8)}`,
          sourceId: leecher.id,
          targetId: bNode.id,
          type: 'dht_find_node',
          progress: 0,
          speed: 0.12,
          sizeBytes: 256,
          status: 'in_flight',
          route: [leecher.id, bNode.id],
          timestamp: Date.now(),
          label: '⚡ DHT FIND_NODE',
          isDhtFallback: true,
        });
      }
    }
  } else if (config.activeFailure === 'peer_disconnect') {
    // SEVER LINKS -> Swarm Auto-Discovery & Re-connection
    if (tickCount % 2 === 0) {
      const offlinePeers = updatedPeers.filter(p => p.status === 'disconnected' && p.type !== 'tracker');
      if (offlinePeers.length > 0) {
        const recoveredPeer = offlinePeers[Math.floor(Math.random() * offlinePeers.length)];
        recoveredPeer.status = 'active';
        recoveredPeer.health = 85;
        
        // Reconnect to active seeders
        const seeders = updatedPeers.filter(p => p.type === 'seeder');
        seeders.forEach(s => {
          if (!s.connectedPeers.includes(recoveredPeer.id)) s.connectedPeers.push(recoveredPeer.id);
          if (!recoveredPeer.connectedPeers.includes(s.id)) recoveredPeer.connectedPeers.push(s.id);
        });

        faultStats.reconnectedPeersCount++;
        faultStats.lastSelfHealingAction = `Peer Sever → Swarm Auto-Discovery Re-connected ${recoveredPeer.id}`;

        newLogs.push(generateEventLog(
          'success',
          recoveredPeer.id,
          `[AUTO-RECOVERY] Re-established P2P socket with ${recoveredPeer.id}. Swarm links restored!`,
          'seeder-01',
          `Automatic P2P reconnect loop executed. Download resumed.`
        ));
      }
    }
  } else if (config.activeFailure === 'node_failure') {
    // NODE FAILURE -> Traffic Redistribution to Healthy Seeders
    if (tickCount % 4 === 0) {
      faultStats.failedNodesCount++;
      faultStats.lastSelfHealingAction = 'Node Failure → Traffic & Requests Shifted to Healthy Seeders';

      newLogs.push(generateEventLog(
        'warning',
        'SWARM-HEAL',
        `[NODE FAILURE DETECTED] Failed peer traffic re-routed to surviving active seeders.`,
        undefined,
        `BitTorrent upload pipeline load balanced across healthy nodes.`
      ));
    }
  } else if (config.activeFailure === 'network_partition') {
    // PARTITION -> Relay Bridge Connection
    if (tickCount % 5 === 0) {
      faultStats.reconnectedPeersCount++;
      faultStats.lastSelfHealingAction = 'Partition Wall → Relay Bridge established across WEST/EAST split';

      newLogs.push(generateEventLog(
        'info',
        'RELAY-BRIDGE',
        `[RELAY BRIDGE OK] Established NAT Relay Bridge across network partition. Syncing missing pieces...`,
        undefined,
        `UPnP / STUN Relay channel opened for cross-partition data sync.`
      ));
    }
  } else if (config.activeFailure === 'high_latency') {
    // HIGH LATENCY -> Pipeline Request Throttling to Fast Seeders
    if (tickCount % 3 === 0) {
      faultStats.lastSelfHealingAction = 'Ping Spike → Throttled Slow Peers & Shifted Pipeline to Fast Seeders';

      newLogs.push(generateEventLog(
        'info',
        'PIPELINE-ENGINE',
        `[HIGH RTT THROTTLE] Throttling slow peers (>800ms) → Shifting request pipeline to fast seeders.`,
        undefined,
        `Dynamic window adjustment optimized for high-bandwidth peers.`
      ));
    }
  }

  // 2. BitTorrent Choking / Unchoking Mechanism (Every 20 ticks / ~10 seconds)
  if (tickCount % 20 === 0 && config.activeFailure !== 'widespread_choke' && config.activeFailure !== 'peer_disconnect') {
    updatedPeers = updatedPeers.map(peer => {
      if (peer.type === 'seeder' || peer.type === 'leecher') {
        const isOptimistic = Math.random() < 0.25;
        const nextStatus = isOptimistic ? 'active' : (peer.type === 'seeder' ? 'active' : (Math.random() > 0.15 ? 'active' : 'choked'));
        return {
          ...peer,
          status: nextStatus,
          optimisticUnchoke: isOptimistic,
        };
      }
      return peer;
    });

    if (Math.random() < 0.5) {
      const activeSeeders = updatedPeers.filter(p => p.type === 'seeder');
      if (activeSeeders.length > 0) {
        const randomSeeder = activeSeeders[Math.floor(Math.random() * activeSeeders.length)];
        newLogs.push(generateEventLog(
          'choke', 
          randomSeeder.id, 
          `Optimistic Unchoke slot allocated to peer. Evaluated top 4 uploaders.`,
          undefined,
          `BitTorrent Tit-for-Tat Choking Algorithm round executed`
        ));
      }
    }
  }

  // 3. Process Flying Data Packets with Self-Healing Actions
  const activePackets: DataPacket[] = [];
  let packetSpeedBase = 0.08 * (config.speedMultiplier || 1) * (config.packetSpeedFactor || 1);

  if (config.activeFailure === 'high_latency') {
    packetSpeedBase *= 0.3; // Slower packets for latency spike
  }

  packets.forEach(packet => {
    let speed = packetSpeedBase;
    if (config.activeFailure === 'jitter') {
      speed *= (0.3 + Math.random() * 1.5); // Variable jitter speed
    }

    let nextProgress = packet.progress + speed;

    const sourcePeer = updatedPeers.find(p => p.id === packet.sourceId);
    const targetPeer = updatedPeers.find(p => p.id === packet.targetId);

    // Chaos check: Network Partition boundary
    let isPartitionBlocked = false;
    if (config.activeFailure === 'network_partition' && sourcePeer && targetPeer) {
      const sourceSide = sourcePeer.x < 480 ? 'WEST' : 'EAST';
      const targetSide = targetPeer.x < 480 ? 'WEST' : 'EAST';
      if (sourceSide !== targetSide && Math.random() < 0.7) {
        isPartitionBlocked = true;
      }
    }

    // Chaos check: Packet loss drop probability
    const isDropped = isPartitionBlocked || (config.activeFailure === 'packet_loss_spike' && Math.random() < 0.35);

    if (isDropped && packet.status !== 'dropped') {
      // PACKET LOSS -> Auto-Timeout & Retransmission to Alternate Peer
      faultStats.retransmissionsCount++;
      faultStats.activeRetriesCount++;

      newLogs.push(generateEventLog(
        'error', 
        packet.sourceId, 
        isPartitionBlocked 
          ? `[PARTITION WALL] Packet blocked across split boundary (WEST/EAST network split)`
          : `[PACKET LOSS] Piece #${packet.pieceIndex ?? 0} request to ${packet.targetId} DROPPED mid-transit!`, 
        packet.targetId,
        isPartitionBlocked ? 'Network partition firewall active' : 'Request dropped. Triggering automatic timeout detection...'
      ));

      // AUTO RECOVERY: Dispatch Retry Request to an Alternate Peer
      if (targetPeer && packet.pieceIndex !== undefined) {
        const alternateSeeders = updatedPeers.filter(p => p.id !== packet.sourceId && p.type === 'seeder' && p.status === 'active');
        if (alternateSeeders.length > 0) {
          const altSeeder = alternateSeeders[Math.floor(Math.random() * alternateSeeders.length)];
          
          faultStats.recoveredPacketsCount++;
          faultStats.lastSelfHealingAction = `Packet Loss → Timeout Detected → Retransmitted Piece #${packet.pieceIndex} via ${altSeeder.id}`;

          newLogs.push(generateEventLog(
            'info',
            'TIMEOUT-ENGINE',
            `[TIMEOUT DETECTED] Retransmission timeout (240ms) → Re-requesting Piece #${packet.pieceIndex} from ${altSeeder.id}`,
            targetPeer.id,
            `Automatic retry dispatched to alternate seeder. Download preserved.`
          ));

          activePackets.push({
            id: `retry-${packet.id}`,
            sourceId: altSeeder.id,
            targetId: targetPeer.id,
            pieceIndex: packet.pieceIndex,
            type: 'piece',
            progress: 0.1,
            speed: 0.08,
            sizeBytes: 1048576,
            status: 'in_flight',
            route: [altSeeder.id, targetPeer.id],
            timestamp: Date.now(),
            label: `🔄 RETRY #${packet.pieceIndex}`,
            isRetry: true,
          });
        }
      }

      activePackets.push({
        ...packet,
        status: 'dropped',
        label: isPartitionBlocked ? '🛑 WALL' : '❌ DROPPED',
        progress: Math.min(0.8, packet.progress + 0.1),
      });
      return;
    }

    if (packet.status === 'dropped') {
      if (nextProgress < 0.9) {
        activePackets.push({ ...packet, progress: nextProgress });
      }
      return;
    }

    if (nextProgress >= 1.0) {
      // Packet delivered!
      if (targetPeer && packet.pieceIndex !== undefined) {
        
        // CORRUPTED / POISON ATTACK RECOVERY
        if (packet.isCorrupted || config.activeFailure === 'corrupted_packets') {
          faultStats.hashFailuresCount++;
          faultStats.maliciousPeersBlockedCount++;
          faultStats.lastSelfHealingAction = `SHA-1 Hash Failure → Rejected Corrupted Piece #${packet.pieceIndex} & Blacklisted Peer`;

          if (sourcePeer) {
            sourcePeer.status = 'blocked';
            sourcePeer.health = 0;
          }

          newLogs.push(generateEventLog(
            'error',
            packet.sourceId,
            `☣️ [SHA-1 CORRUPTION] Piece #${packet.pieceIndex} failed cryptographic checksum! Discarding poisoned payload from ${packet.sourceId}.`,
            targetPeer.id,
            `Malicious peer ${packet.sourceId} blacklisted. Dispatching clean re-request to trusted Seeder.`
          ));

          // AUTO RECOVERY: Request clean piece from trusted seeder
          const trustedSeeders = updatedPeers.filter(p => p.type === 'seeder' && p.status === 'active');
          if (trustedSeeders.length > 0) {
            const trustedSeeder = trustedSeeders[0];
            activePackets.push({
              id: `clean-${packet.id}`,
              sourceId: trustedSeeder.id,
              targetId: targetPeer.id,
              pieceIndex: packet.pieceIndex,
              type: 'piece',
              progress: 0,
              speed: 0.08,
              sizeBytes: 1048576,
              status: 'in_flight',
              route: [trustedSeeder.id, targetPeer.id],
              timestamp: Date.now(),
              label: `🛡️ CLEAN #${packet.pieceIndex}`,
              isRetry: true,
            });
          }
          return; // Reject corrupted payload
        }

        // DUPLICATE PACKET RECOVERY
        if (packet.isDuplicate || (targetPeer.pieces[packet.pieceIndex] && packet.type === 'duplicate')) {
          faultStats.duplicatesDiscardedCount++;
          faultStats.lastSelfHealingAction = `Duplicate Packet → Bitfield Filter Discarded Piece #${packet.pieceIndex} (1MB Bandwidth Saved)`;

          newLogs.push(generateEventLog(
            'warning',
            packet.sourceId,
            `♊ [DUPLICATE DETECTED] Piece #${packet.pieceIndex} already owned by ${targetPeer.id}. Discarding duplicate payload.`,
            targetPeer.id,
            `Bitfield check match: Piece already verified. 1MB duplicate transmission discarded.`
          ));
          return;
        }

        if (!targetPeer.pieces[packet.pieceIndex] && packet.type === 'piece') {
          targetPeer.pieces[packet.pieceIndex] = true;
          newDeliveredCount++;

          const count = targetPeer.pieces.filter(Boolean).length;
          const newProgress = Math.round((count / TOTAL_PIECES) * 100);
          targetPeer.progress = newProgress;
          targetPeer.downloadedBytes += 1048576; // 1 MB per piece

          if (sourcePeer) {
            sourcePeer.uploadedBytes += 1048576;
          }

          if (packet.isRetry) {
            faultStats.activeRetriesCount = Math.max(0, faultStats.activeRetriesCount - 1);
            faultStats.lastSelfHealingAction = `Piece #${packet.pieceIndex} Retransmission Succeeded! Download restored.`;
          }

          if (newProgress === 100 && targetPeer.type === 'leecher') {
            targetPeer.type = 'seeder';
            targetPeer.status = 'active';
            targetPeer.downloadRate = 0;
            targetPeer.uploadRate = Math.floor(Math.random() * 3000) + 2000;
            
            newLogs.push(generateEventLog(
              'success',
              targetPeer.id,
              `🎉 PROMOTED TO SEEDER! ${targetPeer.name} completed 100% of torrent payload!`,
              undefined,
              `BitTorrent Swarm expansion: 100/100 pieces verified SHA-1 checksum`
            ));
          } else {
            newLogs.push(generateEventLog(
              'info',
              packet.sourceId,
              `Transferred Piece #${packet.pieceIndex} (1MB) to ${targetPeer.id} [${newProgress}% complete]`,
              targetPeer.id,
              `SHA-1 hash match verified. Strategy: ${config.pieceStrategy.toUpperCase()}`
            ));
          }
        }
      } else if (packet.type === 'tracker_announce') {
        newLogs.push(generateEventLog(
          'tracker',
          packet.sourceId,
          `Tracker Announce OK: Received list of ${updatedPeers.length - 1} active swarm peers`,
          packet.targetId
        ));
      } else if (packet.type === 'handshake') {
        newLogs.push(generateEventLog(
          'info',
          packet.sourceId,
          `Peer Handshake ESTABLISHED with ${packet.targetId}`,
          packet.targetId,
          `BitTorrent protocol extension handshake completed`
        ));
      } else if (packet.type === 'dht_find_node') {
        newLogs.push(generateEventLog(
          'info',
          packet.sourceId,
          `DHT FIND_NODE Response: Received 4 DHT routing table peer nodes`,
          packet.targetId,
          `BEP-0005 Kademlia DHT node discovery completed`
        ));
      }
    } else {
      activePackets.push({
        ...packet,
        progress: nextProgress,
      });
    }
  });

  // 4. Piece Propagation Request Generation
  const rarestList = getRarestPieces(updatedPeers);

  if (config.activeFailure !== 'peer_disconnect' && config.activeFailure !== 'widespread_choke') {
    updatedPeers.forEach(leecher => {
      if (leecher.type === 'leecher' && leecher.status === 'active' && leecher.progress < 100) {
        const inFlightForLeecher = activePackets.filter(p => p.targetId === leecher.id).length;
        
        if (inFlightForLeecher < 3) {
          const suppliers = updatedPeers.filter(p => 
            p.id !== leecher.id && 
            p.status === 'active' && 
            (p.type === 'seeder' || p.type === 'leecher') &&
            p.uploadRate > 0
          );

          if (suppliers.length > 0) {
            const supplier = suppliers[Math.floor(Math.random() * suppliers.length)];

            const candidatePieces: number[] = [];
            for (let i = 0; i < TOTAL_PIECES; i++) {
              if (supplier.pieces[i] && !leecher.pieces[i]) {
                candidatePieces.push(i);
              }
            }

            if (candidatePieces.length > 0) {
              let selectedPiece = candidatePieces[0];

              if (config.pieceStrategy === 'rarest_first') {
                for (const rItem of rarestList) {
                  if (candidatePieces.includes(rItem.pieceIndex)) {
                    selectedPiece = rItem.pieceIndex;
                    break;
                  }
                }
              } else if (config.pieceStrategy === 'random') {
                selectedPiece = candidatePieces[Math.floor(Math.random() * candidatePieces.length)];
              } else {
                // Sequential
                selectedPiece = Math.min(...candidatePieces);
              }

              const isCorrupted = config.activeFailure === 'corrupted_packets';
              const packetId = `pkt-${Math.random().toString(36).substring(2, 9)}`;
              
              let label = `Piece #${selectedPiece}`;
              if (isCorrupted) label = `☣️ POISON #${selectedPiece}`;
              else if (config.activeFailure === 'high_latency') label = `⏳ LATENCY #${selectedPiece}`;
              else if (config.activeFailure === 'jitter') label = `⚡ JITTER #${selectedPiece}`;

              activePackets.push({
                id: packetId,
                sourceId: supplier.id,
                targetId: leecher.id,
                pieceIndex: selectedPiece,
                type: isCorrupted ? 'corrupted' : 'piece',
                progress: 0,
                speed: 0.05,
                sizeBytes: 1048576,
                status: 'in_flight',
                route: [supplier.id, leecher.id],
                timestamp: Date.now(),
                label,
                isCorrupted,
                isJitter: config.activeFailure === 'jitter',
              });

              if (config.activeFailure === 'duplicate_packets') {
                activePackets.push({
                  id: `dup-${packetId}`,
                  sourceId: supplier.id,
                  targetId: leecher.id,
                  pieceIndex: selectedPiece,
                  type: 'duplicate',
                  progress: 0.05,
                  speed: 0.05,
                  sizeBytes: 1048576,
                  status: 'in_flight',
                  route: [supplier.id, leecher.id],
                  timestamp: Date.now(),
                  label: `♊ DUP #${selectedPiece}`,
                  isDuplicate: true,
                });
              }

              if (!supplier.connectedPeers.includes(leecher.id)) {
                supplier.connectedPeers.push(leecher.id);
              }
              if (!leecher.connectedPeers.includes(supplier.id)) {
                leecher.connectedPeers.push(supplier.id);
              }
            }
          }
        }
      }
    });
  }

  // 5. Random Swarm Dynamics (Peers joining / leaving / tracker updates)
  if (tickCount % 15 === 0 && updatedPeers.length < 24 && Math.random() < 0.7) {
    const newPeer = createNewRandomPeer(Math.random() < 0.2 ? 'seeder' : 'leecher');
    updatedPeers.push(newPeer);

    newLogs.push(generateEventLog(
      'tracker',
      newPeer.id,
      `New swarm peer ${newPeer.name} connected to Tracker (${newPeer.ip})`,
      'tracker-01',
      `Country: ${newPeer.flag} ${newPeer.country} | Client: ${newPeer.clientVersion}`
    ));

    activePackets.push({
      id: `announce-${Math.random().toString(36).substring(2, 7)}`,
      sourceId: newPeer.id,
      targetId: 'tracker-01',
      type: 'tracker_announce',
      progress: 0,
      speed: 0.1,
      sizeBytes: 512,
      status: 'in_flight',
      route: [newPeer.id, 'tracker-01'],
      timestamp: Date.now(),
      label: 'Announce (Started)',
    });
  }

  // 6. Compute Aggregate Metrics & Swarm Resilience Score
  const seedersCount = updatedPeers.filter(p => p.type === 'seeder' && p.status !== 'disconnected').length;
  const leechersCount = updatedPeers.filter(p => p.type === 'leecher' && p.status !== 'disconnected').length;
  const offlineCount = updatedPeers.filter(p => p.status === 'disconnected' || p.type === 'offline').length;

  const totalDlKB = updatedPeers.reduce((acc, p) => acc + (p.status === 'active' ? p.downloadRate : 0), 0);
  const totalUlKB = updatedPeers.reduce((acc, p) => acc + (p.status === 'active' ? p.uploadRate : 0), 0);

  const downloadSpeedMB = parseFloat((totalDlKB / 1024).toFixed(2));
  const uploadSpeedMB = parseFloat((totalUlKB / 1024).toFixed(2));

  const totalConnections = updatedPeers.reduce((acc, p) => acc + p.connectedPeers.length, 0);
  const activePeers = updatedPeers.filter(p => p.status === 'active');
  const avgLatency = activePeers.length > 0 
    ? Math.round(activePeers.reduce((acc, p) => acc + p.latency, 0) / activePeers.length)
    : 0;

  const avgPacketLoss = activePeers.length > 0
    ? activePeers.reduce((acc, p) => acc + p.packetLoss, 0) / activePeers.length
    : 0;

  // Network Health calculation (0 to 100)
  let rawHealth = 100;
  if (updatedPeers.length > 0) {
    const seederRatio = seedersCount / Math.max(1, updatedPeers.length);
    rawHealth = Math.min(100, Math.max(10, Math.round(seederRatio * 60 + 40 - (avgLatency / 10) - (avgPacketLoss * 3))));
  }

  // Calculate Swarm Resilience Score
  const resilienceScore = Math.min(100, Math.max(20, Math.round(
    100 - (config.activeFailure !== 'none' ? 12 : 0) + (faultStats.recoveredPacketsCount * 0.5) + (faultStats.reconnectedPeersCount * 0.8)
  )));
  faultStats.resilienceScore = resilienceScore;

  const completedPiecesSum = updatedPeers.reduce((acc, p) => acc + p.pieces.filter(Boolean).length, 0);

  const timeNow = new Date();
  const timeLabel = `${timeNow.getMinutes()}:${String(timeNow.getSeconds()).padStart(2, '0')}`;

  const currentMetric: MetricsHistoryEntry = {
    timestamp: Date.now(),
    timeLabel,
    seeders: seedersCount,
    leechers: leechersCount,
    offline: offlineCount,
    downloadSpeedMB,
    uploadSpeedMB,
    totalConnections,
    avgLatency,
    networkHealth: rawHealth,
    completedPieces: completedPiecesSum,
    packetsPerSec: activePackets.length * 2,
  };

  const nextMetrics = [...metricsHistory.slice(-29), currentMetric];
  const nextLogs = [...newLogs, ...logs].slice(0, 100);

  return {
    nextPeers: updatedPeers,
    nextPackets: activePackets,
    nextLogs,
    nextMetrics,
    nextFaultStats: faultStats,
    newDeliveredCount,
  };
}
