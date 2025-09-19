import React, { useState } from 'react';
import ShapingHeader from './ShapingHeader';
import IncrementInput from '../../../../shared/components/IncrementInput';
import SegmentedControl from '../../../../shared/components/SegmentedControl';
import { generateMarkerInstructionPreview } from '../../../../shared/utils/markerInstructionUtils';
import { MarkerTimingCalculator } from '../../../../shared/utils/MarkerTimingCalculator';
import { getConstructionTerms } from '../../../../shared/utils/ConstructionTerminology';
import MarkerArrayVisualization from '../../../../shared/components/MarkerArrayVisualization';
import markerArrayUtils from '../../../../shared/utils/markerArrayUtils';

// const terms = getConstructionTerms(construction);

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
    onCancel
}) => {
    const [phases, setPhases] = useState([
        { type: 'initial' }, // Always present - the kickoff special row
        {
            type: 'repeat',
            regularRows: construction === 'flat' ? 2 : 1,
            amountMode: 'times',
            times: 5,
            targetStitches: null
        },
        { type: 'finish', regularRows: construction === 'flat' ? 2 : 1 }
    ]);

    const [completedPhases, setCompletedPhases] = useState([]);
    const [finishingRows, setFinishingRows] = useState(0);
    const [isFinishing, setIsFinishing] = useState(false);

    // Generate preview with completed phases
    const generatePreview = () => {
        if (!instructionData?.actions) return "No instruction data";

        const basePattern = wizard?.wizardData?.stitchPattern?.pattern || 'pattern';
        const terms = getConstructionTerms(construction);
        const lines = [];

        // First line: base instruction
        const dummyTiming = { frequency: 1, times: 1, amountMode: 'times' };
        const mainInstruction = generateMarkerInstructionPreview(
            instructionData.actions,
            dummyTiming,
            markerArray,
            construction,
            basePattern
        );
        // Calculate Phase 1 ending stitches
        const phase1StitchChange = MarkerTimingCalculator.calculateStitchChangePerIteration(instructionData.actions);
        const phase1EndingStitches = currentStitches + phase1StitchChange;
        lines.push(`${mainInstruction.replace(/\s*\([+\-]?\d+\s*sts?\)\s*$/i, '')} (${currentStitches} → ${phase1EndingStitches} sts)`);

        // Add completed timing phases
        let runningStitches = phase1EndingStitches;
        completedPhases.forEach(phase => {
            const cycleLength = phase.regularRows + 1;
            const repetitions = phase.times;
            const phaseStitchChange = phase1StitchChange * repetitions;

            runningStitches += phaseStitchChange;
            lines.push(`Repeat every ${cycleLength} ${terms.rows} ${repetitions} times (${runningStitches} sts)`);
        });

        return lines.join('\n');
    };

    const handleComplete = () => {
        // Convert phases to timing structure that parent expects
        const repeatPhase = phases.find(p => p.type === 'repeat');
        const finalInstructionData = {
            ...instructionData,
            timing: {
                frequency: (repeatPhase?.regularRows || 1) + 1, // total cycle length
                times: repeatPhase?.times || 1,
                amountMode: repeatPhase?.amountMode || 'times',
                targetStitches: repeatPhase?.targetStitches
            },
            phases,
            preview: generatePreview()
        };
        onComplete(finalInstructionData);
    };

    const handleBack = () => {
        // Convert phases to timing structure that parent expects
        const repeatPhase = phases.find(p => p.type === 'repeat');
        const dataWithTiming = {
            ...instructionData,
            timing: {
                frequency: (repeatPhase?.regularRows || 1) + 1, // total cycle length  
                times: repeatPhase?.times || 1,
                amountMode: repeatPhase?.amountMode || 'times',
                targetStitches: repeatPhase?.targetStitches
            },
            phases
        };
        onComplete(dataWithTiming);
        onBack();
    };

    // Simple stitch context - will be properly calculated later
    const getStitchContext = () => {
        const startingStitches = currentStitches || 0;

        // Calculate stitch change per iteration
        const stitchChangePerIteration = instructionData?.actions ?
            MarkerTimingCalculator.calculateStitchChangePerIteration(instructionData.actions) : 0;

        // Calculate ending stitches: starting + phase1 change + all completed phase changes
        const phase1Change = stitchChangePerIteration;
        const completedPhasesChange = completedPhases.reduce((total, phase) =>
            total + (stitchChangePerIteration * phase.times), 0);
        const endingStitches = startingStitches + phase1Change + completedPhasesChange;

        // Calculate total rows: 1 (phase1) + all completed phase rows + finishing rows
        const totalRows = 1 + completedPhases.reduce((total, phase) =>
            total + ((phase.regularRows + 1) * phase.times), 0) + finishingRows;

        return {
            startingStitches,
            endingStitches,
            stitchChangePerIteration,
            totalRows,
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
            targetStitches: repeatPhase?.targetStitches
        };

        setCompletedPhases(prev => [...prev, newPhase]);

        // Clear the form
        setPhases(prev => prev.map(phase =>
            phase.type === 'repeat'
                ? { type: 'repeat', regularRows: construction === 'flat' ? 2 : 1, amountMode: 'times', times: 5, targetStitches: null }
                : phase
        ));
    };

    const handleFinishSequence = () => {
        setIsFinishing(true);
    };

    // Add this function after handleFinishSequence
    const handleDeletePhase = (phaseId) => {
        setCompletedPhases(prev => prev.filter(phase => phase.id !== phaseId));
    };

    const FrequencyTimingSelector = () => {
        // Check if this is a continue/plain rows case
        const isContinueAction = instructionData?.actions?.length === 1 &&
            instructionData.actions[0].actionType === 'continue';

        if (isContinueAction) {
            // Simplified interface for plain rows
            return (
                <div className="card">
                    <h4 className="section-header-secondary">Number of {construction === 'round' ? 'Rounds' : 'Rows'}</h4>
                    <div className="bg-yarn-50 border-2 border-wool-200 rounded-xl p-4">
                        <IncrementInput
                            value={phases.find(p => p.type === 'repeat')?.times || 1}
                            onChange={(value) => {
                                setPhases(prev => prev.map(phase =>
                                    phase.type === 'repeat' ? { ...phase, times: Math.max(value, 1) } : phase
                                ));
                            }}
                            unit={construction === 'round' ? 'rounds' : 'rows'}
                            min={1}
                            max={50}
                            size="sm"
                        />
                    </div>
                </div>
            );
        }

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
                                    const stitchChange = MarkerTimingCalculator.calculateStitchChangePerIteration(instructionData.actions);
                                    const endingStitches = currentStitches + stitchChange;

                                    return `${instruction.replace(/\s*\([+\-]?\d+\s*sts?\)\s*$/i, '')} (${currentStitches} → ${endingStitches} sts)`;
                                })()}
                            </div>

                            {completedPhases.map((phase, index) => {
                                // Calculate running stitch total up to this phase
                                const stitchChangePerIteration = MarkerTimingCalculator.calculateStitchChangePerIteration(instructionData.actions);

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
                                            <span className="font-bold">Phase {index + 2}:</span> Repeat every {phase.regularRows + 1} {construction === 'round' ? 'rounds' : 'rows'} {phase.times} times ({phaseEndingStitches} sts)
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

                    {isFinishing ? (
                        <div className="bg-yarn-50 border-2 border-wool-200 rounded-xl p-4">
                            <div className="text-sm font-medium text-wool-700 mb-4">
                                Finishing Rows
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="form-label">Work in {wizard?.wizardData?.stitchPattern?.pattern || 'pattern'} for</label> <div className="flex items-center gap-2">
                                        <IncrementInput
                                            value={finishingRows}
                                            onChange={setFinishingRows}
                                            min={0}
                                            max={999}
                                            size="sm"
                                        />
                                        <span className="text-sm text-wool-600">
                                            {finishingRows === 1 ? (construction === 'round' ? 'round' : 'row') : (construction === 'round' ? 'rounds' : 'rows')}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-yarn-50 border-2 border-wool-200 rounded-xl p-4">
                            <div className="text-sm font-medium text-wool-700 mb-4">
                                Define Timing Phase
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="form-label">Repeat every</label>
                                    <div className="flex items-center gap-2">
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
                                        <span className="text-sm text-wool-600">{construction === 'round' ? 'rounds' : 'rows'}</span>
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
                                            MarkerTimingCalculator.calculateStitchChangePerIteration(instructionData.actions) : 0;
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
                                                <SegmentedControl
                                                    options={[
                                                        { value: 'times', label: 'Fixed Times' },
                                                        { value: 'target', label: 'To Target Stitches' }
                                                    ]}
                                                    value={currentPhase?.amountMode || 'times'}
                                                    onChange={(value) => {
                                                        setPhases(prev => prev.map(phase =>
                                                            phase.type === 'repeat' ? { ...phase, amountMode: value } : phase
                                                        ));
                                                    }}
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
                                                            max={(() => {
                                                                if (stitchChangePerIteration >= 0) return 999; // No limit for increases

                                                                // Calculate max times for decreases to prevent negative stitches
                                                                let phaseStartStitches = currentStitches + stitchChangePerIteration;
                                                                completedPhases.forEach(completedPhase => {
                                                                    phaseStartStitches += (stitchChangePerIteration * completedPhase.times);
                                                                });

                                                                return Math.max(1, Math.floor(phaseStartStitches / Math.abs(stitchChangePerIteration)));
                                                            })()}
                                                            size="sm"
                                                        />
                                                    )}
                                                </div>
                                            </>
                                        );
                                    })()}
                                </div>
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
                                    const simulatedPhases = [...completedPhases, {
                                        id: 'preview',
                                        times: currentPhase.times,
                                        regularRows: currentPhase.regularRows
                                    }];

                                    console.log('Live preview debug:', {
                                        currentPhase,
                                        completedPhases,
                                        simulatedPhases,
                                        markerArray,
                                        instructionData
                                    });

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

                            <div className="flex gap-3 mt-6">
                                <button onClick={handleAddPhase} className="btn-secondary flex-1">
                                    Add Another Phase
                                </button>
                                <button onClick={handleFinishSequence} className="btn-primary flex-1">
                                    Finish Sequence
                                </button>
                            </div>
                        </div>
                    )}
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
                        <p className="text-sm text-lavender-700 font-medium text-left">
                            {generatePreview()}
                        </p>
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
                        disabled={!isFinishing}
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