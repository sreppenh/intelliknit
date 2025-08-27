// src/shared/utils/KnittingInstructionService.js
import { getStepPatternName } from './stepDisplayUtils';
import { getAlgorithmicRowInstruction, isAlgorithmicPattern } from './AlgorithmicPatterns';
import { calculateRowStitches } from './stitchCalculatorUtils';

/**
 * Smart Instruction Generation - Phase 2 implementation
 * Generates proper knitting instructions based on step configuration
 */
export const getRowInstruction = (step, currentRow, currentStitchCount) => {
    try {
        // Get basic step info
        const construction = step.construction || 'flat';
        const rowTerm = construction === 'round' ? 'Round' : 'Row';

        // Route to appropriate instruction type
        const instructionResult = routeInstruction(step, currentRow, currentStitchCount, construction);

        // Add row number prefix for multi-row steps
        if (step.totalRows > 1 && instructionResult.instruction) {
            instructionResult.instruction = `${rowTerm} ${currentRow}: ${instructionResult.instruction}`;
        }

        return instructionResult;

    } catch (error) {
        console.error('Error generating instruction:', error);
        return {
            instruction: `${step.construction === 'round' ? 'Round' : 'Row'} ${currentRow}: Work in pattern`,
            isSupported: false,
            needsHelp: false,
            helpTopic: null
        };
    }
};

/**
 * Route instruction generation based on step type and configuration
 */
function routeInstruction(step, currentRow, currentStitchCount, construction) {
    const patternName = getStepPatternName(step);
    const hasShaping = step.wizardConfig?.hasShaping || step.advancedWizardConfig?.hasShaping;

    // Priority 1: Construction patterns (Cast On, Bind Off)
    if (isConstructionPattern(patternName)) {
        return getConstructionInstruction(step, patternName);
    }

    // Priority 2: Steps with shaping
    if (hasShaping) {
        return getShapingInstruction(step, currentRow, currentStitchCount, construction);
    }

    // Priority 3: Basic algorithmic patterns
    if (isAlgorithmicPattern(patternName)) {
        return getAlgorithmicInstruction(step, currentRow, currentStitchCount, construction, patternName);
    }

    // Priority 4: Fallback
    return getFallbackInstruction(step, currentRow, currentStitchCount, patternName);
}

/**
 * Determine step type for counter behavior
 */
export const getStepType = (step, totalRows, duration) => {
    // Cast-on, bind-off, and other single-action steps
    if (totalRows === 1) {
        return 'single_action';
    }

    // Length-based steps (work until measurement)
    if (duration?.type === 'length' || duration?.type === 'until_length') {
        return 'length_based';
    }

    // Steps that can be completed at any time
    if (duration?.type === 'stitches' && duration?.value === 'all') {
        return 'completion_when_ready';
    }

    // Standard multi-row steps
    return 'fixed_multi_row';
};

/**
 * Helper Functions for Instruction Generation
 */

/**
 * Check if pattern is a construction pattern (Cast On, Bind Off, etc.)
 */
function isConstructionPattern(patternName) {
    const constructionPatterns = [
        'Cast On', 'Bind Off', 'Pick Up & Knit', 'Continue from Stitches',
        'Put on Holder', 'Attach to Piece', 'Custom Initialization'
    ];
    return constructionPatterns.includes(patternName);
}

/**
 * Generate instructions for construction patterns
 */
function getConstructionInstruction(step, patternName) {
    const stitchPattern = step.wizardConfig?.stitchPattern || step.advancedWizardConfig?.stitchPattern;

    switch (patternName) {
        case 'Cast On':
            return getCastOnInstruction(step, stitchPattern);

        case 'Bind Off':
            return getBindOffInstruction(step, stitchPattern);

        case 'Pick Up & Knit':
            return getPickUpInstruction(step, stitchPattern);

        case 'Put on Holder':
            return getHolderInstruction(step, stitchPattern);

        case 'Attach to Piece':
            return getAttachInstruction(step, stitchPattern);

        default:
            return {
                instruction: step.description || 'Complete this step',
                isSupported: true,
                needsHelp: false,
                helpTopic: null
            };
    }
}

