import React, { useState, useEffect, useRef } from 'react';
import IntelliKnitLogger from '../../../../../shared/utils/ConsoleLogging';
import useThreeDotMenu from '../../../../../shared/hooks/useThreeDotMenu';
import TabContent from '../../../../../shared/components/TabContent';
import { validateComponentTab, extractComponentProps } from '../types/TabProps';

const ComponentsTab = (props) => {
    // Validate props in development
    validateComponentTab(props);

    // Extract standardized props
    const {
        project,
        onShowEnhancedCreation,
        onComponentManageSteps,
        onComponentMenuAction
    } = extractComponentProps(props);

    const statusCategories = [
        {
            status: 'edit_mode',
            title: '✏️ Edit Mode',
            instruction: 'Tap card to add steps',
            headerStyle: 'header-status-edit-mode', // ✅ NEW - matches yarn colors
        },
        {
            status: 'ready_to_knit',
            title: '⚡ Ready to Knit',
            instruction: 'Tap card to continue knitting',
            headerStyle: 'header-status-ready', // ✅ UPDATED - simpler name
        },
        {
            status: 'currently_knitting',
            title: '🧶 Currently Knitting',
            instruction: 'Tap card to continue knitting',
            headerStyle: 'header-status-progress', // ✅ UPDATED - simpler name
        },
        {
            status: 'finished',
            title: '✅ Finished',
            instruction: 'Tap card to view details',
            headerStyle: 'header-status-complete', // ✅ UPDATED - simpler name
        }
    ];

    const { openMenuId, setOpenMenuId, handleMenuToggle, handleMenuAction } = useThreeDotMenu();

    // DEBUG: Let's see what we got from the hook
    console.log('🔧 Hook values:', { openMenuId, setOpenMenuId, handleMenuToggle, handleMenuAction });

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
        // Route to proper enhanced creation flow
        onShowEnhancedCreation();
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
                const menuResult = handleMenuAction(action, component.id);
                onComponentMenuAction(menuResult.action, menuResult.itemId);
                break;
            default:
                IntelliKnitLogger.warn('Unknown component action', action);
        }
    };

    return (
        <TabContent
            showEmptyState={totalComponents === 0}
            emptyState={
                <div>
                    <div className="text-4xl mb-3">🧶</div>
                    <h3 className="font-semibold text-wool-700 mb-2">Ready to Begin</h3>
                    <p className="text-wool-500 text-sm mb-4">Add your first component to start building your project</p>
                    <button
                        onClick={onShowEnhancedCreation}
                        className="btn-primary w-full"
                    >
                        + Add Component
                    </button>
                </div>
            }
        >
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
                                handleMenuToggle={handleMenuToggle}
                            />
                        );
                    })}
                </div>
            </div>
        </TabContent>
    );
};

// Component Status Section
const ComponentStatusSection = ({ category, components, onComponentAction, openMenuId, setOpenMenuId, handleMenuToggle }) => {
    console.log('🔧 ComponentStatusSection props:', { openMenuId, setOpenMenuId, handleMenuToggle });

    if (components.length === 0) return null;

    return (
        <div className="mb-6">
            {/* Category Header */}
            <div className={`${category.headerStyle} rounded-t-xl border-2 p-4 flex justify-between items-center`}>
                <div>
                    <h3 className="text-base font-semibold flex items-center gap-2">
                        {category.title} ({components.length})
                        <span className="text-sm font-normal opacity-75 ml-2">
                            {category.instruction}
                        </span>
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
                        handleMenuToggle={handleMenuToggle}
                        closeMenu={() => setOpenMenuId(null)}
                    />
                ))}
            </div>
        </div>
    );
};

// Component Maintenance Card
const ComponentMaintenanceCard = ({ component, status, onAction, openMenuId, handleMenuToggle, closeMenu }) => {
    const buttonRef = useRef(null);
    const [menuPosition, setMenuPosition] = useState('bottom');


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

    // Smart positioning logic
    useEffect(() => {
        if (openMenuId === component.id && buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            const viewportHeight = window.innerHeight;
            const spaceBelow = viewportHeight - rect.bottom;

            // If less than 200px space below, show menu above
            setMenuPosition(spaceBelow < 200 ? 'top' : 'bottom');
        }
    }, [openMenuId, component.id]);

    const handleComponentMenuToggle = (e) => {
        handleMenuToggle(component.id, e);
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
                            ref={buttonRef}
                            onClick={handleComponentMenuToggle}
                            className={`p-1.5 text-wool-400 hover:text-wool-600 hover:bg-wool-200 rounded-full transition-colors ${openMenuId && openMenuId === component.id ? 'relative z-[101]' : ''}`}
                        >
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                                <circle cx="8" cy="3" r="1.5" />
                                <circle cx="8" cy="8" r="1.5" />
                                <circle cx="8" cy="13" r="1.5" />
                            </svg>
                        </button>

                        {(openMenuId && openMenuId === component.id) && (
                            <>
                                {/* Backdrop for click-outside */}
                                <div
                                    className="fixed inset-0 z-[90]"
                                    onMouseDown={() => closeMenu()}
                                    aria-hidden="true"
                                />

                                {/* Menu with simple absolute positioning */}
                                <div className={`absolute right-4 ${menuPosition === 'top' ? 'bottom-4' : 'top-2'} bg-white border-2 border-wool-200 rounded-xl shadow-xl z-[100] min-w-32 overflow-hidden transform transition-all duration-200 ease-out animate-in`}><button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onAction(component, 'rename');
                                        closeMenu();
                                    }}
                                    className="w-full px-4 py-3 text-left text-wool-600 hover:bg-sage-50 text-sm flex items-center gap-2 transition-colors font-medium"
                                >
                                    ✏️ Rename
                                </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onAction(component, 'copy');
                                            closeMenu();
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
                                                closeMenu();
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
                                            closeMenu();
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