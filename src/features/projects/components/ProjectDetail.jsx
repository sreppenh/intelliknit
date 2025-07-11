import React, { useState } from 'react';
import { useProjectsContext } from '../hooks/useProjectsContext';
import ComponentChoiceModal from './ComponentChoiceModal';
import CompleteProjectModal from './CompleteProjectModal';
import EnhancedComponentCreation from './EnhancedComponentCreation';

const ProjectDetail = ({ onBack, onViewComponent, onEditSteps, onStartKnitting, onEditProjectDetails }) => {
  const { currentProject, dispatch } = useProjectsContext();
  const [showChoiceModal, setShowChoiceModal] = useState(false);
  const [showCompleteProjectModal, setShowCompleteProjectModal] = useState(false);
  const [showEnhancedCreation, setShowEnhancedCreation] = useState(false);
  const [lastAddedComponentIndex, setLastAddedComponentIndex] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);

  if (!currentProject) {
    return <div>No project selected</div>;
  }

  const handleEnhancedComponentCreated = (component) => {
    setShowEnhancedCreation(false);
    
    const newComponentIndex = currentProject.components.length;
    setLastAddedComponentIndex(newComponentIndex);
    setShowChoiceModal(true);
  };

  const handleCompleteProject = () => {
    dispatch({ type: 'COMPLETE_PROJECT' });
    setShowCompleteProjectModal(false);
  };

  const handleChoiceModalAction = (action) => {
    setShowChoiceModal(false);
    
    if (action === 'add-steps' && lastAddedComponentIndex !== null) {
      onEditSteps(lastAddedComponentIndex);
    }
    
    setLastAddedComponentIndex(null);
  };

  // NEW: Handle component menu actions
  const handleMenuToggle = (componentId, event) => {
    event.stopPropagation(); // Prevent component selection
    setOpenMenuId(openMenuId === componentId ? null : componentId);
  };

  const handleRenameComponent = (componentIndex, event) => {
    event.stopPropagation();
    const component = currentProject.components[componentIndex];
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
    setOpenMenuId(null);
  };

  const handleCopyComponent = (componentIndex, event) => {
    event.stopPropagation();
    const component = currentProject.components[componentIndex];
    const newName = window.prompt(`Copy "${component.name}" as:`, `${component.name} Copy`);
    
    if (newName && newName.trim() !== '') {
      dispatch({
        type: 'COPY_COMPONENT',
        payload: { sourceIndex: componentIndex, newName: newName.trim() }
      });
    }
    setOpenMenuId(null);
  };

  const handleDeleteComponent = (componentIndex, componentName, event) => {
    event.stopPropagation();
    const confirmed = window.confirm(`Delete "${componentName}"? This cannot be undone.`);
    
    if (confirmed) {
      dispatch({
        type: 'DELETE_COMPONENT',
        payload: componentIndex
      });
    }
    setOpenMenuId(null);
  };

  // Close menu when clicking component card
  const handleComponentClick = (componentIndex) => {
    if (openMenuId) {
      setOpenMenuId(null);
    } else {
      onViewComponent(componentIndex);
    }
  };

  if (showEnhancedCreation) {
    return (
      <EnhancedComponentCreation
        onBack={() => setShowEnhancedCreation(false)}
        onComponentCreated={handleEnhancedComponentCreated}
      />
    );
  }

  return (
    <div className="min-h-screen bg-yarn-50">
      <div className="max-w-md mx-auto bg-yarn-50 min-h-screen shadow-lg">
        {/* Header with sage colors */}
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
              <p className="text-sage-100 text-sm">Size: {currentProject.size || 'Not specified'}</p>
            </div>
            {/* NEW: Edit details button in header */}
            <button
              onClick={onEditProjectDetails}
              className="text-white text-lg hover:bg-white hover:bg-opacity-20 rounded-full w-10 h-10 flex items-center justify-center transition-colors"
              title="Edit project details"
            >
              ⚙️
            </button>
          </div>
        </div>

        <div className="p-6 bg-yarn-50">
          <div className="space-y-6">
            
            {/* NEW: Project Info Section (if any details exist) */}
            {(currentProject.gauge || currentProject.yarns?.length > 0 || currentProject.needles?.length > 0 || 
              currentProject.source || currentProject.designer || currentProject.recipient) && (
              <div className="bg-white rounded-xl border-2 border-wool-200 p-4 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-md font-semibold text-wool-700">Project Info</h3>
                  <button
                    onClick={onEditProjectDetails}
                    className="text-xs text-sage-600 hover:text-sage-700 font-medium"
                  >
                    Edit →
                  </button>
                </div>
                <div className="space-y-2 text-sm">
                  {currentProject.gauge && (
                    <div><span className="font-medium text-wool-600">Gauge:</span> {currentProject.gauge}</div>
                  )}
                  {currentProject.yarns && currentProject.yarns.length > 0 && (
                    <div><span className="font-medium text-wool-600">Yarn:</span> {currentProject.yarns.join(', ')}</div>
                  )}
                  {currentProject.needles && currentProject.needles.length > 0 && (
                    <div><span className="font-medium text-wool-600">Needles:</span> {currentProject.needles.join(', ')}</div>
                  )}
                  {currentProject.recipient && (
                    <div><span className="font-medium text-wool-600">For:</span> {currentProject.recipient}</div>
                  )}
                  {currentProject.source && (
                    <div><span className="font-medium text-wool-600">Source:</span> {currentProject.source}</div>
                  )}
                  {currentProject.designer && (
                    <div><span className="font-medium text-wool-600">Designer:</span> {currentProject.designer}</div>
                  )}
                </div>
              </div>
            )}

            <h2 className="text-xl font-semibold text-wool-700 text-left">Components</h2>
            
            {/* Components section */}
            <div className="space-y-6">
              {currentProject.components.length === 0 ? (
                /* Empty state with proper spacing */
                <div className="py-12 text-center bg-white rounded-xl border-2 border-wool-200 shadow-sm">
                  <div className="text-4xl mb-4">📝</div>
                  <h3 className="text-lg font-semibold text-wool-600 mb-2">No components yet</h3>
                  <p className="text-wool-500">Add your first component to get started</p>
                </div>
              ) : (
                /* Component list */
                <div className="space-y-4">
                  {currentProject.components.map((component, index) => (
                    <div 
                      key={component.id} 
                      onClick={() => handleComponentClick(index)}
                      className="border-2 border-wool-200 rounded-xl p-5 hover:border-sage-400 hover:bg-white hover:shadow-md transition-all duration-200 cursor-pointer bg-white shadow-sm relative"
                    >
                      <div className="text-left">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-wool-700 flex-1 pr-8">{component.name}</h3>
                          
                          {/* Status badge */}
                          {component.steps.length > 0 && component.currentStep >= component.steps.length && (
                            <span className="bg-sage-100 text-sage-700 text-xs font-semibold px-2 py-1 rounded-full border border-sage-200">
                              ✓ Complete
                            </span>
                          )}

                          {/* Three-dot menu */}
                          <div className="relative">
                            <button
                              onClick={(e) => handleMenuToggle(component.id, e)}
                              className="p-1 text-wool-400 hover:text-wool-600 hover:bg-wool-100 rounded-full transition-colors"
                            >
                              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                                <circle cx="8" cy="3" r="1.5"/>
                                <circle cx="8" cy="8" r="1.5"/>
                                <circle cx="8" cy="13" r="1.5"/>
                              </svg>
                            </button>

                            {/* Dropdown menu */}
                            {openMenuId === component.id && (
                              <div className="absolute right-0 top-8 bg-white border border-wool-200 rounded-lg shadow-lg z-10 min-w-32">
                                <button
                                  onClick={(e) => handleRenameComponent(index, e)}
                                  className="w-full px-3 py-2 text-left text-wool-600 hover:bg-sage-50 rounded-t-lg text-sm flex items-center gap-2 transition-colors"
                                >
                                  ✏️ Rename
                                </button>
                                <button
                                  onClick={(e) => handleCopyComponent(index, e)}
                                  className="w-full px-3 py-2 text-left text-wool-600 hover:bg-sage-50 text-sm flex items-center gap-2 transition-colors"
                                >
                                  📋 Copy
                                </button>
                                <button
                                  onClick={(e) => handleDeleteComponent(index, component.name, e)}
                                  className="w-full px-3 py-2 text-left text-wool-600 hover:bg-red-50 rounded-b-lg text-sm flex items-center gap-2 transition-colors"
                                >
                                  🗑️ Delete
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* Enhanced component info if available */}
                        {component.startingStitches && (
                          <div className="text-xs text-wool-500 mb-3 bg-wool-50 rounded-lg p-2 border border-wool-100">
                            <div className="flex flex-wrap gap-4">
                              <span>
                                <span className="font-semibold text-wool-600">Start:</span> {component.startingStitches} stitches
                              </span>
                              {component.endingStitches !== undefined && (
                                <span>
                                  <span className="font-semibold text-wool-600">End:</span> {component.endingStitches} stitches
                                </span>
                              )}
                            </div>
                            <div className="text-wool-400 mt-1">{component.startDescription}</div>
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-sm text-wool-600 font-medium">
                            {component.steps.length} step{component.steps.length !== 1 ? 's' : ''}
                          </p>
                          {component.steps.length > 0 && (
                            <p className="text-sm text-wool-500">
                              {component.steps.filter(s => s.completed).length} of {component.steps.length} done
                            </p>
                          )}
                        </div>
                        
                        {/* Progress bar */}
                        {component.steps.length > 0 && (
                          <div className="space-y-2">
                            <div className="flex items-center gap-3">
                              <div className="flex-1 bg-wool-100 rounded-full h-3 border border-wool-200">
                                <div 
                                  className={`h-3 rounded-full transition-all duration-300 ${
                                    component.currentStep >= component.steps.length 
                                      ? 'bg-sage-500 shadow-sm' 
                                      : 'bg-sage-400'
                                  }`}
                                  style={{
                                    width: `${(component.steps.filter(s => s.completed).length / component.steps.length) * 100}%`
                                  }}
                                ></div>
                              </div>
                              <span className="text-sm font-semibold text-wool-600 min-w-0 tabular-nums">
                                {Math.round((component.steps.filter(s => s.completed).length / component.steps.length) * 100) || 0}%
                              </span>
                            </div>
                            <div className="text-xs text-sage-600 font-medium">Tap to view options →</div>
                          </div>
                        )}
                        
                        {/* No steps yet state */}
                        {component.steps.length === 0 && (
                          <div className="text-xs text-wool-400 font-medium">
                            No steps yet • Tap to add steps →
                          </div>
                        )}
                      </div>
                    </div>
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
            
            {/* Complete Project Section */}
            {!currentProject.completed && currentProject.components.length > 0 && (
              <div className="mt-8 pt-6 border-t border-wool-200">
                <div className="text-center">
                  <p className="text-wool-500 text-sm mb-3">
                    Ready to finish this project?
                  </p>
                  <button
                    onClick={() => setShowCompleteProjectModal(true)}
                    className="bg-sage-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-sage-600 transition-colors shadow-sm"
                  >
                    Complete Project
                  </button>
                </div>
              </div>
            )}
            
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
        {showChoiceModal && (
          <ComponentChoiceModal
            componentName={
              lastAddedComponentIndex !== null && currentProject.components[lastAddedComponentIndex]
                ? currentProject.components[lastAddedComponentIndex].name
                : 'New Component'
            }
            onClose={() => handleChoiceModalAction('close')}
            onAddSteps={() => handleChoiceModalAction('add-steps')}
            onAddAnother={() => handleChoiceModalAction('add-another')}
          />
        )}
        
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