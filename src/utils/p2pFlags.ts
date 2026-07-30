import { PeerNode } from '../types/p2p';

export interface ProtocolFlag {
  code: string;
  name: string;
  status: 'Enabled' | 'Active' | 'Connected' | 'Supported';
  description: string;
  technicalDetail: string;
  colorStyle: string;
}

export function getCountryDetails(countryCode: string, fallbackName?: string): { name: string; flag: string } {
  const code = (countryCode || '').toUpperCase();
  const map: Record<string, { name: string; flag: string }> = {
    NL: { name: 'Netherlands', flag: '🇳🇱' },
    JP: { name: 'Japan', flag: '🇯🇵' },
    GB: { name: 'United Kingdom', flag: '🇬🇧' },
    BR: { name: 'Brazil', flag: '🇧🇷' },
    AU: { name: 'Australia', flag: '🇦🇺' },
    US: { name: 'United States', flag: '🇺🇸' },
    DE: { name: 'Germany', flag: '🇩🇪' },
    CA: { name: 'Canada', flag: '🇨🇦' },
    FR: { name: 'France', flag: '🇫🇷' },
    KR: { name: 'South Korea', flag: '🇰🇷' },
    IN: { name: 'India', flag: '🇮🇳' },
    SG: { name: 'Singapore', flag: '🇸🇬' },
    SE: { name: 'Sweden', flag: '🇸🇪' },
  };

  if (map[code]) return map[code];
  if (fallbackName) return { name: fallbackName, flag: '🌐' };
  return { name: 'Global Network', flag: '🌐' };
}

export function getPeerProtocolFlags(peer: PeerNode): ProtocolFlag[] {
  const flags: ProtocolFlag[] = [];

  // D = DHT Node
  flags.push({
    code: 'D',
    name: 'Distributed Hash Table',
    status: 'Enabled',
    description: 'Mainline Kademlia Distributed Hash Table active for trackerless peer discovery',
    technicalDetail: 'BEP-005 compliant • 160-bit InfoHash space • Port 6881 UDP',
    colorStyle: 'bg-cyan-950/90 border-cyan-500/60 text-cyan-300 hover:bg-cyan-900',
  });

  // K = Kademlia Node
  flags.push({
    code: 'K',
    name: 'Kademlia Routing',
    status: 'Active',
    description: 'Node maintains active K-bucket routing table using XOR metric distance',
    technicalDetail: 'Uses XOR metric to locate peers • Logarithmic depth O(log N) • k=8 buckets',
    colorStyle: 'bg-teal-950/90 border-teal-500/60 text-teal-300 hover:bg-teal-900',
  });

  // E = Encryption Supported
  flags.push({
    code: 'E',
    name: 'MSE/PE Encryption',
    status: 'Active',
    description: 'Payload encrypted via Message Stream Encryption / Protocol Encryption',
    technicalDetail: 'Diffie-Hellman Key Exchange (DH-1024) • ARC4 Stream Cipher • Anti-ISP Throttling',
    colorStyle: 'bg-emerald-950/90 border-emerald-500/60 text-emerald-300 hover:bg-emerald-900',
  });

  // P = Peer Exchange (PEX)
  flags.push({
    code: 'P',
    name: 'Peer Exchange (PEX)',
    status: 'Enabled',
    description: 'Gossip protocol enabling peers to share known active swarm lists directly',
    technicalDetail: 'BEP-011 protocol • Reduces central tracker query load • Periodic 1-min gossip',
    colorStyle: 'bg-purple-950/90 border-purple-500/60 text-purple-300 hover:bg-purple-900',
  });

  // T = Tracker Connected
  if (peer.type === 'tracker' || peer.connectedPeers.includes('tracker-01')) {
    flags.push({
      code: 'T',
      name: 'Tracker Announce',
      status: 'Connected',
      description: 'Peer actively registered with OpenTracker announce HTTP/UDP service',
      colorStyle: 'bg-blue-950/90 border-blue-500/60 text-blue-300 hover:bg-blue-900',
      technicalDetail: 'BEP-003 Announce • Interval 1800s • UDP Announce protocol v2',
    });
  }

  // H = Hole Punching (BEP-055)
  if (peer.natType === 'UPnP' || peer.natType === 'PortForwarded') {
    flags.push({
      code: 'H',
      name: 'Hole Punching / NAT',
      status: 'Supported',
      description: 'BEP-055 NAT traversal & UDP hole punching active for restricted firewalls',
      technicalDetail: 'STUN/TURN relay fallback • UPnP IGD v2 port mapping active',
      colorStyle: 'bg-amber-950/90 border-amber-500/60 text-amber-300 hover:bg-amber-900',
    });
  }

  // U = uTP Protocol
  flags.push({
    code: 'U',
    name: 'uTP Transport Protocol',
    status: 'Active',
    description: 'Micro Transport Protocol running over UDP with LEDBAT congestion control',
    technicalDetail: 'BEP-029 LEDBAT congestion control • One-way delay estimation • Auto-throttling',
    colorStyle: 'bg-fuchsia-950/90 border-fuchsia-500/60 text-fuchsia-300 hover:bg-fuchsia-900',
  });

  // I = Incoming Connection vs O = Outgoing
  if (peer.id.includes('leecher') || peer.id.includes('02') || peer.id.includes('04')) {
    flags.push({
      code: 'I',
      name: 'Incoming Connection',
      status: 'Connected',
      description: 'Connection initiated by remote peer socket to local listening port',
      technicalDetail: 'Ingress TCP socket • Handshake verified • Active peer wire protocol',
      colorStyle: 'bg-indigo-950/90 border-indigo-500/60 text-indigo-300 hover:bg-indigo-900',
    });
  } else {
    flags.push({
      code: 'O',
      name: 'Outgoing Connection',
      status: 'Connected',
      description: 'Connection initiated locally to remote listening peer address',
      technicalDetail: 'Egress socket • Handshake complete • Choke/Unchoke state synced',
      colorStyle: 'bg-violet-950/90 border-violet-500/60 text-violet-300 hover:bg-violet-900',
    });
  }

  // C = Connected
  if (peer.status !== 'disconnected' && peer.status !== 'blocked') {
    flags.push({
      code: 'C',
      name: 'Connected Socket',
      status: 'Active',
      description: 'Active socket session established with full BitTorrent handshake',
      technicalDetail: 'TCP/uTP socket ESTABLISHED • Bitfield verified • Fast Extension active',
      colorStyle: 'bg-green-950/90 border-green-500/60 text-green-300 hover:bg-green-900',
    });
  }

  // S = Seeder vs L = Leecher
  if (peer.type === 'seeder' || peer.progress === 100) {
    flags.push({
      code: 'S',
      name: 'Seeder Node',
      status: 'Active',
      description: 'Peer holds 100% complete torrent payload and serves upload requests',
      technicalDetail: 'Complete Bitfield (100%) • High priority upload slot • Super-seeding ready',
      colorStyle: 'bg-emerald-900/90 border-emerald-400 text-emerald-200 hover:bg-emerald-800',
    });
  } else if (peer.type === 'leecher' || peer.progress < 100) {
    flags.push({
      code: 'L',
      name: 'Leecher Node',
      status: 'Active',
      description: 'Peer downloading missing pieces while uploading acquired pieces to swarm',
      technicalDetail: `Progress: ${Math.round(peer.progress)}% • Requesting rarest pieces first`,
      colorStyle: 'bg-sky-900/90 border-sky-400 text-sky-200 hover:bg-sky-800',
    });
  }

  return flags;
}

