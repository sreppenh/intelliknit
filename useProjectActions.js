import { useState } from 'react';

/**
 * useProjectActions - Centralized action handlers and modal state management for ProjectDetail
 * 
 * This hook extracts all the action handlers and modal state management from ProjectDetail.jsx
 * to create a clean separation of concerns and reduce file complexity.
 */
const useProjectActions = (currentProject, dispatch, callbacks) => {
    const { onBack, onEditSteps, onManageSteps, onEditProjectDetails } = callbacks;

    // Component creation and celebration state
    const [showEnhancedCreation, setShowEnhancedCreation] = useState(false);
    const [showCelebrationScreen, setShowCelebrationScreen] = useState(false);
    const [celebrationComponent, setCelebrationComponent] = useState(null);

    // Project modal state
    const [showCompleteProjectModal, setShowCompleteProjectModal] = useState(false);

    // Three-dot menu state (CRITICAL: preserve exact functionality)
    const [openMenuId, setOpenMenuId] = useState(null);

    // Component action modal states
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [componentToDelete, setComponentToDelete] = useState(null);
    const [showRenameModal, setShowRenameModal] = useState(false);
    const [componentToRename, setComponentToRename] = useState(null);
    const [showCopyModal, setShowCopyModal] = useState(false);
    const [componentToCopy, setComponentToCopy] = useState(null);

    // PROJECT ACTIONS
    const handleCompleteProject = () => {
        dispatch({ type: 'COMPLETE_PROJECT' });
        setShowCompleteProjectModal(false);
        onBack();
    };

    // COMPONENT CREATION ACTIONS
    const handleShowEnhancedCreation = () => {
        setShowEnhancedCreation(true);
    };

    const handleEnhancedComponentCreated = (newComponent) => {
        setCelebrationComponent(newComponent);
        setShowEnhancedCreation(false);
        setShowCelebrationScreen(true);
    };

    const handleCelebrationAddSteps = () => {
        setShowCelebrationScreen(false);
        const newComponentIndex = currentProject.components.length - 1;
        onManageSteps(newComponentIndex);
    };

    const handleCelebrationAddAnother = () => {
        setShowCelebrationScreen(false);
        setCelebrationComponent(null);
        setShowEnhancedCreation(true);
    };

    const handleCelebrationClose = () => {
        setShowCelebrationScreen(false);
        setCelebrationComponent(null);
    };

    // COMPONENT MANAGEMENT ACTIONS
    const handleComponentManageSteps = (componentId) => {
        if (componentId === 'finishing-steps') {
            return;
        }

        const componentIndex = currentProject.components.findIndex(c => c.id === componentId);
        onManageSteps(componentIndex);
    };

    // THREE-DOT MENU ACTIONS (CRITICAL: preserve exact functionality)
    const handleComponentMenuAction = (action, componentId) => {
        const componentIndex = currentProject.components.findIndex(c => c.id === componentId);
        const component = currentProject.components[componentIndex];

        if (action === 'manage') {
            onEditSteps(componentIndex);
        } else if (action === 'rename') {
            setComponentToRename(component);
            setShowRenameModal(true);
        } else if (action === 'copy') {
            setComponentToCopy(component);
            setShowCopyModal(true);
        } else if (action === 'delete') {
            setComponentToDelete(component);
            setShowDeleteModal(true);
        }
    };

    // MODAL HANDLERS
    const modalHandlers = {
        // Complete Project Modal
        showCompleteProject: () => setShowCompleteProjectModal(true),
        closeCompleteProject: () => setShowCompleteProjectModal(false),

        // Component Creation Flow
        hideEnhancedCreation: () => setShowEnhancedCreation(false),

        // Delete Modal
        closeDeleteModal: () => {
            setShowDeleteModal(false);
            setComponentToDelete(null);
        },
        confirmDeleteComponent: () => {
            const componentIndex = currentProject.components.findIndex(c => c.id === componentToDelete.id);
            dispatch({
                type: 'DELETE_COMPONENT',
                payload: componentIndex
            });
            setShowDeleteModal(false);
            setComponentToDelete(null);
        },

        // Rename Modal
        closeRenameModal: () => {
            setShowRenameModal(false);
            setComponentToRename(null);
        },
        confirmRenameComponent: (newName) => {
            const componentIndex = currentProject.components.findIndex(c => c.id === componentToRename.id);
            const updatedComponents = [...currentProject.components];
            updatedComponents[componentIndex] = {
                ...componentToRename,
                name: newName
            };

            const updatedProject = {
                ...currentProject,
                components: updatedComponents
            };

            dispatch({
                type: 'UPDATE_PROJECT',
                payload: updatedProject
            });

            setShowRenameModal(false);
            setComponentToRename(null);
        },

        // Copy Modal
        closeCopyModal: () => {
            setShowCopyModal(false);
            setComponentToCopy(null);
        },
        confirmCopyComponent: (newName) => {
            const componentIndex = currentProject.components.findIndex(c => c.id === componentToCopy.id);
            dispatch({
                type: 'COPY_COMPONENT',
                payload: { sourceIndex: componentIndex, newName: newName }
            });
            setShowCopyModal(false);
            setComponentToCopy(null);
        }
    };

    // Return organized interface
    return {
        // Project-level actions
        projectActions: {
            completeProject: handleCompleteProject,
            editProjectDetails: onEditProjectDetails
        },

        // Component-level actions
        componentActions: {
            showEnhancedCreation: handleShowEnhancedCreation,
            manageSteps: handleComponentManageSteps,
            menuAction: handleComponentMenuAction, // CRITICAL: three-dot menu handler

            // Component creation flow
            onEnhancedComponentCreated: handleEnhancedComponentCreated,
            onCelebrationAddSteps: handleCelebrationAddSteps,
            onCelebrationAddAnother: handleCelebrationAddAnother,
            onCelebrationClose: handleCelebrationClose
        },

        // Modal states (for conditionally rendering modals)
        modalStates: {
            showCompleteProjectModal,
            showEnhancedCreation,
            showCelebrationScreen,
            celebrationComponent,

            // Component action modals
            showDeleteModal,
            componentToDelete,
            showRenameModal,
            componentToRename,
            showCopyModal,
            componentToCopy,

            // Three-dot menu state (CRITICAL)
            openMenuId,
            setOpenMenuId
        },

        // Modal handlers
        modalHandlers
    };
};

export default useProjectActions;