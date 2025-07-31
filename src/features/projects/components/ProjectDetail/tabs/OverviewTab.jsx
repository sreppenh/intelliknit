import React, { useState } from 'react';
import TabContent from '../../../../../shared/components/TabContent';
import { validateKnittingTab } from '../types/TabProps';

const OverviewTab = ({
    project,
    totalComponents,
    completedComponents,
    onCompleteProject,
    onEditProjectDetails,
    onManageSteps,
    onStartKnitting,
    onChangeTab,
    onProjectUpdate
}) => {
    // Validate props in development
    if (process.env.NODE_ENV === 'development') {
        validateKnittingTab({ project, onProjectUpdate: onProjectUpdate, totalComponents, completedComponents });
    }

    // Modal states for project actions
    const [showFrogModal, setShowFrogModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    // === SMART COMPONENT FILTERING (Reusing ComponentsTab logic) ===
    const getComponentStatus = (component) => {
        if (component.type === 'finishing') {
            if (component.isPlaceholder || !component.steps || component.steps.length === 0) {
                return 'finishing_in_progress';
            }
            const allComplete = component.steps.every(s => s.completed);
            const manuallyConfirmed = component.finishingComplete;
            if (allComplete && manuallyConfirmed) return 'finishing_done';
            return 'finishing_in_progress';
        }

        if (!component.steps || component.steps.length === 0) return 'edit_mode';

        const hasCastOn = component.steps.some(step =>
            step.wizardConfig?.stitchPattern?.pattern === 'Cast On' ||
            step.description?.toLowerCase().includes('cast on')
        );

        const hasBindOff = component.steps.some(step =>
            step.wizardConfig?.stitchPattern?.pattern === 'Bind Off' ||
            step.description?.toLowerCase().includes('bind off')
        );

        const hasProgress = component.steps.some(s => s.completed);
        const allStepsComplete = component.steps.length > 0 && component.steps.every(s => s.completed);

        if (hasBindOff && allStepsComplete) return 'finished';
        if (hasCastOn && hasProgress) return 'currently_knitting';
        if (hasCastOn && hasBindOff && !hasProgress) return 'ready_to_knit';
        return 'edit_mode';
    };

    // Smart filtering for Overview - only show actionable components
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
            .slice(0, 4); // Max 4 for focused experience
    };

    const overviewComponents = getOverviewComponents();

    // === PROJECT ACTIONS (Reusing existing patterns) ===
    const handleFrogProject = () => {
        const today = new Date().toISOString().split('T')[0];
        const updatedProject = {
            ...project,
            frogged: true,
            completed: false,
            froggedAt: today,
            completedAt: '',
            progress: 0
        };
        onProjectUpdate && onProjectUpdate(updatedProject);
        setShowFrogModal(false);
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

    // === RENDER ===
    return (
        <TabContent
            showEmptyState={overviewComponents.length === 0}
            emptyState={
                <div>
                    <div className="text-4xl mb-3">✨</div>
                    <h3 className="font-semibold text-wool-700 mb-2">Ready to Begin</h3>
                    <p className="text-wool-500 text-sm mb-4">Add your first component to start knitting</p>
                    <button
                        onClick={() => onChangeTab('components')}
                        className="btn-primary"
                    >
                        Add Component
                    </button>
                </div>
            }
        >
            <div className="p-6 space-y-8">
                {/* === PROJECT HEADER - Spacious and welcoming === */}
                <div className="text-center space-y-3">
                    <div className="text-4xl mb-2">{getProjectIcon(project.projectType)}</div>
                    <h1 className="text-2xl font-bold text-wool-800">{project.name}</h1>
                    {project.size && (
                        <p className="text-wool-500 text-lg">Size: {project.size}</p>
                    )}
                </div>

                {/* === PROJECT STATS - Clean celebration === */}
                <div className="bg-white rounded-2xl border-2 border-sage-200 p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-center">
                        <div>
                            <div className="text-2xl font-bold text-sage-600">{completedComponents}</div>
                            <div className="text-sm text-wool-500">Components Done</div>
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-yarn-600">{totalComponents}</div>
                            <div className="text-sm text-wool-500">Total Components</div>
                        </div>
                    </div>

                    {/* Activity Streak (if exists) */}
                    {project.lastActivityDate && (
                        <div className="text-center pt-2 border-t border-sage-100">
                            <div className="text-sm text-sage-600">
                                Last worked: {formatRelativeDate(project.lastActivityDate)}
                            </div>
                        </div>
                    )}
                </div>

                {/* === ACTIVE COMPONENTS - Open and breathable === */}
                {overviewComponents.length > 0 && (
                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold text-wool-700 text-left">Up Next</h2>
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

                {/* === PROJECT ACTIONS - Clean cards instead of big buttons === */}
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold text-wool-700 text-left">Project Actions</h2>
                    <div className="space-y-3">
                        <button
                            onClick={onEditProjectDetails}
                            className="w-full card-clickable text-left"
                        >
                            <div className="flex items-center gap-3">
                                <span className="text-xl">⚙️</span>
                                <div>
                                    <div className="font-medium text-wool-700">Edit Project Details</div>
                                    <div className="text-sm text-wool-500">Update yarns, needles, and notes</div>
                                </div>
                            </div>
                        </button>

                        <button
                            onClick={onCompleteProject}
                            className="w-full card-clickable text-left"
                        >
                            <div className="flex items-center gap-3">
                                <span className="text-xl">🎉</span>
                                <div>
                                    <div className="font-medium text-wool-700">Mark Project Complete</div>
                                    <div className="text-sm text-wool-500">Celebrate your finished work!</div>
                                </div>
                            </div>
                        </button>

                        <button
                            onClick={() => setShowFrogModal(true)}
                            className="w-full card-clickable text-left"
                        >
                            <div className="flex items-center gap-3">
                                <span className="text-xl">🐸</span>
                                <div>
                                    <div className="font-medium text-wool-700">Frog Project</div>
                                    <div className="text-sm text-wool-500">Start over with lessons learned</div>
                                </div>
                            </div>
                        </button>
                    </div>
                </div>
            </div>

            {/* === MODALS (Reusing existing patterns) === */}
            {showFrogModal && (
                <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowFrogModal(false)}>
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
                                    onClick={() => setShowFrogModal(false)}
                                    className="btn-tertiary flex-1"
                                >
                                    Keep Going
                                </button>
                                <button
                                    onClick={handleFrogProject}
                                    className="btn-primary flex-1"
                                >
                                    Frog It
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </TabContent>
    );
};

// === OVERVIEW COMPONENT CARD - Clean, focused, action-oriented ===
const OverviewComponentCard = ({ component, status, onClick }) => {
    const getStatusConfig = () => {
        switch (status) {
            case 'currently_knitting':
                return {
                    bgColor: 'bg-sage-200 border-sage-400',
                    textColor: 'text-sage-800',
                    icon: '🧶',
                    label: 'Continue Knitting'
                };
            case 'ready_to_knit':
                return {
                    bgColor: 'bg-sage-100 border-sage-300',
                    textColor: 'text-sage-700',
                    icon: '🎯',
                    label: 'Start Knitting'
                };
            case 'finishing_in_progress':
                return {
                    bgColor: 'bg-lavender-100 border-lavender-300',
                    textColor: 'text-lavender-700',
                    icon: '🪡',
                    label: 'Continue Finishing'
                };
            case 'edit_mode':
            default:
                return {
                    bgColor: 'bg-yarn-100 border-yarn-300',
                    textColor: 'text-yarn-700',
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
            className={`w-full ${config.bgColor} border-2 rounded-xl p-4 transition-all duration-200 cursor-pointer hover:shadow-md active:shadow-lg text-left`}
        >
            <div className="flex items-center gap-4">
                <span className="text-2xl flex-shrink-0">{config.icon}</span>
                <div className="flex-1 min-w-0">
                    <h3 className={`font-semibold ${config.textColor} text-base`}>
                        {component.name}
                    </h3>
                    <div className="flex items-center gap-3 mt-1">
                        <span className={`text-sm ${config.textColor} opacity-75`}>
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