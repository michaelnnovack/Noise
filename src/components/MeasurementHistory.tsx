'use client';

import { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js';
import { DatabaseService } from '@/lib/database';
import { useAuth } from './AuthProvider';
import { Measurement } from '@/types';
import { usePremium } from '@/hooks/usePremium';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function MeasurementHistory() {
  const { user } = useAuth();
  const { isPremium, getRemainingTime } = usePremium();
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState<'hour' | 'day' | 'week' | 'month'>('day');

  useEffect(() => {
    const loadHistory = async () => {
      if (!user) {
        setMeasurements([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      
      const now = new Date();
      let startDate: Date;

      switch (timeFilter) {
        case 'hour':
          startDate = new Date(now.getTime() - 60 * 60 * 1000);
          break;
        case 'day':
          startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
      }

      let data = await DatabaseService.getMeasurementsByDateRange(user.id, startDate, now);
      
      // Limit data for non-premium users
      if (!isPremium) {
        data = data.slice(0, 20); // Limit to last 20 measurements
      }
      
      setMeasurements(data);
      setLoading(false);
    };

    loadHistory();
  }, [user, timeFilter, isPremium]);

  const exportData = async () => {
    if (!user) return;
    
    const csvData = await DatabaseService.exportUserData(user.id);
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `noise-measurements-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const chartData = {
    labels: measurements.map(m => m.timestamp.toLocaleTimeString()),
    datasets: [
      {
        label: 'Decibel Level',
        data: measurements.map(m => m.decibel_level),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.1,
      },
    ],
  };

  const chartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Noise Level Over Time',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.parsed.y.toFixed(1)} dB`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 120,
        title: {
          display: true,
          text: 'Decibel Level (dB)',
        },
        grid: {
          color: function(context) {
            if (context.tick.value === 85) {
              return 'rgba(239, 68, 68, 0.5)'; // Red line at 85dB warning threshold
            }
            return 'rgba(0, 0, 0, 0.1)';
          },
        },
      },
      x: {
        title: {
          display: true,
          text: 'Time',
        },
      },
    },
  };

  if (!user) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Measurement History</h2>
        <div className="text-center py-8">
          <p className="text-gray-600 mb-4">
            Sign in to view your measurement history and export data.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-3">
          <h2 className="text-2xl font-bold text-gray-800">Measurement History</h2>
          {isPremium && (
            <div className="flex items-center bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
              <span>✨ Premium</span>
              {getRemainingTime() && (
                <span className="ml-1">
                  ({getRemainingTime()!.hours}h {getRemainingTime()!.minutes}m left)
                </span>
              )}
            </div>
          )}
        </div>
        <div className="flex space-x-2">
          <select
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value as 'hour' | 'day' | 'week' | 'month')}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="hour">Last Hour</option>
            <option value="day">Last Day</option>
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
          </select>
          <button
            onClick={exportData}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
          >
            Export CSV
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : measurements.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600">No measurements found for the selected time period.</p>
          <p className="text-sm text-gray-500 mt-2">
            Start measuring noise levels to see your history here.
          </p>
        </div>
      ) : (
        <>
          {!isPremium && measurements.length >= 20 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-800 font-semibold">Limited History View</p>
                  <p className="text-yellow-700 text-sm">
                    Showing only the last 20 measurements. Watch an ad to unlock full history and advanced analytics!
                  </p>
                </div>
                <div className="text-2xl">🎁</div>
              </div>
            </div>
          )}
          
          <div className="h-64 mb-6">
            <Line data={chartData} options={chartOptions} />
          </div>
          
          <div className="border-t pt-4">
            <h3 className="font-semibold text-gray-800 mb-3">Recent Measurements</h3>
            <div className="max-h-48 overflow-y-auto">
              <div className="grid grid-cols-3 gap-4 text-sm font-semibold text-gray-600 mb-2">
                <div>Time</div>
                <div>Level</div>
                <div>Category</div>
              </div>
              {measurements.slice(0, 10).map((measurement, index) => (
                <div key={index} className="grid grid-cols-3 gap-4 text-sm py-2 border-b border-gray-100">
                  <div className="text-gray-600">
                    {measurement.timestamp.toLocaleString()}
                  </div>
                  <div className="font-mono font-bold">
                    {measurement.decibel_level.toFixed(1)} dB
                  </div>
                  <div className="text-gray-700">
                    {measurement.category}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}