// src/shared/utils/markerInstructionUtils.js

/**
 * Marker Instruction Generation Utilities
 * Generates complete knitting instructions for marker-based shaping with stitch consumption logic
 */

import { getStitchConsumption } from './stitchCalculatorUtils';

/**
 * Generate marker-based flow instruction from actions
 * @param {Array} actions - Marker actions array
 * @param {Array} markers - Available markers (excluding BOR)
 * @param {string} basePattern - Base pattern name (e.g., "stockinette")
 * @returns {Object} - { instruction, stitchChange }
 */
export const generateMarkerFlowInstruction = (actions, markerArray, basePattern) => {
    // Group actions by target marker for lookup
    const actionsByMarker = {};
    actions.forEach(action => {
        action.targets.forEach(target => {
            if (!actionsByMarker[target]) actionsByMarker[target] = [];
            actionsByMarker[target].push(action);
        });
    });

    const instructionParts = [];
    let totalStitchChange = 0;
    let needsBasePattern = true;

    // Walk through the complete marker array
    for (let i = 0; i < markerArray.length; i++) {
        const item = markerArray[i];

        // Skip stitch segments
        if (typeof item === 'number') continue;

        // Handle markers
        if (typeof item === 'string') {
            const markerActions = actionsByMarker[item] || [];

            // Add base pattern work before first marker
            if (needsBasePattern) {
                instructionParts.push(`work in ${basePattern} to marker`);
                needsBasePattern = false;
            }

            if (markerActions.length === 0) {
                // No actions - just slip marker
                instructionParts.push('slip marker');
            } else {
                // Process actions for this marker
                const result = processMarkerActions(markerActions);
                instructionParts.push(...result.parts);
                totalStitchChange += result.stitchChange;
            }

            // Add work to next marker (except for last marker)
            const nextMarkerIndex = markerArray.findIndex((item, idx) => idx > i && typeof item === 'string');
            if (nextMarkerIndex !== -1) {
                instructionParts.push('work to marker');
            }
        }
    }

    instructionParts.push('work to end');

    return {
        instruction: instructionParts.join(', '),
        stitchChange: totalStitchChange
    };
};

// Helper function for processing marker actions
const processMarkerActions = (markerActions) => {
    const parts = [];
    let stitchChange = 0;

    markerActions.forEach(action => {
        if (action.position === 'before') {
            parts.push(action.technique);
            const distance = action.distance === 'at' ? 0 : parseInt(action.distance);
            if (distance > 0) {
                parts.push(`k${distance}`);
            }
            stitchChange += getStitchChange(action.technique);
        } else if (action.position === 'after') {
            parts.push('slip marker');
            const distance = action.distance === 'at' ? 0 : parseInt(action.distance);
            if (distance > 0) {
                parts.push(`k${distance}`);
            }
            parts.push(action.technique);
            stitchChange += getStitchChange(action.technique);
            return { parts, stitchChange }; // Exit early since slip marker is handled
        }
    });

    if (!markerActions.some(a => a.position === 'after')) {
        parts.push('slip marker');
    }

    return { parts, stitchChange };
};

/**
 * Generate uniform marker instruction with complete knitting context
 * @param {Array} actions - Actions for this marker type
 * @param {Array} markers - All targeted markers
 * @param {string} basePattern - Base pattern name
 * @returns {Object} - { instruction, stitchChange }
 */
export const generateUniformMarkerInstruction = (actions, markers, basePattern) => {
    // Calculate total stitch change for this instruction
    let totalStitchChange = 0;

    // Build the action sequence for one marker
    const actionSequence = [];

    // Sort actions by position to get correct flow
    const beforeActions = actions.filter(action => action.position === 'before');
    const afterActions = actions.filter(action => action.position === 'after');
    const bothActions = actions.filter(action => action.position === 'before_and_after');

    // Handle before_and_after actions
    if (bothActions.length > 0) {
        const action = bothActions[0];
        const [beforeTech, afterTech] = action.technique.split('_');
        const distance = action.distance === 'at' ? 0 : parseInt(action.distance);

        // Calculate stitch consumption and working stitches needed
        const beforeConsumption = getStitchConsumption(beforeTech);
        const workingStitchesNeeded = beforeConsumption + distance;

        if (workingStitchesNeeded > 0) {
            actionSequence.push(`work in ${basePattern} until ${workingStitchesNeeded} stitches before marker`);
        }

        actionSequence.push(beforeTech);

        // Add knit stitches between technique and marker if needed
        if (distance > 0) {
            actionSequence.push(`k${distance}`);
        }

        actionSequence.push('slip marker');

        // Add knit stitches after marker if needed
        if (distance > 0) {
            actionSequence.push(`k${distance}`);
        }

        actionSequence.push(afterTech);

        // Calculate net stitch change per marker
        const beforeChange = getStitchChange(beforeTech);
        const afterChange = getStitchChange(afterTech);
        const changePerMarker = beforeChange + afterChange;
        totalStitchChange = changePerMarker * markers.length;

    } else {
        // Handle separate before and after actions
        if (beforeActions.length > 0) {
            const action = beforeActions[0];
            const distance = action.distance === 'at' ? 0 : parseInt(action.distance);
            const consumption = getStitchConsumption(action.technique);
            const workingStitchesNeeded = consumption + distance;

            if (workingStitchesNeeded > 0) {
                actionSequence.push(`work in ${basePattern} until ${workingStitchesNeeded} stitches before marker`);
            } else {
                // For at-marker actions, still need to work to the marker
                actionSequence.push(`work in ${basePattern} until marker`);
            }

            actionSequence.push(action.technique);

            // Add knit stitches between technique and marker if needed
            if (distance > 0) {
                actionSequence.push(`k${distance}`);
            }

            // Add slip marker for before actions
            actionSequence.push('slip marker');

            // Calculate stitch change
            const changePerMarker = getStitchChange(action.technique);
            totalStitchChange += changePerMarker * markers.length;
        }

        if (afterActions.length > 0) {
            actionSequence.push('slip marker');
            afterActions.forEach(action => {
                actionSequence.push(action.technique);

                // Add to stitch change calculation
                const changePerMarker = getStitchChange(action.technique);
                totalStitchChange += changePerMarker * markers.length;
            });
        }
    }

    let instruction = actionSequence.join(', ');

    // Add repeat clause for multiple markers with explicit count
    if (markers.length > 1) {
        const repeatCount = markers.length - 1;
        instruction += `, repeat ${repeatCount} ${repeatCount === 1 ? 'time' : 'times'}`;
    }

    // Add row completion
    instruction += ', work to end';

    return {
        instruction,
        stitchChange: totalStitchChange
    };
};

