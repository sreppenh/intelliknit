import React, { useState } from 'react';
import { useProjectsContext } from '../hooks/useProjectsContext';

const ComponentDetail = ({ componentIndex, onBack, onManageSteps, onStartKnitting }) => {
  const { currentProject, dispatch } = useProjectsContext();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  if (!currentProject || componentIndex === null || !currentProject.components[componentIndex]) {
    return (
      <div className="min-h-screen bg-yarn-50 flex items-center justify-center">
        <div className="text-center bg-white rounded-xl p-6 shadow-lg border-2 border-wool-200">
          <div className="text-4xl mb-4">❌</div>
          <h3 className="text-lg font-medium text-wool-600 mb-2">Component not found</h3>
          <button 
            onClick={onBack}
            className="bg-sage-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-sage-600 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const component = currentProject.components[componentIndex];

  const handleDeleteComponent = () => {
    dispatch({
      type: 'DELETE_COMPONENT',
      payload: { componentIndex }
    });
    onBack();
  };

  const handleCopyComponent = () => {
    const copiedComponent = {
      ...component,
      name: `${component.name} Copy`,
      id: Date.now(), // Simple ID generation
      currentStep: 0,
      steps: component.steps.map(step => ({
        ...step,
        id: Date.now() + Math.random(), // New IDs for copied steps
        completed: false // Reset completion status
      }))
    };

    dispatch({
      type: 'ADD_ENHANCED_COMPONENT',
      payload: copiedComponent
    });

    // Show success feedback (you could add a toast here)
    alert(`${component.name} has been copied!`);
  };

  const canDelete = component.steps.every(step => !step.completed);

  return (
    <div className="min-h-screen bg-yarn-50">
      <div className="max-w-md mx-auto bg-yarn-50 min-h-screen shadow-lg">
        
        {/* Header */}
        <div className="bg-sage-500 text-white px-6 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="text-white text-xl hover:bg-white hover:bg-opacity-20 rounded-full w-10 h-10 flex items-center justify-center transition-colors"
            >
              ←
            </button>
            <div className="flex-1">
              <h1 className="text-lg font-semibold">{component.name}</h1>
              <p className="text-sage-100 text-sm">{currentProject.name}</p>
            </div>
          </div>
        </div>

        <div className="p-6 bg-yarn-50">
          
          {/* Component Status */}
          <div className="bg-white rounded-xl border-2 border-wool-200 p-5 mb-6 shadow-sm">
            <h2 className="text-lg font-semibold text-wool-700 mb-4">Component Status</h2>
            
            {/* Enhanced component info */}
            {component.startingStitches && (
              <div className="bg-sage-50 rounded-lg p-3 border border-sage-200 mb-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="font-semibold text-sage-700">Starting</div>
                    <div className="text-sage-600">{component.startingStitches} stitches</div>
                    <div className="text-xs text-sage-500">{component.startDescription}</div>
                  </div>
                  {component.endingStitches !== undefined && (
                    <div>
                      <div className="font-semibold text-sage-700">Ending</div>
                      <div className="text-sage-600">{component.endingStitches} stitches</div>
                      <div className="text-xs text-sage-500">{component.endDescription}</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Progress Overview */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-wool-600 font-medium">Progress</span>
                <span className="text-wool-500 text-sm">
                  {component.steps.filter(s => s.completed).length} of {component.steps.length} steps
                </span>
              </div>
              
              {component.steps.length > 0 && (
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-wool-100 rounded-full h-3 border border-wool-200">
                    <div 
                      className={`h-3 rounded-full transition-all duration-300 ${
                        component.steps.filter(s => s.completed).length === component.steps.length
                          ? 'bg-sage-500 shadow-sm' 
                          : 'bg-sage-400'
                      }`}
                      style={{
                        width: `${(component.steps.filter(s => s.completed).length / component.steps.length) * 100}%`
                      }}
                    ></div>
                  </div>
                  <span className="text-sm font-semibold text-wool-600 tabular-nums min-w-0">
                    {Math.round((component.steps.filter(s => s.completed).length / component.steps.length) * 100) || 0}%
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            
            {/* Primary Actions */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-wool-700">Actions</h3>
              
              {/* Manage Steps - yarn orange for exciting action */}
              <button
                onClick={() => onManageSteps(componentIndex)}
                className="w-full bg-yarn-600 text-white py-4 px-6 rounded-xl font-semibold text-base hover:bg-yarn-700 transition-colors shadow-sm flex items-center justify-center gap-2"
              >
                <span className="text-lg">📝</span>
                {component.steps.length === 0 ? 'Add Steps' : 'Manage Steps'}
              </button>

              {/* Start Knitting - sage for primary action */}
              {component.steps.length > 0 && (
                <button
                  onClick={() => onStartKnitting(componentIndex)}
                  className="w-full bg-sage-500 text-white py-4 px-6 rounded-xl font-semibold text-base hover:bg-sage-600 transition-colors shadow-sm flex items-center justify-center gap-2"
                >
                  <span className="text-lg">🧶</span>
                  {component.steps.filter(s => s.completed).length === 0 ? 'Start Knitting' : 'Continue Knitting'}
                </button>
              )}
            </div>

            {/* Secondary Actions */}
            <div className="pt-4 border-t border-wool-200">
              <h4 className="text-sm font-semibold text-wool-600 mb-3">More Options</h4>
              
              <div className="space-y-3">
                {/* Copy Component */}
                <button
                  onClick={handleCopyComponent}
                  className="w-full bg-wool-100 text-wool-700 py-3 px-4 rounded-xl font-semibold text-base hover:bg-wool-200 transition-colors border border-wool-200 flex items-center justify-center gap-2"
                >
                  <span>📋</span>
                  Copy Component
                </button>

                {/* Delete Component */}
                {canDelete && (
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="w-full bg-red-50 text-red-700 py-3 px-4 rounded-xl font-semibold text-base hover:bg-red-100 transition-colors border border-red-200 flex items-center justify-center gap-2"
                  >
                    <span>🗑️</span>
                    Delete Component
                  </button>
                )}
                
                {!canDelete && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <p className="text-xs text-yellow-700">
                      <strong>💡 Note:</strong> Cannot delete components with completed steps
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-yarn-50 rounded-2xl shadow-xl max-w-sm w-full border-2 border-wool-200">
              
              <div className="bg-red-500 text-white px-6 py-4 rounded-t-2xl">
                <div className="text-center">
                  <div className="text-2xl mb-2">⚠️</div>
                  <h2 className="text-lg font-semibold">Delete Component?</h2>
                  <p className="text-red-100 text-sm">{component.name}</p>
                </div>
              </div>

              <div className="p-6 bg-yarn-50">
                <div className="text-center mb-6">
                  <p className="text-wool-600 mb-2">
                    This will permanently delete <strong>{component.name}</strong> and all its steps.
                  </p>
                  <p className="text-wool-500 text-sm">
                    This action cannot be undone.
                  </p>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={handleDeleteComponent}
                    className="w-full bg-red-600 text-white py-4 px-6 rounded-xl font-semibold text-base hover:bg-red-700 transition-colors shadow-sm"
                  >
                    Yes, Delete Component
                  </button>
                  
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="w-full bg-wool-100 text-wool-700 py-3 px-6 rounded-xl font-semibold text-base hover:bg-wool-200 transition-colors border border-wool-200"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ComponentDetail;