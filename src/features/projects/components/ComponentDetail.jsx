import React, { useState } from 'react';
import { useProjectsContext } from '../hooks/useProjectsContext';

const ComponentDetail = ({ componentIndex, onBack, onManageSteps, onStartKnitting }) => {
  const { currentProject, dispatch } = useProjectsContext();
  const [showCopyModal, setShowCopyModal] = useState(false);
  const [showFinishModal, setShowFinishModal] = useState(false);
  const [copyComponentName, setCopyComponentName] = useState('');

  if (!currentProject || componentIndex === null || !currentProject.components[componentIndex]) {
    return <div>Component not found</div>;
  }

  const component = currentProject.components[componentIndex];

  const handleDeleteComponent = () => {
    const confirmed = window.confirm('Delete this component? This cannot be undone.');
    if (confirmed) {
      dispatch({ type: 'DELETE_COMPONENT', payload: componentIndex });
      onBack();
    }
  };

  const handleCopyComponent = () => {
    if (!copyComponentName.trim()) return;

    dispatch({ 
      type: 'COPY_COMPONENT', 
      payload: { 
        sourceIndex: componentIndex, 
        newName: copyComponentName 
      } 
    });

    setCopyComponentName('');
    setShowCopyModal(false);
  };

  // Check if component is ready to be finished
  const isReadyToFinish = () => {
    return component.steps.length > 0 && 
           component.steps.every(step => step.completed) && 
           !component.endType; // No ending configured yet
  };

  const handleFinishComponent = () => {
    // TODO: Implement finish component flow
    setShowFinishModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto bg-white min-h-screen shadow-lg">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <div className="flex items-center gap-4">
            <button 
              onClick={onBack}
              className="text-2xl"
            >
              ←
            </button>
            <div className="flex-1">
              <h1 className="text-xl font-bold">{component.name}</h1>
              <p className="text-blue-100">{component.steps.length} step{component.steps.length !== 1 ? 's' : ''}</p>
            </div>
          </div>
        </div>

        {/* Enhanced Component Info */}
        {component.startingStitches && (
          <div className="p-4 bg-blue-50 border-b border-blue-200">
            <h3 className="text-sm font-medium text-blue-800 mb-2">Component Details</h3>
            <div className="text-sm text-blue-700 space-y-1">
              <div>
                <span className="font-medium">Starts:</span> {component.startingStitches} stitches
                {component.startDescription && <span className="text-blue-600"> ({component.startDescription})</span>}
              </div>
              {component.endType && (
                <div>
                  <span className="font-medium">Ends:</span> {component.endingStitches} stitches
                  {component.endDescription && <span className="text-blue-600"> ({component.endDescription})</span>}
                </div>
              )}
              {!component.endType && (
                <div className="text-blue-600 italic">Finish details will be added when component is complete</div>
              )}
            </div>
          </div>
        )}
        
        <div className="p-6">
          {/* Progress Overview */}
          {component.steps.length > 0 && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>
                  {component.steps.filter(s => s.completed).length} of {component.steps.length} steps completed
                </span>
                <span>
                  {Math.round((component.steps.filter(s => s.completed).length / component.steps.length) * 100) || 0}% done
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${(component.steps.filter(s => s.completed).length / component.steps.length) * 100}%`
                  }}
                ></div>
              </div>
            </div>
          )}
          
          {/* Action Buttons */}
          <div className="space-y-3 mb-6">
            {component.steps.length > 0 && (
              <button
                onClick={() => onStartKnitting(componentIndex)}
                className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
              >
                🧶 {component.currentStep >= component.steps.length ? 'View Progress' : 
                     component.currentStep > 0 ? 'Continue Knitting' : 'Start Knitting'}
              </button>
            )}
            
            <button
              onClick={() => onManageSteps(componentIndex)}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              ✏️ Manage Steps
            </button>

            {/* Finish Component Button */}
            {isReadyToFinish() && (
              <button
                onClick={handleFinishComponent}
                className="w-full bg-purple-600 text-white py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
              >
                🏁 Finish Component
              </button>
            )}
            
            {component.steps.length > 0 && (
              <button
                onClick={() => setShowCopyModal(true)}
                className="w-full bg-gray-600 text-white py-3 rounded-lg font-medium hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
              >
                📋 Copy Component
              </button>
            )}
            
            <button
              onClick={handleDeleteComponent}
              className="w-full bg-red-600 text-white py-3 rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
            >
              🗑️ Delete Component
            </button>
          </div>
          
          {/* Steps Preview */}
          {component.steps.length > 0 ? (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3 text-left">Steps Preview</h3>
              <div className="space-y-2">
                {component.steps.map((step, stepIndex) => {
                  const isCompleted = step.completed;
                  const isCurrentStep = !isCompleted && component.steps.slice(0, stepIndex).every(s => s.completed);
                  
                  return (
                    <div 
                      key={step.id}
                      className={`p-3 rounded-lg border ${
                        isCompleted 
                          ? 'bg-green-50 border-green-200' 
                          : isCurrentStep 
                          ? 'bg-blue-50 border-blue-200' 
                          : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                          isCompleted 
                            ? 'bg-green-600 text-white' 
                            : isCurrentStep 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-gray-300 text-gray-600'
                        }`}>
                          {isCompleted ? '✓' : stepIndex + 1}
                        </span>
                        <div className="flex-1 text-left">
                          <p className={`text-sm ${isCompleted ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                            {step.description}
                          </p>
                          {(step.expectedStitches > 0 || step.endingStitches > 0) && (
                            <span className="text-xs text-gray-500">
                              {step.endingStitches > 0 ? `${step.endingStitches} stitches` : `${step.expectedStitches} stitches`}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="py-8">
              <div className="text-left">
                <div className="text-4xl mb-3">📝</div>
                <h3 className="text-lg font-medium text-gray-600 mb-2">No steps yet</h3>
                <p className="text-gray-500 mb-4">Add some steps to get started!</p>
              </div>
            </div>
          )}
        </div>
        
        {/* Copy Modal */}
        {showCopyModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-sm">
              <div className="text-center mb-6">
                <div className="text-3xl mb-2">📋</div>
                <h3 className="text-lg font-semibold text-gray-800 mb-1">Copy Component</h3>
                <p className="text-gray-600 text-sm">
                  Create a copy of "{component.name}" with the same steps
                </p>
              </div>
              
              <div className="space-y-4">
                <input
                  type="text"
                  value={copyComponentName}
                  onChange={(e) => setCopyComponentName(e.target.value)}
                  placeholder="New component name (e.g., Right Sleeve)"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowCopyModal(false);
                      setCopyComponentName('');
                    }}
                    className="flex-1 bg-gray-500 text-white py-3 rounded-lg font-medium hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCopyComponent}
                    disabled={!copyComponentName.trim()}
                    className="flex-1 bg-purple-600 text-white py-3 rounded-lg font-medium hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    Create Copy
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Finish Component Modal - Placeholder */}
        {showFinishModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-sm">
              <div className="text-center mb-6">
                <div className="text-3xl mb-2">🏁</div>
                <h3 className="text-lg font-semibold text-gray-800 mb-1">Finish Component</h3>
                <p className="text-gray-600 text-sm">
                  This will configure how "{component.name}" ends
                </p>
              </div>
              
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-700">
                    🚧 This feature is coming soon! It will let you configure how this component ends 
                    (bind off, put on holder, etc.) when all steps are complete.
                  </p>
                </div>
                
                <button
                  onClick={() => setShowFinishModal(false)}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Got it
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ComponentDetail;