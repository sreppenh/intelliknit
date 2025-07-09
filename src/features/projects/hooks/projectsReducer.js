export const initialState = {
  projects: [],
  currentProject: null,
  selectedComponentIndex: null,
  activeComponentIndex: 0,
  wizardType: 'enhanced' // NEW: Default to enhanced wizard
};

export const projectsReducer = (state, action) => {
  // ADDED: Safety check to ensure state is defined
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
        defaultUnits: action.payload.defaultUnits || 'inches', // NEW
        components: [],
        currentComponent: 0,
        createdAt: new Date().toISOString(),
        completed: false
      };
      
      return {
        ...state,
        projects: [...state.projects, newProject],
        currentProject: newProject
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

      const updatedProject = {
        ...state.currentProject,
        components: [...state.currentProject.components, newComponent]
      };

      return {
        ...state,
        currentProject: updatedProject,
        projects: state.projects.map(p => 
          p.id === state.currentProject.id ? updatedProject : p
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

      return {
        ...state,
        currentProject: projectWithDeletedComponent,
        projects: state.projects.map(p => 
          p.id === state.currentProject.id ? projectWithDeletedComponent : p
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

      return {
        ...state,
        currentProject: projectWithCopiedComponent,
        projects: state.projects.map(p => 
          p.id === state.currentProject.id ? projectWithCopiedComponent : p
        )
      };

case 'ADD_CALCULATED_STEP':
  if (!state.currentProject) {
    console.error('ADD_CALCULATED_STEP: No current project');
    return state;
  }
  
  const { componentIndex: calcCompIndex, step: calcStep } = action.payload;
  
  // ADDED: Validate componentIndex
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
    wizardConfig: calcStep.wizardConfig, // EXISTING: Original wizard config
    advancedWizardConfig: calcStep.advancedWizardConfig, // NEW: Advanced wizard config
    completed: false
  };

  const componentsWithNewCalculatedStep = [...state.currentProject.components];
  // ADDED: Safety check for steps array
  if (!componentsWithNewCalculatedStep[calcCompIndex].steps) {
    componentsWithNewCalculatedStep[calcCompIndex].steps = [];
  }
  componentsWithNewCalculatedStep[calcCompIndex].steps.push(newCalculatedStep);

  const projectWithNewCalculatedStep = {
    ...state.currentProject,
    components: componentsWithNewCalculatedStep
  };

  return {
    ...state,
    currentProject: projectWithNewCalculatedStep,
    projects: state.projects.map(p => 
      p.id === state.currentProject.id ? projectWithNewCalculatedStep : p
    )
  };

    case 'ADD_STEP':
  if (!state.currentProject) {
    console.error('ADD_STEP: No current project');
    return state;
  }
  
  const { componentIndex, step } = action.payload;
  
  // ADDED: Validate componentIndex and step data
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
    wizardConfig: step.wizardConfig, // EXISTING: Original wizard config
    advancedWizardConfig: step.advancedWizardConfig, // NEW: Advanced wizard config
    completed: false
  };

  const componentsWithNewStep = [...state.currentProject.components];
  // ADDED: Safety check for steps array
  if (!componentsWithNewStep[componentIndex].steps) {
    componentsWithNewStep[componentIndex].steps = [];
  }
  componentsWithNewStep[componentIndex].steps.push(newStep);

  const projectWithNewStep = {
    ...state.currentProject,
    components: componentsWithNewStep
  };

  return {
    ...state,
    currentProject: projectWithNewStep,
    projects: state.projects.map(p => 
      p.id === state.currentProject.id ? projectWithNewStep : p
    )
  };

    case 'DELETE_STEP':
      if (!state.currentProject) {
        console.error('DELETE_STEP: No current project');
        return state;
      }
      
      const { componentIndex: compIndex, stepIndex } = action.payload;
      
      // ADDED: Validate indices
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

      return {
        ...state,
        currentProject: projectWithDeletedStep,
        projects: state.projects.map(p => 
          p.id === state.currentProject.id ? projectWithDeletedStep : p
        )
      };

case 'UPDATE_STEP':
  if (!state.currentProject) {
    console.error('UPDATE_STEP: No current project');
    return state;
  }
  
  const { componentIndex: updateCompIndex, stepIndex: updateStepIndex, step: updatedStepData } = action.payload;
  
  // ADDED: Validate indices and data
  if (updateCompIndex === null || updateCompIndex === undefined || 
      !state.currentProject.components[updateCompIndex] ||
      !state.currentProject.components[updateCompIndex].steps ||
      updateStepIndex === null || updateStepIndex === undefined ||
      !state.currentProject.components[updateCompIndex].steps[updateStepIndex]) {
    console.error('UPDATE_STEP: Invalid indices', { updateCompIndex, updateStepIndex });
    return state;
  }

  const componentsWithUpdatedStep = [...state.currentProject.components];
  
  // Preserve the original step ID and completion status
  const originalStep = componentsWithUpdatedStep[updateCompIndex].steps[updateStepIndex];
  const updatedStep = {
    ...originalStep,
    ...updatedStepData,
    id: originalStep.id, // Keep original ID
    completed: originalStep.completed, // Keep original completion status
    advancedWizardConfig: updatedStepData.advancedWizardConfig || originalStep.advancedWizardConfig // Preserve or update advanced config
  };
  
  componentsWithUpdatedStep[updateCompIndex].steps[updateStepIndex] = updatedStep;

  const projectWithUpdatedStep = {
    ...state.currentProject,
    components: componentsWithUpdatedStep
  };

  return {
    ...state,
    currentProject: projectWithUpdatedStep,
    projects: state.projects.map(p => 
      p.id === state.currentProject.id ? projectWithUpdatedStep : p
    )
  };

case 'SET_WIZARD_TYPE':
  return {
    ...state,
    wizardType: action.payload // 'original' or 'enhanced'
  };

      
    case 'TOGGLE_STEP_COMPLETION':
      if (!state.currentProject) {
        console.error('TOGGLE_STEP_COMPLETION: No current project');
        return state;
      }
      
      const { componentIndex: toggleCompIndex, stepIndex: toggleStepIndex } = action.payload;
      
      // ADDED: Validate indices
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

      // Update current step for component
      if (stepToToggle.completed) {
        // Find next incomplete step
        const nextIncompleteIndex = componentsWithToggledStep[toggleCompIndex].steps.findIndex(
          (s, i) => i > toggleStepIndex && !s.completed
        );
        if (nextIncompleteIndex !== -1) {
          componentsWithToggledStep[toggleCompIndex].currentStep = nextIncompleteIndex;
        } else {
          // All steps completed
          componentsWithToggledStep[toggleCompIndex].currentStep = componentsWithToggledStep[toggleCompIndex].steps.length;
        }
      } else {
        // If unchecking (frogging), set current step to this step
        componentsWithToggledStep[toggleCompIndex].currentStep = toggleStepIndex;
      }

      const projectWithToggledStep = {
        ...state.currentProject,
        components: componentsWithToggledStep
      };

      return {
        ...state,
        currentProject: projectWithToggledStep,
        projects: state.projects.map(p => 
          p.id === state.currentProject.id ? projectWithToggledStep : p
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
        completedAt: new Date().toISOString()
      };

      return {
        ...state,
        currentProject: completedProject,
        projects: state.projects.map(p => 
          p.id === state.currentProject.id ? completedProject : p
        )
      };

    case 'ADD_ENHANCED_COMPONENT':
  if (!state.currentProject) return state;
  
  const enhancedComponent = {
    id: `comp-${Date.now()}`,
    ...action.payload,
    steps: [],
    currentStep: 0
  };

  const updatedProjectWithEnhanced = {
    ...state.currentProject,
    components: [...state.currentProject.components, enhancedComponent]
  };

  return {
    ...state,
    currentProject: updatedProjectWithEnhanced,
    projects: state.projects.map(p => 
      p.id === state.currentProject.id ? updatedProjectWithEnhanced : p
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

    case 'ADD_ADVANCED_CALCULATED_STEP':
  if (!state.currentProject) {
    console.error('ADD_ADVANCED_CALCULATED_STEP: No current project');
    return state;
  }
  
  const { componentIndex: advancedCompIndex, step: advancedStep } = action.payload;
  
  // ADDED: Validate componentIndex
  if (advancedCompIndex === null || advancedCompIndex === undefined || 
      !state.currentProject.components[advancedCompIndex]) {
    console.error('ADD_ADVANCED_CALCULATED_STEP: Invalid component index', advancedCompIndex);
    return state;
  }

  const newAdvancedStep = {
    id: `step-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    description: advancedStep.description.trim(),
    type: 'advanced_calculated',
    patternType: advancedStep.patternType,
    construction: advancedStep.construction,
    calculatedRows: advancedStep.calculatedRows || [],
    startingStitches: advancedStep.startingStitches,
    endingStitches: advancedStep.endingStitches,
    totalRows: advancedStep.totalRows,
    advancedWizardConfig: advancedStep.advancedWizardConfig, // NEW: Save advanced wizard config
    completed: false
  };

  const componentsWithNewAdvancedStep = [...state.currentProject.components];
  // ADDED: Safety check for steps array
  if (!componentsWithNewAdvancedStep[advancedCompIndex].steps) {
    componentsWithNewAdvancedStep[advancedCompIndex].steps = [];
  }
  componentsWithNewAdvancedStep[advancedCompIndex].steps.push(newAdvancedStep);

  const projectWithNewAdvancedStep = {
    ...state.currentProject,
    components: componentsWithNewAdvancedStep
  };

  return {
    ...state,
    currentProject: projectWithNewAdvancedStep,
    projects: state.projects.map(p => 
      p.id === state.currentProject.id ? projectWithNewAdvancedStep : p
    )
  };  

    default:
      console.warn('Unknown action type:', action.type);
      return state;
  }
};