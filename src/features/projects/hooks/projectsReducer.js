export const initialState = {
  projects: [],
  currentProject: null,
  selectedComponentIndex: null,
  activeComponentIndex: 0,
  wizardType: 'enhanced'
};

// Helper function to update project activity timestamp
const updateProjectActivity = (project) => ({
  ...project,
  lastActivityAt: new Date().toISOString()
});

export const projectsReducer = (state, action) => {
  // Safety check to ensure state is defined
  if (!state) {
    console.error('State is undefined in projectsReducer');
    return initialState;
  }

  switch (action.type) {
    case 'LOAD_PROJECTS':
      return {
        ...state,
        projects: Array.isArray(action.payload) ? action.payload : []
      };

    case 'CREATE_PROJECT':
      const newProject = {
        id: `project-${Date.now()}`,
        name: action.payload.name.trim(),
        size: action.payload.size?.trim() || 'Not specified',
        defaultUnits: action.payload.defaultUnits || 'inches',
        projectType: action.payload.projectType || 'other', // NEW LINE
        components: [],
        currentComponent: 0,
        createdAt: new Date().toISOString(),
        lastActivityAt: new Date().toISOString(), // NEW: Track activity on creation
        completed: false
      };
      
      return {
        ...state,
        projects: [...state.projects, newProject],
        currentProject: newProject
      };

    case 'UPDATE_PROJECT':
      const updatedProject = {
        ...action.payload,
        updatedAt: new Date().toISOString(),
        lastActivityAt: new Date().toISOString() // NEW: Track activity on update
      };

      return {
        ...state,
        currentProject: updatedProject,
        projects: state.projects.map(p => 
          p.id === updatedProject.id ? updatedProject : p
        )
      };

    case 'SET_CURRENT_PROJECT':
      return {
        ...state,
        currentProject: action.payload
      };

    case 'DELETE_PROJECT':
      const filteredProjects = state.projects.filter(p => p.id !== action.payload);
      return {
        ...state,
        projects: filteredProjects,
        currentProject: state.currentProject?.id === action.payload ? null : state.currentProject
      };

    case 'ADD_COMPONENT':
      if (!state.currentProject) {
        console.error('ADD_COMPONENT: No current project');
        return state;
      }
      
      const newComponent = {
        id: `comp-${Date.now()}`,
        name: action.payload.name.trim(),
        steps: [],
        currentStep: 0
      };

      const projectWithNewComponent = {
        ...state.currentProject,
        components: [...state.currentProject.components, newComponent]
      };

      // NEW: Add activity tracking
      const projectWithComponentActivity = updateProjectActivity(projectWithNewComponent);

      return {
        ...state,
        currentProject: projectWithComponentActivity,
        projects: state.projects.map(p => 
          p.id === state.currentProject.id ? projectWithComponentActivity : p
        )
      };

    case 'ADD_ENHANCED_COMPONENT':
      if (!state.currentProject) return state;
      
      // Create enhanced component with automatic Cast On step
      const enhancedComponent = {
        id: `comp-${Date.now()}`,
        ...action.payload,
        steps: [],
        currentStep: 0
      };

      // Auto-add Cast On step if startingStitches provided
      if (action.payload.startingStitches && action.payload.startingStitches > 0) {
        const castOnStep = {
          id: `step-${Date.now()}-cast-on`,
          description: `Cast on ${action.payload.startingStitches} stitches`,
          type: 'calculated',
          wizardConfig: {
            stitchPattern: {
              pattern: 'Cast On',
              stitchCount: action.payload.startingStitches.toString(),
              method: 'long_tail' // Default method
            }
          },
          startingStitches: 0,
          endingStitches: action.payload.startingStitches,
          totalRows: 1,
          construction: action.payload.construction || 'flat',
          completed: false
        };
        
        enhancedComponent.steps.push(castOnStep);
      }

      const updatedProjectWithEnhanced = {
        ...state.currentProject,
        components: [...state.currentProject.components, enhancedComponent]
      };

      // NEW: Add activity tracking
      const projectWithEnhancedActivity = updateProjectActivity(updatedProjectWithEnhanced);

      return {
        ...state,
        currentProject: projectWithEnhancedActivity,
        projects: state.projects.map(p => 
          p.id === state.currentProject.id ? projectWithEnhancedActivity : p
        )
      };

    case 'DELETE_COMPONENT':
      if (!state.currentProject) {
        console.error('DELETE_COMPONENT: No current project');
        return state;
      }
      
      const updatedComponents = state.currentProject.components.filter(
        (_, index) => index !== action.payload
      );
      
      const projectWithDeletedComponent = {
        ...state.currentProject,
        components: updatedComponents
      };

      // NEW: Add activity tracking
      const projectWithDeleteActivity = updateProjectActivity(projectWithDeletedComponent);

      return {
        ...state,
        currentProject: projectWithDeleteActivity,
        projects: state.projects.map(p => 
          p.id === state.currentProject.id ? projectWithDeleteActivity : p
        )
      };

    case 'COPY_COMPONENT':
      if (!state.currentProject || action.payload.sourceIndex === null) {
        console.error('COPY_COMPONENT: No current project or invalid source index');
        return state;
      }
      
      const { sourceIndex, newName } = action.payload;
      const originalComponent = state.currentProject.components[sourceIndex];
      
      if (!originalComponent) {
        console.error('COPY_COMPONENT: Source component not found');
        return state;
      }

      const copiedComponent = {
        id: `comp-${Date.now()}`,
        name: newName.trim(),
        steps: originalComponent.steps.map((step, index) => ({
          ...step,
          id: `step-copy-${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${index}`,
          completed: false
        })),
        currentStep: 0
      };

      const projectWithCopiedComponent = {
        ...state.currentProject,
        components: [...state.currentProject.components, copiedComponent]
      };

      // NEW: Add activity tracking
      const projectWithCopyActivity = updateProjectActivity(projectWithCopiedComponent);

      return {
        ...state,
        currentProject: projectWithCopyActivity,
        projects: state.projects.map(p => 
          p.id === state.currentProject.id ? projectWithCopyActivity : p
        )
      };

    case 'ADD_CALCULATED_STEP':
      if (!state.currentProject) {
        console.error('ADD_CALCULATED_STEP: No current project');
        return state;
      }
      
      const { componentIndex: calcCompIndex, step: calcStep } = action.payload;
      
      if (calcCompIndex === null || calcCompIndex === undefined || 
          !state.currentProject.components[calcCompIndex]) {
        console.error('ADD_CALCULATED_STEP: Invalid component index', calcCompIndex);
        return state;
      }

      const newCalculatedStep = {
        id: `step-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        description: calcStep.description.trim(),
        type: calcStep.type,
        patternType: calcStep.patternType,
        parsedData: calcStep.parsedData,
        construction: calcStep.construction,
        calculatedRows: calcStep.calculatedRows || [],
        startingStitches: calcStep.startingStitches,
        endingStitches: calcStep.endingStitches,
        totalRows: calcStep.totalRows,
        wizardConfig: calcStep.wizardConfig,
        advancedWizardConfig: calcStep.advancedWizardConfig,
        completed: false
      };

      const componentsWithNewCalculatedStep = [...state.currentProject.components];
      if (!componentsWithNewCalculatedStep[calcCompIndex].steps) {
        componentsWithNewCalculatedStep[calcCompIndex].steps = [];
      }
      componentsWithNewCalculatedStep[calcCompIndex].steps.push(newCalculatedStep);

      const projectWithNewCalculatedStep = {
        ...state.currentProject,
        components: componentsWithNewCalculatedStep
      };

      // NEW: Add activity tracking
      const projectWithCalculatedStepActivity = updateProjectActivity(projectWithNewCalculatedStep);

      return {
        ...state,
        currentProject: projectWithCalculatedStepActivity,
        projects: state.projects.map(p => 
          p.id === state.currentProject.id ? projectWithCalculatedStepActivity : p
        )
      };

    case 'ADD_STEP':
      if (!state.currentProject) {
        console.error('ADD_STEP: No current project');
        return state;
      }
      
      const { componentIndex, step } = action.payload;
      
      if (componentIndex === null || componentIndex === undefined || 
          !state.currentProject.components[componentIndex]) {
        console.error('ADD_STEP: Invalid component index', componentIndex);
        return state;
      }

      if (!step || !step.description) {
        console.error('ADD_STEP: Invalid step data', step);
        return state;
      }

      const newStep = {
        id: `step-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        description: step.description.trim(),
        expectedStitches: parseInt(step.expectedStitches) || 0,
        type: step.type || 'manual',
        construction: step.construction,
        wizardConfig: step.wizardConfig,
        advancedWizardConfig: step.advancedWizardConfig,
        startingStitches: step.startingStitches,
        endingStitches: step.endingStitches || step.expectedStitches,
        totalRows: step.totalRows,
        completed: false
      };

      const componentsWithNewStep = [...state.currentProject.components];
      if (!componentsWithNewStep[componentIndex].steps) {
        componentsWithNewStep[componentIndex].steps = [];
      }
      componentsWithNewStep[componentIndex].steps.push(newStep);

      const projectWithNewStep = {
        ...state.currentProject,
        components: componentsWithNewStep
      };

      // NEW: Add activity tracking
      const projectWithStepActivity = updateProjectActivity(projectWithNewStep);

      return {
        ...state,
        currentProject: projectWithStepActivity,
        projects: state.projects.map(p => 
          p.id === state.currentProject.id ? projectWithStepActivity : p
        )
      };

    case 'DELETE_STEP':
      if (!state.currentProject) {
        console.error('DELETE_STEP: No current project');
        return state;
      }
      
      const { componentIndex: compIndex, stepIndex } = action.payload;
      
      if (compIndex === null || compIndex === undefined || 
          !state.currentProject.components[compIndex] ||
          !state.currentProject.components[compIndex].steps ||
          stepIndex === null || stepIndex === undefined ||
          !state.currentProject.components[compIndex].steps[stepIndex]) {
        console.error('DELETE_STEP: Invalid indices', { compIndex, stepIndex });
        return state;
      }

      const componentsWithDeletedStep = [...state.currentProject.components];
      componentsWithDeletedStep[compIndex].steps = componentsWithDeletedStep[compIndex].steps.filter(
        (_, index) => index !== stepIndex
      );

      const projectWithDeletedStep = {
        ...state.currentProject,
        components: componentsWithDeletedStep
      };

      // NEW: Add activity tracking
      const projectWithDeleteStepActivity = updateProjectActivity(projectWithDeletedStep);

      return {
        ...state,
        currentProject: projectWithDeleteStepActivity,
        projects: state.projects.map(p => 
          p.id === state.currentProject.id ? projectWithDeleteStepActivity : p
        )
      };

    case 'UPDATE_STEP':
      if (!state.currentProject) {
        console.error('UPDATE_STEP: No current project');
        return state;
      }
      
      const { componentIndex: updateCompIndex, stepIndex: updateStepIndex, step: updatedStepData } = action.payload;
      
      if (updateCompIndex === null || updateCompIndex === undefined || 
          !state.currentProject.components[updateCompIndex] ||
          !state.currentProject.components[updateCompIndex].steps ||
          updateStepIndex === null || updateStepIndex === undefined ||
          !state.currentProject.components[updateCompIndex].steps[updateStepIndex]) {
        console.error('UPDATE_STEP: Invalid indices', { updateCompIndex, updateStepIndex });
        return state;
      }

      const componentsWithUpdatedStep = [...state.currentProject.components];
      
      const originalStep = componentsWithUpdatedStep[updateCompIndex].steps[updateStepIndex];
      const updatedStep = {
        ...originalStep,
        ...updatedStepData,
        id: originalStep.id,
        completed: originalStep.completed,
        advancedWizardConfig: updatedStepData.advancedWizardConfig || originalStep.advancedWizardConfig
      };
      
      componentsWithUpdatedStep[updateCompIndex].steps[updateStepIndex] = updatedStep;

      const projectWithUpdatedStep = {
        ...state.currentProject,
        components: componentsWithUpdatedStep
      };

      // NEW: Add activity tracking
      const projectWithUpdateStepActivity = updateProjectActivity(projectWithUpdatedStep);

      return {
        ...state,
        currentProject: projectWithUpdateStepActivity,
        projects: state.projects.map(p => 
          p.id === state.currentProject.id ? projectWithUpdateStepActivity : p
        )
      };

    case 'SET_WIZARD_TYPE':
      return {
        ...state,
        wizardType: action.payload
      };
      
    case 'TOGGLE_STEP_COMPLETION':
      if (!state.currentProject) {
        console.error('TOGGLE_STEP_COMPLETION: No current project');
        return state;
      }
      
      const { componentIndex: toggleCompIndex, stepIndex: toggleStepIndex } = action.payload;
      
      if (toggleCompIndex === null || toggleCompIndex === undefined || 
          !state.currentProject.components[toggleCompIndex] ||
          !state.currentProject.components[toggleCompIndex].steps ||
          toggleStepIndex === null || toggleStepIndex === undefined ||
          !state.currentProject.components[toggleCompIndex].steps[toggleStepIndex]) {
        console.error('TOGGLE_STEP_COMPLETION: Invalid indices', { toggleCompIndex, toggleStepIndex });
        return state;
      }

      const componentsWithToggledStep = [...state.currentProject.components];
      const stepToToggle = componentsWithToggledStep[toggleCompIndex].steps[toggleStepIndex];
      stepToToggle.completed = !stepToToggle.completed;

      if (stepToToggle.completed) {
        const nextIncompleteIndex = componentsWithToggledStep[toggleCompIndex].steps.findIndex(
          (s, i) => i > toggleStepIndex && !s.completed
        );
        if (nextIncompleteIndex !== -1) {
          componentsWithToggledStep[toggleCompIndex].currentStep = nextIncompleteIndex;
        } else {
          componentsWithToggledStep[toggleCompIndex].currentStep = componentsWithToggledStep[toggleCompIndex].steps.length;
        }
      } else {
        componentsWithToggledStep[toggleCompIndex].currentStep = toggleStepIndex;
      }

      const projectWithToggledStep = {
        ...state.currentProject,
        components: componentsWithToggledStep
      };

      // NEW: Add activity tracking for step completion
      const projectWithToggleActivity = updateProjectActivity(projectWithToggledStep);

      return {
        ...state,
        currentProject: projectWithToggleActivity,
        projects: state.projects.map(p => 
          p.id === state.currentProject.id ? projectWithToggleActivity : p
        )
      };

    case 'COMPLETE_PROJECT':
      if (!state.currentProject) {
        console.error('COMPLETE_PROJECT: No current project');
        return state;
      }
      
      const completedProject = {
        ...state.currentProject,
        completed: true,
        completedAt: new Date().toISOString(),
        lastActivityAt: new Date().toISOString() // NEW: Track activity on completion
      };

      return {
        ...state,
        currentProject: completedProject,
        projects: state.projects.map(p => 
          p.id === state.currentProject.id ? completedProject : p
        )
      };

    case 'SET_SELECTED_COMPONENT_INDEX':
      return {
        ...state,
        selectedComponentIndex: action.payload
      };

    case 'SET_ACTIVE_COMPONENT_INDEX':
      return {
        ...state,
        activeComponentIndex: action.payload
      };

    default:
      console.warn('Unknown action type:', action.type);
      return state;
  }
};