import React, { useState } from 'react';
import { useProjectsContext } from '../hooks/useProjectsContext';
import PageHeader from '../../../shared/components/PageHeader';
import ContextualBar from '../../../shared/components/ContextualBar';
import IntelliKnitLogger from '../../../shared/utils/ConsoleLogging';
import { getProjectStatus as getSharedProjectStatus } from '../../../shared/utils/projectStatus';


const ProjectList = ({ onCreateProject, onOpenProject, onBack }) => {
  const { projects, dispatch } = useProjectsContext();
  const [filterState, setFilterState] = useState('all'); // Add this line


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

  // NEW: Project type icons (from existing ProjectDetail pattern)
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

  // NEW: Calculate streak days (consecutive days of any activity)
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

  // NEW: Calculate project personality state and styling
  const getProjectPersonality = (project, isTopProject = false) => {
    const totalComponents = project.components?.length || 0;
    const hasSteps = project.components?.some(comp => comp.steps?.length > 0);
    const streakDays = getStreakDays(project);

    // 1. Completed projects
    if (project.completed) {
      return {
        state: 'completed',
        emoji: '🎉',
        mood: 'Celebration time!',
        cardClass: 'card-project-completed',
        iconBg: 'icon-project-completed',
        textColor: 'text-project-completed',
        rightCorner: '🏆'
      };
    }

    // 2. Frogged projects (placeholder - not implemented yet)
    if (project.frogged) {
      return {
        state: 'frogged',
        emoji: '🐸',
        mood: 'Frogged',
        cardClass: 'card-project-frogged',
        iconBg: 'icon-project-frogged',
        textColor: 'text-project-frogged',
        rightCorner: '🐸'
      };
    }

    // 3. Fire projects (3+ day streak)
    if (streakDays >= 3) {
      const fireLevel = streakDays >= 7 ? '🔥🔥🔥' : streakDays >= 5 ? '🔥🔥' : '🔥';
      return {
        state: 'fire',
        emoji: '🔥',
        mood: `On fire! ${streakDays} day streak`,
        cardClass: 'card-project-fire',
        iconBg: 'icon-project-fire',
        textColor: 'text-project-fire',
        rightCorner: `${fireLevel} ${streakDays}d`
      };
    }

    // 4. Current project (overrides sleeping/active/empty)
    if (isTopProject) {
      return {
        state: 'current',
        emoji: '⭐',
        mood: 'Currently working',
        cardClass: 'card-project-current',
        iconBg: 'icon-project-current',
        textColor: 'text-project-current',
        rightCorner: '⭐ Current'
      };
    }

    // 5. Dormant projects (no activity for 14+ days)
    const lastActivity = new Date(project.lastActivityAt || project.createdAt);
    const daysSinceActivity = Math.floor((Date.now() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));

    if (daysSinceActivity > 14 && hasSteps) {
      return {
        state: 'dormant',
        emoji: '😴',
        mood: 'Taking a nap...',
        cardClass: 'card-project-dormant',
        iconBg: 'icon-project-dormant',
        textColor: 'text-project-dormant',
        rightCorner: `😴 ${Math.floor(daysSinceActivity)}d ago`
      };
    }

    // 6. Empty projects (no components)
    if (totalComponents === 0) {
      return {
        state: 'empty',
        emoji: '💭',
        mood: 'Ready to begin',
        cardClass: 'card-project-empty',
        iconBg: 'icon-project-empty',
        textColor: 'text-project-empty',
        rightCorner: '✨ New'
      };
    }

    // 7. Active projects (fallback)
    return {
      state: 'active',
      emoji: '🧶',
      mood: 'In progress',
      cardClass: 'card-project-active',
      iconBg: 'icon-project-active',
      textColor: 'text-project-active',
      rightCorner: '🧶 Active'
    };
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
        'Completed': 1,
        'On fire': 2,
        'In progress': 3,
        'Ready to knit': 4,
        'Planning': 5
      };

      const statusA = getSharedProjectStatus(a);
      const statusB = getSharedProjectStatus(b);

      // Extract text for comparison
      const statusTextA = statusA.text || statusA;
      const statusTextB = statusB.text || statusB;

      if (statusOrder[statusTextA] !== statusOrder[statusTextB]) {
        return statusOrder[statusTextA] - statusOrder[statusTextB];
      }

      // Final: Creation date (newest first)
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    return sorted;
  };

  // Add this entire function after getSortedProjects()
  const getFilteredProjects = () => {
    const sortedProjects = getSortedProjects();

    switch (filterState) {
      case 'active':
        return sortedProjects.filter(project => !project.completed);
      case 'done':
        return sortedProjects.filter(project => project.completed);
      case 'all':
      default:
        return sortedProjects;
    }
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

      case 'done':
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

  // NEW: Generate project count display for contextual bar
  const getProjectCountDisplay = () => {
    if (projects.length === 0) return '';

    const total = projects.length;
    const active = projects.filter(p => !p.completed).length;
    const completed = projects.filter(p => p.completed).length;

    return `${total} project${total !== 1 ? 's' : ''} • ${active} active • ${completed} completed`;
  };

  // NEW: Handle both back and cancel navigation to Landing Page
  const handleBackToLanding = () => {
    if (onBack) {
      onBack();
    }
  };

  return (
    <div className="min-h-screen bg-yarn-50">
      <div className="max-w-md mx-auto bg-yarn-50 min-h-screen shadow-lg">

        {/* Enhanced PageHeader with both back and cancel going to Landing */}
        <PageHeader
          title="My Projects"
          onBack={handleBackToLanding}
          showBackButton={true}
          showCancelButton={true}
          onCancel={handleBackToLanding}
        />

        {/* NEW: ContextualBar - Always present, adapts to content */}
        <ContextualBar>
          <ContextualBar.Left>
            <div className="bg-sage-200 border border-sage-300 rounded-md p-0.5">
              <div className="flex gap-0.5">
                <button
                  onClick={() => setFilterState('all')}
                  className={`px-2 py-1 rounded text-xs font-medium transition-all duration-200 ${filterState === 'all'
                    ? 'bg-white text-sage-700 shadow-sm'
                    : 'text-sage-600 hover:text-sage-800'
                    }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilterState('active')}
                  className={`px-2 py-1 rounded text-xs font-medium transition-all duration-200 ${filterState === 'active'
                    ? 'bg-white text-sage-700 shadow-sm'
                    : 'text-sage-600 hover:text-sage-800'
                    }`}
                >
                  Active
                </button>
                <button
                  onClick={() => setFilterState('done')}
                  className={`px-2 py-1 rounded text-xs font-medium transition-all duration-200 ${filterState === 'done'
                    ? 'bg-white text-sage-700 shadow-sm'
                    : 'text-sage-600 hover:text-sage-800'
                    }`}
                >
                  Done
                </button>
              </div>
            </div>
          </ContextualBar.Left>
          <ContextualBar.Middle>
            {/* Empty - no clutter */}
          </ContextualBar.Middle>

          <ContextualBar.Right>
            <button
              onClick={onCreateProject}
              className="bg-yarn-600 hover:bg-yarn-700 text-white text-xs px-2.5 py-1.5 rounded-lg font-medium flex items-center gap-1 transition-colors"
            >
              {/* <span className="text-xs">✨</span>*/}
              {/* <span className="hidden sm:inline">New </span>Project */}
              <span className="text-xs">✨ New </span>

            </button>
          </ContextualBar.Right>
        </ContextualBar>


        {/* Content Header */}
        <div className="p-6 pb-4 bg-yarn-50">
          <h2 className="content-header-primary">Your Knitting Projects</h2>
          <p className="content-subheader">What would you like to work on?</p>


        </div>



        <div className="p-4 bg-yarn-50">

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
              {/* UPDATED: Removed redundant header since ContextualBar now shows count */}
              <div className="stack-sm">
                {getFilteredProjects().map((project, index) => {
                  const isTopProject = index === 0 && getFilteredProjects().length > 1;
                  const status = getSharedProjectStatus(project);
                  const personality = getProjectPersonality(project, isTopProject);
                  const totalComponents = project.components?.length || 0;

                  return (
                    <div
                      key={project.id}
                      onClick={() => handleProjectEdit(project)}
                      className={`${personality.cardClass} transition-all duration-200 cursor-pointer hover:shadow-lg hover:scale-[1.01] active:scale-95 relative`}
                    >


                      <div className="flex items-start gap-4">
                        {/* Project Icon */}
                        <div className="flex-shrink-0">
                          <div className={`w-12 h-12 ${personality.iconBg} rounded-xl flex items-center justify-center text-xl border-2 shadow-sm`}>
                            {getProjectIcon(project.projectType)}
                          </div>
                        </div>

                        {/* Project Info - Simplified */}
                        <div className="flex-1 min-w-0">
                          {/* Project Name & Status Badge */}
                          <div className="flex items-start justify-between mb-2">
                            <h3 className={`font-semibold text-base ${personality.textColor} truncate flex-1 pr-2`}>
                              {project.name}
                            </h3>
                            <div className={`text-xs font-medium ${personality.textColor} opacity-75 flex-shrink-0 text-right`}>
                              {personality.rightCorner}
                            </div>
                          </div>
                          {/* Single Info Line - Components • Start Date */}
                          <div className="flex items-center gap-2 text-xs text-wool-500">
                            <span className="flex items-center gap-1">
                              <span>📐</span>
                              <span>{totalComponents} component{totalComponents !== 1 ? 's' : ''}</span>
                            </span>
                            <span>•</span>
                            <span>Started {formatDate(project.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

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