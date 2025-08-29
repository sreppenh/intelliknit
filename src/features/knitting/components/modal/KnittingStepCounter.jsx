// src/features/knitting/components/modal/KnittingStepCounter.jsx
import React, { useState, useEffect } from 'react';
import { Plus, Minus, Target, Undo, Check, RotateCw, Ruler } from 'lucide-react';
import { useRowCounter } from '../../hooks/useRowCounter';
import IncrementInput from '../../../../shared/components/IncrementInput';
import { getRowInstruction, getStepType } from '../../../../shared/utils/KnittingInstructionService';
import {
    getCurrentSide,
    getStepStartingSide,
    getRowWithSideDisplay,
    shouldUseSideIntelligence,
    getSideDisplayStyles,
    initializeSideTracking,
    getStepPatternInfo
} from '../../../../shared/utils/sideIntelligence';
import { useSideTracking } from '../../hooks/useSideTracking';
import SimpleRowSettings from '../SimpleRowSettings';

// ✨ NEW: Import gauge utilities
import {
    isLengthBasedStep,
    getLengthProgressDisplay,
    formatLengthCounterDisplay,
    shouldSuggestCompletion,
    getCompletionSuggestionText,
    hasValidGaugeForLength
} from '../../../../shared/utils/gaugeUtils';