export interface PeerCapabilitySummary {
  dhtEnabled: boolean;
  kademliaRouting: boolean;
  extensionProtocol: boolean;
  peerExchange: boolean;
  uTpTransport: boolean;
  ipv6Support: boolean;
  encryption: boolean;
  holePunching: boolean;
  connectionScore: number;
  compatibilityLabel: 'Excellent' | 'Good' | 'Standard';
}

export function getPeerCapabilitySummary(peer: PeerNode): PeerCapabilitySummary {
  const flags = getPeerProtocolFlags(peer);
  const flagCodes = new Set(flags.map(f => f.code));

  const dhtEnabled = flagCodes.has('D');
  const kademliaRouting = flagCodes.has('K');
  const extensionProtocol = true; // BEP-10 extension header supported on all active peers
  const peerExchange = flagCodes.has('P');
  const uTpTransport = flagCodes.has('U');
  const ipv6Support = peer.ip.includes(':') || peer.id.includes('03') || peer.id.includes('05');
  const encryption = flagCodes.has('E');
  const holePunching = flagCodes.has('H');

  let score = 50;
  if (dhtEnabled) score += 10;
  if (kademliaRouting) score += 10;
  if (peerExchange) score += 8;
  if (uTpTransport) score += 7;
  if (encryption) score += 8;
  if (holePunching) score += 5;
  if (ipv6Support) score += 2;
  if (peer.latency < 50) score += 5;

  score = Math.min(score, 99);

  let compatibilityLabel: 'Excellent' | 'Good' | 'Standard' = 'Standard';
  if (score >= 85) compatibilityLabel = 'Excellent';
  else if (score >= 70) compatibilityLabel = 'Good';

  return {
    dhtEnabled,
    kademliaRouting,
    extensionProtocol,
    peerExchange,
    uTpTransport,
    ipv6Support,
    encryption,
    holePunching,
    connectionScore: score,
    compatibilityLabel,
  };
}

