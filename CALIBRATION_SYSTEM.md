# Audio Calibration System - User Guide

## Overview

This system addresses the fundamental challenge: **Web Audio API cannot directly measure Sound Pressure Level (SPL) in decibels**. The API provides digital audio data, but converting this to real-world decibel measurements requires calibration that accounts for:

- Microphone sensitivity variations
- Device-specific audio processing
- Browser implementation differences
- Environmental factors

## How It Works

### 1. Multiple Calibration Methods

We implement 4 different calibration approaches:

#### **RMS Linear Mapping** (Recommended)
- Maps RMS values to expected dB ranges based on typical web audio behavior
- Most consistent across different environments
- Best for relative measurements

#### **Current Method** 
- Simple logarithmic formula: `20 * log10(rms) + 50`
- Good baseline for comparison

#### **Professional Reference**
- Uses 94 dB SPL calibration standard
- More aggressive scaling, higher readings

#### **Conservative Web Audio**
- Conservative approach for web environments
- Lower baseline, more realistic for quiet environments

### 2. Validation Test Cases

#### **Silent Room Test** (20-40 dB expected)
- Quietest room possible
- No fans, TV, music, conversation
- Tests low-end accuracy

#### **Quiet Office Test** (35-50 dB expected)  
- Normal quiet indoor environment
- Slight ambient noise, no conversation
- Tests baseline ambient levels

#### **Normal Conversation Test** (55-75 dB expected)
- Two people talking at normal volume
- Microphone 3 feet away
- Tests mid-range accuracy

#### **TV Volume Test** (60-80 dB expected)
- Television at comfortable viewing volume
- 6 feet from microphone
- Tests consistent mid-range sources

#### **Loud Music Test** (75-95 dB expected)
- Music played loudly but not at maximum
- 3 feet from microphone
- Tests high-end accuracy

## How to Use the Calibration System

### Step 1: Access Calibration Settings
1. Click on the measurement box settings (gear icon)
2. Expand "Calibration Settings"
3. Select a calibration method to test
4. Click "🧪 Test Calibration"

### Step 2: Run Validation Tests
1. Select a test scenario that matches your environment
2. Follow the setup instructions carefully
3. Click "Start 5-Second Test" and keep environment steady
4. System tests ALL calibration methods against your measurement
5. Repeat with different environmental scenarios

### Step 3: Analyze Results
1. Run tests in multiple environments (quiet, normal, loud)
2. Click "Generate Report" to see which method performs best
3. Switch to the recommended calibration method
4. Clear results and run more tests to validate

### Step 4: Choose Best Method
Based on testing, use the method that:
- Has highest success rate (measurements within expected ranges)
- Has lowest average error across different environments
- Feels most accurate for your use cases

## Expected Results by Environment

| Environment | Expected Reading | What You Should Test |
|-------------|------------------|---------------------|
| **Very Quiet** | 20-40 dB | Library, quiet bedroom at night |
| **Normal Quiet** | 35-50 dB | Office, living room, no activity |
| **Conversation** | 55-75 dB | Normal talking, TV at moderate volume |
| **Loud** | 75-95 dB | Music, loud conversation, traffic |

## Limitations & Accuracy

### ⚠️ Important Disclaimers
- **Web-based measurements are estimates only**
- Accuracy varies significantly by device and microphone
- Not suitable for professional acoustic measurements
- Results may vary 5-15 dB from calibrated meters

### ✅ Best Use Cases
- Relative noise monitoring (is it getting louder/quieter?)
- Trend detection over time
- General awareness of noise levels
- Comparing different environments
- Educational purposes

### ❌ Not Suitable For
- OSHA compliance measurements
- Legal noise level documentation
- Precise acoustic engineering
- Medical/hearing assessments

## Troubleshooting

### Readings Too High
- Try "Conservative Web Audio" or "RMS Linear Mapping" methods
- Check microphone gain settings in system preferences
- Ensure microphone is not too close to noise sources

### Readings Too Low
- Try "Professional Reference" calibration method
- Check that microphone permissions are granted
- Verify microphone is not muted or gain too low

### Inconsistent Results
- Run multiple tests in the same environment
- Allow 2-3 seconds for browser audio processing to stabilize
- Ensure consistent microphone placement and environment

## Technical Notes

### RMS Calculation
```
RMS = sqrt(sum(sample²) / sample_count)
where samples are normalized to -1 to 1 range
```

### Calibration Formula Examples
```
RMS Linear:     Piecewise mapping of RMS ranges to dB ranges
Current:        20 * log10(rms) + 50
Professional:   20 * log10(rms) + 94
Conservative:   20 * log10(rms) + 35 (with limits)
```

## Contributing Calibration Data

If you have access to a professional sound level meter:

1. Run parallel measurements with both devices
2. Test all environments (quiet to loud)
3. Document the offset between readings
4. Share findings to help improve calibration accuracy

## Future Improvements

- User-specific calibration offsets
- Device-specific calibration profiles
- Machine learning calibration from user feedback
- Integration with external sound level meters for auto-calibration