/**
 * Cast On instruction generation
 */
function getCastOnInstruction(step, stitchPattern) {
    const method = stitchPattern?.method || 'long_tail';
    const stitchCount = stitchPattern?.stitchCount || step.endingStitches || '0';

    const methodNames = {
        'long_tail': 'Long Tail Cast On',
        'cable': 'Cable Cast On',
        'knitted': 'Knitted Cast On',
        'backwards_loop': 'Backwards Loop Cast On',
        'provisional': 'Provisional Cast On',
        'judy': "Judy's Magic Cast On",
        'german_twisted': 'German Twisted Cast On'
    };

    const methodName = methodNames[method] || 'Cast On';

    return {
        instruction: `Using ${methodName}, cast on ${stitchCount} stitches`,
        isSupported: true,
        needsHelp: method === 'provisional' || method === 'judy',
        helpTopic: method === 'provisional' ? 'provisional_cast_on' : method === 'judy' ? 'magic_cast_on' : null
    };
}

/**
 * Bind Off instruction generation
 */
function getBindOffInstruction(step, stitchPattern) {
    const method = stitchPattern?.method || 'standard';
    const stitchCount = stitchPattern?.stitchCount || 'all';

    const methodNames = {
        'standard': 'Standard Bind Off',
        'stretchy': 'Stretchy Bind Off',
        'picot': 'Picot Bind Off',
        'three_needle': 'Three Needle Bind Off',
        'sewn': 'Sewn Bind Off'
    };

    const methodName = methodNames[method] || 'Standard Bind Off';
    const stitchText = stitchCount === 'all' ? 'all stitches' : `${stitchCount} stitches`;

    return {
        instruction: `Bind off ${stitchText} using ${methodName}`,
        isSupported: true,
        needsHelp: method === 'three_needle' || method === 'sewn',
        helpTopic: method === 'three_needle' ? 'three_needle_bindoff' : method === 'sewn' ? 'sewn_bindoff' : null
    };
}

/**
 * Pick Up & Knit instruction generation
 */
function getPickUpInstruction(step, stitchPattern) {
    const stitchCount = stitchPattern?.stitchCount || step.endingStitches || '0';
    const customDetails = stitchPattern?.customDetails || '';

    let instruction = `Pick up and knit ${stitchCount} stitches`;
    if (customDetails) {
        instruction += ` ${customDetails}`;
    }

    return {
        instruction,
        isSupported: true,
        needsHelp: true,
        helpTopic: 'pick_up_knit'
    };
}

/**
 * Put on Holder instruction generation
 */
function getHolderInstruction(step, stitchPattern) {
    const stitchCount = stitchPattern?.stitchCount || step.startingStitches || 'remaining';

    return {
        instruction: `Put ${stitchCount} stitches on stitch holder`,
        isSupported: true,
        needsHelp: false,
        helpTopic: null
    };
}

/**
 * Attach to Piece instruction generation
 */
function getAttachInstruction(step, stitchPattern) {
    const method = stitchPattern?.method || 'mattress_stitch';

    const methodNames = {
        'mattress_stitch': 'Mattress Stitch',
        'backstitch': 'Backstitch',
        'kitchener_stitch': 'Kitchener Stitch',
        'three_needle': 'Three Needle Bind Off'
    };

    const methodName = methodNames[method] || 'seaming';

    return {
        instruction: `Attach to piece using ${methodName}`,
        isSupported: true,
        needsHelp: method === 'kitchener_stitch',
        helpTopic: method === 'kitchener_stitch' ? 'kitchener_stitch' : null
    };
}

/**
 * Generate instructions for steps with shaping
 */
