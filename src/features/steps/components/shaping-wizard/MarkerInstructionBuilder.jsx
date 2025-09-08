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

    // Update current action
    const updateAction = (field, value) => {
        setCurrentAction(prev => ({ ...prev, [field]: value }));
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

    // Generate instruction preview
    const generatePreview = () => {
        if (completedActions.length === 0) return "No actions defined yet";

        const actionDescriptions = completedActions.map(action => {
            const targetLabels = action.targets.join(', ');

            if (action.actionType === 'continue') {
                return `Continue in pattern for ${timing.rows} ${construction === 'round' ? 'rounds' : 'rows'}`;
            }

            if (action.actionType === 'bind_off') {
                const amount = action.bindOffAmount === 'all' ? 'all stitches' : `${action.stitchCount} stitches`;
                return `Bind off ${amount} at ${targetLabels}`;
            }

            let positionText = action.position;
            if (action.distance && action.distance !== 'at') {
                positionText = `${action.distance} ${action.position}`;
            }

            return `${action.technique} ${positionText} ${targetLabels}`;
        });

        return actionDescriptions.join(', ');
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
                <h4 className="section-header-secondary">Your Marker Layout</h4>
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
                                    className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${currentAction.actionType === 'increase'
                                        ? 'border-sage-500 bg-sage-100'
                                        : 'border-wool-200 hover:border-sage-300'
                                        }`}
                                >
                                    <div className="font-medium text-sm">Add Increases</div>
                                </div>
                                <div
                                    onClick={() => updateAction('actionType', 'decrease')}
                                    className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${currentAction.actionType === 'decrease'
                                        ? 'border-sage-500 bg-sage-100'
                                        : 'border-wool-200 hover:border-sage-300'
                                        }`}
                                >
                                    <div className="font-medium text-sm">Add Decrease</div>
                                </div>
                                <div
                                    onClick={() => updateAction('actionType', 'bind_off')}
                                    className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${currentAction.actionType === 'bind_off'
                                        ? 'border-sage-500 bg-sage-100'
                                        : 'border-wool-200 hover:border-sage-300'
                                        }`}
                                >
                                    <div className="font-medium text-sm">Bind Off</div>
                                </div>

                                <div
                                    onClick={() => updateAction('actionType', 'continue')}
                                    className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${currentAction.actionType === 'continue'
                                        ? 'border-sage-500 bg-sage-100'
                                        : 'border-wool-200 hover:border-sage-300'
                                        }`}
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
                                        <div className="grid grid-cols-2 gap-2">
                                            <button
                                                onClick={() => {
                                                    updateAction('position', 'before');
                                                    updateAction('technique', currentAction.actionType === 'increase' ? 'M1L' : 'SSK');
                                                }}
                                                className={`p-3 text-sm border-2 rounded-lg transition-colors ${currentAction.position === 'before'
                                                    ? 'border-sage-500 bg-sage-100 text-sage-700'
                                                    : 'border-wool-200 hover:border-sage-300'
                                                    }`}
                                            >
                                                Before marker
                                            </button>
                                            <button
                                                onClick={() => {
                                                    updateAction('position', 'after');
                                                    updateAction('technique', currentAction.actionType === 'increase' ? 'M1R' : 'K2tog');
                                                }}
                                                className={`p-3 text-sm border-2 rounded-lg transition-colors ${currentAction.position === 'after'
                                                    ? 'border-sage-500 bg-sage-100 text-sage-700'
                                                    : 'border-wool-200 hover:border-sage-300'
                                                    }`}
                                            >
                                                After marker
                                            </button>


                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Step 3: Distance */}
                            {currentAction.position && (
                                <div>
                                    <label className="form-label">How far from marker?</label>
                                    <div className="bg-yarn-50 border-2 border-wool-200 rounded-xl p-4">
                                        <div className="grid grid-cols-4 gap-2">
                                            <button
                                                onClick={() => updateAction('distance', 'at')}
                                                className={`p-3 text-sm border-2 rounded-lg transition-colors ${currentAction.distance === 'at'
                                                    ? 'border-sage-500 bg-sage-100 text-sage-700'
                                                    : 'border-wool-200 hover:border-sage-300'
                                                    }`}
                                            >
                                                0 st
                                            </button>
                                            <button
                                                onClick={() => updateAction('distance', '1')}
                                                className={`p-3 text-sm border-2 rounded-lg transition-colors ${currentAction.distance === '1'
                                                    ? 'border-sage-500 bg-sage-100 text-sage-700'
                                                    : 'border-wool-200 hover:border-sage-300'
                                                    }`}
                                            >
                                                1 st
                                            </button>
                                            <button
                                                onClick={() => updateAction('distance', '2')}
                                                className={`p-3 text-sm border-2 rounded-lg transition-colors ${currentAction.distance === '2'
                                                    ? 'border-sage-500 bg-sage-100 text-sage-700'
                                                    : 'border-wool-200 hover:border-sage-300'
                                                    }`}
                                            >
                                                2 sts
                                            </button>
                                            <button
                                                onClick={() => updateAction('distance', '3')}
                                                className={`p-3 text-sm border-2 rounded-lg transition-colors ${currentAction.distance === '3'
                                                    ? 'border-sage-500 bg-sage-100 text-sage-700'
                                                    : 'border-wool-200 hover:border-sage-300'
                                                    }`}
                                            >
                                                3 sts
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Step 4: Technique */}
                            {currentAction.distance && (

                                <div className="flex gap-3">
                                    {/* Before markers */}
                                    {currentAction.position === 'before' && currentAction.actionType === 'increase' && (
                                        <div className="bg-yarn-50 border-2 border-wool-200 rounded-xl p-4">
                                            <div className="grid grid-cols-2 gap-2">
                                                <button
                                                    onClick={() => updateAction('technique', 'M1L')}
                                                    className={`p-3 text-sm border-2 rounded-lg transition-colors ${currentAction.technique === 'M1L'
                                                        ? 'border-sage-500 bg-sage-100 text-sage-700'
                                                        : 'border-wool-200 hover:border-sage-300'
                                                        }`}
                                                >
                                                    M1L
                                                </button>
                                                <button
                                                    onClick={() => updateAction('technique', 'KFB')}
                                                    className={`p-3 text-sm border-2 rounded-lg transition-colors ${currentAction.technique === 'KFB'
                                                        ? 'border-sage-500 bg-sage-100 text-sage-700'
                                                        : 'border-wool-200 hover:border-sage-300'
                                                        }`}
                                                >
                                                    KFB
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {currentAction.position === 'before' && currentAction.actionType === 'decrease' && (
                                        <div className="bg-yarn-50 border-2 border-wool-200 rounded-xl p-4">
                                            <button
                                                onClick={() => updateAction('technique', 'SSK')}
                                                className={`w-full p-3 text-sm border-2 rounded-lg transition-colors ${currentAction.technique === 'SSK'
                                                    ? 'border-sage-500 bg-sage-100 text-sage-700'
                                                    : 'border-wool-200 hover:border-sage-300'
                                                    }`}
                                            >
                                                SSK
                                            </button>
                                        </div>
                                    )}

                                    {/* After markers */}
                                    {currentAction.position === 'after' && currentAction.actionType === 'increase' && (
                                        <div className="bg-yarn-50 border-2 border-wool-200 rounded-xl p-4">
                                            <div className="grid grid-cols-2 gap-2">
                                                <button
                                                    onClick={() => updateAction('technique', 'M1R')}
                                                    className={`p-3 text-sm border-2 rounded-lg transition-colors ${currentAction.technique === 'M1R'
                                                        ? 'border-sage-500 bg-sage-100 text-sage-700'
                                                        : 'border-wool-200 hover:border-sage-300'
                                                        }`}
                                                >
                                                    M1R
                                                </button>
                                                <button
                                                    onClick={() => updateAction('technique', 'KFB')}
                                                    className={`p-3 text-sm border-2 rounded-lg transition-colors ${currentAction.technique === 'KFB'
                                                        ? 'border-sage-500 bg-sage-100 text-sage-700'
                                                        : 'border-wool-200 hover:border-sage-300'
                                                        }`}
                                                >
                                                    KFB
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {currentAction.position === 'after' && currentAction.actionType === 'decrease' && (
                                        <div className="bg-yarn-50 border-2 border-wool-200 rounded-xl p-4">
                                            <button
                                                onClick={() => updateAction('technique', 'K2tog')}
                                                className={`w-full p-3 text-sm border-2 rounded-lg transition-colors ${currentAction.technique === 'K2tog'
                                                    ? 'border-sage-500 bg-sage-100 text-sage-700'
                                                    : 'border-wool-200 hover:border-sage-300'
                                                    }`}
                                            >
                                                K2tog
                                            </button>
                                        </div>
                                    )}

                                    {currentAction.position === 'at' && currentAction.actionType === 'decrease' && (
                                        <div className="bg-yarn-50 border-2 border-wool-200 rounded-xl p-4">
                                            <button
                                                onClick={() => updateAction('technique', 'CDD')}
                                                className={`w-full p-3 text-sm border-2 rounded-lg transition-colors ${currentAction.technique === 'CDD'
                                                    ? 'border-sage-500 bg-sage-100 text-sage-700'
                                                    : 'border-wool-200 hover:border-sage-300'
                                                    }`}
                                            >
                                                CDD
                                            </button>
                                        </div>
                                    )}
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
                                                className="px-4 py-2 text-sm border-2 rounded-lg transition-colors border-wool-200 hover:border-sage-300"
                                            >
                                                Bind Off All
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Step 5: Targets */}
                            {(currentAction.technique || currentAction.bindOffAmount) && currentAction.actionType !== 'continue' && (
                                <div>
                                    <label className="form-label">Which markers/positions?</label>
                                    <div className="bg-yarn-50 border-2 border-wool-200 rounded-xl p-4">
                                        <div className="flex flex-wrap gap-2">
                                            {(currentAction.actionType === 'bind_off'
                                                ? availableTargets.filter(t => t.value !== 'end')
                                                : availableTargets
                                            ).map(target => (
                                                target.type === 'marker' ? (
                                                    <button
                                                        key={target.value}
                                                        onClick={() => toggleTarget(target.value)}
                                                        className={`px-3 py-2 rounded-full font-medium border-2 transition-colors ${currentAction.targets.includes(target.value)
                                                            ? `${getMarkerColor(target.value, markerColors).bg} ${getMarkerColor(target.value, markerColors).border} ${getMarkerColor(target.value, markerColors).text} ring-2 ring-sage-500 ring-opacity-30`
                                                            : `${getMarkerColor(target.value, markerColors).bg} ${getMarkerColor(target.value, markerColors).border} ${getMarkerColor(target.value, markerColors).text} hover:ring-2 hover:ring-sage-300 hover:ring-opacity-50`
                                                            }`}
                                                    >
                                                        {target.value}
                                                    </button>
                                                ) : (
                                                    <button
                                                        key={target.value}
                                                        onClick={() => toggleTarget(target.value)}
                                                        className={`px-3 py-2 border-2 rounded-lg font-medium transition-colors ${currentAction.targets.includes(target.value)
                                                            ? 'border-sage-500 bg-sage-100 text-sage-700'
                                                            : 'border-wool-200 hover:border-sage-300'
                                                            }`}
                                                    >
                                                        {target.label}
                                                    </button>
                                                )
                                            ))}
                                        </div>

                                        {currentAction.targets.length > 0 && (
                                            <div className="mt-3 pt-3 border-t border-wool-100">
                                                <p className="text-sm text-sage-600">
                                                    Selected: {currentAction.targets.filter(target => target !== 'continue').join(', ')}
                                                </p>
                                            </div>
                                        )}
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
                            <label className="form-label">Number of Times vs Target Stitch Count</label>
                            <div className="bg-yarn-50 border-2 border-wool-200 rounded-xl p-4">
                                <div className="grid grid-cols-2 gap-2 mb-4">
                                    <div
                                        onClick={() => setTiming(prev => ({ ...prev, amountMode: 'times' }))}
                                        className={`p-3 text-sm border-2 rounded-lg cursor-pointer transition-colors ${(timing.amountMode || 'times') === 'times'
                                            ? 'border-sage-500 bg-sage-100 text-sage-700'
                                            : 'border-wool-200 hover:border-sage-300'
                                            }`}
                                    >
                                        Number of Times
                                    </div>
                                    <div
                                        onClick={() => setTiming(prev => ({ ...prev, amountMode: 'target' }))}
                                        className={`p-3 text-sm border-2 rounded-lg cursor-pointer transition-colors ${timing.amountMode === 'target'
                                            ? 'border-sage-500 bg-sage-100 text-sage-700'
                                            : 'border-wool-200 hover:border-sage-300'
                                            }`}
                                    >
                                        Target Stitch Count
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