const KnittingStepCounter = ({
    step,
    component,
    project,
    theme,
    progress,
    navigation,
    updateProject // Add this prop for data persistence
}) => {
    const rowCounter = useRowCounter(project?.id, component?.id, navigation.currentStep, step);
    const { currentRow, stitchCount, incrementRow, decrementRow, updateStitchCount, resetCounter } = rowCounter;

    // Side tracking hook
    const sideTracking = useSideTracking(project?.id, component?.id, navigation.currentStep, step, component);

    // UI state
    const [showStitchAdjust, setShowStitchAdjust] = useState(false);

    // ✨ NEW: Length-based step detection and progress
    const isLengthStep = isLengthBasedStep(step);
    const lengthProgressData = isLengthStep ? getLengthProgressDisplay(step, currentRow, project) : null;
    const lengthDisplayData = isLengthStep ? formatLengthCounterDisplay(lengthProgressData, construction) : null;

    // Side intelligence calculations
    const construction = step.construction || component.construction || 'flat';
    const useSideIntelligence = shouldUseSideIntelligence(step);

    // Get starting side for this step (from stored data, session override, or calculate)
    const stepStartingSide = useSideIntelligence
        ? (step.sideTracking?.startingSide ||
            sideTracking.sessionOverride ||
            getStepStartingSide(component, navigation.currentStep))
        : null;

    // Calculate current side with session override or stored data
    const currentSide = useSideIntelligence
        ? getCurrentSide(construction, currentRow, stepStartingSide)
        : null;

    // UI state for side editing
    const canEditSide = useSideIntelligence && currentRow === 1 && construction === 'flat';
    const isOverrideActive = Boolean(sideTracking.sessionOverride || step.sideTracking?.userOverride);

    const calculateCurrentStitchCount = (row) => {
        // [Previous calculateCurrentStitchCount logic remains exactly the same]
        const patternName = step.wizardConfig?.stitchPattern?.pattern;
        if (patternName === 'Cast On') {
            return step.endingStitches || 0;
        }

        if (patternName === 'Bind Off') {
            return step.endingStitches || 0;
        }

        const hasShaping = step.wizardConfig?.hasShaping || step.advancedWizardConfig?.hasShaping;

        if (hasShaping && step.wizardConfig?.shapingConfig?.type === 'phases') {
            const calculation = step.wizardConfig.shapingConfig.config?.calculation;
            if (calculation?.phases) {
                let stitchCountByRow = [step.startingStitches || 0];
                let currentRowGlobal = 1;

                for (const phase of calculation.phases) {
                    const phaseRows = phase.rows || 1;

                    for (let rowInPhase = 0; rowInPhase < phaseRows; rowInPhase++) {
                        let stitchesAfterThisRow = stitchCountByRow[currentRowGlobal - 1];

                        if (phase.type === 'decrease' || phase.type === 'increase') {
                            const frequency = phase.frequency || 1;
                            const isShapingRow = (rowInPhase % frequency) === 0;

                            if (isShapingRow) {
                                const amount = phase.amount || 1;
                                const multiplier = phase.position === 'both_ends' ? 2 : 1;
                                const stitchChange = phase.type === 'decrease' ?
                                    -(amount * multiplier) : (amount * multiplier);
                                stitchesAfterThisRow += stitchChange;
                            }
                        } else if (phase.type === 'bind_off') {
                            const bindOffAmount = phase.amount || 1;
                            stitchesAfterThisRow -= bindOffAmount;
                        }

                        stitchCountByRow[currentRowGlobal] = stitchesAfterThisRow;
                        currentRowGlobal++;
                    }
                }

                return stitchCountByRow[row] || step.startingStitches || 0;
            }
        }

        if (hasShaping && step.wizardConfig?.shapingConfig?.type === 'even_distribution') {
            const calculation = step.wizardConfig.shapingConfig.config?.calculation;
            if (calculation?.endingStitches) {
                return calculation.endingStitches;
            }
        }

        return step.startingStitches || 0;
    };

    // Auto-sync stitch count with calculated count when row changes
    const calculatedStitchCount = calculateCurrentStitchCount(currentRow);
    useEffect(() => {
        if (stitchCount !== calculatedStitchCount && calculatedStitchCount > 0) {
            updateStitchCount(calculatedStitchCount);
        }
    }, [currentRow, calculatedStitchCount, stitchCount, updateStitchCount]);

    // Step analysis
    const totalRows = calculateActualTotalRows(step);
    const targetStitches = calculateCurrentStitchCount(currentRow);
    const isCompleted = progress.isStepCompleted(navigation.currentStep);
    const duration = step.wizardConfig?.duration;

    // Determine step type
    const stepType = getStepType(step, totalRows, duration);
    const isOnFinalRow = currentRow >= totalRows && totalRows > 1;

    // ✨ NEW: Length-based completion logic
    const shouldShowCompletionSuggestion = isLengthStep && shouldSuggestCompletion(step, currentRow, project);
    const completionSuggestionText = shouldShowCompletionSuggestion ? getCompletionSuggestionText(step, currentRow, project) : null;

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
        // ✨ NEW: Future - Record actual rows for gauge learning
        if (isLengthStep && lengthProgressData?.showEstimate) {
            // TODO: Call updateGaugeFromCompletion when we implement learning
            console.log(`Length step completed at row ${currentRow}, estimated was ${lengthProgressData.estimatedRows}`);
        }

        // Record actual ending side when step is completed
        if (useSideIntelligence && currentSide && updateProject) {
            sideTracking.recordEndingSide(currentSide, currentRow, updateProject);
        }

        // Commit any session changes to permanent storage
        if (sideTracking.hasSessionChanges && updateProject) {
            sideTracking.commitSideChanges(updateProject);
        }

        progress.toggleStepCompletion(navigation.currentStep);
    };

    const handleRowIncrement = () => {
        if (stepType === 'single_action') {
            handleStepComplete();
            return;
        }

        if (stepType === 'fixed_multi_row') {
            if (currentRow >= totalRows) {
                handleStepComplete();
                return;
            } else {
                incrementRow();
            }
        } else {
            incrementRow();
        }
    };

    const handleRowDecrement = () => {
        if (currentRow > 1) {
            decrementRow();
        }
    };

    // Handle pattern offset changes
    const handleSideChange = (newSide) => {
        sideTracking.updateSideOverride(newSide);
        console.log(`🔄 Side changed to: ${newSide}`);
    };

    const handlePatternRowChange = (patternRow) => {
        sideTracking.updatePatternOffset(patternRow - 1); // Convert to 0-based offset
        console.log(`📊 Pattern starting on row: ${patternRow}`);
    };

    const canIncrement = stepType === 'length_based' ||
        stepType === 'completion_when_ready' ||
        (stepType === 'fixed_multi_row' && currentRow < totalRows);

    function calculateActualTotalRows(step) {
        const duration = step.wizardConfig?.duration;

        if (duration?.type === 'repeats') {
            const repeats = parseInt(duration.value) || 0;
            const stitchPattern = step.wizardConfig?.stitchPattern || step.advancedWizardConfig?.stitchPattern;
            const rowsInPattern = parseInt(stitchPattern?.rowsInPattern) || 0;

            if (repeats > 0 && rowsInPattern > 0) {
                return repeats * rowsInPattern;
            }
        }

        return step.totalRows || 1;
    }

    // ✨ ENHANCED: Get display text for row with length intelligence
    const getRowDisplayText = () => {
        // For length-based steps, use the gauge-aware display
        if (isLengthStep && lengthDisplayData) {
            let rowText = lengthDisplayData.rowText;

            // Add side info for flat construction with side intelligence
            if (useSideIntelligence && construction === 'flat' && currentSide) {
                rowText += ` (${currentSide})`;
            }

            return rowText;
        }

        // Original logic for non-length steps
        const rowTerm = construction === 'round' ? 'Round' : 'Row';

        if (stepType === 'single_action') {
            return '';
        }

        // Base row text
        let rowText = stepType === 'fixed_multi_row'
            ? `${rowTerm} ${currentRow} of ${totalRows}`
            : `${rowTerm} ${currentRow}`;

        // Add side info only for flat construction with side intelligence
        if (useSideIntelligence && construction === 'flat' && currentSide) {
            rowText += ` (${currentSide})`;
        }

        return rowText;
    };

    // ✨ NEW: Get progress info text
    const getProgressInfoText = () => {
        if (isLengthStep && lengthDisplayData) {
            return lengthDisplayData.progressText;
        }

        // Original target stitches for non-length steps
        return `Target: ${targetStitches} stitches`;
    };

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

                {/* ✨ NEW: Completion suggestion card for length steps */}
                {shouldShowCompletionSuggestion && (
                    <div className="bg-yarn-100 border-2 border-yarn-300 rounded-2xl p-4 mb-4 shadow-lg">
                        <div className="flex items-center gap-2 mb-2">
                            <Ruler size={18} className="text-yarn-600" />
                            <span className="text-sm font-medium text-yarn-700">Gauge Estimate</span>
                        </div>
                        <div className="text-sm text-yarn-600 mb-3">
                            {completionSuggestionText}
                        </div>
                        <button
                            onClick={handleStepComplete}
                            className="w-full py-2 bg-yarn-500 hover:bg-yarn-600 text-white rounded-lg font-medium transition-colors text-sm"
                        >
                            Measure & Complete
                        </button>
                    </div>
                )}

                {/* MAIN INSTRUCTION CARD - Always prominent */}
                <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50 mb-6">

                    {/* Row Display with Side Intelligence */}
                    {stepType !== 'single_action' && (
                        <div className={`text-sm font-medium ${theme.textSecondary} mb-3`}>
                            {getRowDisplayText()}
                        </div>
                    )}

                    <div className={`text-lg font-semibold ${theme.textPrimary} leading-relaxed mb-4`}>
                        {instructionResult.instruction || 'Loading instruction...'}
                    </div>

                    {/* ✨ ENHANCED: Progress info - length or stitches */}
                    <div className={`text-sm ${theme.textSecondary} mb-4`}>
                        {getProgressInfoText()}
                    </div>

                    {/* ✨ NEW: Gauge availability notice for length steps without gauge */}
                    {isLengthStep && lengthProgressData && !lengthProgressData.hasGauge && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                            <div className="text-xs text-blue-700">
                                💡 Add row gauge to your project for intelligent length tracking!
                            </div>
                        </div>
                    )}

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

                            {/* ✨ ENHANCED: Progress bar - length-aware or traditional */}
                            {(stepType === 'fixed_multi_row' || (isLengthStep && lengthDisplayData?.showProgressBar)) && (
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className={`h-2 rounded-full transition-all duration-300 ${lengthDisplayData?.isNearTarget ? 'bg-yarn-500' : 'bg-sage-500'
                                            }`}
                                        style={{
                                            width: `${Math.min(
                                                lengthDisplayData?.progressPercent ||
                                                (currentRow / totalRows) * 100,
                                                100
                                            )}%`
                                        }}
                                    />
                                </div>
                            )}

                            {/* Completion button - show when appropriate */}
                            {(isOnFinalRow || stepType === 'length_based' || stepType === 'completion_when_ready') && !shouldShowCompletionSuggestion && (
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

                {/* Row 1 Settings - Clean & Simple */}
                {currentRow === 1 && useSideIntelligence && (
                    <SimpleRowSettings
                        step={step}
                        construction={construction}
                        currentSide={currentSide}
                        onSideChange={handleSideChange}
                        onPatternRowChange={handlePatternRowChange}
                    />
                )}

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