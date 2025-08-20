// src/shared/utils/stepDescriptionUtils.js

/**
 * Step Description Utilities - Human-Readable Display
 * 
 * Companion to stepDisplayUtils.js and stepCreationUtils.js
 * Generates human-friendly descriptions and contextual notes for step display.
 */

import { getStepPatternName, getStepMethodDisplay, getStepDurationDisplay, getStepPrepNote, getStepType, hasShaping } from './stepDisplayUtils';
import { formatKnittingInstruction } from './knittingNotation';
import { PhaseCalculationService } from './PhaseCalculationService';

// ===== HUMAN-READABLE DESCRIPTIONS =====

/**
 * ✅ REFACTORED: Generate human-readable description for any step
 * Now routes by step type instead of pattern type for cleaner architecture
 */
export const getHumanReadableDescription = (step, componentName = null) => {
    const stepType = getStepType(step);

    switch (stepType) {
        case 'initialization':
            return getInitializationStepDescription(step);
        case 'finalization':
            return getFinalizationStepDescription(step, componentName);
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
    // ✅ TEMPORARY: Debug what pattern we're getting

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

    // ✅ NEW: Show custom method for bind-off "other" method in italics
    if (pattern === 'Bind Off' && step.wizardConfig?.stitchPattern?.method === 'other') {
        const customMethod = step.wizardConfig?.stitchPattern?.customMethod;
        return customMethod ? customMethod.trim() : null;
    }

    // For holders, show any custom text the user provided
    if (pattern === 'Put on Holder') {
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

    // ✅ NEW: Handle advanced patterns (Lace, Cable, Custom)
    if (['Lace Pattern', 'Cable Pattern', 'Custom pattern'].includes(pattern)) {
        return getAdvancedPatternNotes(step);
    }

    // Check for custom pattern text (for other pattern types)
    const customText = step.wizardConfig?.stitchPattern?.customText;
    if (customText && customText.trim() !== '') {
        return customText.trim();
    }

    return null;
};

/**
 * ✅ ENHANCED: Format knitting instruction with comprehensive cable support
 * Converts button-optimized text to human-readable instructions
 */
const formatReadableInstruction = (instruction) => {
    if (!instruction || typeof instruction !== 'string') return instruction;

    let formatted = instruction.trim();

    // ===== EXACT MATCHES (full instruction replacements) =====
    const exactReplacements = {
        'K to end': 'Knit to end',
        'P to end': 'Purl to end',
        'K/P as set': 'Knit the knits, Purl the purls'
    };

    if (exactReplacements[formatted]) {
        return exactReplacements[formatted];
    }

    // ===== SPECIFIC PATTERN REPLACEMENTS =====
    // Handle bracket patterns: [K, P] → [K1, P1]
    formatted = formatted.replace(/\[K,\s*P\]/g, '[K1, P1]');
    formatted = formatted.replace(/\[P,\s*K\]/g, '[P1, K1]');

    // Handle common comma patterns: "K, P to end" → "K1, Purl to end"
    formatted = formatted.replace(/^K,\s*P to end$/g, 'K1, Purl to end');
    formatted = formatted.replace(/^P,\s*K to end$/g, 'P1, Knit to end');

    // Handle simple standalone cases at start/end: "K" or "P" → "K1" or "P1"
    if (formatted === 'K') return 'K1';
    if (formatted === 'P') return 'P1';

    // ===== PARTIAL PHRASE REPLACEMENTS =====
    // These should be safe since they're not single letters
    formatted = formatted.replace(/P to end/g, 'Purl to end');
    formatted = formatted.replace(/K to end/g, 'Knit to end');

    // ===== ABBREVIATION EXPANSIONS =====

    // Basic lace abbreviations
    formatted = formatted.replace(/\bYO\b/g, 'yarn over');
    formatted = formatted.replace(/\bK2tog\b/g, 'knit 2 together');
    formatted = formatted.replace(/\bSSK\b/g, 'slip slip knit');

    // ✅ ENHANCED: Comprehensive cable abbreviations

    // Standard cable crosses (original format)
    formatted = formatted.replace(/\bC(\d+)F\b/g, (match, num) => `${num}-stitch front cable`);
    formatted = formatted.replace(/\bC(\d+)B\b/g, (match, num) => `${num}-stitch back cable`);

    // Left cross cables (LC format)
    formatted = formatted.replace(/\b(\d+)\/(\d+)\s+LC\b/g, (match, over, under) => {
        if (over === under) {
            return `${over}-over-${under} left cross`;
        } else {
            return `${over}-over-${under} left cross`;
        }
    });

    // Right cross cables (RC format)
    formatted = formatted.replace(/\b(\d+)\/(\d+)\s+RC\b/g, (match, over, under) => {
        if (over === under) {
            return `${over}-over-${under} right cross`;
        } else {
            return `${over}-over-${under} right cross`;
        }
    });

    // Left purl cross (LPC format)
    formatted = formatted.replace(/\b(\d+)\/(\d+)\s+LPC\b/g, (match, over, under) => {
        return `${over}-over-${under} left purl cross`;
    });

    // Right purl cross (RPC format)
    formatted = formatted.replace(/\b(\d+)\/(\d+)\s+RPC\b/g, (match, over, under) => {
        return `${over}-over-${under} right purl cross`;
    });

    // Twist abbreviations
    formatted = formatted.replace(/\bT(\d+)F\b/g, (match, num) => `${num}-stitch front twist`);
    formatted = formatted.replace(/\bT(\d+)B\b/g, (match, num) => `${num}-stitch back twist`);
    formatted = formatted.replace(/\bRT\b/g, 'right twist');
    formatted = formatted.replace(/\bLT\b/g, 'left twist');

    // ===== SINGLE LETTER REPLACEMENTS (LAST) =====
    // Handle K and P that should become K1 and P1
    // Only match single K or P in stitch pattern contexts (brackets, commas, etc.)
    // Avoid matching K or P that are part of actual words like "Knit" or "Purl"
    formatted = formatted.replace(/(?<![A-Za-z])(K|P)(?=\s*[,\s\]]|$)(?![a-z])/g, (match, letter) => {

        return letter === 'K' ? 'K1' : 'P1';
    });

    return formatted;
};

/**
 * ✅ NEW: Get contextual notes for advanced patterns (Lace, Cable, Custom)
 * Handles both Description mode and Row by Row mode
 */
const getAdvancedPatternNotes = (step) => {
    // Check both wizardConfig and advancedWizardConfig
    const stitchPattern = step.wizardConfig?.stitchPattern || step.advancedWizardConfig?.stitchPattern;

    if (!stitchPattern) return null;

    const entryMode = stitchPattern.entryMode;

    // Row by Row mode - show the actual row instructions
    if (entryMode === 'row_by_row') {
        const rowInstructions = stitchPattern.rowInstructions;

        if (rowInstructions && rowInstructions.length > 0) {
            // Show up to 8 rows, full text with wrapping
            const rowsToShow = rowInstructions.slice(0, 8);
            const formattedRows = rowsToShow.map((row, index) => {
                // ✅ ENHANCED: Format for readability
                const readableInstruction = formatReadableInstruction(row);
                return `Row ${index + 1}: ${readableInstruction}`;
            }).join('\n');

            // If there are more than 8 rows, add indicator
            if (rowInstructions.length > 8) {
                return `${formattedRows}\n... (${rowInstructions.length - 8} more rows)`;
            }

            return formattedRows;
        }
    }

    // Description mode - show the custom text description (no formatting needed)
    else {
        const customText = stitchPattern.customText;
        if (customText && customText.trim() !== '') {
            return customText.trim();
        }
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
            const construction = step.construction || 'flat';
            if (phases && phases.length > 0) {
                const phaseDescriptions = phases.map((phase, index) => {
                    return `Phase ${index + 1}: ${PhaseCalculationService.getPhaseDescription(phase, construction)}`;
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
            return `Initialize component with ${pattern}`;
    }
};

/**
 * ✅ NEW: Generate descriptions for finalization steps
 */
const getFinalizationStepDescription = (step, componentName) => {
    const pattern = getStepPatternName(step);

    switch (pattern) {
        case 'Bind Off':
            return getBindOffDescription(step, componentName);
        case 'Put on Holder':
            return getHolderDescription(step);
        case 'Other Ending':
            return getOtherEndingDescription(step);
        default:
            return `Complete component with ${pattern}`;
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
        return `Work ${duration} in ${pattern}${shapingText}`;
    }

    return `Work in ${pattern}${shapingText}`;
};

/**
 * ✅ NEW: Generate descriptions for non-shaping steps  
 * Handles the [pattern][duration config] format
 */
const getNonShapingStepDescription = (step) => {
    const pattern = getStepPatternName(step);
    const duration = getStepDurationDisplay(step);

    // ✅ NEW: For advanced patterns, include row count in pattern name
    let enhancedPattern = pattern;
    if (['Lace Pattern', 'Cable Pattern', 'Custom pattern'].includes(pattern)) {
        const stitchPattern = step.wizardConfig?.stitchPattern || step.advancedWizardConfig?.stitchPattern;
        const rowsInPattern = stitchPattern?.rowsInPattern;

        if (rowsInPattern && parseInt(rowsInPattern) > 1) {
            const construction = step.construction || 'flat';
            const rowTerm = construction === 'round' ? 'round' : 'row';
            enhancedPattern = `${rowsInPattern}-${rowTerm} ${pattern}`;
        }
    }

    // Build the description: [pattern][duration config]
    if (duration) {
        return `Work ${duration} in ${enhancedPattern}`;
    }

    return `Work in ${enhancedPattern}`;
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
        'cable': 'Cable Cast On',
        'knitted': 'Knitted Cast On',
        'backwards_loop': 'Backwards Loop Cast On',
        'provisional': 'Provisional Cast On',
        'judy': 'Judy\'s Magic Cast On',
        'german_twisted': 'German Twisted Cast On'
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
const getBindOffDescription = (step, componentName) => {
    const method = step.wizardConfig?.stitchPattern?.method;
    const customMethod = step.wizardConfig?.stitchPattern?.customMethod || step.wizardConfig?.stitchPattern?.customText;
    const stitchCount = step.wizardConfig?.stitchPattern?.stitchCount;
    const targetComponent = step.wizardConfig?.stitchPattern?.targetComponent;

    if (method === 'three_needle' && targetComponent) {
        const currentComponent = componentName || 'this component';
        return `Using Three Needle Bind Off, attach ${currentComponent} to ${targetComponent}`;
    }

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
        return `Using ${methodDisplay}, bind off ${countText}`;
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
        return `Using ${methodDisplay}, attach this component to ${target}`;
    }

    return `Attach this component to ${target}`;
};

/**
 * Generate other ending description
 */
const getOtherEndingDescription = (step) => {
    // ✅ FIX: Always show "Custom completion method"
    return 'Custom completion method';
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
        return `Work ${duration} in ${pattern}${shapingText}`;
    }

    return `Work in ${pattern}${shapingText}`;
};

// ===== TECHNICAL DATA FORMATTING =====

/**
 * Format technical data display (the "good data - do not remove")
 * ✅ ENHANCED: Calculate total rows for repeat-based patterns
 */
const getTechnicalDataDisplay = (step) => {
    const parts = [];

    // Stitch counts
    const startingStitches = step.startingStitches || 0;
    const endingStitches = step.endingStitches || step.expectedStitches || 0;
    parts.push(`${startingStitches} → ${endingStitches} sts`);

    // ✅ ENHANCED: Duration with total row calculation
    const duration = getEnhancedDurationDisplay(step);
    if (duration) {
        parts.push(duration);
    }

    // Construction
    const construction = step.construction || 'flat';
    parts.push(construction);

    return parts.join(' • ');
};

/**
 * ✅ NEW: Enhanced duration display that calculates total rows for repeats
 */
const getEnhancedDurationDisplay = (step) => {
    const duration = step.wizardConfig?.duration;
    const construction = step.construction || 'flat';
    const rowTerm = construction === 'round' ? 'rounds' : 'rows';

    if (!duration?.type) {
        // Fallback to totalRows if available
        return step.totalRows ? `${step.totalRows} ${rowTerm}` : null;
    }

    // ✅ ENHANCED: Handle repeats by calculating total rows
    if (duration.type === 'repeats') {
        const repeats = parseInt(duration.value) || 0;
        const stitchPattern = step.wizardConfig?.stitchPattern || step.advancedWizardConfig?.stitchPattern;
        const rowsInPattern = parseInt(stitchPattern?.rowsInPattern) || 0;

        if (repeats > 0 && rowsInPattern > 0) {
            const totalRows = repeats * rowsInPattern;
            return `${totalRows} ${rowTerm}`;
        }

        // Fallback to showing repeats if we can't calculate
        return `${repeats} repeats`;
    }

    // Handle other duration types (use existing logic from getStepDurationDisplay)
    switch (duration.type) {
        case 'rows':
        case 'rounds':
            return `${duration.value} ${rowTerm}`;

        case 'length':
            return `${duration.value} ${duration.units || 'inches'}`;

        case 'until_length':
            return `until ${duration.value} ${duration.units || 'inches'}`;

        case 'stitches':
            return `${duration.value} stitches`;

        default:
            return null;
    }
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
    return ['Bind Off', 'Put on Holder', 'Other Ending'].includes(pattern);
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