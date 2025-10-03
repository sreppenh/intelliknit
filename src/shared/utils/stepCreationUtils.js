import IntelliKnitLogger from "./ConsoleLogging";
import { getCastOnDisplayName } from './constants';

// src/shared/utils/stepCreationUtils.js

/**
 * Step Creation Utilities - Structured Data Generation
 * 
 * Companion to stepDisplayUtils.js for creating properly structured steps.
 * Single source of truth for step creation across the application.
 */

// ===== CORE CREATION FUNCTIONS =====

/**
 * Create ending step from ComponentEndingWizard data
 * Handles: put_on_holder, bind_off_all, attach_to_piece, other
 */
export const createEndingStep = (endingData, currentStitches) => {
    // Generate description based on ending type
    const generateDescription = () => {
        switch (endingData.type) {
            case 'put_on_holder':
                return `Put ${currentStitches} stitches on hold`;

            case 'bind_off_all':
                if (endingData.method === 'three_needle' && endingData.targetComponent) {
                    const target = endingData.targetComponent === 'Other...' ? endingData.customText : endingData.targetComponent;
                    return `Join to ${target} using three-needle bind off`;
                } else if (endingData.method === 'other' && endingData.customMethod) {
                    return `Bind off all stitches using ${endingData.customMethod}`;
                } else if (endingData.method && endingData.method !== 'standard') {
                    return `Bind off all stitches using ${endingData.method} bind off`;
                }
                return `Bind off all stitches`;

            case 'other':
                return endingData.customText || 'Complete component with custom ending';

            default:
                return 'Complete component';
        }
    };

    // Base step structure
    const baseStep = {
        description: generateDescription(),
        type: endingData.type,
        construction: 'flat',
        startingStitches: currentStitches,
        totalRows: 1,
        prepNote: endingData.prepNote || '',
        colorwork: endingData.colorYarnId ? {
            type: 'single',
            yarnId: endingData.colorYarnId
        } : null
    };

    switch (endingData.type) {
        case 'put_on_holder':
            return {
                ...baseStep,
                endingStitches: currentStitches,
                wizardConfig: {
                    stitchPattern: {
                        pattern: 'Put on Holder',
                        stitchCount: endingData.stitchCount || currentStitches,
                        customText: endingData.customText
                    },
                    prepNote: endingData.prepNote || '',
                    afterNote: endingData.afterNote || ''
                }
            };

        case 'bind_off_all':
            return {
                ...baseStep,
                endingStitches: 0,
                wizardConfig: {
                    stitchPattern: {
                        pattern: 'Bind Off',
                        method: endingData.method || 'standard',
                        stitchCount: endingData.stitchCount || currentStitches,
                        targetComponent: endingData.targetComponent,
                        customText: endingData.customText,
                        customMethod: endingData.customMethod
                    },
                    prepNote: endingData.prepNote || '',
                    afterNote: endingData.afterNote || ''
                }
            };

        case 'other':
            return {
                ...baseStep,
                endingStitches: endingData.stitchCount || 0,
                wizardConfig: {
                    stitchPattern: {
                        pattern: 'Other Ending',
                        customText: endingData.customText
                    },
                    prepNote: endingData.prepNote || '',
                    afterNote: endingData.afterNote || ''
                }
            };

        default:
            return {
                ...baseStep,
                endingStitches: 0,
                wizardConfig: {
                    stitchPattern: {
                        pattern: 'Bind Off',
                        method: 'standard'
                    },
                    prepNote: endingData.prepNote || '',
                    afterNote: endingData.afterNote || ''
                }
            };
    }
};
/**
 * Create cast on step from wizard data
 * Used by: StepWizard, ComponentCreationWizard
 * ✅ MIGRATED: Now uses constants.js
 */
export const createCastOnStep = (castOnData) => {
    const methodDisplay = getCastOnDisplayName(castOnData.method);
    const stitchCount = parseInt(castOnData.stitchCount) || 0;

    return {
        description: `Cast on ${stitchCount} stitches using ${methodDisplay}`,
        type: 'calculated',
        construction: castOnData.construction || 'flat',
        startingStitches: 0,
        endingStitches: stitchCount,
        totalRows: 1,
        wizardConfig: {
            stitchPattern: {
                category: 'construction',
                pattern: 'Cast On',
                method: castOnData.method,
                stitchCount: castOnData.stitchCount
            },
            prepNote: castOnData.prepNote || ''
        }
    };
};

/**
 * Create basic pattern step from wizard data
 * Used by: StepWizard for texture/colorwork/structure patterns
 */
export const createPatternStep = (patternData, context = {}) => {
    const {
        startingStitches = 0,
        construction = 'flat'
    } = context;

    return {
        description: generatePatternDescription(patternData),
        type: 'calculated',
        construction,
        startingStitches,
        endingStitches: startingStitches, // No stitch change for basic patterns
        totalRows: calculateTotalRows(patternData),
        wizardConfig: {
            stitchPattern: {
                category: getPatternCategory(patternData.pattern),
                pattern: patternData.pattern,
                customText: patternData.customText,
                rowsInPattern: patternData.rowsInPattern
            },
            duration: patternData.duration,
            prepNote: patternData.prepNote || ''
        }
    };
};

/**
 * Create shaping step from wizard data
 * Used by: StepWizard with shaping configuration
 */
export const createShapingStep = (shapingData, patternData, context = {}) => {
    const {
        startingStitches = 0,
        construction = 'flat'
    } = context;

    const baseStep = createPatternStep(patternData, context);

    return {
        ...baseStep,
        description: generateShapingDescription(shapingData, patternData),
        endingStitches: calculateEndingStitches(startingStitches, shapingData),
        wizardConfig: {
            ...baseStep.wizardConfig,
            hasShaping: true,
            shapingConfig: {
                type: shapingData.type,
                config: shapingData.config
            }
        }
    };
};

// ===== HELPER FUNCTIONS =====

/**
 * Generate human-readable description for pattern steps
 */
const generatePatternDescription = (patternData) => {
    let description = `Work in ${patternData.pattern}`;

    if (patternData.duration?.type === 'rows' && patternData.duration?.value) {
        description += ` for ${patternData.duration.value} rows`;
    } else if (patternData.duration?.type === 'repeats' && patternData.duration?.value) {
        description += ` for ${patternData.duration.value} repeats`;
    } else if (patternData.duration?.type === 'length') {
        description += ` for ${patternData.duration.value} ${patternData.duration.units}`;
    }

    return description;
};

/**
 * Generate human-readable description for shaping steps
 */
const generateShapingDescription = (shapingData, patternData) => {
    let description = generatePatternDescription(patternData);

    if (shapingData.type === 'even_distribution') {
        const action = shapingData.config?.action === 'increase' ? 'increasing' : 'decreasing';
        const amount = shapingData.config?.amount;
        if (amount) {
            description += `, ${action} ${amount} stitches evenly`;
        }
    } else if (shapingData.type === 'phases') {
        const phases = shapingData.config?.phases?.length || 0;
        description += ` with ${phases} shaping phases`;
    }

    return description;
};

/**
 * Calculate total rows for pattern step
 */
const calculateTotalRows = (patternData) => {
    const duration = patternData.duration;

    if (!duration) return 1;

    switch (duration.type) {
        case 'rows':
        case 'rounds':
            return parseInt(duration.value) || 1;

        case 'repeats':
            const repeats = parseInt(duration.value) || 1;
            const rowsInPattern = parseInt(patternData.rowsInPattern) || 1;
            return repeats * rowsInPattern;

        // ✅ NEW: Handle color repeats
        case 'color_repeats':
            const colorRepeats = parseInt(duration.value) || 1;
            // Need to get colorwork from patternData
            if (patternData.colorwork?.stripeSequence) {
                const totalRowsInSequence = patternData.colorwork.stripeSequence.reduce(
                    (sum, stripe) => sum + (stripe.rows || 0),
                    0
                );
                return colorRepeats * totalRowsInSequence;
            }
            return 1;


        default:
            return 1;
    }
};

