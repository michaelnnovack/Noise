/**
 * Advanced Monetization Module for SoundSense
 * Handles video ad integration and premium features
 * Maximizes revenue through strategic ad placement ($5-15 CPM)
 */

class Monetization {
    constructor() {
        this.adBlockerDetected = false;
        this.premiumUnlocked = false;
        this.adWatchCount = 0;
        this.measurementCount = 0;
        this.videoAdLoaded = false;
        this.adCompletionRate = 0;
        
        // Premium ad configuration for maximum revenue
        this.adConfig = {
            videoAdDuration: 20, // Optimal for completion rate
            skipDelay: 5, // Skip button appears after 5s
            extendedMeasurementTime: 300, // 5 minutes premium
            freeUsageLimit: 25, // First measurement is free
            adFrequency: 2, // Show ad before every 2nd+ measurement
            premiumSessionTime: 1800 // 30 minutes premium session
        };
        
        // Revenue tracking
        this.revenueTracking = {
            adsServed: 0,
            adsCompleted: 0,
            premiumUnlocks: 0,
            sessionValue: 0
        };
        
        console.log('Advanced monetization system initialized');
    }
    
    init() {
        console.log('Initializing monetization system...');
        
        // Load stored data
        this.loadStoredData();
        
        // Check for ad blocker
        this.detectAdBlocker();
        
        // Initialize Google AdSense Video
        this.initializeVideoAds();
        
        // Setup event listeners
        this.setupEventListeners();
        
        console.log('Monetization system ready');
    }
    
    detectAdBlocker() {
        // Create test ad element to detect ad blockers
        const testAd = document.createElement('div');
        testAd.innerHTML = '&nbsp;';
        testAd.className = 'adsbox';
        testAd.style.position = 'absolute';
        testAd.style.left = '-10000px';
        document.body.appendChild(testAd);
        
        setTimeout(() => {
            const rect = testAd.getBoundingClientRect();
            this.adBlockerDetected = rect.height === 0;
            document.body.removeChild(testAd);
            
            if (this.adBlockerDetected) {
                console.log('Ad blocker detected - graceful fallback mode');
                this.showAdBlockerMessage();
            }
        }, 100);
        
        return this.adBlockerDetected;
    }
    
    async showVideoAd() {
        console.log('Showing video ad for premium features...');
        
        // Track ad serve
        this.revenueTracking.adsServed++;
        this.trackAdEvent('ad_requested', 'video');
        
        try {
            // Show loading screen with professional messaging
            this.showAdLoadingScreen();
            
            // Load and display video ad
            const adCompleted = await this.displayVideoAdModal();
            
            if (adCompleted) {
                this.adWatchCount++;
                this.revenueTracking.adsCompleted++;
                this.revenueTracking.premiumUnlocks++;
                
                // Calculate session value ($0.10-0.25 per completed ad)
                this.revenueTracking.sessionValue += 0.15;
                
                this.unlockPremiumFeatures();
                this.trackAdEvent('ad_completed', 'video');
                
                // Save progress
                this.saveStoredData();
                
                return true;
            } else {
                this.trackAdEvent('ad_skipped', 'video');
                return false;
            }
        } catch (error) {
            console.error('Video ad failed:', error);
            this.trackAdEvent('ad_error', 'video');
            
            // Fallback to banner ad
            return this.showFallbackAd();
        } finally {
            this.hideAdLoadingScreen();
        }
    }
    
    unlockPremiumFeatures() {
        this.premiumUnlocked = true;
        this.premiumUnlockTime = Date.now();
        
        console.log(`Premium features unlocked for ${this.adConfig.premiumSessionTime / 60} minutes`);
        
        // Show premium unlock notification
        this.showPremiumUnlockNotification();
        
        // Auto-lock after premium session time
        setTimeout(() => {
            this.premiumUnlocked = false;
            console.log('Premium session expired');
        }, this.adConfig.premiumSessionTime * 1000);
    }
    
    isPremiumUnlocked() {
        return this.premiumUnlocked;
    }
    
    canUsePremiumFeatures() {
        return this.premiumUnlocked || this.adWatchCount > 0;
    }
    
    loadStoredData() {
        try {
            const data = localStorage.getItem('soundsense-monetization-data');
            if (data) {
                const parsed = JSON.parse(data);
                this.adWatchCount = parsed.adWatchCount || 0;
                this.measurementCount = parsed.measurementCount || 0;
                this.revenueTracking = { ...this.revenueTracking, ...parsed.revenueTracking };
                
                // Check if premium is still active
                if (parsed.premiumUnlockTime && 
                    Date.now() - parsed.premiumUnlockTime < this.adConfig.premiumSessionTime * 1000) {
                    this.premiumUnlocked = true;
                    this.premiumUnlockTime = parsed.premiumUnlockTime;
                }
            }
        } catch (error) {
            console.warn('Could not load monetization data:', error);
        }
    }
    
    saveStoredData() {
        try {
            const data = {
                adWatchCount: this.adWatchCount,
                measurementCount: this.measurementCount,
                premiumUnlockTime: this.premiumUnlockTime,
                revenueTracking: this.revenueTracking,
                timestamp: Date.now()
            };
            localStorage.setItem('soundsense-monetization-data', JSON.stringify(data));
        } catch (error) {
            console.warn('Could not save monetization data:', error);
        }
    }
    
    trackAdEvent(eventType, adType) {
        console.log(`Ad event: ${eventType} - ${adType}`);
        
        // Google Analytics 4 tracking
        if (typeof gtag !== 'undefined') {
            gtag('event', eventType, {
                event_category: 'monetization',
                event_label: adType,
                custom_map: { metric1: 'ad_revenue' },
                value: eventType === 'ad_completed' ? 0.15 : 0
            });
        }
        
        // AdSense analytics
        if (typeof googletag !== 'undefined') {
            googletag.pubads().addEventListener('impressionViewable', (event) => {
                console.log('AdSense impression viewable:', event.slot);
            });
        }
    }
    
    // New methods for advanced monetization functionality
    
    shouldShowAd() {
        this.measurementCount++;
        this.saveStoredData();
        
        // First measurement is always free
        if (this.measurementCount === 1) {
            console.log('First measurement - free preview');
            return false;
        }
        
        // Show ad before every 2nd+ measurement unless premium is active
        if (!this.premiumUnlocked && this.measurementCount >= this.adConfig.adFrequency) {
            return true;
        }
        
        return false;
    }
    
    initializeVideoAds() {
        // Initialize Google AdSense Video
        if (typeof googletag !== 'undefined') {
            googletag.cmd.push(() => {
                console.log('AdSense Video initialized');
            });
        }
        
        // Preload video ad for faster display
        this.preloadVideoAd();
    }
    
    preloadVideoAd() {
        // Create hidden video element for preloading
        if (!this.adBlockerDetected) {
            console.log('Preloading video ad for optimal performance');
            // Implementation would depend on specific ad network
        }
    }
    
