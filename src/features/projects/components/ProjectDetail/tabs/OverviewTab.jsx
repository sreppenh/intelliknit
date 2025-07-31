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

    const status = getProjectStatus(project);

    // Component status analysis for smart sections  
    const getComponentsByStatus = () => {
        if (!project.components) return { currentlyKnitting: [], readyToKnit: [], needsWork: [] };

        return project.components.reduce((acc, component) => {
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
                return acc; // Don't show finished components
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

    return (
        <div className="p-6 space-y-8">
            {/* Status Hero - Clean and Inspiring */}
            <div className="text-center space-y-3">
                <div className="text-3xl mb-2">{status.emoji}</div>
                <h2 className="text-xl font-semibold text-wool-700">
                    {status.text}
                </h2>
                <div className="text-sm text-sage-600 space-y-1">
                    <p>Created {formatRelativeDate(project.createdAt)}</p>
                    {project.lastActivityAt && project.lastActivityAt !== project.createdAt && (
                        <p>Last worked {formatRelativeDate(project.lastActivityAt)}</p>
                    )}
                </div>
            </div>

            {/* Currently Knitting - Hero Section with Beautiful Cards */}
            {componentsByStatus.currentlyKnitting.length > 0 && (
                <div className="space-y-4">
                    <h3 className="font-semibold text-wool-700 text-center">
                        🧶 Continue Knitting
                    </h3>

                    <div className="space-y-4">
                        {componentsByStatus.currentlyKnitting.map(component => {
                            const componentIndex = project.components.findIndex(c => c.id === component.id);
                            const completedSteps = component.steps?.filter(step => step.completed).length || 0;
                            const totalSteps = component.steps?.length || 0;

                            return (
                                <div
                                    key={component.id}
                                    className="bg-sage-100 border-2 border-sage-300 rounded-xl p-5 hover:bg-sage-150 transition-colors"
                                >
                                    <div className="flex items-center justify-between mb-4">
                                        <h4 className="text-lg font-medium text-sage-800">{component.name}</h4>
                                        <span className="text-sm text-sage-600 bg-sage-200 px-3 py-1 rounded-full">
                                            {completedSteps}/{totalSteps} steps
                                        </span>
                                    </div>

                                    <button
                                        className="w-full btn-secondary"
                                        onClick={() => onStartKnitting && onStartKnitting(componentIndex)}
                                    >
                                        Continue
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Ready to Knit - Bright and Energetic */}
            {componentsByStatus.readyToKnit.length > 0 && (
                <div className="space-y-4">
                    <h3 className="font-semibold text-wool-700 text-center">
                        ⚡ Ready to Start
                    </h3>

                    <div className="space-y-4">
                        {componentsByStatus.readyToKnit.map(component => {
                            const componentIndex = project.components.findIndex(c => c.id === component.id);
                            const totalSteps = component.steps?.length || 0;

                            return (
                                <div
                                    key={component.id}
                                    className="bg-yarn-100 border-2 border-yarn-300 rounded-xl p-5 hover:bg-yarn-150 transition-colors"
                                >
                                    <div className="flex items-center justify-between mb-4">
                                        <h4 className="text-lg font-medium text-yarn-800">{component.name}</h4>
                                        <span className="text-sm text-yarn-600 bg-yarn-200 px-3 py-1 rounded-full">
                                            {totalSteps} steps ready
                                        </span>
                                    </div>

                                    <button
                                        className="w-full btn-primary"
                                        onClick={() => onStartKnitting && onStartKnitting(componentIndex)}
                                    >
                                        Start Knitting
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Needs Work - Subtle but Clear */}
            {componentsByStatus.needsWork.length > 0 && (
                <div className="space-y-4">
                    <h3 className="font-semibold text-wool-700 text-center">
                        ✏️ Add Steps First
                    </h3>

                    <div className="space-y-3">
                        {componentsByStatus.needsWork.map(component => {
                            const componentIndex = project.components.findIndex(c => c.id === component.id);
                            const stepCount = component.steps?.length || 0;

                            return (
                                <div
                                    key={component.id}
                                    className="bg-wool-100 border-2 border-wool-200 rounded-xl p-4 hover:bg-wool-150 transition-colors"
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="font-medium text-wool-800">{component.name}</h4>
                                            <p className="text-sm text-wool-600">
                                                {stepCount === 0 ? 'No steps yet' : `${stepCount} steps`}
                                            </p>
                                        </div>
                                        <button
                                            className="btn-tertiary btn-sm"
                                            onClick={() => onManageSteps && onManageSteps(componentIndex)}
                                        >
                                            Add Steps
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Empty Project State - Inspiring */}
            {project.components?.length === 0 && (
                <div className="text-center space-y-6 py-8">
                    <div className="text-5xl">🧶</div>
                    <div className="space-y-2">
                        <h3 className="text-xl font-semibold text-wool-700">Fresh Canvas</h3>
                        <p className="text-wool-600">
                            Ready to start planning your beautiful project?
                        </p>
                    </div>
                    <button
                        className="btn-primary"
                        onClick={() => {
                            // Navigate to Components tab - to be wired up
                            console.log('Navigate to Components tab to add component');
                        }}
                    >
                        Add Your First Component
                    </button>
                </div>
            )}

            {/* Project Actions - Clean and Minimal */}
            <div className="pt-4 border-t border-wool-200 space-y-4">
                {/* Only show complete button if there's meaningful progress */}
                {(componentsByStatus.currentlyKnitting.length > 0 || completedComponents > 0) && (
                    <button
                        onClick={onCompleteProject}
                        className="w-full btn-secondary text-center"
                    >
                        🏆 Mark Project Complete
                    </button>
                )}

                {/* Secondary actions in subtle row */}
                <div className="flex gap-3 justify-center">
                    <button
                        onClick={onEditProjectDetails}
                        className="btn-tertiary btn-sm"
                    >
                        Edit Details
                    </button>

                    <button
                        onClick={() => {
                            // Future: More actions like frog, archive, etc.
                            console.log('Future: More project actions');
                        }}
                        className="btn-tertiary btn-sm"
                    >
                        More Actions
                    </button>
                </div>
            </div>

            {/* Project Summary - Minimal Footer */}
            {project.components?.length > 0 && (
                <div className="text-center text-sm text-wool-500 pt-2">
                    {project.components.length} component{project.components.length === 1 ? '' : 's'}
                    {project.size && ` • ${project.size}`}
                </div>
            )}
        </div>
    );
};

export default OverviewTab;