# ⚡ BitTorrent P2P Network Protocol Simulator & Self-Healing Engine

An interactive, visual, web-based simulator designed to model **BitTorrent Peer-to-Peer (P2P) swarms**, piece-propagation algorithms, distributed hash tables (DHT), and resilient **self-healing network fault tolerance** under real-world network chaos.

Built with **React 18**, **TypeScript**, **Tailwind CSS**, and **Lucide Icons**.

---

## 🌟 Key Features

### 1. 🌐 Interactive Swarm Topology & Main Network Canvas
- **Real-Time Swarm Rendering**: Visualizes seeders, leechers, trackers, bootstrap DHT nodes, slow peers, and malicious poison nodes in an interactive graph topology.
- **Animated Data Packets**: Live bezier-curve packet animations showing piece requests (`REQUEST`), piece payloads (`PIECE`), tracker announces (`TRACKER_ANNOUNCE`), DHT lookups (`DHT_FIND_NODE`), and choke/unchoke messages (`CHOKE`).
- **Interactive Node Inspection**: Click any node to open its detailed inspector panel showing bitfield progress, download/upload rates, peer list, piece queue, RTT latency, and IP routing details.
- **Topology Configurations**: Toggle between **Mesh Network**, **Star Topology**, **Ring Topology**, **Tree Topology**, and **Hybrid Swarm**.

### 2. ⚡ BitTorrent BEP Protocol Implementations
- **BEP-0003 Core Protocol**: Piece scheduling (Rarest-First, Tit-for-Tat Choking, Sequential, Random), 16KB sub-piece block reassembly, and bandwidth allocation.
- **BEP-0005 Kademlia DHT (Trackerless Swarms)**: Autonomous peer discovery using UDP `FIND_NODE` / `GET_PEERS` lookup RPCs when central tracker servers fail.
- **BEP-0011 Peer Exchange (PEX)**: Gossip-based peer discovery permitting direct peer IP exchanges without re-querying central trackers.
- **BEP-0055 Hole Punching & STUN Traversal**: NAT traversal and relay bridges for connected peers behind restrictive network partitions.

### 3. 🛡️ Fault Tolerance & Self-Healing Engine (10 Chaos Scenarios)
The simulator includes a dedicated **Self-Healing Engine** that models how BitTorrent protocols recover automatically from severe network anomalies:
1. **Packet Loss Spike**: Request timeout clocks trigger retransmissions to alternate seeders (`🔄 RETRY`).
2. **Peer Disconnect**: Automatic Peer Exchange (PEX) rebuilds broken links.
3. **Node Failure**: Swarm load-balancing shifts traffic away from crashed seeders.
4. **Tracker Crash**: Seamless fallback to Kademlia DHT lookup queries (`⚡ DHT`).
5. **Network Partition**: STUN/TURN relay bridges bridge routing barriers (`🛑 WALL`).
6. **High Latency Ping Spikes**: Dynamic request window throttling favors low-latency peers.
7. **Duplicate Packets**: Bitfield ownership filters reject redundant piece payloads (`♊ DUP`), saving bandwidth.
8. **Corrupted Piece / Poison Attack**: Cryptographic SHA-1 hash verification rejects bad payloads (`☣️ POISON`), blacklists malicious nodes, and re-fetches clean pieces.
9. **Seeder Disconnection**: Tit-for-Tat choking algorithms allow leechers to complete downloads independently.
10. **Network Jitter**: Non-sequential block buffer reassembly handles out-of-order packet arrivals.

### 4. 🗺️ Interactive Mini Overview (Minimap)
- **Non-Obstructive Docking**: Docked to the top-right or bottom-right canvas corner with adjustable margins.
- **Interactive Viewport**: Drag or click anywhere on the minimap to pan the viewing frame across the 960x560 topology.
- **Live Node & Packet Visuals**: Color-coded live node markers and real-time flying packet dots.
- **UI Controls**: Size toggle (`S`, `M`, `L`), Opacity adjustment (`100%`, `80%`, `50%`), Collapse/Expand, and Show/Hide toggle buttons.

### 5. 📊 Comprehensive Analytics, Logs & Multi-Format Export
- **Printable Executive Audit Report**: Generate a formatted HTML/PDF diagnostic report with summary tables, swarm metrics, and event logs.
- **CSV Data Export**: Export granular bandwidth time-series data for analysis.
- **JSON Snapshot Export & Import**: Save and reload exact network state snapshots.
- **PNG Canvas Capture**: Take high-resolution visual screenshots of the current network state.

### 6. 🎓 Beginner Educational Guide Mode
- Step-by-step interactive visual tutorial explaining essential P2P concepts: **What is a Swarm?**, **Seeders vs. Leechers**, **Info-Hashes & Bitfields**, **Tit-for-Tat Choking**, and **Cryptographic Integrity**.

---

## 📁 Architecture & File Structure

```
src/
├── types/
│   └── p2p.ts                      # TypeScript interfaces (PeerNode, DataPacket, Metrics, Chaos, BEP specs)
├── utils/
│   └── p2pSimulationEngine.ts       # Core P2P state machine, piece transfer physics, and self-healing engine
├── components/
│   ├── MainNetworkCanvas.tsx       # SVG network graph renderer with bezier curves & packet animations
│   ├── MiniMap.tsx                 # Interactive Minimap overlay with viewport pan & UI controls
│   ├── FaultToleranceMonitor.tsx   # Self-healing metrics counters & BEP educational cards
│   ├── HeroMetricsBar.tsx          # Real-time top metrics bar (throughput, active peers, swarm health)
│   ├── LiveEventLog.tsx            # Categorized real-time protocol event logger
│   ├── ControlPanel.tsx            # Controls for adding nodes, triggering chaos, & altering topologies
│   ├── ExportModal.tsx             # Audit report generator (PDF/Print, CSV, JSON, PNG)
│   └── BeginnerGuideView.tsx       # Step-by-step interactive educational guide
└── App.tsx                         # Main React entry point & layout coordinator
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher

### Installation & Local Development

1. **Clone or navigate to the project directory**:
   ```bash
   cd torrent-p2p-simulator
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Start the Development Server**:
   ```bash
   npm run dev
   ```
   Open your browser at `http://localhost:3000` (or the port indicated in your console).

4. **Production Build**:
   ```bash
   npm run build
   ```

---

## 📜 License & Acknowledgments

This simulator implements specifications documented in official BitTorrent Enhancement Proposals (BEPs), including **BEP-0003** (Core BitTorrent Protocol), **BEP-0005** (DHT Protocol), **BEP-0011** (Peer Exchange), and **BEP-0055** (Hole Punching). Created for educational and technical demonstration purposes.
