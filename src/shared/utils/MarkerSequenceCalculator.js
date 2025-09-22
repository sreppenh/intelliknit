// src/shared/utils/MarkerSequenceCalculator.js
import { PhaseCalculationService } from './PhaseCalculationService';
import markerArrayUtils from './markerArrayUtils';
import IntelliKnitLogger from './ConsoleLogging';

/**
 * Marker Sequence Calculator
 * Handles multiple simultaneous sequences for marker-based shaping
 * Built on top of PhaseCalculationService for individual sequence calculations
 */
export class MarkerSequenceCalculator {

    /**
     * Calculate complete marker phases result with multiple sequences
     * @param {Array} sequences - Array of sequence objects
     * @param {Array} initialArray - Starting marker array
     * @param {string} construction - 'flat' or 'round'
     * @returns {Object} - Complete calculation result
     */
    static calculateMarkerPhases(sequences, initialArray, construction) {
        if (!sequences || sequences.length === 0) {
            return {
                error: 'Please add at least one sequence',
                instruction: '',
                startingStitches: markerArrayUtils.sumArrayStitches(initialArray),
                endingStitches: markerArrayUtils.sumArrayStitches(initialArray),
                totalRows: 0,
                finalArray: initialArray,
                arrayEvolution: [],
                sequences: []
            };
        }

        const startingStitches = markerArrayUtils.sumArrayStitches(initialArray);

        // Calculate when each sequence starts and their individual timelines
        const sequenceTimelines = this.calculateSequenceTimelines(sequences, construction, startingStitches);

        // Merge all sequences into unified timeline
        const unifiedTimeline = this.mergeSequenceTimelines(sequenceTimelines, initialArray);

        // Generate instructions and final results
        const result = this.generateFinalResult(unifiedTimeline, sequences, initialArray, construction);

        IntelliKnitLogger.success(`Marker phases calculated: ${sequences.length} sequences, ${result.totalRows} rows total`);

        return result;
    }

    /**
     * Calculate individual timeline for each sequence
     * @param {Array} sequences - Array of sequence objects
     * @param {string} construction - Construction type
     * @param {number} startingStitches - Starting stitch count
     * @returns {Array} - Array of sequence timeline objects
     */
    static calculateSequenceTimelines(sequences, construction, startingStitches) {
        const timelines = [];

        for (const sequence of sequences) {
            // Calculate when this sequence starts
            const startRow = this.calculateSequenceStartRow(sequence, timelines);

            // Use PhaseCalculationService to calculate this sequence
            const sequenceCalculation = PhaseCalculationService.calculateSequentialPhases(
                sequence.phases,
                startingStitches,
                construction
            );

            if (sequenceCalculation.error) {
                throw new Error(`Sequence "${sequence.name}": ${sequenceCalculation.error}`);
            }

            // Create timeline for this sequence
            const timeline = {
                sequenceId: sequence.id,
                sequenceName: sequence.name,
                startRow: startRow,
                endRow: startRow + sequenceCalculation.totalRows - 1,
                calculation: sequenceCalculation,
                actions: sequence.instructionData?.actions || [],
                activeRows: this.calculateActiveRows(startRow, sequenceCalculation)
            };

            timelines.push(timeline);
        }

        return timelines;
    }

    /**
     * Calculate which row a sequence should start on
     * @param {Object} sequence - Sequence object with start condition
     * @param {Array} existingTimelines - Already calculated timelines
     * @returns {number} - Row number to start (1-based)
     */
    static calculateSequenceStartRow(sequence, existingTimelines) {
        const startCondition = sequence.startCondition || { type: 'immediate' };

        switch (startCondition.type) {
            case 'immediate':
                return 1;

            case 'after_rounds':
                return startCondition.value + 1;

            case 'after_sequence':
                const targetSequence = existingTimelines.find(t => t.sequenceId === startCondition.sequenceId);
                if (!targetSequence) {
                    throw new Error(`Cannot start after sequence "${startCondition.sequenceId}" - sequence not found`);
                }
                return targetSequence.endRow + 1;

            default:
                IntelliKnitLogger.warn('Unknown start condition type, defaulting to immediate', startCondition);
                return 1;
        }
    }

