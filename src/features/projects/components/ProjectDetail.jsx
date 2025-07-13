import React, { useState } from 'react';
import { useProjectsContext } from '../hooks/useProjectsContext';
import ComponentCreatedCelebration from './ComponentCreatedCelebration';
import CompleteProjectModal from './CompleteProjectModal';
import SmartComponentCreation from './SmartComponentCreation';
import CompactComponentCard from './CompactComponentCard';

const ProjectOverview = ({ project, onEditProjectDetails }) => {
  const [openMenu, setOpenMenu] = useState(false);
  
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
  const totalComponents = project.components?.length || 0;
  const completedComponents = project.components?.filter(comp => 
    comp.steps?.some(step => 
      step.wizardConfig?.stitchPattern?.pattern === 'Bind Off' ||
      step.description?.toLowerCase().includes('bind off')
    )
  ).length || 0;

  const handleMenuToggle = () => {
    setOpenMenu(!openMenu);
  };

  const handleEditDetails = () => {
    onEditProjectDetails();
    setOpenMenu(false);
  };

  return (
    <div className="bg-white border-2 border-wool-200 rounded-xl p-4 shadow-sm">
      <div className="flex items-start gap-3">
        
        {/* Project Icon */}
        <div className="flex-shrink-0">
          <div className="w-12 h-12 bg-sage-100 rounded-lg flex items-center justify-center text-2xl border-2 border-sage-200">
            {getProjectIcon(project.projectType)}
          </div>
        </div>

        {/* Project Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0 pr-2">
              <h2 className="text-lg font-semibold text-wool-800 truncate">{project.name}</h2>
              <p className="text-wool-500 text-sm">Size: {project.size || 'Not specified'}</p>
            </div>
            
            {/* Three-dot Menu */}
            <div className="relative flex-shrink-0">
              <button
                onClick={handleMenuToggle}
                className="p-1 text-wool-400 hover:text-wool-600 hover:bg-wool-100 rounded-full transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <circle cx="8" cy="3" r="1.5"/>
                  <circle cx="8" cy="8" r="1.5"/>
                  <circle cx="8" cy="13" r="1.5"/>
                </svg>
              </button>

              {openMenu && (
                <div className="absolute right-0 top-8 bg-white border border-wool-200 rounded-lg shadow-lg z-10 min-w-36">
                  <button
                    onClick={handleEditDetails}
                    className="w-full px-3 py-2 text-left text-wool-600 hover:bg-sage-50 rounded-t-lg text-sm flex items-center gap-2 transition-colors"
                  >
                    ⚙️ Edit Details
                  </button>
                  <button
                    onClick={() => setOpenMenu(false)}
                    className="w-full px-3 py-2 text-left text-wool-600 hover:bg-sage-50 text-sm flex items-center gap-2 transition-colors"
                  >
                    📊 View Stats
                  </button>
                  <button
                    onClick={() => setOpenMenu(false)}
                    className="w-full px-3 py-2 text-left text-wool-600 hover:bg-sage-50 rounded-b-lg text-sm flex items-center gap-2 transition-colors"
                  >
                    📤 Export
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Project Stats */}
          <div className="mt-3">
            {/* Components Count */}
            <div className="flex items-center text-sm">
              <span className="text-wool-500 ml-auto">
                {completedComponents} of {totalComponents} components complete
              </span>
            </div>

            {/* Additional Project Details (if available) */}
            {(project.recipient || project.gauge || project.yarns?.length > 0) && (
              <div className="pt-2 mt-2 border-t border-wool-100">
                <div className="flex flex-wrap gap-3 text-xs text-wool-500">
                  {project.recipient && (
                    <span><strong>For:</strong> {project.recipient}</span>
                  )}
                  {project.gauge && (
                    <span><strong>Gauge:</strong> {project.gauge}</span>
                  )}
                  {project.yarns && project.yarns.length > 0 && (
                    <span><strong>Yarn:</strong> {project.yarns[0]}</span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const ProjectDetail = ({ onBack, onViewComponent, onEditSteps, onManageSteps, onStartKnitting, onEditProjectDetails }) => {
  const { currentProject, dispatch } = useProjectsContext();
  const [showCompleteProjectModal, setShowCompleteProjectModal] = useState(false);
  const [showEnhancedCreation, setShowEnhancedCreation] = useState(false);
  const [showCelebrationScreen, setShowCelebrationScreen] = useState(false);
  const [celebrationComponent, setCelebrationComponent] = useState(null);

  if (!currentProject) {
    return <div>No project selected</div>;
  }

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
      const newName = window.prompt(`Rename "${component.name}" to:`, component.name);
      
      if (newName && newName.trim() !== '' && newName !== component.name) {
        const updatedComponents = [...currentProject.components];
        updatedComponents[componentIndex] = {
          ...component,
          name: newName.trim()
        };
        
        const updatedProject = {
          ...currentProject,
          components: updatedComponents
        };
        
        dispatch({
          type: 'UPDATE_PROJECT',
          payload: updatedProject
        });
      }
    } else if (action === 'copy') {
      const newName = window.prompt(`Copy "${component.name}" as:`, `${component.name} Copy`);
      
      if (newName && newName.trim() !== '') {
        dispatch({
          type: 'COPY_COMPONENT',
          payload: { sourceIndex: componentIndex, newName: newName.trim() }
        });
      }
    } else if (action === 'delete') {
      const confirmed = window.confirm(`Delete "${component.name}"? This cannot be undone.`);
      
      if (confirmed) {
        dispatch({
          type: 'DELETE_COMPONENT',
          payload: componentIndex
        });
      }
    }
  };

  const handleComponentManageSteps = (componentId) => {
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
        {/* Header - Clean navigation only */}
        <div className="bg-sage-500 text-white px-6 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="text-white text-xl hover:bg-white hover:bg-opacity-20 rounded-full w-10 h-10 flex items-center justify-center transition-colors"
            >
              ←
            </button>
            <div className="flex-1">
              <h1 className="text-lg font-semibold">{currentProject.name}</h1>
              <p className="text-sage-100 text-sm">Edit Mode</p>
            </div>
          </div>
        </div>

        <div className="p-6 bg-yarn-50">
          <div className="stack-lg">
            
            {/* Project Overview Section */}
            <ProjectOverview 
              project={currentProject}
              onEditProjectDetails={onEditProjectDetails}
            />

            <h2 className="text-xl font-semibold text-wool-700 text-left">Components</h2>
            
            {/* Components section */}
            <div className="stack-lg">
              {currentProject.components.length === 0 ? (
                /* Empty state */
                <div className="py-12 text-center bg-white rounded-xl border-2 border-wool-200 shadow-sm">
                  <div className="text-4xl mb-4">📝</div>
                  <h3 className="text-lg font-semibold text-wool-600 mb-2">No components yet</h3>
                  <p className="text-wool-500">Add your first component to get started</p>
                </div>
              ) : (
                /* Component grid */
                <div className="grid grid-cols-2 gap-3">
                  {currentProject.components.map((component, index) => (
                    <CompactComponentCard
                      key={component.id}
                      component={component}
                      onManageSteps={handleComponentManageSteps}
                      onMenuAction={handleComponentMenuAction}
                    />
                  ))}
                </div>
              )}
              
              {/* Add Component button */}
              <button
                onClick={() => setShowEnhancedCreation(true)}
                className="w-full bg-yarn-600 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:bg-yarn-700 transition-colors shadow-sm flex items-center justify-center gap-2"
              >
                <span className="text-xl">🧶</span>
                Add Component
              </button>
            </div>
            
            {/* Completed project display */}
            {currentProject.completed && (
              <div className="mt-8 pt-6 border-t border-wool-200">
                <div className="text-center p-4 bg-sage-100 border-2 border-sage-200 rounded-xl">
                  <div className="text-2xl mb-2">🏆</div>
                  <h3 className="text-md font-semibold text-sage-700 mb-1">Project Completed!</h3>
                  <p className="text-sage-600 text-sm">
                    Finished on {new Date(currentProject.completedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            )}
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
    </div>
  );
};

export default ProjectDetail;