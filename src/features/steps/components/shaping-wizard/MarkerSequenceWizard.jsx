// src/features/steps/components/shaping-wizard/MarkerSequenceWizard.jsx
import React, { useState, useMemo } from 'react';
import IncrementInput from '../../../../shared/components/IncrementInput';
import SegmentedControl from '../../../../shared/components/SegmentedControl';
import ShapingHeader from './ShapingHeader';
import IntelliKnitLogger from '../../../../shared/utils/ConsoleLogging';

const MarkerSequenceWizard = ({
    markerArray = [],
    construction = 'flat',
    onComplete,
    onCancel,
    onBack,
    wizard,
    onGoToLanding,
    editingSequence = null
}) => {
    // ===== WIZARD STATE =====
    const [currentStep, setCurrentStep] = useState(1);
    const [sequencePhases, setSequencePhases] = useState([]);
    const [currentPhase, setCurrentPhase] = useState({});

    // ===== AVAILABLE MARKERS & EDGES =====
    const availableMarkers = useMemo(() => {
        return markerArray.filter(item => typeof item === 'string' && item !== 'BOR');
    }, [markerArray]);

    const hasEdges = construction === 'flat';

    // ===== BUBBLE COMPONENT =====
    const Bubble = ({ children, active = false, onClick, disabled = false, className = '' }) => (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            className={`px-3 py-2 rounded-full text-sm font-medium transition-colors border-2 ${active
                    ? 'bg-sage-500 text-white border-sage-500'
                    : 'bg-white text-wool-700 border-wool-300 hover:border-sage-300'
                } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${className}`}
        >
            {children}
        </button>
    );

    // ===== STEP 1: WHAT ARE YOU DOING? =====
    const renderStep1 = () => (
        <div className="stack-lg">
            <div>
                <h3 className="text-lg font-semibold text-wool-800 mb-2">What are you doing?</h3>
                <p className="text-sm text-wool-600">Choose the type of phase to add</p>
            </div>

            <SegmentedControl
                value={currentPhase.type}
                onChange={(value) => setCurrentPhase(prev => ({ ...prev, type: value }))}
                options={[
                    { value: 'plain', label: 'Plain Rows' },
                    { value: 'shaping', label: 'Shaping' }
                ]}
            />

            <div className="flex gap-3 pt-4">
                <button onClick={onBack} className="btn-tertiary flex-1">
                    ← Back
                </button>
                <button
                    onClick={() => setCurrentStep(2)}
                    disabled={!currentPhase.type}
                    className="btn-primary flex-1"
                >
                    Continue →
                </button>
            </div>
        </div>
    );

    // ===== STEP 2A: PLAIN ROWS =====
    const renderStep2Plain = () => (
        <div className="stack-lg">
            <div>
                <h3 className="text-lg font-semibold text-wool-800 mb-2">Plain Rows</h3>
                <p className="text-sm text-wool-600">How many plain rows to work?</p>
            </div>

            <div className="card-info">
                <IncrementInput
                    label="Rows"
                    value={currentPhase.rows || 1}
                    onChange={(value) => setCurrentPhase(prev => ({ ...prev, rows: value }))}
                    min={1}
                    max={20}
                    construction={construction}
                />
            </div>

            <div className="flex gap-3 pt-4">
                <button onClick={() => setCurrentStep(1)} className="btn-tertiary flex-1">
                    ← Back
                </button>
                <button
                    onClick={addPhaseAndContinue}
                    className="btn-primary flex-1"
                >
                    Add Plain Rows
                </button>
            </div>
        </div>
    );

    // ===== STEP 2B: SHAPING - WHAT'S INVOLVED? =====
    const renderStep2Shaping = () => (
        <div className="stack-lg">
            <div>
                <h3 className="text-lg font-semibold text-wool-800 mb-2">What's involved?</h3>
                <p className="text-sm text-wool-600">Select markers and edges to shape</p>
            </div>

            {/* Marker Selection */}
            {availableMarkers.length > 0 && (
                <div className="card-info">
                    <h4 className="text-sm font-semibold text-wool-700 mb-3">Markers</h4>
                    <div className="flex flex-wrap gap-2">
                        {availableMarkers.map(marker => (
                            <Bubble
                                key={marker}
                                active={currentPhase.selectedMarkers?.includes(marker)}
                                onClick={() => toggleMarkerSelection(marker)}
                            >
                                {marker}
                            </Bubble>
                        ))}
                    </div>
                </div>
            )}

            {/* Edge Selection (flat only) */}
            {hasEdges && (
                <div className="card-info">
                    <h4 className="text-sm font-semibold text-wool-700 mb-3">Edges</h4>
                    <div className="flex gap-2">
                        <Bubble
                            active={currentPhase.selectedEdges?.includes('beginning')}
                            onClick={() => toggleEdgeSelection('beginning')}
                        >
                            Beginning
                        </Bubble>
                        <Bubble
                            active={currentPhase.selectedEdges?.includes('end')}
                            onClick={() => toggleEdgeSelection('end')}
                        >
                            End
                        </Bubble>
                    </div>
                </div>
            )}

            <div className="flex gap-3 pt-4">
                <button onClick={() => setCurrentStep(1)} className="btn-tertiary flex-1">
                    ← Back
                </button>
                <button
                    onClick={() => setCurrentStep(3)}
                    disabled={!hasAnySelection()}
                    className="btn-primary flex-1"
                >
                    Continue →
                </button>
            </div>
        </div>
    );

    // ===== STEP 3: WHAT'S HAPPENING? =====
    const renderStep3 = () => {
        const selectedMarkers = currentPhase.selectedMarkers || [];
        const selectedEdges = currentPhase.selectedEdges || [];

        return (
            <div className="stack-lg">
                <div>
                    <h3 className="text-lg font-semibold text-wool-800 mb-2">What's happening?</h3>
                    <p className="text-sm text-wool-600">Configure actions for each location</p>
                </div>

                {/* Marker Actions */}
                {selectedMarkers.length > 0 && (
                    <div className="card-info">
                        <h4 className="text-sm font-semibold text-wool-700 mb-3">
                            Markers: {selectedMarkers.join(', ')}
                        </h4>

                        <div className="stack-md">
                            <SegmentedControl
                                label="Action"
                                value={currentPhase.markerAction}
                                onChange={(value) => setCurrentPhase(prev => ({ ...prev, markerAction: value }))}
                                options={[
                                    { value: 'increase', label: 'Increase' },
                                    { value: 'decrease', label: 'Decrease' }
                                ]}
                            />

                            <SegmentedControl
                                label="Position"
                                value={currentPhase.markerPosition}
                                onChange={(value) => setCurrentPhase(prev => ({ ...prev, markerPosition: value }))}
                                options={[
                                    { value: 'before', label: 'Before' },
                                    { value: 'after', label: 'After' }
                                ]}
                            />

                            <IncrementInput
                                label="Distance"
                                value={currentPhase.markerDistance || 1}
                                onChange={(value) => setCurrentPhase(prev => ({ ...prev, markerDistance: value }))}
                                min={0}
                                max={3}
                                unit="stitches"
                            />

                            {/* Action Type Bubbles */}
                            <div>
                                <label className="text-sm font-semibold text-wool-700 mb-2 block">Action Type</label>
                                <div className="flex flex-wrap gap-2">
                                    {getActionTypes(currentPhase.markerAction).map(action => (
                                        <Bubble
                                            key={action.value}
                                            active={currentPhase.markerActionType === action.value}
                                            onClick={() => setCurrentPhase(prev => ({ ...prev, markerActionType: action.value }))}
                                        >
                                            {action.label}
                                        </Bubble>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Edge Actions */}
                {selectedEdges.length > 0 && (
                    <div className="card-info">
                        <h4 className="text-sm font-semibold text-wool-700 mb-3">
                            Edges: {selectedEdges.join(', ')}
                        </h4>

                        <div className="stack-md">
                            <SegmentedControl
                                label="Action"
                                value={currentPhase.edgeAction}
                                onChange={(value) => setCurrentPhase(prev => ({ ...prev, edgeAction: value }))}
                                options={[
                                    { value: 'increase', label: 'Increase' },
                                    { value: 'decrease', label: 'Decrease' },
                                    { value: 'bind_off', label: 'Bind Off' }
                                ]}
                            />

                            <IncrementInput
                                label="Distance"
                                value={currentPhase.edgeDistance || 0}
                                onChange={(value) => setCurrentPhase(prev => ({ ...prev, edgeDistance: value }))}
                                min={0}
                                max={3}
                                unit="stitches"
                            />
                        </div>
                    </div>
                )}

                <div className="flex gap-3 pt-4">
                    <button onClick={() => setCurrentStep(2)} className="btn-tertiary flex-1">
                        ← Back
                    </button>
                    <button
                        onClick={() => setCurrentStep(4)}
                        disabled={!hasValidActions()}
                        className="btn-primary flex-1"
                    >
                        Continue →
                    </button>
                </div>
            </div>
        );
    };

    // ===== STEP 4: HOW OFTEN? =====
    const renderStep4 = () => (
        <div className="stack-lg">
            <div>
                <h3 className="text-lg font-semibold text-wool-800 mb-2">How often?</h3>
                <p className="text-sm text-wool-600">Configure timing and repetition</p>
            </div>

            <div className="card-info stack-md">
                <IncrementInput
                    label="Amount"
                    value={currentPhase.amount || 1}
                    onChange={(value) => setCurrentPhase(prev => ({ ...prev, amount: value }))}
                    min={1}
                    max={5}
                    unit="stitches"
                />

                <IncrementInput
                    label="Times"
                    value={currentPhase.times || 1}
                    onChange={(value) => setCurrentPhase(prev => ({ ...prev, times: value }))}
                    min={1}
                    max={50}
                    unit="repetitions"
                />

                <SegmentedControl
                    label="Frequency"
                    value={currentPhase.frequency?.toString()}
                    onChange={(value) => setCurrentPhase(prev => ({ ...prev, frequency: parseInt(value) }))}
                    options={[
                        { value: '1', label: 'Every row' },
                        { value: '2', label: 'Every other' },
                        { value: '4', label: 'Every 4th' }
                    ]}
                />
            </div>

            <div className="flex gap-3 pt-4">
                <button onClick={() => setCurrentStep(3)} className="btn-tertiary flex-1">
                    ← Back
                </button>
                <button
                    onClick={addPhaseAndContinue}
                    className="btn-primary flex-1"
                >
                    Add Shaping
                </button>
            </div>
        </div>
    );

    // ===== STEP 5: WHAT'S NEXT? =====
    const renderStep5 = () => (
        <div className="stack-lg">
            <div>
                <h3 className="text-lg font-semibold text-wool-800 mb-2">What's next?</h3>
                <p className="text-sm text-wool-600">Continue building your sequence</p>
            </div>

            {/* Show current sequence summary */}
            <div className="card-info">
                <h4 className="text-sm font-semibold text-wool-700 mb-2">Current Sequence</h4>
                {sequencePhases.map((phase, index) => (
                    <div key={index} className="text-sm text-wool-600 py-1">
                        {index + 1}. {getPhaseDescription(phase)}
                    </div>
                ))}
            </div>

            <SegmentedControl
                value={currentPhase.nextAction}
                onChange={(value) => setCurrentPhase(prev => ({ ...prev, nextAction: value }))}
                options={[
                    { value: 'plain', label: 'Plain Rows' },
                    { value: 'shaping', label: 'More Shaping' },
                    { value: 'done', label: 'Done' }
                ]}
            />

            <div className="flex gap-3 pt-4">
                <button onClick={() => setCurrentStep(1)} className="btn-tertiary flex-1">
                    ← Start Over
                </button>
                <button
                    onClick={handleNextAction}
                    disabled={!currentPhase.nextAction}
                    className="btn-primary flex-1"
                >
                    {currentPhase.nextAction === 'done' ? 'Complete Sequence' : 'Continue →'}
                </button>
            </div>
        </div>
    );

    // ===== HELPER FUNCTIONS =====
    const toggleMarkerSelection = (marker) => {
        setCurrentPhase(prev => {
            const selected = prev.selectedMarkers || [];
            const newSelected = selected.includes(marker)
                ? selected.filter(m => m !== marker)
                : [...selected, marker];
            return { ...prev, selectedMarkers: newSelected };
        });
    };

    const toggleEdgeSelection = (edge) => {
        setCurrentPhase(prev => {
            const selected = prev.selectedEdges || [];
            const newSelected = selected.includes(edge)
                ? selected.filter(e => e !== edge)
                : [...selected, edge];
            return { ...prev, selectedEdges: newSelected };
        });
    };

    const hasAnySelection = () => {
        const hasMarkers = currentPhase.selectedMarkers?.length > 0;
        const hasEdges = currentPhase.selectedEdges?.length > 0;
        return hasMarkers || hasEdges;
    };

    const hasValidActions = () => {
        const hasMarkers = currentPhase.selectedMarkers?.length > 0;
        const hasEdges = currentPhase.selectedEdges?.length > 0;

        if (hasMarkers && (!currentPhase.markerAction || !currentPhase.markerPosition)) return false;
        if (hasEdges && !currentPhase.edgeAction) return false;

        return true;
    };

    const getActionTypes = (actionType) => {
        if (actionType === 'decrease') {
            return [
                { value: 'ssk', label: 'SSK' },
                { value: 'k2tog', label: 'K2tog' },
                { value: 'cdd', label: 'CDD' }
            ];
        } else if (actionType === 'increase') {
            return [
                { value: 'm1l', label: 'M1L' },
                { value: 'm1r', label: 'M1R' },
                { value: 'kfb', label: 'KFB' }
            ];
        }
        return [];
    };

    const getPhaseDescription = (phase) => {
        if (phase.type === 'plain') {
            return `Work ${phase.rows} plain rows`;
        }
        // TODO: Build proper description for shaping phases
        return `Shaping phase`;
    };

    const addPhaseAndContinue = () => {
        const newPhase = { ...currentPhase };
        setSequencePhases(prev => [...prev, newPhase]);
        setCurrentPhase({ nextAction: null });
        setCurrentStep(5);

        IntelliKnitLogger.debug('Phase added to sequence', newPhase);
    };

    const handleNextAction = () => {
        if (currentPhase.nextAction === 'done') {
            // Complete the sequence
            const finalSequence = {
                id: Date.now().toString(),
                name: 'Custom Sequence',
                phases: sequencePhases
            };

            IntelliKnitLogger.success('Sequence completed', finalSequence);
            onComplete(finalSequence);
        } else {
            // Continue to next phase
            setCurrentPhase({ type: currentPhase.nextAction });
            setCurrentStep(currentPhase.nextAction === 'plain' ? 2 : 2);
        }
    };

    // ===== RENDER CURRENT STEP =====
    const renderCurrentStep = () => {
        if (currentStep === 1) return renderStep1();
        if (currentStep === 2 && currentPhase.type === 'plain') return renderStep2Plain();
        if (currentStep === 2 && currentPhase.type === 'shaping') return renderStep2Shaping();
        if (currentStep === 3) return renderStep3();
        if (currentStep === 4) return renderStep4();
        if (currentStep === 5) return renderStep5();
        return null;
    };

    // ===== MAIN RENDER =====
    return (
        <div>
            <ShapingHeader
                onBack={onBack}
                onGoToLanding={onGoToLanding}
                wizard={wizard}
                onCancel={onCancel}
            />

            <div className="p-6">
                {renderCurrentStep()}
            </div>
        </div>
    );
};

export default MarkerSequenceWizard;