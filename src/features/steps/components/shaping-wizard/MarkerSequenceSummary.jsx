// src/features/steps/components/shaping-wizard/MarkerSequenceSummary.jsx
import React from 'react';
import ShapingHeader from './ShapingHeader';
import MarkerArrayVisualization from '../../../../shared/components/MarkerArrayVisualization';
import IntelliKnitLogger from '../../../../shared/utils/ConsoleLogging';
import { getConstructionTerms } from '../../../../shared/utils/ConstructionTerminology';

const MarkerSequenceSummary = ({
    markerArray = [],
    markerColors = {},
    sequences = [],
    construction = 'flat',
    onAddSequence,
    onEditSequence,
    onDeleteSequence,
    onComplete,
    onBack,
    wizard,
    onGoToLanding,
    onCancel,
    calculation = null
}) => {

    // ===== SEQUENCE DESCRIPTION HELPER =====
    const getSequenceDescription = (sequence) => {
        if (!sequence.phases || sequence.phases.length === 0) {
            return 'Empty sequence';
        }

        const terms = getConstructionTerms(construction);

        const descriptions = sequence.phases.map((phase, index) => {
            if (phase.type === 'plain') {
                return `Work ${phase.rows} plain ${phase.rows === 1 ? terms.row : terms.rows}`;
            }

            // Build detailed shaping description from actions array
            const actionDescriptions = (phase.actions || []).map(action => {
                let target = '';
                if (action.targetType === 'markers' && action.markers?.length > 0) {
                    target = action.markers.join(', ');
                } else if (action.targetType === 'edges' && action.edges?.length > 0) {
                    target = action.edges.join(' & ');
                } else if (action.targetType === 'bor') {
                    target = 'BOR';
                }

                const actionText = action.specificAction || action.actionType;
                const position = action.position ? ` ${action.position}` : '';
                const distance = action.distance > 0 ? ` ${action.distance}st` : '';

                return `${actionText}${distance}${position} ${target}`;
            });

            let description = actionDescriptions.join(', ');

            // Add timing if applicable
            if (phase.times > 1 && phase.frequency) {
                const freqText = phase.frequency === 1 ? terms.everyRow :
                    phase.frequency === 2 ? terms.everyOtherRow :
                        terms.everyNthRow(phase.frequency);
                description += ` ${freqText} ${phase.times} times`;

                // Calculate stitch change
                const stitchChange = calculatePhaseStitchChange(phase);
                if (stitchChange !== 0) {
                    description += ` (${stitchChange > 0 ? '+' : ''}${stitchChange} stitches)`;
                }
            }

            return description;
        });

        return descriptions.join(' → ');
    };

    // ===== CALCULATE STITCH CHANGE FOR A PHASE =====
    const calculatePhaseStitchChange = (phase) => {
        if (phase.type === 'plain') return 0;

        let totalChange = 0;
        const amount = phase.amount || 1;
        const times = phase.times || 1;

        // Calculate from actions array
        (phase.actions || []).forEach(action => {
            let actionCount = 0;

            if (action.targetType === 'markers' && action.markers?.length > 0) {
                actionCount = action.markers.length;
            } else if (action.targetType === 'edges' && action.edges?.length > 0) {
                actionCount = action.edges.length;
            } else if (action.targetType === 'bor') {
                actionCount = 1;
            }

            if (action.actionType === 'increase') {
                totalChange += amount * actionCount * times;
            } else if (action.actionType === 'decrease' || action.actionType === 'bind_off') {
                totalChange -= amount * actionCount * times;
            }
        });

        return totalChange;
    };

    // ===== VALIDATION =====
    const canComplete = sequences.length > 0 && calculation && !calculation.error;

    // ===== RENDER =====
    return (
        <div>
            <ShapingHeader
                onBack={onBack}
                onGoToLanding={onGoToLanding}
                wizard={wizard}
                onCancel={onCancel}
            />

            <div className="p-6 stack-lg">
                <div>
                    <h2 className="content-header-primary">Sequence Configuration</h2>
                    <p className="content-subheader">
                        Configure marker-based shaping sequences
                    </p>
                </div>

                {/* Show marker array */}
                <div className="card-info">
                    <h4 className="text-sm font-semibold text-sage-700 mb-3">Your Markers</h4>
                    <MarkerArrayVisualization
                        stitchArray={markerArray}
                        construction={construction}
                        showActions={false}
                        markerColors={markerColors}
                    />
                </div>

                {/* Sequences List */}
                <div className="stack-md">
                    <div className="flex items-center justify-between">
                        <h4 className="text-sm font-semibold text-wool-700">Sequences</h4>
                        {sequences.length > 0 && (
                            <span className="text-xs text-wool-500">
                                {sequences.length} sequence{sequences.length === 1 ? '' : 's'}
                            </span>
                        )}
                    </div>

                    {/* Existing Sequences */}
                    {sequences.length > 0 && (
                        <div className="stack-sm">
                            {sequences.map((sequence, index) => (
                                <div
                                    key={sequence.id || index}
                                    className="p-4 border border-wool-200 rounded-lg bg-white"
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="text-sm font-medium text-wool-800 mb-1">
                                                Sequence {index + 1}
                                            </div>
                                            <div className="text-sm text-wool-600">
                                                {getSequenceDescription(sequence)}
                                            </div>
                                        </div>

                                        <div className="flex gap-1 ml-3">
                                            <button
                                                onClick={() => onEditSequence(sequence.id || index)}
                                                className="p-2 text-wool-500 hover:bg-wool-200 rounded-lg transition-colors"
                                                title="Edit sequence"
                                            >
                                                ✏️
                                            </button>
                                            <button
                                                onClick={() => onDeleteSequence(sequence.id || index)}
                                                className="p-2 text-red-500 hover:bg-red-100 rounded-lg transition-colors"
                                                title="Delete sequence"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Add Sequence Button */}
                    <button
                        onClick={onAddSequence}
                        className="w-full p-4 border-2 border-dashed border-wool-300 rounded-xl transition-colors flex items-center justify-center gap-2 text-wool-500 hover:border-sage-400 hover:text-sage-600"
                    >
                        <span className="text-xl">➕</span>
                        Add Sequence
                    </button>

                    {/* Calculation Results */}
                    {calculation ? (
                        <div className="card-info">
                            <h4 className="text-sm font-semibold text-sage-700 mb-3">Preview</h4>

                            {calculation.error ? (
                                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
                                    <h4 className="text-sm font-semibold text-red-700 mb-2">⚠️ Error</h4>
                                    <div className="text-sm text-red-600">
                                        {calculation.error}
                                    </div>
                                </div>
                            ) : (
                                <div className="stack-sm">
                                    <div className="text-sm text-wool-600">
                                        <strong>Instruction:</strong> {calculation.instruction || 'Marker-based shaping'}
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <span className="text-wool-500">Starting:</span>
                                            <span className="font-medium ml-1">{calculation.startingStitches} stitches</span>
                                        </div>
                                        <div>
                                            <span className="text-wool-500">Ending:</span>
                                            <span className="font-medium ml-1">{calculation.endingStitches} stitches</span>
                                        </div>
                                        <div>
                                            <span className="text-wool-500">Total:</span>
                                            <span className="font-medium ml-1">{calculation.totalRows} {getConstructionTerms(construction).rows}</span>
                                        </div>
                                        <div>
                                            <span className="text-wool-500">Change:</span>
                                            <span className={`font-medium ml-1 ${calculation.netStitchChange > 0 ? 'text-green-600' :
                                                calculation.netStitchChange < 0 ? 'text-red-600' : 'text-wool-600'
                                                }`}>
                                                {calculation.netStitchChange > 0 ? '+' : ''}{calculation.netStitchChange}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : sequences.length === 0 ? (
                        <div className="card-info">
                            <div className="text-sm text-wool-600 text-center py-4">
                                Add a sequence to see the calculation preview
                            </div>
                        </div>
                    ) : null}
                </div>

                {/* Navigation */}
                <div className="flex gap-3">
                    <button onClick={onBack} className="btn-tertiary flex-1">
                        ← Back to Markers
                    </button>
                    <button
                        onClick={onComplete}
                        disabled={!canComplete}
                        className="btn-primary flex-1"
                    >
                        Complete Step
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MarkerSequenceSummary;