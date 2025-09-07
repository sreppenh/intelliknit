// src/features/steps/components/shaping-wizard/MarkerSequenceWizard.jsx
import React, { useState, useMemo } from 'react';
import IncrementInput from '../../../../shared/components/IncrementInput';
import SegmentedControl from '../../../../shared/components/SegmentedControl';
import ShapingHeader from './ShapingHeader';
import IntelliKnitLogger from '../../../../shared/utils/ConsoleLogging';
import { getConstructionTerms } from '../../../../shared/utils/ConstructionTerminology';

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
    const hasBOR = construction === 'round';
    const terms = getConstructionTerms(construction);

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
                    { value: 'plain', label: `Plain ${terms.Rows}` },
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
                <h3 className="text-lg font-semibold text-wool-800 mb-2">Plain {terms.Rows}</h3>
                <p className="text-sm text-wool-600">How many plain {terms.rows} to work?</p>
            </div>

            <div className="card-info">
                <IncrementInput
                    label={terms.Rows}
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
                    Add Plain {terms.Rows}
                </button>
            </div>
        </div>
    );

    // ===== STEP 2B: SHAPING - CONFIGURE ACTIONS =====
    const renderStep2Shaping = () => {
        const actions = currentPhase.actions || [];

        return (
            <div className="stack-lg">
                <div>
                    <h3 className="text-lg font-semibold text-wool-800 mb-2">Configure Actions</h3>
                    <p className="text-sm text-wool-600">Set up all actions that happen simultaneously</p>
                </div>

                {/* Existing Actions */}
                {actions.map((action, index) => (
                    <div key={index} className="card-info">
                        <div className="flex items-center justify-between mb-3">
                            <h4 className="text-sm font-semibold text-wool-700">Action {index + 1}</h4>
                            <button
                                onClick={() => removeAction(index)}
                                className="text-red-500 hover:bg-red-100 p-1 rounded"
                            >
                                ✕
                            </button>
                        </div>

                        {renderActionConfiguration(action, index)}
                    </div>
                ))}

                {/* Add Action Button */}
                <button
                    onClick={addNewAction}
                    className="w-full p-4 border-2 border-dashed border-wool-300 rounded-xl transition-colors flex items-center justify-center gap-2 text-wool-500 hover:border-sage-400 hover:text-sage-600"
                >
                    <span className="text-xl">➕</span>
                    Add Action
                </button>

                {/* Timing Section (applies to all actions) */}
                {actions.length > 0 && (
                    <div className="card-info">
                        <h4 className="text-sm font-semibold text-wool-700 mb-3">Timing (applies to all actions)</h4>
                        <div className="stack-md">
                            <IncrementInput
                                label="Amount"
                                value={currentPhase.amount || 1}
                                onChange={(value) => setCurrentPhase(prev => ({ ...prev, amount: value }))}
                                min={1}
                                max={5}
                                unit="per action"
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
                                    { value: '1', label: `Every ${terms.row}` },
                                    { value: '2', label: 'Every other' },
                                    { value: '4', label: 'Every 4th' }
                                ]}
                            />
                        </div>
                    </div>
                )}

                <div className="flex gap-3 pt-4">
                    <button onClick={() => setCurrentStep(1)} className="btn-tertiary flex-1">
                        ← Back
                    </button>
                    <button
                        onClick={addPhaseAndContinue}
                        disabled={actions.length === 0 || !hasValidTiming()}
                        className="btn-primary flex-1"
                    >
                        Add Shaping
                    </button>
                </div>
            </div>
        );
    };

    // ===== RENDER ACTION CONFIGURATION =====
    const renderActionConfiguration = (action, actionIndex) => (
        <div className="stack-md">
            {/* Target Selection */}
            <div>
                <label className="text-sm font-semibold text-wool-700 mb-2 block">Target</label>
                <SegmentedControl
                    value={action.targetType}
                    onChange={(value) => updateAction(actionIndex, 'targetType', value)}
                    options={[
                        { value: 'markers', label: 'Markers' },
                        ...(hasEdges ? [{ value: 'edges', label: 'Edges' }] : []),
                        ...(hasBOR ? [{ value: 'bor', label: 'BOR' }] : [])
                    ]}
                />
            </div>

            {/* Marker Selection */}
            {action.targetType === 'markers' && (
                <div>
                    <label className="text-sm font-semibold text-wool-700 mb-2 block">Select Markers</label>
                    <div className="flex flex-wrap gap-2">
                        {availableMarkers.map(marker => (
                            <Bubble
                                key={marker}
                                active={action.markers?.includes(marker)}
                                onClick={() => toggleMarkerInAction(actionIndex, marker)}
                            >
                                {marker}
                            </Bubble>
                        ))}
                    </div>
                </div>
            )}

            {/* Edge Selection */}
            {action.targetType === 'edges' && hasEdges && (
                <div>
                    <label className="text-sm font-semibold text-wool-700 mb-2 block">Select Edges</label>
                    <div className="flex gap-2">
                        <Bubble
                            active={action.edges?.includes('beginning')}
                            onClick={() => toggleEdgeInAction(actionIndex, 'beginning')}
                        >
                            Beginning
                        </Bubble>
                        <Bubble
                            active={action.edges?.includes('end')}
                            onClick={() => toggleEdgeInAction(actionIndex, 'end')}
                        >
                            End
                        </Bubble>
                    </div>
                </div>
            )}

            {/* Action Type */}
            <div>
                <label className="text-sm font-semibold text-wool-700 mb-2 block">Action</label>
                <SegmentedControl
                    value={action.actionType}
                    onChange={(value) => updateAction(actionIndex, 'actionType', value)}
                    options={[
                        { value: 'increase', label: 'Increase' },
                        { value: 'decrease', label: 'Decrease' },
                        ...(action.targetType === 'edges' ? [{ value: 'bind_off', label: 'Bind Off' }] : [])
                    ]}
                />
            </div>

            {/* Position (for markers) */}
            {action.targetType === 'markers' && action.actionType && action.actionType !== 'bind_off' && (
                <div>
                    <label className="text-sm font-semibold text-wool-700 mb-2 block">Position</label>
                    <SegmentedControl
                        value={action.position}
                        onChange={(value) => updateAction(actionIndex, 'position', value)}
                        options={[
                            { value: 'before', label: 'Before' },
                            { value: 'after', label: 'After' }
                        ]}
                    />
                </div>
            )}

            {/* Distance */}
            <div>
                <label className="text-sm font-semibold text-wool-700 mb-2 block">Distance</label>
                <div className="flex gap-2">
                    {[0, 1, 2, 3].map(dist => (
                        <Bubble
                            key={dist}
                            active={action.distance === dist}
                            onClick={() => updateAction(actionIndex, 'distance', dist)}
                        >
                            {dist === 0 ? 'At' : `${dist} st`}
                        </Bubble>
                    ))}
                </div>
            </div>

            {/* Specific Action Type */}
            {action.actionType && (
                <div>
                    <label className="text-sm font-semibold text-wool-700 mb-2 block">Specific Action</label>
                    <div className="flex flex-wrap gap-2">
                        {getSpecificActionTypes(action.actionType).map(actionType => (
                            <Bubble
                                key={actionType.value}
                                active={action.specificAction === actionType.value}
                                onClick={() => updateAction(actionIndex, 'specificAction', actionType.value)}
                            >
                                {actionType.label}
                            </Bubble>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );

    // ===== STEP 3: WHAT'S NEXT? =====
    const renderStep3 = () => (
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
                    { value: 'plain', label: `Plain ${terms.Rows}` },
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

    // ===== ACTION MANAGEMENT FUNCTIONS =====
    const addNewAction = () => {
        const newAction = {
            targetType: 'markers',
            markers: [],
            edges: [],
            actionType: 'increase',
            position: 'before',
            distance: 1,
            specificAction: 'M1L'
        };

        setCurrentPhase(prev => ({
            ...prev,
            actions: [...(prev.actions || []), newAction]
        }));
    };

    const removeAction = (index) => {
        setCurrentPhase(prev => ({
            ...prev,
            actions: prev.actions.filter((_, i) => i !== index)
        }));
    };

    const updateAction = (actionIndex, field, value) => {
        setCurrentPhase(prev => ({
            ...prev,
            actions: prev.actions.map((action, index) =>
                index === actionIndex ? { ...action, [field]: value } : action
            )
        }));
    };

    const toggleMarkerInAction = (actionIndex, marker) => {
        setCurrentPhase(prev => ({
            ...prev,
            actions: prev.actions.map((action, index) => {
                if (index !== actionIndex) return action;

                const markers = action.markers || [];
                const newMarkers = markers.includes(marker)
                    ? markers.filter(m => m !== marker)
                    : [...markers, marker];

                return { ...action, markers: newMarkers };
            })
        }));
    };

    const toggleEdgeInAction = (actionIndex, edge) => {
        setCurrentPhase(prev => ({
            ...prev,
            actions: prev.actions.map((action, index) => {
                if (index !== actionIndex) return action;

                const edges = action.edges || [];
                const newEdges = edges.includes(edge)
                    ? edges.filter(e => e !== edge)
                    : [...edges, edge];

                return { ...action, edges: newEdges };
            })
        }));
    };

    // ===== HELPER FUNCTIONS =====
    const getSpecificActionTypes = (actionType) => {
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
        } else if (actionType === 'bind_off') {
            return [
                { value: 'standard', label: 'Standard' },
                { value: 'three_needle', label: '3-Needle' }
            ];
        }
        return [];
    };

    const hasValidTiming = () => {
        return currentPhase.amount && currentPhase.times && currentPhase.frequency;
    };

    const getPhaseDescription = (phase) => {
        if (phase.type === 'plain') {
            return `Work ${phase.rows} plain ${phase.rows === 1 ? terms.row : terms.rows}`;
        }

        // Build description for shaping phases with actions
        const actionDescriptions = (phase.actions || []).map(action => {
            const target = action.targetType === 'markers'
                ? action.markers?.join(', ')
                : action.edges?.join(' & ');
            const actionText = action.specificAction || action.actionType;
            const position = action.position ? ` ${action.position}` : '';
            const distance = action.distance > 0 ? ` ${action.distance}st` : '';

            return `${actionText}${distance}${position} ${target}`;
        });

        const timingText = phase.frequency && phase.times
            ? ` ${terms.everyNthRow(phase.frequency)} ${phase.times}×`
            : '';

        return actionDescriptions.join(', ') + timingText;
    };

    const addPhaseAndContinue = () => {
        const newPhase = { ...currentPhase };
        setSequencePhases(prev => [...prev, newPhase]);
        setCurrentPhase({ nextAction: null });
        setCurrentStep(3);

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