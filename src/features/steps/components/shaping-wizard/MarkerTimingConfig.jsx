import React, { useState } from 'react';
import ShapingHeader from './ShapingHeader';
import IncrementInput from '../../../../shared/components/IncrementInput';
import SegmentedControl from '../../../../shared/components/SegmentedControl';
import { generateMarkerInstructionPreview } from '../../../../shared/utils/markerInstructionUtils';

const MarkerTimingConfig = ({
    instructionData,
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
        frequency: 2,
        times: 10,
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

    const FrequencyTimingSelector = () => (
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
                                    min={0}
                                    size="sm"
                                />
                            ) : (
                                <IncrementInput
                                    value={timing.times}
                                    onChange={(value) => setTiming(prev => ({ ...prev, times: Math.max(value, 1) }))}
                                    unit="times"
                                    min={1}
                                    max={50}
                                    size="sm"
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div>
            <ShapingHeader
                onBack={onBack}
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

                <div className="flex gap-3">
                    <button onClick={onBack} className="btn-tertiary flex-1">
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