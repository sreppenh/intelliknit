// src/features/steps/components/shaping-wizard/ModalBasedPhaseCreator.jsx
import React, { useState, useMemo } from 'react';
import IncrementInput from '../../../../shared/components/IncrementInput';
import SegmentedControl from '../../../../shared/components/SegmentedControl';
import ShapingHeader from './ShapingHeader';
import MarkerArrayVisualization from '../../../../shared/components/MarkerArrayVisualization';
import IntelliKnitLogger from '../../../../shared/utils/ConsoleLogging';
import { getConstructionTerms } from '../../../../shared/utils/ConstructionTerminology';
import StandardModal from '../../../../shared/components/modals/StandardModal';

const ModalBasedPhaseCreator = ({
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
    // ===== MAIN STATE =====
    const [actions, setActions] = useState([]);
    const [showActionModal, setShowActionModal] = useState(false);
    const [editingActionIndex, setEditingActionIndex] = useState(null);

    // ===== MODAL STATE =====
    const [modalAction, setModalAction] = useState({
        targets: {
            markers: [],
            edges: [],
            bor: false
        },
        actionType: 'increase',
        specificAction: 'm1l',
        position: 'before',
        distance: 1,
        repeatMethod: 'times',
        frequency: 2,
        times: 10,
        targetStitches: null
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
        const { targets, actionType, specificAction, position, distance, repeatMethod, frequency, times, targetStitches, bindOffAmount } = action;

        // Build target list
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
        const bindOffText = actionType === 'bind_off' && bindOffAmount ? ` ${bindOffAmount} stitches` : '';

        let timingText = '';
        if (repeatMethod === 'times') {
            timingText = ` every ${frequency === 1 ? terms.row : frequency === 2 ? `other ${terms.row}` : `${frequency} ${terms.rows}`} ${times} times`;
        } else if (repeatMethod === 'target' && targetStitches) {
            timingText = ` every ${frequency === 1 ? terms.row : frequency === 2 ? `other ${terms.row}` : `${frequency} ${terms.rows}`} until ${targetStitches} stitches remain`;
        }

        return `${actionText}${bindOffText}${distanceText}${positionText} ${targetText}${timingText}`;
    };

    // ===== MODAL FUNCTIONS =====
    const openActionModal = (actionIndex = null) => {
        if (actionIndex !== null) {
            // Editing existing action
            setEditingActionIndex(actionIndex);
            setModalAction({ ...actions[actionIndex] });
        } else {
            // Creating new action
            setEditingActionIndex(null);
            setModalAction({
                targets: {
                    markers: [],
                    edges: [],
                    bor: false
                },
                actionType: 'increase',
                specificAction: 'm1l',
                position: 'before',
                distance: 1,
                repeatMethod: 'times',
                frequency: 2,
                times: 10,
                targetStitches: null,
                bindOffAmount: 1
            });
        }
        setShowActionModal(true);
    };

    const closeActionModal = () => {
        setShowActionModal(false);
        setEditingActionIndex(null);
    };

    const saveAction = () => {
        if (editingActionIndex !== null) {
            // Update existing action
            const newActions = [...actions];
            newActions[editingActionIndex] = { ...modalAction };
            setActions(newActions);
        } else {
            // Add new action
            setActions([...actions, { ...modalAction }]);
        }
        closeActionModal();
    };

    const removeAction = (index) => {
        setActions(actions.filter((_, i) => i !== index));
    };

    // ===== MODAL TARGET SELECTION =====
    const toggleMarkerTarget = (marker) => {
        setModalAction(prev => ({
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
        setModalAction(prev => ({
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
        setModalAction(prev => ({
            ...prev,
            targets: {
                ...prev.targets,
                bor: !prev.targets.bor
            }
        }));
    };

    // ===== MODAL UPDATE =====
    const updateModalAction = (field, value) => {
        setModalAction(prev => {
            const newAction = { ...prev, [field]: value };

            // Smart defaults when changing action type
            if (field === 'actionType') {
                const specificTypes = getSpecificActionTypes(value);
                if (specificTypes.length > 0) {
                    newAction.specificAction = specificTypes[0].value;
                }

                // Set appropriate position defaults
                if (value === 'increase') {
                    newAction.position = 'before';
                } else if (value === 'decrease') {
                    newAction.position = 'before';
                } else if (value === 'bind_off') {
                    newAction.position = 'at';
                }
            }

            return newAction;
        });
    };

    // ===== VALIDATION =====
    const isModalValid = useMemo(() => {
        const hasTargets = modalAction.targets.markers.length > 0 ||
            modalAction.targets.edges.length > 0 ||
            modalAction.targets.bor;

        const hasValidTiming = modalAction.frequency > 0 &&
            (modalAction.repeatMethod === 'times' ? modalAction.times > 0 : modalAction.targetStitches > 0);

        const hasValidBindOff = modalAction.actionType !== 'bind_off' || modalAction.bindOffAmount > 0;

        return hasTargets && hasValidTiming && hasValidBindOff;
    }, [modalAction]);

    const isMainValid = useMemo(() => {
        return actions.length > 0;
    }, [actions]);

    // ===== PHASE CREATION =====
    const handleCreatePhase = () => {
        const shapingPhase = {
            type: 'shaping',
            actions: actions.map(action => ({
                targetType: 'mixed', // Custom type for multiple target types
                targets: action.targets,
                actionType: action.actionType,
                specificAction: action.specificAction,
                position: action.position,
                distance: action.distance,
                repeatMethod: action.repeatMethod,
                frequency: action.frequency,
                times: action.times,
                targetStitches: action.targetStitches,
                bindOffAmount: action.bindOffAmount
            }))
        };

        const sequence = {
            id: Date.now().toString(),
            name: 'Marker Shaping Phase',
            phases: [shapingPhase]
        };

        IntelliKnitLogger.success('Marker shaping phase created', sequence);
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

    // ===== MAIN RENDER =====
    return (
        <div>
            <ShapingHeader
                onBack={onBack}
                onGoToLanding={onGoToLanding}
                wizard={wizard}
                onCancel={onCancel}
            />

            <div className="p-6 space-y-6">
                {/* Current State & Context */}
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

                {/* Actions List */}
                <div className="card">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-sage-800">Shaping Actions</h3>
                        <button
                            onClick={() => openActionModal()}
                            className="btn-primary btn-sm"
                        >
                            + Add Action
                        </button>
                    </div>

                    {actions.length === 0 ? (
                        <div className="text-center py-8 text-wool-500">
                            <p className="text-sm">No actions defined yet</p>
                            <p className="text-xs mt-1">Click "Add Action" to get started</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {actions.map((action, index) => (
                                <div key={index} className="p-4 bg-yarn-50 rounded-lg border border-yarn-200">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="text-sm font-medium text-yarn-800 mb-1">
                                                Action {index + 1}
                                            </div>
                                            <div className="text-sm text-yarn-600">
                                                {getActionDescription(action)}
                                            </div>
                                        </div>
                                        <div className="flex gap-2 ml-4">
                                            <button
                                                onClick={() => openActionModal(index)}
                                                className="text-sage-600 hover:text-sage-700 text-sm"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => removeAction(index)}
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

                {/* Actions */}
                <div className="flex gap-3">
                    <button onClick={onBack} className="btn-tertiary flex-1">
                        ← Back
                    </button>
                    <button
                        onClick={handleCreatePhase}
                        disabled={!isMainValid}
                        className="btn-primary flex-1"
                    >
                        Create Phase
                    </button>
                </div>
            </div>

            {/* Action Configuration Modal */}
            <StandardModal
                isOpen={showActionModal}
                onClose={closeActionModal}
                title={editingActionIndex !== null ? 'Edit Action' : 'Add Action'}
                size="lg"
            >
                <div className="space-y-6">
                    {/* Target Selection */}
                    <div>
                        <label className="form-label">Select Targets</label>

                        {/* Markers */}
                        {availableMarkers.length > 0 && (
                            <div className="mb-4">
                                <div className="text-sm font-medium text-wool-700 mb-2">Markers</div>
                                <div className="flex flex-wrap gap-2">
                                    {availableMarkers.map(marker => (
                                        <Bubble
                                            key={marker}
                                            active={modalAction.targets.markers.includes(marker)}
                                            onClick={() => toggleMarkerTarget(marker)}
                                        >
                                            {marker}
                                        </Bubble>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Edges (flat only) */}
                        {hasEdges && (
                            <div className="mb-4">
                                <div className="text-sm font-medium text-wool-700 mb-2">Edges</div>
                                <div className="flex gap-2">
                                    <Bubble
                                        active={modalAction.targets.edges.includes('beginning')}
                                        onClick={() => toggleEdgeTarget('beginning')}
                                    >
                                        Beginning
                                    </Bubble>
                                    <Bubble
                                        active={modalAction.targets.edges.includes('end')}
                                        onClick={() => toggleEdgeTarget('end')}
                                    >
                                        End
                                    </Bubble>
                                </div>
                            </div>
                        )}

                        {/* BOR (round only) */}
                        {hasBOR && (
                            <div className="mb-4">
                                <div className="text-sm font-medium text-wool-700 mb-2">Special</div>
                                <Bubble
                                    active={modalAction.targets.bor}
                                    onClick={toggleBORTarget}
                                >
                                    Beginning of Round
                                </Bubble>
                            </div>
                        )}
                    </div>

                    {/* Action Configuration */}
                    <div>
                        <SegmentedControl
                            label="Action Type"
                            value={modalAction.actionType}
                            onChange={(value) => updateModalAction('actionType', value)}
                            options={[
                                { value: 'increase', label: 'Increase' },
                                { value: 'decrease', label: 'Decrease' },
                                { value: 'bind_off', label: 'Bind Off' }
                            ]}
                        />
                    </div>

                    {/* Specific Action */}
                    {getSpecificActionTypes(modalAction.actionType).length > 0 && (
                        <div>
                            <label className="form-label">Specific Technique</label>
                            <div className="flex flex-wrap gap-2">
                                {getSpecificActionTypes(modalAction.actionType).map(actionType => (
                                    <Bubble
                                        key={actionType.value}
                                        active={modalAction.specificAction === actionType.value}
                                        onClick={() => updateModalAction('specificAction', actionType.value)}
                                    >
                                        {actionType.label}
                                    </Bubble>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Position (not for bind-off) */}
                    {modalAction.actionType !== 'bind_off' && (
                        <div>
                            <SegmentedControl
                                label="Position"
                                value={modalAction.position}
                                onChange={(value) => updateModalAction('position', value)}
                                options={[
                                    { value: 'before', label: 'Before' },
                                    { value: 'after', label: 'After' },
                                    { value: 'at', label: 'At' }
                                ]}
                            />
                        </div>
                    )}

                    {/* Distance (advanced) */}
                    {modalAction.actionType !== 'bind_off' && modalAction.distance > 1 && (
                        <div>
                            <IncrementInput
                                label="Distance"
                                value={modalAction.distance}
                                onChange={(value) => updateModalAction('distance', value)}
                                min={0}
                                max={5}
                                unit="stitches away"
                            />
                        </div>
                    )}

                    {/* Bind Off Amount */}
                    {modalAction.actionType === 'bind_off' && (
                        <div>
                            <IncrementInput
                                label="Bind Off Amount"
                                value={modalAction.bindOffAmount}
                                onChange={(value) => updateModalAction('bindOffAmount', value)}
                                min={1}
                                max={50}
                                unit="stitches"
                            />
                        </div>
                    )}

                    {/* Timing */}
                    <div className="space-y-4">
                        <div>
                            <IncrementInput
                                label={`Frequency (Every N ${terms.Rows})`}
                                value={modalAction.frequency}
                                onChange={(value) => updateModalAction('frequency', value)}
                                min={1}
                                max={10}
                                unit={terms.rows}
                            />
                        </div>

                        <div>
                            <SegmentedControl
                                label="Repeat Method"
                                value={modalAction.repeatMethod}
                                onChange={(value) => updateModalAction('repeatMethod', value)}
                                options={[
                                    { value: 'times', label: 'Fixed Times' },
                                    { value: 'target', label: 'Until Target' }
                                ]}
                            />
                        </div>

                        {modalAction.repeatMethod === 'times' ? (
                            <div>
                                <IncrementInput
                                    label="Times"
                                    value={modalAction.times}
                                    onChange={(value) => updateModalAction('times', value)}
                                    min={1}
                                    max={50}
                                    unit="repetitions"
                                />
                            </div>
                        ) : (
                            <div>
                                <IncrementInput
                                    label="Target Stitches"
                                    value={modalAction.targetStitches || currentStitches}
                                    onChange={(value) => updateModalAction('targetStitches', value)}
                                    min={1}
                                    max={currentStitches}
                                    unit="stitches remaining"
                                />
                            </div>
                        )}
                    </div>

                    {/* Preview */}
                    <div className="p-4 bg-sage-50 rounded-lg border border-sage-200">
                        <div className="text-sm font-medium text-sage-700 mb-1">Preview</div>
                        <div className="text-sm text-sage-600">
                            {getActionDescription(modalAction)}
                        </div>
                    </div>

                    {/* Modal Actions */}
                    <div className="flex gap-3 pt-4 border-t border-wool-200">
                        <button onClick={closeActionModal} className="btn-tertiary flex-1">
                            Cancel
                        </button>
                        <button
                            onClick={saveAction}
                            disabled={!isModalValid}
                            className="btn-primary flex-1"
                        >
                            {editingActionIndex !== null ? 'Update Action' : 'Add Action'}
                        </button>
                    </div>
                </div>
            </StandardModal>
        </div>
    );
};

export default ModalBasedPhaseCreator;