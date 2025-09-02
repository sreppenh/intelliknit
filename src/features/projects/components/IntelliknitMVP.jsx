// features/projects/components/IntelliknitMVP.jsx
import React, { useState } from 'react';
import { ProjectsProvider, useProjectsContext } from '../hooks/useProjectsContext';
import LandingPage from './LandingPage';
import ProjectList from './ProjectList';
import CreateProject from './CreateProject';
import ProjectDetail from './ProjectDetail';
import ComponentDetail from './ComponentDetail';
import EditProjectDetails from './EditProjectDetails';
import Tracking from '../../knitting/components/Tracking';
import StepWizard from '../../steps/components/StepWizard';
import ManageSteps from '../../steps/components/ManageSteps';
import ProjectTypeSelector from './ProjectTypeSelector';
import { useAppNavigation } from '../../../shared/hooks/useAppNavigation';
import { NotesProvider } from '../../../features/notes/hooks/useNotesContext';
import NotesList from '../../../features/notes/components/NotesList';
import NoteDetail from '../../../features/notes/components/NoteDetail';
import { useNotesContext } from '../../../features/notes/hooks/useNotesContext';
import CreateNoteWizard from '../../notes/components/CreateNoteWizard';
import ConfigureNotePattern from '../../notes/components/ConfigureNotePattern';
import NoteCounter from '../../notes/components/NoteCounter';


const IntelliknitMVPContent = () => {
  const [currentView, setCurrentView] = useState('landing');
  const { dispatch, selectedComponentIndex, projects } = useProjectsContext();
  const [selectedProjectType, setSelectedProjectType] = useState(null);
  const [projectCreationSource, setProjectCreationSource] = useState(null);

  const {
    goToLanding,
    goToProjectList,
    goToProjectDetail,
    goToStepWizard,
    goToManageSteps,
    goToTracking,
    goToComponentDetail,
    goToEditProjectDetails
  } = useAppNavigation(setCurrentView, setSelectedProjectType, setProjectCreationSource);

  const handleAddNewProject = () => {
    setProjectCreationSource('landing');
    setCurrentView('project-type-selector');
  };

  const handleViewProjects = () => {
    setCurrentView('project-list');
  };

  const handleContinueKnitting = (resumeData) => {
    console.log('Resume data received:', resumeData);
    console.log('Projects array:', projects);
    console.log('Looking for project ID:', resumeData?.projectId);
    console.log('Available project IDs:', projects?.map(p => ({ id: p.id, name: p.name })));

    if (!resumeData || !resumeData.hasActiveProject) {
      setCurrentView('project-list');
      return;
    }

    const targetProject = projects.find(p => p.id === resumeData.projectId);
    console.log('Found target project:', targetProject);

    if (!targetProject) {
      alert("Could not find your recent project. It may have been deleted.");
      setCurrentView('project-list');
      return;
    }

    // If no specific component, use the current active component or default to 0
    let componentIndex = 0;
    if (resumeData.componentId) {
      componentIndex = targetProject.components.findIndex(c => c.id === resumeData.componentId);
      if (componentIndex === -1) {
        componentIndex = targetProject.currentComponent || 0;
      }
    } else {
      // No componentId from localStorage, use project's current component
      componentIndex = targetProject.currentComponent || 0;
    }

    dispatch({ type: 'SET_CURRENT_PROJECT', payload: targetProject });
    dispatch({ type: 'SET_ACTIVE_COMPONENT_INDEX', payload: componentIndex });
    setCurrentView('tracking');
  };

  const handleNotepad = () => {
    setCurrentView('note-list');
  };

  const handleCreateProject = () => {
    setProjectCreationSource('project-list');
    setCurrentView('project-type-selector');
  };

  const handleBackFromProjectTypeSelector = () => {
    if (projectCreationSource === 'project-list') {
      setCurrentView('project-list');
    } else {
      setCurrentView('landing');
    }
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

  const handleEditProjectDetails = () => {
    setCurrentView('edit-project-details');
  };

  const handleBackToLanding = () => {
    setCurrentView('landing');
    dispatch({ type: 'SET_CURRENT_PROJECT', payload: null });
  };

  const handleBackToProjectList = () => {
    setCurrentView('project-list');
    dispatch({ type: 'SET_CURRENT_PROJECT', payload: null });
  };

  const handleExitProjectCreationToProjectList = () => {
    setCurrentView('project-list');
    setSelectedProjectType(null);
    dispatch({ type: 'SET_CURRENT_PROJECT', payload: null });
  };

  const handleBackToProjectDetail = () => {
    setCurrentView('project-detail');
    dispatch({ type: 'SET_SELECTED_COMPONENT_INDEX', payload: null });
  };

  // Get notes context
  const notesContext = useNotesContext();

  const handleOpenNote = (note) => {
    notesContext.setCurrentNote(note);
    setCurrentView('note-detail');
  };

  const handleNoteEditSteps = (componentIndex) => {
    notesContext.setSelectedComponentIndex(componentIndex);
    setCurrentView('configure-note-pattern');
  };

  // Router logic based on current view
  switch (currentView) {
    case 'landing':
      return (
        <LandingPage
          onAddNewProject={handleAddNewProject}
          onViewProjects={handleViewProjects}
          onContinueKnitting={handleContinueKnitting}
          onNotepad={handleNotepad}
        />
      );

    case 'project-list':
      return (
        <ProjectList
          onCreateProject={handleCreateProject}
          onOpenProject={handleOpenProject}
          onBack={handleBackToLanding}
          onGoToLanding={goToLanding}
        />
      );

    case 'create-project':
      return (
        <CreateProject
          onBack={() => setCurrentView('project-type-selector')}
          onProjectCreated={handleProjectCreated}
          selectedProjectType={selectedProjectType}
          onExitToProjectList={projectCreationSource === 'project-list' ? handleExitProjectCreationToProjectList : handleBackToLanding}
        />
      );

    case 'project-type-selector':
      return (
        <ProjectTypeSelector
          onBack={handleBackFromProjectTypeSelector}
          onContinue={() => setCurrentView('create-project')}
          selectedType={selectedProjectType}
          onTypeSelect={setSelectedProjectType}
          onExitToProjectList={handleExitProjectCreationToProjectList}
        />
      );

    case 'project-detail':
      return (
        <ProjectDetail
          onBack={handleBackToProjectList}
          onViewComponent={handleViewComponent}
          onEditSteps={handleEditSteps}
          onManageSteps={handleManageSteps}
          onStartKnitting={handleStartKnitting}
          onEditProjectDetails={handleEditProjectDetails}
          onGoToLanding={goToLanding}
        />
      );

    case 'edit-project-details':
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
          onGoToLanding={goToLanding}
        />
      );

    case 'manage-steps':
      return (
        <ManageSteps
          componentIndex={selectedComponentIndex}
          onBack={handleBackToProjectDetail}
          onStartKnitting={handleStartKnitting}
          onGoToLanding={goToLanding}
        />
      );

    case 'tracking':
      return (
        <Tracking
          onBack={handleBackToProjectDetail}
          onEditSteps={handleEditSteps}
          onGoToLanding={goToLanding}
        />
      );

    case 'note-list':
      return (
        <NotesList
          onBack={handleBackToLanding}
          onGoToLanding={goToLanding}
          onOpenNote={handleOpenNote}
          onCreateNote={() => setCurrentView('create-note')} // Add this line
        />
      );

    case 'note-detail':
      return (
        <NoteDetail
          onBack={() => setCurrentView('note-list')}
          onGoToLanding={goToLanding}
          onEditSteps={handleNoteEditSteps}

        />
      );

    // In IntelliknitMVP.jsx, replace the note creation flow:
    case 'create-note':
      return (
        <CreateNoteWizard
          onBack={() => setCurrentView('note-list')}
          onGoToLanding={goToLanding}
          onNoteCreated={(note) => {
            // The createNote function in the wizard will set the current note
            setCurrentView('note-detail');
          }}
        />
      );

    case 'configure-note-pattern':
      return (
        <ConfigureNotePattern
          onBack={() => setCurrentView('note-detail')}
          onGoToLanding={goToLanding}
        />
      );

    default:
      return <div>View not found</div>;
  }
};



const IntelliknitMVP = () => {
  return (
    <ProjectsProvider>
      <NotesProvider>
        <div className="min-h-screen bg-yarn-50">
          <IntelliknitMVPContent />
        </div>
      </NotesProvider>
    </ProjectsProvider>
  );
};

export default IntelliknitMVP;