// src/shared/utils/PatternInstructionResolver.js
/**
 * Pattern Instruction Resolver - Main Integration Point
 * 
 * Bridges between IntelliKnit's existing system and the new algorithmic patterns.
 * Determines how to generate row instructions for any given step.
 */

import {
    getAlgorithmicRowInstruction,
    isAlgorithmicPattern,
    getPatternMetadata
} from './AlgorithmicPatterns';
import {
    getReferencePatternInstruction,
    getReferencePatternMetadata,
    isReferencePattern,
    findReferencePattern,
    LACE_PATTERNS,
    CABLE_PATTERNS,
    COLORWORK_PATTERNS,
    MOSAIC_PATTERNS
} from './ReferencePatterns';
import { getTechniqueGuide } from './TechniqueGuides';
import { getStepPatternName, requiresAdvancedPatternEdit } from './stepDisplayUtils';

/**
 * MAIN RESOLVER FUNCTION
 * This is the primary interface that knitting components should call
 */
export const getCurrentRowInstruction = (step, currentRow, currentStitchCount, startingRowInPattern = 1) => {
    const patternName = getStepPatternName(step);
    const construction = step.construction || 'flat';

    // Route to appropriate instruction generator based on pattern type
    const instruction = resolvePatternInstruction(
        step,
        patternName,
        currentRow,
        currentStitchCount,
        construction,
        startingRowInPattern
    );

    return {
        instruction: instruction,
        patternName: patternName,
        construction: construction,
        currentRow: currentRow,
        stitchCount: currentStitchCount,
        isSupported: instruction !== null
    };
};

/**
 * PATTERN INSTRUCTION ROUTING
 * Determines how to generate instructions based on pattern type and configuration
 */
const resolvePatternInstruction = (step, patternName, currentRow, stitchCount, construction, startingRowInPattern) => {

    // 1. CONSTRUCTION PATTERNS - Handle initialization/completion steps
    if (isConstructionPattern(patternName)) {
        return getConstructionPatternInstruction(step, patternName, currentRow);
    }

    // 2. MANUAL ROW-BY-ROW PATTERNS - Use existing rowInstructions
    if (hasManualRowInstructions(step)) {
        return getManualRowInstruction(step, currentRow, startingRowInPattern);
    }

    // 3. REFERENCE PATTERNS - Use lookup tables (lace, cable, colorwork)
    if (isReferencePattern(patternName)) {
        const patternData = findReferencePattern(patternName);
        return getReferencePatternInstruction(
            patternData.library,
            patternName,
            currentRow,
            stitchCount,
            construction,
            startingRowInPattern
        );
    }

    // 4. ALGORITHMIC PATTERNS - Use calculation engine
    if (isAlgorithmicPattern(patternName)) {
        return getAlgorithmicRowInstruction(
            patternName,
            currentRow,
            stitchCount,
            construction,
            startingRowInPattern
        );
    }

    // 5. FALLBACK - Generic instruction for unsupported patterns
    return getGenericPatternInstruction(patternName, currentRow);
};

/**
 * CONSTRUCTION PATTERN HANDLERS
 * Handle cast-on, bind-off, and other structural steps
 */
const isConstructionPattern = (patternName) => {
    return [
        'Cast On',
        'Bind Off',
        'Pick Up & Knit',
        'Continue from Stitches',
        'Custom Initialization',
        'Put on Holder',
        'Other Ending'
    ].includes(patternName);
};

const getConstructionPatternInstruction = (step, patternName, currentRow) => {
    switch (patternName) {
        case 'Cast On':
            return getCastOnInstruction(step);
        case 'Bind Off':
            return getBindOffInstruction(step);
        case 'Pick Up & Knit':
            return getPickUpKnitInstruction(step);
        case 'Continue from Stitches':
            return getContinueInstruction(step);
        case 'Custom Initialization':
            return getCustomInitializationInstruction(step);
        case 'Put on Holder':
            return getHolderInstruction(step);
        case 'Other Ending':
            return getOtherEndingInstruction(step);
        default:
            return `Complete step: ${patternName}`;
    }
};

