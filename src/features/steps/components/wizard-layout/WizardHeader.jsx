import React from 'react';
import { CONSTRUCTION_TYPES } from '../../../../shared/utils/constants';

const WizardHeader = ({ wizard, onBack }) => {
  const getStepName = (step) => {
    switch (step) {
      case 1: return 'Stitch Pattern';
      case 2: return 'Pattern Details';
      case 3: return 'Configuration';
      case 4: return 'Preview';
      default: return 'Unknown';
    }
  };

  return (
    <>
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6">
        <div className="flex items-center gap-4">
          {wizard.wizardStep > 1 && (
            <button 
              onClick={wizard.navigation.previousStep}
              className="text-2xl hover:bg-white hover:bg-opacity-20 rounded-full w-10 h-10 flex items-center justify-center transition-colors"
            >
              ←
            </button>
          )}
          {wizard.wizardStep === 1 && (
            <button 
              onClick={onBack}
              className="text-2xl hover:bg-white hover:bg-opacity-20 rounded-full w-10 h-10 flex items-center justify-center transition-colors"
            >
              ←
            </button>
          )}
          <div className="flex-1">
            <h1 className="text-xl font-bold">
              {wizard.isEditing ? 'Edit Step' : 'Add Pattern Step'}
            </h1>
            <p className="text-purple-100">
              {wizard.isEditing ? `Editing: ${wizard.editingStep?.description?.substring(0, 30)}...` : 
               `Step ${wizard.wizardStep} of 4: ${getStepName(wizard.wizardStep)}`}
            </p>
          </div>
        </div>
        
        {/* Progress Dots */}
        <div className="flex justify-center gap-2 mt-4">
          {[1, 2, 3, 4].map(step => (
            <div 
              key={step}
              className={`w-3 h-3 rounded-full transition-colors ${
                step <= wizard.wizardStep ? 'bg-white' : 'bg-white bg-opacity-30'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Construction & Current Steps Info */}
      <div className="p-4 bg-blue-50 border-b border-blue-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-blue-800">Construction:</span>
          <select
            value={wizard.construction}
            onChange={(e) => wizard.setConstruction(e.target.value)}
            className="text-sm border border-blue-300 rounded px-2 py-1 bg-white"
          >
            <option value={CONSTRUCTION_TYPES.FLAT}>Flat</option>
            <option value={CONSTRUCTION_TYPES.ROUND}>Round</option>
          </select>
        </div>
        <div className="text-xs text-blue-600">
          Current stitches: {wizard.currentStitches} • Step {wizard.component.steps.length + 1} of {wizard.component.name}
        </div>
      </div>
    </>
  );
};

export default WizardHeader;