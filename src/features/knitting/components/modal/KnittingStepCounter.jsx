// src/features/knitting/components/modal/KnittingStepCounter.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Minus, Target, Check, RotateCcw } from 'lucide-react';
import { useRowCounter } from '../../hooks/useRowCounter';
import { getRowInstruction, getStepType } from '../../../../shared/utils/KnittingInstructionService';
import {
    getCurrentSide,
    getStepStartingSide,
    shouldUseSideIntelligence,
} from '../../../../shared/utils/sideIntelligence';
import { useSideTracking } from '../../hooks/useSideTracking';
import SimpleRowSettings from '../SimpleRowSettings';
import { formatReadableInstruction } from '../../../../shared/utils/stepDescriptionUtils';
import IntelliKnitLogger from '../../../../shared/utils/ConsoleLogging';


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
    onToggleCompletion,
    onClose, // Add this prop
    onComponentComplete,
    onShowGaugeCard,
    onShowCelebration
}) => {

    const isNotepadMode = project?.isNotepadMode || false;

    const rowCounter = useRowCounter(project?.id, component?.id, stepIndex, step, isNotepadMode);


    // const rowCounter = useRowCounter(project?.id, component?.id, navigation.currentStep, step);
    const { currentRow, stitchCount, incrementRow, decrementRow, updateStitchCount } = rowCounter;


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

    // Mark Complete function
    const handleMarkComplete = () => {

        if (isNotepadMode) {
            // Notepad: Complete step with full state updates
            const rowsKnitted = currentRow;
            const targetLength = parseFloat(step.wizardConfig?.duration?.value);
            const units = step.wizardConfig?.duration?.units || project?.defaultUnits || 'inches';

            // Calculate gauge and update step completion
            const calculatedGauge = {
                rowGauge: {
                    rows: rowsKnitted,
                    measurement: targetLength,
                    units: units
                }
            };

            // Complete step and update project
            const completedStep = { ...step, completed: true };
            const updatedProject = {
                ...project,
                gauge: calculatedGauge,
                components: project.components.map((comp, idx) =>
                    idx === 0 ? {
                        ...comp,
                        steps: comp.steps.map((s, sIdx) =>
                            sIdx === 0 ? completedStep : s
                        )
                    } : comp
                ),
                lastActivityAt: new Date().toISOString()
            };

            // Update project state
            if (updateProject) {
                updateProject(updatedProject);
            }

            // Show celebration instead of closing
            if (onShowCelebration) {
                const celebrationData = {
                    rowsCompleted: rowsKnitted,
                    targetLength: targetLength,
                    units: units,
                    calculatedGauge: calculatedGauge
                };

                console.log('Celebration data:', celebrationData);

                onShowCelebration(celebrationData);
                return;
            }

            // Fallback: close modal if no celebration handler
            if (onClose) {
                onClose();
            }
            return;
        }

        // Project mode - existing logic
        handleStepComplete();
        if (isLengthStep && shouldPromptGaugeUpdate(step, currentRow, project, startingLength)) {
            const promptData = getGaugeUpdatePromptData(currentRow, step, project, startingLength);
            if (onShowGaugeCard) {
                onShowGaugeCard(promptData);
            }
        }
    };



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
    // Replace the stepType calculation around line 123
    const stepType = (() => {
        // Override for notepad length-based instructions
        if (isNotepadMode && isLengthStep) {
            return 'length_based';
        }
        // Use original logic for everything else
        return getStepType(step, totalRows, duration);
    })();

    // Get current instruction
    // Replace the getCurrentInstruction function with this clean version:

    const getCurrentInstruction = () => {
        try {
            // Get the actual row instruction from the step's pattern data
            const stitchPattern = step.wizardConfig?.stitchPattern || step.advancedWizardConfig?.stitchPattern;

            // Check for row-by-row instructions FIRST (works for both project and notepad mode)
            if (stitchPattern?.entryMode === 'row_by_row' && stitchPattern?.rowInstructions) {
                const rowInstructions = stitchPattern.rowInstructions;
                const rowIndex = (currentRow - 1) % rowInstructions.length;
                const rowData = rowInstructions[rowIndex];

                // Handle string format (standard case)
                if (rowData && typeof rowData === 'string') {
                    return {
                        instruction: formatReadableInstruction(rowData),
                        isSupported: true,
                        isRowByRow: true
                    };
                }
                // Handle object format (fallback for legacy data)
                else if (rowData && rowData.instruction) {
                    return {
                        instruction: formatReadableInstruction(rowData.instruction),
                        isSupported: true,
                        isRowByRow: true
                    };
                }
            }

            // Use original logic for ALL modes - no special notepad handling
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

        // For notepad mode, trigger celebration instead of just completing
        if (isNotepadMode && !isCompleted && onShowCelebration) {
            // Complete the step first
            onToggleCompletion?.(stepIndex);

            // Then trigger celebration
            const celebrationData = {
                rowsCompleted: currentRow,
                targetLength: step.totalRows || currentRow,
                units: 'rows'
            };
            onShowCelebration(celebrationData);
            return;
        }

        // PROJECT MODE: Check for gauge update BEFORE any completion logic
        if (!isNotepadMode && isLengthStep && !isCompleted) {
            const shouldPrompt = shouldPromptGaugeUpdate(step, currentRow, project, startingLength);
            if (shouldPrompt && onShowGaugeCard) {
                // Show gauge card immediately without completing step yet
                const promptData = getGaugeUpdatePromptData(currentRow, step, project, startingLength);
                onShowGaugeCard(promptData);
                return; // Exit early - gauge card will handle completion
            }
        }

        // Record actual ending side when step is completed
        if (useSideIntelligence && currentSide) {
            sideTracking.recordEndingSide(currentSide, currentRow, () => { });
        }

        // Commit any session changes to permanent storage  
        if (sideTracking.hasSessionChanges) {
            sideTracking.commitSideChanges(() => { });
        }

        // Toggle completion (only for non-gauge cases)
        onToggleCompletion?.(stepIndex);
        console.log('🔧 handleStepComplete finished');
    };

    const handleLengthBasedComplete = () => {
        if (isCompleted) {
            // Currently completed - just toggle to incomplete and stay open
            onToggleCompletion?.(stepIndex);
            return; // Don't close modal, don't do gauge stuff
        }

        // Currently not completed - do your existing completion logic
        const rowsKnitted = currentRow;
        const targetLength = parseFloat(step.wizardConfig?.duration?.value);
        const units = step.wizardConfig?.duration?.units || project?.defaultUnits || 'inches';

        if (isNotepadMode && rowsKnitted > 0 && targetLength > 0) {
            // Calculate gauge from this instruction
            const calculatedGauge = {
                rowGauge: {
                    rows: rowsKnitted,
                    measurement: targetLength,
                    units: units
                }
            };

            const updatedProject = {
                ...project,
                gauge: calculatedGauge,
                components: project.components.map((comp, idx) =>
                    idx === 0 ? {
                        ...comp,
                        steps: comp.steps.map((s, sIdx) =>
                            sIdx === 0 ? { ...s, completed: true } : s
                        )
                    } : comp
                )
            };

            if (updateProject) {
                updateProject(updatedProject);
            }

            // Check for gauge prompt
            const shouldPrompt = shouldPromptGaugeUpdate(step, currentRow, project, startingLength);
            if (shouldPrompt && onShowGaugeCard) {
                const promptData = getGaugeUpdatePromptData(currentRow, step, project, startingLength);
                onShowGaugeCard(promptData);
                return; // Stay open for gauge view
            }
        } else {
            handleStepComplete();
        }

        // Only close if no gauge prompt
        if (isNotepadMode && onClose) {
            setTimeout(() => onClose(), 100);
        }
    };

    const handleAutoAdvanceToNextStep = () => {
        IntelliKnitLogger.debug('Row Counter', 'Auto-advancing to next step from final row completion');

        try {
            // Check if we can navigate right (this handles both carousel and step navigation)
            if (navigation.canGoRight) {
                navigation.navigateRight();
                IntelliKnitLogger.debug('Row Counter', 'Successfully navigated to next step');
            } else {
                if (onComponentComplete) {
                    onComponentComplete();
                    // Wait for carousel to update, then navigate to celebration
                    setTimeout(() => {
                        if (navigation.canGoRight) {
                            navigation.navigateRight();
                        }
                    }, 50);
                }
            }
        } catch (error) {
            IntelliKnitLogger.error('Row Counter Auto-advancement failed', error);
            // Stay on current step if navigation fails
        }
    };

    const handleRowIncrement = () => {
        if (stepType === 'single_action') {

            // For single action steps, complete and advance (don't toggle)
            if (!isCompleted) {
                handleStepComplete(); // Only complete if not already completed
            }

            if (!isNotepadMode) {
                handleAutoAdvanceToNextStep(); // Auto-advance in project mode
            }
            return;
        }

        if (stepType === 'fixed_multi_row') {
            if (isNotepadMode && currentRow === totalRows) {
                // Final row completion - auto-complete and close

                handleStepComplete();
                {/*}   setTimeout(() => {
                    onClose?.();
                }, 100); */}
                return;
            } else if (currentRow === totalRows) { // Changed from >= to ===
                // Project mode - final row completion, auto-complete and advance
                handleStepComplete();
                handleAutoAdvanceToNextStep();
                return;
            } else {
                incrementRow();
            }
        } else if (stepType === 'length_based') {
            // Always allow row increment for length-based
            incrementRow();
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
        stepType === 'single_action' ||
        (stepType === 'fixed_multi_row' && currentRow <= totalRows) || // Changed < to <=
        (isNotepadMode && stepType === 'fixed_multi_row' && currentRow === totalRows);

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
                    {isLengthStep && lengthProgressData && !lengthProgressData.hasGauge && currentRow === 1 && (
                        <div className="bg-sage-50 border border-sage-200 rounded-lg p-3 mb-4">
                            <div className="text-xs text-sage-700">
                                💡 Add row gauge to your project for intelligent length tracking!
                            </div>
                        </div>
                    )}

                    {/* PRIMARY ACTION AREA */}
                    {/* Always show row counter interface for all steps */}
                    <div className="space-y-4">
                        {/* Row Counter - centered and prominent */}
                        <div className="flex items-center justify-center gap-4">
                            <button
                                onClick={handleRowDecrement}
                                disabled={currentRow <= 1}
                                className="p-3 rounded-full bg-orange-100 hover:bg-orange-200 disabled:bg-gray-100 disabled:text-gray-400 text-orange-600 hover:text-orange-700 transition-colors disabled:cursor-not-allowed"
                            >
                                <RotateCcw size={18} />
                            </button>

                            <div className={`text-3xl font-bold ${theme.textPrimary} min-w-[80px]`}>
                                {currentRow}
                            </div>

                            <button
                                onClick={handleRowIncrement}
                                disabled={!canIncrement}
                                className="p-3 rounded-full bg-sage-100 hover:bg-sage-200 disabled:bg-gray-100 disabled:text-gray-400 text-sage-600 hover:text-sage-700 transition-colors disabled:cursor-not-allowed"
                            >
                                <Check size={18} />
                            </button>
                        </div>

                        {/* Progress bar - for multi-row and length steps */}
                        {(stepType === 'fixed_multi_row' || (isLengthStep && lengthDisplayData?.showProgressBar)) && (
                            <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className={`h-2 rounded-full transition-all duration-300 ${lengthDisplayData?.isNearTarget ? 'bg-yarn-500' : 'bg-sage-500'}`}
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

                        {/* Mark Complete button - only for indeterminate steps */}
                        {stepType === 'length_based' && (
                            <button
                                onClick={isNotepadMode ? handleLengthBasedComplete : handleMarkComplete}
                                className={`w-full py-3 rounded-xl font-medium transition-all duration-200 ${isCompleted
                                    ? 'bg-sage-500 text-white hover:bg-sage-600'
                                    : 'bg-sage-100 hover:bg-sage-200 text-sage-700 border-2 border-sage-300 hover:border-sage-400'
                                    }`}
                            >
                                {isCompleted ? 'Mark incomplete' : 'Mark Complete'}
                            </button>
                        )}

                        {/* Gauge calculation note for length-based notepad */}
                        {isNotepadMode && stepType === 'length_based' && !isCompleted && (
                            <div className="text-xs text-sage-600 mt-2 text-center">
                                Gauge will be calculated when marked complete
                            </div>
                        )}
                    </div>



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