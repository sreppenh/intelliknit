// src/features/steps/components/shaping-wizard/PhaseConfigSummary.jsx
import React from 'react';
import useStepSaveHelper, { StepSaveErrorModal } from '../../../../shared/utils/StepSaveHelper';
import { useProjectsContext } from '../../../projects/hooks/useProjectsContext';
import IntelliKnitLogger from '../../../../shared/utils/ConsoleLogging';
import { PhaseCalculationService } from '../../../../shared/utils/PhaseCalculationService';
import { getConstructionTerms } from '../../../../shared/utils/ConstructionTerminology';

const PhaseConfigSummary = ({
  phases,
  phaseTypes,
  result,
  construction,
  currentStitches, //NEW
  componentIndex,
  onExitToComponentSteps,
  onAddPhase,
  onEditPhase,
  onDeletePhase,
  onBack,
  onComplete,
  getPhaseDescription,
  wizardData
}) => {

  // ✅ ADD THE HELPER HOOKS RIGHT HERE:
  const { dispatch } = useProjectsContext();
  const { saveStepAndNavigate, isLoading, error, clearError } = useStepSaveHelper();

  const handleCompleteStep = async () => {
    console.log('🔧 PHASE HANDLE COMPLETE CALLED');
    console.log('🔧 PHASE DATA:', { phases, result, currentStitches, componentIndex });

    // ADD THIS DEBUG:
    console.log('🔍 RESULT OBJECT:', result);
    console.log('🔍 ENDING STITCHES:', result.endingStitches);

    // 🎯 PRESERVE: Original data structure that parent expects
    const originalPhaseData = {
      phases: phases,
      construction: construction,
      calculation: result, // ← This IS the calculation data
    };

    // ✅ FIXED: Use result directly since it contains the calculated values
    const saveResult = await saveStepAndNavigate({
      instruction: result.instruction,
      effect: {
        success: !result.error,
        endingStitches: result.endingStitches || currentStitches, // ← Fixed!
        startingStitches: result.startingStitches || currentStitches, // ← Fixed!
        totalRows: result.totalRows || 1, // ← Fixed!
        error: result.error
      },
      wizardData: {
        stitchPattern: wizardData.stitchPattern,
        hasShaping: true,
        shapingConfig: {
          type: 'phases',
          config: {
            calculation: result, // ← Fixed! Put result at config.calculation level
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