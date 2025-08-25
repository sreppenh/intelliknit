// src/features/knitting/components/modal/KnittingModalTheme.js
import { getStepPatternName } from '../../../../shared/utils/stepDisplayUtils';

/**
 * Get theme configuration for knitting step modal based on step type
 * 
 * @param {Object} step - Step data object
 * @returns {Object} Theme configuration with colors and styling
 */
export const getModalTheme = (step) => {
    const patternName = getStepPatternName(step);

    // Yarn theme for construction & finishing steps
    if (['Cast On', 'Bind Off', 'Put on Holder', 'Other Ending', 'Pick Up & Knit', 'Continue from Stitches'].includes(patternName)) {
        return {
            cardBg: 'bg-gradient-to-br from-yarn-25 via-white to-yarn-50',
            contentBg: 'bg-yarn-50/30 border-yarn-200/50',
            textPrimary: 'text-yarn-900',
            textSecondary: 'text-yarn-700',
            accent: 'yarn'
        };
    }

    // Sage theme for regular patterns (default)
    return {
        cardBg: 'bg-gradient-to-br from-sage-25 via-white to-sage-50',
        contentBg: 'bg-sage-50/30 border-sage-200/50',
        textPrimary: 'text-sage-900',
        textSecondary: 'text-sage-700',
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