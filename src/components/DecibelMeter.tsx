'use client';

import { useState, useEffect, useRef } from 'react';
import { AudioProcessor } from '@/lib/audio';
import { getCategoryForDecibel, DEFAULT_WARNING_THRESHOLD } from '@/lib/constants';
import { getBrowserCompatibilityMessage } from '@/lib/browserSupport';

interface MeasurementResults {
  highest: number;
  lowest: number;
  average: number;
}

interface DecibelMeterProps {
  onMeasurement?: (results: MeasurementResults, category: string) => void;
  customThreshold?: number;
}

export default function DecibelMeter({ onMeasurement, customThreshold = DEFAULT_WARNING_THRESHOLD }: DecibelMeterProps) {
  const [results, setResults] = useState<MeasurementResults | null>(null);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number>(0);
  
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
      setResults(null);
      setCountdown(10);
      
      // Start countdown
      const countdownInterval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(countdownInterval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      audioProcessor.current?.startMonitoring((measurementResults) => {
        setResults(measurementResults);
        const category = getCategoryForDecibel(measurementResults.average);
        onMeasurement?.(measurementResults, category.name);
        setIsMonitoring(false);
        setCountdown(0);
      });
    } catch (err) {
      setError((err as Error).message);
      setIsMonitoring(false);
      setCountdown(0);
    }
  };

  const stopMeasurement = () => {
    audioProcessor.current?.stopMonitoring();
    setIsMonitoring(false);
    setCountdown(0);
  };

  const category = results ? getCategoryForDecibel(results.average) : getCategoryForDecibel(0);
  const isWarningLevel = results ? results.average >= customThreshold : false;

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
        {isMonitoring && countdown > 0 ? (
          <div className="text-center">
            <div className="text-6xl font-bold text-blue-600 mb-2">
              {countdown}
            </div>
            <p className="text-lg text-gray-600 mb-6">Measuring... {countdown}s remaining</p>
          </div>
        ) : results ? (
          <div>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-800">{results.highest.toFixed(1)}</div>
                <div className="text-sm text-gray-600">Highest dB</div>
              </div>
              <div className="text-center">
                <div className={`text-4xl font-bold mb-2 ${isWarningLevel ? 'text-red-600 animate-pulse' : 'text-gray-800'}`}>
                  {results.average.toFixed(1)}
                  <span className="text-2xl ml-1">dB</span>
                </div>
                <div className="text-sm text-gray-600">Average</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-800">{results.lowest.toFixed(1)}</div>
                <div className="text-sm text-gray-600">Lowest dB</div>
              </div>
            </div>
            
            <div className={`inline-block px-4 py-2 rounded-full text-white font-semibold mb-6 ${category.color}`}>
              {category.name}
            </div>
          </div>
        ) : (
          <div>
            <div className="text-6xl font-bold mb-2 text-gray-400">
              --.-
              <span className="text-2xl ml-2">dB</span>
            </div>
            
            <div className="inline-block px-4 py-2 rounded-full text-white font-semibold mb-6 bg-gray-400">
              Ready to measure
            </div>
          </div>
        )}

        <div className="space-y-4">
          {!isMonitoring ? (
            <button
              onClick={startMeasurement}
              disabled={!!error && !AudioProcessor.isSupported()}
              className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white font-bold py-3 px-6 rounded-lg transition-colors"
            >
              Start 10-Second Measurement
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

        {isWarningLevel && results && results.average > 0 && (
          <div className="mt-4 p-3 bg-red-100 border border-red-400 rounded-lg">
            <p className="text-red-700 text-sm font-semibold">
              ⚠️ Warning: Average noise level exceeds safe threshold!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}