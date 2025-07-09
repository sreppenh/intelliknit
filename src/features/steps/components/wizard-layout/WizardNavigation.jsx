import React from 'react';

const WizardNavigation = ({ wizard, onBack }) => {
  const getButtonText = () => {
    if (wizard.wizardStep === 4) return 'Add Step';
    if (wizard.wizardStep === 2 && wizard.wizardData.stitchPattern.pattern === 'Cast On') return 'Add Step';
    return 'Continue →';
  };

  return (
    <div className="pt-6 border-t border-gray-200 space-y-3">
      <button
        onClick={wizard.navigation.nextStep}
        disabled={!wizard.navigation.canProceed()}
        className="w-full bg-purple-600 text-white py-3 rounded-lg font-medium hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
      >
        {getButtonText()}
      </button>
      
      <button
        onClick={onBack}
        className="w-full bg-gray-500 text-white py-2 rounded-lg font-medium hover:bg-gray-600 transition-colors"
      >
        Cancel
      </button>
    </div>
  );
};

export default WizardNavigation;