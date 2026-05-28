import React from 'react';
import { ScreenId } from '../types';
import { 
  LayoutGrid, 
  Route, 
  BatteryCharging, 
  Zap, 
  Cpu, 
  Sliders, 
  Settings, 
  HelpCircle,
  Bell,
  RefreshCw,
  Link2
} from 'lucide-react';

interface SidebarProps {
  activeScreen: ScreenId;
  onNavigate: (screen: ScreenId) => void;
  onShowFirmwareModal: () => void;
}

export default function Sidebar({ activeScreen, onNavigate, onShowFirmwareModal }: SidebarProps) {
  return (
    <>
      {/* Desktop Navigation Sidebar (hidden on mobile, visible on md+) */}
      <nav id="desktop-sidebar" className="hidden md:flex fixed left-0 top-0 h-full flex-col z-40 bg-[#121418] border-r border-slate-800 shadow-2xl w-72 justify-between">
        <div className="flex-1 flex flex-col">
          {/* Brand/Vehicle Header */}
          <div className="p-8 pb-6">
            <div className="mb-6">
              <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                <span className="w-8 h-8 bg-surface-tint rounded-lg flex items-center justify-center text-black italic font-black">V</span>
                VoltPath
              </h1>
              <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest">Nexon EV Intelligence</p>
            </div>

            {/* CTA Firmware Button */}
            <button 
              id="firmware-btn-desktop"
              onClick={onShowFirmwareModal}
              className="w-full bg-surface-tint hover:bg-teal-400 text-black font-sans text-xs font-bold py-3 rounded-xl flex justify-center items-center gap-2 transition-all duration-300 shadow-[0_0_20px_rgba(20,184,166,0.15)] border-0 cursor-pointer"
            >
              <Cpu size={14} />
              Upgrade Firmware
            </button>
          </div>

          {/* Navigation Links */}
          <div className="px-4 py-4 flex flex-col gap-2">
            <a 
              href="#dashboard"
              onClick={(e) => { e.preventDefault(); onNavigate('dashboard'); }}
              className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all border ${
                activeScreen === 'dashboard' 
                  ? 'bg-surface-tint/10 text-surface-tint border-surface-tint/30 font-bold' 
                  : 'text-slate-400 border-transparent hover:text-white hover:bg-white/5'
              }`}
            >
              <LayoutGrid size={18} />
              <span className="text-sm font-medium">Dashboard</span>
            </a>

            <a 
              href="#trip-planner"
              onClick={(e) => { e.preventDefault(); onNavigate('trip'); }}
              className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all border ${
                activeScreen === 'trip' 
                  ? 'bg-surface-tint/10 text-surface-tint border-surface-tint/30 font-bold' 
                  : 'text-slate-400 border-transparent hover:text-white hover:bg-white/5'
              }`}
            >
              <Route size={18} />
              <span className="text-sm font-medium">Trip Planner</span>
            </a>

            <a 
              href="#battery-health"
              onClick={(e) => { e.preventDefault(); onNavigate('battery'); }}
              className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all border ${
                activeScreen === 'battery' 
                  ? 'bg-surface-tint/10 text-surface-tint border-surface-tint/30 font-bold' 
                  : 'text-slate-400 border-transparent hover:text-white hover:bg-white/5'
              }`}
            >
              <BatteryCharging size={18} />
              <span className="text-sm font-medium">Battery Health</span>
            </a>

            <a 
              href="#driving-analysis"
              onClick={(e) => { e.preventDefault(); onNavigate('driving'); }}
              className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all border ${
                activeScreen === 'driving' 
                  ? 'bg-surface-tint/10 text-surface-tint border-surface-tint/30 font-bold' 
                  : 'text-slate-400 border-transparent hover:text-white hover:bg-white/5'
              }`}
            >
              <Zap size={18} />
              <span className="text-sm font-medium">Driving Analysis</span>
            </a>

            <a 
              href="#charging-opt"
              onClick={(e) => { e.preventDefault(); onNavigate('charging'); }}
              className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all border ${
                activeScreen === 'charging' 
              ? 'bg-surface-tint/10 text-surface-tint border-surface-tint/30 font-bold' 
              : 'text-slate-400 border-transparent hover:text-white hover:bg-white/5'
              }`}
            >
              <Sliders size={18} />
              <span className="text-sm font-medium">Charging Opt</span>
            </a>
          </div>
        </div>

        {/* Middle Promo Subscription Card */}
        <div className="px-6 mb-2">
          <div className="bg-[#1E2128] p-4 rounded-2xl border border-slate-800">
            <p className="text-[10px] text-slate-500 mb-1 uppercase font-bold tracking-widest">Active Subscription</p>
            <p className="text-sm text-white font-semibold">ZConnect Premium</p>
            <p className="text-[10px] text-surface-tint mt-1 font-mono">Expires in 284 days</p>
          </div>
        </div>

        {/* Footer Support/Settings */}
        <div className="p-6 border-t border-slate-850 flex flex-col gap-1 bg-[#0d0f12]/30">
          <a 
            href="#settings"
            className="flex items-center gap-4 text-slate-400 px-3 py-2 hover:bg-white/5 hover:text-white rounded-lg transition-all text-xs"
            onClick={(e) => e.preventDefault()}
          >
            <Settings size={16} />
            <span className="font-sans font-medium">Settings</span>
          </a>
          <a 
            href="#support"
            className="flex items-center gap-4 text-slate-400 px-3 py-2 hover:bg-white/5 hover:text-white rounded-lg transition-all text-xs"
            onClick={(e) => e.preventDefault()}
          >
            <HelpCircle size={16} />
            <span className="font-sans font-medium">Support</span>
          </a>
        </div>
      </nav>

      {/* Adaptive Mobile Bottom Navigation Bar / Header */}
      <div id="mobile-navigation" className="md:hidden fixed bottom-0 left-0 w-full z-50 bg-surface-container-low/95 backdrop-blur-2xl px-3 py-2 border-t border-white/5 pb-safe flex justify-between items-center transition-all">
        <ul className="flex justify-around items-center w-full">
          <li>
            <a 
              href="#dashboard"
              onClick={(e) => { e.preventDefault(); onNavigate('dashboard'); }}
              className={`flex flex-col items-center gap-1 p-2 ${
                activeScreen === 'dashboard' ? 'text-surface-tint font-bold' : 'text-on-surface-variant'
              }`}
            >
              <LayoutGrid size={18} />
              <span className="font-sans text-[10px]">Dashboard</span>
            </a>
          </li>
          <li>
            <a 
              href="#trip"
              onClick={(e) => { e.preventDefault(); onNavigate('trip'); }}
              className={`flex flex-col items-center gap-1 p-2 ${
                activeScreen === 'trip' ? 'text-surface-tint font-bold' : 'text-on-surface-variant'
              }`}
            >
              <Route size={18} />
              <span className="font-sans text-[10px]">Trip Planner</span>
            </a>
          </li>
          <li>
            <a 
              href="#battery"
              onClick={(e) => { e.preventDefault(); onNavigate('battery'); }}
              className={`flex flex-col items-center gap-1 p-2 ${
                activeScreen === 'battery' ? 'text-surface-tint font-bold' : 'text-on-surface-variant'
              }`}
            >
              <BatteryCharging size={18} />
              <span className="font-sans text-[10px]">Battery Health</span>
            </a>
          </li>
          <li>
            <a 
              href="#driving"
              onClick={(e) => { e.preventDefault(); onNavigate('driving'); }}
              className={`flex flex-col items-center gap-1 p-2 ${
                activeScreen === 'driving' ? 'text-surface-tint font-bold' : 'text-on-surface-variant'
              }`}
            >
              <Zap size={18} />
              <span className="font-sans text-[10px]">Driving Analysis</span>
            </a>
          </li>
          <li>
            <a 
              href="#charging"
              onClick={(e) => { e.preventDefault(); onNavigate('charging'); }}
              className={`flex flex-col items-center gap-1 p-2 ${
                activeScreen === 'charging' ? 'text-surface-tint font-bold' : 'text-on-surface-variant'
              }`}
            >
              <Sliders size={18} />
              <span className="font-sans text-[10px]">Charging Opt</span>
            </a>
          </li>
        </ul>
      </div>
    </>
  );
}
