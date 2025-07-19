import React, { useState } from 'react';
import { useProjectsContext } from '../hooks/useProjectsContext';

const ProjectList = ({ onCreateProject, onOpenProject, onBack }) => {
  const { projects, dispatch } = useProjectsContext();
  const [openMenuId, setOpenMenuId] = useState(null);

  const handleProjectEdit = (project) => {
    setOpenMenuId(null);

    // Update last activity when opening project for editing
    const updatedProject = {
      ...project,
      lastActivityAt: new Date().toISOString()
    };

    dispatch({
      type: 'UPDATE_PROJECT',
      payload: updatedProject
    });

    onOpenProject(updatedProject);
  };

  const handleProjectKnitting = (project) => {
    setOpenMenuId(null);
    // TODO: Navigate to knitting mode when implemented

    // For now, could go to tracking or show coming soon
  };

  const handleMenuToggle = (projectId, event) => {
    event.stopPropagation();
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

  const handleCopyPattern = (project, event) => {
    event.stopPropagation();
    const newName = window.prompt(`Copy "${project.name}" as:`, `${project.name} Copy`);

    if (newName && newName.trim() !== '') {
      // TODO: Implement copy pattern functionality

      alert(`Pattern copying coming soon! Would copy "${project.name}" as "${newName.trim()}"`);
    }
    setOpenMenuId(null);
  };

  // Helper functions for smart button logic
  const getProjectStatus = (project) => {
    if (project.completed) return 'completed';
    if (project.components.length === 0) return 'planning';

    const totalSteps = project.components.reduce((total, comp) => total + comp.steps.length, 0);
    const completedSteps = project.components.reduce((total, comp) =>
      total + comp.steps.filter(s => s.completed).length, 0);

    if (totalSteps === 0) return 'planning';
    if (completedSteps === 0) return 'ready';
    if (completedSteps === totalSteps) return 'completed';
    return 'in_progress';
  };

  // NEW: Smart project sorting with featured top project
  const getSortedProjects = () => {
    if (projects.length === 0) return [];

    const sorted = [...projects].sort((a, b) => {
      // First priority: Most recent activity
      const activityA = new Date(a.lastActivityAt || a.createdAt);
      const activityB = new Date(b.lastActivityAt || b.createdAt);

      if (activityA > activityB) return -1;
      if (activityA < activityB) return 1;

      // Second priority: Status-based ordering
      const statusOrder = {
        'in_progress': 1,
        'ready': 2,
        'planning': 3,
        'completed': 4
      };

      const statusA = getProjectStatus(a);
      const statusB = getProjectStatus(b);

      if (statusOrder[statusA] !== statusOrder[statusB]) {
        return statusOrder[statusA] - statusOrder[statusB];
      }

      // Final: Creation date (newest first)
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    return sorted;
  };

  const getKnittingButtonText = (project) => {
    const status = getProjectStatus(project);
    switch (status) {
      case 'ready': return 'Start Knitting';
      case 'in_progress': return 'Continue Knitting';
      case 'completed': return 'View Project';
      case 'planning': return 'Plan Project';
      default: return 'Continue Knitting';
    }
  };

  const getKnittingButtonIcon = (project) => {
    const status = getProjectStatus(project);
    switch (status) {
      case 'ready': return '🚀';
      case 'in_progress': return '🧶';
      case 'completed': return '🏆';
      case 'planning': return '📝';
      default: return '🧶';
    }
  };

  const shouldShowKnittingButton = (project) => {
    return getProjectStatus(project) !== 'planning';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  // Close menu when clicking outside
  const handleCardClick = (project) => {
    if (openMenuId) {
      setOpenMenuId(null);
    }
  };

  return (
    <div className="min-h-screen bg-yarn-50">
      <div className="max-w-md mx-auto bg-yarn-50 min-h-screen shadow-lg">

        <div className="bg-sage-500 text-white px-6 py-4">
          <div className="flex items-center gap-3">
            {onBack && (
              <button
                onClick={onBack}
                className="text-white text-xl hover:bg-white hover:bg-opacity-20 rounded-full w-10 h-10 flex items-center justify-center transition-colors"
              >
                ←
              </button>
            )}
            <div className="flex-1 text-center">
              <div className="text-2xl mb-1">🧶</div>
              <h1 className="text-xl font-bold mb-0.5">IntelliKnit</h1>
              <p className="text-sage-100 text-xs">Ready to knit something amazing?</p>
            </div>
            {/* Spacer to center the content when back button is present */}
            {onBack && <div className="w-10"></div>}
          </div>
        </div>

        <div className="p-4 bg-yarn-50">

          {/* Project List or Welcome Screen */}
          {projects.length === 0 ? (
            <div className="text-center py-4">
              <div className="bg-white rounded-2xl p-6 shadow-sm border-2 border-wool-200 mb-4">
                <div className="text-4xl mb-3">🏠</div>
                <h2 className="text-xl font-bold text-wool-700 mb-2">Welcome to Your Craft Room!</h2>
                <p className="text-wool-500 mb-4 leading-relaxed text-sm">
                  Ready to start your knitting journey? Create your first project and let's get those needles clicking!
                </p>

                <div className="grid grid-cols-1 gap-2 text-left mb-4">
                  <div className="flex items-center gap-3 p-2.5 bg-sage-50 rounded-lg border border-sage-200">
                    <div className="text-xl">🎯</div>
                    <div>
                      <div className="font-semibold text-sage-700 text-xs">Smart Progress Tracking</div>
                      <div className="text-xs text-sage-600">Never lose your place again</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-2.5 bg-yarn-100 rounded-lg border border-yarn-200">
                    <div className="text-xl">🧮</div>
                    <div>
                      <div className="font-semibold text-yarn-700 text-xs">Pattern Assistant</div>
                      <div className="text-xs text-yarn-600">Guided step creation</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-2.5 bg-wool-100 rounded-lg border border-wool-200">
                    <div className="text-xl">🧶</div>
                    <div>
                      <div className="font-semibold text-wool-700 text-xs">Knitting-First Design</div>
                      <div className="text-xs text-wool-600">Focus on the joy of making</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-wool-700">Your Projects</h2>
                <span className="text-xs text-wool-500 bg-white px-2 py-1 rounded-full border border-wool-200">
                  {projects.length} project{projects.length !== 1 ? 's' : ''}
                </span>
              </div>

              <div className="stack-sm">
                {getSortedProjects().map((project, index) => {
                  const isTopProject = index === 0 && projects.length > 1;
                  const status = getProjectStatus(project);
                  const totalSteps = project.components.reduce((total, comp) => total + comp.steps.length, 0);
                  const completedSteps = project.components.reduce((total, comp) =>
                    total + comp.steps.filter(s => s.completed).length, 0);
                  const completedComponents = project.components.filter(comp =>
                    comp.steps.length > 0 && comp.steps.every(step => step.completed)
                  ).length;
                  const progressPercent = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

                  return (
                    <div
                      key={project.id}
                      onClick={() => handleCardClick(project)}
                      className={`border-2 rounded-xl p-5 shadow-sm transition-all duration-200 relative ${isTopProject
                          ? 'bg-gradient-to-br from-sage-50 to-yarn-50 border-sage-300 shadow-lg transform scale-[1.02]'
                          : 'bg-white border-wool-200'
                        }`}
                    >
                      {/* Project Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 pr-8">
                          <div className="flex items-center gap-2 mb-1">
                            {/* NEW: Subtle current project indicator */}
                            {isTopProject && (
                              <span className="text-sm">⭐</span>
                            )}
                            <h3 className={`font-bold text-base ${isTopProject ? 'text-sage-700' : 'text-wool-700'
                              }`}>
                              {project.name}
                            </h3>
                            {status === 'completed' && (
                              <span className="text-lg">🏆</span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-xs text-wool-500">
                            <span>{project.size || 'No size specified'}</span>
                            <span>•</span>
                            <span>Started {formatDate(project.createdAt)}</span>
                          </div>
                        </div>

                        {/* Three-dot menu */}
                        <div className="relative">
                          <button
                            onClick={(e) => handleMenuToggle(project.id, e)}
                            className="p-1 text-wool-400 hover:text-wool-600 hover:bg-wool-100 rounded-full transition-colors"
                          >
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                              <circle cx="8" cy="3" r="1.5" />
                              <circle cx="8" cy="8" r="1.5" />
                              <circle cx="8" cy="13" r="1.5" />
                            </svg>
                          </button>

                          {/* Dropdown menu */}
                          {openMenuId === project.id && (
                            <div className="absolute right-0 top-8 bg-white border border-wool-200 rounded-lg shadow-lg z-10 min-w-40">
                              <button
                                onClick={(e) => handleProjectEdit(project)}
                                className="w-full px-3 py-2 text-left text-wool-600 hover:bg-sage-50 rounded-t-lg text-sm flex items-center gap-2 transition-colors"
                              >
                                📝 Edit Project
                              </button>
                              <button
                                onClick={(e) => handleCopyPattern(project, e)}
                                className="w-full px-3 py-2 text-left text-wool-600 hover:bg-yarn-50 text-sm flex items-center gap-2 transition-colors"
                              >
                                📋 Copy Pattern
                              </button>
                              <button
                                onClick={(e) => handleDeleteProject(project.id, project.name, e)}
                                className="w-full px-3 py-2 text-left text-wool-600 hover:bg-red-50 rounded-b-lg text-sm flex items-center gap-2 transition-colors"
                              >
                                🗑️ Delete Project
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Progress Section */}
                      {project.components.length > 0 && (
                        <div className="mb-4">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="flex-1 bg-wool-100 rounded-full h-2 border border-wool-200">
                              <div
                                className={`h-2 rounded-full transition-all duration-300 ${status === 'completed' ? 'bg-sage-500' : 'bg-yarn-500'
                                  }`}
                                style={{ width: `${progressPercent}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-bold text-wool-700 tabular-nums">
                              {progressPercent}%
                            </span>
                          </div>
                          <div className="text-xs text-wool-500">
                            {completedComponents} of {project.components.length} components complete
                          </div>
                        </div>
                      )}

                      {/* Action Button */}
                      <div className="space-y-2">
                        {shouldShowKnittingButton(project) ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (status === 'completed' || status === 'planning') {
                                handleProjectEdit(project);
                              } else {
                                handleProjectKnitting(project);
                              }
                            }}
                            className={`w-full py-3 px-4 rounded-xl font-semibold text-base transition-colors shadow-sm flex items-center justify-center gap-2 ${status === 'completed'
                                ? 'bg-sage-500 text-white hover:bg-sage-600'
                                : isTopProject
                                  ? 'bg-sage-600 text-white hover:bg-sage-700 shadow-md'
                                  : 'bg-yarn-600 text-white hover:bg-yarn-700'
                              }`}
                          >
                            <span className="text-lg">{getKnittingButtonIcon(project)}</span>
                            {getKnittingButtonText(project)}
                          </button>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleProjectEdit(project);
                            }}
                            className="w-full btn-tertiary flex items-center justify-center gap-2"
                          >
                            <span className="text-lg">📝</span>
                            Plan Project
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Create Project Button */}
          <div className="pt-4">
            <button
              onClick={onCreateProject}
              className="w-full bg-sage-600 text-white py-4 px-6 rounded-xl font-semibold text-base hover:bg-sage-700 transition-colors shadow-lg flex items-center justify-center gap-2"
            >
              <span className="text-xl">✨</span>
              {projects.length === 0 ? 'Start Your First Project' : 'Create New Project'}
            </button>
          </div>

          {/* Footer */}
          <div className="text-center pt-4 pb-2">
            <p className="text-xs text-wool-400">Happy knitting! 🧶</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectList;