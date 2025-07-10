import React, { useState } from 'react';
import { useProjectsContext } from '../hooks/useProjectsContext';

const ProjectList = ({ onCreateProject, onOpenProject }) => {
  const { projects, dispatch } = useProjectsContext();
  const [openMenuId, setOpenMenuId] = useState(null);

  const handleProjectSelect = (project) => {
    setOpenMenuId(null); // Close any open menu
    onOpenProject(project);
  };

  const handleMenuToggle = (projectId, event) => {
    event.stopPropagation(); // Prevent project selection
    setOpenMenuId(openMenuId === projectId ? null : projectId);
  };

  const handleDeleteProject = (projectId, projectName, event) => {
    event.stopPropagation();
    const confirmed = window.confirm(`Delete "${projectName}"? This cannot be undone.`);
    
    if (confirmed) {
      dispatch({
        type: 'DELETE_PROJECT',
        payload: projectId
      });
    }
    setOpenMenuId(null);
  };

  // Close menu when clicking outside
  const handleCardClick = (project) => {
    if (openMenuId) {
      setOpenMenuId(null);
    } else {
      handleProjectSelect(project);
    }
  };

  return (
    <div className="min-h-screen bg-yarn-50">
      <div className="max-w-md mx-auto bg-yarn-50 min-h-screen shadow-lg">
        
        {/* MOBILE-OPTIMIZED: Compact header */}
        <div className="bg-sage-500 text-white px-6 py-4">
          <div className="text-center">
            <div className="text-2xl mb-1">🧶</div>
            <h1 className="text-xl font-bold mb-0.5">IntelliKnit</h1>
            <p className="text-sage-100 text-xs">Your knitting companion</p>
          </div>
        </div>

        <div className="p-4 bg-yarn-50">
          
          {/* Project List or Welcome Screen */}
          {projects.length === 0 ? (
            /* MOBILE-OPTIMIZED: Compact welcome screen */
            <div className="text-center py-4">
              <div className="bg-white rounded-2xl p-6 shadow-sm border-2 border-wool-200 mb-4">
                <div className="text-4xl mb-3">🏠</div>
                <h2 className="text-xl font-bold text-wool-700 mb-2">Welcome to Your Craft Room!</h2>
                <p className="text-wool-500 mb-4 leading-relaxed text-sm">
                  Ready to start your knitting journey? Create your first project and let's organize your stitches, track your progress, and celebrate every row.
                </p>
                
                {/* MOBILE-OPTIMIZED: Compact features preview */}
                <div className="grid grid-cols-1 gap-2 text-left mb-4">
                  <div className="flex items-center gap-3 p-2.5 bg-sage-50 rounded-lg border border-sage-200">
                    <div className="text-xl">📊</div>
                    <div>
                      <div className="font-semibold text-sage-700 text-xs">Smart Progress Tracking</div>
                      <div className="text-xs text-sage-600">Never lose your place again</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-2.5 bg-yarn-100 rounded-lg border border-yarn-200">
                    <div className="text-xl">🧮</div>
                    <div>
                      <div className="font-semibold text-yarn-700 text-xs">Pattern Calculations</div>
                      <div className="text-xs text-yarn-600">Automatic stitch math</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-2.5 bg-wool-100 rounded-lg border border-wool-200">
                    <div className="text-xl">🎯</div>
                    <div>
                      <div className="font-semibold text-wool-700 text-xs">Step-by-Step Guidance</div>
                      <div className="text-xs text-wool-600">Break complex projects into manageable pieces</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* MOBILE-OPTIMIZED: Compact project list */
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-wool-700">Your Projects</h2>
                <span className="text-xs text-wool-500 bg-white px-2 py-1 rounded-full border border-wool-200">
                  {projects.length} project{projects.length !== 1 ? 's' : ''}
                </span>
              </div>
              
              <div className="space-y-3">
                {projects.map((project) => (
                  <div
                    key={project.id}
                    onClick={() => handleCardClick(project)}
                    className="bg-white border-2 border-wool-200 rounded-xl p-4 hover:border-sage-400 hover:shadow-md transition-all duration-200 cursor-pointer shadow-sm relative"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1 pr-8">
                        <h3 className="font-semibold text-wool-700 text-base mb-0.5">{project.name}</h3>
                        <p className="text-wool-500 text-xs">Size: {project.size}</p>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {/* Status indicator */}
                        {project.completed ? (
                          <span className="bg-sage-100 text-sage-700 text-xs font-semibold px-2 py-0.5 rounded-full border border-sage-200">
                            ✓ Complete
                          </span>
                        ) : project.components.length === 0 ? (
                          <span className="bg-yarn-100 text-yarn-700 text-xs font-semibold px-2 py-0.5 rounded-full border border-yarn-200">
                            🚀 New
                          </span>
                        ) : (
                          <span className="bg-wool-100 text-wool-700 text-xs font-semibold px-2 py-0.5 rounded-full border border-wool-200">
                            📝 In Progress
                          </span>
                        )}

                        {/* Three-dot menu */}
                        <div className="relative">
                          <button
                            onClick={(e) => handleMenuToggle(project.id, e)}
                            className="p-1 text-wool-400 hover:text-wool-600 hover:bg-wool-100 rounded-full transition-colors"
                          >
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                              <circle cx="8" cy="3" r="1.5"/>
                              <circle cx="8" cy="8" r="1.5"/>
                              <circle cx="8" cy="13" r="1.5"/>
                            </svg>
                          </button>

                          {/* Dropdown menu */}
                          {openMenuId === project.id && (
                            <div className="absolute right-0 top-8 bg-white border border-wool-200 rounded-lg shadow-lg z-10 min-w-32">
                              <button
                                onClick={(e) => handleDeleteProject(project.id, project.name, e)}
                                className="w-full px-3 py-2 text-left text-wool-600 hover:bg-red-50 rounded-lg text-sm flex items-center gap-2 transition-colors"
                              >
                                🗑️ Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* MOBILE-OPTIMIZED: Compact project stats */}
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="bg-wool-50 rounded-lg p-2 border border-wool-100">
                        <div className="font-semibold text-wool-600">{project.components.length}</div>
                        <div className="text-xs text-wool-500">Component{project.components.length !== 1 ? 's' : ''}</div>
                      </div>
                      
                      <div className="bg-wool-50 rounded-lg p-2 border border-wool-100">
                        <div className="font-semibold text-wool-600">
                          {project.components.reduce((total, comp) => total + comp.steps.length, 0)}
                        </div>
                        <div className="text-xs text-wool-500">Total Steps</div>
                      </div>
                    </div>
                    
                    {/* MOBILE-OPTIMIZED: Compact progress if project has components */}
                    {project.components.length > 0 && (
                      <div className="mt-2">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-wool-100 rounded-full h-1.5 border border-wool-200">
                            <div 
                              className="h-1.5 bg-sage-500 rounded-full transition-all duration-300"
                              style={{
                                width: `${(() => {
                                  const totalSteps = project.components.reduce((total, comp) => total + comp.steps.length, 0);
                                  const completedSteps = project.components.reduce((total, comp) => 
                                    total + comp.steps.filter(s => s.completed).length, 0);
                                  return totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;
                                })()}%`
                              }}
                            ></div>
                          </div>
                          <span className="text-xs font-semibold text-wool-600 tabular-nums">
                            {(() => {
                              const totalSteps = project.components.reduce((total, comp) => total + comp.steps.length, 0);
                              const completedSteps = project.components.reduce((total, comp) => 
                                total + comp.steps.filter(s => s.completed).length, 0);
                              return totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;
                            })()}%
                          </span>
                        </div>
                        <div className="text-xs text-wool-500 mt-1">Tap to continue knitting →</div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* MOBILE-OPTIMIZED: Prominent, always-visible start button */}
          <div className="pt-4">
            <button
              onClick={onCreateProject}
              className="w-full bg-yarn-600 text-white py-4 px-6 rounded-xl font-semibold text-base hover:bg-yarn-700 transition-colors shadow-lg flex items-center justify-center gap-2"
            >
              <span className="text-xl">🧶</span>
              {projects.length === 0 ? 'Start Your First Project' : 'Create New Project'}
            </button>
          </div>
          
          {/* MOBILE-OPTIMIZED: Compact footer */}
          <div className="text-center pt-4 pb-2">
            <p className="text-xs text-wool-400">Happy knitting! 🧶</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectList;