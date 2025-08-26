'use client';

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

  async initialize(): Promise<void> {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      this.analyser = this.audioContext.createAnalyser();
      
      this.analyser.fftSize = 256;
      const bufferLength = this.analyser.frequencyBinCount;
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
        // @ts-expect-error - TypeScript issue with ArrayBufferLike compatibility
        this.analyser.getByteFrequencyData(this.dataArray);
        
        let sum = 0;
        for (let i = 0; i < this.dataArray.length; i++) {
          sum += this.dataArray[i] * this.dataArray[i];
        }
        
        const rms = Math.sqrt(sum / this.dataArray.length);
        const decibel = 20 * Math.log10(rms / 255) + 94; // Calibration offset
        
        // Clamp to reasonable range
        const clampedDecibel = Math.max(0, Math.min(120, decibel));
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

  static isSupported(): boolean {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  }
}