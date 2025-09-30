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
    console.log('🔍 getPrepCardColorInfo called:', {
        stepIndex,
        projectColorCount: project?.colorCount,
        componentColorMode: component?.colorMode,
        stepColorwork: step?.colorwork,
        componentSingleColorYarnId: component?.singleColorYarnId
    });

    // Single-yarn projects never show color info
    if (!project || project.colorCount === 1) {
        console.log('❌ Exit: single-yarn project');
        return null;
    }

    // For single-color components, only show on first step
    if (component.colorMode === 'single' && stepIndex !== 0) {
        console.log('❌ Exit: single-color component, not first step');
        return null;
    }

    // Get colorwork - try step first, then component default
    let colorwork = step?.colorwork;

    // If no colorwork on step and this is a single-color component, use component's color
    if (!colorwork && component?.colorMode === 'single' && component?.singleColorYarnId) {
        console.log('📝 No step colorwork, using component singleColorYarnId:', component.singleColorYarnId);

        // Extract letter if it's a pseudo-ID format
        let letter = component.singleColorYarnId;
        if (typeof letter === 'string' && letter.startsWith('color-')) {
            letter = letter.split('-')[1];
            console.log('   Extracted letter from pseudo-ID:', letter);
        }

        colorwork = {
            type: 'single',
            letter: letter
        };
    }

    if (!colorwork) {
        console.log('❌ Exit: no colorwork found');
        return null;
    }

    console.log('✅ Colorwork found:', colorwork);

    // First step: Always show "Using Color X"
    if (stepIndex === 0) {
        const result = generateInitialColorText(colorwork, project);
        console.log('🎯 Initial color text result:', result);
        return result;
    }

    // Subsequent steps: Only show if color changed
    const colorChanged = hasColorChangedFromPreviousStep(step, stepIndex, component);
    if (!colorChanged) {
        console.log('❌ No color change from previous step');
        return null;
    }

    const result = generateColorChangeText(colorwork, project);
    console.log('🎯 Color change text result:', result);
    return result;
};

/**
 * Generate "Using Color X" text for first step
 */
const generateInitialColorText = (colorwork, project) => {
    console.log('🔧 generateInitialColorText:', {
        colorworkType: colorwork.type,
        letter: colorwork.letter,
        colorLetter: colorwork.colorLetter
    });

    if (colorwork.type === 'single') {
        // Get the letter (check multiple possible field names for compatibility)
        const letter = colorwork.letter || colorwork.colorLetter;

        console.log('   Letter found:', letter);

        if (!letter) {
            console.log('   ❌ No letter found');
            return null;
        }

        // Look up yarn dynamically
        const yarn = getYarnByLetter(project?.yarns || [], letter);
        console.log('   Yarn lookup result:', yarn);

        // If yarn has a real name (not just "Color A"), include it
        const yarnName = yarn.color && yarn.color !== `Color ${letter}` ? ` (${yarn.color})` : '';
        const result = `Using Color ${yarn.letter}${yarnName}`;
        console.log('   Returning:', result);
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
 * Generate "Switch to Color Y" text for color changes
 */
const generateColorChangeText = (colorwork, project) => {
    if (colorwork.type === 'single') {
        const letter = colorwork.letter || colorwork.colorLetter;

        if (!letter) return null;

        const yarn = getYarnByLetter(project?.yarns || [], letter);
        const yarnName = yarn.color && yarn.color !== `Color ${letter}` ? ` (${yarn.color})` : '';
        return `Switch to Color ${yarn.letter}${yarnName}`;
    }

    if (colorwork.type === 'multi-strand' || colorwork.type === 'multi_strand') {
        const letters = colorwork.letters || colorwork.colorLetters;

        if (!letters || letters.length === 0) return null;

        const yarns = letters.map(letter => getYarnByLetter(project?.yarns || [], letter));
        const sortedYarns = yarns.sort((a, b) => a.letter.localeCompare(b.letter));
        const letterList = sortedYarns.map(y => y.letter).join(' and ');

        const yarnNames = sortedYarns
            .filter(y => y.color && y.color !== `Color ${y.letter}`)
            .map(y => `${y.letter}: ${y.color}`)
            .join(', ');

        const namesSuffix = yarnNames ? ` (${yarnNames})` : '';
        return `Switch to Colors ${letterList} together${namesSuffix}`;
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
    if (component?.colorMode === 'single' && component.singleColorYarnId) {
        let letter = component.singleColorYarnId;

        // Extract letter from pseudo-ID if needed
        if (typeof letter === 'string' && letter.startsWith('color-')) {
            letter = letter.split('-')[1];
        }

        return `single:${letter}`;
    }

    return null;
};

export default {
    getPrepCardColorInfo
};