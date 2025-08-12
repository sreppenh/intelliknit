// src/features/steps/components/shaping-wizard/SequentialPhases.jsx
import React, { useState } from 'react';
import useStepSaveHelper, { StepSaveErrorModal } from '../../../../shared/utils/StepSaveHelper';
import { useProjectsContext } from '../../../projects/hooks/useProjectsContext';
import { PhaseCalculationService } from '../../../../shared/utils/PhaseCalculationService';
import { getConstructionTerms } from '../../../../shared/utils/ConstructionTerminology';
import SequentialPhasesModal from './SequentialPhasesModal';

const SequentialPhases = ({
    shapingData,
    setShapingData,
    currentStitches,
    construction,
    componentIndex,
    onExitToComponentSteps,
    onComplete,
    onBack,
    wizardData
}) => {
    const [showAddOverlay, setShowAddOverlay] = useState(false);
    const [editingPhaseId, setEditingPhaseId] = useState(null);

    const { dispatch } = useProjectsContext();
    const { saveStepAndNavigate, isLoading, error, clearError } = useStepSaveHelper();

    // Get phases from shapingData
    const phases = shapingData.config?.phases || [];

    // Calculate result using existing service
    const result = PhaseCalculationService.calculateSequentialPhases(phases, currentStitches);

    // Phase type definitions (move to constants if needed)
    const phaseTypes = [
        {
            id: 'decrease',
            name: 'Decrease Phase',
            icon: '📉',
            description: 'Remove stitches at regular intervals'
        },
        {
            id: 'increase',
            name: 'Increase Phase',
            icon: '📈',
            description: 'Add stitches at regular intervals'
        },
        {
            id: 'setup',
            name: 'Setup Rows',
            icon: '📏',
            description: 'Plain rows between shaping phases'
        },
        {
            id: 'bind_off',
            name: 'Bind Off Phase',
            icon: '🔗',
            description: 'Remove stitches by binding off'
        }
    ];

    // Add phase handler
    const handleAddPhase = () => {
        setEditingPhaseId(null);
        setShowAddOverlay(true);
    };

    // Edit phase handler
    const handleEditPhase = (phaseId) => {
        setEditingPhaseId(phaseId);
        setShowAddOverlay(true);
    };

    // Delete phase handler  
    const handleDeletePhase = (phaseId) => {
        const updatedPhases = phases.filter(phase => phase.id !== phaseId);
        setShapingData(prev => ({
            ...prev,
            config: {
                ...prev.config,
                phases: updatedPhases
            }
        }));
    };

    // Save phase from overlay
    const handleSavePhase = (phaseConfig) => {
        if (editingPhaseId) {
            // Edit existing phase
            const updatedPhases = phases.map(phase =>
                phase.id === editingPhaseId ? { ...phaseConfig, id: editingPhaseId } : phase
            );
            setShapingData(prev => ({
                ...prev,
                config: {
                    ...prev.config,
                    phases: updatedPhases
                }
            }));
        } else {
            // Add new phase
            const newPhase = {
                ...phaseConfig,
                id: `phase-${Date.now()}` // Simple ID generation
            };
            setShapingData(prev => ({
                ...prev,
                config: {
                    ...prev.config,
                    phases: [...phases, newPhase]
                }
            }));
        }
        setShowAddOverlay(false);
        setEditingPhaseId(null);
    };

    // Close overlay
    const handleCloseOverlay = () => {
        setShowAddOverlay(false);
        setEditingPhaseId(null);
    };

    // Complete step handler
    const handleCompleteStep = async () => {
        const saveResult = await saveStepAndNavigate({
            instruction: result.instruction,
            effect: {
                success: !result.error,
                endingStitches: result.endingStitches ?? currentStitches,
                startingStitches: result.startingStitches ?? currentStitches,
                totalRows: result.totalRows || 1,
                error: result.error
            },
            wizardData: {
                stitchPattern: wizardData.stitchPattern,
                hasShaping: true,
                shapingConfig: {
                    type: 'phases',
                    config: {
                        calculation: result,
                        phases: phases,
                        construction: construction,
                    }
                }
            },
            currentStitches,
            construction,
            componentIndex,
            dispatch,
            skipNavigation: true
        });

        if (saveResult.success) {
            onExitToComponentSteps();
        }
    };

    // Helper function to calculate stitch context for individual phase
    const getPhaseStitchContext = (phaseIndex) => {
        let runningStitches = currentStitches;

        // Calculate stitches up to (but not including) this phase
        for (let i = 0; i < phaseIndex; i++) {
            const stitchChange = PhaseCalculationService.calculatePhaseStitchChange(phases[i]);
            runningStitches += stitchChange;
        }

        // Calculate the change for this specific phase
        const thisPhaseChange = PhaseCalculationService.calculatePhaseStitchChange(phases[phaseIndex]);
        const thisPhaseRows = calculatePhaseRows(phases[phaseIndex]);

        return {
            startingStitches: runningStitches,
            endingStitches: runningStitches + thisPhaseChange,
            stitchChange: thisPhaseChange,
            totalRows: thisPhaseRows
        };
    };

    // Helper to calculate rows for a phase
    const calculatePhaseRows = (phase) => {
        const { type, config } = phase;

        switch (type) {
            case 'decrease':
            case 'increase':
                return config.times * config.frequency;
            case 'setup':
                return config.rows;
            case 'bind_off':
                return config.frequency;
            default:
                return 0;
        }
    };

    // Check if sequence is complete (any phase results in 0 stitches)
    const isSequenceComplete = () => {
        return result.endingStitches === 0;
    };

    // Get construction terms for proper row/round terminology
    const terms = getConstructionTerms(construction);

    // Get editing phase data
    const editingPhase = editingPhaseId ? phases.find(p => p.id === editingPhaseId) : null;

    return (
        <>
            <div className="p-6 stack-lg">
                {/* Header */}
                <div>
                    <h2 className="content-header-primary text-left">📈 Sequential Phases</h2>
                    <p className="content-subheader text-left">
                        {phases.length === 0 ? 'Build your shaping sequence step by step' : 'Review and modify your sequence'}
                    </p>
                </div>

                {/* Phase List or Empty State */}
                {phases.length === 0 ? (
                    <div className="text-center py-8">
                        <div className="text-4xl mb-4">🎯</div>
                        <h3 className="text-lg font-semibold text-wool-600 mb-2">Ready to build complex shaping?</h3>
                        <p className="content-subheader px-4">Create sophisticated patterns like sleeve caps, shoulder shaping, or gradual waist decreases</p>
                        <div className="help-block mb-6 mx-4">
                            <div className="text-xs font-semibold text-sage-700 mb-1 text-left">Example: Sleeve Cap Shaping</div>
                            <div className="text-xs text-sage-600 text-left">
                                • Work 6 plain rows<br />
                                • Dec 1 at each end every other row 5 times<br />
                                • Work 2 plain rows<br />
                                • Dec 1 at each end every row 3 times
                            </div>
                        </div>
                        <button
                            onClick={handleAddPhase}
                            className="btn-primary"
                        >
                            Add Your First Phase
                        </button>

                    </div>
                ) : (
                    <>
                        {/* Phase Summary List */}
                        <div>
                            <h3 className="content-header-secondary mb-3 text-left">Your Sequence</h3>

                            <div className="stack-sm">
                                {phases.map((phase, index) => {
                                    const phaseStitchContext = getPhaseStitchContext(index);
                                    const phaseType = phaseTypes.find(t => t.id === phase.type);
                                    const isLastPhase = index === phases.length - 1;
                                    const isComplete = phaseStitchContext.endingStitches === 0;

                                    return (
                                        <div key={phase.id} className="sequence-creation-card">
                                            <div className="flex items-start gap-3">
                                                <div className="sequence-number">
                                                    {index + 1}
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <div className="min-w-0 flex-1 text-left">
                                                            {/* Phase type header */}
                                                            <h4 className="text-sm font-semibold mb-1 text-left text-wool-700 flex items-center gap-2">
                                                                <span>{phaseType?.icon}</span>
                                                                {phaseType?.name}
                                                            </h4>

                                                            {/* Phase description */}
                                                            <div className="text-sm text-wool-600 mb-1 text-left">
                                                                {PhaseCalculationService.getPhaseDescription(phase, construction)}
                                                            </div>

                                                            {/* Technical data display */}
                                                            <div className="text-xs text-wool-500 text-left">
                                                                {phaseStitchContext.startingStitches} → {phaseStitchContext.endingStitches} sts • {phaseStitchContext.totalRows} {phaseStitchContext.totalRows === 1 ? terms.row : terms.rows}{isComplete ? ' • COMPLETE' : ''}
                                                            </div>
                                                        </div>

                                                        {/* Edit/Delete buttons - only show for last phase */}
                                                        {isLastPhase && (
                                                            <div className="flex gap-1">
                                                                <button
                                                                    onClick={() => handleEditPhase(phase.id)}
                                                                    className="p-2 text-wool-500 hover:bg-wool-200 rounded-lg transition-colors"
                                                                >
                                                                    ✏️
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDeletePhase(phase.id)}
                                                                    className="p-2 text-red-500 hover:bg-red-100 rounded-lg transition-colors"
                                                                >
                                                                    ✕
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Add Another Phase - disabled if sequence complete */}
                        <button
                            onClick={handleAddPhase}
                            disabled={isSequenceComplete()}
                            className={`w-full p-4 border-2 border-dashed rounded-xl transition-colors flex items-center justify-center gap-2 ${isSequenceComplete()
                                ? 'border-wool-200 text-wool-400 cursor-not-allowed'
                                : 'border-wool-300 text-wool-500 hover:border-sage-400 hover:text-sage-600'
                                }`}
                        >
                            <span className="text-xl">➕</span>
                            {isSequenceComplete() ? 'Sequence Complete' : 'Add Another Phase'}
                        </button>

                        {/* Error Display */}
                        {result.error && (
                            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
                                <h4 className="text-sm font-semibold text-red-700 mb-2">⚠️ Error</h4>
                                <div className="text-sm text-red-600">
                                    {result.error}
                                </div>
                            </div>
                        )}

                        {/* Navigation */}
                        <div className="flex gap-3 pt-4">
                            <button
                                onClick={onBack}
                                className="btn-tertiary flex-1"
                            >
                                ← Back
                            </button>
                            <button
                                onClick={handleCompleteStep}
                                disabled={!result.instruction || result.error || phases.length === 0 || isLoading}
                                className="btn-primary flex-1"
                            >
                                {isLoading ? 'Saving...' : 'Complete Step'}
                            </button>
                        </div>
                    </>
                )}

                <StepSaveErrorModal
                    isOpen={!!error}
                    error={error}
                    onClose={clearError}
                    onRetry={handleCompleteStep}
                />
            </div>

            {/* Sequential Phases Overlay */}
            {showAddOverlay && (
                <SequentialPhasesModal
                    isOpen={showAddOverlay}
                    onClose={handleCloseOverlay}
                    onSave={handleSavePhase}
                    phaseTypes={phaseTypes}
                    editingPhase={editingPhase}
                    currentStitches={currentStitches}
                    construction={construction}
                    phases={phases}
                />
            )}
        </>
    );
};

export default SequentialPhases;