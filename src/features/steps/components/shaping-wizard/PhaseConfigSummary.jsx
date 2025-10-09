// src/features/steps/components/shaping-wizard/PhaseConfigSummary.jsx
import React, { useState } from 'react';
import useStepSaveHelper, { StepSaveErrorModal } from '../../../../shared/utils/StepSaveHelper';
import { useActiveContext } from '../../../../shared/hooks/useActiveContext'; // ✅ FIXED: Use context bridge
import { PhaseCalculationService } from '../../../../shared/utils/PhaseCalculationService';
import { getConstructionTerms } from '../../../../shared/utils/ConstructionTerminology';
import ShapingHeader from './ShapingHeader';
import StandardModal from '../../../../shared/components/modals/StandardModal';

const PhaseConfigSummary = ({
  phases,
  phaseTypes,
  result,
  construction,
  currentStitches,
  componentIndex,
  onExitToComponentSteps,
  onAddPhase,
  onEditPhase,
  onDeletePhase,
  onBack,
  onComplete,
  onCancel,
  getPhaseDescription,
  wizardData,
  onGoToLanding,
  wizard,
  mode = 'create', // ✅ ADDED: Accept mode prop with default
  contextMode = 'project' // ✅ ADDED: Accept contextMode for useActiveContext
}) => {

  // ✅ FIXED: Use context bridge instead of hardcoded projects context
  const { dispatch } = useActiveContext(contextMode);
  const { saveStepAndNavigate, isLoading, error, clearError } = useStepSaveHelper();
  const [showBackWarning, setShowBackWarning] = useState(false);

  // Determine if we're in edit mode
  const isEditMode = mode === 'edit';

  // FIXED: Mode-aware save handler
  const handleCompleteStep = async () => {
    if (isEditMode) {
      // Edit mode: Call onComplete directly (triggers UPDATE_STEP in EditSequentialPhasesForm)
      onComplete({
        phases: phases,
        construction: construction,
        calculation: result,
        description: result.instruction
      });
    } else {

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
    }
  };

  const handleBackWithWarning = () => {
    if (phases.length > 0) {
      setShowBackWarning(true);
    } else {
      onBack();
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

  return (
    <div>
      {/* FIXED: Only show ShapingHeader in create mode */}
      {!isEditMode && (
        <ShapingHeader
          onBack={handleBackWithWarning}
          onGoToLanding={onGoToLanding}
          wizard={wizard}
          onCancel={() => onCancel('exit')}
        />
      )}

      {/* FIXED: Add edit mode indicator */}
      <div className="p-6 stack-lg">
        {isEditMode && (
          <div className="bg-yarn-100 border-2 border-yarn-200 rounded-xl p-3 mb-4">
            <p className="text-sm text-yarn-600 font-medium">
              🔧 Edit Mode - Sequential Phases Configuration
            </p>
            <p className="text-xs text-yarn-500 mt-1">
              Update your phase sequence settings
            </p>
          </div>
        )}

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
            <div className="flex gap-3">
              <button
                onClick={handleBackWithWarning}
                className="btn-tertiary flex-1"
              >
                ← Back
              </button>
              <button
                onClick={onAddPhase}
                className="btn-primary flex-1"
              >
                Add Your First Phase
              </button>
            </div>
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
                                  onClick={() => onEditPhase(phase.id)}
                                  className="p-2 text-wool-500 hover:bg-wool-200 rounded-lg transition-colors"
                                >
                                  ✏️
                                </button>
                                <button
                                  onClick={() => onDeletePhase(phase.id)}
                                  className="delete-icon-sm"
                                  aria-label={`Delete ${phaseType?.name || 'phase'}`}
                                  title="Delete phase"
                                >
                                  ×
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
              onClick={onAddPhase}
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
                onClick={handleBackWithWarning}
                className="btn-tertiary flex-1"
              >
                ← Back
              </button>
              <button
                onClick={handleCompleteStep}
                disabled={!result.instruction || result.error || phases.length === 0}
                className="btn-primary flex-1"
              >
                {/* FIXED: Mode-aware button text */}
                {isLoading ? 'Saving...' : (isEditMode ? 'Save Changes' : 'Complete Step')}
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

      {/* ✨ BEAUTIFUL StandardModal replacement */}
      <StandardModal
        isOpen={showBackWarning}
        onClose={() => setShowBackWarning(false)}
        onConfirm={() => { setShowBackWarning(false); onBack(); }}
        category="warning"
        colorScheme="red"
        title="Lose Shaping Configuration?"
        subtitle="Your phase sequence will be deleted"
        icon="⚠️"
        primaryButtonText="Go Back Anyway"
        secondaryButtonText="Stay Here"
      >
        <div className="text-center">
          <p className="text-wool-600">
            Going back will delete your current phase sequence. This cannot be undone.
          </p>
        </div>
      </StandardModal>
    </div>
  );
};

export default PhaseConfigSummary;