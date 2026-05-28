import React, { useState, useEffect } from 'react';
import { ScreenId, TelemetryData } from './types';
import Sidebar from './components/Sidebar';
import DashboardScreen from './components/DashboardScreen';
import BatteryScreen from './components/BatteryScreen';
import DrivingScreen from './components/DrivingScreen';
import ChargingScreen from './components/ChargingScreen';
import TripScreen from './components/TripScreen';

import { 
  Bell, 
  RefreshCw, 
  Link2, 
  Cpu, 
  AlertTriangle,
  X,
  Sparkles
} from 'lucide-react';

const initialTelemetry: TelemetryData = {
  trueRangeKm: 389,
  araiEstimateKm: 437,
  batterySoh: 94.2,
  packAmbientTemp: 24.5,
  currentElevation: 600,
  avgEfficiency: 177,
  efficiencyTrend: -9,
  lastSyncMinutes: 2
};

export default function App() {
  const [activeScreen, setActiveScreen] = useState<ScreenId>('dashboard');
  const [telemetry, setTelemetry] = useState<TelemetryData>(initialTelemetry);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [newsTicker, setNewsTicker] = useState('All battery cells operating in perfect thermal balance');
  
  // Firmware modal simulation states
  const [showFirmwareModal, setShowFirmwareModal] = useState(false);
  const [firmwareProgress, setFirmwareProgress] = useState(0);
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [upgradeComplete, setUpgradeComplete] = useState(false);

  // Quick refresh action simulation
  const handleManualSync = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      setTelemetry(prev => ({
        ...prev,
        lastSyncMinutes: 0,
        trueRangeKm: 389 + Math.floor(Math.random() * 6 - 3)
      }));
      setNewsTicker(
        Math.random() > 0.5 
          ? 'Completed cell voltage balances on highway vectors' 
          : 'Li-ion cooling profile successfully calibrated'
      );
    }, 1200);
  };

  // Telemetry aging ticks
  useEffect(() => {
    const interval = setInterval(() => {
      setTelemetry(prev => ({
        ...prev,
        lastSyncMinutes: prev.lastSyncMinutes + 1
      }));
    }, 60000); // every minute
    return () => clearInterval(interval);
  }, []);

  // Live firmware upgrade ticker
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isUpgrading && firmwareProgress < 100) {
      timer = setTimeout(() => {
        setFirmwareProgress(prev => {
          const next = prev + Math.floor(Math.random() * 15 + 5);
          if (next >= 100) {
            setIsUpgrading(false);
            setUpgradeComplete(true);
            return 100;
          }
          return next;
        });
      }, 350);
    }
    return () => clearTimeout(timer);
  }, [isUpgrading, firmwareProgress]);

  const handleStartUpgrade = () => {
    setIsUpgrading(true);
    setFirmwareProgress(0);
  };

  const handleCloseFirmware = () => {
    setShowFirmwareModal(false);
    setIsUpgrading(false);
    setUpgradeComplete(false);
    setFirmwareProgress(0);
  };

  return (
    <div className="bg-gradient-to-br from-[#0A0B0D] to-[#16181D] text-on-surface font-sans min-h-screen relative flex select-none overflow-x-hidden">
      
      {/* Visual background ambient grids */}
      <div className="absolute top-[-300px] left-[-200px] w-[800px] h-[800px] bg-surface-tint/5 rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="absolute bottom-[-100px] right-[-100px] w-[600px] h-[600px] bg-surface-tint/5 rounded-full blur-[120px] pointer-events-none z-0" />

      {/* Static shared Navigation Sidebar */}
      <Sidebar 
        activeScreen={activeScreen}
        onNavigate={setActiveScreen}
        onShowFirmwareModal={() => setShowFirmwareModal(true)}
      />

      {/* Main Panel Frame Wrapper */}
      <div className="flex-1 min-h-screen flex flex-col md:ml-72 pb-[80px] md:pb-8">
        
        {/* Shared TopAppBar */}
        <header className="sticky top-0 z-30 flex justify-between items-center w-full px-6 py-4 bg-[#0A0B0D]/80 backdrop-blur-xl border-b border-slate-800">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="font-sans text-lg font-bold text-white tracking-tight">
                Tata Nexon EV Max
                <span className="text-surface-tint text-xs sm:text-sm font-normal ml-2 font-mono">MH-01-EV-2024</span>
              </h2>
              <span className="hidden sm:inline-flex px-2.5 py-0.5 max-h-5 rounded-md bg-surface-tint/10 border border-surface-tint/20 font-mono text-[9px] text-surface-tint uppercase tracking-wider">
                NH4 CONNECTED
              </span>
            </div>
            
            {/* Pulsing micro status */}
            <div className="flex items-center gap-2 mt-1">
              <div className="w-2 h-2 bg-surface-tint rounded-full animate-pulse"></div>
              <span className="font-mono text-[10px] text-slate-400 tracking-wider uppercase font-medium">
                System Active • {newsTicker}
              </span>
            </div>
          </div>

          {/* Controls header tool buttons */}
          <div className="flex items-center gap-3">
            <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800/40 border border-slate-700/60 font-mono text-[10px] text-on-surface-variant">
              <span>Sync: {telemetry.lastSyncMinutes}m ago</span>
            </div>

            <button 
              onClick={handleManualSync}
              disabled={isRefreshing}
              title="Manual Sync Telemetry"
              className={`w-9 h-9 rounded-full bg-[#1e2128] hover:bg-slate-800 border border-slate-800 flex items-center justify-center text-on-surface-variant hover:text-white transition-all duration-300 cursor-pointer ${isRefreshing ? 'animate-spin' : ''}`}
            >
              <RefreshCw size={15} />
            </button>

            <button 
              title="Notifications"
              className="w-9 h-9 rounded-full bg-[#1e2128] hover:bg-slate-800 border border-slate-800 flex items-center justify-center text-on-surface-variant relative cursor-pointer"
            >
              <Bell size={15} />
              <span className="absolute top-2.5 right-2.5 w-1.5 h-1.5 bg-surface-tint rounded-full"></span>
            </button>

            <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-800 flex items-center justify-center font-bold text-xs text-[#f1f5f9] tracking-tight ml-1 hidden sm:flex">
              AS
            </div>
          </div>
        </header>

        {/* Dynamic Display Board View */}
        <main className="p-6 md:p-8 max-w-7xl w-full mx-auto flex-1 relative z-10">
          
          {/* Active board render mapping */}
          {activeScreen === 'dashboard' && (
            <DashboardScreen telemetry={telemetry} setTelemetry={setTelemetry} />
          )}

          {activeScreen === 'battery' && (
            <BatteryScreen />
          )}

          {activeScreen === 'driving' && (
            <DrivingScreen />
          )}

          {activeScreen === 'charging' && (
            <ChargingScreen />
          )}

          {activeScreen === 'trip' && (
            <TripScreen />
          )}
        </main>
      </div>

      {/* Firmware Upgrade interactive pop-up modal */}
      {showFirmwareModal && (
        <div className="fixed inset-0 bg-surface-lowest/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container-high rounded-xl border border-white/10 p-6 md:p-8 w-full max-w-md relative overflow-hidden shadow-2xl space-y-6">
            
            {/* Top Close Button */}
            <button 
              onClick={handleCloseFirmware}
              className="absolute top-4 right-4 text-on-surface-variant hover:text-white bg-transparent border-0 cursor-pointer"
            >
              <X size={18} />
            </button>

            {/* Header info */}
            <div className="flex items-start gap-4">
              <div className="p-3 bg-surface-tint/10 rounded-full text-surface-tint">
                <Cpu size={24} />
              </div>
              <div>
                <h3 className="font-sans text-base font-bold text-on-surface">Upgrade Ziptron Firmware</h3>
                <span className="block font-mono text-[9px] text-on-surface-variant uppercase tracking-wider mt-0.5">Firmware Version: v2026.05.28</span>
              </div>
            </div>

            {/* Content status board */}
            {!isUpgrading && !upgradeComplete ? (
              <div className="space-y-4">
                <p className="font-sans text-xs text-on-surface-variant leading-relaxed">
                  A high-priority OTA telemetry firmware is available for Nexon EV Max. Update contains optimized vector maps for the NH4 Mumbai-Pune Highway system, enhancing energy capture cycles by +4.2%.
                </p>
                <div className="p-3 bg-surface border border-white/5 rounded-lg font-mono text-[10px] space-y-1.5 text-left">
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant">Update Size:</span>
                    <span className="text-primary font-bold">1.24 GB</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant">Estimated Install Time:</span>
                    <span className="text-primary font-bold">~12 seconds (Supercharged)</span>
                  </div>
                </div>
                <button 
                  onClick={handleStartUpgrade}
                  className="w-full bg-surface-tint text-surface-dim font-sans text-xs font-bold py-3 rounded-lg hover:bg-primary transition-all duration-300 shadow-[0_0_15px_rgba(0,219,231,0.25)] tracking-wider uppercase cursor-pointer border-0"
                >
                  Download and Flash (OTA)
                </button>
              </div>
            ) : isUpgrading ? (
              <div className="space-y-4 text-center">
                <div className="font-mono text-4xl font-extrabold text-[#e1fdff] glow-text-cyan">
                  {firmwareProgress}%
                </div>
                <span className="block font-sans text-xs text-on-surface animate-pulse font-semibold">
                  {firmwareProgress < 40 
                    ? 'Downloading motor flash maps...' 
                    : firmwareProgress < 80 
                      ? 'Compiling Li-ion balance algorithms...' 
                      : 'Flashing Ziptron logic chip (v2026.05.28)...'
                  }
                </span>
                
                {/* Visual Progress percentage bar */}
                <div className="w-full bg-surface-container-lowest h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-surface-tint h-full transition-all duration-200" 
                    style={{ width: `${firmwareProgress}%` }}
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4 text-center">
                <div className="w-12 h-12 rounded-full bg-tertiary-fixed/10 text-tertiary-fixed mx-auto flex items-center justify-center">
                  <Sparkles size={24} />
                </div>
                <div>
                  <h4 className="font-sans text-base font-bold text-on-surface">Firmware Install Successful</h4>
                  <p className="font-sans text-xs text-on-surface-variant leading-relaxed mt-1">
                    Your Nexon EV Max has complete updated vector definitions. Cellular telemetry operating on active sync parameters.
                  </p>
                </div>
                <button 
                  onClick={handleCloseFirmware}
                  className="w-full bg-tertiary-fixed text-surface-dim font-sans text-xs font-bold py-3 rounded-lg hover:bg-opacity-90 transition-all cursor-pointer border-0"
                >
                  Excellent (Safe Drive)
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
