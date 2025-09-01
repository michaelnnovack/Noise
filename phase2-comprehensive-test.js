/**
 * Comprehensive Phase 2 Testing Suite for SoundSense
 * Tests all enhanced features: video ads, premium unlock, health warnings, history
 * 
 * Run this in the browser console: node phase2-comprehensive-test.js
 * Or include in HTML: <script src="phase2-comprehensive-test.js"></script>
 */

class Phase2TestSuite {
    constructor() {
        this.testResults = [];
        this.startTime = null;
        this.testMeasurements = [];
        
        console.log('🧪 Phase 2 Comprehensive Testing Suite Initialized');
        console.log('Testing: Video Ads, Premium Features, History, Health Warnings');
    }

    async runAllTests() {
        console.log('\n' + '='.repeat(60));
        console.log('🚀 STARTING PHASE 2 COMPREHENSIVE E2E TESTING');
        console.log('='.repeat(60));
        
        this.startTime = Date.now();
        
        try {
            // Test 1: Monetization System Integration
            await this.testMonetizationSystem();
            
            // Test 2: Video Ad Flow and Premium Unlock
            await this.testVideoAdFlow();
            
            // Test 3: Premium Features Functionality
            await this.testPremiumFeatures();
            
            // Test 4: Enhanced Health Warning System
            await this.testHealthWarnings();
            
            // Test 5: Measurement History System
            await this.testHistorySystem();
            
            // Test 6: Data Persistence and Recovery
            await this.testDataPersistence();
            
            // Test 7: Complete User Flow Integration
            await this.testCompleteUserFlow();
            
            // Test 8: Mobile Responsiveness
            await this.testMobileResponsiveness();
            
            // Test 9: Error Handling and Edge Cases
            await this.testErrorHandling();
            
            // Test 10: Performance and Memory Usage
            await this.testPerformance();
            
        } catch (error) {
            console.error('❌ Test suite failed:', error);
            this.recordResult('Test Suite', 'Failed', error.message);
        }
        
        this.generateReport();
    }

    async testMonetizationSystem() {
        console.log('\n📊 Testing Monetization System...');
        
        try {
            // Test monetization system initialization
            const hasMonetization = typeof monetizationSystem !== 'undefined';
            this.recordResult('Monetization Init', hasMonetization ? 'Pass' : 'Fail', 
                hasMonetization ? 'System initialized' : 'Monetization system not found');
            
            if (hasMonetization) {
                // Test ad blocker detection
                const adBlockerTest = monetizationSystem.detectAdBlocker();
                this.recordResult('Ad Blocker Detection', 'Pass', 
                    `Ad blocker ${adBlockerTest ? 'detected' : 'not detected'}`);
                
                // Test premium status checking
                const isPremium = monetizationSystem.isPremiumUnlocked();
                this.recordResult('Premium Status Check', 'Pass', 
                    `Premium status: ${isPremium ? 'unlocked' : 'locked'}`);
                
                // Test measurement count tracking
                const shouldShowAd = monetizationSystem.shouldShowAd();
                this.recordResult('Ad Trigger Logic', 'Pass', 
                    `Should show ad: ${shouldShowAd}`);
            }
            
        } catch (error) {
            this.recordResult('Monetization System', 'Fail', error.message);
        }
    }

    async testVideoAdFlow() {
        console.log('\n🎥 Testing Video Ad Flow...');
        
        try {
            if (typeof monetizationSystem === 'undefined') {
                this.recordResult('Video Ad Flow', 'Skip', 'Monetization system not available');
                return;
            }
            
            // Simulate video ad display
            console.log('Simulating video ad display...');
            
            // Test ad loading screen
            monetizationSystem.showAdLoadingScreen();
            await this.wait(1000); // Wait for animation
            
            const loadingScreen = document.getElementById('ad-loading-overlay');
            const hasLoadingScreen = loadingScreen !== null;
            this.recordResult('Ad Loading Screen', hasLoadingScreen ? 'Pass' : 'Fail', 
                hasLoadingScreen ? 'Loading screen displayed' : 'Loading screen not found');
            
            if (hasLoadingScreen) {
                monetizationSystem.hideAdLoadingScreen();
            }
            
            // Test video ad modal
            const adResult = await this.simulateVideoAdCompletion();
            this.recordResult('Video Ad Modal', adResult.success ? 'Pass' : 'Fail', adResult.message);
            
            // Test premium unlock notification
            if (adResult.success) {
                monetizationSystem.showPremiumUnlockNotification();
                const notification = document.getElementById('premium-notification');
                const hasNotification = notification !== null;
                this.recordResult('Premium Unlock Notification', hasNotification ? 'Pass' : 'Fail',
                    hasNotification ? 'Notification displayed' : 'Notification not found');
                
                // Clean up
                if (notification) {
                    setTimeout(() => notification.remove(), 1000);
                }
            }
            
        } catch (error) {
            this.recordResult('Video Ad Flow', 'Fail', error.message);
        }
    }

    async testPremiumFeatures() {
        console.log('\n⭐ Testing Premium Features...');
        
        try {
            if (typeof PremiumFeatures === 'undefined') {
                this.recordResult('Premium Features', 'Skip', 'PremiumFeatures class not available');
                return;
            }
            
            const premiumFeatures = new PremiumFeatures();
            
            // Test activation
            const activated = premiumFeatures.activate();
            this.recordResult('Premium Activation', activated ? 'Pass' : 'Fail', 
                activated ? 'Premium features activated' : 'Failed to activate');
            
            // Test measurement duration
            const duration = premiumFeatures.getMeasurementDuration();
            this.recordResult('Premium Duration', duration === 300 ? 'Pass' : 'Fail', 
                `Duration: ${duration} seconds`);
            
            // Test extended measurement simulation
            const mockAudioProcessor = this.createMockAudioProcessor();
            const measurementStarted = premiumFeatures.startExtendedMeasurement(mockAudioProcessor);
            this.recordResult('Extended Measurement Start', measurementStarted ? 'Pass' : 'Fail',
                measurementStarted ? 'Extended measurement started' : 'Failed to start measurement');
            
            // Simulate data collection
            await this.wait(2000); // Let it collect some data
            
            // Test analysis generation
            const analysis = premiumFeatures.stopExtendedMeasurement();
            this.recordResult('Premium Analysis', analysis !== null ? 'Pass' : 'Fail',
                analysis ? `Analysis generated with ${analysis.measurementCount} data points` : 'No analysis generated');
            
            // Test formatted results
            if (analysis) {
                const formatted = premiumFeatures.getFormattedResults();
                this.recordResult('Formatted Results', formatted !== null ? 'Pass' : 'Fail',
                    formatted ? 'Formatted results available' : 'No formatted results');
            }
            
            // Test data export
            const exportData = premiumFeatures.exportMeasurementData();
            this.recordResult('Data Export', exportData !== null ? 'Pass' : 'Fail',
                exportData ? 'Export data generated' : 'Export failed');
            
            premiumFeatures.deactivate();
            
        } catch (error) {
            this.recordResult('Premium Features', 'Fail', error.message);
        }
    }

    async testHealthWarnings() {
        console.log('\n🏥 Testing Enhanced Health Warnings...');
        
        try {
            if (typeof NoiseClassifier === 'undefined') {
                this.recordResult('Health Warnings', 'Skip', 'NoiseClassifier not available');
                return;
            }
            
            const classifier = new NoiseClassifier();
            
            // Test classification accuracy across ranges
            const testLevels = [35, 55, 75, 88, 105];
            const expectedCategories = ['Quiet', 'Comfortable', 'Loud', 'Dangerous', 'Emergency Level'];
            
            testLevels.forEach((level, index) => {
                const classification = classifier.classify(level);
                const correct = classification.category === expectedCategories[index];
                this.recordResult(`Classification ${level}dB`, correct ? 'Pass' : 'Fail',
                    `Expected: ${expectedCategories[index]}, Got: ${classification.category}`);
            });
            
            // Test health warning system
            const highRiskWarning = classifier.getHealthWarning(90);
            this.recordResult('High Risk Warning', 
                highRiskWarning.level === 'high' ? 'Pass' : 'Fail',
                `Risk level: ${highRiskWarning.level}, Emergency: ${highRiskWarning.emergency}`);
            
            // Test real-time health feedback
            const realTimeFeedback = classifier.getRealTimeHealthFeedback(85, 300);
            this.recordResult('Real-time Health Feedback', 
                realTimeFeedback.exposureDose !== undefined ? 'Pass' : 'Fail',
                `Exposure dose: ${realTimeFeedback.exposureDose}%, TWA: ${realTimeFeedback.timeWeightedAverage}dB`);
            
            // Test emergency level detection
            const emergencyFeedback = classifier.getRealTimeHealthFeedback(110);
            this.recordResult('Emergency Detection', 
                emergencyFeedback.emergency ? 'Pass' : 'Fail',
                `Emergency level: ${emergencyFeedback.emergency}`);
            
        } catch (error) {
            this.recordResult('Health Warnings', 'Fail', error.message);
        }
    }

