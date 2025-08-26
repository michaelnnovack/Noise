'use client';

import { SOUND_CATEGORIES } from '@/lib/constants';
import { useState } from 'react';

export default function SoundReferences() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="max-w-5xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Sound Level Reference Guide</h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Understanding noise levels and their impact on your hearing health
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex justify-between items-center text-left p-6 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg p-3 mr-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Explore Sound Categories</h3>
              <p className="text-sm text-gray-500">Compare everyday sounds and their decibel levels</p>
            </div>
          </div>
          <svg
            className={`w-6 h-6 text-gray-400 transform transition-transform duration-200 ${
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
          <div className="border-t border-gray-100">
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                {SOUND_CATEGORIES.map((category, index) => (
                  <div
                    key={index}
                    className="group bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-xl p-5 hover:shadow-lg hover:border-gray-300 transition-all duration-300"
                  >
                    <div className="flex items-start space-x-4">
                      <div className={`w-5 h-5 rounded-full ${category.color} flex-shrink-0 mt-1 shadow-sm`} />
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="font-bold text-gray-900 text-lg">{category.name}</h3>
                          <span className="text-sm font-mono text-gray-700 bg-white px-3 py-1 rounded-full shadow-sm border border-gray-200">
                            {category.range[0]}-{category.range[1]} dB
                          </span>
                        </div>
                        
                        <div className="space-y-2">
                          {category.examples.map((example, i) => (
                            <div key={i} className="flex items-center space-x-2">
                              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full flex-shrink-0"></div>
                              <span className="text-sm text-gray-600">{example}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Safety Information */}
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-amber-400 rounded-xl p-6">
                <div className="flex items-start space-x-3">
                  <div className="bg-amber-100 rounded-full p-2 flex-shrink-0">
                    <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-bold text-amber-900 mb-2 text-lg">Hearing Health Guidelines</h4>
                    <div className="space-y-2 text-amber-800">
                      <p className="flex items-center space-x-2">
                        <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                        <span><strong>85+ dB:</strong> Prolonged exposure can cause permanent hearing damage</span>
                      </p>
                      <p className="flex items-center space-x-2">
                        <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                        <span><strong>120+ dB:</strong> Immediate pain threshold - avoid exposure</span>
                      </p>
                      <p className="flex items-center space-x-2">
                        <span className="w-2 h-2 bg-amber-500 rounded-full"></span>
                        <span>Follow OSHA guidelines to protect your hearing long-term</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}