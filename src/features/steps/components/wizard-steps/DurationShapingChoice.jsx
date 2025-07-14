import React from 'react';

const DurationShapingChoice = (props) => {
  const { wizardData, updateWizardData } = props;
  const { pattern } = wizardData.stitchPattern;

  const handleDurationChoice = () => {
    updateWizardData('hasShaping', false);
    updateWizardData('choiceMade', true);
    // Auto-advance to next step after a brief delay
    setTimeout(() => {
      if (props.onAdvanceStep) {
        props.onAdvanceStep();
      }
    }, 200);
  };

const handleShapingChoice = () => {
  updateWizardData('hasShaping', true);
  updateWizardData('choiceMade', true);
  // Navigate to shaping wizard
  setTimeout(() => {
    if (props.onShowShapingWizard) {
      props.onShowShapingWizard();
    }
  }, 200);
};

  return (
    <div className="stack-lg">
      <div>
        <h2 className="text-xl font-semibold text-wool-700 mb-3">How do you want to work this {pattern?.toLowerCase()}?</h2>
        <p className="text-wool-500 mb-4">Choose how you want to specify your pattern</p>
      </div>

      {/* Two main choice buttons */}
      <div className="grid grid-cols-1 gap-4">
        
        {/* Set Duration Button */}
        <button
          onClick={handleDurationChoice}
          className={`card-selectable p-6 text-left ${
            wizardData.hasShaping === false && wizardData.choiceMade
              ? 'border-sage-500 bg-sage-100 text-sage-700 shadow-lg transform scale-[1.02]'
              : 'border-wool-200 bg-white text-wool-700 hover:border-sage-300 hover:bg-sage-50 hover:shadow-md hover:transform hover:scale-[1.01]'
          }`}
        >
          <div className="flex items-start gap-4">
            <div className="text-4xl flex-shrink-0">⏱️</div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-2">Set Duration</h3>
              <p className="text-sm opacity-75 mb-3">
                Work the pattern for a specific number of rows or until a certain length
              </p>
              <div className="flex gap-3 text-xs">
                <span className="bg-white bg-opacity-50 px-2 py-1 rounded">Rows</span>
                <span className="bg-white bg-opacity-50 px-2 py-1 rounded">Length</span>
                <span className="bg-white bg-opacity-50 px-2 py-1 rounded">Repeats</span>
              </div>
            </div>
          </div>
        </button>

        {/* Add Shaping Button */}
        <button
          onClick={handleShapingChoice}
          className={`card-selectable p-6 text-left relative ${
            wizardData.hasShaping === true && wizardData.choiceMade
              ? 'border-yarn-500 bg-yarn-100 text-yarn-700 shadow-lg transform scale-[1.02]'
              : 'border-wool-200 bg-white text-wool-700 hover:border-yarn-300 hover:bg-yarn-50 hover:shadow-md hover:transform hover:scale-[1.01]'
          }`}
        >
          <div className="flex items-start gap-4">
            <div className="text-4xl flex-shrink-0">📐</div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-2">Add Shaping</h3>
              <p className="text-sm opacity-75 mb-3">
                Include increases, decreases, or other shaping while working the pattern
              </p>
              <div className="flex gap-3 text-xs">
                <span className="bg-white bg-opacity-50 px-2 py-1 rounded">Increases</span>
                <span className="bg-white bg-opacity-50 px-2 py-1 rounded">Decreases</span>
                <span className="bg-white bg-opacity-50 px-2 py-1 rounded">Waist Shaping</span>
              </div>
            </div>
          </div>
          
          {/* Coming Soon Badge */}
          <div className="absolute top-3 right-3 badge badge-next-step">
            Coming Soon
          </div>
        </button>
      </div>

      {/* Info Section */}
      <div className="success-block">
        <h4 className="text-sm font-semibold text-sage-700 mb-2">💡 Quick Guide</h4>
        <div className="text-sm text-sage-600 space-y-1">
          <div>• <strong>Set Duration:</strong> Perfect for straightforward sections like "work stockinette for 6 inches"</div>
          <div>• <strong>Add Shaping:</strong> Great for sleeves, waist shaping, necklines, and armholes</div>
        </div>
      </div>
    </div>
  );
};

export default DurationShapingChoice;