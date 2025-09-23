import React, { useState } from 'react';
import ShapingHeader from './ShapingHeader';
import IncrementInput from '../../../../shared/components/IncrementInput';
import SegmentedControl from '../../../../shared/components/SegmentedControl';
import { generateMarkerInstructionPreview } from '../../../../shared/utils/markerInstructionUtils';
import { getConstructionTerms } from '../../../../shared/utils/ConstructionTerminology';
import MarkerArrayVisualization from '../../../../shared/components/MarkerArrayVisualization';
import markerArrayUtils from '../../../../shared/utils/markerArrayUtils';
import SelectionGrid from '../../../../shared/components/SelectionGrid';

const MarkerTimingConfig = ({
    instructionData,
    currentStitches,
    markerArray,
    markerColors,
    construction,
    onComplete,
    onBack,
    wizard,
    onGoToLanding,
    onCancel,
    project
}) => {
    const [phases, setPhases] = useState([
        { type: 'initial' }, // Always present - the kickoff special row
        {
            type: 'repeat',
            regularRows: construction === 'flat' ? 2 : 1,
            amountMode: 'times',
            times: 5,
            targetStitches: null,
            intervalType: 'rows'
        },
        { type: 'finish', regularRows: construction === 'flat' ? 2 : 1 }
    ]);

    const [completedPhases, setCompletedPhases] = useState([]);
    const [finishingRows, setFinishingRows] = useState(construction === 'flat' ? 1 : 0);

    // Generate preview with completed phases AND current phase
    const generatePreview = () => {
        if (!instructionData?.actions) return "No instruction data";

        const basePattern = wizard?.wizardData?.stitchPattern?.pattern || 'pattern';
        const allPhases = [
            { type: 'initial' },
            ...completedPhases.map(phase => ({ type: 'repeat', ...phase })),
            { type: 'repeat', ...phases.find(p => p.type === 'repeat') }
        ];

        // Only add finish phase if there are finishing rows
        if (finishingRows > 0) {
            allPhases.push({ type: 'finish', regularRows: finishingRows });
        }

        // Generate StepCard-style description
        const lines = [];

        allPhases.forEach((phase, index) => {
            if (phase.type === 'initial') {
                const dummyTiming = { frequency: 1, times: 1, amountMode: 'times' };
                const instruction = generateMarkerInstructionPreview(
                    instructionData.actions,
                    dummyTiming,
                    markerArray,
                    construction,
                    basePattern
                );
                lines.push(`Phase ${index + 1}: ${instruction.replace(/\s*\([+\-]?\d+\s*sts?\)\s*$/i, '')}`);
            } else if (phase.type === 'repeat') {
                const construction_term = construction === 'round' ? 'round' : 'row';
                const times = phase.times || 1;
                const frequency = phase.regularRows || 1;
                lines.push(`Phase ${index + 1}: Repeat every ${frequency} ${construction_term}s ${times} times`);
            } else if (phase.type === 'finish') {
                lines.push(`Phase ${index + 1}: Work in ${basePattern} for ${phase.regularRows || 1} ${construction === 'round' ? 'round' : 'row'}`);
            }
        });

        return lines.join('\n');
    };

    const handleComplete = () => {
        const repeatPhase = phases.find(p => p.type === 'repeat');

        // Build complete phases array: initial + all completed phases + current phase + finish
        const allPhases = [
            { type: 'initial' },
            ...completedPhases.map(phase => ({ type: 'repeat', ...phase })),
            { type: 'repeat', ...repeatPhase },
            { type: 'finish', regularRows: finishingRows }
        ];

        // Generate basic instruction data
        const finalInstructionData = {
            ...instructionData,
            timing: {
                frequency: repeatPhase?.regularRows || 1,
                times: repeatPhase?.times || 1,
                amountMode: repeatPhase?.amountMode || 'times',
                targetStitches: repeatPhase?.targetStitches
            },
            phases: allPhases,
            preview: generatePreview()
        };

        // NEW: Generate row-by-row breakdown similar to PhaseCalculationService
        const stitchChangePerIteration = markerArrayUtils.calculateStitchChangePerIteration(instructionData?.actions || []);

        let currentStitchCount = currentStitches;
        let currentRowPosition = 1;
        let phaseDetails = [];

        // Process each phase to generate row-by-row breakdown
        for (let i = 0; i < allPhases.length; i++) {
            const phase = allPhases[i];

            if (phase.type === 'initial') {
                // Initial phase: 1 row, applies stitch change
                const startRow = currentRowPosition;
                const endRow = currentRowPosition;
                const phaseStartStitches = currentStitchCount;

                currentStitchCount += stitchChangePerIteration;

                phaseDetails.push({
                    type: 'initial',
                    description: `Initial shaping ${construction === 'round' ? 'round' : 'row'}`,
                    rowRange: `${startRow}`,
                    rows: 1,
                    startingStitches: phaseStartStitches,
                    endingStitches: currentStitchCount,
                    stitchChange: stitchChangePerIteration,
                    isShapingPhase: true
                });

                currentRowPosition += 1;

            } else if (phase.type === 'repeat') {
                // Repeat phase: multiple iterations of frequency + shaping
                const phaseStartStitches = currentStitchCount;
                const frequency = phase.regularRows || 1;
                const times = phase.times || 1;
                const phaseRows = frequency * times;
                const totalStitchChange = stitchChangePerIteration * times;

                const startRow = currentRowPosition;
                const endRow = currentRowPosition + phaseRows - 1;

                currentStitchCount += totalStitchChange;

                phaseDetails.push({
                    type: 'repeat',
                    description: `Repeat every ${frequency} ${construction === 'round' ? 'round' : 'row'}${frequency === 1 ? '' : 's'} ${times} times`,
                    rowRange: `${startRow}-${endRow}`,
                    rows: phaseRows,
                    startingStitches: phaseStartStitches,
                    endingStitches: currentStitchCount,
                    stitchChange: totalStitchChange,
                    frequency: frequency,
                    times: times,
                    isShapingPhase: true
                });

                currentRowPosition += phaseRows;

            } else if (phase.type === 'finish') {
                // Finish phase: plain rows, no stitch change
                const phaseRows = phase.regularRows || 0;

                if (phaseRows > 0) {
                    const startRow = currentRowPosition;
                    const endRow = currentRowPosition + phaseRows - 1;

                    phaseDetails.push({
                        type: 'finish',
                        description: `Work in pattern for ${phaseRows} ${construction === 'round' ? 'round' : 'row'}${phaseRows === 1 ? '' : 's'}`,
                        rowRange: `${startRow}-${endRow}`,
                        rows: phaseRows,
                        startingStitches: currentStitchCount,
                        endingStitches: currentStitchCount,
                        stitchChange: 0,
                        isShapingPhase: false
                    });

                    currentRowPosition += phaseRows;
                }
            }
        }

        // Create enhanced instruction data with row-by-row breakdown
        const enhancedInstructionData = {
            ...finalInstructionData,
            // Add the detailed breakdown for knitting mode
            calculation: {
                instruction: generatePreview(),
                startingStitches: currentStitches,
                endingStitches: currentStitchCount,
                totalRows: currentRowPosition - 1,
                netStitchChange: currentStitchCount - currentStitches,
                stitchChangePerIteration: stitchChangePerIteration,

                // This is the key addition - row-by-row phase breakdown
                phases: phaseDetails,

                // Array evolution for advanced features (future use)
                arrayEvolution: [], // Could be populated later if needed
                finalArray: [], // Could be populated later if needed
            }
        };

        console.log('=== ENHANCED MARKER CALCULATION ===');
        console.log('Phase details generated:', JSON.stringify(phaseDetails, null, 2));
        console.log('Full enhanced data:', JSON.stringify(enhancedInstructionData, null, 2));
        console.log('===================================');

        console.log('=== FINISHING ROWS DEBUG ===');
        console.log('finishingRows state:', finishingRows);
        console.log('allPhases finish phase:', allPhases.find(p => p.type === 'finish'));
        console.log('============================');

        onComplete(enhancedInstructionData);
    };

    const handleBack = () => {
        onBack();
    };

    // Calculate stitch context including current phase configuration
    const getStitchContext = () => {

        const repeatPhase = phases.find(p => p.type === 'repeat');
        const allPhases = [
            { type: 'initial' },
            ...completedPhases.map(phase => ({ type: 'repeat', ...phase })),
            { type: 'repeat', ...repeatPhase }
        ];

        const result = markerArrayUtils.calculateMarkerPhaseProgression(
            instructionData?.actions || [],
            allPhases,
            currentStitches,
            finishingRows
        );

        return {
            ...result,
            errors: [],
            isValid: true
        };
    };

    const stitchContext = getStitchContext();

    // Add phase to completed list
    const handleAddPhase = () => {
        const repeatPhase = phases.find(p => p.type === 'repeat');
        const newPhase = {
            id: Date.now(),
            regularRows: repeatPhase?.regularRows || 1,
            times: repeatPhase?.times || 1,
            amountMode: repeatPhase?.amountMode || 'times',
            targetStitches: repeatPhase?.targetStitches,
            intervalType: repeatPhase?.intervalType || 'rows'
        };

        setCompletedPhases(prev => [...prev, newPhase]);

        // Clear the form
        setPhases(prev => prev.map(phase =>
            phase.type === 'repeat'
                ? { type: 'repeat', regularRows: construction === 'flat' ? 2 : 1, amountMode: 'times', times: 5, targetStitches: null }
                : phase
        ));
    };

    // Delete completed phase
    const handleDeletePhase = (phaseId) => {
        setCompletedPhases(prev => prev.filter(phase => phase.id !== phaseId));
    };

    const FrequencyTimingSelector = () => {

        // Phase builder interface for shaping actions
        return (
            <div className="card">
                <h4 className="section-header-secondary">Build Sequence</h4>
                <div className="space-y-4">
                    <div className="bg-yarn-50 border-2 border-wool-200 rounded-xl p-4">
                        <div className="space-y-2">
                            <div className="text-sm font-medium text-wool-600 text-left">
                                <span className="font-bold">Phase 1: </span>
                                {(() => {
                                    if (!instructionData?.actions) return "No instruction data";
                                    const basePattern = wizard?.wizardData?.stitchPattern?.pattern || 'pattern';
                                    const dummyTiming = { frequency: 1, times: 1, amountMode: 'times' };
                                    const instruction = generateMarkerInstructionPreview(
                                        instructionData.actions,
                                        dummyTiming,
                                        markerArray,
                                        construction,
                                        basePattern
                                    );

                                    // Calculate stitch change for Phase 1
                                    const stitchChange = markerArrayUtils.calculateStitchChangePerIteration(instructionData.actions);
                                    const endingStitches = currentStitches + stitchChange;

                                    return `${instruction.replace(/\s*\([+\-]?\d+\s*sts?\)\s*$/i, '')} (${currentStitches} → ${endingStitches} sts)`;
                                })()}
                            </div>

                            {completedPhases.map((phase, index) => {
                                // Calculate running stitch total up to this phase
                                const stitchChangePerIteration = markerArrayUtils.calculateStitchChangePerIteration(instructionData.actions);

                                // Start with Phase 1 ending stitches
                                let runningStitches = currentStitches + stitchChangePerIteration;

                                // Add stitch changes from all previous completed phases
                                for (let i = 0; i < index; i++) {
                                    runningStitches += (stitchChangePerIteration * completedPhases[i].times);
                                }

                                // This phase's ending stitches
                                const phaseEndingStitches = runningStitches + (stitchChangePerIteration * phase.times);

                                return (
                                    <div key={phase.id} className="text-sm text-wool-600 text-left flex items-center justify-between">
                                        <span>
                                            <span className="font-bold">Phase {index + 2}:</span> Repeat every {phase.intervalType === 'distance' ? `${phase.regularRows} ${project?.defaultUnits || 'inches'}` : `${phase.regularRows + 1} ${construction === 'round' ? 'rounds' : 'rows'}`} {phase.times} times ({phaseEndingStitches} sts)
                                        </span>
                                        <button
                                            onClick={() => handleDeletePhase(phase.id)}
                                            className="p-1 text-red-500 hover:bg-red-100 rounded transition-colors ml-2"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* ALWAYS VISIBLE: Define Timing Phase */}
                    <div className="bg-yarn-50 border-2 border-wool-200 rounded-xl p-4">
                        <h4 className="section-header-secondary">Define Timing Phase</h4>
                        <div className="space-y-4">
                            <div>
                                <label className="form-label">Repeat every</label>
                                <SelectionGrid
                                    options={[
                                        { value: 'rows', label: construction === 'round' ? 'Rounds' : 'Rows' },
                                        { value: 'distance', label: 'Distance' }
                                    ]}
                                    selected={phases.find(p => p.type === 'repeat')?.intervalType || 'rows'}
                                    onSelect={(value) => {
                                        setPhases(prev => prev.map(phase =>
                                            phase.type === 'repeat' ? { ...phase, intervalType: value } : phase
                                        ));
                                    }}
                                    columns={2}
                                />
                                <div className="flex items-center gap-2 mt-3">
                                    <IncrementInput
                                        value={phases.find(p => p.type === 'repeat')?.regularRows || (construction === 'flat' ? 2 : 1)}
                                        onChange={(value) => {
                                            const validValue = construction === 'flat' ? Math.max(2, Math.ceil(value / 2) * 2) : Math.max(1, value);
                                            setPhases(prev => prev.map(phase =>
                                                phase.type === 'repeat' ? { ...phase, regularRows: validValue } : phase
                                            ));
                                        }}
                                        min={construction === 'flat' ? 2 : 1}
                                        step={construction === 'flat' ? 2 : 1}
                                        max={999}
                                        size="sm"
                                    />
                                    <span className="text-sm text-wool-600">
                                        {phases.find(p => p.type === 'repeat')?.intervalType === 'distance'
                                            ? (project?.defaultUnits || 'inches')
                                            : (construction === 'round' ? 'rounds' : 'rows')
                                        }
                                    </span>
                                </div>
                                {construction === 'flat' && (
                                    <p className="text-xs text-wool-500 mt-1">
                                        Must be even number for flat knitting to avoid shaping on wrong side
                                    </p>
                                )}
                            </div>
                            <div>
                                {(() => {
                                    // Check if there's net stitch change to show toggle
                                    const stitchChangePerIteration = instructionData?.actions ?
                                        markerArrayUtils.calculateStitchChangePerIteration(instructionData.actions) : 0;
                                    const hasNetStitchChange = stitchChangePerIteration !== 0;
                                    const currentPhase = phases.find(p => p.type === 'repeat');

                                    if (!hasNetStitchChange) {
                                        // Simple times input when no net stitch change
                                        return (
                                            <>
                                                <label className="form-label">Number of Times</label>
                                                <IncrementInput
                                                    value={currentPhase?.times || 1}
                                                    onChange={(value) => {
                                                        setPhases(prev => prev.map(phase =>
                                                            phase.type === 'repeat' ? { ...phase, times: Math.max(1, value) } : phase
                                                        ));
                                                    }}
                                                    unit="times"
                                                    min={1}
                                                    max={1000}
                                                    size="sm"
                                                />
                                            </>
                                        );
                                    }

                                    // Show toggle when there is net stitch change
                                    return (
                                        <>
                                            <label className="form-label">Repeat Method</label>
                                            <SelectionGrid
                                                options={[
                                                    { value: 'times', label: 'Fixed Times' },
                                                    { value: 'target', label: 'To Target Stitches' }
                                                ]}
                                                selected={currentPhase?.amountMode || 'times'}
                                                onSelect={(value) => {
                                                    setPhases(prev => prev.map(phase =>
                                                        phase.type === 'repeat' ? { ...phase, amountMode: value } : phase
                                                    ));
                                                }}
                                                columns={2}
                                            />
                                            <div className="mt-4">
                                                {currentPhase?.amountMode === 'target' ? (
                                                    <IncrementInput
                                                        value={currentPhase?.targetStitches || (() => {
                                                            // Calculate where this phase starts (ending stitches from previous phase)
                                                            let phaseStartStitches = currentStitches + stitchChangePerIteration; // Phase 1 ending
                                                            completedPhases.forEach(completedPhase => {
                                                                phaseStartStitches += (stitchChangePerIteration * completedPhase.times);
                                                            });
                                                            return phaseStartStitches;
                                                        })()}
                                                        onChange={(value) => {
                                                            // Calculate where this phase should start (after all completed phases)
                                                            let phaseStartStitches = currentStitches + stitchChangePerIteration; // Phase 1 ending
                                                            completedPhases.forEach(completedPhase => {
                                                                phaseStartStitches += (stitchChangePerIteration * completedPhase.times);
                                                            });

                                                            const requiredTimes = Math.max(1, Math.abs((value - phaseStartStitches) / stitchChangePerIteration));

                                                            setPhases(prev => prev.map(phase =>
                                                                phase.type === 'repeat' ? {
                                                                    ...phase,
                                                                    targetStitches: value,
                                                                    times: requiredTimes
                                                                } : phase
                                                            ));
                                                        }}
                                                        unit="stitches"
                                                        min={(() => {
                                                            let phaseStartStitches = currentStitches + stitchChangePerIteration;
                                                            completedPhases.forEach(completedPhase => {
                                                                phaseStartStitches += (stitchChangePerIteration * completedPhase.times);
                                                            });
                                                            return stitchChangePerIteration > 0 ? phaseStartStitches + Math.abs(stitchChangePerIteration) : 1;
                                                        })()}
                                                        max={(() => {
                                                            let phaseStartStitches = currentStitches + stitchChangePerIteration;
                                                            completedPhases.forEach(completedPhase => {
                                                                phaseStartStitches += (stitchChangePerIteration * completedPhase.times);
                                                            });
                                                            return stitchChangePerIteration > 0 ? 999 : phaseStartStitches - Math.abs(stitchChangePerIteration);
                                                        })()}
                                                        step={Math.abs(stitchChangePerIteration)}
                                                        size="sm"
                                                    />
                                                ) : (
                                                    <IncrementInput
                                                        value={currentPhase?.times || 1}
                                                        onChange={(value) => {
                                                            setPhases(prev => prev.map(phase =>
                                                                phase.type === 'repeat' ? { ...phase, times: Math.max(1, value) } : phase
                                                            ));
                                                        }}
                                                        unit="times"
                                                        min={1}

                                                        max={markerArrayUtils.getMaxSafeIterations(
                                                            instructionData?.actions || [],
                                                            markerArray,
                                                            completedPhases
                                                        )}
                                                        size="sm"
                                                    />
                                                )}
                                            </div>
                                        </>
                                    );
                                })()}
                            </div>
                        </div>

                        <div className="pt-4 mt-4 border-t border-wool-200">
                            <button onClick={handleAddPhase} className="suggestion-bubble">+ Add Another Phase</button>
                        </div>

                        {/* Live Array Preview */}
                        {(() => {
                            const evolution = markerArrayUtils.calculateArrayEvolution(
                                instructionData,
                                markerArray,
                                completedPhases
                            );

                            const currentPhase = phases.find(p => p.type === 'repeat');
                            if (currentPhase && evolution.current) {
                                // Simulate what the array would look like after adding the current phase
                                // Calculate total times needed to match stitch context calculation
                                const totalTimes = 1 + completedPhases.reduce((sum, phase) => sum + phase.times, 0) + currentPhase.times;

                                const simulatedPhases = [{
                                    id: 'total_preview',
                                    times: totalTimes,
                                    regularRows: currentPhase.regularRows
                                }];

                                const previewEvolution = markerArrayUtils.calculateArrayEvolution(
                                    instructionData,
                                    markerArray,
                                    simulatedPhases
                                );

                                return (
                                    <div className="mt-4">
                                        <h5 className="text-xs font-medium text-wool-600 mb-2">Live Preview</h5>
                                        <MarkerArrayVisualization
                                            stitchArray={previewEvolution.current}
                                            construction={construction}
                                            markerColors={markerColors}
                                        />
                                    </div>
                                );
                            }
                            return null;
                        })()}
                    </div>

                    {/* ALWAYS VISIBLE: Finishing Rows */}
                    <div className="bg-yarn-50 border-2 border-wool-200 rounded-xl p-4">
                        <h4 className="section-header-secondary">Finishing Rows</h4>
                        <div className="space-y-4">
                            <div>
                                <label className="form-label">Work in {wizard?.wizardData?.stitchPattern?.pattern || 'pattern'} for</label>
                                <div className="flex items-center gap-2">
                                    <IncrementInput
                                        value={finishingRows || (construction === 'flat' ? 1 : 0)}
                                        onChange={(value) => {
                                            let validValue;
                                            if (construction === 'flat') {
                                                // For flat: minimum 1, must be odd
                                                validValue = Math.max(1, value % 2 === 0 ? value + 1 : value);
                                            } else {
                                                // For round: minimum 0, any value allowed
                                                validValue = Math.max(0, value);
                                            }
                                            setFinishingRows(validValue);
                                        }}
                                        min={construction === 'flat' ? 1 : 0}
                                        max={999}
                                        step={construction === 'flat' ? 2 : 1}
                                        size="sm"
                                    />
                                    <span className="text-sm text-wool-600">
                                        {finishingRows === 1 ? (construction === 'round' ? 'round' : 'row') : (construction === 'round' ? 'rounds' : 'rows')}
                                    </span>
                                </div>
                                {construction === 'flat' && (
                                    <p className="text-xs text-wool-500 mt-1">
                                        Must be odd number for flat knitting to end on right side
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div>
            <ShapingHeader
                onBack={handleBack}
                onGoToLanding={onGoToLanding}
                wizard={wizard}
                onCancel={onCancel}
            />

            <div className="p-6 space-y-6">
                <div>
                    <h2 className="content-header-primary">Set Frequency & Timing</h2>
                    <p className="content-subheader">
                        Configure how often these actions repeat
                    </p>
                </div>

                {/* Starting Array Visualization */}
                <div className="card">
                    <h4 className="section-header-secondary">Starting Sequence</h4>
                    <MarkerArrayVisualization
                        stitchArray={markerArray}
                        construction={construction}
                        markerColors={markerColors}
                    />
                </div>

                <FrequencyTimingSelector />

                {/* Show the instruction preview */}
                <div className="card-info">
                    <h4 className="section-header-secondary">Your Instruction</h4>
                    <div className="bg-white rounded-lg p-3 border border-lavender-200">
                        <div className="text-sm text-lavender-700 font-medium text-left whitespace-pre-line">
                            {generatePreview()}
                        </div>
                    </div>
                </div>

                {/* Stitch Context Display - moved after inputs for better context */}
                <div className="card-info">
                    <h4 className="section-header-secondary">Stitch Context</h4>
                    <div className="bg-white rounded-lg p-3 border border-lavender-200">
                        <div className="space-y-2 text-sm text-left">
                            <div className="flex justify-between">
                                <span className="text-lavender-700">Starting stitches:</span>
                                <span className="font-medium">{stitchContext.startingStitches}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-lavender-700">Ending stitches:</span>
                                <span className="font-medium">{stitchContext.endingStitches}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-lavender-700">Change per iteration:</span>
                                <span className="font-medium">
                                    {stitchContext.stitchChangePerIteration > 0 ? '+' : ''}{stitchContext.stitchChangePerIteration} sts
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-lavender-700">Total {getConstructionTerms(construction).rows}:</span>
                                <span className="font-medium">{stitchContext.totalRows}</span>
                            </div>
                        </div>
                        {stitchContext.errors.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-lavender-200">
                                <div className="text-red-600 text-sm">
                                    {stitchContext.errors.map((error, index) => (
                                        <div key={index}>{error}</div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex gap-3">
                    <button onClick={handleBack} className="btn-tertiary flex-1">
                        ← Back to Actions
                    </button>
                    <button
                        onClick={handleComplete}
                        className="btn-primary flex-1"
                    >
                        Complete Step
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MarkerTimingConfig;