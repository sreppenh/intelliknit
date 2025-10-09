// src/features/steps/components/ManageSteps.jsx
import React, { useState } from 'react';
import { useProjectsContext } from '../../projects/hooks/useProjectsContext';
import StepWizard from './StepWizard';
import ComponentEndingWizard from './ComponentEndingWizard';
import PageHeader from '../../../shared/components/PageHeader';
import TabBar from '../../../shared/components/TabBar';
import StepsList from '../../projects/components/ManageSteps/StepsList';
import EditPatternModal from './edit/EditPatternModal';
import EditStepRouter from './edit/EditStepRouter';
import {
  PrepStepModal,
  getPrepNoteConfig,
  usePrepNoteManager,
  useAfterNoteManager,
  AssemblyNoteModal
} from '../../../shared/components/PrepStepSystem';
import {
  getStepPatternName,
  isInitializationStep,
  isFinishingStep,
  isAdvancedRowByRowPattern,
  getComponentStatusWithDisplay
} from '../../../shared/utils/stepDisplayUtils';
import DeleteStepModal from '../../../shared/components/modals/DeleteStepModal';
import { getHumanReadableDescription } from '../../../shared/utils/stepDescriptionUtils';

/**
 * ManageSteps - Component step management interface
 * 
 * Handles step creation, editing, deletion, and navigation
 * for component construction workflows
 */
