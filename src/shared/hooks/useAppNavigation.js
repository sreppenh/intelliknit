// src/shared/hooks/useAppNavigation.js
import { useProjectsContext } from '../../features/projects/hooks/useProjectsContext';

export const useAppNavigation = (setCurrentView, setSelectedProjectType = null, setProjectCreationSource = null) => {
    const { dispatch } = useProjectsContext();

    // Universal home navigation - clears all state
    const goToLanding = () => {
        setCurrentView('landing');
        // Clear all global state when going home
        dispatch({ type: 'SET_CURRENT_PROJECT', payload: null });
        dispatch({ type: 'SET_SELECTED_COMPONENT_INDEX', payload: null });
        dispatch({ type: 'SET_ACTIVE_COMPONENT_INDEX', payload: null });

        // Clear project creation state if setters provided
        if (setSelectedProjectType) setSelectedProjectType(null);
        if (setProjectCreationSource) setProjectCreationSource(null);
    };

    // Navigate to project list - clears project but keeps user in projects area
    const goToProjectList = () => {
        setCurrentView('project-list');
        dispatch({ type: 'SET_CURRENT_PROJECT', payload: null });
        dispatch({ type: 'SET_SELECTED_COMPONENT_INDEX', payload: null });
    };

    // Navigate back to project detail - clears component selection
    const goToProjectDetail = () => {
        setCurrentView('project-detail');
        dispatch({ type: 'SET_SELECTED_COMPONENT_INDEX', payload: null });
    };

    // Navigate to specific views with proper state management
    const goToStepWizard = (componentIndex) => {
        dispatch({ type: 'SET_SELECTED_COMPONENT_INDEX', payload: componentIndex });
        setCurrentView('step-wizard');
    };

    const goToManageSteps = (componentIndex) => {
        dispatch({ type: 'SET_SELECTED_COMPONENT_INDEX', payload: componentIndex });
        setCurrentView('manage-steps');
    };

    const goToTracking = (componentIndex) => {
        dispatch({ type: 'SET_ACTIVE_COMPONENT_INDEX', payload: componentIndex });
        setCurrentView('tracking');
    };

    const goToComponentDetail = (componentIndex) => {
        dispatch({ type: 'SET_SELECTED_COMPONENT_INDEX', payload: componentIndex });
        setCurrentView('component-detail');
    };

    const goToEditProjectDetails = () => {
        setCurrentView('edit-project-details');
    };

    return {
        goToLanding,
        goToProjectList,
        goToProjectDetail,
        goToStepWizard,
        goToManageSteps,
        goToTracking,
        goToComponentDetail,
        goToEditProjectDetails
    };
};