const getCastOnInstruction = (step) => {
    const method = step.wizardConfig?.stitchPattern?.method;
    const stitchCount = step.wizardConfig?.stitchPattern?.stitchCount;
    const customText = step.wizardConfig?.stitchPattern?.customText;

    const CAST_ON_METHODS = {
        'long_tail': 'Long Tail Cast On',
        'cable': 'Cable Cast On',
        'knitted': 'Knitted Cast On',
        'backwards_loop': 'Backwards Loop Cast On',
        'provisional': 'Provisional Cast On',
        'judy': 'Judy\'s Magic Cast On',
        'german_twisted': 'German Twisted Cast On'
    };

    if (method === 'other' && customText) {
        return `Cast on ${stitchCount} stitches using ${customText}`;
    }

    const methodName = CAST_ON_METHODS[method] || 'cast on method';
    return `Using ${methodName}, cast on ${stitchCount} stitches`;
};

const getBindOffInstruction = (step) => {
    const method = step.wizardConfig?.stitchPattern?.method;
    const customMethod = step.wizardConfig?.stitchPattern?.customMethod;
    const stitchCount = step.wizardConfig?.stitchPattern?.stitchCount;

    const countText = stitchCount && stitchCount !== 'all' ?
        `${stitchCount} stitches` : 'all stitches';

    const BIND_OFF_METHODS = {
        'standard': 'Standard Bind Off',
        'stretchy': 'Stretchy Bind Off',
        'picot': 'Picot Bind Off',
        'three_needle': 'Three Needle Bind Off',
        'sewn': 'Sewn Bind Off'
    };

    if (method === 'other' && customMethod) {
        return `Bind off ${countText} using ${customMethod}`;
    }

    const methodName = BIND_OFF_METHODS[method] || 'bind off';
    return `Using ${methodName}, bind off ${countText}`;
};

const getPickUpKnitInstruction = (step) => {
    const stitchCount = step.wizardConfig?.stitchPattern?.stitchCount;
    const location = step.wizardConfig?.stitchPattern?.customText;

    if (location) {
        return `Pick up and knit ${stitchCount} stitches from ${location}`;
    }
    return `Pick up and knit ${stitchCount} stitches`;
};

const getContinueInstruction = (step) => {
    const stitchCount = step.wizardConfig?.stitchPattern?.stitchCount;
    return `Continue knitting with ${stitchCount} stitches`;
};

const getCustomInitializationInstruction = (step) => {
    const customText = step.wizardConfig?.stitchPattern?.customText;
    if (customText) {
        return customText;
    }
    return 'Complete custom setup';
};

const getHolderInstruction = (step) => {
    const stitchCount = step.wizardConfig?.stitchPattern?.stitchCount;
    const countText = stitchCount && stitchCount !== 'all' ?
        `${stitchCount} stitches` : 'all stitches';
    return `Put ${countText} on stitch holder`;
};

const getOtherEndingInstruction = (step) => {
    const customText = step.wizardConfig?.stitchPattern?.customText;
    if (customText) {
        return customText;
    }
    return 'Complete custom ending method';
};

/**
 * MANUAL ROW-BY-ROW INSTRUCTION HANDLERS
 * Handle patterns where user has entered specific row instructions
 */
const hasManualRowInstructions = (step) => {
    // Check if this step has user-entered row instructions
    const stitchPattern = step.wizardConfig?.stitchPattern || step.advancedWizardConfig?.stitchPattern;

    if (!stitchPattern) return false;

    // Advanced patterns in row-by-row mode
    if (requiresAdvancedPatternEdit({ wizardConfig: { stitchPattern } })) {
        return stitchPattern.entryMode === 'row_by_row' &&
            stitchPattern.rowInstructions &&
            stitchPattern.rowInstructions.length > 0;
    }

    return false;
};

const getManualRowInstruction = (step, currentRow, startingRowInPattern) => {
    const stitchPattern = step.wizardConfig?.stitchPattern || step.advancedWizardConfig?.stitchPattern;
    const rowInstructions = stitchPattern.rowInstructions;

    if (!rowInstructions || rowInstructions.length === 0) {
        return null;
    }

    // Calculate which row instruction to use based on pattern repeat
    const patternLength = rowInstructions.length;
    const adjustedRow = ((currentRow - 1 + startingRowInPattern - 1) % patternLength);
    const instructionIndex = adjustedRow;

    if (instructionIndex >= 0 && instructionIndex < rowInstructions.length) {
        return formatManualInstruction(rowInstructions[instructionIndex]);
    }

    return rowInstructions[0]; // Fallback to first instruction
};

