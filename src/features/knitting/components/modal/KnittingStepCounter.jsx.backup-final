// src/features/knitting/components/modal/KnittingStepCounter.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { Check, RotateCcw, Lock } from 'lucide-react';
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
    shouldPromptGaugeUpdate,
    getGaugeUpdatePromptData,
} from '../../../../shared/utils/gaugeUtils';

// ✅ NEW: Progress tracking utilities
import {
    getStepProgressState,
    saveStepProgressState,
    canStartStep,
    calculateContinuationState,
    PROGRESS_STATUS
} from '../../../../shared/utils/progressTracking';

/**
 * Check if step is 2-color brioche and calculate actual pattern rows
 */
function isTwoColorBrioche(step) {
    const stitchPattern = step.wizardConfig?.stitchPattern || step.advancedWizardConfig?.stitchPattern;

    if (stitchPattern?.pattern === 'Two-Color Brioche' && stitchPattern?.customSequence?.rows) {
        const rows = stitchPattern.customSequence.rows;
        const rowKeys = Object.keys(rows);

        // Check for 'a' and 'b' suffixes
        const hasTwoColorStructure = rowKeys.some(key => key.endsWith('a') || key.endsWith('b'));

        if (hasTwoColorStructure) {
            // Count unique row numbers (1a and 1b = 1 row)
            const uniqueRows = new Set(rowKeys.map(key => parseInt(key.charAt(0))));
            return {
                isBrioche: true,
                actualRows: uniqueRows.size
            };
        }
    }

    return { isBrioche: false, actualRows: null };
}

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

    const rowCounter = useRowCounter(
        project?.id,
        component?.id,
        stepIndex,
        step,
        isNotepadMode,
        updateProject  // ✨ NEW: Pass updateProject function
    );
    const { currentRow, stitchCount, incrementRow, decrementRow, updateStitchCount } = rowCounter;

    // Side tracking hook
    const sideTracking = useSideTracking(project?.id, component?.id, navigation.currentStep, step, component);

    // Animation state for visual feedback
    const [isAnimating, setIsAnimating] = useState(false);
    const [animationDirection, setAnimationDirection] = useState(null); // 'up' or 'down'

    // Modified increment handler with animation
    const handleRowIncrementWithFeedback = () => {

        if (isStepLocked) return;

        // Trigger animation BEFORE the actual increment
        setAnimationDirection('up');
        setIsAnimating(true);
        setTimeout(() => setIsAnimating(false), 400);

        if (stepType === 'single_action') {

            const progress = getStepProgressState(step.id, component.id, project.id);

            const alreadyCompleted = progress.status === PROGRESS_STATUS.COMPLETED;

            if (!alreadyCompleted) {
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
                incrementRow(project);
            }
        } else if (stepType === 'length_based') {
            incrementRow(project);
        } else {
            incrementRow(project);
        }
    };

    // Modified decrement handler with animation
    const handleRowDecrementWithFeedback = () => {
        if (isStepLocked) return;
        if (currentRow > 1) {
            // Trigger animation
            setAnimationDirection('down');
            setIsAnimating(true);
            setTimeout(() => setIsAnimating(false), 400);

            decrementRow(project);
        }
    };

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
    }, [isLengthStep, step, currentRow, project, startingLength]);

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
    }, [currentRow, step, component, project, isNotepadMode, isStepLocked]);

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

    // ✅ FIXED: Mark Complete function with proper side tracking and navigation
    const handleMarkComplete = () => {
        if (isStepLocked) return;

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

        // ✅ FIX: Capture completion state BEFORE making any changes
        const wasCompleted = isCompleted;

        // ✅ FIX: ALWAYS complete step and record side tracking FIRST
        if (!wasCompleted) {
            // Record side tracking BEFORE toggling completion
            if (useSideIntelligence && currentSide) {
                sideTracking.recordEndingSide(currentSide, currentRow, () => { });
            }

            if (sideTracking.hasSessionChanges) {
                sideTracking.commitSideChanges(() => { });
            }

            // Save completion to progress system
            const rowsCompleted = isLengthStep ? currentRow : calculateActualTotalRows(step);
            const continuation = calculateContinuationState(step);

            saveStepProgressState(step.id, component.id, project.id, {
                status: PROGRESS_STATUS.COMPLETED,
                currentRow: rowsCompleted,
                totalRows: rowsCompleted,
                completedAt: new Date().toISOString(),
                completionMethod: 'knitting_modal',
                continuation: continuation
            });

            // Toggle completion in UI
            onToggleCompletion?.(stepIndex);
        } else {
            // Just un-complete
            onToggleCompletion?.(stepIndex);
            return;
        }

        // ✅ FIX: Check if we should show gauge card (AFTER completion is recorded)
        if (isLengthStep) {
            // Always get gauge data for length steps
            const promptData = getGaugeUpdatePromptData(currentRow, step, project, startingLength);
            
            if (promptData && onShowGaugeCard) {
                // Show gauge card - it will handle navigation
                onShowGaugeCard(promptData);
                return;
            }
        }

        // ✅ FIX: If no gauge card shown, navigate manually
        handlePostCompletionNavigation();
    };

    // ✅ NEW: Handle navigation after step completion
    const handlePostCompletionNavigation = () => {
        const isLastStep = stepIndex === (component?.steps?.length - 1);

        if (isLastStep) {
            // Last step - show celebration or component complete
            if (onShowCelebration) {
                const celebrationData = {
                    rowsCompleted: currentRow,
                    targetLength: step.totalRows || currentRow,
                    units: 'rows'
                };
                onShowCelebration(celebrationData);
            } else if (onComponentComplete) {
                onComponentComplete();
            } else if (onClose) {
                onClose();
            }
        } else if (navigation.canGoRight) {
            // Not last step - navigate to next
            navigation.navigateRight();
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

        // ✅ FIX: Handle Pick Up & Knit initialization steps
        if (patternName === 'Pick Up & Knit') {
            return step.endingStitches || 0;
        }

        // ✅ FIX: Handle Continue from Stitches initialization steps  
        if (patternName === 'Continue from Stitches') {
            return step.endingStitches || 0;
        }

        // ✅ FIX: Handle Custom Initialization steps
        if (patternName === 'Custom Initialization') {
            return step.endingStitches || 0;
        }

        // ✅ NEW: Handle Custom pattern with customSequence.rows
        const stitchPattern = step.wizardConfig?.stitchPattern || step.advancedWizardConfig?.stitchPattern;
        if (stitchPattern?.pattern === 'Custom' && stitchPattern?.customSequence?.rows) {
            const rows = stitchPattern.customSequence.rows;
            const startingStitches = step.startingStitches || 0;

            // Calculate stitch count by accumulating changes up to current row
            let currentStitches = startingStitches;
            const patternLength = rows.length;

            for (let i = 1; i <= row; i++) {
                const rowIndex = (i - 1) % patternLength;
                const rowData = rows[rowIndex];

                if (rowData) {
                    // Check stitchesRemaining FIRST (absolute value takes priority)
                    if (rowData.stitchesRemaining !== null && rowData.stitchesRemaining !== undefined) {
                        currentStitches = rowData.stitchesRemaining;
                    }
                    // Otherwise use stitchChange (relative adjustment)
                    else if (rowData.stitchChange !== null && rowData.stitchChange !== undefined) {
                        currentStitches += rowData.stitchChange;
                    }
                }
            }

            return currentStitches;
        }

        // ✅ NEW: Handle Two-Color Brioche with customSequence.rows (object structure)
        if (stitchPattern?.pattern === 'Two-Color Brioche' && stitchPattern?.customSequence?.rows) {
            const rows = stitchPattern.customSequence.rows;
            const startingStitches = step.startingStitches || 0;

            // Get pattern length (number of unique row numbers, not counting a/b)
            const rowsInPattern = parseInt(stitchPattern.rowsInPattern) ||
                Math.max(...Object.keys(rows).map(key => parseInt(key.charAt(0))));

            // Calculate stitch count by accumulating changes up to current row
            let currentStitches = startingStitches;

            for (let i = 1; i <= row; i++) {
                const patternRow = ((i - 1) % rowsInPattern) + 1;
                const rowKeyA = `${patternRow}a`;
                const rowKeyB = `${patternRow}b`;

                const stitchChangeA = rows[rowKeyA]?.stitchChange || 0;
                const stitchChangeB = rows[rowKeyB]?.stitchChange || 0;

                // Both 'a' and 'b' rows happen in the same row number
                currentStitches += (stitchChangeA + stitchChangeB);
            }

            return currentStitches;
        }

        // ✅ FIX: Handle Custom - Description Entry (no customSequence)
        if (patternName === 'Custom' && !step.wizardConfig?.stitchPattern?.customSequence?.rows) {
            const stitchPattern = step.wizardConfig?.stitchPattern;
            const rowsInPattern = parseInt(stitchPattern?.rowsInPattern) || 1;
            const stitchChangePerRepeat = parseInt(stitchPattern?.stitchChangePerRepeat) || 0;

            // Calculate how many complete pattern repeats will be done AFTER this row
            const repeatsAfterThisRow = Math.ceil(row / rowsInPattern);

            // Calculate stitch count: starting + (change per repeat × repeats after this row)
            return (step.startingStitches || 0) + (stitchChangePerRepeat * repeatsAfterThisRow);
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
    // Around line 188 in KnittingStepCounter.jsx
    const getCurrentInstruction = () => {
        try {
            const stitchPattern = step.wizardConfig?.stitchPattern || step.advancedWizardConfig?.stitchPattern;

            // ✅ FIX: Check for Custom pattern's customSequence.rows FIRST
            if (stitchPattern?.pattern === 'Custom' && stitchPattern?.customSequence?.rows) {
                const rows = stitchPattern.customSequence.rows;
                const rowIndex = (currentRow - 1) % rows.length;
                const rowData = rows[rowIndex];

                if (rowData && rowData.instruction) {
                    return {
                        instruction: rowData.instruction,  // Already plain text, no need to format
                        isSupported: true,
                        isRowByRow: true
                    };
                }
            }

            // Original row-by-row check for Lace/Cable
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



            const result = getRowInstruction(step, currentRow, stitchCount, project, component, stepIndex, stepStartingSide);
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

    const handleStepComplete = () => {
        if (isStepLocked) return;

        // ✅ NEW: Save completion to progress system FIRST (project mode only)
        if (!isNotepadMode && step && component && project) {
            // ✅ FIX: For length-based steps, use currentRow from counter, not calculateActualTotalRows
            const rowsCompleted = isLengthStep ? currentRow : calculateActualTotalRows(step);
            const continuation = calculateContinuationState(step);

            saveStepProgressState(step.id, component.id, project.id, {
                status: PROGRESS_STATUS.COMPLETED,
                currentRow: rowsCompleted,  // ✅ Use actual row counter value
                totalRows: rowsCompleted,
                completedAt: new Date().toISOString(),
                completionMethod: 'knitting_modal',
                continuation: continuation
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

        // ✅ FIX: Toggle completion BEFORE gauge check
        // This ensures the step is marked complete even if gauge card shows
        onToggleCompletion?.(stepIndex);

        // Length-based gauge update check (after completion is toggled)
        if (!isNotepadMode && isLengthStep && !isCompleted) {
            const shouldPrompt = shouldPromptGaugeUpdate(step, currentRow, project, startingLength);
            if (shouldPrompt && onShowGaugeCard) {
                const promptData = getGaugeUpdatePromptData(currentRow, step, project, startingLength);
                onShowGaugeCard(promptData);
                return; // ← Now it's OK to return here
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

        IntelliKnitLogger.debug('Row Counter', 'Auto-advancing from final row completion');

        try {
            if (navigation.canGoRight) {
                navigation.navigateRight();
            } else {
                if (onClose) {
                    onClose();
                } else {
                }

                if (onComponentComplete) {
                    onComponentComplete();
                }
            }
        } catch (error) {
            console.error('Error in handleAutoAdvanceToNextStep:', error);
            if (onClose) {
                onClose();
            }
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
        // 🆕 CHECK FOR 2-COLOR BRIOCHE FIRST
        const briocheCheck = isTwoColorBrioche(step);
        if (briocheCheck.isBrioche) {
            const duration = step.wizardConfig?.duration;

            if (duration?.type === 'repeats') {
                const repeats = parseInt(duration.value) || 0;
                return repeats * briocheCheck.actualRows;
            }

            // ✅ FIX: Handle 'rows' duration type for brioche
            if (duration?.type === 'rows') {
                // Return the exact number of rows specified, not the pattern length
                return parseInt(duration.value) || step.totalRows || briocheCheck.actualRows;
            }

            // For brioche without specific duration, fall back to totalRows or pattern length
            return step.totalRows || briocheCheck.actualRows;
        }

        // EXISTING LOGIC CONTINUES BELOW (keep all existing code)
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

    // In KnittingStepCounter.jsx, update getRowDisplayText():
    const getRowDisplayText = () => {
        if (isLengthStep && lengthDisplayData) {
            let rowText = lengthDisplayData.rowText;

            if (useSideIntelligence && construction === 'flat' && currentSide) {
                // ✅ Add sun BEFORE for RS, moon AFTER for WS
                const sideIndicator = currentSide === 'WS' ? ' 🌙' : '';
                const sunIndicator = currentSide === 'RS' ? '☀️ ' : '';
                rowText = sunIndicator + rowText + ` (${currentSide})${sideIndicator}`;
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
            // ✅ Add sun BEFORE for RS, moon AFTER for WS
            const sideIndicator = currentSide === 'WS' ? ' 🌙' : '';
            const sunIndicator = currentSide === 'RS' ? '☀️ ' : '';
            rowText = sunIndicator + rowText + ` (${currentSide})${sideIndicator}`;
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

                    <div className={`${instructionResult.isBrioche ? 'text-left' : ''} mb-4`}>
                        <div className={`text-lg font-semibold ${theme.textPrimary} leading-relaxed ${instructionResult.isBrioche ? 'whitespace-pre-line' : ''}`}>
                            {instructionResult.instruction || 'Loading instruction...'}
                        </div>
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
                        {/* Row Counter - BIGGER BUTTONS with STRONG FEEDBACK */}
                        <div className="flex items-center justify-center gap-3">
                            {/* Back Button - Smaller but still accessible */}
                            <button
                                onClick={handleRowDecrementWithFeedback}
                                disabled={currentRow <= 1 || isStepLocked}
                                className="p-4 rounded-full bg-orange-100 hover:bg-orange-200 active:bg-orange-300 active:scale-95 disabled:bg-gray-100 disabled:text-gray-400 text-orange-600 hover:text-orange-700 transition-all duration-150 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
                            >
                                <RotateCcw size={20} strokeWidth={2.5} />
                            </button>

                            {/* Current Row Number - WITH ANIMATION */}
                            <div className={`text-5xl font-bold ${theme.textPrimary} min-w-[100px] text-center transition-all duration-300 ${isAnimating
                                ? animationDirection === 'up'
                                    ? 'scale-110 text-sage-600'
                                    : 'scale-110 text-orange-600'
                                : 'scale-100'
                                }`}>
                                {currentRow}
                            </div>

                            {/* Plus Button - BIG and PROMINENT */}
                            <button
                                onClick={handleRowIncrementWithFeedback}
                                disabled={!canIncrement}
                                className="p-6 rounded-full bg-sage-500 hover:bg-sage-600 active:bg-sage-700 active:scale-95 disabled:bg-gray-100 disabled:text-gray-400 text-white transition-all duration-150 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                            >
                                <Check size={28} strokeWidth={3} />
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
                        component={component}
                        stepIndex={stepIndex}
                        project={project}
                        onContinuationChange={(overrides) => {
                            if (!component || !project || !updateProject) return;

                            // Update the step with continuation overrides
                            const updatedProject = {
                                ...project,
                                components: project.components.map((comp, idx) =>
                                    comp.id === component.id ? {
                                        ...comp,
                                        steps: comp.steps.map((s, idx) =>
                                            idx === stepIndex ? {
                                                ...s,
                                                continuationOverrides: overrides
                                            } : s
                                        )
                                    } : comp
                                )
                            };

                            updateProject(updatedProject);
                        }}
                    />
                )}
            </div>
        </div>
    );
};

export default KnittingStepCounter;
