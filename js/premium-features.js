/**
 * Premium Features Module for SoundSense
 * Provides advanced measurement capabilities and professional analysis
 * Unlocked through video ad viewing - delivering clear value for users
 */

class PremiumFeatures {
    constructor() {
        this.isActive = false;
        this.sessionStartTime = null;
        this.extendedMeasurements = [];
        this.frequencyData = [];
        this.noiseEvents = [];
        this.premiumTimer = null;
        
        // Premium configuration
        this.config = {
            extendedDuration: 300, // 5 minutes
            samplingRate: 10, // Samples per second for detailed analysis
            healthThresholds: {
                safe: 70,
                caution: 80,
                warning: 85,
                danger: 90
            },
            frequencyBands: [
                { name: 'Low', min: 20, max: 250, color: '#3b82f6' },
                { name: 'Mid', min: 250, max: 4000, color: '#10b981' },
                { name: 'High', min: 4000, max: 20000, color: '#f59e0b' }
            ]
        };
        
        console.log('Premium Features module initialized');
    }
    
    /**
     * Activate premium features after ad viewing
     */
    activate() {
        this.isActive = true;
        this.sessionStartTime = Date.now();
        this.extendedMeasurements = [];
        this.frequencyData = [];
        this.noiseEvents = [];
        
        console.log('Premium features activated - 5-minute extended measurement available');
        return true;
    }
    
    /**
     * Deactivate premium features
     */
    deactivate() {
        this.isActive = false;
        this.sessionStartTime = null;
        
        if (this.premiumTimer) {
            clearInterval(this.premiumTimer);
            this.premiumTimer = null;
        }
        
        console.log('Premium features deactivated');
    }
    
    /**
     * Check if premium features are currently active
     */
    isActiveSession() {
        return this.isActive;
    }
    
    /**
     * Get premium measurement duration (5 minutes vs 30 seconds)
     */
    getMeasurementDuration() {
        return this.isActive ? this.config.extendedDuration : 30;
    }
    
    /**
     * Start premium measurement session with advanced data collection
     */
    startExtendedMeasurement(audioProcessor) {
        if (!this.isActive || !audioProcessor) {
            return false;
        }
        
        console.log('Starting 5-minute premium measurement with advanced analysis...');
        
        // Clear previous data
        this.extendedMeasurements = [];
        this.frequencyData = [];
        this.noiseEvents = [];
        
        // Start detailed sampling
        this.premiumTimer = setInterval(() => {
            this.collectDetailedData(audioProcessor);
        }, 1000 / this.config.samplingRate);
        
        return true;
    }
    
    /**
     * Stop premium measurement and prepare advanced analysis
     */
    stopExtendedMeasurement() {
        if (this.premiumTimer) {
            clearInterval(this.premiumTimer);
            this.premiumTimer = null;
        }
        
        console.log(`Premium measurement complete - collected ${this.extendedMeasurements.length} data points`);
        return this.generateAdvancedAnalysis();
    }
    
    /**
     * Collect detailed measurement data for premium analysis
     */
    collectDetailedData(audioProcessor) {
        if (!audioProcessor) return;
        
        const currentDb = audioProcessor.getCurrentDb();
        const timestamp = Date.now() - this.sessionStartTime;
        
        // Store measurement with timestamp
        this.extendedMeasurements.push({
            timestamp,
            db: currentDb,
            classification: this.classifyNoiseLevel(currentDb)
        });
        
        // Detect noise events (significant changes)
        this.detectNoiseEvents(currentDb, timestamp);
        
        // Collect frequency data if available
        if (typeof audioProcessor.getFrequencyData === 'function') {
            this.frequencyData.push({
                timestamp,
                frequencies: audioProcessor.getFrequencyData()
            });
        }
    }
    
    /**
     * Detect significant noise events and peaks
     */
    detectNoiseEvents(currentDb, timestamp) {
        const recentMeasurements = this.extendedMeasurements.slice(-5);
        
        if (recentMeasurements.length < 2) return;
        
        const avgRecent = recentMeasurements.reduce((sum, m) => sum + m.db, 0) / recentMeasurements.length;
        const dbChange = Math.abs(currentDb - avgRecent);
        
        // Detect significant noise events (>10dB change)
        if (dbChange > 10) {
            this.noiseEvents.push({
                timestamp,
                type: currentDb > avgRecent ? 'peak' : 'drop',
                magnitude: dbChange,
                before: Math.round(avgRecent),
                after: Math.round(currentDb)
            });
        }
    }
    
    /**
     * Classify noise level with premium categories
     */
    classifyNoiseLevel(db) {
        if (db < 30) return 'whisper';
        if (db < 40) return 'quiet';
        if (db < 50) return 'calm';
        if (db < 60) return 'moderate';
        if (db < 70) return 'active';
        if (db < 80) return 'loud';
        if (db < 85) return 'very-loud';
        if (db < 90) return 'warning';
        return 'dangerous';
    }
    
    /**
     * Generate comprehensive premium analysis
     */
    generateAdvancedAnalysis() {
        if (this.extendedMeasurements.length === 0) {
            return null;
        }
        
        const measurements = this.extendedMeasurements.map(m => m.db);
        
        // Basic statistics
        const stats = {
            min: Math.min(...measurements),
            max: Math.max(...measurements),
            average: measurements.reduce((a, b) => a + b) / measurements.length,
            median: this.calculateMedian(measurements),
            range: Math.max(...measurements) - Math.min(...measurements),
            duration: this.extendedMeasurements.length > 0 ? 
                     (this.extendedMeasurements[this.extendedMeasurements.length - 1].timestamp / 1000) : 0
        };
        
        // Percentile analysis
        const percentiles = {
            p10: this.calculatePercentile(measurements, 10),
            p25: this.calculatePercentile(measurements, 25),
            p50: this.calculatePercentile(measurements, 50),
            p75: this.calculatePercentile(measurements, 75),
            p90: this.calculatePercentile(measurements, 90),
            p95: this.calculatePercentile(measurements, 95)
        };
        
        // Time-weighted analysis
        const timeWeighted = this.calculateTimeWeightedExposure();
        
        // Health assessment
        const healthAssessment = this.generateHealthAssessment(stats, timeWeighted);
        
        // Noise classification breakdown
        const classificationBreakdown = this.generateClassificationBreakdown();
        
        // Professional recommendations
        const recommendations = this.generateRecommendations(stats, healthAssessment);
        
        return {
            stats,
            percentiles,
            timeWeighted,
            healthAssessment,
            classificationBreakdown,
            noiseEvents: this.noiseEvents,
            recommendations,
            measurementCount: this.extendedMeasurements.length,
            dataQuality: this.assessDataQuality()
        };
    }
    
    /**
     * Calculate median value
     */
    calculateMedian(values) {
        const sorted = [...values].sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        return sorted.length % 2 === 0 ? 
               (sorted[mid - 1] + sorted[mid]) / 2 : 
               sorted[mid];
    }
    
    /**
     * Calculate percentile value
     */
    calculatePercentile(values, percentile) {
        const sorted = [...values].sort((a, b) => a - b);
        const index = (percentile / 100) * (sorted.length - 1);
        const lower = Math.floor(index);
        const upper = Math.ceil(index);
        
        if (lower === upper) return sorted[lower];
        
        const weight = index - lower;
        return sorted[lower] * (1 - weight) + sorted[upper] * weight;
    }
    
    /**
     * Calculate time-weighted average exposure
     */
    calculateTimeWeightedExposure() {
        if (this.extendedMeasurements.length === 0) return null;
        
        let totalEnergy = 0;
        let totalTime = 0;
        
        for (let i = 0; i < this.extendedMeasurements.length - 1; i++) {
            const current = this.extendedMeasurements[i];
            const next = this.extendedMeasurements[i + 1];
            const timeInterval = (next.timestamp - current.timestamp) / 1000; // seconds
            
            // Convert dB to energy (10^(dB/10))
            const energy = Math.pow(10, current.db / 10);
            totalEnergy += energy * timeInterval;
            totalTime += timeInterval;
        }
        
        // Convert back to dB (10 * log10(energy))
        const timeWeightedDb = totalTime > 0 ? 10 * Math.log10(totalEnergy / totalTime) : 0;
        
        return {
            value: timeWeightedDb,
            totalTime,
            oshaCompliant: timeWeightedDb < 85, // OSHA 8-hour TWA limit
            exposureRisk: this.calculateExposureRisk(timeWeightedDb, totalTime)
        };
    }
    
    /**
     * Calculate exposure risk based on time and level
     */
    calculateExposureRisk(db, timeSeconds) {
        const timeHours = timeSeconds / 3600;
        
        // NIOSH recommended exposure limits
        if (db >= 100) return 'immediate-danger';
        if (db >= 95) return timeHours > 0.25 ? 'high' : 'moderate';
        if (db >= 90) return timeHours > 0.5 ? 'high' : 'moderate';
        if (db >= 85) return timeHours > 8 ? 'high' : 'low';
        
        return 'minimal';
    }
    
