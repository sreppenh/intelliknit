// src/shared/utils/prepCardUtils.js

import { getYarnByLetter } from './colorworkDisplayUtils';

/**
 * PrepCard Utilities - Dynamic Color Information Generation
 * 
 * SIMPLE APPROACH: Just store letters, look up yarn names dynamically
 */

/**
 * Get dynamic color information for PrepCard display
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

    // Get colorwork - try step first, then component default
    let colorwork = step?.colorwork;

    // If no colorwork on step and this is a single-color component, use component's color
    if (!colorwork && component?.colorMode === 'single' && component?.singleColorLetter) {
        colorwork = {
            type: 'single',
            letter: component.singleColorLetter
        };
    }

    if (!colorwork) {
        return null;
    }

    // First step: Always show "Using Color X"
    if (stepIndex === 0) {
        const result = generateInitialColorText(colorwork, project);
        return result;
    }

    // Subsequent steps: Only show if color changed
    const colorChanged = hasColorChangedFromPreviousStep(step, stepIndex, component);
    if (!colorChanged) {
        return null;
    }

    const result = generateColorChangeText(colorwork, project);
    return result;
};

/**
 * Generate "Using Color X" text for first step
 */
const generateInitialColorText = (colorwork, project) => {

    if (colorwork.type === 'single') {
        // Get the letter (check multiple possible field names for compatibility)
        const letter = colorwork.letter || colorwork.colorLetter;

        if (!letter) {
            return null;
        }

        // Look up yarn dynamically
        const yarn = getYarnByLetter(project?.yarns || [], letter);

        // If yarn has a real name (not just "Color A"), include it
        const yarnName = yarn.color && yarn.color !== `Color ${letter}` ? ` (${yarn.color})` : '';
        const result = `Using Color ${yarn.letter}${yarnName}`;
        return result;
    }

    if (colorwork.type === 'multi-strand' || colorwork.type === 'multi_strand') {
        // Get the letters array
        const letters = colorwork.letters || colorwork.colorLetters;

        if (!letters || letters.length === 0) return null;

        // Look up yarns dynamically
        const yarns = letters.map(letter => getYarnByLetter(project?.yarns || [], letter));
        const sortedYarns = yarns.sort((a, b) => a.letter.localeCompare(b.letter));
        const letterList = sortedYarns.map(y => y.letter).join(' and ');

        // Include real yarn names if they exist
        const yarnNames = sortedYarns
            .filter(y => y.color && y.color !== `Color ${y.letter}`)
            .map(y => `${y.letter}: ${y.color}`)
            .join(', ');

        const namesSuffix = yarnNames ? ` (${yarnNames})` : '';
        return `Using Colors ${letterList} together${namesSuffix}`;
    }

    if (colorwork.type === 'stripes') {
        return 'Using stripe pattern';
    }

    return null;
};

/**
 * Generate "Change to Color X" text for subsequent steps
 */
const generateColorChangeText = (colorwork, project) => {
    if (colorwork.type === 'single') {
        const letter = colorwork.letter || colorwork.colorLetter;

        if (!letter) {
            return null;
        }

        const yarn = getYarnByLetter(project?.yarns || [], letter);
        const yarnName = yarn.color && yarn.color !== `Color ${letter}` ? ` (${yarn.color})` : '';

        return `Switch to Color ${letter}${yarnName}`;
    }

    if (colorwork.type === 'multi-strand' || colorwork.type === 'multi_strand') {
        const letters = colorwork.letters || colorwork.colorLetters || [];

        if (letters.length === 0) {
            return null;
        }

        const letterList = letters.sort().join(', ');

        // Get yarn names for all colors
        const yarnNames = letters.map(letter => {
            const yarn = getYarnByLetter(project?.yarns || [], letter);
            return yarn.color && yarn.color !== `Color ${letter}` ? yarn.color : null;
        }).filter(Boolean).join(', ');

        const namesSuffix = yarnNames ? ` (${yarnNames})` : '';
        return `Switch to Colors ${letterList} together${namesSuffix}`;
    }

    if (colorwork.type === 'stripes') {
        // Get the stripe sequence to show which colors are in the pattern
        const stripeSequence = colorwork.stripeSequence || [];

        if (stripeSequence.length === 0) {
            return 'Switch to stripe pattern';
        }

        // Collect unique colors from the stripe sequence
        const uniqueColors = [...new Set(stripeSequence.map(stripe => stripe.color))];

        // Get yarn names for each color
        const colorInfo = uniqueColors.map(letter => {
            const yarn = getYarnByLetter(project?.yarns || [], letter);
            const yarnName = yarn.color && yarn.color !== `Color ${letter}` ? ` (${yarn.color})` : '';
            return `Color ${letter}${yarnName}`;
        }).join(', ');

        return `Switch to stripe pattern: ${colorInfo}`;
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
 */
const getStepColorForComparison = (step, component) => {
    // Check step's colorwork data
    if (step?.colorwork) {
        if (step.colorwork.type === 'single') {
            const letter = step.colorwork.letter || step.colorwork.colorLetter;
            return `single:${letter}`;
        }
        if (step.colorwork.type === 'multi-strand' || step.colorwork.type === 'multi_strand') {
            const letters = step.colorwork.letters || step.colorwork.colorLetters || [];
            return `multi:${letters.sort().join(',')}`;
        }
        if (step.colorwork.type === 'stripes') {
            return 'stripes';
        }
    }

    // Fallback to component default
    if (component?.colorMode === 'single' && component.singleColorLetter) {
        return `single:${component.singleColorLetter}`;
    }

    return null;
};

export default {
    getPrepCardColorInfo
};