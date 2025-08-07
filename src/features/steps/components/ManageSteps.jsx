import React, { useState } from 'react';
import { useProjectsContext } from '../../projects/hooks/useProjectsContext';
import StepWizard from './StepWizard';
import ComponentEndingWizard from './ComponentEndingWizard';
import PageHeader from '../../../shared/components/PageHeader';
import StepsList from '../../projects/components/ManageSteps/StepsList';
import EditPatternOverlay from './EditPatternOverlay';
import EditConfigScreen from './EditConfigScreen'; // ✅ ADD THIS IMPORT
import { PrepNoteDisplay, usePrepNoteManager, PrepStepOverlay, getPrepNoteConfig } from '../../../shared/components/PrepStepSystem';

const ManageSteps = ({ componentIndex, onBack }) => {
  const { currentProject, dispatch } = useProjectsContext();
  const [isEditing, setIsEditing] = useState(false);
  const [editingStepIndex, setEditingStepIndex] = useState(null);
  const [showEndingWizard, setShowEndingWizard] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [editingPrepNoteStepIndex, setEditingPrepNoteStepIndex] = useState(null);
  const [editMode, setEditMode] = useState(null); // 'pattern' | 'configuration' | null
  const [showEditPatternOverlay, setShowEditPatternOverlay] = useState(false);
  const [showEditConfigScreen, setShowEditConfigScreen] = useState(false); // ✅ ADD THIS STATE


  // Add prep note manager
  const {
    isOverlayOpen: isPrepNoteOverlayOpen,
    currentNote: currentPrepNote,
    handleOpenOverlay: handleOpenPrepNoteOverlay,
    handleCloseOverlay: handleClosePrepNoteOverlay,
    handleSaveNote: handleSavePrepNote
  } = usePrepNoteManager('', (note) => {
    if (editingPrepNoteStepIndex !== null) {
      dispatch({
        type: 'UPDATE_STEP_PREP_NOTE',
        payload: {
          componentIndex,
          stepIndex: editingPrepNoteStepIndex,
          prepNote: note
        }
      });
      setEditingPrepNoteStepIndex(null);
    }
  });

  // Component validation
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

  // In ManageSteps.jsx, update the existing debug to also log phases:
  console.log('=== STEP DEBUG INFO ===');
  component.steps.forEach((step, index) => {
    const hasShaping = step.wizardConfig?.hasShaping || step.advancedWizardConfig?.hasShaping;
    if (hasShaping) {
      const shapingConfig = step.wizardConfig?.shapingConfig || step.advancedWizardConfig?.shapingConfig;
      if (shapingConfig?.type === 'phases') {
        console.log(`Step ${index} Sequential Phases:`, {
          type: shapingConfig.type,
          config: shapingConfig.config,
          wizardConfig: step.wizardConfig
        });
      }
    }
  });



  // Add prep note click handler
  const handlePrepNoteClick = (stepIndex) => {
    const step = component.steps[stepIndex];
    const currentNote = step.prepNote ||
      step.wizardConfig?.prepNote ||
      step.advancedWizardConfig?.prepNote ||
      '';

    setEditingPrepNoteStepIndex(stepIndex);
    handleSavePrepNote(currentNote);
    handleOpenPrepNoteOverlay();
  };

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
    // SPECIAL HANDLING FOR FIRST STEP (Cast On)
    if (stepIndex === 0) {
      const step = component.steps[0];
      const pattern = getPatternDisplay(step);

      if (pattern === 'Cast On') {
        // For Cast On steps, show helpful message for now
        // TODO: In the future, this could redirect to SmartComponentCreation editing
        alert('Cast On step editing is not yet supported. You can delete and recreate the component to change the cast on method.');
        setOpenMenuId(null);
        return;
      }
    }

    event.stopPropagation();
    setEditingStepIndex(stepIndex);
    setIsEditing(true);
    setOpenMenuId(null);
  };

  // ✅ UPDATED: Handle Edit Pattern
  const handleEditPatternFromMenu = (stepIndex, event) => {
    event.stopPropagation();
    setEditingStepIndex(stepIndex);
    setShowEditPatternOverlay(true); // ✅ CHANGE: Show overlay instead of wizard
    setOpenMenuId(null);
  };

  // ✅ NEW: Handle saving pattern changes with recalculation
  const handleSavePatternChanges = (newPatternData) => {
    const step = component.steps[editingStepIndex];
    const hasRowsInPatternChanged = step.wizardConfig.stitchPattern.rowsInPattern !== newPatternData.rowsInPattern;

    // Update the step's wizard config with new pattern data
    const updatedWizardConfig = {
      ...step.wizardConfig,
      stitchPattern: {
        ...step.wizardConfig.stitchPattern,
        ...newPatternData
      }
    };


    // If rowsInPattern changed and we have a duration with repeats, recalculate
    if (hasRowsInPatternChanged && step.wizardConfig.duration?.type === 'repeats') {
      const repeats = parseInt(step.wizardConfig.duration.value) || 1;
      const newRowsInPattern = parseInt(newPatternData.rowsInPattern) || 1;
      const newTotalRows = repeats * newRowsInPattern;

      // Update the step with recalculated values
      dispatch({
        type: 'UPDATE_STEP',
        payload: {
          componentIndex,
          stepIndex: editingStepIndex,
          step: {
            ...step,
            wizardConfig: updatedWizardConfig,
            totalRows: newTotalRows,
            // Keep existing stitch counts unless this affects them
            description: step.description // Will need regeneration in the future
          }
        }
      });
    } else {
      // Normal update without recalculation
      dispatch({
        type: 'UPDATE_STEP',
        payload: {
          componentIndex,
          stepIndex: editingStepIndex,
          step: {
            ...step,
            wizardConfig: updatedWizardConfig
          }
        }
      });
    }

    // Reset state
    setShowEditPatternOverlay(false);
    setEditingStepIndex(null);
  };

  // ✅ NEW: Handle closing pattern overlay
  const handleClosePatternOverlay = () => {
    setShowEditPatternOverlay(false);
    setEditingStepIndex(null);
  };


  // ✅ NEW: Handle Edit Config  
  const handleEditConfigFromMenu = (stepIndex, event) => {
    event.stopPropagation();
    setEditingStepIndex(stepIndex);
    setShowEditConfigScreen(true); // NEW - shows screen
    setOpenMenuId(null);
  };

  const handleDeleteStepFromMenu = (stepIndex, event) => {
    event.stopPropagation();
    if (stepIndex === 0) {
      alert('The first step (Cast On) cannot be deleted as it defines how the component begins.');
      setOpenMenuId(null);
      return;
    }
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
    setEditMode(null); // ✅ ADD THIS LINE
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
        editMode={editMode} // ✅ ADD THIS LINE
        onBack={handleBackFromWizard}
      />
    );
  }

  // If showing ending wizard - THIS IS THE MISSING CODE!!!
  if (showEndingWizard) {
    return (
      <ComponentEndingWizard
        component={component}
        onBack={handleBackFromEnding}
        onComplete={handleEndingComplete}
      />
    );
  }




  if (showEditConfigScreen) {
    return (
      <EditConfigScreen
        componentIndex={componentIndex}
        editingStepIndex={editingStepIndex}
        onBack={() => {
          setShowEditConfigScreen(false);
          setEditingStepIndex(null);
        }}
      />
    );
  }




  return (
    <div className="min-h-screen bg-yarn-50">
      <div className="max-w-md mx-auto bg-white min-h-screen shadow-lg">
        {/* Header */}
        <PageHeader
          title="Manage Steps"
          subtitle={isComponentFinished() ? "Completed" : component.name}
          onBack={onBack}
          showBackButton={!isComponentFinished()}
          showCancelButton={true}
          onCancel={onBack}
        />

        <div className="p-6 bg-yarn-50 stack-lg">
          {/* Component Summary */}
          <div className="warning-block">
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

          <StepsList
            component={component}
            editableStepIndex={editableStepIndex}
            isComponentFinished={isComponentFinished}
            openMenuId={openMenuId}
            onMenuToggle={handleMenuToggle}
            onEditStep={handleEditStepFromMenu}
            onEditPattern={handleEditPatternFromMenu}
            onEditConfig={handleEditConfigFromMenu}
            onDeleteStep={handleDeleteStepFromMenu}
            getPatternDisplay={getPatternDisplay}
            getMethodDisplay={getMethodDisplay}
            onPrepNoteClick={handlePrepNoteClick}
            isSpecialStep={isSpecialStep}
          />

          {/* Editing Rules - Above buttons, only show if not finished */}
          {editableStepIndex !== -1 && !isComponentFinished() && (
            <div className="bg-yarn-100 border border-yarn-200 rounded-lg p-3">
              <p className="text-xs text-yarn-700 text-center">
                💡 Only the most recent incomplete step can be edited to maintain step dependencies
              </p>
            </div>
          )}

          {/* Action Buttons - Only show if component not finished */}
          {!isComponentFinished() && (
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
          )}
        </div>

        {/* Prep Note Editing Overlay */}
        <PrepStepOverlay
          isOpen={isPrepNoteOverlayOpen}
          onClose={handleClosePrepNoteOverlay}
          onSave={handleSavePrepNote}
          existingNote={currentPrepNote}
          title="Edit Preparation Note"
          subtitle="Update the setup note for this step"
          {...getPrepNoteConfig('stepWizard')}
        />

        {/* ✅ NEW: Edit Pattern Overlay */}
        <EditPatternOverlay
          isOpen={showEditPatternOverlay}
          onClose={handleClosePatternOverlay}
          onSave={handleSavePatternChanges}
          currentStep={editingStepIndex !== null ? component.steps[editingStepIndex] : null}
          title="Edit Pattern"
        />
      </div>
    </div>
  );
};

export default ManageSteps;