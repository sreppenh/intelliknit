import React, { useState } from 'react';
import { useProjectsContext } from '../hooks/useProjectsContext';

const EnhancedComponentCreation = ({ onBack, onComponentCreated }) => {
  const { dispatch } = useProjectsContext();
  const [step, setStep] = useState(1); // 1=name, 2=start
  const [componentData, setComponentData] = useState({
    name: '',
    startType: null,
    startDescription: '',
    startStitches: '',
    startMethod: ''
  });

  const handleStartTypeSelect = (type) => {
    setComponentData(prev => ({
      ...prev,
      startType: type,
      startDescription: type === 'cast_on' ? 'Cast on from scratch' : '',
      startStitches: type === 'cast_on' ? prev.startStitches : ''
    }));
    
    // Auto-advance to next step when selected (future UI enhancement)
    // For now, user still needs to configure and click Continue
  };

  const canProceedFromStep = (currentStep) => {
    switch (currentStep) {
      case 1:
        return componentData.name.trim().length > 0;
      case 2:
        return componentData.startType && 
               componentData.startStitches && 
               parseInt(componentData.startStitches) > 0;
      default:
        return false;
    }
  };

  const handleCreateComponent = () => {
    const newComponent = {
      name: componentData.name.trim(),
      startType: componentData.startType,
      startDescription: componentData.startDescription,
      startingStitches: parseInt(componentData.startStitches),
      startMethod: componentData.startMethod,
      // Ending info will be added later via "Finish Component" flow
      endType: null,
      endDescription: '',
      endingStitches: null,
      endMethod: '',
      steps: [],
      currentStep: 0
    };

    dispatch({ 
      type: 'ADD_ENHANCED_COMPONENT', 
      payload: newComponent 
    });

    onComponentCreated(newComponent);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto bg-white min-h-screen shadow-lg">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-teal-600 text-white p-6">
          <div className="flex items-center gap-4">
            <button
              onClick={step === 1 ? onBack : () => setStep(step - 1)}
              className="text-2xl hover:bg-white hover:bg-opacity-20 rounded-full w-10 h-10 flex items-center justify-center transition-colors"
            >
              ←
            </button>
            <div className="flex-1">
              <h1 className="text-xl font-bold">Add Component</h1>
              <p className="text-green-100">
                Step {step} of 2: {step === 1 ? 'Name' : 'How it starts'}
              </p>
            </div>
          </div>
          
          {/* Progress Dots */}
          <div className="flex justify-center gap-2 mt-4">
            {[1, 2].map(stepNum => (
              <div 
                key={stepNum}
                className={`w-3 h-3 rounded-full transition-colors ${
                  stepNum <= step ? 'bg-white' : 'bg-white bg-opacity-30'
                }`}
              />
            ))}
          </div>
        </div>

        <div className="p-6">
          {/* Step 1: Component Name */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-3">Component Name</h2>
                <p className="text-sm text-gray-600 mb-4">What piece are you knitting?</p>
              </div>

              <div>
                <input
                  type="text"
                  value={componentData.name}
                  onChange={(e) => setComponentData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Left Sleeve, Back Panel, Collar"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-sm font-medium text-blue-800 mb-2">💡 Examples:</h3>
                <div className="text-sm text-blue-700 space-y-1">
                  <div>• Left Sleeve, Right Sleeve</div>
                  <div>• Front Panel, Back Panel</div>
                  <div>• Collar, Cuff, Pocket</div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: How it Starts */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-3">How does it start?</h2>
                <p className="text-sm text-gray-600 mb-4">How do you begin this component?</p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => handleStartTypeSelect('cast_on')}
                  className={`w-full p-4 text-left border rounded-lg transition-colors ${
                    componentData.startType === 'cast_on'
                      ? 'border-green-500 bg-green-50 text-green-900'
                      : 'border-gray-200 hover:border-green-300 hover:bg-green-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">🏗️</div>
                    <div>
                      <div className="font-medium">Cast On</div>
                      <div className="text-sm text-gray-600">Start from scratch</div>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => handleStartTypeSelect('pick_up')}
                  className={`w-full p-4 text-left border rounded-lg transition-colors ${
                    componentData.startType === 'pick_up'
                      ? 'border-green-500 bg-green-50 text-green-900'
                      : 'border-gray-200 hover:border-green-300 hover:bg-green-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">📌</div>
                    <div>
                      <div className="font-medium">Pick Up Stitches</div>
                      <div className="text-sm text-gray-600">From existing piece</div>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => handleStartTypeSelect('continue')}
                  className={`w-full p-4 text-left border rounded-lg transition-colors ${
                    componentData.startType === 'continue'
                      ? 'border-green-500 bg-green-50 text-green-900'
                      : 'border-gray-200 hover:border-green-300 hover:bg-green-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">↗️</div>
                    <div>
                      <div className="font-medium">Continue From</div>
                      <div className="text-sm text-gray-600">From saved stitches</div>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => handleStartTypeSelect('other')}
                  className={`w-full p-4 text-left border rounded-lg transition-colors ${
                    componentData.startType === 'other'
                      ? 'border-green-500 bg-green-50 text-green-900'
                      : 'border-gray-200 hover:border-green-300 hover:bg-green-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">📝</div>
                    <div>
                      <div className="font-medium">Other</div>
                      <div className="text-sm text-gray-600">Complex initialization</div>
                    </div>
                  </div>
                </button>
              </div>

              {/* Configuration based on selected type */}
              {componentData.startType && (
                <div className="space-y-4 pt-4 border-t border-gray-200">
                  {componentData.startType === 'cast_on' && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Number of Stitches
                        </label>
                        <input
                          type="number"
                          value={componentData.startStitches}
                          onChange={(e) => setComponentData(prev => ({ ...prev, startStitches: e.target.value }))}
                          placeholder="80"
                          className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Cast On Method (optional)
                        </label>
                        <select
                          value={componentData.startMethod}
                          onChange={(e) => setComponentData(prev => ({ ...prev, startMethod: e.target.value }))}
                          className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500"
                        >
                          <option value="">Standard</option>
                          <option value="long_tail">Long Tail</option>
                          <option value="cable">Cable</option>
                          <option value="provisional">Provisional</option>
                          <option value="german_twisted">German Twisted</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </>
                  )}

                  {(componentData.startType === 'pick_up' || componentData.startType === 'continue' || componentData.startType === 'other') && (
                    <>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Description
                        </label>
                        <input
                          type="text"
                          value={componentData.startDescription}
                          onChange={(e) => setComponentData(prev => ({ ...prev, startDescription: e.target.value }))}
                          placeholder={
                            componentData.startType === 'pick_up' ? 'e.g., From body armhole' :
                            componentData.startType === 'continue' ? 'e.g., From front piece' :
                            'e.g., Pick up 40, cast on 4'
                          }
                          className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Starting Stitches
                        </label>
                        <input
                          type="number"
                          value={componentData.startStitches}
                          onChange={(e) => setComponentData(prev => ({ ...prev, startStitches: e.target.value }))}
                          placeholder="76"
                          className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-green-500"
                        />
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Navigation */}
          <div className="pt-6 border-t border-gray-200 space-y-3">
            {step < 2 ? (
              <button
                onClick={() => setStep(step + 1)}
                disabled={!canProceedFromStep(step)}
                className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                Continue →
              </button>
            ) : (
              <button
                onClick={handleCreateComponent}
                disabled={!canProceedFromStep(step)}
                className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                Create Component
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedComponentCreation;