import React, { useState } from 'react';
import { useProjectsContext } from '../hooks/useProjectsContext';
import { 
  COMPONENT_STEPS, 
  createComponentNavigator, 
  handleStartTypeSelection,
  handleMethodSelection,
  getMethodsForStartType
} from './component-creation/ComponentSteps';
import { renderComponentStep } from './component-creation/ComponentStepRenderer';

const EnhancedComponentCreation = ({ onBack, onComponentCreated }) => {
  const { dispatch } = useProjectsContext();
  const [step, setStep] = useState(COMPONENT_STEPS.NAME);
  const [componentData, setComponentData] = useState({
    name: '',
    startType: null,
    startDescription: '',
    startStitches: '',
    startMethod: ''
  });

  const handleStartTypeSelect = (type) => {
    handleStartTypeSelection(type, setComponentData, setStep);
  };

  const handleMethodSelect = (method) => {
    handleMethodSelection(method, setComponentData, setStep);
  };

  const navigator = createComponentNavigator(step, componentData);

  // Simple, working back button logic
  const handleBack = () => {
    if (step === COMPONENT_STEPS.NAME) {
      // From first step, exit the wizard
      onBack();
    } else {
      // Otherwise go to previous step
      setStep(step - 1);
    }
  };

  // Get step name for display
  const getStepName = () => {
    switch (step) {
      case COMPONENT_STEPS.NAME: return 'Component Name';
      case COMPONENT_STEPS.START_TYPE: return 'How it starts';
      case COMPONENT_STEPS.METHOD: return 'Method Selection';
      case COMPONENT_STEPS.DETAILS: return 'Setup Details';
      default: return 'Configuration';
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
        
        {/* Simplified Header - no step counting, just step name and working back button */}
        <div className="bg-sage-500 text-white px-6 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={handleBack}
              className="text-white text-xl hover:bg-white hover:bg-opacity-20 rounded-full w-10 h-10 flex items-center justify-center transition-colors"
            >
              ←
            </button>
            <div className="flex-1">
              <h1 className="text-lg font-semibold">Add Component</h1>
              <p className="text-sage-100 text-sm">{getStepName()}</p>
            </div>
          </div>
        </div>

        <div className="p-6 bg-yarn-50">
          {/* Render Current Step */}
          {renderComponentStep(step, componentData, setComponentData, {
            handleStartTypeSelect,
            handleMethodSelect
          })}

          {/* Clean Navigation */}
          <div className="pt-6 border-t border-wool-200">
            {navigator.shouldShowNavigation() && (
              <div className="flex gap-3">
                <button
                  onClick={onBack}
                  className="flex-1 btn-tertiary"
                >
                  Cancel
                </button>
                
                {step === COMPONENT_STEPS.NAME && (
                  <button
                    onClick={() => setStep(navigator.getNextStep())}
                    disabled={!navigator.canProceed()}
                    className="flex-2 btn-primary"
                    style={{flexGrow: 2}}
                  >
                    Continue →
                  </button>
                )}
                
                {step === COMPONENT_STEPS.DETAILS && (
                  <button
                    onClick={handleCreateComponent}
                    disabled={!navigator.canProceed()}
                    className="flex-2 btn-primary"
                    style={{flexGrow: 2}}
                  >
                    Create Cast-On
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedComponentCreation;