import React from 'react';
import { useStepCalculation } from '../../hooks/useStepCalculation';
import { useStepGeneration } from '../../hooks/useStepGeneration';

const StepPreview = ({ wizard, onAddStep, onAddStepAndContinue, onBack }) => {
  const { calculateEffect } = useStepCalculation();
  const { generateInstruction } = useStepGeneration();

  const instruction = generateInstruction(wizard.wizardData);
  const effect = calculateEffect(wizard.wizardData, wizard.currentStitches, wizard.construction);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Review Step Details</h2>
        <p className="text-sm text-gray-600 mb-4">Step ready to be added to {wizard.component?.name}</p>
      </div>

      <div className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="font-medium text-blue-800 mb-2">Generated Instruction:</div>
          <div className="text-blue-900">
            {instruction}
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="font-medium text-green-800 mb-2">Calculated Effect:</div>
          <div className="text-sm text-green-700">
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
          <button
            onClick={onAddStepAndContinue}
            className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition-colors"
          >
            ➕ Add Another Step
          </button>
          
          <button
            onClick={onAddStep}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            ✅ Finish {wizard.component?.name}
          </button>

          <div className="flex gap-3">
            <button
              onClick={() => wizard.navigation.goToStep(1)}
              className="flex-1 bg-yellow-600 text-white py-2 rounded-lg font-medium hover:bg-yellow-700 transition-colors"
            >
              ✏️ Edit Step
            </button>
            
            <button
              onClick={onBack}
              className="flex-1 bg-gray-500 text-white py-2 rounded-lg font-medium hover:bg-gray-600 transition-colors"
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
