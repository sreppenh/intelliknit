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

    // Check if this is round construction (has BOR)
    const isRound = markerArray.includes('BOR');

    if (isRound) {
        // Handle round construction with special BOR logic
        return generateRoundInstruction(actionsByMarker, markerArray, basePattern);
    } else {
        // Handle flat construction (existing logic)
        return generateFlatInstruction(actionsByMarker, markerArray, basePattern);
    }
};

// New function for round construction
const generateRoundInstruction = (actionsByMarker, markerArray, basePattern) => {
    const instructionParts = [];
    let totalStitchChange = 0;

    // Step 1: Handle "after BOR" actions (happens at round start)
    const borActions = actionsByMarker['BOR'] || [];
    const afterBorActions = borActions.filter(action => action.position === 'after');

    const regularMarkers = markerArray.filter(item => typeof item === 'string' && item !== 'BOR');
    const hasRegularMarkerActions = regularMarkers.some(marker => actionsByMarker[marker]?.length > 0);

    // Check for edge-only actions exception
    const hasAfterBorActions = afterBorActions.length > 0 ||
        borActions.some(action => action.position === 'before_and_after');
    const hasBeforeBorActions = borActions.filter(action => action.position === 'before').length > 0 ||
        borActions.some(action => action.position === 'before_and_after');
    const isEdgeOnlyPattern = (hasAfterBorActions || hasBeforeBorActions) && !hasRegularMarkerActions;
    const hasBothEdgeActions = hasAfterBorActions && hasBeforeBorActions;

    // DEBUG: Add these console.log statements
    console.log('DEBUG - hasAfterBorActions:', hasAfterBorActions);
    console.log('DEBUG - hasBeforeBorActions:', hasBeforeBorActions);
    console.log('DEBUG - hasRegularMarkerActions:', hasRegularMarkerActions);
    console.log('DEBUG - isEdgeOnlyPattern:', isEdgeOnlyPattern);
    console.log('DEBUG - hasBothEdgeActions:', hasBothEdgeActions);
    console.log('DEBUG - borActions:', borActions);

    if (isEdgeOnlyPattern && hasBothEdgeActions) {
        // Handle before_and_after actions for BOR
        const beforeAndAfterActions = borActions.filter(action => action.position === 'before_and_after');

        if (beforeAndAfterActions.length > 0) {
            const action = beforeAndAfterActions[0];
            const [beforeTech, afterTech] = action.technique.split('_');

            // After BOR part (beginning of round)
            const distance = action.distance === 'at' ? 0 : parseInt(action.distance);
            if (distance > 0) {
                instructionParts.push(`k${distance}`);
            }
            instructionParts.push(afterTech);

            // Middle section
            instructionParts.push(`work in ${basePattern} until 1 stitch before end of round`);

            // Before BOR part (end of round)
            instructionParts.push(beforeTech);

            totalStitchChange += getStitchChange(beforeTech) + getStitchChange(afterTech);
        } else {
            // Handle separate after BOR and before BOR actions (your existing Case 3 logic)
            afterBorActions.forEach(action => {
                const distance = action.distance === 'at' ? 0 : parseInt(action.distance);
                if (distance > 0) {
                    instructionParts.push(`k${distance}`);
                }
                instructionParts.push(action.technique);
                totalStitchChange += getStitchChange(action.technique);
            });

            instructionParts.push(`work in ${basePattern} until 1 stitch before end of round`);

            const beforeBorActions = borActions.filter(action => action.position === 'before');
            beforeBorActions.forEach(action => {
                instructionParts.push(action.technique);
                const distance = action.distance === 'at' ? 0 : parseInt(action.distance);
                if (distance > 0) {
                    instructionParts.push(`k${distance}`);
                }
                totalStitchChange += getStitchChange(action.technique);
            });
        }

    } else if (isEdgeOnlyPattern && hasAfterBorActions && !hasBeforeBorActions) {
        // Case 1: Only after BOR actions
        afterBorActions.forEach(action => {
            const distance = action.distance === 'at' ? 0 : parseInt(action.distance);
            if (distance > 0) {
                instructionParts.push(`k${distance}`);
            }
            instructionParts.push(action.technique);
            totalStitchChange += getStitchChange(action.technique);
        });

        instructionParts.push(`work in ${basePattern} until end of round`);

    } else if (isEdgeOnlyPattern && hasBeforeBorActions && !hasAfterBorActions) {
        // Case 2: Only before BOR actions
        const beforeBorActions = borActions.filter(action => action.position === 'before');
        beforeBorActions.forEach(action => {
            const distance = action.distance === 'at' ? 0 : parseInt(action.distance);
            const consumption = getStitchConsumption(action.technique);
            const totalStitchesNeeded = consumption + distance;

            if (totalStitchesNeeded > 0) {
                const stitchText = totalStitchesNeeded === 1 ? 'stitch' : 'stitches';
                instructionParts.push(`work in ${basePattern} until ${totalStitchesNeeded} ${stitchText} before end of round`);
            }

            instructionParts.push(action.technique);
            if (distance > 0) {
                instructionParts.push(`k${distance}`);
            }
            totalStitchChange += getStitchChange(action.technique);
        });

    } else {



        if (afterBorActions.length > 0) {
            afterBorActions.forEach(action => {
                const distance = action.distance === 'at' ? 0 : parseInt(action.distance);
                if (distance > 0) {
                    instructionParts.push(`k${distance}`);
                }
                instructionParts.push(action.technique);
                totalStitchChange += getStitchChange(action.technique);
            });
            // Only add transition to marker if there are regular marker actions to process
            if (hasRegularMarkerActions) {
                instructionParts.push(`work in ${basePattern} to marker`);
            }
        } else if (hasRegularMarkerActions) {
            instructionParts.push(`work in ${basePattern} to marker`);
        }

        // Step 2: Process regular markers (exclude BOR) - but only if they have actions

        if (hasRegularMarkerActions) {
            // Check for uniform actions first
            const targetedMarkers = regularMarkers.filter(marker => actionsByMarker[marker]?.length > 0);
            const allIdentical = targetedMarkers.length > 1 &&
                targetedMarkers.every(marker =>
                    JSON.stringify(actionsByMarker[marker]) === JSON.stringify(actionsByMarker[targetedMarkers[0]])
                );

            if (allIdentical) {
                // For uniform actions, we need special handling to avoid redundant "work to marker"
                const actions = actionsByMarker[targetedMarkers[0]];
                const beforeActions = actions.filter(action => action.position === 'before');

                if (beforeActions.length > 0) {
                    const action = beforeActions[0];
                    const distance = action.distance === 'at' ? 0 : parseInt(action.distance);
                    const consumption = getStitchConsumption(action.technique);
                    const totalStitchesNeeded = consumption + distance;

                    // Replace the generic "to marker" with specific consumption-based instruction
                    instructionParts[instructionParts.length - 1] = `work in ${basePattern} until ${totalStitchesNeeded} stitches before marker`;

                    instructionParts.push(action.technique);
                    if (distance > 0) {
                        instructionParts.push(`k${distance}`);
                    }
                    instructionParts.push('slip marker');
                    totalStitchChange += getStitchChange(action.technique) * targetedMarkers.length;
                }

                const repeatCount = targetedMarkers.length - 1;
                instructionParts.push(`repeat ${repeatCount} ${repeatCount === 1 ? 'time' : 'times'}`);

            } else {
                // Process each marker individually
                for (let i = 0; i < regularMarkers.length; i++) {
                    const marker = regularMarkers[i];
                    const markerActions = actionsByMarker[marker] || [];

                    if (markerActions.length === 0) {
                        instructionParts.push('slip marker');
                    } else {
                        const result = processMarkerActions(markerActions);
                        instructionParts.push(...result.parts);
                        totalStitchChange += result.stitchChange;
                    }

                    if (i < regularMarkers.length - 1) {
                        instructionParts.push('work to marker');
                    }
                }
            }
        } else {
            // No regular marker actions - skip straight to completion
            instructionParts.push('work until end of round');
        }

        // Step 3: Handle "before BOR" actions (happens at round end)
        const beforeBorActions = borActions.filter(action => action.position === 'before');

        if (beforeBorActions.length > 0) {
            beforeBorActions.forEach(action => {
                const distance = action.distance === 'at' ? 0 : parseInt(action.distance);
                const consumption = getStitchConsumption(action.technique);
                const totalStitchesNeeded = consumption + distance;

                if (totalStitchesNeeded > 0) {
                    instructionParts.push(`work until ${totalStitchesNeeded} stitches before BOR`);
                }

                instructionParts.push(action.technique);
                if (distance > 0) {
                    instructionParts.push(`k${distance}`);
                }
                totalStitchChange += getStitchChange(action.technique);
            });
        } else if (hasRegularMarkerActions) {
            // Only add "work to end" if we processed regular markers
            instructionParts.push('work to end');
        }

    }
    const instruction = instructionParts.join(', ');
    return {
        instruction: instruction,
        stitchChange: totalStitchChange
    };
};

