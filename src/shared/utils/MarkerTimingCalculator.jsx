// src/shared/utils/MarkerTimingCalculator.js
import { getStitchConsumption } from './stitchCalculatorUtils';
import markerArrayUtils from './markerArrayUtils';
import IntelliKnitLogger from './ConsoleLogging';


/**
 * Marker Timing Calculator
 * Handles stitch calculations and validation for marker-based timing
 * Based on PhaseCalculationService patterns
 */
export class MarkerTimingCalculator {

    /**
     * Get stitch change for a technique (extracted from markerInstructionUtils.js)
     */
    static getStitchChange(technique) {
        const techniqueMap = {
            'SSK': -1, 'K2tog': -1, 'K3tog': -2, 'CDD': -2,
            'M1L': +1, 'M1R': +1, 'YO': +1, 'KFB': +1,
        };
        return techniqueMap[technique] || 0;
    }

    /**
     * Calculate total stitch change per iteration from actions
     * Extracted logic from markerInstructionUtils.js
     */
    static calculateStitchChangePerIteration(actions) {
        let totalStitchChange = 0;

        actions.forEach(action => {
            if (action.actionType === 'continue') return;

            if (action.position === 'both_ends') {
                // For both_ends, each part of split technique goes to one end
                if (action.technique.includes('_')) {
                    const techniques = action.technique.split('_');
                    techniques.forEach(tech => {
                        totalStitchChange += this.getStitchChange(tech);
                    });
                } else {
                    // Single technique applied to both ends
                    totalStitchChange += this.getStitchChange(action.technique) * 2;
                }
            } else {
                action.targets.forEach(target => {
                    if (action.position === 'before_and_after') {
                        const [beforeTech, afterTech] = action.technique.split('_');
                        totalStitchChange += this.getStitchChange(beforeTech) + this.getStitchChange(afterTech);
                    } else {
                        totalStitchChange += this.getStitchChange(action.technique);
                    }
                });
            }
        });

        return totalStitchChange;
    }

    /**
     * Calculate stitch context and constraints
     * Similar to PhaseCalculationService.calculateStitchContext
     */
    static calculateMarkerStitchContext(actions, currentStitches, timing) {

        const stitchChangePerIteration = this.calculateStitchChangePerIteration(actions);

        // Calculate ending stitches based on timing
        let endingStitches = currentStitches;
        let maxIterations = 1;

        if (timing.amountMode === 'target' && timing.targetStitches !== null) {
            // Calculate iterations needed to reach target
            if (stitchChangePerIteration !== 0) {
                const iterationsNeeded = Math.abs((timing.targetStitches - currentStitches) / stitchChangePerIteration);
                maxIterations = Math.ceil(iterationsNeeded);
                endingStitches = timing.targetStitches;
            }
        } else if (timing.times) {
            maxIterations = timing.times;
            endingStitches = currentStitches + (stitchChangePerIteration * timing.times);
        }

        // Validate constraints
        const errors = [];
        if (endingStitches < 0) {
            errors.push(`Cannot reduce to ${endingStitches} stitches`);
        }

        return {
            startingStitches: currentStitches,
            endingStitches: Math.max(0, endingStitches),
            stitchChangePerIteration,
            maxIterations,
            totalRows: maxIterations * (timing.frequency || 1),
            errors,
            isValid: errors.length === 0
        };
    }

    /**
     * Calculate maximum safe iterations with segment-level validation
     * Simulates action sequences to ensure no segment is over-consumed
     */
    static getMaxSafeIterations(actions, currentArray, completedPhases = []) {

        if (!actions || !currentArray) return 1;

        // Start with array state after completed phases
        let simulationArray = [...currentArray];

        // Apply completed phases first
        for (const phase of completedPhases) {
            for (let i = 0; i < phase.times; i++) {
                const markerActions = this.convertActionsToMarkerActions(actions, simulationArray);
                simulationArray = markerArrayUtils.applyMarkerActions(simulationArray, markerActions);
            }
        }

        // Now test how many more iterations we can safely do
        let maxIterations = 0;
        const maxTestIterations = 100; // Safety limit

        for (let iteration = 0; iteration < maxTestIterations; iteration++) {

            // Check if this iteration would be valid
            const canPerform = this.canPerformActions(actions, simulationArray);

            if (canPerform) {
                maxIterations++;

                // Apply the actions to continue simulation
                const markerActions = this.convertActionsToMarkerActions(actions, simulationArray);
                simulationArray = markerArrayUtils.applyMarkerActions(simulationArray, markerActions);
            } else {
                break; // Can't perform another iteration
            }
        }

        return Math.max(1, maxIterations);
    }

