// src/shared/utils/ValidationSystem.js

/**
 * ✅ CENTRALIZED VALIDATION SYSTEM - 100% ACCURATE
 * 
 * Based on actual files:
 * - useStepValidation.js (step-by-step wizard validation)
 * - stepCreationUtils.js (validateStepCreationData function)
 * - useStepWizard.js (canProceed function + shouldSkipConfiguration)
 * - PatternCategories.js (shouldSkipConfiguration function)
 * - stepDisplayUtils.js (validatePatternConfiguration boolean + getPatternValidationError)
 * 
 * EXACTLY matches existing validation logic and error messages
 */

// ===== IMPORT PATTERN CATEGORIES LOGIC =====

// Copied from PatternCategories.js - shouldSkipConfiguration function
const shouldSkipConfigurationLogic = (wizardData) => {
    const { category } = wizardData.stitchPattern || {};

    // Quick categories don't need configuration (from PatternCategories.js)
    const PATTERN_CATEGORIES = {
        basic: { type: 'quick' },
        rib: { type: 'quick' },
        textured: { type: 'quick' },
        lace: { type: 'advanced' },
        cable: { type: 'advanced' },
        colorwork: { type: 'advanced' },
        custom: { type: 'advanced' }
    };

    return PATTERN_CATEGORIES[category]?.type === 'quick';
};

// ===== PATTERN VALIDATION RULES =====

/**
 * Validates pattern configuration and returns error message or null
 * EXACTLY matches: getPatternValidationError in stepDisplayUtils.js
 */
const validatePatternForErrors = (stitchPattern) => {
    if (!stitchPattern || !stitchPattern.pattern) {
        return 'No pattern selected';
    }

    const { pattern, entryMode, customText, rowsInPattern, rowInstructions, stitchCount, colorworkType } = stitchPattern;

    if (pattern === 'Cast On' && (!stitchCount || parseInt(stitchCount) <= 0)) {
        return 'Cast On requires a valid stitch count';
    }

    // Advanced Row-by-Row patterns (from stepDisplayUtils.js isAdvancedRowByRowPattern)
    const advancedPatterns = ['Custom pattern', 'Cable Pattern', 'Lace Pattern'];
    if (advancedPatterns.includes(pattern)) {
        if (entryMode === 'row_by_row') {
            if (!rowInstructions || rowInstructions.length === 0) {
                return 'Row-by-row mode requires at least one row instruction';
            }
        } else {
            if (!customText || customText.trim() === '') {
                return 'Description mode requires pattern description';
            }
            if (!rowsInPattern || parseInt(rowsInPattern) <= 0) {
                return 'Description mode requires number of rows in pattern';
            }
        }
    }

    if (pattern === 'Colorwork') {
        if (!colorworkType) return 'Colorwork requires type selection';
        if (!customText || customText.trim() === '') return 'Colorwork requires description';
        if (!rowsInPattern || parseInt(rowsInPattern) <= 0) return 'Colorwork requires rows in pattern';
    }

    if (['Fair Isle', 'Intarsia', 'Stripes'].includes(pattern)) {
        if (!customText || customText.trim() === '') return `${pattern} requires description`;
        if (!rowsInPattern || parseInt(rowsInPattern) <= 0) return `${pattern} requires rows in pattern`;
    }

    if (pattern === 'Other' && (!customText || customText.trim() === '')) {
        return 'Other pattern requires description';
    }

    return null; // No validation errors
};

/**
 * Validates pattern configuration and returns boolean
 * EXACTLY matches: validatePatternConfiguration in stepDisplayUtils.js
 */
const validatePatternForBoolean = (stitchPattern) => {
    if (!stitchPattern || !stitchPattern.pattern) {
        return false;
    }

    const { pattern, entryMode, customText, rowsInPattern, rowInstructions, stitchCount, colorworkType } = stitchPattern;

    // Cast On patterns - need stitch count
    if (pattern === 'Cast On') {
        return stitchCount && parseInt(stitchCount) > 0;
    }

    // Bind Off patterns - always valid (minimal config needed)
    if (pattern === 'Bind Off') {
        return true;
    }

    // Advanced Row-by-Row patterns
    const advancedPatterns = ['Custom pattern', 'Cable Pattern', 'Lace Pattern'];
    if (advancedPatterns.includes(pattern)) {
        if (entryMode === 'row_by_row') {
            // Row-by-row mode: need at least one row instruction
            return rowInstructions && rowInstructions.length > 0;
        } else {
            // Description mode: need customText AND rowsInPattern
            return customText && customText.trim() !== '' &&
                rowsInPattern && parseInt(rowsInPattern) > 0;
        }
    }

    // Colorwork patterns - need type selection, description, and row count
    if (pattern === 'Colorwork') {
        return colorworkType &&
            customText && customText.trim() !== '' &&
            rowsInPattern && parseInt(rowsInPattern) > 0;
    }

    // Traditional complex patterns (Fair Isle, Intarsia, Stripes)
    if (['Fair Isle', 'Intarsia', 'Stripes'].includes(pattern)) {
        return customText && customText.trim() !== '' &&
            rowsInPattern && parseInt(rowsInPattern) > 0;
    }

    // Other pattern - needs description
    if (pattern === 'Other') {
        return customText && customText.trim() !== '';
    }

    // Basic patterns (Stockinette, Garter, etc.) - always valid
    return true;
};