// New function for flat construction (cleaner separation)
const generateFlatInstruction = (actionsByMarker, markerArray, basePattern) => {
    const instructionParts = [];
    let totalStitchChange = 0;
    let needsBasePattern = true;

    // Walk through the complete marker array (flat construction)
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

    const instruction = instructionParts.join(', ');
    return {
        instruction: instruction,
        stitchChange: totalStitchChange
    };
};

// Helper function for processing marker actions (works for both round and flat)
const processMarkerActions = (markerActions) => {
    const parts = [];
    let stitchChange = 0;

    // Handle before_and_after actions first
    const bothActions = markerActions.filter(action => action.position === 'before_and_after');
    if (bothActions.length > 0) {
        const action = bothActions[0];
        const [beforeTech, afterTech] = action.technique.split('_');
        const distance = action.distance === 'at' ? 0 : parseInt(action.distance);

        // Before technique
        parts.push(beforeTech);
        if (distance > 0) {
            parts.push(`k${distance}`);
        }
        parts.push('slip marker');
        if (distance > 0) {
            parts.push(`k${distance}`);
        }
        parts.push(afterTech);

        stitchChange += getStitchChange(beforeTech) + getStitchChange(afterTech);
        return { parts, stitchChange };
    }

    // Handle separate before and after actions
    const beforeActions = markerActions.filter(action => action.position === 'before');
    const afterActions = markerActions.filter(action => action.position === 'after');

    beforeActions.forEach(action => {
        const distance = action.distance === 'at' ? 0 : parseInt(action.distance);
        const consumption = getStitchConsumption(action.technique);
        const totalStitchesNeeded = consumption + distance;

        // Add working instruction if stitches needed
        if (totalStitchesNeeded > 0) {
            parts.push(`work until ${totalStitchesNeeded} stitches before marker`);
        }

        parts.push(action.technique);
        if (distance > 0) {
            parts.push(`k${distance}`);
        }
        stitchChange += getStitchChange(action.technique);
    });

    parts.push('slip marker');

    afterActions.forEach(action => {
        const distance = action.distance === 'at' ? 0 : parseInt(action.distance);
        if (distance > 0) {
            parts.push(`k${distance}`);
        }
        parts.push(action.technique);
        stitchChange += getStitchChange(action.technique);
    });

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

/**
 * Generate marker-based instruction preview from actions and timing
 * Extracted from MarkerInstructionBuilder.generatePreview() for reuse across components
 * @param {Array} allActions - All completed actions
 * @param {Object} timing - Timing configuration { frequency, times, amountMode, targetStitches }
 * @param {Array} markerArray - Marker array structure
 * @param {string} construction - 'flat' or 'round'
 * @param {string} basePattern - Base pattern name (e.g., 'stockinette')
 * @returns {string} - Human-readable instruction text
 */
export const generateMarkerInstructionPreview = (allActions, timing, markerArray, construction, basePattern = 'pattern') => {
    if (allActions.length === 0) return "No actions defined yet";

    // Handle 'continue' only actions
    if (allActions.length === 1 && allActions[0].actionType === 'continue') {
        const rowTerm = construction === 'round' ? 'round' : 'row';
        const repeatText = timing.amountMode === 'target' && timing.targetStitches !== null
            ? ` until ${timing.targetStitches} stitches remain`
            : timing.times ? ` ${timing.times} time${timing.times === 1 ? '' : 's'}` : '';
        const frequencyText = timing.frequency > 1 ? ` every ${timing.frequency} ${construction === 'round' ? 'rounds' : 'rows'}` : '';
        return `Work in ${basePattern} until end of ${rowTerm}${frequencyText}${repeatText}`;
    }

    // Handle bind off actions
    const bindOffActions = allActions.filter(action => action.actionType === 'bind_off');
    if (bindOffActions.length > 0) {
        const instructions = bindOffActions.map(action => {
            const amount = action.bindOffAmount === 'all' ? 'all stitches' : `${action.stitchCount} stitch${action.stitchCount === 1 ? '' : 'es'}`;
            const location = action.targets.length > 0 ? ` at ${action.targets.join(' and ')}` : '';
            if (action.bindOffAmount === 'all') {
                return `Bind off all stitches`;
            } else {
                const rowTerm = construction === 'round' ? 'round' : 'row';
                return `Bind off ${amount}${location} then work in ${basePattern} until end of ${rowTerm}`;
            }
        });
        const repeatText = timing.amountMode === 'target' && timing.targetStitches !== null
            ? ` until ${timing.targetStitches} stitches remain`
            : timing.times ? ` ${timing.times} time${timing.times === 1 ? '' : 's'}` : '';
        const frequencyText = timing.frequency > 1 ? ` every ${timing.frequency} ${construction === 'round' ? 'rounds' : 'rows'}` : '';
        return `${instructions.join(' and ')}${frequencyText}${repeatText}`;
    }

    // Process regular marker and edge actions
    const markers = markerArray.filter(item => typeof item === 'string' && item !== 'BOR');
    const markerActions = allActions.filter(action =>
        action.targets.some(target => markers.includes(target) || target === 'BOR'));
    const edgeActions = allActions.filter(action =>
        action.targets.some(target => ['beginning', 'end'].includes(target)));

    const instructionParts = [];
    let totalStitchChange = 0;

    // Handle edge actions first
    if (edgeActions.length > 0) {
        edgeActions.forEach(action => {
            const stitchCount = action.stitchCount || 1;
            action.targets.forEach(target => {
                let displayTechnique = action.technique || (action.actionType === 'increase' ? 'inc' : 'dec');
                if (action.technique && action.technique.includes('_') && action.position === 'both_ends') {
                    const parts = action.technique.split('_');
                    if (target === 'beginning') {
                        displayTechnique = parts[0];
                    } else if (target === 'end') {
                        displayTechnique = parts[1] || parts[0];
                    }
                }
                const location = target === 'beginning' ? 'beginning' : 'end';
                const countText = stitchCount > 1 ? `${stitchCount} ` : '';
                instructionParts.push(`${displayTechnique} ${countText}at ${location}`);
                totalStitchChange += (action.actionType === 'increase' ? 1 : -1) * stitchCount * (action.position === 'both_ends' ? 2 : 1);
            });
        });
    }

    // Handle marker actions
    if (markerActions.length > 0) {
        // Group marker actions by technique, position, and distance to detect repeats
        const groupedActions = {};
        markerActions.forEach(action => {
            const key = `${action.technique}_${action.position}_${action.distance}`;
            if (!groupedActions[key]) {
                groupedActions[key] = {
                    technique: action.technique || (action.actionType === 'increase' ? 'inc' : 'dec'),
                    position: action.position,
                    distance: action.distance,
                    stitchCount: action.stitchCount || 1,
                    actionType: action.actionType,
                    targets: [],
                    count: 0
                };
            }
            groupedActions[key].targets.push(...action.targets);
            groupedActions[key].count += action.targets.length;
        });

        const markerInstructionParts = [];
        Object.values(groupedActions).forEach(group => {
            const stitchCountText = group.stitchCount > 1 ? `${group.stitchCount} ` : '';
            const techniqueText = `${stitchCountText}${group.technique}`;
            const positionText = group.position ? ` ${group.position}` : '';
            const distanceText = group.distance && group.distance !== 'at' ? ` ${group.distance} st from marker` : '';
            const actionText = `${techniqueText}${positionText}${distanceText}, slip marker`;

            if (group.count > 1) {
                // Handle in-row repeat
                markerInstructionParts.push(`Work in ${basePattern} to marker, ${actionText}, repeat ${group.count - 1} time${group.count - 1 === 1 ? '' : 's'}`);
                totalStitchChange += (group.actionType === 'increase' ? 1 : -1) * group.stitchCount * group.count;
            } else {
                // Single action, no repeat
                markerInstructionParts.push(`Work in ${basePattern} to marker, ${actionText}`);
                totalStitchChange += (group.actionType === 'increase' ? 1 : -1) * group.stitchCount;
            }
        });

        // Add final "work to end" if there are remaining stitches
        const lastMarkerIndex = markerArray.lastIndexOf(markers[markers.length - 1]);
        if (lastMarkerIndex < markerArray.length - 1) {
            markerInstructionParts.push(`work to end`);
        }

        instructionParts.push(markerInstructionParts.join(', '));
    }

    // Build final instruction
    const instruction = instructionParts.join(' and ');
    const stitchChangeText = totalStitchChange !== 0 ? ` (${totalStitchChange > 0 ? '+' : ''}${totalStitchChange} sts)` : '';
    const repeatText = timing.amountMode === 'target' && timing.targetStitches !== null
        ? ` until ${timing.targetStitches} stitches remain`
        : timing.times && timing.times > 1 ? ` ${timing.times} time${timing.times === 1 ? '' : 's'}` : '';
    const frequencyText = timing.frequency > 1 ? ` every ${timing.frequency} ${construction === 'round' ? 'rounds' : 'rows'}` : '';

    return instruction ? `${instruction.charAt(0).toUpperCase()}${instruction.slice(1)}${frequencyText}${repeatText}${stitchChangeText}` : "No valid actions defined";
};