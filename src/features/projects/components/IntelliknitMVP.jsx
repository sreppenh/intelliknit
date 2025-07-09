// features/projects/components/IntelliknitMVP.jsx
import React, { useState } from 'react';
import { ProjectsProvider, useProjectsContext } from '../hooks/useProjectsContext';
import ProjectList from './ProjectList';
import CreateProject from './CreateProject';
import ProjectDetail from './ProjectDetail';
import ComponentDetail from './ComponentDetail';
import Tracking from './Tracking';
import StepWizard from '../../steps/components/StepWizard'; // NEW: Use refactored wizard
import ManageSteps from '../../steps/components/ManageSteps';

const IntelliknitMVPContent = () => {
  const [currentView, setCurrentView] = useState('project-list');
  const { dispatch, selectedComponentIndex } = useProjectsContext();

  const handleCreateProject = () => {
    setCurrentView('create-project');
  };

  const handleProjectCreated = () => {
    setCurrentView('project-detail');
  };

  const handleOpenProject = (project) => {
    dispatch({ type: 'SET_CURRENT_PROJECT', payload: project });
    setCurrentView('project-detail');
  };

  const handleViewComponent = (componentIndex) => {
    dispatch({ type: 'SET_SELECTED_COMPONENT_INDEX', payload: componentIndex });
    setCurrentView('component-detail');
  };

  const handleEditSteps = (componentIndex) => {
    dispatch({ type: 'SET_SELECTED_COMPONENT_INDEX', payload: componentIndex });
    setCurrentView('step-wizard'); // UPDATED: Use new step wizard
  };

  const handleManageSteps = (componentIndex) => {
    dispatch({ type: 'SET_SELECTED_COMPONENT_INDEX', payload: componentIndex });
    setCurrentView('manage-steps');
  };

  const handleStartKnitting = (componentIndex) => {
    dispatch({ type: 'SET_ACTIVE_COMPONENT_INDEX', payload: componentIndex });
    setCurrentView('tracking');
  };

  const handleBackToProjectList = () => {
    setCurrentView('project-list');
    dispatch({ type: 'SET_CURRENT_PROJECT', payload: null });
  };

  const handleBackToProjectDetail = () => {
    setCurrentView('project-detail');
    dispatch({ type: 'SET_SELECTED_COMPONENT_INDEX', payload: null });
  };

  // Router logic based on current view
  switch (currentView) {
    case 'project-list':
      return (
        <ProjectList
          onCreateProject={handleCreateProject}
          onOpenProject={handleOpenProject}
        />
      );

    case 'create-project':
      return (
        <CreateProject
          onBack={handleBackToProjectList}
          onProjectCreated={handleProjectCreated}
        />
      );

    case 'project-detail':
      return (
        <ProjectDetail
          onBack={handleBackToProjectList}
          onViewComponent={handleViewComponent}
          onEditSteps={handleEditSteps}
          onStartKnitting={handleStartKnitting}
        />
      );

    case 'component-detail':
      return (
        <ComponentDetail
          componentIndex={selectedComponentIndex}
          onBack={handleBackToProjectDetail}
          onManageSteps={handleManageSteps}
          onStartKnitting={handleStartKnitting}
        />
      );

    case 'step-wizard': // UPDATED: New clean wizard
      return (
        <StepWizard
          componentIndex={selectedComponentIndex}
          onBack={handleBackToProjectDetail}
        />
      );

    case 'manage-steps':
      return (
        <ManageSteps
          componentIndex={selectedComponentIndex}
          onBack={handleBackToProjectDetail}
        />
      );

    case 'tracking':
      return (
        <Tracking
          onBack={handleBackToProjectDetail}
          onEditSteps={handleEditSteps}
        />
      );

    default:
      return <div>View not found</div>;
  }
};

const IntelliknitMVP = () => {
  return (
    <ProjectsProvider>
      <IntelliknitMVPContent />
    </ProjectsProvider>
  );
};

export default IntelliknitMVP;