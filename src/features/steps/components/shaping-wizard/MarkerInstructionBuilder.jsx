// src/features/steps/components/shaping-wizard/MarkerInstructionBuilder.jsx
import React, { useState, useMemo } from 'react';
import IncrementInput from '../../../../shared/components/IncrementInput';
import MarkerArrayVisualization from '../../../../shared/components/MarkerArrayVisualization';
import IntelliKnitLogger from '../../../../shared/utils/ConsoleLogging';
import { generateMarkerFlowInstruction } from '../../../../shared/utils/markerInstructionUtils';

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
    onCancel,
    wizard
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
        targets: [],
        whereType: 'markers'
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
                className={`relative px-3 py-2 rounded-full font-medium transition-colors ${active
                    ? `${style.bg} ${style.text} card-marker-select-compact-selected`
                    : `${style.bg} ${style.text} hover:ring-2 hover:ring-sage-300 hover:ring-opacity-50`
                    }`}
            >
                {marker}
                {active && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-sage-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-bold">✓</span>
                    </div>
                )}
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

        // For flat construction, filter by whereType
        if (construction === 'flat') {
            if (currentAction.whereType === 'markers') {
                validTargets = validTargets.filter(t => t.type === 'marker' || t.type === 'bor');
            } else if (currentAction.whereType === 'edges') {
                validTargets = validTargets.filter(t => t.type === 'edge');
            } else {
                return [];
            }
        }

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

            // Handle cascading clears when whereType changes
            if (field === 'whereType') {
                updated.position = '';
                updated.technique = '';
                updated.distance = '';
                updated.targets = [];
            }

            // Handle position changes - clear technique and downstream
            if (field === 'position') {
                updated.technique = '';
                updated.distance = '';
                // Keep targets if they were already selected, but filter them
                const validTargets = getValidTargetsForNewState(updated);
                const validTargetValues = validTargets.map(t => t.value);
                updated.targets = updated.targets.filter(target => validTargetValues.includes(target));
            }

            // Handle technique changes - clear distance
            if (field === 'technique') {
                updated.distance = '';
            }

            // Handle action type changes - clear everything downstream
            if (field === 'actionType') {
                updated.whereType = construction === 'flat' ? 'markers' : '';
                updated.position = value === 'bind_off' ? 'at_beginning' : '';
                updated.technique = '';
                updated.distance = '';
                updated.targets = [];
                updated.bindOffAmount = '';
            }

            return updated;
        });
    };

    // Helper function to get valid targets for a given state
    const getValidTargetsForNewState = (actionState) => {
        let validTargets = [...availableTargets];

        if (construction === 'flat') {
            if (actionState.whereType === 'markers') {
                validTargets = validTargets.filter(t => t.type === 'marker' || t.type === 'bor');
            } else if (actionState.whereType === 'edges') {
                validTargets = validTargets.filter(t => t.type === 'edge');
            } else {
                return [];
            }
        }

        // Filter out conflicting edge targets based on position
        if (actionState.position === 'before') {
            validTargets = validTargets.filter(t => t.value !== 'beginning');
        } else if (actionState.position === 'after') {
            validTargets = validTargets.filter(t => t.value !== 'end');
        }

        // Filter out 'end' for bind_off actions
        if (actionState.actionType === 'bind_off') {
            validTargets = validTargets.filter(t => t.value !== 'end');
        }

        return validTargets;
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
    // REPLACE the existing generatePreview function (around line 259) with this new version:

    const generatePreview = () => {
        const allActions = [...completedActions];
        if (currentAction.actionType && currentAction.targets.length > 0) {
            allActions.push(currentAction);
        }

        if (allActions.length === 0) return "No actions defined yet";

        // Get base pattern name from wizard data
        const basePattern = wizard?.wizardData?.stitchPattern?.pattern || 'pattern';

        // Handle "continue in pattern" case
        if (allActions.length === 1 && allActions[0].actionType === 'continue') {
            return `Continue in ${basePattern}`;
        }

        // Handle bind off actions
        const bindOffActions = allActions.filter(action => action.actionType === 'bind_off');
        if (bindOffActions.length > 0) {
            return bindOffActions.map(action => {
                const amount = action.stitchCount ? `${action.stitchCount} stitches` : 'all stitches';
                if (action.targets.length > 0) {
                    return `Bind off ${amount} at ${action.targets.join(', ')}`;
                }
                return `Bind off ${amount}`;
            }).join(', ');
        }

        // Get markers from array for flow generation
        const markers = markerArray.filter(item => typeof item === 'string' && item !== 'BOR');

        // Separate marker actions from edge actions
        const markerActions = allActions.filter(action =>
            action.targets.some(target => markers.includes(target) || target === 'BOR')
        );
        const edgeActions = allActions.filter(action =>
            action.targets.some(target => ['beginning', 'end'].includes(target))
        );

        // Generate instruction parts
        const instructionParts = [];

        // Add edge actions first (if any)
        if (edgeActions.length > 0) {
            edgeActions.forEach(action => {
                action.targets.forEach(target => {
                    const technique = action.technique;
                    if (target === 'beginning') {
                        instructionParts.push(`${technique} at beginning`);
                    } else if (target === 'end') {
                        instructionParts.push(`${technique} at end`);
                    }
                });
            });
        }

        // Generate marker-based flow instruction
        let totalStitchChange = 0;
        if (markerActions.length > 0) {
            const result = generateMarkerFlowInstruction(markerActions, markerArray, basePattern);
            if (result.instruction) {
                instructionParts.push(result.instruction);
                totalStitchChange += result.stitchChange;
            }
        }

        const instruction = instructionParts.join(', ');
        const stitchChangeText = totalStitchChange !== 0 ?
            ` (${totalStitchChange > 0 ? '+' : ''}${totalStitchChange} sts)` : '';

        return instruction + stitchChangeText;

        return instructionParts.join(', ');
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

    // Add these helper functions before the return statement in MarkerInstructionBuilder.jsx

    const shouldShowPreview = () => {
        return completedActions.length > 0 ||
            (currentAction.actionType && currentAction.actionType !== '') ||
            currentStep === 'timing';
    };

    const getPreviewTitle = () => {
        if (currentStep === 'timing') {
            return "Phase Instruction";
        }

        if (completedActions.length > 0 && (!currentAction.actionType || currentAction.targets.length === 0)) {
            return "Phase Preview";
        }

        return "Building Phase...";
    };

    const getPreviewSubtext = () => {
        if (currentStep === 'timing') {
            if (!timing.frequency || !timing.times) {
                return "Set frequency and repetitions to complete this phase.";
            }
            return "Phase is ready to create. Click 'Create Instruction' to proceed.";
        }

        if (completedActions.length > 0 && (!currentAction.actionType || currentAction.targets.length === 0)) {
            return "Add another action with 'AND' or set timing to complete this phase.";
        }

        if (currentAction.actionType === 'continue') {
            return "Continue in pattern selected. Set frequency and timing next.";
        }

        if (currentAction.actionType && currentAction.targets.length === 0) {
            return "Select targets to see instruction preview.";
        }

        if (currentAction.actionType && currentAction.targets.length > 0 && !currentAction.technique) {
            return "Choose technique to complete this action.";
        }

        return "This preview updates as you build your phase instruction.";
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

                            {/* Step 2: Where & Which (flat construction only) */}
                            {currentAction.actionType && currentAction.actionType !== 'continue' && currentAction.actionType !== 'bind_off' && construction === 'flat' && (
                                <div>
                                    <label className="form-label">Where?</label>
                                    <div className="bg-yarn-50 border-2 border-wool-200 rounded-xl p-4 space-y-4">
                                        {/* Where selection */}
                                        <div className="grid grid-cols-2 gap-3">
                                            <div
                                                onClick={() => updateAction('whereType', 'markers')}
                                                className={`card-marker-select ${currentAction.whereType === 'markers' ? 'card-marker-select-selected' : ''}`}
                                            >
                                                <div className="font-medium text-sm">At Markers</div>
                                            </div>
                                            <div
                                                onClick={() => updateAction('whereType', 'edges')}
                                                className={`card-marker-select ${currentAction.whereType === 'edges' ? 'card-marker-select-selected' : ''}`}
                                            >
                                                <div className="font-medium text-sm">At Row Edges</div>
                                            </div>
                                        </div>

                                        {/* Target selection - appears immediately when whereType is selected */}
                                        {currentAction.whereType && (
                                            <div>
                                                <label className="form-label text-sm">Which {currentAction.whereType === 'markers' ? 'markers' : 'edges'}?</label>
                                                <div className="flex flex-wrap gap-2">
                                                    {/* Render marker targets */}
                                                    {currentAction.whereType === 'markers' && getValidTargets().filter(t => t.type === 'marker' || t.type === 'bor').map(target => (
                                                        <button
                                                            key={target.value}
                                                            onClick={() => toggleTarget(target.value)}
                                                            className={`relative px-3 py-2 rounded-full font-medium transition-colors border-2 ${currentAction.targets.includes(target.value)
                                                                ? `${getMarkerColor(target.value, markerColors).bg} ${getMarkerColor(target.value, markerColors).border} ${getMarkerColor(target.value, markerColors).text}`
                                                                : `${getMarkerColor(target.value, markerColors).bg} border-transparent ${getMarkerColor(target.value, markerColors).text}`
                                                                }`}
                                                        >
                                                            {target.value}
                                                            {currentAction.targets.includes(target.value) && (
                                                                <div className="absolute -top-1 -right-1 w-4 h-4 bg-sage-500 rounded-full flex items-center justify-center">
                                                                    <span className="text-white text-xs font-bold">✓</span>
                                                                </div>
                                                            )}
                                                        </button>
                                                    ))}

                                                    {/* Add Select All Markers button */}
                                                    {currentAction.whereType === 'markers' && getValidTargets().filter(t => t.type === 'marker' || t.type === 'bor').length > 1 && (
                                                        <button
                                                            onClick={() => {
                                                                const markerTargets = getValidTargets()
                                                                    .filter(t => t.type === 'marker' || t.type === 'bor')
                                                                    .map(t => t.value);
                                                                updateAction('targets', [...currentAction.targets.filter(target =>
                                                                    ['beginning', 'end'].includes(target)), ...markerTargets]);
                                                            }}
                                                            className="px-3 py-2 rounded-full font-medium transition-colors border-2 border-dashed border-sage-400 text-sage-600 hover:border-sage-500 hover:bg-sage-50"
                                                        >
                                                            + All Markers
                                                        </button>
                                                    )}

                                                    {/* Render edge targets */}
                                                    {currentAction.whereType === 'edges' && getValidTargets().filter(t => t.type === 'edge').map(target => (
                                                        <div
                                                            key={target.value}
                                                            onClick={() => toggleTarget(target.value)}
                                                            className={`relative card-marker-select-compact ${currentAction.targets.includes(target.value) ? 'card-marker-select-compact-selected' : ''}`}
                                                        >
                                                            {target.label}
                                                            {currentAction.targets.includes(target.value) && (
                                                                <div className="absolute -top-1 -right-1 w-4 h-4 bg-sage-500 rounded-full flex items-center justify-center">
                                                                    <span className="text-white text-xs font-bold">✓</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>

                                                {currentAction.targets.length > 0 && (
                                                    <div className="mt-3 pt-3 border-t border-wool-100">
                                                        <p className="text-sm text-sage-600">
                                                            Selected: {currentAction.targets.filter(target => target !== 'continue').join(', ')}
                                                        </p>
                                                    </div>
                                                )}
                                                {/* Cast-on support for edge increases at distance 0 */}
                                                {currentAction.whereType === 'edges' && currentAction.distance === 'at' && currentAction.actionType === 'increase' && (
                                                    <div>
                                                        <label className="form-label text-sm">Cast-on technique</label>
                                                        <div className="grid grid-cols-2 gap-2">
                                                            <div
                                                                onClick={() => updateAction('technique', 'Cable Cast On')}
                                                                className={`card-marker-select-compact ${currentAction.technique === 'Cable Cast On' ? 'card-marker-select-compact-selected' : ''}`}
                                                            >
                                                                Cable Cast On
                                                            </div>
                                                            <div
                                                                onClick={() => updateAction('technique', 'Backwards Loop')}
                                                                className={`card-marker-select-compact ${currentAction.technique === 'Backwards Loop' ? 'card-marker-select-compact-selected' : ''}`}
                                                            >
                                                                Backwards Loop
                                                            </div>
                                                        </div>

                                                        {currentAction.technique && (
                                                            <div className="mt-3">
                                                                <label className="form-label text-sm">
                                                                    {currentAction.position === 'both_ends' ? 'How many stitches to cast on each end?' : 'How many stitches to cast on?'}
                                                                </label>
                                                                <IncrementInput
                                                                    value={currentAction.stitchCount}
                                                                    onChange={(value) => updateAction('stitchCount', Math.max(value, 1))}
                                                                    min={1}
                                                                    max={100}
                                                                    size="sm"
                                                                />
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                {/* Regular edge techniques for distances 1-3 */}
                                                {currentAction.whereType === 'edges' && currentAction.distance && currentAction.distance !== 'at' && (
                                                    <div>
                                                        <label className="form-label text-sm">Technique</label>

                                                        {/* Beginning techniques */}
                                                        {currentAction.position === 'at_beginning' && (
                                                            <div className="grid grid-cols-3 gap-2">
                                                                {currentAction.actionType === 'increase' ? (
                                                                    <>
                                                                        <div onClick={() => updateAction('technique', 'M1L')} className={`card-marker-select-compact ${currentAction.technique === 'M1L' ? 'card-marker-select-compact-selected' : ''}`}>M1L</div>
                                                                        <div onClick={() => updateAction('technique', 'YO')} className={`card-marker-select-compact ${currentAction.technique === 'YO' ? 'card-marker-select-compact-selected' : ''}`}>YO</div>
                                                                        <div onClick={() => updateAction('technique', 'KFB')} className={`card-marker-select-compact ${currentAction.technique === 'KFB' ? 'card-marker-select-compact-selected' : ''}`}>KFB</div>
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <div onClick={() => updateAction('technique', 'SSK')} className={`card-marker-select-compact ${currentAction.technique === 'SSK' ? 'card-marker-select-compact-selected' : ''}`}>SSK</div>
                                                                        <div onClick={() => updateAction('technique', 'K2tog')} className={`card-marker-select-compact ${currentAction.technique === 'K2tog' ? 'card-marker-select-compact-selected' : ''}`}>K2tog</div>
                                                                        <div onClick={() => updateAction('technique', 'CDD')} className={`card-marker-select-compact ${currentAction.technique === 'CDD' ? 'card-marker-select-compact-selected' : ''}`}>CDD</div>
                                                                    </>
                                                                )}
                                                            </div>
                                                        )}

                                                        {/* End techniques */}
                                                        {currentAction.position === 'at_end' && (
                                                            <div className="grid grid-cols-3 gap-2">
                                                                {currentAction.actionType === 'increase' ? (
                                                                    <>
                                                                        <div onClick={() => updateAction('technique', 'M1R')} className={`card-marker-select-compact ${currentAction.technique === 'M1R' ? 'card-marker-select-compact-selected' : ''}`}>M1R</div>
                                                                        <div onClick={() => updateAction('technique', 'YO')} className={`card-marker-select-compact ${currentAction.technique === 'YO' ? 'card-marker-select-compact-selected' : ''}`}>YO</div>
                                                                        <div onClick={() => updateAction('technique', 'KFB')} className={`card-marker-select-compact ${currentAction.technique === 'KFB' ? 'card-marker-select-compact-selected' : ''}`}>KFB</div>
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <div onClick={() => updateAction('technique', 'SSK')} className={`card-marker-select-compact ${currentAction.technique === 'SSK' ? 'card-marker-select-compact-selected' : ''}`}>SSK</div>
                                                                        <div onClick={() => updateAction('technique', 'K2tog')} className={`card-marker-select-compact ${currentAction.technique === 'K2tog' ? 'card-marker-select-compact-selected' : ''}`}>K2tog</div>
                                                                        <div onClick={() => updateAction('technique', 'CDD')} className={`card-marker-select-compact ${currentAction.technique === 'CDD' ? 'card-marker-select-compact-selected' : ''}`}>CDD</div>
                                                                    </>
                                                                )}
                                                            </div>
                                                        )}

                                                        {/* Both ends */}
                                                        {currentAction.position === 'both_ends' && (
                                                            <div className="space-y-3">
                                                                {currentAction.actionType === 'increase' ? (
                                                                    <>
                                                                        <div onClick={() => updateAction('technique', 'M1L_M1R')} className={`card-marker-select-compact ${currentAction.technique === 'M1L_M1R' ? 'card-marker-select-compact-selected' : ''}`}>
                                                                            <div className="font-medium">M1L at beginning, M1R at end</div>
                                                                        </div>
                                                                        <div onClick={() => updateAction('technique', 'YO_YO')} className={`card-marker-select-compact ${currentAction.technique === 'YO_YO' ? 'card-marker-select-compact-selected' : ''}`}>
                                                                            <div className="font-medium">YO at beginning, YO at end</div>
                                                                        </div>
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <div onClick={() => updateAction('technique', 'SSK_K2tog')} className={`card-marker-select-compact ${currentAction.technique === 'SSK_K2tog' ? 'card-marker-select-compact-selected' : ''}`}>
                                                                            <div className="font-medium">SSK at beginning, K2tog at end</div>
                                                                        </div>
                                                                        <div onClick={() => updateAction('technique', 'K3tog_K3tog')} className={`card-marker-select-compact ${currentAction.technique === 'K3tog_K3tog' ? 'card-marker-select-compact-selected' : ''}`}>
                                                                            <div className="font-medium">K3tog at beginning, K3tog at end</div>
                                                                        </div>
                                                                    </>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}


                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Round construction target selection - simpler since no "where" choice needed */}
                            {currentAction.actionType && currentAction.actionType !== 'continue' && currentAction.actionType !== 'bind_off' && construction === 'round' && (<div>
                                <label className="form-label">Which markers?</label>
                                <div className="bg-yarn-50 border-2 border-wool-200 rounded-xl p-4">
                                    <div className="flex flex-wrap gap-2">
                                        {getValidTargets().filter(t => t.type === 'marker' || t.type === 'bor').map(target => (
                                            <button
                                                key={target.value}
                                                onClick={() => toggleTarget(target.value)}
                                                className={`relative px-3 py-2 rounded-full font-medium transition-colors border-2 ${currentAction.targets.includes(target.value)
                                                    ? `${getMarkerColor(target.value, markerColors).bg} ${getMarkerColor(target.value, markerColors).border} ${getMarkerColor(target.value, markerColors).text}`
                                                    : `${getMarkerColor(target.value, markerColors).bg} border-transparent ${getMarkerColor(target.value, markerColors).text}`
                                                    }`}
                                            >
                                                {target.value}
                                                {currentAction.targets.includes(target.value) && (
                                                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-sage-500 rounded-full flex items-center justify-center">
                                                        <span className="text-white text-xs font-bold">✓</span>
                                                    </div>
                                                )}
                                            </button>
                                        ))}

                                        {getValidTargets().filter(t => t.type === 'marker' || t.type === 'bor').length > 1 && (
                                            <button
                                                onClick={() => {
                                                    const markerTargets = getValidTargets()
                                                        .filter(t => t.type === 'marker' || t.type === 'bor')
                                                        .map(t => t.value);
                                                    updateAction('targets', markerTargets);
                                                }}
                                                className="px-3 py-2 rounded-full font-medium transition-colors border-2 border-dashed border-sage-400 text-sage-600 hover:border-sage-500 hover:bg-sage-50"
                                            >
                                                + All Markers
                                            </button>
                                        )}
                                    </div>

                                    {currentAction.targets.length > 0 && (
                                        <div className="mt-3 pt-3 border-t border-wool-100">
                                            <p className="text-sm text-sage-600">
                                                Selected: {currentAction.targets.join(', ')}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                            )}

                            {/* Step 3: Position & Technique */}
                            {currentAction.targets.length > 0 && (currentAction.actionType === 'increase' || currentAction.actionType === 'decrease') && currentAction.whereType !== 'edges' && (
                                <div>
                                    <label className="form-label">
                                        {currentAction.actionType === 'increase' ? 'Increase' : 'Decrease'} where and how?
                                    </label>
                                    <div className="bg-yarn-50 border-2 border-wool-200 rounded-xl p-4 space-y-4">
                                        {/* Position selection */}
                                        <div>
                                            <label className="form-label text-sm">Position</label>
                                            {currentAction.whereType === 'edges' ? (
                                                <div className="grid grid-cols-3 gap-2">
                                                    <div
                                                        onClick={() => {
                                                            updateAction('position', 'at_beginning');
                                                            updateAction('technique', currentAction.actionType === 'increase' ? 'M1L' : 'SSK');
                                                            updateAction('distance', '1');
                                                        }}
                                                        className={`card-marker-select-compact ${currentAction.position === 'at_beginning' ? 'card-marker-select-compact-selected' : ''}`}
                                                    >
                                                        Beginning
                                                    </div>
                                                    <div
                                                        onClick={() => {
                                                            updateAction('position', 'at_end');
                                                            updateAction('technique', currentAction.actionType === 'increase' ? 'M1R' : 'K2tog');
                                                            updateAction('distance', '1');
                                                        }}
                                                        className={`card-marker-select-compact ${currentAction.position === 'at_end' ? 'card-marker-select-compact-selected' : ''}`}
                                                    >
                                                        End
                                                    </div>
                                                    <div
                                                        onClick={() => {
                                                            updateAction('position', 'both_ends');
                                                            updateAction('technique', currentAction.actionType === 'increase' ? 'M1L_M1R' : 'SSK_K2tog');
                                                            updateAction('distance', '1');
                                                        }}
                                                        className={`card-marker-select-compact ${currentAction.position === 'both_ends' ? 'card-marker-select-compact-selected' : ''}`}
                                                    >
                                                        Both
                                                    </div>
                                                </div>
                                            ) : (
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
                                            )}
                                        </div>

                                        {/* Technique selection - appears when position is selected */}
                                        {currentAction.position && (
                                            <div>
                                                <label className="form-label text-sm">Technique</label>

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

                                                {/* Edge position techniques */}
                                                {(currentAction.position === 'at_beginning' || currentAction.position === 'at_end' || currentAction.position === 'both_ends') && (
                                                    <div className="text-sm text-sage-600">
                                                        Technique auto-selected based on position choice.
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Step 4: Distance - Now AFTER technique with NEW validation */}
                            {currentAction.technique && (
                                <div>
                                    <label className="form-label">Stitches between technique and marker?</label>
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

                            {/* Bind Off - Simple beginning-of-row only */}
                            {currentAction.actionType === 'bind_off' && (
                                <div>
                                    <label className="form-label">How many stitches to bind off?</label>
                                    <div className="bg-yarn-50 border-2 border-wool-200 rounded-xl p-4">
                                        <div className="flex items-center gap-3">
                                            <IncrementInput
                                                value={currentAction.stitchCount}
                                                onChange={(value) => {
                                                    const totalStitches = markerArray
                                                        .filter(item => typeof item === 'number')
                                                        .reduce((sum, stitches) => sum + stitches, 0);

                                                    const limitedValue = Math.min(value, totalStitches);
                                                    updateAction('stitchCount', limitedValue);
                                                    updateAction('position', 'at_beginning');
                                                    updateAction('targets', ['beginning']);
                                                    updateAction('bindOffAmount', 'specific');
                                                }}
                                                min={1}
                                                max={markerArray
                                                    .filter(item => typeof item === 'number')
                                                    .reduce((sum, stitches) => sum + stitches, 0)}
                                                size="sm"
                                            />

                                            <button
                                                onClick={() => {
                                                    const totalStitches = markerArray
                                                        .filter(item => typeof item === 'number')
                                                        .reduce((sum, stitches) => sum + stitches, 0);

                                                    updateAction('stitchCount', totalStitches);
                                                    updateAction('position', 'at_beginning');
                                                    updateAction('targets', ['beginning']);
                                                    updateAction('bindOffAmount', 'all');
                                                }}
                                                className="btn-secondary btn-sm"
                                            >
                                                Bind Off All
                                            </button>
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

            {shouldShowPreview() && (
                <div className="card-info">
                    <h4 className="section-header-secondary flex items-center justify-between">
                        {getPreviewTitle()}
                        {/* Action count indicator for multiple actions */}
                        {(completedActions.length > 0 || (currentAction.actionType && currentAction.targets.length > 0)) && (
                            <span className="text-xs bg-lavender-600 text-white px-2 py-1 rounded-full"> {completedActions.length + (currentAction.actionType && currentAction.targets.length > 0 ? 1 : 0)}
                                {completedActions.length + (currentAction.actionType && currentAction.targets.length > 0 ? 1 : 0) === 1 ? ' action' : ' actions'}
                            </span>
                        )}
                    </h4>

                    <div className="bg-white rounded-lg p-3 border border-lavender-200">
                        <p className="text-sm text-lavender-700 font-medium text-left">
                            {generatePreview()?.charAt(0).toUpperCase() + generatePreview()?.slice(1)}
                        </p>

                        {/* Show action breakdown for complex phases */}
                        {completedActions.length > 0 && currentStep !== 'timing' && (
                            <div className="mt-3 pt-3 border-t border-lavender-100">
                                <div className="text-xs text-lavender-600 space-y-1">
                                    <div className="font-medium">Configuration:</div>
                                    {completedActions.map((action, index) => (
                                        <div key={index} className="flex items-center gap-2">
                                            <span className="w-1 h-1 bg-lavender-400 rounded-full"></span>
                                            <span>
                                                {action.actionType === 'continue' ? 'Continue in pattern' :
                                                    `${action.technique || action.actionType} ${action.position || ''} ${action.targets.join(', ')}`}
                                            </span>
                                        </div>
                                    ))}
                                    {currentAction.actionType && currentAction.targets.length > 0 && (
                                        <div className="flex items-center gap-2 text-sage-600">
                                            <span className="w-1 h-1 bg-sage-400 rounded-full"></span>
                                            <span className="italic">
                                                + {currentAction.technique || currentAction.actionType} {currentAction.position || ''} {currentAction.targets.join(', ')} (building...)
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    <p className="text-xs text-lavender-600 mt-2">
                        {getPreviewSubtext()}
                    </p>
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