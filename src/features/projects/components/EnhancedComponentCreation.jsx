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
    <div className="min-h-screen bg-yarn-50">
      <div className="max-w-md mx-auto bg-yarn-50 min-h-screen shadow-lg">
        {/* UPDATED: Header with sage colors and compact styling */}
        <div className="bg-sage-500 text-white px-6 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={step === 1 ? onBack : () => setStep(step - 1)}
              className="text-white text-xl hover:bg-white hover:bg-opacity-20 rounded-full w-10 h-10 flex items-center justify-center transition-colors"
            >
              ←
            </button>
            <div className="flex-1">
              <h1 className="text-lg font-semibold">Add Component</h1>
              <p className="text-sage-100 text-sm">
                Step {step} of 2: {step === 1 ? 'Name' : 'How it starts'}
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 bg-yarn-50">
          {/* Step 1: Component Name */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-wool-700 mb-3">Component Name</h2>
                <p className="text-wool-500 mb-4">What piece are you knitting?</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-wool-700 mb-3">
                  Component Name
                </label>
                <input
                  type="text"
                  value={componentData.name}
                  onChange={(e) => setComponentData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Left Sleeve, Back Panel, Collar"
                  className="w-full border-2 border-wool-200 rounded-xl px-4 py-4 text-base focus:border-sage-500 focus:ring-0 transition-colors placeholder-wool-400"
                />
              </div>

              {/* UPDATED: Consistent info card styling */}
              <div className="bg-sage-100 border-2 border-sage-200 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-sage-700 mb-2">💡 Examples:</h3>
                <div className="text-sm text-sage-600 space-y-1">
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
                <h2 className="text-xl font-semibold text-wool-700 mb-3">How does it start?</h2>
                <p className="text-wool-500 mb-4">How do you begin this component?</p>
              </div>

              {/* UPDATED: Big 2x2 grid buttons like pattern selector */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleStartTypeSelect('cast_on')}
                  className={`p-4 border-2 rounded-xl transition-all duration-200 text-center ${
                    componentData.startType === 'cast_on'
                      ? 'border-sage-500 bg-sage-100 text-sage-700 shadow-sm'
                      : 'border-wool-200 bg-white text-wool-700 hover:border-sage-300 hover:bg-sage-50 hover:shadow-sm'
                  }`}
                >
                  <div className="text-2xl mb-2">🏗️</div>
                  <div className="font-semibold text-sm">Cast On</div>
                  <div className="text-xs opacity-75">Start from scratch</div>
                </button>

                <button
                  onClick={() => handleStartTypeSelect('pick_up')}
                  className={`p-4 border-2 rounded-xl transition-all duration-200 text-center ${
                    componentData.startType === 'pick_up'
                      ? 'border-sage-500 bg-sage-100 text-sage-700 shadow-sm'
                      : 'border-wool-200 bg-white text-wool-700 hover:border-sage-300 hover:bg-sage-50 hover:shadow-sm'
                  }`}
                >
                  <div className="text-2xl mb-2">📌</div>
                  <div className="font-semibold text-sm">Pick Up</div>
                  <div className="text-xs opacity-75">From existing piece</div>
                </button>

                <button
                  onClick={() => handleStartTypeSelect('continue')}
                  className={`p-4 border-2 rounded-xl transition-all duration-200 text-center ${
                    componentData.startType === 'continue'
                      ? 'border-sage-500 bg-sage-100 text-sage-700 shadow-sm'
                      : 'border-wool-200 bg-white text-wool-700 hover:border-sage-300 hover:bg-sage-50 hover:shadow-sm'
                  }`}
                >
                  <div className="text-2xl mb-2">↗️</div>
                  <div className="font-semibold text-sm">Continue</div>
                  <div className="text-xs opacity-75">From saved stitches</div>
                </button>

                <button
                  onClick={() => handleStartTypeSelect('other')}
                  className={`p-4 border-2 rounded-xl transition-all duration-200 text-center ${
                    componentData.startType === 'other'
                      ? 'border-sage-500 bg-sage-100 text-sage-700 shadow-sm'
                      : 'border-wool-200 bg-white text-wool-700 hover:border-sage-300 hover:bg-sage-50 hover:shadow-sm'
                  }`}
                >
                  <div className="text-2xl mb-2">📝</div>
                  <div className="font-semibold text-sm">Other</div>
                  <div className="text-xs opacity-75">Complex setup</div>
                </button>
              </div>

              {/* Configuration based on selected type */}
              {componentData.startType && (
                <div className="space-y-4 pt-4 border-t border-wool-200">
                  {componentData.startType === 'cast_on' && (
                    <>
                      <div>
                        <label className="block text-sm font-semibold text-wool-700 mb-3">
                          Number of Stitches
                        </label>
                        <input
                          type="number"
                          value={componentData.startStitches}
                          onChange={(e) => setComponentData(prev => ({ ...prev, startStitches: e.target.value }))}
                          placeholder="80"
                          className="w-full border-2 border-wool-200 rounded-xl px-4 py-4 text-base focus:border-sage-500 focus:ring-0 transition-colors placeholder-wool-400"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-wool-700 mb-3">
                          Cast On Method (optional)
                        </label>
                        <select
                          value={componentData.startMethod}
                          onChange={(e) => setComponentData(prev => ({ ...prev, startMethod: e.target.value }))}
                          className="w-full border-2 border-wool-200 rounded-xl px-4 py-4 text-base focus:border-sage-500 focus:ring-0 transition-colors bg-white"
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
                        <label className="block text-sm font-semibold text-wool-700 mb-3">
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
                          className="w-full border-2 border-wool-200 rounded-xl px-4 py-4 text-base focus:border-sage-500 focus:ring-0 transition-colors placeholder-wool-400"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-wool-700 mb-3">
                          Starting Stitches
                        </label>
                        <input
                          type="number"
                          value={componentData.startStitches}
                          onChange={(e) => setComponentData(prev => ({ ...prev, startStitches: e.target.value }))}
                          placeholder="76"
                          className="w-full border-2 border-wool-200 rounded-xl px-4 py-4 text-base focus:border-sage-500 focus:ring-0 transition-colors placeholder-wool-400"
                        />
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          {/* UPDATED: Navigation with horizontal layout and consistent styling */}
          <div className="pt-6 border-t border-wool-200">
            {step < 2 ? (
              <div className="flex gap-3">
                <button
                  onClick={onBack}
                  className="flex-1 bg-wool-100 text-wool-700 py-4 px-4 rounded-xl font-semibold text-base hover:bg-wool-200 transition-colors border border-wool-200"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setStep(step + 1)}
                  disabled={!canProceedFromStep(step)}
                  className="flex-2 bg-sage-500 text-white py-4 px-6 rounded-xl font-semibold text-base hover:bg-sage-600 disabled:bg-wool-400 disabled:cursor-not-allowed transition-colors shadow-sm"
                  style={{flexGrow: 2}}
                >
                  Continue →
                </button>
              </div>
            ) : (
              <button
                onClick={handleCreateComponent}
                disabled={!canProceedFromStep(step)}
                className="w-full bg-sage-500 text-white py-4 px-6 rounded-xl font-semibold text-base hover:bg-sage-600 disabled:bg-wool-400 disabled:cursor-not-allowed transition-colors shadow-sm"
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