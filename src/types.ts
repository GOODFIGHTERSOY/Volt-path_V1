export type ScreenId = 'dashboard' | 'battery' | 'driving' | 'charging' | 'trip';

export interface TelemetryData {
  trueRangeKm: number;
  araiEstimateKm: number;
  batterySoh: number;
  packAmbientTemp: number;
  currentElevation: number;
  avgEfficiency: number;
  efficiencyTrend: number;
  lastSyncMinutes: number;
}
