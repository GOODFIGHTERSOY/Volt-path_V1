import React, { useState } from 'react';
import { 
  Sliders, 
  Watch, 
  Bolt, 
  AlertTriangle, 
  BatteryCharging, 
  MapPin, 
  Compass, 
  Calendar,
  CheckCircle2,
  Info,
  TrendingUp,
  Zap
} from 'lucide-react';

export default function ChargingScreen() {
  const [chargingStrategy, setChargingStrategy] = useState<'dc' | 'ac_smart'>('ac_smart');
  const [scheduled, setScheduled] = useState(false);
  const [selectedStation, setSelectedStation] = useState<string | null>(null);

  const [hoveredSpeedSoc, setHoveredSpeedSoc] = useState<number | null>(null);
  const [hoveredEnergyIdx, setHoveredEnergyIdx] = useState<number | null>(null);
  const [sessionHoverIdx, setSessionHoverIdx] = useState<number | null>(null);

  // CC-CV Charging Rate Curve Data points (10% to 100% SOC)
  const chargingSpeedProfile = [
    { soc: 10, dcRate: 48, acRate: 7.2 },
    { soc: 20, dcRate: 50, acRate: 7.2 },
    { soc: 30, dcRate: 50, acRate: 7.2 },
    { soc: 40, dcRate: 45, acRate: 7.2 },
    { soc: 50, dcRate: 40, acRate: 7.2 },
    { soc: 60, dcRate: 35, acRate: 7.2 },
    { soc: 70, dcRate: 28, acRate: 7.2 },
    { soc: 80, dcRate: 18, acRate: 7.2 },
    { soc: 90, dcRate: 8, acRate: 7.0 },
    { soc: 100, dcRate: 2, acRate: 2.0 },
  ];

  // 6-Month Energy consumption (kWh) over time
  const monthlyEnergyData = [
    { month: 'Nov', ac: 145, dc: 40 },
    { month: 'Dec', ac: 160, dc: 55 },
    { month: 'Jan', ac: 180, dc: 35 },
    { month: 'Feb', ac: 155, dc: 45 },
    { month: 'Mar', ac: 170, dc: 60 },
    { month: 'Apr', ac: 195, dc: 30 },
  ];

  // Dynamic values driven by strategy
  const internalResistanceRise = chargingStrategy === 'dc' ? '+2.4 mΩ' : '+0.3 mΩ';
  const resistanceWidth = chargingStrategy === 'dc' ? '75%' : '10%';
  const healthWarn = chargingStrategy === 'dc' ? 'DC fast charging cycles increase thermal impedance.' : 'Slow AC charger keeps cells in balanced chemistry thresholds.';

  // Simulated live charging rate mechanics for dual axes visualization
  const getDcSessionStats = (socIdx: number) => {
    const soc = 10 + socIdx * 10;
    let speed = 72; // Nexon Max DC fast peak
    if (soc > 50) {
      speed = Math.max(12, 72 - (soc - 50) * 1.35); // linear taper
    }
    const energy = ((soc / 100) * 40.5).toFixed(1);
    const temp = (30 + socIdx * 1.2).toFixed(1);
    return { soc, speed: Math.round(speed), energy, temp };
  };

  const getAcSessionStats = (socIdx: number) => {
    const soc = 10 + socIdx * 10;
    const speed = soc >= 90 ? 2.2 : 7.2; // drops to 2.2kW trickle
    const energy = ((soc / 100) * 40.5).toFixed(1);
    const temp = (25 + socIdx * 0.25).toFixed(1);
    return { soc, speed, energy, temp };
  };

  const sessionPoints = Array.from({ length: 10 }).map((_, idx) => {
    return chargingStrategy === 'dc' ? getDcSessionStats(idx) : getAcSessionStats(idx);
  });

  // Scale calculations for SVG dual plotting
  const speedCoordinates = sessionPoints.map((p, idx) => {
    const x = 5 + idx * 10;
    const y = 85 - (p.speed / 80) * 70;
    return { x, y, ...p, idx };
  });

  const energyCoordinates = sessionPoints.map((p, idx) => {
    const x = 5 + idx * 10;
    const y = 85 - (Number(p.energy) / 40.5) * 60;
    return { x, y };
  });

  const speedPathD = `M ${speedCoordinates.map(p => `${p.x},${p.y.toFixed(1)}`).join(' L ')}`;
  const energyPathD = `M ${energyCoordinates.map(p => `${p.x},${p.y.toFixed(1)}`).join(' L ')}`;
  const speedAreaD = `${speedPathD} L 95,95 L 5,95 Z`;
  const energyAreaD = `${energyPathD} L 95,95 L 5,95 Z`;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header section with interactive strategy toggle */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="font-sans text-xl font-bold text-on-surface">Charging Optimization & Forecast</h2>
          <p className="font-mono text-xs text-on-surface-variant mt-1">Smart scheduling based on Indian grid tariff waves and battery longevity</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-on-surface-variant font-bold">Strategy:</span>
          <div className="flex bg-surface-container-low p-1 rounded-lg border border-white/5">
            <button 
              onClick={() => setChargingStrategy('ac_smart')}
              className={`px-3 py-1 text-xs font-bold rounded transition-all cursor-pointer ${chargingStrategy === 'ac_smart' ? 'bg-surface-tint text-surface-dim' : 'text-on-surface-variant hover:text-primary'}`}
            >
              Smart AC (Optimal)
            </button>
            <button 
              onClick={() => setChargingStrategy('dc')}
              className={`px-3 py-1 text-xs font-bold rounded transition-all cursor-pointer ${chargingStrategy === 'dc' ? 'bg-error text-surface-dim' : 'text-on-surface-variant hover:text-primary'}`}
            >
              DC Rapid Boost
            </button>
          </div>
        </div>
      </div>

      {/* Grid: 24h Cost Curve left + Alerts/Status right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Cost & Health Curve Map */}
        <div className="col-span-12 lg:col-span-8 glass-panel rounded-xl p-6 flex flex-col justify-between">
          <div className="flex justify-between items-start flex-wrap gap-4 mb-6">
            <div>
              <h3 className="font-sans text-base font-bold text-on-surface flex items-center gap-2">
                <Watch className="text-surface-tint" size={18} />
                Cost &amp; Health Curve
              </h3>
              <p className="font-mono text-[10px] text-on-surface-variant mt-1">
                24 Hour grid pricing vs. battery heat stress forecast
              </p>
            </div>
            <div className="font-mono text-xs text-surface-tint bg-surface-tint/10 px-3 py-1 rounded border border-surface-tint/30 font-bold">
              Optimum Window: 2AM - 5AM (Off-Peak)
            </div>
          </div>

          {/* Curve Visualization Area */}
          <div className="relative w-full h-[220px] flex items-end">
            <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-on-surface-variant font-mono text-[10px] pb-6">
              <span>High Tariff</span>
              <span>Med Tariff</span>
              <span>Low Tariff</span>
            </div>

            <div className="ml-16 w-[calc(100%-64px)] h-[calc(100%-20px)] border-b border-l border-white/10 relative">
              {/* Dynamic SVG Curves */}
              <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                {/* Cost wave line */}
                <path d="M0,20 Q16,5 34,75 T68,90 T100,20" fill="none" stroke="rgba(255, 255, 255, 0.2)" strokeWidth="1" />
                               {/* Battery health safety coefficient index curve (cyan) */}
                <path d="M0,80 Q25,85 45,65 T75,45 T100,55 L100,100 L0,100 Z" fill="url(#healthGrad)" className="opacity-40" />
                <path d="M0,80 Q25,85 45,65 T75,45 T100,55" fill="none" stroke="#14b8a6" strokeWidth="2.5" className="drop-shadow-[0_0_4px_rgba(20, 184, 166, 0.5)]" />

                {/* Grid guidelines */}
                <line x1="0" y1="25" x2="100" y2="25" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" strokeDasharray="2,2" />
                <line x1="0" y1="50" x2="100" y2="50" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" strokeDasharray="2,2" />
                <line x1="0" y1="75" x2="100" y2="75" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" strokeDasharray="2,2" />

                <defs>
                  <linearGradient id="healthGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#14b8a6" stopOpacity="0" />
                  </linearGradient>
                </defs>
              </svg>

              {/* Recommended Highlight overlay box (2AM - 5AM / points 45 to 70 range on x axis) */}
              <div className="absolute top-0 bottom-0 bg-surface-tint/5 border-l border-r border-surface-tint/50" style={{ left: '48%', width: '26%' }}>
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-surface-container-high px-2 py-0.5 rounded text-surface-tint text-[8px] font-mono border border-surface-tint/20 whitespace-nowrap">
                  RECOMMENDED WINDOW
                </div>
              </div>
            </div>

            {/* X-axis tick labels */}
            <div className="absolute bottom-[-24px] left-16 w-[calc(100%-64px)] flex justify-between font-mono text-[9px] text-on-surface-variant">
              <span>12 PM</span>
              <span>6 PM</span>
              <span className="text-surface-tint font-bold">2 AM</span>
              <span className="text-surface-tint font-bold">5 AM</span>
              <span>12 PM</span>
            </div>
          </div>

          {/* Under action scheduler */}
          <div className="mt-8 flex flex-col sm:flex-row justify-between items-center bg-surface-container-high/40 p-4 rounded-xl border border-white/5 gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-surface-tint/10 rounded-full text-surface-tint">
                <Calendar size={16} />
              </div>
              <div>
                <p className="font-sans text-xs font-bold text-on-surface">Auto-Overnight Charge Cycle</p>
                <p className="font-sans text-[11px] text-on-surface-variant">Automatically balance cells at lowest regional electricity pricing</p>
              </div>
            </div>
            <button 
              onClick={() => setScheduled(!scheduled)}
              className={`px-4 py-2 font-mono text-xs rounded-lg transition-all duration-300 font-bold border-0 cursor-pointer ${
                scheduled 
                   ? 'bg-tertiary-fixed text-surface-dim' 
                  : 'bg-surface-tint text-surface-dim shadow-[0_0_15px_rgba(20,184,166,0.25)]'
              }`}
            >
              {scheduled ? '✓ Charge Scheduled (2AM)' : 'Schedule Charge'}
            </button>
          </div>
        </div>

        {/* Warning card and state dashboard */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-8">
          
          {/* Strategy warning metric */}
          <div className={`p-6 rounded-xl border relative overflow-hidden flex-1 ${chargingStrategy === 'dc' ? 'bg-error-container/10 border-error/30' : 'bg-surface-container-high/40 border-white/5'}`}>
            <span className={`absolute top-0 left-0 w-1 h-full ${chargingStrategy === 'dc' ? 'bg-error' : 'bg-surface-tint'}`} />
            
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-full ${chargingStrategy === 'dc' ? 'bg-error/20 text-error' : 'bg-surface-tint/20 text-surface-tint'}`}>
                <AlertTriangle size={16} />
              </div>
              <div className="space-y-4">
                <div>
                  <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                    {chargingStrategy === 'dc' ? 'DC Charger Health Impact' : 'Optimal Chemistry Status'}
                  </h4>
                  <p className="font-sans text-xs text-on-surface-variant leading-relaxed mt-1">
                    {healthWarn}
                  </p>
                </div>

                <div className="bg-surface-container-low p-3 rounded border border-white/5">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-mono text-[9px] text-on-surface-variant">Internal Resistance rise</span>
                    <span className={`font-mono text-[10px] font-bold ${chargingStrategy === 'dc' ? 'text-error' : 'text-tertiary-fixed-dim'}`}>
                      {internalResistanceRise}
                    </span>
                  </div>
                  <div className="w-full bg-surface-container-high h-1 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-500 ${chargingStrategy === 'dc' ? 'bg-error' : 'bg-tertiary-fixed-dim'}`}
                      style={{ width: resistanceWidth }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Level Widget */}
          <div className="glass-panel rounded-xl p-6 flex flex-col justify-center items-center text-center relative overflow-hidden">
            <span className="text-tertiary-fixed-dim animate-pulse-slow">
              <BatteryCharging size={48} strokeWidth={1} />
            </span>
            <div className="font-mono text-2xl font-bold text-on-surface mt-2">
              54% SOC
            </div>
            <span className="font-mono text-[9px] text-on-surface-variant uppercase tracking-widest mt-0.5">Current Charge Status</span>
            
            <div className="mt-4 px-3 py-1 rounded-full border border-tertiary-fixed-dim/30 bg-tertiary-fixed-dim/10 text-tertiary-fixed font-mono text-[10px] font-bold">
              Cell Balancing Active
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Charge Curve and Energy Accumulation Tracker */}
      <div className="glass-panel rounded-xl p-6 flex flex-col justify-between">
        <div className="flex justify-between items-start flex-wrap gap-4 mb-6">
          <div>
            <h3 className="font-sans text-base font-bold text-on-surface flex items-center gap-2">
              <Zap className="text-surface-tint" size={18} />
              Session Telemetry Studio (kW Speed &amp; kWh Consumed)
            </h3>
            <p className="font-mono text-[10px] text-on-surface-variant mt-1 mb-1">
              Live active charging rate curve and accumulated battery grid integration energy (10% to 100% SOC)
            </p>
          </div>
          <div className="flex gap-4 font-mono text-[10px]">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#14b8a6]" />
              <span className="text-slate-300">Charging Rate (kW)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#ffb4ab]" />
              <span className="text-slate-300">Energy Consumed (kWh)</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          {/* SVG Multi Axes coordinate plane */}
          <div className="md:col-span-8 relative h-[225px] w-full">
            
            {/* Left Y-axis (Speed) label */}
            <div className="absolute left-0 top-0 bottom-6 flex flex-col justify-between text-left pointer-events-none text-[#14b8a6] font-mono text-[8px] z-10 pl-2">
              <span>80kW</span>
              <span>54kW</span>
              <span>27kW</span>
              <span>0kW</span>
            </div>

            {/* Right Y-axis (Energy) label */}
            <div className="absolute right-0 top-0 bottom-6 flex flex-col justify-between text-right pointer-events-none text-[#ffb4ab] font-mono text-[8px] z-10 pr-2">
              <span>40.5kWh</span>
              <span>27.0kWh</span>
              <span>13.5kWh</span>
              <span>0.0kWh</span>
            </div>

            {/* The Plot Board */}
            <div className="ml-12 mr-12 h-[calc(100%-25px)] border-b border-l border-r border-white/10 relative">
              <svg className="absolute inset-0 h-full w-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 100">
                {/* Horizontal Guide Rules */}
                <line x1="5" y1="15" x2="95" y2="15" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
                <line x1="5" y1="45" x2="95" y2="45" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
                <line x1="5" y1="75" x2="95" y2="75" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />

                {/* Energy Consumed Area (Rose gradient) */}
                <path d={energyAreaD} fill="url(#energyGrad)" opacity="0.12" />
                <path d={energyPathD} fill="none" stroke="#ffb4ab" strokeWidth="1.5" strokeDasharray="3 2" />

                {/* Charging Rate speed Area (Cyan/Teal gradient) */}
                <path d={speedAreaD} fill="url(#speedGrad)" opacity="0.22" />
                <path d={speedPathD} fill="none" stroke="#14b8a6" strokeWidth="2.5" className="drop-shadow-[0_0_4px_rgba(20,184,166,0.3)]" />

                {/* Hover crosshair alignment elements */}
                {sessionHoverIdx !== null && (
                  <>
                    <line 
                      x1={speedCoordinates[sessionHoverIdx].x} 
                      y1="15" 
                      x2={speedCoordinates[sessionHoverIdx].x} 
                      y2="85" 
                      stroke="rgba(255,255,255,0.15)" 
                      strokeWidth="0.75" 
                      strokeDasharray="1 1" 
                    />
                    {/* Charging speed node */}
                    <circle 
                      cx={speedCoordinates[sessionHoverIdx].x} 
                      cy={speedCoordinates[sessionHoverIdx].y} 
                      r="3.5" 
                      fill="#fff" 
                      stroke="#14b8a6" 
                      strokeWidth="2" 
                    />
                    {/* Energy node */}
                    <circle 
                      cx={energyCoordinates[sessionHoverIdx].x} 
                      cy={energyCoordinates[sessionHoverIdx].y} 
                      r="3" 
                      fill="#fff" 
                      stroke="#ffb4ab" 
                      strokeWidth="1.5" 
                    />
                  </>
                )}

                {/* Constant current / start endpoints */}
                <circle cx="5" cy={speedCoordinates[0].y} r="2" fill="#14b8a6" />
                <circle cx="95" cy={speedCoordinates[9].y} r="2" fill="#14b8a6" />

                <defs>
                  <linearGradient id="speedGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#14b8a6" stopOpacity="0" />
                  </linearGradient>
                  <linearGradient id="energyGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ffb4ab" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#ffb4ab" stopOpacity="0" />
                  </linearGradient>
                </defs>
              </svg>

              {/* Horizontal Trigger grids */}
              <div className="absolute inset-0 flex">
                {speedCoordinates.map((p, index) => (
                  <div
                    key={index}
                    className="h-full flex-1 cursor-crosshair font-mono text-[1px] select-none text-transparent"
                    onMouseEnter={() => setSessionHoverIdx(index)}
                    onMouseLeave={() => setSessionHoverIdx(null)}
                  >
                    .
                  </div>
                ))}
              </div>
            </div>

            {/* X-axis SOC tick markers */}
            <div className="absolute bottom-0 left-12 right-12 flex justify-between font-mono text-[9px] text-[#b9cacb]">
              {sessionPoints.map((p, idx) => (
                <span 
                  key={idx} 
                  className={`text-center w-7 transition-colors leading-none pt-1 ${sessionHoverIdx === idx ? 'text-surface-tint font-bold' : 'text-slate-500'}`}
                >
                  {p.soc}%
                </span>
              ))}
            </div>
          </div>

          {/* Right hand details dashboard for charging curves */}
          <div className="md:col-span-4 p-5 rounded-xl bg-surface-container-high/40 border border-white/5 space-y-4">
            <div>
              <span className="font-mono text-[9px] text-slate-500 uppercase tracking-widest block font-bold">
                {sessionHoverIdx !== null ? `MAPPED SOC: ${sessionPoints[sessionHoverIdx].soc}%` : 'TELEMETRY SUMMARY'}
              </span>
              <h4 className="font-sans text-sm font-bold text-white mt-1">
                {sessionHoverIdx !== null ? `Intermittent Charge Stage` : 'Nexon EV charging index'}
              </h4>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="flex justify-between items-center bg-slate-900/60 p-2.5 rounded border border-white/5">
                <span className="text-slate-400">Rate of Charge:</span>
                <span className="text-[#14b8a6] font-bold">
                  {sessionHoverIdx !== null ? `${sessionPoints[sessionHoverIdx].speed} kW` : `${sessionPoints[7].speed} kW (At 80%)`}
                </span>
              </div>

              <div className="flex justify-between items-center bg-slate-900/60 p-2.5 rounded border border-white/5">
                <span className="text-slate-400">Total Grid Consumed:</span>
                <span className="text-[#ffb4ab] font-bold">
                  {sessionHoverIdx !== null ? `${sessionPoints[sessionHoverIdx].energy} kWh` : `${sessionPoints[7].energy} kWh`}
                </span>
              </div>

              <div className="flex justify-between items-center bg-slate-900/60 p-2.5 rounded border border-white/5">
                <span className="text-slate-400">Core Cell Temp:</span>
                <span className="text-slate-200">
                  {sessionHoverIdx !== null ? `${sessionPoints[sessionHoverIdx].temp}°C` : `${sessionPoints[7].temp}°C`}
                </span>
              </div>
            </div>

            <div className="bg-[#14b8a6]/5 border border-[#14b8a6]/20 p-3 rounded-lg text-left text-[11px] leading-relaxed text-slate-300">
              {chargingStrategy === 'dc' ? (
                <span>
                  <strong>DC Rapid profile</strong>: Notice the charging rate tapers down heavily above 80% to protect the battery solid-electrolyte interphase (SEI) layer.
                </span>
              ) : (
                <span>
                  <strong>Smart AC profile</strong>: Kept cool and constant at 7.2kW. Ensures perfect cell-to-cell balancing during overnight resting.
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Recommended regional charging stations - Map snippet with click selector */}
      <div className="glass-panel rounded-xl p-1 relative overflow-hidden h-[340px] flex flex-col">
        {/* Floating guide board */}
        <div className="absolute top-4 left-4 z-20 bg-surface-container-high/90 backdrop-blur-md rounded-lg p-3 border border-surface-tint/30 max-w-sm">
          <h4 className="font-sans text-xs font-bold text-surface-tint flex items-center gap-1">
            <MapPin size={14} /> Active Route Chargers (NH4 Highway)
          </h4>
          <p className="font-sans text-[11px] text-on-surface-variant mt-1">
            Click on charging station nodes to fetch live bay occupation telemetry
          </p>
        </div>

        {/* Map interface */}
        <div className="w-full h-full relative rounded-lg overflow-hidden bg-surface-container-lowest flex items-center justify-center">
          {/* Simulated Dark satellite highway tiles */}
          <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-40"></div>
          
          {/* Interactive route spline */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none" viewBox="0 0 1000 400">
            <path d="M 50,300 Q 300,200 450,225 T 900,100" fill="none" stroke="#14b8a6" strokeDasharray="8,8" strokeWidth="3" className="opacity-60" />
            
            {/* Pulsating live node */}
            <circle cx="450" cy="225" r="30" fill="rgba(20,184,166,0.03)" className="animate-pulse" />
          </svg>

          {/* Map Nodes */}
          {/* Node 1 */}
          <div 
            onClick={() => setSelectedStation('mumbai_express')}
            className="absolute top-[52%] left-[42%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center cursor-pointer z-10 hover:scale-105 transition-all text-left"
          >
            <div className={`p-2 bg-surface-container-high/95 backdrop-blur-md border rounded-lg whitespace-nowrap mb-1 flex flex-col gap-0.5 transition-opacity duration-300 ${selectedStation === 'mumbai_express' ? 'opacity-100' : 'opacity-80'}`}>
              <span className="font-sans text-[10px] font-bold text-on-surface">NH4 Express Charge (TATA)</span>
              <span className="font-mono text-[9px] text-tertiary-fixed-dim">6/8 Cabinets Available</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-surface-container-low border-2 border-tertiary-fixed-dim flex items-center justify-center shadow-[0_0_12px_#2ae500]">
              <Bolt size={14} className="text-tertiary-fixed-dim" />
            </div>
          </div>

          {/* Node 2 */}
          <div 
            onClick={() => setSelectedStation('pune_bypass')}
            className="absolute top-[28%] left-[72%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center cursor-pointer z-10 hover:scale-105 transition-all text-left"
          >
            <div className={`p-2 bg-surface-container-high/95 backdrop-blur-md border rounded-lg whitespace-nowrap mb-1 flex flex-col gap-0.5 transition-opacity duration-300 ${selectedStation === 'pune_bypass' ? 'opacity-100' : 'opacity-80'}`}>
              <span className="font-sans text-[10px] font-bold text-on-surface">Pune Bypass S-Cell Power Hub</span>
              <span className="font-mono text-[9px] text-error">1/12 Cabinets (High Wait)</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-surface-container-low border-2 border-error flex items-center justify-center shadow-[0_0_12px_rgba(255,180,171,0.5)]">
              <Bolt size={14} className="text-error" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