// ===== WIZARD STEP VALIDATION =====

/**
 * Validates wizard step data
 * EXACTLY matches: validateStepData in useStepValidation.js
 */
const validateWizardStepData = (wizardData, step) => {
    const errors = [];

    switch (step) {
        case 1:
            if (!wizardData.stitchPattern.category) {
                errors.push('Please select a stitch pattern category');
            }
            break;

        case 2:
            if (!wizardData.stitchPattern.pattern) {
                errors.push('Please select a specific pattern');
            }

            if (wizardData.stitchPattern.pattern === 'Cast On' && !wizardData.stitchPattern.stitchCount) {
                errors.push('Please enter the number of stitches to cast on');
            }

            if (['Lace Pattern', 'Cable Pattern', 'Fair Isle', 'Intarsia', 'Stripes'].includes(wizardData.stitchPattern.pattern)
                && !wizardData.stitchPattern.rowsInPattern) {
                errors.push('Please enter the number of rows in the pattern');
            }

            if (wizardData.stitchPattern.pattern === 'Custom pattern' && !wizardData.stitchPattern.customText) {
                errors.push('Please describe your custom pattern');
            }
            break;

        case 3:
            if (wizardData.hasShaping) {
                if (!wizardData.shapingConfig.shapingType) {
                    errors.push('Please select increase or decrease');
                }

                if (wizardData.shapingConfig.shapingMode === 'bindoff'
                    && (!wizardData.shapingConfig.bindOffSequence || wizardData.shapingConfig.bindOffSequence.length === 0)) {
                    errors.push('Please enter a bind-off sequence');
                }

                if (wizardData.shapingConfig.shapingMode === 'distribution'
                    && !wizardData.shapingConfig.targetStitches) {
                    errors.push('Please enter target stitch count');
                }
            }
            break;

        case 4:
            if (wizardData.stitchPattern.pattern !== 'Cast On') {
                if (!wizardData.duration.type) {
                    errors.push('Please select a duration type');
                }

                if (wizardData.duration.type && !wizardData.duration.value
                    && wizardData.stitchPattern.pattern !== 'Bind Off') {
                    errors.push('Please enter a duration value');
                }
            }
            break;
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};

// ===== WIZARD NAVIGATION VALIDATION =====

/**
 * Check if wizard can proceed to next step
 * EXACTLY matches: canProceed logic in useStepWizard.js
 */
const canProceedWizardStep = (wizardData, currentStep) => {
    switch (currentStep) {
        case 1: // PatternSelector
            return wizardData.stitchPattern.category && wizardData.stitchPattern.pattern;

        case 2: // PatternConfiguration
            if (shouldSkipConfigurationLogic(wizardData)) {
                return true; // Skip validation for basic patterns
            }

            // Use centralized validation from stepDisplayUtils
            return validatePatternForBoolean(wizardData.stitchPattern);

        case 3: // Duration/Shaping choice
            return true; // Choice steps handle their own advancement

        case 4: // Duration Config
            if (wizardData.stitchPattern.pattern === 'Bind Off') {
                return true;
            }
            const { type, value } = wizardData.duration || {};
            return type && value;

        case 5: // Preview
            return true;

        default:
            return false;
    }
};

// ===== STEP CREATION VALIDATION =====

/**
 * Validates step creation data
 * EXACTLY matches: validateStepCreationData in stepCreationUtils.js
 */
const validateStepCreationData = (stepType, data) => {
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

// ===== PUBLIC API =====

/**
 * Validate pattern configuration and return error message
 * Replaces: getPatternValidationError in stepDisplayUtils.js
 */
export const validatePattern = (stitchPattern) => {
    return validatePatternForErrors(stitchPattern);
};

/**
 * Validate pattern configuration and return boolean
 * Replaces: validatePatternConfiguration in stepDisplayUtils.js
 */
export const isPatternConfigComplete = (stitchPattern) => {
    return validatePatternForBoolean(stitchPattern);
};

/**
 * Check if pattern configuration should be skipped
 * Replaces: shouldSkipConfiguration in PatternCategories.js and useStepWizard.js
 */
export const shouldSkipConfiguration = (wizardData) => {
    return shouldSkipConfigurationLogic(wizardData);
};

/**
 * Validate wizard step data
 * Replaces: validateStepData in useStepValidation.js
 */
export const validateWizardStep = (wizardData, step) => {
    return validateWizardStepData(wizardData, step);
};

/**
 * Check if wizard can proceed to next step
 * Replaces: canProceed logic in useStepWizard.js
 */
export const canProceedWizard = (wizardData, currentStep) => {
    return canProceedWizardStep(wizardData, currentStep);
};

/**
 * Validate step creation data
 * Replaces: validateStepCreationData in stepCreationUtils.js
 */
export const validateStepCreation = (stepType, data) => {
    return validateStepCreationData(stepType, data);
};

// ===== EXPORT DEFAULT FOR EASY IMPORTING =====

export default {
    validatePattern,
    isPatternConfigComplete,
    shouldSkipConfiguration,
    validateWizardStep,
    canProceedWizard,
    validateStepCreation
};