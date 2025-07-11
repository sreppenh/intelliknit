import React, { useState } from 'react';
import { useProjectsContext } from '../../projects/hooks/useProjectsContext';
import StepWizard from './StepWizard';
import ComponentEndingWizard from './ComponentEndingWizard';

const ManageSteps = ({ componentIndex, onBack }) => {
  const { currentProject, dispatch } = useProjectsContext();
  const [isEditing, setIsEditing] = useState(false);
  const [editingStepIndex, setEditingStepIndex] = useState(null);
  const [showEndingWizard, setShowEndingWizard] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);

  // Component validation
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

  // Helper functions for step display
  const getPatternDisplay = (step) => {
    let pattern = null;
    
    // Check wizard config stitchPattern
    if (step.wizardConfig?.stitchPattern) {
      pattern = step.wizardConfig.stitchPattern.pattern || 
               step.wizardConfig.stitchPattern.category;
    }
    
    // Check advanced wizard config
    if (!pattern && step.advancedWizardConfig?.stitchPattern) {
      pattern = step.advancedWizardConfig.stitchPattern.pattern || 
               step.advancedWizardConfig.stitchPattern.category;
    }
    
    // Parse from description as fallback
    if (!pattern) {
      const desc = step.description.toLowerCase();
      
      if (desc.includes('cast on')) pattern = 'Cast On';
      else if (desc.includes('bind off')) pattern = 'Bind Off';
      else if (desc.includes('stockinette')) pattern = 'Stockinette';
      else if (desc.includes('garter')) pattern = 'Garter';
      else if (desc.includes('rib')) pattern = 'Ribbing';
      else if (desc.includes('lace')) pattern = 'Lace';
      else if (desc.includes('cable')) pattern = 'Cable';
      else {
        const words = step.description.split(' ');
        pattern = words.slice(0, 2).join(' ');
      }
    }
    
    // Add shaping info if applicable
    const hasShaping = step.wizardConfig?.hasShaping || step.advancedWizardConfig?.hasShaping;
    
    if (hasShaping && pattern !== 'Cast On' && pattern !== 'Bind Off') {
      const shapingType = step.wizardConfig?.shapingConfig?.shapingType || 
                         step.advancedWizardConfig?.shapingConfig?.shapingType || 'changes';
      return `${pattern} with ${shapingType}s`;
    }
    
    return pattern || 'Unknown Pattern';
  };

  const getMethodDisplay = (step) => {
    const pattern = getPatternDisplay(step);
    
    if (pattern === 'Cast On' && step.wizardConfig?.stitchPattern?.method) {
      const methodId = step.wizardConfig.stitchPattern.method;
      const methodMap = {
        'long_tail': 'Long Tail',
        'cable': 'Cable Cast On', 
        'provisional': 'Provisional',
        'german_twisted': 'German Twisted',
        'backward_loop': 'Backward Loop',
        'other': step.wizardConfig.stitchPattern.customText || 'Other'
      };
      return ` - ${methodMap[methodId] || methodId}`;
    }
    
    if (pattern === 'Bind Off' && step.wizardConfig?.stitchPattern?.method) {
      const methodId = step.wizardConfig.stitchPattern.method;
      const methodMap = {
        'standard': 'Standard',
        'stretchy': 'Stretchy',
        'picot': 'Picot',
        'three_needle': 'Three Needle',
        'provisional': 'Put on Holder',
        'other': step.wizardConfig.stitchPattern.customText || 'Other'
      };
      return ` - ${methodMap[methodId] || methodId}`;
    }
    
    return '';
  };

  const isSpecialStep = (step) => {
    const pattern = getPatternDisplay(step);
    return pattern === 'Cast On' || pattern === 'Bind Off';
  };

  const isComponentFinished = () => {
    return component.steps.some(step => {
      const pattern = getPatternDisplay(step);
      return pattern === 'Bind Off';
    });
  };

  // Determine which step can be edited (last non-completed step, working backwards)
  // BUT only if component is not finished
  const getEditableStepIndex = () => {
    if (isComponentFinished()) return -1; // No editing if component is finished
    
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

  // NEW: Handle step menu actions
  const handleMenuToggle = (stepId, event) => {
    event.stopPropagation();
    setOpenMenuId(openMenuId === stepId ? null : stepId);
  };

  const handleEditStepFromMenu = (stepIndex, event) => {
    event.stopPropagation();
    setEditingStepIndex(stepIndex);
    setIsEditing(true);
    setOpenMenuId(null);
  };

  const handleDeleteStepFromMenu = (stepIndex, event) => {
    event.stopPropagation();
    const stepToDelete = component.steps[stepIndex];
    const confirmed = window.confirm(`Delete "${stepToDelete.description}"? This cannot be undone.`);
    
    if (confirmed) {
      dispatch({
        type: 'DELETE_STEP',
        payload: { componentIndex, stepIndex }
      });
    }
    setOpenMenuId(null);
  };

  const handleCopyStepPattern = (stepIndex, event) => {
    event.stopPropagation();
    const step = component.steps[stepIndex];
    
    // Create a simplified pattern description for copying
    let patternDescription = '';
    if (step.wizardConfig?.stitchPattern) {
      const pattern = step.wizardConfig.stitchPattern.pattern || step.wizardConfig.stitchPattern.category;
      patternDescription = pattern;
      
      if (step.wizardConfig.duration?.type === 'rows' && step.wizardConfig.duration?.value) {
        patternDescription += ` for ${step.wizardConfig.duration.value} rows`;
      }
      
      if (step.advancedWizardConfig?.hasShaping) {
        const shaping = step.advancedWizardConfig.shapingConfig;
        patternDescription += ` with ${shaping.shapingType}s`;
      }
    } else {
      // Fallback to step description
      patternDescription = step.description;
    }
    
    const copied = window.prompt(
      'Copy this pattern for reuse:\n\n(You can modify this before using it in a new step)', 
      patternDescription
    );
    
    if (copied && copied.trim() !== '') {
      // For now, just show success - in the future this could auto-populate the step wizard
      alert(`Pattern copied: "${copied.trim()}"\n\nYou can use this when creating your next step!`);
    }
    
    setOpenMenuId(null);
  };

  const handleAddNewStep = () => {
    setEditingStepIndex(null);
    setIsEditing(true);
  };

  const handleBackFromWizard = () => {
    setIsEditing(false);
    setEditingStepIndex(null);
  };

  const handleFinishComponent = () => {
    setShowEndingWizard(true);
  };

  const handleEndingComplete = (endingStep) => {
    // Create a proper Bind Off step instead of using endingStep
    const bindOffStep = {
      description: endingStep.description || 'Bind off all stitches',
      type: 'calculated',
      wizardConfig: {
        stitchPattern: {
          pattern: 'Bind Off',
          method: endingStep.method || 'standard',
          customText: endingStep.customText,
          stitchCount: endingStep.stitchCount
        }
      },
      construction: 'flat',
      startingStitches: component.steps.length > 0 ? 
        component.steps[component.steps.length - 1]?.endingStitches || 
        component.steps[component.steps.length - 1]?.expectedStitches || 0 : 0,
      endingStitches: 0,
      totalRows: 1
    };

    dispatch({
      type: 'ADD_CALCULATED_STEP',
      payload: { componentIndex, step: bindOffStep }
    });
    
    setShowEndingWizard(false);
  };

  const handleBackFromEnding = () => {
    setShowEndingWizard(false);
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

  // If showing ending wizard
  if (showEndingWizard) {
    return (
      <ComponentEndingWizard
        component={component}
        onBack={handleBackFromEnding}
        onComplete={handleEndingComplete}
      />
    );
  }

  return (
    <div className="min-h-screen bg-yarn-50">
      <div className="max-w-md mx-auto bg-white min-h-screen shadow-lg">
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
              <h1 className="text-lg font-semibold">Manage Steps</h1>
              <p className="text-sage-100 text-sm">{component.name}</p>
            </div>
          </div>
        </div>

        <div className="p-6 bg-yarn-50 space-y-6">
          {/* Component Summary */}
          <div className="bg-wool-100 border border-wool-200 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm">📋</span>
                <h3 className="text-xs font-medium text-wool-600">Overview</h3>
              </div>
              <div className="flex items-center gap-4 text-xs text-wool-500">
                <span>{component.steps.length} steps</span>
                <span>{component.steps.filter(s => s.completed).length} completed</span>
                <span>
                  {component.steps.length > 0 ? 
                    `${component.steps[0]?.startingStitches || 0} → ${component.steps[component.steps.length - 1]?.endingStitches || 0} sts` :
                    '0 → 0 sts'
                  }
                </span>
              </div>
            </div>
          </div>

          {/* Steps List */}
          {component.steps.length > 0 ? (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-wool-700">Pattern Steps</h3>
                <span className="text-xs text-wool-500 bg-white px-2 py-1 rounded-full border border-wool-200">
                  {component.steps.filter(s => s.completed).length} of {component.steps.length}
                </span>
              </div>
              
              {component.steps.map((step, stepIndex) => {
                const isEditable = stepIndex === editableStepIndex;
                const isCompleted = step.completed;
                const isSpecial = isSpecialStep(step);
                
                return (
                  <div 
                    key={step.id}
                    className="bg-sage-50 border-sage-300 border-2 rounded-xl p-4 transition-all duration-200"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-7 h-7 rounded-full bg-sage-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                        {stepIndex + 1}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1 text-left">
                            <h4 className={`text-sm font-semibold mb-1 text-left ${
                              isCompleted ? 'text-wool-600' : 'text-wool-700'
                            }`}>
                              {getPatternDisplay(step)}{getMethodDisplay(step)}
                            </h4>
                            
                            <div className="flex items-center gap-3 text-xs text-wool-500 text-left">
                              <span>
                                {step.startingStitches || 0} → {step.endingStitches || step.expectedStitches || 0} sts
                              </span>
                              {step.totalRows && (
                                <span>{step.totalRows} rows</span>
                              )}
                              <span>{step.construction || 'flat'}</span>
                            </div>
                          </div>
                          
                          {/* NEW: Three-dot menu for editable steps OR bind-off steps */}
                          {(isEditable && !isComponentFinished()) || (isSpecial && getPatternDisplay(step) === 'Bind Off') ? (
                            <div className="relative flex-shrink-0">
                              <button
                                onClick={(e) => handleMenuToggle(step.id, e)}
                                className="p-1 text-wool-400 hover:text-wool-600 hover:bg-wool-100 rounded-full transition-colors"
                              >
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                                  <circle cx="8" cy="3" r="1.5"/>
                                  <circle cx="8" cy="8" r="1.5"/>
                                  <circle cx="8" cy="13" r="1.5"/>
                                </svg>
                              </button>

                              {/* Dropdown menu */}
                              {openMenuId === step.id && (
                                <div className="absolute right-0 top-8 bg-white border border-wool-200 rounded-lg shadow-lg z-10 min-w-36">
                                  {isEditable && !isComponentFinished() && (
                                    <>
                                      <button
                                        onClick={(e) => handleEditStepFromMenu(stepIndex, e)}
                                        className="w-full px-3 py-2 text-left text-wool-600 hover:bg-sage-50 rounded-t-lg text-sm flex items-center gap-2 transition-colors"
                                      >
                                        ✏️ Edit Step
                                      </button>
                                      <button
                                        onClick={(e) => handleDeleteStepFromMenu(stepIndex, e)}
                                        className="w-full px-3 py-2 text-left text-wool-600 hover:bg-red-50 rounded-b-lg text-sm flex items-center gap-2 transition-colors"
                                      >
                                        🗑️ Delete Step
                                      </button>
                                    </>
                                  )}
                                  
                                  {/* Special case for Bind Off steps */}
                                  {isSpecial && getPatternDisplay(step) === 'Bind Off' && (
                                    <button
                                      onClick={(e) => handleDeleteStepFromMenu(stepIndex, e)}
                                      className="w-full px-3 py-2 text-left text-wool-600 hover:bg-red-50 rounded-lg text-sm flex items-center gap-2 transition-colors"
                                    >
                                      🗑️ Delete Step
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* No Steps Yet */
            <div className="text-center py-8 bg-white rounded-xl border-2 border-wool-200 shadow-sm">
              <div className="text-4xl mb-3">📝</div>
              <h3 className="text-lg font-semibold text-wool-600 mb-2">No Steps Yet</h3>
              <p className="text-wool-500 mb-4">Add your first step to get started</p>
            </div>
          )}

          {/* Editing Rules - Above buttons, only show if not finished */}
          {editableStepIndex !== -1 && !isComponentFinished() && (
            <div className="bg-yarn-100 border border-yarn-200 rounded-lg p-3">
              <p className="text-xs text-yarn-700 text-center">
                💡 Only the most recent incomplete step can be edited to maintain step dependencies
              </p>
            </div>
          )}

          {/* Action Buttons - Only show if component not finished, otherwise show Back button */}
          {!isComponentFinished() ? (
            <div className="flex gap-3">
              <button
                onClick={handleAddNewStep}
                className="flex-1 bg-yarn-600 text-white py-4 rounded-xl font-semibold text-base hover:bg-yarn-700 transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                <span className="text-lg">➕</span>
                Add Step
              </button>

              {component.steps.length > 0 && (
                <button
                  onClick={handleFinishComponent}
                  className="flex-1 bg-sage-500 text-white py-4 rounded-xl font-semibold text-base hover:bg-sage-600 transition-colors flex items-center justify-center gap-2 shadow-sm"
                >
                  <span className="text-lg">🏁</span>
                  Finish
                </button>
              )}
            </div>
          ) : (
            <div className="flex justify-center">
              <button
                onClick={onBack}
                className="bg-wool-100 text-wool-700 py-4 px-8 rounded-xl font-semibold text-base hover:bg-wool-200 transition-colors border border-wool-200"
              >
                ← Back to Components
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageSteps;