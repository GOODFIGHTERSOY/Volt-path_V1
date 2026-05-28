import React, { useState } from 'react';
import { 
  Compass, 
  MapPin, 
  Search, 
  ChevronRight, 
  ShieldCheck, 
  Satellite, 
  Wind, 
  CloudSun, 
  TrendingDown, 
  AlertTriangle,
  Info 
} from 'lucide-react';

interface RouteOption {
  city: string;
  distanceKm: number;
  elevGainKm: number;
  estArrivalSoc: number;
  scannedHighway: string;
  elevationCoordinates: string; // SVG path coordinate
  dischargeCoordinates: string; // SVG path coordinate
}

const indianRoutes: Record<string, RouteOption> = {
  'pune': {
    city: 'Pune, Maharashtra',
    distanceKm: 150,
    elevGainKm: 600,
    estArrivalSoc: 14,
    scannedHighway: 'SCANNING WESTERN EXPRESS HIGHWAY (NH4)',
    elevationCoordinates: '0,90 20,85 40,40 60,20 80,35 100,70',
    dischargeCoordinates: '0,10 20,25 40,30 60,60 80,75 100,86'
  },
  'lonavala': {
    city: 'Lonavala (Western Ghats)',
    distanceKm: 82,
    elevGainKm: 620,
    estArrivalSoc: 48,
    scannedHighway: 'SCANNING MUMBAI-PUNE EXPRESSWAY (GHATS)',
    elevationCoordinates: '0,90 30,80 50,30 70,25 90,40 100,20',
    dischargeCoordinates: '0,10 25,18 50,22 75,40 100,52'
  },
  'alibaug': {
    city: 'Alibaug Coastway',
    distanceKm: 95,
    elevGainKm: 20,
    estArrivalSoc: 54,
    scannedHighway: 'SCANNING PEN TO ALIBAUG HIGHWAY SH-10',
    elevationCoordinates: '0,95 30,90 60,92 80,95 100,94',
    dischargeCoordinates: '0,10 30,22 60,32 80,41 100,46'
  },
  'mahabaleshwar': {
    city: 'Mahabaleshwar (Hill Station)',
    distanceKm: 260,
    elevGainKm: 1350,
    estArrivalSoc: 5, // Need a warning for charge requirement
    scannedHighway: 'SCANNING KHED-MANGU SH-12 GHATS RIDGE',
    elevationCoordinates: '0,95 20,90 45,75 70,40 85,15 100,5',
    dischargeCoordinates: '0,10 20,28 40,45 60,70 80,90 100,95'
  }
};

export default function TripScreen() {
  const [selectedRouteKey, setSelectedRouteKey] = useState<string>('pune');
  const [payloadWeight, setPayloadWeight] = useState<number>(450); // slider between 0 and 1000 lbs
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'complete'>('idle');

  const route = indianRoutes[selectedRouteKey] || indianRoutes['pune'];

  // Impact calculations based on payload slider
  // Higher payload = drop estimated SOC arrival
  const weightImpactSoc = Math.round(payloadWeight / 150); // can deduct up to 6% battery
  const finalEstArrivalSoc = Math.max(1, route.estArrivalSoc - weightImpactSoc);

  const startTeleportSync = () => {
    setSyncStatus('syncing');
    setTimeout(() => {
      setSyncStatus('complete');
      setTimeout(() => {
        setSyncStatus('idle');
      }, 3500);
    }, 2000);
  };

  return (
    <div className="flex flex-col xl:flex-row gap-8 animate-fade-in relative">
      
      {/* Absolute satellite synchronization screen overlay */}
      {syncStatus === 'syncing' && (
        <div className="absolute inset-0 bg-surface-lowest/90 backdrop-blur-md z-50 flex flex-col items-center justify-center p-8 text-center rounded-xl">
          <Satellite size={48} className="text-surface-tint animate-bounce mb-4" />
          <p className="font-mono text-sm text-surface-tint font-bold uppercase tracking-widest animate-pulse">
            Syncing Vectors to Nexon EV Onboard TCU via GPS satellite link...
          </p>
          <div className="w-64 bg-surface-container-high h-2 rounded-full overflow-hidden mt-4">
            <div className="bg-surface-tint h-full animate-[progress_2s_ease-in-out_infinite]"></div>
          </div>
        </div>
      )}

      {/* Map visual section */}
      <section className="flex-1 min-h-[420px] lg:min-h-[500px] bg-surface-container-lowest overflow-hidden border border-white/5 rounded-xl relative p-1 flex">
        {/* Mock dark satellite vector outline */}
        <div className="absolute inset-x-0 inset-y-0 opacity-30 mix-blend-multiply bg-cover bg-center pointer-events-none" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1524661135-423995f22d0b?w=1000&q=80')" }}></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:32px_32px]"></div>

        {/* Live Scan overlay vector block */}
        <div className="absolute top-4 left-4 z-10 glass-panel rounded-lg p-3 border border-surface-tint/30 flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-surface-tint animate-pulse"></span>
          <span className="font-mono text-[9px] text-surface-tint font-bold tracking-widest uppercase">
            {route.scannedHighway}
          </span>
        </div>

        {/* Dynamic map route paths visualization */}
        <div className="w-full h-full flex items-center justify-center relative">
          <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none" viewBox="0 0 1000 500">
            {/* Ambient route overlay glow */}
            <path 
              d="M 120,380 C 250,320 380,420 500,280 S 700,120 880,180" 
              fill="none" 
              className="stroke-surface-tint opacity-10" 
              strokeWidth="20"
              strokeLinecap="round"
            />
            {/* Precision line */}
            <path 
              d="M 120,380 C 250,320 380,420 500,280 S 700,120 880,180" 
              fill="none" 
              className="stroke-surface-tint opacity-80" 
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            {/* Start point */}
            <circle cx="120" cy="380" r="5" fill="#e1fdff" stroke="#14b8a6" strokeWidth="2" />
            
            {/* End point */}
            <circle cx="880" cy="180" r="6" fill="#ffb4ab" stroke="#ffb4ab" strokeWidth="2" />
          </svg>

          {/* Pulsating target node marker */}
          <div className="absolute bottom-[24%] left-[12%] text-left bg-surface/90 px-2 py-1 rounded border border-white/10">
            <span className="font-mono text-[9px] text-on-surface-variant block uppercase">Start Point</span>
            <span className="font-sans text-xs text-primary font-bold">Mumbai Gateway</span>
          </div>

          <div className="absolute top-[32%] right-[10%] text-left bg-surface/90 px-2 py-1 rounded border border-white/10">
            <span className="font-mono text-[9px] text-on-surface-variant block uppercase">Destination</span>
            <span className="font-sans text-xs text-primary font-bold">{route.city}</span>
          </div>
        </div>

        {/* Route switcher pill list */}
        <div className="absolute bottom-4 left-4 z-20 flex bg-surface/90 backdrop-blur-md p-1.5 rounded-lg border border-white/10 gap-1 flex-wrap max-w-full">
          <button 
            onClick={() => setSelectedRouteKey('pune')}
            className={`px-3 py-1.5 rounded font-mono text-[10px] font-bold cursor-pointer transition-all border-0 ${selectedRouteKey === 'pune' ? 'bg-surface-tint text-surface-dim' : 'text-on-surface-variant hover:text-primary bg-transparent'}`}
          >
            Mumbai-Pune
          </button>
          <button 
            onClick={() => setSelectedRouteKey('lonavala')}
            className={`px-3 py-1.5 rounded font-mono text-[10px] font-bold cursor-pointer transition-all border-0 ${selectedRouteKey === 'lonavala' ? 'bg-surface-tint text-surface-dim' : 'text-on-surface-variant hover:text-primary bg-transparent'}`}
          >
            Lonavala Express
          </button>
          <button 
            onClick={() => setSelectedRouteKey('alibaug')}
            className={`px-3 py-1.5 rounded font-mono text-[10px] font-bold cursor-pointer transition-all border-0 ${selectedRouteKey === 'alibaug' ? 'bg-surface-tint text-surface-dim' : 'text-on-surface-variant hover:text-primary bg-transparent'}`}
          >
            Alibaug Coast
          </button>
          <button 
            onClick={() => setSelectedRouteKey('mahabaleshwar')}
            className={`px-3 py-1.5 rounded font-mono text-[10px] font-bold cursor-pointer transition-all border-0 ${selectedRouteKey === 'mahabaleshwar' ? 'bg-surface-tint text-surface-dim' : 'text-on-surface-variant hover:text-primary bg-transparent'}`}
          >
            Mahabaleshwar Ghats
          </button>
        </div>
      </section>

      {/* Telemetry settings sidebar details panel */}
      <aside className="w-full xl:w-[440px] bg-surface-container-high/20 border border-white/5 rounded-xl p-6 flex flex-col justify-between">
        <div className="space-y-6">
          {/* Header */}
          <div className="border-b border-white/5 pb-4 flex justify-between items-start">
            <div>
              <h3 className="font-sans text-base font-bold text-on-surface">{route.city}</h3>
              <p className="font-mono text-[10px] text-on-surface-variant tracking-wider uppercase mt-0.5">Route Telemetry Pre-calculated</p>
            </div>
            <div className="px-2 py-0.5 bg-tertiary-fixed/10 border border-tertiary-fixed/30 rounded text-tertiary-fixed font-mono text-[9px] font-bold tracking-wider uppercase">
              Live Link
            </div>
          </div>

          {/* Location input / Payload */}
          <div className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-[10px] text-on-surface-variant uppercase tracking-wider block">Target City</label>
              <div className="relative">
                <input 
                  type="text" 
                  disabled
                  value={route.city}
                  className="w-full bg-surface-dim border border-white/10 rounded-lg py-3.5 px-4 font-sans text-xs text-primary font-medium focus:outline-none"
                />
                <Search size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant" />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between font-mono text-[10px]">
                <span className="text-on-surface-variant uppercase tracking-wider">Payload Weight:</span>
                <span className="text-surface-tint font-bold">+{payloadWeight} lbs</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="1000" 
                step="50"
                value={payloadWeight} 
                onChange={(e) => setPayloadWeight(parseInt(e.target.value))}
                className="w-full accent-surface-tint bg-surface-container-lowest h-1.5 rounded-full appearance-none outline-none"
              />
              <div className="flex justify-between font-mono text-[9px] text-on-surface-variant opacity-60">
                <span>Driver Only</span>
                <span>Max Payload (Tata Max)</span>
              </div>
            </div>
          </div>

          {/* Wind & Temperature stats banner */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-surface-container-high/40 rounded-xl border border-error/20 relative overflow-hidden flex flex-col justify-between">
              <span className="font-mono text-[10px] text-error flex items-center gap-1">
                <Wind size={12} /> Headwind
              </span>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="font-sans text-lg font-bold text-on-surface">-8%</span>
                <span className="text-[10px] text-on-surface-variant">Range</span>
              </div>
            </div>

            <div className="p-3 bg-surface-container-high/40 rounded-xl border border-surface-tint/20 relative overflow-hidden flex flex-col justify-between">
              <span className="font-mono text-[10px] text-surface-tint flex items-center gap-1">
                <CloudSun size={12} /> Ambient Temp
              </span>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="font-sans text-lg font-bold text-on-surface">32°C</span>
                <span className="text-[10px] text-on-surface-variant">Optimal Air</span>
              </div>
            </div>
          </div>

          {/* Range remaining forecast graph */}
          <div className="p-4 bg-surface-container-high/40 rounded-xl border border-white/5 space-y-3">
            <div className="flex justify-between items-center text-xs font-bold font-sans">
              <span className="text-on-surface">Discharge Forecast</span>
              <span className={`font-mono text-[11px] ${finalEstArrivalSoc < 10 ? 'text-error animate-pulse' : 'text-tertiary-fixed-dim'}`}>
                {finalEstArrivalSoc < 10 ? 'Charge Required!' : `Est Arrival: ${finalEstArrivalSoc}%`}
              </span>
            </div>

            {/* Micro Discharge Curve chart visual */}
            <div className="h-24 w-full border-b border-l border-white/10 relative mt-2">
              <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                <defs>
                  <linearGradient id="dischargeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.15" />
                    <stop offset="100%" stopColor="#14b8a6" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <polygon fill="url(#dischargeGrad)" points="0,10 20,25 40,30 60,60 80,75 100,86 100,100 0,100" />
                <path d={`M ${route.dischargeCoordinates}`} fill="none" stroke="#14b8a6" strokeWidth="2.5" />
                <circle cx="100" cy="86" r="3.5" fill="#14b8a6" />
              </svg>

              <div className="absolute top-0 bottom-0 right-0 w-px border-r border-[#ffb4ab] border-dashed"></div>

              {/* Dist axis ticks */}
              <div className="absolute bottom-[-18px] left-0 w-full flex justify-between font-mono text-[8px] text-on-surface-variant/70">
                <span>0 km</span>
                <span>{Math.round(route.distanceKm / 2)} km</span>
                <span>{route.distanceKm} km</span>
              </div>
            </div>

            {/* Mountain Hills elevation Profile visualization */}
            <div className="h-10 w-full relative mt-6 border-b border-l border-white/10 opacity-70">
              <span className="absolute left-1 top-1 font-mono text-[7px] text-on-surface-variant/50">ELEV PROFILE</span>
              <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                <path d={`M ${route.elevationCoordinates} L 100,100 L 0,100`} fill="rgba(132, 148, 149, 0.15)" />
                <path d={`M ${route.elevationCoordinates}`} fill="none" stroke="#849495" strokeWidth="1" />
              </svg>
            </div>
          </div>
        </div>

        {/* Sync Vehicle Sync Button sticky */}
        <div className="mt-8">
          <button 
            onClick={startTeleportSync}
            className="w-full bg-surface-tint text-surface-dim font-sans text-xs font-extrabold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-primary transition-all duration-300 shadow-[0_0_25px_rgba(20,184,166,0.25)] tracking-wider uppercase cursor-pointer border-0"
          >
            <Satellite size={16} />
            {syncStatus === 'complete' ? 'Telemetry Vectors Locked ✓' : 'Sync flight vectors to vehicle'}
          </button>
        </div>
      </aside>
    </div>
  );
}
