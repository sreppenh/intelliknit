// src/shared/utils/stepDescriptionUtils.js

/**
 * Step Description Utilities - Human-Readable Display
 * 
 * Companion to stepDisplayUtils.js and stepCreationUtils.js
 * Generates human-friendly descriptions and contextual notes for step display.
 */

import { getStepPatternName, getStepMethodDisplay, getStepDurationDisplay, getStepPrepNote, getStepType, hasShaping } from './stepDisplayUtils';
import { formatKnittingInstruction } from './knittingNotation';

// ===== HUMAN-READABLE DESCRIPTIONS =====

/**
 * ✅ REFACTORED: Generate human-readable description for any step
 * Now routes by step type instead of pattern type for cleaner architecture
 */
export const getHumanReadableDescription = (step) => {
    const stepType = getStepType(step);

    switch (stepType) {
        case 'initialization':
            return getInitializationStepDescription(step);
        case 'finalization':
            return getFinalizationStepDescription(step);
        case 'shaping':
            return getShapingStepDescription(step);
        case 'non-shaping':
            return getNonShapingStepDescription(step);
        default:
            // Fallback to pattern-based routing for edge cases
            return getPatternStepDescription(step);
    }
};

/**
 * Get contextual notes (user-provided text in italics)
 * Returns formatted string or null if no context available
 */
export const getContextualPatternNotes = (step) => {
    const pattern = getStepPatternName(step);

    // For Pick Up & Knit, show the instruction (how to pick up)
    if (pattern === 'Pick Up & Knit') {
        const instruction = step.wizardConfig?.stitchPattern?.instruction;
        return instruction ? instruction.trim() : null;
    }

    // For Cast On with "other" method, show custom text
    if (pattern === 'Cast On' && step.wizardConfig?.stitchPattern?.method === 'other') {
        const customText = step.wizardConfig?.stitchPattern?.customText;
        return customText ? customText.trim() : null;
    }

    // ✅ FIX: For ALL other Cast On methods, show NO contextual notes
    if (pattern === 'Cast On') {
        return null;
    }

    // For holders, show any custom text the user provided
    if (pattern === 'Put on Holder') {
        const customText = step.wizardConfig?.stitchPattern?.customText;
        return customText ? customText.trim() : null;
    }

    // For attachments, could show assembly notes
    if (pattern === 'Attach to Piece') {
        const customText = step.wizardConfig?.stitchPattern?.customText;
        return customText ? customText.trim() : null;
    }

    // ✅ NEW: Show custom text for Other Ending in italics
    if (pattern === 'Other Ending') {
        const customText = step.wizardConfig?.stitchPattern?.customText;
        return customText ? customText.trim() : null;
    }

    // ✅ FIXED: Don't show contextual notes for Continue from Stitches
    if (pattern === 'Continue from Stitches') {
        return null;
    }

    // Check for custom pattern text
    const customText = step.wizardConfig?.stitchPattern?.customText;
    if (customText && customText.trim() !== '') {
        return customText.trim();
    }

    return null;
};

/**
 * Get configuration-specific contextual notes
 * Used for shaping details, timing specifics, duration notes
 */
export const getContextualConfigNotes = (step) => {
    const notes = [];

    // Check for shaping configuration notes
    const shapingConfig = step.wizardConfig?.shapingConfig || step.advancedWizardConfig?.shapingConfig;
    if (shapingConfig?.type) {
        if (shapingConfig.type === 'even_distribution') {
            // ✅ FIXED: Show beautifully formatted even distribution instruction
            const calculation = shapingConfig.config?.calculation;
            if (calculation?.instruction) {
                const formattedInstruction = formatKnittingInstruction(calculation.instruction);
                notes.push(formattedInstruction);
            }
        } else if (shapingConfig.type === 'phases') {
            // Show phase breakdown for complex shaping
            const phases = shapingConfig.config?.phases;
            if (phases && phases.length > 1) {
                const phaseDescriptions = phases.map((phase, index) => {
                    const type = phase.type;
                    const config = phase.config;

                    if (type === 'setup') {
                        return `Phase ${index + 1}: ${config.rows} setup rows`;
                    } else if (type === 'decrease' || type === 'increase') {
                        const action = type === 'decrease' ? 'dec' : 'inc';
                        const position = config.position === 'both_ends' ? 'both ends' : config.position;
                        return `Phase ${index + 1}: ${action} at ${position} every ${config.frequency} rows`;
                    } else if (type === 'bind_off') {
                        return `Phase ${index + 1}: bind off ${config.amount} sts`;
                    }
                    return `Phase ${index + 1}: ${type}`;
                });

                notes.push(phaseDescriptions.join('\n'));
            }
        }
    }

    // Check for duration-specific notes (future expansion)
    const duration = step.wizardConfig?.duration;
    if (duration?.type === 'repeats' && duration?.value) {
        const rowsInPattern = step.wizardConfig?.stitchPattern?.rowsInPattern;
        if (rowsInPattern && parseInt(rowsInPattern) > 4) {
            // Only show for complex patterns
            notes.push(`${duration.value} repeats of ${rowsInPattern}-row pattern`);
        }
    }

    // Future: Add other config-specific notes here
    // - Gauge adjustments
    // - Construction-specific timing
    // - Row-by-row guidance notes

    return notes.length > 0 ? notes.join('\n') : null;
};

/**
 * Get complete formatted step display
 * Returns object with description, notes, and technical data
 */
export const getFormattedStepDisplay = (step) => {
    return {
        description: getHumanReadableDescription(step),
        contextualPatternNotes: getContextualPatternNotes(step),
        contextualConfigNotes: getContextualConfigNotes(step),
        technicalData: getTechnicalDataDisplay(step)
    };
};

// ===== STEP TYPE DESCRIPTION GENERATORS =====

/**
 * ✅ NEW: Generate descriptions for initialization steps
 */
const getInitializationStepDescription = (step) => {
    const pattern = getStepPatternName(step);

    switch (pattern) {
        case 'Cast On':
            return getCastOnDescription(step);
        case 'Pick Up & Knit':
            return getPickUpKnitDescription(step);
        case 'Continue from Stitches':
            return getContinueDescription(step);
        case 'Custom Initialization':
            return getCustomInitializationDescription(step);
        default:
            return `Initialize component with ${pattern.toLowerCase()}`;
    }
};

/**
 * ✅ NEW: Generate descriptions for finalization steps
 */
const getFinalizationStepDescription = (step) => {
    const pattern = getStepPatternName(step);

    switch (pattern) {
        case 'Bind Off':
            return getBindOffDescription(step);
        case 'Put on Holder':
            return getHolderDescription(step);
        case 'Attach to Piece':
            return getAttachmentDescription(step);
        case 'Other Ending':
            return getOtherEndingDescription(step);
        default:
            return `Complete component with ${pattern.toLowerCase()}`;
    }
};

/**
 * ✅ NEW: Generate descriptions for shaping steps
 * Handles the [pattern][shaping config] format
 */
const getShapingStepDescription = (step) => {
    const pattern = getStepPatternName(step);
    const duration = getStepDurationDisplay(step);

    // Get shaping configuration details
    const shapingConfig = step.wizardConfig?.shapingConfig || step.advancedWizardConfig?.shapingConfig;
    let shapingText = '';

    if (shapingConfig?.type === 'even_distribution') {
        const action = shapingConfig.config?.action;
        const amount = shapingConfig.config?.amount;
        if (action && amount) {
            const actionText = action === 'increase' ? 'increases' : 'decreases';
            shapingText = ` with ${amount} ${actionText} evenly distributed`;
        }
    } else if (shapingConfig?.type === 'phases') {
        const phases = shapingConfig.config?.phases?.length || 0;
        if (phases > 0) {
            shapingText = ` with ${phases} shaping phases`;
        }
    }

    // Build the description: [pattern][shaping config]
    if (duration) {
        return `Work ${duration} in ${pattern.toLowerCase()}${shapingText}`;
    }

    return `Work in ${pattern.toLowerCase()}${shapingText}`;
};

/**
 * ✅ NEW: Generate descriptions for non-shaping steps  
 * Handles the [pattern][duration config] format
 */
const getNonShapingStepDescription = (step) => {
    const pattern = getStepPatternName(step);
    const duration = getStepDurationDisplay(step);

    // Build the description: [pattern][duration config]
    if (duration) {
        return `Work ${duration} in ${pattern.toLowerCase()}`;
    }

    return `Work in ${pattern.toLowerCase()}`;
};

// ===== ORIGINAL SPECIFIC DESCRIPTION GENERATORS =====
// These are used by the step-type functions above

/**
 * Generate cast on description
 */
const getCastOnDescription = (step) => {
    const method = step.wizardConfig?.stitchPattern?.method;
    const stitchCount = step.wizardConfig?.stitchPattern?.stitchCount || step.endingStitches;

    // Handle "other" method specially - no method name, just cast on
    if (method === 'other') {
        return `Cast on ${stitchCount} stitches`;
    }

    // Get display name for method
    const CAST_ON_METHODS = {
        'long_tail': 'Long Tail Cast On',
        'cable': 'cable cast on',
        'knitted': 'knitted cast on',
        'backwards_loop': 'backwards loop cast on',
        'provisional': 'provisional cast on',
        'judy': 'judy\'s magic cast on',
        'german_twisted': 'german twisted cast on'
    };

    const methodDisplay = CAST_ON_METHODS[method];

    if (methodDisplay) {
        return `Using ${methodDisplay}, cast on ${stitchCount} stitches`;
    }

    return `Cast on ${stitchCount} stitches`;
};

/**
 * Generate bind off description
 */
const getBindOffDescription = (step) => {
    const method = step.wizardConfig?.stitchPattern?.method;
    const customMethod = step.wizardConfig?.stitchPattern?.customMethod || step.wizardConfig?.stitchPattern?.customText;
    const stitchCount = step.wizardConfig?.stitchPattern?.stitchCount;

    // Handle specific stitch counts vs "all"
    const countText = stitchCount && stitchCount !== 'all' ?
        `${stitchCount} stitches` : 'all stitches';

    // ✅ FIX: Handle custom method properly
    if (method === 'other' && customMethod) {
        return `Bind off ${countText} using ${customMethod}`;
    }

    // Handle standard methods
    const methodDisplay = getStepMethodDisplay(step);
    if (methodDisplay && method !== 'other') {
        return `Using ${methodDisplay.toLowerCase()}, bind off ${countText}`;
    }

    return `Bind off ${countText}`;
};

/**
 * Generate pick up & knit description
 */
const getPickUpKnitDescription = (step) => {
    const stitchCount = step.wizardConfig?.stitchPattern?.stitchCount || step.endingStitches;
    const location = step.wizardConfig?.stitchPattern?.customText; // This is the "where"

    if (location && location.trim()) {
        return `Pick up and knit ${stitchCount} stitches from ${location.trim()}`;
    }

    return `Pick up and knit ${stitchCount} stitches`;
};

/**
 * Generate continue from stitches description  
 */
const getContinueDescription = (step) => {
    const stitchCount = step.wizardConfig?.stitchPattern?.stitchCount || step.endingStitches;
    const source = step.wizardConfig?.stitchPattern?.customText;

    if (source && source.trim()) {
        // ✅ FIXED: Use dash format like other initialization steps
        return `Continue knitting from ${source.trim()} - ${stitchCount} stitches`;
    }

    return `Continue knitting with ${stitchCount} stitches`;
};

/**
 * Generate custom initialization description
 */
const getCustomInitializationDescription = (step) => {
    const stitchCount = step.wizardConfig?.stitchPattern?.stitchCount || step.endingStitches;
    // ✅ FIXED: Always use "Custom setup" as main description
    return `Custom setup with ${stitchCount} stitches`;
};

/**
 * Generate holder description
 */
const getHolderDescription = (step) => {
    const stitchCount = step.wizardConfig?.stitchPattern?.stitchCount;

    if (stitchCount && stitchCount !== 'all') {
        return `Put ${stitchCount} stitches on hold`;
    }

    return 'Put all stitches on hold';
};

/**
 * Generate attachment description
 */
