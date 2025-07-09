import React, { useState } from 'react';
import { useProjectsContext } from '../hooks/useProjectsContext';

const Tracking = ({ onBack, onEditSteps }) => {
  const { currentProject, activeComponentIndex, dispatch } = useProjectsContext();
  const [localActiveIndex, setLocalActiveIndex] = useState(activeComponentIndex || 0);

  if (!currentProject) {
    return <div>No project selected</div>;
  }

  const handleToggleStepCompletion = (componentIndex, stepIndex) => {
    dispatch({
      type: 'TOGGLE_STEP_COMPLETION',
      payload: { componentIndex, stepIndex }
    });
  };

  const handleComponentTabClick = (index) => {
    setLocalActiveIndex(index);
    dispatch({ type: 'SET_ACTIVE_COMPONENT_INDEX', payload: index });
  };

  const activeComponent = currentProject.components[localActiveIndex];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto bg-white min-h-screen shadow-lg">
        <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={onBack}
              className="text-2xl"
            >
              ←
            </button>
            <div className="flex-1">
              <h1 className="text-xl font-bold">{currentProject.name}</h1>
              <p className="text-green-100">Knitting Mode</p>
            </div>
          </div>
        </div>

        {/* Component Tabs */}
        <div className="bg-white border-b border-gray-200 px-4 py-2">
          <div className="flex gap-2 overflow-x-auto">
            {currentProject.components.map((component, index) => (
              <button
                key={component.id}
                onClick={() => handleComponentTabClick(index)}
                className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  localActiveIndex === index
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {component.name}
              </button>
            ))}
          </div>
        </div>
        
        {/* Steps List */}
        <div className="p-6">
          {activeComponent && (
            <>
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-2 text-left">
                  {activeComponent.name}
                </h2>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>
                    {activeComponent.steps.filter(s => s.completed).length} of{' '}
                    {activeComponent.steps.length} steps completed
                  </span>
                  <span>
                    {Math.round((activeComponent.steps.filter(s => s.completed).length / 
                      activeComponent.steps.length) * 100) || 0}% done
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${(activeComponent.steps.filter(s => s.completed).length / 
                        activeComponent.steps.length) * 100}%`
                    }}
                  ></div>
                </div>
              </div>
              
              <div className="space-y-3">
                {activeComponent.steps.map((step, stepIndex) => {
                  const isCurrentStep = stepIndex === activeComponent.currentStep;
                  const isCompleted = step.completed;
                  
                  return (
                    <div 
                      key={step.id}
                      className={`border rounded-lg p-4 transition-all ${
                        isCurrentStep && !isCompleted
                          ? 'border-green-400 bg-green-50 shadow-md'
                          : isCompleted
                          ? 'border-gray-200 bg-gray-50'
                          : 'border-gray-200 bg-white'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <button
                          onClick={() => handleToggleStepCompletion(localActiveIndex, stepIndex)}
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                            isCompleted
                              ? 'bg-green-600 border-green-600 text-white'
                              : 'border-gray-300 hover:border-green-400'
                          }`}
                        >
                          {isCompleted && '✓'}
                        </button>
                        
                        <div className="flex-1 text-left">
                          <div className="flex justify-between items-start mb-1">
                            <span className={`text-sm font-medium ${
                              isCurrentStep && !isCompleted ? 'text-green-800' : 'text-gray-700'
                            }`}>
                              Step {stepIndex + 1}
                              {isCurrentStep && !isCompleted && (
                                <span className="ml-2 text-xs bg-green-200 text-green-800 px-2 py-1 rounded">
                                  CURRENT
                                </span>
                              )}
                            </span>
                            {step.expectedStitches > 0 && (
                              <span className="text-xs text-gray-500">
                                {step.expectedStitches} sts
                              </span>
                            )}
                          </div>
                          <p className={`text-sm ${
                            isCompleted ? 'text-gray-500 line-through' : 'text-gray-800'
                          }`}>
                            {step.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
                
                {activeComponent.steps.length === 0 && (
                  <div className="py-8">
                    <div className="text-left">
                      <div className="text-4xl mb-3">📝</div>
                      <p className="text-gray-600 mb-4">No steps added yet</p>
                      <button
                        onClick={() => onEditSteps(localActiveIndex)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                      >
                        Add Steps
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
              {activeComponent.steps.length > 0 && 
               activeComponent.currentStep >= activeComponent.steps.length && (
                <div className="mt-6 p-6 bg-green-50 border border-green-200 rounded-lg">
                  <div className="text-left">
                    <div className="text-4xl mb-2">🎉</div>
                    <h3 className="text-lg font-semibold text-green-800 mb-1">Component Complete!</h3>
                    <p className="text-green-600 text-sm">
                      Great job finishing {activeComponent.name}!
                    </p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Tracking;