import React, { useState } from 'react';
import { 
  Zap, 
  Leaf, 
  Lightbulb, 
  Compass, 
  Sliders, 
  AlertTriangle, 
  CheckCircle2, 
  Info,
  Flame,
  Gauge
} from 'lucide-react';

export default function DrivingScreen() {
  const [aggressiveness, setAggressiveness] = useState<number>(65); // 0 (Eco Monk) to 100 (Formula EV)
  const [hoveredDayIndex, setHoveredDayIndex] = useState<number | null>(null);

  // 7-day driving behaviors dataset (Smooth vs Normal vs Aggressive %)
  const weeklyDrivingTrend = [
    { day: 'Mon', smooth: 80, normal: 15, aggressive: 5 },
    { day: 'Tue', smooth: 70, normal: 20, aggressive: 10 },
    { day: 'Wed', smooth: 85, normal: 12, aggressive: 3 },
    { day: 'Thu', smooth: 55, normal: 35, aggressive: 10 },
    { day: 'Fri', smooth: 75, normal: 15, aggressive: 10 },
    { day: 'Sat', smooth: 40, normal: 40, aggressive: 20 },
    { day: 'Sun', smooth: 90, normal: 8,  aggressive: 2 },
  ];

  // Derive current style breakdown from interactive aggressiveness slider
  const pctAggressive = Math.round(aggressiveness * 0.85);
  const pctSmooth = Math.max(5, Math.round(95 - aggressiveness * 0.9));
  const pctNormal = 100 - pctAggressive - pctSmooth;

  // Dynamic values calculated from aggressiveness slider
  const accelerationSpike = Math.round(aggressiveness * 0.4 + 2); // 2% to 42%
  const regenEfficiency = Math.round(100 - aggressiveness * 0.3); // 100% down to 70%
  const annualSohLoss = (0.05 + aggressiveness * 0.003).toFixed(2); // +0.05% to +0.35%
  const thermalHarderPct = Math.round(aggressiveness * 0.25); // 0% to 25%

  // Compute normalized driving behavior composition (Smooth, City, Aggressive)
  const rawAggressivePct = Math.min(95, Math.max(5, Math.round(aggressiveness * 0.95 - 2)));
  const rawSmoothPct = Math.min(95, Math.max(5, Math.round((105 - aggressiveness) * 0.85)));
  const rawCityPct = Math.max(10, 100 - rawAggressivePct - rawSmoothPct);
  
  const totalRaw = rawAggressivePct + rawSmoothPct + rawCityPct;
  const aggressivePct = Math.round((rawAggressivePct / totalRaw) * 100);
  const smoothPct = Math.round((rawSmoothPct / totalRaw) * 100);
  const cityPct = 100 - aggressivePct - smoothPct;

  // Calculate polygon cords for user radar based on aggressiveness
  // Center is (50, 50)
  // Vertex 1: Acceleration (Up)
  const yAcc = 50 - (20 + aggressiveness * 0.25); // value between 15 and 40
  // Vertex 2: High Speed (Right)
  const xSpeed = 50 + (10 + aggressiveness * 0.35); // value between 60 and 85
  // Vertex 3: Climate Usage (Down)
  const yClimate = 50 + 20; // constant climate
  // Vertex 4: Regen Braking (Left)
  const xRegen = 50 - (40 - aggressiveness * 0.2); // value between 10 and 30

  const userPathPoints = `50,${yAcc} ${xSpeed},50 50,${yClimate} ${xRegen},50`;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Simulation Setting Bar */}
      <div className="glass-panel rounded-xl p-4 flex flex-col md:flex-row justify-between items-center gap-4 bg-surface-container-high/40 border-0">
        <div className="flex items-center gap-2">
          <Leaf size={16} className="text-tertiary-fixed-dim" />
          <span className="font-mono text-xs text-on-surface uppercase font-bold tracking-wider">Driving Habit Simulator</span>
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <span className="font-mono text-xs text-on-surface-variant font-bold whitespace-nowrap">Agressiveness Index:</span>
          <input 
            type="range" 
            min="10" 
            max="100" 
            value={aggressiveness} 
            onChange={(e) => setAggressiveness(parseInt(e.target.value))}
            className="w-full md:w-48 accent-surface-tint bg-surface-container-lowest h-1.5 rounded-full appearance-none outline-none"
          />
          <span className={`font-mono text-xs font-bold px-2 py-0.5 rounded ${aggressiveness > 75 ? 'bg-error-container text-error' : aggressiveness > 40 ? 'bg-surface-tint/10 text-surface-tint' : 'bg-tertiary-fixed/10 text-tertiary-fixed-dim'}`}>
            {aggressiveness}% ({aggressiveness > 75 ? 'Sport' : aggressiveness > 40 ? 'City Std' : 'Eco Mode'})
          </span>
        </div>
      </div>

      {/* Grid: Habit profile left + SOH impact / Tips right */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* Habit Profile Radar Panel */}
        <div className="md:col-span-8 glass-panel rounded-xl p-6 flex flex-col justify-between min-h-[480px]">
          <div className="flex justify-between items-start flex-wrap gap-4 mb-4">
            <div>
              <h3 className="font-sans text-base font-bold text-on-surface">Habit Profile</h3>
              <p className="font-mono text-[10px] text-on-surface-variant mt-1">Driving vectors mapping Aggressive torque spikes vs. Regeneration</p>
            </div>
            <div className="flex items-center gap-4 font-mono text-[10px]">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-surface-tint shadow-[0_0_8px_rgba(20,184,166,0.6)]"></div>
                <span className="text-on-surface-variant">Your Profile</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full border border-tertiary-fixed border-dashed"></div>
                <span className="text-on-surface-variant">Optimal (Eco)</span>
              </div>
            </div>
          </div>

          {/* SVG Radar implementation */}
          <div className="flex-1 flex items-center justify-center relative min-h-[280px]">
            {/* Background rings */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
              <div className="w-[85%] h-[85%] rounded-full border border-white/20 absolute"></div>
              <div className="w-[60%] h-[60%] rounded-full border border-white/20 absolute"></div>
              <div className="w-[35%] h-[35%] rounded-full border border-white/20 absolute"></div>
              {/* Axes lines cross */}
              <div className="w-full h-px bg-white/10 absolute"></div>
              <div className="h-full w-px bg-white/10 absolute"></div>
            </div>

            <svg className="w-full h-full max-w-[340px] max-h-[340px] drop-shadow-xl overflow-visible" viewBox="0 0 100 100">
              {/* Optimal Target Shape (dashed volt green) */}
              <polygon 
                fill="none" 
                points="50,25 72,50 50,70 28,50" 
                stroke="#2ae500" 
                strokeWidth="0.75" 
                strokeDasharray="2 2" 
                opacity="0.6"
              />

              {/* User Dynamic Shape (cyan fill & solid neon line) */}
              <polygon 
                fill="rgba(20, 184, 166, 0.15)" 
                points={userPathPoints} 
                stroke="#14b8a6" 
                strokeWidth="1.5" 
                className="transition-all duration-300 ease-out"
                style={{ filter: 'drop-shadow(0 0 2px rgba(20, 184, 166, 0.4))' }}
              />

              {/* Text labels on points */}
              <text x="50" y="8" fill="#b9cacb" fontFamily="JetBrains Mono" fontSize="3.5" textAnchor="middle" fontWeight="bold">Acceleration</text>
              <text x="96" y="51" fill="#b9cacb" fontFamily="JetBrains Mono" fontSize="3.5" textAnchor="start" fontWeight="bold">Velocity</text>
              <text x="50" y="96" fill="#b9cacb" fontFamily="JetBrains Mono" fontSize="3.5" textAnchor="middle" fontWeight="bold">Climate Load</text>
              <text x="4" y="51" fill="#b9cacb" fontFamily="JetBrains Mono" fontSize="3.5" textAnchor="end" fontWeight="bold">Regeneration</text>

              {/* Floating vertices pointer nodes */}
              <circle cx="50" cy={yAcc} r="1.5" fill="#e1fdff" stroke="#14b8a6" strokeWidth="0.75" className="transition-all duration-300 ease-out" />
              <circle cx={xSpeed} cy="50" r="1.5" fill="#e1fdff" stroke="#14b8a6" strokeWidth="0.75" className="transition-all duration-300 ease-out" />
              <circle cx="50" cy={yClimate} r="1.5" fill="#e1fdff" stroke="#14b8a6" strokeWidth="0.75" className="transition-all duration-300 ease-out" />
              <circle cx={xRegen} cy="50" r="1.5" fill="#e1fdff" stroke="#14b8a6" strokeWidth="0.75" className="transition-all duration-300 ease-out" />
            </svg>
          </div>

          {/* Under habit metrics: Visual Driving Style Breakdown */}
          <div className="border-t border-slate-800 pt-6 mt-6 space-y-6">
            <div>
              <h4 className="font-sans text-xs font-semibold text-white uppercase tracking-wider mb-2">Driving Behavior Breakdown</h4>
              
              {/* Segmented Linear Progress bar */}
              <div className="w-full h-3 rounded-full flex overflow-hidden bg-[#1E2128]">
                <div 
                  style={{ width: `${smoothPct}%` }} 
                  className="bg-[#14b8a6] h-full shadow-[0_0_8px_rgba(20,184,166,0.35)] transition-all duration-300"
                  title={`Smooth Eco Glide: ${smoothPct}%`}
                />
                <div 
                  style={{ width: `${cityPct}%` }} 
                  className="bg-slate-400 h-full transition-all duration-300"
                  title={`City Cruising: ${cityPct}%`}
                />
                <div 
                  style={{ width: `${aggressivePct}%` }} 
                  className="bg-[#ffb4ab] h-full shadow-[0_0_8px_rgba(255,180,171,0.35)] transition-all duration-300"
                  title={`Aggressive Sport spikes: ${aggressivePct}%`}
                />
              </div>

              {/* Legends with inline metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3 font-mono text-[10px]">
                <div className="flex flex-col">
                  <div className="flex items-center gap-1 text-[#14b8a6] font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#14b8a6]" />
                    <span>Smooth Eco ({smoothPct}%)</span>
                  </div>
                  <span className="text-slate-500 text-[9px] mt-0.5">Soft glide, maximum micro-recovery</span>
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-1 text-slate-300 font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                    <span>City Cruise ({cityPct}%)</span>
                  </div>
                  <span className="text-slate-500 text-[9px] mt-0.5">Standard commute, stable currents</span>
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-1 text-[#ffb4ab] font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#ffb4ab]" />
                    <span>Sport Spikes ({aggressivePct}%)</span>
                  </div>
                  <span className="text-slate-500 text-[9px] mt-0.5">Sudden draws, thermal copper loads</span>
                </div>
              </div>
            </div>

            {/* Core telemetry scores */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-surface-container-high/30 rounded-xl border border-white/5">
                <span className="font-mono text-[9px] text-[#ffb4ab] uppercase tracking-wider block mb-1">Acceleration Spikes</span>
                <span className="font-sans text-lg font-bold text-on-surface">{accelerationSpike}% above baseline</span>
              </div>
              <div className="p-4 bg-surface-container-high/30 rounded-xl border border-white/5">
                <span className="font-mono text-[9px] text-[#14b8a6] uppercase tracking-wider block mb-1">Regen Captured Charge</span>
                <span className="font-sans text-lg font-bold text-on-surface">{regenEfficiency}% efficiency score</span>
              </div>
            </div>
          </div>
        </div>

        {/* Longevity impact & Tips column */}
        <div className="md:col-span-4 flex flex-col gap-8">
          
          {/* Longevity impact block */}
          <div className="glass-panel rounded-xl p-6 bg-surface-container-lowest/80 border-0 flex flex-col justify-between">
            <div>
              <h3 className="font-sans text-base font-bold text-on-surface">Longevity Impact</h3>
              <p className="font-mono text-[10px] text-on-surface-variant uppercase mt-1">SOH Decay Forecast</p>
            </div>

            <div className="flex flex-col items-center py-6 border-b border-white/5 my-4">
              <div className={`font-mono text-4xl font-extrabold mb-1 tracking-tight ${aggressiveness > 60 ? 'text-error glow-text-cyan' : 'text-tertiary-fixed-dim glow-text-green'}`}>
                +{annualSohLoss}%
              </div>
              <span className="font-mono text-[9px] text-on-surface-variant uppercase font-bold text-center">Proj. SOH Loss / Yr</span>
            </div>

            {/* List with warning or info icons */}
            <div className="space-y-3">
              <div className="flex items-start gap-2 text-xs text-on-surface-variant">
                <span className={`mt-0.5 ${aggressiveness > 60 ? 'text-error' : 'text-tertiary-fixed-dim'}`}>
                  {aggressiveness > 60 ? <AlertTriangle size={14} /> : <CheckCircle2 size={14} />}
                </span>
                <span>
                  {aggressiveness > 60 
                    ? 'Sustained high torque discharge raises temperatures, speed-up aging.' 
                    : 'Gentle launch profile restricts copper cell hot-spots successfully.'
                  }
                </span>
              </div>
              <div className="flex items-start gap-2 text-xs text-on-surface-variant">
                <span className="text-surface-tint mt-0.5"><Info size={14} /></span>
                <span>
                  Li-ion thermal pump working {thermalHarderPct}% harder to offset heat currents.
                </span>
              </div>
            </div>
          </div>

          {/* AI Recommendations panel */}
          <div className="glass-panel rounded-xl p-6 border border-surface-tint/20 flex-1 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-surface-tint mb-3">
                <Lightbulb size={20} />
                <h3 className="font-sans text-base font-bold text-on-surface">AI recommendations</h3>
              </div>
              <div className="space-y-3">
                <div className="bg-surface-container-high/40 p-4 rounded-lg border border-white/5 hover:border-surface-tint/20 transition-all">
                  <span className="font-mono text-[10px] text-surface-tint font-bold block mb-1">+12 Miles Extension</span>
                  <p className="font-sans text-xs text-on-surface leading-normal">
                    One-pedal driving & soft braking decrescendos active thermal strain, adding instantly usable grid efficiency.
                  </p>
                </div>
                <div className="bg-surface-container-high/40 p-4 rounded-lg border border-white/5 hover:border-surface-tint/20 transition-all">
                  <span className="font-mono text-[10px] text-tertiary-fixed-dim font-bold block mb-1">Eco Cab preconditioning</span>
                  <p className="font-sans text-xs text-on-surface leading-normal">
                    Cooling cabin down while plugged into AC grid home charges reduces active battery HVAC load by 8%.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Driving Behavior Visual Breakdown Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8">
        {/* Real-time Behavior segments Donut representation */}
        <div className="lg:col-span-4 glass-panel rounded-xl p-6 flex flex-col justify-between">
          <div>
            <h3 className="font-sans text-base font-bold text-on-surface">Behavior Distribution</h3>
            <p className="font-mono text-[10px] text-on-surface-variant mt-1 uppercase">Active session profile share</p>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center my-6 relative min-h-[180px]">
            {/* SVG Donut / Segment representation */}
            <svg className="w-40 h-40 transform -rotate-90" viewBox="0 0 100 100">
              {/* Background grey ring */}
              <circle cx="50" cy="50" r="35" fill="none" stroke="rgba(255,255,255,0.02)" strokeWidth="12" />
              
              {/* Circular sector: Smooth / Eco (Teal) */}
              <circle
                cx="50"
                cy="50"
                r="35"
                fill="none"
                stroke="#14b8a6"
                strokeWidth="12"
                strokeDasharray={`${(pctSmooth / 100) * 220} 220`}
                strokeDashoffset="0"
                className="transition-all duration-500 ease-out drop-shadow-[0_0_3px_rgba(20,184,166,0.3)]"
              />

              {/* Circular sector: Normal City (Slate Blue) */}
              <circle
                cx="50"
                cy="50"
                r="35"
                fill="none"
                stroke="#64748b"
                strokeWidth="12"
                strokeDasharray={`${(pctNormal / 100) * 220} 220`}
                strokeDashoffset={`-${(pctSmooth / 100) * 220}`}
                className="transition-all duration-500 ease-out"
              />

              {/* Circular sector: Aggressive Sport (Rose) */}
              <circle
                cx="50"
                cy="50"
                r="35"
                fill="none"
                stroke="#f43f5e"
                strokeWidth="12"
                strokeDasharray={`${(pctAggressive / 100) * 220} 220`}
                strokeDashoffset={`-${((pctSmooth + pctNormal) / 100) * 220}`}
                className="transition-all duration-500 ease-out drop-shadow-[0_0_3px_rgba(244,63,94,0.3)]"
              />
            </svg>

            {/* Float details in donut hole */}
            <div className="absolute flex flex-col items-center justify-center text-center font-mono">
              <span className="text-xl font-bold text-white">{100 - pctAggressive}%</span>
              <span className="text-[9px] text-[#14b8a6] font-bold uppercase tracking-widest mt-0.5">Smooth Score</span>
            </div>
          </div>

          <div className="space-y-2 border-t border-white/5 pt-4">
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="flex items-center gap-1.5 text-slate-400">
                <span className="w-2.5 h-2.5 rounded-full bg-[#14b8a6]" /> Smooth / Eco
              </span>
              <span className="text-white font-bold">{pctSmooth}%</span>
            </div>
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="flex items-center gap-1.5 text-slate-400">
                <span className="w-2.5 h-2.5 rounded-full bg-[#64748b]" /> City Standard
              </span>
              <span className="text-white font-bold">{pctNormal}%</span>
            </div>
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="flex items-center gap-1.5 text-slate-400">
                <span className="w-2.5 h-2.5 rounded-full bg-[#f43f5e]" /> Aggressive / Sport
              </span>
              <span className="text-white font-bold">{pctAggressive}%</span>
            </div>
          </div>
        </div>

        {/* 7-Day Behavior Trendline Area chart */}
        <div className="lg:col-span-8 glass-panel rounded-xl p-6 flex flex-col justify-between">
          <div>
            <h3 className="font-sans text-base font-bold text-on-surface">Weekly Behavioral Shares</h3>
            <p className="font-mono text-[10px] text-on-surface-variant mt-1 uppercase">7-day progression of driving style choices</p>
          </div>

          <div className="relative h-[200px] w-full flex items-end mt-4">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
              {/* Guides */}
              <line x1="0" y1="20" x2="100" y2="20" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
              <line x1="0" y1="50" x2="100" y2="50" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
              <line x1="0" y1="80" x2="100" y2="80" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />

              {/* Area filled: Smooth progression (Teal) */}
              <path
                d={`M 10 90 ${weeklyDrivingTrend.map((d, i) => `L ${10 + (i * 80) / 6} ${95 - d.smooth * 0.75}`).join(' ')} L 90 90 Z`}
                fill="url(#smoothTrendGrad)"
                className="transition-all duration-300"
              />

              {/* Line: Smooth Trend (Teal) */}
              <path
                d={weeklyDrivingTrend.map((d, i) => `${i === 0 ? 'M' : 'L'} ${10 + (i * 80) / 6} ${95 - d.smooth * 0.75}`).join(' ')}
                fill="none"
                stroke="#14b8a6"
                strokeWidth="2.5"
                strokeLinecap="round"
                className="drop-shadow-[0_0_6px_#14b8a6]"
              />

              {/* Line: Aggressive Trend (Rose) */}
              <path
                d={weeklyDrivingTrend.map((d, i) => `${i === 0 ? 'M' : 'L'} ${10 + (i * 80) / 6} ${95 - d.aggressive * 0.75}`).join(' ')}
                fill="none"
                stroke="#f43f5e"
                strokeWidth="2"
                strokeLinecap="round"
                strokeDasharray="3,3"
                className="drop-shadow-[0_0_4px_#f43f5e]"
              />

              {/* Vertical hovered guideline */}
              {hoveredDayIndex !== null && (
                <line
                  x1={10 + (hoveredDayIndex * 80) / 6}
                  y1="5"
                  x2={10 + (hoveredDayIndex * 80) / 6}
                  y2="90"
                  stroke="rgba(255,255,255,0.15)"
                  strokeWidth="0.75"
                  strokeDasharray="2,2"
                />
              )}

              {/* Highlight points */}
              {weeklyDrivingTrend.map((d, i) => {
                const cx = 10 + (i * 80) / 6;
                const cySmooth = 95 - d.smooth * 0.75;
                const cyAgg = 95 - d.aggressive * 0.75;
                return (
                  <g key={i}>
                    <circle
                      cx={cx}
                      cy={cySmooth}
                      r={hoveredDayIndex === i ? "4.5" : "2.5"}
                      fill={hoveredDayIndex === i ? "#ffffff" : "#14b8a6"}
                      stroke="#14b8a6"
                      strokeWidth="1"
                      className="cursor-pointer transition-all duration-150"
                      onMouseEnter={() => setHoveredDayIndex(i)}
                    />
                    <circle
                      cx={cx}
                      cy={cyAgg}
                      r={hoveredDayIndex === i ? "4" : "2"}
                      fill={hoveredDayIndex === i ? "#ffffff" : "#f43f5e"}
                      stroke="#f43f5e"
                      strokeWidth="1"
                      className="cursor-pointer transition-all duration-150"
                      onMouseEnter={() => setHoveredDayIndex(i)}
                    />
                    {/* Catch region */}
                    <rect
                      x={cx - 6}
                      y="5"
                      width="12"
                      height="85"
                      fill="transparent"
                      className="cursor-pointer"
                      onMouseEnter={() => setHoveredDayIndex(i)}
                    />
                  </g>
                );
              })}

              <defs>
                <linearGradient id="smoothTrendGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#14b8a6" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>

            {/* Trend chart day markers */}
            <div className="absolute bottom-[-18px] left-[10%] right-[10%] flex justify-between font-mono text-[9px] text-slate-500">
              {weeklyDrivingTrend.map((d, i) => (
                <span 
                  key={i} 
                  className={`text-center flex-1 transition-colors ${hoveredDayIndex === i ? 'text-white font-bold' : ''}`}
                >
                  {d.day}
                </span>
              ))}
            </div>
          </div>

          {/* Dynamic feedback panel in weekly chart */}
          <div className="h-10 mt-6 relative flex items-center justify-between border-t border-white/5 pt-1">
            {hoveredDayIndex !== null ? (
              <div className="flex justify-between items-center w-full text-[10px] font-mono">
                <span className="text-white font-bold"><span className="text-slate-500 font-normal">Day:</span> {weeklyDrivingTrend[hoveredDayIndex].day}</span>
                <span className="text-[#14b8a6] font-extrabold"><span className="text-slate-500 font-normal">Smooth Style:</span> {weeklyDrivingTrend[hoveredDayIndex].smooth}%</span>
                <span className="text-slate-400 font-bold"><span className="text-slate-500 font-normal">Standard:</span> {weeklyDrivingTrend[hoveredDayIndex].normal}%</span>
                <span className="text-[#f43f5e] font-extrabold"><span className="text-slate-500 font-normal">Aggressive:</span> {weeklyDrivingTrend[hoveredDayIndex].aggressive}%</span>
              </div>
            ) : (
              <div className="w-full text-center text-[10px] font-mono text-on-surface-variant flex items-center justify-center gap-1.5 animate-pulse">
                Move mouse over weekly nodes to view daily style shares
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
