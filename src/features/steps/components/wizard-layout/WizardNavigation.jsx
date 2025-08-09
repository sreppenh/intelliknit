import React from 'react';

const WizardNavigation = ({ wizard, onBack }) => {
  const getButtonText = () => {
    if (wizard.wizardStep === 4) return 'Add Step';
    if (wizard.wizardStep === 2 && wizard.wizardData.stitchPattern.pattern === 'Cast On') return 'Add Step';
    return 'Continue →';
  };

  return (
    <div className="pt-6 border-t border-wool-100">
      {/* UPDATED: Horizontal layout with Back instead of Cancel */}
      <div className="flex gap-3">
        {/* Back button - smaller, 1/3 width */}
        <button
          onClick={onBack}
          className="flex-1 btn-tertiary"
        >
          ← Back
        </button>

        {/* Primary button - larger, 2/3 width */}
        <button
          onClick={wizard.navigation.nextStep}
          disabled={!wizard.navigation.canProceed()}
          className="flex-2 btn-primary"
          style={{ flexGrow: 2 }}
        >
          {getButtonText()}
        </button>
      </div>
    </div>
  );
};

export default WizardNavigation;