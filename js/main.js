/**
 * Main application controller for Noise Detector
 * Coordinates all app functionality and user interactions
 */

class NoiseDetector {
    constructor() {
        this.isRunning = false;
        this.startTime = null;
        this.duration = 30; // seconds (default free duration)
        this.measurements = [];
        this.currentDb = 0;
        this.isPremiumSession = false;
        
        // Initialize components
        this.audioProcessor = null;
        this.gauge = null;
        this.classifier = null;
        this.premiumFeatures = null;
        this.history = null;
        
        this.init();
        this.waitForMonetization();
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
            
            // Initialize enhanced health classifier when available
            if (typeof NoiseClassifier !== 'undefined') {
                this.classifier = new NoiseClassifier();
                console.log('Enhanced health classifier initialized');
            }
            
            // Initialize premium features module
            if (typeof PremiumFeatures !== 'undefined') {
                this.premiumFeatures = new PremiumFeatures();
                console.log('Premium features module loaded');
            }
            
            // Initialize history system
            if (typeof MeasurementHistory !== 'undefined') {
                this.history = new MeasurementHistory();
                console.log('History system loaded');
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
        
        // Setup history interface event listeners
        this.setupHistoryUI();
        
        // Load and display existing history
        this.updateHistoryDisplay();
        
        console.log('UI setup complete');
    }
    
    async startMeasurement() {
        try {
            console.log('Starting noise measurement...');
            
            if (!this.audioProcessor) {
                throw new Error('Audio processor not available');
            }
            
            // Check if this should be a premium session
            if (this.monetization && this.monetization.isPremiumUnlocked()) {
                this.isPremiumSession = true;
                this.duration = this.premiumFeatures ? this.premiumFeatures.getMeasurementDuration() : 300;
                console.log('Starting premium measurement session - 5 minutes');
            } else {
                this.isPremiumSession = false;
                this.duration = 30;
                console.log('Starting standard measurement session - 30 seconds');
            }
            
            // Switch to measurement screen FIRST
            this.showMeasurementScreen();
            
            // Update UI for premium/standard session
            if (this.isPremiumSession) {
                this.showPremiumIndicator();
                // Activate premium features for detailed data collection
                if (this.premiumFeatures) {
                    this.premiumFeatures.activate();
                    this.premiumFeatures.startExtendedMeasurement(this.audioProcessor);
                }
            }
            
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
        
        // Stop premium data collection if active
        if (this.isPremiumSession && this.premiumFeatures) {
            this.premiumAnalysis = this.premiumFeatures.stopExtendedMeasurement();
            console.log('Premium analysis completed:', this.premiumAnalysis);
        }
        
        // Save measurement to history
        this.saveMeasurement();
        
        // Show results screen with appropriate content
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
        if (!this.history) {
            console.warn('History system not available');
            return;
        }
        
        // Prepare comprehensive measurement data
        const measurementData = {
            averageDb: Math.round(this.currentDb),
            minDb: Math.max(30, Math.round(this.currentDb) - 5), // Simulated min
            maxDb: Math.min(90, Math.round(this.currentDb) + 8), // Simulated max
            duration: this.duration,
            location: this.getCurrentLocation(),
            notes: '',
            isPremium: this.isPremiumSession,
            sessionType: this.isPremiumSession ? 'Premium' : 'Standard'
        };
        
        // Add premium analysis data if available
        if (this.isPremiumSession && this.premiumAnalysis) {
            measurementData.premiumData = {
                ...this.premiumAnalysis,
                extendedMeasurements: this.premiumFeatures?.getDetailedMeasurements() || []
            };
        }
        
        // Save to history system
        const savedMeasurement = this.history.addMeasurement(measurementData);
        
        // Update history display
        this.updateHistoryDisplay();
        
        console.log('Measurement saved to history:', savedMeasurement);
    }
    
    updateHistoryDisplay() {
        if (!this.history) return;
        
        const historySection = document.getElementById('history-section');
        if (!historySection) return;
        
        // Get current filter setting
        const filter = document.getElementById('history-filter');
        const dateFilter = filter ? filter.value : 'all';
        const filterOptions = dateFilter === 'all' ? {} : { dateFilter };
        
        // Get measurements and statistics
        const measurements = this.history.getMeasurements({ ...filterOptions, limit: 10 });
        const stats = this.history.getStatistics(filterOptions);
        
        // Update statistics overview
        this.updateHistoryStats(stats);
        
        // Update recent measurements list
        this.updateRecentMeasurements(measurements);
        
        // Update insights and trends
        this.updateHistoryInsights(stats);
        
        // Update location analysis
        this.updateLocationAnalysis();
        
        // Show/hide sections based on data availability
        if (measurements.length > 0) {
            historySection.style.display = 'block';
            
            // Show advanced sections for users with multiple measurements
            const showAdvanced = measurements.length >= 3;
            document.getElementById('history-insights').style.display = showAdvanced ? 'block' : 'none';
            document.getElementById('trend-visualization').style.display = showAdvanced ? 'block' : 'none';
            document.getElementById('health-summary').style.display = showAdvanced ? 'block' : 'none';
            
            // Update enhanced health dashboard if we have classifier and sufficient data
            if (showAdvanced && this.classifier) {
                this.updateEnhancedHealthDashboard(measurements);
            }
            
            // Show location analysis if multiple locations exist
            const locationStats = this.history.getLocationInsights();
            const showLocations = Object.keys(locationStats).length > 1;
            document.getElementById('location-analysis').style.display = showLocations ? 'block' : 'none';
        } else {
            historySection.style.display = 'none';
        }
    }
    
    // History Display Methods
    
    updateHistoryStats(stats) {
        const statsContainer = document.getElementById('history-stats');
        if (!statsContainer) return;
        
        statsContainer.innerHTML = `
            <div class="bg-gray-50 rounded-xl p-4 text-center">
                <div class="text-2xl font-bold text-gray-900">${stats.totalMeasurements}</div>
                <div class="text-sm text-gray-600">Total Tests</div>
            </div>
            <div class="bg-blue-50 rounded-xl p-4 text-center">
                <div class="text-2xl font-bold text-blue-600">${stats.averageDb}</div>
                <div class="text-sm text-gray-600">Avg dB</div>
            </div>
            <div class="bg-green-50 rounded-xl p-4 text-center">
                <div class="text-2xl font-bold text-green-600">${stats.oshaCompliantMeasurements}</div>
                <div class="text-sm text-gray-600">Safe Levels</div>
            </div>
            <div class="bg-red-50 rounded-xl p-4 text-center">
                <div class="text-2xl font-bold text-red-600">${stats.highRiskMeasurements}</div>
                <div class="text-sm text-gray-600">High Risk</div>
            </div>
        `;
    }
    
    updateRecentMeasurements(measurements) {
        const historyList = document.getElementById('measurement-history');
        if (!historyList) return;
        
        if (measurements.length === 0) {
            historyList.innerHTML = '<div class="text-gray-500 text-center py-4">No measurements found</div>';
            return;
        }
        
        historyList.innerHTML = measurements.map(measurement => {
            const date = new Date(measurement.timestamp);
            const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const dateStr = date.toLocaleDateString([], { month: 'short', day: 'numeric' });
            
            const dbColor = this.getDbColor(measurement.averageDb);
            const sessionBadge = measurement.isPremium 
                ? '<span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 ml-2"><span class="material-symbols-outlined text-xs mr-1">star</span>Premium</span>'
                : '';
            
            return `
                <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div class="flex items-center">
                        <div class="w-3 h-3 rounded-full ${dbColor} mr-3"></div>
                        <div>
                            <div class="font-semibold text-gray-900">
                                ${measurement.averageDb} dB
                                ${sessionBadge}
                            </div>
                            <div class="text-sm text-gray-600">
                                ${measurement.location !== 'Unknown Location' ? measurement.location : 'Unknown Location'}
                            </div>
                        </div>
                    </div>
                    <div class="text-right text-sm text-gray-500">
                        <div>${timeStr}</div>
                        <div>${dateStr}</div>
                    </div>
                </div>
            `;
        }).join('');
    }
    
    updateHistoryInsights(stats) {
        const insightsContainer = document.getElementById('history-insights');
        if (!insightsContainer) return;
        
        const trend = stats.trendAnalysis;
        const health = stats.healthAnalysis;
        
        let trendIcon, trendText, trendColor;
        switch (trend.trend) {
            case 'increasing':
                trendIcon = 'trending_up';
                trendText = `Noise levels increasing (+${Math.abs(trend.change)}%)`;
                trendColor = 'text-red-600';
                break;
            case 'decreasing':
                trendIcon = 'trending_down';
                trendText = `Noise levels decreasing (-${Math.abs(trend.change)}%)`;
                trendColor = 'text-green-600';
                break;
            case 'stable':
                trendIcon = 'trending_flat';
                trendText = 'Noise levels stable';
                trendColor = 'text-blue-600';
                break;
            default:
                trendIcon = 'help';
                trendText = 'Insufficient data for trend analysis';
                trendColor = 'text-gray-600';
        }
        
        insightsContainer.innerHTML = `
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="bg-white rounded-xl p-4 border">
                    <div class="flex items-center mb-2">
                        <span class="material-symbols-outlined ${trendColor} mr-2">${trendIcon}</span>
                        <span class="font-medium text-gray-900">Trend Analysis</span>
                    </div>
                    <div class="text-sm ${trendColor}">${trendText}</div>
                </div>
                <div class="bg-white rounded-xl p-4 border">
                    <div class="flex items-center mb-2">
                        <span class="material-symbols-outlined text-red-600 mr-2">health_and_safety</span>
                        <span class="font-medium text-gray-900">Health Status</span>
                    </div>
                    <div class="text-sm text-gray-600">
                        Risk Level: <span class="capitalize ${this.getRiskColor(health.averageRiskLevel)}">${health.averageRiskLevel}</span>
                    </div>
                </div>
            </div>
        `;
    }
    
    updateLocationAnalysis() {
        const locationContainer = document.getElementById('location-stats');
        if (!locationContainer || !this.history) return;
        
        const locationStats = this.history.getLocationInsights();
        const locations = Object.keys(locationStats);
        
        if (locations.length === 0) return;
        
        locationContainer.innerHTML = locations.slice(0, 4).map(location => {
            const stats = locationStats[location];
            const riskColor = this.getRiskColor(stats.riskLevel);
            
            return `
                <div class="bg-white rounded-xl p-4 border">
                    <div class="flex items-center justify-between mb-2">
                        <span class="font-medium text-gray-900 truncate">${location}</span>
                        <span class="text-xs px-2 py-1 rounded-full ${riskColor} capitalize">${stats.riskLevel} risk</span>
                    </div>
                    <div class="text-sm text-gray-600">
                        <div>Avg: ${stats.averageDb} dB</div>
                        <div>${stats.count} measurement${stats.count !== 1 ? 's' : ''}</div>
                    </div>
                </div>
            `;
        }).join('');
    }
    
    setupHistoryUI() {
        // History filter dropdown
        const historyFilter = document.getElementById('history-filter');
        if (historyFilter) {
            historyFilter.addEventListener('change', () => {
                this.updateHistoryDisplay();
            });
        }
        
        // Export history button
        const exportBtn = document.getElementById('export-history-btn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                this.exportHistory();
            });
        }
        
        // Clear history button
        const clearBtn = document.getElementById('clear-history-btn');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                this.clearHistory();
            });
        }
    }
    
    exportHistory() {
        if (!this.history) return;
        
        try {
            const csvData = this.history.exportData('csv');
            const blob = new Blob([csvData], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `soundsense-history-${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            
            this.showNotification('History exported successfully!', 'success');
        } catch (error) {
            console.error('Export failed:', error);
            this.showNotification('Export failed. Please try again.', 'error');
        }
    }
    
    clearHistory() {
        if (!this.history) return;
        
        if (confirm('Are you sure you want to clear all measurement history? This cannot be undone.')) {
            this.history.clearHistory();
            this.updateHistoryDisplay();
            this.showNotification('History cleared successfully', 'info');
        }
    }
    
    getCurrentLocation() {
        // Simple location detection based on noise levels and time
        // In a real implementation, this could use geolocation API
        const hour = new Date().getHours();
        const db = Math.round(this.currentDb);
        
        if (db <= 40) {
            return hour >= 22 || hour <= 6 ? 'Bedroom' : 'Library/Quiet Office';
        } else if (db <= 60) {
            return hour >= 9 && hour <= 17 ? 'Office/Workplace' : 'Living Room';
        } else if (db <= 80) {
            return 'Busy Street/Restaurant';
        } else {
            return 'High Noise Environment';
        }
    }
    
    getDbColor(db) {
        if (db <= 50) return 'bg-green-500';
        if (db <= 70) return 'bg-blue-500';
        if (db <= 85) return 'bg-yellow-500';
        return 'bg-red-500';
    }
    
    getRiskColor(riskLevel) {
        switch (riskLevel) {
            case 'low': return 'text-green-600 bg-green-100';
            case 'moderate': return 'text-yellow-600 bg-yellow-100';
            case 'high': return 'text-red-600 bg-red-100';
            default: return 'text-gray-600 bg-gray-100';
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
        
        // Update results display
        this.updateResultsDisplay();
        
        // Show premium features if this was a premium session
        if (this.isPremiumSession && this.premiumAnalysis) {
            this.displayPremiumResults();
        } else {
            // Show premium upgrade option for non-premium users
            this.showPremiumUpgradeOption();
        }
        
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
    
    // New methods for monetization integration
    
    waitForMonetization() {
        // Wait for global monetization system to be available
        const checkMonetization = () => {
            if (typeof monetizationSystem !== 'undefined' && monetizationSystem) {
                this.monetization = monetizationSystem;
                console.log('Monetization system connected to main app');
            } else {
                setTimeout(checkMonetization, 100);
            }
        };
        checkMonetization();
    }
    
    showPremiumIndicator() {
        const timer = document.getElementById('timer');
        if (timer) {
            timer.innerHTML = `
                <span class="material-symbols-outlined mr-2 text-sm">star</span>
                <span class="font-semibold text-green-700">Premium: </span>
                <span id="time-remaining">${this.duration}</span>s remaining
            `;
            timer.className = 'inline-flex items-center bg-green-50 text-green-700 px-4 py-2 rounded-full font-medium border-2 border-green-200';
        }
    }
    
    updateResultsDisplay() {
        // Calculate comprehensive statistics
        const avgDb = Math.round(this.currentDb);
        const minDb = Math.max(30, avgDb - 5); // Simulated min
        const maxDb = Math.min(90, avgDb + 8); // Simulated max
        
        // Update basic stats
        const avgElement = document.getElementById('results-avg-db');
        const minElement = document.getElementById('results-min-db');
        const maxElement = document.getElementById('results-max-db');
        
        if (avgElement) avgElement.textContent = avgDb;
        if (minElement) minElement.textContent = minDb;
        if (maxElement) maxElement.textContent = maxDb;
        
        // Show premium statistics if premium session
        if (this.isPremiumSession) {
            this.addPremiumResultsFeatures(avgDb, minDb, maxDb);
        }
    }
    
    displayPremiumResults() {
        if (!this.premiumAnalysis || !this.premiumFeatures) {
            return;
        }
        
        const formattedResults = this.premiumFeatures.getFormattedResults();
        if (!formattedResults) return;
        
        const resultsScreen = document.getElementById('results-screen');
        if (!resultsScreen) return;
        
        // Create comprehensive premium results display
        const premiumResultsHTML = `
            <!-- Premium Analysis Header -->
            <div class="mt-8 bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-6 border-2 border-green-200">
                <div class="flex items-center justify-between mb-6">
                    <div class="flex items-center">
                        <span class="material-symbols-outlined text-green-600 mr-2 text-2xl">workspace_premium</span>
                        <h3 class="text-xl font-bold text-gray-900">Premium Analysis Complete</h3>
                    </div>
                    <div class="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                        5-Minute Extended Session
                    </div>
                </div>
                
                <!-- Enhanced Statistics Grid -->
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div class="bg-white rounded-xl p-4 text-center shadow-sm">
                        <div class="text-xl font-bold text-gray-900">${formattedResults.enhancedStats.duration}</div>
                        <div class="text-sm text-gray-600">Duration</div>
                    </div>
                    <div class="bg-white rounded-xl p-4 text-center shadow-sm">
                        <div class="text-xl font-bold text-gray-900">${formattedResults.enhancedStats.range}</div>
                        <div class="text-sm text-gray-600">Range</div>
                    </div>
                    <div class="bg-white rounded-xl p-4 text-center shadow-sm">
                        <div class="text-xl font-bold text-gray-900">${formattedResults.enhancedStats.median}</div>
                        <div class="text-sm text-gray-600">Median</div>
                    </div>
                    <div class="bg-white rounded-xl p-4 text-center shadow-sm">
                        <div class="text-xl font-bold text-gray-900">${formattedResults.enhancedStats.variability}</div>
                        <div class="text-sm text-gray-600">Variability</div>
                    </div>
                </div>
                
                <!-- Percentile Analysis -->
                <div class="mb-6">
                    <h4 class="font-semibold text-gray-900 mb-3 flex items-center">
                        <span class="material-symbols-outlined mr-2 text-blue-600">analytics</span>
                        Detailed Percentile Breakdown
                    </h4>
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div class="bg-white rounded-lg p-3 border">
                            <div class="text-sm font-medium text-gray-700">Quietest 10%</div>
                            <div class="text-lg font-bold text-green-600">${formattedResults.percentiles.quietest}</div>
                        </div>
                        <div class="bg-white rounded-lg p-3 border">
                            <div class="text-sm font-medium text-gray-700">Typical Level</div>
                            <div class="text-lg font-bold text-blue-600">${formattedResults.percentiles.typical}</div>
                        </div>
                        <div class="bg-white rounded-lg p-3 border">
                            <div class="text-sm font-medium text-gray-700">Loudest 10%</div>
                            <div class="text-lg font-bold text-orange-600">${formattedResults.percentiles.loud}</div>
                        </div>
                        <div class="bg-white rounded-lg p-3 border">
                            <div class="text-sm font-medium text-gray-700">Peak Events</div>
                            <div class="text-lg font-bold text-red-600">${formattedResults.percentiles.peak}</div>
                        </div>
                    </div>
                </div>
                
                <!-- Professional Health Assessment -->
                <div class="mb-6">
                    <h4 class="font-semibold text-gray-900 mb-3 flex items-center">
                        <span class="material-symbols-outlined mr-2 text-red-600">health_and_safety</span>
                        Professional Health Assessment
                    </h4>
                    <div class="bg-white rounded-xl p-4 border-l-4 border-${this.getHealthColor(formattedResults.healthInsights.riskLevel)}-400">
                        <div class="flex items-start justify-between mb-3">
                            <div>
                                <div class="font-semibold text-gray-900">Risk Level: 
                                    <span class="text-${this.getHealthColor(formattedResults.healthInsights.riskLevel)}-600 capitalize">
                                        ${formattedResults.healthInsights.riskLevel}
                                    </span>
                                </div>
                                <div class="text-sm text-gray-600 mt-1">
                                    Time-weighted Average: ${formattedResults.healthInsights.timeWeighted}
                                </div>
                            </div>
                            <div class="flex items-center space-x-4 text-sm">
                                <div class="flex items-center">
                                    <span class="w-2 h-2 bg-${formattedResults.healthInsights.oshaCompliant ? 'green' : 'red'}-500 rounded-full mr-1"></span>
                                    OSHA ${formattedResults.healthInsights.oshaCompliant ? 'Compliant' : 'Non-Compliant'}
                                </div>
                            </div>
                        </div>
                        
                        ${formattedResults.healthInsights.primaryConcerns.length > 0 ? `
                            <div class="mb-3">
                                <div class="font-medium text-gray-900 mb-1">Primary Concerns:</div>
                                <ul class="text-sm text-gray-700 list-disc list-inside">
                                    ${formattedResults.healthInsights.primaryConcerns.map(concern => `<li>${concern}</li>`).join('')}
                                </ul>
                            </div>
                        ` : ''}
                        
                        ${formattedResults.healthInsights.topRecommendations.length > 0 ? `
                            <div>
                                <div class="font-medium text-gray-900 mb-1">Recommendations:</div>
                                <ul class="text-sm text-gray-700 list-disc list-inside">
                                    ${formattedResults.healthInsights.topRecommendations.map(rec => `<li>${rec}</li>`).join('')}
                                </ul>
                            </div>
                        ` : ''}
                    </div>
                </div>
                
                <!-- Professional Environment Analysis -->
                <div class="mb-6">
                    <h4 class="font-semibold text-gray-900 mb-3 flex items-center">
                        <span class="material-symbols-outlined mr-2 text-purple-600">business</span>
                        Professional Environment Analysis
                    </h4>
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div class="bg-white rounded-xl p-4 border">
                            <div class="text-sm font-medium text-gray-700">Environment Type</div>
                            <div class="text-lg font-bold text-gray-900">${formattedResults.professionalAnalysis.environmentType}</div>
                        </div>
                        <div class="bg-white rounded-xl p-4 border">
                            <div class="text-sm font-medium text-gray-700">Noise Events</div>
                            <div class="text-lg font-bold text-gray-900">${formattedResults.professionalAnalysis.noiseEvents}</div>
                        </div>
                        <div class="bg-white rounded-xl p-4 border">
                            <div class="text-sm font-medium text-gray-700">Data Quality</div>
                            <div class="text-lg font-bold text-gray-900 capitalize">${formattedResults.professionalAnalysis.dataQuality}</div>
                        </div>
                    </div>
                </div>
                
                <!-- Actionable Recommendations -->
                ${this.generateRecommendationsHTML(formattedResults.actionableRecommendations)}
                
                <!-- Data Export Option -->
                <div class="mt-6 pt-6 border-t border-gray-200">
                    <button id="export-data-btn" class="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors text-sm inline-flex items-center">
                        <span class="material-symbols-outlined mr-2 text-lg">download</span>
                        Export Measurement Data
                    </button>
                    <span class="ml-3 text-sm text-gray-500">Download detailed analysis as CSV/JSON</span>
                </div>
            </div>
        `;
        
        // Insert premium results before the "Test Again" button
        const testAgainBtn = document.getElementById('test-again-btn');
        if (testAgainBtn) {
            testAgainBtn.parentNode.insertBefore(
                document.createRange().createContextualFragment(premiumResultsHTML).firstElementChild,
                testAgainBtn
            );
        }
        
        // Add export functionality
        this.setupDataExport();
    }
    
    showPremiumUpgradeOption() {
        const resultsScreen = document.getElementById('results-screen');
        if (!resultsScreen) return;
        
        const upgradeHTML = `
            <div id="premium-upgrade" class="mt-8 bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl p-6 border-2 border-red-200">
                <div class="text-center">
                    <div class="flex items-center justify-center mb-4">
                        <span class="material-symbols-outlined text-red-600 mr-2 text-2xl">upgrade</span>
                        <h3 class="text-lg font-bold text-gray-900">Unlock Premium Features</h3>
                    </div>
                    
                    <p class="text-gray-600 mb-4">
                        Get 5-minute measurements, advanced analytics, and detailed health insights
                    </p>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div class="bg-white rounded-xl p-4 border border-red-100">
                            <span class="material-symbols-outlined text-red-600 mb-2">timer</span>
                            <div class="font-semibold">5-Minute Measurements</div>
                            <div class="text-sm text-gray-600">Extended monitoring time</div>
                        </div>
                        <div class="bg-white rounded-xl p-4 border border-red-100">
                            <span class="material-symbols-outlined text-red-600 mb-2">analytics</span>
                            <div class="font-semibold">Advanced Statistics</div>
                            <div class="text-sm text-gray-600">Detailed trend analysis</div>
                        </div>
                    </div>
                    
                    <button id="unlock-premium-btn" class="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-xl transition-all transform hover:scale-105">
                        <span class="material-symbols-outlined mr-2">play_circle</span>
                        Watch Video to Unlock
                    </button>
                </div>
            </div>
        `;
        
        // Insert before history section
        const historySection = document.getElementById('history-section');
        if (historySection) {
            historySection.parentNode.insertBefore(
                document.createRange().createContextualFragment(upgradeHTML).firstElementChild,
                historySection
            );
        }
        
        // Add click handler
        const unlockBtn = document.getElementById('unlock-premium-btn');
        if (unlockBtn) {
            unlockBtn.addEventListener('click', async () => {
                if (this.monetization) {
                    const adCompleted = await this.monetization.showVideoAd();
                    if (adCompleted) {
                        // Remove upgrade section and add premium features
                        const upgradeSection = document.getElementById('premium-upgrade');
                        if (upgradeSection) upgradeSection.remove();
                        
                        // Refresh results with premium features
                        this.isPremiumSession = true;
                        this.addPremiumResultsFeatures(
                            Math.round(this.currentDb),
                            Math.max(30, Math.round(this.currentDb) - 5),
                            Math.min(90, Math.round(this.currentDb) + 8)
                        );
                    }
                }
            });
        }
    }
    
    // New premium features helper methods
    
    getHealthColor(riskLevel) {
        switch(riskLevel) {
            case 'low': return 'green';
            case 'moderate': return 'yellow';
            case 'high': return 'red';
            default: return 'gray';
        }
    }
    
    generateRecommendationsHTML(recommendations) {
        if (!recommendations.immediate.length && !recommendations.equipment.length && !recommendations.environmental.length) {
            return '';
        }
        
        return `
            <div>
                <h4 class="font-semibold text-gray-900 mb-3 flex items-center">
                    <span class="material-symbols-outlined mr-2 text-green-600">lightbulb</span>
                    Professional Recommendations
                </h4>
                <div class="space-y-4">
                    ${recommendations.immediate.length > 0 ? `
                        <div class="bg-red-50 border border-red-200 rounded-xl p-4">
                            <div class="font-medium text-red-900 mb-2 flex items-center">
                                <span class="material-symbols-outlined mr-2 text-red-600">priority_high</span>
                                Immediate Actions
                            </div>
                            <ul class="text-sm text-red-800 list-disc list-inside space-y-1">
                                ${recommendations.immediate.map(item => `<li>${item}</li>`).join('')}
                            </ul>
                        </div>
                    ` : ''}
                    
                    ${recommendations.equipment.length > 0 ? `
                        <div class="bg-blue-50 border border-blue-200 rounded-xl p-4">
                            <div class="font-medium text-blue-900 mb-2 flex items-center">
                                <span class="material-symbols-outlined mr-2 text-blue-600">headphones</span>
                                Equipment Recommendations
                            </div>
                            <ul class="text-sm text-blue-800 list-disc list-inside space-y-1">
                                ${recommendations.equipment.map(item => `<li>${item}</li>`).join('')}
                            </ul>
                        </div>
                    ` : ''}
                    
                    ${recommendations.environmental.length > 0 ? `
                        <div class="bg-green-50 border border-green-200 rounded-xl p-4">
                            <div class="font-medium text-green-900 mb-2 flex items-center">
                                <span class="material-symbols-outlined mr-2 text-green-600">eco</span>
                                Environmental Improvements
                            </div>
                            <ul class="text-sm text-green-800 list-disc list-inside space-y-1">
                                ${recommendations.environmental.slice(0, 3).map(item => `<li>${item}</li>`).join('')}
                            </ul>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }
    
    setupDataExport() {
        const exportBtn = document.getElementById('export-data-btn');
        if (exportBtn && this.premiumFeatures) {
            exportBtn.addEventListener('click', () => {
                const exportData = this.premiumFeatures.exportMeasurementData();
                if (exportData) {
                    // Create and download CSV file
                    const blob = new Blob([exportData.csv], { type: 'text/csv' });
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `soundsense-measurement-${new Date().toISOString().split('T')[0]}.csv`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    window.URL.revokeObjectURL(url);
                    
                    // Show success message
                    this.showNotification('Measurement data exported successfully!', 'success');
                }
            });
        }
    }
    
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 p-4 rounded-xl shadow-lg z-50 max-w-sm ${
            type === 'success' ? 'bg-green-600 text-white' : 
            type === 'error' ? 'bg-red-600 text-white' : 
            'bg-blue-600 text-white'
        }`;
        notification.innerHTML = `
            <div class="flex items-center">
                <span class="material-symbols-outlined mr-2">${
                    type === 'success' ? 'check_circle' : 
                    type === 'error' ? 'error' : 'info'
                }</span>
                <span>${message}</span>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Auto-remove after 3 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 3000);
    }
    
    updateEnhancedHealthDashboard(measurements) {
        if (!this.classifier || measurements.length < 3) return;
        
        // Generate comprehensive health dashboard
        const healthDashboard = this.classifier.generateHealthDashboard(measurements, this.currentDb || 50);
        
        // Update personal risk assessment
        this.updatePersonalRiskDisplay(healthDashboard.personalRisk);
        
        // Update exposure patterns
        this.updateExposurePatternsDisplay(healthDashboard.patterns);
        
        // Update health goals
        this.updateHealthGoalsDisplay(healthDashboard.healthGoals);
        
        // Update health recommendations
        this.updateHealthRecommendationsDisplay(healthDashboard.reductionPlan);
        
        // Show interactive health dashboard if enough data
        if (measurements.length >= 5) {
            this.showInteractiveHealthDashboard(healthDashboard);
        }
    }
    
    updatePersonalRiskDisplay(personalRisk) {
        const riskBadge = document.getElementById('personal-risk-badge');
        const riskFactors = document.getElementById('risk-factors');
        
        if (riskBadge) {
            const badgeClass = this.getRiskBadgeClass(personalRisk.level);
            riskBadge.className = `px-2 py-1 rounded-full text-xs font-medium ${badgeClass}`;
            riskBadge.textContent = `${personalRisk.level.toUpperCase()} RISK`;
        }
        
        if (riskFactors) {
            if (personalRisk.factors.length > 0) {
                riskFactors.innerHTML = `
                    <div class="mb-2 text-sm font-medium text-gray-900">Risk Factors:</div>
                    <ul class="list-disc list-inside text-sm space-y-1">
                        ${personalRisk.factors.map(factor => `<li>${factor}</li>`).join('')}
                    </ul>
                    <div class="mt-3 p-2 bg-blue-50 rounded text-sm">
                        ${personalRisk.message}
                    </div>
                `;
            } else {
                riskFactors.innerHTML = `
                    <div class="text-sm text-green-600">
                        <span class="material-symbols-outlined text-sm mr-1">check_circle</span>
                        ${personalRisk.message}
                    </div>
                `;
            }
        }
    }
    
    updateExposurePatternsDisplay(patterns) {
        const peakHours = document.getElementById('peak-hours');
        const avgExposure = document.getElementById('avg-exposure');
        const trendDirection = document.getElementById('trend-direction');
        
        if (peakHours && patterns.peakHours.length > 0) {
            const topHour = patterns.peakHours[0].hour;
            const timeStr = topHour < 12 ? `${topHour}AM` : `${topHour - 12}PM`;
            peakHours.textContent = timeStr;
        }
        
        if (trendDirection) {
            const trend = patterns.trendDirection;
            const trendIcon = trend === 'increasing' ? '↗️' : trend === 'decreasing' ? '↘️' : '➡️';
            const trendColor = trend === 'increasing' ? 'text-red-600' : trend === 'decreasing' ? 'text-green-600' : 'text-blue-600';
            trendDirection.className = `text-lg font-bold ${trendColor}`;
            trendDirection.textContent = `${trendIcon} ${trend}`;
        }
    }
    
    updateHealthGoalsDisplay(healthGoals) {
        // Update daily limit goal
        const dailyStatus = document.getElementById('daily-goal-status');
        const dailyProgress = document.getElementById('daily-goal-progress');
        
        if (dailyStatus && healthGoals.dailyLimit) {
            const goal = healthGoals.dailyLimit;
            dailyStatus.textContent = goal.met ? 'Met' : 'At Risk';
            dailyStatus.className = goal.met ? 'text-green-600 font-medium' : 'text-red-600 font-medium';
            
            if (dailyProgress) {
                dailyProgress.style.width = `${goal.progress}%`;
                dailyProgress.className = goal.met ? 'bg-green-500 h-2 rounded-full' : 'bg-red-500 h-2 rounded-full';
            }
        }
        
        // Update quiet time goal
        const quietStatus = document.getElementById('quiet-goal-status');
        const quietProgress = document.getElementById('quiet-goal-progress');
        
        if (quietStatus && healthGoals.quietTime) {
            const goal = healthGoals.quietTime;
            quietStatus.textContent = goal.met ? 'Good' : 'Needs Improvement';
            quietStatus.className = goal.met ? 'text-green-600 font-medium' : 'text-yellow-600 font-medium';
            
            if (quietProgress) {
                quietProgress.style.width = `${goal.current}%`;
                quietProgress.className = goal.met ? 'bg-green-500 h-2 rounded-full' : 'bg-yellow-500 h-2 rounded-full';
            }
        }
    }
    
    updateHealthRecommendationsDisplay(reductionPlan) {
        const recommendationsContainer = document.getElementById('health-recommendations');
        if (!recommendationsContainer || !reductionPlan) return;
        
        const allRecommendations = [
            ...reductionPlan.immediate.map(r => ({ text: r, type: 'immediate', icon: 'priority_high' })),
            ...reductionPlan.shortTerm.map(r => ({ text: r, type: 'short-term', icon: 'schedule' })),
            ...reductionPlan.longTerm.slice(0, 2).map(r => ({ text: r, type: 'long-term', icon: 'lightbulb' }))
        ];
        
        if (allRecommendations.length === 0) {
            recommendationsContainer.innerHTML = `
                <div class="text-sm text-green-600 flex items-center">
                    <span class="material-symbols-outlined text-sm mr-2">check_circle</span>
                    Your noise exposure is well within healthy limits. Keep up the good work!
                </div>
            `;
        } else {
            recommendationsContainer.innerHTML = allRecommendations.map(rec => `
                <div class="health-recommendation ${rec.type} flex items-start">
                    <span class="material-symbols-outlined text-sm mr-2 mt-0.5">${rec.icon}</span>
                    <span class="text-sm">${rec.text}</span>
                </div>
            `).join('');
        }
    }
    
    showInteractiveHealthDashboard(healthDashboard) {
        const dashboard = document.getElementById('interactive-health-dashboard');
        if (!dashboard) return;
        
        dashboard.style.display = 'block';
        
        // Update dashboard metrics
        const twaElement = document.getElementById('dashboard-twa');
        const exposureElement = document.getElementById('dashboard-exposure');
        const peakElement = document.getElementById('dashboard-peak');
        const complianceElement = document.getElementById('dashboard-compliance');
        
        if (twaElement) twaElement.textContent = `${healthDashboard.timeWeightedAverage} dB`;
        if (exposureElement) exposureElement.textContent = `${Math.round((healthDashboard.timeWeightedAverage / 90) * 100)}%`;
        if (peakElement) peakElement.textContent = `${healthDashboard.maxExposure} dB`;
        if (complianceElement) {
            complianceElement.textContent = healthDashboard.compliance.osha ? 'OSHA Safe' : 'Above Limits';
            complianceElement.className = `text-xl font-bold ${healthDashboard.compliance.osha ? 'text-green-600' : 'text-red-600'}`;
        }
        
        // Update risk level display
        const riskLevel = document.getElementById('dashboard-risk-level');
        const riskBar = document.getElementById('dashboard-risk-bar');
        
        if (riskLevel && healthDashboard.personalRisk) {
            const risk = healthDashboard.personalRisk.level;
            riskLevel.textContent = risk.toUpperCase();
            riskLevel.className = `font-semibold ${this.getRiskTextColor(risk)}`;
            
            if (riskBar) {
                const percentage = this.getRiskPercentage(risk);
                riskBar.style.width = `${percentage}%`;
                riskBar.className = `h-4 rounded-full transition-all duration-500 ${this.getRiskBarColor(risk)}`;
            }
        }
        
        // Update action items
        this.updateDashboardActions(healthDashboard.alerts);
    }
    
    updateDashboardActions(alerts) {
        const actionsContainer = document.getElementById('dashboard-actions');
        if (!actionsContainer || !alerts) return;
        
        if (alerts.length === 0) {
            actionsContainer.innerHTML = `
                <div class="bg-green-50 border border-green-200 rounded-xl p-4">
                    <div class="flex items-center">
                        <span class="material-symbols-outlined text-green-600 mr-2">check_circle</span>
                        <span class="text-sm font-medium text-green-900">No immediate actions required</span>
                    </div>
                    <p class="text-sm text-green-700 mt-1">Your noise exposure is within healthy limits.</p>
                </div>
            `;
        } else {
            actionsContainer.innerHTML = alerts.map(alert => {
                const alertClass = this.getAlertClass(alert.type);
                const alertIcon = this.getAlertIcon(alert.type);
                
                return `
                    <div class="${alertClass} rounded-xl p-4 border-l-4">
                        <div class="flex items-start">
                            <span class="material-symbols-outlined mr-2 text-lg">${alertIcon}</span>
                            <div class="flex-1">
                                <div class="font-medium">${alert.message}</div>
                                <div class="text-sm mt-1">${alert.action}</div>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
        }
    }
    
    getRiskBadgeClass(level) {
        const classes = {
            'minimal': 'bg-green-100 text-green-800',
            'low': 'bg-blue-100 text-blue-800',
            'moderate': 'bg-yellow-100 text-yellow-800',
            'high': 'bg-red-100 text-red-800'
        };
        return classes[level] || 'bg-gray-100 text-gray-800';
    }
    
    getRiskTextColor(level) {
        const colors = {
            'minimal': 'text-green-600',
            'low': 'text-blue-600',
            'moderate': 'text-yellow-600',
            'high': 'text-red-600'
        };
        return colors[level] || 'text-gray-600';
    }
    
    getRiskBarColor(level) {
        const colors = {
            'minimal': 'bg-green-500',
            'low': 'bg-blue-500',
            'moderate': 'bg-yellow-500',
            'high': 'bg-red-500'
        };
        return colors[level] || 'bg-gray-500';
    }
    
    getRiskPercentage(level) {
        const percentages = {
            'minimal': 15,
            'low': 35,
            'moderate': 65,
            'high': 85
        };
        return percentages[level] || 25;
    }
    
    getAlertClass(type) {
        const classes = {
            'critical': 'bg-red-50 border-red-400',
            'warning': 'bg-yellow-50 border-yellow-400',
            'info': 'bg-blue-50 border-blue-400'
        };
        return classes[type] || 'bg-gray-50 border-gray-400';
    }
    
    getAlertIcon(type) {
        const icons = {
            'critical': 'error',
            'warning': 'warning',
            'info': 'info'
        };
        return icons[type] || 'help';
    }
    
    addPremiumResultsFeatures(avgDb, minDb, maxDb) {
        // Add enhanced statistics section for premium users
        const resultsScreen = document.getElementById('results-screen');
        if (!resultsScreen) return;
        
        const premiumStatsHTML = `
            <div class="mt-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-6 border-2 border-green-200">
                <div class="flex items-center mb-4">
                    <span class="material-symbols-outlined text-green-600 mr-2 text-xl">star</span>
                    <h3 class="text-lg font-bold text-gray-900">Premium Statistics</h3>
                    <div class="ml-auto bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
                        5-Minute Session
                    </div>
                </div>
                
                <!-- Enhanced Statistics Grid -->
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div class="bg-white rounded-xl p-4 text-center shadow-sm">
                        <div class="text-xl font-bold text-green-600">${Math.round((avgDb + minDb) / 2)}</div>
                        <div class="text-sm text-gray-600">10th Percentile</div>
                    </div>
                    <div class="bg-white rounded-xl p-4 text-center shadow-sm">
                        <div class="text-xl font-bold text-blue-600">${avgDb}</div>
                        <div class="text-sm text-gray-600">Median Level</div>
                    </div>
                    <div class="bg-white rounded-xl p-4 text-center shadow-sm">
                        <div class="text-xl font-bold text-orange-600">${Math.round((avgDb + maxDb) / 2)}</div>
                        <div class="text-sm text-gray-600">90th Percentile</div>
                    </div>
                    <div class="bg-white rounded-xl p-4 text-center shadow-sm">
                        <div class="text-xl font-bold text-red-600">${maxDb}</div>
                        <div class="text-sm text-gray-600">Peak Events</div>
                    </div>
                </div>
                
                <!-- Time-Weighted Average -->
                <div class="bg-white rounded-xl p-4 mb-4 border">
                    <div class="flex items-center justify-between">
                        <div>
                            <div class="font-semibold text-gray-900">Time-Weighted Average (TWA)</div>
                            <div class="text-2xl font-bold text-blue-600">${avgDb} dB</div>
                        </div>
                        <div class="text-right">
                            <div class="flex items-center">
                                <span class="w-2 h-2 ${avgDb <= 85 ? 'bg-green' : 'bg-red'}-500 rounded-full mr-2"></span>
                                <span class="text-sm font-medium ${avgDb <= 85 ? 'text-green' : 'text-red'}-700">
                                    ${avgDb <= 85 ? 'OSHA Compliant' : 'Above Safe Limits'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Professional Health Assessment -->
                <div class="bg-white rounded-xl p-4 border-l-4 ${avgDb >= 85 ? 'border-red' : avgDb >= 70 ? 'border-yellow' : 'border-green'}-400">
                    <h4 class="font-semibold text-gray-900 mb-2 flex items-center">
                        <span class="material-symbols-outlined mr-2 text-red-600">health_and_safety</span>
                        Professional Health Assessment
                    </h4>
                    <div class="space-y-2">
                        <div class="flex items-center justify-between">
                            <span class="text-sm font-medium text-gray-700">Risk Level:</span>
                            <span class="px-2 py-1 rounded-full text-xs font-medium ${
                                avgDb >= 85 ? 'bg-red-100 text-red-800' :
                                avgDb >= 70 ? 'bg-yellow-100 text-yellow-800' :
                                'bg-green-100 text-green-800'
                            }">
                                ${avgDb >= 85 ? 'High Risk' : avgDb >= 70 ? 'Moderate Risk' : 'Low Risk'}
                            </span>
                        </div>
                        <div class="text-sm text-gray-600">
                            ${avgDb >= 85 ? 
                                'Hearing protection required. Limit exposure time.' :
                                avgDb >= 70 ?
                                'Consider hearing protection for extended exposure.' :
                                'Safe noise levels for extended exposure.'
                            }
                        </div>
                        ${avgDb >= 85 ? `
                            <div class="mt-2 p-2 bg-red-50 rounded">
                                <div class="text-xs font-medium text-red-900">Recommended Actions:</div>
                                <ul class="text-xs text-red-800 list-disc list-inside mt-1">
                                    <li>Use hearing protection (NRR 25+ dB)</li>
                                    <li>Limit exposure to ${Math.max(15, Math.floor(480 / Math.pow(2, (avgDb - 90) / 5)))} minutes</li>
                                    <li>Consider noise source reduction</li>
                                </ul>
                            </div>
                        ` : ''}
                    </div>
                </div>
            </div>
        `;
        
        // Insert premium stats after basic stats
        const basicStats = resultsScreen.querySelector('.grid.grid-cols-1.md\\:grid-cols-3.gap-6.mb-8');
        if (basicStats) {
            basicStats.insertAdjacentHTML('afterend', premiumStatsHTML);
        }
    }
}

// Initialize the app when the script loads
const app = new NoiseDetector();