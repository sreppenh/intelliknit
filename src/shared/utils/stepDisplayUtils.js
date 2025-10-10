// src/shared/utils/stepDisplayUtils.js
/**
 * Step Display Utilities - Data-Driven Approach
 * 
 * CLEANED VERSION - All keyboard-related utilities removed
 */

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

// ✅ ADD THIS IMPORT
import { getStepProgressState, PROGRESS_STATUS } from './progressTracking';

// ===== PATTERN CONFIGURATION =====

const PATTERN_CONFIG = {
    'Lace Pattern': {
        placeholderText: "e.g., 'K1, YO, K2tog, K3, SSK, YO, K1'",
        descriptionPlaceholder: "Describe your lace pattern with key techniques and any chart references...",
        category: 'structure',
        requiresAdvancedRowByRow: true,
        isAdvancedPattern: true,
        requiresCustomText: false,
        requiresRowsInPattern: true,
        needsDescriptionInput: false,
        needsRowInput: false,
        includesInRowCountPatterns: true,
        configurationTips: [
            'Include chart name or written instructions',
            'Note any yarn-over/decrease pairings',
            'Mention blocking requirements if important'
        ]
    },

    'Cable Pattern': {
        placeholderText: "e.g., 'K2, P2, C6F, P2, K2'",
        descriptionPlaceholder: "Describe your cable pattern crossings, directions, and any background stitches...",
        category: 'structure',
        requiresAdvancedRowByRow: true,
        isAdvancedPattern: true,
        requiresCustomText: false,
        requiresRowsInPattern: true,
        needsDescriptionInput: false,
        needsRowInput: false,
        includesInRowCountPatterns: true,
        configurationTips: [
            'Describe cable crossing (e.g., "6-st left cross")',
            'Include chart reference if you have one',
            'Note cable needle size if specific'
        ]
    },

    'Custom Texture': {
        placeholderText: "e.g., 'K2, P2, Bobble, P2, K2'",
        descriptionPlaceholder: "Describe your custom texture pattern...",
        category: 'texture',
        requiresAdvancedRowByRow: true,
        isAdvancedPattern: true,
        requiresCustomText: false,
        requiresRowsInPattern: true,
        needsDescriptionInput: false,
        needsRowInput: false,
        includesInRowCountPatterns: true,
        configurationTips: [
            'Use K and P for basic stitches',
            'Add Bobble for texture interest',
            'Use brackets [ ] for repeats',
            'Use parentheses ( ) for stitch groups'
        ]
    },

    'Brioche': {
        placeholderText: "e.g., 'sl1yo, brk1 to end'",
        descriptionPlaceholder: "Describe your brioche pattern...",
        category: 'structure',
        requiresAdvancedRowByRow: true,
        isAdvancedPattern: true,
        requiresCustomText: false,
        requiresRowsInPattern: true,
        needsDescriptionInput: false,
        needsRowInput: false,
        includesInRowCountPatterns: true,
        configurationTips: [
            'Brioche stitches work in pairs across rows',
            'brk1 and brp1 each consume 2 stitches',
            'sl1yo consumes 1 stitch and creates 2'
        ]
    },

    'Custom pattern': {
        placeholderText: "e.g., '5 rows stockinette, 1 bobble row'",
        descriptionPlaceholder: "e.g., '5 rows stockinette, 1 bobble row'",
        category: 'texture',
        requiresAdvancedRowByRow: true,
        isAdvancedPattern: true,
        requiresCustomText: true,
        requiresRowsInPattern: true,
        needsDescriptionInput: true,
        needsRowInput: false,
        includesInRowCountPatterns: true,
        configurationTips: [
            'Describe your custom pattern clearly',
            'Include any special techniques or notes'
        ]
    },

    'Custom': {
        placeholderText: "e.g., '5 rows stockinette, 1 bobble row'",
        descriptionPlaceholder: "e.g., '5 rows stockinette, 1 bobble row'",
        category: 'texture',
        requiresAdvancedRowByRow: true,
        isAdvancedPattern: true,
        requiresCustomText: false,
        requiresRowsInPattern: true,
        needsDescriptionInput: false,
        needsRowInput: false,
        includesInRowCountPatterns: true,
        configurationTips: []
    },

    'Fair Isle': {
        placeholderText: "Enter row instruction...",
        descriptionPlaceholder: "Describe your Fair Isle pattern...",
        category: 'colorwork',
        requiresAdvancedRowByRow: false,
        isAdvancedPattern: false,
        requiresCustomText: true,
        requiresRowsInPattern: true,
        needsDescriptionInput: true,
        needsRowInput: true,
        includesInRowCountPatterns: true,
        configurationTips: [
            'List color names or codes',
            'Describe the motif or pattern sequence',
            'Note any chart references',
            'Include float management techniques'
        ]
    },

    'Intarsia': {
        placeholderText: "Enter row instruction...",
        descriptionPlaceholder: "Describe your Intarsia pattern...",
        category: 'colorwork',
        requiresAdvancedRowByRow: false,
        isAdvancedPattern: false,
        requiresCustomText: true,
        requiresRowsInPattern: true,
        needsDescriptionInput: true,
        needsRowInput: true,
        includesInRowCountPatterns: true,
        configurationTips: [
            'List color names or codes',
            'Describe the motif or pattern sequence',
            'Note any chart references',
            'Include bobbin or yarn management notes'
        ]
    },

    'Stripes': {
        placeholderText: "Enter row instruction...",
        descriptionPlaceholder: "Describe your stripe pattern...",
        category: 'colorwork',
        requiresAdvancedRowByRow: false,
        isAdvancedPattern: false,
        requiresCustomText: true,
        requiresRowsInPattern: true,
        needsDescriptionInput: true,
        needsRowInput: true,
        includesInRowCountPatterns: true,
        configurationTips: [
            'List colors and row counts: "2 rows Navy, 4 rows Cream"',
            'Note any special color change techniques',
            'Include total repeat if complex sequence',
            'Mention if stripes are jogless (for circular knitting)'
        ]
    },

    'Stockinette': {
        placeholderText: "Enter row instruction...",
        descriptionPlaceholder: "Describe your pattern...",
        category: 'texture',
        requiresAdvancedRowByRow: false,
        isAdvancedPattern: false,
        requiresCustomText: false,
        requiresRowsInPattern: false,
        needsDescriptionInput: false,
        needsRowInput: false,
        includesInRowCountPatterns: false,
        configurationTips: []
    },

    'Garter': {
        placeholderText: "Enter row instruction...",
        descriptionPlaceholder: "Describe your pattern...",
        category: 'texture',
        requiresAdvancedRowByRow: false,
        isAdvancedPattern: false,
        requiresCustomText: false,
        requiresRowsInPattern: false,
        needsDescriptionInput: false,
        needsRowInput: false,
        includesInRowCountPatterns: false,
        configurationTips: []
    },

    'Cast On': {
        placeholderText: "Enter row instruction...",
        descriptionPlaceholder: "Describe your pattern...",
        category: 'construction',
        requiresAdvancedRowByRow: false,
        isAdvancedPattern: false,
        requiresCustomText: false,
        requiresRowsInPattern: false,
        needsDescriptionInput: false,
        needsRowInput: false,
        includesInRowCountPatterns: false,
        configurationTips: []
    },

    'Bind Off': {
        placeholderText: "Enter row instruction...",
        descriptionPlaceholder: "Describe your pattern...",
        category: 'construction',
        requiresAdvancedRowByRow: false,
        isAdvancedPattern: false,
        requiresCustomText: false,
        requiresRowsInPattern: false,
        needsDescriptionInput: false,
        needsRowInput: false,
        includesInRowCountPatterns: false,
        configurationTips: []
    }
};

