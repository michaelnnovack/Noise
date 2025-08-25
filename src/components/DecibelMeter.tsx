'use client';

import { useState, useEffect, useRef } from 'react';
import { AudioProcessor } from '@/lib/audio';
import { getCategoryForDecibel, DEFAULT_WARNING_THRESHOLD } from '@/lib/constants';
import { getBrowserCompatibilityMessage } from '@/lib/browserSupport';

interface DecibelMeterProps {
  onMeasurement?: (decibel: number, category: string) => void;
  customThreshold?: number;
}

export default function DecibelMeter({ onMeasurement, customThreshold = DEFAULT_WARNING_THRESHOLD }: DecibelMeterProps) {
  const [decibel, setDecibel] = useState<number>(0);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [measurementType, setMeasurementType] = useState<'single' | 'continuous'>('single');
  
  const audioProcessor = useRef<AudioProcessor | null>(null);
  
  useEffect(() => {
    audioProcessor.current = new AudioProcessor();
    
    return () => {
      if (audioProcessor.current) {
        audioProcessor.current.cleanup();
      }
    };
  }, []);

  const initializeAudio = async () => {
    const compatibility = getBrowserCompatibilityMessage();
    
    if (!compatibility.isSupported) {
      setError(`Browser compatibility issues: ${compatibility.issues.join(', ')}`);
      return;
    }

    if (!AudioProcessor.isSupported()) {
      setError('Web Audio API not supported in this browser');
      return;
    }

    try {
      setError(null);
      await audioProcessor.current?.initialize();
      setIsInitialized(true);
    } catch (err) {
      const errorMessage = (err as Error).message;
      if (errorMessage.includes('Permission denied')) {
        setError('Microphone permission denied. Please allow microphone access and try again.');
      } else if (errorMessage.includes('NotFound')) {
        setError('No microphone found. Please check your audio devices.');
      } else {
        setError(`Failed to initialize audio: ${errorMessage}`);
      }
    }
  };

  const startMeasurement = async () => {
    if (!isInitialized) {
      await initializeAudio();
      if (error) return;
    }

    try {
      setIsMonitoring(true);
      audioProcessor.current?.startMonitoring((decibelValue) => {
        setDecibel(decibelValue);
        const category = getCategoryForDecibel(decibelValue);
        onMeasurement?.(decibelValue, category.name);
        
        if (measurementType === 'single') {
          stopMeasurement();
        }
      });
    } catch (err) {
      setError((err as Error).message);
      setIsMonitoring(false);
    }
  };

  const stopMeasurement = () => {
    audioProcessor.current?.stopMonitoring();
    setIsMonitoring(false);
  };

  const category = getCategoryForDecibel(decibel);
  const isWarningLevel = decibel >= customThreshold;

  return (
    <div className="bg-white rounded-lg shadow-lg p-8 max-w-md mx-auto">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p className="text-sm">{error}</p>
          {!AudioProcessor.isSupported() && (
            <p className="text-xs mt-2">
              Please use a modern browser with microphone support.
            </p>
          )}
        </div>
      )}

      <div className="text-center">
        <div className={`text-6xl font-bold mb-2 ${isWarningLevel ? 'text-red-600 animate-pulse' : 'text-gray-800'}`}>
          {decibel.toFixed(1)}
          <span className="text-2xl ml-2">dB</span>
        </div>
        
        <div className={`inline-block px-4 py-2 rounded-full text-white font-semibold mb-6 ${category.color}`}>
          {category.name}
        </div>

        <div className="space-y-4">
          <div className="flex justify-center space-x-4 mb-4">
            <button
              onClick={() => setMeasurementType('single')}
              className={`px-4 py-2 rounded ${
                measurementType === 'single'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              Single
            </button>
            <button
              onClick={() => setMeasurementType('continuous')}
              className={`px-4 py-2 rounded ${
                measurementType === 'continuous'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              Continuous
            </button>
          </div>

          {!isMonitoring ? (
            <button
              onClick={startMeasurement}
              disabled={!!error && !AudioProcessor.isSupported()}
              className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              Start Measuring
            </button>
          ) : (
            <button
              onClick={stopMeasurement}
              className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              Stop Measuring
            </button>
          )}
        </div>

        {isWarningLevel && decibel > 0 && (
          <div className="mt-4 p-3 bg-red-100 border border-red-400 rounded-lg">
            <p className="text-red-700 text-sm font-semibold">
              ⚠️ Warning: Noise level exceeds safe threshold!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}