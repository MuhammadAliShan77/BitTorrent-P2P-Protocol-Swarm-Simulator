<div align="center">

# ⚡ BitTorrent P2P Network Protocol Simulator & Self-Healing Engine

**An interactive, visual simulator modeling BitTorrent P2P swarms, DHT routing, and self-healing fault tolerance under real-world network chaos.**

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?logo=tailwindcss&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green)

[Features](#-key-features) · [Architecture](#-architecture--file-structure) · [Getting Started](#-getting-started) · [License](#-license--acknowledgments)

</div>

---

## 📖 Overview

This simulator models **BitTorrent Peer-to-Peer (P2P) swarms**, piece-propagation algorithms, distributed hash tables (DHT), and resilient **self-healing network fault tolerance** under real-world network chaos — all rendered live in an interactive web canvas.

Built with **React 18**, **TypeScript**, **Tailwind CSS**, and **Lucide Icons**.

---

## 🌟 Key Features

### 1. 🌐 Interactive Swarm Topology & Main Network Canvas
- **Real-Time Swarm Rendering** — visualizes seeders, leechers, trackers, bootstrap DHT nodes, slow peers, and malicious poison nodes in an interactive graph topology.
- **Animated Data Packets** — live bezier-curve packet animations for piece requests (`REQUEST`), piece payloads (`PIECE`), tracker announces (`TRACKER_ANNOUNCE`), DHT lookups (`DHT_FIND_NODE`), and choke/unchoke messages (`CHOKE`).
- **Interactive Node Inspection** — click any node to open a detailed inspector panel: bitfield progress, download/upload rates, peer list, piece queue, RTT latency, and IP routing details.
- **Topology Configurations** — toggle between **Mesh**, **Star**, **Ring**, **Tree**, and **Hybrid Swarm** topologies.

### 2. ⚡ BitTorrent BEP Protocol Implementations
- **BEP-0003 Core Protocol** — piece scheduling (Rarest-First, Tit-for-Tat Choking, Sequential, Random), 16KB sub-piece block reassembly, and bandwidth allocation.
- **BEP-0005 Kademlia DHT (Trackerless Swarms)** — autonomous peer discovery using UDP `FIND_NODE` / `GET_PEERS` lookup RPCs when central tracker servers fail.
- **BEP-0011 Peer Exchange (PEX)** — gossip-based peer discovery permitting direct peer IP exchanges without re-querying central trackers.
- **BEP-0055 Hole Punching & STUN Traversal** — NAT traversal and relay bridges for peers behind restrictive network partitions.

### 3. 🛡️ Fault Tolerance & Self-Healing Engine (10 Chaos Scenarios)
A dedicated **Self-Healing Engine** models how BitTorrent protocols recover automatically from severe network anomalies:

| # | Scenario | Recovery mechanism |
|---|----------|---------------------|
| 1 | Packet Loss Spike | Request timeout clocks trigger retransmissions to alternate seeders (`🔄 RETRY`) |
| 2 | Peer Disconnect | Automatic Peer Exchange (PEX) rebuilds broken links |
| 3 | Node Failure | Swarm load-balancing shifts traffic away from crashed seeders |
| 4 | Tracker Crash | Seamless fallback to Kademlia DHT lookup queries (`⚡ DHT`) |
| 5 | Network Partition | STUN/TURN relay bridges bridge routing barriers (`🛑 WALL`) |
| 6 | High Latency Ping Spikes | Dynamic request window throttling favors low-latency peers |
| 7 | Duplicate Packets | Bitfield ownership filters reject redundant piece payloads (`♊ DUP`) |
| 8 | Corrupted Piece / Poison Attack | SHA-1 hash verification rejects bad payloads (`☣️ POISON`), blacklists malicious nodes |
| 9 | Seeder Disconnection | Tit-for-Tat choking lets leechers complete downloads independently |
| 10 | Network Jitter | Non-sequential block buffer reassembly handles out-of-order packets |

### 4. 🗺️ Interactive Mini Overview (Minimap)
- **Non-Obstructive Docking** — docked to the top-right or bottom-right canvas corner with adjustable margins.
- **Interactive Viewport** — drag or click anywhere on the minimap to pan the viewing frame across the 960×560 topology.
- **Live Node & Packet Visuals** — color-coded live node markers and real-time flying packet dots.
- **UI Controls** — size toggle (`S`, `M`, `L`), opacity adjustment (`100%`, `80%`, `50%`), collapse/expand, and show/hide toggles.

### 5. 📊 Comprehensive Analytics, Logs & Multi-Format Export
- **Printable Executive Audit Report** — formatted HTML/PDF diagnostic report with summary tables, swarm metrics, and event logs.
- **CSV Data Export** — granular bandwidth time-series data for analysis.
- **JSON Snapshot Export & Import** — save and reload exact network state snapshots.
- **PNG Canvas Capture** — high-resolution screenshots of the current network state.

### 6. 🎓 Beginner Educational Guide Mode
Step-by-step interactive visual tutorial covering essential P2P concepts: **What is a Swarm?**, **Seeders vs. Leechers**, **Info-Hashes & Bitfields**, **Tit-for-Tat Choking**, and **Cryptographic Integrity**.

---

## 📁 Architecture & File Structure

```
src/
├── types/
│   └── p2p.ts                      # TypeScript interfaces (PeerNode, DataPacket, Metrics, Chaos, BEP specs)
├── utils/
│   └── p2pSimulationEngine.ts      # Core P2P state machine, piece transfer physics, and self-healing engine
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
- **Node.js** — v18.0.0 or higher
- **npm** — v9.0.0 or higher

### Installation & Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/<your-username>/torrent-p2p-simulator.git
   cd torrent-p2p-simulator
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```
   Open your browser at `http://localhost:3000` (or the port shown in your console).

4. **Production build**
   ```bash
   npm run build
   ```

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome. Feel free to open a pull request or file an issue if you'd like to add a new chaos scenario, BEP spec, or visualization mode.

## 📜 License & Acknowledgments

Licensed under the **MIT License**.

This simulator implements specifications documented in official BitTorrent Enhancement Proposals (BEPs), including **BEP-0003** (Core BitTorrent Protocol), **BEP-0005** (DHT Protocol), **BEP-0011** (Peer Exchange), and **BEP-0055** (Hole Punching). Created for educational and technical demonstration purposes.

---