    /**
     * Calculate which rows are active for shaping in a sequence
     * @param {number} startRow - Starting row number
     * @param {Object} calculation - PhaseCalculationService result
     * @returns {Array} - Array of row numbers that have shaping actions
     */
    static calculateActiveRows(startRow, calculation) {
        const activeRows = [];
        let currentRow = startRow;

        for (const phase of calculation.phases) {
            if (phase.type === 'decrease' || phase.type === 'increase') {
                // Add shaping rows based on frequency and times
                for (let i = 0; i < phase.times; i++) {
                    const shapingRow = currentRow + (i * phase.frequency) + (phase.frequency - 1);
                    activeRows.push(shapingRow);
                }
            } else if (phase.type === 'bind_off') {
                // Add bind-off rows
                for (let i = 0; i < phase.frequency; i++) {
                    activeRows.push(currentRow + i);
                }
            }
            // Setup rows don't have actions, so skip them

            currentRow += phase.rows;
        }

        return activeRows;
    }

    /**
     * Merge multiple sequence timelines into unified row-by-row timeline
     * @param {Array} sequenceTimelines - Individual sequence timelines
     * @param {Array} initialArray - Starting marker array
     * @returns {Array} - Unified timeline with array evolution
     */
    static mergeSequenceTimelines(sequenceTimelines, initialArray) {
        // Find the maximum row number across all sequences
        const maxRow = Math.max(...sequenceTimelines.map(t => t.endRow));

        const unifiedTimeline = [];
        let currentArray = [...initialArray];

        for (let row = 1; row <= maxRow; row++) {
            // Find which sequences are active on this row
            const activeSequences = sequenceTimelines.filter(t =>
                row >= t.startRow && row <= t.endRow && t.activeRows.includes(row)
            );

            const rowActions = [];

            // Apply actions from all active sequences
            for (const sequence of activeSequences) {
                const sequenceActions = this.getSequenceActionsForRow(sequence, row);
                rowActions.push(...sequenceActions);

                // Apply actions to current array (simplified for now)
                currentArray = this.applyActionsToArray(currentArray, sequenceActions);
            }

            // Store row state
            unifiedTimeline.push({
                row: row,
                array: [...currentArray],
                activeSequences: activeSequences.map(s => s.sequenceId),
                actions: rowActions,
                totalStitches: markerArrayUtils.sumArrayStitches(currentArray)
            });
        }

        return unifiedTimeline;
    }

    /**
    * Get specific actions for a sequence on a specific row
    * @param {Object} sequenceTimeline - Timeline for one sequence
    * @param {number} row - Row number
    * @returns {Array} - Array of action objects for this row
    */
    static getSequenceActionsForRow(sequenceTimeline, row) {
        if (sequenceTimeline.activeRows.includes(row)) {
            return [{
                sequenceId: sequenceTimeline.sequenceId,
                sequenceName: sequenceTimeline.sequenceName,
                row: row,
                description: `Apply ${sequenceTimeline.sequenceName} actions`,
                sequenceTimeline: sequenceTimeline
            }];
        }

        return [];
    }

    /**
     * Apply actions to marker array
     * @param {Array} currentArray - Current marker array
     * @param {Array} actions - Actions to apply from sequences
     * @returns {Array} - Updated marker array
     */
    static applyActionsToArray(currentArray, actions) {
        if (!actions || actions.length === 0) {
            return currentArray;
        }

        let updatedArray = [...currentArray];

        for (const action of actions) {
            // Each action should have the sequence timeline with instructionData
            if (action.sequenceTimeline?.actions) {
                // Convert instruction actions to marker actions format
                const markerActions = markerArrayUtils.convertInstructionToMarkerActions(
                    action.sequenceTimeline.actions,
                    updatedArray
                );

                // Apply the marker actions
                updatedArray = markerArrayUtils.applyMarkerActions(updatedArray, markerActions);
            }
        }

        return updatedArray;
    }

    /**
     * Generate final calculation result
     * @param {Array} unifiedTimeline - Complete timeline
     * @param {Array} sequences - Original sequence definitions
     * @param {Array} initialArray - Starting array
     * @param {string} construction - Construction type
     * @returns {Object} - Final calculation result
     */
    static generateFinalResult(unifiedTimeline, sequences, initialArray, construction) {
        const finalRowData = unifiedTimeline[unifiedTimeline.length - 1] || { array: initialArray, totalStitches: markerArrayUtils.sumArrayStitches(initialArray) };
        const startingStitches = markerArrayUtils.sumArrayStitches(initialArray);

        // Generate overall instruction
        const sequenceInstructions = sequences.map(seq => {
            const timeline = unifiedTimeline.find(t => t.activeSequences.includes(seq.id));
            return seq.name || 'Unnamed sequence';
        });

        const instruction = sequenceInstructions.length > 1
            ? `${sequenceInstructions.join(', ')} at the same time`
            : sequenceInstructions[0] || 'Marker-based shaping';

        return {
            instruction: instruction,
            startingStitches: startingStitches,
            endingStitches: (() => {
                if (sequences.length > 0 && sequences[0].instructionData?.actions && sequences[0].instructionData?.phases) {
                    const instructionData = sequences[0].instructionData;

                    // Use the shared calculation function
                    const result = markerArrayUtils.calculateMarkerPhaseProgression(
                        instructionData.actions,
                        instructionData.phases,
                        startingStitches,
                        0 // No finishing rows in this context
                    );

                    return result.endingStitches;
                }
                return finalRowData.totalStitches;
            })(),
            totalRows: (() => {
                if (sequences.length > 0 && sequences[0].instructionData?.phases) {
                    const instructionData = sequences[0].instructionData;

                    const result = markerArrayUtils.calculateMarkerPhaseProgression(
                        instructionData.actions || [],
                        instructionData.phases,
                        startingStitches,
                        0
                    );

                    return result.totalRows;
                }
                return unifiedTimeline.length;
            })(),
            netStitchChange: finalRowData.totalStitches - startingStitches,
            finalArray: finalRowData.array,
            arrayEvolution: unifiedTimeline,
            sequences: sequences.map(seq => ({
                id: seq.id,
                name: seq.name,
                description: `${seq.phases?.length || 0} phases`
            }))
        };
    }

    /**
     * Validate sequences for conflicts and impossible scenarios
     * @param {Array} sequences - Array of sequence objects
     * @param {Array} initialArray - Starting marker array
     * @returns {Object} - Validation result with errors array
     */
    static validateSequences(sequences, initialArray) {
        const errors = [];

        // Check for empty sequences
        if (!sequences || sequences.length === 0) {
            errors.push('At least one sequence is required');
            return { isValid: false, errors };
        }

        // Validate individual sequences
        for (const sequence of sequences) {
            if (!sequence.phases || sequence.phases.length === 0) {
                errors.push(`Sequence "${sequence.name || 'Unnamed'}" has no phases`);
            }

            // TODO: Add more sequence-specific validation
        }

        // Check for marker conflicts (basic check)
        const allMarkers = markerArrayUtils.getArrayMarkers(initialArray);
        for (const sequence of sequences) {
            const sequenceMarkers = sequence.actions?.map(a => a.markers).flat() || [];
            const invalidMarkers = sequenceMarkers.filter(marker => !allMarkers.includes(marker));

            if (invalidMarkers.length > 0) {
                errors.push(`Sequence "${sequence.name || 'Unnamed'}" references non-existent markers: ${invalidMarkers.join(', ')}`);
            }
        }

        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }
}