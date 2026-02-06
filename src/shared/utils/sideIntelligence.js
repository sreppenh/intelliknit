// src/shared/utils/sideIntelligence.js

/**
 * Side Intelligence System
 * Comprehensive RS/WS tracking for IntelliKnit patterns
 * 
 * Features:
 * - Automatic side detection based on construction
 * - User override capabilities  
 * - Step chain context tracking
 * - Pattern row adjustment support
 */

/**
 * Core side determination logic
 * @param {string} construction - 'flat' or 'round'
 * @param {number} currentRow - Current row number (1-based)
 * @param {string|null} startingSide - User override: 'RS', 'WS', or null for auto
 * @returns {string} - 'RS' or 'WS'
 */
export const getCurrentSide = (construction, currentRow, startingSide = null) => {
    // Round construction: always RS (no wrong side in circular knitting)
    if (construction === 'round') return 'RS';

    // User override takes precedence for flat construction
    if (startingSide && construction === 'flat') {
        // If user says this step starts on RS, then:
        // Row 1 = RS, Row 2 = WS, Row 3 = RS, etc.
        // If user says this step starts on WS, then:
        // Row 1 = WS, Row 2 = RS, Row 3 = WS, etc.
        return (currentRow % 2 === 1) ? startingSide : (startingSide === 'RS' ? 'WS' : 'RS');
    }

    // Default flat knitting: odd rows = RS, even rows = WS
    return (currentRow % 2 === 1) ? 'RS' : 'WS';
};

/**
 * Calculate what side this step should start on based on step chain
 * @param {object} component - Component containing steps
 * @param {number} stepIndex - Index of current step (0-based)
 * @returns {string} - Expected starting side: 'RS' or 'WS'
 */
export const getStepStartingSide = (component, stepIndex) => {
    // First step of any component always starts RS (knitting convention)
    if (stepIndex === 0) return 'RS';

    const previousStep = component.steps[stepIndex - 1];
    if (!previousStep) return 'RS';

    // ✅ ONLY use actualEndingSide if it was recorded during actual knitting
    if (previousStep.sideTracking?.actualEndingSide) {
        return getNextRowSide(previousStep.sideTracking.actualEndingSide, component.construction || 'flat');
    }

    // ✅ FIX: Always default to RS for new steps
    // User can override if they need WS
    return 'RS';
};

/**
 * Get what side the next row should be on
 * @param {string} currentSide - Current side ('RS' or 'WS')
 * @param {string} construction - 'flat' or 'round'
 * @returns {string} - Next side
 */
export const getNextRowSide = (currentSide, construction) => {
    if (construction === 'round') return 'RS'; // Always RS for round

    // For flat: next row is opposite side
    // If previous step ended on RS, next step starts on WS (and vice versa)
    return currentSide === 'RS' ? 'WS' : 'RS';
};

/**
 * Check if step is an initialization step
 * @param {object} step - Step object
 * @returns {boolean} - Whether step is initialization
 */
export const isInitializationStep = (step) => {
    const pattern = step.wizardConfig?.stitchPattern?.pattern;
    return ['Cast On', 'Pick Up & Knit', 'Continue from Stitches', 'Custom Initialization'].includes(pattern);
};

/**
 * Get expected starting side for different initialization step types
 * @param {object} step - Initialization step
 * @returns {string} - Expected next side ('RS' or 'WS')
 */
export const getInitializationNextSide = (step) => {
    const pattern = step.wizardConfig?.stitchPattern?.pattern;

    switch (pattern) {
        case 'Cast On':
            // After cast-on, first working row is typically RS
            return 'RS';

        case 'Pick Up & Knit':
            // After picking up, usually continue on RS
            return 'RS';

        case 'Continue from Stitches':
            // Depends on context, but typically RS
            return 'RS';

        default:
            return 'RS';
    }
};

/**
 * Get side display text with construction context
 * @param {string} side - 'RS' or 'WS'
 * @param {string} construction - 'flat' or 'round'
 * @returns {string} - Display text like "RS" or "all RS"
 */
export const getSideDisplayText = (side, construction) => {
    if (construction === 'round') {
        return 'all RS'; // Round knitting doesn't have a wrong side
    }
    return side;
};

/**
 * Get display text for row with side information
 * @param {number} currentRow - Current row number
 * @param {number} totalRows - Total rows in step (optional)
 * @param {string} side - 'RS' or 'WS' 
 * @param {string} construction - 'flat' or 'round'
 * @returns {string} - Display text like "Row 3 (RS)" or "Round 5 (all RS)"
 */
export const getRowWithSideDisplay = (currentRow, totalRows, side, construction) => {
    const rowTerm = construction === 'round' ? 'Round' : 'Row';
    const sideDisplay = getSideDisplayText(side, construction);

    if (totalRows && totalRows > 1) {
        return `${rowTerm} ${currentRow} of ${totalRows} (${sideDisplay})`;
    } else {
        return `${rowTerm} ${currentRow} (${sideDisplay})`;
    }
};

/**
 * Check if a step should use side intelligence
 * Manual steps and certain construction steps are excluded
 * @param {object} step - Step object
 * @returns {boolean} - Whether to apply side intelligence
 */
export const shouldUseSideIntelligence = (step) => {
    // Manual row-by-row patterns are not affected by side logic
    if (step.type === 'manual') return false;

    // Check for specific patterns that don't need side tracking
    const pattern = step.wizardConfig?.stitchPattern?.pattern;
    const excludedPatterns = ['Cast On', 'Bind Off', 'Put on Holder'];

    if (excludedPatterns.includes(pattern)) return false;

    return true;
};

/**
 * Initialize side tracking for a step
 * @param {object} component - Component containing the step
 * @param {number} stepIndex - Index of the step (0-based)
 * @param {string|null} userOverride - User-specified starting side ('RS', 'WS', or null)
 * @returns {object} - Side tracking configuration
 */
export const initializeSideTracking = (component, stepIndex, userOverride = null) => {
    const expectedStartingSide = getStepStartingSide(component, stepIndex);

    return {
        startingSide: userOverride || expectedStartingSide,
        userOverride: Boolean(userOverride),
        expectedStartingSide: expectedStartingSide
    };
};

/**
 * Validate side override input
 * @param {string} input - User input ('RS', 'WS', etc.)
 * @returns {string|null} - Normalized side ('RS', 'WS') or null if invalid
 */
export const validateSideInput = (input) => {
    if (typeof input !== 'string') return null;

    const normalized = input.trim().toUpperCase();
    if (normalized === 'RS' || normalized === 'R') return 'RS';
    if (normalized === 'WS' || normalized === 'W') return 'WS';

    return null;
};

/**
 * Calculate pattern row offset for starting mid-pattern
 * @param {number} targetPatternRow - Which pattern row to start on (1-based)
 * @param {string} targetSide - Which side the target row should be ('RS' or 'WS')  
 * @param {string} construction - 'flat' or 'round'
 * @param {number} patternLength - Total rows in pattern repeat
 * @returns {object} - { offset: number, adjustedStartingSide: string }
 */
export const calculatePatternOffset = (targetPatternRow, targetSide, construction, patternLength) => {
    if (construction === 'round') {
        // Round construction: all rows are RS, so just calculate offset
        return {
            offset: targetPatternRow - 1,
            adjustedStartingSide: 'RS'
        };
    }

    // Flat construction: figure out what side the target pattern row naturally is
    const naturalTargetSide = (targetPatternRow % 2 === 1) ? 'RS' : 'WS';

    if (naturalTargetSide === targetSide) {
        // Target side matches natural side, no adjustment needed
        return {
            offset: targetPatternRow - 1,
            adjustedStartingSide: 'RS'
        };
    } else {
        // Target side is opposite of natural side, adjust starting side
        return {
            offset: targetPatternRow - 1,
            adjustedStartingSide: 'WS'
        };
    }
};

/**
 * Get pattern row information for any step with a pattern
 * @param {object} step - Step object with pattern configuration
 * @returns {object|null} - Pattern info or null if no pattern
 */
export const getStepPatternInfo = (step) => {
    const stitchPattern = step.wizardConfig?.stitchPattern || step.advancedWizardConfig?.stitchPattern;

    if (!stitchPattern) return null;

    // Check for explicit pattern length
    const rowsInPattern = parseInt(stitchPattern.rowsInPattern);
    if (rowsInPattern && rowsInPattern > 1) {
        return {
            patternName: stitchPattern.pattern || stitchPattern.category,
            patternLength: rowsInPattern,
            hasRepeat: true
        };
    }

    // Check for common patterns with known repeat lengths
    const patternRepeats = {
        'Stockinette': 2,
        'Garter': 2,
        'Seed': 2,
        'Moss': 2,
        'Ribbing': 2, // Could be 1x1, 2x2, etc., but most are 2-row
        // Add more as needed
    };

    const pattern = stitchPattern.pattern;
    if (pattern && patternRepeats[pattern]) {
        return {
            patternName: pattern,
            patternLength: patternRepeats[pattern],
            hasRepeat: true
        };
    }

    // Single-row or non-repeating patterns
    return {
        patternName: pattern || stitchPattern.category || 'Custom',
        patternLength: 1,
        hasRepeat: false
    };
};

/**
 * Calculate which pattern row a step row corresponds to
 * @param {number} stepRow - Row number within the step (1-based)
 * @param {number} patternOffset - Starting offset (0-based)
 * @param {number} patternLength - Length of pattern repeat
 * @returns {number} - Pattern row number (1-based)
 */
export const getPatternRowNumber = (stepRow, patternOffset, patternLength) => {
    if (patternLength <= 1) return 1;

    const adjustedRow = (stepRow - 1 + patternOffset) % patternLength;
    return adjustedRow + 1;
};

/**
 * Get pattern instruction for a specific row
 * @param {object} step - Step object
 * @param {number} stepRow - Row number within step
 * @param {number} patternOffset - Pattern offset
 * @returns {object} - { patternRow: number, instruction: string }
 */
export const getPatternRowInstruction = (step, stepRow, patternOffset = 0) => {
    const patternInfo = getStepPatternInfo(step);

    if (!patternInfo || !patternInfo.hasRepeat) {
        return {
            patternRow: 1,
            instruction: null // Use default step instruction
        };
    }

    const patternRow = getPatternRowNumber(stepRow, patternOffset, patternInfo.patternLength);
    const construction = step.construction || 'flat';
    const currentSide = getCurrentSide(construction, stepRow, step.sideTracking?.startingSide);

    // Generate pattern-specific instructions based on pattern type and current row
    return {
        patternRow,
        instruction: generatePatternInstruction(patternInfo.patternName, patternRow, currentSide)
    };
};

/**
 * Generate instruction text for common patterns
 * @param {string} patternName - Name of pattern
 * @param {number} patternRow - Row within pattern (1-based)  
 * @param {string} side - 'RS' or 'WS'
 * @returns {string} - Instruction text
 */
export const generatePatternInstruction = (patternName, patternRow, side) => {
    switch (patternName) {
        case 'Stockinette':
            return side === 'RS' ? 'Knit all stitches' : 'Purl all stitches';

        case 'Garter':
            return 'Knit all stitches';

        case 'Seed':
        case 'Moss':
            // Alternating K1, P1 with offset each row
            if (patternRow === 1) return '*K1, P1; repeat from *';
            return '*P1, K1; repeat from *';

        case 'Ribbing':
            return '*K1, P1; repeat from *'; // Could be made more sophisticated

        default:
            return `Work Row ${patternRow} of ${patternName} pattern`;
    }
};

/**
 * Get CSS classes for side display
 * @param {string} side - 'RS' or 'WS'
 * @param {boolean} isOverride - Whether this is a user override
 * @returns {object} - CSS class objects
 */
export const getSideDisplayStyles = (side, isOverride = false) => {
    const baseClasses = 'px-2 py-1 rounded-md text-xs font-medium';

    if (side === 'RS') {
        return {
            container: `${baseClasses} bg-sage-100 text-sage-800 ${isOverride ? 'border border-sage-400' : ''}`,
            icon: '🟢' // Right side indicator
        };
    } else {
        return {
            container: `${baseClasses} bg-wool-100 text-wool-800 ${isOverride ? 'border border-wool-400' : ''}`,
            icon: '🔴' // Wrong side indicator  
        };
    }
};