// src/shared/utils/KnittingInstructionService.js
/**
 * Knitting Instruction Service - Standalone Pattern Resolution
 * 
 * Clean, self-contained service that provides row-by-row knitting instructions
 * without dependencies on existing IntelliKnit calculation systems.
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
    findReferencePattern
} from './ReferencePatterns';
import { getTechniqueGuide } from './TechniqueGuides';

/**
 * MAIN SERVICE FUNCTION
 * Get row instruction for any step - this is your primary interface
 */
export const getRowInstruction = (step, currentRow, stitchCount, startingRowInPattern = 1) => {
    const patternName = step.wizardConfig?.stitchPattern?.pattern;
    const construction = step.construction || 'flat';

    if (!patternName) {
        return {
            instruction: 'Pattern not defined',
            isSupported: false,
            error: 'No pattern name found'
        };
    }

    try {
        const instruction = resolveInstruction(patternName, step, currentRow, stitchCount, construction, startingRowInPattern);

        return {
            instruction: instruction,
            patternName: patternName,
            currentRow: currentRow,
            stitchCount: stitchCount,
            construction: construction,
            isSupported: instruction !== null,
            startingRowInPattern: startingRowInPattern
        };
    } catch (error) {
        console.error('Error generating knitting instruction:', error);
        return {
            instruction: `Work row ${currentRow} of ${patternName}`,
            isSupported: false,
            error: error.message,
            patternName: patternName
        };
    }
};

/**
 * INSTRUCTION RESOLUTION LOGIC
 * Routes pattern types to appropriate generators
 */
const resolveInstruction = (patternName, step, currentRow, stitchCount, construction, startingRowInPattern) => {

    // 1. Construction patterns (cast on, bind off, etc.)
    if (isConstructionPattern(patternName)) {
        return getConstructionInstruction(step, patternName);
    }

    // 2. Manual row-by-row patterns (user-entered instructions)
    if (hasManualRowInstructions(step)) {
        return getManualInstruction(step, currentRow, startingRowInPattern);
    }

    // 3. Reference patterns (lace, cables, colorwork)
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

    // 4. Algorithmic patterns (calculated patterns)
    if (isAlgorithmicPattern(patternName)) {
        return getAlgorithmicRowInstruction(
            patternName,
            currentRow,
            stitchCount,
            construction,
            startingRowInPattern
        );
    }

    // 5. Fallback for unsupported patterns
    return `Work row ${currentRow} of ${patternName} pattern`;
};

/**
 * CONSTRUCTION PATTERN HANDLERS
 * Handle initialization and completion steps
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

const getConstructionInstruction = (step, patternName) => {
    switch (patternName) {
        case 'Cast On':
            return getCastOnInstruction(step);
        case 'Bind Off':
            return getBindOffInstruction(step);
        case 'Pick Up & Knit':
            return getPickUpInstruction(step);
        case 'Continue from Stitches':
            return 'Continue knitting with existing stitches';
        case 'Custom Initialization':
            return step.wizardConfig?.stitchPattern?.customText || 'Complete custom setup';
        case 'Put on Holder':
            return getPutOnHolderInstruction(step);
        case 'Other Ending':
            return step.wizardConfig?.stitchPattern?.customText || 'Complete custom ending';
        default:
            return `Complete ${patternName} step`;
    }
};

const getCastOnInstruction = (step) => {
    const method = step.wizardConfig?.stitchPattern?.method;
    const stitchCount = step.wizardConfig?.stitchPattern?.stitchCount;
    const customText = step.wizardConfig?.stitchPattern?.customText;

    if (method === 'other' && customText) {
        return `Cast on ${stitchCount} stitches using ${customText}`;
    }

    const methodNames = {
        'long_tail': 'long tail cast on',
        'cable': 'cable cast on',
        'knitted': 'knitted cast on',
        'backwards_loop': 'backwards loop cast on',
        'provisional': 'provisional cast on',
        'judy': 'Judy\'s magic cast on',
        'german_twisted': 'German twisted cast on'
    };

    const methodName = methodNames[method] || 'cast on';
    return `Cast on ${stitchCount} stitches using ${methodName}`;
};

const getBindOffInstruction = (step) => {
    const method = step.wizardConfig?.stitchPattern?.method;
    const stitchCount = step.wizardConfig?.stitchPattern?.stitchCount;
    const customMethod = step.wizardConfig?.stitchPattern?.customMethod;

    const countText = stitchCount && stitchCount !== 'all' ?
        `${stitchCount} stitches` : 'all stitches';

    if (method === 'other' && customMethod) {
        return `Bind off ${countText} using ${customMethod}`;
    }

    const methodNames = {
        'standard': 'standard bind off',
        'stretchy': 'stretchy bind off',
        'picot': 'picot bind off',
        'three_needle': 'three needle bind off',
        'sewn': 'sewn bind off'
    };

    const methodName = methodNames[method] || 'bind off';
    return `Bind off ${countText} using ${methodName}`;
};

const getPickUpInstruction = (step) => {
    const stitchCount = step.wizardConfig?.stitchPattern?.stitchCount;
    const location = step.wizardConfig?.stitchPattern?.customText;

    if (location) {
        return `Pick up and knit ${stitchCount} stitches from ${location}`;
    }
    return `Pick up and knit ${stitchCount} stitches`;
};

const getPutOnHolderInstruction = (step) => {
    const stitchCount = step.wizardConfig?.stitchPattern?.stitchCount;
    const countText = stitchCount && stitchCount !== 'all' ?
        `${stitchCount} stitches` : 'all stitches';
    return `Put ${countText} on stitch holder`;
};

/**
 * MANUAL INSTRUCTION HANDLERS
 * Handle user-entered row-by-row patterns
 */
const hasManualRowInstructions = (step) => {
    const stitchPattern = step.wizardConfig?.stitchPattern || step.advancedWizardConfig?.stitchPattern;

    if (!stitchPattern) return false;

    // Check for advanced patterns in row-by-row mode
    const advancedPatterns = ['Lace Pattern', 'Cable Pattern', 'Custom pattern', 'Custom Texture'];
    const isAdvancedPattern = advancedPatterns.includes(stitchPattern.pattern);

    if (isAdvancedPattern && stitchPattern.entryMode === 'row_by_row') {
        return stitchPattern.rowInstructions && stitchPattern.rowInstructions.length > 0;
    }

    return false;
};

const getManualInstruction = (step, currentRow, startingRowInPattern) => {
    const stitchPattern = step.wizardConfig?.stitchPattern || step.advancedWizardConfig?.stitchPattern;
    const rowInstructions = stitchPattern.rowInstructions;

    if (!rowInstructions || rowInstructions.length === 0) {
        return null;
    }

    // Calculate which instruction to use based on pattern repeat
    const patternLength = rowInstructions.length;
    const adjustedRow = ((currentRow - 1 + startingRowInPattern - 1) % patternLength);

    if (adjustedRow >= 0 && adjustedRow < rowInstructions.length) {
        return formatManualInstruction(rowInstructions[adjustedRow]);
    }

    return rowInstructions[0];
};

