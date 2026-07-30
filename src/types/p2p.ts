export type NodeType = 'tracker' | 'bootstrap' | 'seeder' | 'leecher' | 'offline' | 'slow' | 'malicious';

export type NodeStatus = 'active' | 'choked' | 'choking' | 'connecting' | 'disconnected' | 'blocked';

export type NATType = 'UPnP' | 'PortForwarded' | 'SymmetricNAT' | 'Relayed';

export interface PeerNode {
  id: string;
  name: string;
  ip: string;
  country: string;
  countryCode: string;
  flag: string;
  lat: number;
  lng: number;
  type: NodeType;
  status: NodeStatus;
  progress: number; // 0 to 100
  pieces: boolean[]; // Array of 100 booleans
  downloadRate: number; // KB/s
  uploadRate: number; // KB/s
  latency: number; // ms
  packetLoss: number; // %
  connectedPeers: string[]; // List of peer IDs
  x: number; // SVG / layout coordinate
  y: number; // SVG / layout coordinate
  targetX?: number;
  targetY?: number;
  natType: NATType;
  optimisticUnchoke: boolean;
  health: number; // 0 to 100
  downloadedBytes: number;
  uploadedBytes: number;
  chokedUntil?: number;
  currentRequests: number[];
  uploadQueue: string[];
  clientVersion: string;
}

export type PacketType = 
  | 'piece' 
  | 'request' 
  | 'have' 
  | 'bitfield' 
  | 'handshake' 
  | 'tracker_announce' 
  | 'keep_alive' 
  | 'choke' 
  | 'unchoke' 
  | 'dht_find_node'
  | 'corrupted'
  | 'duplicate';

export interface DataPacket {
  id: string;
  sourceId: string;
  targetId: string;
  pieceIndex?: number;
  type: PacketType;
  progress: number; // 0 to 1 along curve
  speed: number; // Increment per tick
  sizeBytes: number;
  status: 'in_flight' | 'delivered' | 'dropped' | 'corrupted';
  route: string[];
  timestamp: number;
  label: string;
  isCorrupted?: boolean;
  isDuplicate?: boolean;
  isJitter?: boolean;
  isRetry?: boolean;
  isDhtFallback?: boolean;
  dropReason?: string;
}

export interface FaultToleranceStats {
  retransmissionsCount: number;
  recoveredPacketsCount: number;
  failedNodesCount: number;
  reconnectedPeersCount: number;
  activeRetriesCount: number;
  hashFailuresCount: number;
  duplicatesDiscardedCount: number;
  maliciousPeersBlockedCount: number;
  dhtFallbacksCount: number;
  avgRecoveryTimeMs: number;
  resilienceScore: number;
  lastSelfHealingAction: string;
}

export type TopologyType = 'mesh' | 'star' | 'hybrid' | 'random' | 'ring' | 'tree';

export type EventLevel = 'info' | 'success' | 'warning' | 'error' | 'tracker' | 'choke';

export interface EventLog {
  id: string;
  timestamp: string;
  rawTime: number;
  level: EventLevel;
  source: string;
  target?: string;
  message: string;
  details?: string;
}

export type PieceStrategy = 'rarest_first' | 'random' | 'sequential';

export type FailureType = 
  | 'none' 
  | 'packet_loss_spike' 
  | 'high_latency' 
  | 'jitter'
  | 'node_failure'
  | 'peer_disconnect'
  | 'network_partition'
  | 'duplicate_packets'
  | 'corrupted_packets'
  | 'tracker_down' 
  | 'widespread_choke';

export interface SimulationConfig {
  isRunning: boolean;
  tickRateMs: number; // E.g., 500ms
  speedMultiplier: number; // 0.5, 1, 2, 5
  connectionSpeedFactor: number; // 1 to 10
  packetSpeedFactor: number; // 1 to 10
  pieceStrategy: PieceStrategy;
  topology: TopologyType;
  activeFailure: FailureType;
  chokingIntervalSec: number; // Default 10s
  optimisticUnchokeIntervalSec: number; // Default 30s
  autoDemoMode: boolean;
}

export interface MetricsHistoryEntry {
  timestamp: number;
  timeLabel: string;
  seeders: number;
  leechers: number;
  offline: number;
  downloadSpeedMB: number;
  uploadSpeedMB: number;
  totalConnections: number;
  avgLatency: number;
  networkHealth: number;
  completedPieces: number;
  packetsPerSec: number;
}

export type ViewMode = 'topology' | 'world_map' | 'dht' | 'analytics' | 'pieces_matrix' | 'guide';

export interface DHTNode {
  id: string; // 160-bit hex representation string
  ip: string;
  port: number;
  distanceToTarget: number;
  bucketIndex: number;
  status: 'active' | 'querying' | 'stale';
}
