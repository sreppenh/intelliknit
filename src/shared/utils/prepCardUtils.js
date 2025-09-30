// src/shared/utils/prepCardUtils.js

import { getYarnByLetter } from './colorworkDisplayUtils';

/**
 * PrepCard Utilities - Dynamic Color Information Generation
 * 
 * Generates color change information for PrepCards without storing static text.
 * Always pulls from live yarn data so color names stay current.
 */

/**
 * Get dynamic color information for PrepCard display
 * Returns null if no color info should be shown, otherwise returns formatted text
 * 
 * @param {object} step - The step object
 * @param {number} stepIndex - Index of step in component (0-based)
 * @param {object} component - The component containing the step
 * @param {object} project - The project with yarn data
 * @returns {string|null} - Formatted color change text or null
 */
export const getPrepCardColorInfo = (step, stepIndex, component, project) => {
    // Single-yarn projects never show color info
    if (!project || project.colorCount === 1) {
        return null;
    }

    // For single-color components, only show on first step
    if (component.colorMode === 'single' && stepIndex !== 0) {
        return null;
    }

    const colorwork = step?.colorwork;
    if (!colorwork) {
        return null;
    }

    // First step (stepIndex === 0): Always show "Using Color X"
    if (stepIndex === 0) {
        return generateInitialColorText(colorwork, project);
    }

    // Subsequent steps: Only show if color changed from previous step
    const colorChanged = hasColorChangedFromPreviousStep(step, stepIndex, component);
    if (!colorChanged) {
        return null;
    }

    // Generate "Switch to Color Y" text
    return generateColorChangeText(colorwork, project);
};

/**
 * Generate "Using Color X" text for first step
 */
const generateInitialColorText = (colorwork, project) => {
    if (colorwork.type === 'single') {
        // ✅ FIXED: Use colorLetter (new format) with fallback to yarnId (legacy)
        const letter = colorwork.colorLetter || colorwork.letter;

        if (letter) {
            // Use letter-based lookup
            const yarn = getYarnByLetter(project?.yarns || [], letter);
            const yarnName = yarn.color && yarn.color !== `Color ${letter}` ? ` (${yarn.color})` : '';
            return `Using Color ${yarn.letter}${yarnName}`;
        }

        // Legacy fallback: yarnId-based lookup
        if (colorwork.yarnId) {
            const yarn = project?.yarns?.find(y => y.id === colorwork.yarnId);
            if (yarn) {
                const yarnName = yarn.color ? ` (${yarn.color})` : '';
                return `Using Color ${yarn.letter}${yarnName}`;
            }
        }

        return null;
    }

    if (colorwork.type === 'multi-strand' || colorwork.type === 'multi_strand') {
        // ✅ FIXED: Use colorLetters (new format) with fallback to yarnIds (legacy)
        const letters = colorwork.colorLetters || colorwork.letters;

        if (letters && letters.length > 0) {
            // Use letter-based lookup
            const yarns = letters.map(letter => getYarnByLetter(project?.yarns || [], letter));
            const sortedYarns = yarns.sort((a, b) => a.letter.localeCompare(b.letter));
            const letterList = sortedYarns.map(y => y.letter).join(' and ');

            // Include yarn names if available
            const yarnNames = sortedYarns
                .filter(y => y.color && y.color !== `Color ${y.letter}`)
                .map(y => `${y.letter}: ${y.color}`)
                .join(', ');

            const namesSuffix = yarnNames ? ` (${yarnNames})` : '';
            return `Using Colors ${letterList} together${namesSuffix}`;
        }

        // Legacy fallback: yarnIds-based lookup
        if (colorwork.yarnIds && colorwork.yarnIds.length > 0) {
            const yarns = project?.yarns?.filter(y => colorwork.yarnIds.includes(y.id)) || [];
            if (yarns.length === 0) return null;

            const sortedYarns = yarns.sort((a, b) => a.letter.localeCompare(b.letter));
            const letterList = sortedYarns.map(y => y.letter).join(' and ');

            const yarnNames = sortedYarns
                .filter(y => y.color)
                .map(y => `${y.letter}: ${y.color}`)
                .join(', ');

            const namesSuffix = yarnNames ? ` (${yarnNames})` : '';
            return `Using Colors ${letterList} together${namesSuffix}`;
        }

        return null;
    }

    if (colorwork.type === 'stripes') {
        return 'Using stripe pattern';
    }

    return null;
};

/**
 * Generate "Switch to Color Y" text for color changes
 */
const generateColorChangeText = (colorwork, project) => {
    if (colorwork.type === 'single') {
        // ✅ FIXED: Use colorLetter (new format) with fallback to yarnId (legacy)
        const letter = colorwork.colorLetter || colorwork.letter;

        if (letter) {
            // Use letter-based lookup
            const yarn = getYarnByLetter(project?.yarns || [], letter);
            const yarnName = yarn.color && yarn.color !== `Color ${letter}` ? ` (${yarn.color})` : '';
            return `Switch to Color ${yarn.letter}${yarnName}`;
        }

        // Legacy fallback: yarnId-based lookup
        if (colorwork.yarnId) {
            const yarn = project?.yarns?.find(y => y.id === colorwork.yarnId);
            if (yarn) {
                const yarnName = yarn.color ? ` (${yarn.color})` : '';
                return `Switch to Color ${yarn.letter}${yarnName}`;
            }
        }

        return null;
    }

    if (colorwork.type === 'multi-strand' || colorwork.type === 'multi_strand') {
        // ✅ FIXED: Use colorLetters (new format) with fallback to yarnIds (legacy)
        const letters = colorwork.colorLetters || colorwork.letters;

        if (letters && letters.length > 0) {
            // Use letter-based lookup
            const yarns = letters.map(letter => getYarnByLetter(project?.yarns || [], letter));
            const sortedYarns = yarns.sort((a, b) => a.letter.localeCompare(b.letter));
            const letterList = sortedYarns.map(y => y.letter).join(' and ');

            // Include yarn names if available
            const yarnNames = sortedYarns
                .filter(y => y.color && y.color !== `Color ${y.letter}`)
                .map(y => `${y.letter}: ${y.color}`)
                .join(', ');

            const namesSuffix = yarnNames ? ` (${yarnNames})` : '';
            return `Switch to Colors ${letterList} together${namesSuffix}`;
        }

        // Legacy fallback: yarnIds-based lookup
        if (colorwork.yarnIds && colorwork.yarnIds.length > 0) {
            const yarns = project?.yarns?.filter(y => colorwork.yarnIds.includes(y.id)) || [];
            if (yarns.length === 0) return null;

            const sortedYarns = yarns.sort((a, b) => a.letter.localeCompare(b.letter));
            const letterList = sortedYarns.map(y => y.letter).join(' and ');

            const yarnNames = sortedYarns
                .filter(y => y.color)
                .map(y => `${y.letter}: ${y.color}`)
                .join(', ');

            const namesSuffix = yarnNames ? ` (${yarnNames})` : '';
            return `Switch to Colors ${letterList} together${namesSuffix}`;
        }

        return null;
    }

    if (colorwork.type === 'stripes') {
        return 'Switch to stripe pattern';
    }

    return null;
};

/**
 * Check if color changed from previous step
 */
const hasColorChangedFromPreviousStep = (step, stepIndex, component) => {
    if (stepIndex === 0) return false;

    const prevStep = component.steps[stepIndex - 1];
    const currentColor = getStepColorForComparison(step, component);
    const prevColor = getStepColorForComparison(prevStep, component);

    return currentColor !== prevColor;
};

/**
 * Get normalized color string for comparison
 * Reuses logic from stepDescriptionUtils but kept here for independence
 */
const getStepColorForComparison = (step, component) => {
    // Check step's colorwork data
    if (step?.colorwork) {
        if (step.colorwork.type === 'single') {
            // ✅ FIXED: Use colorLetter with fallback to yarnId
            const identifier = step.colorwork.colorLetter || step.colorwork.letter || step.colorwork.yarnId;
            return `single:${identifier}`;
        }
        if (step.colorwork.type === 'multi-strand' || step.colorwork.type === 'multi_strand') {
            // ✅ FIXED: Use colorLetters with fallback to yarnIds
            const identifiers = step.colorwork.colorLetters || step.colorwork.letters || step.colorwork.yarnIds || [];
            return `multi:${identifiers.sort().join(',')}`;
        }
        if (step.colorwork.type === 'stripes') {
            return 'stripes';
        }
    }

    // Fallback to component default
    if (component?.colorMode === 'single' && component.singleColorYarnId) {
        return `single:${component.singleColorYarnId}`;
    }

    if (component?.startStepColorYarnIds && component.startStepColorYarnIds.length > 0) {
        if (component.startStepColorYarnIds.length === 1) {
            return `single:${component.startStepColorYarnIds[0]}`;
        }
        return `multi:${component.startStepColorYarnIds.sort().join(',')}`;
    }

    return null;
};

export default {
    getPrepCardColorInfo
};