const DEFAULT_PATTERN_CONFIG = {
    placeholderText: "Enter row instruction...",
    descriptionPlaceholder: "Describe your pattern...",
    category: 'texture',
    requiresAdvancedRowByRow: false,
    isAdvancedPattern: false,
    requiresCustomText: false,
    requiresRowsInPattern: false,
    needsDescriptionInput: false,
    needsRowInput: false,
    includesInRowCountPatterns: false,
    configurationTips: []
};

// ===== UTILITY FUNCTIONS =====

export const getPatternConfig = (patternName) => {
    return PATTERN_CONFIG[patternName] || DEFAULT_PATTERN_CONFIG;
};

export const requiresAdvancedPatternEdit = (step) => {
    const pattern = getStepPatternName(step);
    return getPatternConfig(pattern).requiresAdvancedRowByRow === true;
};

export const isAdvancedRowByRowPattern = (patternName) => {
    return getPatternConfig(patternName).requiresAdvancedRowByRow === true;
};

export const needsDescriptionInput = (patternName) => {
    return getPatternConfig(patternName).needsDescriptionInput === true;
};

export const needsRowInput = (patternName) => {
    return getPatternConfig(patternName).needsRowInput === true;
};

export const includesInRowCountPatterns = (patternName) => {
    return getPatternConfig(patternName).includesInRowCountPatterns === true;
};

