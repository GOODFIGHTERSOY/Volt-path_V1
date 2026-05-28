import React, { useState } from 'react';
import { TelemetryData } from '../types';
import { 
  Thermometer, 
  Settings, 
  Info, 
  TrendingDown, 
  MapPin, 
  Bolt,
  AlertTriangle,
  RotateCcw,
  CheckCircle2
} from 'lucide-react';

interface DashboardScreenProps {
  telemetry: TelemetryData;
  setTelemetry: React.Dispatch<React.SetStateAction<TelemetryData>>;
}

export default function DashboardScreen({ telemetry, setTelemetry }: DashboardScreenProps) {
  const [driveMode, setDriveMode] = useState<'ziptron' | 'eco' | 'sport'>('ziptron');

  // Interactive driving mode alters range calculations dynamically
  const rangeMultiplier = driveMode === 'eco' ? 1.15 : driveMode === 'sport' ? 0.78 : 1.0;
  const currentTrueRange = Math.round(telemetry.trueRangeKm * rangeMultiplier);
  const currentDelta = Math.round(((currentTrueRange - telemetry.araiEstimateKm) / telemetry.araiEstimateKm) * 100);

  const handleTempChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTemp = parseFloat(e.target.value);
    setTelemetry(prev => ({
      ...prev,
      packAmbientTemp: newTemp
    }));
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Simulation Setting Banner */}
      <div className="glass-panel rounded-xl p-4 flex flex-col sm:flex-row justify-between items-center gap-4 bg-surface-container-high/40 border-0">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-surface-tint animate-pulse"></span>
          <span className="font-mono text-xs text-surface-tint uppercase font-bold tracking-widest">Interactive Telemetry Controls</span>
        </div>
        <div className="flex items-center gap-4 flex-wrap">
          {/* Drive Mode Selector */}
          <div className="flex bg-surface-container-low p-1 rounded-lg border border-white/5">
            <button 
              onClick={() => setDriveMode('eco')}
              className={`px-3 py-1 text-xs font-bold rounded transition-all cursor-pointer ${driveMode === 'eco' ? 'bg-tertiary-fixed text-surface-dim shadow-md' : 'text-on-surface-variant hover:text-primary'}`}
            >
              Eco Mode
            </button>
            <button 
              onClick={() => setDriveMode('ziptron')}
              className={`px-3 py-1 text-xs font-bold rounded transition-all cursor-pointer ${driveMode === 'ziptron' ? 'bg-surface-tint text-surface-dim shadow-md' : 'text-on-surface-variant hover:text-primary'}`}
            >
              Ziptron (Std)
            </button>
            <button 
              onClick={() => setDriveMode('sport')}
              className={`px-3 py-1 text-xs font-bold rounded transition-all cursor-pointer ${driveMode === 'sport' ? 'bg-error text-surface-dim shadow-md' : 'text-on-surface-variant hover:text-primary'}`}
            >
              Sport Mode
            </button>
          </div>

          {/* Dynamic Temp Slider */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-on-surface-variant font-mono">Ambient Temp:</span>
            <input 
              type="range" 
              min="0" 
              max="50" 
              step="0.5" 
              value={telemetry.packAmbientTemp} 
              onChange={handleTempChange}
              className="w-24 accent-surface-tint bg-surface-container-lowest h-1.5 rounded-full appearance-none outline-none"
            />
            <span className="text-xs font-mono text-primary font-bold">{telemetry.packAmbientTemp.toFixed(1)}°C</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Hero View + SOH Ring */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Digital Twin Illustration and Predicted Range */}
        <div className="col-span-12 lg:col-span-8 glass-panel rounded-xl p-6 sm:p-8 flex flex-col md:flex-row gap-8 items-center min-h-[400px] relative overflow-hidden">
          {/* Cyan Backlight Glow */}
          <div className="absolute top-1/2 left-[30%] -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] bg-surface-tint/10 blur-[120px] rounded-full pointer-events-none"></div>

          {/* Wireframe Digital twin chassis */}
          <div className="flex-1 relative w-full h-[260px] flex items-center justify-center">
            <img 
              alt="Tata Nexon EV Active Chassis Digital Twin" 
              className="absolute inset-0 w-full h-full object-contain mix-blend-screen opacity-90 filter contrast-125 saturate-125 animate-pulse-slow" 
              src="https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=600&q=80"
              referrerPolicy="no-referrer"
            />
            
            {/* Real-time floating telemetry tags */}
            <div className="absolute top-[20%] left-[25%] flex items-center gap-1.5 transition-all">
              <span className="w-2.5 h-2.5 rounded-full bg-surface-tint shadow-[0_0_8px_#14b8a6] animate-ping"></span>
              <span className="font-mono text-[9px] text-surface-tint bg-surface/80 px-2 py-0.5 rounded backdrop-blur-sm border border-surface-tint/30">
                Cell Phase A: {(3.80 + (telemetry.packAmbientTemp * 0.001)).toFixed(2)}V
              </span>
            </div>

            <div className="absolute bottom-[30%] right-[20%] flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-surface-tint shadow-[0_0_8px_#14b8a6]"></span>
              <span className="font-mono text-[9px] text-surface-tint bg-surface/80 px-2 py-0.5 rounded backdrop-blur-sm border border-surface-tint/30">
                Thermal Matrix: {telemetry.packAmbientTemp.toFixed(1)}°C
              </span>
            </div>
          </div>

          {/* Primary Predicted Metrics Panel */}
          <div className="w-full md:w-[280px] flex flex-col gap-6 z-10">
            <div>
              <h3 className="font-mono text-xs text-on-surface-variant uppercase tracking-widest mb-1.5">True Range Predicted</h3>
              <div className="flex items-baseline gap-2">
                <span className="font-sans text-5xl font-black text-primary hover:scale-105 transition-transform duration-300 glow-text-cyan">
                  {currentTrueRange}
                </span>
                <span className="font-mono text-lg text-surface-tint font-bold">km</span>
              </div>
            </div>

            <div className="h-px w-full bg-gradient-to-r from-white/20 to-transparent"></div>

            <div>
              <div className="flex justify-between items-end mb-2">
                <h3 className="font-mono text-[10px] text-on-surface-variant uppercase tracking-widest">ARAI Estimate</h3>
                <div className="flex items-center gap-1 text-error bg-error/10 px-2 py-0.5 rounded border border-error/20">
                  <span className="text-[10px] uppercase font-bold tracking-wider">{currentDelta}% Delta</span>
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-sans text-2xl font-bold text-on-surface">
                  {telemetry.araiEstimateKm}
                </span>
                <span className="font-mono text-xs text-on-surface-variant">km</span>
              </div>
            </div>

            {/* Config Mode Chip */}
            <div className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-surface-tint/30 bg-surface-tint/5 w-fit">
              <span className="w-2 h-2 rounded-full bg-surface-tint animate-pulse"></span>
              <span className="font-mono text-[10px] text-surface-tint uppercase font-bold tracking-wider">ZIPTRON active</span>
            </div>
          </div>
        </div>

        {/* State of Health (SOH) Gauge Panel */}
        <div className="col-span-12 lg:col-span-4 glass-panel rounded-xl p-8 flex flex-col items-center justify-center relative overflow-hidden">
          <h3 className="font-mono text-xs text-on-surface-variant uppercase tracking-widest absolute top-6 left-6">Battery Health (SOH)</h3>
          <button className="absolute top-6 right-6 text-on-surface-variant hover:text-primary transition-colors bg-transparent border-0 cursor-pointer">
            <Info size={16} />
          </button>

          {/* High-Contrast SVG Radial Dial */}
          <div className="relative w-48 h-48 mt-8 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
              <circle 
                cx="50" 
                cy="50" 
                r="40" 
                fill="none" 
                stroke="#14b8a6" 
                strokeWidth="6" 
                strokeDasharray="251.2" 
                strokeDashoffset={251.2 * (1 - telemetry.batterySoh / 100)} 
                className="transition-all duration-1000 ease-in-out drop-shadow-[0_0_8px_rgba(20,184,166,0.5)]"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-sans text-4xl font-extrabold text-on-surface">
                {telemetry.batterySoh}%
              </span>
              <span className="font-mono text-[10px] text-surface-tint uppercase tracking-wider font-bold mt-1">Excellent</span>
            </div>
          </div>

          <p className="font-sans text-xs text-on-surface-variant text-center mt-6 leading-relaxed max-w-xs">
            Degradation remains strictly within optimal warranty thresholds for Tata Li-ion Battery (8 Yr/1.6L km contract).
          </p>
        </div>
      </div>

      {/* Grid of Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Stat 1: Pack Temp and status */}
        <div className="glass-panel rounded-xl p-6 flex items-start gap-4 hover:bg-white/[0.04] transition-all duration-300">
          <div className="w-10 h-10 rounded-full bg-surface-container-high border border-white/10 flex items-center justify-center text-surface-tint">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <h4 className="font-mono text-xs text-on-surface-variant uppercase tracking-widest mb-1">Pack Ambient</h4>
            <div className="flex items-baseline gap-1">
              <span className="font-sans text-2xl font-black text-on-surface">
                {telemetry.packAmbientTemp.toFixed(1)}
              </span>
              <span className="font-sans text-sm text-on-surface-variant">°C</span>
            </div>
            {telemetry.packAmbientTemp > 40 || telemetry.packAmbientTemp < 5 ? (
              <p className="font-mono text-[10px] text-error mt-2 flex items-center gap-1">
                <AlertTriangle size={12} /> Critical Degradation Risk
              </p>
            ) : (
              <p className="font-mono text-[10px] text-tertiary-fixed mt-2 flex items-center gap-1">
                <CheckCircle2 size={12} /> Thermal Optimal
              </p>
            )}
          </div>
        </div>

        {/* Stat 2: Elevation Info */}
        <div className="glass-panel rounded-xl p-6 flex items-start gap-4 hover:bg-white/[0.04] transition-all duration-300">
          <div className="w-10 h-10 rounded-full bg-surface-container-high border border-white/10 flex items-center justify-center text-on-surface-variant">
            <MapPin size={20} />
          </div>
          <div>
            <h4 className="font-mono text-xs text-on-surface-variant uppercase tracking-widest mb-1">Current Elevation</h4>
            <div className="flex items-baseline gap-1">
              <span className="font-sans text-2xl font-black text-on-surface">
                {telemetry.currentElevation}
              </span>
              <span className="font-sans text-sm text-on-surface-variant">m</span>
            </div>
            <p className="font-sans text-xs text-on-surface-variant mt-2">
              Lonavala Western Ghats: Slope impact projected at -2.4% Wh/km.
            </p>
          </div>
        </div>

        {/* Stat 3: Real Average Efficiency */}
        <div className="glass-panel rounded-xl p-6 flex items-start gap-4 hover:bg-white/[0.04] transition-all duration-300 relative overflow-hidden">
          {/* Behind mini chart svg sparkline */}
          <svg className="absolute bottom-0 left-0 w-full h-12 opacity-10" preserveAspectRatio="none" viewBox="0 0 100 100">
            <path d="M0,90 Q20,30 40,65 T80,45 T100,5" fill="none" stroke="#14b8a6" strokeWidth="4" />
          </svg>

          <div className="w-10 h-10 rounded-full bg-surface-container-high border border-white/10 flex items-center justify-center text-surface-tint">
            <Bolt size={20} />
          </div>
          <div className="z-10">
            <h4 className="font-mono text-xs text-on-surface-variant uppercase tracking-widest mb-1">Avg Efficiency</h4>
            <div className="flex items-baseline gap-1">
              <span className="font-sans text-2xl font-black text-on-surface">
                {telemetry.avgEfficiency}
              </span>
              <span className="font-sans text-sm text-on-surface-variant">Wh/km</span>
            </div>
            <p className="font-mono text-[10px] text-surface-tint mt-2 flex items-center gap-1 flex-wrap">
              <TrendingDown size={12} strokeWidth={3} />
              {telemetry.efficiencyTrend} Wh/km better than national fleet
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
