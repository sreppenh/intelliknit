// src/shared/utils/stepDisplayUtils.js
/**
 * Step Display Utilities - Data-Driven Approach
 * 
 * Replaces string parsing with structured data access.
 * Single source of truth for step display across the application.
 */

// ===== PATTERN MAPPINGS =====

const CAST_ON_METHODS = {
    'long_tail': 'Long Tail',
    'cable': 'Cable Cast On',
    'knitted': 'Knitted Cast On',
    'backwards_loop': 'Backwards Loop',
    'provisional': 'Provisional',
    'judy': 'Judy\'s Magic',
    'german_twisted': 'German Twisted'
};

const PICK_UP_KNIT_METHODS = {
    'pick_up_knit': 'Pick Up & Knit'
};

const CONTINUE_METHODS = {
    'from_stitches': 'From Live Stitches'
};

const CUSTOM_INITIALIZATION_METHODS = {
    'custom': 'Custom Setup'
};

const BIND_OFF_METHODS = {
    'standard': 'Standard Bind Off',
    'stretchy': 'Stretchy Bind Off',
    'picot': 'Picot Bind Off',
    'three_needle': 'Three Needle Bind Off',
    'sewn': 'Sewn Bind Off'
};

const ATTACH_METHODS = {
    'mattress_stitch': 'Mattress Stitch',
    'backstitch': 'Backstitch',
    'kitchener_stitch': 'Kitchener Stitch',
    'three_needle_bindoff': 'Three Needle Bind Off',
    'three_needle': 'Three Needle Bind Off'
};

const PATTERN_CATEGORIES = {
    'construction': ['Cast On', 'Pick Up & Knit', 'Continue from Stitches', 'Custom Initialization', 'Bind Off', 'Put on Holder', 'Other Ending'],
    'texture': ['Stockinette', 'Garter', 'Reverse Stockinette', '1x1 Rib', '2x2 Rib', 'Seed Stitch', 'Moss Stitch'],
    'colorwork': ['Stranded Colorwork', 'Intarsia', 'Fair Isle', 'Mosaic'],
    'structure': ['Lace', 'Cable', 'Brioche']
};

// ===== CORE UTILITY FUNCTIONS =====

/**
 * Get step's pattern name from structured data
 * NO string parsing - uses actual configuration
 */
export const getStepPatternName = (step) => {
    // Priority 1: wizardConfig
    if (step.wizardConfig?.stitchPattern?.pattern) {
        return step.wizardConfig.stitchPattern.pattern;
    }

    // Priority 2: wizardConfig category fallback
    if (step.wizardConfig?.stitchPattern?.category) {
        return step.wizardConfig.stitchPattern.category;
    }

    // Priority 3: advancedWizardConfig
    if (step.advancedWizardConfig?.stitchPattern?.pattern) {
        return step.advancedWizardConfig.stitchPattern.pattern;
    }

    if (step.advancedWizardConfig?.stitchPattern?.category) {
        return step.advancedWizardConfig.stitchPattern.category;
    }

    // Priority 4: Detect ending step variants from structured data
    if (step.wizardConfig?.stitchPattern?.pattern === 'Bind Off') {
        const method = step.wizardConfig.stitchPattern.method;
        if (method === 'holder' || method === 'provisional') {
            return 'Put on Holder';
        }
    }

    // LAST RESORT: Check if this is ComponentEndingWizard output
    if (step.type === 'put_on_holder') return 'Put on Holder';
    if (step.type === 'bind_off_all') return 'Bind Off';

    // Final fallback - only for truly legacy/corrupted data
    return 'Unknown Pattern';
};

/**
 * Get method display name for a step
 * Returns empty string if no method applies
 */
export const getStepMethodDisplay = (step) => {
    const pattern = getStepPatternName(step);
    const method = step.wizardConfig?.stitchPattern?.method;
    const customText = step.wizardConfig?.stitchPattern?.customText;

    if (!method) return '';

    switch (pattern) {
        case 'Cast On':
            return CAST_ON_METHODS[method] || (method === 'other' ? customText : method);

        case 'Pick Up & Knit':
            return PICK_UP_KNIT_METHODS[method] || (method === 'other' ? customText : method);

        case 'Continue from Stitches':
            return CONTINUE_METHODS[method] || (method === 'other' ? customText : method);

        case 'Custom Initialization':
            return CUSTOM_INITIALIZATION_METHODS[method] || (method === 'other' ? customText : method);

        case 'Bind Off':
            return BIND_OFF_METHODS[method] || (method === 'other' ? customText : method);

        default:
            return '';
    }
};

/**
 * Get full pattern display with method
 * Example: "Cast On - Long Tail" or "Stockinette"
 */
export const getStepPatternDisplay = (step) => {
    const pattern = getStepPatternName(step);
    const method = getStepMethodDisplay(step);

    return method ? `${pattern} - ${method}` : pattern;
};

/**
 * Get step duration display from structured data
 * NO regex parsing - uses actual configuration
 */
export const getStepDurationDisplay = (step) => {
    const duration = step.wizardConfig?.duration;
    const construction = step.construction || 'flat';

    if (!duration?.type) {
        // Fallback to totalRows if available
        return step.totalRows ? `${step.totalRows} ${construction === 'round' ? 'rounds' : 'rows'}` : null;
    }

    switch (duration.type) {
        case 'rows':
        case 'rounds':
            return `${duration.value} ${construction === 'round' ? 'rounds' : 'rows'}`;

        case 'length':
            return `${duration.value} ${duration.units}`;

        case 'until_length':
            return `until ${duration.value} ${duration.units}`;

        case 'repeats':
            return `${duration.value} repeats`;

        case 'stitches':
            return `${duration.value || 'all'} stitches`;

        default:
            return null;
    }
};

/**
 * Get stitch count change display
 * Returns formatted string like "+6" or "-12" or null
 */
export const getStitchChangeDisplay = (step) => {
    if (typeof step.startingStitches === 'number' && typeof step.endingStitches === 'number') {
        const change = step.endingStitches - step.startingStitches;
        if (change !== 0) {
            return change > 0 ? `+${change}` : `${change}`;
        }
    }
    return null;
};

export const hasShaping = (step) => {
    return step.wizardConfig?.hasShaping === true ||
        step.advancedWizardConfig?.hasShaping === true;
};

/**
 * Get shaping info display
 * Returns structured shaping information
 */

export const getShapingDisplay = (step) => {
    if (!hasShaping) return null;

    const shapingConfig = step.wizardConfig?.shapingConfig || step.advancedWizardConfig?.shapingConfig;

    if (!shapingConfig?.type) {
        // Legacy shaping detection
        return 'with shaping';
    }

    switch (shapingConfig.type) {
        case 'even_distribution':
            const action = shapingConfig.config?.action || 'changes';
            const amount = shapingConfig.config?.amount;
            return amount ? `${action} ${amount}` : action;

        case 'phases':
            const phases = shapingConfig.config?.phases?.length || 0;
            return `${phases} phases`;

        default:
            return 'with shaping';
    }
};

/**
 * Check if step is a special construction step
 * (Cast On, Bind Off, Attach to Piece, Put on Holder)
 */
export const isConstructionStep = (step) => {
    const pattern = getStepPatternName(step);
    return PATTERN_CATEGORIES.construction.includes(pattern);
};


/**
 * Check if step is an initialization step
 * Any step that starts a component (Cast On, Pick Up & Knit, Continue from Stitches, Custom Initialization)
 */
export const isInitializationStep = (step) => {
    const pattern = getStepPatternName(step);
    return [
        'Cast On',
        'Pick Up & Knit',
        'Continue from Stitches',
        'Custom Initialization'
    ].includes(pattern);
};

/**
 * Check if step is a finishing step
 * Any step that ends/completes a component
 */
export const isFinishingStep = (step) => {
    const pattern = getStepPatternName(step);
    return ['Bind Off', 'Put on Holder', 'Other Ending'].includes(pattern);
};

/**
 * Check if step is a middle/working step
 * Any step that's not initialization or finishing
 */
export const isMiddleStep = (step) => {
    return !isInitializationStep(step) && !isFinishingStep(step);
};

/**
 * ✅ NEW: Determine step type for routing and classification
 * Returns: 'initialization' | 'finalization' | 'shaping' | 'non-shaping'
 */
export const getStepType = (step) => {
    if (isInitializationStep(step)) return 'initialization';
    if (isFinishingStep(step)) return 'finalization';
    if (hasShaping(step)) return 'shaping';
    return 'non-shaping';
};

/**
 * Check if step is editable
 * Based on completion status and step type rules
 */
export const isStepEditable = (step, isComponentFinished = false) => {
    if (isComponentFinished) return false;
    if (step.completed) return false;

    // Cast On steps typically aren't editable after creation
    if (isInitializationStep(step)) return false;

    return true;
};

/**
 * Get comprehensive step summary for display
 * Returns object with all display properties
 */
