// src/features/steps/components/shaping-wizard/PhaseConfigSummary.jsx
import React from 'react';
import useStepSaveHelper, { StepSaveErrorModal } from '../../../../shared/utils/StepSaveHelper';
import { useProjectsContext } from '../../../projects/hooks/useProjectsContext';
import IntelliKnitLogger from '../../../../shared/utils/ConsoleLogging';

const PhaseConfigSummary = ({
  phases,
  phaseTypes,
  result,
  construction,
  currentStitches, //NEW
  stepDescription,        // NEW: Add this line
  setStepDescription,     // NEW: Add this line
  componentIndex,
  onExitToComponentSteps,
  onAddPhase,
  onEditPhase,
  onDeletePhase,
  onBack,
  onComplete,
  getPhaseDescription
}) => {

  // ✅ ADD THE HELPER HOOKS RIGHT HERE:
  const { dispatch } = useProjectsContext();
  const { saveStepAndNavigate, isLoading, error, clearError } = useStepSaveHelper();

  // ✅ ADD THIS FUNCTION RIGHT HERE:
  const handleCompleteStep = async () => {

    console.log('🔧 PHASE HANDLE COMPLETE CALLED');
    console.log('🔧 PHASE DATA:', { phases, result, currentStitches, componentIndex });


    // 🎯 PRESERVE: Original data structure that parent expects
    const originalPhaseData = {
      phases: phases,
      construction: construction,
      calculation: result,
      description: stepDescription
    };

    // ✅ ADD: Save the step using our helper
    const saveResult = await saveStepAndNavigate({
      instruction: result.instruction,
      effect: {
        success: !result.error,
        endingStitches: result.calculation?.endingStitches || currentStitches,
        startingStitches: result.calculation?.startingStitches || currentStitches,
        totalRows: result.calculation?.totalRows || 1,
        error: result.error
      },
      wizardData: {
        stitchPattern: { pattern: 'Sequential Phases' },
        hasShaping: true,
        shapingConfig: {
          type: 'phases',
          config: originalPhaseData
        }
      },
      currentStitches,
      construction,
      componentIndex,
      dispatch,
      skipNavigation: true
    });

    if (saveResult.success) {
      // 🔧 PRESERVE: Call original onComplete to maintain parent logic
      onExitToComponentSteps(); // You'll need to pass this prop down
      //onComplete(originalPhaseData);
    }
  };

  return (
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
            onClick={onAddPhase}
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
                        onClick={() => onEditPhase(phase.id)}
                        className="p-2 text-wool-500 hover:bg-wool-200 rounded-lg transition-colors"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => onDeletePhase(phase.id)}
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
            onClick={onAddPhase}
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
              className="input-field-lg resize-none"
            />
            <div className="form-help">
              Add a meaningful description to help identify this shaping sequence in your step list
            </div>
          </div>




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
              disabled={!result.instruction || result.error || phases.length === 0}
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
  );
};

export default PhaseConfigSummary;