/**
 * Calculate ending stitches for shaping steps
 */
const calculateEndingStitches = (startingStitches, shapingData) => {
    if (shapingData.type === 'even_distribution') {
        const amount = shapingData.config?.amount || 0;
        const action = shapingData.config?.action;

        if (action === 'increase') {
            return startingStitches + amount;
        } else if (action === 'decrease') {
            return startingStitches - amount;
        }
    } else if (shapingData.type === 'phases') {
        // For sequential phases, use the final stitch count from calculation
        return shapingData.config?.calculation?.endingStitches || startingStitches;
    }

    return startingStitches; // No change for unknown shaping types
};

/**
 * Get pattern category for step classification
 */
const getPatternCategory = (pattern) => {
    const categories = {
        'construction': ['Cast On', 'Bind Off', 'Put on Holder', 'Other Ending'],
        'texture': ['Stockinette', 'Garter', 'Reverse Stockinette', '1x1 Rib', '2x2 Rib', 'Seed Stitch', 'Moss Stitch'],
        'colorwork': ['Stranded Colorwork', 'Intarsia', 'Fair Isle', 'Mosaic'],
        'structure': ['Lace', 'Cable', 'Brioche']
    };

    for (const [category, patterns] of Object.entries(categories)) {
        if (patterns.includes(pattern)) {
            return category;
        }
    }

    return 'texture'; // Default category
};

/**
 * Validate step creation data
 * Returns { isValid: boolean, errors: string[] }
 */
export const validateStepCreationData = (stepType, data) => {
    const errors = [];

    switch (stepType) {
        case 'ending':
            if (!data.type) errors.push('Ending type is required');
            if (data.type === 'attach_to_piece' && !data.targetComponent) {
                errors.push('Target component is required for attachment');
            }
            if (data.type === 'other' && !data.customText) {
                errors.push('Custom description is required for other endings');
            }
            break;

        case 'cast_on':
            if (!data.stitchCount || parseInt(data.stitchCount) <= 0) {
                errors.push('Valid stitch count is required');
            }
            if (!data.method) errors.push('Cast on method is required');
            break;

        case 'pattern':
            if (!data.pattern) errors.push('Pattern type is required');
            if (!data.duration?.type) errors.push('Duration type is required');
            break;

        default:
            errors.push('Unknown step type');
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};

/**
 * MIGRATION HELPER: Convert legacy shaping to new format
 * Call this before processing any shaping config
 */
export const migrateLegacyShaping = (shapingConfig) => {
    if (!shapingConfig) return null;

    // Already new format
    if (shapingConfig.type) return shapingConfig;

    // Has legacy fields but no type - needs migration
    if (shapingConfig.shapingMode || shapingConfig.shapingType) {
        IntelliKnitLogger.warn('🔄 Migrating legacy shaping data', shapingConfig);

        // Convert distribution mode to even_distribution
        if (shapingConfig.shapingMode === 'distribution') {
            return {
                type: 'even_distribution',
                config: {
                    action: shapingConfig.shapingType || 'decrease',
                    amount: shapingConfig.targetChange || 1,
                    calculation: {
                        instruction: `${shapingConfig.shapingType || 'decrease'} evenly`,
                        startingStitches: shapingConfig.currentStitches || 0,
                        endingStitches: (shapingConfig.currentStitches || 0) + (shapingConfig.targetChange || 0),
                        changeCount: Math.abs(shapingConfig.targetChange || 0)
                    }
                }
            };
        }

        // Other legacy types can be converted here as needed
        IntelliKnitLogger.warn('🚨 Unknown legacy shaping type - keeping as-is', shapingConfig);
    }

    return shapingConfig;
};

// ===== EXPORTS =====

export default {
    createEndingStep,
    createCastOnStep,
    createPatternStep,
    createShapingStep,
    validateStepCreationData
};