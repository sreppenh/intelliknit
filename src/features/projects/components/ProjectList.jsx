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
      const fireLevel = streakDays >= 7 ? '🔥🔥🔥' : streakDays >= 5 ? '🔥🔥' : '🔥';
      return {
        state: 'fire',
        emoji: '🔥',
        mood: `On fire! ${streakDays} day streak`,
        color: 'text-orange-600',
        category: 'active',
        streakDisplay: `${fireLevel} ${streakDays}d`
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
        mood: 'Taking a nap...',
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

  // Smart project sorting
  const getSortedProjects = () => {
    if (projects.length === 0) return [];

    return [...projects].sort((a, b) => {
      // First priority: Most recent activity
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

  // Handle navigation
  const handleBackToLanding = () => {
    if (onBack) {
      onBack();
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-md mx-auto bg-white min-h-screen shadow-lg">

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
        <div className="p-6">
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
            <div className="space-y-4">
              {getFilteredProjects().map((project, index) => {
                const isTopProject = index === 0 && getFilteredProjects().length > 1;
                const personality = getProjectPersonality(project, isTopProject);
                const streakDays = getStreakDays(project);
                const projectIcon = getProjectIcon(project.projectType);

                return (
                  <div
                    key={project.id}
                    className="card-interactive p-4 cursor-pointer hover:shadow-md transition-all duration-200"
                    onClick={() => handleProjectEdit(project)}
                  >
                    {/* Project Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{projectIcon}</span>
                        <div>
                          <h3 className="font-semibold text-wool-700 text-base">{project.name}</h3>
                          <div className="flex items-center gap-2 text-sm">
                            <span className={`font-medium ${personality.color}`}>
                              {personality.state.charAt(0).toUpperCase() + personality.state.slice(1)}
                            </span>
                            {streakDays > 0 && !project.completed && (
                              <span className="text-xs text-orange-600 font-medium">
                                🔥 {streakDays} day{streakDays > 1 ? 's' : ''}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Personality Indicator */}
                      <div className="text-right">
                        <div className="text-lg mb-1">{personality.emoji}</div>
                        <div className="text-xs text-wool-500 max-w-20 text-right">
                          {personality.mood}
                        </div>
                      </div>
                    </div>

                    {/* Project Stats */}
                    <div className="flex justify-between items-center text-sm text-wool-600">
                      <span>{project.components?.length || 0} component{(project.components?.length || 0) !== 1 ? 's' : ''}</span>
                      <span>
                        Started {formatDate(project.createdAt)}
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