    showAdLoadingScreen() {
        const loadingHTML = `
            <div id="ad-loading-overlay" class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
                <div class="bg-white rounded-2xl p-8 max-w-md mx-4 text-center">
                    <div class="animate-spin rounded-full h-16 w-16 border-b-2 border-red-600 mx-auto mb-6"></div>
                    <h3 class="text-xl font-bold text-gray-900 mb-4">Getting Advanced Analysis</h3>
                    <p class="text-gray-600 mb-4">
                        Preparing enhanced measurement features with detailed statistics and 5-minute extended monitoring.
                    </p>
                    <div class="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
                        <div class="flex items-start">
                            <span class="material-symbols-outlined text-blue-600 mr-2 text-lg">info</span>
                            <div class="text-left">
                                <p class="text-sm font-medium text-blue-900">Premium Features Include:</p>
                                <ul class="text-sm text-blue-700 mt-1 list-disc list-inside">
                                    <li>5-minute continuous measurement</li>
                                    <li>Advanced noise classification</li>
                                    <li>Historical trend analysis</li>
                                    <li>Detailed health insights</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', loadingHTML);
    }
    
    hideAdLoadingScreen() {
        const overlay = document.getElementById('ad-loading-overlay');
        if (overlay) {
            overlay.remove();
        }
    }
    
    async displayVideoAdModal() {
        return new Promise((resolve) => {
            const modalHTML = `
                <div id="video-ad-modal" class="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
                    <div class="bg-white rounded-2xl p-6 max-w-2xl mx-4 text-center">
                        <div class="mb-6">
                            <h3 class="text-xl font-bold text-gray-900 mb-2">Unlocking Premium Features</h3>
                            <p class="text-gray-600">Watch this brief message to access advanced measurement tools</p>
                        </div>
                        
                        <div class="relative bg-black rounded-xl overflow-hidden mb-4">
                            <div id="video-ad-container" class="w-full h-64 flex items-center justify-center text-white">
                                <div class="text-center">
                                    <div class="animate-pulse mb-4">
                                        <span class="material-symbols-outlined text-4xl">play_circle</span>
                                    </div>
                                    <p class="text-lg font-semibold">Loading advertisement...</p>
                                </div>
                            </div>
                            
                            <div id="ad-controls" class="absolute bottom-4 left-4 right-4 flex justify-between items-center text-white">
                                <div class="flex items-center">
                                    <span class="material-symbols-outlined mr-2">schedule</span>
                                    <span id="ad-timer">${this.adConfig.videoAdDuration}</span>s
                                </div>
                                <button id="skip-ad-btn" class="bg-gray-800 bg-opacity-75 hover:bg-opacity-90 px-4 py-2 rounded-lg font-semibold transition-all" style="display: none;">
                                    Skip Ad
                                </button>
                            </div>
                        </div>
                        
                        <div class="text-sm text-gray-500 mb-4">
                            <p>🎯 This supports SoundSense development and keeps the app free</p>
                        </div>
                        
                        <button id="close-ad-modal" class="text-gray-400 hover:text-gray-600 transition-colors">
                            <span class="material-symbols-outlined">close</span>
                        </button>
                    </div>
                </div>
            `;
            
            document.body.insertAdjacentHTML('beforeend', modalHTML);
            
            // Simulate video ad playback
            let timeRemaining = this.adConfig.videoAdDuration;
            const timer = document.getElementById('ad-timer');
            const skipBtn = document.getElementById('skip-ad-btn');
            const closeBtn = document.getElementById('close-ad-modal');
            const modal = document.getElementById('video-ad-modal');
            
            // Start countdown
            const countdown = setInterval(() => {
                timeRemaining--;
                if (timer) timer.textContent = timeRemaining;
                
                // Show skip button after delay
                if (timeRemaining <= this.adConfig.videoAdDuration - this.adConfig.skipDelay && skipBtn) {
                    skipBtn.style.display = 'block';
                }
                
                // Auto-complete when timer reaches 0
                if (timeRemaining <= 0) {
                    clearInterval(countdown);
                    this.completeVideoAd(modal, resolve, true);
                }
            }, 1000);
            
            // Skip button handler
            if (skipBtn) {
                skipBtn.addEventListener('click', () => {
                    clearInterval(countdown);
                    // Only count as completed if watched for minimum time
                    const watchTime = this.adConfig.videoAdDuration - timeRemaining;
                    const completed = watchTime >= this.adConfig.skipDelay;
                    this.completeVideoAd(modal, resolve, completed);
                });
            }
            
            // Close button handler (counts as skip)
            if (closeBtn) {
                closeBtn.addEventListener('click', () => {
                    clearInterval(countdown);
                    this.completeVideoAd(modal, resolve, false);
                });
            }
            
            // Simulate ad loading and start
            setTimeout(() => {
                const container = document.getElementById('video-ad-container');
                if (container) {
                    container.innerHTML = `
                        <div class="w-full h-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                            <div class="text-center animate-fade-in">
                                <div class="text-6xl mb-4">🔊</div>
                                <h4 class="text-2xl font-bold mb-2">Discover Premium Audio Tools</h4>
                                <p class="text-lg opacity-90">Professional sound analysis at your fingertips</p>
                            </div>
                        </div>
                    `;
                }
            }, 1000);
        });
    }
    
    completeVideoAd(modal, resolve, completed) {
        if (modal) {
            modal.remove();
        }
        
        if (completed) {
            console.log('Video ad completed - unlocking premium features');
        } else {
            console.log('Video ad skipped - no premium unlock');
        }
        
        resolve(completed);
    }
    
    showFallbackAd() {
        // Fallback banner ad if video fails
        console.log('Showing fallback banner ad');
        
        return new Promise((resolve) => {
            const fallbackHTML = `
                <div id="fallback-ad-modal" class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
                    <div class="bg-white rounded-2xl p-6 max-w-md mx-4 text-center">
                        <h3 class="text-xl font-bold text-gray-900 mb-4">Support SoundSense</h3>
                        <div class="bg-gray-100 h-32 rounded-xl flex items-center justify-center mb-4">
                            <span class="text-gray-500">Advertisement</span>
                        </div>
                        <p class="text-gray-600 mb-6">Thanks for supporting our development!</p>
                        <button id="continue-fallback" class="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors">
                            Continue to Premium Features
                        </button>
                    </div>
                </div>
            `;
            
            document.body.insertAdjacentHTML('beforeend', fallbackHTML);
            
            const continueBtn = document.getElementById('continue-fallback');
            if (continueBtn) {
                continueBtn.addEventListener('click', () => {
                    const modal = document.getElementById('fallback-ad-modal');
                    if (modal) modal.remove();
                    resolve(true);
                });
            }
        });
    }
    
    showPremiumUnlockNotification() {
        const notificationHTML = `
            <div id="premium-notification" class="fixed top-4 right-4 bg-green-600 text-white p-4 rounded-xl shadow-lg z-40 max-w-sm">
                <div class="flex items-start">
                    <span class="material-symbols-outlined mr-3 text-xl">star</span>
                    <div>
                        <h4 class="font-bold mb-1">Premium Unlocked!</h4>
                        <p class="text-sm opacity-90">5-minute measurements and advanced features now available</p>
                    </div>
                    <button id="close-premium-notification" class="ml-2 opacity-75 hover:opacity-100">
                        <span class="material-symbols-outlined">close</span>
                    </button>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', notificationHTML);
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            const notification = document.getElementById('premium-notification');
            if (notification) notification.remove();
        }, 5000);
        
        // Close button
        const closeBtn = document.getElementById('close-premium-notification');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                const notification = document.getElementById('premium-notification');
                if (notification) notification.remove();
            });
        }
    }
    
    showAdBlockerMessage() {
        console.log('Showing ad blocker message - maintaining user experience');
        
        const messageHTML = `
            <div id="adblocker-message" class="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-blue-50 border border-blue-200 p-4 rounded-xl shadow-lg z-40">
                <div class="flex items-start">
                    <span class="material-symbols-outlined text-blue-600 mr-3">info</span>
                    <div class="flex-1">
                        <h4 class="font-semibold text-blue-900 mb-1">Ad Blocker Detected</h4>
                        <p class="text-sm text-blue-700 mb-3">
                            SoundSense is free thanks to ads. Consider supporting us by allowing ads or watching a quick video.
                        </p>
                        <button id="watch-video-anyway" class="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors">
                            Watch Video for Premium
                        </button>
                    </div>
                    <button id="close-adblocker-message" class="text-blue-400 hover:text-blue-600 ml-2">
                        <span class="material-symbols-outlined">close</span>
                    </button>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', messageHTML);
        
        // Event listeners
        const watchBtn = document.getElementById('watch-video-anyway');
        const closeBtn = document.getElementById('close-adblocker-message');
        
        if (watchBtn) {
            watchBtn.addEventListener('click', async () => {
                const message = document.getElementById('adblocker-message');
                if (message) message.remove();
                await this.showVideoAd();
            });
        }
        
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                const message = document.getElementById('adblocker-message');
                if (message) message.remove();
            });
        }
    }
    
    setupEventListeners() {
        // Listen for app events to trigger monetization
        document.addEventListener('measurement-requested', () => {
            if (this.shouldShowAd()) {
                // This will be called from the main app
                console.log('Ad should be shown before measurement');
            }
        });
        
        // Track user engagement for revenue optimization
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible') {
                this.trackAdEvent('page_focus', 'engagement');
            }
        });
    }
    
    getPremiumMeasurementTime() {
        return this.premiumUnlocked ? this.adConfig.extendedMeasurementTime : this.adConfig.freeUsageLimit;
    }
    
    getRemainingPremiumTime() {
        if (!this.premiumUnlocked || !this.premiumUnlockTime) return 0;
        
        const elapsed = Date.now() - this.premiumUnlockTime;
        const remaining = this.adConfig.premiumSessionTime * 1000 - elapsed;
        
        return Math.max(0, Math.floor(remaining / 1000));
    }
    
    getCompletionRate() {
        if (this.revenueTracking.adsServed === 0) return 0;
        return (this.revenueTracking.adsCompleted / this.revenueTracking.adsServed) * 100;
    }
    
    getSessionValue() {
        return this.revenueTracking.sessionValue.toFixed(2);
    }
}

// Global monetization instance
let monetizationSystem = null;

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        monetizationSystem = new Monetization();
        monetizationSystem.init();
    });
} else {
    monetizationSystem = new Monetization();
    monetizationSystem.init();
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Monetization;
}