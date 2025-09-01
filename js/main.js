/**
 * Main application controller for Noise Detector
 * Coordinates all app functionality and user interactions
 */

class NoiseDetector {
    constructor() {
        this.isRunning = false;
        this.startTime = null;
        this.duration = 30; // seconds
        this.measurements = [];
        this.currentDb = 0;
        
        // Initialize components
        this.audioProcessor = null;
        this.gauge = null;
        this.classifier = null;
        
        this.init();
    }
    
    async init() {
        try {
            // Wait for DOM to be ready
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this.setupUI());
            } else {
                this.setupUI();
            }
            
            // Initialize audio processor when available
            if (typeof AudioProcessor !== 'undefined') {
                this.audioProcessor = new AudioProcessor();
            }
            
            // Don't initialize gauge here - defer until measurement screen is visible
            this.gauge = null;
            
            console.log('Noise Detector initialized');
        } catch (error) {
            console.error('Failed to initialize app:', error);
            this.showError('Failed to initialize the application');
        }
    }
    
    setupUI() {
        // Get UI elements
        this.startBtn = document.getElementById('start-btn');
        this.stopBtn = document.getElementById('stop-btn');
        this.dbDisplay = document.getElementById('current-db');
        this.timerDisplay = document.getElementById('time-remaining');
        this.classificationSection = document.getElementById('live-classification');
        this.historySection = document.getElementById('history-section');
        
        // Bind event listeners
        if (this.startBtn) {
            this.startBtn.addEventListener('click', () => this.startMeasurement());
        }
        
        if (this.stopBtn) {
            this.stopBtn.addEventListener('click', () => this.stopMeasurement());
        }
        
        // Update timer display
        this.updateTimer();
        
        console.log('UI setup complete');
    }
    
    async startMeasurement() {
        try {
            console.log('Starting noise measurement...');
            
            if (!this.audioProcessor) {
                throw new Error('Audio processor not available');
            }
            
            // Switch to measurement screen FIRST
            this.showMeasurementScreen();
            
            // Now initialize the gauge when the screen is visible
            this.initializeGauge();
            
            // Request microphone permission and start audio processing
            await this.audioProcessor.start();
            
            this.isRunning = true;
            this.startTime = Date.now();
            
            // Update UI
            this.startBtn.disabled = true;
            if (this.stopBtn) {
                this.stopBtn.disabled = false;
                this.stopBtn.style.display = 'inline-block';
            }
            if (this.classificationSection) {
                this.classificationSection.classList.remove('hidden');
            }
            
            // Start measurement loop
            this.measurementLoop();
            
            console.log('Measurement started successfully');
        } catch (error) {
            console.error('Failed to start measurement:', error);
            this.showError('Could not access microphone. Please check permissions.');
            this.resetUI();
        }
    }
    
    stopMeasurement() {
        console.log('Stopping measurement...');
        
        this.isRunning = false;
        
        if (this.audioProcessor) {
            this.audioProcessor.stop();
        }
        
        // Save measurement to history
        this.saveMeasurement();
        
        // Show results screen
        this.showResultsScreen();
        
        console.log('Measurement stopped');
    }
    
    measurementLoop() {
        if (!this.isRunning) return;
        
        // Get current decibel reading
        if (this.audioProcessor) {
            this.currentDb = this.audioProcessor.getCurrentDb();
        }
        
        // Update displays
        this.updateDbDisplay();
        this.updateGauge();
        this.updateClassification();
        this.updateTimer();
        
        // Check if time limit reached
        const elapsed = (Date.now() - this.startTime) / 1000;
        if (elapsed >= this.duration) {
            this.stopMeasurement();
            return;
        }
        
        // Schedule next update
        requestAnimationFrame(() => this.measurementLoop());
    }
    
    updateDbDisplay() {
        if (this.dbDisplay) {
            this.dbDisplay.textContent = Math.round(this.currentDb);
        }
    }
    
    updateGauge() {
        if (this.gauge) {
            this.gauge.update(this.currentDb);
        }
    }
    
    updateClassification() {
        if (this.classifier && typeof this.classifier.classify === 'function') {
            const classification = this.classifier.classify(this.currentDb);
            
            const categoryElement = document.getElementById('noise-category');
            const descriptionElement = document.getElementById('noise-description');
            
            if (categoryElement) {
                categoryElement.textContent = classification.category;
                categoryElement.className = `db-range-${classification.range}`;
            }
            
            if (descriptionElement) {
                descriptionElement.textContent = classification.description;
            }
        }
    }
    
    updateTimer() {
        if (!this.timerDisplay) return;
        
        if (this.isRunning && this.startTime) {
            const elapsed = (Date.now() - this.startTime) / 1000;
            const remaining = Math.max(0, Math.ceil(this.duration - elapsed));
            this.timerDisplay.textContent = remaining;
        } else {
            this.timerDisplay.textContent = this.duration;
        }
    }
    
    saveMeasurement() {
        const measurement = {
            timestamp: new Date(),
            averageDb: Math.round(this.currentDb),
            duration: this.duration
        };
        
        this.measurements.unshift(measurement);
        
        // Keep only last 5 measurements
        if (this.measurements.length > 5) {
            this.measurements = this.measurements.slice(0, 5);
        }
        
        // Update history display
        this.updateHistoryDisplay();
        
        // Store in localStorage
        try {
            localStorage.setItem('noise-measurements', JSON.stringify(this.measurements));
        } catch (error) {
            console.warn('Could not save measurements to localStorage:', error);
        }
    }
    
    updateHistoryDisplay() {
        const historyList = document.getElementById('measurement-history');
        if (!historyList) return;
        
        historyList.innerHTML = '';
        
        this.measurements.forEach(measurement => {
            const li = document.createElement('li');
            li.innerHTML = `
                <span>${measurement.averageDb} dB</span>
                <span>${measurement.timestamp.toLocaleTimeString()}</span>
            `;
            historyList.appendChild(li);
        });
        
        if (this.measurements.length > 0) {
            this.historySection.classList.remove('hidden');
        }
    }
    
    resetUI() {
        this.startBtn.disabled = false;
        this.stopBtn.disabled = true;
        this.updateTimer();
    }
    
    showError(message) {
        // Create or update error display
        let errorDiv = document.getElementById('error-message');
        if (!errorDiv) {
            errorDiv = document.createElement('div');
            errorDiv.id = 'error-message';
            errorDiv.className = 'error';
            
            const main = document.querySelector('main');
            if (main) {
                main.insertBefore(errorDiv, main.firstChild);
            }
        }
        
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            if (errorDiv) {
                errorDiv.style.display = 'none';
            }
        }, 5000);
    }
    
    loadStoredMeasurements() {
        try {
            const stored = localStorage.getItem('noise-measurements');
            if (stored) {
                this.measurements = JSON.parse(stored);
                // Convert timestamp strings back to Date objects
                this.measurements = this.measurements.map(m => ({
                    ...m,
                    timestamp: new Date(m.timestamp)
                }));
                this.updateHistoryDisplay();
            }
        } catch (error) {
            console.warn('Could not load stored measurements:', error);
        }
    }
    
    // Screen management methods
    showMeasurementScreen() {
        const startScreen = document.getElementById('start-screen');
        const measurementScreen = document.getElementById('measurement-screen');
        const resultsScreen = document.getElementById('results-screen');
        
        if (startScreen) startScreen.style.display = 'none';
        if (resultsScreen) resultsScreen.style.display = 'none';
        if (measurementScreen) measurementScreen.style.display = 'block';
        
        console.log('Switched to measurement screen');
    }
    
    showResultsScreen() {
        const startScreen = document.getElementById('start-screen');
        const measurementScreen = document.getElementById('measurement-screen');
        const resultsScreen = document.getElementById('results-screen');
        
        if (startScreen) startScreen.style.display = 'none';
        if (measurementScreen) measurementScreen.style.display = 'none';
        if (resultsScreen) resultsScreen.style.display = 'block';
        
        // Add "Test Again" button functionality
        const testAgainBtn = document.getElementById('test-again-btn');
        if (testAgainBtn) {
            testAgainBtn.addEventListener('click', () => this.showStartScreen());
        }
        
        console.log('Switched to results screen');
    }
    
    showStartScreen() {
        const startScreen = document.getElementById('start-screen');
        const measurementScreen = document.getElementById('measurement-screen');
        const resultsScreen = document.getElementById('results-screen');
        
        if (measurementScreen) measurementScreen.style.display = 'none';
        if (resultsScreen) resultsScreen.style.display = 'none';
        if (startScreen) startScreen.style.display = 'block';
        
        // Reset UI state
        this.resetUI();
        
        console.log('Switched to start screen');
    }
    
    initializeGauge() {
        // Only initialize gauge if not already done and measurement screen is visible
        if (!this.gauge && typeof Gauge !== 'undefined') {
            const measurementScreen = document.getElementById('measurement-screen');
            const container = document.getElementById('gauge-container');
            
            if (measurementScreen && measurementScreen.style.display !== 'none' && container) {
                // Wait for the screen to be fully rendered before initializing gauge
                const waitForContainer = () => {
                    const rect = container.getBoundingClientRect();
                    
                    // Check if container has valid dimensions
                    if (rect.width > 0 && rect.height > 0) {
                        try {
                            this.gauge = new Gauge('gauge-container');
                            console.log('Gauge initialized successfully with dimensions:', rect.width, 'x', rect.height);
                        } catch (error) {
                            console.error('Failed to initialize gauge:', error);
                            this.showError('Failed to initialize the measurement gauge.');
                        }
                    } else {
                        console.log('Container not ready, dimensions:', rect.width, 'x', rect.height);
                        // Retry after a longer delay if container dimensions are still zero
                        setTimeout(waitForContainer, 100);
                    }
                };
                
                // Use requestAnimationFrame to ensure DOM is fully updated
                requestAnimationFrame(() => {
                    setTimeout(waitForContainer, 50);
                });
            }
        }
    }
}

// Initialize the app when the script loads
const app = new NoiseDetector();

// Load any stored measurements
if (app.loadStoredMeasurements) {
    app.loadStoredMeasurements();
}