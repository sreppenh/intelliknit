import React from 'react';

const ComponentCreatedCelebration = ({ component, onAddSteps, onAddAnother, onClose }) => {
  const getMethodDisplay = (method) => {
    const methodMap = {
      'long_tail': 'Long Tail Cast On',
      'cable': 'Cable Cast On', 
      'provisional': 'Provisional Cast On',
      'german_twisted': 'German Twisted Cast On',
      'backward_loop': 'Backward Loop Cast On',
      'other': 'Custom Cast On'
    };
    return methodMap[method] || method;
  };

  const getStartTypeDisplay = (startType) => {
    const typeMap = {
      'cast_on': 'Cast On',
      'pick_up': 'Pick Up & Knit', 
      'continue': 'Continue from Holder',
      'other': 'Custom Setup'
    };
    return typeMap[startType] || startType;
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

        <div className="p-6 bg-yarn-50 space-y-6">
          
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
              <p className="text-sage-600 text-sm">{getStartTypeDisplay(component.startType)}</p>
            </div>

            <div className="bg-white bg-opacity-50 rounded-lg p-4 space-y-3">
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-wool-600">Starting Stitches:</span>
                <span className="font-semibold text-sage-700">{component.startingStitches}</span>
              </div>

              {component.startMethod && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-wool-600">Method:</span>
                  <span className="font-semibold text-sage-700">{getMethodDisplay(component.startMethod)}</span>
                </div>
              )}

              {component.startDescription && (
                <div className="pt-2 border-t border-wool-200">
                  <p className="text-sm text-wool-600 italic">"{component.startDescription}"</p>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            
            <button
              onClick={onAddSteps}
              className="w-full bg-yarn-600 text-white py-4 px-6 rounded-2xl font-semibold text-lg hover:bg-yarn-700 transition-all duration-200 shadow-md hover:shadow-lg hover:transform hover:scale-[1.02] flex items-center justify-center gap-3"
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
              className="w-full bg-wool-100 text-wool-700 py-3 px-4 rounded-xl font-semibold text-base hover:bg-wool-200 transition-colors border border-wool-200"
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