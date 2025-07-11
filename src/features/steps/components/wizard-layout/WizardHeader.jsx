import React from 'react';
import { CONSTRUCTION_TYPES } from '../../../../shared/utils/constants';

const WizardHeader = ({ wizard, onBack, onCancel }) => {
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
      {/* UPDATED: Header with X button in top right */}
      <div className="bg-sage-500 text-white px-6 py-4">
        <div className="flex items-center gap-3">
          {wizard.wizardStep > 1 && (
            <button 
              onClick={wizard.navigation.previousStep}
              className="text-white text-xl hover:bg-white hover:bg-opacity-20 rounded-full w-10 h-10 flex items-center justify-center transition-colors"
            >
              ←
            </button>
          )}
          {wizard.wizardStep === 1 && (
            <button 
              onClick={onBack}
              className="text-white text-xl hover:bg-white hover:bg-opacity-20 rounded-full w-10 h-10 flex items-center justify-center transition-colors"
            >
              ←
            </button>
          )}
          <div className="flex-1">
            <h1 className="text-lg font-semibold">
              {wizard.isEditing ? 'Edit Step' : 'Add Pattern Step'}
            </h1>
            <p className="text-sage-100 text-sm">
              {wizard.isEditing ? `Editing: ${wizard.editingStep?.description?.substring(0, 30)}...` : 
               `Step ${wizard.wizardStep} of 4: ${getStepName(wizard.wizardStep)}`}
            </p>
          </div>
          {/* NEW: X button for canceling entire flow */}
          {onCancel && (
            <button 
              onClick={onCancel}
              className="text-white text-xl hover:bg-white hover:bg-opacity-20 rounded-full w-10 h-10 flex items-center justify-center transition-colors"
              title="Cancel step creation"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* UPDATED: Construction info bar - now more compact */}
      <div className="px-6 py-3 bg-sage-100 border-b border-sage-200">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <span className="font-medium text-sage-700">Construction:</span>
            <div className="bg-sage-200 border border-sage-300 rounded-md p-0.5">
              <div className="grid grid-cols-2 gap-0.5">
                <button
                  onClick={() => wizard.setConstruction('flat')}
                  className={`px-2 py-1 rounded text-xs font-medium transition-all duration-200 ${
                    wizard.construction === 'flat'
                      ? 'bg-white text-sage-700 shadow-sm'
                      : 'text-sage-600 hover:text-sage-800'
                  }`}
                >
                  Flat
                </button>
                
                <button
                  onClick={() => wizard.setConstruction('round')}
                  className={`px-2 py-1 rounded text-xs font-medium transition-all duration-200 ${
                    wizard.construction === 'round'
                      ? 'bg-white text-sage-700 shadow-sm'
                      : 'text-sage-600 hover:text-sage-800'
                  }`}
                >
                  Round
                </button>
              </div>
            </div>
          </div>
          <div className="text-sage-600 text-xs">
            {wizard.currentStitches} stitches • {wizard.component?.name}
          </div>
        </div>
      </div>
    </>
  );
};

export default WizardHeader;