export const getPatternConfigurationTips = (patternName) => {
    return getPatternConfig(patternName).configurationTips || [];
};

export const isAdvancedPattern = (patternName) => {
    return getPatternConfig(patternName).isAdvancedPattern === true;
};

export const requiresCustomText = (patternName) => {
    return getPatternConfig(patternName).requiresCustomText === true;
};

export const requiresRowsInPattern = (patternName) => {
    return getPatternConfig(patternName).requiresRowsInPattern === true;
};

export const getPatternPlaceholderText = (patternType) => {
    return getPatternConfig(patternType).placeholderText;
};

export const getPatternDescriptionPlaceholder = (patternType) => {
    return getPatternConfig(patternType).descriptionPlaceholder;
};

// ===== CORE DISPLAY FUNCTIONS (All preserved) =====

export const getStepPatternName = (step) => {
    if (step.wizardConfig?.stitchPattern?.pattern) {
        return step.wizardConfig.stitchPattern.pattern;
    }
    if (step.wizardConfig?.stitchPattern?.category) {
        return step.wizardConfig.stitchPattern.category;
    }
    if (step.advancedWizardConfig?.stitchPattern?.pattern) {
        return step.advancedWizardConfig.stitchPattern.pattern;
    }
    if (step.advancedWizardConfig?.stitchPattern?.category) {
        return step.advancedWizardConfig.stitchPattern.category;
    }
    if (step.wizardConfig?.stitchPattern?.pattern === 'Bind Off') {
        const method = step.wizardConfig.stitchPattern.method;
        if (method === 'holder' || method === 'provisional') {
            return 'Put on Holder';
        }
    }
    if (step.type === 'put_on_holder') return 'Put on Holder';
    if (step.type === 'bind_off_all') return 'Bind Off';
    return 'Unknown Pattern';
};

export const getStepMethodDisplay = (step) => {
    const pattern = getStepPatternName(step);
    const method = step.wizardConfig?.stitchPattern?.method;
    const customText = step.wizardConfig?.stitchPattern?.customText;

    if (!method) return '';
    if (method === 'other' && customText) return customText;

    switch (pattern) {
        case 'Cast On':
            return getCastOnDisplayName(method) || method;
        case 'Pick Up & Knit':
            return getPickUpDisplayName(method) || method;
        case 'Continue from Stitches':
            return getContinueDisplayName(method) || method;
        case 'Custom Initialization':
            return getCustomInitDisplayName(method) || method;
        case 'Bind Off':
            return getBindOffDisplayName(method) || method;
        case 'Attach to Piece':
            return getAttachDisplayName(method) || method;
        default:
            return '';
    }
};

export const getStepPatternDisplay = (step) => {
    const pattern = getStepPatternName(step);
    const method = getStepMethodDisplay(step);
    return method ? `${pattern} - ${method}` : pattern;
};

export const getStepDurationDisplay = (step) => {
    const duration = step.wizardConfig?.duration;
    const construction = step.construction || 'flat';

    if (!duration?.type) {
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
        case 'color_repeats':
            return `${duration.value} color repeats`;
        case 'stitches':
            return `${duration.value || 'all'} stitches`;
        default:
            return null;
    }
};

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

export const getShapingDisplay = (step) => {
    if (!hasShaping) return null;

    const shapingConfig = step.wizardConfig?.shapingConfig || step.advancedWizardConfig?.shapingConfig;

    if (!shapingConfig?.type) {
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

export const isConstructionStep = (step) => {
    const pattern = getStepPatternName(step);
    return PATTERN_CATEGORIES.CONSTRUCTION.includes(pattern);
};

export const isInitializationStep = (step) => {
    const pattern = getStepPatternName(step);
    return [
        'Cast On',
        'Pick Up & Knit',
        'Continue from Stitches',
        'Custom Initialization'
    ].includes(pattern);
};

export const isFinishingStep = (step) => {
    const pattern = getStepPatternName(step);
    return ['Bind Off', 'Put on Holder', 'Other Ending'].includes(pattern);
};

export const isMiddleStep = (step) => {
    return !isInitializationStep(step) && !isFinishingStep(step);
};

export const getStepType = (step) => {
    if (isInitializationStep(step)) return 'initialization';
    if (isFinishingStep(step)) return 'finalization';
    if (hasShaping(step)) return 'shaping';
    return 'non-shaping';
};

export const isStepEditable = (step, isComponentFinished = false) => {
    if (isComponentFinished) return false;
    if (step.completed) return false;
    if (isInitializationStep(step)) return false;
    return true;
};

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

export const getAttachTargetDisplay = (step) => {
    const pattern = getStepPatternName(step);
    if (pattern !== 'Attach to Piece') return null;
    return step.wizardConfig?.stitchPattern?.targetComponent || 'Unknown Component';
};

export const getEndingNotes = (step) => {
    const pattern = getStepPatternName(step);
    if (pattern === 'Put on Holder' || pattern === 'Attach to Piece') {
        return step.wizardConfig?.stitchPattern?.customText || null;
    }
    return null;
};

export const getStepPrepNote = (step) => {
    return step.prepNote ||
        step.wizardConfig?.prepNote ||
        step.advancedWizardConfig?.prepNote ||
        '';
};

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

export const getComponentState = (component, projectId = null) => {
    if (!component.steps || component.steps.length === 0) {
        return 'edit_mode';
    }

    const hasCastOn = component.steps.some(step => isInitializationStep(step));
    const hasEnding = component.steps.some(step =>
        isFinishingStep(step) || (typeof step.endingStitches === 'number' && step.endingStitches === 0)
    );

    // ✅ NEW: Check progress tracking system instead of step.completed
    let hasProgress = false;
    let allComplete = true;

    if (projectId && component.id) {
        // Use NEW progress tracking system
        hasProgress = component.steps.some(step => {
            const progress = getStepProgressState(step.id, component.id, projectId);
            return progress.status === PROGRESS_STATUS.COMPLETED || progress.status === PROGRESS_STATUS.IN_PROGRESS;
        });
        allComplete = component.steps.every(step => {
            const progress = getStepProgressState(step.id, component.id, projectId);
            return progress.status === PROGRESS_STATUS.COMPLETED;
        });
    } else {
        // Fallback to OLD completed flag for backward compatibility
        hasProgress = component.steps.some(step => step.completed);
        allComplete = component.steps.every(step => step.completed);
    }

    if (hasEnding && allComplete) return 'finished';
    if (hasCastOn && hasProgress) return 'currently_knitting';
    if (hasCastOn && hasEnding && !hasProgress) return 'ready_to_knit';

    return 'edit_mode';
};

export const validatePatternConfiguration = (stitchPattern) => {
    if (!stitchPattern || !stitchPattern.pattern) {
        return false;
    }

    const { pattern, entryMode, customText, rowsInPattern, rowInstructions, stitchCount, colorworkType } = stitchPattern;
    const config = getPatternConfig(pattern);

    if (pattern === 'Cast On') {
        return stitchCount && parseInt(stitchCount) > 0;
    }

    if (pattern === 'Bind Off') {
        return true;
    }

    if (config.requiresAdvancedRowByRow) {
        if (entryMode === 'row_by_row') {
            if (pattern === 'Custom') {
                return stitchPattern.customSequence?.rows && stitchPattern.customSequence.rows.length > 0;
            }
            return rowInstructions && rowInstructions.length > 0;
        } else {
            return customText && customText.trim() !== '' &&
                rowsInPattern && parseInt(rowsInPattern) > 0;
        }
    }

    if (pattern === 'Colorwork') {
        return colorworkType &&
            customText && customText.trim() !== '' &&
            rowsInPattern && parseInt(rowsInPattern) > 0;
    }

    if (config.requiresCustomText && config.requiresRowsInPattern) {
        return customText && customText.trim() !== '' &&
            rowsInPattern && parseInt(rowsInPattern) > 0;
    }

    if (pattern === 'Other') {
        return customText && customText.trim() !== '';
    }

    return true;
};

export const getComponentStatusWithDisplay = (component, projectId = null) => {
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

    // ✅ CHANGED: Pass projectId to getComponentState
    const status = getComponentState(component, projectId);

    return {
        status,
        ...statusCategories[status]
    };
};

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

    if (config.requiresCustomText && (!customText || customText.trim() === '')) {
        return `${pattern} requires description`;
    }

    if (config.requiresRowsInPattern && (!rowsInPattern || parseInt(rowsInPattern) <= 0)) {
        return `${pattern} requires ${terms.rows} in pattern`;
    }

    if (pattern === 'Other' && (!customText || customText.trim() === '')) {
        return 'Other pattern requires description';
    }

    return null;
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
    getComponentStatusWithDisplay,
    getPatternConfig,
    requiresAdvancedPatternEdit,
    isAdvancedRowByRowPattern,
    needsDescriptionInput,
    needsRowInput,
    includesInRowCountPatterns,
    getPatternConfigurationTips,
    isAdvancedPattern,
    requiresCustomText,
    requiresRowsInPattern
};