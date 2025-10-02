// src/shared/utils/patternKeyboardUtils.js
/**
 * Pattern Keyboard Utilities
 * 
 * Manages keyboard layouts, shift states, and pattern-specific configurations
 * for enhanced pattern entry (Lace, Cable, Custom, etc.)
 */

import {
    getKeyboardPatternKey,
    supportsMultipleLayers as centralizedSupportsMultipleLayers,
    supportsManualNumbers as centralizedSupportsManualNumbers,
    getAvailableLayers as centralizedGetAvailableLayers
} from './stepDisplayUtils';

// ===== KEYBOARD LAYER DEFINITIONS =====

export const KEYBOARD_LAYERS = {
    PRIMARY: 'primary',
    SECONDARY: 'secondary',
    TERTIARY: 'tertiary'
};

// ===== MAIN KEYBOARD LAYOUT FUNCTION =====

export const getKeyboardLayout = (patternType, layer = KEYBOARD_LAYERS.PRIMARY, context = {}) => {
    const { rowNumber, construction } = context;

    switch (patternType) {
        case 'Lace Pattern':
            return getLaceKeyboardLayout(layer, { rowNumber, construction });
        case 'Cable Pattern':
            return getCableKeyboardLayout(layer, { rowNumber, construction });
        case 'Custom pattern':
            return getCustomKeyboardLayout(layer);
        // In getKeyboardLayout function, add this case after 'Custom pattern':
        case 'Custom Texture':
            return getCustomTextureKeyboardLayout(layer);
        case 'Brioche':
            return getBriocheKeyboardLayout(layer);
        default:
            return getBasicKeyboardLayout(layer);
    }
};

// ===== PATTERN-SPECIFIC KEYBOARD LAYOUTS =====

const getLaceKeyboardLayout = (layer, context = {}) => {
    switch (layer) {
        case KEYBOARD_LAYERS.PRIMARY:
            const mainActions = context?.customSort === 'purl_first' ?
                ['P', 'K', 'YO', 'K2tog', 'SSK', 'CDD']
                : ['K', 'P', 'YO', 'K2tog', 'SSK', 'CDD'];

            return {
                fullRow: ['K to end', 'P to end'],
                input: mainActions,
                actions: ['⌫', '[', '(', '⇧']
            };

        case KEYBOARD_LAYERS.SECONDARY:
            return {
                fullRow: ['K3tog', 'P2tog', 'S2KP', 'SK2P'],
                input: ['K2tog tbl', 'SSK tbl', 'SSP', 'Sl1', 'M1L', 'M1R'],
                actions: ['⌫', '[', '(', '⇧'],
                custom: ['Custom', 'Custom', 'Custom', 'Custom']
            };

        case KEYBOARD_LAYERS.TERTIARY:
        default:
            return getLaceKeyboardLayout(KEYBOARD_LAYERS.PRIMARY, context);
    }
};

const getCableKeyboardLayout = (layer, context = {}) => {
    switch (layer) {
        case KEYBOARD_LAYERS.PRIMARY:
            return {
                fullRow: ['K/P as set', 'K to end', 'P to end'],
                input: ['1/1 LC', '2/2 LC', 'K', 'P', '2/2 RC', '1/1 RC'],
                actions: ['⌫', '[', '(', '⇧'] // ✅ Added missing parenthesis
            };

        case KEYBOARD_LAYERS.SECONDARY:
            return {
                fullRow: ['3/3 LC', '3/3 RC', '4/4 LC', '4/4 RC'],
                input: ['1/2 LC', '2/1 LPC', 'Sl1', '2/1 RPC', '1/2 RC'],
                actions: ['⌫', '[', '(', '⇧']
            };

        case KEYBOARD_LAYERS.TERTIARY:
            return {
                fullRow: ['6/6 LC', '6/6 RC', '8/8 LC', '8/8 RC'],
                input: ['1/1 LPC', '2/2 LPC', '2/2 RPC', '1/1 RPC'],
                actions: ['⌫', '[', '(', '⇧'],
                custom: ['Custom', 'Custom', 'Custom', 'Custom']
            };

        default:
            return getCableKeyboardLayout(KEYBOARD_LAYERS.PRIMARY, context);
    }
};

const getBriocheKeyboardLayout = (layer) => {
    return {
        fullRow: ['K to end', 'P to end'],
        input: ['brk1', 'brp1', 'sl1yo', 'Sl1', 'Sl1 wyif', 'K2tog', 'K3tog', 'K', 'P'],
        actions: ['⌫', '[', '(']
    };
};



const getCustomKeyboardLayout = (layer) => {
    return {
        fullRow: ['K to end', 'P to end'],
        input: ['K', 'P'],
        actions: ['⌫', '[', '(', '⇧']
    };
};

