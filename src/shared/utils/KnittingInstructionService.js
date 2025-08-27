// src/shared/utils/KnittingInstructionService.js
import { getStepPatternName } from './stepDisplayUtils';

/**
 * Temporary instruction service - Phase 1 implementation
 * Prevents crashes while counter logic is fixed
 */
export const getRowInstruction = (step, currentRow, currentStitchCount) => {
    const patternName = getStepPatternName(step);

    // Basic fallback instructions
    return {
        instruction: `Row ${currentRow}: Work in ${patternName || 'pattern'}`,
        isSupported: false,
        needsHelp: false,
        helpTopic: null
    };
};

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