const ManageSteps = ({ componentIndex, onBack, onStartKnitting, onGoToLanding, onChangeTab, mode = 'project' }) => {
  // ===== STATE MANAGEMENT =====
  const { currentProject, dispatch } = useProjectsContext();
  const [isEditing, setIsEditing] = useState(false);
  const [editingStepIndex, setEditingStepIndex] = useState(null);
  const [editMode, setEditMode] = useState(null); // 'pattern' | 'configuration' | 'rowByRow' | null
  const [showEndingWizard, setShowEndingWizard] = useState(false);
  const [showEditPatternModal, setShowEditPatternModal] = useState(false);
  const [showEditConfigScreen, setShowEditConfigScreen] = useState(false);
  const [showDeleteStepModal, setShowDeleteStepModal] = useState(false);
  const [stepToDelete, setStepToDelete] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [editingPrepNoteStepIndex, setEditingPrepNoteStepIndex] = useState(null);
  const [editingAfterNoteStepIndex, setEditingAfterNoteStepIndex] = useState(null);

  // ===== PREP NOTE MANAGEMENT =====
  const {
    isModalOpen: isPrepNoteModalOpen,
    currentNote: currentPrepNote,
    handleOpenModal: handleOpenPrepNoteModal,
    handleCloseModal: handleClosePrepNoteModal,
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

  // ===== AFTER NOTE MANAGEMENT =====
  const {
    isModalOpen: isAfterNoteModalOpen,
    currentNote: currentAfterNote,
    handleOpenModal: handleOpenAfterNoteModal,
    handleCloseModal: handleCloseAfterNoteModal,
    handleSaveNote: handleSaveAfterNote
  } = useAfterNoteManager('', (note) => {
    if (editingAfterNoteStepIndex !== null) {
      dispatch({
        type: 'UPDATE_STEP_AFTER_NOTE',
        payload: {
          componentIndex,
          stepIndex: editingAfterNoteStepIndex,
          afterNote: note
        }
      });
      setEditingAfterNoteStepIndex(null);
    }
  });

  // ===== VALIDATION =====
  if (!currentProject || componentIndex === null || !currentProject.components[componentIndex]) {
    return (
      <div className="min-h-screen bg-yarn-50 flex items-center justify-center">
        <div className="text-center bg-white rounded-xl p-6 shadow-lg border-2 border-wool-200">
          <div className="text-4xl mb-4">❌</div>
          <h3 className="text-lg font-medium text-wool-600 mb-2">Component not found</h3>
          <button onClick={onBack} className="btn-primary btn-sm">← Back</button>
        </div>
      </div>
    );
  }

  const component = currentProject.components[componentIndex];

  const getComponentStatus = () => {
    return getComponentStatusWithDisplay(component);
  };

  const componentStatus = getComponentStatus();

  // ===== COMPONENT STATE HELPERS =====
  const isComponentFinished = () => {
    return component.steps.some(step => isFinishingStep(step));
  };

  const isComponentFullyEntered = () => {
    if (isComponentFinished()) return true;
    if (component.steps.length > 0) {
      const lastStep = component.steps[component.steps.length - 1];
      return lastStep.endingStitches === 0;
    }
    return false;
  };

  const getEditableStepIndex = () => {
    if (isComponentFinished()) return -1;
    for (let i = component.steps.length - 1; i >= 0; i--) {
      if (!component.steps[i].completed) {
        return i;
      }
    }
    return -1;
  };

  const getDeletableStepIndex = (targetStepIndex) => {
    if (targetStepIndex === 0) return -1;
    return targetStepIndex;
  };

  const editableStepIndex = getEditableStepIndex();

  // ===== TAB NAVIGATION =====
  const handleTabChange = (tabId) => {
    if (tabId === 'components') {
      // Already on components view (ManageSteps is part of components)
      // Could scroll to top or do nothing
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Navigate to other tabs by going back to ProjectDetail with the selected tab
    if (onChangeTab) {
      onChangeTab(tabId);
    } else {
      // Fallback: just go back (assumes ProjectDetail will handle)
      onBack();
    }
  };

  // ===== NOTE HANDLERS =====
  const handlePrepNoteClick = (stepIndex) => {
    const step = component.steps[stepIndex];
    const currentNote = step.prepNote ||
      step.wizardConfig?.prepNote ||
      step.advancedWizardConfig?.prepNote ||
      '';

    setEditingPrepNoteStepIndex(stepIndex);
    handleSavePrepNote(currentNote);
    handleOpenPrepNoteModal();
  };

  const handleAfterNoteClick = (stepIndex) => {
    const step = component.steps[stepIndex];
    const currentNote = step.afterNote ||
      step.wizardConfig?.afterNote ||
      step.advancedWizardConfig?.afterNote ||
      '';

    setEditingAfterNoteStepIndex(stepIndex);
    handleSaveAfterNote(currentNote);
    handleOpenAfterNoteModal();
  };

  // ===== NAVIGATION HANDLERS =====
  const handleKnittingView = () => {
    if (onStartKnitting) {
      onStartKnitting(componentIndex);
    }
  };

  const handleViewAllComponents = () => {
    onBack();
  };

  const handleNavigateToProject = () => {
    onBack();
  };

  // ===== MENU HANDLERS =====
  const handleMenuToggle = (stepId, event) => {
    event.stopPropagation();
    setOpenMenuId(openMenuId === stepId ? null : stepId);
  };

  const handleEditStepFromMenu = (stepIndex, event) => {
    if (stepIndex === 0) {
      const step = component.steps[0];
      if (isInitializationStep(step)) {
        alert('Initialization step editing is not yet supported. You can delete and recreate the component to change the cast on method.');
        setOpenMenuId(null);
        return;
      }
    }

    event.stopPropagation();
    setEditingStepIndex(stepIndex);
    setIsEditing(true);
    setOpenMenuId(null);
  };

  const handleEditPatternFromMenu = (stepIndex, event) => {
    event.stopPropagation();
    const step = component.steps[stepIndex];
    const patternName = getStepPatternName(step);

    // Check if this is an advanced pattern that needs row-by-row editing
    if (isAdvancedRowByRowPattern(patternName)) {
      setEditingStepIndex(stepIndex);
      setEditMode('rowByRow');
      setIsEditing(true);
      setOpenMenuId(null);
      return;
    }

    // CHECK FOR STRIPES PATTERN - Route to EditStepRouter
    if (patternName === 'Stripes') {
      setEditingStepIndex(stepIndex);
      setEditMode('pattern'); // This tells EditStepRouter to handle pattern editing
      setIsEditing(true);
      setOpenMenuId(null);
      return;
    }

    // For other simple patterns, use the modal
    setEditingStepIndex(stepIndex);
    setShowEditPatternModal(true);
    setOpenMenuId(null);
  };

  const handleEditConfigFromMenu = (stepIndex, event) => {
    event.stopPropagation();
    setEditingStepIndex(stepIndex);
    setShowEditConfigScreen(true);
    setOpenMenuId(null);
  };

  const handleDeleteStepFromMenu = (stepIndex, event) => {
    event.stopPropagation();

    if (getDeletableStepIndex(stepIndex) === -1) {
      alert('The first step cannot be deleted as it defines how the component begins.');
      setOpenMenuId(null);
      return;
    }

    const stepToDelete = component.steps[stepIndex];
    const stepDescription = getHumanReadableDescription(stepToDelete);

    setStepToDelete({
      step: {
        ...stepToDelete,
        description: stepDescription
      },
      index: stepIndex
    });
    setShowDeleteStepModal(true);
    setOpenMenuId(null);
  };

  const handleCopyStepPattern = (stepIndex, event) => {
    event.stopPropagation();
    const step = component.steps[stepIndex];

    let patternDescription = '';
    if (step.wizardConfig?.stitchPattern) {
      const pattern = step.wizardConfig.stitchPattern.pattern ||
        step.wizardConfig.stitchPattern.category;
      patternDescription = pattern;

      if (step.wizardConfig.duration?.type === 'rows' &&
        step.wizardConfig.duration?.value) {
        patternDescription += ` for ${step.wizardConfig.duration.value} rows`;
      }

      if (step.advancedWizardConfig?.hasShaping) {
        const shaping = step.advancedWizardConfig.shapingConfig;
        patternDescription += ` with ${shaping.shapingType}s`;
      }
    } else {
      patternDescription = step.description;
    }

    const copied = window.prompt(
      'Copy this pattern for reuse:\n\n(You can modify this before using it in a new step)',
      patternDescription
    );

    if (copied && copied.trim() !== '') {
      alert(`Pattern copied: "${copied.trim()}"\n\nYou can use this when creating your next step!`);
    }

    setOpenMenuId(null);
  };

  // ===== STEP MANAGEMENT HANDLERS =====
  const handleAddNewStep = () => {
    setEditingStepIndex(null);
    setIsEditing(true);
  };

  const handleBackFromWizard = () => {
    setIsEditing(false);
    setEditingStepIndex(null);
    setEditMode(null);
  };

  const handleFinishComponent = () => {
    setShowEndingWizard(true);
  };

  const handleEndingComplete = (endingStep) => {
    dispatch({
      type: 'ADD_STEP',
      payload: { componentIndex, step: endingStep }
    });
    setShowEndingWizard(false);
  };

  const handleBackFromEnding = () => {
    setShowEndingWizard(false);
  };

  // ===== PATTERN EDITING HANDLERS =====
  const handleSavePatternChanges = (newPatternData) => {
    const step = component.steps[editingStepIndex];
    const hasRowsInPatternChanged =
      step.wizardConfig.stitchPattern.rowsInPattern !== newPatternData.rowsInPattern;

    const updatedWizardConfig = {
      ...step.wizardConfig,
      stitchPattern: {
        ...step.wizardConfig.stitchPattern,
        ...newPatternData
      }
    };

    const mockStep = {
      ...step,
      wizardConfig: updatedWizardConfig
    };
    const regeneratedDescription = getHumanReadableDescription(mockStep);

    if (hasRowsInPatternChanged && step.wizardConfig.duration?.type === 'repeats') {
      const repeats = parseInt(step.wizardConfig.duration.value) || 1;
      const newRowsInPattern = parseInt(newPatternData.rowsInPattern) || 1;
      const newTotalRows = repeats * newRowsInPattern;

      dispatch({
        type: 'UPDATE_STEP',
        payload: {
          componentIndex,
          stepIndex: editingStepIndex,
          step: {
            ...step,
            wizardConfig: updatedWizardConfig,
            totalRows: newTotalRows,
            description: regeneratedDescription
          }
        }
      });
    } else {
      dispatch({
        type: 'UPDATE_STEP',
        payload: {
          componentIndex,
          stepIndex: editingStepIndex,
          step: {
            ...step,
            wizardConfig: updatedWizardConfig,
            description: regeneratedDescription
          }
        }
      });
    }

    setShowEditPatternModal(false);
    setEditingStepIndex(null);
  };

  const handleClosePatternModal = () => {
    setShowEditPatternModal(false);
    setEditingStepIndex(null);
  };

  // ===== STATUS ICON HELPER =====
  const getStatusIcon = (statusType) => {
    const statusIcons = {
      'ready_to_knit': '⚡',
      'in_progress': '🧶',
      'complete': '✅',
      'edit_mode': '🔧',
      'planning': '📝',
      'dormant': '😴',
      'frogged': '🐸'
    };
    return statusIcons[statusType] || '🔧';
  };

  // ===== CONDITIONAL RENDERS =====

  // Step editing - Smart routing
  if (isEditing) {
    // CREATE flow - use wizard
    if (!editingStepIndex) {
      return (
        <StepWizard
          componentIndex={componentIndex}
          editingStepIndex={null}
          editMode={null}
          onBack={handleBackFromWizard}
          onGoToLanding={onGoToLanding}
          mode={mode}
        />
      );
    }

    // EDIT flow - use router for specific edits
    if (editMode === 'rowByRow' || editMode === 'duration' || editMode === 'shaping' || editMode === 'pattern') {
      return (
        <EditStepRouter
          componentIndex={componentIndex}
          editingStepIndex={editingStepIndex}
          editType={editMode}
          onBack={handleBackFromWizard}
          onGoToLanding={onGoToLanding}
        />
      );
    }

    // Full step edit - use StepWizard for now (will migrate later)
    return (
      <StepWizard
        componentIndex={componentIndex}
        editingStepIndex={editingStepIndex}
        editMode={editMode}
        onBack={handleBackFromWizard}
        onGoToLanding={onGoToLanding}
        mode={mode}
      />
    );
  }

  // Component ending wizard
  if (showEndingWizard) {
    return (
      <ComponentEndingWizard
        component={component}
        projectName={currentProject?.name}
        onBack={handleBackFromEnding}
        onComplete={handleEndingComplete}
        onNavigateToProject={handleNavigateToProject}
        onGoToLanding={onGoToLanding}
      />
    );
  }

  // Configuration editing screen
  if (showEditConfigScreen) {
    return (
      <EditStepRouter
        componentIndex={componentIndex}
        editingStepIndex={editingStepIndex}
        editType="config"
        onBack={() => {
          setShowEditConfigScreen(false);
          setEditingStepIndex(null);
        }}
        onGoToLanding={onGoToLanding}
      />
    );
  }

  // ===== MAIN RENDER =====
  return (
    <div className="min-h-screen bg-yarn-50">
      <div className="app-container bg-white min-h-screen shadow-lg">
        {/* Header with branding and navigation */}
        <PageHeader
          useBranding={true}
          onHome={onGoToLanding}
          compact={true}
          onBack={onBack}
          showCancelButton={true}
          onCancel={onBack}
        />

        {/* Project Tabs */}
        <TabBar currentTab="components" onTabChange={handleTabChange}>
          <TabBar.Tab id="overview" label="Overview" />
          <TabBar.Tab id="components" label="Components" />
          <TabBar.Tab id="details" label="Details" />
          <TabBar.Tab id="checklist" label="Checklist" />
        </TabBar>

        {/* Component Status Bar */}
        <div className={`${componentStatus.headerStyle} rounded-xl p-3 mx-6 mt-6 mb-4`}>
          <div className="flex items-center gap-3">
            <span className="text-2xl flex-shrink-0">{getStatusIcon(componentStatus.status)}</span>
            <div className="flex-1">
              <p className="text-lg font-medium">
                {`${component.name} - ${componentStatus.display.replace(/^[^\w\s]+\s*/, '')}`}
              </p>
              <p className="text-xs mt-1">
                {`${currentProject?.name} • Managing ${component.steps.length} steps`}
              </p>
            </div>
          </div>
        </div>

        <div className="px-6 pb-6 pt-3 bg-yarn-50 stack-lg">
          <StepsList
            component={component}
            componentName={component.name}
            editableStepIndex={editableStepIndex}
            isComponentFinished={isComponentFinished}
            openMenuId={openMenuId}
            onAddStep={handleAddNewStep}
            onFinishComponent={handleFinishComponent}
            onMenuToggle={handleMenuToggle}
            onEditStep={handleEditStepFromMenu}
            onEditPattern={handleEditPatternFromMenu}
            onEditConfig={handleEditConfigFromMenu}
            onDeleteStep={handleDeleteStepFromMenu}
            onPrepNoteClick={handlePrepNoteClick}
            onAfterNoteClick={handleAfterNoteClick}
            onStartKnitting={handleKnittingView}
            onBack={handleViewAllComponents}
            project={currentProject}
          />

          {/* Editing Rules Info */}
          {editableStepIndex !== -1 && !isComponentFinished() && (
            <div className="bg-yarn-100 border border-yarn-200 rounded-lg p-3">
              <p className="text-xs text-yarn-700 text-center">
                💡 Only the most recent incomplete step can be edited to maintain step dependencies
              </p>
            </div>
          )}

          {/* Action Buttons */}
          {!isComponentFullyEntered() ? (
            <div className="flex gap-3">
              {component.steps.length > 0 && (
                <button
                  onClick={handleFinishComponent}
                  className="flex-1 btn-secondary flex items-center justify-center gap-2"
                >
                  <span className="text-lg">🏁</span>
                  Finish
                </button>
              )}

              <button
                onClick={handleAddNewStep}
                className="flex-1 btn-primary flex items-center justify-center gap-2"
              >
                <span className="text-lg">➕</span>
                Add Step
              </button>
            </div>
          ) : (
            <div className="flex gap-3">
              <button
                onClick={handleViewAllComponents}
                className="flex-1 btn-secondary flex items-center justify-center gap-2"
              >
                <span className="text-lg">📋</span>
                View Project
              </button>
              <button
                onClick={handleKnittingView}
                className="flex-1 btn-primary flex items-center justify-center gap-2"
              >
                <span className="text-lg">🧶</span>
                Start Knitting
              </button>
            </div>
          )}
        </div>

        {/* ===== MODALS & OVERLAYS ===== */}

        {/* Delete Step Modal */}
        {showDeleteStepModal && stepToDelete && (
          <DeleteStepModal
            step={stepToDelete.step}
            onClose={() => {
              setShowDeleteStepModal(false);
              setStepToDelete(null);
            }}
            onDelete={() => {
              dispatch({
                type: 'DELETE_STEP',
                payload: { componentIndex, stepIndex: stepToDelete.index }
              });
              setShowDeleteStepModal(false);
              setStepToDelete(null);
            }}
          />
        )}

        {/* Assembly Note Modal */}
        <AssemblyNoteModal
          isOpen={isAfterNoteModalOpen}
          onClose={handleCloseAfterNoteModal}
          onSave={handleSaveAfterNote}
          existingNote={currentAfterNote}
          title="Assembly Notes"
          subtitle="Add notes for what to do after completing this step"
        />

        {/* Prep Note Editing Modal */}
        <PrepStepModal
          isOpen={isPrepNoteModalOpen}
          onClose={handleClosePrepNoteModal}
          onSave={handleSavePrepNote}
          existingNote={currentPrepNote}
          title="Edit Preparation Note"
          subtitle="Update the setup note for this step"
          {...getPrepNoteConfig('stepWizard')}
        />

        {/* Edit Pattern Modal - Only for simple patterns */}
        <EditPatternModal
          isOpen={showEditPatternModal}
          onClose={handleClosePatternModal}
          onSave={handleSavePatternChanges}
          currentStep={editingStepIndex !== null ? component.steps[editingStepIndex] : null}
          title="Edit Pattern"
        />
      </div>
    </div>
  );
};

export default ManageSteps;