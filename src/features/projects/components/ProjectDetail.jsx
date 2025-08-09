// Enhanced ProjectDetail.jsx implementation
// Refactored with extracted components and centralized actions
// STRUCTURAL CLEANUP: Removed ProjectStatusBar for clean hierarchy

import React, { useState } from 'react';
import { useProjectsContext } from '../hooks/useProjectsContext';
import useProjectActions from './ProjectDetail/hooks/useProjectActions';
import useTabNavigation from './ProjectDetail/hooks/useTabNavigation';

// Main flow components
import ComponentCreatedCelebration from './ComponentCreatedCelebration';
import SmartComponentCreation from './SmartComponentCreation';

// Tab components
import OverviewTab from './ProjectDetail/tabs/OverviewTab';
import ComponentsTab from './ProjectDetail/tabs/ComponentsTab';
import DetailsTab from './ProjectDetail/tabs/DetailsTab';
import ChecklistTab from './ProjectDetail/tabs/ChecklistTab';

// Shared components
import PageHeader from '../../../shared/components/PageHeader';
import TabBar from '../../../shared/components/TabBar';

// Modal components
import CompleteProjectModal from './CompleteProjectModal';
import DeleteComponentModal from '../../../shared/components/DeleteComponentModal';
import RenameComponentModal from '../../../shared/components/RenameComponentModal';
import CopyComponentModal from '../../../shared/components/CopyComponentModal';

import { getStepPatternName, getComponentState } from '../../../shared/utils/stepDisplayUtils';

