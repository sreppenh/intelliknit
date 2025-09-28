// src/shared/utils/prepCardUtils.js

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

    // Component must use multiple colors
    if (component.colorMode === 'single') {
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
        const yarn = project?.yarns?.find(y => y.id === colorwork.yarnId);
        if (!yarn) return null;

        const yarnName = yarn.color ? ` (${yarn.color})` : '';
        return `Using Color ${yarn.letter}${yarnName}`;
    }

    if (colorwork.type === 'multi-strand') {
        const yarns = project?.yarns?.filter(y => colorwork.yarnIds.includes(y.id)) || [];
        if (yarns.length === 0) return null;

        const sortedYarns = yarns.sort((a, b) => a.letter.localeCompare(b.letter));
        const letters = sortedYarns.map(y => y.letter).join(' and ');

        // Include yarn names if available
        const yarnNames = sortedYarns
            .filter(y => y.color)
            .map(y => `${y.letter}: ${y.color}`)
            .join(', ');

        const namesSuffix = yarnNames ? ` (${yarnNames})` : '';
        return `Using Colors ${letters} together${namesSuffix}`;
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
        const yarn = project?.yarns?.find(y => y.id === colorwork.yarnId);
        if (!yarn) return null;

        const yarnName = yarn.color ? ` (${yarn.color})` : '';
        return `Switch to Color ${yarn.letter}${yarnName}`;
    }

    if (colorwork.type === 'multi-strand') {
        const yarns = project?.yarns?.filter(y => colorwork.yarnIds.includes(y.id)) || [];
        if (yarns.length === 0) return null;

        const sortedYarns = yarns.sort((a, b) => a.letter.localeCompare(b.letter));
        const letters = sortedYarns.map(y => y.letter).join(' and ');

        // Include yarn names if available
        const yarnNames = sortedYarns
            .filter(y => y.color)
            .map(y => `${y.letter}: ${y.color}`)
            .join(', ');

        const namesSuffix = yarnNames ? ` (${yarnNames})` : '';
        return `Switch to Colors ${letters} together${namesSuffix}`;
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
            return `single:${step.colorwork.yarnId}`;
        }
        if (step.colorwork.type === 'multi-strand') {
            return `multi:${step.colorwork.yarnIds.sort().join(',')}`;
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