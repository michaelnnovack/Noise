'use client';

import { CALIBRATION_METHODS } from './audioCalibration';

export interface AudioProcessorOptions {
  calibrationMethod?: string;
}

export class AudioProcessor {
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private microphone: MediaStreamAudioSourceNode | null = null;
  private dataArray: Uint8Array | null = null;
  private stream: MediaStream | null = null;
  private animationFrame: number | null = null;
  private measurementInterval: NodeJS.Timeout | null = null;
  private measurements: number[] = [];
  private isCollecting: boolean = false;
  private calibrationMethod: string;

  constructor(options: AudioProcessorOptions = {}) {
    this.calibrationMethod = options.calibrationMethod || 'Current Method';
  }

  setCalibrationMethod(method: string): void {
    this.calibrationMethod = method;
  }

  async initialize(): Promise<void> {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false
        }
      });
      this.audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      this.analyser = this.audioContext.createAnalyser();
      
      // Use larger FFT size for better resolution and get time domain data
      this.analyser.fftSize = 2048;
      this.analyser.smoothingTimeConstant = 0.3;
      const bufferLength = this.analyser.fftSize;
      this.dataArray = new Uint8Array(new ArrayBuffer(bufferLength));
      
      this.microphone = this.audioContext.createMediaStreamSource(this.stream);
      this.microphone.connect(this.analyser);
    } catch (error) {
      throw new Error('Failed to access microphone: ' + (error as Error).message);
    }
  }

  startMonitoring(callback: (results: { highest: number, lowest: number, average: number }) => void): void {
    if (!this.analyser || !this.dataArray) {
      throw new Error('Audio processor not initialized');
    }

    this.measurements = [];
    this.isCollecting = true;

    const collectMeasurement = () => {
      if (this.analyser && this.dataArray && this.isCollecting) {
        // Get time domain data for amplitude measurement
        // @ts-expect-error - TypeScript issue with ArrayBufferLike compatibility
        this.analyser.getByteTimeDomainData(this.dataArray);
        
        // Calculate RMS from time domain data (amplitude)
        let sum = 0;
        for (let i = 0; i < this.dataArray.length; i++) {
          // Convert from 0-255 range to -1 to 1 range
          const sample = (this.dataArray[i] - 128) / 128;
          sum += sample * sample;
        }
        
        const rms = Math.sqrt(sum / this.dataArray.length);
        
        // Apply selected calibration method
        const method = CALIBRATION_METHODS.find(m => m.name === this.calibrationMethod);
        const decibel = method ? method.formula(rms) : 20;
        
        // Ensure reasonable bounds
        const clampedDecibel = Math.max(15, Math.min(120, decibel));
        
        // Optional debug logging (enabled via environment variable)
        if (process.env.NODE_ENV === 'development' && this.measurements.length % 60 === 0) {
          console.log(`🎤 Audio Debug - RMS: ${rms.toFixed(4)}, dB: ${clampedDecibel.toFixed(1)}`);
        }
        
        this.measurements.push(Math.round(clampedDecibel * 10) / 10);
        
        this.animationFrame = requestAnimationFrame(collectMeasurement);
      }
    };
    
    // Start collecting measurements
    collectMeasurement();
    
    // After 10 seconds, calculate stats and call callback
    this.measurementInterval = setTimeout(() => {
      this.isCollecting = false;
      
      if (this.measurements.length > 0) {
        const highest = Math.max(...this.measurements);
        const lowest = Math.min(...this.measurements);
        const average = this.measurements.reduce((sum, val) => sum + val, 0) / this.measurements.length;
        
        callback({
          highest: Math.round(highest * 10) / 10,
          lowest: Math.round(lowest * 10) / 10,
          average: Math.round(average * 10) / 10
        });
      }
      
      this.stopMonitoring();
    }, 10000); // 10 seconds
  }

  stopMonitoring(): void {
    this.isCollecting = false;
    
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
    
    if (this.measurementInterval) {
      clearTimeout(this.measurementInterval);
      this.measurementInterval = null;
    }
  }

  cleanup(): void {
    this.stopMonitoring();
    
    if (this.microphone) {
      this.microphone.disconnect();
    }
    
    if (this.audioContext) {
      this.audioContext.close();
    }
    
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
    }
    
    this.audioContext = null;
    this.analyser = null;
    this.microphone = null;
    this.dataArray = null;
    this.stream = null;
    this.measurements = [];
    this.isCollecting = false;
  }

  // Method for calibration testing - exposes RMS calculation
  getCurrentRMS(): number {
    if (!this.analyser || !this.dataArray) {
      return 0;
    }

    // @ts-expect-error - TypeScript issue with ArrayBufferLike compatibility
    this.analyser.getByteTimeDomainData(this.dataArray);
    
    let sum = 0;
    for (let i = 0; i < this.dataArray.length; i++) {
      const sample = (this.dataArray[i] - 128) / 128;
      sum += sample * sample;
    }
    
    return Math.sqrt(sum / this.dataArray.length);
  }

  static isSupported(): boolean {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  }
}