'use client';

import { useState, useRef } from 'react';
import { AudioProcessor } from '@/lib/audio';
import { 
  CALIBRATION_METHODS, 
  TEST_CASES, 
  calibrationTester, 
  CalibrationResult
} from '@/lib/audioCalibration';

interface CalibrationTesterProps {
  onClose: () => void;
}

export default function CalibrationTester({ onClose }: CalibrationTesterProps) {
  const [selectedMethod, setSelectedMethod] = useState<string>(CALIBRATION_METHODS[0].name);
  const [selectedTestCase, setSelectedTestCase] = useState<string>(TEST_CASES[0].name);
  const [isRecording, setIsRecording] = useState(false);
  const [currentRMS, setCurrentRMS] = useState<number>(0);
  const [currentDB, setCurrentDB] = useState<number>(0);
  const [results, setResults] = useState<CalibrationResult[]>([]);
  const [testReport, setTestReport] = useState<string>('');
  const [recordingTime, setRecordingTime] = useState<number>(0);

  const audioProcessor = useRef<AudioProcessor | null>(null);
  const recordingInterval = useRef<NodeJS.Timeout | null>(null);
  const rmsHistory = useRef<number[]>([]);

  const initializeAudio = async () => {
    if (!audioProcessor.current) {
      audioProcessor.current = new AudioProcessor();
    }
    await audioProcessor.current.initialize();
  };

  const startCalibrationTest = async () => {
    try {
      await initializeAudio();
      setIsRecording(true);
      setRecordingTime(5);
      rmsHistory.current = [];

      // Start monitoring with real-time RMS collection
      if (audioProcessor.current) {
        const collectRMS = () => {
          if (!audioProcessor.current || !isRecording) return;
          
          // Get RMS from the audio processor
          const rms = audioProcessor.current.getCurrentRMS();
          
          // Apply selected calibration method
          const method = CALIBRATION_METHODS.find(m => m.name === selectedMethod);
          const db = method ? method.formula(rms) : 0;
          
          setCurrentRMS(rms);
          setCurrentDB(db);
          rmsHistory.current.push(rms);
          
          requestAnimationFrame(collectRMS);
        };

        collectRMS();

        // Countdown timer
        recordingInterval.current = setInterval(() => {
          setRecordingTime(prev => {
            if (prev <= 1) {
              finishTest();
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
    } catch (error) {
      console.error('Failed to start calibration test:', error);
      setIsRecording(false);
    }
  };

  const finishTest = () => {
    setIsRecording(false);
    
    if (recordingInterval.current) {
      clearInterval(recordingInterval.current);
    }

    // Calculate average RMS from the test period
    const avgRMS = rmsHistory.current.length > 0 
      ? rmsHistory.current.reduce((sum, val) => sum + val, 0) / rmsHistory.current.length
      : 0;

    // Test all methods against this RMS value
    const newResults: CalibrationResult[] = [];
    CALIBRATION_METHODS.forEach(method => {
      const result = calibrationTester.testCalibration(avgRMS, method.name, selectedTestCase);
      newResults.push(result);
    });

    setResults(prev => [...prev, ...newResults]);
    rmsHistory.current = [];
    setRecordingTime(0);
  };

  const generateReport = () => {
    const report = calibrationTester.generateReport();
    setTestReport(report);
  };

  const clearResults = () => {
    calibrationTester.clearResults();
    setResults([]);
    setTestReport('');
  };

  const stopRecording = () => {
    setIsRecording(false);
    if (recordingInterval.current) {
      clearInterval(recordingInterval.current);
    }
    setRecordingTime(0);
  };

  const selectedMethodObj = CALIBRATION_METHODS.find(m => m.name === selectedMethod);
  const selectedTestCaseObj = TEST_CASES.find(t => t.name === selectedTestCase);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl max-h-[90vh] overflow-y-auto p-6 w-full">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Audio Calibration Tester</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Test Configuration */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Test Scenario
              </label>
              <select
                value={selectedTestCase}
                onChange={(e) => setSelectedTestCase(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {TEST_CASES.map(testCase => (
                  <option key={testCase.name} value={testCase.name}>
                    {testCase.name}
                  </option>
                ))}
              </select>
              {selectedTestCaseObj && (
                <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-800 font-medium">{selectedTestCaseObj.description}</p>
                  <p className="text-xs text-blue-600 mt-1">{selectedTestCaseObj.instructions}</p>
                  <p className="text-xs text-blue-600 mt-1">
                    Expected: {selectedTestCaseObj.expectedDbRange[0]}-{selectedTestCaseObj.expectedDbRange[1]} dB
                  </p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Calibration Method (for live preview)
              </label>
              <select
                value={selectedMethod}
                onChange={(e) => setSelectedMethod(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {CALIBRATION_METHODS.map(method => (
                  <option key={method.name} value={method.name}>
                    {method.name}
                  </option>
                ))}
              </select>
              {selectedMethodObj && (
                <p className="text-xs text-gray-600 mt-1">{selectedMethodObj.description}</p>
              )}
            </div>

            {/* Current Reading */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
              <h3 className="font-semibold text-gray-800 mb-3">Live Reading</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">RMS Value:</span>
                  <span className="font-mono text-sm">{currentRMS.toFixed(6)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Calculated dB:</span>
                  <span className="font-mono text-lg font-bold text-blue-600">
                    {currentDB.toFixed(1)} dB
                  </span>
                </div>
              </div>
            </div>

            {/* Test Controls */}
            <div className="space-y-3">
              {!isRecording ? (
                <button
                  onClick={startCalibrationTest}
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300"
                >
                  Start 5-Second Test
                </button>
              ) : (
                <div className="space-y-2">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-2">{recordingTime}</div>
                    <p className="text-sm text-gray-600">Recording... Keep environment steady</p>
                  </div>
                  <button
                    onClick={stopRecording}
                    className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold py-2 px-4 rounded-xl"
                  >
                    Stop Early
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Results Panel */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-gray-800">Test Results</h3>
              <div className="space-x-2">
                <button
                  onClick={generateReport}
                  disabled={results.length === 0}
                  className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white text-sm px-3 py-1 rounded"
                >
                  Generate Report
                </button>
                <button
                  onClick={clearResults}
                  disabled={results.length === 0}
                  className="bg-gray-500 hover:bg-gray-600 disabled:bg-gray-300 text-white text-sm px-3 py-1 rounded"
                >
                  Clear
                </button>
              </div>
            </div>

            {results.length > 0 && (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {results.slice(-8).map((result, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border text-sm ${
                      result.withinRange
                        ? 'bg-green-50 border-green-200 text-green-800'
                        : 'bg-red-50 border-red-200 text-red-800'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold">{result.testCase}</p>
                        <p className="text-xs opacity-75">{result.method}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{result.measured.toFixed(1)} dB</p>
                        <p className="text-xs">
                          Expected: {result.expected[0]}-{result.expected[1]} dB
                        </p>
                      </div>
                    </div>
                    {!result.withinRange && (
                      <p className="text-xs mt-1">Error: {result.error.toFixed(1)} dB</p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {testReport && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 max-h-64 overflow-y-auto">
                <h4 className="font-semibold mb-2">Calibration Report</h4>
                <pre className="text-xs text-gray-700 whitespace-pre-wrap">{testReport}</pre>
              </div>
            )}

            {results.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <p>No test results yet.</p>
                <p className="text-sm mt-1">Run some calibration tests to see results here.</p>
              </div>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <h4 className="font-semibold text-amber-800 mb-2">How to Use This Tester</h4>
          <ol className="text-sm text-amber-700 space-y-1">
            <li>1. Select a test scenario that matches your current environment</li>
            <li>2. Follow the instructions to set up the environment properly</li>
            <li>3. Click &quot;Start 5-Second Test&quot; and keep the environment steady</li>
            <li>4. The system tests all calibration methods against your measurement</li>
            <li>5. Run multiple tests in different environments</li>
            <li>6. Generate a report to see which method works best overall</li>
          </ol>
        </div>
      </div>
    </div>
  );
}