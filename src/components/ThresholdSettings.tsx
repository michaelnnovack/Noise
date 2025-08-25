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
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center text-left"
      >
        <h2 className="text-xl font-bold text-gray-800">Alert Settings</h2>
        <svg
          className={`w-5 h-5 transform transition-transform ${
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
        <div className="mt-6 space-y-4">
          <div>
            <label htmlFor="threshold" className="block text-sm font-medium text-gray-700 mb-2">
              Warning Threshold (dB)
            </label>
            <div className="flex items-center space-x-4">
              <input
                id="threshold"
                type="range"
                min="30"
                max="120"
                value={tempThreshold}
                onChange={(e) => setTempThreshold(parseInt(e.target.value))}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-lg font-mono bg-gray-100 px-3 py-1 rounded min-w-[60px] text-center">
                {tempThreshold}
              </span>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>30 dB</span>
              <span>120 dB</span>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-800 mb-2">Current Setting</h4>
            <p className="text-sm text-blue-700">
              Warning alerts will trigger when noise levels exceed <strong>{tempThreshold} dB</strong>
            </p>
            {tempThreshold === 85 && (
              <p className="text-xs text-blue-600 mt-1">
                (OSHA recommended safe exposure limit)
              </p>
            )}
          </div>

          <div className="flex space-x-3">
            <button
              onClick={handleReset}
              className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-md text-sm font-medium transition-colors"
            >
              Reset to Default
            </button>
            <button
              onClick={handleSave}
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md text-sm font-medium transition-colors"
            >
              Save Changes
            </button>
          </div>
        </div>
      )}
    </div>
  );
}