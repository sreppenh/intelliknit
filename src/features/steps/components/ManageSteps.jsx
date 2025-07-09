import React, { useState } from 'react';
import { useProjectsContext } from '../../projects/hooks/useProjectsContext'; // FIXED: Corrected the typo in import path
import StepWizard from './StepWizard';

const ManageSteps = ({ componentIndex, onBack }) => {
  const { currentProject, dispatch } = useProjectsContext();
  const [isEditing, setIsEditing] = useState(false);
  const [editingStepIndex, setEditingStepIndex] = useState(null);

  // Component validation
  if (!currentProject || componentIndex === null || !currentProject.components[componentIndex]) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">❌</div>
          <h3 className="text-lg font-medium text-gray-600 mb-2">Component not found</h3>
          <button 
            onClick={onBack}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const component = currentProject.components[componentIndex];

  // Determine which step can be edited (last non-completed step, working backwards)
  const getEditableStepIndex = () => {
    for (let i = component.steps.length - 1; i >= 0; i--) {
      if (!component.steps[i].completed) {
        return i;
      }
    }
    return -1; // No editable steps
  };

  const editableStepIndex = getEditableStepIndex();

  const handleDeleteStep = () => {
    if (editableStepIndex === -1) return;
    
    const stepToDelete = component.steps[editableStepIndex];
    const confirmed = window.confirm(`Delete "${stepToDelete.description}"? This cannot be undone.`);
    
    if (confirmed) {
      dispatch({
        type: 'DELETE_STEP',
        payload: { componentIndex, stepIndex: editableStepIndex }
      });
    }
  };

  const handleEditStep = () => {
    setEditingStepIndex(editableStepIndex);
    setIsEditing(true);
  };

  const handleAddNewStep = () => {
    setEditingStepIndex(null);
    setIsEditing(true);
  };

  const handleBackFromWizard = () => {
    setIsEditing(false);
    setEditingStepIndex(null);
  };

  // If editing, show the wizard
  if (isEditing) {
    return (
      <StepWizard
        componentIndex={componentIndex}
        editingStepIndex={editingStepIndex}
        onBack={handleBackFromWizard}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto bg-white min-h-screen shadow-lg">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <div className="flex items-center gap-4">
            <button 
              onClick={onBack}
              className="text-2xl hover:bg-white hover:bg-opacity-20 rounded-full w-10 h-10 flex items-center justify-center transition-colors"
            >
              ←
            </button>
            <div className="flex-1">
              <h1 className="text-xl font-bold">Manage Steps</h1>
              <p className="text-blue-100">{component.name}</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Steps List */}
          {component.steps.length > 0 ? (
            <div className="space-y-4 mb-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-800">Steps</h3>
                <span className="text-sm text-gray-500">
                  {component.steps.filter(s => s.completed).length} of {component.steps.length} completed
                </span>
              </div>
              
              <div className="space-y-3">
                {component.steps.map((step, stepIndex) => {
                  const isEditable = stepIndex === editableStepIndex;
                  const isCompleted = step.completed;
                  
                  return (
                    <div 
                      key={step.id}
                      className={`border rounded-lg p-4 transition-all ${
                        isCompleted 
                          ? 'bg-green-50 border-green-200' 
                          : isEditable 
                          ? 'bg-blue-50 border-blue-300 shadow-md' 
                          : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {/* Step Number */}
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0 ${
                          isCompleted 
                            ? 'bg-green-600 text-white' 
                            : isEditable 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-gray-300 text-gray-600'
                        }`}>
                          {isCompleted ? '✓' : stepIndex + 1}
                        </div>
                        
                        {/* Step Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0 flex-1">
                              <p className={`text-sm font-medium ${
                                isCompleted ? 'text-green-800' : 'text-gray-800'
                              }`}>
                                {step.description}
                              </p>
                              
                              {/* Step Details */}
                              <div className="mt-1 text-xs text-gray-600 space-y-1">
                                {step.type === 'calculated' && (
                                  <>
                                    {step.totalRows && (
                                      <div>📊 {step.totalRows} rows</div>
                                    )}
                                    {step.startingStitches !== undefined && step.endingStitches !== undefined && (
                                      <div>🧶 {step.startingStitches} → {step.endingStitches} stitches</div>
                                    )}
                                  </>
                                )}
                                {step.type === 'manual' && step.expectedStitches > 0 && (
                                  <div>🧶 {step.expectedStitches} stitches expected</div>
                                )}
                                <div>🏗️ {step.construction || 'flat'}</div>
                              </div>
                            </div>
                            
                            {/* Action Buttons */}
                            {isEditable && (
                              <div className="flex gap-2 flex-shrink-0">
                                <button
                                  onClick={handleEditStep}
                                  className="bg-blue-600 text-white px-3 py-1 rounded text-xs font-medium hover:bg-blue-700 transition-colors"
                                  title="Edit this step"
                                >
                                  ✏️ Edit
                                </button>
                                <button
                                  onClick={handleDeleteStep}
                                  className="bg-red-600 text-white px-3 py-1 rounded text-xs font-medium hover:bg-red-700 transition-colors"
                                  title="Delete this step"
                                >
                                  🗑️ Delete
                                </button>
                              </div>
                            )}
                            
                            {/* Status Indicators */}
                            {isCompleted && (
                              <div className="text-xs text-green-600 font-medium flex-shrink-0">
                                Completed
                              </div>
                            )}
                            {!isEditable && !isCompleted && (
                              <div className="text-xs text-gray-500 flex-shrink-0">
                                Protected
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {/* Editing Rules Explanation */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <div className="text-sm text-yellow-800">
                  <strong>💡 Editing Rules:</strong>
                  <ul className="mt-1 text-xs space-y-1">
                    <li>• You can only edit/delete the most recently added step</li>
                    <li>• Completed steps are protected from changes</li>
                    <li>• After deleting a step, the previous step becomes editable</li>
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            /* No Steps Yet */
            <div className="text-center py-8 mb-6">
              <div className="text-4xl mb-3">📝</div>
              <h3 className="text-lg font-medium text-gray-600 mb-2">No Steps Yet</h3>
              <p className="text-gray-500 mb-4">Add your first step to get started</p>
            </div>
          )}

          {/* Add New Step Button */}
          <button
            onClick={handleAddNewStep}
            className="w-full bg-green-600 text-white py-4 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
          >
            <span>➕</span>
            Add New Step
          </button>

          {/* Summary Card */}
          {component.steps.length > 0 && (
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-blue-800 mb-2">Component Summary</h4>
              <div className="text-sm text-blue-700 space-y-1">
                <div>📋 {component.steps.length} total steps</div>
                <div>✅ {component.steps.filter(s => s.completed).length} completed</div>
                <div>🔄 {component.steps.filter(s => !s.completed).length} remaining</div>
                
                {/* Final Stitch Count */}
                {(() => {
                  const lastStep = component.steps[component.steps.length - 1];
                  const finalStitches = lastStep?.endingStitches || lastStep?.expectedStitches;
                  if (finalStitches) {
                    return <div>🧶 Ends with {finalStitches} stitches</div>;
                  }
                  return null;
                })()}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageSteps;