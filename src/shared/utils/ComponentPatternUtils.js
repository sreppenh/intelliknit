// src/shared/utils/ComponentPatternUtils.js

/**
 * Component Pattern Utilities
 * Handles inheritance of pattern and colorwork defaults from components to steps
 */

/**
 * Get the effective pattern for a step (explicit or inherited)
 * @param {Object} step - The step object
 * @param {Object} component - The component containing the step
 * @returns {Object|null} Pattern configuration or null
 */
export const getEffectiveStepPattern = (step, component) => {
    // Priority 1: Step has explicit pattern
    if (step.wizardConfig?.stitchPattern) {
        return step.wizardConfig.stitchPattern;
    }

    // Priority 2: Component has default pattern
    if (component?.defaultPattern) {
        return component.defaultPattern;
    }

    // Priority 3: No pattern
    return null;
};

/**
 * Get the effective colorwork for a step (explicit or inherited)
 * @param {Object} step - The step object
 * @param {Object} component - The component containing the step
 * @returns {Object|null} Colorwork configuration or null
 */
export const getEffectiveStepColorwork = (step, component) => {
    // Priority 1: Step has explicit colorwork
    if (step.wizardConfig?.colorwork || step.colorwork) {
        return step.wizardConfig?.colorwork || step.colorwork;
    }

    // Priority 2: Component has default colorwork
    if (component?.defaultColorwork) {
        return component.defaultColorwork;
    }

    // Priority 3: No colorwork
    return null;
};

/**
 * Check if a step is using inherited pattern (vs explicit)
 * @param {Object} step - The step object
 * @param {Object} component - The component containing the step
 * @returns {boolean} True if pattern is inherited from component
 */
export const isPatternInherited = (step, component) => {
    return !step.wizardConfig?.stitchPattern && !!component?.defaultPattern;
};

/**
 * Check if a step is using inherited colorwork (vs explicit)
 * @param {Object} step - The step object
 * @param {Object} component - The component containing the step
 * @returns {boolean} True if colorwork is inherited from component
 */
export const isColorworkInherited = (step, component) => {
    const hasExplicitColorwork = !!(step.wizardConfig?.colorwork || step.colorwork);
    return !hasExplicitColorwork && !!component?.defaultColorwork;
};