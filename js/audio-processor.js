/**
 * Audio Processing Module for Noise Detector
 * Handles Web Audio API integration and decibel calculations with real-time RMS-based measurements
 * 
 * Features:
 * - Cross-browser Web Audio API support (Chrome, Firefox, Safari, Edge)
 * - Real-time decibel calculation using proper RMS values
 * - Mobile device support with iOS audio context handling
 * - 60fps update rate capability
 * - Calibration system with reference level support
 * - Proper error handling for microphone permissions
 * - User gesture requirement handling for modern browsers
 */

class AudioProcessor {
    constructor() {
        // Audio context and nodes
        this.audioContext = null;
        this.microphone = null;
        this.analyser = null;
        this.gainNode = null;
        this.stream = null;
        
        // Data arrays for real-time processing
        this.timeDataArray = null;
        this.frequencyDataArray = null;
        
        // State management
        this.isInitialized = false;
        this.isActive = false;
        this.isMeasuring = false;
        this.requiresUserGesture = true;
        
        // Calibration settings
        this.calibrationOffset = 0;
        this.referenceLevel = 94; // Standard calibration reference (94 dB SPL)
        
        // Audio processing configuration
        this.fftSize = 2048;
        this.smoothingTimeConstant = 0.3; // Reduced for more responsive readings
        this.minDecibels = -100;
        this.maxDecibels = -10;
        
        // Performance optimization for 60fps
        this.lastUpdateTime = 0;
        this.updateInterval = 1000 / 60; // 16.67ms for 60fps
        this.currentDecibels = 0;
        
        // Browser compatibility flags
        this.browserSupport = this.detectBrowserSupport();
        
        console.log('AudioProcessor initialized with browser support:', this.browserSupport);
    }
    
    /**
     * Initialize the audio processor with microphone access and audio context setup
     * This method handles user gesture requirements and cross-browser compatibility
     */
    async initialize() {
        try {
            console.log('Initializing AudioProcessor...');
            
            // Check browser support first
            if (!this.browserSupport.webAudio) {
                throw new Error('Web Audio API not supported in this browser');
            }
            
            if (!this.browserSupport.getUserMedia) {
                throw new Error('Microphone access not supported in this browser');
            }
            
            // Handle user gesture requirement for modern browsers
            if (this.requiresUserGesture) {
                await this.handleUserGestureRequirement();
            }
            
            // Create audio context with error handling for different browsers
            this.audioContext = await this.createAudioContext();
            
            // Request microphone access with optimized constraints
            this.stream = await this.requestMicrophoneAccess();
            
            // Set up audio processing chain
            this.setupAudioNodes();
            
            // Load saved calibration
            this.loadCalibration();
            
            this.isInitialized = true;
            console.log('AudioProcessor initialized successfully');
            
        } catch (error) {
            console.error('Failed to initialize AudioProcessor:', error);
            this.cleanup();
            throw new Error(`Initialization failed: ${error.message}`);
        }
    }

    /**
     * Legacy method for backward compatibility - delegates to initialize()
     */
    async start() {
        if (!this.isInitialized) {
            await this.initialize();
        }
        this.isActive = true;
        return this.startMeasuring();
    }
    
    /**
     * Start real-time decibel measurements
     */
    startMeasuring() {
        if (!this.isInitialized) {
            throw new Error('AudioProcessor not initialized. Call initialize() first.');
        }
        
        if (this.isMeasuring) {
            console.warn('Already measuring. Stopping current measurement.');
            this.stopMeasuring();
        }
        
        this.isMeasuring = true;
        this.isActive = true;
        
        console.log('Started real-time decibel measurement');
        return Promise.resolve();
    }

    /**
     * Stop real-time decibel measurements
     */
    stopMeasuring() {
        this.isMeasuring = false;
        console.log('Stopped real-time decibel measurement');
    }

    /**
     * Legacy method for backward compatibility
     */
    stop() {
        console.log('Stopping audio processing...');
        
        this.stopMeasuring();
        this.cleanup();
        
        console.log('Audio processing stopped');
    }
    
    /**
     * Get current decibel reading with optimized 60fps performance
     * Returns cached value if called within update interval for performance
     */
    getCurrentDecibels() {
        if (!this.isInitialized || !this.isMeasuring || !this.analyser) {
            return 0;
        }
        
        const now = performance.now();
        
        // Use cached value if within update interval for 60fps performance
        if (now - this.lastUpdateTime < this.updateInterval) {
            return this.currentDecibels;
        }
        
        try {
            // Get time domain data for proper RMS calculation
            this.analyser.getByteTimeDomainData(this.timeDataArray);
            
            // Calculate true RMS from time domain data
            const rms = this.calculateRMS(this.timeDataArray);
            
            // Convert RMS to decibels using proper formula
            let db = this.convertRMSToDecibels(rms);
            
            // Apply calibration offset
            db += this.calibrationOffset;
            
            // Clamp to realistic range for sound level meters
            db = Math.max(20, Math.min(140, db));
            
            // Cache the result
            this.currentDecibels = db;
            this.lastUpdateTime = now;
            
            return db;
            
        } catch (error) {
            console.error('Error calculating decibels:', error);
            return this.currentDecibels || 0;
        }
    }

    /**
     * Legacy method for backward compatibility
     */
    getCurrentDb() {
        return this.getCurrentDecibels();
    }
    
    /**
     * Calibrate the audio processor using a reference sound level
     * @param {number} referenceLevel - The actual dB level of the reference sound (default: 94 dB)
     */
    calibrate(referenceLevel = 94) {
        if (!this.isInitialized || !this.isMeasuring) {
            throw new Error('Cannot calibrate: AudioProcessor not initialized or not measuring');
        }
        
        // Take current reading without calibration
        const originalOffset = this.calibrationOffset;
        this.calibrationOffset = 0;
        
        // Get current uncalibrated reading
        const currentReading = this.getCurrentDecibels();
        
        // Calculate required offset
        const newOffset = referenceLevel - currentReading;
        
        // Restore and apply new offset
        this.calibrationOffset = originalOffset + newOffset;
        this.referenceLevel = referenceLevel;
        
        // Save calibration
        this.saveCalibration();
        
        console.log(`Calibration completed: offset = ${this.calibrationOffset.toFixed(2)} dB (reference: ${referenceLevel} dB)`);
        
        return this.calibrationOffset;
    }
    
    /**
     * Calculate RMS (Root Mean Square) from time domain data
     * This provides proper amplitude measurement for decibel calculation
     * @param {Uint8Array} timeData - Time domain data from analyser
     * @returns {number} RMS value
     */
    calculateRMS(timeData) {
        let sum = 0;
        const length = timeData.length;
        
        for (let i = 0; i < length; i++) {
            // Convert from 0-255 range to -1 to 1 range
            const amplitude = (timeData[i] - 128) / 128;
            sum += amplitude * amplitude;
        }
        
        return Math.sqrt(sum / length);
    }
    
    /**
     * Convert RMS value to decibels using proper SPL formula
     * @param {number} rms - RMS value from time domain analysis
     * @returns {number} Decibel value
     */
    convertRMSToDecibels(rms) {
        if (rms <= 0) return -Infinity;
        
        // Convert RMS to decibels using 20 * log10(rms/reference)
        // Reference value of 1.0 for digital full scale
        const db = 20 * Math.log10(rms);
        
        // Adjust for typical microphone sensitivity and convert to SPL approximation
        // This is a rough approximation - proper calibration is needed for accurate readings
        return db + 94; // Approximate adjustment to SPL scale
    }
    
    /**
     * Detect browser support for required Web Audio API features
     * @returns {Object} Browser support flags
     */
    detectBrowserSupport() {
        const support = {
            webAudio: !!(window.AudioContext || window.webkitAudioContext),
            getUserMedia: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
            audioWorklet: !!(window.AudioContext && 'audioWorklet' in AudioContext.prototype),
            safari: /^((?!chrome|android).)*safari/i.test(navigator.userAgent),
            ios: /iPad|iPhone|iPod/.test(navigator.userAgent),
            chrome: /Chrome/.test(navigator.userAgent),
            firefox: /Firefox/.test(navigator.userAgent),
            edge: /Edge/.test(navigator.userAgent)
        };
        
        return support;
    }
    
    /**
     * Handle user gesture requirement for audio context activation
     * Modern browsers require user interaction before allowing audio processing
     */
    async handleUserGestureRequirement() {
        return new Promise((resolve) => {
            // In a real implementation, this would be triggered by user interaction
            // For now, we assume the calling code handles the user gesture
            this.requiresUserGesture = false;
            resolve();
        });
    }
    
    /**
     * Create audio context with cross-browser compatibility
     * @returns {AudioContext} Configured audio context
     */
    async createAudioContext() {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        
        if (!AudioContextClass) {
            throw new Error('AudioContext not supported');
        }
        
        const audioContext = new AudioContextClass();
        
        // Handle iOS-specific audio context issues
        if (this.browserSupport.ios && audioContext.state === 'suspended') {
            await audioContext.resume();
        }
        
        // Set up state change listeners
        audioContext.addEventListener('statechange', () => {
            console.log(`AudioContext state changed to: ${audioContext.state}`);
        });
        
        return audioContext;
    }
    
    /**
     * Request microphone access with optimized constraints
     * @returns {MediaStream} Audio stream from microphone
     */
    async requestMicrophoneAccess() {
        const constraints = {
            audio: {
                echoCancellation: false,
                noiseSuppression: false,
                autoGainControl: false,
                sampleRate: { ideal: 48000 },
                channelCount: { ideal: 1 }
            },
            video: false
        };
        
        try {
            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            console.log('Microphone access granted');
            return stream;
        } catch (error) {
            console.error('Microphone access denied:', error);
            throw new Error(`Microphone access failed: ${error.message}`);
        }
    }
    
    /**
     * Set up the audio processing node chain
     * Creates and connects analyser, gain nodes, and microphone input
     */
    setupAudioNodes() {
        try {
            // Create microphone input node
            this.microphone = this.audioContext.createMediaStreamSource(this.stream);
            
            // Create gain node for volume control
            this.gainNode = this.audioContext.createGain();
            this.gainNode.gain.value = 1.0;
            
            // Create analyser node for frequency/time domain analysis
            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = this.fftSize;
            this.analyser.smoothingTimeConstant = this.smoothingTimeConstant;
            this.analyser.minDecibels = this.minDecibels;
            this.analyser.maxDecibels = this.maxDecibels;
            
            // Connect the audio processing chain
            this.microphone.connect(this.gainNode);
            this.gainNode.connect(this.analyser);
            
            // Initialize data arrays for analysis
            const bufferLength = this.analyser.frequencyBinCount;
            this.timeDataArray = new Uint8Array(this.analyser.fftSize);
            this.frequencyDataArray = new Uint8Array(bufferLength);
            this.dataArray = this.frequencyDataArray; // For backward compatibility
            
            console.log('Audio nodes set up successfully');
            console.log(`FFT Size: ${this.fftSize}, Buffer Length: ${bufferLength}`);
            console.log(`Sample Rate: ${this.audioContext.sampleRate} Hz`);
            
        } catch (error) {
            console.error('Error setting up audio nodes:', error);
            throw error;
        }
    }
    
    /**
     * Clean up audio resources and close connections
     * Properly disposes of audio context, streams, and nodes
     */
    cleanup() {
        console.log('Cleaning up AudioProcessor resources...');
        
        try {
            // Stop measuring
            this.isMeasuring = false;
            this.isActive = false;
            
            // Disconnect audio nodes
            if (this.microphone) {
                this.microphone.disconnect();
                this.microphone = null;
            }
            
            if (this.gainNode) {
                this.gainNode.disconnect();
                this.gainNode = null;
            }
            
            if (this.analyser) {
                this.analyser.disconnect();
                this.analyser = null;
            }
            
            // Close media stream
            if (this.stream) {
                this.stream.getTracks().forEach(track => {
                    track.stop();
                    console.log('Stopped audio track:', track.kind);
                });
                this.stream = null;
            }
            
            // Close audio context
            if (this.audioContext && this.audioContext.state !== 'closed') {
                this.audioContext.close().then(() => {
                    console.log('AudioContext closed successfully');
                }).catch(error => {
                    console.warn('Error closing AudioContext:', error);
                });
                this.audioContext = null;
            }
            
            // Reset state
            this.isInitialized = false;
            this.currentDecibels = 0;
            this.timeDataArray = null;
            this.frequencyDataArray = null;
            this.dataArray = null;
            
            console.log('AudioProcessor cleanup completed');
            
        } catch (error) {
            console.error('Error during cleanup:', error);
        }
    }
    
    /**
     * Get frequency domain data for spectrum analysis
     * @returns {Array|null} Array of frequency data or null if not available
     */
    getFrequencyData() {
        if (!this.isActive || !this.analyser || !this.frequencyDataArray) {
            return null;
        }
        
        this.analyser.getByteFrequencyData(this.frequencyDataArray);
        return Array.from(this.frequencyDataArray);
    }
    
    /**
     * Check if Web Audio API is supported in current browser
     * @returns {boolean} True if Web Audio API is supported
     */
    isWebAudioSupported() {
        return !!(window.AudioContext || window.webkitAudioContext) && 
               !!navigator.mediaDevices && 
               !!navigator.mediaDevices.getUserMedia;
    }
    
    /**
     * Set calibration offset manually
     * @param {number} offset - Calibration offset in dB
     */
    setCalibrationOffset(offset) {
        this.calibrationOffset = offset;
        this.saveCalibration();
        console.log(`Calibration offset set to: ${offset} dB`);
    }
    
    /**
     * Save calibration settings to localStorage
     */
    saveCalibration() {
        try {
            localStorage.setItem('noise-detector-calibration', this.calibrationOffset.toString());
        } catch (error) {
            console.warn('Could not save calibration:', error);
        }
    }
    
    /**
     * Load calibration settings from localStorage
     */
    loadCalibration() {
        try {
            const stored = localStorage.getItem('noise-detector-calibration');
            if (stored !== null) {
                this.calibrationOffset = parseFloat(stored) || 0;
                console.log(`Loaded calibration offset: ${this.calibrationOffset} dB`);
            }
        } catch (error) {
            console.warn('Could not load calibration:', error);
        }
    }
    
    /**
     * Reset calibration to default (0 dB offset)
     */
    resetCalibration() {
        this.calibrationOffset = 0;
        this.saveCalibration();
        console.log('Calibration reset to 0 dB offset');
    }
    
    /**
     * Method for detecting claps for calibration (placeholder for future implementation)
     * @param {number} threshold - Detection threshold (0.0 to 1.0)
     * @returns {boolean} True if clap detected
     */
    detectClap(threshold = 0.8) {
        // Placeholder for clap detection algorithm
        // This would analyze sudden volume spikes characteristic of hand claps
        console.log('Clap detection not yet implemented');
        return false;
    }
    
    /**
     * Get audio context sample rate for advanced processing
     * @returns {number} Sample rate in Hz or 0 if not available
     */
    getSampleRate() {
        return this.audioContext ? this.audioContext.sampleRate : 0;
    }
    
    /**
     * Get current audio context state
     * @returns {string} Audio context state ('running', 'suspended', 'closed', etc.)
     */
    getContextState() {
        return this.audioContext ? this.audioContext.state : 'closed';
    }
    
    /**
     * Resume audio context if suspended (handles browser autoplay policies)
     * @returns {Promise} Promise that resolves when context is resumed
     */
    async resumeContext() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            await this.audioContext.resume();
            console.log('AudioContext resumed');
        }
    }
    
    /**
     * Get detailed system information for debugging
     * @returns {Object} System and browser information
     */
    getSystemInfo() {
        return {
            browserSupport: this.browserSupport,
            audioContext: this.audioContext ? {
                state: this.audioContext.state,
                sampleRate: this.audioContext.sampleRate,
                currentTime: this.audioContext.currentTime
            } : null,
            isInitialized: this.isInitialized,
            isMeasuring: this.isMeasuring,
            calibrationOffset: this.calibrationOffset,
            referenceLevel: this.referenceLevel,
            fftSize: this.fftSize,
            updateInterval: this.updateInterval
        };
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AudioProcessor;
}