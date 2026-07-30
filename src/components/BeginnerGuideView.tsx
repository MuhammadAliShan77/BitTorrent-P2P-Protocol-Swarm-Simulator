import React, { useState } from 'react';
import { 
  BookOpen, 
  Network, 
  Server, 
  Database, 
  Grid, 
  Cpu, 
  ShieldAlert, 
  Globe, 
  CheckCircle2, 
  HelpCircle,
  ArrowRight,
  Sparkles,
  Zap
} from 'lucide-react';

export const BeginnerGuideView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('intro');

  return (
    <div className="w-full max-w-5xl mx-auto my-2 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-2xl font-sans text-slate-200">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between pb-4 border-b border-slate-800 gap-4 mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-2xl shadow-[0_0_20px_rgba(6,182,212,0.25)]">
            <BookOpen className="w-7 h-7 text-cyan-400" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-bold text-slate-100 font-mono tracking-wide">
                BITTORRENT & P2P NETWORKING: BEGINNER'S GUIDE
              </h1>
              <span className="text-[10px] uppercase font-bold font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                ZERO TO HERO
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Complete, plain-English educational masterclass for students & networking courses
            </p>
          </div>
        </div>
      </div>

      {/* Chapter Selection Bar */}
      <div className="flex flex-wrap items-center gap-2 mb-6 bg-slate-950 p-2 rounded-xl border border-slate-800 text-xs font-mono">
        <button
          onClick={() => setActiveTab('intro')}
          className={`px-3 py-1.5 rounded-lg transition-all flex items-center space-x-1.5 ${
            activeTab === 'intro' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Network className="w-3.5 h-3.5" />
          <span>1. Client-Server vs P2P</span>
        </button>

        <button
          onClick={() => setActiveTab('bittorrent')}
          className={`px-3 py-1.5 rounded-lg transition-all flex items-center space-x-1.5 ${
            activeTab === 'bittorrent' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Grid className="w-3.5 h-3.5" />
          <span>2. How BitTorrent Works</span>
        </button>

        <button
          onClick={() => setActiveTab('roles')}
          className={`px-3 py-1.5 rounded-lg transition-all flex items-center space-x-1.5 ${
            activeTab === 'roles' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Server className="w-3.5 h-3.5" />
          <span>3. Roles & Swarm</span>
        </button>

        <button
          onClick={() => setActiveTab('algorithms')}
          className={`px-3 py-1.5 rounded-lg transition-all flex items-center space-x-1.5 ${
            activeTab === 'algorithms' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Cpu className="w-3.5 h-3.5" />
          <span>4. Choking Algorithms</span>
        </button>

        <button
          onClick={() => setActiveTab('chaos')}
          className={`px-3 py-1.5 rounded-lg transition-all flex items-center space-x-1.5 ${
            activeTab === 'chaos' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>5. Latency & Rogue Attackers</span>
        </button>
      </div>

      {/* Chapter Content Panels */}
      <div className="space-y-6 text-sm font-sans leading-relaxed text-slate-300">

        {/* Tab 1: Client-Server vs P2P */}
        {activeTab === 'intro' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <h2 className="text-base font-bold font-mono text-cyan-400 flex items-center space-x-2">
              <Network className="w-5 h-5" />
              <span>Chapter 1: The Big Picture - Client-Server vs. Peer-to-Peer</span>
            </h2>

            <p>
              When you download a file from the internet, your computer connects to other computers across global fiber optic cables. There are two primary ways computers share files:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center space-x-2 text-rose-400 font-mono font-bold text-xs">
                  <Server className="w-4 h-4" />
                  <span>Traditional Client-Server Model</span>
                </div>
                <p className="text-xs text-slate-400">
                  Imagine 1,000 people standing in a single line waiting to buy cake from <strong>1 central bakery</strong>.
                </p>
                <ul className="text-xs text-slate-400 list-disc list-inside space-y-1 pt-1">
                  <li>If 10,000 people show up at once, the server crashes.</li>
                  <li>The owner pays expensive server bandwidth bills.</li>
                  <li>Example: Web downloads, Google Drive, YouTube.</li>
                </ul>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-cyan-500/30 space-y-2 shadow-[0_0_15px_rgba(6,182,212,0.1)]">
                <div className="flex items-center space-x-2 text-cyan-400 font-mono font-bold text-xs">
                  <Network className="w-4 h-4" />
                  <span>Peer-to-Peer (P2P) Model</span>
                </div>
                <p className="text-xs text-slate-400">
                  Imagine a <strong>community potluck picnic</strong> where everyone brings food and shares directly with each other!
                </p>
                <ul className="text-xs text-slate-400 list-disc list-inside space-y-1 pt-1">
                  <li>No single central server required!</li>
                  <li>The more people join, <strong>the FASTER downloads become!</strong></li>
                  <li>Example: BitTorrent, Linux distributions, WebTorrent.</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: How BitTorrent Works */}
        {activeTab === 'bittorrent' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <h2 className="text-base font-bold font-mono text-emerald-400 flex items-center space-x-2">
              <Grid className="w-5 h-5" />
              <span>Chapter 2: How BitTorrent Works (The Pizza Slices)</span>
            </h2>

            <p>
              Instead of forcing you to download a giant 100 MB file in one continuous line from start to finish, BitTorrent breaks the file into <strong>100 equal pieces (1 MB each)</strong>.
            </p>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3 font-mono text-xs">
              <div className="text-amber-400 font-bold">🍕 The Pizza Slices Analogy:</div>
              <p className="text-slate-400 leading-relaxed">
                If 5 friends want a 100-slice pizza, you don't wait for 1 person to eat all 100 slices first! Person A takes Slice #5 from Person B, while Person B grabs Slice #88 from Person C simultaneously.
              </p>
              <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 text-cyan-300">
                Key takeaway: You can download pieces out of order from dozens of different computers worldwide at the exact same time!
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Roles & Swarm */}
        {activeTab === 'roles' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <h2 className="text-base font-bold font-mono text-purple-400 flex items-center space-x-2">
              <Server className="w-5 h-5" />
              <span>Chapter 3: Roles in the BitTorrent Swarm</span>
            </h2>

            <p>
              Every computer in a torrent network has a specific role based on how many pieces it holds:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-3 bg-slate-950 rounded-xl border border-purple-500/30">
                <span className="text-purple-300 font-bold block mb-1">🟣 Tracker 📡</span>
                <p className="text-slate-400 text-[11px]">
                  The central directory host that keeps track of active peer IP addresses.
                </p>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-emerald-500/30">
                <span className="text-emerald-300 font-bold block mb-1">🟢 Seeder ✅ (100%)</span>
                <p className="text-slate-400 text-[11px]">
                  A peer that completed downloading 100% of the file and stays online to upload to others.
                </p>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-cyan-500/30">
                <span className="text-cyan-300 font-bold block mb-1">🔵 Leecher 📥 (Downloading)</span>
                <p className="text-slate-400 text-[11px]">
                  A peer currently downloading missing pieces while uploading what it already owns.
                </p>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-teal-500/30">
                <span className="text-teal-300 font-bold block mb-1">🗄️ DHT Bootstrap Node</span>
                <p className="text-slate-400 text-[11px]">
                  Trackerless Kademlia DHT node that allows peers to find each other using XOR mathematical distance metrics.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Choking Algorithms */}
        {activeTab === 'algorithms' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <h2 className="text-base font-bold font-mono text-amber-400 flex items-center space-x-2">
              <Cpu className="w-5 h-5" />
              <span>Chapter 4: The Game Theory Algorithms</span>
            </h2>

            <p>
              To stop selfish users from downloading without uploading, BitTorrent uses game theory:
            </p>

            <div className="space-y-3 font-mono text-xs">
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
                <div className="text-cyan-400 font-bold mb-1">1. Tit-for-Tat Choking Algorithm (Every 10 seconds)</div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Your client ranks all neighbors by upload speed received from them. It unchokes (allows downloads for) the top 4 fast uploaders and chokes (blocks) the rest!
                </p>
              </div>

              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
                <div className="text-emerald-400 font-bold mb-1">2. Optimistic Unchoking Slot (Every 30 seconds)</div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Every 30 seconds, 1 random peer is unchoked regardless of their current speed. This gives new leechers a chance to get their first pieces and tests if they have fast connection bandwidth!
                </p>
              </div>

              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
                <div className="text-purple-400 font-bold mb-1">3. Rarest-First Piece Selection</div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Peers always request the rarest pieces in the swarm first. This prevents rare pieces from vanishing if the seeders go offline!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: Latency & Rogue Attackers */}
        {activeTab === 'chaos' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <h2 className="text-base font-bold font-mono text-rose-400 flex items-center space-x-2">
              <ShieldAlert className="w-5 h-5" />
              <span>Chapter 5: Network Chaos & Rogue Poisoners</span>
            </h2>

            <p>
              In real networks, connections fail and rogue attackers exist. Here is how BitTorrent handles them:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                <div className="text-orange-400 font-bold">📶 Latency & Packet Loss</div>
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  Latency (ping) is the travel time delay for messages crossing undersea cables. If Wi-Fi packets drop, BitTorrent re-transmits missed chunks automatically.
                </p>
              </div>

              <div className="p-4 bg-slate-950 rounded-xl border border-rose-500/30 space-y-2">
                <div className="text-rose-400 font-bold">🛡️ Rogue Poisoners & Hash Check</div>
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  If a rogue peer sends corrupt garbage data, BitTorrent calculates the SHA-1 cryptographic hash of the received piece. If it fails, the piece is discarded and the malicious IP is permanently blocked!
                </p>
              </div>
            </div>
          </div>
        )}

      </div>

    </div>
  );
};
