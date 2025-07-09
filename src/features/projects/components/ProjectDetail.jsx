import React, { useState } from 'react';
import { useProjectsContext } from '../hooks/useProjectsContext';
import ComponentChoiceModal from './ComponentChoiceModal';
import CompleteProjectModal from './CompleteProjectModal';
import EnhancedComponentCreation from './EnhancedComponentCreation'; // NEW: Import enhanced creation

const ProjectDetail = ({ onBack, onViewComponent, onEditSteps, onStartKnitting }) => {
  const { currentProject, dispatch } = useProjectsContext();
  const [showChoiceModal, setShowChoiceModal] = useState(false);
  const [showCompleteProjectModal, setShowCompleteProjectModal] = useState(false);
  const [showEnhancedCreation, setShowEnhancedCreation] = useState(false); // NEW: Enhanced creation state
  const [lastAddedComponentIndex, setLastAddedComponentIndex] = useState(null);

  if (!currentProject) {
    return <div>No project selected</div>;
  }

  // NEW: Enhanced component creation handler
  const handleEnhancedComponentCreated = (component) => {
    setShowEnhancedCreation(false);
    
    // FIXED: Get the correct index - it's the last component in the array
    const newComponentIndex = currentProject.components.length; // This will be the index after the component is added
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
      // FIXED: Pass the correct component index
      onEditSteps(lastAddedComponentIndex);
    }
    
    setLastAddedComponentIndex(null);
  };

  // NEW: If showing enhanced creation, render it
  if (showEnhancedCreation) {
    return (
      <EnhancedComponentCreation
        onBack={() => setShowEnhancedCreation(false)}
        onComponentCreated={handleEnhancedComponentCreated}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto bg-white min-h-screen shadow-lg">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={onBack}
              className="text-2xl"
            >
              ←
            </button>
            <div className="flex-1">
              <h1 className="text-xl font-bold">{currentProject.name}</h1>
              <p className="text-blue-100">Size: {currentProject.size}</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 text-left">Components</h2>
            
            {currentProject.components.length === 0 ? (
              <div className="py-8">
                <div className="text-left">
                  <div className="text-4xl mb-3">📝</div>
                  <p className="text-gray-600 mb-4">No components yet</p>
                </div>
              </div>
            ) : (
              <div className="space-y-3 mb-4">
                {currentProject.components.map((component, index) => (
                  <div 
                    key={component.id} 
                    onClick={() => onViewComponent(index)}
                    className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-sm transition-all cursor-pointer"
                  >
                    <div className="text-left">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-gray-800">{component.name}</h3>
                        {component.steps.length > 0 && component.currentStep >= component.steps.length && (
                          <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                            ✓ Complete
                          </span>
                        )}
                      </div>
                      
                      {/* NEW: Show enhanced component info if available */}
                      {component.startingStitches && (
                        <div className="text-xs text-gray-500 mb-2">
                          <span className="font-medium">Start:</span> {component.startingStitches} stitches ({component.startDescription})
                          {component.endingStitches !== undefined && (
                            <span className="ml-2">
                              <span className="font-medium">End:</span> {component.endingStitches} stitches ({component.endDescription})
                            </span>
                          )}
                        </div>
                      )}
                      
                      <p className="text-sm text-gray-500 mb-2">
                        {component.steps.length} step{component.steps.length !== 1 ? 's' : ''}
                        {component.steps.length > 0 && (
                          <span className="ml-2">
                            • {component.steps.filter(s => s.completed).length} of {component.steps.length} done
                          </span>
                        )}
                      </p>
                      {component.steps.length > 0 && (
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full transition-all duration-300 ${
                                component.currentStep >= component.steps.length 
                                  ? 'bg-green-600' 
                                  : 'bg-blue-600'
                              }`}
                              style={{
                                width: `${(component.steps.filter(s => s.completed).length / component.steps.length) * 100}%`
                              }}
                            ></div>
                          </div>
                          <span className="text-xs text-gray-500 min-w-0">
                            {Math.round((component.steps.filter(s => s.completed).length / component.steps.length) * 100) || 0}%
                          </span>
                        </div>
                      )}
                      <div className="text-xs text-blue-600 mt-2">Tap to view options</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <div className="space-y-3">
              {/* Enhanced Component Creation Button */}
              <button
                onClick={() => setShowEnhancedCreation(true)}
                className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
              >
                Add Component
              </button>
            </div>
            
            {/* Complete Project Section */}
            {!currentProject.completed && currentProject.components.length > 0 && (
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="text-center">
                  <p className="text-gray-600 text-sm mb-3">
                    Ready to finish this project?
                  </p>
                <button
                  onClick={() => setShowCompleteProjectModal(true)}
                  className="bg-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors"
                >
                  Complete Project
                </button>
                </div>
              </div>
            )}
            
            {currentProject.completed && (
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="text-center p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="text-2xl mb-2">🏆</div>
                  <h3 className="text-md font-semibold text-green-800 mb-1">Project Completed!</h3>
                  <p className="text-green-600 text-sm">
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
              // FIXED: Get the component name correctly
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