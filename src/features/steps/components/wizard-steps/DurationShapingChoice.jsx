import React from 'react';

const DurationShapingChoice = (props) => {
  const { wizardData, updateWizardData, construction } = props;
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

  // 🔧 FIX: Enhanced selection logic that works for editing
  const isDurationSelected = () => {
    // When editing: check if hasShaping is explicitly false
    // When creating: check for both hasShaping false AND choiceMade
    return wizardData.hasShaping === false && (wizardData.choiceMade || wizardData.hasShaping !== undefined);
  };

  const isShapingSelected = () => {
    // When editing: check if hasShaping is explicitly true  
    // When creating: check for both hasShaping true AND choiceMade
    return wizardData.hasShaping === true && (wizardData.choiceMade || wizardData.hasShaping !== undefined);
  };

  return (
    <div className="stack-lg">
      <div>
        <h2 className="content-header-primary">Will this step include shaping?</h2>
        <p className="content-subheader">Choose whether you need to change stitch counts or just work the pattern</p>
        {/* <p className="content-subheader">Choose how you want to specify your pattern</p> */}
      </div>

      {/* Two main choice buttons */}
      <div className="grid grid-cols-1 gap-4">

        {/* Set Duration Button */}
        <button
          onClick={handleDurationChoice}
          className={`card-clickable p-6 text-left ${isDurationSelected() ? 'border-sage-500 bg-sage-100' : ''}`} >
          <div className="flex items-start gap-4">
            <div className="text-4xl flex-shrink-0">⏱️</div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-2">No Shaping</h3>
              <p className="text-sm opacity-75 mb-3">
                Work the pattern for a specific number of {construction === 'round' ? 'rounds' : 'rows'} or until a certain length
              </p>
              <div className="flex gap-3 text-xs">
                <span className="bg-white bg-opacity-50 px-2 py-1 rounded">{construction === 'round' ? 'Rounds' : 'Rows'}</span>
                <span className="bg-white bg-opacity-50 px-2 py-1 rounded">Length</span>
                <span className="bg-white bg-opacity-50 px-2 py-1 rounded">Repeats</span>
              </div>
            </div>
          </div>
        </button>

        {/* Add Shaping Button */}
        <button
          onClick={handleShapingChoice}
          className={`card-clickable p-6 text-left relative ${isShapingSelected() ? 'border-yarn-500 bg-yarn-100' : ''}`} >
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

        </button>
      </div>

      {/* Info Section */}
      <div className="success-block-center">
        <h4 className="text-sm font-semibold text-sage-700 mb-2">💡 Quick Guide</h4>
        <div className="text-sm text-sage-600 space-y-1">
          <div><strong>No Shaping:</strong> Perfect for straightforward sections like "work stockinette for 6 inches"</div>
          <div><strong>Add Shaping:</strong> Great for sleeves, waist shaping, necklines, and armholes</div>
        </div>
      </div>
    </div>
  );
};

export default DurationShapingChoice;