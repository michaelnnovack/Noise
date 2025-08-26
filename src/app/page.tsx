'use client';

import { useState, useCallback, useEffect } from 'react';
import DecibelMeter from '@/components/DecibelMeter';
import SoundReferences from '@/components/SoundReferences';
import Header from '@/components/Header';
import ThresholdSettings from '@/components/ThresholdSettings';
import AuthModal from '@/components/AuthModal';
import MeasurementHistory from '@/components/MeasurementHistory';
import AdManager from '@/components/AdManager';
import ClientOnly from '@/components/ClientOnly';
import { useAuth } from '@/components/AuthProvider';
import { DatabaseService } from '@/lib/database';
import { DEFAULT_WARNING_THRESHOLD } from '@/lib/constants';

export default function Home() {
  const { user, loading } = useAuth();
  const [measurements, setMeasurements] = useState<Array<{
    highest: number;
    lowest: number;
    average: number;
    category: string;
    timestamp: Date;
  }>>([]);
  const [customThreshold, setCustomThreshold] = useState(DEFAULT_WARNING_THRESHOLD);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Load user profile on login
  useEffect(() => {
    const loadUserProfile = async () => {
      if (user) {
        const profile = await DatabaseService.getUserProfile(user.id);
        if (profile?.custom_threshold) {
          setCustomThreshold(profile.custom_threshold);
        }
        
        // Load recent measurements
        const recentMeasurements = await DatabaseService.getMeasurements(user.id, 10);
        const formattedMeasurements = recentMeasurements.map(m => ({
          highest: m.decibel_level, // For backwards compatibility with single measurements
          lowest: m.decibel_level,  
          average: m.decibel_level,
          category: m.category,
          timestamp: m.timestamp
        }));
        setMeasurements(formattedMeasurements);
      } else {
        // Reset to guest mode
        setCustomThreshold(DEFAULT_WARNING_THRESHOLD);
        setMeasurements([]);
      }
    };

    if (!loading) {
      loadUserProfile();
    }
  }, [user, loading]);

  const handleMeasurement = useCallback(async (results: { highest: number, lowest: number, average: number }, category: string) => {
    const newMeasurement = {
      highest: results.highest,
      lowest: results.lowest,
      average: results.average,
      category,
      timestamp: new Date()
    };

    // Update UI immediately
    setMeasurements(prev => {
      const updated = [newMeasurement, ...prev].slice(0, 50);
      return updated;
    });

    // Save to database if user is logged in (using average for backwards compatibility)
    if (user) {
      await DatabaseService.saveMeasurement({
        user_id: user.id,
        decibel_level: results.average,
        category,
        timestamp: new Date()
      });
    }

    // Trigger measurement complete event for ads
    document.dispatchEvent(new CustomEvent('measurementComplete'));
  }, [user]);

  const handleThresholdChange = async (threshold: number) => {
    setCustomThreshold(threshold);
    
    // Save to database if user is logged in
    if (user) {
      await DatabaseService.updateUserProfile(user.id, {
        custom_threshold: threshold
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onOpenAuthModal={() => setAuthModalOpen(true)} />
      
      <AuthModal 
        isOpen={authModalOpen} 
        onClose={() => setAuthModalOpen(false)} 
      />
      
      <main>
        {/* Hero Section with Centered Measurement Box */}
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500 rounded-full filter blur-3xl"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-500 rounded-full filter blur-3xl"></div>
          </div>
          
          <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="pt-16 pb-8 text-center">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Noise Level
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                  Monitor
                </span>
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-12 leading-relaxed">
                Measure environmental noise levels with precision over 10-second intervals. 
                Get comprehensive statistics and protect your hearing health.
              </p>
            </div>

            {/* Centered Measurement Box */}
            <div className="flex justify-center mb-16">
              <div className="w-full max-w-lg">
                <ClientOnly fallback={
                  <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-8">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                      <p className="text-gray-600">Loading sound meter...</p>
                    </div>
                  </div>
                }>
                  <DecibelMeter 
                    onMeasurement={handleMeasurement}
                    customThreshold={customThreshold}
                  />
                </ClientOnly>
              </div>
            </div>

            {/* Quick Actions Row */}
            <div className="max-w-4xl mx-auto mb-20">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6">
                  <ThresholdSettings 
                    currentThreshold={customThreshold}
                    onThresholdChange={handleThresholdChange}
                  />
                </div>
                
                {measurements.length > 0 && (
                  <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      Recent Measurements
                    </h3>
                    <div className="space-y-3 max-h-60 overflow-y-auto">
                      {measurements.slice(0, 5).map((measurement, index) => (
                        <div key={index} className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-3 border border-gray-200">
                          <div className="flex justify-between items-center mb-2">
                            <div className="flex items-center space-x-2">
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              <span className="font-mono font-bold text-gray-900">
                                {measurement.average.toFixed(1)} dB avg
                              </span>
                            </div>
                            <span className="text-xs px-2 py-1 bg-white rounded-full text-gray-600">
                              {measurement.category}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <div className="flex space-x-4 text-xs text-gray-500">
                              <span>↑ {measurement.highest.toFixed(1)}</span>
                              <span>↓ {measurement.lowest.toFixed(1)}</span>
                            </div>
                            <span className="text-xs text-gray-400">
                              {measurement.timestamp.toLocaleTimeString()}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            {/* Sound References */}
            <div className="mb-16">
              <SoundReferences />
            </div>

            {/* Measurement History */}
            <div className="mb-16">
              <ClientOnly fallback={
                <div className="bg-gray-50 rounded-2xl shadow-lg p-8">
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading measurement history...</p>
                  </div>
                </div>
              }>
                <MeasurementHistory />
              </ClientOnly>
            </div>

            {/* Privacy Notice */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-8 text-center max-w-4xl mx-auto">
              <div className="flex justify-center mb-4">
                <div className="bg-blue-100 rounded-full p-3">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
              </div>
              <h3 className="font-semibold text-blue-900 mb-3 text-lg">Privacy First Design</h3>
              <p className="text-blue-700 leading-relaxed max-w-2xl mx-auto">
                Your privacy is our priority. All audio processing happens locally on your device. 
                No audio data is ever transmitted to our servers - only the calculated decibel measurements 
                are stored when you create an account.
              </p>
            </div>
          </div>
        </div>
      </main>

      <ClientOnly>
        <AdManager />
      </ClientOnly>
    </div>
  );
}