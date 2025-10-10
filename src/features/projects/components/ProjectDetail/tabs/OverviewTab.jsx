import React, { useState } from 'react';
import TabContent from '../../../../../shared/components/TabContent';
import { validateOverviewTab, extractOverviewTabProps } from '../types/TabProps';
import { getProjectStatus as getSharedProjectStatus } from '../../../../../shared/utils/projectStatus';
import IntelliKnitLogger from '../../../../../shared/utils/ConsoleLogging';
import { getComponentState as getComponentStatusWithDisplay } from '../../../../../shared/utils/stepDisplayUtils';
import StandardModal from '../../../../../shared/components/modals/StandardModal';
import { getStepProgressState, PROGRESS_STATUS } from '../../../../../shared/utils/progressTracking';
import { migrateOldCompletionFlags } from '../../../../../shared/utils/progressTracking';

const OverviewTab = (props) => {
    // Validate props in development
    if (process.env.NODE_ENV === 'development') {
        validateOverviewTab(props);
    }

    // Extract standardized props
    const {
        project,
        onProjectUpdate,
        // Overview-specific props
        totalComponents,
        completedComponents,
        onCompleteProject,
        onManageSteps,
        onStartKnitting,
        onChangeTab,
        onDeleteProject,
        onShowEnhancedCreation
    } = extractOverviewTabProps(props);

    // ✅ ADD THIS - Migrate old completion flags on mount
    React.useEffect(() => {
        if (project?.components) {
            project.components.forEach(component => {
                const progressKey = `knitting-progress-${project.id}-${component.id}`;
                const hasNewProgress = localStorage.getItem(progressKey);

                // If no new progress exists, migrate old completed flags
                if (!hasNewProgress && component.steps?.length > 0) {
                    migrateOldCompletionFlags(component, project.id);
                }
            });
        }
    }, [project?.id]); // Run once when project loads

    // Modal states for project actions
    const [showFrogModal, setShowFrogModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    // === SMART COMPONENT FILTERING (cleaned up with utility) ===
    const getComponentStatus = (component) => {
        const result = getComponentStatusWithDisplay(component, project.id); // ✅ Pass projectId!
        return result.status;
    };

    // Smart filtering for Overview - only show actionable components (limit to 3)
    const getOverviewComponents = () => {
        if (!project.components) return [];

        return project.components
            .filter(component => {
                const status = getComponentStatus(component);
                // Only show components that need action - hide finished
                return ['currently_knitting', 'ready_to_knit', 'edit_mode', 'finishing_in_progress'].includes(status);
            })
            .sort((a, b) => {
                // Priority sorting: Currently Knitting > Ready to Knit > Edit Mode
                const getPriority = (component) => {
                    const status = getComponentStatus(component);
                    switch (status) {
                        case 'currently_knitting': return 1;
                        case 'ready_to_knit': return 2;
                        case 'finishing_in_progress': return 3;
                        case 'edit_mode': return 4;
                        default: return 5;
                    }
                };
                return getPriority(a) - getPriority(b);
            })
            .slice(0, 3); // Max 3 for focused experience
    };

    const overviewComponents = getOverviewComponents();

    // === PROJECT ACTIONS - FIXED AND IMPROVED ===
    const handleCompleteProject = () => {
        IntelliKnitLogger.success('Complete Project clicked');

        if (onCompleteProject) {
            IntelliKnitLogger.debug('Overview', 'Calling onCompleteProject callback');
            onCompleteProject();
        } else {
            IntelliKnitLogger.warn('onCompleteProject callback not provided, using fallback');
            // Fallback: try direct update with completion date
            if (onProjectUpdate) {
                const today = new Date().toISOString().split('T')[0];
                const updatedProject = {
                    ...project,
                    completed: true,
                    frogged: false,
                    completedAt: today,
                    froggedAt: '',
                    progress: 100
                };
                onProjectUpdate(updatedProject);
            } else {
                IntelliKnitLogger.error('No update callback available for project completion');
                alert('Error: Cannot complete project - no update callback available');
            }
        }
    };

    const handleFrogProject = () => {
        IntelliKnitLogger.debug('Overview', 'Frog project initiated');

        if (!onProjectUpdate) {
            IntelliKnitLogger.error('onProjectUpdate callback not provided');
            alert('Error: Cannot frog project - update callback missing');
            return;
        }

        const today = new Date().toISOString().split('T')[0];
        const updatedProject = {
            ...project,
            frogged: true,
            completed: false,
            froggedAt: today,
            completedAt: '',
            progress: 0
        };

        try {
            onProjectUpdate(updatedProject);
            IntelliKnitLogger.success('Project frogged successfully');
            setShowFrogModal(false);
        } catch (error) {
            IntelliKnitLogger.error('Error frogging project', error);
            alert('Error frogging project: ' + error.message);
        }
    };

    const handleDeleteProject = () => {
        IntelliKnitLogger.debug('Overview', 'Delete project initiated');

        if (!onDeleteProject) {
            IntelliKnitLogger.error('onDeleteProject callback not provided');
            return;
        }
        onDeleteProject(project.id);
        setShowDeleteModal(false);
    };

    const handleCopyProject = () => {
        IntelliKnitLogger.debug('Overview', 'Copy project clicked');
        alert('📋 Copy Project feature coming soon! This will create a new project with reset progress.');
    };

    // === COMPONENT ACTION HANDLERS ===
    const handleComponentClick = (component) => {
        const status = getComponentStatus(component);

        switch (status) {
            case 'currently_knitting':
            case 'ready_to_knit':
                // Go to knitting mode
                const componentIndex = project.components.findIndex(c => c.id === component.id);
                onStartKnitting && onStartKnitting(componentIndex);
                break;
            case 'edit_mode':
            case 'finishing_in_progress':
                // Go to manage steps
                onManageSteps && onManageSteps(component.id);
                break;
            default:
                // Fallback to manage steps
                onManageSteps && onManageSteps(component.id);
        }
    };

    // === HELPER FUNCTIONS ===
    const formatRelativeDate = (dateString) => {
        if (!dateString) return 'Unknown';
        const date = new Date(dateString);
        const now = new Date();
        const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

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

    // === STATUS DISPLAY LOGIC ===
    const getProjectStatusDisplay = () => {
        const sharedStatus = getSharedProjectStatus(project);

        // Convert shared status to display format
        return {
            show: true,
            emoji: sharedStatus.emoji,
            message: sharedStatus.text,
            bgColor: 'bg-sage-100 border-sage-300',
            textColor: 'text-sage-700'
        };
    };

    const projectStatus = getProjectStatusDisplay();

    // === SMART BUTTON LOGIC ===
    const getAvailableActions = () => {
        return {
            canComplete: !project.completed, // Can complete if not already completed
            canFrog: !project.frogged,       // Can frog if not already frogged
            canDelete: true,                 // Can always delete
            showMarkComplete: !project.completed && (completedComponents > 0 || overviewComponents.some(c => getComponentStatus(c) === 'currently_knitting'))
        };
    };

    const actions = getAvailableActions();

    // === CELEBRATION LOGIC (Fixed to use activityLog) ===
    const getStreakMessage = () => {
        if (!project.activityLog || project.activityLog.length === 0) return null;

        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

        // Calculate streak days (consecutive days)
        let streak = 0;
        const msPerDay = 24 * 60 * 60 * 1000;

        for (let i = 0; i < 30; i++) {
            const checkDate = new Date(Date.now() - (i * msPerDay));
            const dayString = checkDate.toISOString().split('T')[0];

            if (project.activityLog.includes(dayString)) {
                streak = i + 1;
            } else if (i === 0) {
                continue; // Allow for today being empty
            } else {
                break; // Streak broken
            }
        }

        if (streak >= 3) {
            return `🔥 On Fire! ${streak} day streak`;
        } else if (project.activityLog.includes(today)) {
            return "🔥 On Fire! Worked today";
        } else if (project.activityLog.includes(yesterday)) {
            return "⚡ Keep the momentum going!";
        }
        return null;
    };

    const streakMessage = getStreakMessage();

    // === SIMPLE COMPONENT PROGRESS DISPLAY ===
    const getProgressMessage = () => {
        if (totalComponents === 0) {
            return "Ready to add your first component";
        }
        return `${completedComponents}/${totalComponents} components complete`;
    };

    // === RENDER ===
    return (
        <>
            <TabContent
                showEmptyState={overviewComponents.length === 0 && (!project.components || project.components.length === 0)}
                emptyState={
                    <div>
                        <div className="text-4xl mb-3">✨</div>
                        <h3 className="font-semibold text-wool-700 mb-2">Ready to Begin</h3>
                        <p className="text-wool-500 text-sm mb-4">Add your first component to start building your project</p>
                        <div className="space-y-3">
                            <button
                                onClick={() => {
                                    IntelliKnitLogger.debug('Overview', 'Add Component clicked from empty state');
                                    onShowEnhancedCreation();
                                }}
                                className="btn-primary w-full"
                            >
                                + Add Component
                            </button>
                            <button
                                onClick={() => {
                                    IntelliKnitLogger.debug('Overview', 'Delete button clicked from empty state');
                                    setShowDeleteModal(true);
                                }}
                                className="btn-tertiary w-full text-sm"
                            >
                                🗑️ Delete Project
                            </button>
                        </div>
                    </div>
                }
            >
                <div className="p-6 space-y-6">
                    {/* === COMPACT PROJECT HEADER === */}
                    <div className="text-center space-y-2">
                        <h1 className="text-xl font-bold text-wool-800 flex items-center justify-center gap-2">
                            <span className="text-2xl">{getProjectIcon(project.projectType)}</span>
                            {project.name}
                        </h1>
                        <p className="text-wool-600 font-medium">
                            {getProgressMessage()}
                        </p>
                    </div>

                    {/* === PROJECT STATUS BANNER === */}
                    {projectStatus.show && (
                        <div className={`rounded-2xl border-2 p-4 ${projectStatus.bgColor}`}>
                            <div className="text-center">
                                <div className={`text-lg font-semibold ${projectStatus.textColor} flex items-center justify-center gap-2`}>
                                    <span className="text-xl">{projectStatus.emoji}</span>
                                    {projectStatus.message}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* === CELEBRATION BANNER === */}
                    {!projectStatus.show && (
                        <div className="bg-white rounded-2xl border-2 border-sage-200 p-3">
                            <div className="text-center">
                                {streakMessage ? (
                                    <div className="text-lg font-semibold text-sage-600">{streakMessage}</div>
                                ) : (
                                    <div className="text-base text-wool-600">
                                        Last worked: {formatRelativeDate(project.lastActivityAt || project.createdAt)}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* === ACTIVE COMPONENTS === */}
                    {overviewComponents.length > 0 && (
                        <div className="space-y-3">
                            <h2 className="text-base font-semibold text-wool-700">Up Next</h2>
                            <div className="space-y-3">
                                {overviewComponents.map((component) => (
                                    <OverviewComponentCard
                                        key={component.id}
                                        component={component}
                                        status={getComponentStatus(component)}
                                        onClick={() => handleComponentClick(component)}
                                        projectId={project.id}  // ✅ ADD THIS
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* === PROJECT ACTIONS === */}
                    <div className="space-y-4">
                        {/* Primary CTA - Mark Complete */}
                        {actions.showMarkComplete && (
                            <button
                                onClick={handleCompleteProject}
                                className="w-full btn-primary"
                            >
                                🎉 Mark Project Complete
                            </button>
                        )}

                        {/* Secondary Actions */}
                        <div className="space-y-2">
                            <h3 className="text-sm font-medium text-wool-600">Project Actions</h3>
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    onClick={() => {
                                        onChangeTab('details');
                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                    }}
                                    className="btn-tertiary"
                                >
                                    ⚙️ Edit Details
                                </button>
                                <button
                                    onClick={handleCopyProject}
                                    className="btn-tertiary"
                                >
                                    📋 Copy Project
                                </button>
                                {actions.canFrog && (
                                    <button
                                        onClick={() => setShowFrogModal(true)}
                                        className="btn-tertiary text-sm"
                                    >
                                        🐸 Frog Project
                                    </button>
                                )}
                                <button
                                    onClick={() => setShowDeleteModal(true)}
                                    className="btn-tertiary text-sm"
                                >
                                    🗑️ Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </TabContent>

            {/* === STANDARDIZED MODALS === */}
            <StandardModal
                isOpen={showFrogModal}
                onClose={() => setShowFrogModal(false)}
                onConfirm={handleFrogProject}
                category="warning"
                colorScheme="sage"
                title="Frog Project"
                subtitle="Reset progress and start fresh"
                icon="🐸"
                primaryButtonText="Frog It"
                secondaryButtonText="Keep Going"
            >
                <div className="text-center">
                    <p className="text-wool-600">
                        Frogging will reset all progress while keeping your project structure intact.
                        You can always restart when you're ready!
                    </p>
                </div>
            </StandardModal>

            <StandardModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleDeleteProject}
                category="warning"
                colorScheme="red"
                title="Delete Project Forever?"
                subtitle={project.name}
                icon="🗑️"
                primaryButtonText="Yes, Delete Forever"
                secondaryButtonText="Keep Project"
            >
                <div className="text-center">
                    <p className="text-red-600 mb-2 font-medium">
                        This will permanently delete your project.
                    </p>
                    <p className="text-wool-500 text-sm">
                        All components, steps, and progress will be lost forever. This action cannot be undone.
                    </p>
                </div>
            </StandardModal>
        </>
    );
};

// === OVERVIEW COMPONENT CARD ===
const OverviewComponentCard = ({ component, status, onClick, projectId }) => {
    const getStatusConfig = () => {
        switch (status) {
            case 'currently_knitting':
                return {
                    colorClass: 'card-component-progress',
                    icon: '🧶',
                    label: 'Continue Knitting'
                };
            case 'ready_to_knit':
                return {
                    colorClass: 'card-component-ready',
                    icon: '🎯',
                    label: 'Start Knitting'
                };
            case 'finishing_in_progress':
                return {
                    colorClass: 'card-component-finishing',
                    icon: '🪡',
                    label: 'Continue Finishing'
                };
            case 'edit_mode':
            default:
                return {
                    colorClass: 'card-component',
                    icon: '✏️',
                    label: 'Add Steps'
                };
        }
    };

    const config = getStatusConfig();
    const stepCount = component.steps?.length || 0;

    const completedSteps = component.steps?.filter(step => {
        const progress = getStepProgressState(step.id, component.id, projectId);
        return progress.status === PROGRESS_STATUS.COMPLETED;
    }).length || 0;

    // ✅ DEBUG - Compare counts
    console.log('Component:', component.name);
    console.log('New system count:', completedSteps);
    console.log('Old system count:', component.steps?.filter(s => s.completed).length);

    return (
        <button
            onClick={onClick}
            className={`w-full ${config.colorClass} rounded-xl border-2 p-4 transition-all duration-200 cursor-pointer hover:shadow-md hover:transform hover:scale-[1.02] active:scale-95`}
        >
            <div className="flex items-center gap-4">
                <span className="text-2xl flex-shrink-0">{config.icon}</span>
                <div className="flex-1 min-w-0 text-left">
                    <h3 className={`font-semibold ${config.textColor} text-base text-left`}>
                        {component.name}
                    </h3>
                    <div className="flex items-center gap-3 mt-1">
                        <span className={`text-sm ${config.textColor}`}>
                            {config.label}
                        </span>
                        {stepCount > 0 && (
                            <span className={`text-xs ${config.textColor} opacity-60`}>
                                {status === 'currently_knitting'
                                    ? `${completedSteps}/${stepCount} steps`
                                    : `${stepCount} steps`
                                }
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </button>
    );
};

export default OverviewTab;