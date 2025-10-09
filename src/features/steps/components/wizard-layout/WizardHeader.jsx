import React from 'react';
import PageHeader from '../../../../shared/components/PageHeader';

const WizardHeader = ({ wizard, onBack, onCancel, onGoToLanding }) => {

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
    onBack();
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

  return (
    <PageHeader
      useBranding={true}
      onHome={onGoToLanding}
      onBack={handleBack}
      showCancelButton={!!onCancel}
      onCancel={onCancel}
      compact={true}
      sticky={true}
      showContextualBar={true}
      contextualInfo={{
        leftContent: (
          <div className="flex items-center gap-2 text-sage-700">
            <span>{getConstructionDisplay()}</span>
            <span>•</span>
            <span>{getPatternType()}</span>
            <span>•</span>
            <span className={wizard.wizardData.hasShaping && wizard.wizardStep >= 3 ? 'font-semibold' : ''}>
              {getStitchCountDisplay()}
            </span>
          </div>
        )
      }}
    />
  );
};

export default WizardHeader;