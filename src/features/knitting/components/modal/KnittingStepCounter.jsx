// src/features/knitting/components/modal/KnittingStepCounter.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Minus, Target, Check } from 'lucide-react';
import { useRowCounter } from '../../hooks/useRowCounter';
import { getRowInstruction, getStepType } from '../../../../shared/utils/KnittingInstructionService';
import {
    getCurrentSide,
    getStepStartingSide,
    shouldUseSideIntelligence,
} from '../../../../shared/utils/sideIntelligence';
import { useSideTracking } from '../../hooks/useSideTracking';
import SimpleRowSettings from '../SimpleRowSettings';

// Gauge utilities
import {
    isLengthBasedStep,
    getLengthTarget,
    getLengthProgressDisplay,
    formatLengthCounterDisplay,
    shouldSuggestCompletion,
    getCompletionSuggestionText,
    shouldPromptGaugeUpdate,
    getGaugeUpdatePromptData,
    updateProjectGaugeFromMeasurement,
} from '../../../../shared/utils/gaugeUtils';

const KnittingStepCounter = ({
    step,
    component,
    project,
    theme,
    progress,
    stepIndex,
    navigation,
    updateProject, // this doesn't seem to be set anywhere
    onToggleCompletion
}) => {
    const rowCounter = useRowCounter(project?.id, component?.id, navigation.currentStep, step);
    const { currentRow, stitchCount, incrementRow, decrementRow, updateStitchCount } = rowCounter;

    const isNotepadMode = project?.isNotepadMode || false;

    // Side tracking hook
    const sideTracking = useSideTracking(project?.id, component?.id, navigation.currentStep, step, component);

    // Gauge update state
    const [showGaugePrompt, setShowGaugePrompt] = useState(false);
    const [gaugePromptData, setGaugePromptData] = useState(null);

    const construction = step.construction || component.construction || 'flat';

    // Length-based step detection and progress
    const isLengthStep = isLengthBasedStep(step);
    const lengthTarget = isLengthStep ? getLengthTarget(step) : null;

    // Until-length starting measurement state (moved up before lengthProgressData)
    const startingLengthKey = `until-length-start-${project?.id}-${component?.id}-${stepIndex}`;
    const [startingLength, setStartingLength] = useState(() => {
        if (lengthTarget?.type === 'until_length') {
            const stored = localStorage.getItem(startingLengthKey);
            return stored ? parseFloat(stored) : null;
        }
        return null;
    });

    // Now calculate progress data (moved down after startingLength is defined)
    const lengthProgressData = useMemo(() => {
        return isLengthStep ? getLengthProgressDisplay(step, currentRow, project, startingLength) : null;
    }, [isLengthStep, step.wizardConfig?.duration, currentRow, project?.gauge, startingLength]);

    const lengthDisplayData = isLengthStep ? formatLengthCounterDisplay(lengthProgressData, construction) : null;
    // Store starting length when it changes
    useEffect(() => {
        if (lengthTarget?.type === 'until_length' && startingLength !== null) {
            localStorage.setItem(startingLengthKey, startingLength.toString());
        }
    }, [startingLength, startingLengthKey, lengthTarget?.type]);

    // Side intelligence calculations
    const useSideIntelligence = shouldUseSideIntelligence(step);


    // Get starting side for this step
    const stepStartingSide = useSideIntelligence
        ? (step.sideTracking?.startingSide ||
            sideTracking.sessionOverride ||
            getStepStartingSide(component, navigation.currentStep))
        : null;

    // Calculate current side
    const currentSide = useSideIntelligence
        ? getCurrentSide(construction, currentRow, stepStartingSide)
        : null;

    // Calculate current stitch count based on step configuration
    const calculateCurrentStitchCount = (row) => {
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
    const isCompleted = step.completed || false;
    const duration = step.wizardConfig?.duration;

    // Determine step type
    const stepType = getStepType(step, totalRows, duration);
    const isOnFinalRow = currentRow >= totalRows && totalRows > 1;

    // Length-based completion logic
    const shouldShowCompletionSuggestion = isLengthStep && shouldSuggestCompletion(step, currentRow, project);

    // Get current instruction
    const getCurrentInstruction = () => {
        try {
            // Force row-by-row mode for notepad
            if (isNotepadMode || step?.forceRowByRowMode) {
                // Get the actual row instruction from the step's pattern data
                const stitchPattern = step.wizardConfig?.stitchPattern || step.advancedWizardConfig?.stitchPattern;

                if (stitchPattern?.entryMode === 'row_by_row' && stitchPattern?.rowInstructions) {
                    const rowInstructions = stitchPattern.rowInstructions;
                    const rowIndex = (currentRow - 1) % rowInstructions.length;
                    const rowData = rowInstructions[rowIndex];

                    if (rowData && rowData.instruction) {
                        return {
                            instruction: rowData.instruction,
                            isSupported: true,
                            isRowByRow: true
                        };
                    }
                }

                // Fallback to pattern name if no row instructions
                const patternName = stitchPattern?.pattern || 'Continue Pattern';
                return {
                    instruction: `${patternName} - Row ${currentRow}`,
                    isSupported: true,
                    isRowByRow: false
                };
            }

            // Use original logic for project mode
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

    // Gauge update handling
    const checkForGaugeUpdate = () => {
        if (!isLengthStep) return;

        const shouldPrompt = shouldPromptGaugeUpdate(step, currentRow, project, startingLength);
        if (shouldPrompt) {
            if (isNotepadMode) {
                // Auto-save gauge for notepad mode without prompting
                const promptData = getGaugeUpdatePromptData(currentRow, step, project, startingLength);
                const updatedProject = updateProjectGaugeFromMeasurement(project, promptData);

                // Update project if updateProject function is available
                if (updateProject) {
                    updateProject(updatedProject);
                }
            } else {
                // Show prompt for project mode
                const promptData = getGaugeUpdatePromptData(currentRow, step, project, startingLength);
                setGaugePromptData(promptData);
                setShowGaugePrompt(true);
            }
        }
    };

    const handleGaugeAccept = () => {
        if (gaugePromptData) {
            const updatedProject = updateProjectGaugeFromMeasurement(project, gaugePromptData);

            // Update project directly using the updateProject prop from the modal
            if (updateProject) {
                updateProject(updatedProject);
            }

            setGaugePromptData({
                ...gaugePromptData,
                success: true
            });
        }
    };

    const handleGaugeDecline = () => {
        setShowGaugePrompt(false);
        setGaugePromptData(null);
    };

    const handleStepComplete = () => {
        // Check for gauge update only when completing (not uncompleting)
        if (isLengthStep && !isCompleted) {
            checkForGaugeUpdate();
        }

        // Record actual ending side when step is completed
        if (useSideIntelligence && currentSide) {
            // We'll handle this differently - store the data but don't call updateProject yet
            sideTracking.recordEndingSide(currentSide, currentRow, () => { });
        }

        // Commit any session changes to permanent storage  
        if (sideTracking.hasSessionChanges) {
            sideTracking.commitSideChanges(() => { });
        }

        // Toggle completion
        onToggleCompletion?.(stepIndex);
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
    };

    const handlePatternRowChange = (patternRow) => {
        sideTracking.updatePatternOffset(patternRow - 1);
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

    // Get display text for row with length intelligence
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

    // Get progress info text
    const getProgressInfoText = () => {
        if (isLengthStep && lengthDisplayData) {
            return lengthDisplayData.progressText;
        }

        return `Target: ${targetStitches} stitches`;
    };

    return (
        <div className={`flex-1 flex flex-col items-center justify-center ${theme.cardBg} relative overflow-hidden`}>
            <div className="knitting-texture-circles" />

            <div className="text-center px-6 relative z-10 w-full max-w-sm">
                <div className="knitting-content-sage backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50 mb-6">

                    {/* Row Display with Side Intelligence */}
                    {stepType !== 'single_action' && (
                        <div className={`text-sm font-medium ${theme.textSecondary} mb-3`}>
                            {getRowDisplayText()}
                        </div>
                    )}

                    <div className={`text-lg font-semibold ${theme.textPrimary} leading-relaxed mb-4`}>
                        {instructionResult.instruction || 'Loading instruction...'}
                    </div>

                    {/* Gauge Update Prompt */}
                    {showGaugePrompt && gaugePromptData && (
                        <div className={`border-l-4 rounded-r-lg p-3 mb-4 ${gaugePromptData.success ? 'bg-yarn-50 border-yarn-400' : 'bg-sage-50 border-sage-400'}`}>
                            {gaugePromptData.success ? (
                                <div className="text-sm text-yarn-700">
                                    <span className="font-medium">Gauge successfully updated!</span>
                                </div>
                            ) : (
                                <>
                                    <div className="text-sm text-sage-700 mb-2">
                                        <span className="font-medium">Update your gauge?</span>
                                        <br />
                                        {/* FIXED: Show actual distance knitted */}
                                        Based on this step: {gaugePromptData.actualRows} rows = {gaugePromptData.actualDistance} {lengthTarget?.units}
                                        {gaugePromptData.hasExistingGauge && (
                                            <div className="text-xs mt-1">
                                                Current: {gaugePromptData.oldRowsForMeasurement} rows = {gaugePromptData.measurement} {gaugePromptData.units}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={handleGaugeDecline}
                                            className="btn-tertiary btn-sm"
                                        >
                                            Keep Current
                                        </button>
                                        <button

                                            onClick={handleGaugeAccept}
                                            className="btn-secondary btn-sm"
                                        >
                                            Update Gauge
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    {/* Progress alerts */}
                    {lengthProgressData?.shouldShowNearAlert && (
                        <div className="bg-sage-50 border-l-4 border-sage-400 rounded-r-lg p-3 mb-4">
                            <div className="text-sm text-sage-700">
                                Getting close to target length. Check your progress!
                            </div>
                        </div>
                    )}

                    {lengthProgressData?.shouldShowTargetAlert && (
                        <div className="bg-sage-50 border-l-4 border-sage-400 rounded-r-lg p-3 mb-4">
                            <div className="text-sm text-sage-700">
                                You've likely reached your target length. Measure to confirm!
                            </div>
                        </div>
                    )}

                    {/* Progress info */}
                    <div className={`text-sm ${theme.textSecondary} mb-4`}>
                        {getProgressInfoText()}
                    </div>

                    {/* Gauge availability notice */}
                    {isLengthStep && lengthProgressData && !lengthProgressData.hasGauge && (
                        <div className="bg-sage-50 border border-sage-200 rounded-lg p-3 mb-4">
                            <div className="text-xs text-sage-700">
                                💡 Add row gauge to your project for intelligent length tracking!
                            </div>
                        </div>
                    )}

                    {/* PRIMARY ACTION AREA */}
                    {stepType === 'single_action' ? (
                        // Single action: big checkbox-style completion toggle
                        <button
                            onClick={handleStepComplete}
                            className={`w-full flex items-center justify-center gap-3 py-4 rounded-xl font-semibold text-lg transition-all duration-200 border-2 ${isCompleted
                                ? 'bg-sage-100 border-sage-300 text-sage-700 hover:bg-sage-150'
                                : 'bg-white border-sage-300 text-sage-700 hover:bg-sage-50 hover:border-sage-400'
                                }`}
                        >
                            <div className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${isCompleted
                                ? 'bg-sage-500 border-sage-500'
                                : 'bg-white border-sage-300'
                                }`}>
                                {isCompleted && <Check size={16} className="text-white" />}
                            </div>
                            <span>Step Complete</span>
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

                            {/* Progress bar - length-aware or traditional */}
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

                            {/* Completion checkbox - show when appropriate */}
                            {(isOnFinalRow || stepType === 'length_based' || stepType === 'completion_when_ready') && (
                                <button
                                    onClick={handleStepComplete}
                                    className={`w-full flex items-center justify-center gap-3 py-3 rounded-xl font-medium transition-all duration-200 border-2 ${isCompleted
                                        ? 'bg-sage-100 border-sage-300 text-sage-700 hover:bg-sage-150'
                                        : 'bg-white border-sage-300 text-sage-700 hover:bg-sage-50 hover:border-sage-400'
                                        }`}
                                >
                                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${isCompleted
                                        ? 'bg-sage-500 border-sage-500'
                                        : 'bg-white border-sage-300'
                                        }`}>
                                        {isCompleted && <Check size={12} className="text-white" />}
                                    </div>
                                    <span>Step Complete</span>
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Row 1 Settings - Clean & Simple */}
                {!isNotepadMode && currentRow === 1 && (useSideIntelligence || lengthTarget?.type === 'until_length') && (

                    <SimpleRowSettings
                        step={step}
                        construction={construction}
                        currentSide={currentSide}
                        onSideChange={handleSideChange}
                        onPatternRowChange={handlePatternRowChange}
                        lengthTarget={lengthTarget}
                        startingLength={startingLength}
                        onStartingLengthChange={setStartingLength}
                        defaultExpanded={lengthTarget?.type === 'until_length'}
                    />
                )}
            </div>
        </div>
    );
};

export default KnittingStepCounter;