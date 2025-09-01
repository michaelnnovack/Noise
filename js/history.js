/**
 * SoundSense History Management System
 * Comprehensive measurement history with statistics and insights
 * Designed to encourage user engagement and return visits
 */

class MeasurementHistory {
    constructor() {
        this.measurements = [];
        this.storageKey = 'soundsense-measurements';
        this.maxRecords = 50; // Keep last 50 measurements for performance
        this.locations = new Set();
        
        // Initialize with stored data
        this.loadFromStorage();
        
        console.log('History system initialized with', this.measurements.length, 'stored measurements');
    }
    
    /**
     * Add a new measurement to history
     * @param {Object} measurementData - Complete measurement data
     */
    addMeasurement(measurementData) {
        const measurement = {
            id: this.generateId(),
            timestamp: new Date(),
            ...measurementData,
            // Standardize data structure
            duration: measurementData.duration || 30,
            location: measurementData.location || 'Unknown Location',
            notes: measurementData.notes || '',
            isPremium: measurementData.isPremium || false,
            sessionType: measurementData.isPremium ? 'Premium' : 'Standard'
        };
        
        // Add location to set for tracking
        if (measurement.location !== 'Unknown Location') {
            this.locations.add(measurement.location);
        }
        
        // Insert at beginning (most recent first)
        this.measurements.unshift(measurement);
        
        // Maintain max records limit
        if (this.measurements.length > this.maxRecords) {
            this.measurements = this.measurements.slice(0, this.maxRecords);
        }
        
        // Save to storage
        this.saveToStorage();
        
        console.log('New measurement added to history:', measurement);
        return measurement;
    }
    
    /**
     * Get measurements with filtering and sorting options
     * @param {Object} options - Filter and sort options
     */
    getMeasurements(options = {}) {
        let filtered = [...this.measurements];
        
        // Apply date filtering
        if (options.dateFilter) {
            const now = new Date();
            const filterDate = new Date();
            
            switch (options.dateFilter) {
                case 'today':
                    filterDate.setHours(0, 0, 0, 0);
                    filtered = filtered.filter(m => new Date(m.timestamp) >= filterDate);
                    break;
                case 'week':
                    filterDate.setDate(now.getDate() - 7);
                    filtered = filtered.filter(m => new Date(m.timestamp) >= filterDate);
                    break;
                case 'month':
                    filterDate.setMonth(now.getMonth() - 1);
                    filtered = filtered.filter(m => new Date(m.timestamp) >= filterDate);
                    break;
            }
        }
        
        // Apply location filtering
        if (options.location) {
            filtered = filtered.filter(m => m.location === options.location);
        }
        
        // Apply session type filtering
        if (options.sessionType) {
            filtered = filtered.filter(m => m.sessionType === options.sessionType);
        }
        
        // Apply limit
        if (options.limit) {
            filtered = filtered.slice(0, options.limit);
        }
        
        return filtered;
    }
    
    /**
     * Get comprehensive statistics for all measurements
     * @param {Object} options - Filter options for stats calculation
     */
    getStatistics(options = {}) {
        const measurements = this.getMeasurements(options);
        
        if (measurements.length === 0) {
            return this.getEmptyStats();
        }
        
        // Extract dB values for calculations
        const dbValues = measurements.map(m => m.averageDb || m.maxDb || 0);
        const minValues = measurements.map(m => m.minDb || m.averageDb || 0);
        const maxValues = measurements.map(m => m.maxDb || m.averageDb || 0);
        
        // Calculate comprehensive statistics
        const stats = {
            // Basic statistics
            totalMeasurements: measurements.length,
            averageDb: this.calculateMean(dbValues),
            medianDb: this.calculateMedian(dbValues),
            minDb: Math.min(...minValues),
            maxDb: Math.max(...maxValues),
            
            // Variability measures
            standardDeviation: this.calculateStandardDeviation(dbValues),
            range: Math.max(...maxValues) - Math.min(...minValues),
            
            // Percentiles
            percentile10: this.calculatePercentile(dbValues, 10),
            percentile25: this.calculatePercentile(dbValues, 25),
            percentile75: this.calculatePercentile(dbValues, 75),
            percentile90: this.calculatePercentile(dbValues, 90),
            
            // Session information
            totalDuration: measurements.reduce((sum, m) => sum + (m.duration || 30), 0),
            premiumSessions: measurements.filter(m => m.isPremium).length,
            standardSessions: measurements.filter(m => !m.isPremium).length,
            
            // Time-based patterns
            timeDistribution: this.analyzeTimeDistribution(measurements),
            locationDistribution: this.analyzeLocationDistribution(measurements),
            
            // Health insights
            healthAnalysis: this.analyzeHealthPatterns(measurements),
            
            // Trends
            trendAnalysis: this.analyzeTrends(measurements),
            
            // Most recent measurement
            lastMeasurement: measurements[0] || null,
            
            // Compliance tracking
            oshaCompliantMeasurements: measurements.filter(m => (m.averageDb || 0) <= 85).length,
            highRiskMeasurements: measurements.filter(m => (m.averageDb || 0) > 85).length
        };
        
        return stats;
    }
    
