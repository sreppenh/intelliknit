// src/shared/utils/markerInstructionUtils.js

/**
 * Marker Instruction Generation Utilities
 * Generates flow-based knitting instructions for marker-based shaping
 */

/**
 * Generate marker-based flow instruction from actions
 * @param {Array} actions - Marker actions array
 * @param {Array} markers - Available markers (excluding BOR)
 * @param {string} basePattern - Base pattern name (e.g., "stockinette")
 * @returns {string|null} - Generated instruction or null
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

    if (targetedMarkers.length === 0) return null;

    // Check if all markers have identical actions (uniform treatment)
    const firstMarkerActions = actionsByTarget[targetedMarkers[0]];
    const isUniform = targetedMarkers.every(marker =>
        JSON.stringify(actionsByTarget[marker]) === JSON.stringify(firstMarkerActions)
    );

    if (isUniform) {
        // Generate uniform instruction: "Work in pattern to X st before marker, technique, repeat for all markers"
        return generateUniformMarkerInstruction(firstMarkerActions, targetedMarkers, basePattern);
    } else {
        // Generate individual marker instructions
        return generateIndividualMarkerInstructions(actionsByTarget, targetedMarkers, basePattern);
    }
};

/**
 * Generate uniform marker instruction (all markers get same treatment)
 * @param {Array} actions - Actions for this marker type
 * @param {Array} markers - All targeted markers
 * @param {string} basePattern - Base pattern name
 * @returns {string} - Generated instruction
 */
export const generateUniformMarkerInstruction = (actions, markers, basePattern) => {
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
        const distance = action.distance === 'at' ? '' : `${action.distance} st `;

        if (distance) {
            actionSequence.push(`work in ${basePattern} to ${distance}before marker`);
        }
        actionSequence.push(beforeTech);
        actionSequence.push('slip marker');
        actionSequence.push(afterTech);
    } else {
        // Handle separate before and after actions
        if (beforeActions.length > 0) {
            const action = beforeActions[0];
            const distance = action.distance === 'at' ? '' : `${action.distance} st `;

            if (distance) {
                actionSequence.push(`work in ${basePattern} to ${distance}before marker`);
            }
            actionSequence.push(action.technique);
        }

        if (afterActions.length > 0) {
            actionSequence.push('slip marker');
            afterActions.forEach(action => {
                actionSequence.push(action.technique);
            });
        }
    }

    let instruction = actionSequence.join(', ');

    // Add repeat clause for multiple markers
    if (markers.length > 1) {
        instruction += `, repeat for ${markers.length === 2 ? 'remaining marker' : 'remaining markers'}`;
    }

    return instruction;
};

/**
 * Generate individual marker instructions (each marker treated differently)
 * @param {Object} actionsByTarget - Actions grouped by target marker
 * @param {Array} markers - All targeted markers
 * @param {string} basePattern - Base pattern name
 * @returns {string} - Generated instruction
 */
export const generateIndividualMarkerInstructions = (actionsByTarget, markers, basePattern) => {
    const instructions = [];

    markers.forEach((marker, index) => {
        const actions = actionsByTarget[marker] || [];
        if (actions.length === 0) return;

        const markerInstruction = generateSingleMarkerInstruction(actions, marker, basePattern, index === 0);
        if (markerInstruction) {
            instructions.push(markerInstruction);
        }
    });

    return instructions.join(', ');
};

/**
 * Generate instruction for a single marker
 * @param {Array} actions - Actions for this specific marker
 * @param {string} marker - Marker name
 * @param {string} basePattern - Base pattern name
 * @param {boolean} isFirst - Whether this is the first marker in sequence
 * @returns {string} - Generated instruction
 */
export const generateSingleMarkerInstruction = (actions, marker, basePattern, isFirst) => {
    const parts = [];

    // Add "work to" context for non-first markers
    if (!isFirst) {
        parts.push(`work to marker ${marker}`);
    }

    // Process actions for this marker
    actions.forEach(action => {
        if (action.position === 'before_and_after') {
            const [beforeTech, afterTech] = action.technique.split('_');
            const distance = action.distance === 'at' ? '' : `${action.distance} st `;

            if (distance && isFirst) {
                parts.push(`work in ${basePattern} to ${distance}before marker`);
            }
            parts.push(beforeTech);
            parts.push('slip marker');
            parts.push(afterTech);
        } else if (action.position === 'before') {
            const distance = action.distance === 'at' ? '' : `${action.distance} st `;
            if (distance && isFirst) {
                parts.push(`work in ${basePattern} to ${distance}before marker`);
            }
            parts.push(action.technique);
        } else if (action.position === 'after') {
            parts.push('slip marker');
            parts.push(action.technique);
        }
    });

    return parts.join(', ');
};