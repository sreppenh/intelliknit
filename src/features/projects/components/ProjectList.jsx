import React, { useState } from 'react';
import { useProjectsContext } from '../hooks/useProjectsContext';
import PageHeader from '../../../shared/components/PageHeader';
import IntelliKnitLogger from '../../../shared/utils/ConsoleLogging';
import { getProjectStatus as getSharedProjectStatus } from '../../../shared/utils/projectStatus';


const ProjectList = ({ onCreateProject, onOpenProject, onBack }) => {
  const { projects, dispatch } = useProjectsContext();
  const [filterState, setFilterState] = useState('all');


  const handleProjectEdit = (project) => {
    // NEW: Add today to activity log and update last activity
    const today = new Date().toISOString().split('T')[0];
    const updatedActivityLog = project.activityLog || [];

    // Only add today if it's not already in the log
    if (!updatedActivityLog.includes(today)) {
      updatedActivityLog.push(today);
    }

    const updatedProject = {
      ...project,
      lastActivityAt: new Date().toISOString(),
      activityLog: updatedActivityLog
    };

    dispatch({
      type: 'UPDATE_PROJECT',
      payload: updatedProject
    });

    onOpenProject(updatedProject);
  };

  // Project type icons
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

  // Calculate streak days (consecutive days of any activity)
  const getStreakDays = (project) => {
    if (!project.activityLog || project.activityLog.length === 0) return 0;

    let streak = 0;
    const today = new Date();
    const msPerDay = 24 * 60 * 60 * 1000;

    // Check each day going backwards from today
    for (let i = 0; i < 30; i++) { // Check last 30 days max
      const checkDate = new Date(today.getTime() - (i * msPerDay));
      const dayString = checkDate.toISOString().split('T')[0];

      if (project.activityLog.includes(dayString)) {
        streak = i + 1;
      } else if (i === 0) {
        // No activity today, check if streak continues from yesterday
        continue;
      } else {
        break; // Streak broken
      }
    }
    return streak;
  };

  // Priority-based personality calculation (completed/frogged override everything)
  const getProjectPersonality = (project, isTopProject = false) => {
    const totalComponents = project.components?.length || 0;
    const hasSteps = project.components?.some(comp => comp.steps?.length > 0);
    const streakDays = getStreakDays(project);

    // 1. COMPLETED - nothing else matters
    if (project.completed) {
      return {
        state: 'completed',
        emoji: '🎉',
        mood: 'Celebration time!',
        color: 'text-sage-600',
        category: 'completed'
      };
    }

    // 2. FROGGED - nothing else matters  
    if (project.frogged) {
      return {
        state: 'frogged',
        emoji: '🐸',
        mood: 'Taking a break',
        color: 'text-blue-600',
        category: 'planning'
      };
    }

    // 3. For active projects, calculate based on activity and progress

    // Fire projects (3+ day streak)
    if (streakDays >= 3) {
      return {
        state: 'fire',
        emoji: '🔥',
        mood: `${streakDays} day streak`,
        color: 'text-orange-600',
        category: 'active',
        streakDays: streakDays
      };
    }

    // Current project (top project override)
    if (isTopProject && hasSteps) {
      return {
        state: 'current',
        emoji: '⭐',
        mood: 'Currently working',
        color: 'text-sage-600',
        category: 'active'
      };
    }

    // Dormant projects (no activity for 14+ days but have steps)
    const lastActivity = new Date(project.lastActivityAt || project.createdAt);
    const daysSinceActivity = Math.floor((Date.now() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));

    if (daysSinceActivity > 14 && hasSteps) {
      return {
        state: 'dormant',
        emoji: '😴',
        mood: 'Taking a nap',
        color: 'text-wool-500',
        category: 'planning'
      };
    }

    // Empty projects (no components or steps)
    if (totalComponents === 0 || !hasSteps) {
      return {
        state: 'planning',
        emoji: '💭',
        mood: 'Ready to begin',
        color: 'text-lavender-600',
        category: 'planning'
      };
    }

    // Active projects (fallback)
    return {
      state: 'active',
      emoji: '🧶',
      mood: 'In progress',
      color: 'text-yarn-600',
      category: 'active'
    };
  };

  // Smart project sorting (chronological like Ravelry)
  const getSortedProjects = () => {
    if (projects.length === 0) return [];

    return [...projects].sort((a, b) => {
      // Sort by most recent activity (chronological timeline)
      const activityA = new Date(a.lastActivityAt || a.createdAt);
      const activityB = new Date(b.lastActivityAt || b.createdAt);
      return activityB - activityA;
    });
  };

  // Filter projects by personality category
  const getFilteredProjects = () => {
    const sortedProjects = getSortedProjects();

    if (filterState === 'all') return sortedProjects;

    return sortedProjects.filter(project => {
      const personality = getProjectPersonality(project);

      if (filterState === 'completed') {
        return project.completed;
      }

      if (filterState === 'planning') {
        return personality.category === 'planning';
      }

      if (filterState === 'active') {
        return personality.category === 'active';
      }

      return true;
    });
  };

  // Calculate component completion info
  const getComponentInfo = (project) => {
    const totalComponents = project.components?.length || 0;
    if (totalComponents === 0) return { total: 0, completed: 0, text: 'No components yet' };

    const completedComponents = project.components.filter(comp =>
      comp.steps?.length > 0 && comp.steps.every(step => step.completed)
    ).length;

    if (completedComponents === 0) {
      return {
        total: totalComponents,
        completed: 0,
        text: `${totalComponents} component${totalComponents > 1 ? 's' : ''}`
      };
    }

    return {
      total: totalComponents,
      completed: completedComponents,
      text: `${totalComponents} components, ${completedComponents} completed`
    };
  };

  // Get last activity display
  const getLastActivityDisplay = (project) => {
    if (!project.lastActivityAt) {
      const daysSinceCreated = Math.floor((Date.now() - new Date(project.createdAt).getTime()) / (1000 * 60 * 60 * 24));
      if (daysSinceCreated === 0) return 'Created today';
      if (daysSinceCreated === 1) return 'Created yesterday';
      return `Created ${daysSinceCreated} days ago`;
    }

    const days = Math.floor((Date.now() - new Date(project.lastActivityAt).getTime()) / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Active today';
    if (days === 1) return 'Active yesterday';
    if (days < 7) return `Active ${days} days ago`;
    if (days < 30) return `Active ${Math.floor(days / 7)} weeks ago`;
    return `Active ${Math.floor(days / 30)} months ago`;
  };

  const getEmptyStateContent = () => {
    switch (filterState) {
      case 'active':
        return {
          emoji: '🎯',
          title: 'No Active Projects Right Now',
          message: 'All caught up! Your projects are either completed or waiting to be started. Ready to begin something new?',
          buttonText: '✨ Start New Project'
        };

      case 'planning':
        return {
          emoji: '💭',
          title: 'No Projects in Planning',
          message: 'You\'re all set! Your projects are either active or completed. Time to dream up something new?',
          buttonText: '✨ Plan New Project'
        };

      case 'completed':
        return {
          emoji: '🏆',
          title: 'No Completed Projects Yet',
          message: 'Your future finished projects will appear here! Keep knitting - your first completion celebration is waiting.',
          buttonText: '🧶 Continue Knitting'
        };

      case 'all':
      default:
        return {
          emoji: '🏠',
          title: 'Welcome to Your Craft Room!',
          message: 'Ready to start your knitting journey? Create your first project and let\'s get those needles clicking!',
          buttonText: '✨ Create First Project'
        };
    }
  };

  // Handle navigation
  const handleBackToLanding = () => {
    if (onBack) {
      onBack();
    }
  };

  return (
    <div className="min-h-screen bg-yarn-50">
      <div className="max-w-md mx-auto bg-yarn-50 min-h-screen shadow-lg">

        {/* PageHeader */}
        <PageHeader
          title="My Projects"
          onBack={handleBackToLanding}
          showBackButton={true}
          showCancelButton={true}
          onCancel={handleBackToLanding}
        />

        {/* Clean header with project count */}
        <div className="content-header-with-buttons px-6 py-4 bg-white border-b border-wool-100">
          <div className="content-title">
            Your Projects {projects.length > 0 && `(${projects.length})`}
          </div>
          <div className="button-group">
            <button
              onClick={onCreateProject}
              className="btn-secondary"
            >
              ✨ Add New Project
            </button>
          </div>
        </div>

        {/* Subtle text link filters */}
        <div className="px-6 py-3 bg-white border-b border-wool-100">
          <div className="flex items-center gap-6">
            <span className="text-sm text-wool-500">Show:</span>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setFilterState('all')}
                className={`text-sm font-medium transition-colors ${filterState === 'all'
                    ? 'text-sage-600 border-b-2 border-sage-500 pb-1'
                    : 'text-wool-600 hover:text-sage-600'
                  }`}
              >
                All Projects
              </button>
              <button
                onClick={() => setFilterState('active')}
                className={`text-sm font-medium transition-colors ${filterState === 'active'
                    ? 'text-sage-600 border-b-2 border-sage-500 pb-1'
                    : 'text-wool-600 hover:text-sage-600'
                  }`}
              >
                Active
              </button>
              <button
                onClick={() => setFilterState('planning')}
                className={`text-sm font-medium transition-colors ${filterState === 'planning'
                    ? 'text-sage-600 border-b-2 border-sage-500 pb-1'
                    : 'text-wool-600 hover:text-sage-600'
                  }`}
              >
                Planning
              </button>
              <button
                onClick={() => setFilterState('completed')}
                className={`text-sm font-medium transition-colors ${filterState === 'completed'
                    ? 'text-sage-600 border-b-2 border-sage-500 pb-1'
                    : 'text-wool-600 hover:text-sage-600'
                  }`}
              >
                Completed
              </button>
            </div>
          </div>
          {/* Project count on its own line */}
          <div className="mt-2">
            <span className="text-xs text-wool-500">
              {getFilteredProjects().length} project{getFilteredProjects().length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {/* Content area */}
        <div className="p-6 bg-yarn-50">
          <p className="content-subheader mb-6">What would you like to work on?</p>

          {/* Project List or Welcome Screen */}
          {getFilteredProjects().length === 0 ? (
            <div className="text-center">
              {(() => {
                const emptyState = getEmptyStateContent();
                return (
                  <div className="bg-white rounded-2xl p-6 shadow-sm border-2 border-wool-200 mb-4">
                    <div className="text-4xl mb-3">{emptyState.emoji}</div>
                    <h2 className="text-xl font-bold text-wool-700 mb-2">{emptyState.title}</h2>
                    <p className="content-subheader leading-relaxed text-sm mb-4">
                      {emptyState.message}
                    </p>
                    <button
                      onClick={onCreateProject}
                      className="bg-yarn-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-yarn-700 transition-colors shadow-sm"
                    >
                      {emptyState.buttonText}
                    </button>
                  </div>
                );
              })()}

              <div className="bg-lavender-100 rounded-2xl p-4 border-2 border-lavender-200">
                <div className="text-2xl mb-2">💡</div>
                <div className="text-sm text-wool-600">Focus on the joy of making</div>
              </div>
            </div>
          ) : (
            /* Enhanced chronological project cards */
            <div className="space-y-3">
              {getFilteredProjects().map((project, index) => {
                const isTopProject = index === 0 && getFilteredProjects().length > 1;
                const personality = getProjectPersonality(project, isTopProject);
                const componentInfo = getComponentInfo(project);
                const projectIcon = getProjectIcon(project.projectType);

                return (
                  <div
                    key={project.id}
                    className="bg-white rounded-xl p-4 shadow-sm border border-wool-200 cursor-pointer hover:shadow-md hover:border-sage-300 transition-all duration-200"
                    onClick={() => handleProjectEdit(project)}
                  >
                    {/* Project Header - Icon, Name, Status */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <span className="text-2xl flex-shrink-0">{projectIcon}</span>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-wool-700 text-base truncate mb-1">
                            {project.name}
                          </h3>
                          <div className="flex items-center gap-2">
                            <span className={`text-sm font-medium ${personality.color}`}>
                              {personality.state.charAt(0).toUpperCase() + personality.state.slice(1)}
                            </span>
                            {personality.streakDays && (
                              <span className="text-sm text-orange-600 font-medium">
                                🔥{personality.streakDays}d
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Personality Emoji */}
                      <div className="text-xl flex-shrink-0">
                        {personality.emoji}
                      </div>
                    </div>

                    {/* Project Info - Components & Activity */}
                    <div className="flex justify-between items-center text-sm text-wool-600">
                      <span>{componentInfo.text}</span>
                      <span className="text-xs">
                        {getLastActivityDisplay(project)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Footer */}
          <div className="text-center pt-6 pb-2">
            <p className="text-xs text-wool-400">Happy knitting! 🧶</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectList;