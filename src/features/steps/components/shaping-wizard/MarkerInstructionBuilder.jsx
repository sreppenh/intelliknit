// src/features/steps/components/shaping-wizard/MarkerInstructionBuilder.jsx
import React, { useState, useMemo } from 'react';
import SegmentedControl from '../../../../shared/components/SegmentedControl';
import IntelliKnitLogger from '../../../../shared/utils/ConsoleLogging';

// Action definitions from stitchCalculatorUtils.js
const ACTION_TYPES = {
    increase: [
        { value: 'M1L', label: 'M1L' },
        { value: 'M1R', label: 'M1R' },
        { value: 'KFB', label: 'KFB' }
    ],
    decrease: [
        { value: 'SSK', label: 'SSK' },
        { value: 'K2tog', label: 'K2tog' },
        { value: 'CDD', label: 'CDD' }
    ]
};

// Position definitions relative to markers
const POSITION_TYPES = [
    { value: 'before', label: 'Before', distance: 0 },
    { value: '1_before', label: '1 st before', distance: 1 },
    { value: '2_before', label: '2 st before', distance: 2 },
    { value: '3_before', label: '3 st before', distance: 3 },
    { value: 'after', label: 'After', distance: 0 },
    { value: '1_after', label: '1 st after', distance: 1 },
    { value: '2_after', label: '2 st after', distance: 2 },
    { value: '3_after', label: '3 st after', distance: 3 }
];