    /**
     * Generate health assessment based on measurements
     */
    generateHealthAssessment(stats, timeWeighted) {
        const assessment = {
            overallRisk: 'low',
            concerns: [],
            recommendations: [],
            oshaCompliant: true,
            whoCompliant: true
        };
        
        // Check peak levels
        if (stats.max >= 100) {
            assessment.overallRisk = 'high';
            assessment.concerns.push('Peak noise levels exceed safe thresholds (>100dB)');
            assessment.recommendations.push('Immediate hearing protection required');
        } else if (stats.max >= 85) {
            assessment.overallRisk = assessment.overallRisk === 'low' ? 'moderate' : assessment.overallRisk;
            assessment.concerns.push('Peak levels may cause hearing damage with prolonged exposure');
            assessment.recommendations.push('Consider hearing protection for extended exposure');
        }
        
        // Check average levels
        if (stats.average >= 85) {
            assessment.overallRisk = 'high';
            assessment.concerns.push('Average noise level exceeds OSHA workplace standards');
            assessment.recommendations.push('Workplace hearing protection program recommended');
            assessment.oshaCompliant = false;
        }
        
        // Check time-weighted exposure
        if (timeWeighted && timeWeighted.exposureRisk === 'high') {
            assessment.overallRisk = 'high';
            assessment.concerns.push('Time-weighted exposure exceeds safe limits');
            assessment.recommendations.push('Reduce exposure time or use hearing protection');
        }
        
        // WHO guidelines check
        if (stats.average > 70) {
            assessment.whoCompliant = false;
            assessment.concerns.push('Noise levels may affect concentration and communication');
        }
        
        return assessment;
    }
    
    /**
     * Generate breakdown of noise classifications
     */
    generateClassificationBreakdown() {
        const breakdown = {};
        const totalMeasurements = this.extendedMeasurements.length;
        
        this.extendedMeasurements.forEach(measurement => {
            const classification = measurement.classification;
            if (!breakdown[classification]) {
                breakdown[classification] = { count: 0, percentage: 0, avgDb: 0, totalDb: 0 };
            }
            breakdown[classification].count++;
            breakdown[classification].totalDb += measurement.db;
        });
        
        // Calculate percentages and averages
        Object.keys(breakdown).forEach(classification => {
            const data = breakdown[classification];
            data.percentage = Math.round((data.count / totalMeasurements) * 100);
            data.avgDb = Math.round(data.totalDb / data.count);
        });
        
        return breakdown;
    }
    
    /**
     * Generate professional recommendations
     */
    generateRecommendations(stats, healthAssessment) {
        const recommendations = {
            immediate: [],
            shortTerm: [],
            longTerm: [],
            equipment: []
        };
        
        // Immediate recommendations
        if (stats.max >= 90) {
            recommendations.immediate.push('Move to quieter location if possible');
            recommendations.immediate.push('Use hearing protection immediately');
        }
        
        // Equipment recommendations
        if (stats.average >= 80) {
            recommendations.equipment.push('Noise-canceling headphones for extended exposure');
            recommendations.equipment.push('Professional earplugs (NRR 25+ dB)');
        }
        
        // Environmental recommendations
        if (stats.range > 20) {
            recommendations.shortTerm.push('Environment has high noise variability');
            recommendations.shortTerm.push('Consider noise source management');
        }
        
        // Long-term recommendations
        if (healthAssessment.overallRisk !== 'low') {
            recommendations.longTerm.push('Regular hearing assessments recommended');
            recommendations.longTerm.push('Consider acoustic treatment of environment');
        }
        
        return recommendations;
    }
    
    /**
     * Assess data quality of the measurement session
     */
    assessDataQuality() {
        const expectedSamples = this.config.extendedDuration * this.config.samplingRate;
        const actualSamples = this.extendedMeasurements.length;
        const completeness = (actualSamples / expectedSamples) * 100;
        
        let quality = 'excellent';
        if (completeness < 95) quality = 'good';
        if (completeness < 85) quality = 'fair';
        if (completeness < 70) quality = 'poor';
        
        return {
            score: quality,
            completeness: Math.round(completeness),
            sampleCount: actualSamples,
            expectedSamples,
            dataConsistency: this.assessDataConsistency()
        };
    }
    
    /**
     * Assess consistency of measurement data
     */
    assessDataConsistency() {
        if (this.extendedMeasurements.length < 10) return 'insufficient-data';
        
        const measurements = this.extendedMeasurements.map(m => m.db);
        const variance = this.calculateVariance(measurements);
        
        if (variance < 25) return 'very-stable';
        if (variance < 100) return 'stable';
        if (variance < 400) return 'variable';
        return 'highly-variable';
    }
    
    /**
     * Calculate variance of measurements
     */
    calculateVariance(values) {
        const mean = values.reduce((a, b) => a + b) / values.length;
        const squaredDiffs = values.map(value => Math.pow(value - mean, 2));
        return squaredDiffs.reduce((a, b) => a + b) / values.length;
    }
    
    /**
     * Get formatted premium results for display
     */
    getFormattedResults() {
        const analysis = this.generateAdvancedAnalysis();
        if (!analysis) return null;
        
        return {
            // Enhanced statistics with professional formatting
            enhancedStats: {
                duration: `${Math.round(analysis.stats.duration / 60)}m ${Math.round(analysis.stats.duration % 60)}s`,
                average: `${Math.round(analysis.stats.average)} dB`,
                range: `${Math.round(analysis.stats.min)}-${Math.round(analysis.stats.max)} dB`,
                median: `${Math.round(analysis.stats.median)} dB`,
                variability: analysis.stats.range > 15 ? 'High' : analysis.stats.range > 8 ? 'Moderate' : 'Low'
            },
            
            // Percentile breakdown
            percentiles: {
                quietest: `${Math.round(analysis.percentiles.p10)} dB (10th percentile)`,
                typical: `${Math.round(analysis.percentiles.p50)} dB (median)`,
                loud: `${Math.round(analysis.percentiles.p90)} dB (90th percentile)`,
                peak: `${Math.round(analysis.percentiles.p95)} dB (95th percentile)`
            },
            
            // Health insights
            healthInsights: {
                riskLevel: analysis.healthAssessment.overallRisk,
                oshaCompliant: analysis.healthAssessment.oshaCompliant,
                timeWeighted: analysis.timeWeighted ? `${Math.round(analysis.timeWeighted.value)} dB TWA` : 'N/A',
                primaryConcerns: analysis.healthAssessment.concerns.slice(0, 2),
                topRecommendations: analysis.healthAssessment.recommendations.slice(0, 2)
            },
            
            // Professional analysis
            professionalAnalysis: {
                noiseEvents: analysis.noiseEvents.length,
                dominantLevel: this.getDominantNoiseLevel(analysis.classificationBreakdown),
                dataQuality: analysis.dataQuality.score,
                environmentType: this.inferEnvironmentType(analysis.stats)
            },
            
            // Recommendations
            actionableRecommendations: {
                immediate: analysis.recommendations.immediate,
                equipment: analysis.recommendations.equipment,
                environmental: analysis.recommendations.shortTerm.concat(analysis.recommendations.longTerm)
            }
        };
    }
    
    /**
     * Determine dominant noise level from classification breakdown
     */
    getDominantNoiseLevel(breakdown) {
        let maxCount = 0;
        let dominant = 'moderate';
        
        Object.entries(breakdown).forEach(([level, data]) => {
            if (data.count > maxCount) {
                maxCount = data.count;
                dominant = level;
            }
        });
        
        return dominant;
    }
    
    /**
     * Infer environment type based on noise patterns
     */
    inferEnvironmentType(stats) {
        const avg = stats.average;
        const range = stats.range;
        
        if (avg < 40 && range < 10) return 'Library/Quiet Office';
        if (avg < 55 && range < 15) return 'Residential Area';
        if (avg < 65 && range < 20) return 'Office Environment';
        if (avg < 75 && range > 20) return 'Urban/Traffic Area';
        if (avg < 85 && range > 25) return 'Industrial/Construction';
        return 'High-Noise Environment';
    }
    
    /**
     * Export measurement data for user download
     */
    exportMeasurementData() {
        if (!this.isActive || this.extendedMeasurements.length === 0) {
            return null;
        }
        
        const analysis = this.generateAdvancedAnalysis();
        const exportData = {
            sessionInfo: {
                timestamp: new Date(this.sessionStartTime).toISOString(),
                duration: analysis.stats.duration,
                sampleCount: this.extendedMeasurements.length,
                appVersion: 'SoundSense Premium'
            },
            measurements: this.extendedMeasurements,
            analysis: analysis,
            summary: this.getFormattedResults()
        };
        
        return {
            data: exportData,
            filename: `soundsense-measurement-${new Date().toISOString().split('T')[0]}.json`,
            csv: this.convertToCSV(this.extendedMeasurements)
        };
    }
    
    /**
     * Convert measurements to CSV format
     */
    convertToCSV(measurements) {
        const headers = ['Timestamp (ms)', 'Time (s)', 'Decibels (dB)', 'Classification'];
        const rows = measurements.map(m => [
            m.timestamp,
            (m.timestamp / 1000).toFixed(1),
            m.db.toFixed(1),
            m.classification
        ]);
        
        return [headers, ...rows]
            .map(row => row.join(','))
            .join('\n');
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PremiumFeatures;
}