const formatManualInstruction = (instruction) => {
    if (!instruction || typeof instruction !== 'string') return instruction;

    let formatted = instruction.trim();

    // Expand abbreviations for clarity
    const expansions = {
        'K to end': 'Knit to end',
        'P to end': 'Purl to end',
        'K/P as set': 'Knit the knits, Purl the purls',
        'YO': 'Yarn over',
        'K2tog': 'Knit 2 together',
        'SSK': 'Slip, slip, knit'
    };

    // Replace exact matches
    if (expansions[formatted]) {
        return expansions[formatted];
    }

    // Replace partial matches
    Object.entries(expansions).forEach(([abbrev, expansion]) => {
        const regex = new RegExp(`\\b${abbrev.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'g');
        formatted = formatted.replace(regex, expansion);
    });

    return formatted;
};

/**
 * TECHNIQUE GUIDE INTEGRATION
 * Get detailed step-by-step guides for techniques
 */
export const getStepTechniqueGuide = (step) => {
    const patternName = step.wizardConfig?.stitchPattern?.pattern;

    if (patternName === 'Cast On') {
        const method = step.wizardConfig?.stitchPattern?.method;
        if (method && method !== 'other') {
            return getTechniqueGuide(method, 'cast_on');
        }
    }

    if (patternName === 'Bind Off') {
        const method = step.wizardConfig?.stitchPattern?.method;
        if (method && method !== 'other') {
            return getTechniqueGuide(method, 'bind_off');
        }
    }

    return null;
};

/**
 * PATTERN INFORMATION AND VALIDATION
 * Get metadata about patterns and validate steps
 */
export const getPatternInfo = (step) => {
    const patternName = step.wizardConfig?.stitchPattern?.pattern;

    if (!patternName) return null;

    // Try reference patterns first
    if (isReferencePattern(patternName)) {
        const patternData = findReferencePattern(patternName);
        return getReferencePatternMetadata(patternData.library, patternName);
    }

    // Try algorithmic patterns
    if (isAlgorithmicPattern(patternName)) {
        return getPatternMetadata(patternName);
    }

    // Construction patterns
    if (isConstructionPattern(patternName)) {
        return {
            description: `${patternName} step`,
            isConstructionStep: true
        };
    }

    return {
        description: `${patternName} (instructions not yet available)`,
        isUnsupported: true
    };
};

export const validateStep = (step, stitchCount) => {
    const patternName = step.wizardConfig?.stitchPattern?.pattern;
    const errors = [];
    const warnings = [];

    if (!patternName) {
        errors.push('No pattern defined');
    }

    if (!stitchCount || stitchCount <= 0) {
        errors.push('Invalid stitch count');
    }

    // Pattern-specific validation
    if (isAlgorithmicPattern(patternName)) {
        const metadata = getPatternMetadata(patternName);
        if (metadata?.stitchMultiple > 1 && stitchCount % metadata.stitchMultiple !== 0) {
            warnings.push(`${patternName} works best with multiples of ${metadata.stitchMultiple} stitches`);
        }
    }

    return {
        isValid: errors.length === 0,
        errors: errors,
        warnings: warnings
    };
};

/**
 * PATTERN SUPPORT STATUS
 * Check what level of support exists for a pattern
 */
export const getPatternSupport = (step) => {
    const patternName = step.wizardConfig?.stitchPattern?.pattern;

    return {
        patternName: patternName,
        isConstructionPattern: isConstructionPattern(patternName),
        hasManualInstructions: hasManualRowInstructions(step),
        isReferencePattern: isReferencePattern(patternName),
        isAlgorithmic: isAlgorithmicPattern(patternName),
        isFullySupported: isConstructionPattern(patternName) ||
            hasManualRowInstructions(step) ||
            isReferencePattern(patternName) ||
            isAlgorithmicPattern(patternName)
    };
};

/**
 * TESTING UTILITIES
 */
export const testPattern = (patternName, stitchCount, construction = 'flat', rows = 6) => {
    console.log(`Testing ${patternName}: ${stitchCount} stitches, ${construction}`);
    console.log('---');

    for (let row = 1; row <= rows; row++) {
        let instruction;
        if (isAlgorithmicPattern(patternName)) {
            instruction = getAlgorithmicRowInstruction(patternName, row, stitchCount, construction);
        } else {
            instruction = `${patternName} not in algorithmic patterns`;
        }
        console.log(`Row ${row}: ${instruction}`);
    }
};

/**
 * CONVENIENCE FUNCTION
 * Get instruction with full context and validation
 */
export const getCompleteInstruction = (step, currentRow, stitchCount, startingRowInPattern = 1) => {
    const instruction = getRowInstruction(step, currentRow, stitchCount, startingRowInPattern);
    const validation = validateStep(step, stitchCount);
    const support = getPatternSupport(step);
    const techniqueGuide = getStepTechniqueGuide(step);

    return {
        ...instruction,
        validation: validation,
        support: support,
        techniqueGuide: techniqueGuide,
        hasDetailedGuide: techniqueGuide !== null
    };
};