export const getStepDisplayInfo = (step) => {
    return {
        pattern: getStepPatternName(step),
        patternDisplay: getStepPatternDisplay(step),
        method: getStepMethodDisplay(step),
        duration: getStepDurationDisplay(step),
        stitchChange: getStitchChangeDisplay(step),
        shaping: getShapingDisplay(step),
        isConstruction: isConstructionStep(step),
        isEditable: isStepEditable(step),
        startingStitches: step.startingStitches,
        endingStitches: step.endingStitches,
        totalRows: step.totalRows,
        construction: step.construction || 'flat'
    };
};

// ===== TARGET COMPONENT UTILITIES =====

/**
 * Get target component for Attach to Piece steps
 */
export const getAttachTargetDisplay = (step) => {
    const pattern = getStepPatternName(step);
    if (pattern !== 'Attach to Piece') return null;

    return step.wizardConfig?.stitchPattern?.targetComponent || 'Unknown Component';
};

/**
 * Get custom notes for ending steps
 */
export const getEndingNotes = (step) => {
    const pattern = getStepPatternName(step);

    if (pattern === 'Put on Holder' || pattern === 'Attach to Piece') {
        return step.wizardConfig?.stitchPattern?.customText || null;
    }

    return null;
};

// ===== PREP NOTES UTILITIES =====

/**
 * Get prep note from any possible location
 */
export const getStepPrepNote = (step) => {
    return step.prepNote ||
        step.wizardConfig?.prepNote ||
        step.advancedWizardConfig?.prepNote ||
        '';
};

// ===== VALIDATION UTILITIES =====

/**
 * Validate step has required configuration
 */
export const validateStepConfiguration = (step) => {
    const pattern = getStepPatternName(step);

    if (pattern === 'Unknown Pattern') {
        return { isValid: false, error: 'Missing pattern configuration' };
    }

    if (pattern === 'Cast On' && !step.wizardConfig?.stitchPattern?.stitchCount) {
        return { isValid: false, error: 'Cast On missing stitch count' };
    }

    if (typeof step.startingStitches !== 'number' || typeof step.endingStitches !== 'number') {
        return { isValid: false, error: 'Missing stitch count data' };
    }

    return { isValid: true };


};

/**
 * Check if step requires advanced row-by-row pattern editing
 * Used for both create and edit flows
 */
export const requiresAdvancedPatternEdit = (step) => {
    const pattern = getStepPatternName(step);
    return ['Custom pattern', 'Cable Pattern', 'Lace Pattern'].includes(pattern);
};

// And also add this overloaded version for when you just have the pattern name:
export const isAdvancedRowByRowPattern = (patternName) => {
    return ['Custom pattern', 'Cable Pattern', 'Lace Pattern'].includes(patternName);
};

// ===== COMPONENT STATE UTILITIES =====

/**
 * Determine component state based on its steps
 * Used by CompactComponentCard and other component displays
 */
export const getComponentState = (component) => {

    if (!component.steps || component.steps.length === 0) {
        return 'edit_mode';
    }

    const hasCastOn = component.steps.some(step =>
        isInitializationStep(step)
    );

    {/* const hasEnding = component.steps.some(step =>
        isFinishingStep(step)
    ); */}

    const hasEnding = component.steps.some(step =>
        isFinishingStep(step) || (typeof step.endingStitches === 'number' && step.endingStitches === 0)
    );

    const hasProgress = component.steps.some(step => step.completed);
    const allComplete = component.steps.every(step => step.completed);

    if (hasEnding && allComplete) return 'finished';
    if (hasCastOn && hasProgress) return 'currently_knitting';
    if (hasCastOn && hasEnding && !hasProgress) return 'ready_to_knit';

    return 'edit_mode';
};

/**
 * Validate pattern configuration based on pattern type and entry mode
 * Centralized validation for all pattern types
 */
