import React, { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { 
  PeerNode, 
  DataPacket, 
  EventLog, 
  MetricsHistoryEntry, 
  SimulationConfig, 
  ViewMode, 
  TopologyType, 
  FailureType,
  PieceStrategy,
  FaultToleranceStats
} from './types/p2p';
import { 
  createInitialPeers, 
  calculateTopologyPositions 
} from './utils/p2pDefaults';
import { 
  runSimulationTick, 
  createNewRandomPeer, 
  generateEventLog 
} from './utils/p2pSimulationEngine';

import { Navbar } from './components/Navbar';
import { HeroMetricsBar } from './components/HeroMetricsBar';
import { MainNetworkCanvas } from './components/MainNetworkCanvas';
import { FilePiecesGrid } from './components/FilePiecesGrid';
import { ControlPanel } from './components/ControlPanel';
import { LiveEventLog } from './components/LiveEventLog';
import { PeerInspectorDrawer } from './components/PeerInspectorDrawer';
import { PacketInspectorModal } from './components/PacketInspectorModal';
import { WorldMapGlobeView } from './components/WorldMapGlobeView';
import { DHTVisualizerView } from './components/DHTVisualizerView';
import { AnalyticsSection } from './components/AnalyticsSection';
import { MiniMap } from './components/MiniMap';
import { QuickHelpModal } from './components/QuickHelpModal';
import { BeginnerGuideView } from './components/BeginnerGuideView';
import { ExportModal } from './components/ExportModal';
import { FaultToleranceMonitor } from './components/FaultToleranceMonitor';

export default function App() {
  // Initial Simulation Configuration
  const [config, setConfig] = useState<SimulationConfig>({
    isRunning: true,
    tickRateMs: 500,
    speedMultiplier: 1,
    connectionSpeedFactor: 1,
    packetSpeedFactor: 1,
    pieceStrategy: 'rarest_first',
    topology: 'mesh',
    activeFailure: 'none',
    chokingIntervalSec: 10,
    optimisticUnchokeIntervalSec: 30,
    autoDemoMode: false,
  });

  // State
  const [peers, setPeers] = useState<PeerNode[]>(() => 
    calculateTopologyPositions(createInitialPeers(), 'mesh')
  );
  const [packets, setPackets] = useState<DataPacket[]>([]);
  const [logs, setLogs] = useState<EventLog[]>([]);
  const [metricsHistory, setMetricsHistory] = useState<MetricsHistoryEntry[]>([]);
  const [simulationTimeSec, setSimulationTimeSec] = useState<number>(0);
  const [tickCount, setTickCount] = useState<number>(0);
  const [viewMode, setViewMode] = useState<ViewMode>('topology');
  const [selectedPeer, setSelectedPeer] = useState<PeerNode | null>(null);
  const [selectedPacket, setSelectedPacket] = useState<DataPacket | null>(null);
  const [isHelpOpen, setIsHelpOpen] = useState<boolean>(false);
  const [isExportOpen, setIsExportOpen] = useState<boolean>(false);
  const confettiCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const confettiInstanceRef = useRef<any>(null);

  const [faultStats, setFaultStats] = useState<FaultToleranceStats>({
    retransmissionsCount: 0,
    recoveredPacketsCount: 0,
    failedNodesCount: 0,
    reconnectedPeersCount: 0,
    activeRetriesCount: 0,
    hashFailuresCount: 0,
    duplicatesDiscardedCount: 0,
    maliciousPeersBlockedCount: 0,
    dhtFallbacksCount: 0,
    avgRecoveryTimeMs: 180,
    resilienceScore: 100,
    lastSelfHealingAction: 'Swarm active with optimal health'
  });

  // Keep selectedPeer in sync when peers update
  useEffect(() => {
    if (selectedPeer) {
      const updated = peers.find(p => p.id === selectedPeer.id);
      if (updated) setSelectedPeer(updated);
    }
  }, [peers, selectedPeer]);

  // Main Simulation Timer Loop
  useEffect(() => {
    if (!config.isRunning) return;

    const intervalTime = Math.max(100, Math.round(500 / config.speedMultiplier));

    const interval = setInterval(() => {
      setTickCount(prev => prev + 1);
      setSimulationTimeSec(prev => prev + 1);

      setPeers(prevPeers => {
        const result = runSimulationTick(
          prevPeers,
          packets,
          logs,
          metricsHistory,
          config,
          tickCount,
          faultStats
        );

        setPackets(result.nextPackets);
        setLogs(result.nextLogs);
        setMetricsHistory(result.nextMetrics);
        if (result.nextFaultStats) {
          setFaultStats(result.nextFaultStats);
        }

        // Confetti ONLY on 100% Leecher completion (Promotion to Seeder)
        const hasPromotion = result.nextLogs.some(l => l.level === 'success' && l.message.includes('PROMOTED TO SEEDER'));
        if (hasPromotion) {
          try {
            if (confettiCanvasRef.current && typeof confettiCanvasRef.current.getBoundingClientRect === 'function') {
              if (!confettiInstanceRef.current && typeof confetti.create === 'function') {
                confettiInstanceRef.current = confetti.create(confettiCanvasRef.current, {
                  resize: true,
                  useWorker: false
                });
              }
              if (confettiInstanceRef.current) {
                confettiInstanceRef.current({
                  particleCount: 50,
                  spread: 70,
                  origin: { y: 0.6 }
                });
              }
            }
          } catch (err) {
            // Silently swallow canvas errors
          }
        }

        return result.nextPeers;
      });

    }, intervalTime);

    return () => clearInterval(interval);
  }, [config, packets, logs, metricsHistory, tickCount]);

  // Handle Topology Change
  const handleChangeTopology = useCallback((newTopo: TopologyType) => {
    setConfig(prev => ({ ...prev, topology: newTopo }));
    setPeers(prev => calculateTopologyPositions(prev, newTopo));
    setLogs(prev => [
      generateEventLog(
        'info',
        'SYSTEM',
        `Swarm Topology updated to ${newTopo.toUpperCase()} model`,
        undefined,
        'Recalculated force-directed nodal vector coordinates'
      ),
      ...prev
    ]);
  }, []);

  // Handlers for Control Panel Actions
  const handleAddSeeder = () => {
    const seeder = createNewRandomPeer('seeder');
    setPeers(prev => calculateTopologyPositions([...prev, seeder], config.topology));
    setLogs(prev => [
      generateEventLog('success', seeder.id, `New Seeder ${seeder.name} spawned with 100% payload`, 'tracker-01'),
      ...prev
    ]);
  };

  const handleAddLeecher = () => {
    const leecher = createNewRandomPeer('leecher');
    setPeers(prev => calculateTopologyPositions([...prev, leecher], config.topology));
    setLogs(prev => [
      generateEventLog('info', leecher.id, `New Leecher ${leecher.name} joined swarm`, 'tracker-01'),
      ...prev
    ]);
  };

  const handleDisconnectRandom = () => {
    setPeers(prev => {
      const activePeers = prev.filter(p => p.type !== 'tracker' && p.status !== 'disconnected');
      if (activePeers.length === 0) return prev;
      const victim = activePeers[Math.floor(Math.random() * activePeers.length)];
      
      setLogs(l => [
        generateEventLog('warning', victim.id, `Peer ${victim.name} forcibly disconnected from swarm`),
        ...l
      ]);

      return prev.map(p => p.id === victim.id ? { ...p, status: 'disconnected', connectedPeers: [] } : p);
    });
  };

  const handleSpawnSwarm = () => {
    const newPeers: PeerNode[] = [];
    for (let i = 0; i < 15; i++) {
      newPeers.push(createNewRandomPeer(Math.random() < 0.25 ? 'seeder' : 'leecher'));
    }
    setPeers(prev => calculateTopologyPositions([...prev, ...newPeers], config.topology));
    setLogs(prev => [
      generateEventLog('tracker', 'SYSTEM', `Mass Swarm expansion: 15 nodes registered into swarm`),
      ...prev
    ]);
  };

  const handleInjectFailure = (failure: FailureType) => {
    setConfig(prev => ({ ...prev, activeFailure: failure }));
    setLogs(prev => [
      generateEventLog('error', 'CHAOS_ENGINE', `INJECTED NETWORK CHAOS: ${failure.toUpperCase()}`),
      ...prev
    ]);
  };

  const handleRecoverNetwork = () => {
    setConfig(prev => ({ ...prev, activeFailure: 'none' }));
    setPeers(prev => prev.map(p => ({
      ...p,
      status: p.type === 'malicious' ? 'blocked' : 'active',
      latency: Math.floor(Math.random() * 40) + 15,
      packetLoss: parseFloat((Math.random() * 0.5).toFixed(1))
    })));
    setLogs(prev => [
      generateEventLog('success', 'RECOVERY', `Network Chaos recovered. Latency and packet loss restored.`),
      ...prev
    ]);
  };

  const handleReset = () => {
    setPeers(calculateTopologyPositions(createInitialPeers(), 'mesh'));
    setPackets([]);
    setLogs([generateEventLog('info', 'SYSTEM', 'Simulation reset to baseline state')]);
    setSimulationTimeSec(0);
    setTickCount(0);
  };

  const handleExportState = () => {
    setIsExportOpen(true);
  };

  const handleTakeScreenshot = () => {
    window.print();
  };

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement) return;
      if (e.code === 'Space') {
        e.preventDefault();
        setConfig(prev => ({ ...prev, isRunning: !prev.isRunning }));
      } else if (e.code === 'KeyR') {
        handleReset();
      } else if (e.code === 'KeyF') {
        handleInjectFailure('high_latency');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const latestMetrics = metricsHistory[metricsHistory.length - 1] || {
    timestamp: Date.now(),
    timeLabel: '00:00',
    seeders: peers.filter(p => p.type === 'seeder').length,
    leechers: peers.filter(p => p.type === 'leecher').length,
    offline: 0,
    downloadSpeedMB: 12.4,
    uploadSpeedMB: 10.2,
    totalConnections: 24,
    avgLatency: 22,
    networkHealth: 96,
    completedPieces: 450,
    packetsPerSec: 12,
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col justify-between selection:bg-cyan-500 selection:text-slate-950 relative">
      
      {/* Navbar */}
      <Navbar
        config={config}
        setConfig={setConfig}
        viewMode={viewMode}
        setViewMode={setViewMode}
        simulationTimeSec={simulationTimeSec}
        onReset={handleReset}
        onInjectRandomFailure={() => handleInjectFailure('packet_loss_spike')}
        onExportState={handleExportState}
        onTakeScreenshot={handleTakeScreenshot}
        onOpenHelp={() => setIsHelpOpen(true)}
      />

      {/* Main Body */}
      <main className="flex-1 pb-10">
        
        {/* Top Hero Stats Bar */}
        <HeroMetricsBar
          peers={peers}
          latestMetrics={latestMetrics}
          activePacketCount={packets.length}
        />

        {/* Center Workspace Views */}
        <section className="px-4 py-2 max-w-7xl mx-auto">
          {viewMode === 'topology' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2 relative">
                  <MainNetworkCanvas
                    peers={peers}
                    packets={packets}
                    selectedPeerId={selectedPeer?.id || null}
                    onSelectPeer={(p) => setSelectedPeer(p)}
                    onSelectPacket={(pkt) => setSelectedPacket(pkt)}
                    config={config}
                    topology={config.topology}
                  />
                  <MiniMap 
                    peers={peers} 
                    packets={packets}
                    selectedPeerId={selectedPeer?.id || null}
                    onSelectPeer={(p) => setSelectedPeer(p)}
                  />
                </div>
                <div className="lg:col-span-1">
                  <LiveEventLog logs={logs} onClear={() => setLogs([])} />
                </div>
              </div>

              <ControlPanel
                onAddSeeder={handleAddSeeder}
                onAddLeecher={handleAddLeecher}
                onDisconnectRandom={handleDisconnectRandom}
                onSpawnSwarm={handleSpawnSwarm}
                onClearNetwork={() => setPeers([])}
                topology={config.topology}
                onChangeTopology={handleChangeTopology}
                activeFailure={config.activeFailure}
                onSetFailure={handleInjectFailure}
                onRecoverNetwork={handleRecoverNetwork}
              />

              <FaultToleranceMonitor
                stats={faultStats}
                activeFailure={config.activeFailure}
                onTriggerChaos={handleInjectFailure}
                onRecover={handleRecoverNetwork}
              />
            </div>
          )}

          {viewMode === 'world_map' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2">
                <WorldMapGlobeView
                  peers={peers}
                  packets={packets}
                  onSelectPeer={(p) => setSelectedPeer(p)}
                />
              </div>
              <div className="lg:col-span-1">
                <LiveEventLog logs={logs} onClear={() => setLogs([])} />
              </div>
            </div>
          )}

          {viewMode === 'dht' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2">
                <DHTVisualizerView peers={peers} />
              </div>
              <div className="lg:col-span-1">
                <LiveEventLog logs={logs} onClear={() => setLogs([])} />
              </div>
            </div>
          )}

          {viewMode === 'pieces_matrix' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2">
                <FilePiecesGrid
                  peers={peers}
                  strategy={config.pieceStrategy}
                  onSetStrategy={(strat) => setConfig(prev => ({ ...prev, pieceStrategy: strat }))}
                />
              </div>
              <div className="lg:col-span-1">
                <LiveEventLog logs={logs} onClear={() => setLogs([])} />
              </div>
            </div>
          )}

          {viewMode === 'analytics' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2">
                <AnalyticsSection metricsHistory={metricsHistory} />
              </div>
              <div className="lg:col-span-1">
                <LiveEventLog logs={logs} onClear={() => setLogs([])} />
              </div>
            </div>
          )}

          {viewMode === 'guide' && (
            <div className="w-full">
              <BeginnerGuideView />
            </div>
          )}
        </section>

      </main>

      {/* Peer Inspector Side Drawer */}
      <PeerInspectorDrawer
        peer={selectedPeer}
        onClose={() => setSelectedPeer(null)}
        onDisconnectPeer={(pId) => {
          setPeers(prev => prev.map(p => p.id === pId ? { ...p, status: 'disconnected' } : p));
          setSelectedPeer(null);
        }}
        onToggleChokePeer={(pId) => {
          setPeers(prev => prev.map(p => p.id === pId ? { ...p, status: p.status === 'choked' ? 'active' : 'choked' } : p));
        }}
      />

      {/* Packet Inspector Modal */}
      <PacketInspectorModal
        packet={selectedPacket}
        onClose={() => setSelectedPacket(null)}
      />

      {/* Quick Protocol Help Modal */}
      <QuickHelpModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
        onOpenFullGuide={() => setViewMode('guide')}
      />

      {/* Export & Report Modal */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        peers={peers}
        config={config}
        simulationTimeSec={simulationTimeSec}
        metricsHistory={metricsHistory}
        logs={logs}
      />

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-900 py-3 text-center text-xs font-mono text-slate-500">
        BitTorrent Swarm Protocol Simulator & Choking Analyzer &bull; University Network Systems Engineering
      </footer>

      {/* Confetti Overlay Canvas */}
      <canvas ref={confettiCanvasRef} className="fixed inset-0 pointer-events-none z-50 w-full h-full" />

    </div>
  );
}
