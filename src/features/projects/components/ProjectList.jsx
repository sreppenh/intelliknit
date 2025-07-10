import React from 'react';
import { useProjectsContext } from '../hooks/useProjectsContext';

const ProjectList = ({ onCreateProject, onOpenProject }) => {
  const { projects } = useProjectsContext();

  const handleProjectSelect = (project) => {
    onOpenProject(project);
  };

  return (
    <div className="min-h-screen bg-yarn-50">
      <div className="max-w-md mx-auto bg-yarn-50 min-h-screen shadow-lg">
        
        {/* UPDATED: Welcoming header with sage colors */}
        <div className="bg-sage-500 text-white px-6 py-6">
          <div className="text-center">
            <div className="text-3xl mb-2">🧶</div>
            <h1 className="text-2xl font-bold mb-1">IntelliKnit</h1>
            <p className="text-sage-100 text-sm">Your knitting companion</p>
          </div>
        </div>

        <div className="p-6 bg-yarn-50">
          
          {/* Project List or Welcome Screen */}
          {projects.length === 0 ? (
            /* UPDATED: Warm welcome screen */
            <div className="text-center py-12">
              <div className="bg-white rounded-2xl p-8 shadow-sm border-2 border-wool-200 mb-6">
                <div className="text-6xl mb-4">🏠</div>
                <h2 className="text-2xl font-bold text-wool-700 mb-3">Welcome to Your Craft Room!</h2>
                <p className="text-wool-500 mb-6 leading-relaxed">
                  Ready to start your knitting journey? Create your first project and let's organize your stitches, track your progress, and celebrate every row.
                </p>
                
                {/* Features preview */}
                <div className="grid grid-cols-1 gap-3 text-left mb-6">
                  <div className="flex items-center gap-3 p-3 bg-sage-50 rounded-lg border border-sage-200">
                    <div className="text-2xl">📊</div>
                    <div>
                      <div className="font-semibold text-sage-700 text-sm">Smart Progress Tracking</div>
                      <div className="text-xs text-sage-600">Never lose your place again</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-yarn-100 rounded-lg border border-yarn-200">
                    <div className="text-2xl">🧮</div>
                    <div>
                      <div className="font-semibold text-yarn-700 text-sm">Pattern Calculations</div>
                      <div className="text-xs text-yarn-600">Automatic stitch math</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-wool-100 rounded-lg border border-wool-200">
                    <div className="text-2xl">🎯</div>
                    <div>
                      <div className="font-semibold text-wool-700 text-sm">Step-by-Step Guidance</div>
                      <div className="text-xs text-wool-600">Break complex projects into manageable pieces</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* UPDATED: Project list with warm styling */
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-wool-700">Your Projects</h2>
                <span className="text-sm text-wool-500 bg-white px-3 py-1 rounded-full border border-wool-200">
                  {projects.length} project{projects.length !== 1 ? 's' : ''}
                </span>
              </div>
              
              <div className="space-y-4">
                {projects.map((project) => (
                  <div
                    key={project.id}
                    onClick={() => handleProjectSelect(project)}
                    className="bg-white border-2 border-wool-200 rounded-xl p-5 hover:border-sage-400 hover:shadow-md transition-all duration-200 cursor-pointer shadow-sm"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-wool-700 text-lg mb-1">{project.name}</h3>
                        <p className="text-wool-500 text-sm">Size: {project.size}</p>
                      </div>
                      
                      {/* Status indicator */}
                      {project.completed ? (
                        <span className="bg-sage-100 text-sage-700 text-xs font-semibold px-3 py-1 rounded-full border border-sage-200">
                          ✓ Complete
                        </span>
                      ) : project.components.length === 0 ? (
                        <span className="bg-yarn-100 text-yarn-700 text-xs font-semibold px-3 py-1 rounded-full border border-yarn-200">
                          🚀 New
                        </span>
                      ) : (
                        <span className="bg-wool-100 text-wool-700 text-xs font-semibold px-3 py-1 rounded-full border border-wool-200">
                          📝 In Progress
                        </span>
                      )}
                    </div>
                    
                    {/* Project stats */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
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
                    
                    {/* Overall progress if project has components */}
                    {project.components.length > 0 && (
                      <div className="mt-3">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 bg-wool-100 rounded-full h-2 border border-wool-200">
                            <div 
                              className="h-2 bg-sage-500 rounded-full transition-all duration-300"
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
          
          {/* UPDATED: Create Project button with yarn orange */}
          <div className="pt-6">
            <button
              onClick={onCreateProject}
              className="w-full bg-yarn-600 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:bg-yarn-700 transition-colors shadow-sm flex items-center justify-center gap-2"
            >
              <span className="text-xl">🧶</span>
              {projects.length === 0 ? 'Start Your First Project' : 'Create New Project'}
            </button>
          </div>
          
          {/* Footer */}
          <div className="text-center pt-8 pb-4">
            <p className="text-xs text-wool-400">Happy knitting! 🧶</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectList;