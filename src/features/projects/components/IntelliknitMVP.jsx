// features/projects/components/IntelliknitMVP.jsx
import React, { useState } from 'react';
import { ProjectsProvider, useProjectsContext } from '../hooks/useProjectsContext';
import ProjectList from './ProjectList';
import CreateProject from './CreateProject';
import ProjectDetail from './ProjectDetail';
import ComponentDetail from './ComponentDetail';
import EditProjectDetails from './EditProjectDetails'; // NEW IMPORT
import Tracking from './Tracking';
import StepWizard from '../../steps/components/StepWizard';
import ManageSteps from '../../steps/components/ManageSteps';
import ProjectTypeSelector from './ProjectTypeSelector';

const IntelliknitMVPContent = () => {
  const [currentView, setCurrentView] = useState('project-list');
  const { dispatch, selectedComponentIndex } = useProjectsContext();
  const [selectedProjectType, setSelectedProjectType] = useState(null);
  
  const handleCreateProject = () => {
    setCurrentView('project-type-selector');
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
    setCurrentView('step-wizard');
  };
  
const handleManageSteps = (componentIndex) => {
  dispatch({ type: 'SET_SELECTED_COMPONENT_INDEX', payload: componentIndex });
  setCurrentView('manage-steps');
};
  
  const handleStartKnitting = (componentIndex) => {
    dispatch({ type: 'SET_ACTIVE_COMPONENT_INDEX', payload: componentIndex });
    setCurrentView('tracking');
  };

  // NEW: Handle edit project details
  const handleEditProjectDetails = () => {
    setCurrentView('edit-project-details');
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
      onBack={() => setCurrentView('project-type-selector')}
      onProjectCreated={handleProjectCreated}
      selectedProjectType={selectedProjectType} // NEW LINE
        />
      );

      case 'project-type-selector':
  return (
    <ProjectTypeSelector
      onBack={handleBackToProjectList}
      onContinue={() => setCurrentView('create-project')}
      selectedType={selectedProjectType}
      onTypeSelect={setSelectedProjectType}
    />
  );
    case 'project-detail':
      return (
        <ProjectDetail
  onBack={handleBackToProjectList}
  onViewComponent={handleViewComponent}
  onEditSteps={handleEditSteps}         // Keep this for wizard
  onManageSteps={handleManageSteps}     // ✅ Add this for ManageSteps
  onStartKnitting={handleStartKnitting}
  onEditProjectDetails={handleEditProjectDetails}
/>
      );
    case 'edit-project-details': // NEW CASE
      return (
        <EditProjectDetails
          onBack={handleBackToProjectDetail}
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
    case 'step-wizard':
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
      <div className="min-h-screen bg-yarn-50">
        <IntelliknitMVPContent />
      </div>
    </ProjectsProvider>
  );
};

export default IntelliknitMVP;