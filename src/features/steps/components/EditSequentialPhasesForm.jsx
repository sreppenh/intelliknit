// src/features/steps/components/EditSequentialPhasesForm.jsx
import React from 'react';
import { useProjectsContext } from '../../projects/hooks/useProjectsContext';
import { usePhaseManager } from '../hooks/usePhaseManager';
import PageHeader from '../../../shared/components/PageHeader';
import PhaseConfigTypeSelector from './shaping-wizard/PhaseConfigTypeSelector';
import PhaseConfigForm from './shaping-wizard/PhaseConfigForm';

const EditSequentialPhasesForm = ({
    componentIndex,
    editingStepIndex,
    onBack
}) => {
    const { currentProject, dispatch } = useProjectsContext();

    const component = currentProject.components[componentIndex];
    const step = component.steps[editingStepIndex];
    const construction = step.construction || 'flat';

    // Get current stitches for calculations
    const getCurrentStitches = () => {
        if (editingStepIndex === 0) {
            return step.startingStitches || 0;
        }
        const previousStep = component.steps[editingStepIndex - 1];
        return previousStep?.endingStitches || previousStep?.expectedStitches || 0;
    };

    const currentStitches = getCurrentStitches();

    // Initialize existing shaping data
    const existingShapingData = step.wizardConfig?.shapingConfig?.config || {};
    const initialShapingData = {
        phases: existingShapingData.phases || [],
        construction: existingShapingData.construction || construction,
        description: existingShapingData.description || ''
    };

    // Use the same phase manager hook as the original wizard
    const phaseManager = usePhaseManager(currentStitches, construction, initialShapingData);

    const {
        phases,
        currentScreen,
        phaseTypes,
        tempPhaseConfig,
        setTempPhaseConfig,
        editingPhaseId,
        stepDescription,
        setStepDescription,
        calculateSequentialPhases,
        getPhaseDescription,
        getPhasePreview,
        getStitchContext,
        calculatePhaseEndingStitches,
        handleAddPhase,
        handleEditPhase,
        handleDeletePhase,
        handleTypeSelect,
        handleSavePhaseConfig,
        handleConfigureBack
    } = phaseManager;

    // In EditSequentialPhasesForm.jsx, add right after the phaseManager initialization:
    console.log('🔧 EDIT PHASES DEBUG:', {
        existingShapingData,
        initialShapingData,
        phasesFromManager: phases,
        currentScreen,
        stepWizardConfig: step.wizardConfig
    });
    // Calculate result for validation and preview
    const result = calculateSequentialPhases();

    // Calculate current phase number
    const getCurrentPhaseNumber = () => {
        if (editingPhaseId) {
            const phaseIndex = phases.findIndex(p => p.id === editingPhaseId);
            return phaseIndex + 1;
        } else {
            return phases.length + 1;
        }
    };

    // Handle back navigation from type selector
    const handleTypeSelectBack = () => {
        if (phases.length === 0) {
            onBack(); // Exit entirely if no phases
        } else {
            phaseManager.goToSummary(); // Go back to summary
        }
    };

    // Handle saving all changes
    const handleSave = () => {
        // Create updated shaping configuration
        const updatedShapingConfig = {
            type: 'phases',
            config: {
                phases: phases,
                construction: construction,
                calculation: result,
                description: stepDescription
            }
        };

        // Update the step with new shaping data
        const updatedWizardConfig = {
            ...step.wizardConfig,
            shapingConfig: updatedShapingConfig
        };

        // Update step with new ending stitches and description from calculation
        const updatedStep = {
            ...step,
            wizardConfig: updatedWizardConfig,
            endingStitches: result.endingStitches,
            totalRows: result.totalRows,
            description: result.instruction // Update description with new instruction
        };

        dispatch({
            type: 'UPDATE_STEP',
            payload: {
                componentIndex,
                stepIndex: editingStepIndex,
                step: updatedStep
            }
        });

        onBack();
    };

    const canSave = () => {
        return phases.length > 0 && !result.error && result.instruction;
    };

    // Render different screens based on current state
    const renderCurrentScreen = () => {
        switch (currentScreen) {
            case 'summary':
                return renderSummaryScreen();
            case 'type-select':
                return (
                    <PhaseConfigTypeSelector
                        phaseTypes={phaseTypes}
                        onTypeSelect={handleTypeSelect}
                        onBackToSummary={handleTypeSelectBack}
                        phases={phases}
                        phaseNumber={getCurrentPhaseNumber()}
                    />
                );
            case 'configure':
                return (
                    <PhaseConfigForm
                        tempPhaseConfig={tempPhaseConfig}
                        setTempPhaseConfig={setTempPhaseConfig}
                        phaseTypes={phaseTypes}
                        phases={phases}
                        currentStitches={currentStitches}
                        construction={construction}
                        editingPhaseId={editingPhaseId}
                        onSave={handleSavePhaseConfig}
                        onBack={handleConfigureBack}
                        getPhasePreview={getPhasePreview}
                        getStitchContext={getStitchContext}
                        calculatePhaseEndingStitches={calculatePhaseEndingStitches}
                        phaseNumber={getCurrentPhaseNumber()}
                    />
                );
            default:
                return renderSummaryScreen();
        }
    };

    const renderSummaryScreen = () => (
        <div className="p-6 bg-yarn-50">
            <div className="space-y-6">
                <div>
                    <h2 className="content-header-primary">📈 Sequential Phases</h2>
                    <p className="content-subheader">
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
                                {phases.map((phase, index) => (
                                    <div key={phase.id} className="card">
                                        <div className="bg-wool-50 p-4 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-sage-100 rounded-full flex items-center justify-center text-sm font-bold text-sage-700">
                                                    {index + 1}
                                                </div>
                                                <div>
                                                    <div className="font-semibold text-wool-700 flex items-center gap-2">
                                                        <span>{phaseTypes.find(t => t.id === phase.type)?.icon}</span>
                                                        {phaseTypes.find(t => t.id === phase.type)?.name}
                                                    </div>
                                                    <div className="text-sm text-wool-500">
                                                        {getPhaseDescription(phase)}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
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
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Add Another Phase */}
                        <button
                            onClick={handleAddPhase}
                            className="w-full p-4 border-2 border-dashed border-wool-300 rounded-xl text-wool-500 hover:border-sage-400 hover:text-sage-600 transition-colors flex items-center justify-center gap-2"
                        >
                            <span className="text-xl">➕</span>
                            Add Another Phase
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

                        {/* Step Description */}
                        <div>
                            <label className="form-label">
                                Step Description <span className="text-wool-400">(Optional)</span>
                            </label>
                            <textarea
                                value={stepDescription}
                                onChange={(e) => setStepDescription(e.target.value)}
                                placeholder="e.g., sleeve decrease shaping, waist shaping, shoulder cap decreases..."
                                rows={3}
                                className="w-full border-2 border-wool-200 rounded-xl px-4 py-4 text-base focus:border-sage-500 focus:ring-0 transition-colors placeholder-wool-400 bg-white resize-none"
                            />
                            <div className="text-xs text-wool-500 mt-1">
                                Add a meaningful description to help identify this shaping sequence in your step list
                            </div>
                        </div>

                        {/* Preview */}
                        {result.instruction && (
                            <div className="card-info">
                                <h4 className="text-sm font-semibold text-lavender-700 mb-3">Preview</h4>
                                <div className="space-y-2 text-sm">
                                    <div className="text-lavender-700">
                                        <span className="font-medium">Instruction:</span> {result.instruction}
                                    </div>
                                    <div className="text-lavender-600">
                                        {result.startingStitches || currentStitches} stitches → {result.endingStitches || currentStitches} stitches
                                        ({construction}) • {result.totalRows || 1} total rows
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Save Button */}
                        <div className="pt-4 border-t border-wool-200">
                            <div className="flex gap-3">
                                <button
                                    onClick={onBack}
                                    className="flex-1 btn-tertiary"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={!canSave()}
                                    className="flex-1 btn-primary"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-yarn-50">
            <div className="max-w-md mx-auto bg-white min-h-screen shadow-lg">
                {/* Only show PageHeader on summary screen */}
                {currentScreen === 'summary' && (
                    <PageHeader
                        title="Edit Configuration"
                        subtitle="Sequential Phases settings"
                        onBack={onBack}
                        showBackButton={true}
                        showCancelButton={true}
                        onCancel={onBack}
                    />
                )}

                {renderCurrentScreen()}
            </div>
        </div>
    );
};

export default EditSequentialPhasesForm;