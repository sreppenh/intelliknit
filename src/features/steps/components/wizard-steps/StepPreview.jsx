import React from 'react';
import { useStepCalculation } from '../../hooks/useStepCalculation';
import { useStepGeneration } from '../../hooks/useStepGeneration';


const StepPreview = ({ wizard, onAddStep, onAddStepAndContinue, onBack, onFinishComponent }) => {
  const { calculateEffect } = useStepCalculation();
  const { generateInstruction } = useStepGeneration(wizard.construction);

  const instruction = generateInstruction(wizard.wizardData);
  const effect = calculateEffect(wizard.wizardData, wizard.currentStitches, wizard.construction);

  // Calculate current step number
  const currentStepNumber = (wizard.component?.steps?.length || 0) + 1;

  // Fixed: onFinishComponent should add current step first, then show ending wizard
  const handleFinishComponent = () => {
    // First add the current step
    onAddStep();
    // Then trigger the finish component flow (which will show ending wizard)
    onFinishComponent();
  };

  return (
    <div className="stack-lg">
      {/* Celebration Header */}
      <div className="text-center">
        <div className="text-3xl mb-2">🎉</div>
        <h2 className="text-xl font-semibold text-sage-700 mb-1">Step {currentStepNumber} Ready!</h2>
        <p className="text-wool-500 text-sm">Added to {wizard.component?.name}</p>
      </div>

      {/* Visual Step Summary - Clean and Scannable */}
      <div className="bg-gradient-to-r from-sage-50 to-yarn-50 border-2 border-sage-200 rounded-2xl p-5 shadow-sm">

        {/* Pattern Name */}
        <div className="text-center mb-4">
          <h3 className="text-lg font-semibold text-sage-700">{wizard.wizardData.stitchPattern.pattern}</h3>
          <p className="text-sage-600 text-sm">{effect.totalRows} rows</p>
        </div>

        {/* Math Summary - More Connected */}
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="bg-white rounded-lg px-4 py-3 text-center shadow-sm border border-sage-200">
            <div className="text-xl font-bold text-sage-700">{effect.startingStitches}</div>
            <div className="text-xs text-sage-600">start</div>
          </div>

          <div className="flex items-center gap-1">
            <div className="h-0.5 w-4 bg-sage-400"></div>
            <span className="text-sage-600 text-lg">→</span>
            <div className="h-0.5 w-4 bg-sage-400"></div>
          </div>

          <div className="bg-white rounded-lg px-4 py-3 text-center shadow-sm border border-sage-200">
            <div className="text-xl font-bold text-sage-700">{effect.endingStitches}</div>
            <div className="text-xs text-sage-600">end</div>
          </div>
        </div>

        {/* Generated Instruction - Compact */}
        <div className="bg-white bg-opacity-50 rounded-lg p-3 text-center">
          <p className="text-sm text-sage-700 italic">"{instruction}"</p>
        </div>
      </div>

      {/* Action Buttons - Prioritized */}
      <div className="stack-sm">

        {/* Primary Action - Add Another (Most Common) */}
        <button
          onClick={onAddStepAndContinue}
          className="w-full btn-secondary btn-lg flex items-center justify-center gap-3"
        >
          <span className="text-xl">➕</span>
          <span>Add Another Step</span>
          <div className="text-xs bg-yarn-500 px-2 py-1 rounded-full">Most common</div>
        </button>

        {/* Secondary Actions Row */}
        <div className="flex justify-center">
          <button
            onClick={handleFinishComponent}
            className="bg-sage-500 text-white py-3 px-4 rounded-xl font-semibold text-base hover:bg-sage-600 transition-colors flex items-center justify-center gap-2"
          >
            <span className="text-lg">🏁</span>
            <span>Finish {wizard.component?.name}</span>
          </button>
        </div>
      </div>

      {/* Quick Edit Option - Subtle */}
      <div className="text-center pt-2">
        <button
          onClick={() => wizard.navigation.goToStep(1)}
          className="text-wool-500 text-sm hover:text-sage-600 transition-colors"
        >
          ✏️ Need to edit this step?
        </button>
      </div>
    </div>
  );
};

export default StepPreview;