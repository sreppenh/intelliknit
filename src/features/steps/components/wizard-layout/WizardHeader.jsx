import React from 'react';
import { CONSTRUCTION_TYPES } from '../../../../shared/utils/constants';
import { createWizardNavigator } from '../wizard-navigation/WizardNavigator';

const WizardHeader = ({ wizard, onBack, onCancel }) => {
  // Handle back navigation - check internal component state first
  const handleBack = () => {
    const { category, pattern } = wizard.wizardData.stitchPattern || {};
    
    // If we're on step 1 and have selected a category but not a pattern,
    // we're on the "choose specific pattern" screen - go back to category selection
    if (wizard.wizardStep === 1 && category && !pattern) {
      wizard.updateWizardData('stitchPattern', { category: null, pattern: null });
      return;
    }
    
    // If we're on step 1 with no category, exit the wizard
    if (wizard.wizardStep === 1) {
      onBack();
      return;
    }
    
    // Special case: If we're going back to step 1 from step 2 OR step 3, we need to check
    // if the category has multiple patterns or if it auto-selected
    if ((wizard.wizardStep === 2 || wizard.wizardStep === 3) && pattern && category) {
      // Check if this category has multiple patterns
      const categoryPatternCounts = {
        basic: 3,      // Stockinette, Garter, Reverse Stockinette
        rib: 6,        // 1x1, 2x2, 3x3, 2x1, 1x1 Twisted, 2x2 Twisted
        textured: 4,   // Seed, Moss, Double Seed, Basketweave
        lace: 1,       // Lace Pattern
        cable: 1,      // Cable Pattern
        colorwork: 3   // Fair Isle, Intarsia, Stripes
      };
      
      const patternCount = categoryPatternCounts[category] || 1;
      
      if (patternCount > 1) {
        // Multiple patterns - clear pattern but keep category (go to pattern selector)
        wizard.updateWizardData('stitchPattern', { pattern: null });
        wizard.navigation.goToStep(1);
      } else {
        // Single pattern - clear both category and pattern (go to category selector)
        wizard.updateWizardData('stitchPattern', { category: null, pattern: null });
        wizard.navigation.goToStep(1);
      }
      return;
    }
    
    // For other cases, use the SMART navigator that knows about skipping
    const navigator = createWizardNavigator(wizard.wizardData, wizard.wizardStep);
    const previousStep = navigator.getPreviousStep();
    
    if (previousStep && previousStep !== wizard.wizardStep) {
      wizard.navigation.goToStep(previousStep);
    } else {
      onBack();
    }
  };

  // Get step name for display
  const getStepName = () => {
    const { category, pattern } = wizard.wizardData.stitchPattern || {};
    
  if (wizard.wizardData.isShapingWizard) {
    return 'Shaping Setup';
  }


    switch (wizard.wizardStep) {
      case 1: 
        if (category && !pattern) {
          // We're on the specific pattern selection screen
          const categoryNames = {
            basic: 'Basic Stitches',
            rib: 'Ribbing', 
            textured: 'Textured',
            lace: 'Lace',
            cable: 'Cables',
            colorwork: 'Colorwork'
          };
          return `Choose ${categoryNames[category] || 'Pattern'}`;
        }
        return 'Stitch Pattern';
      case 2: return 'Pattern Details';
      case 3: 
        if (pattern === 'Cast On') return 'Cast On Setup';
        if (pattern === 'Bind Off') return 'Bind Off Setup';
        return 'Duration & Shaping';
      case 4: 
        if (wizard.wizardData.hasShaping === false) return 'Duration Setup';
        return 'Configuration';
      case 5: return 'Preview';
      default: return 'Configuration';
    }
  };

  return (
    <>
      {/* Header with context-aware back button */}
      <div className="bg-sage-500 text-white px-6 py-4">
        <div className="flex items-center gap-3">
          <button 
            onClick={handleBack}
            className="text-white text-xl hover:bg-white hover:bg-opacity-20 rounded-full w-10 h-10 flex items-center justify-center transition-colors"
          >
            ←
          </button>
          
          <div className="flex-1">
            <h1 className="text-lg font-semibold">
              {wizard.isEditing ? 'Edit Step' : 'Add Pattern Step'}
            </h1>
            <p className="text-sage-100 text-sm">
              {wizard.isEditing ? 
                `Editing: ${wizard.editingStep?.description?.substring(0, 30)}...` : 
                getStepName()
              }
            </p>
          </div>
          
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

      {/* Construction info bar */}
      <div className="px-6 py-3 bg-sage-100 border-b border-sage-200">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <span className="font-medium text-sage-700">Construction:</span>
            <div className="bg-sage-200 border border-sage-300 rounded-md p-0.5">
              <div className="grid grid-cols-2 gap-1">
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