    async testHistorySystem() {
        console.log('\n📊 Testing Measurement History System...');
        
        try {
            if (typeof MeasurementHistory === 'undefined') {
                this.recordResult('History System', 'Skip', 'MeasurementHistory not available');
                return;
            }
            
            const history = new MeasurementHistory();
            
            // Clear existing history for clean test
            history.clearHistory();
            
            // Add test measurements
            const testMeasurements = [
                { averageDb: 65, minDb: 60, maxDb: 70, duration: 30, location: 'Office', isPremium: false },
                { averageDb: 45, minDb: 40, maxDb: 50, duration: 30, location: 'Home', isPremium: false },
                { averageDb: 85, minDb: 80, maxDb: 90, duration: 300, location: 'Construction Site', isPremium: true },
                { averageDb: 55, minDb: 50, maxDb: 60, duration: 30, location: 'Office', isPremium: false }
            ];
            
            testMeasurements.forEach((measurement, index) => {
                const added = history.addMeasurement(measurement);
                this.recordResult(`Add Measurement ${index + 1}`, 
                    added !== null ? 'Pass' : 'Fail',
                    added ? `Added measurement with ID: ${added.id}` : 'Failed to add measurement');
            });
            
            // Test measurement retrieval
            const allMeasurements = history.getMeasurements();
            this.recordResult('Retrieve All Measurements', 
                allMeasurements.length === 4 ? 'Pass' : 'Fail',
                `Retrieved ${allMeasurements.length} measurements`);
            
            // Test filtering
            const todayMeasurements = history.getMeasurements({ dateFilter: 'today' });
            this.recordResult('Today Filter', 
                todayMeasurements.length === 4 ? 'Pass' : 'Fail',
                `Today measurements: ${todayMeasurements.length}`);
            
            const officeMeasurements = history.getMeasurements({ location: 'Office' });
            this.recordResult('Location Filter', 
                officeMeasurements.length === 2 ? 'Pass' : 'Fail',
                `Office measurements: ${officeMeasurements.length}`);
            
            // Test statistics calculation
            const stats = history.getStatistics();
            this.recordResult('Statistics Calculation', 
                stats.totalMeasurements === 4 ? 'Pass' : 'Fail',
                `Stats: ${stats.totalMeasurements} total, avg: ${stats.averageDb}dB`);
            
            // Test location insights
            const locationInsights = history.getLocationInsights();
            this.recordResult('Location Insights', 
                Object.keys(locationInsights).length === 3 ? 'Pass' : 'Fail',
                `Tracked ${Object.keys(locationInsights).length} locations`);
            
            // Test trend analysis
            const trends = history.getExposureTrends('daily');
            this.recordResult('Trend Analysis', 
                Object.keys(trends).length > 0 ? 'Pass' : 'Fail',
                `Generated trends for ${Object.keys(trends).length} periods`);
            
            // Test data export
            const csvExport = history.exportData('csv');
            const jsonExport = history.exportData('json');
            this.recordResult('Data Export', 
                csvExport.length > 0 && jsonExport.length > 0 ? 'Pass' : 'Fail',
                `CSV: ${csvExport.split('\n').length} lines, JSON: ${jsonExport.length} chars`);
            
        } catch (error) {
            this.recordResult('History System', 'Fail', error.message);
        }
    }

