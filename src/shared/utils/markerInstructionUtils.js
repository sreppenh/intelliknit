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
export const generateMarkerFlowInstruction = (actions, markers, basePattern) => {
    // Group actions by their targets to detect patterns
    const actionsByTarget = {};
    actions.forEach(action => {
        action.targets.forEach(target => {
            if (!actionsByTarget[target]) actionsByTarget[target] = [];
            actionsByTarget[target].push(action);
        });
    });

    // Get all targeted markers
    const targetedMarkers = Object.keys(actionsByTarget).filter(target =>
        markers.includes(target) || target === 'BOR'
    );

    if (targetedMarkers.length === 0) return { instruction: null, stitchChange: 0 };

    // Check if all markers have identical actions (uniform treatment)
    const firstMarkerActions = actionsByTarget[targetedMarkers[0]];
    const isUniform = targetedMarkers.every(marker =>
        JSON.stringify(actionsByTarget[marker]) === JSON.stringify(firstMarkerActions)
    );

    if (isUniform) {
        // Generate uniform instruction with stitch change calculation
        return generateUniformMarkerInstruction(firstMarkerActions, targetedMarkers, basePattern);
    } else {
        // Generate individual marker instructions
        return generateIndividualMarkerInstructions(actionsByTarget, targetedMarkers, basePattern);
    }
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