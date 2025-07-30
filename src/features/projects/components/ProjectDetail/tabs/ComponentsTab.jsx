import React, { useState, useEffect } from 'react';
import IntelliKnitLogger from '../../../../../shared/utils/ConsoleLogging';

const ComponentsTab = ({
    project,
    onShowEnhancedCreation,
    onComponentManageSteps,
    onComponentMenuAction,
    openMenuId,
    setOpenMenuId
}) => {
    const [showComponentChoiceModal, setShowComponentChoiceModal] = useState(false);
    const [selectedSuggestion, setSelectedSuggestion] = useState(null);
    const [copyFromComponent, setCopyFromComponent] = useState('');
    const [createMode, setCreateMode] = useState('new');

    const statusCategories = [
        {
            status: 'edit_mode',
            title: '✏️ Edit Mode',
            headerStyle: 'bg-yarn-100 border-yarn-300 text-yarn-800',
        },
        {
            status: 'ready_to_knit',
            title: '⚡ Ready to Knit',
            headerStyle: 'bg-sage-100 border-sage-300 text-sage-800',
        },
        {
            status: 'currently_knitting',
            title: '🧶 Currently Knitting',
            headerStyle: 'bg-sage-200 border-sage-400 text-sage-800',
        },
        {
            status: 'finished',
            title: '✅ Finished',
            headerStyle: 'bg-sage-300 border-sage-500 text-sage-800',
        }
    ];

    // Get component status (same logic as before)
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

    const getComponentsByStatus = (status) => {
        return project.components.filter(component => {
            const componentStatus = getComponentStatus(component);
            if (status === 'currently_knitting' &&
                (componentStatus === 'finishing_in_progress' || componentStatus === 'finishing_done')) {
                return true;
            }
            return componentStatus === status;
        });
    };

    const totalComponents = project.components.length;

    // Handle suggestion selection
    const handleSuggestionSelect = (suggestion) => {
        setSelectedSuggestion(suggestion);
        setCreateMode('new');
        setCopyFromComponent('');
        setShowComponentChoiceModal(true);
    };

    // Modal behavior
    useEffect(() => {
        const handleEscKey = (event) => {
            if (event.key === 'Escape' && showComponentChoiceModal) {
                handleCloseModal();
            }
        };

        if (showComponentChoiceModal) {
            document.addEventListener('keydown', handleEscKey);
            setTimeout(() => {
                const primaryButton = document.querySelector('[data-modal-primary]');
                if (primaryButton) primaryButton.focus();
            }, 100);
        }

        return () => {
            document.removeEventListener('keydown', handleEscKey);
        };
    }, [showComponentChoiceModal]);

    const handleBackdropClick = (event) => {
        if (event.target === event.currentTarget) {
            handleCloseModal();
        }
    };

    const handleCloseModal = () => {
        setShowComponentChoiceModal(false);
        setSelectedSuggestion(null);
        setCopyFromComponent('');
        setCreateMode('new');
    };

    const handleCreateComponent = () => {
        if (createMode === 'copy' && !copyFromComponent) {
            return;
        }

        if (createMode === 'copy') {
            onComponentMenuAction('copy', copyFromComponent);
        } else {
            onShowEnhancedCreation();
        }

        handleCloseModal();
    };

    const canCreateComponent = () => {
        if (createMode === 'copy') {
            return copyFromComponent !== '';
        }
        return true;
    };

    const handleComponentAction = (component, action) => {
        switch (action) {
            case 'edit':
            case 'view':
                onComponentManageSteps(component.id);
                break;
            case 'rename':
            case 'copy':
            case 'delete':
            case 'reset':
                onComponentMenuAction(action, component.id);
                break;
            default:
                IntelliKnitLogger.warn('Unknown component action', action);
        }
    };

    return (
        <div className="p-6">
            {/* Header */}
            <div className="content-header-with-buttons">
                <h2 className="content-title">🧶 Components ({totalComponents})</h2>
                <div className="button-group">
                    <button
                        onClick={onShowEnhancedCreation}
                        className="btn-primary btn-sm"
                    >
                        + Add Component
                    </button>
                </div>
            </div>

            <div className="success-block-center mb-6">
                <h4 className="text-sm font-semibold text-sage-700 mb-2">📋 Getting Started</h4>
                <div className="text-sm text-sage-600">
                    Break your {project.projectType} into major sections like sleeves, body, and collar.
                    Each component will have its own step-by-step instructions.
                </div>
            </div>


            {/* Status-Organized Component Lists */}
            <div className="space-y-6">
                {statusCategories.map(category => {
                    const components = getComponentsByStatus(category.status);
                    return (
                        <ComponentStatusSection
                            key={category.status}
                            category={category}
                            components={components}
                            onComponentAction={handleComponentAction}
                            openMenuId={openMenuId}
                            setOpenMenuId={setOpenMenuId}
                        />
                    );
                })}
            </div>

            {/* Empty State */}
            {totalComponents === 0 && (
                <div className="mt-6 py-8 text-center">
                    <div className="text-2xl mb-2">🧶</div>
                    <p className="text-wool-500 text-sm">Add your first component to get started</p>
                </div>
            )}

            {/* Component Choice Modal */}
            {showComponentChoiceModal && selectedSuggestion && (
                <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4" onClick={handleBackdropClick}>
                    <div className="bg-white rounded-xl max-w-sm w-full">
                        <div className="p-4 border-b border-gray-200">
                            <h2 className="text-lg font-semibold">Create {selectedSuggestion.name}</h2>
                        </div>

                        <div className="p-4 space-y-4">
                            {/* Create New Option */}
                            <label className={`block cursor-pointer p-3 rounded-xl border-2 transition-all duration-200 ${createMode === 'new'
                                ? 'border-sage-500 bg-sage-100 text-sage-700 shadow-sm'
                                : 'border-wool-200 bg-white text-wool-700 hover:border-sage-300 hover:bg-sage-50'
                                }`}>
                                <div className="flex items-start gap-4">
                                    <input
                                        type="radio"
                                        name="create_mode"
                                        value="new"
                                        checked={createMode === 'new'}
                                        onChange={(e) => setCreateMode(e.target.value)}
                                        className="w-4 h-4 text-sage-600 mt-1"
                                    />
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-1">
                                            <span className="text-xl">✨</span>
                                            <div className="text-left">
                                                <div className="font-medium">Create New Component</div>
                                                <div className="text-sm opacity-75">Start fresh with the component wizard</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </label>

                            {/* Copy from Existing Option */}
                            <label className={`block cursor-pointer p-3 rounded-xl border-2 transition-all duration-200 ${createMode === 'copy'
                                ? 'border-sage-500 bg-sage-100 text-sage-700 shadow-sm'
                                : 'border-wool-200 bg-white text-wool-700 hover:border-sage-300 hover:bg-sage-50'
                                }`}>
                                <div className="flex items-start gap-4">
                                    <input
                                        type="radio"
                                        name="create_mode"
                                        value="copy"
                                        checked={createMode === 'copy'}
                                        onChange={(e) => setCreateMode(e.target.value)}
                                        className="w-4 h-4 text-sage-600 mt-1"
                                    />
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-1">
                                            <span className="text-xl">📋</span>
                                            <div className="text-left">
                                                <div className="font-medium">Copy from Existing</div>
                                                <div className="text-sm opacity-75">Copy steps from another component</div>
                                            </div>
                                        </div>

                                        {/* Nested content inside the radio option */}
                                        {createMode === 'copy' && (
                                            <div className="mt-3 space-y-3">
                                                <select
                                                    value={copyFromComponent}
                                                    onChange={(e) => setCopyFromComponent(e.target.value)}
                                                    className="w-full border-2 border-wool-200 rounded-xl px-4 py-3 text-base focus:border-sage-500 focus:ring-0 transition-colors bg-white"
                                                >
                                                    <option value="">Select component...</option>
                                                    {project.components.map(comp => (
                                                        <option key={comp.id} value={comp.id}>
                                                            {comp.name} ({comp.steps?.length || 0} steps)
                                                        </option>
                                                    ))}
                                                </select>

                                                <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3">
                                                    <strong>Note:</strong> To modify copied steps, only delete from the end working backwards. This maintains stitch count dependencies.
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </label>
                        </div>

                        {/* Action Buttons */}
                        <div className="p-4 border-t border-gray-100 flex gap-3">
                            <button
                                onClick={handleCloseModal}
                                data-modal-cancel
                                className="btn-tertiary flex-1"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCreateComponent}
                                disabled={!canCreateComponent()}
                                data-modal-primary
                                className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Create
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// Component Status Section
const ComponentStatusSection = ({ category, components, onComponentAction, openMenuId, setOpenMenuId }) => {
    if (components.length === 0) return null;

    return (
        <div className="mb-6">
            {/* Category Header */}
            <div className={`${category.headerStyle} rounded-t-xl border-2 p-4 flex justify-between items-center`}>
                <div>
                    <h3 className="text-base font-semibold flex items-center gap-2">
                        {category.title} ({components.length})
                    </h3>
                </div>
            </div>

            {/* Component List */}
            <div className="bg-white border-2 border-gray-200 border-t-0 rounded-b-xl divide-y divide-gray-100">
                {components.map((component) => (
                    <ComponentMaintenanceCard
                        key={component.id}
                        component={component}
                        status={category.status}
                        onAction={onComponentAction}
                        openMenuId={openMenuId}
                        setOpenMenuId={setOpenMenuId}
                    />
                ))}
            </div>
        </div>
    );
};

// Component Maintenance Card
const ComponentMaintenanceCard = ({ component, status, onAction, openMenuId, setOpenMenuId }) => {
    const getStepInfo = () => {
        const total = component.steps?.length || 0;
        const completed = component.steps?.filter(s => s.completed).length || 0;

        if (status === 'currently_knitting') {
            return `${completed}/${total} completed`;
        }
        return `${total} steps`;
    };

    const getMainAction = () => {
        switch (status) {
            case 'edit_mode': return { icon: '✏️', action: 'edit' };
            case 'ready_to_knit': return { icon: '🎯', action: 'edit' };
            case 'currently_knitting': return { icon: '▶️', action: 'edit' };
            case 'finished': return { icon: '👁️', action: 'view' };
            default: return { icon: '✏️', action: 'edit' };
        }
    };

    const mainAction = getMainAction();

    const handleMenuToggle = (e) => {
        e.stopPropagation();
        if (openMenuId === component.id) {
            setOpenMenuId(null);
        } else {
            setOpenMenuId(component.id);
        }
    };

    return (
        <div className="group">
            {/* Clickable card body */}
            <div
                className="flex items-center gap-3 p-4 min-h-[60px] hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => onAction(component, mainAction.action)}
            >
                {/* Component Info */}
                <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-800 text-left">
                        {component.name}
                    </h4>
                    <p className="text-sm text-gray-600 text-left">
                        {getStepInfo()}
                    </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 relative z-10">
                    {/* Main Action button */}
                    {/*}          <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onAction(component, mainAction.action);
                        }}
                        className="btn-tertiary btn-sm flex items-center gap-1"
                    >
                        {mainAction.icon}
                    </button>.   */}

                    {/* Menu Button - WORKING PATTERN FROM COMPACTCOMPONENTCARD */}
                    <div className="relative ml-2 flex-shrink-0">
                        <button
                            onClick={handleMenuToggle}
                            className={`p-1.5 text-wool-400 hover:text-wool-600 hover:bg-wool-200 rounded-full transition-colors ${openMenuId === component.id ? 'relative z-[101]' : ''
                                }`}
                        >
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                                <circle cx="8" cy="3" r="1.5" />
                                <circle cx="8" cy="8" r="1.5" />
                                <circle cx="8" cy="13" r="1.5" />
                            </svg>
                        </button>

                        {openMenuId === component.id && (
                            <>
                                {/* Backdrop for click-outside */}
                                <div
                                    className="fixed inset-0 z-[90]"
                                    onMouseDown={() => setOpenMenuId(null)}
                                    aria-hidden="true"
                                />

                                {/* Menu with simple absolute positioning */}
                                <div className="absolute right-4 top-2 bg-white border-2 border-wool-200 rounded-xl shadow-xl z-[100] min-w-32 overflow-hidden transform transition-all duration-200 ease-out animate-in"><button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onAction(component, 'rename');
                                        setOpenMenuId(null);
                                    }}
                                    className="w-full px-4 py-3 text-left text-wool-600 hover:bg-sage-50 text-sm flex items-center gap-2 transition-colors font-medium"
                                >
                                    ✏️ Rename
                                </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onAction(component, 'copy');
                                            setOpenMenuId(null);
                                        }}
                                        className="w-full px-4 py-3 text-left text-wool-600 hover:bg-sage-50 text-sm flex items-center gap-2 transition-colors font-medium border-t border-wool-100"
                                    >
                                        📋 Copy
                                    </button>
                                    {status === 'finished' && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onAction(component, 'reset');
                                                setOpenMenuId(null);
                                            }}
                                            className="w-full px-4 py-3 text-left text-wool-600 hover:bg-sage-50 text-sm flex items-center gap-2 transition-colors font-medium border-t border-wool-100"
                                        >
                                            🔄 Reset Progress
                                        </button>
                                    )}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onAction(component, 'delete');
                                            setOpenMenuId(null);
                                        }}
                                        className="w-full px-4 py-3 text-left text-red-600 hover:bg-red-50 text-sm flex items-center gap-2 transition-colors font-medium border-t border-wool-100"
                                        disabled={component.steps?.some(s => s.completed)}
                                    >
                                        🗑️ Delete
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ComponentsTab;