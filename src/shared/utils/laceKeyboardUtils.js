// src/shared/utils/laceKeyboardUtils.js

/**
 * Lace Keyboard Utilities
 * 
 * Manages keyboard layouts, shift states, and pattern-specific configurations
 * for the enhanced lace pattern entry system.
 */

// ===== KEYBOARD LAYER DEFINITIONS =====

export const KEYBOARD_LAYERS = {
    PRIMARY: 'primary',
    SECONDARY: 'secondary',
    TERTIARY: 'tertiary'
};

/**
 * Get keyboard layout for specific pattern type and layer
 */
export const getKeyboardLayout = (patternType, layer = KEYBOARD_LAYERS.PRIMARY, context = {}) => {
    const { rowNumber, construction } = context;

    switch (patternType) {
        case 'Lace Pattern':
            return getLaceKeyboardLayout(layer, { rowNumber, construction });
        case 'Cable Pattern':
            return getCableKeyboardLayout(layer, { rowNumber, construction });
        case 'Custom pattern':
            return getCustomKeyboardLayout(layer);
        default:
            return getBasicKeyboardLayout(layer);
    }
};

/**
 * Lace pattern keyboard layouts
 */
const getLaceKeyboardLayout = (layer, context = {}) => {
    const { rowNumber, construction } = context;

    switch (layer) {
        case KEYBOARD_LAYERS.PRIMARY:
            // Context-aware ordering for WS rows
            const isWSRow = construction === 'flat' && rowNumber % 2 === 0;
            const mainActions = isWSRow
                ? ['P', 'K', 'YO', 'K2tog', 'SSK', 'CDD']
                : ['K', 'P', 'YO', 'K2tog', 'SSK', 'CDD'];

            return {
                fullRow: ['K all', 'P all'],
                input: mainActions,
                actions: ['⌫', '[', '⇧']
            };

        case KEYBOARD_LAYERS.SECONDARY:
            return {
                fullRow: ['K3tog', 'P2tog', 'S2KP', 'SK2P'],
                input: ['K2tog tbl', 'SSK tbl', 'SSP', 'Sl1', 'M1L', 'M1R'],
                actions: ['⌫', '[', '⇧']
            };

        case KEYBOARD_LAYERS.TERTIARY:
            return {
                fullRow: ['Custom 1', 'Custom 2', 'Custom 3', 'Custom 4'],
                input: ['Custom 5', 'Custom 6', 'Custom 7', 'Custom 8', 'Custom 9', '★'],
                actions: ['⌫', '[', '⇧']
            };

        default:
            return getLaceKeyboardLayout(KEYBOARD_LAYERS.PRIMARY, context);
    }
};

/**
 * Cable pattern keyboard layouts (future implementation)
 */
const getCableKeyboardLayout = (layer, context = {}) => {
    switch (layer) {
        case KEYBOARD_LAYERS.PRIMARY:
            return {
                fullRow: ['K all', 'P all'],
                input: ['K', 'P', 'C4F', 'C4B', 'C6F', 'C6B'],
                actions: ['⌫', '[', '⇧']
            };

        case KEYBOARD_LAYERS.SECONDARY:
            return {
                fullRow: ['T4F', 'T4B', 'C8F', 'C8B'],
                input: ['C10F', 'C10B', 'T2F', 'T2B', 'CN', 'RT'],
                actions: ['⌫', '[', '⇧']
            };

        case KEYBOARD_LAYERS.TERTIARY:
            return {
                fullRow: ['Cable 1', 'Cable 2', 'Cable 3', 'Cable 4'],
                input: ['Cable 5', 'Cable 6', 'Cable 7', 'Cable 8', 'Cable 9', '★'],
                actions: ['⌫', '[', '⇧']
            };

        default:
            return getCableKeyboardLayout(KEYBOARD_LAYERS.PRIMARY, context);
    }
};

/**
 * Basic/Custom pattern keyboard layouts
 */
const getCustomKeyboardLayout = (layer) => {
    switch (layer) {
        case KEYBOARD_LAYERS.PRIMARY:
            return {
                fullRow: ['K all', 'P all'],
                input: ['K', 'P'],
                actions: ['⌫', '[', '⇧']
            };

        default:
            return getCustomKeyboardLayout(KEYBOARD_LAYERS.PRIMARY);
    }
};

const getBasicKeyboardLayout = (layer) => {
    return {
        fullRow: ['K all', 'P all'],
        input: ['K', 'P'],
        actions: ['⌫', '[', '⇧']
    };
};

