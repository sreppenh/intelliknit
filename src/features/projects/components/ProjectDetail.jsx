// Enhanced ProjectDetail.jsx implementation
// Refactored with extracted components and centralized actions
// STRUCTURAL CLEANUP: Removed ProjectStatusBar for clean hierarchy
// CSS GRID LAYOUT: Fixed sticky header positioning
// ✨ NEW: Upgraded to use compact branding header with perfect tab connection

import React from 'react';
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
import DeleteComponentModal from '../../../shared/components/modals/DeleteComponentModal';
import RenameComponentModal from '../../../shared/components/modals/RenameComponentModal';
import CopyComponentModal from '../../../shared/components/modals/CopyComponentModal';

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

  // ✨ NEW: Home navigation handler
  const handleHomeNavigation = () => {
    // Navigate back to landing page
    // This assumes you have a way to navigate to landing page
    // You might need to pass this as a prop or use your navigation system
    onBack(); // For now, this goes back - you can enhance this later
  };

  if (!currentProject) {
    return <div>No project selected</div>;
  }

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

  // Main render with CSS Grid Layout
  return (
    <div className="min-h-screen bg-yarn-50">
      <div className="app-container bg-yarn-50 min-h-screen shadow-lg">

        {/* CSS GRID CONTAINER - Fixes sticky positioning */}
        <div className="project-detail-grid">

          {/* FIXED HEADER ROW - ✨ NOW WITH COMPACT BRANDING! */}
          <div className="header-row">
            <PageHeader
              useBranding={true}
              onHome={handleHomeNavigation}
              onBack={onBack}
              showCancelButton={true}
              onCancel={onBack}
              compact={true}  // ✨ NEW: Makes it streamlined (py-2)
              sticky={false} // Grid handles positioning
            />
          </div>

          {/* FIXED TABS ROW */}
          <div className="tabs-row">
            <TabBar
              activeTab={currentTab}
              onTabChange={changeTab}
              sticky={false} // Grid handles positioning
            >
              <TabBar.Tab id="overview" label="Overview" />
              <TabBar.Tab id="components" label="Components" />
              <TabBar.Tab id="details" label="Details" />
              <TabBar.Tab id="checklist" label="Checklist" />
            </TabBar>
          </div>

          {/* SCROLLABLE CONTENT ROW */}
          <div className="content-row">
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
                  onShowEnhancedCreation={componentActions.showEnhancedCreation}
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
                    onBack();
                  }}
                  onCopyProject={(projectData) => {
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
          </div>

        </div>

        {/* All Modals (unchanged) */}
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

      {/* ✨ FIXED CSS Grid Styles - Now matches compact header height */}
      <style>{`
        .project-detail-grid {
          display: grid;
          grid-template-rows: auto auto 1fr;
          height: 100vh;
          overflow: hidden;
        }

        .header-row {
          position: sticky;
          top: 0;
          z-index: 30;
          grid-row: 1;
        }

        .tabs-row {
          position: sticky;
          top: 56px;  /* ✨ FIXED: 56px for compact header (py-2) */
          z-index: 25;
          grid-row: 2;
          margin-top: -1px; /* ✨ Overlap by 1px for seamless connection */
        }

        .content-row {
          grid-row: 3;
          overflow-y: auto;
          -webkit-overflow-scrolling: touch;
          overscroll-behavior: none;
        }

        /* ✨ NEW: Ensure tabs connect seamlessly to header */
        .tabs-row .bg-sage-100 {
          border-top: none !important;
        }

        /* ✨ NEW: Remove any browser default spacing */
        .tabs-row > div {
          margin: 0 !important;
          padding-top: 0 !important;
        }

        /* Mobile safe area support */
        @media (max-width: 768px) {
          .header-row {
            top: env(safe-area-inset-top, 0);
          }
          
          .tabs-row {
            top: calc(56px + env(safe-area-inset-top, 0));  /* ✨ FIXED: 56px for compact */
            margin-top: -1px;
          }
        }

        /* Smooth scrolling */
        .content-row {
          scroll-behavior: smooth;
        }
      `}</style>
    </div>
  );
};

export default ProjectDetail;