function getShapingInstruction(step, currentRow, currentStitchCount, construction) {
    const shapingConfig = step.wizardConfig?.shapingConfig || step.advancedWizardConfig?.shapingConfig;

    if (!shapingConfig) {
        return getFallbackInstruction(step, currentRow, currentStitchCount);
    }

    // For even distribution shaping - single row
    if (shapingConfig.type === 'even_distribution') {
        const calculation = shapingConfig.config?.calculation;
        if (calculation?.instruction) {
            return {
                instruction: `${calculation.instruction} (${calculation.endingStitches} stitches)`,
                isSupported: true,
                needsHelp: false,
                helpTopic: null
            };
        }
    }

    // For sequential phases shaping - multi row
    if (shapingConfig.type === 'phases') {
        return getSequentialPhaseInstruction(step, currentRow, currentStitchCount, construction, shapingConfig);
    }

    // Fallback for unknown shaping types
    const patternName = getStepPatternName(step);
    return {
        instruction: `Work in ${patternName} with shaping as established`,
        isSupported: false,
        needsHelp: true,
        helpTopic: 'shaping_help'
    };
}

/**
 * Generate instruction for specific row in sequential phases shaping
 */
function getSequentialPhaseInstruction(step, currentRow, currentStitchCount, construction, shapingConfig) {
    const calculation = shapingConfig.config?.calculation;
    if (!calculation?.phases) {
        return getFallbackInstruction(step, currentRow, currentStitchCount);
    }

    // Find which phase we're in
    let accumulatedRows = 0;
    for (const phase of calculation.phases) {
        const [startRow, endRow] = phase.rowRange.split('-').map(Number);
        const phaseRowCount = endRow - startRow + 1;

        if (currentRow >= startRow && currentRow <= endRow) {
            const rowInPhase = currentRow - startRow + 1;
            return getPhaseRowInstruction(phase, rowInPhase, currentStitchCount, construction);
        }

        accumulatedRows += phaseRowCount;
    }

    // If we're somehow outside all phases, use the step description
    return {
        instruction: step.description || 'Work as established',
        isSupported: false,
        needsHelp: true,
        helpTopic: 'shaping_help'
    };
}

/**
 * Generate instruction for a single row within a shaping phase
 */
function getPhaseRowInstruction(phase, rowInPhase, currentStitchCount, construction) {
    const phaseType = phase.type || 'setup';

    if (phaseType === 'setup') {
        // Setup rows - just work in pattern
        return {
            instruction: 'Work in pattern',
            isSupported: true,
            needsHelp: false,
            helpTopic: null
        };
    }

    // For shaping phases, the description should contain the instruction pattern
    // e.g., "K1, ssk, work to last 3 sts, k2tog, k1 every other row 6 times"
    const baseInstruction = phase.description || 'Work with shaping as established';

    return {
        instruction: baseInstruction,
        isSupported: true,
        needsHelp: false,
        helpTopic: null
    };
}

/**
 * Generate instructions for basic algorithmic patterns
 */
function getAlgorithmicInstruction(step, currentRow, currentStitchCount, construction, patternName) {
    const rowInstruction = getAlgorithmicRowInstruction(patternName, currentRow, currentStitchCount, construction);

    if (!rowInstruction) {
        return getFallbackInstruction(step, currentRow, currentStitchCount, patternName);
    }

    // Add stitch count if it stays the same
    const stitchCountText = shouldShowStitchCount(step) ? ` (${currentStitchCount} stitches)` : '';

    return {
        instruction: `${rowInstruction}${stitchCountText}`,
        isSupported: true,
        needsHelp: false,
        helpTopic: null
    };
}

/**
 * Fallback instruction generation
 */
function getFallbackInstruction(step, currentRow, currentStitchCount, patternName) {
    const pattern = patternName || 'pattern';
    const stitchCountText = shouldShowStitchCount(step) ? ` (${currentStitchCount} stitches)` : '';

    return {
        instruction: `Work in ${pattern}${stitchCountText}`,
        isSupported: false,
        needsHelp: true,
        helpTopic: 'pattern_help'
    };
}

/**
 * Determine if stitch count should be shown in instruction
 */
function shouldShowStitchCount(step) {
    // Show stitch count for non-shaping steps that maintain stitch count
    const hasShaping = step.wizardConfig?.hasShaping || step.advancedWizardConfig?.hasShaping;
    const isConstructionPattern = step.wizardConfig?.stitchPattern?.category === 'construction';

    return !hasShaping && !isConstructionPattern && step.startingStitches === step.endingStitches;
}