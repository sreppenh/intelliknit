import React from 'react';
import { useProjectsContext } from '../../../projects/hooks/useProjectsContext';
import IntelliKnitLogger from '../../../../shared/utils/ConsoleLogging';

const WizardHeader = ({ wizard, onBack, onCancel }) => {
  const { currentProject } = useProjectsContext();

  // 🎯 NEW: Smart navigation - just 8 lines instead of 50!
  const handleBack = () => {
    const { category, pattern } = wizard.wizardData.stitchPattern || {};

    // Special case: Step 1 pattern selector sub-states
    if (wizard.wizardStep === 1 && category && !pattern) {
      // User is on "choose specific pattern" screen - go back to category selection
      wizard.updateWizardData('stitchPattern', { category: null, pattern: null });
      return;
    }

    // For everything else, use smart navigation
    const result = wizard.navigation.previousStep();

    // Handle exit if navigation stack is empty
    if (result?.shouldExit) {
      IntelliKnitLogger.debug('Wizard Header', 'Navigation stack empty - exiting wizard');
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