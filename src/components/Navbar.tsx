import React from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  AlertTriangle, 
  Download, 
  Camera, 
  Zap, 
  Sparkles, 
  HelpCircle,
  Network,
  Globe,
  Database,
  Grid,
  BarChart3,
  BookOpen
} from 'lucide-react';
import { SimulationConfig, ViewMode, FailureType } from '../types/p2p';

interface NavbarProps {
  config: SimulationConfig;
  setConfig: React.Dispatch<React.SetStateAction<SimulationConfig>>;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  simulationTimeSec: number;
  onReset: () => void;
  onInjectRandomFailure: () => void;
  onExportState: () => void;
  onTakeScreenshot: () => void;
  onOpenHelp: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  config,
  setConfig,
  viewMode,
  setViewMode,
  simulationTimeSec,
  onReset,
  onInjectRandomFailure,
  onExportState,
  onTakeScreenshot,
  onOpenHelp
}) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const speedPresets = [0.5, 1, 2, 5];

  return (
    <header className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-40 px-4 py-2.5 shadow-lg">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        
        {/* Brand Logo & Name */}
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-cyan-500/10 border border-cyan-500/30 rounded-xl shadow-[0_0_15px_rgba(6,182,212,0.25)] flex items-center justify-center">
            <Network className="w-6 h-6 text-cyan-400 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-base font-bold text-slate-100 tracking-wide font-mono">
                P2P TORRENT<span className="text-cyan-400">.SIM</span>
              </h1>
              <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                PRO PROTOCOL
              </span>
            </div>
            <p className="text-xs text-slate-400 font-sans">BitTorrent Swarm & Choking Analyzer</p>
          </div>
        </div>

        {/* View Mode Tabs */}
        <div className="flex items-center bg-slate-950/80 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setViewMode('topology')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              viewMode === 'topology'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Network className="w-3.5 h-3.5" />
            <span>Topology</span>
          </button>

          <button
            onClick={() => setViewMode('world_map')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              viewMode === 'world_map'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Geo Map</span>
          </button>

          <button
            onClick={() => setViewMode('dht')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              viewMode === 'dht'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>DHT Matrix</span>
          </button>

          <button
            onClick={() => setViewMode('pieces_matrix')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              viewMode === 'pieces_matrix'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
            <span>Pieces (100)</span>
          </button>

          <button
            onClick={() => setViewMode('analytics')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              viewMode === 'analytics'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Analytics</span>
          </button>

          <button
            onClick={() => setViewMode('guide')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              viewMode === 'guide'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                : 'text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Guide</span>
          </button>
        </div>

        {/* Primary Simulation Controls */}
        <div className="flex items-center space-x-2">
          {/* Status Indicator */}
          <div className="flex items-center space-x-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 font-mono text-xs">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                config.isRunning
                  ? 'bg-emerald-400 animate-ping shadow-[0_0_8px_rgba(52,211,153,0.8)]'
                  : 'bg-amber-400'
              }`}
            />
            <span className={config.isRunning ? 'text-emerald-400 font-bold' : 'text-amber-400'}>
              {config.isRunning ? 'LIVE RUNNING' : 'PAUSED'}
            </span>
            <span className="text-slate-500">|</span>
            <span className="text-slate-300">{formatTime(simulationTimeSec)}</span>
          </div>

          {/* Play/Pause */}
          <button
            onClick={() => setConfig(prev => ({ ...prev, isRunning: !prev.isRunning }))}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all shadow-md ${
              config.isRunning
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30'
                : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.4)]'
            }`}
          >
            {config.isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-slate-950" />}
            <span>{config.isRunning ? 'Pause' : 'Start'}</span>
          </button>

          {/* Reset */}
          <button
            onClick={onReset}
            className="p-1.5 bg-slate-800 text-slate-300 hover:text-white rounded-xl border border-slate-700 hover:bg-slate-700 transition-colors"
            title="Reset Simulation"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Speed Presets */}
          <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
            {speedPresets.map(sp => (
              <button
                key={sp}
                onClick={() => setConfig(prev => ({ ...prev, speedMultiplier: sp }))}
                className={`px-2 py-0.5 text-[11px] font-mono rounded-md font-semibold transition-colors ${
                  config.speedMultiplier === sp
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {sp}x
              </button>
            ))}
          </div>

          {/* Inject Failure */}
          <button
            onClick={onInjectRandomFailure}
            className="px-2.5 py-1.5 bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500/20 rounded-xl text-xs font-semibold flex items-center space-x-1 transition-all"
            title="Inject Random Network Failure"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
            <span className="hidden sm:inline">Inject Chaos</span>
          </button>

          {/* Export Menu */}
          <button
            onClick={onExportState}
            className="px-2.5 py-1.5 bg-slate-800 text-slate-200 hover:text-white hover:bg-slate-700 rounded-xl border border-slate-700 text-xs font-semibold font-mono flex items-center space-x-1 transition-all"
            title="Export Simulation Reports & Data"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Export</span>
          </button>

          {/* Screenshot */}
          <button
            onClick={onTakeScreenshot}
            className="p-1.5 bg-slate-800 text-slate-300 hover:text-white rounded-xl border border-slate-700 hover:bg-slate-700 transition-colors"
            title="Take Screenshot"
          >
            <Camera className="w-4 h-4" />
          </button>

          {/* Help / Info */}
          <button
            onClick={onOpenHelp}
            className="p-1.5 bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 rounded-xl border border-cyan-500/30 transition-colors"
            title="BitTorrent Protocol Architecture Guide"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>

      </div>
    </header>
  );
};
