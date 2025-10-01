// src/features/knitting/components/modal/KnittingModalTheme.js
import { getStepPatternName } from '../../../../shared/utils/stepDisplayUtils';
import { getPrepCardColorInfo } from '../../../../shared/utils/prepCardUtils';

/**
 * Get theme configuration for knitting step modal based on step type and context
 * 
 * @param {Object} step - Step data object
 * @param {string} context - Context: 'project', 'notepad', 'note' (default: 'project')
 * @returns {Object} Theme configuration with colors and styling
 */
export const getModalTheme = (step, context = 'project') => {
    // Force lavender theme for notepad context
    if (context === 'notepad' || context === 'note') {
        return {
            cardBg: 'bg-gradient-to-br from-lavender-50 via-lavender-25 to-white',
            contentBg: 'bg-lavender-50/30 border-lavender-200/50',
            textPrimary: 'text-lavender-900',
            textSecondary: 'text-lavender-700',
            accent: 'lavender'
        };
    }

    // Get the pattern name to check for prep steps
    const patternName = getStepPatternName(step);

    // Check if this is a prep step (has prep note OR is a "Preparation" step)
    const hasPrep = step?.prepNote ||
        step?.wizardConfig?.prepNote ||
        step?.advancedWizardConfig?.prepNote ||
        patternName === 'Preparation';

    // Lavender theme for prep cards ONLY
    if (hasPrep && (typeof hasPrep === 'string' ? hasPrep.trim().length > 0 : true)) {
        return {
            cardBg: 'bg-gradient-to-br from-lavender-50 via-lavender-25 to-white',
            contentBg: 'bg-lavender-50/30 border-lavender-200/50',
            textPrimary: 'text-lavender-900',
            textSecondary: 'text-lavender-700',
            accent: 'lavender'
        };
    }

    // Sage theme for all other steps (unified experience)
    return {
        cardBg: 'bg-gradient-to-br from-sage-25 via-white to-sage-50',
        contentBg: 'bg-sage-50/30 border-sage-200/50',
        textPrimary: 'text-gray-800',      // ✅ Changed to gray-800 for consistency
        textSecondary: 'text-gray-700',    // ✅ Changed to gray-700 for consistency
        accent: 'sage'
    };
};

/**
 * Get completed theme (wool-based) for any step type
 * 
 * @returns {Object} Completed step theme configuration
 */
export const getCompletedTheme = () => {
    return {
        cardBg: 'bg-gradient-to-br from-wool-100 via-wool-50 to-wool-75',
        contentBg: 'bg-wool-100/50 border-wool-300/50',
        textPrimary: 'text-wool-800',
        textSecondary: 'text-wool-600',
        accent: 'wool'
    };
};