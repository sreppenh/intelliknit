// src/features/steps/components/shaping-wizard/BindOffShapingConfig.jsx

import React, { useState, useMemo } from 'react';
import ShapingHeader from './ShapingHeader';
import IncrementInput from '../../../../shared/components/IncrementInput';
import SegmentedControl from '../../../../shared/components/SegmentedControl';
import SelectionGrid from '../../../../shared/components/SelectionGrid';
import IntelliKnitLogger from '../../../../shared/utils/ConsoleLogging';
import { getConstructionTerms } from '../../../../shared/utils/ConstructionTerminology';
import useStepSaveHelper, { StepSaveErrorModal } from '../../../../shared/utils/StepSaveHelper';
import { useActiveContext } from '../../../../shared/hooks/useActiveContext';

const BindOffShapingConfig = ({
    shapingData,
    setShapingData,
    currentStitches,
    construction,
    component,
    componentIndex,
    editingStepIndex,
    onExitToComponentSteps,
    onComplete,
    onBack,
    wizardData,
    onGoToLanding,
    wizard,
    onCancel,
    mode,
    project
}) => {

    // ===== NAVIGATION HOOKS =====
    const { dispatch } = useActiveContext(mode);
    const { saveStepAndNavigate, isLoading, error, clearError } = useStepSaveHelper();

    // ===== TWO-SCREEN STATE MANAGEMENT =====
    const [currentScreen, setCurrentScreen] = useState('position-setup');
    const [position, setPosition] = useState('both_edges'); // both_edges, beginning, end, all_stitches
    const [phases, setPhases] = useState([]);
    const [currentPhase, setCurrentPhase] = useState({
        amount: 8,
        times: 1,
        method: 'standard'
    });

    const terms = getConstructionTerms(construction);

    // ===== SCREEN 1: POSITION SETUP =====
    const renderPositionSetup = () => {
        return (
            <div>
                <ShapingHeader
                    onBack={onBack}
                    onGoToLanding={onGoToLanding}
                    wizard={wizard}
                    onCancel={onCancel}
                />
                <div className="p-6 space-y-6">
                    <div>
                        <h2 className="content-header-primary">Position Setup</h2>
                        <p className="content-subheader">
                            Where should the bind-offs happen?
                        </p>
                    </div>

                    <div className="card">
                        <h4 className="section-header-secondary">Choose Position</h4>
                        <div className="space-y-3">
                            {[
                                {
                                    id: 'both_edges',
                                    name: 'Both Edges',
                                    icon: '↔️',
                                    description: 'Bind off from beginning and end of rows',
                                    examples: 'Shoulder shaping, armhole finishing'
                                },
                                {
                                    id: 'beginning',
                                    name: 'Beginning Only',
                                    icon: '←',
                                    description: 'Bind off at start of rows only',
                                    examples: 'One-sided neckline shaping'
                                },
                                {
                                    id: 'end',
                                    name: 'End Only',
                                    icon: '→',
                                    description: 'Bind off at end of rows only',
                                    examples: 'One-sided neckline shaping'
                                },
                                {
                                    id: 'all_stitches',
                                    name: 'All Stitches',
                                    icon: '✂️',
                                    description: 'Bind off all remaining stitches',
                                    examples: 'Complete piece finishing'
                                }
                            ].map((option) => (
                                <button
                                    key={option.id}
                                    onClick={() => setPosition(option.id)}
                                    className={`card-selectable w-full text-left ${position === option.id ? 'ring-2 ring-sage-400 bg-sage-50' : ''}`}
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="text-2xl flex-shrink-0">{option.icon}</div>
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-base mb-1">{option.name}</h3>
                                            <p className="text-sm opacity-75 mb-2">{option.description}</p>
                                            <div className="text-xs opacity-60">
                                                <span className="font-medium">Examples:</span> {option.examples}
                                            </div>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Position Context */}
                    <div className="card-info">
                        <h4 className="section-header-secondary">Current Context</h4>
                        <div className="space-y-2 text-sm text-left">
                            <div className="flex justify-between">
                                <span className="text-lavender-700">Available stitches:</span>
                                <span className="font-medium">{currentStitches}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-lavender-700">Construction:</span>
                                <span className="font-medium capitalize">{construction}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-lavender-700">Selected position:</span>
                                <span className="font-medium">
                                    {position === 'both_edges' ? 'Both edges' :
                                        position === 'beginning' ? 'Beginning only' :
                                            position === 'end' ? 'End only' :
                                                'All stitches'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button onClick={onBack} className="btn-tertiary flex-1">
                            ← Back to Types
                        </button>
                        <button
                            onClick={() => setCurrentScreen('phase-config')}
                            className="btn-primary flex-1"
                        >
                            Configure Phases →
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    // ===== SCREEN 2: PHASE CONFIGURATION =====
    const renderPhaseConfig = () => {
        const handleAddPhase = () => {
            const newPhase = {
                id: Date.now(),
                ...currentPhase
            };
            setPhases(prev => [...prev, newPhase]);

            // Reset current phase
            setCurrentPhase({
                amount: 8,
                times: 1,
                method: 'standard'
            });
        };

        const handleDeletePhase = (phaseId) => {
            setPhases(prev => prev.filter(p => p.id !== phaseId));
        };

        const handleQuickSetup = () => {
            // Parse common sequence like "8,6,4,2"
            const sequence = prompt('Enter bind-off sequence (e.g., "8,6,4,2"):');
            if (!sequence) return;

            try {
                const amounts = sequence.split(',').map(n => parseInt(n.trim())).filter(n => !isNaN(n) && n > 0);
                if (amounts.length === 0) return;

                const newPhases = amounts.map((amount, index) => ({
                    id: Date.now() + index,
                    amount,
                    frequency: currentPhase.frequency,
                    times: 1,
                    method: currentPhase.method
                }));

                setPhases(newPhases);
            } catch (error) {
                IntelliKnitLogger.error('Quick setup parsing failed', error);
            }
        };

        // Calculate total stitches consumed
        const totalConsumed = phases.reduce((total, phase) => {
            const phaseMultiplier = position === 'both_edges' ? 2 : 1;
            return total + (phase.amount * phase.times * phaseMultiplier);
        }, 0);

        const remainingStitches = currentStitches - totalConsumed;

        // Calculate final results for integrated preview
        const calculation = calculateBindOffEffect();
        const canComplete = phases.length > 0 && remainingStitches >= 0;

        const handleComplete = async () => {
            const bindOffConfig = {
                type: 'bind_off_shaping',
                config: {
                    position: position,
                    phases: phases,
                    calculation: calculation
                }
            };

            // Save step following the established pattern
            const saveResult = await saveStepAndNavigate({
                instruction: calculation.instruction,
                effect: {
                    success: true,
                    endingStitches: calculation.endingStitches,
                    startingStitches: calculation.startingStitches,
                    totalRows: calculation.totalRows,
                    hasShaping: true
                },
                wizardData: {
                    hasShaping: true,
                    shapingConfig: bindOffConfig,
                    stitchPattern: wizard?.wizardData?.stitchPattern
                },
                componentIndex,
                dispatch,
                skipNavigation: true
            });

            if (saveResult.success) {
                onExitToComponentSteps();
            }
        };

        return (
            <div>
                <ShapingHeader
                    onBack={() => setCurrentScreen('position-setup')}
                    onGoToLanding={onGoToLanding}
                    wizard={wizard}
                    onCancel={onCancel}
                />
                <div className="p-6 space-y-6">
                    <div>
                        <h2 className="content-header-primary">Configure Bind-Off Phases</h2>
                        <p className="content-subheader">
                            Build your bind-off sequence phase by phase
                        </p>
                    </div>

                    {/* Completed Phases List */}
                    {phases.length > 0 && (
                        <div className="card">
                            <h4 className="section-header-secondary">Configured Phases</h4>
                            <div className="space-y-2">
                                {phases.map((phase, index) => (
                                    <div key={phase.id} className="flex items-center justify-between bg-yarn-50 p-3 rounded-lg">
                                        <div className="text-sm text-left">
                                            <span className="font-medium">Phase {index + 1}:</span> BO {phase.amount} sts {position === 'both_edges' ? 'each end' : `at ${position}`} every row {phase.times} {phase.times === 1 ? 'time' : 'times'}
                                            {phase.method !== 'standard' && <span className="text-sage-600 ml-1">({phase.method})</span>}
                                        </div>
                                        <button
                                            onClick={() => handleDeletePhase(phase.id)}
                                            className="delete-icon"
                                            title="Delete phase"
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Phase Configuration */}
                    <div className="card">
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="section-header-secondary">
                                {phases.length === 0 ? 'First Phase' : `Phase ${phases.length + 1}`}
                            </h4>
                            {phases.length === 0 && (
                                <button onClick={handleQuickSetup} className="suggestion-bubble text-xs">
                                    Quick Setup
                                </button>
                            )}
                        </div>

                        <div className="space-y-4">
                            {/* Amount */}
                            <div>
                                <label className="form-label">
                                    Stitches to bind off {position === 'both_edges' ? 'at each edge' : `at ${position}`}
                                </label>
                                <IncrementInput
                                    value={currentPhase.amount}
                                    onChange={(value) => setCurrentPhase(prev => ({ ...prev, amount: Math.max(1, value) }))}
                                    min={1}
                                    max={position === 'both_edges' ? Math.floor(remainingStitches / 2) : remainingStitches}
                                    unit="stitches"
                                    size="sm"
                                />
                            </div>

                            {/* Frequency - Much simpler now */}
                            <div>
                                <label className="form-label">Frequency</label>
                                <p className="text-sm text-wool-600 mb-2">Bind-offs are worked on consecutive rows (standard for shoulder shaping)</p>
                                <div className="bg-sage-50 p-3 rounded-lg border border-sage-200">
                                    <span className="text-sm font-medium text-sage-700">Every row</span>
                                    <div className="text-xs text-sage-600 mt-1">
                                        Row 1: BO at beginning, Row 2: BO at beginning (other edge)
                                    </div>
                                </div>
                            </div>

                            {/* Times */}
                            <div>
                                <label className="form-label">Repeat</label>
                                <IncrementInput
                                    value={currentPhase.times}
                                    onChange={(value) => setCurrentPhase(prev => ({ ...prev, times: Math.max(1, value) }))}
                                    min={1}
                                    max={50}
                                    unit={currentPhase.times === 1 ? 'time' : 'times'}
                                    size="sm"
                                />
                            </div>

                            {/* Method */}
                            <div>
                                <label className="form-label">Bind-off Method</label>
                                <SelectionGrid
                                    options={[
                                        { value: 'standard', label: 'Standard' },
                                        { value: 'stretchy', label: 'Stretchy' },
                                        { value: 'three_needle', label: '3-Needle' },
                                        { value: 'picot', label: 'Picot' }
                                    ]}
                                    selected={currentPhase.method}
                                    onSelect={(value) => setCurrentPhase(prev => ({ ...prev, method: value }))}
                                    columns={2}
                                    compact
                                />
                            </div>

                            <div className="pt-4 border-t border-wool-200">
                                <button
                                    onClick={handleAddPhase}
                                    disabled={remainingStitches <= 0}
                                    className="suggestion-bubble w-full"
                                >
                                    + Add This Phase
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Integrated Preview - Only show when we have phases */}
                    {phases.length > 0 && (
                        <div className="card-info">
                            <h4 className="section-header-secondary">Instruction Preview</h4>
                            <div className="bg-white rounded-lg p-3 border border-lavender-200">
                                <p className="text-sm text-lavender-700 font-medium text-left">
                                    {calculation.instruction}
                                </p>
                            </div>

                            {/* Phase Breakdown */}
                            <div className="mt-4 space-y-2">
                                <div className="text-xs font-medium text-lavender-700">Phase Details:</div>
                                {calculation.phases.map((phase, index) => (
                                    <div key={index} className="text-xs text-lavender-600 bg-white rounded p-2 border border-lavender-100">
                                        <div className="text-left">
                                            <span className="font-medium">Phase {index + 1}:</span> {phase.description}
                                        </div>
                                        <div className="text-left mt-1 opacity-75">
                                            {terms.rows} {phase.rowRange} • {Math.abs(phase.stitchChange)} stitches consumed
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Stitch Context */}
                    <div className="card-info">
                        <h4 className="section-header-secondary">Stitch Context</h4>
                        <div className="space-y-2 text-sm text-left">
                            <div className="flex justify-between">
                                <span className="text-lavender-700">Starting stitches:</span>
                                <span className="font-medium">{currentStitches}</span>
                            </div>
                            {phases.length > 0 && (
                                <>
                                    <div className="flex justify-between">
                                        <span className="text-lavender-700">Ending stitches:</span>
                                        <span className="font-medium">{calculation.endingStitches}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-lavender-700">Total {terms.rows}:</span>
                                        <span className="font-medium">{calculation.totalRows}</span>
                                    </div>
                                </>
                            )}
                            <div className="flex justify-between">
                                <span className="text-lavender-700">Remaining stitches:</span>
                                <span className={`font-medium ${remainingStitches < 0 ? 'text-red-600' : ''}`}>
                                    {remainingStitches}
                                </span>
                            </div>
                            {remainingStitches < 0 && (
                                <div className="text-red-600 text-xs mt-2">
                                    ⚠️ Over-consumed! Reduce phase amounts or remove phases.
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={() => setCurrentScreen('position-setup')}
                            className="btn-tertiary"
                        >
                            ← Back to Position
                        </button>
                        <button
                            onClick={handleComplete}
                            disabled={!canComplete || isLoading}
                            className="btn-primary flex-1"
                        >
                            {isLoading ? 'Saving...' : 'Complete Step'}
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    // ===== SCREEN 3: PREVIEW & COMPLETE =====
    const renderPreview = () => {
        // Calculate final results
        const calculation = calculateBindOffEffect();

        const handleComplete = async () => {
            const bindOffConfig = {
                type: 'bind_off_shaping',
                config: {
                    position: position,
                    phases: phases,
                    calculation: calculation
                }
            };

            // Save step following the established pattern
            const saveResult = await saveStepAndNavigate({
                instruction: calculation.instruction,
                effect: {
                    success: true,
                    endingStitches: calculation.endingStitches,
                    startingStitches: calculation.startingStitches,
                    totalRows: calculation.totalRows,
                    hasShaping: true
                },
                wizardData: {
                    hasShaping: true,
                    shapingConfig: bindOffConfig,
                    stitchPattern: wizard?.wizardData?.stitchPattern
                },
                componentIndex,
                dispatch,
                skipNavigation: true
            });

            if (saveResult.success) {
                onExitToComponentSteps();
            }
        };

        return (
            <div>
                <ShapingHeader
                    onBack={() => setCurrentScreen('phase-builder')}
                    onGoToLanding={onGoToLanding}
                    wizard={wizard}
                    onCancel={onCancel}
                />
                <div className="p-6 space-y-6">
                    <div>
                        <h2 className="content-header-primary">Preview & Complete</h2>
                        <p className="content-subheader">
                            Review your bind-off sequence
                        </p>
                    </div>

                    {/* Instruction Preview */}
                    <div className="card-info">
                        <h4 className="section-header-secondary">Generated Instruction</h4>
                        <div className="bg-white rounded-lg p-3 border border-lavender-200">
                            <p className="text-sm text-lavender-700 font-medium text-left">
                                {calculation.instruction}
                            </p>
                        </div>
                    </div>

                    {/* Phase Breakdown */}
                    <div className="card">
                        <h4 className="section-header-secondary">Phase Breakdown</h4>
                        <div className="space-y-3">
                            {calculation.phases.map((phase, index) => (
                                <div key={index} className="bg-yarn-50 p-3 rounded-lg">
                                    <div className="text-sm text-left">
                                        <div className="font-medium text-wool-700 mb-1">
                                            Phase {index + 1}: {phase.description}
                                        </div>
                                        <div className="text-wool-600 text-xs space-y-1">
                                            <div>{terms.rows} {phase.rowRange}</div>
                                            <div>{phase.stitchChange} stitches consumed</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Summary */}
                    <div className="card-info">
                        <h4 className="section-header-secondary">Summary</h4>
                        <div className="space-y-2 text-sm text-left">
                            <div className="flex justify-between">
                                <span className="text-lavender-700">Starting stitches:</span>
                                <span className="font-medium">{calculation.startingStitches}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-lavender-700">Ending stitches:</span>
                                <span className="font-medium">{calculation.endingStitches}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-lavender-700">Total {terms.rows}:</span>
                                <span className="font-medium">{calculation.totalRows}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-lavender-700">Stitches bound off:</span>
                                <span className="font-medium">{calculation.startingStitches - calculation.endingStitches}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={() => setCurrentScreen('phase-builder')}
                            className="btn-tertiary"
                        >
                            ← Back to Phases
                        </button>
                        <button
                            onClick={handleComplete}
                            disabled={isLoading}
                            className="btn-primary flex-1"
                        >
                            {isLoading ? 'Saving...' : 'Complete Step'}
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    // ===== CALCULATION FUNCTION =====
    const calculateBindOffEffect = () => {
        let currentStitchCount = currentStitches;
        let currentRow = 1;
        const phaseDetails = [];

        const positionMultiplier = position === 'both_edges' ? 2 : 1;
        const positionDescription = position === 'both_edges' ? 'each end' :
            position === 'beginning' ? 'at beginning' :
                position === 'end' ? 'at end' :
                    'all stitches';

        // Process each phase
        phases.forEach((phase, index) => {
            const startRow = currentRow;
            const stitchesPerApplication = phase.amount * positionMultiplier;
            const totalStitchesThisPhase = stitchesPerApplication * phase.times;
            // Each "time" = 2 rows (one for each edge) when position is 'both_edges'
            // For other positions, each "time" = 1 row
            const rowsPerTime = position === 'both_edges' ? 2 : 1;
            const totalRowsThisPhase = rowsPerTime * phase.times;
            const endRow = startRow + totalRowsThisPhase - 1;

            currentStitchCount -= totalStitchesThisPhase;

            const methodText = phase.method !== 'standard' ? ` using ${phase.method}` : '';

            phaseDetails.push({
                description: `BO ${phase.amount} sts ${positionDescription} every row ${phase.times} ${phase.times === 1 ? 'time' : 'times'}${methodText}`,
                rowRange: startRow === endRow ? `${startRow}` : `${startRow}-${endRow}`,
                rows: totalRowsThisPhase,
                stitchChange: -totalStitchesThisPhase,
                startingStitches: currentStitchCount + totalStitchesThisPhase,
                endingStitches: currentStitchCount
            });

            currentRow = endRow + 1;
        });

        // Generate instruction text
        const phaseInstructions = phases.map((phase, index) => {
            const methodText = phase.method !== 'standard' ? ` using ${phase.method} bind-off` : '';
            if (phase.times === 1) {
                if (position === 'both_edges') {
                    return `BO ${phase.amount} sts at beg of next 2 rows${methodText}`;
                } else {
                    return `BO ${phase.amount} sts at ${position}${methodText}`;
                }
            } else {
                if (position === 'both_edges') {
                    const totalRows = phase.times * 2;
                    return `BO ${phase.amount} sts at beg of next ${totalRows} rows${methodText}`;
                } else {
                    return `BO ${phase.amount} sts at ${position} every row ${phase.times} times${methodText}`;
                }
            }
        }).join(', then ');

        return {
            instruction: phaseInstructions,
            startingStitches: currentStitches,
            endingStitches: currentStitchCount,
            totalRows: currentRow - 1,
            phases: phaseDetails,
            netStitchChange: currentStitchCount - currentStitches
        };
    };

    // ===== RENDER BASED ON CURRENT SCREEN =====
    if (currentScreen === 'position-setup') {
        return renderPositionSetup();
    } else if (currentScreen === 'phase-config') {
        return renderPhaseConfig();
    }

    return null;
};

export default BindOffShapingConfig;