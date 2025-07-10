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
      {/* UPDATED: Compact header with sage colors */}
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
        </div>
      </div>

      {/* UPDATED: Construction info bar - now more compact */}
      <div className="px-6 py-3 bg-sage-100 border-b border-sage-200">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <span className="font-medium text-sage-700">Construction:</span>
            <select
              value={wizard.construction}
              onChange={(e) => wizard.setConstruction(e.target.value)}
              className="text-sm border border-sage-300 rounded-lg px-3 py-1 bg-white text-sage-700 focus:ring-2 focus:ring-sage-500 focus:border-transparent"
            >
              <option value={CONSTRUCTION_TYPES.FLAT}>Flat</option>
              <option value={CONSTRUCTION_TYPES.ROUND}>Round</option>
            </select>
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