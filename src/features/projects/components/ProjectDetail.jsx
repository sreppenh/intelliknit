import React, { useState } from 'react';
import { useProjectsContext } from '../hooks/useProjectsContext';
import ComponentCreatedCelebration from './ComponentCreatedCelebration';
import CompleteProjectModal from './CompleteProjectModal';
import SmartComponentCreation from './SmartComponentCreation';
import CompactComponentCard from './CompactComponentCard';
import PageHeader from '../../../shared/components/PageHeader';
import ContextualBar from '../../../shared/components/ContextualBar';
import DeleteComponentModal from '../../../shared/components/DeleteComponentModal';
import RenameComponentModal from '../../../shared/components/RenameComponentModal';

const ProjectDetail = ({ onBack, onViewComponent, onEditSteps, onManageSteps, onStartKnitting, onEditProjectDetails }) => {
  const { currentProject, dispatch } = useProjectsContext();
  const [showCompleteProjectModal, setShowCompleteProjectModal] = useState(false);
  const [showEnhancedCreation, setShowEnhancedCreation] = useState(false);
  const [showCelebrationScreen, setShowCelebrationScreen] = useState(false);
  const [celebrationComponent, setCelebrationComponent] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [componentToDelete, setComponentToDelete] = useState(null);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [componentToRename, setComponentToRename] = useState(null);

  if (!currentProject) {
    return <div>No project selected</div>;
  }

  // Project type icons mapping
  const getProjectIcon = (projectType) => {
    const icons = {
      sweater: '🧥',
      shawl: '🌙',
      hat: '🎩',
      scarf_cowl: '🧣',
      socks: '🧦',
      blanket: '🛏️',
      toys: '🧸',
      other: '✨'
    };
    return icons[projectType] || '🧶';
  };

  // Calculate project stats for contextual bar
  const totalComponents = currentProject.components?.length || 0;
  const completedComponents = currentProject.components?.filter(comp =>
    comp.steps?.some(step =>
      step.wizardConfig?.stitchPattern?.pattern === 'Bind Off' ||
      step.description?.toLowerCase().includes('bind off')
    )
  ).length || 0;

  // Create sorted components with finishing steps placeholder
  const getSortedComponentsWithFinishing = () => {
    const components = [...currentProject.components];

    // Create persistent finishing steps placeholder
    const finishingSteps = {
      id: 'finishing-steps',
      name: 'Finishing Steps',
      type: 'finishing',
      steps: [], // Empty for now - will be populated later
      isPlaceholder: true
    };

    // Add finishing steps to components
    const allItems = [...components, finishingSteps];

    // Sort by priority
    return allItems.sort((a, b) => {
      const getPriority = (item) => {
        if (item.type === 'finishing') {
          // Finishing steps logic
          if (item.isPlaceholder || (item.steps && item.steps.length === 0)) {
            return 3; // Empty/placeholder - before Edit Mode
          }
          const hasProgress = item.steps?.some(s => s.completed);
          const allComplete = item.steps?.length > 0 && item.steps.every(s => s.completed);
          const manuallyConfirmed = item.finishingComplete; // Future field

          if (allComplete && manuallyConfirmed) return 6; // Completed finishing - very last
          if (hasProgress || item.steps?.length > 0) return 3; // In progress - before Edit Mode
          return 3; // Default to before Edit Mode
        }

        // Regular component logic
        if (!item.steps || item.steps.length === 0) return 4; // Edit Mode

        const hasCastOn = item.steps.some(step =>
          step.wizardConfig?.stitchPattern?.pattern === 'Cast On' ||
          step.description?.toLowerCase().includes('cast on')
        );

        const hasBindOff = item.steps.some(step =>
          step.wizardConfig?.stitchPattern?.pattern === 'Bind Off' ||
          step.description?.toLowerCase().includes('bind off')
        );

        const hasProgress = item.steps.some(s => s.completed);
        const allStepsComplete = item.steps.length > 0 && item.steps.every(s => s.completed);

        if (hasBindOff && allStepsComplete) return 5; // Finished
        if (hasCastOn && hasProgress) return 1; // Currently Knitting
        if (hasCastOn && hasBindOff && !hasProgress) return 2; // Ready to Knit
        return 4; // Edit Mode
      };

      const priorityA = getPriority(a);
      const priorityB = getPriority(b);

      if (priorityA !== priorityB) {
        return priorityA - priorityB;
      }

      // Within same priority, maintain creation order (or alphabetical for finishing steps)
      if (a.type === 'finishing' && b.type === 'finishing') {
        return a.name.localeCompare(b.name);
      }

      return 0; // Maintain relative order
    });
  };

  const handleEnhancedComponentCreated = (component) => {
    setShowEnhancedCreation(false);
    setCelebrationComponent(component);
    setShowCelebrationScreen(true);
  };

  const handleCompleteProject = () => {
    dispatch({ type: 'COMPLETE_PROJECT' });
    setShowCompleteProjectModal(false);
  };

  const handleCelebrationAddSteps = () => {
    setShowCelebrationScreen(false);
    const newComponentIndex = currentProject.components.length - 1;
    onManageSteps(newComponentIndex);
  };

  const handleCelebrationAddAnother = () => {
    setShowCelebrationScreen(false);
    setShowEnhancedCreation(true);
  };

  const handleCelebrationClose = () => {
    setShowCelebrationScreen(false);
    setCelebrationComponent(null);
  };

  const handleComponentMenuAction = (action, componentId) => {
    const componentIndex = currentProject.components.findIndex(c => c.id === componentId);
    const component = currentProject.components[componentIndex];

    if (action === 'manage') {
      onEditSteps(componentIndex);

    } else if (action === 'rename') {
      setComponentToRename(component);
      setShowRenameModal(true);



    } else if (action === 'copy') {
      const newName = window.prompt(`Copy "${component.name}" as:`, `${component.name} Copy`);

      if (newName && newName.trim() !== '') {
        dispatch({
          type: 'COPY_COMPONENT',
          payload: { sourceIndex: componentIndex, newName: newName.trim() }
        });
      }
    } else if (action === 'delete') {
      // NEW: Show modal instead of window.confirm
      setComponentToDelete(component);
      setShowDeleteModal(true);
    }
  };

  const handleComponentManageSteps = (componentId) => {
    {/* const componentIndex = currentProject.components.findIndex(c => c.id === componentId);
    onManageSteps(componentIndex); */}

    // Handle finishing steps placeholder
    if (componentId === 'finishing-steps') {
      alert('Finishing steps functionality coming soon!');
      return;
    }

    const componentIndex = currentProject.components.findIndex(c => c.id === componentId);
    onManageSteps(componentIndex);

  };

  if (showEnhancedCreation) {
    return (
      <SmartComponentCreation
        onBack={() => setShowEnhancedCreation(false)}
        onComponentCreated={handleEnhancedComponentCreated}
      />
    );
  }

  if (showCelebrationScreen && celebrationComponent) {
    return (
      <ComponentCreatedCelebration
        component={celebrationComponent}
        onAddSteps={handleCelebrationAddSteps}
        onAddAnother={handleCelebrationAddAnother}
        onClose={handleCelebrationClose}
      />
    );
  }

  return (
    <div className="min-h-screen bg-yarn-50">
      <div className="max-w-md mx-auto bg-yarn-50 min-h-screen shadow-lg">
        {/* Header - Integrated with project identity */}
        <PageHeader
          title={
            <div className="flex items-center gap-2">
              <span className="text-base">
                {getProjectIcon(currentProject.projectType)}
              </span>
              <span>{currentProject.name}</span>
              {currentProject.size && (
                <span className="text-sage-100 font-normal">(Size {currentProject.size})</span>
              )}
            </div>
          }
          subtitle="Project Overview"
          onBack={onBack}
          showCancelButton={true}
          onCancel={onBack}
        />

        <div className="bg-yarn-50">
          {/* Contextual Bar - Directly below header */}
          <ContextualBar>
            <ContextualBar.Left>
              <span className="text-sage-700 font-medium">Components</span>
            </ContextualBar.Left>
            <ContextualBar.Middle>
              <span>{completedComponents} of {totalComponents} complete</span>
            </ContextualBar.Middle>
            <ContextualBar.Right>
              {/* Future: View toggle, sort options */}
              <span className="text-sage-600">👁️</span>
            </ContextualBar.Right>
          </ContextualBar>

          <div className="p-6">
            <div className="stack-lg">

              {/* Add Component Button - Primary Action */}
              <button
                onClick={() => setShowEnhancedCreation(true)}
                className="w-full bg-yarn-600 text-white py-3 px-4 rounded-xl font-semibold text-base hover:bg-yarn-700 transition-colors shadow-sm flex items-center justify-center gap-2"
              >
                <span className="text-lg">🧶</span>
                Add Component
              </button>

              {/* Component Grid - Clean like other pages */}
              <div className="grid-2-equal">
                {getSortedComponentsWithFinishing().map((item, index) => (
                  <CompactComponentCard
                    key={item.id}
                    component={item}
                    onManageSteps={handleComponentManageSteps}
                    onMenuAction={handleComponentMenuAction}
                    openMenuId={openMenuId}
                    setOpenMenuId={setOpenMenuId}
                  />
                ))}
              </div>

              {/* Show empty state message only when no regular components */}
              {currentProject.components.length === 0 && (
                <div className="mt-6 py-8 text-center">
                  <div className="text-2xl mb-2">🧶</div>
                  <p className="text-wool-500 text-sm">Add your first component to get started</p>
                </div>
              )}

              {/* Completed project display */}
              {currentProject.completed && (
                <div className="bg-sage-100 border-2 border-sage-200 rounded-xl p-4 text-center">
                  <div className="text-2xl mb-2">🏆</div>
                  <h3 className="text-md font-semibold text-sage-700 mb-1">Project Completed!</h3>
                  <p className="text-sage-600 text-sm">
                    Finished on {new Date(currentProject.completedAt).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modals */}
        {showCompleteProjectModal && (
          <CompleteProjectModal
            projectName={currentProject.name}
            onClose={() => setShowCompleteProjectModal(false)}
            onComplete={handleCompleteProject}
          />
        )}
      </div>
      {/* Delete Confirmation Modal */}
      {showDeleteModal && componentToDelete && (
        <DeleteComponentModal
          component={componentToDelete}
          onClose={() => {
            setShowDeleteModal(false);
            setComponentToDelete(null);
          }}
          onDelete={() => {
            const componentIndex = currentProject.components.findIndex(c => c.id === componentToDelete.id);
            dispatch({
              type: 'DELETE_COMPONENT',
              payload: componentIndex
            });
            setShowDeleteModal(false);
            setComponentToDelete(null);
          }}
        />
      )}


      {/* Rename Component Modal */}

      {console.log('Checking rename modal:', showRenameModal, componentToRename) || null}
      {showRenameModal && componentToRename && (
        <RenameComponentModal
          component={componentToRename}
          onClose={() => {
            setShowRenameModal(false);
            setComponentToRename(null);
          }}
          onRename={(newName) => {
            const componentIndex = currentProject.components.findIndex(c => c.id === componentToRename.id);
            const updatedComponents = [...currentProject.components];
            updatedComponents[componentIndex] = {
              ...componentToRename,
              name: newName
            };

            const updatedProject = {
              ...currentProject,
              components: updatedComponents
            };

            dispatch({
              type: 'UPDATE_PROJECT',
              payload: updatedProject
            });

            setShowRenameModal(false);
            setComponentToRename(null);
          }}
        />
      )}
    </div>
  );
};

export default ProjectDetail;