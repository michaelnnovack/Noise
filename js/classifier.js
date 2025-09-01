/**
 * Noise Classification Module
 * Categorizes noise levels and provides educational information
 * This file will be fully implemented in Phase 2
 */

class NoiseClassifier {
    constructor() {
        this.classifications = [
            {
                range: 'quiet',
                minDb: 0,
                maxDb: 40,
                category: 'Quiet',
                description: 'Library, soft whisper',
                color: '#27ae60',
                riskZone: 'green',
                examples: ['Library reading room', 'Soft whisper', 'Quiet rural area', 'Recording studio'],
                healthInfo: 'Comfortable noise level for concentration and rest.',
                immediateHealth: {
                    riskLevel: 'minimal',
                    message: 'Excellent for sleep, concentration, and recovery',
                    recommendation: 'Ideal environment for sensitive activities'
                },
                exposure: {
                    safeTime: 'unlimited',
                    oshaCompliant: true,
                    hearingProtection: false
                }
            },
            {
                range: 'comfortable',
                minDb: 40,
                maxDb: 55,
                category: 'Comfortable',
                description: 'Quiet office, suburban area',
                color: '#22c55e',
                riskZone: 'green', 
                examples: ['Quiet office', 'Suburban residential', 'Library with activity', 'Background music'],
                healthInfo: 'WHO recommended maximum for residential areas.',
                immediateHealth: {
                    riskLevel: 'minimal',
                    message: 'Comfortable for all daily activities',
                    recommendation: 'Optimal for work, study, and conversation'
                },
                exposure: {
                    safeTime: 'unlimited',
                    oshaCompliant: true,
                    hearingProtection: false
                }
            },
            {
                range: 'moderate',
                minDb: 55,
                maxDb: 70,
                category: 'Moderate',
                description: 'Normal conversation, busy office',
                color: '#3b82f6',
                riskZone: 'yellow',
                examples: ['Normal conversation', 'Busy office', 'City traffic at distance', 'Restaurant dining'],
                healthInfo: 'Acceptable for daily activities. WHO guideline limit for schools and hospitals.',
                immediateHealth: {
                    riskLevel: 'low',
                    message: 'May interfere with communication and concentration',
                    recommendation: 'Consider quieter spaces for detailed work'
                },
                exposure: {
                    safeTime: 'unlimited',
                    oshaCompliant: true,
                    hearingProtection: false,
                    stressRisk: 'low'
                }
            },
            {
                range: 'loud',
                minDb: 70,
                maxDb: 85,
                category: 'Loud',
                description: 'Heavy traffic, vacuum cleaner',
                color: '#f59e0b',
                riskZone: 'orange',
                examples: ['Heavy traffic', 'Vacuum cleaner', 'Busy restaurant', 'Lawn mower', 'Hair dryer'],
                healthInfo: 'May cause fatigue and stress with prolonged exposure. WHO guideline exceeded.',
                immediateHealth: {
                    riskLevel: 'moderate',
                    message: 'May cause stress, fatigue, and communication difficulty',
                    recommendation: 'Limit exposure time and take quiet breaks'
                },
                exposure: {
                    safeTime: '8 hours (OSHA limit)',
                    oshaCompliant: true,
                    hearingProtection: 'recommended for extended exposure',
                    stressRisk: 'moderate',
                    sleepDisruption: 'high'
                }
            },
            {
                range: 'dangerous',
                minDb: 85,
                maxDb: 100,
                category: 'Dangerous',
                description: 'Construction site, power tools',
                color: '#dc2626',
                riskZone: 'red',
                examples: ['Construction site', 'Power tools', 'Subway train', 'Motorcycle', 'Industrial equipment'],
                healthInfo: 'OSHA action level. Hearing damage risk with extended exposure. Immediate protection required.',
                immediateHealth: {
                    riskLevel: 'high',
                    message: 'Immediate hearing damage risk with extended exposure',
                    recommendation: 'Use hearing protection immediately. Limit exposure time.'
                },
                exposure: {
                    safeTime: '8 hours maximum with protection',
                    oshaCompliant: false,
                    hearingProtection: 'required',
                    stressRisk: 'high',
                    sleepDisruption: 'severe',
                    emergencyLevel: false
                }
            },
            {
                range: 'emergency',
                minDb: 100,
                maxDb: 140,
                category: 'Emergency Level',
                description: 'Rock concert, jet engine',
                color: '#991b1b',
                riskZone: 'red',
                examples: ['Rock concert', 'Jet engine', 'Chainsaw', 'Gunshot', 'Emergency sirens'],
                healthInfo: 'IMMEDIATE HEARING DAMAGE RISK. Pain threshold exceeded. Evacuate or use maximum protection.',
                immediateHealth: {
                    riskLevel: 'critical',
                    message: 'IMMEDIATE DANGER: Instant hearing damage possible',
                    recommendation: 'EVACUATE AREA or use maximum hearing protection (NRR 30+ dB)'
                },
                exposure: {
                    safeTime: '15 minutes maximum',
                    oshaCompliant: false,
                    hearingProtection: 'maximum protection required',
                    stressRisk: 'critical',
                    sleepDisruption: 'severe',
                    emergencyLevel: true
                }
            }
        ];
        
        console.log('NoiseClassifier initialized');
    }
    
