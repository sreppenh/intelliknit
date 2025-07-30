import React, { useState } from 'react';
import IntelliKnitLogger from '../../../../../shared/utils/ConsoleLogging';

const ComponentsTab = ({
    project,
    onProjectUpdate,
    onShowEnhancedCreation,
    onComponentManageSteps,
    onComponentMenuAction,
    openMenuId,
    setOpenMenuId
}) => {
    const [showCopyWarningModal, setShowCopyWarningModal] = useState(false);
    const [selectedSuggestion, setSelectedSuggestion] = useState(null);

    // Generate smart suggestions based on project type
    const generateSmartSuggestions = (project) => {
        const suggestions = [];
        const components = project.components || [];
        const componentNames = components.map(c => c.name.toLowerCase());

        // Project type-based suggestions
        if (project.projectType === 'sweater') {
            if (!componentNames.some(name => name.includes('left sleeve'))) {
                suggestions.push({
                    type: 'new',
                    name: 'Left Sleeve',
                    construction: project.construction || 'flat',
                    setupNotes: 'Sleeve construction for sweater'
                });
            }

            if (componentNames.some(name => name.includes('left sleeve')) &&
                !componentNames.some(name => name.includes('right sleeve'))) {
                const leftSleeve = components.find(c => c.name.toLowerCase().includes('left sleeve'));
                suggestions.push({
                    type: 'copy',
                    name: 'Right Sleeve',
                    sourceComponent: leftSleeve,
                    setupNotes: 'Mirror of left sleeve'
                });
            }

            if (!componentNames.some(name => name.includes('collar') || name.includes('neckline'))) {
                suggestions.push({
                    type: 'new',
                    name: 'Collar',
                    construction: 'round',
                    setupNotes: 'Pick up stitches from neckline'
                });
            }

            if (project.projectType === 'cardigan' &&
                !componentNames.some(name => name.includes('button'))) {
                suggestions.push({
                    type: 'new',
                    name: 'Button Band',
                    construction: 'flat',
                    setupNotes: 'Pick up stitches along front edge'
                });
            }
        }

        if (project.projectType === 'hat') {
            if (!componentNames.some(name => name.includes('crown'))) {
                suggestions.push({
                    type: 'new',
                    name: 'Crown',
                    construction: 'round',
                    setupNotes: 'Decrease section for top of hat'
                });
            }

            if (!componentNames.some(name => name.includes('brim'))) {
                suggestions.push({
                    type: 'new',
                    name: 'Brim',
                    construction: 'round',
                    setupNotes: 'Bottom edge of hat'
                });
            }
        }

        // Limit to 3 suggestions for clean UI
        return suggestions.slice(0, 3);
    };

    // Status categories configuration
    const statusCategories = [
        {
            status: 'edit_mode',
            title: '✏️ Edit Mode',
            subtitle: 'Needs Work',
            headerStyle: 'bg-yarn-100 border-yarn-300 text-yarn-800',
            priority: 1
        },
        {
            status: 'ready_to_knit',
            title: '⚡ Ready to Knit',
            subtitle: '',
            headerStyle: 'bg-sage-100 border-sage-300 text-sage-800',
            priority: 2
        },
        {
            status: 'currently_knitting',
            title: '🧶 Currently Knitting',
            subtitle: '',
            headerStyle: 'bg-sage-200 border-sage-400 text-sage-800',
            priority: 3
        },
        {
            status: 'finished',
            title: '✅ Finished',
            subtitle: '',
            headerStyle: 'bg-sage-300 border-sage-500 text-sage-800',
            priority: 4
        }
    ];

    // Get component status using existing logic from CompactComponentCard
    const getComponentStatus = (component) => {
        // Handle finishing steps
        if (component.type === 'finishing') {
            if (component.isPlaceholder || !component.steps || component.steps.length === 0) {
                return 'finishing_in_progress';
            }

            const allComplete = component.steps.every(s => s.completed);
            const manuallyConfirmed = component.finishingComplete;

            if (allComplete && manuallyConfirmed) return 'finishing_done';
            return 'finishing_in_progress';
        }

        // Regular component logic
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

    // Group components by status
    const getComponentsByStatus = (status) => {
        return project.components.filter(component => {
            const componentStatus = getComponentStatus(component);
            // Map finishing statuses to main categories
            if (status === 'currently_knitting' &&
                (componentStatus === 'finishing_in_progress' || componentStatus === 'finishing_done')) {
                return true;
            }
            return componentStatus === status;
        });
    };

    const suggestedComponents = generateSmartSuggestions(project);
    const totalComponents = project.components.length;

    // Handle suggestion selection
    const handleSuggestionSelect = (suggestion) => {
        IntelliKnitLogger.debug('Suggestion selected', suggestion);

        if (suggestion.type === 'copy') {
            // Show copy warning modal first
            setSelectedSuggestion(suggestion);
            setShowCopyWarningModal(true);
        } else {
            // Direct creation with prefilled data
            openSmartComponentCreation({
                name: suggestion.name,
                construction: suggestion.construction,
                setupNotes: suggestion.setupNotes
            });
        }
    };

    const handleConfirmCopy = () => {
        const suggestion = selectedSuggestion;
        const copiedComponent = {
            ...suggestion.sourceComponent,
            name: suggestion.name,
            id: generateNewId(),
            setupNotes: suggestion.setupNotes,
            steps: suggestion.sourceComponent.steps.map(step => ({
                ...step,
                id: generateNewId(),
                completed: false
            }))
        };

        // Open wizard with copied data
        openSmartComponentCreation(copiedComponent);
        setShowCopyWarningModal(false);
    };

    // Open Smart Component Creation with prefilled data
    const openSmartComponentCreation = (prefilledData = {}) => {
        IntelliKnitLogger.debug('Opening SmartComponentCreation with data', prefilledData);
        // This would integrate with existing SmartComponentCreation
        // For now, falling back to existing creation method
        onShowEnhancedCreation();
    };

    const generateNewId = () => {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    };

    // Handle component actions
    const handleComponentAction = (component, action) => {
        IntelliKnitLogger.debug('Component action', { component: component.name, action });

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

    // Handle more options (future enhancement)
    const handleMoreOptions = () => {
        IntelliKnitLogger.debug('More options clicked');
        // Future: Show additional management options
    };

    return (
        <div className="p-6">
            {/* Header with maintenance focus */}
            <div className="content-header-with-buttons">
                <h2 className="content-title">🧶 Components [{totalComponents}]</h2>
                <div className="button-group">
                    <button
                        onClick={() => openSmartComponentCreation()}
                        className="btn-primary btn-sm"
                    >
                        + Add
                    </button>
                    <button
                        onClick={handleMoreOptions}
                        className="btn-tertiary btn-sm"
                    >
                        ⋮⋮
                    </button>
                </div>
            </div>

            {/* Smart Suggestion Bubbles */}
            {suggestedComponents.length > 0 && (
                <div className="mb-6">
                    <div className="flex flex-wrap gap-2">
                        {suggestedComponents.map(suggestion => (
                            <SuggestionBubble
                                key={`${suggestion.type}-${suggestion.name}`}
                                suggestion={suggestion}
                                onSelect={handleSuggestionSelect}
                            />
                        ))}
                    </div>
                </div>
            )}

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

            {/* Copy Warning Modal */}
            {showCopyWarningModal && selectedSuggestion && (
                <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-4 border-b border-gray-200">
                            <div className="flex items-center gap-3">
                                <div className="text-2xl">🔄</div>
                                <div className="flex-1">
                                    <h2 className="text-lg font-semibold">Copy Component</h2>
                                    <p className="text-sage-600 text-sm">Copying from {selectedSuggestion.sourceComponent?.name}</p>
                                </div>
                                <button
                                    onClick={() => setShowCopyWarningModal(false)}
                                    className="text-gray-400 hover:text-gray-600 text-xl font-bold w-8 h-8 flex items-center justify-center"
                                >
                                    ×
                                </button>
                            </div>
                        </div>

                        <div className="p-6">
                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                                <h4 className="font-medium text-amber-800 mb-2">⚠️ Step Editing Rules</h4>
                                <div className="text-sm text-amber-700 space-y-1">
                                    <p>This will copy all {selectedSuggestion.sourceComponent?.steps?.length || 0} steps from {selectedSuggestion.sourceComponent?.name}.</p>
                                    <p><strong>To modify steps:</strong> Only delete from the end, working backwards.</p>
                                    <p><strong>Reason:</strong> Maintains stitch count dependencies between steps.</p>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowCopyWarningModal(false)}
                                    className="btn-tertiary flex-1"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleConfirmCopy}
                                    className="btn-primary flex-1"
                                >
                                    Continue with Copy
                                </button>
                                <button
                                    onClick={() => {
                                        setShowCopyWarningModal(false);
                                        openSmartComponentCreation({
                                            name: selectedSuggestion.name,
                                            construction: selectedSuggestion.construction,
                                            setupNotes: selectedSuggestion.setupNotes
                                        });
                                    }}
                                    className="btn-secondary flex-1"
                                >
                                    Start Fresh Instead
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// Suggestion Bubble Component
const SuggestionBubble = ({ suggestion, onSelect }) => (
    <button
        onClick={() => onSelect(suggestion)}
        className="suggestion-bubble"
    >
        {suggestion.type === 'copy' && '🔄 '}
        {suggestion.name}
    </button>
);

// Component Status Section Component
const ComponentStatusSection = ({ category, components, onComponentAction, openMenuId, setOpenMenuId }) => {
    if (components.length === 0) return null;

    return (
        <div className="mb-6">
            {/* Category Header */}
            <div className={`${category.headerStyle} rounded-t-xl border-2 p-4 flex justify-between items-center`}>
                <div>
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        {category.title}
                    </h3>
                    {category.subtitle && (
                        <p className="text-sm opacity-75">{category.subtitle}</p>
                    )}
                </div>
                <span className="text-sm font-medium px-2 py-1 bg-white bg-opacity-20 rounded-full">
                    {components.length}
                </span>
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

// Component Maintenance Card Component
const ComponentMaintenanceCard = ({ component, status, onAction, openMenuId, setOpenMenuId }) => {
    const [showMenu, setShowMenu] = useState(false);

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
            case 'edit_mode': return { icon: '✏️', label: 'Edit', action: 'edit' };
            case 'ready_to_knit': return { icon: '🎯', label: 'Ready', action: 'edit' };
            case 'currently_knitting': return { icon: '▶️', label: 'Continue', action: 'edit' };
            case 'finished': return { icon: '👁️', label: 'View', action: 'view' };
            default: return { icon: '✏️', label: 'Edit', action: 'edit' };
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
        <div className="group relative">
            <div className="flex items-center gap-3 p-4 min-h-[60px] hover:bg-gray-50 transition-colors">
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
                <div className="flex items-center gap-2">
                    {/* Drag Handle */}
                    <div className="text-gray-400 cursor-move opacity-0 group-hover:opacity-100 transition-opacity">
                        ⋮⋮
                    </div>

                    {/* Main Action */}
                    <button
                        onClick={() => onAction(component, mainAction.action)}
                        className="btn-tertiary btn-sm flex items-center gap-1"
                    >
                        {mainAction.icon}
                    </button>

                    {/* Menu Button */}
                    <div className="relative">
                        <button
                            onClick={handleMenuToggle}
                            className="btn-tertiary btn-sm"
                        >
                            ⋮⋮⋮
                        </button>

                        {openMenuId === component.id && (
                            <ComponentActionMenu
                                component={component}
                                status={status}
                                onAction={onAction}
                                onClose={() => setOpenMenuId(null)}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// Component Action Menu Component
const ComponentActionMenu = ({ component, status, onAction, onClose }) => (
    <>
        {/* Backdrop for click-outside */}
        <div
            className="fixed inset-0 z-[90]"
            onMouseDown={onClose}
            aria-hidden="true"
        />

        {/* Menu */}
        <div className="absolute right-0 top-full mt-1 bg-white border-2 border-gray-200 rounded-lg shadow-lg z-[100] min-w-[120px]">
            <div className="py-1">
                <button
                    onClick={() => { onAction(component, 'rename'); onClose(); }}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                >
                    ✏️ Rename
                </button>
                <button
                    onClick={() => { onAction(component, 'copy'); onClose(); }}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                >
                    🔄 Copy
                </button>
                {status === 'finished' && (
                    <button
                        onClick={() => { onAction(component, 'reset'); onClose(); }}
                        className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                    >
                        🔄 Reset Progress
                    </button>
                )}
                <hr className="my-1" />
                <button
                    onClick={() => { onAction(component, 'delete'); onClose(); }}
                    className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                    disabled={component.steps?.some(s => s.completed)}
                >
                    🗑️ Delete
                </button>
            </div>
        </div>
    </>
);

export default ComponentsTab;