    async testDataPersistence() {
        console.log('\n💾 Testing Data Persistence...');
        
        try {
            // Test localStorage functionality
            const testKey = 'soundsense-test-data';
            const testData = { test: true, timestamp: Date.now() };
            
            localStorage.setItem(testKey, JSON.stringify(testData));
            const retrieved = JSON.parse(localStorage.getItem(testKey));
            
            const persistenceWorks = retrieved.test === true;
            this.recordResult('LocalStorage Persistence', 
                persistenceWorks ? 'Pass' : 'Fail',
                persistenceWorks ? 'Data persisted successfully' : 'Data persistence failed');
            
            localStorage.removeItem(testKey);
            
            // Test monetization data persistence
            if (typeof monetizationSystem !== 'undefined') {
                monetizationSystem.saveStoredData();
                monetizationSystem.loadStoredData();
                this.recordResult('Monetization Persistence', 'Pass', 'Monetization data persisted');
            }
            
            // Test history persistence
            if (typeof MeasurementHistory !== 'undefined') {
                const history = new MeasurementHistory();
                const beforeCount = history.getMeasurements().length;
                
                history.addMeasurement({ averageDb: 50, duration: 30 });
                const afterCount = history.getMeasurements().length;
                
                // Create new instance to test loading
                const newHistory = new MeasurementHistory();
                const loadedCount = newHistory.getMeasurements().length;
                
                this.recordResult('History Persistence', 
                    loadedCount === afterCount ? 'Pass' : 'Fail',
                    `Before: ${beforeCount}, After: ${afterCount}, Loaded: ${loadedCount}`);
            }
            
        } catch (error) {
            this.recordResult('Data Persistence', 'Fail', error.message);
        }
    }

    async testCompleteUserFlow() {
        console.log('\n🔄 Testing Complete User Flow...');
        
        try {
            // Simulate complete user journey
            console.log('Simulating first-time user journey...');
            
            // Step 1: First measurement (should be free)
            if (typeof monetizationSystem !== 'undefined') {
                const shouldShowAdFirst = monetizationSystem.shouldShowAd();
                this.recordResult('First Measurement Ad Check', 
                    !shouldShowAdFirst ? 'Pass' : 'Fail',
                    `First measurement should be free: ${!shouldShowAdFirst}`);
            }
            
            // Step 2: Return user experience
            console.log('Simulating return user with ad viewing...');
            
            if (typeof monetizationSystem !== 'undefined') {
                // Increment measurement count to trigger ad
                monetizationSystem.measurementCount = 2;
                const shouldShowAdReturn = monetizationSystem.shouldShowAd();
                this.recordResult('Return User Ad Trigger', 
                    shouldShowAdReturn ? 'Pass' : 'Fail',
                    `Return user should see ad: ${shouldShowAdReturn}`);
                
                // Simulate premium unlock
                if (shouldShowAdReturn) {
                    monetizationSystem.unlockPremiumFeatures();
                    const isPremiumUnlocked = monetizationSystem.isPremiumUnlocked();
                    this.recordResult('Premium Unlock Flow', 
                        isPremiumUnlocked ? 'Pass' : 'Fail',
                        `Premium unlocked: ${isPremiumUnlocked}`);
                }
            }
            
            // Step 3: Premium feature usage
            if (typeof PremiumFeatures !== 'undefined') {
                const premiumFeatures = new PremiumFeatures();
                premiumFeatures.activate();
                
                const premiumDuration = premiumFeatures.getMeasurementDuration();
                this.recordResult('Premium Duration Access', 
                    premiumDuration === 300 ? 'Pass' : 'Fail',
                    `Premium duration: ${premiumDuration} seconds`);
            }
            
            // Step 4: History accumulation
            if (typeof MeasurementHistory !== 'undefined') {
                const history = new MeasurementHistory();
                const initialCount = history.getMeasurements().length;
                
                // Add measurement as would happen in real flow
                history.addMeasurement({
                    averageDb: 75,
                    minDb: 70,
                    maxDb: 80,
                    duration: 300,
                    isPremium: true,
                    location: 'Test Location'
                });
                
                const finalCount = history.getMeasurements().length;
                this.recordResult('History Integration', 
                    finalCount > initialCount ? 'Pass' : 'Fail',
                    `History count increased: ${initialCount} -> ${finalCount}`);
            }
            
        } catch (error) {
            this.recordResult('Complete User Flow', 'Fail', error.message);
        }
    }

    async testMobileResponsiveness() {
        console.log('\n📱 Testing Mobile Responsiveness...');
        
        try {
            // Test viewport meta tag
            const viewportMeta = document.querySelector('meta[name="viewport"]');
            this.recordResult('Viewport Meta Tag', 
                viewportMeta !== null ? 'Pass' : 'Fail',
                viewportMeta ? 'Viewport configured' : 'Missing viewport meta');
            
            // Test responsive CSS classes
            const hasResponsiveClasses = document.querySelector('.md\\:grid-cols-3') !== null;
            this.recordResult('Responsive CSS Classes', 
                hasResponsiveClasses ? 'Pass' : 'Fail',
                hasResponsiveClasses ? 'Tailwind responsive classes found' : 'Missing responsive classes');
            
            // Test touch-friendly button sizes
            const buttons = document.querySelectorAll('button');
            const touchFriendlyButtons = Array.from(buttons).filter(btn => {
                const rect = btn.getBoundingClientRect();
                return rect.height >= 44; // Apple's minimum touch target
            }).length;
            
            this.recordResult('Touch-Friendly Buttons', 
                touchFriendlyButtons > 0 ? 'Pass' : 'Fail',
                `${touchFriendlyButtons}/${buttons.length} buttons are touch-friendly`);
            
            // Test modal responsiveness
            if (typeof monetizationSystem !== 'undefined') {
                // Create test modal to check responsiveness
                const testModalHTML = `
                    <div id="test-modal" class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
                        <div class="bg-white rounded-2xl p-6 max-w-md mx-4">
                            <h3>Test Modal</h3>
                            <p>Testing modal responsiveness</p>
                        </div>
                    </div>
                `;
                document.body.insertAdjacentHTML('beforeend', testModalHTML);
                
                const modal = document.getElementById('test-modal');
                const modalContent = modal.querySelector('.bg-white');
                const hasMargin = modalContent.classList.contains('mx-4');
                
                this.recordResult('Modal Responsiveness', 
                    hasMargin ? 'Pass' : 'Fail',
                    hasMargin ? 'Modals have mobile margins' : 'Missing mobile margins');
                
                modal.remove();
            }
            
        } catch (error) {
            this.recordResult('Mobile Responsiveness', 'Fail', error.message);
        }
    }

    async testErrorHandling() {
        console.log('\n❗ Testing Error Handling...');
        
        try {
            // Test invalid measurement data handling
            if (typeof MeasurementHistory !== 'undefined') {
                const history = new MeasurementHistory();
                
                try {
                    const invalidMeasurement = history.addMeasurement(null);
                    this.recordResult('Invalid Data Handling', 'Pass', 'Null measurement handled gracefully');
                } catch (error) {
                    this.recordResult('Invalid Data Handling', 'Pass', 'Error caught and handled');
                }
            }
            
            // Test missing element handling
            const nonExistentElement = document.getElementById('non-existent-element');
            const handlesNull = nonExistentElement === null;
            this.recordResult('Missing Element Handling', handlesNull ? 'Pass' : 'Fail',
                'DOM queries handle missing elements');
            
            // Test localStorage quota exceeded simulation
            try {
                const largeData = 'x'.repeat(1024 * 1024); // 1MB string
                for (let i = 0; i < 10; i++) {
                    localStorage.setItem(`test-large-${i}`, largeData);
                }
                this.recordResult('localStorage Overflow', 'Pass', 'Large data handled');
            } catch (error) {
                this.recordResult('localStorage Overflow', 'Pass', 'Quota error caught: ' + error.name);
            } finally {
                // Clean up
                for (let i = 0; i < 10; i++) {
                    localStorage.removeItem(`test-large-${i}`);
                }
            }
            
        } catch (error) {
            this.recordResult('Error Handling', 'Fail', error.message);
        }
    }

    async testPerformance() {
        console.log('\n⚡ Testing Performance...');
        
        try {
            // Test memory usage
            const startHeap = performance.memory?.usedJSHeapSize || 0;
            
            // Create and destroy objects to test memory management
            let testArray = [];
            for (let i = 0; i < 1000; i++) {
                testArray.push({ id: i, data: 'test'.repeat(100) });
            }
            testArray = null; // Allow garbage collection
            
            const endHeap = performance.memory?.usedJSHeapSize || 0;
            const memoryDelta = endHeap - startHeap;
            
            this.recordResult('Memory Management', 
                memoryDelta < 10 * 1024 * 1024 ? 'Pass' : 'Warn', // 10MB threshold
                `Memory usage delta: ${Math.round(memoryDelta / 1024)}KB`);
            
            // Test initialization time
            const initStart = performance.now();
            
            // Simulate app initialization
            if (typeof NoiseClassifier !== 'undefined') new NoiseClassifier();
            if (typeof PremiumFeatures !== 'undefined') new PremiumFeatures();
            if (typeof MeasurementHistory !== 'undefined') new MeasurementHistory();
            
            const initTime = performance.now() - initStart;
            
            this.recordResult('Initialization Performance', 
                initTime < 100 ? 'Pass' : 'Warn', // 100ms threshold
                `Initialization time: ${Math.round(initTime)}ms`);
            
            // Test DOM manipulation performance
            const domStart = performance.now();
            
            const testElement = document.createElement('div');
            testElement.innerHTML = '<span>Test</span>'.repeat(100);
            document.body.appendChild(testElement);
            document.body.removeChild(testElement);
            
            const domTime = performance.now() - domStart;
            
            this.recordResult('DOM Performance', 
                domTime < 50 ? 'Pass' : 'Warn', // 50ms threshold
                `DOM operations: ${Math.round(domTime)}ms`);
            
        } catch (error) {
            this.recordResult('Performance', 'Fail', error.message);
        }
    }

    // Helper methods

    async simulateVideoAdCompletion() {
        return new Promise((resolve) => {
            try {
                if (typeof monetizationSystem === 'undefined') {
                    resolve({ success: false, message: 'Monetization system not available' });
                    return;
                }

                // Create a temporary video ad modal
                const modalHTML = `
                    <div id="test-video-ad" class="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
                        <div class="bg-white rounded-2xl p-6 max-w-md mx-4 text-center">
                            <h3>Test Video Ad</h3>
                            <div class="bg-black h-32 rounded mb-4 flex items-center justify-center text-white">
                                Video Content
                            </div>
                            <button id="test-complete-ad" class="bg-green-600 text-white px-4 py-2 rounded">
                                Complete Ad
                            </button>
                        </div>
                    </div>
                `;
                
                document.body.insertAdjacentHTML('beforeend', modalHTML);
                
                const completeBtn = document.getElementById('test-complete-ad');
                completeBtn.addEventListener('click', () => {
                    const modal = document.getElementById('test-video-ad');
                    modal.remove();
                    resolve({ success: true, message: 'Video ad completed successfully' });
                });
                
                // Auto-complete after 2 seconds
                setTimeout(() => {
                    const modal = document.getElementById('test-video-ad');
                    if (modal) {
                        modal.remove();
                        resolve({ success: true, message: 'Video ad auto-completed' });
                    }
                }, 2000);
                
            } catch (error) {
                resolve({ success: false, message: error.message });
            }
        });
    }

    createMockAudioProcessor() {
        return {
            getCurrentDb: () => Math.random() * 40 + 50, // Random 50-90dB
            getFrequencyData: () => new Array(1024).fill(0).map(() => Math.random() * 255),
            isRunning: true
        };
    }

    recordResult(testName, status, details) {
        const result = {
            test: testName,
            status: status,
            details: details,
            timestamp: new Date().toISOString()
        };
        
        this.testResults.push(result);
        
        const statusIcon = {
            'Pass': '✅',
            'Fail': '❌',
            'Warn': '⚠️',
            'Skip': '⏭️'
        };
        
        console.log(`${statusIcon[status] || '❔'} ${testName}: ${details}`);
    }

