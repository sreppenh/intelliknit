import React from 'react';
import { getProjectStatus } from '../../../../../shared/utils/projectStatus';

const OverviewTab = ({
    project,
    totalComponents,
    completedComponents,
    onCompleteProject,
    onEditProjectDetails,
    onManageSteps,
    onStartKnitting
}) => {

    // Helper functions for date formatting and status
    const formatDate = (dateString) => {
        if (!dateString) return 'Unknown';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const formatRelativeDate = (dateString) => {
        if (!dateString) return 'Unknown';
        const date = new Date(dateString);
        const now = new Date();
        const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
        return formatDate(dateString);
    };

    const status = getProjectStatus(project);

    // Component status analysis for smart sections
    const getComponentsByStatus = () => {
        if (!project.components) return { currentlyKnitting: [], readyToKnit: [], needsWork: [] };

        return project.components.reduce((acc, component) => {
            // Determine component status (adapted from ComponentsTab logic)
            const hasSteps = component.steps && component.steps.length > 0;
            const hasProgress = hasSteps && component.steps.some(step => step.completed);
            const hasCastOn = hasSteps && component.steps.some(step =>
                step.wizardConfig?.stitchPattern?.pattern === 'Cast On' ||
                step.description?.toLowerCase().includes('cast on')
            );
            const hasBindOff = hasSteps && component.steps.some(step =>
                step.wizardConfig?.stitchPattern?.pattern === 'Bind Off' ||
                step.description?.toLowerCase().includes('bind off')
            );
            const isComplete = hasSteps && component.steps.every(step => step.completed);

            if (isComplete) {
                // Don't show finished components in Overview - they're done!
                return acc;
            } else if (hasProgress) {
                acc.currentlyKnitting.push(component);
            } else if (hasCastOn && hasBindOff) {
                acc.readyToKnit.push(component);
            } else {
                acc.needsWork.push(component);
            }

            return acc;
        }, { currentlyKnitting: [], readyToKnit: [], needsWork: [] });
    };

    const componentsByStatus = getComponentsByStatus();

    // Calculate progress percentage
    const getProgressPercentage = () => {
        if (!project.components || project.components.length === 0) return 0;

        const totalSteps = project.components.reduce((sum, comp) =>
            sum + (comp.steps?.length || 0), 0);
        const completedSteps = project.components.reduce((sum, comp) =>
            sum + (comp.steps?.filter(step => step.completed).length || 0), 0);

        return totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;
    };

    const progressPercentage = getProgressPercentage();

    // Status-aware messaging
    const getStatusMessage = () => {
        if (status.emoji === '🔥') {
            return {
                title: `${status.emoji} You're On Fire!`,
                subtitle: status.text,
                mood: 'Keep that streak alive!'
            };
        } else if (status.emoji === '😴') {
            return {
                title: `${status.emoji} Time to Wake Up`,
                subtitle: status.text,
                mood: 'Let\'s get back to knitting!'
            };
        } else if (status.emoji === '🚀') {
            return {
                title: `${status.emoji} Ready to Launch`,
                subtitle: status.text,
                mood: 'Everything\'s set up - time to knit!'
            };
        } else if (status.emoji === '💭') {
            return {
                title: `${status.emoji} Fresh Start`,
                subtitle: status.text,
                mood: 'Let\'s add some components!'
            };
        } else {
            return {
                title: `${status.emoji} Making Progress`,
                subtitle: status.text,
                mood: 'Keep up the great work!'
            };
        }
    };

    const statusMessage = getStatusMessage();

    return (
        <div className="p-6 space-y-6">
            {/* Status Hero Section */}
            <div className="bg-white rounded-xl p-5 border-2 border-sage-200 shadow-sm">
                <div className="text-center mb-4">
                    <h2 className="text-lg font-semibold text-wool-700 mb-1">
                        {statusMessage.title}
                    </h2>
                    <p className="text-sm text-sage-600 mb-2">{statusMessage.mood}</p>

                    {/* Progress Bar */}
                    <div className="bg-wool-100 rounded-full h-2 mb-2">
                        <div
                            className="bg-sage-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${progressPercentage}%` }}
                        />
                    </div>
                    <p className="text-xs text-wool-500">
                        {progressPercentage}% complete • Created {formatRelativeDate(project.createdAt)}
                    </p>
                </div>
            </div>

            {/* Currently Knitting Section - THE HERO! */}
            {componentsByStatus.currentlyKnitting.length > 0 && (
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-wool-700 flex items-center gap-2">
                            🧶 Currently Knitting
                        </h3>
                        <span className="text-xs text-sage-600 font-medium">
                            Tap to continue knitting
                        </span>
                    </div>

                    <div className="space-y-3">
                        {componentsByStatus.currentlyKnitting.map(component => {
                            const componentIndex = project.components.findIndex(c => c.id === component.id);
                            const completedSteps = component.steps?.filter(step => step.completed).length || 0;
                            const totalSteps = component.steps?.length || 0;

                            return (
                                <div
                                    key={component.id}
                                    className="bg-sage-50 border-2 border-sage-200 rounded-xl p-4 hover:bg-sage-100 transition-colors cursor-pointer"
                                    onClick={() => onStartKnitting && onStartKnitting(componentIndex)}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <h4 className="font-medium text-sage-800">{component.name}</h4>
                                        <span className="text-xs text-sage-600">
                                            {completedSteps}/{totalSteps} steps
                                        </span>
                                    </div>

                                    <div className="bg-white rounded-full h-1.5 mb-3">
                                        <div
                                            className="bg-sage-500 h-1.5 rounded-full transition-all duration-300"
                                            style={{ width: `${totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0}%` }}
                                        />
                                    </div>

                                    <button
                                        className="w-full btn-secondary flex items-center justify-center gap-2"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onStartKnitting && onStartKnitting(componentIndex);
                                        }}
                                    >
                                        🧶 Continue Knitting {component.name}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Ready to Knit Section */}
            {componentsByStatus.readyToKnit.length > 0 && (
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-wool-700 flex items-center gap-2">
                            ⚡ Ready to Knit
                        </h3>
                        <span className="text-xs text-sage-600 font-medium">
                            Tap to start knitting
                        </span>
                    </div>

                    <div className="space-y-3">
                        {componentsByStatus.readyToKnit.map(component => {
                            const componentIndex = project.components.findIndex(c => c.id === component.id);
                            const totalSteps = component.steps?.length || 0;

                            return (
                                <div
                                    key={component.id}
                                    className="bg-yarn-50 border-2 border-yarn-200 rounded-xl p-4 hover:bg-yarn-100 transition-colors cursor-pointer"
                                    onClick={() => onStartKnitting && onStartKnitting(componentIndex)}
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <h4 className="font-medium text-yarn-800">{component.name}</h4>
                                        <span className="text-xs text-yarn-600">
                                            {totalSteps} steps ready
                                        </span>
                                    </div>

                                    <button
                                        className="w-full btn-primary flex items-center justify-center gap-2"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onStartKnitting && onStartKnitting(componentIndex);
                                        }}
                                    >
                                        🚀 Start Knitting {component.name}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Needs Work Section */}
            {componentsByStatus.needsWork.length > 0 && (
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-wool-700 flex items-center gap-2">
                            ✏️ Needs Steps
                        </h3>
                        <span className="text-xs text-sage-600 font-medium">
                            Tap to add steps
                        </span>
                    </div>

                    <div className="space-y-3">
                        {componentsByStatus.needsWork.map(component => {
                            const componentIndex = project.components.findIndex(c => c.id === component.id);
                            const stepCount = component.steps?.length || 0;

                            return (
                                <div
                                    key={component.id}
                                    className="bg-wool-50 border-2 border-wool-200 rounded-xl p-4 hover:bg-wool-100 transition-colors cursor-pointer"
                                    onClick={() => onManageSteps && onManageSteps(componentIndex)}
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <h4 className="font-medium text-wool-800">{component.name}</h4>
                                        <span className="text-xs text-wool-600">
                                            {stepCount === 0 ? 'No steps yet' : `${stepCount} steps`}
                                        </span>
                                    </div>

                                    <button
                                        className="w-full btn-tertiary flex items-center justify-center gap-2"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onManageSteps && onManageSteps(componentIndex);
                                        }}
                                    >
                                        ✏️ Add Steps to {component.name}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Empty Project State */}
            {project.components?.length === 0 && (
                <div className="bg-white rounded-xl p-8 border-2 border-wool-200 text-center">
                    <div className="text-4xl mb-3">🧶</div>
                    <h3 className="font-semibold text-wool-700 mb-2">Ready to Begin!</h3>
                    <p className="text-sm text-wool-600 mb-4">
                        Add your first component to start planning your project.
                    </p>
                    <button
                        className="btn-primary"
                        onClick={() => {
                            // This would trigger component creation - we'll need to wire this up
                            console.log('Navigate to Components tab to add component');
                        }}
                    >
                        ✨ Add Your First Component
                    </button>
                </div>
            )}

            {/* Project Actions */}
            <div className="space-y-3">
                {/* Conditional complete button - only show if project has meaningful progress */}
                {(componentsByStatus.currentlyKnitting.length > 0 || completedComponents > 0) && (
                    <button
                        onClick={onCompleteProject}
                        className="w-full btn-secondary flex items-center justify-center gap-2"
                    >
                        🏆 Mark Project Complete
                    </button>
                )}

                <div className="flex gap-3">
                    <button
                        onClick={onEditProjectDetails}
                        className="flex-1 btn-tertiary flex items-center justify-center gap-2"
                    >
                        ✏️ Edit Details
                    </button>

                    {/* Placeholder for future actions */}
                    <button
                        onClick={() => {
                            // Future: Project settings, frog project, etc.
                            console.log('Future: More project actions');
                        }}
                        className="flex-1 btn-tertiary flex items-center justify-center gap-2"
                    >
                        ⚙️ More
                    </button>
                </div>
            </div>

            {/* Key Project Info Footer */}
            <div className="bg-white rounded-xl p-4 border-2 border-wool-200">
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <span className="text-wool-600 font-medium">Components:</span>
                        <span className="ml-2 text-wool-700">{project.components?.length || 0}</span>
                    </div>
                    <div>
                        <span className="text-wool-600 font-medium">Progress:</span>
                        <span className="ml-2 text-wool-700">{progressPercentage}%</span>
                    </div>
                    {project.size && (
                        <div>
                            <span className="text-wool-600 font-medium">Size:</span>
                            <span className="ml-2 text-wool-700">{project.size}</span>
                        </div>
                    )}
                    {project.lastActivityAt && (
                        <div>
                            <span className="text-wool-600 font-medium">Last worked:</span>
                            <span className="ml-2 text-wool-700">{formatRelativeDate(project.lastActivityAt)}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OverviewTab;