const ProjectDetail = ({ initialTab, onBack, onViewComponent, onEditSteps, onManageSteps, onStartKnitting, onEditProjectDetails }) => {
  const { currentProject, dispatch } = useProjectsContext();

  // Tab navigation with memory management
  const { currentTab, changeTab } = useTabNavigation(currentProject?.id, initialTab);


  // Extract all actions and modal states
  const {
    projectActions,
    componentActions,
    modalStates,
    modalHandlers
  } = useProjectActions(currentProject, dispatch, {
    onBack,
    onEditSteps,
    onManageSteps,
    onEditProjectDetails
  });

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

  // Calculate project stats
  const totalComponents = currentProject.components?.length || 0;
  const completedComponents = currentProject.components?.filter(comp => {
    const state = getComponentState(comp);
    return state === 'finished';
  }).length || 0;

  // Component sorting logic (unchanged from original)
  const getSortedComponentsWithFinishing = () => {
    const components = [...currentProject.components];

    const finishingSteps = {
      id: 'finishing-steps',
      name: 'Finishing Steps',
      type: 'finishing',
      steps: [],
      isPlaceholder: true
    };

    const allItems = [...components, finishingSteps];

    return allItems.sort((a, b) => {
      const getPriority = (item) => {
        if (item.type === 'finishing') {
          if (item.isPlaceholder || (item.steps && item.steps.length === 0)) {
            return 3;
          }
          const hasProgress = item.steps?.some(s => s.completed);
          const allComplete = item.steps?.length > 0 && item.steps.every(s => s.completed);

          if (allComplete) return 6;
          if (hasProgress || item.steps?.length > 0) return 3;
          return 3;
        }

        if (!item.steps || item.steps.length === 0) return 4;

        const hasCastOn = item.steps.some(step =>
          getStepPatternName(step) === 'Cast On'
        );

        const hasBindOff = item.steps.some(step =>
          getStepPatternName(step) === 'Bind Off'
        );

        const hasProgress = item.steps.some(s => s.completed);
        const allComplete = item.steps.every(s => s.completed);

        if (hasProgress && !allComplete) return 1;
        if (hasCastOn && hasBindOff && !hasProgress) return 2;
        if (allComplete) return 5;
        return 4;
      };

      return getPriority(a) - getPriority(b);
    });
  };

  // Handle special flow screens
  if (modalStates.showEnhancedCreation) {
    return (
      <SmartComponentCreation
        onBack={modalHandlers.hideEnhancedCreation}
        onComponentCreated={componentActions.onEnhancedComponentCreated}
      />
    );
  }

  if (modalStates.showCelebrationScreen && modalStates.celebrationComponent) {
    return (
      <ComponentCreatedCelebration
        component={modalStates.celebrationComponent}
        onAddSteps={componentActions.onCelebrationAddSteps}
        onAddAnother={componentActions.onCelebrationAddAnother}
        onClose={componentActions.onCelebrationClose}
      />
    );
  }

  // Photos tab placeholder
  const renderPhotosTab = () => (
    <div className="p-6 text-center py-12">
      <div className="text-4xl mb-3">📷</div>
      <h3 className="font-semibold text-wool-700 mb-2">Photos Coming Soon</h3>
      <p className="text-wool-500 text-sm">Project photo gallery will be available in a future update</p>
    </div>
  );

  // Main render
  return (
    <div className="min-h-screen bg-yarn-50">
      <div className="max-w-md mx-auto bg-yarn-50 min-h-screen shadow-lg">
        {/* Header */}
        <PageHeader
          title={
            <div className="flex items-center gap-2 justify-center">
              <span className="text-base">
                {getProjectIcon(currentProject.projectType)}
              </span>
              <span>{currentProject.name}</span>
            </div>
          }
          subtitle="Project Dashboard"
          onBack={onBack}
          showCancelButton={true}
          onCancel={onBack}
        />

        {/* Tab Navigation - Now functions as secondary header */}
        <TabBar
          activeTab={currentTab}
          onTabChange={changeTab}
          sticky={true}
          topOffset="72px"
          zIndex={18}
        >
          <TabBar.Tab id="overview" label="Overview" />
          <TabBar.Tab id="components" label="Components" />
          <TabBar.Tab id="details" label="Details" />
          <TabBar.Tab id="checklist" label="Checklist" />
        </TabBar>

        {/* Tab Content */}
        <div className="bg-yarn-50">
          {currentTab === 'overview' && (
            <OverviewTab
              project={currentProject}
              totalComponents={totalComponents}
              completedComponents={completedComponents}
              onCompleteProject={modalHandlers.showCompleteProject}
              onEditProjectDetails={projectActions.editProjectDetails}
              onManageSteps={componentActions.manageSteps}
              onStartKnitting={onStartKnitting}
              onChangeTab={changeTab}
              onShowEnhancedCreation={componentActions.showEnhancedCreation}  // ✅ ADD THIS LINE
              onProjectUpdate={(updatedProject) => {
                dispatch({
                  type: 'UPDATE_PROJECT',
                  payload: updatedProject
                });
              }}
              onDeleteProject={(projectId) => {
                dispatch({
                  type: 'DELETE_PROJECT',
                  payload: projectId
                });
                onBack(); // Navigate back after deletion
              }}
              onCopyProject={(projectData) => {
                console.log('Copy project:', projectData);
                // TODO: Implement copy project functionality
                alert('📋 Copy Project feature coming soon!');
              }}
            />
          )}
          {currentTab === 'components' && (
            <ComponentsTab
              project={currentProject}
              sortedComponents={getSortedComponentsWithFinishing()}
              onShowEnhancedCreation={componentActions.showEnhancedCreation}
              onComponentManageSteps={componentActions.manageSteps}
              onComponentMenuAction={componentActions.menuAction}
              openMenuId={modalStates.openMenuId}
              setOpenMenuId={modalStates.setOpenMenuId}
            />
          )}
          {currentTab === 'details' && (
            <DetailsTab
              project={currentProject}
              onProjectUpdate={(updatedProject) => {
                dispatch({
                  type: 'UPDATE_PROJECT',
                  payload: updatedProject
                });
              }}
            />
          )}
          {currentTab === 'checklist' && (
            <ChecklistTab
              project={currentProject}
              onProjectUpdate={(updatedProject) => {
                dispatch({
                  type: 'UPDATE_PROJECT',
                  payload: updatedProject
                });
              }}
            />
          )}
        </div>

        {/* Modals */}
        {modalStates.showCompleteProjectModal && (
          <CompleteProjectModal
            projectName={currentProject.name}
            onClose={modalHandlers.closeCompleteProject}
            onComplete={projectActions.completeProject}
          />
        )}

        {modalStates.showDeleteModal && modalStates.componentToDelete && (
          <DeleteComponentModal
            component={modalStates.componentToDelete}
            onClose={modalHandlers.closeDeleteModal}
            onDelete={modalHandlers.confirmDeleteComponent}
          />
        )}

        {modalStates.showRenameModal && modalStates.componentToRename && (
          <RenameComponentModal
            component={modalStates.componentToRename}
            onClose={modalHandlers.closeRenameModal}
            onRename={modalHandlers.confirmRenameComponent}
          />
        )}

        {modalStates.showCopyModal && modalStates.componentToCopy && (
          <CopyComponentModal
            component={modalStates.componentToCopy}
            onClose={modalHandlers.closeCopyModal}
            onCopy={modalHandlers.confirmCopyComponent}
          />
        )}
      </div>
    </div>
  );
};

export default ProjectDetail;