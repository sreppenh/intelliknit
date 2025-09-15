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
 * Find the index of the last marker in the array that has actions
 * @param {Array} markers - Array of marker names
 * @param {Object} actionsByMarker - Object mapping marker names to their actions
 * @returns {number} - Index of last marker with actions, or -1 if none
 */
const findLastActionMarkerIndex = (markers, actionsByMarker) => {
    for (let i = markers.length - 1; i >= 0; i--) {
        if (actionsByMarker[markers[i]] && actionsByMarker[markers[i]].length > 0) {
            return i;
        }
    }
    return -1;
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
                const distance = action.distance && action.distance !== 'at' ? parseInt(action.distance) : 0;
                const stitchCount = action.stitchCount || 1;

                if (distance === 0) {
                    // Cast on at both ends - use same technique for both
                    edgeInstructionParts.push(`Using ${action.technique}, cast on ${stitchCount} stitches`);
                    edgeInstructionParts.push(`work in ${basePattern} until end`);
                    edgeInstructionParts.push(`using ${action.technique}, cast on ${stitchCount} stitches`);
                    totalStitchChange += stitchCount * 2; // Cast on at both ends
                } else {
                    // Regular increase case - split technique
                    const [beginTech, endTech] = action.technique.split('_');

                    // Beginning technique
                    edgeInstructionParts.push(`k${distance}`);
                    edgeInstructionParts.push(beginTech);

                    // Middle section - work in pattern
                    const consumption = getStitchConsumption(endTech);
                    const totalStitchesNeeded = consumption + distance;
                    const stitchText = totalStitchesNeeded === 1 ? 'stitch' : 'stitches';
                    edgeInstructionParts.push(`work in ${basePattern} until ${totalStitchesNeeded} ${stitchText} before end`);

                    // End technique
                    edgeInstructionParts.push(endTech);
                    edgeInstructionParts.push(`k${distance}`);

                    totalStitchChange += getStitchChange(beginTech) + getStitchChange(endTech);
                }
            }
            else {
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

    // Handle round construction separately
    if (construction === 'round' && markerArray.includes('BOR') && markerActions.length > 0) {
        return generateRoundInstructions(allActions, timing, markerArray, basePattern);
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

/**
 * Generate round construction instructions with BOR handling
 * @param {Array} allActions - All completed actions  
 * @param {Object} timing - Timing configuration
 * @param {Array} markerArray - Marker array with BOR
 * @param {string} basePattern - Base pattern name
 * @returns {string} - Round instruction text
 */
const generateRoundInstructions = (allActions, timing, markerArray, basePattern) => {
    const markers = markerArray.filter(item => typeof item === 'string' && item !== 'BOR');
    const actionsByMarker = {};
    let totalStitchChange = 0;

    // Group actions by target marker
    allActions.forEach(action => {
        action.targets.forEach(target => {
            if (!actionsByMarker[target]) actionsByMarker[target] = [];
            actionsByMarker[target].push(action);
        });
    });

    const borActions = actionsByMarker['BOR'] || [];
    const regularMarkerActions = markers.filter(marker => actionsByMarker[marker]?.length > 0);
    const instructionParts = [];

    // Case 1: Only BOR actions
    if (borActions.length > 0 && regularMarkerActions.length === 0) {
        // Handle before_and_after BOR actions first
        const bothBorActions = borActions.filter(action => action.position === 'before_and_after');
        if (bothBorActions.length > 0) {
            const action = bothBorActions[0];
            const [beforeTech, afterTech] = action.technique.split('_');
            const distance = action.distance && action.distance !== 'at' ? parseInt(action.distance) : 0;

            // After BOR part (round start)
            if (distance > 0) {
                instructionParts.push(`k${distance}`);
            }
            instructionParts.push(afterTech);

            // Before BOR part (round end)
            const consumption = getStitchConsumption(beforeTech);
            const totalStitchesNeeded = consumption + distance;

            if (totalStitchesNeeded > 0) {
                const stitchText = totalStitchesNeeded === 1 ? 'stitch' : 'stitches';
                instructionParts.push(`work in ${basePattern} until ${totalStitchesNeeded} ${stitchText} before end of round`);
            } else {
                instructionParts.push(`work in ${basePattern} until end of round`);
            }

            instructionParts.push(beforeTech);
            if (distance > 0) {
                instructionParts.push(`k${distance}`);
            }

            totalStitchChange += getStitchChange(beforeTech) + getStitchChange(afterTech);
        } else {
            // Handle separate after and before BOR actions
            const afterBorActions = borActions.filter(action => action.position === 'after');
            const beforeBorActions = borActions.filter(action => action.position === 'before');

            // After BOR actions (round start)
            afterBorActions.forEach(action => {
                const distance = action.distance && action.distance !== 'at' ? parseInt(action.distance) : 0;
                if (distance > 0) {
                    instructionParts.push(`k${distance}`);
                }
                instructionParts.push(action.technique);
                totalStitchChange += getStitchChange(action.technique);
            });

            // Before BOR actions (round end)
            if (beforeBorActions.length > 0) {
                beforeBorActions.forEach(action => {
                    const distance = action.distance && action.distance !== 'at' ? parseInt(action.distance) : 0;
                    const consumption = getStitchConsumption(action.technique);
                    const totalStitchesNeeded = consumption + distance;

                    if (totalStitchesNeeded > 0) {
                        const stitchText = totalStitchesNeeded === 1 ? 'stitch' : 'stitches';
                        instructionParts.push(`work in ${basePattern} until ${totalStitchesNeeded} ${stitchText} before end of round`);
                    } else {
                        instructionParts.push(`work in ${basePattern} until end of round`);
                    }

                    instructionParts.push(action.technique);
                    if (distance > 0) {
                        instructionParts.push(`k${distance}`);
                    }
                    totalStitchChange += getStitchChange(action.technique);
                });
            } else {
                instructionParts.push(`work in ${basePattern} until end of round`);
            }
        }
    } else {
        // Case 2: All markers identical including BOR (uniform with BOR)
        const allMarkersIncludingBor = [...markers, 'BOR'];
        const allMarkersHaveActions = allMarkersIncludingBor.every(marker => actionsByMarker[marker]?.length > 0);
        const allMarkersHaveIdenticalActions = allMarkersHaveActions && allMarkersIncludingBor.every(marker => {
            const firstActions = actionsByMarker[allMarkersIncludingBor[0]];
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
            // Case 2: Three-part flow - after BOR, regular markers with repeat, before BOR
            const action = actionsByMarker[allMarkersIncludingBor[0]][0];
            const distance = action.distance && action.distance !== 'at' ? parseInt(action.distance) : 0;

            if (action.position === 'after') {
                // After BOR actions (round start)
                if (distance > 0) {
                    instructionParts.push(`k${distance}`);
                }
                instructionParts.push(action.technique);

                // Regular markers with repeat
                instructionParts.push(`work in ${basePattern} to marker`);
                instructionParts.push('slip marker');
                if (distance > 0) {
                    instructionParts.push(`k${distance}`);
                }
                instructionParts.push(action.technique);

                if (markers.length > 1) {
                    instructionParts.push(`repeat ${markers.length - 1} ${markers.length - 1 === 1 ? 'time' : 'times'}`);
                }
                instructionParts.push('work to end of round');

            } else if (action.position === 'before') {
                // Regular markers with repeat
                const consumption = getStitchConsumption(action.technique);
                const totalStitchesNeeded = consumption + distance;

                if (totalStitchesNeeded > 0) {
                    const stitchText = totalStitchesNeeded === 1 ? 'stitch' : 'stitches';
                    instructionParts.push(`Work in ${basePattern} until ${totalStitchesNeeded} ${stitchText} before marker`);
                } else {
                    instructionParts.push(`Work in ${basePattern} until marker`);
                }
                instructionParts.push(action.technique);
                if (distance > 0) {
                    instructionParts.push(`k${distance}`);
                }
                instructionParts.push('slip marker');

                if (markers.length > 1) {
                    instructionParts.push(`repeat ${markers.length - 1} ${markers.length - 1 === 1 ? 'time' : 'times'}`);
                }

                // Before BOR actions (round end)
                if (totalStitchesNeeded > 0) {
                    const stitchText = totalStitchesNeeded === 1 ? 'stitch' : 'stitches';
                    instructionParts.push(`work until ${totalStitchesNeeded} ${stitchText} before end of round`);
                } else {
                    instructionParts.push(`work until end of round`);
                }
                instructionParts.push(action.technique);
                if (distance > 0) {
                    instructionParts.push(`k${distance}`);
                }

            } else if (action.position === 'before_and_after') {
                const [beforeTech, afterTech] = action.technique.split('_');

                // After BOR actions (round start)  
                if (distance > 0) {
                    instructionParts.push(`k${distance}`);
                }
                instructionParts.push(afterTech);

                // Regular markers with repeat
                const consumption = getStitchConsumption(beforeTech);
                const totalStitchesNeeded = consumption + distance;

                if (totalStitchesNeeded > 0) {
                    const stitchText = totalStitchesNeeded === 1 ? 'stitch' : 'stitches';
                    instructionParts.push(`work in ${basePattern} until ${totalStitchesNeeded} ${stitchText} before marker`);
                } else {
                    instructionParts.push(`work in ${basePattern} until marker`);
                }
                instructionParts.push(beforeTech);
                if (distance > 0) {
                    instructionParts.push(`k${distance}`);
                }
                instructionParts.push('slip marker');
                if (distance > 0) {
                    instructionParts.push(`k${distance}`);
                }
                instructionParts.push(afterTech);

                if (markers.length > 1) {
                    instructionParts.push(`repeat ${markers.length - 1} ${markers.length - 1 === 1 ? 'time' : 'times'}`);
                }

                // Before BOR actions (round end)
                if (totalStitchesNeeded > 0) {
                    const stitchText = totalStitchesNeeded === 1 ? 'stitch' : 'stitches';
                    instructionParts.push(`work until ${totalStitchesNeeded} ${stitchText} before end of round`);
                } else {
                    instructionParts.push(`work until end of round`);
                }
                instructionParts.push(beforeTech);
                if (distance > 0) {
                    instructionParts.push(`k${distance}`);
                }

                totalStitchChange += (getStitchChange(beforeTech) + getStitchChange(afterTech)) * allMarkersIncludingBor.length;
            } else {
                totalStitchChange += getStitchChange(action.technique) * allMarkersIncludingBor.length;
            }
        } else {
            // Case 3: Regular markers uniform, BOR excluded (or Case 4: Individual processing)
            const regularMarkersHaveActions = markers.filter(marker => actionsByMarker[marker]?.length > 0);
            const allRegularMarkersHaveActions = markers.every(marker => actionsByMarker[marker]?.length > 0);
            const allRegularMarkersHaveIdenticalActions = allRegularMarkersHaveActions && markers.every(marker => {
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

            if (allRegularMarkersHaveIdenticalActions && regularMarkersHaveActions.length > 0) {
                // Case 3: Uniform regular markers, BOR separate
                // Case 3: Uniform regular markers, BOR separate - three-part flow
                const action = actionsByMarker[regularMarkersHaveActions[0]][0];
                const distance = action.distance && action.distance !== 'at' ? parseInt(action.distance) : 0;

                // Part 1: After BOR actions (round start)
                const afterBorActions = borActions.filter(action => action.position === 'after');
                afterBorActions.forEach(action => {
                    const borDistance = action.distance && action.distance !== 'at' ? parseInt(action.distance) : 0;
                    if (borDistance > 0) {
                        instructionParts.push(`k${borDistance}`);
                    }
                    instructionParts.push(action.technique);
                    totalStitchChange += getStitchChange(action.technique);
                });

                // Part 2: Regular markers with uniform repeat
                if (action.position === 'before') {
                    const consumption = getStitchConsumption(action.technique);
                    const totalStitchesNeeded = consumption + distance;

                    if (totalStitchesNeeded > 0) {
                        const stitchText = totalStitchesNeeded === 1 ? 'stitch' : 'stitches';
                        instructionParts.push(`work in ${basePattern} until ${totalStitchesNeeded} ${stitchText} before marker`);
                    } else {
                        instructionParts.push(`work in ${basePattern} until marker`);
                    }
                    instructionParts.push(action.technique);
                    if (distance > 0) {
                        instructionParts.push(`k${distance}`);
                    }
                    instructionParts.push('slip marker');

                    if (regularMarkersHaveActions.length > 1) {
                        instructionParts.push(`repeat ${regularMarkersHaveActions.length - 1} ${regularMarkersHaveActions.length - 1 === 1 ? 'time' : 'times'}`);
                    }

                    totalStitchChange += getStitchChange(action.technique) * regularMarkersHaveActions.length;

                } else if (action.position === 'after') {
                    instructionParts.push(`work in ${basePattern} to marker`);
                    instructionParts.push('slip marker');
                    if (distance > 0) {
                        instructionParts.push(`k${distance}`);
                    }
                    instructionParts.push(action.technique);

                    if (regularMarkersHaveActions.length > 1) {
                        instructionParts.push(`repeat ${regularMarkersHaveActions.length - 1} ${regularMarkersHaveActions.length - 1 === 1 ? 'time' : 'times'}`);
                    }

                    totalStitchChange += getStitchChange(action.technique) * regularMarkersHaveActions.length;

                } else if (action.position === 'before_and_after') {
                    const [beforeTech, afterTech] = action.technique.split('_');
                    const consumption = getStitchConsumption(beforeTech);
                    const totalStitchesNeeded = consumption + distance;

                    if (totalStitchesNeeded > 0) {
                        const stitchText = totalStitchesNeeded === 1 ? 'stitch' : 'stitches';
                        instructionParts.push(`work in ${basePattern} until ${totalStitchesNeeded} ${stitchText} before marker`);
                    } else {
                        instructionParts.push(`work in ${basePattern} until marker`);
                    }
                    instructionParts.push(beforeTech);
                    if (distance > 0) {
                        instructionParts.push(`k${distance}`);
                    }
                    instructionParts.push('slip marker');
                    if (distance > 0) {
                        instructionParts.push(`k${distance}`);
                    }
                    instructionParts.push(afterTech);

                    if (regularMarkersHaveActions.length > 1) {
                        instructionParts.push(`repeat ${regularMarkersHaveActions.length - 1} ${regularMarkersHaveActions.length - 1 === 1 ? 'time' : 'times'}`);
                    }

                    totalStitchChange += (getStitchChange(beforeTech) + getStitchChange(afterTech)) * regularMarkersHaveActions.length;
                }

                // Part 3: Before BOR actions (round end)
                const beforeBorActions = borActions.filter(action => action.position === 'before');
                if (beforeBorActions.length > 0) {
                    beforeBorActions.forEach(action => {
                        const borDistance = action.distance && action.distance !== 'at' ? parseInt(action.distance) : 0;
                        const consumption = getStitchConsumption(action.technique);
                        const totalStitchesNeeded = consumption + borDistance;

                        if (totalStitchesNeeded > 0) {
                            const stitchText = totalStitchesNeeded === 1 ? 'stitch' : 'stitches';
                            instructionParts.push(`work until ${totalStitchesNeeded} ${stitchText} before end of round`);
                        } else {
                            instructionParts.push(`work until end of round`);
                        }

                        instructionParts.push(action.technique);
                        if (borDistance > 0) {
                            instructionParts.push(`k${borDistance}`);
                        }
                        totalStitchChange += getStitchChange(action.technique);
                    });
                } else {
                    instructionParts.push('work to end of round');
                }
            } else {
                // Case 4: Individual processing - different markers have different actions
                const instructionParts = [];
                let totalStitchChange = 0;

                // Part 1: After BOR actions (round start)
                const afterBorActions = borActions.filter(action => action.position === 'after' || action.position === 'before_and_after');
                afterBorActions.forEach(action => {
                    const borDistance = action.distance && action.distance !== 'at' ? parseInt(action.distance) : 0;

                    if (action.position === 'before_and_after') {
                        // Handle after part of before_and_after
                        const [beforeTech, afterTech] = action.technique.split('_');
                        if (borDistance > 0) {
                            instructionParts.push(`k${borDistance}`);
                        }
                        instructionParts.push(afterTech);
                        totalStitchChange += getStitchChange(afterTech);
                    } else {
                        // Handle regular after action
                        if (borDistance > 0) {
                            instructionParts.push(`k${borDistance}`);
                        }
                        instructionParts.push(action.technique);
                        totalStitchChange += getStitchChange(action.technique);
                    }
                });

                // Part 2: Process each marker individually until last action marker
                const lastActionMarkerIndex = findLastActionMarkerIndex(markers, actionsByMarker);

                for (let i = 0; i <= lastActionMarkerIndex; i++) {
                    const marker = markers[i];
                    const markerActions = actionsByMarker[marker];

                    if (markerActions && markerActions.length > 0) {
                        const action = markerActions[0];
                        const distance = action.distance && action.distance !== 'at' ? parseInt(action.distance) : 0;

                        if (action.position === 'before') {
                            // Handle before action - technique goes before slip marker
                            const consumption = getStitchConsumption(action.technique);
                            const totalStitchesNeeded = consumption + distance;

                            if (i === 0) {
                                if (totalStitchesNeeded > 0) {
                                    const stitchText = totalStitchesNeeded === 1 ? 'stitch' : 'stitches';
                                    instructionParts.push(`work in ${basePattern} until ${totalStitchesNeeded} ${stitchText} before marker`);
                                } else {
                                    instructionParts.push(`work in ${basePattern} to marker`);
                                }
                            } else {
                                if (totalStitchesNeeded > 0) {
                                    const stitchText = totalStitchesNeeded === 1 ? 'stitch' : 'stitches';
                                    instructionParts.push(`work until ${totalStitchesNeeded} ${stitchText} before marker`);
                                } else {
                                    instructionParts.push(`work to marker`);
                                }
                            }
                            instructionParts.push(action.technique);
                            if (distance > 0) {
                                instructionParts.push(`k${distance}`);
                            }
                            instructionParts.push('slip marker');
                            totalStitchChange += getStitchChange(action.technique);

                        } else if (action.position === 'after') {
                            // Handle after action - slip marker first, then technique
                            if (i === 0) {
                                instructionParts.push(`work in ${basePattern} to marker`);
                            } else {
                                instructionParts.push(`work to marker`);
                            }
                            instructionParts.push('slip marker');
                            if (distance > 0) {
                                instructionParts.push(`k${distance}`);
                            }
                            instructionParts.push(action.technique);
                            totalStitchChange += getStitchChange(action.technique);

                        } else if (action.position === 'before_and_after') {
                            const [beforeTech, afterTech] = action.technique.split('_');
                            // Before part
                            const consumption = getStitchConsumption(beforeTech);
                            const totalStitchesNeeded = consumption + distance;

                            if (i === 0) {
                                if (totalStitchesNeeded > 0) {
                                    const stitchText = totalStitchesNeeded === 1 ? 'stitch' : 'stitches';
                                    instructionParts.push(`work in ${basePattern} until ${totalStitchesNeeded} ${stitchText} before marker`);
                                } else {
                                    instructionParts.push(`work in ${basePattern} to marker`);
                                }
                            } else {
                                if (totalStitchesNeeded > 0) {
                                    const stitchText = totalStitchesNeeded === 1 ? 'stitch' : 'stitches';
                                    instructionParts.push(`work until ${totalStitchesNeeded} ${stitchText} before marker`);
                                } else {
                                    instructionParts.push(`work to marker`);
                                }
                            }
                            instructionParts.push(beforeTech);
                            if (distance > 0) {
                                instructionParts.push(`k${distance}`);
                            }
                            instructionParts.push('slip marker');
                            if (distance > 0) {
                                instructionParts.push(`k${distance}`);
                            }
                            instructionParts.push(afterTech);
                            totalStitchChange += getStitchChange(beforeTech) + getStitchChange(afterTech);
                        }
                    } else {
                        // No action for this marker - just acknowledge it
                        if (i === 0) {
                            instructionParts.push(`work in ${basePattern} to marker`);
                        } else {
                            instructionParts.push(`work to marker`);
                        }
                        instructionParts.push('slip marker');
                    }
                }

                // Part 3: Before BOR actions (round end) OR work to end
                const beforeBorActions = borActions.filter(action => action.position === 'before' || action.position === 'before_and_after');
                if (beforeBorActions.length > 0) {
                    beforeBorActions.forEach(action => {
                        const borDistance = action.distance && action.distance !== 'at' ? parseInt(action.distance) : 0;

                        if (action.position === 'before_and_after') {
                            // Handle before part of before_and_after
                            const [beforeTech, afterTech] = action.technique.split('_');
                            const consumption = getStitchConsumption(beforeTech);
                            const totalStitchesNeeded = consumption + borDistance;

                            if (totalStitchesNeeded > 0) {
                                const stitchText = totalStitchesNeeded === 1 ? 'stitch' : 'stitches';
                                instructionParts.push(`work until ${totalStitchesNeeded} ${stitchText} before end of round`);
                            } else {
                                instructionParts.push(`work until end of round`);
                            }

                            instructionParts.push(beforeTech);
                            if (borDistance > 0) {
                                instructionParts.push(`k${borDistance}`);
                            }
                            totalStitchChange += getStitchChange(beforeTech);
                        } else {
                            // Handle regular before action
                            const consumption = getStitchConsumption(action.technique);
                            const totalStitchesNeeded = consumption + borDistance;

                            if (totalStitchesNeeded > 0) {
                                const stitchText = totalStitchesNeeded === 1 ? 'stitch' : 'stitches';
                                instructionParts.push(`work until ${totalStitchesNeeded} ${stitchText} before end of round`);
                            } else {
                                instructionParts.push(`work until end of round`);
                            }

                            instructionParts.push(action.technique);
                            if (borDistance > 0) {
                                instructionParts.push(`k${borDistance}`);
                            }
                            totalStitchChange += getStitchChange(action.technique);
                        }
                    });
                } else {
                    instructionParts.push('work to end of round');
                }

                // Build final instruction with timing
                const instruction = instructionParts.join(', ');
                const stitchChangeText = totalStitchChange !== 0 ? ` (${totalStitchChange > 0 ? '+' : ''}${totalStitchChange} sts)` : '';

                const hasRealTiming = (timing.frequency && timing.frequency > 1) ||
                    (timing.times && timing.times > 1) ||
                    (timing.amountMode === 'target' && timing.targetStitches && timing.targetStitches > 0);

                const repeatText = hasRealTiming && timing.amountMode === 'target' && timing.targetStitches !== null && timing.targetStitches > 0
                    ? ` until ${timing.targetStitches} stitches remain`
                    : hasRealTiming && timing.times && timing.times > 1 ? ` ${timing.times} time${timing.times === 1 ? '' : 's'}` : '';
                const frequencyText = hasRealTiming && timing.frequency && timing.frequency > 1 ? ` every ${timing.frequency} rounds` : '';

                return instruction ? `${instruction.charAt(0).toUpperCase()}${instruction.slice(1)}${frequencyText}${repeatText}${stitchChangeText}` : "No valid actions defined";
            }
        }
    }

    // Build final instruction with timing
    const instruction = instructionParts.join(', ');
    const stitchChangeText = totalStitchChange !== 0 ? ` (${totalStitchChange > 0 ? '+' : ''}${totalStitchChange} sts)` : '';

    const hasRealTiming = (timing.frequency && timing.frequency > 1) ||
        (timing.times && timing.times > 1) ||
        (timing.amountMode === 'target' && timing.targetStitches && timing.targetStitches > 0);

    const repeatText = hasRealTiming && timing.amountMode === 'target' && timing.targetStitches !== null && timing.targetStitches > 0
        ? ` until ${timing.targetStitches} stitches remain`
        : hasRealTiming && timing.times && timing.times > 1 ? ` ${timing.times} time${timing.times === 1 ? '' : 's'}` : '';
    const frequencyText = hasRealTiming && timing.frequency && timing.frequency > 1 ? ` every ${timing.frequency} rounds` : '';

    return instruction ? `${instruction.charAt(0).toUpperCase()}${instruction.slice(1)}${frequencyText}${repeatText}${stitchChangeText}` : "No valid actions defined";
};

