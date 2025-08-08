import React, { useState, useEffect } from 'react';
import TabContent from '../../../../../shared/components/TabContent';
import { validateKnittingTab } from '../types/TabProps';
import { getProjectStatus as getSharedProjectStatus } from '../../../../../shared/utils/projectStatus';
import { getComponentState as getUtilityComponentState } from '../../../../../shared/utils/stepDisplayUtils';

const OverviewTab = ({
    project,
    totalComponents,
    completedComponents,
    onCompleteProject,
    onEditProjectDetails,
    onManageSteps,
    onStartKnitting,
    onChangeTab,
    onProjectUpdate,
    onDeleteProject,
    onCopyProject,
    onShowEnhancedCreation
}) => {
    // Validate props in development
    if (process.env.NODE_ENV === 'development') {
        validateKnittingTab({ project, onProjectUpdate: onProjectUpdate, totalComponents, completedComponents });
    }

    // Modal states for project actions
    const [showFrogModal, setShowFrogModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    // === SMART COMPONENT FILTERING (cleaned up with utility) ===
    const getComponentStatus = (component) => {
        // Handle finishing steps (keep existing logic)
        if (component.type === 'finishing') {
            if (component.isPlaceholder || !component.steps || component.steps.length === 0) {
                return 'finishing_in_progress';
            }
            const allComplete = component.steps.every(s => s.completed);
            const manuallyConfirmed = component.finishingComplete;
            if (allComplete && manuallyConfirmed) return 'finishing_done';
            return 'finishing_in_progress';
        }

        // ✅ Use utility for regular components (replaces all the string parsing!)
        return getUtilityComponentState(component);
    };

    // 🔧 DEBUG: Log ALL components to see problematic data
    console.log('🔧 All Components Debug:', project.components?.map((comp, index) => ({
        index,
        name: comp.name,
        status: getComponentStatus(comp),
        stepCount: comp.steps?.length || 0,
        steps: comp.steps?.map((step, stepIndex) => ({
            stepIndex,
            pattern: step.wizardConfig?.stitchPattern?.pattern,
            description: step.description,
            completed: step.completed,
            startingStitches: step.startingStitches,
            endingStitches: step.endingStitches
        }))
    })));

    // Add this function in OverviewTab.jsx
    const getComponentColorClass = (status) => {
        switch (status) {
            case 'edit_mode':
                return 'color-status-edit-mode';
            case 'ready_to_knit':
                return 'color-status-ready-knit';
            case 'currently_knitting':
                return 'color-status-currently-knitting';
            case 'finishing_in_progress':
                return 'color-status-in-progress';
            case 'finished':
            case 'finished_component':
                return 'color-status-finished';
            default:
                return 'color-status-dormant';
        }
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
        console.log('🎉 Complete Project clicked, using onCompleteProject callback');
        console.log('🎉 onCompleteProject exists:', !!onCompleteProject);

        if (onCompleteProject) {
            console.log('🎉 Calling onCompleteProject...');
            onCompleteProject();
        } else {
            console.error('❌ onCompleteProject callback not provided');
            // Fallback: try direct update with completion date
            if (onProjectUpdate) {
                console.log('🎉 Fallback: using onProjectUpdate directly');
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
                alert('Error: Cannot complete project - no update callback available');
            }
        }
    };

    const handleFrogProject = () => {
        console.log('🐸 handleFrogProject called!');
        console.log('🐸 onProjectUpdate exists:', !!onProjectUpdate);
        console.log('🐸 project:', project);

        if (!onProjectUpdate) {
            console.error('❌ onProjectUpdate callback not provided');
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

        console.log('🐸 About to call onProjectUpdate with:', updatedProject);

        try {
            onProjectUpdate(updatedProject);
            console.log('✅ onProjectUpdate called successfully');
            setShowFrogModal(false);
        } catch (error) {
            console.error('❌ Error calling onProjectUpdate:', error);
            alert('Error frogging project: ' + error.message);
        }
    };

    const handleDeleteProject = () => {
        console.log('🗑️ Delete Project clicked, onDeleteProject:', !!onDeleteProject);

        if (!onDeleteProject) {
            console.error('onDeleteProject callback not provided');
            return;
        }
        onDeleteProject(project.id);
        setShowDeleteModal(false);
    };

    const handleCopyProject = () => {
        console.log('📋 Copy Project clicked');
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

    // === STATUS DISPLAY LOGIC - NEW ===
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

    // === SMART BUTTON LOGIC - NEW ===
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

    // === MODAL BEHAVIOR HOOKS (Warning Modal Pattern) ===
    useEffect(() => {
        const handleEscKey = (event) => {
            if (event.key === 'Escape') {
                if (showFrogModal) setShowFrogModal(false);
                if (showDeleteModal) setShowDeleteModal(false);
            }
        };

        if (showFrogModal || showDeleteModal) {
            document.addEventListener('keydown', handleEscKey);

            // Focus destructive action button
            setTimeout(() => {
                const exitButton = document.querySelector('[data-modal-exit]');
                if (exitButton) {
                    exitButton.focus();
                }
            }, 100);
        }

        return () => {
            document.removeEventListener('keydown', handleEscKey);
        };
    }, [showFrogModal, showDeleteModal]);

    const handleBackdropClick = (event) => {
        if (event.target === event.currentTarget) {
            if (showFrogModal) setShowFrogModal(false);
            if (showDeleteModal) setShowDeleteModal(false);
        }
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
                                    console.log('🧶 Overview: Add Component clicked');
                                    onShowEnhancedCreation();
                                }}
                                className="btn-primary w-full"
                            >
                                + Add Component
                            </button>
                            {/* FIXED: Delete button always available in empty state */}
                            <button
                                onClick={() => {
                                    console.log('🗑️ Empty state delete button clicked!');
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
                    {/* === COMPACT PROJECT HEADER (Icon next to name) === */}
                    <div className="text-center space-y-2">
                        <h1 className="text-xl font-bold text-wool-800 flex items-center justify-center gap-2">
                            <span className="text-2xl">{getProjectIcon(project.projectType)}</span>
                            {project.name}
                        </h1>
                        <p className="text-wool-600 font-medium">
                            {getProgressMessage()}
                        </p>
                    </div>

                    {/* === PROJECT STATUS BANNER - NEW === */}
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

                    {/* === ACTIVE COMPONENTS (Max 3, stronger status) === */}
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
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* === PROJECT ACTIONS - IMPROVED WITH SMART LOGIC === */}
                    <div className="space-y-4">
                        {/* Primary CTA - Mark Complete (smart logic) */}
                        {actions.showMarkComplete && (
                            <button
                                onClick={handleCompleteProject}
                                className="w-full btn-primary"
                            >
                                🎉 Mark Project Complete
                            </button>
                        )}

                        {/* Secondary Actions - Smart button visibility */}
                        <div className="space-y-2">
                            <h3 className="text-sm font-medium text-wool-600">Project Actions</h3>
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    onClick={() => {
                                        onChangeTab('details');
                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                    }}
                                    className="btn-tertiary text-sm"
                                >
                                    ⚙️ Edit Details
                                </button>
                                <button
                                    onClick={handleCopyProject}
                                    className="btn-tertiary text-sm"
                                >
                                    📋 Copy Project
                                </button>
                                {/* Smart Frog Button - only show if not already frogged */}
                                {actions.canFrog && (
                                    <button
                                        onClick={() => setShowFrogModal(true)}
                                        className="btn-tertiary text-sm"
                                    >
                                        🐸 Frog Project
                                    </button>
                                )}
                                {/* Delete Button - always available */}
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

            {/* === MODALS (Outside TabContent for proper rendering) === */}
            {showFrogModal && (
                <div className="modal-overlay" onClick={handleBackdropClick}>
                    <div className="modal-content-light">
                        <div className="modal-header-light">
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">🐸</span>
                                <div>
                                    <h2 className="text-lg font-semibold">Frog Project</h2>
                                    <p className="text-sage-600 text-sm">Reset progress and start fresh</p>
                                </div>
                                <button
                                    onClick={() => setShowFrogModal(false)}
                                    className="text-sage-600 text-xl hover:bg-sage-300 hover:bg-opacity-50 rounded-full w-8 h-8 flex items-center justify-center transition-colors ml-auto"
                                >
                                    ×
                                </button>
                            </div>
                        </div>
                        <div className="p-6 space-y-4">
                            <p className="text-wool-600">
                                Frogging will reset all progress while keeping your project structure intact.
                                You can always restart when you're ready!
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        console.log('🐸 Modal Keep Going clicked');
                                        setShowFrogModal(false);
                                    }}
                                    data-modal-cancel
                                    className="btn-tertiary flex-1"
                                >
                                    Keep Going
                                </button>
                                <button
                                    onClick={() => {
                                        console.log('🐸 Modal Frog It clicked - calling handleFrogProject');
                                        handleFrogProject();
                                    }}
                                    data-modal-exit
                                    className="btn-primary flex-1"
                                >
                                    Frog It
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showDeleteModal && (
                <div className="modal-overlay" onClick={handleBackdropClick}>
                    <div className="modal-content-light">
                        <div className="modal-header-light-danger relative flex items-center justify-center py-4 px-6 rounded-t-2xl bg-red-100">
                            <div className="text-center">
                                <div className="text-2xl mb-2">🗑️</div>
                                <h2 className="text-lg font-semibold">Delete Project Forever?</h2>
                                <p className="text-red-600 text-sm">{project.name}</p>
                            </div>
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="absolute right-3 text-red-600 text-2xl hover:bg-red-200 hover:bg-opacity-50 rounded-full w-8 h-8 flex items-center justify-center transition-colors"
                                aria-label="Close Delete Project modal"
                            >
                                ×
                            </button>
                        </div>

                        <div className="p-6">
                            <div className="text-center mb-6">
                                <p className="text-red-600 mb-2 font-medium">
                                    This will permanently delete your project.
                                </p>
                                <p className="text-wool-500 text-sm">
                                    All components, steps, and progress will be lost forever. This action cannot be undone.
                                </p>
                            </div>

                            <div className="stack-sm">
                                <button
                                    onClick={handleDeleteProject}
                                    data-modal-exit
                                    className="w-full btn-secondary bg-red-600 hover:bg-red-700 text-white flex items-center justify-center gap-2"
                                >
                                    <span className="text-lg">🗑️</span>
                                    Yes, Delete Forever
                                </button>

                                <button
                                    onClick={() => setShowDeleteModal(false)}
                                    data-modal-cancel
                                    className="w-full btn-tertiary"
                                >
                                    Keep Project
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

// === OVERVIEW COMPONENT CARD (Stronger status indicators) ===
const OverviewComponentCard = ({ component, status, onClick }) => {
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
    const completedSteps = component.steps?.filter(s => s.completed).length || 0;

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