    classify(dbLevel) {
        // Find the appropriate classification for the given dB level
        for (const classification of this.classifications) {
            if (dbLevel >= classification.minDb && dbLevel < classification.maxDb) {
                return {
                    ...classification,
                    currentDb: Math.round(dbLevel)
                };
            }
        }
        
        // Default to dangerous if above all ranges
        return {
            ...this.classifications[this.classifications.length - 1],
            currentDb: Math.round(dbLevel)
        };
    }
    
    getHealthWarning(dbLevel) {
        const classification = this.classify(dbLevel);
        if (!classification) return null;

        return {
            level: classification.immediateHealth.riskLevel,
            message: classification.immediateHealth.message,
            recommendation: classification.immediateHealth.recommendation,
            zone: classification.riskZone,
            emergency: classification.exposure?.emergencyLevel || false,
            hearingProtection: classification.exposure?.hearingProtection,
            safeExposureTime: classification.exposure?.safeTime
        };
    }
    
    /**
     * Get immediate real-time health feedback with color coding
     */
    getRealTimeHealthFeedback(dbLevel, duration = 0) {
        const classification = this.classify(dbLevel);
        const warning = this.getHealthWarning(dbLevel);
        
        // Calculate time-weighted exposure risk
        const exposureDose = this.calculateExposureDose(dbLevel, duration);
        const timeWeightedAverage = this.calculateTimeWeightedAverage([{db: dbLevel, duration: duration}]);
        
        return {
            ...warning,
            classification: classification.category,
            color: classification.color,
            riskZone: classification.riskZone,
            exposureDose: Math.round(exposureDose),
            timeWeightedAverage: Math.round(timeWeightedAverage),
            actionRequired: this.getImmediateActions(dbLevel, duration),
            visualIndicators: this.getVisualIndicators(dbLevel)
        };
    }
    
    /**
     * Get immediate actions required based on noise level
     */
    getImmediateActions(dbLevel, duration = 0) {
        const actions = [];
        
        if (dbLevel >= 100) {
            actions.push('⚠️ EVACUATE AREA or use maximum ear protection');
            actions.push('🚨 Seek immediate medical attention if experiencing pain');
            actions.push('📞 Consider reporting dangerous noise levels to authorities');
        } else if (dbLevel >= 85) {
            actions.push('🎧 Put on hearing protection immediately');
            actions.push('⏰ Limit exposure to ' + this.calculateSafeExposureTime(dbLevel) + ' hours maximum');
            actions.push('📍 Move to quieter area if possible');
        } else if (dbLevel >= 70) {
            actions.push('🔇 Consider hearing protection for extended periods');
            actions.push('⏸️ Take regular breaks in quieter environments');
            actions.push('💬 Be aware of communication difficulties');
        } else if (dbLevel >= 55) {
            actions.push('🧠 Optimal for concentration and detailed work');
            actions.push('💤 May interfere with sleep quality');
        } else {
            actions.push('✅ Excellent environment for all activities');
            actions.push('😴 Ideal for sleep and rest');
        }
        
        return actions;
    }
    
    /**
     * Get visual health indicators for UI
     */
    getVisualIndicators(dbLevel) {
        const classification = this.classify(dbLevel);
        
        return {
            statusBadge: {
                text: classification.immediateHealth.riskLevel.toUpperCase(),
                color: this.getRiskBadgeColor(classification.immediateHealth.riskLevel),
                icon: this.getRiskIcon(classification.immediateHealth.riskLevel)
            },
            progressBar: {
                percentage: Math.min(100, (dbLevel / 100) * 100),
                color: this.getProgressColor(dbLevel),
                zones: this.getGaugeZones()
            },
            warningLevel: {
                show: dbLevel >= 70,
                severity: dbLevel >= 100 ? 'critical' : dbLevel >= 85 ? 'high' : 'moderate',
                animation: dbLevel >= 100 ? 'pulse' : dbLevel >= 85 ? 'glow' : 'none'
            }
        };
    }
    
    getRiskBadgeColor(riskLevel) {
        const colors = {
            'minimal': 'bg-green-100 text-green-800',
            'low': 'bg-blue-100 text-blue-800', 
            'moderate': 'bg-yellow-100 text-yellow-800',
            'high': 'bg-orange-100 text-orange-800',
            'critical': 'bg-red-100 text-red-800'
        };
        return colors[riskLevel] || 'bg-gray-100 text-gray-800';
    }
    
    getRiskIcon(riskLevel) {
        const icons = {
            'minimal': 'check_circle',
            'low': 'info', 
            'moderate': 'warning',
            'high': 'priority_high',
            'critical': 'emergency'
        };
        return icons[riskLevel] || 'help';
    }
    
    getProgressColor(dbLevel) {
        if (dbLevel >= 100) return '#991b1b'; // red-800
        if (dbLevel >= 85) return '#dc2626';  // red-600
        if (dbLevel >= 70) return '#f59e0b';  // amber-500
        if (dbLevel >= 55) return '#3b82f6';  // blue-500
        return '#22c55e'; // green-500
    }
    
    getGaugeZones() {
        return [
            { min: 0, max: 40, color: '#22c55e', label: 'Safe' },
            { min: 40, max: 55, color: '#22c55e', label: 'Comfortable' },
            { min: 55, max: 70, color: '#3b82f6', label: 'Moderate' },
            { min: 70, max: 85, color: '#f59e0b', label: 'Loud' },
            { min: 85, max: 100, color: '#dc2626', label: 'Dangerous' },
            { min: 100, max: 140, color: '#991b1b', label: 'Emergency' }
        ];
    }
    
    /**
     * Enhanced health analysis for premium features
     */
    generatePremiumHealthAnalysis(dbLevel, duration, timeWeightedAverage) {
        const basicWarning = this.getHealthWarning(dbLevel);
        const classification = this.classify(dbLevel);
        
        // OSHA and NIOSH standards
        const oshaCompliant = timeWeightedAverage <= 85;
        const nioshCompliant = timeWeightedAverage <= 85;
        
        // Calculate safe exposure time based on OSHA standards
        const safeExposureTime = this.calculateSafeExposureTime(timeWeightedAverage);
        
        // Risk assessment
        let riskLevel = 'low';
        const concerns = [];
        const recommendations = [];
        
        if (timeWeightedAverage >= 90) {
            riskLevel = 'high';
            concerns.push('Time-weighted average exceeds safe workplace standards');
            recommendations.push('Immediate hearing protection required');
            recommendations.push('Limit exposure to maximum 8 hours per day');
        } else if (timeWeightedAverage >= 85) {
            riskLevel = 'moderate';
            concerns.push('Approaching maximum safe exposure limits');
            recommendations.push('Hearing protection recommended');
            recommendations.push('Monitor cumulative daily exposure');
        } else if (dbLevel >= 100) {
            riskLevel = 'high';
            concerns.push('Peak levels present immediate hearing damage risk');
            recommendations.push('Avoid exposure or use high-level hearing protection');
        } else if (dbLevel >= 85) {
            riskLevel = 'moderate';
            concerns.push('Peak levels may cause hearing damage with extended exposure');
            recommendations.push('Consider hearing protection for extended periods');
        }
        
        // Duration-specific recommendations
        if (duration > 8 * 60 * 60 && timeWeightedAverage > 70) { // 8 hours
            recommendations.push('Extended exposure detected - take regular quiet breaks');
        }
        
        // Environmental recommendations
        if (dbLevel >= 75) {
            recommendations.push('Consider noise control measures at the source');
        }
        
        return {
            riskLevel,
            oshaCompliant,
            nioshCompliant,
            timeWeightedAverage: Math.round(timeWeightedAverage),
            safeExposureTime,
            primaryConcerns: concerns,
            professionalRecommendations: recommendations,
            classification,
            exposureDose: this.calculateExposureDose(timeWeightedAverage, duration),
            hearingProtectionRequired: timeWeightedAverage >= 85 || dbLevel >= 100,
            stressRisk: this.assessStressRisk(dbLevel, duration),
            sleepDisruptionRisk: this.assessSleepDisruptionRisk(dbLevel)
        };
    }
    
    /**
     * Calculate safe exposure time based on OSHA standards
     */
    calculateSafeExposureTime(dbLevel) {
        // OSHA permissible exposure limits (hours)
        if (dbLevel <= 85) return 8;
        if (dbLevel <= 90) return 8;
        if (dbLevel <= 92) return 4;
        if (dbLevel <= 95) return 2;
        if (dbLevel <= 97) return 1;
        if (dbLevel <= 100) return 0.25; // 15 minutes
        if (dbLevel <= 105) return 0.017; // 1 minute
        return 0; // No safe exposure
    }
    
    /**
     * Calculate OSHA exposure dose
     */
    calculateExposureDose(timeWeightedAverage, durationSeconds) {
        const durationHours = durationSeconds / 3600;
        const safeHours = this.calculateSafeExposureTime(timeWeightedAverage);
        
        if (safeHours === 0) return 100; // Maximum dose
        
        return Math.min(100, (durationHours / safeHours) * 100);
    }
    
    /**
     * Calculate time-weighted average for multiple measurements
     */
    calculateTimeWeightedAverage(measurements) {
        if (!measurements || measurements.length === 0) return 0;
        
        let totalEnergyExposure = 0;
        let totalTime = 0;
        
        measurements.forEach(measurement => {
            const energy = Math.pow(10, measurement.db / 10);
            const time = measurement.duration || 1;
            totalEnergyExposure += energy * time;
            totalTime += time;
        });
        
        if (totalTime === 0) return 0;
        
        return 10 * Math.log10(totalEnergyExposure / totalTime);
    }
    
    /**
     * Enhanced health dashboard analysis
     */
    generateHealthDashboard(measurements, currentDb) {
        if (!measurements || measurements.length === 0) {
            return {
                overallRisk: 'insufficient-data',
                message: 'More measurements needed for comprehensive health analysis',
                recommendations: ['Take multiple measurements throughout the day']
            };
        }
        
        const timeWeightedAverage = this.calculateTimeWeightedAverage(measurements);
        const maxExposure = Math.max(...measurements.map(m => m.db));
        const averageExposure = measurements.reduce((sum, m) => sum + m.db, 0) / measurements.length;
        
        // Personal risk assessment
        const personalRisk = this.calculatePersonalRisk(timeWeightedAverage, maxExposure, measurements.length);
        
        // Exposure pattern analysis 
        const patterns = this.analyzeExposurePatterns(measurements);
        
        // Health goal tracking
        const healthGoals = this.assessHealthGoals(timeWeightedAverage, measurements);
        
        // Noise reduction recommendations
        const reductionPlan = this.generateNoiseReductionPlan(measurements, currentDb);
        
        return {
            personalRisk,
            timeWeightedAverage: Math.round(timeWeightedAverage),
            maxExposure: Math.round(maxExposure),
            averageExposure: Math.round(averageExposure),
            patterns,
            healthGoals,
            reductionPlan,
            compliance: {
                osha: timeWeightedAverage <= 90,
                niosh: timeWeightedAverage <= 85,
                who: averageExposure <= 55
            },
            alerts: this.generateHealthAlerts(timeWeightedAverage, maxExposure, patterns)
        };
    }
    
    calculatePersonalRisk(twa, maxDb, measurementCount) {
        let riskScore = 0;
        let riskLevel = 'low';
        const factors = [];
        
        // Time-weighted average risk
        if (twa >= 90) {
            riskScore += 40;
            factors.push('High daily noise exposure');
        } else if (twa >= 85) {
            riskScore += 25;
            factors.push('Moderate daily noise exposure');
        }
        
        // Peak exposure risk
        if (maxDb >= 100) {
            riskScore += 30;
            factors.push('Dangerous peak noise levels detected');
        } else if (maxDb >= 85) {
            riskScore += 15;
            factors.push('Elevated peak noise levels');
        }
        
        // Frequency of exposure
        if (measurementCount >= 10) {
            if (twa >= 75) {
                riskScore += 20;
                factors.push('Frequent exposure to elevated noise');
            }
        }
        
        // Determine risk level
        if (riskScore >= 60) riskLevel = 'high';
        else if (riskScore >= 30) riskLevel = 'moderate';
        else if (riskScore >= 15) riskLevel = 'low';
        else riskLevel = 'minimal';
        
        return {
            level: riskLevel,
            score: riskScore,
            factors,
            message: this.getPersonalRiskMessage(riskLevel, riskScore)
        };
    }
    
    getPersonalRiskMessage(level, score) {
        const messages = {
            'minimal': 'Your noise exposure is well within healthy limits. Keep monitoring for awareness.',
            'low': 'Generally safe exposure levels with minor areas for improvement.',
            'moderate': 'Some concern with current exposure levels. Consider noise reduction strategies.',
            'high': 'Significant health risk from noise exposure. Immediate action recommended.'
        };
        return messages[level] || 'Assessment pending';
    }
    
    analyzeExposurePatterns(measurements) {
        const hourlyPattern = {};
        const dailyAverages = {};
        
        measurements.forEach(m => {
            const date = new Date(m.timestamp);
            const hour = date.getHours();
            const day = date.toDateString();
            
            if (!hourlyPattern[hour]) hourlyPattern[hour] = [];
            if (!dailyAverages[day]) dailyAverages[day] = [];
            
            hourlyPattern[hour].push(m.db);
            dailyAverages[day].push(m.db);
        });
        
        // Find peak hours
        const peakHours = Object.entries(hourlyPattern)
            .map(([hour, dbs]) => ({
                hour: parseInt(hour),
                average: dbs.reduce((a, b) => a + b, 0) / dbs.length
            }))
            .sort((a, b) => b.average - a.average)
            .slice(0, 3);
            
        return {
            peakHours,
            consistentExposure: this.isConsistentExposure(dailyAverages),
            trendDirection: this.calculateTrend(measurements)
        };
    }
    
    assessHealthGoals(twa, measurements) {
        const goals = {
            dailyLimit: {
                target: 85,
                current: twa,
                met: twa <= 85,
                progress: Math.max(0, Math.min(100, (85 - twa + 15) / 15 * 100))
            },
            peakReduction: {
                target: 85,
                current: Math.max(...measurements.map(m => m.db)),
                met: Math.max(...measurements.map(m => m.db)) <= 85,
                progress: Math.max(0, Math.min(100, (85 - Math.max(...measurements.map(m => m.db)) + 15) / 15 * 100))
            },
            quietTime: {
                target: 60, // percent of time below 70dB
                current: (measurements.filter(m => m.db <= 70).length / measurements.length) * 100,
                met: (measurements.filter(m => m.db <= 70).length / measurements.length) >= 0.6
            }
        };
        
        return goals;
    }
    
    generateNoiseReductionPlan(measurements, currentDb) {
        const plan = {
            immediate: [],
            shortTerm: [],
            longTerm: [],
            priority: 'low'
        };
        
        const avgDb = measurements.reduce((sum, m) => sum + m.db, 0) / measurements.length;
        
        if (currentDb >= 100 || avgDb >= 85) {
            plan.priority = 'high';
            plan.immediate.push('Use hearing protection rated NRR 25+ dB');
            plan.immediate.push('Limit time in current environment');
            plan.shortTerm.push('Identify and eliminate noise sources');
            plan.longTerm.push('Consider environmental noise control measures');
        } else if (currentDb >= 85 || avgDb >= 75) {
            plan.priority = 'moderate';
            plan.immediate.push('Consider hearing protection for extended exposure');
            plan.shortTerm.push('Take regular quiet breaks');
            plan.longTerm.push('Evaluate workspace acoustics');
        } else {
            plan.priority = 'low';
            plan.longTerm.push('Maintain current low-noise environment');
        }
        
        return plan;
    }
    
    generateHealthAlerts(twa, maxDb, patterns) {
        const alerts = [];
        
        if (twa >= 90) {
            alerts.push({
                type: 'critical',
                message: 'Daily noise exposure exceeds OSHA limits',
                action: 'Reduce exposure time or use hearing protection'
            });
        }
        
        if (maxDb >= 100) {
            alerts.push({
                type: 'warning',
                message: 'Dangerous peak noise levels detected',
                action: 'Avoid or protect against high-intensity noise'
            });
        }
        
        if (patterns.consistentExposure && twa >= 80) {
            alerts.push({
                type: 'info',
                message: 'Consistent elevated exposure detected',
                action: 'Consider environmental noise reduction'
            });
        }
        
        return alerts;
    }
    
    isConsistentExposure(dailyAverages) {
        const averages = Object.values(dailyAverages)
            .map(dbs => dbs.reduce((a, b) => a + b, 0) / dbs.length);
        
        if (averages.length < 3) return false;
        
        const variance = this.calculateVariance(averages);
        return variance < 25; // Low variance indicates consistent exposure
    }
    
    calculateVariance(values) {
        const mean = values.reduce((a, b) => a + b, 0) / values.length;
        const squaredDiffs = values.map(value => Math.pow(value - mean, 2));
        return squaredDiffs.reduce((a, b) => a + b, 0) / values.length;
    }
    
    calculateTrend(measurements) {
        if (measurements.length < 5) return 'insufficient-data';
        
        const recent = measurements.slice(-5).map(m => m.db);
        const earlier = measurements.slice(0, 5).map(m => m.db);
        
        const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
        const earlierAvg = earlier.reduce((a, b) => a + b, 0) / earlier.length;
        
        const change = ((recentAvg - earlierAvg) / earlierAvg) * 100;
        
        if (Math.abs(change) < 5) return 'stable';
        return change > 0 ? 'increasing' : 'decreasing';
    }
    
    /**
     * Assess stress risk from noise levels
     */
    assessStressRisk(dbLevel, duration) {
        const durationHours = duration / 3600;
        
        if (dbLevel >= 75 && durationHours > 2) return 'high';
        if (dbLevel >= 65 && durationHours > 4) return 'moderate';
        if (dbLevel >= 60 && durationHours > 8) return 'low';
        return 'minimal';
    }
    
    /**
     * Assess sleep disruption risk
     */
    assessSleepDisruptionRisk(dbLevel) {
        if (dbLevel >= 45) return 'high';
        if (dbLevel >= 40) return 'moderate';
        if (dbLevel >= 35) return 'low';
        return 'minimal';
    }
    
    /**
     * Get detailed noise source examples for premium users
     */
    getPremiumExamples(dbLevel) {
        const classification = this.classify(dbLevel);
        const examples = {
            'quiet': [
                'Recording studio (20-30 dB)',
                'Soundproof room (25-35 dB)',
                'Library reading room (30-40 dB)',
                'Rural night (25-35 dB)'
            ],
            'moderate': [
                'Quiet office (40-50 dB)',
                'Suburban residential (45-55 dB)',
                'Normal conversation (55-65 dB)',
                'Background music (50-60 dB)'
            ],
            'loud': [
                'City traffic (60-80 dB)',
                'Busy restaurant (65-75 dB)',
                'Vacuum cleaner (70-80 dB)',
                'Lawn mower (75-85 dB)'
            ],
            'dangerous': [
                'Rock concert (90-110 dB)',
                'Construction site (85-95 dB)',
                'Jet engine at takeoff (130-140 dB)',
                'Gunshot (140-175 dB)'
            ]
        };
        
        return examples[classification.range] || examples.moderate;
    }
    
    getAllClassifications() {
        return this.classifications;
    }
    
    getExamplesForRange(range) {
        const classification = this.classifications.find(c => c.range === range);
        return classification ? classification.examples : [];
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NoiseClassifier;
}