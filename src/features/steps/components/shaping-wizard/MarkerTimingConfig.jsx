import React, { useState } from 'react';
import ShapingHeader from './ShapingHeader';
import IncrementInput from '../../../../shared/components/IncrementInput';
import SegmentedControl from '../../../../shared/components/SegmentedControl';
import { generateMarkerInstructionPreview } from '../../../../shared/utils/markerInstructionUtils';
import { MarkerTimingCalculator } from '../../../../shared/utils/MarkerTimingCalculator';
import { getConstructionTerms } from '../../../../shared/utils/ConstructionTerminology';

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

    // Generate preview with phases - for now, show simple format
    const generatePreview = () => {
        if (!instructionData?.actions) return "No instruction data";

        const basePattern = wizard?.wizardData?.stitchPattern?.pattern || 'pattern';
        const terms = getConstructionTerms(construction);

        // For now, generate simple multi-line preview
        const lines = [];

        // First line: existing instruction format (use dummy timing for now)
        const dummyTiming = { frequency: 1, times: 1, amountMode: 'times' };
        const mainInstruction = generateMarkerInstructionPreview(
            instructionData.actions,
            dummyTiming,
            markerArray,
            construction,
            basePattern
        );
        lines.push(`${mainInstruction} (${currentStitches} stitches)`);

        // Add repeat phases
        const repeatPhases = phases.filter(p => p.type === 'repeat');
        let runningStitches = currentStitches;

        repeatPhases.forEach(phase => {
            const cycleLength = (phase.regularRows || 1) + 1; // regular rows + 1 special row
            const repetitions = phase.times || 1;

            // Simple stitch calculation (will be properly calculated later)
            runningStitches -= repetitions * 2; // Assume 2 stitch decrease per cycle for preview

            if (phase.amountMode === 'target') {
                lines.push(`Repeat every ${cycleLength} ${terms.rows} until ${phase.targetStitches} stitches remain (${runningStitches} stitches)`);
            } else {
                lines.push(`Repeat every ${cycleLength} ${terms.rows} ${repetitions} times (${runningStitches} stitches)`);
            }
        });

        // Add finish phase
        const finishPhase = phases.find(p => p.type === 'finish');
        if (finishPhase && finishPhase.regularRows > 0) {
            const finishRows = finishPhase.regularRows || 1;
            lines.push(`Work ${finishRows} ${finishRows === 1 ? terms.row : terms.rows} in ${basePattern} (${runningStitches} stitches)`);
        }

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
        return {
            startingStitches: currentStitches || 0,
            endingStitches: (currentStitches || 0) - 10, // Simple preview calculation
            errors: [],
            isValid: true
        };
    };

    const stitchContext = getStitchContext();

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
                        <div className="text-sm font-medium text-wool-700 text-left">
                            <span className="font-bold">Phase 1: </span>
                            {(() => {
                                if (!instructionData?.actions) return "No instruction data";
                                const basePattern = wizard?.wizardData?.stitchPattern?.pattern || 'pattern';
                                const dummyTiming = { frequency: 1, times: 1, amountMode: 'times' };
                                return generateMarkerInstructionPreview(
                                    instructionData.actions,
                                    dummyTiming,
                                    markerArray,
                                    construction,
                                    basePattern
                                );
                            })()}
                        </div>
                    </div>

                    <div className="bg-yarn-50 border-2 border-wool-200 rounded-xl p-4">
                        <div className="text-sm font-medium text-wool-700 mb-4">
                            Define Timing Phase
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="form-label">Repeat every</label>
                                <div className="flex items-center gap-2">
                                    <IncrementInput
                                        value={phases.find(p => p.type === 'repeat')?.regularRows || 1}
                                        onChange={(value) => {
                                            setPhases(prev => prev.map(phase =>
                                                phase.type === 'repeat' ? { ...phase, regularRows: Math.max(1, value) } : phase
                                            ));
                                        }}
                                        min={1}
                                        size="sm"
                                    />
                                    <span className="text-sm text-wool-600">{construction === 'round' ? 'rounds' : 'rows'}</span>
                                </div>
                            </div>
                            <div>
                                <label className="form-label">Number of Times</label>
                                <IncrementInput
                                    value={phases.find(p => p.type === 'repeat')?.times || 1}
                                    onChange={(value) => {
                                        setPhases(prev => prev.map(phase =>
                                            phase.type === 'repeat' ? { ...phase, times: Math.max(1, value) } : phase
                                        ));
                                    }}
                                    unit="times"
                                    min={1}
                                    max={20}
                                    size="sm"
                                />
                            </div>
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button className="btn-secondary flex-1">
                                Add Another Phase
                            </button>
                            <button className="btn-primary flex-1">
                                Finish Sequence
                            </button>
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
                    <button onClick={handleComplete} className="btn-primary flex-1">
                        Complete Step
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MarkerTimingConfig;