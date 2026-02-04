
export type AppState = 'BOOT' | 'MAIN' | 'CONSULTATION' | 'DIRECTORY' | 'LOGS' | 'BOREDOM' | 'MAPPER' | 'MANIFESTO' | 'ROTARY' | 'RADAR';

export interface Service {
  id: string;
  name: string;
  description: string;
  content: string;
}

export interface LogEntry {
  time: string;
  event: string;
  status: 'OK' | 'CRITICAL' | 'WARNING' | 'COMPROMISED';
}
