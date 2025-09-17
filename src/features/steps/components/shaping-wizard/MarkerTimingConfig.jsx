import React, { useState } from 'react';
import ShapingHeader from './ShapingHeader';
import IncrementInput from '../../../../shared/components/IncrementInput';
import SegmentedControl from '../../../../shared/components/SegmentedControl';
import { generateMarkerInstructionPreview } from '../../../../shared/utils/markerInstructionUtils';
import { MarkerTimingCalculator } from '../../../../shared/utils/MarkerTimingCalculator';
import { getConstructionTerms } from '../../../../shared/utils/ConstructionTerminology';

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
    const [timing, setTiming] = useState({
        frequency: 1,
        times: 1,
        rows: 1,
        amountMode: 'times',
        targetStitches: null
    });

    // Generate preview with current timing
    const generatePreview = () => {
        if (!instructionData?.actions) return "No instruction data";

        const basePattern = wizard?.wizardData?.stitchPattern?.pattern || 'pattern';
        return generateMarkerInstructionPreview(
            instructionData.actions,
            timing,
            markerArray,
            construction,
            basePattern
        );
    };

    const handleComplete = () => {
        const finalInstructionData = {
            ...instructionData,
            timing,
            preview: generatePreview()
        };
        onComplete(finalInstructionData);
    };

    const handleBack = () => {
        // Preserve instructionData with timing structure expected by parent
        const dataWithTiming = {
            ...instructionData,
            timing: timing || { frequency: 1, times: 1, amountMode: 'times' }
        };
        onComplete(dataWithTiming);
        onBack();
    };

    // Calculate stitch context for validation and display
    const getStitchContext = () => {
        if (!instructionData?.actions || !currentStitches) {
            return {
                startingStitches: currentStitches || 0,
                endingStitches: currentStitches || 0,
                stitchChangePerIteration: 0,
                maxIterations: 1,
                totalRows: 1,
                errors: [],
                isValid: true
            };
        }

        return MarkerTimingCalculator.calculateMarkerStitchContext(
            instructionData.actions,
            currentStitches,
            timing
        );
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
                            value={timing.times}
                            onChange={(value) => setTiming(prev => ({ ...prev, times: Math.max(value, 1), frequency: 1 }))}
                            unit={construction === 'round' ? 'rounds' : 'rows'}
                            min={1}
                            max={50}
                            size="sm"
                        />
                    </div>
                </div>
            );
        }

        // Original full timing interface for shaping actions
        // Check if net stitch change is 0 (no shaping)
        const hasNetStitchChange = stitchContext.stitchChangePerIteration !== 0;

        // Simplified interface for net-zero stitch changes
        if (!hasNetStitchChange) {
            return (
                <div className="card">
                    <h4 className="section-header-secondary">Frequency & Times</h4>
                    <div className="space-y-6">
                        <div>
                            <label className="form-label">How often?</label>
                            <div className="bg-yarn-50 border-2 border-wool-200 rounded-xl p-4">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-wool-600">Every</span>
                                    <IncrementInput
                                        value={timing.frequency}
                                        onChange={(value) => setTiming(prev => ({ ...prev, frequency: Math.max(value, 1) }))}
                                        min={1}
                                        size="sm"
                                    />
                                    <span className="text-sm text-wool-600">{construction === 'round' ? 'rounds' : 'rows'}</span>
                                </div>
                            </div>
                        </div>
                        <div>
                            <label className="form-label">Number of Times</label>
                            <div className="bg-yarn-50 border-2 border-wool-200 rounded-xl p-4">
                                <IncrementInput
                                    value={timing.times}
                                    onChange={(value) => setTiming(prev => ({ ...prev, times: Math.max(value, 1) }))}
                                    unit="times"
                                    min={1}
                                    max={50}
                                    size="sm"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        // Original full timing interface for shaping actions
        return (
            <div className="card">
                <h4 className="section-header-secondary">Frequency & Times</h4>
                <div className="space-y-6">
                    <div>
                        <label className="form-label">How often?</label>
                        <div className="bg-yarn-50 border-2 border-wool-200 rounded-xl p-4">
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-wool-600">Every</span>
                                <IncrementInput
                                    value={timing.frequency}
                                    onChange={(value) => setTiming(prev => ({ ...prev, frequency: Math.max(value, 1) }))}
                                    min={1}
                                    size="sm"
                                />
                                <span className="text-sm text-wool-600">{construction === 'round' ? 'rounds' : 'rows'}</span>
                            </div>
                        </div>
                    </div>
                    <div>
                        <label className="form-label">Number of Times vs Target Stitches</label>
                        <div className="bg-yarn-50 border-2 border-wool-200 rounded-xl p-4">
                            <SegmentedControl
                                options={[
                                    { value: 'times', label: 'Number of Times' },
                                    { value: 'target', label: 'Target Stitches' }
                                ]}
                                value={timing.amountMode || 'times'}
                                onChange={(value) => setTiming(prev => ({ ...prev, amountMode: value }))}
                            />
                            <div className="mt-4">
                                {timing.amountMode === 'target' ? (
                                    <IncrementInput
                                        value={timing.targetStitches || 0}
                                        onChange={(value) => setTiming(prev => ({ ...prev, targetStitches: value }))}
                                        unit="stitches"
                                        min={stitchContext.stitchChangePerIteration < 0 ? 0 : currentStitches}
                                        max={stitchContext.stitchChangePerIteration < 0 ? currentStitches : currentStitches + 200}
                                        size="sm"
                                    />
                                ) : (
                                    <IncrementInput
                                        value={timing.times}
                                        onChange={(value) => setTiming(prev => ({ ...prev, times: Math.max(value, 1) }))}
                                        unit="times"
                                        min={1}
                                        max={stitchContext.stitchChangePerIteration < 0 ?
                                            Math.floor(currentStitches / Math.abs(stitchContext.stitchChangePerIteration)) :
                                            50
                                        }
                                        size="sm"
                                    />
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

                {/* Show the instruction preview */}
                <div className="card-info">
                    <h4 className="section-header-secondary">Your Instruction</h4>
                    <div className="bg-white rounded-lg p-3 border border-lavender-200">
                        <p className="text-sm text-lavender-700 font-medium text-left">
                            {generatePreview()}
                        </p>
                    </div>
                </div>

                <FrequencyTimingSelector />

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