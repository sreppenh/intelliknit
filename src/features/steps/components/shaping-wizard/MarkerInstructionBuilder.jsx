import React, { useState, useMemo, useEffect } from 'react';
import IncrementInput from '../../../../shared/components/IncrementInput';
import MarkerArrayVisualization from '../../../../shared/components/MarkerArrayVisualization';
import IntelliKnitLogger from '../../../../shared/utils/ConsoleLogging';
import { generateMarkerFlowInstruction, generateMarkerInstructionPreview, getActionConfigDisplay } from '../../../../shared/utils/markerInstructionUtils';
import MarkerChip from '../../../../shared/components/MarkerChip';
import SelectionGrid from '../../../../shared/components/SelectionGrid';


// Utility to get marker color based on markerName and markerColors
const getMarkerColor = (markerName, markerColors) => {
    if (markerName === 'BOR') {
        return { bg: 'bg-lavender-200', border: 'border-lavender-500', text: 'text-lavender-700' };
    }
    const MARKER_COLOR_OPTIONS = [
        { bg: 'bg-sage-100', border: 'border-sage-400', text: 'text-sage-700' },
        { bg: 'bg-yarn-600', border: 'border-yarn-700', text: 'text-yarn-50' },
        { bg: 'bg-yarn-100', border: 'border-yarn-400', text: 'text-yarn-700' },
        { bg: 'bg-orange-200', border: 'border-orange-500', text: 'text-orange-800' }
    ];
    const colorIndex = markerColors[markerName] || 0;
    return MARKER_COLOR_OPTIONS[colorIndex];
};

// Conflict detection for markers and edges
const getPositionConflicts = (completedActions) => {
    const conflicts = new Map(); // target -> Set of conflicting positions

    completedActions.forEach(action => {
        if (action.actionType === 'continue') return; // Skip continue actions

        action.targets.forEach(target => {
            if (!conflicts.has(target)) {
                conflicts.set(target, new Set());
            }

            // Add position conflicts based on before_and_after rules
            if (action.position === 'before_and_after') {
                conflicts.get(target).add('before');
                conflicts.get(target).add('after');
                conflicts.get(target).add('before_and_after');
            } else {
                conflicts.get(target).add(action.position);
                conflicts.get(target).add('before_and_after'); // Both conflicts with any single
            }
        });
    });

    return conflicts;
};

// Check if a position conflicts with existing actions for given targets
const hasPositionConflict = (position, targets, completedActions) => {
    const conflicts = getPositionConflicts(completedActions);

    return targets.some(target =>
        conflicts.has(target) && conflicts.get(target).has(position)
    );
};

// Get available positions (not conflicting)
const getAvailablePositions = (targets, completedActions) => {
    const allPositions = ['before', 'after', 'before_and_after'];
    return allPositions.filter(position =>
        !hasPositionConflict(position, targets, completedActions)
    );
};

// Main component
const MarkerInstructionBuilder = ({
    markerArray = [],
    markerColors = {},
    construction = 'flat',
    onComplete,
    onCancel,
    onBack,
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

            // Complete cascade clearing logic
            if (updates.actionType) {
                // ActionType change clears everything
                updated.whereType = '';
                updated.position = '';
                updated.technique = '';
                updated.distance = '';
                updated.targets = [];
                updated.bindOffAmount = '';
                updated.stitchCount = 1;
            } else if (updates.whereType) {
                // WhereType change clears position and below
                updated.position = '';
                updated.targets = [];
                updated.distance = '';
                updated.technique = '';
            } else if (updates.position && !updates.targets) {
                // Position change clears targets and below (unless targets are being set simultaneously)
                updated.targets = [];
                updated.distance = '';
                updated.technique = '';
            } else if (updates.targets) {
                // Targets change clears distance and below
                updated.distance = '';
                updated.technique = '';
            } else if (updates.distance) {
                // Distance change clears technique
                updated.technique = '';
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
    const handleCompleteActions = () => {
        if (currentAction.actionType === 'continue') {
            addAction();
        }
        if (currentAction.actionType && currentAction.targets.length > 0) {
            addAction();
        }

        // Return just the actions (no timing)
        const finalActions = [...completedActions];
        if (currentAction.actionType && (currentAction.targets.length > 0 || currentAction.actionType === 'continue')) {
            finalActions.push(currentAction);
        }

        const actionsData = {
            actions: finalActions,
            construction
        };

        onComplete(actionsData);
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

    const isActionComplete = () => {
        if (!currentAction.actionType) return false;

        if (currentAction.actionType === 'continue') {
            return true;
        }

        if (currentAction.actionType === 'bind_off') {
            return currentAction.stitchCount > 0;
        }

        // For increase/decrease actions
        if (currentAction.targets.length === 0) return false;

        if (currentAction.whereType === 'edges') {
            return currentAction.position && currentAction.distance && currentAction.technique;
        }

        // For marker-based actions
        return currentAction.position && currentAction.distance && currentAction.technique;
    };

    const basePattern = wizard?.wizardData?.stitchPattern?.pattern || 'pattern';

    // Generate preview - now uses centralized utility
    const generatePreview = () => {
        const allActions = [...completedActions];
        if (currentAction.actionType && (currentAction.targets.length > 0 || currentAction.actionType === 'bind_off' || currentAction.actionType === 'continue')) {
            allActions.push(currentAction);
        }

        // Use empty timing for preview (no timing applied yet)
        const defaultTiming = { frequency: 1, times: 0, amountMode: 'times', targetStitches: null };
        return generateMarkerInstructionPreview(allActions, defaultTiming, markerArray, construction, basePattern);
    };

    // Preview helpers
    const shouldShowPreview = () => (
        completedActions.length > 0 ||
        (currentAction.actionType && currentAction.actionType !== '')
    );

    const getPreviewTitle = () => {
        if (completedActions.length > 0 && (!currentAction.actionType || currentAction.targets.length === 0)) {
            return "Phase Preview";
        }
        return "Building Phase...";
    };

    const getPreviewSubtext = () => {

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

    const ActionTypeCard = () => {
        const getActionTypeOptions = () => {
            const baseOptions = [
                { value: 'increase', label: 'Add Increases' },
                { value: 'decrease', label: 'Add Decreases' }
            ];

            if (construction === 'flat') {
                baseOptions.push({ value: 'bind_off', label: 'Bind Off' });
            }

            // Only show continue if no completed actions
            if (completedActions.length === 0) {
                baseOptions.push({ value: 'continue', label: 'Work Pattern' });
            }

            return baseOptions;
        };

        const options = getActionTypeOptions();
        const columns = options.length === 4 ? 2 : options.length;

        return (
            <>
                <label className="form-label">What happens?</label>
                <SelectionGrid
                    options={options}
                    selected={currentAction.actionType}
                    onSelect={(value) => updateAction({ actionType: value })}
                    columns={columns}
                />
            </>
        );
    };

    const WhereCard = () => construction === 'flat' && currentAction.actionType && currentAction.actionType !== 'continue' && currentAction.actionType !== 'bind_off' ? (
        <>
            <label className="form-label">Where?</label>
            <SelectionGrid
                options={[
                    { value: 'markers', label: 'At Markers' },
                    { value: 'edges', label: 'At Row Edges' }
                ]}
                selected={currentAction.whereType}
                onSelect={(value) => updateAction({ whereType: value })}
                columns={2}
            />
        </>
    ) : null;

    const PositionCard = () => (currentAction.whereType === 'markers' || construction === 'round') && currentAction.actionType && currentAction.actionType !== 'continue' && currentAction.actionType !== 'bind_off' ? (
        <>
            <label className="form-label">Position</label>
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
                disabled={getAvailablePositions(currentAction.targets, completedActions).length > 0
                    ? ['before', 'after', 'before_and_after'].filter(pos =>
                        !getAvailablePositions(currentAction.targets, completedActions).includes(pos)
                    )
                    : []
                }
            />
        </>
    ) : null;

    const TargetCard = () => {
        // Show targets if we have position (for markers) OR we're doing edges
        const shouldShow = (currentAction.position && (currentAction.whereType === 'markers' || construction === 'round')) ||
            (currentAction.whereType === 'edges');

        if (!shouldShow || !currentAction.actionType || currentAction.actionType === 'continue' || currentAction.actionType === 'bind_off') {
            return null;
        }

        // For flat construction with edges, show edge selection
        if (construction === 'flat' && currentAction.whereType === 'edges') {
            // Check which edges are conflicted
            const conflictedEdges = [];
            if (hasPositionConflict('at_beginning', ['beginning'], completedActions)) {
                conflictedEdges.push('at_beginning');
            }
            if (hasPositionConflict('at_end', ['end'], completedActions)) {
                conflictedEdges.push('at_end');
            }
            if (hasPositionConflict('both_ends', ['beginning', 'end'], completedActions)) {
                conflictedEdges.push('both_ends');
            }

            return (
                <>
                    <label className="form-label">Which edges?</label>
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
                        disabled={conflictedEdges}
                    />
                </>
            );
        }

        // For markers (both flat and round construction)
        return (
            <>
                <label className="form-label">Which markers?</label>
                <div className="flex flex-wrap gap-2">
                    {getValidTargets().filter(t => t.type === 'marker' || t.type === 'bor').map(target => {
                        const isConflicted = currentAction.position &&
                            hasPositionConflict(currentAction.position, [target.value], completedActions);

                        return (
                            <MarkerChip
                                key={target.value}
                                marker={target.value}
                                active={currentAction.targets.includes(target.value)}
                                onClick={() => toggleTarget(target.value)}
                                markerColors={markerColors}
                                disabled={isConflicted}
                            />
                        );
                    })}
                    {getValidTargets().filter(t => t.type === 'marker' || t.type === 'bor').length > 1 && (
                        <button
                            onClick={() => {
                                const validTargets = getValidTargets()
                                    .filter(t => t.type === 'marker' || t.type === 'bor')
                                    .filter(t => !currentAction.position ||
                                        !hasPositionConflict(currentAction.position, [t.value], completedActions)
                                    );
                                updateAction({
                                    targets: validTargets.map(t => t.value)
                                });
                            }}
                            className="px-3 py-2 rounded-full font-medium transition-colors border-2 border-dashed border-sage-400 text-sage-600 hover:border-sage-500 hover:bg-sage-50"
                        >
                            + All Available Markers
                        </button>
                    )}
                </div>
                {currentAction.targets.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-wool-100">
                        <p className="text-sm text-sage-600">Selected: {currentAction.targets.join(', ')}</p>
                    </div>
                )}
            </>
        );
    };

    const DistanceCard = () => currentAction.targets.length > 0 && (currentAction.actionType === 'increase' || currentAction.actionType === 'decrease') ? (
        <>
            <label className="form-label">{currentAction.whereType === 'edges' ? 'Distance from edge' : 'Stitches between technique and marker?'}</label>
            <SelectionGrid
                options={getValidDistanceOptions().map(d => ({ value: d, label: d === 'at' ? '0 st' : `${d} st${d === '1' ? '' : 's'}` }))}
                selected={currentAction.distance}
                onSelect={(value) => updateAction({ distance: value })}
                columns={4}
                compact
            />
        </>
    ) : null;

    const TechniqueCard = () => {
        if (!currentAction.distance || (currentAction.actionType !== 'increase' && currentAction.actionType !== 'decrease')) {
            return null;
        }

        const getTechniqueOptions = () => {
            console.log('TechniqueCard debug:', {
                actionType: currentAction.actionType,
                whereType: currentAction.whereType,
                distance: currentAction.distance,
                position: currentAction.position
            });
            // Handle edge techniques
            if (currentAction.whereType === 'edges') {
                if (currentAction.distance === 'at' && currentAction.actionType === 'increase') {
                    return [
                        { value: 'Cable Cast On', label: 'Cable Cast On' },
                        { value: 'Backwards Loop', label: 'Backwards Loop' }
                    ];
                }

                // Regular edge techniques
                const techniques = currentAction.actionType === 'increase' ?
                    (currentAction.position === 'at_beginning' ? ['M1L', 'YO', 'KFB'] :
                        currentAction.position === 'at_end' ? ['M1R', 'YO', 'KFB'] :
                            ['M1L_M1R', 'YO_YO']) :
                    (currentAction.position === 'at_beginning' ? ['SSK', 'K2tog', 'CDD'] :
                        currentAction.position === 'at_end' ? ['SSK', 'K2tog', 'CDD'] :
                            ['SSK_K2tog', 'K3tog_K3tog']);

                return techniques.map(t => ({ value: t, label: getTechniqueLabel(t, currentAction.position) }));
            }

            // Handle marker techniques
            return (currentAction.position === 'before' && currentAction.actionType === 'increase') ?
                [{ value: 'M1L', label: 'M1L' }, { value: 'YO', label: 'YO' }, { value: 'KFB', label: 'KFB' }] :
                (currentAction.position === 'before' && currentAction.actionType === 'decrease') ?
                    [{ value: 'SSK', label: 'SSK' }, { value: 'K3tog', label: 'K3tog' }, { value: 'CDD', label: 'CDD' }] :
                    (currentAction.position === 'after' && currentAction.actionType === 'increase') ?
                        [{ value: 'M1R', label: 'M1R' }, { value: 'YO', label: 'YO' }, { value: 'KFB', label: 'KFB' }] :
                        (currentAction.position === 'after' && currentAction.actionType === 'decrease') ?
                            [{ value: 'K2tog', label: 'K2tog' }, { value: 'K3tog', label: 'K3tog' }, { value: 'CDD', label: 'CDD' }] :
                            (currentAction.position === 'before_and_after' && currentAction.actionType === 'increase') ?
                                [{ value: 'M1L_M1R', label: 'M1L & M1R' }, { value: 'YO_YO', label: 'YO & YO' }] :
                                [{ value: 'SSK_K2tog', label: 'SSK & K2tog' }, { value: 'K3tog_K3tog', label: 'K3tog & K3tog' }];
        };

        return (
            <>
                <label className="form-label">Technique</label>
                <SelectionGrid
                    options={getTechniqueOptions()}
                    selected={currentAction.technique}
                    onSelect={(value) => updateAction({ technique: value })}
                    columns={currentAction.position === 'before_and_after' || currentAction.position === 'both_ends' ? 2 : 3}
                    compact
                />
                {currentAction.technique && currentAction.whereType === 'edges' && currentAction.distance === 'at' && currentAction.actionType === 'increase' && (
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
            </>
        );
    };

    const BindOffCard = () => currentAction.actionType === 'bind_off' ? (
        <>
            <label className="form-label">How many stitches to bind off?</label>
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
        </>
    ) : null;

    const PreviewSection = () => (
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
                <p className="text-sm text-lavender-700 font-medium text-left" style={{ textAlign: 'left' }}>
                    {generatePreview()}
                </p>
                {(completedActions.length > 0 || currentAction.actionType) && currentStep !== 'timing' && (
                    <div className="mt-3 pt-3 border-t border-lavender-100">
                        <div className="text-xs text-lavender-600 space-y-1">
                            <div className="font-medium">While working in {basePattern}:</div>
                            {completedActions.map((action, index) => (
                                <div key={index} className="flex items-center gap-2">
                                    <span className="w-1 h-1 bg-lavender-400 rounded-full"></span>
                                    <span>
                                        {getActionConfigDisplay(action)}
                                    </span>
                                </div>
                            ))}
                            {/* Current action being built */}
                            {currentAction.actionType && (
                                <div className="flex items-center gap-2 text-sage-600">
                                    <span className="w-1 h-1 bg-sage-400 rounded-full"></span>
                                    <span className="italic text-left">
                                        {getActionConfigDisplay(currentAction)} {currentAction.targets.length === 0 && currentAction.actionType !== 'continue' && currentAction.actionType !== 'bind_off' ? '(building...)' : '(building...)'}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
            <p className="text-xs text-lavender-600 mt-2">{getPreviewSubtext()}</p>
        </div>
    )

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
                <h4 className="section-header-secondary">Define Actions</h4>
                <div className="space-y-6">
                    <ActionTypeCard />
                    {currentAction.actionType !== 'continue' && (
                        <>
                            <WhereCard />
                            <PositionCard />
                            <TargetCard />
                            <DistanceCard />
                            <TechniqueCard />
                            <BindOffCard />
                            {isActionComplete() && (
                                <div className="flex gap-3 pt-4 border-t">
                                    <button onClick={addAction} className="btn-secondary">Add Another Action</button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
            <PreviewSection />
            <div className="flex gap-3">
                <button onClick={onBack} className="btn-tertiary">← Back</button>
                <button
                    onClick={handleCompleteActions}
                    disabled={!isActionComplete()}
                    className="btn-primary flex-1"
                >
                    Set Timing →
                </button>
            </div>
        </div>
    );
};

export default MarkerInstructionBuilder;