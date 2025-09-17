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

            action.targets.forEach(target => {
                if (action.position === 'before_and_after') {
                    const [beforeTech, afterTech] = action.technique.split('_');
                    totalStitchChange += this.getStitchChange(beforeTech) + this.getStitchChange(afterTech);
                } else {
                    totalStitchChange += this.getStitchChange(action.technique);
                }
            });
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
     * Calculate maximum safe iterations
     * Prevents going below minimum stitch threshold
     */
    static getMaxSafeIterations(actions, currentStitches, minStitches = 4) {
        const stitchChangePerIteration = this.calculateStitchChangePerIteration(actions);

        if (stitchChangePerIteration >= 0) {
            return 50; // No upper limit for increases
        }

        const maxReduction = currentStitches - minStitches;
        return Math.floor(maxReduction / Math.abs(stitchChangePerIteration));
    }
}