import { PeerNode, TopologyType } from '../types/p2p';

export const TOTAL_PIECES = 100;

export const COUNTRIES = [
  { name: 'United States', code: 'US', flag: '🇺🇸', lat: 37.0902, lng: -95.7129 },
  { name: 'Germany', code: 'DE', flag: '🇩🇪', lat: 51.1657, lng: 10.4515 },
  { name: 'Japan', code: 'JP', flag: '🇯🇵', lat: 36.2048, lng: 138.2529 },
  { name: 'United Kingdom', code: 'GB', flag: '🇬🇧', lat: 55.3781, lng: -3.436 },
  { name: 'Brazil', code: 'BR', flag: '🇧🇷', lat: -14.235, lng: -51.9253 },
  { name: 'Australia', code: 'AU', flag: '🇦🇺', lat: -25.2744, lng: 133.7751 },
  { name: 'Canada', code: 'CA', flag: '🇨🇦', lat: 56.1304, lng: -106.3468 },
  { name: 'Netherlands', code: 'NL', flag: '🇳🇱', lat: 52.1326, lng: 5.2913 },
  { name: 'Singapore', code: 'SG', flag: '🇸🇬', lat: 1.3521, lng: 103.8198 },
  { name: 'France', code: 'FR', flag: '🇫🇷', lat: 46.2276, lng: 2.2137 },
  { name: 'South Korea', code: 'KR', flag: '🇰🇷', lat: 35.9078, lng: 127.7669 },
  { name: 'India', code: 'IN', flag: '🇮🇳', lat: 20.5937, lng: 78.9629 },
];

export const CLIENT_VERSIONS = [
  'qBittorrent/4.6.2',
  'Transmission/4.0.5',
  'libtorrent/2.0.9',
  'uTorrent/3.5.5',
  'Deluge/2.1.1',
  'BitComet/2.05',
  'aria2/1.36.0',
];

export const NAT_TYPES = ['UPnP', 'PortForwarded', 'SymmetricNAT', 'Relayed'] as const;

export function getRandomIp(): string {
  return `${Math.floor(Math.random() * 200) + 10}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 254) + 1}`;
}

export function createInitialPeers(): PeerNode[] {
  const fullPieces = Array(TOTAL_PIECES).fill(true);
  const emptyPieces = Array(TOTAL_PIECES).fill(false);

  // Tracker Node (Center/Top)
  const tracker: PeerNode = {
    id: 'tracker-01',
    name: 'OpenTracker Alpha',
    ip: '185.199.108.153',
    country: 'Netherlands',
    countryCode: 'NL',
    flag: '🇳🇱',
    lat: 52.1326,
    lng: 5.2913,
    type: 'tracker',
    status: 'active',
    progress: 100,
    pieces: [...fullPieces],
    downloadRate: 0,
    uploadRate: 1420,
    latency: 12,
    packetLoss: 0,
    connectedPeers: ['seeder-01', 'seeder-02', 'leecher-01', 'leecher-02', 'leecher-03', 'leecher-04', 'bootstrap-01'],
    x: 400,
    y: 80,
    natType: 'PortForwarded',
    optimisticUnchoke: false,
    health: 100,
    downloadedBytes: 0,
    uploadedBytes: 84920100,
    clientVersion: 'opentracker/1.1-p2p',
    currentRequests: [],
    uploadQueue: [],
  };

  // Bootstrap DHT Node
  const bootstrap: PeerNode = {
    id: 'bootstrap-01',
    name: 'Mainline DHT Bootstrap',
    ip: '67.215.246.10',
    country: 'United States',
    countryCode: 'US',
    flag: '🇺🇸',
    lat: 37.0902,
    lng: -95.7129,
    type: 'bootstrap',
    status: 'active',
    progress: 100,
    pieces: [...fullPieces],
    downloadRate: 0,
    uploadRate: 850,
    latency: 24,
    packetLoss: 0,
    connectedPeers: ['tracker-01', 'seeder-01', 'leecher-01'],
    x: 180,
    y: 140,
    natType: 'PortForwarded',
    optimisticUnchoke: false,
    health: 98,
    downloadedBytes: 0,
    uploadedBytes: 42100800,
    clientVersion: 'dht-bootstrap/2.0',
    currentRequests: [],
    uploadQueue: [],
  };

  // Seeders (Have 100%)
  const seeder1: PeerNode = {
    id: 'seeder-01',
    name: 'Seeder (Gigabit-US)',
    ip: getRandomIp(),
    country: 'United States',
    countryCode: 'US',
    flag: '🇺🇸',
    lat: 37.0902,
    lng: -95.7129,
    type: 'seeder',
    status: 'active',
    progress: 100,
    pieces: [...fullPieces],
    downloadRate: 0,
    uploadRate: 5400,
    latency: 18,
    packetLoss: 0,
    connectedPeers: ['tracker-01', 'leecher-01', 'leecher-02', 'leecher-03'],
    x: 250,
    y: 280,
    natType: 'PortForwarded',
    optimisticUnchoke: true,
    health: 100,
    downloadedBytes: 104857600,
    uploadedBytes: 450971520,
    clientVersion: 'qBittorrent/4.6.2',
    currentRequests: [],
    uploadQueue: ['leecher-01', 'leecher-02'],
  };

  const seeder2: PeerNode = {
    id: 'seeder-02',
    name: 'Seeder (Fiber-DE)',
    ip: getRandomIp(),
    country: 'Germany',
    countryCode: 'DE',
    flag: '🇩🇪',
    lat: 51.1657,
    lng: 10.4515,
    type: 'seeder',
    status: 'active',
    progress: 100,
    pieces: [...fullPieces],
    downloadRate: 0,
    uploadRate: 4100,
    latency: 32,
    packetLoss: 0.1,
    connectedPeers: ['tracker-01', 'leecher-02', 'leecher-04', 'slow-01'],
    x: 550,
    y: 280,
    natType: 'UPnP',
    optimisticUnchoke: false,
    health: 99,
    downloadedBytes: 104857600,
    uploadedBytes: 312004500,
    clientVersion: 'Transmission/4.0.5',
    currentRequests: [],
    uploadQueue: ['leecher-02', 'leecher-04'],
  };

  // Leechers (Downloading partial)
  const partialPieces1 = [...emptyPieces];
  for (let i = 0; i < 65; i++) partialPieces1[i] = true;

  const leecher1: PeerNode = {
    id: 'leecher-01',
    name: 'Peer-Alpha (65%)',
    ip: getRandomIp(),
    country: 'Japan',
    countryCode: 'JP',
    flag: '🇯🇵',
    lat: 36.2048,
    lng: 138.2529,
    type: 'leecher',
    status: 'active',
    progress: 65,
    pieces: partialPieces1,
    downloadRate: 2800,
    uploadRate: 950,
    latency: 45,
    packetLoss: 0.2,
    connectedPeers: ['seeder-01', 'leecher-02', 'leecher-03'],
    x: 180,
    y: 450,
    natType: 'UPnP',
    optimisticUnchoke: true,
    health: 95,
    downloadedBytes: 68157440,
    uploadedBytes: 18450000,
    clientVersion: 'libtorrent/2.0.9',
    currentRequests: [66, 67, 68],
    uploadQueue: ['leecher-03'],
  };

  const partialPieces2 = [...emptyPieces];
  for (let i = 0; i < 40; i++) partialPieces2[i] = true;

  const leecher2: PeerNode = {
    id: 'leecher-02',
    name: 'Peer-Beta (40%)',
    ip: getRandomIp(),
    country: 'United Kingdom',
    countryCode: 'GB',
    flag: '🇬🇧',
    lat: 55.3781,
    lng: -3.436,
    type: 'leecher',
    status: 'active',
    progress: 40,
    pieces: partialPieces2,
    downloadRate: 3100,
    uploadRate: 800,
    latency: 28,
    packetLoss: 0,
    connectedPeers: ['seeder-01', 'seeder-02', 'leecher-01', 'leecher-04'],
    x: 380,
    y: 460,
    natType: 'PortForwarded',
    optimisticUnchoke: false,
    health: 96,
    downloadedBytes: 41943040,
    uploadedBytes: 12000000,
    clientVersion: 'uTorrent/3.5.5',
    currentRequests: [41, 42, 43],
    uploadQueue: [],
  };

  const partialPieces3 = [...emptyPieces];
  for (let i = 0; i < 20; i++) partialPieces3[i] = true;

  const leecher3: PeerNode = {
    id: 'leecher-03',
    name: 'Peer-Gamma (20%)',
    ip: getRandomIp(),
    country: 'Brazil',
    countryCode: 'BR',
    flag: '🇧🇷',
    lat: -14.235,
    lng: -51.9253,
    type: 'leecher',
    status: 'active',
    progress: 20,
    pieces: partialPieces3,
    downloadRate: 1500,
    uploadRate: 400,
    latency: 120,
    packetLoss: 1.2,
    connectedPeers: ['seeder-01', 'leecher-01'],
    x: 620,
    y: 450,
    natType: 'SymmetricNAT',
    optimisticUnchoke: false,
    health: 88,
    downloadedBytes: 20971520,
    uploadedBytes: 4500000,
    clientVersion: 'Deluge/2.1.1',
    currentRequests: [21, 22],
    uploadQueue: [],
  };

  const partialPieces4 = [...emptyPieces];
  for (let i = 0; i < 10; i++) partialPieces4[i] = true;

  const leecher4: PeerNode = {
    id: 'leecher-04',
    name: 'Peer-Delta (10%)',
    ip: getRandomIp(),
    country: 'Australia',
    countryCode: 'AU',
    flag: '🇦🇺',
    lat: -25.2744,
    lng: 133.7751,
    type: 'leecher',
    status: 'active',
    progress: 10,
    pieces: partialPieces4,
    downloadRate: 980,
    uploadRate: 250,
    latency: 180,
    packetLoss: 2.5,
    connectedPeers: ['seeder-02', 'leecher-02'],
    x: 750,
    y: 350,
    natType: 'Relayed',
    optimisticUnchoke: false,
    health: 82,
    downloadedBytes: 10485760,
    uploadedBytes: 1200000,
    clientVersion: 'aria2/1.36.0',
    currentRequests: [11, 12],
    uploadQueue: [],
  };

  // Slow Peer
  const slow1: PeerNode = {
    id: 'slow-01',
    name: 'HighLatency-Peer (Slow)',
    ip: getRandomIp(),
    country: 'India',
    countryCode: 'IN',
    flag: '🇮🇳',
    lat: 20.5937,
    lng: 78.9629,
    type: 'slow',
    status: 'choked',
    progress: 5,
    pieces: [...emptyPieces],
    downloadRate: 120,
    uploadRate: 30,
    latency: 380,
    packetLoss: 8.5,
    connectedPeers: ['seeder-02'],
    x: 700,
    y: 180,
    natType: 'SymmetricNAT',
    optimisticUnchoke: false,
    health: 45,
    downloadedBytes: 5242880,
    uploadedBytes: 300000,
    clientVersion: 'libtorrent/1.2.14',
    currentRequests: [6],
    uploadQueue: [],
  };

  // Malicious Peer
  const malicious1: PeerNode = {
    id: 'malicious-01',
    name: 'Rogue-Node (Poisoner)',
    ip: '198.51.100.42',
    country: 'Canada',
    countryCode: 'CA',
    flag: '🇨🇦',
    lat: 56.1304,
    lng: -106.3468,
    type: 'malicious',
    status: 'blocked',
    progress: 0,
    pieces: [...emptyPieces],
    downloadRate: 0,
    uploadRate: 0,
    latency: 95,
    packetLoss: 15.0,
    connectedPeers: [],
    x: 100,
    y: 320,
    natType: 'SymmetricNAT',
    optimisticUnchoke: false,
    health: 0,
    downloadedBytes: 0,
    uploadedBytes: 0,
    clientVersion: 'custom-spoofer/0.1',
    currentRequests: [],
    uploadQueue: [],
  };

  return [tracker, bootstrap, seeder1, seeder2, leecher1, leecher2, leecher3, leecher4, slow1, malicious1];
}

export function calculateTopologyPositions(peers: PeerNode[], topology: TopologyType, width: number = 960, height: number = 560): PeerNode[] {
  const centerX = width / 2;
  const centerY = height / 2;
  const result = [...peers];

  const nonTrackerPeers = result.filter(p => p.type !== 'tracker');
  const tracker = result.find(p => p.type === 'tracker');

  if (tracker) {
    tracker.targetX = centerX;
    tracker.targetY = 60;
    tracker.x = centerX;
    tracker.y = 60;
  }

  const count = nonTrackerPeers.length;

  nonTrackerPeers.forEach((peer, i) => {
    let tx = peer.x;
    let ty = peer.y;

    if (topology === 'star') {
      // Star Topology: Central seeder/tracker in middle, peers arranged in wide circle
      const angle = (i / Math.max(1, count)) * 2 * Math.PI - Math.PI / 2;
      const radiusX = width * 0.38;
      const radiusY = height * 0.35;
      tx = centerX + Math.cos(angle) * radiusX;
      ty = centerY + 30 + Math.sin(angle) * radiusY;
    } else if (topology === 'ring') {
      // Ring Topology: Perfectly spaced wide oval ring
      const angle = (i / count) * 2 * Math.PI - Math.PI / 2;
      const radiusX = width * 0.38;
      const radiusY = height * 0.34;
      tx = centerX + Math.cos(angle) * radiusX;
      ty = centerY + 25 + Math.sin(angle) * radiusY;
    } else if (topology === 'mesh') {
      // Mesh Topology: Generous 3-tier grid layout with wide column spacing
      const rows = 3;
      const itemsPerRow = Math.ceil(count / rows);
      const row = Math.floor(i / itemsPerRow);
      const col = i % itemsPerRow;
      
      const rowY = [150, 300, 450][row] || (150 + row * 140);
      const rowCount = (row === rows - 1) ? count - row * itemsPerRow : itemsPerRow;
      const spacingX = width / (rowCount + 1);
      
      tx = spacingX * (col + 1);
      ty = rowY;
    } else if (topology === 'tree') {
      // Tree Topology: Clear 3-tier hierarchy with wide horizontal spreading
      if (peer.type === 'bootstrap') {
        tx = centerX - 240;
        ty = 150;
      } else if (peer.type === 'seeder') {
        const seeders = nonTrackerPeers.filter(p => p.type === 'seeder');
        const sIndex = seeders.findIndex(s => s.id === peer.id);
        const sSpacing = width / (seeders.length + 1);
        tx = sSpacing * (sIndex + 1);
        ty = 150;
      } else {
        const leechersAndOthers = nonTrackerPeers.filter(p => p.type !== 'seeder' && p.type !== 'bootstrap');
        const lIndex = leechersAndOthers.findIndex(l => l.id === peer.id);
        const lSpacing = width / (leechersAndOthers.length + 1);
        tx = lSpacing * (lIndex + 1);
        ty = lIndex % 2 === 0 ? 320 : 450;
      }
    } else if (topology === 'hybrid' || topology === 'random') {
      // Hybrid floating topology with clear wide distribution
      const angle = (i / count) * 2 * Math.PI;
      const radiusX = (width * 0.36) * (0.85 + (i % 2) * 0.2);
      const radiusY = (height * 0.32) * (0.85 + ((i + 1) % 2) * 0.2);
      tx = centerX + Math.cos(angle) * radiusX;
      ty = centerY + 30 + Math.sin(angle) * radiusY;
    }

    // Ensure generous bounds so labels are never off-screen
    const finalX = Math.max(100, Math.min(width - 100, tx));
    const finalY = Math.max(80, Math.min(height - 80, ty));

    peer.targetX = finalX;
    peer.targetY = finalY;
    peer.x = finalX;
    peer.y = finalY;
  });

  return result;
}
