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
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Real-Time Noise Level Monitor
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Measure environmental noise levels over 10-second intervals using your device&apos;s microphone. 
            Get detailed statistics including highest, lowest, and average decibel readings.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div>
            <ClientOnly fallback={
              <div className="bg-white rounded-lg shadow-lg p-8 max-w-md mx-auto">
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
          
          <div className="space-y-6">
            <ThresholdSettings 
              currentThreshold={customThreshold}
              onThresholdChange={handleThresholdChange}
            />
            
            {measurements.length > 0 && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Recent Measurements
                </h3>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {measurements.slice(0, 10).map((measurement, index) => (
                    <div key={index} className="text-sm p-3 bg-gray-50 rounded">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-mono font-bold">
                          Avg: {measurement.average.toFixed(1)} dB
                        </span>
                        <span className="text-gray-600">
                          {measurement.category}
                        </span>
                        <span className="text-gray-500 text-xs">
                          {measurement.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>High: {measurement.highest.toFixed(1)} dB</span>
                        <span>Low: {measurement.lowest.toFixed(1)} dB</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mb-8">
          <SoundReferences />
        </div>

        <div className="mb-8">
          <ClientOnly fallback={
            <div className="bg-white rounded-lg shadow-lg p-6">
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
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-4xl mx-auto">
          <h3 className="font-semibold text-blue-800 mb-2">🔒 Privacy Notice</h3>
          <p className="text-sm text-blue-700">
            This application processes audio data locally on your device to measure noise levels. 
            No audio data is transmitted to external servers. Only measurement results (decibel levels) 
            are stored when you create an account.
          </p>
        </div>
      </main>

      <ClientOnly>
        <AdManager />
      </ClientOnly>
    </div>
  );
}