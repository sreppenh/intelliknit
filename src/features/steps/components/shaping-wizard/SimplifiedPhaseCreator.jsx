// src/features/steps/components/shaping-wizard/RowByRowMarkerPhaseCreator.jsx
import React, { useState, useMemo } from 'react';
import IncrementInput from '../../../../shared/components/IncrementInput';
import SegmentedControl from '../../../../shared/components/SegmentedControl';
import ShapingHeader from './ShapingHeader';
import MarkerArrayVisualization from '../../../../shared/components/MarkerArrayVisualization';
import IntelliKnitLogger from '../../../../shared/utils/ConsoleLogging';
import { getConstructionTerms } from '../../../../shared/utils/ConstructionTerminology';

const RowByRowMarkerPhaseCreator = ({
    markerArray = [],
    construction = 'flat',
    currentStitches = 0,
    onComplete,
    onCancel,
    onBack,
    wizard,
    onGoToLanding,
    editingSequence = null
}) => {
    // ===== PHASE STATE =====
    const [phase, setPhase] = useState({
        rounds: [], // Array of round definitions
        frequency: 2, // How often the sequence repeats
        repeatMethod: 'times',
        times: 10,
        targetStitches: currentStitches + 20
    });

    // ===== CURRENT ROUND BEING BUILT =====
    const [currentRound, setCurrentRound] = useState({
        actions: [], // Array of simultaneous actions
        type: 'actions' // 'actions' or 'pattern'
    });

    const [editingRoundIndex, setEditingRoundIndex] = useState(null);

    // ===== CURRENT ACTION BEING BUILT =====
    const [currentAction, setCurrentAction] = useState({
        targets: {
            markers: [],
            edges: [],
            bor: false
        },
        actionType: 'increase',
        specificAction: 'm1l',
        position: 'before',
        distance: 1,
        amount: 1
    });

    // ===== AVAILABLE TARGETS =====
    const availableMarkers = useMemo(() => {
        return markerArray.filter(item => typeof item === 'string' && item !== 'BOR');
    }, [markerArray]);

    const hasEdges = construction === 'flat';
    const hasBOR = construction === 'round';
    const terms = getConstructionTerms(construction);

    // ===== UTILITY FUNCTIONS =====
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
                { value: 'standard', label: 'Standard' }
            ];
        }
        return [];
    };

    // ===== ACTION DESCRIPTION =====
    const getActionDescription = (action) => {
        const { targets, actionType, specificAction, position, distance, amount } = action;

        const targetList = [];
        if (targets.markers.length > 0) {
            targetList.push(...targets.markers);
        }
        if (targets.edges.length > 0) {
            targetList.push(...targets.edges.map(e => e === 'beginning' ? 'Beginning' : 'End'));
        }
        if (targets.bor) {
            targetList.push('BOR');
        }

        const targetText = targetList.join(', ');
        const actionText = specificAction?.toUpperCase() || actionType;
        const positionText = position && actionType !== 'bind_off' ? ` ${position}` : '';
        const distanceText = distance > 0 && actionType !== 'bind_off' ? ` ${distance}st` : '';
        const amountText = actionType === 'bind_off' ? ` ${amount} stitches` :
            amount > 1 && actionType !== 'bind_off' ? ` ${amount} stitches` : '';

        return `${actionText}${amountText}${distanceText}${positionText} ${targetText}`;
    };

    // ===== ROUND DESCRIPTION =====
    const getRoundDescription = (round) => {
        if (round.type === 'pattern') {
            return 'In Pattern';
        }

        if (round.actions.length === 0) {
            return 'No actions defined';
        }

        return round.actions.map(getActionDescription).join('; ');
    };

    // ===== TARGET MANAGEMENT =====
    const toggleMarkerTarget = (marker) => {
        setCurrentAction(prev => ({
            ...prev,
            targets: {
                ...prev.targets,
                markers: prev.targets.markers.includes(marker)
                    ? prev.targets.markers.filter(m => m !== marker)
                    : [...prev.targets.markers, marker]
            }
        }));
    };

    const toggleEdgeTarget = (edge) => {
        setCurrentAction(prev => ({
            ...prev,
            targets: {
                ...prev.targets,
                edges: prev.targets.edges.includes(edge)
                    ? prev.targets.edges.filter(e => e !== edge)
                    : [...prev.targets.edges, edge]
            }
        }));
    };

    const toggleBORTarget = () => {
        setCurrentAction(prev => ({
            ...prev,
            targets: {
                ...prev.targets,
                bor: !prev.targets.bor
            }
        }));
    };

    const selectAllMarkers = () => {
        setCurrentAction(prev => ({
            ...prev,
            targets: {
                ...prev.targets,
                markers: [...availableMarkers]
            }
        }));
    };

    const clearAllTargets = () => {
        setCurrentAction(prev => ({
            ...prev,
            targets: {
                markers: [],
                edges: [],
                bor: false
            }
        }));
    };

    // ===== ACTION MANAGEMENT =====
    const updateCurrentAction = (field, value) => {
        setCurrentAction(prev => {
            const newAction = { ...prev, [field]: value };

            if (field === 'actionType') {
                const specificTypes = getSpecificActionTypes(value);
                if (specificTypes.length > 0) {
                    newAction.specificAction = specificTypes[0].value;
                }

                if (value === 'increase') {
                    newAction.position = 'before';
                    newAction.amount = 1;
                } else if (value === 'decrease') {
                    newAction.position = 'before';
                    newAction.amount = 1;
                } else if (value === 'bind_off') {
                    newAction.position = 'at';
                    newAction.amount = 1;
                }
            }

            return newAction;
        });
    };

    const addActionToCurrentRound = () => {
        setCurrentRound(prev => ({
            ...prev,
            actions: [...prev.actions, { ...currentAction }]
        }));

        // Reset action but keep some smart defaults
        setCurrentAction({
            targets: { markers: [], edges: [], bor: false },
            actionType: currentAction.actionType,
            specificAction: currentAction.specificAction,
            position: currentAction.position,
            distance: 1,
            amount: 1
        });
    };

    const removeActionFromCurrentRound = (index) => {
        setCurrentRound(prev => ({
            ...prev,
            actions: prev.actions.filter((_, i) => i !== index)
        }));
    };

    // ===== ROUND MANAGEMENT =====
    const saveCurrentRound = () => {
        if (editingRoundIndex !== null) {
            // Update existing round
            setPhase(prev => ({
                ...prev,
                rounds: prev.rounds.map((round, index) =>
                    index === editingRoundIndex ? { ...currentRound } : round
                )
            }));
        } else {
            // Add new round
            setPhase(prev => ({
                ...prev,
                rounds: [...prev.rounds, { ...currentRound }]
            }));
        }

        // Reset current round
        setCurrentRound({
            actions: [],
            type: 'actions'
        });
        setEditingRoundIndex(null);
    };

    const editRound = (index) => {
        setCurrentRound({ ...phase.rounds[index] });
        setEditingRoundIndex(index);
    };

    const deleteRound = (index) => {
        setPhase(prev => ({
            ...prev,
            rounds: prev.rounds.filter((_, i) => i !== index)
        }));
    };

    const addPatternRound = () => {
        setPhase(prev => ({
            ...prev,
            rounds: [...prev.rounds, { type: 'pattern', actions: [] }]
        }));
    };

    // ===== VALIDATION =====
    const isCurrentActionValid = useMemo(() => {
        const hasTargets = currentAction.targets.markers.length > 0 ||
            currentAction.targets.edges.length > 0 ||
            currentAction.targets.bor;

        const hasValidAmount = currentAction.actionType !== 'bind_off' || currentAction.amount > 0;

        return hasTargets && hasValidAmount;
    }, [currentAction]);

    const isCurrentRoundValid = useMemo(() => {
        return currentRound.type === 'pattern' || currentRound.actions.length > 0;
    }, [currentRound]);

    const isPhaseValid = useMemo(() => {
        const hasRounds = phase.rounds.length > 0;
        const hasValidTiming = phase.frequency > 0 &&
            (phase.repeatMethod === 'times' ? phase.times > 0 : phase.targetStitches > 0);

        return hasRounds && hasValidTiming;
    }, [phase]);

    // ===== PHASE PREVIEW =====
    const getPhasePreview = () => {
        if (phase.rounds.length === 0) return "No rounds defined yet";

        const roundDescriptions = phase.rounds.map((round, index) =>
            `${terms.Row} ${index + 1}: ${getRoundDescription(round)}`
        );

        const timingText = phase.repeatMethod === 'times'
            ? ` (Repeat ${phase.rounds.length} ${phase.rounds.length === 1 ? terms.row : terms.rows} ${phase.times} times)`
            : ` (Repeat ${phase.rounds.length} ${phase.rounds.length === 1 ? terms.row : terms.rows} until ${phase.targetStitches} stitches)`;

        return roundDescriptions.join('\n') + timingText;
    };

    // ===== PHASE CREATION =====
    const handleCreatePhase = () => {
        const markerPhase = {
            type: 'marker_row_by_row',
            rounds: phase.rounds,
            frequency: phase.frequency,
            repeatMethod: phase.repeatMethod,
            times: phase.times,
            targetStitches: phase.targetStitches
        };

        const sequence = {
            id: Date.now().toString(),
            name: 'Marker Phase',
            phases: [markerPhase]
        };

        IntelliKnitLogger.success('Row-by-row marker phase created', sequence);
        onComplete(sequence);
    };

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

    // ===== RENDER =====
    return (
        <div>
            <ShapingHeader
                onBack={onBack}
                onGoToLanding={onGoToLanding}
                wizard={wizard}
                onCancel={onCancel}
            />

            <div className="p-6 space-y-6">
                {/* Current State */}
                <div className="card bg-yarn-50 border-yarn-200">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-sage-800">Current State</h3>
                        <div className="text-sm font-medium text-sage-700">
                            {currentStitches} stitches
                        </div>
                    </div>

                    {markerArray.length > 0 && (
                        <MarkerArrayVisualization
                            stitchArray={markerArray}
                            construction={construction}
                            showActions={false}
                        />
                    )}
                </div>

                {/* Phase Rounds */}
                <div className="card">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-sage-800">Round Sequence</h3>
                        <div className="flex gap-2">
                            <button
                                onClick={addPatternRound}
                                className="btn-secondary btn-sm"
                            >
                                + Pattern Round
                            </button>
                        </div>
                    </div>

                    {phase.rounds.length > 0 && (
                        <div className="space-y-3 mb-4">
                            {phase.rounds.map((round, index) => (
                                <div key={index} className="p-3 bg-yarn-50 rounded-lg border border-yarn-200">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="text-sm font-medium text-yarn-800 mb-1">
                                                {terms.Row} {index + 1}
                                            </div>
                                            <div className="text-sm text-yarn-600">
                                                {getRoundDescription(round)}
                                            </div>
                                        </div>
                                        <div className="flex gap-2 ml-4">
                                            {round.type === 'actions' && (
                                                <button
                                                    onClick={() => editRound(index)}
                                                    className="text-sage-600 hover:text-sage-700 text-sm"
                                                >
                                                    Edit
                                                </button>
                                            )}
                                            <button
                                                onClick={() => deleteRound(index)}
                                                className="text-red-600 hover:text-red-700 text-sm"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Current Round Builder */}
                <div className="card">
                    <h3 className="text-lg font-semibold text-sage-800 mb-4">
                        {editingRoundIndex !== null ? `Edit ${terms.Row} ${editingRoundIndex + 1}` : `Add ${terms.Row} ${phase.rounds.length + 1}`}
                    </h3>

                    {/* Round Type */}
                    <div className="mb-4">
                        <SegmentedControl
                            label="Round Type"
                            value={currentRound.type}
                            onChange={(value) => setCurrentRound(prev => ({ ...prev, type: value, actions: [] }))}
                            options={[
                                { value: 'actions', label: 'Shaping Actions' },
                                { value: 'pattern', label: 'In Pattern' }
                            ]}
                        />
                    </div>

                    {/* Actions in Current Round */}
                    {currentRound.type === 'actions' && (
                        <>
                            {currentRound.actions.length > 0 && (
                                <div className="mb-4">
                                    <h4 className="text-base font-semibold text-yarn-800 mb-3">Actions in this Round</h4>
                                    <div className="space-y-2">
                                        {currentRound.actions.map((action, index) => (
                                            <div key={index} className="p-2 bg-sage-50 rounded border border-sage-200">
                                                <div className="flex items-center justify-between">
                                                    <div className="text-sm text-sage-700">
                                                        {getActionDescription(action)}
                                                    </div>
                                                    <button
                                                        onClick={() => removeActionFromCurrentRound(index)}
                                                        className="text-red-600 hover:text-red-700 text-sm"
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Add Action Interface */}
                            <div className="space-y-4 p-4 bg-wool-50 rounded-lg border border-wool-200">
                                <h4 className="text-base font-semibold text-sage-800">Add Action</h4>

                                {/* Target Selection */}
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="form-label">Select Targets</label>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={selectAllMarkers}
                                                className="text-xs text-sage-600 hover:text-sage-700"
                                            >
                                                All Markers
                                            </button>
                                            <button
                                                onClick={clearAllTargets}
                                                className="text-xs text-sage-600 hover:text-sage-700"
                                            >
                                                Clear
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        {availableMarkers.map(marker => (
                                            <Bubble
                                                key={marker}
                                                active={currentAction.targets.markers.includes(marker)}
                                                onClick={() => toggleMarkerTarget(marker)}
                                            >
                                                {marker}
                                            </Bubble>
                                        ))}

                                        {hasEdges && (
                                            <>
                                                <Bubble
                                                    active={currentAction.targets.edges.includes('beginning')}
                                                    onClick={() => toggleEdgeTarget('beginning')}
                                                >
                                                    Beginning
                                                </Bubble>
                                                <Bubble
                                                    active={currentAction.targets.edges.includes('end')}
                                                    onClick={() => toggleEdgeTarget('end')}
                                                >
                                                    End
                                                </Bubble>
                                            </>
                                        )}

                                        {hasBOR && (
                                            <Bubble
                                                active={currentAction.targets.bor}
                                                onClick={toggleBORTarget}
                                            >
                                                BOR
                                            </Bubble>
                                        )}
                                    </div>
                                </div>

                                {/* Action Configuration */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <SegmentedControl
                                            label="Action Type"
                                            value={currentAction.actionType}
                                            onChange={(value) => updateCurrentAction('actionType', value)}
                                            options={[
                                                { value: 'increase', label: 'Increase' },
                                                { value: 'decrease', label: 'Decrease' },
                                                { value: 'bind_off', label: 'Bind Off' }
                                            ]}
                                        />
                                    </div>

                                    {getSpecificActionTypes(currentAction.actionType).length > 0 && (
                                        <div>
                                            <label className="form-label">Technique</label>
                                            <div className="flex flex-wrap gap-2">
                                                {getSpecificActionTypes(currentAction.actionType).map(actionType => (
                                                    <Bubble
                                                        key={actionType.value}
                                                        active={currentAction.specificAction === actionType.value}
                                                        onClick={() => updateCurrentAction('specificAction', actionType.value)}
                                                    >
                                                        {actionType.label}
                                                    </Bubble>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Position & Amount */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {currentAction.actionType !== 'bind_off' && (
                                        <div>
                                            <SegmentedControl
                                                label="Position"
                                                value={currentAction.position}
                                                onChange={(value) => updateCurrentAction('position', value)}
                                                options={[
                                                    { value: 'before', label: 'Before' },
                                                    { value: 'after', label: 'After' },
                                                    { value: 'at', label: 'At' }
                                                ]}
                                            />
                                        </div>
                                    )}

                                    {(currentAction.actionType === 'bind_off' || currentAction.amount > 1) && (
                                        <div>
                                            <IncrementInput
                                                label={currentAction.actionType === 'bind_off' ? 'Stitches to Bind Off' : 'Stitches'}
                                                value={currentAction.amount}
                                                onChange={(value) => updateCurrentAction('amount', value)}
                                                min={1}
                                                max={20}
                                                unit="stitches"
                                            />
                                        </div>
                                    )}
                                </div>

                                <div className="flex justify-end">
                                    <button
                                        onClick={addActionToCurrentRound}
                                        disabled={!isCurrentActionValid}
                                        className="btn-secondary"
                                    >
                                        Add Action
                                    </button>
                                </div>
                            </div>
                        </>
                    )}

                    {/* Save Round */}
                    <div className="flex justify-end mt-4">
                        <button
                            onClick={saveCurrentRound}
                            disabled={!isCurrentRoundValid}
                            className="btn-primary"
                        >
                            {editingRoundIndex !== null ? 'Update Round' : 'Add Round'}
                        </button>
                    </div>
                </div>

                {/* Timing Configuration */}
                {phase.rounds.length > 0 && (
                    <div className="card">
                        <h3 className="text-lg font-semibold text-sage-800 mb-4">Timing & Repetition</h3>

                        <div className="space-y-4">
                            <div>
                                <SegmentedControl
                                    label="Repeat Method"
                                    value={phase.repeatMethod}
                                    onChange={(value) => setPhase(prev => ({ ...prev, repeatMethod: value }))}
                                    options={[
                                        { value: 'times', label: 'Fixed Times' },
                                        { value: 'target', label: 'Until Target' }
                                    ]}
                                />
                            </div>

                            {phase.repeatMethod === 'times' ? (
                                <div>
                                    <IncrementInput
                                        label="Times to Repeat"
                                        value={phase.times}
                                        onChange={(value) => setPhase(prev => ({ ...prev, times: value }))}
                                        min={1}
                                        max={50}
                                        unit="repetitions"
                                    />
                                </div>
                            ) : (
                                <div>
                                    <IncrementInput
                                        label="Target Stitches"
                                        value={phase.targetStitches}
                                        onChange={(value) => setPhase(prev => ({ ...prev, targetStitches: value }))}
                                        min={1}
                                        max={currentStitches * 3}
                                        unit="stitches"
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Phase Preview */}
                {phase.rounds.length > 0 && (
                    <div className="card bg-sage-50 border-sage-200">
                        <h4 className="text-base font-semibold text-sage-700 mb-2">Phase Preview</h4>
                        <pre className="text-sm text-sage-600 whitespace-pre-wrap">
                            {getPhasePreview()}
                        </pre>
                    </div>
                )}

                {/* Actions */}
                <div className="flex gap-3">
                    <button onClick={onBack} className="btn-tertiary flex-1">
                        ← Back
                    </button>
                    <button
                        onClick={handleCreatePhase}
                        disabled={!isPhaseValid}
                        className="btn-primary flex-1"
                    >
                        Create Phase
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RowByRowMarkerPhaseCreator;