/**
 * Generate individual marker instructions (each marker treated differently)
 * @param {Object} actionsByTarget - Actions grouped by target marker
 * @param {Array} markers - All targeted markers
 * @param {string} basePattern - Base pattern name
 * @returns {Object} - { instruction, stitchChange }
 */
export const generateIndividualMarkerInstructions = (actionsByTarget, markers, basePattern) => {
    const instructions = [];
    let totalStitchChange = 0;

    markers.forEach((marker, index) => {
        const actions = actionsByTarget[marker] || [];
        if (actions.length === 0) return;

        const result = generateSingleMarkerInstruction(actions, marker, basePattern, index === 0);
        if (result.instruction) {
            instructions.push(result.instruction);
            totalStitchChange += result.stitchChange;
        }
    });

    return {
        instruction: instructions.join(', ') + ', work to end',
        stitchChange: totalStitchChange
    };
};

/**
 * Generate instruction for a single marker
 * @param {Array} actions - Actions for this specific marker
 * @param {string} marker - Marker name
 * @param {string} basePattern - Base pattern name
 * @param {boolean} isFirst - Whether this is the first marker in sequence
 * @returns {Object} - { instruction, stitchChange }
 */
export const generateSingleMarkerInstruction = (actions, marker, basePattern, isFirst) => {
    const parts = [];
    let stitchChange = 0;

    // Add "work to" context for non-first markers
    if (!isFirst) {
        parts.push(`work to marker ${marker}`);
    }

    // Process actions for this marker
    actions.forEach(action => {
        if (action.position === 'before_and_after') {
            const [beforeTech, afterTech] = action.technique.split('_');
            const distance = action.distance === 'at' ? 0 : parseInt(action.distance);

            if (isFirst) {
                const consumption = getStitchConsumption(beforeTech);
                const workingStitchesNeeded = consumption + distance;
                if (workingStitchesNeeded > 0) {
                    parts.push(`work in ${basePattern} until ${workingStitchesNeeded} stitches before marker`);
                }
            }

            parts.push(beforeTech);
            if (distance > 0) {
                parts.push(`k${distance}`);
            }
            parts.push('slip marker');
            parts.push(afterTech);

            stitchChange += getStitchChange(beforeTech) + getStitchChange(afterTech);

        } else if (action.position === 'before') {
            const distance = action.distance === 'at' ? 0 : parseInt(action.distance);

            if (isFirst) {
                const consumption = getStitchConsumption(action.technique);
                const workingStitchesNeeded = consumption + distance;
                if (workingStitchesNeeded > 0) {
                    parts.push(`work in ${basePattern} until ${workingStitchesNeeded} stitches before marker`);
                }
            }

            parts.push(action.technique);
            if (distance > 0) {
                parts.push(`k${distance}`);
            }

            stitchChange += getStitchChange(action.technique);

        } else if (action.position === 'after') {
            parts.push('slip marker');
            const distance = action.distance === 'at' ? 0 : parseInt(action.distance);
            if (distance > 0) {
                parts.push(`k${distance}`);
            }
            parts.push(action.technique);
            stitchChange += getStitchChange(action.technique);
        }
    });

    return {
        instruction: parts.join(', '),
        stitchChange
    };
};

/**
 * Get stitch change for a technique (net gain/loss)
 * @param {string} technique - Knitting technique
 * @returns {number} - Net stitch change (positive = increase, negative = decrease)
 */
const getStitchChange = (technique) => {
    // Common technique mappings (net change)
    const techniqueMap = {
        'SSK': -1,      // 2 -> 1
        'K2tog': -1,    // 2 -> 1  
        'K3tog': -2,    // 3 -> 1
        'CDD': -2,      // 3 -> 1
        'M1L': +1,      // 0 -> 1
        'M1R': +1,      // 0 -> 1
        'YO': +1,       // 0 -> 1
        'KFB': +1,      // 1 -> 2
    };

    return techniqueMap[technique] || 0;
};