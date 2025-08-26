'use client';

import { useState } from 'react';
import { DEFAULT_WARNING_THRESHOLD } from '@/lib/constants';

interface ThresholdSettingsProps {
  currentThreshold: number;
  onThresholdChange: (threshold: number) => void;
}

export default function ThresholdSettings({ currentThreshold, onThresholdChange }: ThresholdSettingsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [tempThreshold, setTempThreshold] = useState(currentThreshold);

  const handleSave = () => {
    onThresholdChange(tempThreshold);
    setIsOpen(false);
  };

  const handleReset = () => {
    setTempThreshold(DEFAULT_WARNING_THRESHOLD);
  };

  return (
    <div className="h-full">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center text-left mb-4 group"
      >
        <div className="flex items-center">
          <div className="bg-gradient-to-r from-orange-500 to-red-600 rounded-lg p-3 mr-3">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5-5-5h5V8a3 3 0 110 6v3z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Alert Settings</h2>
            <p className="text-sm text-gray-500">Configure warning thresholds</p>
          </div>
        </div>
        <svg
          className={`w-5 h-5 text-gray-400 transform transition-transform duration-200 group-hover:text-gray-600 ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="space-y-4">
          <div>
            <label htmlFor="threshold" className="block text-sm font-semibold text-gray-700 mb-3">
              Warning Threshold
            </label>
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
              <div className="flex items-center space-x-4 mb-3">
                <input
                  id="threshold"
                  type="range"
                  min="30"
                  max="120"
                  value={tempThreshold}
                  onChange={(e) => setTempThreshold(parseInt(e.target.value))}
                  className="flex-1 h-3 bg-gradient-to-r from-green-200 via-yellow-200 to-red-300 rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, 
                      #dcfce7 0%, 
                      #fef3c7 40%, 
                      #fecaca 70%, 
                      #fca5a5 100%)`
                  }}
                />
                <div className="bg-white border border-gray-300 rounded-lg px-4 py-2 shadow-sm">
                  <span className="text-lg font-bold text-gray-900">{tempThreshold}</span>
                  <span className="text-sm text-gray-500 ml-1">dB</span>
                </div>
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span className="flex items-center">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-1"></div>
                  30 dB (Quiet)
                </span>
                <span className="flex items-center">
                  <div className="w-2 h-2 bg-red-400 rounded-full mr-1"></div>
                  120 dB (Dangerous)
                </span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-start space-x-3">
              <div className="bg-blue-100 rounded-full p-2 flex-shrink-0">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-blue-900 mb-1">Current Threshold</h4>
                <p className="text-sm text-blue-800">
                  Alerts trigger when noise exceeds <strong>{tempThreshold} dB</strong>
                </p>
                {tempThreshold === 85 && (
                  <p className="text-xs text-blue-700 mt-1 flex items-center">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></div>
                    OSHA recommended safe exposure limit
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={handleReset}
              className="flex-1 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-md flex items-center justify-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Reset
            </button>
            <button
              onClick={handleSave}
              className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-md flex items-center justify-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Save
            </button>
          </div>
        </div>
      )}
    </div>
  );
}