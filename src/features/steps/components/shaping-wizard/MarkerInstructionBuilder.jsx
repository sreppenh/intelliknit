import React, { useState, useMemo, useEffect } from 'react';
import IncrementInput from '../../../../shared/components/IncrementInput';
import MarkerArrayVisualization from '../../../../shared/components/MarkerArrayVisualization';
import IntelliKnitLogger from '../../../../shared/utils/ConsoleLogging';
import { generateMarkerFlowInstruction, generateMarkerInstructionPreview } from '../../../../shared/utils/markerInstructionUtils';


// Utility to get marker color based on markerName and markerColors
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

// Reusable MarkerChip component
const MarkerChip = ({ marker, active, onClick, markerColors }) => {
    const style = getMarkerColor(marker, markerColors);
    return (
        <button
            type="button"
            onClick={onClick}
            className={`relative px-3 py-2 rounded-full font-medium transition-colors 
                ${active ? `${style.bg} ${style.text} card-marker-select-compact-selected` :
                    `${style.bg} ${style.text} hover:ring-2 hover:ring-sage-300 hover:ring-opacity-50`}`}
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

// Reusable SelectionGrid component
const SelectionGrid = ({ options, selected, onSelect, columns = 3, compact = false }) => {
    const getGridClass = () => {
        switch (columns) {
            case 2: return 'grid-cols-2';
            case 3: return 'grid-cols-3';
            case 4: return 'grid-cols-4';
            default: return 'grid-cols-3';
        }
    };

    return (
        <div className={`grid ${getGridClass()} gap-2`}>

            {options.map(option => (
                <div
                    key={option.value}
                    onClick={() => onSelect(option.value)}
                    className={`card-marker-select${compact ? '-compact' : ''} 
                    ${selected === option.value ? `${compact ? 'card-marker-select-compact-selected' : 'card-marker-select-selected'}` : ''}`}
                >
                    <div className="font-medium text-sm">{option.label}</div>
                </div>
            ))}
        </div>
    );
};

// Main component
const MarkerInstructionBuilder = ({
    markerArray = [],
    markerColors = {},
    construction = 'flat',
    onComplete,
    onCancel,
    wizard
}) => {
    const [currentStep, setCurrentStep] = useState('action-type');
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
    const [completedActions, setCompletedActions] = useState([]);
    const [timing, setTiming] = useState({
        frequency: 2,
        times: 10,
        rows: 1,
        amountMode: 'times',
        targetStitches: null
    });

    // Available targets based on construction
    const availableTargets = useMemo(() => {
        const targets = markerArray
            .filter(item => typeof item === 'string' && item !== 'BOR')
            .map(marker => ({ value: marker, label: marker, type: 'marker' }));
        if (construction === 'round') {
            if (markerArray.includes('BOR')) {
                targets.push({ value: 'BOR', label: 'BOR', type: 'bor' });
            }
        } else {
            targets.push({ value: 'beginning', label: 'Beginning', type: 'edge' });
            targets.push({ value: 'end', label: 'End', type: 'edge' });
        }
        return targets;
    }, [markerArray, construction]);

    // Get valid distance options
    const getValidDistanceOptions = () => ['at', '1', '2', '3'];

    // Get valid targets
    const getValidTargets = () => {
        let validTargets = [...availableTargets];
        if (construction === 'flat') {
            validTargets = validTargets.filter(t =>
                currentAction.whereType === 'markers' ? (t.type === 'marker' || t.type === 'bor') : t.type === 'edge');
        }
        if (currentAction.position === 'before') {
            validTargets = validTargets.filter(t => t.value !== 'beginning');
        } else if (currentAction.position === 'after') {
            validTargets = validTargets.filter(t => t.value !== 'end');
        }
        if (currentAction.actionType === 'bind_off') {
            validTargets = validTargets.filter(t => t.value !== 'end');
        }
        return validTargets;
    };

    // Update action with validation
    const updateAction = (updates) => {
        setCurrentAction(prev => {
            const updated = { ...prev, ...updates };
            if (updates.whereType) {
                updated.position = '';
                updated.technique = '';
                updated.distance = '';
                updated.targets = [];
            }
            if (updates.position) {
                updated.technique = '';
                updated.distance = '';
                // Note: Target validation happens in UI render, not here
            }
            if (updates.distance && updated.whereType === 'markers') {
                updated.technique = '';
            }
            if (updates.actionType) {
                updated.whereType = '';
                updated.position = '';
                updated.technique = '';
                updated.distance = '';
                updated.targets = [];
                updated.bindOffAmount = '';
                updated.stitchCount = 1;
            }
            return updated;
        });
    };

    // Toggle target selection
    const toggleTarget = (target) => {
        setCurrentAction(prev => ({
            ...prev,
            targets: prev.targets.includes(target) ? prev.targets.filter(t => t !== target) : [...prev.targets, target]
        }));
    };

    // Add action to completed list
    const addAction = () => {
        setCompletedActions(prev => [...prev, { ...currentAction }]);
        setCurrentAction({
            actionType: '',
            technique: '',
            position: '',
            distance: '',
            bindOffAmount: '',
            stitchCount: 1,
            targets: [],
            whereType: 'markers'
        });
        setCurrentStep('action-type');
    };

    // Continue to timing
    const continueToTiming = () => {
        if (currentAction.actionType === 'continue') {
            addAction();
            setCurrentStep('timing');
            return;
        }
        if (currentAction.actionType && currentAction.targets.length > 0) {
            addAction();
        }
        setCurrentStep('timing');
    };

    // Helper to get descriptive label for techniques
    const getTechniqueLabel = (technique, position) => {
        if (position === 'both_ends') {
            switch (technique) {
                case 'M1L_M1R':
                    return 'M1L & M1R';
                case 'YO_YO':
                    return 'YO & YO';
                case 'SSK_K2tog':
                    return 'SSK & K2tog';
                case 'K3tog_K3tog':
                    return 'K3tog & K3tog';
                default:
                    return technique;
            }
        }
        return technique;
    };

    // Generate preview
    // Generate preview - now uses centralized utility
    const generatePreview = () => {
        const allActions = [...completedActions];
        if (currentAction.actionType && (currentAction.targets.length > 0 || currentAction.actionType === 'bind_off')) {
            allActions.push(currentAction);
        }

        // DEBUG: Log the data being passed
        console.log('generatePreview DEBUG:', {
            currentAction,
            allActions,
            'allActions.length': allActions.length
        });


        const basePattern = wizard?.wizardData?.stitchPattern?.pattern || 'pattern';

        // Use centralized function that preserves all existing logic
        return generateMarkerInstructionPreview(allActions, timing, markerArray, construction, basePattern);
    };

    // Complete instruction
    const handleComplete = () => {
        const finalActions = [...completedActions];
        if (currentAction.actionType && (currentAction.targets.length > 0 || currentAction.actionType === 'continue')) {
            finalActions.push(currentAction);
        }
        const instructionData = {
            actions: finalActions,
            timing,
            preview: generatePreview(),
            construction
        };
        IntelliKnitLogger.success('Marker instruction completed', instructionData);
        onComplete(instructionData);
    };

    // Preview helpers
    const shouldShowPreview = () => (
        completedActions.length > 0 ||
        (currentAction.actionType && currentAction.actionType !== '') ||
        currentStep === 'timing'
    );

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
            if (!timing.frequency || (!timing.times && !timing.targetStitches)) {
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

    // Auto-advance for 'continue' action
    useEffect(() => {
        if (currentAction.actionType === 'continue') {
            setCurrentStep('timing');
        }
    }, [currentAction.actionType]);

    // Subcomponents
    const ActionTypeSelector = () => (
        <div>
            <label className="form-label">What happens?</label>
            <div className="bg-yarn-50 border-2 border-wool-200 rounded-xl p-4">
                <SelectionGrid
                    options={[
                        { value: 'increase', label: 'Add Increases' },
                        { value: 'decrease', label: 'Add Decreases' },
                        { value: 'bind_off', label: 'Bind Off' },
                        { value: 'continue', label: 'Work Pattern' }
                    ]}
                    selected={currentAction.actionType}
                    onSelect={(value) => updateAction({ actionType: value })}
                    columns={2}
                />
            </div>
        </div>
    );

    const WhereSelector = () => construction === 'flat' && currentAction.actionType && currentAction.actionType !== 'continue' && currentAction.actionType !== 'bind_off' ? (
        <div>
            <label className="form-label">Where?</label>
            <div className="bg-yarn-50 border-2 border-wool-200 rounded-xl p-4 space-y-4">
                <SelectionGrid
                    options={[
                        { value: 'markers', label: 'At Markers' },
                        { value: 'edges', label: 'At Row Edges' }
                    ]}
                    selected={currentAction.whereType}
                    onSelect={(value) => updateAction({ whereType: value })}
                    columns={2}
                />
                {currentAction.whereType && (
                    <TargetSelector />
                )}
            </div>
        </div>
    ) : null;

    const TargetSelector = () => (
        <div>
            <label className="form-label text-sm">Which {currentAction.whereType === 'markers' ? 'markers' : 'edges'}?</label>
            <div className="flex flex-wrap gap-2">
                {currentAction.whereType === 'markers' ? (
                    <>
                        {getValidTargets().filter(t => t.type === 'marker' || t.type === 'bor').map(target => (
                            <MarkerChip
                                key={target.value}
                                marker={target.value}
                                active={currentAction.targets.includes(target.value)}
                                onClick={() => toggleTarget(target.value)}
                                markerColors={markerColors}
                            />
                        ))}
                        {getValidTargets().filter(t => t.type === 'marker' || t.type === 'bor').length > 1 && (
                            <button
                                onClick={() => updateAction({
                                    targets: [...currentAction.targets.filter(t => ['beginning', 'end'].includes(t)),
                                    ...getValidTargets().filter(t => t.type === 'marker' || t.type === 'bor').map(t => t.value)]
                                })}
                                className="px-3 py-2 rounded-full font-medium transition-colors border-2 border-dashed border-sage-400 text-sage-600 hover:border-sage-500 hover:bg-sage-50"
                            >
                                + All Markers
                            </button>
                        )}
                    </>
                ) : (
                    <SelectionGrid
                        options={[
                            { value: 'at_beginning', label: 'Beginning' },
                            { value: 'at_end', label: 'End' },
                            { value: 'both_ends', label: 'Both' }
                        ]}
                        selected={currentAction.position}
                        onSelect={(value) => updateAction({
                            position: value,
                            targets: value === 'both_ends' ? ['beginning', 'end'] : [value.replace('at_', '')]
                        })}
                        columns={3}
                        compact
                    />
                )}
            </div>
            {currentAction.targets.length > 0 && currentAction.whereType === 'markers' && (
                <div className="mt-3 pt-3 border-t border-wool-100">
                    <p className="text-sm text-sage-600">Selected: {currentAction.targets.filter(t => t !== 'continue').join(', ')}</p>
                </div>
            )}
            {currentAction.whereType === 'edges' && currentAction.targets.length > 0 && (
                <EdgeDistanceSelector />
            )}
        </div>
    );

    const EdgeDistanceSelector = () => (
        <div className="mt-4">
            <label className="form-label text-sm">Distance from edge</label>
            <SelectionGrid
                options={getValidDistanceOptions().map(d => ({ value: d, label: d === 'at' ? '0 st' : `${d} st${d === '1' ? '' : 's'}` }))}
                selected={currentAction.distance}
                onSelect={(value) => updateAction({ distance: value })}
                columns={4}
                compact
            />
            {currentAction.distance === 'at' && currentAction.actionType === 'increase' && (
                <CastOnSelector />
            )}
            {currentAction.distance === 'at' && currentAction.actionType === 'decrease' && (
                <EdgeDecreaseAtSelector />
            )}
            {currentAction.distance && currentAction.distance !== 'at' && (
                <EdgeTechniqueSelector />
            )}
        </div>
    );

    const CastOnSelector = () => (
        <div className="mt-4">
            <label className="form-label text-sm">Cast-on technique</label>
            <SelectionGrid
                options={[
                    { value: 'Cable Cast On', label: 'Cable Cast On' },
                    { value: 'Backwards Loop', label: 'Backwards Loop' }
                ]}
                selected={currentAction.technique}
                onSelect={(value) => updateAction({ technique: value })}
                columns={2}
                compact
            />
            {currentAction.technique && (
                <div className="mt-3">
                    <label className="form-label text-sm">
                        {currentAction.position === 'both_ends' ? 'How many stitches to cast on each end?' : 'How many stitches to cast on?'}
                    </label>
                    <IncrementInput
                        value={currentAction.stitchCount}
                        onChange={(value) => updateAction({ stitchCount: Math.max(value, 1) })}
                        min={1}
                        max={100}
                        size="sm"
                    />
                </div>
            )}
        </div>
    );

    const EdgeTechniqueSelector = () => {
        const techniques = currentAction.actionType === 'increase' ?
            (currentAction.position === 'at_beginning' ? ['M1L', 'YO', 'KFB'] :
                currentAction.position === 'at_end' ? ['M1R', 'YO', 'KFB'] :
                    ['M1L_M1R', 'YO_YO']) :
            (currentAction.position === 'at_beginning' ? ['SSK', 'K2tog', 'CDD'] :
                currentAction.position === 'at_end' ? ['SSK', 'K2tog', 'CDD'] :
                    ['SSK_K2tog', 'K3tog_K3tog']);
        return (
            <div className="mt-4">
                <label className="form-label text-sm">Technique</label>
                <SelectionGrid
                    options={techniques.map(t => ({ value: t, label: getTechniqueLabel(t, currentAction.position) }))}
                    selected={currentAction.technique}
                    onSelect={(value) => updateAction({ technique: value })}
                    columns={currentAction.position === 'both_ends' ? 2 : 3}
                    compact
                />
            </div>
        );
    };

    const EdgeDecreaseAtSelector = () => {
        const techniques = currentAction.position === 'at_beginning' ? ['SSK', 'K2tog', 'CDD'] :
            currentAction.position === 'at_end' ? ['SSK', 'K2tog', 'CDD'] :
                ['SSK_K2tog', 'K3tog_K3tog'];
        return (
            <div className="mt-4">
                <label className="form-label text-sm">Technique</label>
                <SelectionGrid
                    options={techniques.map(t => ({ value: t, label: getTechniqueLabel(t, currentAction.position) }))}
                    selected={currentAction.technique}
                    onSelect={(value) => updateAction({ technique: value })}
                    columns={currentAction.position === 'both_ends' ? 2 : 3}
                    compact
                />
            </div>
        );
    };

    const PositionTechniqueSelector = () => (
        <div>
            <label className="form-label">{currentAction.actionType === 'increase' ? 'Increase' : 'Decrease'} where and how?</label>
            <div className="bg-yarn-50 border-2 border-wool-200 rounded-xl p-4 space-y-4">
                <div>
                    <label className="form-label text-sm">Position</label>
                    <SelectionGrid
                        options={[
                            { value: 'before', label: 'Before' },
                            { value: 'after', label: 'After' },
                            { value: 'before_and_after', label: 'Both' }
                        ]}
                        selected={currentAction.position}
                        onSelect={(value) => updateAction({
                            position: value,
                            technique: currentAction.actionType === 'increase' ?
                                (value === 'before' ? 'M1L' : value === 'after' ? 'M1R' : 'M1L_M1R') :
                                (value === 'before' ? 'SSK' : value === 'after' ? 'K2tog' : 'SSK_K2tog'),
                            distance: '1'
                        })}
                        columns={3}
                        compact
                    />
                </div>
                {currentAction.position && (
                    <div>
                        <label className="form-label text-sm">Technique</label>
                        <SelectionGrid
                            options={(currentAction.position === 'before' && currentAction.actionType === 'increase') ?
                                [{ value: 'M1L', label: 'M1L' }, { value: 'YO', label: 'YO' }, { value: 'KFB', label: 'KFB' }] :
                                (currentAction.position === 'before' && currentAction.actionType === 'decrease') ?
                                    [{ value: 'SSK', label: 'SSK' }, { value: 'K3tog', label: 'K3tog' }, { value: 'CDD', label: 'CDD' }] :
                                    (currentAction.position === 'after' && currentAction.actionType === 'increase') ?
                                        [{ value: 'M1R', label: 'M1R' }, { value: 'YO', label: 'YO' }, { value: 'KFB', label: 'KFB' }] :
                                        (currentAction.position === 'after' && currentAction.actionType === 'decrease') ?
                                            [{ value: 'K2tog', label: 'K2tog' }, { value: 'K3tog', label: 'K3tog' }, { value: 'CDD', label: 'CDD' }] :
                                            (currentAction.position === 'before_and_after' && currentAction.actionType === 'increase') ?
                                                [{ value: 'M1L_M1R', label: 'M1L & M1R' }, { value: 'YO_YO', label: 'YO & YO' }] :
                                                [{ value: 'SSK_K2tog', label: 'SSK & K2tog' }, { value: 'K3tog_K3tog', label: 'K3tog & K3tog' }]}
                            selected={currentAction.technique}
                            onSelect={(value) => updateAction({ technique: value })}
                            columns={currentAction.position === 'before_and_after' ? 2 : 3}
                            compact
                        />
                    </div>
                )}
            </div>
        </div>
    );

    const DistanceSelector = () => (
        <div>
            <label className="form-label">Stitches between technique and marker?</label>
            <div className="bg-yarn-50 border-2 border-wool-200 rounded-xl p-4">
                <SelectionGrid
                    options={getValidDistanceOptions().map(d => ({ value: d, label: d === 'at' ? '0 st' : `${d} st${d === '1' ? '' : 's'}` }))}
                    selected={currentAction.distance}
                    onSelect={(value) => updateAction({ distance: value })}
                    columns={4}
                    compact
                />
            </div>
        </div>
    );

    const MarkerPositionDistanceTechnique = () => (
        <div>
            <label className="form-label">{currentAction.actionType === 'increase' ? 'Increase' : 'Decrease'} where and how?</label>
            <div className="bg-yarn-50 border-2 border-wool-200 rounded-xl p-4 space-y-4">
                <div>
                    <label className="form-label text-sm">Position</label>
                    <SelectionGrid
                        options={[
                            { value: 'before', label: 'Before' },
                            { value: 'after', label: 'After' },
                            { value: 'before_and_after', label: 'Both' }
                        ]}
                        selected={currentAction.position}
                        onSelect={(value) => updateAction({ position: value })}
                        columns={3}
                        compact
                    />
                </div>
                {currentAction.position && (
                    <div>
                        <label className="form-label text-sm">Stitches between technique and marker?</label>
                        <SelectionGrid
                            options={getValidDistanceOptions().map(d => ({ value: d, label: d === 'at' ? '0 st' : `${d} st${d === '1' ? '' : 's'}` }))}
                            selected={currentAction.distance}
                            onSelect={(value) => updateAction({ distance: value })}
                            columns={4}
                            compact
                        />
                    </div>
                )}
                {currentAction.distance && (
                    <div>
                        <label className="form-label text-sm">Technique</label>
                        <SelectionGrid
                            options={(currentAction.position === 'before' && currentAction.actionType === 'increase') ?
                                [{ value: 'M1L', label: 'M1L' }, { value: 'YO', label: 'YO' }, { value: 'KFB', label: 'KFB' }] :
                                (currentAction.position === 'before' && currentAction.actionType === 'decrease') ?
                                    [{ value: 'SSK', label: 'SSK' }, { value: 'K3tog', label: 'K3tog' }, { value: 'CDD', label: 'CDD' }] :
                                    (currentAction.position === 'after' && currentAction.actionType === 'increase') ?
                                        [{ value: 'M1R', label: 'M1R' }, { value: 'YO', label: 'YO' }, { value: 'KFB', label: 'KFB' }] :
                                        (currentAction.position === 'after' && currentAction.actionType === 'decrease') ?
                                            [{ value: 'K2tog', label: 'K2tog' }, { value: 'K3tog', label: 'K3tog' }, { value: 'CDD', label: 'CDD' }] :
                                            (currentAction.position === 'before_and_after' && currentAction.actionType === 'increase') ?
                                                [{ value: 'M1L_M1R', label: 'M1L & M1R' }, { value: 'YO_YO', label: 'YO & YO' }] :
                                                [{ value: 'SSK_K2tog', label: 'SSK & K2tog' }, { value: 'K3tog_K3tog', label: 'K3tog & K3tog' }]}
                            selected={currentAction.technique}
                            onSelect={(value) => updateAction({ technique: value })}
                            columns={currentAction.position === 'before_and_after' ? 2 : 3}
                            compact
                        />
                    </div>
                )}
            </div>
        </div>
    );

    const BindOffSelector = () => (
        <div>
            <label className="form-label">How many stitches to bind off?</label>
            <div className="bg-yarn-50 border-2 border-wool-200 rounded-xl p-4">
                <div className="flex items-center gap-3">
                    <IncrementInput
                        value={currentAction.stitchCount}
                        onChange={(value) => {
                            const totalStitches = markerArray.filter(item => typeof item === 'number').reduce((sum, stitches) => sum + stitches, 0);
                            updateAction({
                                stitchCount: Math.min(value, totalStitches),
                                position: 'at_beginning',
                                targets: ['beginning'],
                                bindOffAmount: 'specific'
                            });
                        }}
                        min={1}
                        max={markerArray.filter(item => typeof item === 'number').reduce((sum, stitches) => sum + stitches, 0)}
                        size="sm"
                    />
                    <button
                        onClick={() => {
                            const totalStitches = markerArray.filter(item => typeof item === 'number').reduce((sum, stitches) => sum + stitches, 0);
                            updateAction({
                                stitchCount: totalStitches,
                                position: 'at_beginning',
                                targets: ['beginning'],
                                bindOffAmount: 'all'
                            });
                        }}
                        className="btn-secondary btn-sm"
                    >
                        Bind Off All
                    </button>
                </div>
            </div>
        </div>
    );

    const ActionButtons = () => (
        <div className="flex gap-3 pt-4 border-t">
            <button onClick={addAction} className="btn-secondary">AND (add another action)</button>
            <button onClick={continueToTiming} className="btn-primary">Set Frequency & Times →</button>
        </div>
    );

    const FrequencyTimingSelector = () => (
        <div className="card">
            <h4 className="section-header-secondary">Frequency & Times</h4>
            <div className="space-y-6">
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
                <div>
                    <label className="form-label">Number of Times vs Target Stitches</label>
                    <div className="bg-yarn-50 border-2 border-wool-200 rounded-xl p-4">
                        <SelectionGrid
                            options={[
                                { value: 'times', label: 'Number of Times' },
                                { value: 'target', label: 'Target Stitches' }
                            ]}
                            selected={timing.amountMode || 'times'}
                            onSelect={(value) => setTiming(prev => ({ ...prev, amountMode: value }))}
                            columns={2}
                            compact
                        />
                        <div className="mt-4">
                            {timing.amountMode === 'target' ? (
                                <IncrementInput
                                    value={timing.targetStitches || 0}
                                    onChange={(value) => setTiming(prev => ({ ...prev, targetStitches: value }))}
                                    unit="stitches"
                                    min={0}
                                    size="sm"
                                />
                            ) : (
                                <IncrementInput
                                    value={timing.times}
                                    onChange={(value) => setTiming(prev => ({ ...prev, times: Math.max(value, 1) }))}
                                    unit="times"
                                    min={1}
                                    max={50}
                                    size="sm"
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const PreviewSection = () => shouldShowPreview() ? (
        <div className="card-info">
            <h4 className="section-header-secondary flex items-center justify-between">
                {getPreviewTitle()}
                {(completedActions.length > 0 || (currentAction.actionType && currentAction.targets.length > 0)) && (
                    <span className="text-xs bg-lavender-600 text-white px-2 py-1 rounded-full">
                        {completedActions.length + (currentAction.actionType && currentAction.targets.length > 0 ? 1 : 0)}
                        {completedActions.length + (currentAction.actionType && currentAction.targets.length > 0 ? 1 : 0) === 1 ? ' action' : ' actions'}
                    </span>
                )}
            </h4>
            <div className="bg-white rounded-lg p-3 border border-lavender-200">
                <p className="text-sm text-lavender-700 font-medium text-left">
                    {generatePreview()}
                </p>
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
            <p className="text-xs text-lavender-600 mt-2">{getPreviewSubtext()}</p>
        </div>
    ) : null;

    return (
        <div className="space-y-6">
            <div className="card bg-sage-50 border-sage-200">
                <h4 className="section-header-secondary">Marker Positioning</h4>
                <MarkerArrayVisualization
                    stitchArray={markerArray}
                    construction={construction}
                    showActions={false}
                    markerColors={markerColors}
                />
            </div>
            <div className="card">
                <h4 className="section-header-secondary">Define Row Actions</h4>
                <div className="space-y-6">
                    <ActionTypeSelector />
                    {currentAction.actionType !== 'continue' && (
                        <>
                            {currentAction.actionType !== 'bind_off' && (construction === 'round' ? (
                                <div>
                                    <label className="form-label">Which markers?</label>
                                    <div className="bg-yarn-50 border-2 border-wool-200 rounded-xl p-4">
                                        <div className="flex flex-wrap gap-2">
                                            {getValidTargets().filter(t => t.type === 'marker' || t.type === 'bor').map(target => (
                                                <MarkerChip
                                                    key={target.value}
                                                    marker={target.value}
                                                    active={currentAction.targets.includes(target.value)}
                                                    onClick={() => toggleTarget(target.value)}
                                                    markerColors={markerColors}
                                                />
                                            ))}
                                            {getValidTargets().filter(t => t.type === 'marker' || t.type === 'bor').length > 1 && (
                                                <button
                                                    onClick={() => updateAction({
                                                        targets: getValidTargets().filter(t => t.type === 'marker' || t.type === 'bor').map(t => t.value)
                                                    })}
                                                    className="px-3 py-2 rounded-full font-medium transition-colors border-2 border-dashed border-sage-400 text-sage-600 hover:border-sage-500 hover:bg-sage-50"
                                                >
                                                    + All Markers
                                                </button>
                                            )}
                                        </div>
                                        {currentAction.targets.length > 0 && (
                                            <div className="mt-3 pt-3 border-t border-wool-100">
                                                <p className="text-sm text-sage-600">Selected: {currentAction.targets.join(', ')}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <WhereSelector />
                            ))}
                            {currentAction.targets.length > 0 && (currentAction.actionType === 'increase' || currentAction.actionType === 'decrease') && currentAction.whereType !== 'edges' && (
                                <MarkerPositionDistanceTechnique />
                            )}
                            {currentAction.actionType === 'bind_off' && (
                                <BindOffSelector />
                            )}
                            {currentAction.targets.length > 0 && (
                                <ActionButtons />
                            )}
                        </>
                    )}
                </div>
            </div>
            {currentStep === 'timing' && (
                <>
                    <FrequencyTimingSelector />
                    <PreviewSection />
                </>
            )}
            {currentStep !== 'timing' && <PreviewSection />}
            <div className="flex gap-3">
                <button onClick={onCancel} className="btn-tertiary flex-1">Cancel</button>
                {currentStep === 'timing' && (
                    <button onClick={handleComplete} className="btn-primary flex-1">Create Instruction</button>
                )}
            </div>
        </div>
    );
};

export default MarkerInstructionBuilder;
