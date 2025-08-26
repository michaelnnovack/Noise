'use client';

import { useState, useEffect, useRef } from 'react';
import { AudioProcessor } from '@/lib/audio';
import { getCategoryForDecibel, DEFAULT_WARNING_THRESHOLD } from '@/lib/constants';
import { getBrowserCompatibilityMessage } from '@/lib/browserSupport';
import { CALIBRATION_METHODS } from '@/lib/audioCalibration';
import CalibrationTester from './CalibrationTester';

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
  const [calibrationMethod, setCalibrationMethod] = useState<string>('RMS Linear Mapping');
  const [showCalibrationTester, setShowCalibrationTester] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  const audioProcessor = useRef<AudioProcessor | null>(null);
  
  useEffect(() => {
    audioProcessor.current = new AudioProcessor({ calibrationMethod });
    
    return () => {
      if (audioProcessor.current) {
        audioProcessor.current.cleanup();
      }
    };
  }, [calibrationMethod]);

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
    <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-8 relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500 rounded-full filter blur-2xl"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-indigo-500 rounded-full filter blur-2xl"></div>
      </div>

      <div className="relative z-10">
        {error && (
          <div className="bg-gradient-to-r from-red-50 to-red-100 border-l-4 border-red-400 text-red-800 px-4 py-3 rounded-lg mb-6">
            <div className="flex items-start">
              <svg className="w-5 h-5 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-sm font-medium">{error}</p>
                {!AudioProcessor.isSupported() && (
                  <p className="text-xs mt-1 opacity-75">
                    Please use a modern browser with microphone support.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="text-center">
          {isMonitoring && countdown > 0 ? (
            <div className="text-center py-8">
              <div className="relative inline-block mb-6">
                <div className="w-32 h-32 mx-auto bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                  <div className="text-4xl font-bold text-white">
                    {countdown}
                  </div>
                </div>
                <div className="absolute inset-0 rounded-full border-4 border-blue-200 animate-ping"></div>
              </div>
              <p className="text-lg font-medium text-gray-700 mb-2">Measuring...</p>
              <p className="text-sm text-gray-500">{countdown} seconds remaining</p>
            </div>
          ) : results ? (
            <div className="py-6">
              {/* Main Average Display */}
              <div className="mb-8">
                <div className={`text-7xl font-bold mb-3 transition-all duration-300 ${
                  isWarningLevel 
                    ? 'text-red-600 animate-pulse drop-shadow-lg' 
                    : 'text-gray-800'
                }`}>
                  {results.average.toFixed(1)}
                  <span className="text-3xl ml-2 text-gray-500">dB</span>
                </div>
                <div className="text-lg font-medium text-gray-600 mb-4">Average Level</div>
                
                <div className={`inline-flex items-center px-6 py-3 rounded-full text-white font-bold text-lg shadow-lg transition-all duration-300 ${category.color} ${
                  isWarningLevel ? 'animate-pulse' : ''
                }`}>
                  <div className="w-3 h-3 bg-white rounded-full mr-3 opacity-75"></div>
                  {category.name}
                </div>
              </div>

              {/* High/Low Stats */}
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
                  <div className="flex items-center justify-center mb-2">
                    <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                    </svg>
                    <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Peak</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-800">{results.highest.toFixed(1)}</div>
                  <div className="text-xs text-gray-500">dB</div>
                </div>
                
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
                  <div className="flex items-center justify-center mb-2">
                    <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
                    </svg>
                    <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Low</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-800">{results.lowest.toFixed(1)}</div>
                  <div className="text-xs text-gray-500">dB</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-12">
              <div className="w-24 h-24 mx-auto bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center mb-6">
                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </div>
              
              <div className="text-5xl font-bold mb-3 text-gray-400">
                --.-
                <span className="text-2xl ml-2">dB</span>
              </div>
              
              <div className="inline-block px-6 py-3 rounded-full bg-gray-200 text-gray-600 font-semibold">
                Ready to measure
              </div>
            </div>
          )}

          <div className="space-y-4 mt-8">
            {!isMonitoring ? (
              <button
                onClick={startMeasurement}
                disabled={!!error && !AudioProcessor.isSupported()}
                className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-gray-400 disabled:to-gray-400 text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg disabled:hover:scale-100 disabled:hover:shadow-none flex items-center justify-center"
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Start 10-Second Measurement
              </button>
            ) : (
              <button
                onClick={stopMeasurement}
                className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg flex items-center justify-center"
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9h6v6H9V9z" />
                </svg>
                Stop Measuring
              </button>
            )}
          </div>

          {isWarningLevel && results && results.average > 0 && (
            <div className="mt-6 p-4 bg-gradient-to-r from-red-50 to-orange-50 border-l-4 border-red-400 rounded-lg">
              <div className="flex items-center">
                <svg className="w-6 h-6 text-red-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <div>
                  <p className="text-red-800 font-semibold">Hearing Risk Warning</p>
                  <p className="text-red-700 text-sm mt-1">
                    Average noise level ({results.average.toFixed(1)} dB) exceeds your safe threshold
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Settings Panel */}
          <div className="mt-6 border-t border-gray-200 pt-6">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="w-full flex items-center justify-between text-left text-sm font-semibold text-gray-700 hover:text-gray-900"
            >
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Calibration Settings
              </div>
              <svg
                className={`w-4 h-4 transition-transform ${showSettings ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {showSettings && (
              <div className="mt-4 space-y-4">
                {/* Calibration Method Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Calibration Method
                  </label>
                  <select
                    value={calibrationMethod}
                    onChange={(e) => setCalibrationMethod(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                    disabled={isMonitoring}
                  >
                    {CALIBRATION_METHODS.map(method => (
                      <option key={method.name} value={method.name}>
                        {method.name}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    {CALIBRATION_METHODS.find(m => m.name === calibrationMethod)?.description}
                  </p>
                </div>

                {/* Calibration Actions */}
                <div className="flex space-x-2">
                  <button
                    onClick={() => setShowCalibrationTester(true)}
                    disabled={isMonitoring}
                    className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    🧪 Test Calibration
                  </button>
                </div>

                {/* Accuracy Notice */}
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <div className="flex items-start">
                    <svg className="w-4 h-4 text-amber-600 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <p className="text-xs font-medium text-amber-800">Accuracy Note</p>
                      <p className="text-xs text-amber-700 mt-1">
                        Web-based measurements are estimates. For critical applications, use a calibrated sound level meter.
                        Results may vary based on device microphone and browser.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Calibration Tester Modal */}
      {showCalibrationTester && (
        <CalibrationTester onClose={() => setShowCalibrationTester(false)} />
      )}
    </div>
  );
}