const MarkerInstructionBuilder = ({
    markerArray = [],
    construction = 'flat',
    onComplete,
    onCancel
}) => {
    // State for building instruction groups
    const [actionGroups, setActionGroups] = useState([]);
    const [currentGroup, setCurrentGroup] = useState({
        markers: [],
        edges: [],
        actions: []
    });
    const [currentAction, setCurrentAction] = useState({
        position: 'before',
        actionType: 'increase',
        specificAction: 'M1L'
    });

    // Available targets
    const availableMarkers = useMemo(() => {
        return markerArray.filter(item => typeof item === 'string' && item !== 'BOR');
    }, [markerArray]);

    const hasEdges = construction === 'flat';
    const hasBOR = construction === 'round' && markerArray.includes('BOR');

    // Bubble component for selections
    const Bubble = ({ children, active = false, onClick, disabled = false, small = false }) => (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            className={`${small ? 'px-2 py-1 text-xs' : 'px-3 py-2 text-sm'} rounded-full font-medium transition-colors border-2 ${active
                ? 'bg-sage-500 text-white border-sage-500'
                : 'bg-white text-wool-700 border-wool-300 hover:border-sage-300'
                } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
            {children}
        </button>
    );

    // Toggle marker selection
    const toggleMarker = (marker) => {
        setCurrentGroup(prev => ({
            ...prev,
            markers: prev.markers.includes(marker)
                ? prev.markers.filter(m => m !== marker)
                : [...prev.markers, marker]
        }));
    };

    // Toggle edge selection
    const toggleEdge = (edge) => {
        setCurrentGroup(prev => ({
            ...prev,
            edges: prev.edges.includes(edge)
                ? prev.edges.filter(e => e !== edge)
                : [...prev.edges, edge]
        }));
    };

    // Add action to current group
    const addActionToGroup = () => {
        setCurrentGroup(prev => ({
            ...prev,
            actions: [...prev.actions, { ...currentAction }]
        }));

        // Reset action but keep some smart defaults
        setCurrentAction(prev => ({
            position: prev.position,
            actionType: prev.actionType,
            specificAction: prev.specificAction
        }));
    };

    // Remove action from group
    const removeActionFromGroup = (index) => {
        setCurrentGroup(prev => ({
            ...prev,
            actions: prev.actions.filter((_, i) => i !== index)
        }));
    };

    // Save current group and start new one
    const saveGroup = () => {
        setActionGroups(prev => [...prev, { ...currentGroup }]);
        setCurrentGroup({
            markers: [],
            edges: [],
            actions: []
        });
        IntelliKnitLogger.debug('Action group saved', currentGroup);
    };

    // Remove a saved group
    const removeGroup = (index) => {
        setActionGroups(prev => prev.filter((_, i) => i !== index));
    };

    // Update current action
    const updateAction = (field, value) => {
        setCurrentAction(prev => {
            const newAction = { ...prev, [field]: value };

            // Auto-update specific action when action type changes
            if (field === 'actionType') {
                const availableActions = ACTION_TYPES[value] || [];
                if (availableActions.length > 0) {
                    newAction.specificAction = availableActions[0].value;
                }
            }

            return newAction;
        });
    };

    // Generate instruction preview
    const generateInstructionPreview = () => {
        if (actionGroups.length === 0) {
            return "No instruction defined yet";
        }

        const groupDescriptions = actionGroups.map(group => {
            const targets = [...group.markers, ...group.edges];
            const targetText = targets.length > 0 ? targets.join(', ') : 'No targets';

            const actionTexts = group.actions.map(action => {
                const position = POSITION_TYPES.find(p => p.value === action.position);
                const positionText = position ? position.label.toLowerCase() : action.position;
                return `${action.specificAction} ${positionText}`;
            });

            return `For ${targetText}: ${actionTexts.join(', ')}`;
        });

        return groupDescriptions.join('\n');
    };

    // Validation
    const canAddAction = currentAction.position && currentAction.actionType && currentAction.specificAction;
    const canSaveGroup = currentGroup.actions.length > 0 &&
        (currentGroup.markers.length > 0 || currentGroup.edges.length > 0);
    const canComplete = actionGroups.length > 0;

    // Get current targets for display
    const currentTargets = [...currentGroup.markers, ...currentGroup.edges];

    const handleComplete = () => {
        const instructionData = {
            actionGroups: actionGroups,
            preview: generateInstructionPreview()
        };

        IntelliKnitLogger.success('Marker instruction built', instructionData);
        onComplete(instructionData);
    };

    return (
        <div className="space-y-6">
            {/* Saved Groups */}
            {actionGroups.length > 0 && (
                <div className="card">
                    <h3 className="text-lg font-semibold text-sage-800 mb-4">Your Instruction</h3>
                    <div className="space-y-3">
                        {actionGroups.map((group, index) => (
                            <div key={index} className="p-3 bg-sage-50 rounded-lg border border-sage-200">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="text-sm font-medium text-sage-700 mb-1">
                                            Group {index + 1}: {[...group.markers, ...group.edges].join(', ')}
                                        </div>
                                        <div className="text-sm text-sage-600">
                                            {group.actions.map((action, actionIndex) => {
                                                const position = POSITION_TYPES.find(p => p.value === action.position);
                                                const positionText = position ? position.label.toLowerCase() : action.position;
                                                return `${action.specificAction} ${positionText}`;
                                            }).join(', ')}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => removeGroup(index)}
                                        className="text-red-500 hover:text-red-700 text-sm ml-3"
                                    >
                                        ✕
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Current Group Builder */}
            <div className="card">
                <h3 className="text-lg font-semibold text-sage-800 mb-4">
                    {actionGroups.length === 0 ? 'Build Your Instruction' : `Add Group ${actionGroups.length + 1}`}
                </h3>

                {/* Target Selection */}
                <div className="space-y-4">
                    <div>
                        <label className="text-sm font-semibold text-sage-700 mb-2 block">
                            1. Select Targets
                        </label>

                        {/* Markers */}
                        {availableMarkers.length > 0 && (
                            <div className="mb-3">
                                <div className="text-xs text-wool-600 mb-2">Markers:</div>
                                <div className="flex flex-wrap gap-2">
                                    {availableMarkers.map(marker => (
                                        <Bubble
                                            key={marker}
                                            active={currentGroup.markers.includes(marker)}
                                            onClick={() => toggleMarker(marker)}
                                        >
                                            {marker}
                                        </Bubble>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Edges */}
                        {hasEdges && (
                            <div className="mb-3">
                                <div className="text-xs text-wool-600 mb-2">Edges:</div>
                                <div className="flex gap-2">
                                    <Bubble
                                        active={currentGroup.edges.includes('beginning')}
                                        onClick={() => toggleEdge('beginning')}
                                    >
                                        Beginning
                                    </Bubble>
                                    <Bubble
                                        active={currentGroup.edges.includes('end')}
                                        onClick={() => toggleEdge('end')}
                                    >
                                        End
                                    </Bubble>
                                </div>
                            </div>
                        )}

                        {/* BOR */}
                        {hasBOR && (
                            <div className="mb-3">
                                <div className="text-xs text-wool-600 mb-2">Beginning of Round:</div>
                                <Bubble
                                    active={currentGroup.edges.includes('BOR')}
                                    onClick={() => toggleEdge('BOR')}
                                >
                                    BOR
                                </Bubble>
                            </div>
                        )}

                        {currentTargets.length > 0 && (
                            <div className="text-sm text-sage-600 mt-2">
                                Selected: {currentTargets.join(', ')}
                            </div>
                        )}
                    </div>

                    {/* Action Definition */}
                    <div>
                        <label className="text-sm font-semibold text-sage-700 mb-2 block">
                            2. Define Action
                        </label>

                        <div className="space-y-3">
                            {/* Position */}
                            <div>
                                <div className="text-xs text-wool-600 mb-2">Position:</div>
                                <div className="grid grid-cols-2 gap-2">
                                    {POSITION_TYPES.map(position => (
                                        <Bubble
                                            key={position.value}
                                            active={currentAction.position === position.value}
                                            onClick={() => updateAction('position', position.value)}
                                            small
                                        >
                                            {position.label}
                                        </Bubble>
                                    ))}
                                </div>
                            </div>

                            {/* Action Type */}
                            <div>
                                <SegmentedControl
                                    label="Action Type"
                                    value={currentAction.actionType}
                                    onChange={(value) => updateAction('actionType', value)}
                                    options={[
                                        { value: 'increase', label: 'Increase' },
                                        { value: 'decrease', label: 'Decrease' }
                                    ]}
                                />
                            </div>

                            {/* Specific Action */}
                            <div>
                                <div className="text-xs text-wool-600 mb-2">Technique:</div>
                                <div className="flex flex-wrap gap-2">
                                    {ACTION_TYPES[currentAction.actionType]?.map(action => (
                                        <Bubble
                                            key={action.value}
                                            active={currentAction.specificAction === action.value}
                                            onClick={() => updateAction('specificAction', action.value)}
                                        >
                                            {action.label}
                                        </Bubble>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end mt-4">
                            <button
                                onClick={addActionToGroup}
                                disabled={!canAddAction}
                                className="btn-secondary btn-sm"
                            >
                                Add Action
                            </button>
                        </div>
                    </div>

                    {/* Current Group Actions */}
                    {currentGroup.actions.length > 0 && (
                        <div>
                            <label className="text-sm font-semibold text-sage-700 mb-2 block">
                                Actions for {currentTargets.join(', ') || 'Selected Targets'}:
                            </label>
                            <div className="space-y-2">
                                {currentGroup.actions.map((action, index) => (
                                    <div key={index} className="flex items-center justify-between p-2 bg-yarn-50 rounded border">
                                        <span className="text-sm text-yarn-700">
                                            {action.specificAction} {POSITION_TYPES.find(p => p.value === action.position)?.label.toLowerCase()}
                                        </span>
                                        <button
                                            onClick={() => removeActionFromGroup(index)}
                                            className="text-red-500 hover:text-red-700 text-sm"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Save Group Button */}
                    <div className="pt-4 border-t">
                        <button
                            onClick={saveGroup}
                            disabled={!canSaveGroup}
                            className="btn-primary btn-sm"
                        >
                            Save This Group
                        </button>
                    </div>
                </div>
            </div>

            {/* Preview */}
            {actionGroups.length > 0 && (
                <div className="card bg-sage-50 border-sage-200">
                    <h4 className="text-sm font-semibold text-sage-700 mb-2">Instruction Preview</h4>
                    <pre className="text-sm text-sage-600 whitespace-pre-wrap">
                        {generateInstructionPreview()}
                    </pre>
                </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
                <button onClick={onCancel} className="btn-tertiary flex-1">
                    Cancel
                </button>
                <button
                    onClick={handleComplete}
                    disabled={!canComplete}
                    className="btn-primary flex-1"
                >
                    Use This Instruction
                </button>
            </div>
        </div>
    );
};

export default MarkerInstructionBuilder;