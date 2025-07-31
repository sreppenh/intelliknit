import React, { useState, useEffect } from 'react';
import { getProjectStatus } from '../../../../../shared/utils/projectStatus';

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
    onDeleteProject
}) => {

    // Modal state management
    const [showFrogModal, setShowFrogModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

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

    // Add this helper function near the top with the other helper functions
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

    // Handler functions for project actions
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

    const handleDeleteProject = () => {
        onDeleteProject && onDeleteProject(project.id);
        setShowDeleteModal(false);
    };

    // Modal behavior hooks - Warning Modal Pattern
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
            setShowFrogModal(false);
            setShowDeleteModal(false);
        }
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
        <>
            <div className="p-6 space-y-8">
                {/* Project Hero - Name + Status */}
                <div className="text-center space-y-3">
                    <h2 className="content-header-primary flex items-center justify-center gap-3">
                        <span className="text-2xl">{getProjectIcon(project.projectType)}</span>
                        {project.name}
                    </h2>
                    <div className="flex items-center justify-center gap-2 text-lg">
                        <span>{status.emoji}</span>
                        <span className="font-medium text-wool-700">{status.text}</span>
                    </div>
                    <div className="text-sm text-sage-600 space-y-1">
                        <p>Created {formatRelativeDate(project.createdAt)}</p>
                        {project.lastActivityAt && project.lastActivityAt !== project.createdAt && (
                            <p>Last updated {formatRelativeDate(project.lastActivityAt)}</p>
                        )}
                    </div>
                </div>

                {/* Currently Knitting - Hero Section with Beautiful Cards */}
                {componentsByStatus.currentlyKnitting.length > 0 && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-wool-700">
                                🧶 Currently Knitting
                            </h3>
                            <span className="text-xs text-sage-600 font-medium">
                                Tap to continue knitting
                            </span>
                        </div>

                        <div className="space-y-4">
                            {componentsByStatus.currentlyKnitting.map(component => {
                                const componentIndex = project.components.findIndex(c => c.id === component.id);
                                const completedSteps = component.steps?.filter(step => step.completed).length || 0;
                                const totalSteps = component.steps?.length || 0;

                                return (
                                    <div
                                        key={component.id}
                                        className="bg-sage-100 border-2 border-sage-300 rounded-xl p-5 hover:bg-sage-150 transition-colors cursor-pointer"
                                        onClick={() => onStartKnitting && onStartKnitting(componentIndex)}
                                    >
                                        <div className="flex items-center justify-between mb-4">
                                            <h4 className="text-lg font-medium text-sage-800">{component.name}</h4>
                                            <span className="text-sm text-sage-600 bg-sage-200 px-3 py-1 rounded-full">
                                                {completedSteps}/{totalSteps} steps
                                            </span>
                                        </div>

                                        <button
                                            className="w-full btn-secondary"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onStartKnitting && onStartKnitting(componentIndex);
                                            }}
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
                        <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-wool-700">
                                ⚡ Ready to Knit
                            </h3>
                            <span className="text-xs text-sage-600 font-medium">
                                Tap to start knitting
                            </span>
                        </div>

                        <div className="space-y-4">
                            {componentsByStatus.readyToKnit.map(component => {
                                const componentIndex = project.components.findIndex(c => c.id === component.id);
                                const totalSteps = component.steps?.length || 0;

                                return (
                                    <div
                                        key={component.id}
                                        className="bg-yarn-100 border-2 border-yarn-300 rounded-xl p-5 hover:bg-yarn-150 transition-colors cursor-pointer"
                                        onClick={() => onStartKnitting && onStartKnitting(componentIndex)}
                                    >
                                        <div className="flex items-center justify-between mb-4">
                                            <h4 className="text-lg font-medium text-yarn-800">{component.name}</h4>
                                            <span className="text-sm text-yarn-600 bg-yarn-200 px-3 py-1 rounded-full">
                                                {totalSteps} steps ready
                                            </span>
                                        </div>

                                        <button
                                            className="w-full btn-primary"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onStartKnitting && onStartKnitting(componentIndex);
                                            }}
                                        >
                                            🧶 Start Knitting
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
                        <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-wool-700">
                                ✏️ Edit Mode
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
                                        className="bg-wool-100 border-2 border-wool-200 rounded-xl p-4 hover:bg-wool-150 transition-colors cursor-pointer"
                                        onClick={() => onManageSteps && onManageSteps(componentIndex)}
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
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onManageSteps && onManageSteps(componentIndex);
                                                }}
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
                            className="w-full btn-primary"
                            onClick={() => {
                                if (onChangeTab) {
                                    onChangeTab('components');
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                }
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

                    {/* Secondary actions - Practical project lifecycle */}
                    <div className="flex gap-3 justify-center">
                        <button
                            onClick={() => setShowFrogModal(true)}
                            className="btn-tertiary btn-sm"
                        >
                            🐸 Frog Project
                        </button>

                        <button
                            onClick={() => setShowDeleteModal(true)}
                            className="btn-tertiary btn-sm text-red-600 hover:text-red-700"
                        >
                            🗑️ Delete Project
                        </button>

                        <button
                            onClick={() => {
                                if (onChangeTab) {
                                    onChangeTab('details');
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                }
                            }}
                            className="btn-tertiary btn-sm"
                        >
                            ✏️ Edit Details
                        </button>
                    </div>
                </div>

                {/* Project Summary - Minimal Footer */}
                {project.components?.length > 0 && (
                    <div className="text-center text-sm text-wool-500 pt-2">
                        {project.components.length} component{project.components.length === 1 ? '' : 's'}
                        {project.lastActivityAt && (
                            <> • Last updated {formatRelativeDate(project.lastActivityAt)}</>
                        )}
                    </div>
                )}
            </div>

            {/* Frog Project Modal */}
            {showFrogModal && (
                <div className="modal-overlay" onClick={handleBackdropClick}>
                    <div className="modal-content-light">
                        <div className="modal-header-light">
                            <div className="text-center">
                                <div className="text-2xl mb-2">🐸</div>
                                <h2 className="text-lg font-semibold">Frog Project?</h2>
                                <p className="text-sage-600 text-sm">{project.name}</p>
                            </div>
                        </div>

                        <div className="p-6">
                            <div className="text-center mb-6">
                                <p className="text-wool-600 mb-2">
                                    This will mark your project as frogged and reset progress to start over.
                                </p>
                                <p className="text-wool-500 text-sm">
                                    Your project structure and steps will be preserved - you can restart anytime.
                                </p>
                            </div>

                            <div className="stack-sm">
                                <button
                                    onClick={handleFrogProject}
                                    data-modal-exit
                                    className="w-full btn-secondary flex items-center justify-center gap-2"
                                >
                                    <span className="text-lg">🐸</span>
                                    Yes, Frog Project
                                </button>

                                <button
                                    onClick={() => setShowFrogModal(false)}
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

            {/* Delete Project Modal */}
            {showDeleteModal && (
                <div className="modal-overlay" onClick={handleBackdropClick}>
                    <div className="modal-content-light">
                        <div className="modal-header-light-danger">
                            <div className="text-center">
                                <div className="text-2xl mb-2">🗑️</div>
                                <h2 className="text-lg font-semibold">Delete Project Forever?</h2>
                                <p className="text-red-600 text-sm">{project.name}</p>
                            </div>
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

export default OverviewTab;