export const validatePatternConfiguration = (stitchPattern) => {
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

    // Advanced Row-by-Row patterns (Custom, Cable, Lace)
    if (isAdvancedRowByRowPattern(pattern)) {
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

/**
 * Get component status with display formatting
 * Centralized logic for all component status displays
 * Used by: ComponentsTab, ManageSteps, and other component displays
 */
export const getComponentStatusWithDisplay = (component) => {
    // Status categories with display information
    const statusCategories = {
        'edit_mode': {
            display: '✏️ Edit Mode',
            headerStyle: 'header-status-edit-mode'
        },
        'ready_to_knit': {
            display: '⚡ Ready to Knit',
            headerStyle: 'header-status-ready'
        },
        'currently_knitting': {
            display: '🧶 Currently Knitting',
            headerStyle: 'header-status-progress'
        },
        'finished': {
            display: '✅ Finished',
            headerStyle: 'header-status-complete'
        },
        'finishing_in_progress': {
            display: '🔄 Finishing',
            headerStyle: 'header-status-progress'
        },
        'finishing_done': {
            display: '✅ Finished',
            headerStyle: 'header-status-complete'
        }
    };

    // Handle finishing components (special case)
    if (component.type === 'finishing') {
        if (component.isPlaceholder || !component.steps || component.steps.length === 0) {
            const status = 'finishing_in_progress';
            return {
                status,
                ...statusCategories[status]
            };
        }
        const allComplete = component.steps.every(s => s.completed);
        const manuallyConfirmed = component.finishingComplete;
        const status = (allComplete && manuallyConfirmed) ? 'finishing_done' : 'finishing_in_progress';
        return {
            status,
            ...statusCategories[status]
        };
    }

    // Use existing utility for regular components
    const status = getComponentState(component);

    return {
        status,
        ...statusCategories[status]
    };
};


/**
 * Get user-friendly validation error message
 * Helps with debugging and user feedback
 */
export const getPatternValidationError = (stitchPattern) => {
    if (!stitchPattern || !stitchPattern.pattern) {
        return 'No pattern selected';
    }

    const { pattern, entryMode, customText, rowsInPattern, rowInstructions, stitchCount, colorworkType } = stitchPattern;

    if (pattern === 'Cast On' && (!stitchCount || parseInt(stitchCount) <= 0)) {
        return 'Cast On requires a valid stitch count';
    }

    if (isAdvancedRowByRowPattern(pattern)) {
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

// Replace the THREE functions at the bottom of your file with this:

// ===== PATTERN CONFIGURATION (CONSOLIDATES 3 SWITCH STATEMENTS) =====

const PATTERN_CONFIG = {
    'Cable Pattern': {
        quickActions: ['K to end', 'P to end', 'C6F', 'C6B', 'T2F', 'T2B'],
        placeholderText: "e.g., 'K2, P2, C6F, P2, K2'",
        descriptionPlaceholder: "Describe your cable pattern crossings, directions, and any background stitches..."
    },
    'Lace Pattern': {
        quickActions: ['K to end', 'P to end', 'YO', 'K2tog', 'SSK', 'CDD'],
        placeholderText: "e.g., 'K1, YO, K2tog, K3, SSK, YO, K1'",
        descriptionPlaceholder: "Describe your lace pattern with key techniques and any chart references..."
    },
    'Custom pattern': {
        quickActions: ['K to end', 'P to end'],
        placeholderText: "e.g., '5 rows stockinette, 1 bobble row'",
        descriptionPlaceholder: "e.g., '5 rows stockinette, 1 bobble row'"
    }
};

const DEFAULT_PATTERN_CONFIG = {
    quickActions: ['K to end', 'P to end'],
    placeholderText: "Enter row instruction...",
    descriptionPlaceholder: "Describe your pattern..."
};

/**
 * Get quick action buttons for pattern type
 * Used by: RowByRowPatternConfig, EditRowByRowPatternForm
 */
export const getPatternQuickActions = (patternType) => {
    return PATTERN_CONFIG[patternType]?.quickActions || DEFAULT_PATTERN_CONFIG.quickActions;
};

/**
 * Get placeholder text for pattern row input
 * Used by: RowByRowPatternConfig, EditRowByRowPatternForm
 */
export const getPatternPlaceholderText = (patternType) => {
    return PATTERN_CONFIG[patternType]?.placeholderText || DEFAULT_PATTERN_CONFIG.placeholderText;
};

/**
 * Get description placeholder for pattern configuration
 * Used by: EditRowByRowPatternForm
 */
export const getPatternDescriptionPlaceholder = (patternType) => {
    return PATTERN_CONFIG[patternType]?.descriptionPlaceholder || DEFAULT_PATTERN_CONFIG.descriptionPlaceholder;
};


export default {
    getStepPatternName,
    getStepMethodDisplay,
    getStepPatternDisplay,
    getStepDurationDisplay,
    getStitchChangeDisplay,
    getShapingDisplay,
    getStepDisplayInfo,
    getAttachTargetDisplay,
    getEndingNotes,
    getStepPrepNote,
    isConstructionStep,
    isStepEditable,
    validateStepConfiguration,
    getComponentState,
    getPatternPlaceholderText,
    getStepType,
    getComponentStatusWithDisplay
};