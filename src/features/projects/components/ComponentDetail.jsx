// src/features/projects/components/ComponentDetail.jsx
// TARGETED UPDATE: Replace embedded delete modal with existing DeleteComponentModal

import React, { useState } from 'react';
import { useProjectsContext } from '../hooks/useProjectsContext';
import PageHeader from '../../../shared/components/PageHeader';
import DeleteComponentModal from '../../../shared/components/DeleteComponentModal'; // ADD THIS IMPORT

const ComponentDetail = ({ componentIndex, onBack, onManageSteps, onStartKnitting, onGoToLanding }) => {
  const { currentProject, dispatch } = useProjectsContext();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  if (!currentProject || componentIndex === null || !currentProject.components[componentIndex]) {
    return (
      <div className="min-h-screen bg-yarn-50 flex items-center justify-center">
        <div className="text-center bg-white rounded-xl p-6 shadow-lg border-2 border-wool-200">
          <div className="text-4xl mb-4">⚠️</div>
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
    setShowDeleteModal(false); // Close modal first
    onBack(); // Then navigate back
  };

  const handleCopyComponent = () => {
    const copiedComponent = {
      ...component,
      name: `${component.name} Copy`,
      id: crypto.randomUUID(),
      currentStep: 0,
      steps: component.steps.map(step => ({
        ...step,
        id: crypto.randomUUID() + Math.random(),
        completed: false
      }))
    };

    dispatch({
      type: 'ADD_ENHANCED_COMPONENT',
      payload: copiedComponent
    });

    alert(`${component.name} has been copied!`);
  };

  const canDelete = component.steps.every(step => !step.completed);

  return (
    <div className="min-h-screen bg-yarn-50">
      <div className="app-container bg-yarn-50 min-h-screen shadow-lg">

        <PageHeader
          useBranding={true}
          onHome={onGoToLanding}
          compact={true}
          onBack={onBack}
          showCancelButton={true}
          onCancel={onBack}
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

              {/* Manage Steps */}
              <button
                onClick={() => onManageSteps(componentIndex)}
                className="w-full btn-secondary flex items-center justify-center gap-2"
              >
                <span className="text-lg">📝</span>
                {component.steps.length === 0 ? 'Add Steps' : 'Manage Steps'}
              </button>

              {/* Start Knitting */}
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
                    className="w-full btn-danger flex items-center justify-center gap-2"
                  >
                    <span>🗑️</span>
                    Delete Component
                  </button>
                )}

                {!canDelete && (
                  <div className="bg-yarn-50 border border-yarn-200 rounded-lg p-3">
                    <p className="text-xs text-yarn-700">
                      <strong>💡 Note:</strong> Cannot delete components with completed steps
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* FIXED: Use existing DeleteComponentModal instead of embedded modal */}
        <DeleteComponentModal
          component={showDeleteModal ? component : null}
          onClose={() => setShowDeleteModal(false)}
          onDelete={handleDeleteComponent}
        />
      </div>
    </div>
  );
};

export default ComponentDetail;