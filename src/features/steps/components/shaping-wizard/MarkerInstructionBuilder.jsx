// src/features/steps/components/shaping-wizard/MarkerInstructionBuilder.jsx
import React, { useState, useMemo } from 'react';
import IncrementInput from '../../../../shared/components/IncrementInput';
import MarkerArrayVisualization from '../../../../shared/components/MarkerArrayVisualization';
import IntelliKnitLogger from '../../../../shared/utils/ConsoleLogging';

// Use the passed markerColors instead of hardcoded colorMap
const getMarkerColor = (markerName, markerColors) => {
    if (markerName === 'BOR') {
        return { bg: 'bg-lavender-200', border: 'border-lavender-500', text: 'text-lavender-700' };
    }

    const MARKER_COLOR_OPTIONS = [
        { bg: 'bg-sage-100', border: 'border-sage-400', text: 'text-sage-700' },
        { bg: 'bg-yarn-200', border: 'border-yarn-500', text: 'text-yarn-800' },
        { bg: 'bg-yarn-100', border: 'border-yarn-400', text: 'text-yarn-700' },
        { bg: 'bg-wool-200', border: 'border-wool-400', text: 'text-wool-700' }
    ];

    const colorIndex = markerColors[markerName] || 0;
    return MARKER_COLOR_OPTIONS[colorIndex];
};

const MarkerInstructionBuilder = ({
    markerArray = [],
    markerColors = {}, // Add this line
    construction = 'flat',
    onComplete,
    onCancel
}) => {
    // Progressive disclosure state
    const [currentStep, setCurrentStep] = useState('action-type');

    // Current action being built
    const [currentAction, setCurrentAction] = useState({
        actionType: '',
        technique: '',
        position: '',
        distance: '',
        bindOffAmount: '',
        stitchCount: 1,
        targets: []
    });

    // Completed actions for this instruction
    const [completedActions, setCompletedActions] = useState([]);

    // Timing configuration
    const [timing, setTiming] = useState({
        frequency: 2,
        times: 10,
        rows: 1,
        amountMode: 'times',
        targetStitches: null
    });

    // Available targets based on construction
    const availableTargets = useMemo(() => {
        const targets = [];

        // Add markers
        const markers = markerArray.filter(item => typeof item === 'string' && item !== 'BOR');
        markers.forEach(marker => {
            targets.push({ value: marker, label: marker, type: 'marker' });
        });

        // Add construction-specific targets
        if (construction === 'round') {
            if (markerArray.includes('BOR')) {
                targets.push({ value: 'BOR', label: 'BOR', type: 'bor' });
            }
        } else {
            // Flat construction
            targets.push({ value: 'beginning', label: 'Beginning', type: 'edge' });
            targets.push({ value: 'end', label: 'End', type: 'edge' });
        }

        return targets;
    }, [markerArray, construction]);

    // Chip component
    const Chip = ({ children, active = false, onClick, disabled = false, large = false }) => (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            className={`${large ? 'px-4 py-3 text-base' : 'px-3 py-2 text-sm'} rounded-full font-medium transition-colors border-2 ${active
                ? 'bg-sage-500 text-white border-sage-500'
                : 'bg-white text-wool-700 border-wool-300 hover:border-sage-300'
                } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
            {children}
        </button>
    );

    const MarkerChip = ({ marker, active, onClick }) => {
        const style = getMarkerColor(marker, markerColors);
        return (
            <button
                type="button"
                onClick={onClick}
                className={`px-3 py-2 rounded-full font-medium transition-colors border-2 ${active
                    ? `${style.bg} ${style.border} ${style.text} ring-2 ring-sage-500 ring-opacity-30`
                    : `${style.bg} ${style.border} ${style.text} hover:ring-2 hover:ring-sage-300 hover:ring-opacity-50`
                    }`}
            >
                {marker}
            </button>
        );
    };

    // NEW: Get valid distance options based on technique consumption (ONLY for BEFORE marker)
    const getValidDistanceOptions = (technique, position) => {
        // All distances are valid - validation happens at instruction generation time
        // when we know the actual stitch counts between markers
        return ['at', '1', '2', '3'];
    };

    // NEW: Get valid targets for current action configuration
    const getValidTargets = () => {
        let validTargets = [...availableTargets];

        // Filter out conflicting edge targets based on position
        if (currentAction.position === 'before') {
            validTargets = validTargets.filter(t => t.value !== 'beginning');
        } else if (currentAction.position === 'after') {
            validTargets = validTargets.filter(t => t.value !== 'end');
        }

        // Filter out 'end' for bind_off actions
        if (currentAction.actionType === 'bind_off') {
            validTargets = validTargets.filter(t => t.value !== 'end');
        }

        return validTargets;
    };

    // Update current action with NEW validation
    const updateAction = (field, value) => {
        setCurrentAction(prev => {
            const updated = { ...prev, [field]: value };

            // NEW: Handle position changes - clear conflicting edge targets
            if (field === 'position') {
                const validTargets = getValidTargets();
                const validTargetValues = validTargets.map(t => t.value);
                updated.targets = updated.targets.filter(target => validTargetValues.includes(target));
            }

            // NEW: Handle technique changes - no longer need distance validation
            if (field === 'technique') {
                // Technique changed - no additional validation needed since all distances are valid
            }

            // Clear invalid targets when action type changes
            if (field === 'actionType') {
                const newAvailableTargets = getAvailableTargetsForAction(value);
                const validTargets = updated.targets.filter(target =>
                    newAvailableTargets.some(availableTarget => availableTarget.value === target)
                );
                updated.targets = validTargets;
            }

            return updated;
        });
    };

    // Helper function to get available targets for an action type
    const getAvailableTargetsForAction = (actionType) => {
        if (actionType === 'bind_off') {
            return availableTargets.filter(t => t.value !== 'end');
        }
        return availableTargets;
    };

    // Toggle target selection
    const toggleTarget = (target) => {
        setCurrentAction(prev => ({
            ...prev,
            targets: prev.targets.includes(target)
                ? prev.targets.filter(t => t !== target)
                : [...prev.targets, target]
        }));
    };

    // Add current action to completed list
    const addAction = () => {
        setCompletedActions(prev => [...prev, { ...currentAction }]);
        setCurrentAction({
            actionType: '',
            technique: '',
            position: '',
            distance: '',
            bindOffAmount: '',
            stitchCount: 1,
            targets: []
        });
        setCurrentStep('action-type');
    };

    // Continue to timing
    const continueToTiming = () => {
        if (currentAction.actionType === 'continue') {
            // For continue in pattern, just go to timing immediately
            setCurrentStep('timing');
            return;
        }

        if (currentAction.actionType && currentAction.targets.length > 0) {
            addAction();
        }
        setCurrentStep('timing');
    };


    // Generate instruction preview - REPLACEMENT FOR CURRENT generatePreview()
    const generatePreview = () => {
        // Simple preview that doesn't include timing until timing step
        const allActions = [...completedActions];

        if (currentAction.actionType && currentAction.targets.length > 0) {
            allActions.push(currentAction);
        }

        if (allActions.length === 0) return "No actions defined yet";

        // Generate pattern-style instruction
        return allActions.map(action => {
            if (action.actionType === 'continue') return "Continue in pattern";

            if (action.actionType === 'bind_off') {
                const amount = action.stitchCount ? `${action.stitchCount} stitches` : 'all stitches';
                return `Bind off ${amount}`;
            }

            // Handle paired techniques with proper pattern language
            if (action.technique && action.technique.includes('_')) {
                const [tech1, tech2] = action.technique.split('_');
                const distance = action.distance === 'at' ? '' : `${action.distance} st `;
                return `${distance}before marker, ${tech1}, sm, ${tech2}`;
            }

            // Single technique
            const distance = action.distance === 'at' ? '' : `${action.distance} st `;
            const position = action.position === 'before' ? 'before marker' :
                action.position === 'after' ? 'after marker' : action.position;
            return `${distance}${position}, ${action.technique}`;

        }).join(', ');
    };

    // Helper function to generate marker-based instruction
    const generateMarkerInstruction = (actions, markers, terms) => {
        // Find all targeted markers across actions
        const targetedMarkers = [...new Set(
            actions.flatMap(action => action.targets.filter(target => markers.includes(target)))
        )];

        if (targetedMarkers.length === 0) return null;

        // Build instruction for first marker, then add repeat clause
        const firstMarker = targetedMarkers[0];
        const markerSequence = [];

        // Process actions in logical order for this marker
        actions.forEach(action => {
            if (!action.targets.includes(firstMarker)) return;

            if (action.position === 'before_and_after') {
                // Handle paired techniques
                const [beforeTech, afterTech] = action.technique.split('_');
                const distance = action.distance === 'at' ? 0 : parseInt(action.distance);

                if (distance > 0) {
                    markerSequence.push(`knit to ${distance} st before marker`);
                    markerSequence.push(beforeTech);
                    markerSequence.push('slip marker');
                    markerSequence.push(afterTech);
                } else {
                    markerSequence.push(beforeTech);
                    markerSequence.push('slip marker');
                    markerSequence.push(afterTech);
                }
            } else if (action.position === 'before') {
                const distance = action.distance === 'at' ? 0 : parseInt(action.distance);
                if (distance > 0) {
                    markerSequence.push(`knit to ${distance} st before marker`);
                }
                markerSequence.push(action.technique);
            } else if (action.position === 'after') {
                markerSequence.push('slip marker');
                markerSequence.push(action.technique);
            }
        });

        // Build the complete instruction
        let instruction = markerSequence.join(', ');

        // Add repeat clause if multiple markers
        if (targetedMarkers.length > 1) {
            const remainingMarkers = targetedMarkers.slice(1);
            instruction += `, repeat for markers ${remainingMarkers.join(', ')}`;
        }

        return instruction;
    };

    // Helper function to generate edge-based instruction
    const generateEdgeInstruction = (actions, terms) => {
        const parts = [];

        actions.forEach(action => {
            action.targets.forEach(target => {
                if (target === 'beginning') {
                    parts.push(`${action.technique} at beginning of ${terms.row}`);
                } else if (target === 'end') {
                    parts.push(`${action.technique} at end of ${terms.row}`);
                }
            });
        });

        return parts.join(', ');
    };

    // Helper function to generate bind off instruction
    const generateBindOffInstruction = (actions) => {
        const parts = [];

        actions.forEach(action => {
            const amount = action.stitchCount && action.stitchCount !== 'all' ?
                `${action.stitchCount} stitches` : 'all stitches';

            if (action.targets.length > 0) {
                const locations = action.targets.join(', ');
                parts.push(`bind off ${amount} at ${locations}`);
            } else {
                parts.push(`bind off ${amount}`);
            }
        });

        return parts.join(', ');
    };

    // Complete instruction
    const handleComplete = () => {
        // Add current action if it's valid
        const finalActions = [...completedActions];
        if (currentAction.actionType && (currentAction.targets.length > 0 || currentAction.actionType === 'continue')) {
            finalActions.push(currentAction);
        }

        const instructionData = {
            actions: finalActions,
            timing: timing,
            preview: generatePreview(),
            construction: construction
        };

        IntelliKnitLogger.success('Marker instruction completed', instructionData);
        onComplete(instructionData);
    };

    return (
        <div className="space-y-6">
            {/* Marker Reference */}
            <div className="card bg-sage-50 border-sage-200">
                <h4 className="section-header-secondary">Marker Positioning</h4>
                <MarkerArrayVisualization
                    stitchArray={markerArray}
                    construction={construction}
                    showActions={false}
                    markerColors={markerColors}
                />
            </div>


            {/* Section 2: Define Row Actions */}
            <div className="card">
                <h4 className="section-header-secondary">Define Row Actions</h4>
                <div className="space-y-6">

                    {/* Step 1: Action Type */}
                    <div>

                        <label className="form-label">What happens?</label>
                        <div className="bg-yarn-50 border-2 border-wool-200 rounded-xl p-4">

                            <div className="grid grid-cols-2 gap-3">

                                <div
                                    onClick={() => updateAction('actionType', 'increase')}
                                    className={`card-marker-select ${currentAction.actionType === 'increase' ? 'card-marker-select-selected' : ''}`}
                                >
                                    <div className="font-medium text-sm">Add Increases</div>
                                </div>
                                <div
                                    onClick={() => updateAction('actionType', 'decrease')}
                                    className={`card-marker-select ${currentAction.actionType === 'decrease' ? 'card-marker-select-selected' : ''}`}
                                >
                                    <div className="font-medium text-sm">Add Decreases</div>
                                </div>
                                <div
                                    onClick={() => updateAction('actionType', 'bind_off')}
                                    className={`card-marker-select ${currentAction.actionType === 'bind_off' ? 'card-marker-select-selected' : ''}`}
                                >
                                    <div className="font-medium text-sm">Bind Off</div>
                                </div>

                                <div
                                    onClick={() => updateAction('actionType', 'continue')}
                                    className={`card-marker-select ${currentAction.actionType === 'continue' ? 'card-marker-select-selected' : ''}`}
                                >
                                    <div className="font-medium text-sm">Work Pattern</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Auto-advance Continue in Pattern to timing */}
                    {currentAction.actionType === 'continue' && (() => {
                        // Auto-set targets and advance to timing
                        if (currentAction.targets.length === 0) {
                            setTimeout(() => {
                                updateAction('targets', ['continue']);
                                setCurrentStep('timing');
                            }, 0);
                        }
                        return null;
                    })()}
                    {/* Only show progressive disclosure for non-continue actions */}
                    {currentAction.actionType !== 'continue' && (
                        <>
                            {/* Step 2: Position for Increase/Decrease */}
                            {(currentAction.actionType === 'increase' || currentAction.actionType === 'decrease') && (
                                <div>
                                    <label className="form-label">
                                        {currentAction.actionType === 'increase' ? 'Increase' : 'Decrease'}
                                    </label>
                                    <div className="bg-yarn-50 border-2 border-wool-200 rounded-xl p-4">
                                        <div className="grid grid-cols-3 gap-2">
                                            <div
                                                onClick={() => {
                                                    updateAction('position', 'before');
                                                    updateAction('technique', currentAction.actionType === 'increase' ? 'M1L' : 'SSK');
                                                    updateAction('distance', '1');
                                                }}
                                                className={`card-marker-select-compact ${currentAction.position === 'before' ? 'card-marker-select-compact-selected' : ''}`}
                                            >
                                                Before
                                            </div>
                                            <div
                                                onClick={() => {
                                                    updateAction('position', 'after');
                                                    updateAction('technique', currentAction.actionType === 'increase' ? 'M1R' : 'K2tog');
                                                    updateAction('distance', '1');
                                                }}
                                                className={`card-marker-select-compact ${currentAction.position === 'after' ? 'card-marker-select-compact-selected' : ''}`}
                                            >
                                                After
                                            </div>
                                            <div
                                                onClick={() => {
                                                    updateAction('position', 'before_and_after');
                                                    updateAction('technique', currentAction.actionType === 'increase' ? 'M1L_M1R' : 'SSK_K2tog');
                                                    updateAction('distance', '1');
                                                }}
                                                className={`card-marker-select-compact ${currentAction.position === 'before_and_after' ? 'card-marker-select-compact-selected' : ''}`}
                                            >
                                                Both
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Step 3: Technique - MOVED UP before Distance */}
                            {currentAction.position && currentAction.actionType !== 'bind_off' && (
                                <div className="form-field">
                                    <label className="form-label">Technique</label>
                                    <div className="bg-yarn-50 border-2 border-wool-200 rounded-xl p-4">

                                        {/* Before marker increases */}
                                        {currentAction.position === 'before' && currentAction.actionType === 'increase' && (
                                            <div className="grid grid-cols-3 gap-2">
                                                <div
                                                    onClick={() => updateAction('technique', 'M1L')}
                                                    className={`card-marker-select-compact ${currentAction.technique === 'M1L' ? 'card-marker-select-compact-selected' : ''}`}
                                                >
                                                    M1L
                                                </div>
                                                <div
                                                    onClick={() => updateAction('technique', 'YO')}
                                                    className={`card-marker-select-compact ${currentAction.technique === 'YO' ? 'card-marker-select-compact-selected' : ''}`}
                                                >
                                                    YO
                                                </div>
                                                <div
                                                    onClick={() => updateAction('technique', 'KFB')}
                                                    className={`card-marker-select-compact ${currentAction.technique === 'KFB' ? 'card-marker-select-compact-selected' : ''}`}
                                                >
                                                    KFB
                                                </div>
                                            </div>
                                        )}

                                        {/* Before marker decreases */}
                                        {currentAction.position === 'before' && currentAction.actionType === 'decrease' && (
                                            <div className="grid grid-cols-3 gap-2">
                                                <div
                                                    onClick={() => updateAction('technique', 'SSK')}
                                                    className={`card-marker-select-compact ${currentAction.technique === 'SSK' ? 'card-marker-select-compact-selected' : ''}`}
                                                >
                                                    SSK
                                                </div>
                                                <div
                                                    onClick={() => updateAction('technique', 'K3tog')}
                                                    className={`card-marker-select-compact ${currentAction.technique === 'K3tog' ? 'card-marker-select-compact-selected' : ''}`}
                                                >
                                                    K3tog
                                                </div>
                                                <div
                                                    onClick={() => updateAction('technique', 'CDD')}
                                                    className={`card-marker-select-compact ${currentAction.technique === 'CDD' ? 'card-marker-select-compact-selected' : ''}`}
                                                >
                                                    CDD
                                                </div>
                                            </div>
                                        )}

                                        {/* After marker increases */}
                                        {currentAction.position === 'after' && currentAction.actionType === 'increase' && (
                                            <div className="grid grid-cols-3 gap-2">
                                                <div
                                                    onClick={() => updateAction('technique', 'M1R')}
                                                    className={`card-marker-select-compact ${currentAction.technique === 'M1R' ? 'card-marker-select-compact-selected' : ''}`}
                                                >
                                                    M1R
                                                </div>
                                                <div
                                                    onClick={() => updateAction('technique', 'YO')}
                                                    className={`card-marker-select-compact ${currentAction.technique === 'YO' ? 'card-marker-select-compact-selected' : ''}`}
                                                >
                                                    YO
                                                </div>
                                                <div
                                                    onClick={() => updateAction('technique', 'KFB')}
                                                    className={`card-marker-select-compact ${currentAction.technique === 'KFB' ? 'card-marker-select-compact-selected' : ''}`}
                                                >
                                                    KFB
                                                </div>
                                            </div>
                                        )}

                                        {/* After marker decreases */}
                                        {currentAction.position === 'after' && currentAction.actionType === 'decrease' && (
                                            <div className="grid grid-cols-3 gap-2">
                                                <div
                                                    onClick={() => updateAction('technique', 'K2tog')}
                                                    className={`card-marker-select-compact ${currentAction.technique === 'K2tog' ? 'card-marker-select-compact-selected' : ''}`}
                                                >
                                                    K2tog
                                                </div>
                                                <div
                                                    onClick={() => updateAction('technique', 'K3tog')}
                                                    className={`card-marker-select-compact ${currentAction.technique === 'K3tog' ? 'card-marker-select-compact-selected' : ''}`}
                                                >
                                                    K3tog
                                                </div>
                                                <div
                                                    onClick={() => updateAction('technique', 'CDD')}
                                                    className={`card-marker-select-compact ${currentAction.technique === 'CDD' ? 'card-marker-select-compact-selected' : ''}`}
                                                >
                                                    CDD
                                                </div>
                                            </div>
                                        )}

                                        {/* Before & After paired increases */}
                                        {currentAction.position === 'before_and_after' && currentAction.actionType === 'increase' && (
                                            <div className="grid grid-cols-2 gap-2">
                                                <div
                                                    onClick={() => updateAction('technique', 'M1L_M1R')}
                                                    className={`card-marker-select-compact ${currentAction.technique === 'M1L_M1R' ? 'card-marker-select-compact-selected' : ''}`}
                                                >
                                                    M1L & M1R
                                                </div>
                                                <div
                                                    onClick={() => updateAction('technique', 'YO_YO')}
                                                    className={`card-marker-select-compact ${currentAction.technique === 'YO_YO' ? 'card-marker-select-compact-selected' : ''}`}
                                                >
                                                    YO & YO
                                                </div>
                                            </div>
                                        )}

                                        {/* Before & After paired decreases */}
                                        {currentAction.position === 'before_and_after' && currentAction.actionType === 'decrease' && (
                                            <div className="grid grid-cols-2 gap-2">
                                                <div
                                                    onClick={() => updateAction('technique', 'SSK_K2tog')}
                                                    className={`card-marker-select-compact ${currentAction.technique === 'SSK_K2tog' ? 'card-marker-select-compact-selected' : ''}`}
                                                >
                                                    SSK & K2tog
                                                </div>
                                                <div
                                                    onClick={() => updateAction('technique', 'K3tog_K3tog')}
                                                    className={`card-marker-select-compact ${currentAction.technique === 'K3tog_K3tog' ? 'card-marker-select-compact-selected' : ''}`}
                                                >
                                                    K3tog & K3tog
                                                </div>
                                            </div>
                                        )}

                                    </div>
                                </div>
                            )}

                            {/* Step 4: Distance - Now AFTER technique with NEW validation */}
                            {currentAction.technique && (
                                <div>
                                    <label className="form-label">Distance from marker?</label>
                                    <div className="bg-yarn-50 border-2 border-wool-200 rounded-xl p-4">
                                        <div className="grid grid-cols-4 gap-2">
                                            {getValidDistanceOptions(currentAction.technique, currentAction.position).map(distance => (
                                                <button
                                                    key={distance}
                                                    onClick={() => updateAction('distance', distance)}
                                                    className={`card-marker-select-compact ${currentAction.distance === distance ? 'card-marker-select-compact-selected' : ''}`}
                                                >
                                                    {distance === 'at' ? '0 st' : `${distance} st${distance === '1' ? '' : 's'}`}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Bind Off Amount */}
                            {currentAction.actionType === 'bind_off' && (
                                <div>
                                    <label className="form-label">How many stitches?</label>
                                    <div className="bg-yarn-50 border-2 border-wool-200 rounded-xl p-4">
                                        <div className="flex items-center gap-3">
                                            <IncrementInput
                                                value={currentAction.stitchCount}
                                                onChange={(value) => {
                                                    updateAction('stitchCount', value);
                                                    updateAction('bindOffAmount', 'specific');
                                                }}
                                                min={1}
                                                max={50}
                                                size="sm"
                                            />
                                            <button
                                                onClick={() => {
                                                    // Calculate total available stitches from marker array
                                                    const totalStitches = markerArray
                                                        .filter(item => typeof item === 'number')
                                                        .reduce((sum, stitches) => sum + stitches, 0);

                                                    updateAction('stitchCount', totalStitches);
                                                    updateAction('bindOffAmount', 'specific'); // Keep as specific, just with max value
                                                }}
                                                className="btn-secondary btn-sm"
                                            >
                                                Bind Off All
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Step 5: Targets - UPDATED to use NEW getValidTargets */}
                            {(currentAction.technique || currentAction.bindOffAmount) && currentAction.actionType !== 'continue' && (
                                <div>
                                    <label className="form-label">Which markers/positions?</label>
                                    <div className="bg-yarn-50 border-2 border-wool-200 rounded-xl p-4">
                                        <div className="flex flex-wrap gap-2">
                                            {getValidTargets().map(target => (
                                                target.type === 'marker' ? (
                                                    <button
                                                        key={target.value}
                                                        onClick={() => toggleTarget(target.value)}
                                                        className={`px-3 py-2 rounded-full font-medium transition-colors border-4 ${currentAction.targets.includes(target.value)
                                                            ? `${getMarkerColor(target.value, markerColors).bg} border-black ${getMarkerColor(target.value, markerColors).text} font-bold`
                                                            : `${getMarkerColor(target.value, markerColors).bg} ${getMarkerColor(target.value, markerColors).border} ${getMarkerColor(target.value, markerColors).text}`
                                                            }`}
                                                    >
                                                        {target.value}
                                                    </button>
                                                ) : (
                                                    <div
                                                        key={target.value}
                                                        onClick={() => toggleTarget(target.value)}
                                                        className={`card-marker-select-compact ${currentAction.targets.includes(target.value) ? 'card-marker-select-compact-selected' : ''}`}
                                                    >
                                                        {target.label}
                                                    </div>
                                                )
                                            ))}
                                        </div>

                                        <div className="mt-3 pt-3 border-t border-wool-100 space-y-2">
                                            <div className="flex items-center justify-between">
                                                <p className="text-sm text-sage-600">
                                                    Selected: {currentAction.targets.filter(target => target !== 'continue').join(', ')}
                                                </p>
                                                <button
                                                    onClick={() => {
                                                        const allTargets = getValidTargets().map(t => t.value);
                                                        updateAction('targets', allTargets);
                                                    }}
                                                    className="btn-secondary btn-sm"
                                                >
                                                    Select All
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Step 6: Add Action or Continue */}
                            {currentAction.targets.length > 0 && (
                                <div className="flex gap-3 pt-4 border-t">
                                    <button
                                        onClick={addAction}
                                        className="btn-secondary"
                                    >
                                        AND (add another action)
                                    </button>
                                    <button
                                        onClick={continueToTiming}
                                        className="btn-primary"
                                    >
                                        Set Frequency & Times →
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Current Instruction Preview */}
            {(completedActions.length > 0 || (currentAction.actionType && (currentAction.targets.length > 0 || currentAction.actionType === 'continue'))) && (
                <div className="card-info">
                    <h4 className="section-header-secondary">Current Instruction Preview</h4>
                    <div className="bg-white rounded-lg p-3 border border-lavender-200">
                        <p className="text-sm text-lavender-700 font-medium">{generatePreview()}</p>
                    </div>
                    <p className="text-xs text-lavender-600 mt-2">
                        This is what your knitting instruction will look like. Add frequency and timing next.
                    </p>
                </div>
            )}

            {/* Completed Actions Summary */}
            {completedActions.length > 0 && (
                <div className="card bg-sage-50 border-sage-200">
                    <h4 className="section-header-secondary">Current Instruction</h4>
                    <p className="text-sm text-sage-600">{generatePreview()}</p>
                </div>
            )}

            {/* Section 3: Set Frequency and Times */}
            {currentStep === 'timing' && (
                <div className="card">
                    <h4 className="section-header-secondary">Frequency & Times</h4>
                    <div className="space-y-6">

                        {/* How Often */}
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

                        {/* Mode Toggle */}
                        <div>
                            <label className="form-label">Number of Times vs Target Stitches</label>
                            <div className="bg-yarn-50 border-2 border-wool-200 rounded-xl p-4">
                                <div className="grid grid-cols-2 gap-2 mb-4">
                                    <div
                                        onClick={() => setTiming(prev => ({ ...prev, amountMode: 'times' }))}
                                        className={`card-marker-select-compact ${(timing.amountMode || 'times') === 'times' ? 'card-marker-select-compact-selected' : ''}`}
                                    >
                                        Number of Times
                                    </div>
                                    <div
                                        onClick={() => setTiming(prev => ({ ...prev, amountMode: 'target' }))}
                                        className={`card-marker-select-compact ${timing.amountMode === 'target' ? 'card-marker-select-compact-selected' : ''}`}
                                    >
                                        Target Stitches
                                    </div>
                                </div>

                                {/* Input directly below toggle in same card */}
                                {(timing.amountMode || 'times') === 'times' ? (
                                    <IncrementInput
                                        value={timing.times}
                                        onChange={(value) => setTiming(prev => ({ ...prev, times: Math.max(value, 1) }))}
                                        unit="times"
                                        min={1}
                                        max={50}
                                        size="sm"
                                    />
                                ) : (
                                    <IncrementInput
                                        value={timing.targetStitches || 0}
                                        onChange={(value) => setTiming(prev => ({ ...prev, targetStitches: value }))}
                                        unit="stitches"
                                        min={0}
                                        size="sm"
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
                <button onClick={onCancel} className="btn-tertiary flex-1">
                    Cancel
                </button>
                {currentStep === 'timing' && (
                    <button
                        onClick={handleComplete}
                        className="btn-primary flex-1"
                    >
                        Create Instruction
                    </button>
                )}
            </div>
        </div>
    );
};

export default MarkerInstructionBuilder;