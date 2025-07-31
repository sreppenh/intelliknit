import React, { useState } from 'react';
import { useProjectsContext } from '../hooks/useProjectsContext';
import PageHeader from '../../../shared/components/PageHeader';

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
            className="btn-primary btn-sm"
          >
            ← Back
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
      id: crypto.randomUUID(), // Simple ID generation
      currentStep: 0,
      steps: component.steps.map(step => ({
        ...step,
        id: crypto.randomUUID() + Math.random(), // New IDs for copied steps
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
        <PageHeader
          title={component.name}
          subtitle={currentProject.name}
          onBack={onBack}
        />

        <div className="p-6 bg-yarn-50">

          {/* Component Status */}
          <div className="bg-white rounded-xl border-2 border-wool-200 p-5 mb-6 shadow-sm">
            <h2 className="content-header-secondary mb-4">Component Status</h2>

            {/* Enhanced component info */}
            {component.startingStitches && (
              <div className="bg-sage-50 rounded-lg p-3 border border-sage-200 mb-4">
                <div className="grid-2-equal text-sm">
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
            <div className="stack-sm">
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
                      className={`h-3 rounded-full transition-all duration-300 ${component.steps.filter(s => s.completed).length === component.steps.length
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
            <div className="stack-sm">
              <h3 className="content-header-secondary">Actions</h3>

              {/* Manage Steps - yarn orange for exciting action */}
              <button
                onClick={() => onManageSteps(componentIndex)}
                className="w-full btn-secondary flex items-center justify-center gap-2"
              >
                <span className="text-lg">📝</span>
                {component.steps.length === 0 ? 'Add Steps' : 'Manage Steps'}
              </button>

              {/* Start Knitting - sage for primary action */}
              {component.steps.length > 0 && (
                <button
                  onClick={() => onStartKnitting(componentIndex)}
                  className="w-full btn-primary flex items-center justify-center gap-2"
                >
                  <span className="text-lg">🧶</span>
                  {component.steps.filter(s => s.completed).length === 0 ? 'Start Knitting' : 'Continue Knitting'}
                </button>
              )}
            </div>

            {/* Secondary Actions */}
            <div className="pt-4 border-t border-wool-200">
              <h4 className="text-sm font-semibold text-wool-600 mb-3">More Options</h4>

              <div className="stack-sm">
                {/* Copy Component */}
                <button
                  onClick={handleCopyComponent}
                  className="w-full btn-tertiary flex items-center justify-center gap-2"
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
          <div className="modal-overlay">
            <div className="modal-content">

              <div className="bg-red-500 text-white px-6 py-4 rounded-t-2xl relative flex items-center justify-center">
                <div className="text-center">
                  <div className="text-2xl mb-2">⚠️</div>
                  <h2 className="text-lg font-semibold">Delete Component?</h2>
                  <p className="text-red-100 text-sm">{component.name}</p>
                </div>
                <button
                  onClick={() => setShowDeleteModal(false)}  // Replace with your close handler for delete modal
                  className="absolute right-3 top-3 text-red-100 text-2xl hover:bg-red-600 hover:bg-opacity-50 rounded-full w-8 h-8 flex items-center justify-center transition-colors"
                  aria-label="Close delete confirmation modal"
                >
                  ×
                </button>

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

                <div className="stack-sm">
                  <button
                    onClick={handleDeleteComponent}
                    className="w-full btn-danger"
                  >
                    Yes, Delete Component
                  </button>

                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="w-full btn-tertiary"
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