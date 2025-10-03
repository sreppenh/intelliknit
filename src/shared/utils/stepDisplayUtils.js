// src/shared/utils/stepDisplayUtils.js
/**
 * Step Display Utilities - Data-Driven Approach
 * 
 * Replaces string parsing with structured data access.
 * Single source of truth for step display across the application.
 */

// ===== IMPORTS =====

import { getConstructionTerms } from './ConstructionTerminology';
import {
    getCastOnDisplayName,
    getBindOffDisplayName,
    getPickUpDisplayName,
    getAttachDisplayName,
    getContinueDisplayName,
    getCustomInitDisplayName,
    PATTERN_CATEGORIES
} from './constants';

// ===== LEGACY COMPATIBILITY LAYER =====
// These will be removed in Phase 4 after all files are migrated

const CAST_ON_METHODS = {
    'long_tail': 'Long Tail',
    'cable': 'Cable Cast On',
    'knitted': 'Knitted Cast On',
    'backwards_loop': 'Backwards Loop',
    'provisional': 'Provisional',
    'judy': 'Judy\'s Magic',
    'german_twisted': 'German Twisted',
    'garter_tab': 'Garter Tab',
    'tubular': 'Tubular (Italian)'
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

// Keep old PATTERN_CATEGORIES for backwards compatibility
const OLD_PATTERN_CATEGORIES = {
    'construction': ['Cast On', 'Pick Up & Knit', 'Continue from Stitches', 'Custom Initialization', 'Bind Off', 'Put on Holder', 'Other Ending'],
    'texture': ['Stockinette', 'Garter', 'Reverse Stockinette', '1x1 Rib', '2x2 Rib', 'Seed Stitch', 'Moss Stitch'],
    'colorwork': ['Stranded Colorwork', 'Intarsia', 'Fair Isle', 'Mosaic'],
    'structure': ['Lace', 'Cable', 'Brioche']
};

// ===== 🆕 EXPANDED PATTERN CONFIGURATION - SINGLE SOURCE OF TRUTH =====

/**
 * COMPREHENSIVE PATTERN REGISTRY
 * This replaces ALL hardcoded pattern checks throughout the application.
 * 
 * Adding a new pattern type? Just add ONE entry here and everything works!
 */
const PATTERN_CONFIG = {
    // ===== ADVANCED ROW-BY-ROW PATTERNS =====
    'Lace Pattern': {
        // Existing keyboard config (preserved)
        quickActions: ['K to end', 'P to end', 'YO', 'K2tog', 'SSK', 'CDD'],
        placeholderText: "e.g., 'K1, YO, K2tog, K3, SSK, YO, K1'",
        descriptionPlaceholder: "Describe your lace pattern with key techniques and any chart references...",

        // 🆕 Pattern classification
        category: 'structure',
        requiresAdvancedRowByRow: true,
        isAdvancedPattern: true,

        // 🆕 Validation rules
        requiresCustomText: false,      // Only required in description mode
        requiresRowsInPattern: true,    // Always required

        // 🆕 UI behavior (different from colorwork patterns)
        needsDescriptionInput: false,   // No description input in basic config
        needsRowInput: false,           // No row input in basic config

        // 🆕 Keyboard configuration
        keyboardPatternKey: 'lace',
        keyboardLayer: 'SECONDARY',
        // Added
        supportsMultipleLayers: true,
        supportsManualNumbers: false,  // Only contextual numbers (brackets/parens)
        availableLayers: ['primary', 'secondary'], // Only 2 layers


        // 🆕 Step generation behavior
        includesInRowCountPatterns: true,

        // 🆕 UI configuration tips
        configurationTips: [
            'Include chart name or written instructions',
            'Note any yarn-over/decrease pairings',
            'Mention blocking requirements if important'
        ]


    },

    'Cable Pattern': {
        quickActions: ['K to end', 'P to end', 'C6F', 'C6B', 'T2F', 'T2B'],
        placeholderText: "e.g., 'K2, P2, C6F, P2, K2'",
        descriptionPlaceholder: "Describe your cable pattern crossings, directions, and any background stitches...",
        category: 'structure',
        requiresAdvancedRowByRow: true,
        isAdvancedPattern: true,
        requiresCustomText: false,
        requiresRowsInPattern: true,
        needsDescriptionInput: false,
        needsRowInput: false,
        keyboardPatternKey: 'cable',
        keyboardLayer: 'TERTIARY',
        supportsMultipleLayers: true,
        supportsManualNumbers: true,
        availableLayers: ['primary', 'secondary', 'tertiary'], // All 3 layers

        includesInRowCountPatterns: true,
        configurationTips: [
            'Describe cable crossing (e.g., "6-st left cross")',
            'Include chart reference if you have one',
            'Note cable needle size if specific'
        ]
    },


    'Custom Texture': {
        // Keyboard config 
        quickActions: ['K to end', 'P to end', 'K', 'P', 'Bobble', 'Sl1', 'Sl1 wyif'],
        placeholderText: "e.g., 'K2, P2, Bobble, P2, K2'",
        descriptionPlaceholder: "Describe your custom texture pattern...",

        // Classification (same as Cable/Lace)
        category: 'texture',
        requiresAdvancedRowByRow: true,
        isAdvancedPattern: true,

        // Validation (same as Cable/Lace)
        requiresCustomText: false,
        requiresRowsInPattern: true,
        needsDescriptionInput: false,
        needsRowInput: false,

        // Keyboard setup (simplified vs Cable/Lace)
        keyboardPatternKey: 'custom_texture',
        keyboardLayer: null,
        supportsMultipleLayers: false,
        supportsManualNumbers: true,    // ← This enables brackets/parens with numerical keyboard
        availableLayers: ['PRIMARY'],

        includesInRowCountPatterns: true,

        configurationTips: [
            'Use K and P for basic stitches',
            'Add Bobble for texture interest',
            'Use brackets [ ] for repeats',
            'Use parentheses ( ) for stitch groups'
        ]
    },

    'Brioche': {
        // Copy from Lace Pattern, but customize keyboard
        quickActions: ['K to end', 'P to end', 'brk1', 'brp1', 'sl1yo'],
        placeholderText: "e.g., 'sl1yo, brk1 to end'",
        descriptionPlaceholder: "Describe your brioche pattern...",

        category: 'structure',
        requiresAdvancedRowByRow: true,
        isAdvancedPattern: true,

        requiresCustomText: false,
        requiresRowsInPattern: true,
        needsDescriptionInput: false,
        needsRowInput: false,

        keyboardPatternKey: 'brioche',
        keyboardLayer: null,  // Single layer for now
        supportsMultipleLayers: false,
        supportsManualNumbers: true,
        availableLayers: ['primary'],

        includesInRowCountPatterns: true,

        configurationTips: [
            'Brioche stitches work in pairs across rows',
            'brk1 and brp1 each consume 2 stitches',
            'sl1yo consumes 1 stitch and creates 2'
        ]
    },

    'Custom pattern': {
        quickActions: ['K to end', 'P to end'],
        placeholderText: "e.g., '5 rows stockinette, 1 bobble row'",
        descriptionPlaceholder: "e.g., '5 rows stockinette, 1 bobble row'",
        category: 'texture',
        requiresAdvancedRowByRow: true,
        isAdvancedPattern: true,
        requiresCustomText: true,       // Always required
        requiresRowsInPattern: true,
        needsDescriptionInput: true,    // Shows description input in basic config
        needsRowInput: false,
        keyboardPatternKey: 'general',
        keyboardLayer: null,            // No special keyboard layer
        supportsMultipleLayers: false,
        supportsManualNumbers: true,
        availableLayers: ['PRIMARY'], // Only primary layer

        includesInRowCountPatterns: false, // Different generation logic
        configurationTips: [
            'Describe your custom pattern clearly',
            'Include any special techniques or notes'
        ]
    },

    // ===== COLORWORK PATTERNS (Need description + rows, but not advanced row-by-row) =====
    'Fair Isle': {
        quickActions: ['K to end', 'P to end'],
        placeholderText: "Enter row instruction...",
        descriptionPlaceholder: "Describe your Fair Isle pattern...",
        category: 'colorwork',
        requiresAdvancedRowByRow: false,
        isAdvancedPattern: false,
        requiresCustomText: true,
        requiresRowsInPattern: true,
        needsDescriptionInput: true,    // Shows in basic config (different from Lace)
        needsRowInput: true,            // Shows in basic config (different from Lace)
        keyboardPatternKey: 'general',
        keyboardLayer: null,
        supportsMultipleLayers: false,
        supportsManualNumbers: true,
        availableLayers: ['PRIMARY'],

        includesInRowCountPatterns: true,
        configurationTips: [
            'List color names or codes',
            'Describe the motif or pattern sequence',
            'Note any chart references',
            'Include float management techniques'
        ]
    },

    'Intarsia': {
        quickActions: ['K to end', 'P to end'],
        placeholderText: "Enter row instruction...",
        descriptionPlaceholder: "Describe your Intarsia pattern...",
        category: 'colorwork',
        requiresAdvancedRowByRow: false,
        isAdvancedPattern: false,
        requiresCustomText: true,
        requiresRowsInPattern: true,
        needsDescriptionInput: true,
        needsRowInput: true,
        keyboardPatternKey: 'general',
        keyboardLayer: null,
        supportsMultipleLayers: false,
        supportsManualNumbers: true,
        availableLayers: ['PRIMARY'],

        includesInRowCountPatterns: true,
        configurationTips: [
            'List color names or codes',
            'Describe the motif or pattern sequence',
            'Note any chart references',
            'Include bobbin or yarn management notes'
        ]
    },

    'Stripes': {
        quickActions: ['K to end', 'P to end'],
        placeholderText: "Enter row instruction...",
        descriptionPlaceholder: "Describe your stripe pattern...",
        category: 'colorwork',
        requiresAdvancedRowByRow: false,
        isAdvancedPattern: false,
        requiresCustomText: true,
        requiresRowsInPattern: true,
        needsDescriptionInput: true,
        needsRowInput: true,
        keyboardPatternKey: 'general',
        keyboardLayer: null,
        supportsMultipleLayers: false,
        supportsManualNumbers: true,
        availableLayers: ['PRIMARY'],

        includesInRowCountPatterns: true,
        configurationTips: [
            'List colors and row counts: "2 rows Navy, 4 rows Cream"',
            'Note any special color change techniques',
            'Include total repeat if complex sequence',
            'Mention if stripes are jogless (for circular knitting)'
        ]
    },

    // ===== BASIC PATTERNS (No special requirements) =====
    'Stockinette': {
        quickActions: ['K to end', 'P to end'],
        placeholderText: "Enter row instruction...",
        descriptionPlaceholder: "Describe your pattern...",
        category: 'texture',
        requiresAdvancedRowByRow: false,
        isAdvancedPattern: false,
        requiresCustomText: false,
        requiresRowsInPattern: false,
        needsDescriptionInput: false,
        needsRowInput: false,
        keyboardPatternKey: 'general',
        keyboardLayer: null,
        supportsMultipleLayers: false,
        supportsManualNumbers: true,
        availableLayers: ['PRIMARY'],

        includesInRowCountPatterns: false,
        configurationTips: []
    },

    'Garter': {
        quickActions: ['K to end', 'P to end'],
        placeholderText: "Enter row instruction...",
        descriptionPlaceholder: "Describe your pattern...",
        category: 'texture',
        requiresAdvancedRowByRow: false,
        isAdvancedPattern: false,
        requiresCustomText: false,
        requiresRowsInPattern: false,
        needsDescriptionInput: false,
        needsRowInput: false,
        keyboardPatternKey: 'general',
        keyboardLayer: null,
        supportsMultipleLayers: false,
        supportsManualNumbers: true,
        availableLayers: ['PRIMARY'],

        includesInRowCountPatterns: false,
        configurationTips: []
    },

    // ===== CONSTRUCTION PATTERNS =====
    'Cast On': {
        quickActions: ['K to end', 'P to end'],
        placeholderText: "Enter row instruction...",
        descriptionPlaceholder: "Describe your pattern...",
        category: 'construction',
        requiresAdvancedRowByRow: false,
        isAdvancedPattern: false,
        requiresCustomText: false,
        requiresRowsInPattern: false,
        needsDescriptionInput: false,
        needsRowInput: false,
        keyboardPatternKey: 'general',
        keyboardLayer: null,
        supportsMultipleLayers: false,
        supportsManualNumbers: true,
        availableLayers: ['PRIMARY'],

        includesInRowCountPatterns: false,
        configurationTips: []
    },

    'Bind Off': {
        quickActions: ['K to end', 'P to end'],
        placeholderText: "Enter row instruction...",
        descriptionPlaceholder: "Describe your pattern...",
        category: 'construction',
        requiresAdvancedRowByRow: false,
        isAdvancedPattern: false,
        requiresCustomText: false,
        requiresRowsInPattern: false,
        needsDescriptionInput: false,
        needsRowInput: false,
        keyboardPatternKey: 'general',
        keyboardLayer: null,
        supportsMultipleLayers: false,
        supportsManualNumbers: true,
        availableLayers: ['PRIMARY'],

        includesInRowCountPatterns: false,
        configurationTips: []
    }
};

const DEFAULT_PATTERN_CONFIG = {
    quickActions: ['K to end', 'P to end'],
    placeholderText: "Enter row instruction...",
    descriptionPlaceholder: "Describe your pattern...",
    category: 'texture',
    requiresAdvancedRowByRow: false,
    isAdvancedPattern: false,
    requiresCustomText: false,
    requiresRowsInPattern: false,
    needsDescriptionInput: false,
    needsRowInput: false,
    keyboardPatternKey: 'general',
    keyboardLayer: null,
    supportsMultipleLayers: false,
    supportsManualNumbers: true,
    availableLayers: ['PRIMARY'],
    includesInRowCountPatterns: false,
    configurationTips: []
};

// ===== 🆕 NEW UTILITY FUNCTIONS (Replace ALL hardcoded checks) =====

/**
 * Get complete configuration for a pattern
 * @param {string} patternName - The pattern name
 * @returns {object} Complete pattern configuration
 */
export const getPatternConfig = (patternName) => {
    return PATTERN_CONFIG[patternName] || DEFAULT_PATTERN_CONFIG;
};

// ===== CENTRALIZED REPLACEMENT FUNCTIONS =====
// These functions replace ALL the hardcoded arrays we found in the audit

/**
 * 🔄 REPLACES: ['Custom pattern', 'Cable Pattern', 'Lace Pattern'].includes(pattern)
 * Used by: stepDisplayUtils.js, EditPatternModal.jsx
 */
export const requiresAdvancedPatternEdit = (step) => {
    const pattern = getStepPatternName(step);
    return getPatternConfig(pattern).requiresAdvancedRowByRow === true;
};

/**
 * 🔄 REPLACES: ['Custom pattern', 'Cable Pattern', 'Lace Pattern'].includes(patternName)
 * Used by: stepDisplayUtils.js (overloaded version)
 */
export const isAdvancedRowByRowPattern = (patternName) => {
    return getPatternConfig(patternName).requiresAdvancedRowByRow === true;
};

/**
 * 🔄 REPLACES: patternType === 'Lace Pattern' ? 'lace' : patternType === 'Cable Pattern' ? 'cable' : 'general'
 * Used by: EnhancedKeyboard.jsx, CustomActionEditor.jsx, RowByRowPatternConfig.jsx (5+ locations)
 */
export const getKeyboardPatternKey = (patternType) => {
    return getPatternConfig(patternType).keyboardPatternKey;
};

/**
 * 🔄 REPLACES: ['Fair Isle', 'Intarsia', 'Stripes'].includes(pattern)
 * Used by: BasicPatternConfig.jsx (needsDescription, needsRowInput)
 */
export const needsDescriptionInput = (patternName) => {
    return getPatternConfig(patternName).needsDescriptionInput === true;
};

export const needsRowInput = (patternName) => {
    return getPatternConfig(patternName).needsRowInput === true;
};

/**
 * 🔄 REPLACES: ['Lace Pattern', 'Cable Pattern', 'Fair Isle', 'Intarsia', 'Stripes'].includes(pattern)
 * Used by: useStepGeneration.js, useStepValidation.js
 */
export const includesInRowCountPatterns = (patternName) => {
    return getPatternConfig(patternName).includesInRowCountPatterns === true;
};

/**
 * 🔄 REPLACES: individual pattern === 'Lace Pattern' && configurationTips
 * Used by: EditPatternModal.jsx
 */
export const getPatternConfigurationTips = (patternName) => {
    return getPatternConfig(patternName).configurationTips || [];
};

/**
 * 🔄 REPLACES: ['Cable Pattern', 'Lace Pattern'].includes(patternType)
 * Used by: PatternInputContainer.jsx, EnhancedKeyboard.jsx
 */
export const isAdvancedPattern = (patternName) => {
    return getPatternConfig(patternName).isAdvancedPattern === true;
};

/**
 * 🔄 REPLACES: layer === KEYBOARD_LAYERS.SECONDARY && patternType === 'Lace Pattern'
 * Used by: EnhancedKeyboard.jsx
 */
export const getKeyboardLayer = (patternName) => {
    return getPatternConfig(patternName).keyboardLayer;
};

/**
 * Check if pattern requires custom text validation
 * Used by validation functions
 */
export const requiresCustomText = (patternName) => {
    return getPatternConfig(patternName).requiresCustomText === true;
};

/**
 * Check if pattern requires rows in pattern validation
 * Used by validation functions
 */
export const requiresRowsInPattern = (patternName) => {
    return getPatternConfig(patternName).requiresRowsInPattern === true;
};

// ===== CORE UTILITY FUNCTIONS (Preserved as-is) =====

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
 * ✅ MIGRATED: Now uses constants.js as source of truth
 */
export const getStepMethodDisplay = (step) => {
    const pattern = getStepPatternName(step);
    const method = step.wizardConfig?.stitchPattern?.method;
    const customText = step.wizardConfig?.stitchPattern?.customText;

    if (!method) return '';

    // Handle "other" method for all patterns
    if (method === 'other' && customText) return customText;

    // Use new constants with fallback to legacy
    switch (pattern) {
        case 'Cast On':
            return getCastOnDisplayName(method) || CAST_ON_METHODS[method] || method;

        case 'Pick Up & Knit':
            return getPickUpDisplayName(method) || PICK_UP_KNIT_METHODS[method] || method;

        case 'Continue from Stitches':
            return getContinueDisplayName(method) || CONTINUE_METHODS[method] || method;

        case 'Custom Initialization':
            return getCustomInitDisplayName(method) || CUSTOM_INITIALIZATION_METHODS[method] || method;

        case 'Bind Off':
            return getBindOffDisplayName(method) || BIND_OFF_METHODS[method] || method;

        case 'Attach to Piece':
            return getAttachDisplayName(method) || ATTACH_METHODS[method] || method;

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
            const referenceText = duration.reference ? ` from ${duration.reference}` : '';
            return `${duration.value} ${duration.units}${referenceText}`;

        case 'repeats':
            return `${duration.value} repeats`;

        // ✅ NEW: Color repeats display
        case 'color_repeats':
            return `${duration.value} color repeats`;

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
 * ✅ MIGRATED: Now uses constants.js
 */
export const isConstructionStep = (step) => {
    const pattern = getStepPatternName(step);
    return (PATTERN_CATEGORIES.CONSTRUCTION || OLD_PATTERN_CATEGORIES.construction).includes(pattern);
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
 * 🔄 UPDATED: Validate pattern configuration using centralized config
 * Replaces hardcoded arrays with getPatternConfig()
 */
export const validatePatternConfiguration = (stitchPattern) => {
    if (!stitchPattern || !stitchPattern.pattern) {
        return false;
    }

    const { pattern, entryMode, customText, rowsInPattern, rowInstructions, stitchCount, colorworkType } = stitchPattern;
    const config = getPatternConfig(pattern);

    // Cast On patterns - need stitch count
    if (pattern === 'Cast On') {
        return stitchCount && parseInt(stitchCount) > 0;
    }

    // Bind Off patterns - always valid (minimal config needed)
    if (pattern === 'Bind Off') {
        return true;
    }

    // Advanced Row-by-Row patterns (Custom, Cable, Lace)
    if (config.requiresAdvancedRowByRow) {
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

    // 🔄 REPLACED: Traditional complex patterns using centralized config
    if (config.requiresCustomText && config.requiresRowsInPattern) {
        return customText && customText.trim() !== '' &&
            rowsInPattern && parseInt(rowsInPattern) > 0;
    }

    // Other pattern - needs description
    if (pattern === 'Other') {
        return customText && customText.trim() !== '';
    }

    // Basic patterns - always valid
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
 * 🔄 UPDATED: Get user-friendly validation error message using centralized config
 * Replaces hardcoded arrays with getPatternConfig()
 */
export const getPatternValidationError = (stitchPattern, construction = 'flat') => {
    const terms = getConstructionTerms(construction);

    if (!stitchPattern || !stitchPattern.pattern) {
        return 'No pattern selected';
    }

    const { pattern, entryMode, customText, rowsInPattern, rowInstructions, stitchCount, colorworkType } = stitchPattern;
    const config = getPatternConfig(pattern);

    if (pattern === 'Cast On' && (!stitchCount || parseInt(stitchCount) <= 0)) {
        return 'Cast On requires a valid stitch count';
    }

    if (config.requiresAdvancedRowByRow) {
        if (entryMode === 'row_by_row') {
            if (!rowInstructions || rowInstructions.length === 0) {
                return `${terms.Row}-by-${terms.row} mode requires at least one ${terms.row} instruction`;
            }
        } else {
            if (!customText || customText.trim() === '') {
                return 'Description mode requires pattern description';
            }
            if (!rowsInPattern || parseInt(rowsInPattern) <= 0) {
                return `Description mode requires number of ${terms.rows} in pattern`;
            }
        }
    }

    if (pattern === 'Colorwork') {
        if (!colorworkType) return 'Colorwork requires type selection';
        if (!customText || customText.trim() === '') return 'Colorwork requires description';
        if (!rowsInPattern || parseInt(rowsInPattern) <= 0) return 'Colorwork requires rows in pattern';
    }

    // 🔄 REPLACED: Use centralized config instead of hardcoded array
    if (config.requiresCustomText && (!customText || customText.trim() === '')) {
        return `${pattern} requires description`;
    }

    if (config.requiresRowsInPattern && (!rowsInPattern || parseInt(rowsInPattern) <= 0)) {
        return `${pattern} requires ${terms.rows} in pattern`;
    }

    if (pattern === 'Other' && (!customText || customText.trim() === '')) {
        return 'Other pattern requires description';
    }

    return null; // No validation errors
};

// ===== EXISTING KEYBOARD UTILITY FUNCTIONS (Preserved) =====

/**
 * Get quick action buttons for pattern type
 * Used by: RowByRowPatternConfig, EditRowByRowPatternForm
 */
export const getPatternQuickActions = (patternType) => {
    return getPatternConfig(patternType).quickActions;
};

/**
 * Get placeholder text for pattern row input
 * Used by: RowByRowPatternConfig, EditRowByRowPatternForm
 */
export const getPatternPlaceholderText = (patternType) => {
    return getPatternConfig(patternType).placeholderText;
};

/**
 * Get description placeholder for pattern configuration
 * Used by: EditRowByRowPatternForm
 */
export const getPatternDescriptionPlaceholder = (patternType) => {
    return getPatternConfig(patternType).descriptionPlaceholder;
};

// New keyboard related funtions!!

/**
 * 🔄 REPLACES: ['Lace Pattern', 'Cable Pattern'].includes(patternType)
 * Used by: patternKeyboardUtils.js
 */
export const supportsMultipleLayers = (patternName) => {
    return getPatternConfig(patternName).supportsMultipleLayers === true;
};

/**
 * 🔄 REPLACES: switch statement in patternKeyboardUtils.js supportsManualNumbers()
 * Used by: patternKeyboardUtils.js
 */
export const supportsManualNumbers = (patternName) => {
    return getPatternConfig(patternName).supportsManualNumbers !== false; // Default true
};

/**
 * 🔄 REPLACES: switch statement in patternKeyboardUtils.js getAvailableLayers()
 * Used by: patternKeyboardUtils.js
 */
export const getAvailableLayers = (patternName) => {
    return getPatternConfig(patternName).availableLayers || ['PRIMARY'];
};

// ===== EXPORT EVERYTHING =====

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
    getComponentStatusWithDisplay,
    supportsMultipleLayers,
    supportsManualNumbers,
    getAvailableLayers,

    // 🆕 NEW CENTRALIZED FUNCTIONS
    getPatternConfig,
    requiresAdvancedPatternEdit,
    isAdvancedRowByRowPattern,
    getKeyboardPatternKey,
    needsDescriptionInput,
    needsRowInput,
    includesInRowCountPatterns,
    getPatternConfigurationTips,
    isAdvancedPattern,
    getKeyboardLayer,
    requiresCustomText,
    requiresRowsInPattern
};