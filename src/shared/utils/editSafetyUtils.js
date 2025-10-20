// src/shared/utils/editSafetyUtils.js

/**
 * Edit Safety Utilities
 * 
 * Determines whether step edits are safe (no cascade) or require warnings
 */

import { getStepPatternName, isInitializationStep } from './stepDisplayUtils';

/**
 * Edit type classifications
 */
export const EDIT_SAFETY = {
    SAFE: 'safe',           // Can edit without affecting other steps
    CASCADING: 'cascading', // Will affect stitch counts in following steps
    BLOCKED: 'blocked'      // Cannot be edited (initialization steps)
};

/**
 * Determine if an edit type is safe (doesn't affect stitch math)
 */
export const isSafeEditType = (editType) => {
    const safeEditTypes = [
        'brioche_color',    // 2-color brioche color selection
        'pattern_text',     // Pattern instruction text only
        'stripe_color',     // Stripe color changes
        'prep_note',        // Preparation notes
        'after_note',       // Assembly notes
        'pattern'           // Pattern editing for text-based patterns
    ];

    return safeEditTypes.includes(editType);
};

/**
 * Determine if an edit would cascade to following steps
 */
export const isCascadingEditType = (editType) => {
    const cascadingEditTypes = [
        'duration',         // Changing row/round counts
        'shaping',          // Changing shaping configuration
        'stitch_count',     // Direct stitch modifications
        'config',           // Full configuration changes
        'full_step'         // Complete step replacement via wizard
    ];

    return cascadingEditTypes.includes(editType);
};

/**
 * Determine edit safety for a specific step
 * 
 * @param {Object} step - The step to check
 * @param {number} stepIndex - Index in component.steps array
 * @param {string} editType - Type of edit being attempted
 * @returns {Object} { safety: 'safe'|'cascading'|'blocked', reason: string }
 */
export const getEditSafety = (step, stepIndex, editType) => {
    // Initialization steps are blocked from most edits
    if (stepIndex === 0 && isInitializationStep(step)) {
        return {
            safety: EDIT_SAFETY.BLOCKED,
            reason: 'Initialization step editing is not yet supported. You can delete and recreate the component to change the cast on method.'
        };
    }

    // Check if this is a safe edit type
    if (isSafeEditType(editType)) {
        return {
            safety: EDIT_SAFETY.SAFE,
            reason: 'This edit only affects display text and won\'t change stitch counts.'
        };
    }

    // Check if this is a cascading edit type
    if (isCascadingEditType(editType)) {
        return {
            safety: EDIT_SAFETY.CASCADING,
            reason: 'This edit may change stitch counts and affect following steps.'
        };
    }

    // Default to cascading for unknown edit types (safer)
    return {
        safety: EDIT_SAFETY.CASCADING,
        reason: 'This edit may affect following steps.'
    };
};

/**
 * Check if a pattern edit is safe (text-only changes)
 */
export const isPatternEditSafe = (step) => {
    const patternName = getStepPatternName(step);

    // These patterns have text-only edits that are safe
    const safePatterns = [
        'Two-Color Brioche',  // Color selection + text
        'Stripes',            // Color sequence + text
        'Custom'              // Description text only (when entryMode is description)
    ];

    return safePatterns.includes(patternName);
};

/**
 * Get a user-friendly message for edit restrictions
 */
export const getEditRestrictionMessage = (safety, stepIndex, followingStepsCount) => {
    switch (safety) {
        case EDIT_SAFETY.BLOCKED:
            return 'Initialization step editing is not yet supported. Delete and recreate the component to change the cast on method.';

        case EDIT_SAFETY.CASCADING:
            if (followingStepsCount === 0) {
                return 'You can edit this step freely as there are no steps after it.';
            }
            return `This edit will affect stitch counts. ${followingStepsCount} step${followingStepsCount > 1 ? 's' : ''} after this may need to be adjusted.`;

        case EDIT_SAFETY.SAFE:
            return 'You can edit this step without affecting other steps.';

        default:
            return 'Edit safety unknown. Proceed with caution.';
    }
};