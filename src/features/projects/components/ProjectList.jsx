import React, { useState } from 'react';
import { useProjectsContext } from '../hooks/useProjectsContext';
import PageHeader from '../../../shared/components/PageHeader';
import IntelliKnitLogger from '../../../shared/utils/ConsoleLogging';
import { getProjectStatus as getSharedProjectStatus } from '../../../shared/utils/projectStatus';
import { getUnifiedProjectStatus, runStatusTests, testCompatibility } from '../../../shared/utils/unifiedProjectStatus';


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

  // NEW: Use unified status system
  const getProjectPersonality = (project) => {
    const unified = getUnifiedProjectStatus(project);

    // Map unified status to our card border colors
    const getBorderColor = (status, category) => {
      switch (status) {
        case 'Completed': return 'border-sage-400';
        case 'Frogged': return 'border-blue-400';
        case 'Currently Knitting': return unified.streak >= 3 ? 'border-orange-400' : 'border-yarn-400';
        case 'Ready to Knit': return 'border-lavender-400';
        case 'Planning': return 'border-wool-400';
        default: return 'border-wool-200';
      }
    };

    return {
      ...unified,
      borderColor: getBorderColor(unified.status, unified.category)
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

  // Filter projects by unified status category
  const getFilteredProjects = () => {
    const sortedProjects = getSortedProjects();

    if (filterState === 'all') return sortedProjects;

    return sortedProjects.filter(project => {
      const personality = getProjectPersonality(project);

      if (filterState === 'completed') {
        return personality.status === 'Completed';
      }

      if (filterState === 'planning') {
        return personality.category === 'planning'; // Includes Planning + Dormant
      }

      if (filterState === 'active') {
        return personality.category === 'active'; // Currently Knitting + Ready to Knit
      }

      return true;
    });
  };

  // Enhanced component info with creation date context
  const getComponentInfo = (project) => {
    const totalComponents = project.components?.length || 0;
    const creationDate = new Date(project.createdAt).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });

    let componentText;
    if (totalComponents === 0) {
      componentText = 'No components yet';
    } else {
      const completedComponents = project.components.filter(comp =>
        comp.steps?.length > 0 && comp.steps.every(step => step.completed)
      ).length;
      componentText = `${completedComponents} of ${totalComponents} components completed`;
    }

    return {
      total: totalComponents,
      completed: totalComponents > 0 ? project.components.filter(comp =>
        comp.steps?.length > 0 && comp.steps.every(step => step.completed)
      ).length : 0,
      text: `${componentText} • Created ${creationDate}`
    };
  };

  // Enhanced status text with integrated date context
  const getStatusWithDate = (project, personality) => {
    switch (personality.status) {
      case 'Completed':
        const completedDate = project.completedAt
          ? new Date(project.completedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
          : '';
        return completedDate ? `🎉 Completed ${completedDate}` : '🎉 Completed';

      case 'Frogged':
        const froggedDate = project.froggedAt
          ? new Date(project.froggedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
          : '';
        return froggedDate ? `🐸 Frogged ${froggedDate}` : '🐸 Frogged';

      case 'Currently Knitting':
        if (personality.streak >= 3) {
          return `🔥 Currently Knitting - ${personality.streak} day streak`;
        } else if (personality.isDormant) {
          const daysSince = Math.floor((Date.now() - new Date(project.lastActivityAt || project.createdAt).getTime()) / (1000 * 60 * 60 * 24));
          return `😴 Last knit ${daysSince} days ago`;
        } else if (personality.streak > 0) {
          return `🔥 Currently Knitting - ${personality.streak} day${personality.streak > 1 ? 's' : ''}`;
        }
        return '🧶 Currently Knitting';

      case 'Ready to Knit':
        return '🚀 Ready to Knit';

      case 'Planning':
        return '💭 Planning';

      default:
        return `${personality.emoji} ${personality.status}`;
    }
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

  // 🧪 TESTING FUNCTIONS - Call these in browser console to verify
  React.useEffect(() => {
    // Make test functions available globally for easy console testing
    window.IntelliKnitTests = {
      runStatusTests,
      testCompatibility: () => testCompatibility(projects),
      testProject: (projectIndex) => {
        const project = projects[projectIndex];
        if (project) {
          const old = getSharedProjectStatus(project);
          const new_ = getUnifiedProjectStatus(project);
          console.log('OLD:', old);
          console.log('NEW:', new_);
          return { old, new: new_ };
        }
        console.log('Project not found at index', projectIndex);
      }
    };

    // Auto-run basic tests on load (only in development)
    if (process.env.NODE_ENV === 'development') {
      console.log('🧪 Auto-running status tests...');
      runStatusTests();
      if (projects.length > 0) {
        testCompatibility(projects);
      }
    }
  }, [projects]);

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
              className="btn-secondary btn-sm"
            >
              Add New Project
            </button>
          </div>
        </div>

        {/* Subtle text link filters with fixed underlines */}
        <div className="px-6 py-3 bg-white border-b border-wool-100">
          <div className="flex items-center gap-6">
            <span className="text-sm text-wool-500">Show:</span>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setFilterState('all')}
                className={`relative text-sm font-medium transition-colors pb-1 ${filterState === 'all'
                  ? 'text-sage-600'
                  : 'text-wool-600 hover:text-sage-600'
                  }`}
              >
                All
                {filterState === 'all' && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-sage-500"></span>
                )}
              </button>
              <button
                onClick={() => setFilterState('active')}
                className={`relative text-sm font-medium transition-colors pb-1 ${filterState === 'active'
                  ? 'text-sage-600'
                  : 'text-wool-600 hover:text-sage-600'
                  }`}
              >
                Active
                {filterState === 'active' && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-sage-500"></span>
                )}
              </button>
              <button
                onClick={() => setFilterState('planning')}
                className={`relative text-sm font-medium transition-colors pb-1 ${filterState === 'planning'
                  ? 'text-sage-600'
                  : 'text-wool-600 hover:text-sage-600'
                  }`}
              >
                Planning
                {filterState === 'planning' && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-sage-500"></span>
                )}
              </button>
              <button
                onClick={() => setFilterState('completed')}
                className={`relative text-sm font-medium transition-colors pb-1 ${filterState === 'completed'
                  ? 'text-sage-600'
                  : 'text-wool-600 hover:text-sage-600'
                  }`}
              >
                Completed
                {filterState === 'completed' && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-sage-500"></span>
                )}
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
            /* Beautiful new card layout with integrated status */
            <div className="space-y-3">
              {getFilteredProjects().map((project, index) => {
                const personality = getProjectPersonality(project);
                const componentInfo = getComponentInfo(project);
                const projectIcon = getProjectIcon(project.projectType);
                const statusText = getStatusWithDate(project, personality);

                // Enhanced hover that coordinates with status color
                const getHoverClass = (borderColor) => {
                  const colorMap = {
                    'border-orange-400': 'hover:border-orange-500 hover:bg-orange-25',
                    'border-yarn-400': 'hover:border-yarn-500 hover:bg-yarn-25',
                    'border-lavender-400': 'hover:border-lavender-500 hover:bg-lavender-25',
                    'border-wool-400': 'hover:border-wool-500 hover:bg-wool-50',
                    'border-sage-400': 'hover:border-sage-500 hover:bg-sage-25',
                    'border-blue-400': 'hover:border-blue-500 hover:bg-blue-25'
                  };
                  return `${colorMap[borderColor] || 'hover:border-sage-400 hover:bg-wool-50'} hover:shadow-md`;
                };

                return (
                  <div
                    key={project.id}
                    className={`bg-white rounded-xl p-4 shadow-sm border-2 ${personality.borderColor} ${getHoverClass(personality.borderColor)} cursor-pointer transition-all duration-200`}
                    onClick={() => handleProjectEdit(project)}
                  >
                    {/* First Line: Icon + Name + Big Status Icon */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <span className="text-2xl flex-shrink-0">{projectIcon}</span>
                        <h3 className="font-semibold text-wool-700 text-base truncate">
                          {project.name}
                        </h3>
                      </div>

                      {/* Big Status Icon */}
                      <div className="text-2xl flex-shrink-0">
                        {personality.emoji}
                      </div>
                    </div>

                    {/* Second Line: Full Status with Date Context */}
                    <div className="mb-2">
                      <span className={`text-sm font-medium ${personality.color}`}>
                        {statusText}
                      </span>
                    </div>

                    {/* Third Line: Component Progress */}
                    <div className="text-sm text-wool-600">
                      {componentInfo.text}
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