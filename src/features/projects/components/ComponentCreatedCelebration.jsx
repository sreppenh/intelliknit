import React from 'react';

const ComponentCreatedCelebration = ({ component, onAddSteps, onAddAnother, onClose }) => {
  const getConstructionDisplay = (construction) => {
    return construction === 'flat' ? 'Flat' : 'In the Round';
  };

  const getMethodDisplay = (component) => {
    const { startType, startMethod, startDescription } = component;

    // Cast On methods
    if (startType === 'cast_on') {
      if (startMethod === 'other' && startDescription) {
        return startDescription; // Custom cast on description
      }
      const methodMap = {
        'long_tail': 'Long Tail Cast On',
        'cable': 'Cable Cast On',
        'provisional': 'Provisional Cast On',
        'tubular': 'Tubular Cast On',
        'backward_loop': 'Backward Loop Cast On'
      };
      return methodMap[startMethod] || 'Cast On';
    }

    // Pick Up methods
    if (startType === 'pick_up') {
      return `Pick up and knit from ${startDescription || 'edge'}`;
    }

    // Continue methods  
    if (startType === 'continue') {
      return `Continue from ${startDescription || 'stitches'}`;
    }

    // Other/Custom methods
    if (startType === 'other') {
      return startDescription || 'Custom setup';
    }

    return startMethod || 'Unknown method';
  };

  return (
    <div className="min-h-screen bg-yarn-50">
      <div className="max-w-md mx-auto bg-yarn-50 min-h-screen shadow-lg">

        {/* Header */}
        <div className="bg-sage-500 text-white px-6 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="text-white text-xl hover:bg-white hover:bg-opacity-20 rounded-full w-10 h-10 flex items-center justify-center transition-colors"
            >
              ←
            </button>
            <div className="flex-1 text-center">
              <h1 className="text-lg font-semibold">Component Created!</h1>
            </div>
            <div className="w-10"></div>
          </div>
        </div>

        <div className="p-6 bg-yarn-50 stack-lg">

          {/* Celebration Header */}
          <div className="text-center">
            <div className="text-4xl mb-3">🎉</div>
            <h2 className="text-xl font-semibold text-sage-700 mb-1">{component.name} Ready!</h2>
            <p className="text-wool-500 text-sm">Component successfully created</p>
          </div>

          {/* Component Summary */}
          <div className="bg-gradient-to-r from-sage-50 to-yarn-50 border-2 border-sage-200 rounded-2xl p-5 shadow-sm">

            <div className="text-center mb-4">
              <h3 className="text-lg font-semibold text-sage-700">{component.name}</h3>
              <p className="text-sage-600 text-sm">{component.startType?.replace('_', ' ')}</p>
            </div>

            <div className="bg-white bg-opacity-50 rounded-lg p-4 stack-sm">

              {/* Construction - ADD THIS */}
              {component.construction && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-wool-600">Construction:</span>
                  <span className="font-semibold text-sage-700">{getConstructionDisplay(component.construction)}</span>
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="text-sm text-wool-600">Starting Stitches:</span>
                <span className="font-semibold text-sage-700">{component.startingStitches}</span>
              </div>

              {component.startMethod && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-wool-600">Method:</span>
                  <span className="font-semibold text-sage-700">{getMethodDisplay(component)}</span>
                </div>
              )}

              {/* Setup Notes */}
              {component.setupNotes && component.setupNotes.trim() && (
                <div className="pt-2 border-t border-wool-200">
                  <div className="text-xs font-semibold text-wool-600 mb-1">Setup Notes:</div>
                  <p className="text-sm text-wool-600 italic">"{component.setupNotes}"</p>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="stack-sm">

            <button
              onClick={onAddSteps}
              className="w-full btn-secondary btn-lg flex items-center justify-center gap-3"
            >
              <span className="text-xl">📝</span>
              <span>Add Steps to {component.name}</span>
              <div className="text-xs bg-yarn-500 px-2 py-1 rounded-full">Next step</div>
            </button>

            <button
              onClick={onAddAnother}
              className="w-full bg-sage-500 text-white py-3 px-4 rounded-xl font-semibold text-base hover:bg-sage-600 transition-colors flex items-center justify-center gap-2"
            >
              <span className="text-lg">🧶</span>
              <span>Add Another Component</span>
            </button>

            <button
              onClick={onClose}
              className="w-full btn-tertiary"
            >
              Done for Now
            </button>
          </div>

          <div className="text-center pt-2">
            <p className="text-xs text-wool-500">
              🧶 Ready to start building your pattern!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComponentCreatedCelebration;