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
                maxDb: 50,
                category: 'Quiet',
                description: 'Library, soft whisper',
                color: '#27ae60',
                examples: ['Library reading room', 'Soft whisper', 'Quiet rural area'],
                healthInfo: 'Comfortable noise level for concentration and rest.'
            },
            {
                range: 'moderate',
                minDb: 50,
                maxDb: 70,
                category: 'Moderate',
                description: 'Normal conversation, office environment',
                color: '#f1c40f',
                examples: ['Office environment', 'Normal conversation', 'Residential area'],
                healthInfo: 'Acceptable for daily activities and work.'
            },
            {
                range: 'loud',
                minDb: 70,
                maxDb: 85,
                category: 'Loud',
                description: 'Heavy traffic, vacuum cleaner',
                color: '#e67e22',
                examples: ['Heavy traffic', 'Vacuum cleaner', 'Busy restaurant'],
                healthInfo: 'May cause fatigue with prolonged exposure.'
            },
            {
                range: 'dangerous',
                minDb: 85,
                maxDb: 120,
                category: 'Dangerous',
                description: 'Risk of hearing damage',
                color: '#e74c3c',
                examples: ['Construction site', 'Rock concert', 'Jet engine'],
                healthInfo: 'Risk of hearing damage. Use ear protection.'
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
        if (dbLevel >= 85) {
            return {
                level: 'warning',
                message: 'Prolonged exposure to sounds above 85 dB may cause hearing damage.',
                recommendation: 'Consider using ear protection or reducing exposure time.'
            };
        } else if (dbLevel >= 70) {
            return {
                level: 'caution',
                message: 'Extended exposure to this noise level may cause fatigue.',
                recommendation: 'Take regular breaks in quieter environments.'
            };
        }
        
        return null;
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