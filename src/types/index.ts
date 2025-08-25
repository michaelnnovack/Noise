export interface Measurement {
  id: string;
  user_id?: string;
  decibel_level: number;
  category: string;
  timestamp: Date;
  duration?: number;
}

export interface User {
  id: string;
  email: string;
  created_at: Date;
  custom_threshold?: number;
}

export interface SoundCategory {
  name: string;
  range: [number, number];
  color: string;
  examples: string[];
}

export interface ThresholdAlert {
  level: number;
  type: 'visual' | 'audio' | 'notification';
  enabled: boolean;
}

export interface AudioProcessorMessage {
  type: 'decibel' | 'error';
  value?: number;
  error?: string;
}