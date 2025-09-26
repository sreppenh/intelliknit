// src/features/steps/components/shaping-wizard/BindOffShapingConfig.jsx

import React, { useState } from 'react';
import ShapingHeader from './ShapingHeader';
import IncrementInput from '../../../../shared/components/IncrementInput';
import SelectionGrid from '../../../../shared/components/SelectionGrid';
import IntelliKnitLogger from '../../../../shared/utils/ConsoleLogging';
import { getConstructionTerms } from '../../../../shared/utils/ConstructionTerminology';
import useStepSaveHelper, { StepSaveErrorModal } from '../../../../shared/utils/StepSaveHelper';
import { useActiveContext } from '../../../../shared/hooks/useActiveContext';
import { InputModal } from '../../../../shared/components/modals/StandardModal';

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

    // ===== SINGLE-SCREEN STATE MANAGEMENT =====
    const [phases, setPhases] = useState([]);
    const [currentPhase, setCurrentPhase] = useState({
        method: 'standard',
        stitches: 1,
        rows: 1
    });

    // Quick setup modal state
    const [showQuickSetup, setShowQuickSetup] = useState(false);
    const [quickSetupInput, setQuickSetupInput] = useState('');
    const [quickSetupError, setQuickSetupError] = useState('');

    const terms = getConstructionTerms(construction);
    const basePattern = wizard?.wizardData?.stitchPattern?.pattern || 'pattern';

    // ===== VALIDATION =====
    // Calculate total stitches consumed by existing phases
    const totalConsumed = phases.reduce((total, phase) => {
        return total + (phase.stitches * phase.rows);
    }, 0);

    const remainingStitches = currentStitches - totalConsumed;
    const maxStitchesForPhase = Math.floor(remainingStitches / Math.max(1, currentPhase.rows));

    // ===== PHASE MANAGEMENT =====
    const handleAddPhase = () => {
        const newPhase = {
            id: Date.now(),
            ...currentPhase
        };
        setPhases(prev => [...prev, newPhase]);

        // Reset current phase
        setCurrentPhase({
            method: 'standard',
            stitches: Math.min(8, maxStitchesForPhase),
            rows: 1
        });
    };

    const handleDeletePhase = (phaseId) => {
        setPhases(prev => prev.filter(p => p.id !== phaseId));
    };

    const handleQuickSetup = () => {
        setQuickSetupInput('');
        setQuickSetupError('');
        setShowQuickSetup(true);
    };

    const handleQuickSetupConfirm = () => {
        try {
            // Accept both comma and space-separated input
            const amounts = quickSetupInput
                .split(/[,\s]+/) // Split on comma OR whitespace
                .map(n => parseInt(n.trim()))
                .filter(n => !isNaN(n) && n > 0);

            if (amounts.length === 0) {
                setQuickSetupError('Please enter at least one number');
                return;
            }

            const newPhases = amounts.map((amount, index) => ({
                id: Date.now() + index,
                method: currentPhase.method,
                stitches: amount,
                rows: 1 // Default to 1 row per phase
            }));

            setPhases(newPhases);
            setShowQuickSetup(false);
            setQuickSetupInput('');
            setQuickSetupError('');
        } catch (error) {
            setQuickSetupError('Invalid input. Please try again.');
            IntelliKnitLogger.error('Quick setup parsing failed', error);
        }
    };

    // ===== INSTRUCTION GENERATION =====
    const generateInstruction = () => {
        if (phases.length === 0) return `While working in ${basePattern.toLowerCase()}...`;

        const phaseInstructions = phases.map((phase, index) => {
            const methodText = phase.method === 'sloped' ? ' using sloped bind-off' : '';
            const nextRows = phase.rows === 1 ? 'next row' : `next ${phase.rows} rows`;
            return `Phase ${index + 1}: Bind off ${phase.stitches} stitches at beginning of the ${nextRows}${methodText}`;
        });

        return `While working in ${basePattern.toLowerCase()}:\n${phaseInstructions.join('\n')}`;
    };

    // ===== CALCULATION FUNCTION =====
    const calculateBindOffEffect = () => {
        let currentStitchCount = currentStitches;
        let currentRow = 1;
        const phaseDetails = [];

        // Process each phase
        phases.forEach((phase, index) => {
            const startRow = currentRow;
            const totalStitchesThisPhase = phase.stitches * phase.rows;
            const endRow = startRow + phase.rows - 1;

            currentStitchCount -= totalStitchesThisPhase;

            const methodText = phase.method === 'sloped' ? ' using sloped bind-off' : '';
            const nextRows = phase.rows === 1 ? 'next row' : `next ${phase.rows} rows`;

            phaseDetails.push({
                description: `BO ${phase.stitches} sts at beg of ${nextRows}${methodText}`,
                rowRange: startRow === endRow ? `${startRow}` : `${startRow}-${endRow}`,
                rows: phase.rows,
                stitchChange: -totalStitchesThisPhase,
                startingStitches: currentStitchCount + totalStitchesThisPhase,
                endingStitches: currentStitchCount
            });

            currentRow = endRow + 1;
        });

        // Generate instruction text
        const phaseInstructions = phases.map((phase, index) => {
            const methodText = phase.method === 'sloped' ? ' using sloped bind-off' : '';
            const nextRows = phase.rows === 1 ? 'next row' : `next ${phase.rows} rows`;
            return `BO ${phase.stitches} sts at beg of ${nextRows}${methodText}`;
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

    // ===== COMPLETION HANDLER =====
    const handleComplete = async () => {
        const calculation = calculateBindOffEffect();

        const bindOffConfig = {
            type: 'bind_off_shaping',
            config: {
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

    const canComplete = phases.length > 0 && remainingStitches >= 0;
    const canAddPhase = currentPhase.stitches <= maxStitchesForPhase && maxStitchesForPhase > 0;

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
                    <h2 className="content-header-primary">Configure Bind-Off Shaping</h2>
                    <p className="content-subheader">
                        Build your bind-off sequence for flat construction shoulder shaping
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
                                        <span className="font-medium">Phase {index + 1}:</span> BO {phase.stitches} sts at beg of {phase.rows === 1 ? 'next row' : `next ${phase.rows} rows`}
                                        {phase.method === 'sloped' && <span className="text-sage-600 ml-1">(sloped)</span>}
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
                        {/* Method */}
                        <div>
                            <label className="form-label">Bind-off Method</label>
                            <SelectionGrid
                                options={[
                                    { value: 'standard', label: 'Standard' },
                                    { value: 'sloped', label: 'Sloped' }
                                ]}
                                selected={currentPhase.method}
                                onSelect={(value) => setCurrentPhase(prev => ({ ...prev, method: value }))}
                                columns={2}
                                compact
                            />
                        </div>

                        {/* Stitches */}
                        <div>
                            <label className="form-label">Bind off how many stitches</label>
                            <IncrementInput
                                value={currentPhase.stitches}
                                onChange={(value) => setCurrentPhase(prev => ({
                                    ...prev,
                                    stitches: Math.max(1, Math.min(value, maxStitchesForPhase))
                                }))}
                                min={1}
                                max={maxStitchesForPhase}
                                unit="stitches"
                                size="sm"
                            />
                            {maxStitchesForPhase < currentPhase.stitches && (
                                <p className="text-xs text-red-600 mt-1">
                                    Maximum {maxStitchesForPhase} stitches available for {currentPhase.rows} rows
                                </p>
                            )}
                        </div>

                        {/* Rows */}
                        <div>
                            <label className="form-label">For how many rows</label>
                            <IncrementInput
                                value={currentPhase.rows}
                                onChange={(value) => {
                                    const newRows = Math.max(1, value);
                                    const newMaxStitches = Math.floor(remainingStitches / newRows);
                                    setCurrentPhase(prev => ({
                                        ...prev,
                                        rows: newRows,
                                        stitches: Math.min(prev.stitches, newMaxStitches)
                                    }));
                                }}
                                min={1}
                                max={50}
                                unit={currentPhase.rows === 1 ? 'row' : 'rows'}
                                size="sm"
                            />
                        </div>

                        <div className="pt-4 border-t border-wool-200">
                            <button
                                onClick={handleAddPhase}
                                disabled={!canAddPhase}
                                className="suggestion-bubble w-full"
                            >
                                + Add This Phase
                            </button>
                        </div>
                    </div>
                </div>

                {/* Live Instruction Preview - Purple Box */}
                <div className="card-info">
                    <h4 className="section-header-secondary">Instruction Preview</h4>
                    <div className="bg-white rounded-lg p-3 border border-lavender-200">
                        <div className="text-sm text-lavender-700 font-medium text-left whitespace-pre-line">
                            {generateInstruction()}
                        </div>
                    </div>
                </div>

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
                                    <span className="font-medium">{calculateBindOffEffect().endingStitches}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-lavender-700">Total {terms.rows}:</span>
                                    <span className="font-medium">{calculateBindOffEffect().totalRows}</span>
                                </div>
                            </>
                        )}
                        <div className="flex justify-between">
                            <span className="text-lavender-700">Available stitches:</span>
                            <span className={`font-medium ${remainingStitches < 0 ? 'text-red-600' : ''}`}>
                                {remainingStitches}
                            </span>
                        </div>
                        {remainingStitches < 0 && (
                            <div className="text-red-600 text-xs mt-2">
                                ⚠️ Over-consumed! Remove phases or reduce amounts.
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex gap-3">
                    <button onClick={onBack} className="btn-tertiary">
                        ← Back to Types
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

            <StepSaveErrorModal
                isOpen={!!error}
                error={error}
                onClose={clearError}
                onRetry={handleComplete}
            />

            {/* Quick Setup Modal */}
            <InputModal
                isOpen={showQuickSetup}
                onClose={() => {
                    setShowQuickSetup(false);
                    setQuickSetupInput('');
                    setQuickSetupError('');
                }}
                onConfirm={handleQuickSetupConfirm}
                title="Quick Setup"
                subtitle="Enter your bind-off sequence"
                icon="✨"
                primaryButtonText="Create Phases"
                secondaryButtonText="Cancel"
            >
                <div className="space-y-4">
                    <div>
                        <label className="form-label">Stitch amounts</label>
                        <input
                            type="text"
                            value={quickSetupInput}
                            onChange={(e) => {
                                setQuickSetupInput(e.target.value);
                                setQuickSetupError('');
                            }}
                            placeholder="8 6 4 2"
                            className="w-full border-2 border-wool-200 rounded-xl px-4 py-3 text-base focus:border-sage-500 focus:ring-0 transition-colors placeholder-wool-400 bg-white"
                            data-modal-focus
                        />
                        {quickSetupError && (
                            <p className="text-xs text-red-600 mt-1">{quickSetupError}</p>
                        )}
                    </div>

                    <div className="help-block">
                        <h4 className="text-sm font-semibold text-sage-700 mb-2">💡 How to use</h4>
                        <div className="text-sm text-sage-600 space-y-1">
                            <div>• Enter numbers separated by spaces or commas</div>
                            <div>• Example: "8 6 4 2" or "8,6,4,2"</div>
                            <div>• Each number creates a phase with 1 row</div>
                            <div>• You can adjust rows and method after creation</div>
                        </div>
                    </div>
                </div>
            </InputModal>
        </div>
    );
};

export default BindOffShapingConfig;