import React, { useState } from 'react';
import { useProjectsContext } from '../hooks/useProjectsContext';
import PageHeader from '../../../shared/components/PageHeader';
import ContextualBar from '../../../shared/components/ContextualBar';
import IntelliKnitLogger from '../../../shared/utils/ConsoleLogging';

const ProjectList = ({ onCreateProject, onOpenProject, onBack }) => {
  const { projects, dispatch } = useProjectsContext();

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

    // Completed projects
    if (project.completed) {
      return {
        state: 'completed',
        emoji: '🎉',
        mood: 'Celebration time!',
        cardClass: 'bg-gradient-to-r from-sage-50 to-yarn-50 border-sage-300 border-2 rounded-xl p-5 shadow-lg',
        iconBg: 'bg-sage-200 border-sage-300',
        textColor: 'text-sage-700',
        rightCorner: '🏆'
      };
    }

    // 2. Frogged projects (placeholder - not implemented yet)
    if (project.frogged) {
      return {
        state: 'frogged',
        emoji: '🐸',
        mood: 'Frogged',
        cardClass: 'bg-wool-50 border-wool-300 border-2 rounded-xl p-5 shadow-sm',
        iconBg: 'bg-wool-100 border-wool-200',
        textColor: 'text-wool-600',
        rightCorner: '🐸'
      };
    }


    // Fire projects (3+ day streak)
    if (streakDays >= 3) {
      const fireLevel = streakDays >= 7 ? '🔥🔥🔥' : streakDays >= 5 ? '🔥🔥' : '🔥';
      return {
        state: 'fire',
        emoji: '🔥',
        mood: `On fire! ${streakDays} day streak`,
        cardClass: 'bg-gradient-to-r from-orange-50 to-red-50 border-orange-300 border-2 rounded-xl p-5 shadow-lg',
        iconBg: 'bg-orange-200 border-orange-300',
        textColor: 'text-orange-700',
        rightCorner: `${fireLevel} ${streakDays}d`
      };
    }

    // 4. Current project (overrides sleeping/active/empty)
    if (isTopProject) {
      return {
        state: 'current',
        emoji: '⭐',
        mood: 'Currently working',
        cardClass: 'bg-gradient-to-br from-sage-50 to-yarn-50 border-sage-300 shadow-lg transform scale-[1.02] border-2 rounded-xl p-5',
        iconBg: 'bg-sage-200 border-sage-300',
        textColor: 'text-sage-700',
        rightCorner: '⭐ Current'
      };
    }


    // Dormant projects (no activity for 14+ days)
    const lastActivity = new Date(project.lastActivityAt || project.createdAt);
    const daysSinceActivity = Math.floor((Date.now() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));

    if (daysSinceActivity > 14 && hasSteps) {
      return {
        state: 'dormant',
        emoji: '😴',
        mood: 'Taking a nap...',
        cardClass: 'bg-wool-50 border-wool-300 border-2 rounded-xl p-5 shadow-sm opacity-90',
        iconBg: 'bg-wool-100 border-wool-200',
        textColor: 'text-wool-600',
        rightCorner: `😴 ${Math.floor(daysSinceActivity)}d ago`
      };
    }



    // Empty projects (no components)
    if (totalComponents === 0) {
      return {
        state: 'empty',
        emoji: '💭',
        mood: 'Ready to begin',
        cardClass: 'bg-lavender-50 border-lavender-200 border-2 rounded-xl p-5 shadow-sm',
        iconBg: 'bg-lavender-100 border-lavender-200',
        textColor: 'text-lavender-700',
        rightCorner: '✨ New'
      };
    }

    // Active projects
    const completedComponents = project.components?.filter(comp =>
      comp.steps?.length > 0 && comp.steps.every(step => step.completed)
    ).length || 0;

    return {
      state: 'active',
      emoji: '🧶',
      mood: isTopProject ? 'Currently working' : 'In progress',
      cardClass: isTopProject
        ? 'bg-gradient-to-br from-sage-50 to-yarn-50 border-sage-300 shadow-lg transform scale-[1.02] border-2 rounded-xl p-5'
        : 'bg-white border-wool-200 border-2 rounded-xl p-5 shadow-sm',
      iconBg: isTopProject ? 'bg-sage-200 border-sage-300' : 'bg-yarn-100 border-yarn-200',
      textColor: isTopProject ? 'text-sage-700' : 'text-wool-700',
      rightCorner: '🧶 Active'
    };
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
              <div className="flex gap-1">
                <button className="px-3 py-1 rounded text-xs font-medium transition-all duration-200 bg-white text-sage-700 shadow-sm">
                  All
                </button>
                <button className="px-3 py-1 rounded text-xs font-medium transition-all duration-200 text-sage-600 hover:text-sage-800">
                  In Progress
                </button>
                <button className="px-3 py-1 rounded text-xs font-medium transition-all duration-200 text-sage-600 hover:text-sage-800">
                  Finished
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
              className="btn-secondary btn-sm flex items-center gap-1.5"
            >
              <span className="text-sm">✨</span>
              New Project
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
          {projects.length === 0 ? (
            <div className="text-center py-4">
              <div className="bg-white rounded-2xl p-6 shadow-sm border-2 border-wool-200 mb-4">
                <div className="text-4xl mb-3">🏠</div>
                <h2 className="text-xl font-bold text-wool-700 mb-2">Welcome to Your Craft Room!</h2>
                <p className="content-subheader leading-relaxed text-sm">
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
              {/* UPDATED: Removed redundant header since ContextualBar now shows count */}
              <div className="stack-sm">
                {getSortedProjects().map((project, index) => {
                  const isTopProject = index === 0 && projects.length > 1;
                  const status = getProjectStatus(project);
                  const personality = getProjectPersonality(project, isTopProject);
                  const totalComponents = project.components?.length || 0;

                  return (
                    <div
                      key={project.id}
                      onClick={() => handleProjectEdit(project)}
                      className={`${personality.cardClass} transition-all duration-200 cursor-pointer active:scale-95 relative`}
                    >


                      <div className="flex items-start gap-4">
                        {/* Project Icon */}
                        <div className="flex-shrink-0">
                          <div className={`w-14 h-14 ${personality.iconBg} rounded-xl flex items-center justify-center text-2xl border-2 shadow-sm`}>
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