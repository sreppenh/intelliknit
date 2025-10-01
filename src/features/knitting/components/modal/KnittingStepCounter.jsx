// src/features/knitting/components/modal/KnittingStepCounter.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Minus, Target, Check, RotateCcw, Lock } from 'lucide-react';
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
import markerArrayUtils from '../../../../shared/utils/markerArrayUtils';

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

// ✅ NEW: Progress tracking utilities
import {
    getStepProgressState,
    saveStepProgressState,
    canStartStep,
    PROGRESS_STATUS
} from '../../../../shared/utils/progressTracking';

const KnittingStepCounter = ({
    step,
    component,
    project,
    theme,
    progress,
    stepIndex,
    navigation,
    updateProject,
    onToggleCompletion,
    onClose,
    onComponentComplete,
    onShowGaugeCard,
    onShowCelebration
}) => {

    const isNotepadMode = project?.isNotepadMode || false;

    // ✅ NEW: Check if step is locked (skip for notepad mode)
    const isStepLocked = !isNotepadMode && component && project ?
        !canStartStep(stepIndex, component.steps, component.id, project.id) :
        false;

    // ✅ NEW: Get progress state
    const progressState = !isNotepadMode && step && component && project ?
        getStepProgressState(step.id, component.id, project.id) :
        null;

    const rowCounter = useRowCounter(project?.id, component?.id, stepIndex, step, isNotepadMode);
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

    // Until-length starting measurement state
    const startingLengthKey = `until-length-start-${project?.id}-${component?.id}-${stepIndex}`;
    const [startingLength, setStartingLength] = useState(() => {
        if (lengthTarget?.type === 'until_length') {
            const stored = localStorage.getItem(startingLengthKey);
            return stored ? parseFloat(stored) : null;
        }
        return null;
    });

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

    // ✅ NEW: Save progress to tracking system on row changes (skip for notepad mode)
    useEffect(() => {
        if (isNotepadMode || !step || !component || !project) return;
        if (isStepLocked) return; // Don't save progress for locked steps

        // ✅ NEW: Don't overwrite completed status
        const existingProgress = getStepProgressState(step.id, component.id, project.id);
        if (existingProgress.status === PROGRESS_STATUS.COMPLETED) {
            return; // Step is already complete, don't change it
        }

        const totalRows = calculateActualTotalRows(step);
        saveStepProgressState(step.id, component.id, project.id, {
            status: PROGRESS_STATUS.IN_PROGRESS,
            currentRow: currentRow,
            totalRows: totalRows || step.totalRows,
            lastWorkedAt: new Date().toISOString(),
            completionMethod: 'knitting_modal'
        });
    }, [currentRow, step?.id, component?.id, project?.id, isNotepadMode, isStepLocked]);

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
        if (isStepLocked) return; // Prevent completion of locked steps

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

        // Handle marker phases shaping
        if (hasShaping && step.wizardConfig?.shapingConfig?.type === 'marker_phases') {
            const config = step.wizardConfig.shapingConfig.config;
            const calculation = config?.calculation;

            if (calculation?.arrayEvolution && Array.isArray(calculation.arrayEvolution) && calculation.arrayEvolution.length > 0) {
                const evolutionEntry = calculation.arrayEvolution
                    .filter(entry => entry.row <= row)
                    .sort((a, b) => b.row - a.row)[0];

                if (evolutionEntry) {
                    return evolutionEntry.totalStitches;
                }
            }

            const sequences = config?.phases;
            if (sequences && sequences.length > 0) {
                const sequence = sequences[0];
                const instructionData = sequence.instructionData;

                if (instructionData?.actions && instructionData?.phases) {
                    const markerArray = config.markerSetup?.stitchArray || [];
                    const startingStitches = markerArrayUtils.sumArrayStitches(markerArray);
                    const stitchChangePerIteration = markerArrayUtils.calculateStitchChangePerIteration(instructionData.actions);

                    let currentRow = 1;
                    let currentStitches = startingStitches;

                    for (const phase of instructionData.phases) {
                        if (phase.type === 'initial') {
                            if (row === currentRow) {
                                return currentStitches + stitchChangePerIteration;
                            }
                            currentStitches += stitchChangePerIteration;
                            currentRow++;
                        } else if (phase.type === 'repeat') {
                            const times = phase.times || 1;
                            const frequency = phase.regularRows;

                            for (let i = 0; i < times; i++) {
                                for (let j = 0; j < frequency - 1; j++) {
                                    if (row === currentRow) {
                                        return currentStitches;
                                    }
                                    currentRow++;
                                }
                                if (row === currentRow) {
                                    return currentStitches + stitchChangePerIteration;
                                }
                                currentStitches += stitchChangePerIteration;
                                currentRow++;
                            }
                        } else if (phase.type === 'finish') {
                            const finishRows = phase.regularRows || 1;
                            for (let j = 0; j < finishRows; j++) {
                                if (row === currentRow) {
                                    return currentStitches;
                                }
                                currentRow++;
                            }
                        }
                    }

                    return currentStitches;
                }
            }

            if (row === 1) {
                return calculation?.startingStitches || step.startingStitches || 0;
            }
            return calculation?.endingStitches || step.endingStitches || 0;
        }

        // Handle bind-off shaping
        if (hasShaping && step.wizardConfig?.shapingConfig?.type === 'bind_off_shaping') {
            const calculation = step.wizardConfig.shapingConfig.config?.calculation;

            if (calculation?.phases) {
                let currentStitchCount = calculation.startingStitches || step.startingStitches || 0;

                for (const phase of calculation.phases) {
                    const rowRange = phase.rowRange;
                    let phaseStartRow, phaseEndRow;

                    if (rowRange.includes('-')) {
                        const [start, end] = rowRange.split('-').map(n => parseInt(n.trim()));
                        phaseStartRow = start;
                        phaseEndRow = end;
                    } else {
                        phaseStartRow = phaseEndRow = parseInt(rowRange);
                    }

                    if (row > phaseEndRow) {
                        currentStitchCount = phase.endingStitches;
                    } else if (row >= phaseStartRow && row <= phaseEndRow) {
                        const rowsCompleted = row - phaseStartRow + 1;
                        const stitchesPerRow = phase.stitchChange / phase.rows;
                        currentStitchCount = phase.startingStitches + (stitchesPerRow * rowsCompleted);
                        break;
                    } else {
                        break;
                    }
                }

                return Math.round(currentStitchCount);
            }

            if (row === 1) {
                return calculation?.startingStitches || step.startingStitches || 0;
            }
            return calculation?.endingStitches || step.endingStitches || 0;
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
    const stepType = (() => {
        if (isNotepadMode && isLengthStep) {
            return 'length_based';
        }
        return getStepType(step, totalRows, duration);
    })();

    // Get current instruction
    const getCurrentInstruction = () => {
        try {
            const stitchPattern = step.wizardConfig?.stitchPattern || step.advancedWizardConfig?.stitchPattern;

            if (stitchPattern?.entryMode === 'row_by_row' && stitchPattern?.rowInstructions) {
                const rowInstructions = stitchPattern.rowInstructions;
                const rowIndex = (currentRow - 1) % rowInstructions.length;
                const rowData = rowInstructions[rowIndex];

                if (rowData && typeof rowData === 'string') {
                    return {
                        instruction: formatReadableInstruction(rowData),
                        isSupported: true,
                        isRowByRow: true
                    };
                } else if (rowData && rowData.instruction) {
                    return {
                        instruction: formatReadableInstruction(rowData.instruction),
                        isSupported: true,
                        isRowByRow: true
                    };
                }
            }

            const result = getRowInstruction(step, currentRow, stitchCount, project);
            return result;
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
                const promptData = getGaugeUpdatePromptData(currentRow, step, project, startingLength);
                const updatedProject = updateProjectGaugeFromMeasurement(project, promptData);

                if (updateProject) {
                    updateProject(updatedProject);
                }
            } else {
                const promptData = getGaugeUpdatePromptData(currentRow, step, project, startingLength);
                setGaugePromptData(promptData);
                setShowGaugePrompt(true);
            }
        }
    };

    const handleGaugeAccept = () => {
        if (gaugePromptData) {
            const updatedProject = updateProjectGaugeFromMeasurement(project, gaugePromptData);

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
        if (isStepLocked) return; // Prevent completion of locked steps

        // ✅ NEW: Save completion to progress system FIRST (project mode only)
        if (!isNotepadMode && step && component && project) {
            const totalRows = calculateActualTotalRows(step);
            saveStepProgressState(step.id, component.id, project.id, {
                status: PROGRESS_STATUS.COMPLETED,
                currentRow: totalRows,
                totalRows: totalRows,
                completedAt: new Date().toISOString(),
                completionMethod: 'knitting_modal'
            });
        }

        // Notepad mode celebration
        if (isNotepadMode && !isCompleted && onShowCelebration) {
            onToggleCompletion?.(stepIndex);

            const celebrationData = {
                rowsCompleted: currentRow,
                targetLength: step.totalRows || currentRow,
                units: 'rows'
            };
            onShowCelebration(celebrationData);
            return;
        }

        // Length-based gauge update check
        if (!isNotepadMode && isLengthStep && !isCompleted) {
            const shouldPrompt = shouldPromptGaugeUpdate(step, currentRow, project, startingLength);
            if (shouldPrompt && onShowGaugeCard) {
                const promptData = getGaugeUpdatePromptData(currentRow, step, project, startingLength);
                onShowGaugeCard(promptData);
                return;
            }
        }

        // Side tracking
        if (useSideIntelligence && currentSide) {
            sideTracking.recordEndingSide(currentSide, currentRow, () => { });
        }

        if (sideTracking.hasSessionChanges) {
            sideTracking.commitSideChanges(() => { });
        }

    };

    const handleLengthBasedComplete = () => {
        if (isStepLocked) return; // Prevent completion of locked steps

        if (isCompleted) {
            onToggleCompletion?.(stepIndex);
            return;
        }

        const rowsKnitted = currentRow;
        const targetLength = parseFloat(step.wizardConfig?.duration?.value);
        const units = step.wizardConfig?.duration?.units || project?.defaultUnits || 'inches';

        if (isNotepadMode && rowsKnitted > 0 && targetLength > 0) {
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

            const shouldPrompt = shouldPromptGaugeUpdate(step, currentRow, project, startingLength);
            if (shouldPrompt && onShowGaugeCard) {
                const promptData = getGaugeUpdatePromptData(currentRow, step, project, startingLength);
                onShowGaugeCard(promptData);
                return;
            }
        } else {
            handleStepComplete();
        }

        if (isNotepadMode && onClose) {
            setTimeout(() => onClose(), 100);
        }
    };

    const handleAutoAdvanceToNextStep = () => {
        IntelliKnitLogger.debug('Row Counter', 'Auto-advancing to next step from final row completion');

        try {
            if (navigation.canGoRight) {
                navigation.navigateRight();
                IntelliKnitLogger.debug('Row Counter', 'Successfully navigated to next step');
            } else {
                if (onComponentComplete) {
                    onComponentComplete();
                    setTimeout(() => {
                        if (navigation.canGoRight) {
                            navigation.navigateRight();
                        }
                    }, 50);
                }
            }
        } catch (error) {
            IntelliKnitLogger.error('Row Counter Auto-advancement failed', error);
        }
    };

    const handleRowIncrement = () => {
        if (isStepLocked) return; // Prevent incrementing locked steps

        if (stepType === 'single_action') {
            if (!isCompleted) {
                handleStepComplete();
            }

            if (!isNotepadMode) {
                handleAutoAdvanceToNextStep();
            }
            return;
        }

        if (stepType === 'fixed_multi_row') {
            if (isNotepadMode && currentRow === totalRows) {
                handleStepComplete();
                return;
            } else if (currentRow === totalRows) {
                handleStepComplete();
                handleAutoAdvanceToNextStep();
                return;
            } else {
                incrementRow();
            }
        } else if (stepType === 'length_based') {
            incrementRow();
        } else {
            incrementRow();
        }
    };

    const handleRowDecrement = () => {
        if (isStepLocked) return; // Prevent decrementing locked steps
        if (currentRow > 1) {
            decrementRow();
        }
    };

    // Handle pattern offset changes
    const handleSideChange = (newSide) => {
        if (isStepLocked) return;
        sideTracking.updateSideOverride(newSide);
    };

    const handlePatternRowChange = (patternRow) => {
        if (isStepLocked) return;
        sideTracking.updatePatternOffset(patternRow - 1);
    };

    const canIncrement = !isStepLocked && (
        stepType === 'length_based' ||
        stepType === 'completion_when_ready' ||
        stepType === 'single_action' ||
        (stepType === 'fixed_multi_row' && currentRow <= totalRows) ||
        (isNotepadMode && stepType === 'fixed_multi_row' && currentRow === totalRows)
    );

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

        if (duration?.type === 'color_repeats') {
            const repeats = parseInt(duration.value) || 0;
            const colorwork = step.wizardConfig?.colorwork || step.advancedWizardConfig?.colorwork;

            if (repeats > 0 && colorwork?.stripeSequence) {
                const totalRowsInSequence = colorwork.stripeSequence.reduce(
                    (sum, stripe) => sum + (stripe.rows || 0),
                    0
                );
                return repeats * totalRowsInSequence;
            }
        }

        return step.totalRows || 1;
    }

    // Get display text for row with length intelligence
    const getRowDisplayText = () => {
        if (isLengthStep && lengthDisplayData) {
            let rowText = lengthDisplayData.rowText;

            if (useSideIntelligence && construction === 'flat' && currentSide) {
                rowText += ` (${currentSide})`;
            }

            return rowText;
        }

        const rowTerm = construction === 'round' ? 'Round' : 'Row';

        if (stepType === 'single_action') {
            return '';
        }

        let rowText = stepType === 'fixed_multi_row'
            ? `${rowTerm} ${currentRow} of ${totalRows}`
            : `${rowTerm} ${currentRow}`;

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

                    {/* ✅ NEW: Locked Step Warning */}
                    {isStepLocked && (
                        <div className="mb-4 p-4 bg-gray-100 border-2 border-gray-300 rounded-xl">
                            <div className="flex items-center justify-center gap-2 mb-2">
                                <Lock size={20} className="text-gray-500" />
                                <span className="text-sm font-semibold text-gray-700">Step Locked</span>
                            </div>
                            <p className="text-xs text-gray-600">
                                Complete previous steps first to work on this step.
                            </p>
                        </div>
                    )}

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
                    <div className="space-y-4">
                        {/* Row Counter - centered and prominent */}
                        <div className="flex items-center justify-center gap-4">
                            <button
                                onClick={handleRowDecrement}
                                disabled={currentRow <= 1 || isStepLocked}
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
                                disabled={isStepLocked}
                                className={`w-full py-3 rounded-xl font-medium transition-all duration-200 ${isStepLocked
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : isCompleted
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
                {!isNotepadMode && !isStepLocked && currentRow === 1 && (useSideIntelligence || lengthTarget?.type === 'until_length') && (
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