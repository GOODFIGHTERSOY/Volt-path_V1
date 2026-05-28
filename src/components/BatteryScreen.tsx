import React, { useState } from 'react';
import { 
  Cpu, 
  Grid3X3, 
  TrendingUp, 
  AlertOctagon, 
  Zap, 
  History, 
  ShieldAlert,
  HelpCircle,
  TrendingDown,
  BarChart3,
  Activity
} from 'lucide-react';

export default function BatteryScreen() {
  const [selectedCell, setSelectedCell] = useState<number | null>(42);
  const [anomalyFixed, setAnomalyFixed] = useState(false);
  const [chartTab, setChartTab] = useState<'degradation' | 'cycles'>('degradation');
  const [hoveredMonth, setHoveredMonth] = useState<number | null>(null);
  const [hoveredCycleMonth, setHoveredCycleMonth] = useState<number | null>(null);

  // 8 months historical charge cycles
  const cycleHistoryData = [
    { month: 'Oct', ac: 11, dc: 3 },
    { month: 'Nov', ac: 13, dc: 4 },
    { month: 'Dec', ac: 10, dc: 5 },
    { month: 'Jan', ac: 14, dc: 2 },
    { month: 'Feb', ac: 12, dc: 3 },
    { month: 'Mar', ac: 15, dc: 4 },
    { month: 'Apr', ac: 11, dc: 5 },
    { month: 'May', ac: 12, dc: 2 },
  ];

  // Auto-generate 37 data points for cumulative 36-month SOH curve
  const points = [];
  for (let m = 0; m <= 36; m++) {
    const x = 5 + (m / 36) * 90;
    const soh = 100 - (m * 0.1815) + (m * m * 0.00055);
    const y = 15 + (100 - soh) * 7;
    points.push({ m, x, y, soh: Number(soh).toFixed(1) });
  }
  const pathD = `M ${points.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' L ')}`;
  const areaD = `${pathD} L 95,95 L 5,95 Z`;

  // State for Battery Health Intelligence charts
  const [activeBatteryTab, setActiveBatteryTab] = useState<'degradation' | 'cycles'>('degradation');
  const [hoveredDegIndex, setHoveredDegIndex] = useState<number | null>(null);
  const [hoveredCycleIndex, setHoveredCycleIndex] = useState<number | null>(null);

  // Historical battery health degradation data (12 months)
  const historicalSohData = [
    { month: 'Jun 25', soh: 96.8, temp: 24.5, cycles: 410 },
    { month: 'Jul 25', soh: 96.5, temp: 25.2, cycles: 418 },
    { month: 'Aug 25', soh: 96.1, temp: 26.1, cycles: 425 },
    { month: 'Sep 25', soh: 95.8, temp: 24.8, cycles: 432 },
    { month: 'Oct 25', soh: 95.5, temp: 23.9, cycles: 439 },
    { month: 'Nov 25', soh: 95.2, temp: 23.5, cycles: 446 },
    { month: 'Dec 25', soh: 95.0, temp: 23.1, cycles: 452 },
    { month: 'Jan 26', soh: 94.8, temp: 22.8, cycles: 460 },
    { month: 'Feb 26', soh: 94.6, temp: 23.2, cycles: 466 },
    { month: 'Mar 26', soh: 94.4, temp: 24.0, cycles: 472 },
    { month: 'Apr 26', soh: 94.3, temp: 24.6, cycles: 478 },
    { month: 'May 26', soh: 94.2, temp: 25.1, cycles: 482 },
  ];

  // Charge cycles record (last 6 months, Grouped AC vs DC fast charging)
  const monthlyCyclesData = [
    { month: 'Dec', ac: 16, dc: 4 },
    { month: 'Jan', ac: 19, dc: 5 },
    { month: 'Feb', ac: 12, dc: 3 },
    { month: 'Mar', ac: 15, dc: 6 },
    { month: 'Apr', ac: 18, dc: 4 },
    { month: 'May', ac: 14, dc: 6 },
  ];

  // 120 modules representation
  const totalModules = 120;
  const anomalies = [42, 89];

  // Helper metrics for cells
  const getCellStats = (id: number) => {
    const isAnomaly = anomalies.includes(id) && !anomalyFixed;
    return {
      voltage: isAnomaly ? 3.61 : (3.78 + (id % 10) * 0.01).toFixed(2),
      temp: isAnomaly ? 38.4 : (23.5 + (id % 8) * 0.2).toFixed(1),
      resistance: isAnomaly ? 4.9 : (1.8 + (id % 5) * 0.1).toFixed(1),
      status: isAnomaly ? 'Minor Voltage Sag' : 'Optimal',
      cycles: 480 + (id % 12)
    };
  };

  const currentCellStats = selectedCell !== null ? getCellStats(selectedCell) : null;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header section with telemetry active sync status */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="font-sans text-xl font-bold text-on-surface">Battery Pack Telemetry</h2>
          <p className="font-mono text-xs text-on-surface-variant flex items-center gap-2 mt-1">
            <Cpu size={14} className="text-surface-tint" />
            Digital Twin Analyzer (Pack-ID: <span className="font-bold text-surface-tint">NEX-992-MAX</span>)
          </p>
        </div>
        <div className="flex items-center gap-2">
          {!anomalyFixed ? (
            <button 
              onClick={() => {
                setAnomalyFixed(true);
                if (selectedCell !== null) setSelectedCell(selectedCell);
              }}
              className="bg-error/20 hover:bg-error/30 text-error font-mono text-xs py-1.5 px-3 rounded-lg border border-error/30 cursor-pointer flex items-center gap-1.5 transition-all"
            >
              <ShieldAlert size={14} />
              Balance Voltages (Fast Repair)
            </button>
          ) : (
            <div className="bg-tertiary-fixed/10 text-tertiary-fixed font-mono text-xs py-1.5 px-3 rounded-lg border border-tertiary-fixed/20 flex items-center gap-1.5">
              <CheckCircleIcon /> Cell Balance Complete
            </div>
          )}
        </div>
      </div>

      {/* Grid: Cell Matrix Left + Degradation Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Cell matrix dynamic layout */}
        <div className="col-span-12 lg:col-span-7 glass-panel rounded-xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start flex-wrap gap-4 mb-4">
              <div>
                <h3 className="font-sans text-base font-bold text-on-surface flex items-center gap-2">
                  <Grid3X3 className="text-surface-tint" size={18} />
                  Cell Matrix Topology
                </h3>
                <p className="font-mono text-[10px] text-on-surface-variant mt-1">
                  Voltage distributions across {totalModules} active Li-ion modules
                </p>
              </div>

              {/* Status Map Legend */}
              <div className="flex items-center gap-4 font-mono text-[10px]">
                <div className="flex items-center gap-1.5 text-on-surface-variant">
                  <span className="w-3 h-3 rounded-[2px] bg-surface-tint/20 border border-surface-tint/50"></span> Optimal
                </div>
                {!anomalyFixed && (
                  <div className="flex items-center gap-1.5 text-error">
                    <span className="w-3 h-3 rounded-[2px] bg-error animate-pulse shadow-[0_0_8px_rgba(255,180,171,0.6)]"></span> Warning (Sag)
                  </div>
                )}
              </div>
            </div>

            {/* Matrix grid container */}
            <div className="bg-surface-container-lowest/70 rounded-lg p-4 border border-white/5 relative min-h-[220px] flex items-center justify-center">
              <div className="grid grid-cols-10 sm:grid-cols-12 md:grid-cols-15 gap-2 w-full content-start">
                {Array.from({ length: totalModules }).map((_, idx) => {
                  const id = idx + 1;
                  const isAnomaly = anomalies.includes(id) && !anomalyFixed;
                  const isSelected = selectedCell === id;

                  return (
                    <button
                      key={id}
                      onClick={() => setSelectedCell(id)}
                      title={`Cell Module M-${id}`}
                      className={`w-full aspect-square rounded-[3px] transition-all duration-200 cursor-pointer border-0 ${
                        isAnomaly 
                          ? 'bg-error animate-pulse shadow-[0_0_8px_rgba(255,180,171,0.6)]' 
                          : isSelected 
                            ? 'bg-white scale-110 shadow-[0_0_12px_#ffffff]' 
                            : 'bg-surface-tint/20 hover:bg-surface-tint/70 hover:scale-115'
                      }`}
                    />
                  );
                })}
              </div>
            </div>
          </div>

          {/* Detailed cell inspection card */}
          {currentCellStats && (
            <div className="mt-6 p-4 rounded-lg bg-surface-container-high/60 border border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-start gap-3">
                <div className={`mt-0.5 p-1 rounded-full ${anomalies.includes(selectedCell!) && !anomalyFixed ? 'bg-error/20 text-error' : 'bg-surface-tint/10 text-surface-tint'}`}>
                  {anomalies.includes(selectedCell!) && !anomalyFixed ? <AlertOctagon size={16} /> : <Zap size={16} />}
                </div>
                <div>
                  <h4 className="font-mono text-xs font-bold text-on-surface">MODULE M-{selectedCell} DIAGNOSTICS</h4>
                  <p className="font-sans text-[11px] text-on-surface-variant flex items-center gap-1.5 mt-1">
                    Status: <span className={anomalies.includes(selectedCell!) && !anomalyFixed ? 'text-error font-bold' : 'text-tertiary-fixed font-bold'}>{currentCellStats.status}</span>
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-6 font-mono text-[11px] text-left">
                <div>
                  <span className="block text-on-surface-variant uppercase text-[9px]">Voltage</span>
                  <span className={`text-[13px] font-bold ${anomalies.includes(selectedCell!) && !anomalyFixed ? 'text-error' : 'text-primary'}`}>
                    {currentCellStats.voltage}V
                  </span>
                </div>
                <div>
                  <span className="block text-on-surface-variant uppercase text-[9px]">Temp</span>
                  <span className="text-[13px] text-on-surface font-bold">
                    {currentCellStats.temp}°C
                  </span>
                </div>
                <div>
                  <span className="block text-on-surface-variant uppercase text-[9px]">Internal R</span>
                  <span className="text-[13px] text-on-surface font-bold">
                    {currentCellStats.resistance} mΩ
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Battery Health Intelligence (Degradation + Cycles) */}
        <div className="col-span-12 lg:col-span-5 glass-panel rounded-xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-1">
              <h3 className="font-sans text-base font-bold text-on-surface flex items-center gap-2">
                <TrendingUp className="text-surface-tint" size={18} />
                Battery Health Intelligence
              </h3>
              
              {/* Tab Selector Buttons */}
              <div className="flex bg-surface-container-low p-1 rounded-lg border border-white/5 font-mono text-[10px]">
                <button
                  onClick={() => setActiveBatteryTab('degradation')}
                  className={`px-2.5 py-1 font-bold rounded transition-all cursor-pointer ${
                    activeBatteryTab === 'degradation'
                      ? 'bg-surface-tint text-surface-dim font-black'
                      : 'text-on-surface-variant hover:text-primary'
                  }`}
                >
                  Degradation
                </button>
                <button
                  onClick={() => setActiveBatteryTab('cycles')}
                  className={`px-2.5 py-1 font-bold rounded transition-all cursor-pointer ${
                    activeBatteryTab === 'cycles'
                      ? 'bg-surface-tint text-surface-dim font-black'
                      : 'text-on-surface-variant hover:text-primary'
                  }`}
                >
                  Cycles
                </button>
              </div>
            </div>
            <p className="font-mono text-[10px] text-on-surface-variant">
              {activeBatteryTab === 'degradation' 
                ? 'Historical state of health (SOH) timeline trends' 
                : 'Month-by-month AC slow vs DC fast charging cycles'}
            </p>
          </div>

          {activeBatteryTab === 'degradation' ? (
            /* Historical degradation chart */
            <div className="relative w-full h-[220px] flex flex-col justify-end mt-4">
              {/* SOH Line graph */}
              <div className="relative h-[160px] w-full">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
                  {/* Grid Lines */}
                  <line x1="0" y1="15" x2="100" y2="15" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" strokeDasharray="2,2" />
                  <line x1="0" y1="50" x2="100" y2="50" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" strokeDasharray="2,2" />
                  <line x1="0" y1="85" x2="100" y2="85" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" strokeDasharray="2,2" />
                  
                  {/* SOH line area filled with gradient */}
                  <path
                    d={`${historicalSohData.map((d, i) => `${i === 0 ? 'M' : 'L'} ${5 + (i * 90) / 11} ${85 - ((d.soh - 94.0) / 3.0) * 70}`).join(' ')} L 95 95 L 5 95 Z`}
                    fill="url(#degradGradient)"
                    className="transition-all duration-300"
                  />

                  {/* SOH line path */}
                  <path
                    d={historicalSohData.map((d, i) => `${i === 0 ? 'M' : 'L'} ${5 + (i * 90) / 11} ${85 - ((d.soh - 94.0) / 3.0) * 70}`).join(' ')}
                    fill="none"
                    stroke="#14b8a6"
                    strokeWidth="2.5"
                    className="drop-shadow-[0_0_6px_#14b8a6] transition-all duration-300"
                  />

                  {/* National average comparison line (dashed red-orange/gray) */}
                  <path
                    d="M 5,20 Q 30,30 65,55 T 95,78"
                    fill="none"
                    stroke="rgba(255,255,255,0.15)"
                    strokeWidth="1.5"
                    strokeDasharray="3,3"
                  />

                  {/* Intersecting hovered vertical guide */}
                  {hoveredDegIndex !== null && (
                    <line
                      x1={5 + (hoveredDegIndex * 90) / 11}
                      y1="5"
                      x2={5 + (hoveredDegIndex * 90) / 11}
                      y2="95"
                      stroke="rgba(20,184,166,0.3)"
                      strokeWidth="1"
                      strokeDasharray="2,2"
                    />
                  )}

                  {/* Circles for chart points */}
                  {historicalSohData.map((d, i) => {
                    const cx = 5 + (i * 90) / 11;
                    const cy = 85 - ((d.soh - 94.0) / 3.0) * 70;
                    return (
                      <g key={i}>
                        <circle
                          cx={cx}
                          cy={cy}
                          r={hoveredDegIndex === i ? "4" : "2"}
                          fill={hoveredDegIndex === i ? "#ffffff" : "#14b8a6"}
                          stroke="#14b8a6"
                          strokeWidth="1"
                          className="cursor-pointer transition-all duration-150"
                          onMouseEnter={() => setHoveredDegIndex(i)}
                          onClick={() => setHoveredDegIndex(i)}
                        />
                        {/* Invisible larger hover captures */}
                        <circle
                          cx={cx}
                          cy={cy}
                          r="12"
                          fill="transparent"
                          className="cursor-pointer"
                          onMouseEnter={() => setHoveredDegIndex(i)}
                        />
                      </g>
                    );
                  })}

                  <defs>
                    <linearGradient id="degradGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.2" />
                      <stop offset="100%" stopColor="#14b8a6" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>

              {/* Dynamic tooltip box inside of panel */}
              <div className="h-10 mt-2 relative flex items-center justify-between border-t border-white/5 pt-1">
                {hoveredDegIndex !== null ? (
                  <div className="flex justify-between items-center w-full text-[10px] font-mono">
                    <span className="text-white"><span className="text-slate-500">Month:</span> {historicalSohData[hoveredDegIndex].month}</span>
                    <span className="text-[#14b8a6] font-bold font-mono text-xs"><span className="text-slate-500 font-normal">SOH:</span> {historicalSohData[hoveredDegIndex].soh}%</span>
                    <span className="text-white"><span className="text-slate-500">Cycles:</span> {historicalSohData[hoveredDegIndex].cycles}</span>
                    <span className="text-slate-300">{historicalSohData[hoveredDegIndex].temp}°C PackTemp</span>
                  </div>
                ) : (
                  <div className="w-full text-center text-[10px] font-mono text-on-surface-variant flex items-center justify-center gap-1.5 animate-pulse">
                    Hover points to view granular monthly intelligence
                  </div>
                )}
              </div>

              {/* Legend with values info */}
              <div className="flex justify-between items-center mt-3 border-t border-white/5 pt-3">
                <div className="flex gap-4 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-0.5 bg-[#14b8a6]"></div>
                    <span className="font-mono text-[9px] text-on-surface-variant">Your Active Twin (94.2% today)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-0.5 border-t border-dashed border-white/30"></div>
                    <span className="font-mono text-[9px] text-on-surface-variant">Natl Average (92.1%)</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Historical group/stacked charge cycles chart */
            <div className="relative w-full h-[220px] flex flex-col justify-end mt-4">
              <div className="relative h-[160px] w-full">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
                  {/* Grid Lines */}
                  <line x1="0" y1="15" x2="100" y2="15" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
                  <line x1="0" y1="52.5" x2="100" y2="52.5" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
                  <line x1="0" y1="90" x2="100" y2="90" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />

                  {/* Y-axis values labels on absolute coordinates */}
                  {monthlyCyclesData.map((d, i) => {
                    const xCenter = 12 + i * 15.5;
                    const acHeight = (d.ac / 25) * 75;
                    const acY = 90 - acHeight;
                    const dcHeight = (d.dc / 25) * 75;
                    const dcY = 90 - dcHeight;

                    const isHovered = hoveredCycleIndex === i;

                    return (
                      <g key={i} className="group cursor-pointer">
                        {/* AC smart charging bar (Teal) */}
                        <rect
                          x={xCenter - 4.5}
                          y={acY}
                          width="3.5"
                          height={acHeight}
                          fill={isHovered ? "#2dd4bf" : "#14b8a6"}
                          rx="1"
                          onClick={() => setHoveredCycleIndex(i)}
                          onMouseEnter={() => setHoveredCycleIndex(i)}
                          className="transition-all duration-300"
                        />
                        {/* DC fast charging bar (Error Red/Rose) */}
                        <rect
                          x={xCenter + 1}
                          y={dcY}
                          width="3.5"
                          height={dcHeight}
                          fill={isHovered ? "#ff8a9a" : "#f43f5e"}
                          rx="1"
                          onClick={() => setHoveredCycleIndex(i)}
                          onMouseEnter={() => setHoveredCycleIndex(i)}
                          className="transition-all duration-300"
                        />
                        {/* Hidden tall catch overlay */}
                        <rect
                          x={xCenter - 6}
                          y="5"
                          width="12"
                          height="85"
                          fill="transparent"
                          onMouseEnter={() => setHoveredCycleIndex(i)}
                        />
                      </g>
                    );
                  })}
                </svg>

                {/* X labels */}
                <div className="absolute bottom-1.5 left-0 w-full flex justify-between px-3 text-[10px] font-mono text-slate-500">
                  {monthlyCyclesData.map((d, i) => (
                    <span 
                      key={i} 
                      className={`text-center flex-1 transition-colors ${hoveredCycleIndex === i ? 'text-white font-bold' : ''}`}
                    >
                      {d.month}
                    </span>
                  ))}
                </div>
              </div>

              {/* Dynamic cycle stats feedback */}
              <div className="h-10 mt-2 relative flex items-center justify-between border-t border-white/5 pt-1">
                {hoveredCycleIndex !== null ? (
                  <div className="flex justify-between items-center w-full text-[10px] font-mono">
                    <span className="text-white"><span className="text-slate-500">Month:</span> {monthlyCyclesData[hoveredCycleIndex].month}</span>
                    <span className="text-[#14b8a6] font-bold"><span className="text-slate-500 font-normal">AC Slow:</span> {monthlyCyclesData[hoveredCycleIndex].ac}</span>
                    <span className="text-[#f43f5e] font-bold"><span className="text-slate-500 font-normal">DC Fast:</span> {monthlyCyclesData[hoveredCycleIndex].dc}</span>
                    <span className="text-slate-300 font-bold">Total: {monthlyCyclesData[hoveredCycleIndex].ac + monthlyCyclesData[hoveredCycleIndex].dc} Cycles</span>
                  </div>
                ) : (
                  <div className="w-full text-center text-[10px] font-mono text-on-surface-variant flex items-center justify-center gap-1.5 animate-pulse">
                    Hover columns to view monthly AC vs DC Fast ratios
                  </div>
                )}
              </div>

              {/* Group Chart Legend */}
              <div className="flex justify-between items-center mt-3 border-t border-white/5 pt-3">
                <div className="flex gap-4">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-[2px] bg-[#14b8a6]"></span>
                    <span className="font-mono text-[9px] text-on-surface-variant">AC Slow Home (82% avg)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-[2px] bg-[#f43f5e]"></span>
                    <span className="font-mono text-[9px] text-on-surface-variant">DC Fast Highway (18% avg)</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Small statistics row widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
        
        {/* Widget 1 */}
        <div className="glass-panel rounded-xl p-5 border border-white/5 hover:border-surface-tint/20 transition-all">
          <div className="flex justify-between items-center mb-2">
            <span className="text-on-surface-variant"><History size={18} /></span>
            <span className="font-mono text-[9px] text-tertiary-fixed bg-tertiary-fixed/10 px-2 py-0.5 rounded font-bold">+14 cycles this month</span>
          </div>
          <h4 className="font-mono text-xs text-on-surface-variant uppercase tracking-widest">Total Cycle Count</h4>
          <p className="font-mono text-xl text-primary font-bold mt-1">482 <span className="text-xs text-on-surface-variant">cycles</span></p>
        </div>

        {/* Widget 2 */}
        <div className="glass-panel rounded-xl p-5 border border-white/5 hover:border-surface-tint/20 transition-all">
          <div className="flex justify-between items-center mb-2">
            <span className="text-on-surface-variant"><Zap size={18} /></span>
            <span className="font-mono text-[9px] text-surface-tint bg-surface-tint/10 px-2 py-0.5 rounded font-bold">DC Fast Heavy</span>
          </div>
          <h4 className="font-mono text-xs text-on-surface-variant uppercase tracking-widest">Fast Charge Ratio</h4>
          <div className="flex items-center gap-3 mt-1 font-mono">
            <p className="font-mono text-xl text-primary font-bold whitespace-nowrap">34% <span className="text-xs text-on-surface-variant font-sans">DC</span></p>
            <div className="w-full bg-surface-container-lowest h-1.5 rounded-full overflow-hidden">
              <div className="h-full bg-surface-tint shadow-[0_0_6px_#14b8a6]" style={{ width: '34%' }}></div>
            </div>
          </div>
        </div>

        {/* Widget 3 */}
        <div className="glass-panel rounded-xl p-5 border border-white/5 hover:border-surface-tint/20 transition-all">
          <div className="flex justify-between items-center mb-2">
            <span className="text-on-surface-variant"><TrendingUp size={18} /></span>
            <span className="font-mono text-[9px] text-on-surface-variant font-bold border border-white/10 px-2 py-0.5 rounded">Limit: 310kW</span>
          </div>
          <h4 className="font-mono text-xs text-on-surface-variant uppercase tracking-widest">Peak Sustained Discharge</h4>
          <p className="font-mono text-xl text-primary font-bold mt-1">285 <span className="text-xs text-on-surface-variant">kW</span></p>
        </div>
      </div>
    </div>
  );
}

// Clean simple helper
function check_circle(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4 text-tertiary-fixed">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}
function CheckCircleIcon() {
  return (
    <span className="inline-flex w-4 h-4 items-center justify-center">
      <span className="w-2 h-2 rounded-full bg-tertiary-fixed"></span>
    </span>
  );
}
