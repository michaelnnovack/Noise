'use client';

import { SOUND_CATEGORIES } from '@/lib/constants';
import { useState } from 'react';

export default function SoundReferences() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex justify-between items-center text-left"
      >
        <h2 className="text-2xl font-bold text-gray-800">Sound Level References</h2>
        <svg
          className={`w-6 h-6 transform transition-transform ${
            isExpanded ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isExpanded && (
        <div className="mt-6 space-y-4">
          {SOUND_CATEGORIES.map((category, index) => (
            <div
              key={index}
              className="flex items-center p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
            >
              <div className={`w-4 h-4 rounded-full ${category.color} mr-4 flex-shrink-0`} />
              
              <div className="flex-1">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-gray-800">{category.name}</h3>
                  <span className="text-sm font-mono text-gray-600 bg-gray-100 px-2 py-1 rounded">
                    {category.range[0]}-{category.range[1]} dB
                  </span>
                </div>
                
                <div className="text-sm text-gray-600">
                  {category.examples.map((example, i) => (
                    <span key={i}>
                      {example}
                      {i < category.examples.length - 1 && ', '}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}

          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h4 className="font-semibold text-yellow-800 mb-2">Safety Information</h4>
            <p className="text-sm text-yellow-700">
              Prolonged exposure to sounds above 85 dB can cause hearing damage. 
              The Occupational Safety and Health Administration (OSHA) recommends limiting 
              exposure to prevent noise-induced hearing loss.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}