const getAttachmentDescription = (step) => {
    const method = step.wizardConfig?.stitchPattern?.method;
    const customMethod = step.wizardConfig?.stitchPattern?.customMethod || step.wizardConfig?.stitchPattern?.customText;
    const targetComponent = step.wizardConfig?.stitchPattern?.targetComponent;

    // Handle user-entered component names
    const target = targetComponent || 'selected component';

    // ✅ FIX: Handle custom method properly
    if (method === 'other' && customMethod) {
        return `Attach this component to ${target} using ${customMethod}`;
    }

    // Handle standard methods
    const methodDisplay = getStepMethodDisplay(step);
    if (methodDisplay && method !== 'other') {
        return `Using ${methodDisplay.toLowerCase()}, attach this component to ${target}`;
    }

    return `Attach this component to ${target}`;
};

/**
 * Generate other ending description
 */
const getOtherEndingDescription = (step) => {
    const customText = step.wizardConfig?.stitchPattern?.customText;

    if (customText && customText.trim() !== '') {
        // ✅ FIX: Better wording for other ending
        return `Complete component - ${customText.trim()}`;
    }

    return 'Complete component with custom ending';
};

/**
 * ✅ LEGACY: Original pattern step description (kept as fallback)
 * This is now only used as a fallback for edge cases
 */
const getPatternStepDescription = (step) => {
    const pattern = getStepPatternName(step);
    const duration = getStepDurationDisplay(step);

    // ✅ Add shaping configuration to base description (legacy support)
    const shapingConfig = step.wizardConfig?.shapingConfig || step.advancedWizardConfig?.shapingConfig;
    let shapingText = '';

    if (shapingConfig?.type === 'even_distribution') {
        const action = shapingConfig.config?.action;
        const amount = shapingConfig.config?.amount;
        if (action && amount) {
            const actionText = action === 'increase' ? 'increases' : 'decreases';
            shapingText = ` with ${amount} ${actionText} evenly distributed`;
        }
    } else if (shapingConfig?.type === 'phases') {
        const phases = shapingConfig.config?.phases?.length || 0;
        if (phases > 0) {
            shapingText = ` with ${phases} shaping phases`;
        }
    }

    // Build the description: [base pattern info][base configuration info]
    if (duration) {
        return `Work ${duration} in ${pattern.toLowerCase()}${shapingText}`;
    }

    return `Work in ${pattern.toLowerCase()}${shapingText}`;
};

// ===== TECHNICAL DATA FORMATTING =====

/**
 * Format technical data display (the "good data - do not remove")
 */
const getTechnicalDataDisplay = (step) => {
    const parts = [];

    // Stitch counts
    const startingStitches = step.startingStitches || 0;
    const endingStitches = step.endingStitches || step.expectedStitches || 0;
    parts.push(`${startingStitches} → ${endingStitches} sts`);

    // Duration
    const duration = getStepDurationDisplay(step);
    if (duration) {
        parts.push(duration);
    }

    // Construction
    const construction = step.construction || 'flat';
    parts.push(construction);

    return parts.join(' • ');
};

// ===== UTILITY FUNCTIONS =====

/**
 * Check if step has contextual notes to display
 */
export const hasContextualPatternNotes = (step) => {
    return getContextualPatternNotes(step) !== null;
};

export const hasContextualConfigNotes = (step) => {
    return getContextualConfigNotes(step) !== null;
};

/**
 * Check if step is an ending/completion step
 */
export const isEndingStep = (step) => {
    const pattern = getStepPatternName(step);
    return ['Bind Off', 'Put on Holder', 'Attach to Piece', 'Other Ending'].includes(pattern);
};

/**
 * Get step display priority for sorting/organizing
 */
export const getStepDisplayPriority = (step) => {
    const pattern = getStepPatternName(step);

    // Construction steps have specific ordering
    if (pattern === 'Cast On') return 1;
    if (pattern === 'Bind Off') return 100;
    if (pattern === 'Put on Holder') return 95;
    if (pattern === 'Attach to Piece') return 98;
    if (pattern === 'Other Ending') return 97;

    // Regular pattern steps in middle
    return 50;
};

// ===== EXPORTS =====

export default {
    getHumanReadableDescription,
    getContextualPatternNotes,
    getContextualConfigNotes,
    getFormattedStepDisplay,
    hasContextualPatternNotes,
    hasContextualConfigNotes,
    isEndingStep,
    getStepDisplayPriority
};