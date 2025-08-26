'use client';

export interface CalibrationMethod {
  name: string;
  description: string;
  formula: (rms: number) => number;
  expectedRanges: {
    silence: [number, number];
    quiet: [number, number];
    normal: [number, number];
    loud: [number, number];
  };
}

export const CALIBRATION_METHODS: CalibrationMethod[] = [
  {
    name: 'Current Method',
    description: 'Current calibration (20 * log10(rms) + 50)',
    formula: (rms: number) => rms > 0.001 ? 20 * Math.log10(rms) + 50 : 20,
    expectedRanges: {
      silence: [20, 30],
      quiet: [30, 40],
      normal: [50, 70],
      loud: [70, 90]
    }
  },
  {
    name: 'Professional Reference',
    description: 'Based on 94 dB SPL calibration standard',
    formula: (rms: number) => rms > 0.001 ? 20 * Math.log10(rms) + 94 : 30,
    expectedRanges: {
      silence: [30, 40],
      quiet: [40, 50],
      normal: [60, 80],
      loud: [80, 100]
    }
  },
  {
    name: 'Conservative Web Audio',
    description: 'Conservative approach for web environments',
    formula: (rms: number) => {
      if (rms <= 0.001) return 25;
      // Use logarithmic scaling with lower reference
      const db = 20 * Math.log10(rms) + 35;
      return Math.max(25, Math.min(110, db));
    },
    expectedRanges: {
      silence: [25, 35],
      quiet: [35, 45],
      normal: [45, 65],
      loud: [65, 85]
    }
  },
  {
    name: 'RMS Linear Mapping',
    description: 'Linear mapping of RMS to typical dB ranges',
    formula: (rms: number) => {
      // Map RMS values to expected dB ranges based on typical web audio behavior
      if (rms <= 0.001) return 30;
      if (rms <= 0.01) return 30 + (rms - 0.001) / 0.009 * 20; // 30-50 dB
      if (rms <= 0.1) return 50 + (rms - 0.01) / 0.09 * 30; // 50-80 dB
      return 80 + Math.min((rms - 0.1) / 0.2 * 20, 20); // 80-100 dB max
    },
    expectedRanges: {
      silence: [30, 35],
      quiet: [35, 50],
      normal: [50, 80],
      loud: [80, 100]
    }
  }
];

export interface TestCase {
  name: string;
  description: string;
  expectedDbRange: [number, number];
  instructions: string;
  category: 'silence' | 'quiet' | 'normal' | 'loud';
}

export const TEST_CASES: TestCase[] = [
  {
    name: 'Silent Room Test',
    description: 'Very quiet room with no talking, minimal ambient noise',
    expectedDbRange: [20, 40],
    instructions: 'Find the quietest room in your house. Turn off fans, TV, music. Sit still and measure.',
    category: 'silence'
  },
  {
    name: 'Quiet Office Test',
    description: 'Normal quiet indoor environment',
    expectedDbRange: [35, 50],
    instructions: 'Normal room with slight ambient noise, no conversation.',
    category: 'quiet'
  },
  {
    name: 'Normal Conversation Test',
    description: 'Two people having a normal conversation',
    expectedDbRange: [55, 75],
    instructions: 'Have a normal conversation at typical speaking volume, microphone 3 feet away.',
    category: 'normal'
  },
  {
    name: 'TV Volume Test',
    description: 'Television at normal viewing volume',
    expectedDbRange: [60, 80],
    instructions: 'TV or music at comfortable listening volume, microphone 6 feet away.',
    category: 'normal'
  },
  {
    name: 'Loud Music Test',
    description: 'Music played loudly but not at maximum volume',
    expectedDbRange: [75, 95],
    instructions: 'Music or TV turned up loud (but not uncomfortable), microphone 3 feet away.',
    category: 'loud'
  }
];

export interface CalibrationResult {
  method: string;
  testCase: string;
  measured: number;
  expected: [number, number];
  withinRange: boolean;
  error: number; // Difference from expected midpoint
}

export class AudioCalibrationTester {
  private results: CalibrationResult[] = [];

  testCalibration(rmsValue: number, methodName: string, testCaseName: string): CalibrationResult {
    const method = CALIBRATION_METHODS.find(m => m.name === methodName);
    const testCase = TEST_CASES.find(t => t.name === testCaseName);
    
    if (!method || !testCase) {
      throw new Error('Invalid method or test case');
    }

    const measured = method.formula(rmsValue);
    const expectedMidpoint = (testCase.expectedDbRange[0] + testCase.expectedDbRange[1]) / 2;
    const withinRange = measured >= testCase.expectedDbRange[0] && measured <= testCase.expectedDbRange[1];
    const error = Math.abs(measured - expectedMidpoint);

    const result: CalibrationResult = {
      method: methodName,
      testCase: testCaseName,
      measured,
      expected: testCase.expectedDbRange,
      withinRange,
      error
    };

    this.results.push(result);
    return result;
  }

  getAllResults(): CalibrationResult[] {
    return this.results;
  }

  getBestMethod(): string {
    const methodScores = new Map<string, { totalError: number, successCount: number, testCount: number }>();

    this.results.forEach(result => {
      if (!methodScores.has(result.method)) {
        methodScores.set(result.method, { totalError: 0, successCount: 0, testCount: 0 });
      }
      
      const score = methodScores.get(result.method)!;
      score.totalError += result.error;
      score.testCount += 1;
      if (result.withinRange) {
        score.successCount += 1;
      }
    });

    let bestMethod = '';
    let bestScore = Infinity;

    methodScores.forEach((score, method) => {
      // Combine accuracy (success rate) and precision (low error)
      const successRate = score.successCount / score.testCount;
      const avgError = score.totalError / score.testCount;
      const combinedScore = avgError / successRate; // Lower is better

      if (combinedScore < bestScore) {
        bestScore = combinedScore;
        bestMethod = method;
      }
    });

    return bestMethod;
  }

  generateReport(): string {
    const report = ['# Audio Calibration Test Results\n'];
    
    report.push('## Summary by Method\n');
    const methodStats = new Map<string, { success: number, total: number, avgError: number }>();
    
    this.results.forEach(result => {
      if (!methodStats.has(result.method)) {
        methodStats.set(result.method, { success: 0, total: 0, avgError: 0 });
      }
      const stats = methodStats.get(result.method)!;
      stats.total += 1;
      stats.avgError += result.error;
      if (result.withinRange) stats.success += 1;
    });

    methodStats.forEach((stats, method) => {
      const successRate = ((stats.success / stats.total) * 100).toFixed(1);
      const avgError = (stats.avgError / stats.total).toFixed(1);
      report.push(`**${method}**: ${stats.success}/${stats.total} tests passed (${successRate}%), Avg Error: ${avgError} dB`);
    });

    report.push('\n## Detailed Results\n');
    this.results.forEach(result => {
      const status = result.withinRange ? '✅' : '❌';
      report.push(`${status} **${result.testCase}** (${result.method}): ${result.measured.toFixed(1)} dB (expected ${result.expected[0]}-${result.expected[1]} dB, error: ${result.error.toFixed(1)} dB)`);
    });

    report.push(`\n## Recommendation\n**Best Method**: ${this.getBestMethod()}`);
    
    return report.join('\n');
  }

  clearResults(): void {
    this.results = [];
  }
}

export const calibrationTester = new AudioCalibrationTester();