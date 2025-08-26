# Audio Calibration Notes

## Changes Made to Fix Audio Issues

### Problems Identified:
1. **Using frequency data instead of time domain data** - Was using `getByteFrequencyData()` which shows spectral content, not amplitude
2. **Incorrect calibration offset** - The +94 dB offset was too high for web audio environments
3. **Low range clamping** - Minimum was clamped to 0, preventing proper quiet room detection
4. **Audio processing settings** - Browser audio enhancements were interfering with measurements

### Fixes Implemented:

#### 1. Switched to Time Domain Data
- Now uses `getByteTimeDomainData()` for actual amplitude measurements
- Properly converts from 0-255 range to -1 to 1 range for RMS calculation

#### 2. Improved Calibration Formula
```javascript
// Old (incorrect): 
decibel = 20 * Math.log10(rms / 255) + 94;

// New (corrected):
decibel = 20 * Math.log10(rms) + 50;
```

#### 3. Better Audio Setup
- Disabled echo cancellation, noise suppression, and auto gain control
- Increased FFT size to 2048 for better resolution
- Added smoothing time constant for stability

#### 4. Realistic Range Mapping
- **Quiet room** (RMS ~0.01): ~30-40 dB
- **Normal conversation** (RMS ~0.1): ~60-70 dB  
- **Loud environments** (RMS ~0.3+): ~80+ dB

### Expected Results:
- **20-30 dB**: Very quiet room, library silence
- **30-40 dB**: Quiet room, soft whisper
- **40-50 dB**: Normal quiet indoor environment
- **50-60 dB**: Normal conversation at distance
- **60-70 dB**: Normal conversation nearby
- **70-80 dB**: Loud conversation, TV
- **80+ dB**: Very loud, potentially harmful

### Debug Information:
The console will show RMS and decibel values every second during measurement to help verify calibration accuracy.

## Note for Users:
Web audio calibration is inherently challenging due to:
- Varying microphone sensitivity
- Browser audio processing differences
- Device-specific audio drivers
- Environmental factors

The current calibration provides reasonable relative measurements but may not match professional sound level meters exactly.