// ===== SHIFT MANAGEMENT =====

/**
 * Get next keyboard layer in cycle
 */
export const getNextKeyboardLayer = (currentLayer, patternType) => {
    // Different patterns may have different available layers
    const availableLayers = getAvailableLayers(patternType);
    const currentIndex = availableLayers.indexOf(currentLayer);
    const nextIndex = (currentIndex + 1) % availableLayers.length;
    return availableLayers[nextIndex];
};

/**
 * Get available keyboard layers for pattern type
 */
const getAvailableLayers = (patternType) => {
    switch (patternType) {
        case 'Lace Pattern':
            return [KEYBOARD_LAYERS.PRIMARY, KEYBOARD_LAYERS.SECONDARY, KEYBOARD_LAYERS.TERTIARY];
        case 'Cable Pattern':
            return [KEYBOARD_LAYERS.PRIMARY, KEYBOARD_LAYERS.SECONDARY, KEYBOARD_LAYERS.TERTIARY];
        case 'Custom pattern':
            return [KEYBOARD_LAYERS.PRIMARY];
        default:
            return [KEYBOARD_LAYERS.PRIMARY];
    }
};

/**
 * Get display name for keyboard layer
 */
export const getLayerDisplayName = (layer) => {
    switch (layer) {
        case KEYBOARD_LAYERS.PRIMARY:
            return 'Basic';
        case KEYBOARD_LAYERS.SECONDARY:
            return 'Advanced';
        case KEYBOARD_LAYERS.TERTIARY:
            return 'Custom';
        default:
            return 'Basic';
    }
};

// ===== BUTTON STYLING =====

/**
 * Get CSS classes for different button types
 */
export const getButtonStyles = (buttonType, isMobile = false) => {
    const baseClasses = isMobile ? 'h-10' : 'px-3 py-1';

    switch (buttonType) {
        case 'fullRow':
            return `${baseClasses} bg-sage-200 text-sage-800 rounded-lg text-sm font-medium hover:bg-sage-300 border border-sage-300 transition-colors`;

        case 'input':
            return `${baseClasses} bg-sage-100 text-sage-700 rounded-lg text-sm hover:bg-sage-200 transition-colors`;

        case 'action':
            return `${baseClasses} bg-lavender-100 text-lavender-700 rounded-lg text-sm font-medium hover:bg-lavender-200 border border-lavender-200 transition-colors`;

        case 'copy':
            return 'px-3 py-1 bg-yarn-100 text-yarn-700 rounded-lg text-sm hover:bg-yarn-200 transition-colors';

        case 'special':
            return `${baseClasses} bg-yellow-100 text-yellow-700 rounded-lg text-sm font-medium hover:bg-yellow-200 border border-yellow-200 transition-colors`;

        default:
            return `${baseClasses} bg-sage-100 text-sage-700 rounded-lg text-sm hover:bg-sage-200 transition-colors`;
    }
};

// ===== VALIDATION & HELPERS =====

/**
 * Check if an action is a custom/user-defined action
 */
export const isCustomAction = (action) => {
    return action.startsWith('Custom ') || action === '★';
};

/**
 * Check if pattern type supports multiple keyboard layers
 */
export const supportsMultipleLayers = (patternType) => {
    return ['Lace Pattern', 'Cable Pattern'].includes(patternType);
};

/**
 * Get pattern-specific placeholder text
 */
export const getPatternKeyboardPlaceholder = (patternType, layer) => {
    switch (patternType) {
        case 'Lace Pattern':
            switch (layer) {
                case KEYBOARD_LAYERS.SECONDARY:
                    return "Advanced lace techniques";
                case KEYBOARD_LAYERS.TERTIARY:
                    return "Custom lace patterns";
                default:
                    return "Basic lace stitches";
            }
        case 'Cable Pattern':
            switch (layer) {
                case KEYBOARD_LAYERS.SECONDARY:
                    return "Advanced cable crossings";
                case KEYBOARD_LAYERS.TERTIARY:
                    return "Project-specific cables";
                default:
                    return "Basic cable crossings";
            }
        default:
            return "Pattern stitches";
    }
};

export default {
    KEYBOARD_LAYERS,
    getKeyboardLayout,
    getNextKeyboardLayer,
    getLayerDisplayName,
    getButtonStyles,
    isCustomAction,
    supportsMultipleLayers,
    getPatternKeyboardPlaceholder
};