// Add this new function after getCustomKeyboardLayout:
const getCustomTextureKeyboardLayout = (layer) => {
    return {
        fullRow: ['K to end', 'P to end', 'K/P as set'],
        input: ['K', 'P', 'Bobble', 'Sl1', 'Sl1 wyif'],
        actions: ['⌫', '[', '(']
    };
};



const getBasicKeyboardLayout = (layer) => {
    return {
        fullRow: ['K to end', 'P to end'],
        input: ['K', 'P'],
        actions: ['⌫', '[', '(', '⇧']
    };
};

// ===== KEYBOARD LAYER MANAGEMENT =====

export const getNextKeyboardLayer = (currentLayer, patternType) => {
    const availableLayers = getAvailableLayers(patternType);
    const currentIndex = availableLayers.indexOf(currentLayer);
    const nextIndex = (currentIndex + 1) % availableLayers.length;
    return availableLayers[nextIndex];
};

// 🔄 REPLACED: Now uses centralized configuration
const getAvailableLayers = (patternType) => {
    return centralizedGetAvailableLayers(patternType);
};

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

export const getButtonStyles = (buttonType, isMobile = false) => {
    const baseClasses = isMobile ? 'h-10' : 'px-3 py-2 min-h-[40px]';

    // Add minimum widths to prevent wrapping on screen resize
    const minWidthClass = 'min-w-[60px]'; // Minimum 60px width for all buttons

    switch (buttonType) {
        case 'fullRow':
            return `${baseClasses} ${minWidthClass} bg-sage-200 text-sage-800 rounded-lg text-sm font-medium hover:bg-sage-300 border border-sage-300 transition-colors flex-1 text-center`;
        case 'input':
            const inputTextSize = isMobile ? 'text-base' : 'text-sm';
            return `${baseClasses} ${minWidthClass} bg-sage-100 text-sage-700 rounded-lg ${inputTextSize} hover:bg-sage-200 transition-colors`;
        case 'action':
            const textSize = isMobile ? 'text-lg' : 'text-sm';
            return `${baseClasses} ${minWidthClass} bg-lavender-100 text-lavender-700 rounded-lg ${textSize} font-medium hover:bg-lavender-200 border border-lavender-200 transition-colors`;
        case 'copy':
            return `px-3 py-1 ${minWidthClass} bg-yarn-100 text-yarn-700 rounded-lg text-sm hover:bg-yarn-200 transition-colors`;
        case 'special':
            return `${baseClasses} ${minWidthClass} bg-yarn-100 text-yarn-700 rounded-lg text-sm font-medium hover:bg-yarn-200 border border-yarn-200 transition-colors`;
        default:
            return `${baseClasses} ${minWidthClass} bg-sage-100 text-sage-700 rounded-lg text-sm hover:bg-sage-200 transition-colors`;
    }
};

/**
 * 🔄 REPLACED: Get custom actions using centralized pattern key
 * @param {string} patternType - Pattern type (Lace Pattern, Cable Pattern, etc.)
 * @param {Object} project - Current project object
 * @returns {Array} - Array of 4 custom actions (with 'Custom' as fallback)
 */
export const getCustomActions = (patternType, project = {}) => {
    // ✅ ALREADY UPDATED: Uses centralized getKeyboardPatternKey
    const key = getKeyboardPatternKey(patternType);

    const projectCustomActions = project?.customKeyboardActions?.[key] || [];

    // Ensure we always have exactly 4 slots
    const customActions = [...projectCustomActions];
    while (customActions.length < 4) {
        customActions.push('Custom');
    }

    return customActions.slice(0, 4); // Only take first 4
};

// ===== 🔄 REPLACED: VALIDATION & HELPERS USING CENTRALIZED FUNCTIONS =====

// ✅ UPDATED: Now uses centralized functions instead of hardcoded arrays
export const supportsMultipleLayers = (patternType) => {
    return centralizedSupportsMultipleLayers(patternType);
};

export const supportsManualNumbers = (patternType) => {
    return centralizedSupportsManualNumbers(patternType);
};

export const isCustomAction = (action) => {
    return action.startsWith('Custom ') || action === '★';
};

/**
 * Check if an action is a "work to end" type action
 * Centralized function to avoid hardcoding this everywhere
 * @param {string} action - The action to check
 * @returns {boolean} - True if this action works to the end of the row
 */
export const isWorkToEndAction = (action) => {
    const workToEndActions = [
        'K to end',
        'P to end',
        'K/P as set',
        'K all',  // Legacy support
        'P all'   // Legacy support
    ];
    return workToEndActions.includes(action);
};

export default {
    KEYBOARD_LAYERS,
    getKeyboardLayout,
    getNextKeyboardLayer,
    getLayerDisplayName,
    getButtonStyles,
    supportsMultipleLayers,
    isCustomAction
};