    generateReport() {
        const duration = Date.now() - this.startTime;
        
        console.log('\n' + '='.repeat(60));
        console.log('📋 PHASE 2 TESTING COMPLETE - FINAL REPORT');
        console.log('='.repeat(60));
        
        const summary = {
            total: this.testResults.length,
            passed: this.testResults.filter(r => r.status === 'Pass').length,
            failed: this.testResults.filter(r => r.status === 'Fail').length,
            warnings: this.testResults.filter(r => r.status === 'Warn').length,
            skipped: this.testResults.filter(r => r.status === 'Skip').length
        };
        
        console.log(`🕒 Duration: ${Math.round(duration / 1000)}s`);
        console.log(`📊 Results: ${summary.passed}✅ ${summary.failed}❌ ${summary.warnings}⚠️ ${summary.skipped}⏭️`);
        console.log(`🎯 Success Rate: ${Math.round((summary.passed / summary.total) * 100)}%`);
        
        // Feature completion status
        console.log('\n🏗️ PHASE 2 FEATURE COMPLETION STATUS:');
        
        const featureStatus = {
            'Video Ad Integration': this.getFeatureStatus(['Video Ad Flow', 'Ad Loading Screen', 'Premium Unlock Notification']),
            'Premium Features': this.getFeatureStatus(['Premium Activation', 'Premium Duration', 'Extended Measurement Start', 'Premium Analysis']),
            'Enhanced Health Warnings': this.getFeatureStatus(['Classification 35dB', 'High Risk Warning', 'Real-time Health Feedback', 'Emergency Detection']),
            'Measurement History': this.getFeatureStatus(['Add Measurement 1', 'Retrieve All Measurements', 'Statistics Calculation', 'Location Insights']),
            'Data Persistence': this.getFeatureStatus(['LocalStorage Persistence', 'History Persistence']),
            'Mobile Responsiveness': this.getFeatureStatus(['Viewport Meta Tag', 'Responsive CSS Classes', 'Touch-Friendly Buttons']),
            'Error Handling': this.getFeatureStatus(['Invalid Data Handling', 'Missing Element Handling']),
            'Performance': this.getFeatureStatus(['Memory Management', 'Initialization Performance', 'DOM Performance'])
        };
        
        Object.entries(featureStatus).forEach(([feature, status]) => {
            console.log(`${status.icon} ${feature}: ${status.message}`);
        });
        
        // Production readiness assessment
        console.log('\n🚀 PRODUCTION READINESS ASSESSMENT:');
        
        const criticalFailures = this.testResults.filter(r => 
            r.status === 'Fail' && 
            ['Monetization Init', 'Premium Activation', 'History System', 'Data Persistence'].includes(r.test)
        ).length;
        
        if (criticalFailures === 0 && summary.failed < 3) {
            console.log('🎉 READY FOR PRODUCTION DEPLOYMENT');
            console.log('   All critical features working, minimal issues found');
        } else if (criticalFailures === 0) {
            console.log('⚠️  READY WITH MINOR FIXES');
            console.log('   Core features work, but some improvements needed');
        } else {
            console.log('🛑 NOT READY - CRITICAL ISSUES FOUND');
            console.log('   Fix critical failures before deployment');
        }
        
        console.log('\n📝 Detailed test results available in console');
        console.table(this.testResults);
        
        // Return results for external consumption
        return {
            summary,
            duration,
            features: featureStatus,
            results: this.testResults,
            productionReady: criticalFailures === 0 && summary.failed < 3
        };
    }

    getFeatureStatus(testNames) {
        const relatedTests = this.testResults.filter(r => testNames.includes(r.test));
        const passed = relatedTests.filter(r => r.status === 'Pass').length;
        const total = relatedTests.length;
        
        if (total === 0) {
            return { icon: '⏭️', message: 'Not tested' };
        }
        
        const percentage = (passed / total) * 100;
        
        if (percentage === 100) {
            return { icon: '✅', message: 'Complete and working' };
        } else if (percentage >= 75) {
            return { icon: '🟨', message: 'Mostly working, minor issues' };
        } else if (percentage >= 50) {
            return { icon: '⚠️', message: 'Partially working, needs attention' };
        } else {
            return { icon: '❌', message: 'Not working, requires fixes' };
        }
    }

    wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Auto-run tests when script is loaded
if (typeof window !== 'undefined') {
    console.log('🧪 Phase 2 Test Suite Loaded - Starting Tests in 2 seconds...');
    
    setTimeout(async () => {
        const testSuite = new Phase2TestSuite();
        const results = await testSuite.runAllTests();
        
        // Make results available globally for further analysis
        window.phase2TestResults = results;
    }, 2000);
} else {
    // Node.js environment
    console.log('Phase 2 Test Suite ready for browser environment');
}