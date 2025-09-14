// src/shared/utils/markerInstructionUtils.js

/**
 * Marker Instruction Generation Utilities
 * Single source of truth for generating complete knitting instructions for marker-based shaping
 */

import { getStitchConsumption } from './stitchCalculatorUtils';

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
 * SINGLE SOURCE OF TRUTH for all marker instruction generation
 * @param {Array} allActions - All completed actions
 * @param {Object} timing - Timing configuration { frequency, times, amountMode, targetStitches }
 * @param {Array} markerArray - Marker array structure
 * @param {string} construction - 'flat' or 'round'
 * @param {string} basePattern - Base pattern name (e.g., 'stockinette')
 * @returns {string} - Human-readable instruction text
 */
export const generateMarkerInstructionPreview = (allActions, timing, markerArray, construction, basePattern = 'pattern') => {
    if (allActions.length === 0) return "No actions defined yet";

    // Handle 'continue' only actions - PRESERVE THIS WORKING LOGIC
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
            const totalStitches = markerArray.filter(item => typeof item === 'number').reduce((sum, stitches) => sum + stitches, 0);

            if (action.bindOffAmount === 'all' || action.stitchCount >= totalStitches) {
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

    // Handle edge actions with proper instruction flow
    if (edgeActions.length > 0) {
        const edgeInstructionParts = [];

        edgeActions.forEach(action => {
            if (action.position === 'both_ends' || (action.targets.includes('beginning') && action.targets.includes('end'))) {
                // Handle both ends case
                const [beginTech, endTech] = action.technique.split('_');
                const distance = action.distance && action.distance !== 'at' ? parseInt(action.distance) : 0;

                // Beginning technique
                if (distance > 0) {
                    edgeInstructionParts.push(`k${distance}`);
                }
                edgeInstructionParts.push(beginTech);

                // Middle section - work in pattern
                if (distance > 0) {
                    const consumption = getStitchConsumption(endTech);
                    const totalStitchesNeeded = consumption + distance;
                    const stitchText = totalStitchesNeeded === 1 ? 'stitch' : 'stitches';
                    edgeInstructionParts.push(`work in ${basePattern} until ${totalStitchesNeeded} ${stitchText} before end`);
                } else {
                    edgeInstructionParts.push(`work in ${basePattern} until end`);
                }

                // End technique
                edgeInstructionParts.push(endTech);
                if (distance > 0) {
                    edgeInstructionParts.push(`k${distance}`);
                }

                totalStitchChange += getStitchChange(beginTech) + getStitchChange(endTech);

            } else {
                // Handle single edge case
                action.targets.forEach(target => {
                    const distance = action.distance && action.distance !== 'at' ? parseInt(action.distance) : 0;

                    if (target === 'beginning') {
                        if (distance > 0) {
                            edgeInstructionParts.push(`k${distance}`);
                        }
                        edgeInstructionParts.push(action.technique);
                        edgeInstructionParts.push(`work in ${basePattern} to end`);
                    } else if (target === 'end') {
                        if (distance > 0) {
                            const consumption = getStitchConsumption(action.technique);
                            const totalStitchesNeeded = consumption + distance;
                            const stitchText = totalStitchesNeeded === 1 ? 'stitch' : 'stitches';
                            edgeInstructionParts.push(`work in ${basePattern} until ${totalStitchesNeeded} ${stitchText} before end`);
                        } else {
                            edgeInstructionParts.push(`work in ${basePattern} until end`);
                        }
                        edgeInstructionParts.push(action.technique);
                        if (distance > 0) {
                            edgeInstructionParts.push(`k${distance}`);
                        }
                    }

                    totalStitchChange += getStitchChange(action.technique);
                });
            }
        });

        instructionParts.push(edgeInstructionParts.join(', '));
    }

    // Handle marker actions - FIX THE before_and_after LOGIC HERE
    if (markerActions.length > 0) {
        const actionsByMarker = {};
        markerActions.forEach(action => {
            action.targets.forEach(target => {
                if (!actionsByMarker[target]) actionsByMarker[target] = [];
                actionsByMarker[target].push(action);
            });
        });

        // Check if ALL markers have identical actions (flat marker simplification)
        const targetedMarkers = markers.filter(marker => actionsByMarker[marker]?.length > 0);
        const allMarkersHaveActions = markers.every(marker => actionsByMarker[marker]?.length > 0);
        const allMarkersHaveIdenticalActions = allMarkersHaveActions && markers.every(marker => {
            const firstActions = actionsByMarker[markers[0]];
            const currentActions = actionsByMarker[marker];

            if (firstActions.length !== currentActions.length) return false;

            return firstActions.every((action, index) => {
                const current = currentActions[index];
                return action.actionType === current.actionType &&
                    action.technique === current.technique &&
                    action.position === current.position &&
                    action.distance === current.distance;
            });
        });

        if (allMarkersHaveIdenticalActions) {
            // Uniform actions - generate with repeat
            const action = actionsByMarker[targetedMarkers[0]][0];
            const markerInstructionParts = [];

            if (action.position === 'before_and_after') {
                // FIXED before_and_after logic
                const [beforeTech, afterTech] = action.technique.split('_');
                const distance = action.distance && action.distance !== 'at' ? parseInt(action.distance) : 0;

                // Calculate total stitches needed before marker
                const consumption = getStitchConsumption(beforeTech);
                const totalStitchesNeeded = consumption + distance;

                markerInstructionParts.push(`Work in ${basePattern} until ${totalStitchesNeeded} stitches before marker`);
                markerInstructionParts.push(beforeTech);
                if (distance > 0) {
                    markerInstructionParts.push(`k${distance}`);
                }
                markerInstructionParts.push('slip marker');
                if (distance > 0) {
                    markerInstructionParts.push(`k${distance}`);
                }
                markerInstructionParts.push(afterTech);

                totalStitchChange += (getStitchChange(beforeTech) + getStitchChange(afterTech)) * targetedMarkers.length;

            } else if (action.position === 'before') {
                const distance = action.distance && action.distance !== 'at' ? parseInt(action.distance) : 0;
                const consumption = getStitchConsumption(action.technique);
                const totalStitchesNeeded = consumption + distance;

                markerInstructionParts.push(`Work in ${basePattern} until ${totalStitchesNeeded} stitches before marker`);
                markerInstructionParts.push(action.technique);
                if (distance > 0) {
                    markerInstructionParts.push(`k${distance}`);
                }
                markerInstructionParts.push('slip marker');

                totalStitchChange += getStitchChange(action.technique) * targetedMarkers.length;

            } else if (action.position === 'after') {
                markerInstructionParts.push(`Work in ${basePattern} to marker`);
                markerInstructionParts.push('slip marker');
                const distance = action.distance && action.distance !== 'at' ? parseInt(action.distance) : 0;
                if (distance > 0) {
                    markerInstructionParts.push(`k${distance}`);
                }
                markerInstructionParts.push(action.technique);

                totalStitchChange += getStitchChange(action.technique) * targetedMarkers.length;
            }

            // Add repeat clause
            const repeatCount = targetedMarkers.length - 1;
            if (repeatCount > 0) {
                markerInstructionParts.push(`repeat ${repeatCount} ${repeatCount === 1 ? 'time' : 'times'}`);
            }
            markerInstructionParts.push('work to end');

            instructionParts.push(markerInstructionParts.join(', '));

        } else {
            // Individual marker processing - keep existing logic for now
            const markerInstructionParts = [];
            let lastActionMarkerIndex = -1;

            // Find the last marker that has actions
            for (let i = markers.length - 1; i >= 0; i--) {
                if (actionsByMarker[markers[i]]) {
                    lastActionMarkerIndex = i;
                    break;
                }
            }

            // Process each marker up to the last action marker
            for (let i = 0; i <= lastActionMarkerIndex; i++) {
                const marker = markers[i];
                const markerActionsForThis = actionsByMarker[marker];

                if (i === 0) {
                    // First marker - add work to marker
                    if (markerActionsForThis) {
                        const action = markerActionsForThis[0];
                        const distance = action.distance && action.distance !== 'at' ? parseInt(action.distance) : 0;
                        if (action.position === 'before_and_after') {
                            const [beforeTech, afterTech] = action.technique.split('_');
                            const distance = action.distance && action.distance !== 'at' ? parseInt(action.distance) : 0;
                            if (distance > 0) {
                                const beforeConsumption = getStitchConsumption(beforeTech);
                                const totalStitchesNeeded = beforeConsumption + distance;
                                markerInstructionParts.push(`Work in ${basePattern} until ${totalStitchesNeeded} st before marker, ${beforeTech}, K${distance}, slip marker, ${afterTech}`);
                            } else {
                                markerInstructionParts.push(`Work in ${basePattern} to marker, ${beforeTech}, slip marker, ${afterTech}`);
                            }
                            totalStitchChange += -2; // Both SSK (-1) and K2tog (-1)
                        } else if (action.position === 'before' && distance > 0) {
                            const beforeConsumption = getStitchConsumption(action.technique);
                            const totalStitchesNeeded = beforeConsumption + distance;
                            markerInstructionParts.push(`Work in ${basePattern} until ${totalStitchesNeeded} st before marker, ${action.technique}, K${distance}, slip marker`);
                            totalStitchChange += (action.actionType === 'increase' ? 1 : -1);
                        } else if (action.position === 'before') {
                            markerInstructionParts.push(`Work in ${basePattern} to marker, ${action.technique}, slip marker`);
                            totalStitchChange += (action.actionType === 'increase' ? 1 : -1);
                        } else if (action.position === 'after') {
                            markerInstructionParts.push(`Work in ${basePattern} to marker, slip marker`);
                            if (distance > 0) {
                                markerInstructionParts.push(`k${distance}`);
                            }
                            markerInstructionParts.push(action.technique);
                            totalStitchChange += (action.actionType === 'increase' ? 1 : -1);
                        }
                    } else {
                        markerInstructionParts.push(`Work in ${basePattern} to marker, slip marker`);
                    }
                } else {
                    // Subsequent markers
                    if (markerActionsForThis) {
                        const action = markerActionsForThis[0];
                        const distance = action.distance && action.distance !== 'at' ? parseInt(action.distance) : 0;
                        if (action.position === 'before_and_after') {
                            const [beforeTech, afterTech] = action.technique.split('_');
                            const distance = action.distance && action.distance !== 'at' ? parseInt(action.distance) : 0;
                            if (distance > 0) {
                                const beforeConsumption = getStitchConsumption(beforeTech);
                                const totalStitchesNeeded = beforeConsumption + distance;
                                markerInstructionParts.push(`work until ${totalStitchesNeeded} st before marker, ${beforeTech}, K${distance}, slip marker, ${afterTech}`);
                            } else {
                                markerInstructionParts.push(`Work in ${basePattern} to marker, ${beforeTech}, slip marker, ${afterTech}`);
                            }
                            totalStitchChange += -2; // Both SSK (-1) and K2tog (-1)
                        } else if (action.position === 'before' && distance > 0) {
                            const beforeConsumption = getStitchConsumption(action.technique);
                            const totalStitchesNeeded = beforeConsumption + distance;
                            markerInstructionParts.push(`work until ${totalStitchesNeeded} st before marker, ${action.technique}, K${distance}, slip marker`);
                            totalStitchChange += (action.actionType === 'increase' ? 1 : -1);

                        } else if (action.position === 'before') {
                            markerInstructionParts.push(`work to marker, ${action.technique}, slip marker`);
                            totalStitchChange += (action.actionType === 'increase' ? 1 : -1);
                        } else if (action.position === 'after') {
                            markerInstructionParts.push(`work to marker, slip marker`);
                            if (distance > 0) {
                                markerInstructionParts.push(`k${distance}`);
                            }
                            markerInstructionParts.push(action.technique);
                            totalStitchChange += (action.actionType === 'increase' ? 1 : -1);
                        }

                    } else {
                        markerInstructionParts.push(`work to marker, slip marker`);
                    }
                }
            }

            // Add final work to end
            markerInstructionParts.push('work to end');
            instructionParts.push(markerInstructionParts.join(', '));
        }
    }

    // Build final instruction
    const instruction = instructionParts.join(' and ');
    const stitchChangeText = totalStitchChange !== 0 ? ` (${totalStitchChange > 0 ? '+' : ''}${totalStitchChange} sts)` : '';

    // Only show timing if values are actually set by user (not defaults)
    const hasRealTiming = (timing.frequency && timing.frequency > 1) ||
        (timing.times && timing.times > 1) ||
        (timing.amountMode === 'target' && timing.targetStitches && timing.targetStitches > 0);

    const repeatText = hasRealTiming && timing.amountMode === 'target' && timing.targetStitches !== null && timing.targetStitches > 0
        ? ` until ${timing.targetStitches} stitches remain`
        : hasRealTiming && timing.times && timing.times > 1 ? ` ${timing.times} time${timing.times === 1 ? '' : 's'}` : '';
    const frequencyText = hasRealTiming && timing.frequency && timing.frequency > 1 ? ` every ${timing.frequency} ${construction === 'round' ? 'rounds' : 'rows'}` : '';

    return instruction ? `${instruction.charAt(0).toUpperCase()}${instruction.slice(1)}${frequencyText}${repeatText}${stitchChangeText}` : "No valid actions defined";
};