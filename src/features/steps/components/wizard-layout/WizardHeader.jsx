import React from 'react';
import { CONSTRUCTION_TYPES } from '../../../../shared/utils/constants';
import { createWizardNavigator } from '../wizard-navigation/WizardNavigator';
import { useProjectsContext } from '../../../projects/hooks/useProjectsContext';

const WizardHeader = ({ wizard, onBack, onCancel }) => {
  const { currentProject } = useProjectsContext();
  // Handle back navigation - check internal component state first
  const handleBack = () => {
    // CRITICAL: Check if this is a shaping wizard first
    if (wizard.wizardData?.isShapingWizard) {
      // For shaping wizard, always use the passed onBack prop
      onBack();
      return;
    }

    // Original StepWizard logic continues below...
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

    // For all other cases, use the standard navigation
    const navigator = createWizardNavigator(wizard.wizardData, wizard.wizardStep);
    const previousStep = navigator.getPreviousStep();

    if (previousStep && previousStep !== wizard.wizardStep) {
      wizard.navigation.goToStep(previousStep);
    } else {
      onBack();
    }
  };

  // Get project icon based on type
  const getProjectIcon = (projectType) => {
    const icons = {
      sweater: '🧥',
      shawl: '🌙',
      hat: '🎩',
      scarf_cowl: '🧣',
      socks: '🧦',
      blanket: '🛏️',
      toys: '🧸',
      other: '✨'
    };
    return icons[projectType] || '🧶';
  };

  // Get project context for main header
  const getProjectContext = () => {
    const projectName = currentProject?.name || 'Project';
    const componentName = wizard.component?.name || 'Component';
    const projectIcon = getProjectIcon(currentProject?.projectType);

    return { projectName, componentName, projectIcon };
  };

  // Get construction display for contextual bar
  const getConstructionDisplay = () => {
    // First try component construction (from recent component creation work)
    if (wizard.component?.construction) {
      return wizard.component.construction === 'flat' ? 'Flat' : 'Round';
    }
    // Fallback to wizard construction
    return wizard.construction === 'flat' ? 'Flat' : 'Round';
  };

  // Get pattern type for contextual display
  const getPatternType = () => {
    const { pattern } = wizard.wizardData.stitchPattern || {};
    if (!pattern) return 'Pattern';
    return pattern;
  };

  // Get stitch count display with calculation state
  const getStitchCountDisplay = () => {
    // During calculations or special states, show "Working with X stitches"
    if (wizard.wizardData.hasShaping && wizard.wizardStep >= 3) {
      return `**Working with ${wizard.currentStitches} stitches**`;
    }
    // Normal state
    return `${wizard.currentStitches} stitches`;
  };

  // Get step name for page title (simplified)
  const getStepName = () => {
    const { category, pattern } = wizard.wizardData.stitchPattern || {};

    if (wizard.wizardData.isShapingWizard) {
      return 'Shaping';
    }

    switch (wizard.wizardStep) {
      case 1:
        if (category && !pattern) {
          return 'Choose Pattern';
        }
        return 'Stitch Pattern';
      case 2: return 'Pattern Details';
      case 3:
        if (pattern === 'Cast On') return 'Cast On';
        if (pattern === 'Bind Off') return 'Bind Off';
        return 'Duration';
      case 4:
        if (wizard.wizardData.hasShaping === false) return 'Duration';
        return 'Shaping';
      case 5: return 'Preview';
      default: return 'Configuration';
    }
  };

  return (
    <>
      {/* 1. Main Header (Dark Green) - Project Context */}
      <div className="bg-sage-500 text-white px-6 py-4">
        <div className="flex items-center gap-3">
          <button
            onClick={handleBack}
            className="text-white text-xl hover:bg-white hover:bg-opacity-20 rounded-full w-10 h-10 flex items-center justify-center transition-colors flex-shrink-0"
          >
            ←
          </button>

          <div className="flex-1 min-w-0">
            {/* Project Name + Icon (Primary) */}
            {/* Project Name + Icon (Primary) */}
            <div className="flex items-center justify-center gap-2">
              <h1 className="text-lg font-semibold truncate">
                {getProjectContext().projectName}
              </h1>
              <span className="text-lg flex-shrink-0">
                {getProjectContext().projectIcon}
              </span>
            </div>

            {/* Component Name (Secondary) */}
            <p className="text-sage-100 text-sm truncate">
              {getProjectContext().componentName}
            </p>
          </div>

          {onCancel && (
            <button
              onClick={onCancel}
              className="text-white text-xl hover:bg-white hover:bg-opacity-20 rounded-full w-10 h-10 flex items-center justify-center transition-colors flex-shrink-0"
              title="Cancel step creation"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* 2. Contextual Subheader (Light Green) - Technical Context */}
      <div className="px-6 py-3 bg-sage-100 border-b border-sage-200">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-sage-700">
            <span>{getConstructionDisplay()}</span>
            <span>•</span>
            <span>{getPatternType()}</span>
            <span>•</span>
            <span className={wizard.wizardData.hasShaping && wizard.wizardStep >= 3 ? 'font-semibold' : ''}>
              {getStitchCountDisplay()}
            </span>
          </div>
        </div>
      </div>
    </>
  );
};

export default WizardHeader;