const formatManualInstruction = (instruction) => {
    // Format manual instructions for better readability in knit mode
    if (!instruction || typeof instruction !== 'string') return instruction;

    let formatted = instruction.trim();

    // Expand common abbreviations for clarity
    const abbreviations = {
        'K to end': 'Knit to end',
        'P to end': 'Purl to end',
        'K/P as set': 'Knit the knits, Purl the purls',
        'YO': 'Yarn over',
        'K2tog': 'Knit 2 together',
        'SSK': 'Slip, slip, knit',
        'CDD': 'Central double decrease'
    };

    // Replace exact matches first
    if (abbreviations[formatted]) {
        return abbreviations[formatted];
    }

    // Replace partial matches
    Object.entries(abbreviations).forEach(([abbrev, expansion]) => {
        const regex = new RegExp(`\\b${abbrev.replace(/[.*+?^${}()|[\]\\]/g, '\\const getO')}\\b`, 'g');
        formatted = formatted.replace(regex, expansion);
    });

    return formatted;
};

/**
 * GENERIC PATTERN FALLBACK
 * For patterns we don't yet support with specific instructions
 */
const getGenericPatternInstruction = (patternName, currentRow) => {
    // Provide helpful fallback for unsupported patterns
    const supportedPatterns = [
        'Stockinette', 'Garter', 'Reverse Stockinette', 'Seed Stitch',
        'Moss Stitch', 'Double Seed', 'Basketweave', '1x1 Rib', '2x2 Rib',
        '3x3 Rib', '2x1 Rib', '1x1 Twisted Rib', '2x2 Twisted Rib',
        'Linen Stitch', 'Rice Stitch', 'Trinity Stitch', 'Broken Rib'
    ];

    if (supportedPatterns.includes(patternName)) {
        // This shouldn't happen, but just in case
        return `Work row ${currentRow} of ${patternName} pattern (calculation error)`;
    }

    // For truly unsupported patterns
    return `Work row ${currentRow} of ${patternName} pattern`;
};

/**
 * PATTERN METADATA AND VALIDATION
 */
export const getPatternSupport = (step) => {
    const patternName = getStepPatternName(step);

    return {
        patternName: patternName,
        isConstructionPattern: isConstructionPattern(patternName),
        hasManualInstructions: hasManualRowInstructions(step),
        isAlgorithmic: isAlgorithmicPattern(patternName),
        isFullySupported: isConstructionPattern(patternName) ||
            hasManualRowInstructions(step) ||
            isAlgorithmicPattern(patternName)
    };
};

export const getPatternInfo = (patternName) => {
    // Try reference patterns first
    const referencePattern = findReferencePattern(patternName);
    if (referencePattern) {
        return getReferencePatternMetadata(referencePattern.library, patternName);
    }

    // Try algorithmic patterns
    const algorithmicMetadata = getPatternMetadata(patternName);
    if (algorithmicMetadata) {
        return algorithmicMetadata;
    }

    // Fallback metadata for construction patterns
    if (isConstructionPattern(patternName)) {
        return {
            rowHeight: 1,
            stitchMultiple: 1,
            description: `${patternName} step`,
            hasAlgorithmicSupport: false,
            isConstructionStep: true
        };
    }

    // Unknown pattern
    return {
        rowHeight: 1,
        stitchMultiple: 1,
        description: `${patternName} (instructions not yet available)`,
        hasAlgorithmicSupport: false,
        isUnsupported: true
    };
};

/**
 * STEP VALIDATION
 * Check if a step has all the information needed for row instructions
 */
export const validateStepForKnitting = (step, currentStitchCount) => {
    const support = getPatternSupport(step);
    const patternName = support.patternName;
    const errors = [];
    const warnings = [];

    // Basic validation
    if (!patternName) {
        errors.push('Step has no pattern defined');
    }

    if (!step.construction) {
        warnings.push('Construction type (flat/round) not specified, assuming flat');
    }

    if (!currentStitchCount || currentStitchCount <= 0) {
        errors.push('Invalid stitch count');
    }

    // Pattern-specific validation
    if (support.isAlgorithmic) {
        const metadata = getPatternMetadata(patternName);
        if (metadata && metadata.stitchMultiple > 1) {
            if (currentStitchCount % metadata.stitchMultiple !== 0) {
                warnings.push(`${patternName} works best with multiples of ${metadata.stitchMultiple} stitches`);
            }
        }
    }

    // Manual instruction validation
    if (support.hasManualInstructions) {
        const stitchPattern = step.wizardConfig?.stitchPattern || step.advancedWizardConfig?.stitchPattern;
        if (!stitchPattern.rowInstructions || stitchPattern.rowInstructions.length === 0) {
            errors.push('Manual instructions are empty');
        }
    }

    return {
        isValid: errors.length === 0,
        errors: errors,
        warnings: warnings,
        support: support
    };
};

/**
 * CONVENIENCE FUNCTION FOR KNITTING COMPONENTS
 * One-stop function to get current row instruction with validation
 */
export const getKnittingInstruction = (step, currentRow, currentStitchCount, startingRowInPattern = 1) => {
    // Validate step first
    const validation = validateStepForKnitting(step, currentStitchCount);

    if (!validation.isValid) {
        return {
            instruction: 'Unable to generate instruction - see errors',
            errors: validation.errors,
            warnings: validation.warnings,
            isValid: false
        };
    }

    // Get the instruction
    const result = getCurrentRowInstruction(step, currentRow, currentStitchCount, startingRowInPattern);

    return {
        instruction: result.instruction,
        patternName: result.patternName,
        construction: result.construction,
        currentRow: result.currentRow,
        stitchCount: result.stitchCount,
        isSupported: result.isSupported,
        errors: validation.errors,
        warnings: validation.warnings,
        isValid: true,
        support: validation.support
    };
};

/**
 * TESTING AND DEBUGGING UTILITIES
 */
/**
 * TECHNIQUE GUIDE INTEGRATION
 * Get detailed guides for cast-on, bind-off, and other techniques
 */
export const getTechniqueInstructions = (step) => {
    const patternName = getStepPatternName(step);

    // Cast-on techniques
    if (patternName === 'Cast On') {
        const method = step.wizardConfig?.stitchPattern?.method;
        if (method && method !== 'other') {
            return getTechniqueGuide(method, 'cast_on');
        }
    }

    // Bind-off techniques
    if (patternName === 'Bind Off') {
        const method = step.wizardConfig?.stitchPattern?.method;
        if (method && method !== 'other') {
            return getTechniqueGuide(method, 'bind_off');
        }
    }

    // Finishing techniques (can be expanded)
    if (patternName === 'Other Ending') {
        const customText = step.wizardConfig?.stitchPattern?.customText;
        if (customText) {
            // Try to match common technique names in custom text
            const lowerCustom = customText.toLowerCase();
            if (lowerCustom.includes('kitchener') || lowerCustom.includes('graft')) {
                return getTechniqueGuide('kitchener_stitch', 'finishing');
            }
            if (lowerCustom.includes('mattress')) {
                return getTechniqueGuide('mattress_stitch', 'finishing');
            }
            if (lowerCustom.includes('backstitch')) {
                return getTechniqueGuide('backstitch', 'finishing');
            }
        }
    }

    return null;
};

/**
 * TESTING AND DEBUGGING UTILITIES
 */
export const testPatternGeneration = (patternName, stitchCount, construction = 'flat', rows = 10) => {
    console.log(`Testing pattern: ${patternName}`);
    console.log(`Stitches: ${stitchCount}, Construction: ${construction}`);
    console.log('---');

    for (let row = 1; row <= rows; row++) {
        const instruction = getAlgorithmicRowInstruction(patternName, row, stitchCount, construction);
        console.log(`Row ${row}: ${instruction}`);
    }
};

export default {
    getCurrentRowInstruction,
    getKnittingInstruction,
    getTechniqueInstructions,
    getPatternSupport,
    getPatternInfo,
    validateStepForKnitting,
    testPatternGeneration
};

