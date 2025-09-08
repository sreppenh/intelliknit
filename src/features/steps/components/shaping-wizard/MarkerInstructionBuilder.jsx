// src/features/steps/components/shaping-wizard/MarkerInstructionBuilder.jsx
import React, { useState, useMemo } from 'react';
import IncrementInput from '../../../../shared/components/IncrementInput';
import MarkerArrayVisualization from '../../../../shared/components/MarkerArrayVisualization';
import IntelliKnitLogger from '../../../../shared/utils/ConsoleLogging';

// Get marker color styling (reuse from existing system)
const getMarkerStyle = (markerName) => {
    const prefix = markerName === 'BOR' ? 'BOR' : markerName.match(/^([A-Z]+)/)?.[1] || 'M';

    const colorMap = {
        'BOR': { bg: 'bg-sage-200', border: 'border-sage-500', text: 'text-sage-700' },
        'M': { bg: 'bg-sky-100', border: 'border-sky-400', text: 'text-sky-700' },
        'L': { bg: 'bg-emerald-100', border: 'border-emerald-400', text: 'text-emerald-700' },
        'R': { bg: 'bg-amber-100', border: 'border-amber-400', text: 'text-amber-700' },
        'S': { bg: 'bg-rose-100', border: 'border-rose-400', text: 'text-rose-700' },
        'V': { bg: 'bg-violet-100', border: 'border-violet-400', text: 'text-violet-700' },
        'W': { bg: 'bg-indigo-100', border: 'border-indigo-400', text: 'text-indigo-700' },
        'A': { bg: 'bg-purple-100', border: 'border-purple-400', text: 'text-purple-700' },
        'B': { bg: 'bg-teal-100', border: 'border-teal-400', text: 'text-teal-700' }
    };

    return colorMap[prefix] || colorMap['M'];
};

const MarkerInstructionBuilder = ({
    markerArray = [],
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
        rows: 1
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

    // Marker chip with color coding
    const MarkerChip = ({ marker, active, onClick }) => {
        const style = getMarkerStyle(marker);
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
                />
            </div>

            {/* Completed Actions Summary */}
            {completedActions.length > 0 && (
                <div className="card bg-sage-50 border-sage-200">
                    <h4 className="section-header-secondary">Current Instruction</h4>
                    <p className="text-sm text-sage-600">{generatePreview()}</p>
                </div>
            )}

            {/* Progressive Disclosure Steps */}
            <div className="card">
                <div className="space-y-6">

                    {/* Step 1: Action Type */}
                    <div>
                        <h4 className="section-header-secondary">What happens?</h4>
                        <div className="flex flex-wrap gap-3">
                            <Chip
                                large
                                active={currentAction.actionType === 'continue'}
                                onClick={() => updateAction('actionType', 'continue')}
                            >
                                Continue in Pattern
                            </Chip>
                            <Chip
                                large
                                active={currentAction.actionType === 'increase'}
                                onClick={() => updateAction('actionType', 'increase')}
                            >
                                Increase
                            </Chip>
                            <Chip
                                large
                                active={currentAction.actionType === 'decrease'}
                                onClick={() => updateAction('actionType', 'decrease')}
                            >
                                Decrease
                            </Chip>
                            <Chip
                                large
                                active={currentAction.actionType === 'bind_off'}
                                onClick={() => updateAction('actionType', 'bind_off')}
                            >
                                Bind Off
                            </Chip>
                        </div>
                    </div>

                    {/* Step 2: Duration (for continue in pattern) */}
                    {currentAction.actionType === 'continue' && (
                        <div>
                            <h4 className="section-header-secondary">Duration</h4>
                            <IncrementInput
                                label="Rows"
                                value={timing.rows}
                                onChange={(value) => setTiming(prev => ({ ...prev, rows: value }))}
                                min={1}
                                max={50}
                                unit={construction === 'round' ? 'rounds' : 'rows'}
                            />
                        </div>
                    )}

                    {/* Step 2: Position for Increase/Decrease */}
                    {(currentAction.actionType === 'increase' || currentAction.actionType === 'decrease') && (
                        <div>
                            <h4 className="section-header-secondary">
                                {currentAction.actionType === 'increase' ? 'Increase' : 'Decrease'}...
                            </h4>
                            <div className="flex gap-3">
                                <Chip
                                    active={currentAction.position === 'before'}
                                    onClick={() => {
                                        updateAction('position', 'before');
                                        updateAction('technique', currentAction.actionType === 'increase' ? 'M1L' : 'SSK');
                                    }}
                                >
                                    before markers
                                </Chip>
                                <Chip
                                    active={currentAction.position === 'after'}
                                    onClick={() => {
                                        updateAction('position', 'after');
                                        updateAction('technique', currentAction.actionType === 'increase' ? 'M1R' : 'K2tog');
                                    }}
                                >
                                    after markers
                                </Chip>
                                {currentAction.actionType === 'decrease' && (
                                    <Chip
                                        active={currentAction.position === 'at'}
                                        onClick={() => {
                                            updateAction('position', 'at');
                                            updateAction('technique', 'CDD');
                                        }}
                                    >
                                        at markers
                                    </Chip>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Step 3: Distance */}
                    {currentAction.position && (
                        <div>
                            <h4 className="section-header-secondary">How far from marker?</h4>
                            <div className="flex gap-3">
                                <Chip
                                    active={currentAction.distance === 'at'}
                                    onClick={() => updateAction('distance', 'at')}
                                >
                                    At marker
                                </Chip>
                                <Chip
                                    active={currentAction.distance === '1'}
                                    onClick={() => updateAction('distance', '1')}
                                >
                                    1 st
                                </Chip>
                                <Chip
                                    active={currentAction.distance === '2'}
                                    onClick={() => updateAction('distance', '2')}
                                >
                                    2 st
                                </Chip>
                                <Chip
                                    active={currentAction.distance === '3'}
                                    onClick={() => updateAction('distance', '3')}
                                >
                                    3 st
                                </Chip>
                            </div>
                        </div>
                    )}

                    {/* Step 4: Technique */}
                    {currentAction.distance && (
                        <div>
                            <h4 className="section-header-secondary">Using:</h4>
                            <div className="flex gap-3">
                                {/* Before markers */}
                                {currentAction.position === 'before' && currentAction.actionType === 'increase' && (
                                    <>
                                        <Chip
                                            active={currentAction.technique === 'M1L'}
                                            onClick={() => updateAction('technique', 'M1L')}
                                        >
                                            M1L
                                        </Chip>
                                        <Chip
                                            active={currentAction.technique === 'KFB'}
                                            onClick={() => updateAction('technique', 'KFB')}
                                        >
                                            KFB
                                        </Chip>
                                    </>
                                )}
                                {currentAction.position === 'before' && currentAction.actionType === 'decrease' && (
                                    <Chip
                                        active={currentAction.technique === 'SSK'}
                                        onClick={() => updateAction('technique', 'SSK')}
                                    >
                                        SSK
                                    </Chip>
                                )}

                                {/* After markers */}
                                {currentAction.position === 'after' && currentAction.actionType === 'increase' && (
                                    <>
                                        <Chip
                                            active={currentAction.technique === 'M1R'}
                                            onClick={() => updateAction('technique', 'M1R')}
                                        >
                                            M1R
                                        </Chip>
                                        <Chip
                                            active={currentAction.technique === 'KFB'}
                                            onClick={() => updateAction('technique', 'KFB')}
                                        >
                                            KFB
                                        </Chip>
                                    </>
                                )}
                                {currentAction.position === 'after' && currentAction.actionType === 'decrease' && (
                                    <Chip
                                        active={currentAction.technique === 'K2tog'}
                                        onClick={() => updateAction('technique', 'K2tog')}
                                    >
                                        K2tog
                                    </Chip>
                                )}

                                {/* At markers */}
                                {currentAction.position === 'at' && currentAction.actionType === 'decrease' && (
                                    <Chip
                                        active={currentAction.technique === 'CDD'}
                                        onClick={() => updateAction('technique', 'CDD')}
                                    >
                                        CDD
                                    </Chip>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Bind Off Amount */}
                    {currentAction.actionType === 'bind_off' && (
                        <div>
                            <h4 className="section-header-secondary">How many stitches?</h4>
                            <div className="space-y-3">
                                <Chip
                                    active={currentAction.bindOffAmount === 'all'}
                                    onClick={() => updateAction('bindOffAmount', 'all')}
                                >
                                    All remaining stitches
                                </Chip>
                                <div className="flex items-center gap-3">
                                    <Chip
                                        active={currentAction.bindOffAmount === 'specific'}
                                        onClick={() => updateAction('bindOffAmount', 'specific')}
                                    >
                                        Specific amount:
                                    </Chip>
                                    {currentAction.bindOffAmount === 'specific' && (
                                        <IncrementInput
                                            value={currentAction.stitchCount}
                                            onChange={(value) => updateAction('stitchCount', value)}
                                            min={1}
                                            max={50}
                                            unit="stitches"
                                        />
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 5: Targets */}
                    {(currentAction.technique || currentAction.bindOffAmount || currentAction.actionType === 'continue') && (
                        <div>
                            <h4 className="section-header-secondary">Which markers/positions?</h4>
                            <div className="flex flex-wrap gap-3">
                                {(currentAction.actionType === 'bind_off'
                                    ? availableTargets.filter(t => t.value !== 'end')
                                    : availableTargets
                                ).map(target => (
                                    target.type === 'marker' ? (
                                        <MarkerChip
                                            key={target.value}
                                            marker={target.value}
                                            active={currentAction.targets.includes(target.value)}
                                            onClick={() => toggleTarget(target.value)}
                                        />
                                    ) : (
                                        <Chip
                                            key={target.value}
                                            active={currentAction.targets.includes(target.value)}
                                            onClick={() => toggleTarget(target.value)}
                                        >
                                            {target.label}
                                        </Chip>
                                    )
                                ))}
                            </div>
                            {currentAction.targets.length > 0 && (
                                <p className="text-sm text-sage-600 mt-2">
                                    Selected: {currentAction.targets.join(', ')}
                                </p>
                            )}
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
                </div>
            </div>

            {/* Timing Configuration */}
            {currentStep === 'timing' && (
                <div className="card">
                    <h3 className="section-header-primary">Timing</h3>
                    <div className="space-y-4">
                        <IncrementInput
                            label="Frequency"
                            value={timing.frequency}
                            onChange={(value) => setTiming(prev => ({ ...prev, frequency: value }))}
                            min={1}
                            max={30}
                            unit={`every ${timing.frequency === 1 ? 'round' : `${timing.frequency} rounds`}`}
                            construction={construction}
                        />

                        <IncrementInput
                            label="Times"
                            value={timing.times}
                            onChange={(value) => setTiming(prev => ({ ...prev, times: value }))}
                            min={1}
                            max={50}
                            unit="times"
                        />
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