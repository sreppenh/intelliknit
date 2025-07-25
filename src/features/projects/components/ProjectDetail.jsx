// Enhanced ProjectDetail.jsx implementation
// This replaces the existing ProjectDetail.jsx with tabbed interface

import React, { useState } from 'react';
import { useProjectsContext } from '../hooks/useProjectsContext';
import ComponentCreatedCelebration from './ComponentCreatedCelebration';
import CompleteProjectModal from './CompleteProjectModal';
import SmartComponentCreation from './SmartComponentCreation';
import CompactComponentCard from './CompactComponentCard';
import PageHeader from '../../../shared/components/PageHeader';
import ProjectStatusBar from './ProjectDetail/ProjectStatusBar';
import TabBar from '../../../shared/components/TabBar';
import DeleteComponentModal from '../../../shared/components/DeleteComponentModal';
import RenameComponentModal from '../../../shared/components/RenameComponentModal';
import CopyComponentModal from '../../../shared/components/CopyComponentModal';

const ProjectDetail = ({ onBack, onViewComponent, onEditSteps, onManageSteps, onStartKnitting, onEditProjectDetails }) => {
  const { currentProject, dispatch } = useProjectsContext();
  const [showCompleteProjectModal, setShowCompleteProjectModal] = useState(false);
  const [showEnhancedCreation, setShowEnhancedCreation] = useState(false);
  const [showCelebrationScreen, setShowCelebrationScreen] = useState(false);
  const [celebrationComponent, setCelebrationComponent] = useState(null);

  // NEW: Tab state management
  const [activeTab, setActiveTab] = useState('components'); // Default to components tab

  // Menu state management (for three-dot menus)
  const [openMenuId, setOpenMenuId] = useState(null);

  // Modal states for component actions
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [componentToDelete, setComponentToDelete] = useState(null);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [componentToRename, setComponentToRename] = useState(null);
  const [showCopyModal, setShowCopyModal] = useState(false);
  const [componentToCopy, setComponentToCopy] = useState(null);

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
  const completedComponents = currentProject.components?.filter(comp =>
    comp.steps?.some(step =>
      step.wizardConfig?.stitchPattern?.pattern === 'Bind Off' ||
      step.description?.toLowerCase().includes('bind off')
    )
  ).length || 0;

  // All existing component logic (unchanged)
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
          step.wizardConfig?.stitchPattern?.pattern === 'Cast On' ||
          step.description?.toLowerCase().includes('cast on')
        );

        const hasBindOff = item.steps.some(step =>
          step.wizardConfig?.stitchPattern?.pattern === 'Bind Off' ||
          step.description?.toLowerCase().includes('bind off')
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

  // All existing event handlers (unchanged)
  const handleEnhancedComponentCreated = (newComponent) => {
    setCelebrationComponent(newComponent);
    setShowEnhancedCreation(false);
    setShowCelebrationScreen(true);
  };

  const handleCelebrationAddSteps = () => {
    setShowCelebrationScreen(false);
    const newComponentIndex = currentProject.components.length - 1;
    onManageSteps(newComponentIndex);
  };

  const handleCelebrationAddAnother = () => {
    setShowCelebrationScreen(false);
    setCelebrationComponent(null);
    setShowEnhancedCreation(true);
  };

  const handleCelebrationClose = () => {
    setShowCelebrationScreen(false);
    setCelebrationComponent(null);
  };

  const handleCompleteProject = () => {
    dispatch({ type: 'COMPLETE_PROJECT' });
    setShowCompleteProjectModal(false);
    onBack();
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
      setComponentToCopy(component);
      setShowCopyModal(true);
    } else if (action === 'delete') {
      setComponentToDelete(component);
      setShowDeleteModal(true);
    }
  };

  const handleComponentManageSteps = (componentId) => {
    if (componentId === 'finishing-steps') {
      return;
    }

    const componentIndex = currentProject.components.findIndex(c => c.id === componentId);
    onManageSteps(componentIndex);
  };

  // Show modals/screens if active
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

  // NEW: Tab content rendering functions
  const renderOverviewTab = () => (
    <div className="p-6 space-y-6">
      {/* Project Dashboard */}
      <div className="bg-white rounded-xl p-4 border-2 border-wool-200 shadow-sm">
        <h3 className="font-semibold text-wool-700 mb-3">Project Summary</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-wool-600">Components:</span>
            <span className="font-medium">{totalComponents} total</span>
          </div>
          <div className="flex justify-between">
            <span className="text-wool-600">Progress:</span>
            <span className="font-medium">{completedComponents} of {totalComponents} complete</span>
          </div>
          {currentProject.yarn && (
            <div className="flex justify-between">
              <span className="text-wool-600">Yarn:</span>
              <span className="font-medium">{currentProject.yarn}</span>
            </div>
          )}
          {currentProject.recipient && (
            <div className="flex justify-between">
              <span className="text-wool-600">For:</span>
              <span className="font-medium">{currentProject.recipient}</span>
            </div>
          )}
        </div>
      </div>

      {/* Project Actions */}
      <div className="space-y-3">
        <button
          onClick={() => setShowCompleteProjectModal(true)}
          className="w-full bg-sage-600 text-white py-3 px-4 rounded-xl font-semibold hover:bg-sage-700 transition-colors"
        >
          🏆 Mark Project Complete
        </button>

        <button
          onClick={onEditProjectDetails}
          className="w-full bg-yarn-600 text-white py-3 px-4 rounded-xl font-semibold hover:bg-yarn-700 transition-colors"
        >
          ✏️ Edit Project Details
        </button>
      </div>
    </div>
  );

  const renderComponentsTab = () => (
    <div className="p-6">
      <div className="stack-lg">
        {/* Add Component Button - Less prominent than before */}
        <button
          onClick={() => setShowEnhancedCreation(true)}
          className="w-full bg-wool-200 text-wool-700 py-2.5 px-4 rounded-xl font-medium hover:bg-wool-300 transition-colors flex items-center justify-center gap-2 border-2 border-wool-300"
        >
          <span>➕</span>
          Add Component
        </button>

        {/* Component Grid - Exactly as before */}
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

        {/* Empty state message */}
        {currentProject.components.length === 0 && (
          <div className="mt-6 py-8 text-center">
            <div className="text-2xl mb-2">🧶</div>
            <p className="text-wool-500 text-sm">Add your first component to get started</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderDetailsTab = () => (
    <div className="p-6 space-y-4">
      <div className="bg-white rounded-xl p-4 border-2 border-wool-200 shadow-sm space-y-3">
        <h3 className="font-semibold text-wool-700 mb-3">Project Details</h3>

        {currentProject.yarn && (
          <div>
            <span className="text-sm font-medium text-wool-600">Yarn:</span>
            <p className="text-sm text-wool-700">{currentProject.yarn}</p>
          </div>
        )}

        {currentProject.needles && (
          <div>
            <span className="text-sm font-medium text-wool-600">Needles:</span>
            <p className="text-sm text-wool-700">{currentProject.needles}</p>
          </div>
        )}

        {currentProject.gauge && (
          <div>
            <span className="text-sm font-medium text-wool-600">Gauge:</span>
            <p className="text-sm text-wool-700">{currentProject.gauge}</p>
          </div>
        )}

        {currentProject.notes && (
          <div>
            <span className="text-sm font-medium text-wool-600">Notes:</span>
            <p className="text-sm text-wool-700">{currentProject.notes}</p>
          </div>
        )}

        {currentProject.designer && (
          <div>
            <span className="text-sm font-medium text-wool-600">Designer:</span>
            <p className="text-sm text-wool-700">{currentProject.designer}</p>
          </div>
        )}

        {currentProject.recipient && (
          <div>
            <span className="text-sm font-medium text-wool-600">Recipient:</span>
            <p className="text-sm text-wool-700">{currentProject.recipient}</p>
          </div>
        )}
      </div>

      <button
        onClick={onEditProjectDetails}
        className="w-full bg-yarn-600 text-white py-3 px-4 rounded-xl font-semibold hover:bg-yarn-700 transition-colors"
      >
        ✏️ Edit Project Details
      </button>
    </div>
  );

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
        {/* Header - Enhanced with project identity */}
        <PageHeader
          title={
            <div className="flex items-center gap-2">
              <span className="text-base">
                {getProjectIcon(currentProject.projectType)}
              </span>
              <span>{currentProject.name}</span>
              {currentProject.size && (
                <span className="text-sage-100 font-normal">({currentProject.size})</span>
              )}
            </div>
          }
          subtitle="Project Dashboard"
          onBack={onBack}
          showCancelButton={true}
          onCancel={onBack}
        />

        {/* NEW: Enhanced Status Bar */}
        <ProjectStatusBar
          project={currentProject}
          onEditProject={onEditProjectDetails}
        />

        {/* NEW: Tab Navigation */}
        <TabBar activeTab={activeTab} onTabChange={setActiveTab}>
          <TabBar.Tab id="overview" label="Overview" />
          <TabBar.Tab id="components" label="Components" />
          <TabBar.Tab id="details" label="Details" />
          <TabBar.Tab id="photos" label="Photos" />
        </TabBar>

        {/* Tab Content */}
        <div className="bg-yarn-50">
          {activeTab === 'overview' && renderOverviewTab()}
          {activeTab === 'components' && renderComponentsTab()}
          {activeTab === 'details' && renderDetailsTab()}
          {activeTab === 'photos' && renderPhotosTab()}
        </div>

        {/* Modals */}
        {showCompleteProjectModal && (
          <CompleteProjectModal
            projectName={currentProject.name}
            onClose={() => setShowCompleteProjectModal(false)}
            onComplete={handleCompleteProject}
          />
        )}

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

        {/* Copy Component Modal */}
        {showCopyModal && componentToCopy && (
          <CopyComponentModal
            component={componentToCopy}
            onClose={() => {
              setShowCopyModal(false);
              setComponentToCopy(null);
            }}
            onCopy={(newName) => {
              const componentIndex = currentProject.components.findIndex(c => c.id === componentToCopy.id);
              dispatch({
                type: 'COPY_COMPONENT',
                payload: { sourceIndex: componentIndex, newName: newName }
              });
              setShowCopyModal(false);
              setComponentToCopy(null);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default ProjectDetail;