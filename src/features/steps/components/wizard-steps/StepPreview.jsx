import React from 'react';
import { useStepCalculation } from '../../hooks/useStepCalculation';
import { useStepGeneration } from '../../hooks/useStepGeneration';

const StepPreview = ({ wizard, onAddStep, onAddStepAndContinue, onBack, onFinishComponent }) => {
  const { calculateEffect } = useStepCalculation();
  const { generateInstruction } = useStepGeneration();

  const instruction = generateInstruction(wizard.wizardData);
  const effect = calculateEffect(wizard.wizardData, wizard.currentStitches, wizard.construction);

  // Fixed: onFinishComponent should add current step first, then show ending wizard
  const handleFinishComponent = () => {
    // First add the current step
    onAddStep();
    // Then trigger the finish component flow (which will show ending wizard)
    onFinishComponent();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-wool-700 mb-3">Review Step Details</h2>
        <p className="text-wool-500 mb-4">Step ready to be added to {wizard.component?.name}</p>
      </div>

      <div className="space-y-4">
        <div className="bg-sage-100 border-2 border-sage-200 rounded-xl p-4">
          <div className="font-semibold text-sage-700 mb-2">Generated Instruction:</div>
          <div className="text-sage-800">
            {instruction}
          </div>
        </div>

        <div className="bg-yarn-100 border-2 border-yarn-200 rounded-xl p-4">
          <div className="font-semibold text-yarn-700 mb-2">Calculated Effect:</div>
          <div className="text-sm text-yarn-700">
            {effect.success ? (
              effect.totalRows 
                ? `${effect.totalRows} rows • ${effect.startingStitches} → ${effect.endingStitches} stitches`
                : `Measurement-based • ${effect.startingStitches} → ${effect.endingStitches} stitches`
            ) : (
              `Manual step • ${effect.startingStitches} → ${effect.endingStitches} stitches`
            )}
          </div>
        </div>

        <div className="space-y-3">
          {/* Add Another Step - primary action */}
          <button
            onClick={onAddStepAndContinue}
            className="w-full bg-yarn-600 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:bg-yarn-700 transition-colors shadow-sm flex items-center justify-center gap-2"
          >
            <span className="text-xl">🧶</span>
            Add Another Step
          </button>
          
          {/* Finish Component - Fixed to add current step first */}
          <button
            onClick={handleFinishComponent}
            className="w-full bg-sage-500 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:bg-sage-600 transition-colors shadow-sm"
          >
            🏁 Finish {wizard.component?.name}
          </button>

          <div className="flex gap-3">
            <button
              onClick={() => wizard.navigation.goToStep(1)}
              className="flex-1 bg-wool-100 text-wool-700 py-3 px-4 rounded-xl font-semibold text-base hover:bg-wool-200 transition-colors border border-wool-200"
            >
              ✏️ Edit Step
            </button>
            
            <button
              onClick={onBack}
              className="flex-1 bg-wool-100 text-wool-700 py-3 px-4 rounded-xl font-semibold text-base hover:bg-wool-200 transition-colors border border-wool-200"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StepPreview;