    /**
     * Get location-based statistics and insights
     */
    getLocationInsights() {
        const locationStats = {};
        
        for (const location of this.locations) {
            const locationMeasurements = this.getMeasurements({ location });
            locationStats[location] = {
                count: locationMeasurements.length,
                averageDb: this.calculateMean(locationMeasurements.map(m => m.averageDb || 0)),
                lastVisited: locationMeasurements[0]?.timestamp || null,
                riskLevel: this.assessLocationRisk(locationMeasurements),
                recommendations: this.getLocationRecommendations(location, locationMeasurements)
            };
        }
        
        return locationStats;
    }
    
    /**
     * Get noise exposure trends over time
     * @param {String} period - 'daily', 'weekly', or 'monthly'
     */
    getExposureTrends(period = 'weekly') {
        const measurements = this.getMeasurements();
        const trends = {};
        
        measurements.forEach(measurement => {
            const date = new Date(measurement.timestamp);
            let key;
            
            switch (period) {
                case 'daily':
                    key = date.toDateString();
                    break;
                case 'weekly':
                    const weekStart = new Date(date);
                    weekStart.setDate(date.getDate() - date.getDay());
                    key = weekStart.toDateString();
                    break;
                case 'monthly':
                    key = `${date.getFullYear()}-${date.getMonth() + 1}`;
                    break;
            }
            
            if (!trends[key]) {
                trends[key] = {
                    measurements: [],
                    totalExposure: 0,
                    averageDb: 0,
                    maxDb: 0,
                    date: key
                };
            }
            
            trends[key].measurements.push(measurement);
            trends[key].totalExposure += measurement.duration || 30;
            trends[key].maxDb = Math.max(trends[key].maxDb, measurement.maxDb || measurement.averageDb || 0);
        });
        
        // Calculate averages for each period
        Object.keys(trends).forEach(key => {
            const periodData = trends[key];
            const dbValues = periodData.measurements.map(m => m.averageDb || 0);
            periodData.averageDb = this.calculateMean(dbValues);
        });
        
        return trends;
    }
    
    /**
     * Export measurement data for backup or analysis
     * @param {String} format - 'json' or 'csv'
     */
    exportData(format = 'json') {
        const data = {
            exportDate: new Date().toISOString(),
            totalMeasurements: this.measurements.length,
            measurements: this.measurements
        };
        
        if (format === 'csv') {
            return this.convertToCSV(data.measurements);
        }
        
        return JSON.stringify(data, null, 2);
    }
    
    /**
     * Import measurement data from backup
     * @param {String} data - JSON or CSV data string
     * @param {String} format - 'json' or 'csv'
     */
    importData(data, format = 'json') {
        try {
            let importedMeasurements = [];
            
            if (format === 'csv') {
                importedMeasurements = this.parseCSV(data);
            } else {
                const parsed = JSON.parse(data);
                importedMeasurements = parsed.measurements || parsed;
            }
            
            // Validate and merge with existing data
            const validMeasurements = importedMeasurements.filter(m => 
                m.timestamp && (m.averageDb || m.maxDb)
            );
            
            // Avoid duplicates based on timestamp and dB value
            const existingSignatures = new Set(
                this.measurements.map(m => `${m.timestamp}-${m.averageDb}`)
            );
            
            const newMeasurements = validMeasurements.filter(m => 
                !existingSignatures.has(`${m.timestamp}-${m.averageDb}`)
            );
            
            // Add new measurements
            this.measurements.push(...newMeasurements);
            
            // Sort by timestamp (newest first)
            this.measurements.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
            
            // Maintain max records limit
            if (this.measurements.length > this.maxRecords) {
                this.measurements = this.measurements.slice(0, this.maxRecords);
            }
            
            this.saveToStorage();
            
            console.log(`Imported ${newMeasurements.length} new measurements`);
            return { success: true, imported: newMeasurements.length };
            
        } catch (error) {
            console.error('Failed to import data:', error);
            return { success: false, error: error.message };
        }
    }
    
    /**
     * Clear all measurement history
     */
    clearHistory() {
        this.measurements = [];
        this.locations.clear();
        this.saveToStorage();
        console.log('Measurement history cleared');
    }
    
    // Private helper methods
    
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
    
    loadFromStorage() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            if (stored) {
                const data = JSON.parse(stored);
                this.measurements = data.measurements || data || [];
                
                // Convert timestamp strings back to Date objects
                this.measurements = this.measurements.map(m => ({
                    ...m,
                    timestamp: new Date(m.timestamp)
                }));
                
                // Rebuild locations set
                this.locations = new Set(
                    this.measurements
                        .map(m => m.location)
                        .filter(loc => loc && loc !== 'Unknown Location')
                );
            }
        } catch (error) {
            console.warn('Could not load measurement history:', error);
            this.measurements = [];
        }
    }
    
    saveToStorage() {
        try {
            const data = {
                version: '1.0',
                lastUpdated: new Date().toISOString(),
                measurements: this.measurements
            };
            localStorage.setItem(this.storageKey, JSON.stringify(data));
        } catch (error) {
            console.warn('Could not save measurement history:', error);
        }
    }
    
    calculateMean(values) {
        if (values.length === 0) return 0;
        return Math.round((values.reduce((sum, val) => sum + val, 0) / values.length) * 10) / 10;
    }
    
    calculateMedian(values) {
        if (values.length === 0) return 0;
        const sorted = [...values].sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        return sorted.length % 2 === 0 
            ? (sorted[mid - 1] + sorted[mid]) / 2 
            : sorted[mid];
    }
    
    calculateStandardDeviation(values) {
        if (values.length === 0) return 0;
        const mean = this.calculateMean(values);
        const squaredDiffs = values.map(value => Math.pow(value - mean, 2));
        const avgSquaredDiff = this.calculateMean(squaredDiffs);
        return Math.round(Math.sqrt(avgSquaredDiff) * 10) / 10;
    }
    
    calculatePercentile(values, percentile) {
        if (values.length === 0) return 0;
        const sorted = [...values].sort((a, b) => a - b);
        const index = (percentile / 100) * (sorted.length - 1);
        
        if (Number.isInteger(index)) {
            return sorted[index];
        } else {
            const lower = Math.floor(index);
            const upper = Math.ceil(index);
            const weight = index - lower;
            return Math.round((sorted[lower] * (1 - weight) + sorted[upper] * weight) * 10) / 10;
        }
    }
    
    analyzeTimeDistribution(measurements) {
        const distribution = {
            morning: 0,   // 6 AM - 12 PM
            afternoon: 0, // 12 PM - 6 PM
            evening: 0,   // 6 PM - 12 AM
            night: 0      // 12 AM - 6 AM
        };
        
        measurements.forEach(measurement => {
            const hour = new Date(measurement.timestamp).getHours();
            
            if (hour >= 6 && hour < 12) {
                distribution.morning++;
            } else if (hour >= 12 && hour < 18) {
                distribution.afternoon++;
            } else if (hour >= 18 && hour < 24) {
                distribution.evening++;
            } else {
                distribution.night++;
            }
        });
        
        return distribution;
    }
    
    analyzeLocationDistribution(measurements) {
        const distribution = {};
        
        measurements.forEach(measurement => {
            const location = measurement.location || 'Unknown Location';
            distribution[location] = (distribution[location] || 0) + 1;
        });
        
        return distribution;
    }
    
    analyzeHealthPatterns(measurements) {
        const patterns = {
            safeExposures: measurements.filter(m => (m.averageDb || 0) <= 70).length,
            moderateExposures: measurements.filter(m => (m.averageDb || 0) > 70 && (m.averageDb || 0) <= 85).length,
            highRiskExposures: measurements.filter(m => (m.averageDb || 0) > 85).length,
            averageRiskLevel: 'low'
        };
        
        const totalMeasurements = measurements.length;
        const highRiskPercentage = (patterns.highRiskExposures / totalMeasurements) * 100;
        
        if (highRiskPercentage > 20) {
            patterns.averageRiskLevel = 'high';
        } else if (highRiskPercentage > 5 || patterns.moderateExposures > totalMeasurements * 0.5) {
            patterns.averageRiskLevel = 'moderate';
        }
        
        return patterns;
    }
    
    analyzeTrends(measurements) {
        if (measurements.length < 2) {
            return { trend: 'insufficient-data', change: 0 };
        }
        
        // Analyze trend over recent measurements
        const recent = measurements.slice(0, Math.min(10, measurements.length));
        const older = measurements.slice(10, Math.min(20, measurements.length));
        
        if (older.length === 0) {
            return { trend: 'insufficient-data', change: 0 };
        }
        
        const recentAvg = this.calculateMean(recent.map(m => m.averageDb || 0));
        const olderAvg = this.calculateMean(older.map(m => m.averageDb || 0));
        
        const change = recentAvg - olderAvg;
        const percentChange = Math.abs(change) < 0.1 ? 0 : Math.round((change / olderAvg) * 100 * 10) / 10;
        
        let trend = 'stable';
        if (Math.abs(percentChange) > 10) {
            trend = change > 0 ? 'increasing' : 'decreasing';
        } else if (Math.abs(percentChange) > 5) {
            trend = change > 0 ? 'slightly-increasing' : 'slightly-decreasing';
        }
        
        return { trend, change: percentChange };
    }
    
    assessLocationRisk(measurements) {
        if (measurements.length === 0) return 'unknown';
        
        const avgDb = this.calculateMean(measurements.map(m => m.averageDb || 0));
        
        if (avgDb <= 70) return 'low';
        if (avgDb <= 85) return 'moderate';
        return 'high';
    }
    
    getLocationRecommendations(location, measurements) {
        const risk = this.assessLocationRisk(measurements);
        const recommendations = [];
        
        switch (risk) {
            case 'high':
                recommendations.push('Consider hearing protection');
                recommendations.push('Limit exposure time');
                recommendations.push('Identify noise sources for reduction');
                break;
            case 'moderate':
                recommendations.push('Monitor exposure duration');
                recommendations.push('Consider protection for extended stays');
                break;
            case 'low':
                recommendations.push('Good environment for concentration');
                recommendations.push('Safe for extended periods');
                break;
        }
        
        return recommendations;
    }
    
    convertToCSV(measurements) {
        if (measurements.length === 0) return '';
        
        const headers = [
            'timestamp', 'averageDb', 'minDb', 'maxDb', 
            'duration', 'location', 'sessionType', 'notes'
        ];
        
        const csvRows = [headers.join(',')];
        
        measurements.forEach(measurement => {
            const row = headers.map(header => {
                const value = measurement[header] || '';
                // Escape commas and quotes in CSV
                return typeof value === 'string' && value.includes(',') 
                    ? `"${value.replace(/"/g, '""')}"` 
                    : value;
            });
            csvRows.push(row.join(','));
        });
        
        return csvRows.join('\n');
    }
    
    parseCSV(csvData) {
        const lines = csvData.split('\n');
        if (lines.length < 2) return [];
        
        const headers = lines[0].split(',');
        const measurements = [];
        
        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',');
            if (values.length === headers.length) {
                const measurement = {};
                headers.forEach((header, index) => {
                    measurement[header] = values[index];
                });
                
                // Convert numeric values
                if (measurement.averageDb) measurement.averageDb = parseFloat(measurement.averageDb);
                if (measurement.minDb) measurement.minDb = parseFloat(measurement.minDb);
                if (measurement.maxDb) measurement.maxDb = parseFloat(measurement.maxDb);
                if (measurement.duration) measurement.duration = parseInt(measurement.duration);
                if (measurement.timestamp) measurement.timestamp = new Date(measurement.timestamp);
                
                measurements.push(measurement);
            }
        }
        
        return measurements;
    }
    
    getEmptyStats() {
        return {
            totalMeasurements: 0,
            averageDb: 0,
            medianDb: 0,
            minDb: 0,
            maxDb: 0,
            standardDeviation: 0,
            range: 0,
            percentile10: 0,
            percentile25: 0,
            percentile75: 0,
            percentile90: 0,
            totalDuration: 0,
            premiumSessions: 0,
            standardSessions: 0,
            timeDistribution: { morning: 0, afternoon: 0, evening: 0, night: 0 },
            locationDistribution: {},
            healthAnalysis: { 
                safeExposures: 0, 
                moderateExposures: 0, 
                highRiskExposures: 0,
                averageRiskLevel: 'unknown'
            },
            trendAnalysis: { trend: 'insufficient-data', change: 0 },
            lastMeasurement: null,
            oshaCompliantMeasurements: 0,
            highRiskMeasurements: 0
        };
    }
}

// Make available globally
if (typeof window !== 'undefined') {
    window.MeasurementHistory = MeasurementHistory;
}

console.log('SoundSense History System loaded successfully');