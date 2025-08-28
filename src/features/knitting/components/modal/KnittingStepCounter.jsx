// src/features/knitting/components/modal/KnittingStepCounter.jsx
import React, { useState } from 'react';
import { Plus, Minus, Target, Undo, Check } from 'lucide-react';
import { useRowCounter } from '../../hooks/useRowCounter';
import IncrementInput from '../../../../shared/components/IncrementInput';
import { getRowInstruction, getStepType } from '../../../../shared/utils/KnittingInstructionService';

const KnittingStepCounter = ({
    step,
    component,
    project,
    theme,
    progress,
    navigation
}) => {
    const rowCounter = useRowCounter(project?.id, component?.id, navigation.currentStep, step);
    const { currentRow, stitchCount, incrementRow, decrementRow, updateStitchCount, resetCounter } = rowCounter;

    // UI state
    const [showStitchAdjust, setShowStitchAdjust] = useState(false);

    const calculateCurrentStitchCount = (row) => {
        // For cast-on steps, target should be endingStitches (what you'll have after casting on)
        const patternName = step.wizardConfig?.stitchPattern?.pattern;
        if (patternName === 'Cast On') {
            return step.endingStitches || 0;
        }

        // For bind-off steps, target should be endingStitches (what remains after binding off)
        if (patternName === 'Bind Off') {
            return step.endingStitches || 0;
        }

        const hasShaping = step.wizardConfig?.hasShaping || step.advancedWizardConfig?.hasShaping;

        // REPLACE the sequential phases calculation with:
        if (hasShaping && step.wizardConfig?.shapingConfig?.type === 'phases') {
            const calculation = step.wizardConfig.shapingConfig.config?.calculation;
            if (calculation?.phases) {
                let runningStitches = step.startingStitches || 0;
                let currentRowPosition = 1;

                for (const phase of calculation.phases) {
                    const phaseRows = phase.rows || 1;
                    const endRow = currentRowPosition + phaseRows - 1;

                    if (row >= currentRowPosition && row <= endRow) {
                        // We're in this phase - calculate stitches at this specific row
                        const rowInPhase = row - currentRowPosition + 1;

                        if (phase.type === 'setup') {
                            return runningStitches; // Setup rows don't change stitch count
                        }

                        if (phase.type === 'bind_off') {
                            const bindOffAmount = phase.amount || 1;
                            return runningStitches - (bindOffAmount * rowInPhase);
                        }

                        // For increase/decrease phases, only shape on specific rows based on frequency
                        const frequency = phase.frequency || 1;
                        const shapingRowsCompleted = Math.floor((rowInPhase - 1) / frequency);
                        const stitchChangePerRow = calculateStitchChangePerRow(phase);

                        return runningStitches + (stitchChangePerRow * shapingRowsCompleted);
                    }

                    runningStitches += phase.stitchChange || 0;
                    currentRowPosition += phaseRows;
                }
            }
        }

        // For even distribution shaping, use the calculated ending stitches
        if (hasShaping && step.wizardConfig?.shapingConfig?.type === 'even_distribution') {
            const calculation = step.wizardConfig.shapingConfig.config?.calculation;
            if (calculation?.endingStitches) {
                return calculation.endingStitches;
            }
        }

        // For non-shaping steps, stitch count stays constant
        return step.startingStitches || 0;
    };

    // Auto-sync stitch count with calculated count when row changes
    const calculatedStitchCount = calculateCurrentStitchCount(currentRow);
    React.useEffect(() => {
        if (stitchCount !== calculatedStitchCount && calculatedStitchCount > 0) {
            updateStitchCount(calculatedStitchCount);
        }
    }, [currentRow, calculatedStitchCount, stitchCount, updateStitchCount]);

    // Step analysis
    const totalRows = calculateActualTotalRows(step);  // updated
    const targetStitches = calculateCurrentStitchCount(currentRow);
    // const targetStitches = step.endingStitches || step.startingStitches || 0;
    const isCompleted = progress.isStepCompleted(navigation.currentStep);
    const duration = step.wizardConfig?.duration;

    // Determine step type - use the imported function
    const stepType = getStepType(step, totalRows, duration);
    const isOnFinalRow = currentRow >= totalRows && totalRows > 1;

    // Get current instruction
    const getCurrentInstruction = () => {
        try {
            return getRowInstruction(step, currentRow, stitchCount, project);
        } catch (error) {
            console.error('Error getting row instruction:', error);
            return {
                instruction: 'Unable to load instruction',
                isSupported: false
            };
        }
    };

    const instructionResult = getCurrentInstruction();

    const handleStepComplete = () => {
        progress.toggleStepCompletion(navigation.currentStep);
    };

    // FIXED: Proper increment logic based on step type
    const handleRowIncrement = () => {
        if (stepType === 'single_action') {
            // Single-action steps complete immediately
            handleStepComplete();
            return;
        }

        if (stepType === 'fixed_multi_row') {
            if (currentRow >= totalRows) {
                // At final row - complete the step
                handleStepComplete();
                return;
            } else {
                // Normal increment within step bounds
                incrementRow();
            }
        } else {
            // Length-based and completion_when_ready can always increment
            incrementRow();
        }
    };

    const handleRowDecrement = () => {
        if (currentRow > 1) {
            decrementRow();
        }
    };

    // FIXED: Dynamic increment availability
    const canIncrement = stepType === 'length_based' ||
        stepType === 'completion_when_ready' ||
        (stepType === 'fixed_multi_row' && currentRow < totalRows);
    // Note: single_action removed because it should complete immediately, not show increment

    function calculateActualTotalRows(step) {
        const duration = step.wizardConfig?.duration;

        if (duration?.type === 'repeats') {
            const repeats = parseInt(duration.value) || 0;
            const stitchPattern = step.wizardConfig?.stitchPattern || step.advancedWizardConfig?.stitchPattern;
            const rowsInPattern = parseInt(stitchPattern?.rowsInPattern) || 0;

            if (repeats > 0 && rowsInPattern > 0) {
                return repeats * rowsInPattern; // 2 × 12 = 24
            }
        }

        return step.totalRows || 1;
    }


    function calculateStitchChangePerRow(phase) {
        if (phase.type === 'setup') return 0;
        if (phase.type === 'bind_off') return -(phase.amount || 1);

        const amount = phase.amount || 1;
        const multiplier = phase.position === 'both_ends' ? 2 : 1;
        const change = amount * multiplier;

        return phase.type === 'decrease' ? -change : change;
    }

    return (
        <div className={`flex-1 flex flex-col items-center justify-center ${theme.cardBg} relative overflow-hidden`}>
            {/* Background texture */}
            <div className="absolute inset-0 opacity-5 pointer-events-none">
                <div className="w-full h-full" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23000' stroke-width='2' stroke-opacity='0.08'%3E%3Ccircle cx='40' cy='40' r='30'/%3E%3Ccircle cx='40' cy='40' r='20'/%3E%3Ccircle cx='40' cy='40' r='10'/%3E%3C/g%3E%3C/svg%3E")`,
                    backgroundSize: '80px 80px'
                }} />
            </div>

            <div className="text-center px-6 relative z-10 w-full max-w-sm">

                {/* MAIN INSTRUCTION CARD - Always prominent */}
                <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50 mb-6">
                    {stepType !== 'single_action' && (
                        <div className={`text-sm font-medium ${theme.textSecondary} mb-3`}>
                            Row {currentRow}{stepType === 'fixed_multi_row' ? ` of ${totalRows}` : ''}
                        </div>
                    )}

                    <div className={`text-lg font-semibold ${theme.textPrimary} leading-relaxed mb-4`}>
                        {instructionResult.instruction || 'Loading instruction...'}
                    </div>

                    {/* Target stitches - always visible but subtle */}
                    <div className={`text-sm ${theme.textSecondary} mb-4`}>
                        Target: {targetStitches} stitches
                    </div>

                    {/* PRIMARY ACTION AREA */}
                    {stepType === 'single_action' ? (
                        // Single action: just completion
                        <button
                            onClick={handleStepComplete}
                            className={`w-full flex items-center justify-center gap-3 py-4 rounded-xl font-semibold text-lg transition-colors ${isCompleted
                                ? 'bg-sage-100 text-sage-700 hover:bg-sage-200'
                                : 'bg-sage-500 hover:bg-sage-600 text-white'
                                }`}
                        >
                            <Check size={20} />
                            {isCompleted ? 'Completed' : 'Mark Complete'}
                        </button>
                    ) : (
                        // Multi-row: row counter + completion
                        <div className="space-y-4">
                            {/* Row Counter - centered and prominent */}
                            <div className="flex items-center justify-center gap-4">
                                <button
                                    onClick={handleRowDecrement}
                                    disabled={currentRow <= 1}
                                    className="p-3 rounded-full bg-red-100 hover:bg-red-200 disabled:bg-gray-100 disabled:text-gray-400 text-red-600 hover:text-red-700 transition-colors disabled:cursor-not-allowed"
                                >
                                    <Minus size={18} />
                                </button>

                                <div className={`text-3xl font-bold ${theme.textPrimary} min-w-[80px]`}>
                                    {currentRow}
                                </div>

                                <button
                                    onClick={handleRowIncrement}
                                    disabled={!canIncrement}
                                    className="p-3 rounded-full bg-sage-100 hover:bg-sage-200 disabled:bg-gray-100 disabled:text-gray-400 text-sage-600 hover:text-sage-700 transition-colors disabled:cursor-not-allowed"
                                >
                                    <Plus size={18} />
                                </button>
                            </div>

                            {/* Progress bar for fixed multi-row steps */}
                            {stepType === 'fixed_multi_row' && (
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className="h-2 rounded-full bg-sage-500 transition-all duration-300"
                                        style={{ width: `${Math.min((currentRow / totalRows) * 100, 100)}%` }}
                                    />
                                </div>
                            )}

                            {/* Completion button - show when appropriate */}
                            {(isOnFinalRow || stepType === 'length_based' || stepType === 'completion_when_ready') && (
                                <button
                                    onClick={handleStepComplete}
                                    className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-colors ${isCompleted
                                        ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        : 'bg-sage-500 hover:bg-sage-600 text-white'
                                        }`}
                                >
                                    <Target size={16} />
                                    {isCompleted ? 'Mark Incomplete' : 'Mark Complete'}
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* SECONDARY ACTIONS - Minimal */}
                {progress.canUndo && (
                    <button
                        onClick={progress.undoLastAction}
                        className="w-full mb-4 flex items-center justify-center gap-2 py-2 bg-orange-100 hover:bg-orange-200 text-orange-700 rounded-lg transition-colors text-sm"
                    >
                        <Undo size={14} />
                        Undo: {progress.lastAction?.description}
                    </button>
                )}
            </div>
        </div>
    );
};

export default KnittingStepCounter;