    /**
     * Check if actions can be performed with current array state
     */
    static canPerformActions(actions, currentArray) {
        for (const action of actions) {
            if (action.actionType === 'continue') continue;

            if (!this.canPerformSingleAction(action, currentArray)) {
                return false;
            }
        }
        return true;
    }

    /**
     * Check if a single action can be performed
     */
    static canPerformSingleAction(action, currentArray) {

        const stitchConsumption = this.getActionStitchConsumption(action);

        if (action.position === 'both_ends') {
            // Check both end segments
            const firstSegment = this.getFirstStitchSegment(currentArray);
            const lastSegment = this.getLastStitchSegment(currentArray);

            return firstSegment >= stitchConsumption && lastSegment >= stitchConsumption;
        }

        // Check each target segment
        for (const target of action.targets || []) {
            const segmentStitches = this.getSegmentStitchesForTarget(currentArray, target, action.position);
            if (segmentStitches < stitchConsumption) {
                return false;
            }
        }

        return true;
    }

    /**
    * Get stitch consumption for an action sequence
    */
    static getActionStitchConsumption(action) {
        console.log('Action distance:', action.distance, 'technique:', action.technique);
        const techniqueConsumption = getStitchConsumption(action.technique);
        const distance = parseInt(action.distance) || 0;
        return techniqueConsumption + distance;
    }

    /**
     * Get stitch consumption for a single technique
     */
    static getTechniqueConsumption(technique) {
        const consumptionMap = {
            'K': 1, 'K1': 1, 'P': 1, 'P1': 1,
            'SSK': 2, 'K2tog': 2, 'K3tog': 3, 'CDD': 3,
            'YO': 0, 'M1L': 0, 'M1R': 0, 'KFB': 1
        };
        return consumptionMap[technique] || 1;
    }

    /**
     * Get segment stitches for a target/position combination
     */
    static getSegmentStitchesForTarget(currentArray, target, position) {
        if (target === 'beginning') {
            return this.getFirstStitchSegment(currentArray);
        }

        if (target === 'end') {
            return this.getLastStitchSegment(currentArray);
        }

        // For marker targets, find the relevant segment
        const markerContext = markerArrayUtils.getMarkerContext(currentArray, target);
        if (!markerContext) return 0;

        if (position === 'before' || position === 'after') {
            return position === 'before' ? markerContext.segmentBefore : markerContext.segmentAfter;
        }

        return markerContext.segmentBefore; // Default fallback
    }

    /**
     * Get first stitch segment
     */
    static getFirstStitchSegment(array) {
        for (const item of array) {
            if (typeof item === 'number') return item;
        }
        return 0;
    }

    /**
     * Get last stitch segment  
     */
    static getLastStitchSegment(array) {
        for (let i = array.length - 1; i >= 0; i--) {
            if (typeof array[i] === 'number') return array[i];
        }
        return 0;
    }

    /**
     * Convert instruction actions to marker actions format
     */
    static convertActionsToMarkerActions(actions, currentArray) {
        // This should use the existing logic from markerArrayUtils.convertInstructionToMarkerActions
        // But that function isn't exported, so we'll implement a simplified version
        const markerActions = [];

        for (const action of actions) {
            if (action.actionType === 'continue') continue;

            const stitchChange = this.getStitchChange(action.technique);

            if (action.position === 'both_ends') {
                markerActions.push({
                    markers: ['beginning', 'end'],
                    before: { count: stitchChange }
                });
            } else {
                for (const target of action.targets || []) {
                    if (action.position === 'before') {
                        markerActions.push({
                            markers: [target],
                            before: { count: stitchChange }
                        });
                    } else if (action.position === 'after') {
                        markerActions.push({
                            markers: [target],
                            after: { count: stitchChange }
                        });
                    }
                }
            }
        }

        return markerActions;
    }
}