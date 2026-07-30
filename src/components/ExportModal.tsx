import React, { useState } from 'react';
import { 
  X, 
  FileText, 
  FileSpreadsheet, 
  FileJson, 
  Camera, 
  CheckCircle2, 
  Download
} from 'lucide-react';
import { PeerNode, SimulationConfig, MetricsHistoryEntry, EventLog } from '../types/p2p';
import { TOTAL_PIECES } from '../utils/p2pDefaults';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  peers: PeerNode[];
  config: SimulationConfig;
  simulationTimeSec: number;
  metricsHistory: MetricsHistoryEntry[];
  logs: EventLog[];
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  peers,
  config,
  simulationTimeSec,
  metricsHistory,
  logs
}) => {
  const [lastActionMessage, setLastActionMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const activePeers = peers.filter(p => p.status !== 'disconnected');
  const seeders = activePeers.filter(p => p.type === 'seeder');
  const leechers = activePeers.filter(p => p.type === 'leecher');
  const bootstrapNodes = activePeers.filter(p => p.type === 'bootstrap');
  const trackers = activePeers.filter(p => p.type === 'tracker');

  const latestMetric = metricsHistory[metricsHistory.length - 1] || {
    downloadSpeedMB: 15.4,
    uploadSpeedMB: 18.2,
    avgLatency: 45,
    networkHealth: 95
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const triggerDownload = (content: string, fileName: string, contentType: string) => {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Option 1: Download Professional HTML Report (Printable to PDF)
  const handleExportReportHTML = () => {
    const timestampStr = new Date().toLocaleString();
    const isoDate = new Date().toISOString().replace(/[:.]/g, '-');

    // Calculate piece completion matrix
    const pieceCounts = Array(TOTAL_PIECES).fill(0);
    peers.forEach(p => {
      if (p.status !== 'disconnected') {
        p.pieces.forEach((has, idx) => {
          if (has) pieceCounts[idx]++;
        });
      }
    });

    const pieceInSwarm = pieceCounts.filter(c => c > 0).length;

    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>P2P BitTorrent Swarm Simulation Report</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0f172a; color: #f8fafc; margin: 0; padding: 40px; }
    .report-card { max-width: 900px; margin: 0 auto; background: #1e293b; border: 1px solid #334155; border-radius: 16px; padding: 32px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.5); }
    .header { border-b: 2px solid #38bdf8; padding-bottom: 16px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center; }
    .title { font-size: 24px; font-weight: bold; color: #38bdf8; margin: 0; font-family: monospace; }
    .subtitle { font-size: 13px; color: #94a3b8; margin-top: 4px; }
    .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
    .kpi-box { background: #0f172a; border: 1px solid #334155; padding: 12px 16px; border-radius: 8px; }
    .kpi-label { font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: bold; }
    .kpi-val { font-size: 18px; font-weight: bold; color: #38bdf8; margin-top: 4px; font-family: monospace; }
    table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 13px; }
    th { background: #0f172a; color: #38bdf8; text-align: left; padding: 10px; border-bottom: 2px solid #334155; font-family: monospace; }
    td { padding: 10px; border-bottom: 1px solid #334155; }
    .badge { padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: bold; font-family: monospace; }
    .seeder { background: rgba(52, 211, 153, 0.2); color: #34d399; }
    .leecher { background: rgba(56, 189, 248, 0.2); color: #38bdf8; }
    .tracker { background: rgba(192, 132, 252, 0.2); color: #c084fc; }
    .print-btn { background: #38bdf8; color: #0f172a; font-weight: bold; padding: 10px 20px; border: none; border-radius: 8px; cursor: pointer; float: right; margin-bottom: 16px; }
    @media print { body { background: #fff; color: #000; padding: 0; } .report-card { border: none; shadow: none; background: #fff; color: #000; } .print-btn { display: none; } .kpi-box { background: #f1f5f9; border-color: #cbd5e1; } .kpi-val { color: #0284c7; } th { background: #f1f5f9; color: #0284c7; } td { border-color: #e2e8f0; } }
  </style>
</head>
<body>
  <div class="report-card">
    <button class="print-btn" onclick="window.print()">🖨 Print / Save PDF</button>
    <div class="header">
      <div>
        <h1 class="title">P2P BITTORRENT SWARM SIMULATION REPORT</h1>
        <div class="subtitle">Generated on ${timestampStr} &bull; University Protocol Analyzer Engine</div>
      </div>
    </div>

    <h3>Executive Simulation Metrics</h3>
    <div class="grid">
      <div class="kpi-box">
        <div class="kpi-label">Simulation Runtime</div>
        <div class="kpi-val">${formatTime(simulationTimeSec)}</div>
      </div>
      <div class="kpi-box">
        <div class="kpi-label">Active Topology</div>
        <div class="kpi-val" style="text-transform: uppercase;">${config.topology}</div>
      </div>
      <div class="kpi-box">
        <div class="kpi-label">Swarm Size</div>
        <div class="kpi-val">${activePeers.length} Peers (${seeders.length}S / ${leechers.length}L)</div>
      </div>
      <div class="kpi-box">
        <div class="kpi-label">Swarm Health</div>
        <div class="kpi-val" style="color: #34d399;">${latestMetric.networkHealth}%</div>
      </div>
      <div class="kpi-box">
        <div class="kpi-label">Swarm Download Speed</div>
        <div class="kpi-val">${latestMetric.downloadSpeedMB.toFixed(1)} MB/s</div>
      </div>
      <div class="kpi-box">
        <div class="kpi-label">Average Latency (RTT)</div>
        <div class="kpi-val">${latestMetric.avgLatency} ms</div>
      </div>
      <div class="kpi-box">
        <div class="kpi-label">Piece Strategy</div>
        <div class="kpi-val" style="text-transform: uppercase;">${config.pieceStrategy}</div>
      </div>
      <div class="kpi-box">
        <div class="kpi-label">Active Chaos Injection</div>
        <div class="kpi-val" style="color: ${config.activeFailure !== 'none' ? '#f43f5e' : '#34d399'}">${config.activeFailure.toUpperCase()}</div>
      </div>
      <div class="kpi-box">
        <div class="kpi-label">Payload Availability</div>
        <div class="kpi-val">${pieceInSwarm} / ${TOTAL_PIECES} Pieces (100MB)</div>
      </div>
      <div class="kpi-box">
        <div class="kpi-label">Bootstrap / Trackers</div>
        <div class="kpi-val">${bootstrapNodes.length} BS / ${trackers.length} TRK</div>
      </div>
      <div class="kpi-box">
        <div class="kpi-label">Simulation Speed</div>
        <div class="kpi-val">${config.speedMultiplier}x Real-time</div>
      </div>
    </div>

    <h3>Swarm Node Inventory & Health Roster</h3>
    <table>
      <thead>
        <tr>
          <th>Node Name</th>
          <th>Type</th>
          <th>Location / IP</th>
          <th>Progress</th>
          <th>Upload (KB/s)</th>
          <th>Download (KB/s)</th>
          <th>Latency</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        ${peers.map(p => `
          <tr>
            <td><strong>${p.name}</strong></td>
            <td><span class="badge ${p.type}">${p.type.toUpperCase()}</span></td>
            <td>${p.ip || '192.168.1.1'} (${p.country || 'Global'})</td>
            <td>${p.progress}%</td>
            <td>${(p.uploadRate / 1024).toFixed(1)} KB/s</td>
            <td>${(p.downloadRate / 1024).toFixed(1)} KB/s</td>
            <td>${p.latency} ms</td>
            <td>${p.status.toUpperCase()}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>

    <h3 style="margin-top: 32px;">Recent Critical Swarm Events (Wireshark Audit Log)</h3>
    <table>
      <thead>
        <tr>
          <th>Timestamp</th>
          <th>Level</th>
          <th>Source / Target</th>
          <th>Event Message</th>
        </tr>
      </thead>
      <tbody>
        ${logs.slice(0, 10).map(l => `
          <tr>
            <td style="font-family: monospace;">${l.timestamp}</td>
            <td><span class="badge" style="background: rgba(255,255,255,0.1);">${l.level.toUpperCase()}</span></td>
            <td>${l.source || '-'} &rarr; ${l.target || '-'}</td>
            <td>${l.message}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>

    <div style="margin-top: 40px; text-align: center; color: #64748b; font-size: 11px; font-family: monospace;">
      End of Report &bull; P2P Swarm Simulator Output Data
    </div>
  </div>
</body>
</html>`;

    triggerDownload(htmlContent, `p2p_simulation_report_${isoDate}.html`, 'text/html');
    setLastActionMessage('Downloaded Simulation Report (HTML/PDF)');
  };

  // Option 2: Export Statistics CSV
  const handleExportCSV = () => {
    const isoDate = new Date().toISOString().replace(/[:.]/g, '-');
    const headers = ['Peer ID', 'Name', 'Type', 'Country', 'IP Address', 'Download Rate (KB/s)', 'Upload Rate (KB/s)', 'Latency (ms)', 'Packet Loss (%)', 'Progress (%)', 'Status', 'Health (%)'];

    const rows = peers.map(p => [
      p.id,
      `"${p.name}"`,
      p.type,
      `"${p.country || 'Global'}"`,
      p.ip || '127.0.0.1',
      (p.downloadRate / 1024).toFixed(1),
      (p.uploadRate / 1024).toFixed(1),
      p.latency,
      p.packetLoss,
      p.progress,
      p.status,
      p.health
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    triggerDownload(csvContent, `p2p_swarm_statistics_${isoDate}.csv`, 'text/csv');
    setLastActionMessage('Exported Swarm Statistics (.csv)');
  };

  // Option 3: Export Raw Simulation Data JSON
  const handleExportJSON = () => {
    const isoDate = new Date().toISOString().replace(/[:.]/g, '-');
    const exportData = {
      exportTimestamp: new Date().toISOString(),
      simulationTimeSec,
      config,
      peersCount: peers.length,
      peers,
      metricsHistory,
      recentLogs: logs.slice(0, 50)
    };

    triggerDownload(JSON.stringify(exportData, null, 2), `p2p_simulation_data_${isoDate}.json`, 'application/json');
    setLastActionMessage('Exported Raw Simulation Data (.json)');
  };

  // Option 4: Save Current Network Snapshot
  const handleExportSnapshot = () => {
    const isoDate = new Date().toISOString().replace(/[:.]/g, '-');
    const snapshotData = {
      snapshotVersion: '1.0',
      timestamp: Date.now(),
      topology: config.topology,
      activeFailure: config.activeFailure,
      pieceStrategy: config.pieceStrategy,
      speedMultiplier: config.speedMultiplier,
      nodes: peers.map(p => ({
        id: p.id,
        name: p.name,
        type: p.type,
        x: p.x,
        y: p.y,
        targetX: p.targetX,
        targetY: p.targetY,
        progress: p.progress,
        pieces: p.pieces,
        connectedPeers: p.connectedPeers,
        status: p.status,
        health: p.health
      }))
    };

    triggerDownload(JSON.stringify(snapshotData, null, 2), `p2p_network_snapshot_${isoDate}.json`, 'application/json');
    setLastActionMessage('Saved Current Network Snapshot (.json)');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl max-h-[85vh] overflow-y-auto font-sans">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-cyan-500/10 border border-cyan-500/30 rounded-xl">
              <Download className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100 font-mono">EXPORT SIMULATION DATA</h2>
              <p className="text-xs text-slate-400">Select export format & report type</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action Message Feedback */}
        {lastActionMessage && (
          <div className="bg-emerald-500/10 border-b border-emerald-500/20 px-4 py-2 flex items-center space-x-2 text-xs font-mono text-emerald-400">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{lastActionMessage}</span>
          </div>
        )}

        {/* Options List */}
        <div className="p-4 space-y-3">
          
          {/* Option 1: Printable HTML Report */}
          <button
            onClick={handleExportReportHTML}
            className="w-full text-left p-3.5 bg-slate-950 border border-slate-800 hover:border-cyan-500/50 hover:bg-slate-800/40 rounded-xl transition-all group flex items-start space-x-3"
          >
            <div className="p-2.5 bg-cyan-500/10 border border-cyan-500/30 rounded-lg group-hover:scale-105 transition-transform">
              <FileText className="w-5 h-5 text-cyan-400" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-100 group-hover:text-cyan-300 transition-colors">
                  Download Simulation Report (.html)
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-bold">
                  PDF READY
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Generates a formatted HTML report with KPI metrics, node inventory, and Wireshark audit logs suitable for printing to PDF.
              </p>
            </div>
          </button>

          {/* Option 2: Export CSV Statistics */}
          <button
            onClick={handleExportCSV}
            className="w-full text-left p-3.5 bg-slate-950 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-800/40 rounded-xl transition-all group flex items-start space-x-3"
          >
            <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-lg group-hover:scale-105 transition-transform">
              <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-100 group-hover:text-emerald-300 transition-colors">
                  Export Statistics (.csv)
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold">
                  EXCEL / CSV
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Download spreadsheet rows containing per-peer download/upload rates, latency, packet loss, progress, and health.
              </p>
            </div>
          </button>

          {/* Option 3: Export Raw JSON */}
          <button
            onClick={handleExportJSON}
            className="w-full text-left p-3.5 bg-slate-950 border border-slate-800 hover:border-purple-500/50 hover:bg-slate-800/40 rounded-xl transition-all group flex items-start space-x-3"
          >
            <div className="p-2.5 bg-purple-500/10 border border-purple-500/30 rounded-lg group-hover:scale-105 transition-transform">
              <FileJson className="w-5 h-5 text-purple-400" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-100 group-hover:text-purple-300 transition-colors">
                  Export Simulation Data (.json)
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/30 font-bold">
                  RAW DATA
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Full JSON dump of active configuration, metrics history, peers, and simulation parameters for developer analysis.
              </p>
            </div>
          </button>

          {/* Option 4: Save Network Snapshot */}
          <button
            onClick={handleExportSnapshot}
            className="w-full text-left p-3.5 bg-slate-950 border border-slate-800 hover:border-amber-500/50 hover:bg-slate-800/40 rounded-xl transition-all group flex items-start space-x-3"
          >
            <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-lg group-hover:scale-105 transition-transform">
              <Camera className="w-5 h-5 text-amber-400" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-100 group-hover:text-amber-300 transition-colors">
                  Save Current Network Snapshot (.json)
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 font-bold">
                  SNAPSHOT
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Saves current node positions, active peer links, bitfields, and topology state for reload or archiving.
              </p>
            </div>
          </button>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl font-mono transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
