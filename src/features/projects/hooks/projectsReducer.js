import IntelliKnitLogger from '../../../shared/utils/ConsoleLogging';

export const initialState = {
  projects: [],
  currentProject: null,
  selectedComponentIndex: null,
  activeComponentIndex: 0,
  wizardType: 'enhanced'
};

/**
 * Get the default method for a given start type
 */
const getDefaultMethod = (startType) => {
  switch (startType) {
    case 'cast_on':
      return 'long_tail';
    case 'pick_up':
      return 'pick_up_knit';
    case 'continue':
      return 'from_stitches';
    case 'other':
      return 'custom';
    default:
      return 'long_tail';
  }
};

/**
 * Get the correct pattern name for initialization steps based on start type and method
 */
const getInitializationPattern = (startType, startMethod) => {
  switch (startType) {
    case 'cast_on':
      return 'Cast On';

    case 'pick_up':
      return 'Pick Up & Knit';

    case 'continue':
      return 'Continue from Stitches';

    case 'other':
      // For 'other' type, we might want to use the method or create a generic pattern
      return 'Custom Initialization';

    default:
      // Fallback - should rarely happen but good to have
      IntelliKnitLogger.warn('Unknown startType in getInitializationPattern', { startType, startMethod });
      return 'Cast On';
  }
};

/**
 * Get the correct description for initialization steps based on start type and component data
 */
const getInitializationDescription = (component) => {
  const stitchCount = component.startingStitches;
  const { startType, startMethod, startDescription } = component;

  switch (startType) {
    case 'cast_on':
      if (startMethod === 'other' && startDescription) {
        return `${startDescription} - ${stitchCount} stitches`;
      }
      return `Cast on ${stitchCount} stitches`;

    case 'pick_up':
      const location = startDescription || 'edge';
      return `Pick up and knit ${stitchCount} stitches from ${location}`;

    case 'continue':
      const source = startDescription || 'previous section';
      return `Continue with ${stitchCount} stitches from ${source}`;

    case 'other':
      if (startDescription) {
        return `${startDescription} - ${stitchCount} stitches`;
      }
      return `Custom setup with ${stitchCount} stitches`;

    default:
      return `Cast on ${stitchCount} stitches`;
  }
};

// Helper function to update project activity timestamp
const updateProjectActivity = (project) => ({
  ...project,
  lastActivityAt: new Date().toISOString()
});

export const projectsReducer = (state, action) => {
  // Safety check to ensure state is defined
  if (!state) {
    IntelliKnitLogger.error('State is undefined in projectsReducer');
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
        id: crypto.randomUUID(),
        name: action.payload.name.trim(),
        size: action.payload.size?.trim() || '',
        defaultUnits: action.payload.defaultUnits || 'inches',
        construction: action.payload.construction || 'flat', // ADD THIS LINE
        projectType: action.payload.projectType || 'other', // NEW LINE
        components: [],
        currentComponent: 0,
        colorCount: action.payload.colorCount || 2,        // ✅ ADD THIS
        colorMapping: action.payload.colorMapping || {},   // ✅ ADD THIS
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
        IntelliKnitLogger.error('ADD_COMPONENT: No current project');
        return state;
      }

      const newComponent = {
        id: crypto.randomUUID(),
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
        id: crypto.randomUUID(),
        ...action.payload,
        steps: [],
        currentStep: 0
      };

      // Auto-add Cast On step if startingStitches provided
      if (action.payload.startingStitches && action.payload.startingStitches > 0) {

        const initializationStep = {
          id: crypto.randomUUID(),
          description: getInitializationDescription(action.payload),
          type: 'calculated',
          prepNote: action.payload.setupNotes || '',
          wizardConfig: {
            stitchPattern: {
              pattern: getInitializationPattern(action.payload.startType, action.payload.startMethod),
              stitchCount: action.payload.startingStitches.toString(),
              method: action.payload.startMethod || 'long_tail',
              customText: action.payload.startDescription || '',
              instruction: action.payload.startInstructions || ''
            }
          },
          startingStitches: 0,
          endingStitches: action.payload.startingStitches,
          totalRows: 1,
          construction: action.payload.construction || 'flat',
          colorwork: action.payload.colorMode === 'single' && action.payload.singleColorYarnId ? {
            type: 'single',
            letter: action.payload.singleColorYarnId.startsWith('color-')
              ? action.payload.singleColorYarnId.split('-')[1]
              : action.payload.singleColorYarnId
          } : action.payload.startStepColorYarnIds && action.payload.startStepColorYarnIds.length === 1 ? {
            type: 'single',
            letter: action.payload.startStepColorYarnIds[0].startsWith('color-')
              ? action.payload.startStepColorYarnIds[0].split('-')[1]
              : action.payload.startStepColorYarnIds[0]
          } : action.payload.startStepColorYarnIds && action.payload.startStepColorYarnIds.length > 1 ? {
            type: 'multi-strand',
            letters: action.payload.startStepColorYarnIds.map(id =>
              id.startsWith('color-') ? id.split('-')[1] : id
            )
          } : null,
          completed: false
        };

        enhancedComponent.steps.push(initializationStep);
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
        IntelliKnitLogger.error('DELETE_COMPONENT: No current project');
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
        IntelliKnitLogger.error('COPY_COMPONENT: No current project or invalid source index');
        return state;
      }

      const { sourceIndex, newName } = action.payload;
      const originalComponent = state.currentProject.components[sourceIndex];

      if (!originalComponent) {
        IntelliKnitLogger.error('COPY_COMPONENT: Source component not found');
        return state;
      }

      const copiedComponent = {
        id: crypto.randomUUID(),
        name: newName.trim(),
        steps: originalComponent.steps.map((step, index) => ({
          ...step,
          id: crypto.randomUUID(),
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
        IntelliKnitLogger.error('ADD_CALCULATED_STEP: No current project');
        return state;
      }

      const { componentIndex: calcCompIndex, step: calcStep } = action.payload;

      if (calcCompIndex === null || calcCompIndex === undefined ||
        !state.currentProject.components[calcCompIndex]) {
        IntelliKnitLogger.error('ADD_CALCULATED_STEP: Invalid component index', calcCompIndex);
        return state;
      }

      const newCalculatedStep = {
        id: crypto.randomUUID(),
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
        IntelliKnitLogger.error('ADD_STEP: No current project');
        return state;
      }

      const { componentIndex, step } = action.payload;

      if (componentIndex === null || componentIndex === undefined ||
        !state.currentProject.components[componentIndex]) {
        IntelliKnitLogger.error('ADD_STEP: Invalid component index', componentIndex);
        return state;
      }

      if (!step || !step.description) {
        IntelliKnitLogger.error('ADD_STEP: Invalid step data', step);
        return state;
      }

      const newStep = {
        id: crypto.randomUUID(),
        description: step.description.trim(),
        expectedStitches: parseInt(step.expectedStitches) || 0,
        type: step.type || 'manual',
        construction: step.construction,
        wizardConfig: step.wizardConfig,
        advancedWizardConfig: step.advancedWizardConfig,
        startingStitches: step.startingStitches,
        endingStitches: step.endingStitches !== undefined ? step.endingStitches : step.expectedStitches,
        totalRows: step.totalRows,
        colorwork: step.colorwork,
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
        IntelliKnitLogger.error('DELETE_STEP: No current project');
        return state;
      }

      const { componentIndex: compIndex, stepIndex } = action.payload;

      if (compIndex === null || compIndex === undefined ||
        !state.currentProject.components[compIndex] ||
        !state.currentProject.components[compIndex].steps ||
        stepIndex === null || stepIndex === undefined ||
        !state.currentProject.components[compIndex].steps[stepIndex]) {
        IntelliKnitLogger.error('DELETE_STEP: Invalid indices', { compIndex, stepIndex });
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
        IntelliKnitLogger.error('UPDATE_STEP: No current project');
        return state;
      }

      const { componentIndex: updateCompIndex, stepIndex: updateStepIndex, step: updatedStepData } = action.payload;

      if (updateCompIndex === null || updateCompIndex === undefined ||
        !state.currentProject.components[updateCompIndex] ||
        !state.currentProject.components[updateCompIndex].steps ||
        updateStepIndex === null || updateStepIndex === undefined ||
        !state.currentProject.components[updateCompIndex].steps[updateStepIndex]) {
        IntelliKnitLogger.error('UPDATE_STEP: Invalid indices', { updateCompIndex, updateStepIndex });
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

    case 'UPDATE_STEP_PREP_NOTE':
      if (!state.currentProject) {
        IntelliKnitLogger.error('UPDATE_STEP_PREP_NOTE: No current project');
        return state;
      }

      const { componentIndex: prepCompIndex, stepIndex: prepStepIndex, prepNote } = action.payload;

      if (prepCompIndex === null || prepCompIndex === undefined ||
        !state.currentProject.components[prepCompIndex] ||
        !state.currentProject.components[prepCompIndex].steps ||
        prepStepIndex === null || prepStepIndex === undefined ||
        !state.currentProject.components[prepCompIndex].steps[prepStepIndex]) {
        IntelliKnitLogger.error('UPDATE_STEP_PREP_NOTE: Invalid indices', { prepCompIndex, prepStepIndex });
        return state;
      }

      const componentsWithUpdatedPrepNote = [...state.currentProject.components];
      const targetStep = { ...componentsWithUpdatedPrepNote[prepCompIndex].steps[prepStepIndex] };

      // Update the prep note
      targetStep.prepNote = prepNote;

      componentsWithUpdatedPrepNote[prepCompIndex].steps[prepStepIndex] = targetStep;

      const projectWithUpdatedPrepNote = {
        ...state.currentProject,
        components: componentsWithUpdatedPrepNote
      };

      const projectWithPrepNoteActivity = updateProjectActivity(projectWithUpdatedPrepNote);

      return {
        ...state,
        currentProject: projectWithPrepNoteActivity,
        projects: state.projects.map(p =>
          p.id === state.currentProject.id ? projectWithPrepNoteActivity : p
        )
      };

    case 'UPDATE_STEP_AFTER_NOTE':

      if (!state.currentProject) {
        IntelliKnitLogger.error('UPDATE_STEP_AFTER_NOTE: No current project');
        return state;
      }

      const { componentIndex: afterCompIndex, stepIndex: afterStepIndex, afterNote } = action.payload;

      if (afterCompIndex === null || afterCompIndex === undefined ||
        !state.currentProject.components[afterCompIndex] ||
        !state.currentProject.components[afterCompIndex].steps ||
        afterStepIndex === null || afterStepIndex === undefined ||
        !state.currentProject.components[afterCompIndex].steps[afterStepIndex]) {
        IntelliKnitLogger.error('UPDATE_STEP_AFTER_NOTE: Invalid indices', { afterCompIndex, afterStepIndex });
        return state;
      }

      const componentsWithUpdatedAfterNote = [...state.currentProject.components];
      const stepWithAfterNote = { ...componentsWithUpdatedAfterNote[afterCompIndex].steps[afterStepIndex] };

      // Update the after note in wizardConfig to match our storage pattern
      if (!stepWithAfterNote.wizardConfig) {
        stepWithAfterNote.wizardConfig = {};
      }
      stepWithAfterNote.wizardConfig.afterNote = afterNote;

      componentsWithUpdatedAfterNote[afterCompIndex].steps[afterStepIndex] = stepWithAfterNote;

      const projectWithUpdatedAfterNote = {
        ...state.currentProject,
        components: componentsWithUpdatedAfterNote
      };

      const projectWithAfterNoteActivity = updateProjectActivity(projectWithUpdatedAfterNote);

      return {
        ...state,
        currentProject: projectWithAfterNoteActivity,
        projects: state.projects.map(p =>
          p.id === state.currentProject.id ? projectWithAfterNoteActivity : p
        )
      };








    case 'TOGGLE_STEP_COMPLETION':
      if (!state.currentProject) {
        IntelliKnitLogger.error('TOGGLE_STEP_COMPLETION: No current project');
        return state;
      }

      const { componentIndex: toggleCompIndex, stepIndex: toggleStepIndex } = action.payload;

      if (toggleCompIndex === null || toggleCompIndex === undefined ||
        !state.currentProject.components[toggleCompIndex] ||
        !state.currentProject.components[toggleCompIndex].steps ||
        toggleStepIndex === null || toggleStepIndex === undefined ||
        !state.currentProject.components[toggleCompIndex].steps[toggleStepIndex]) {
        IntelliKnitLogger.error('TOGGLE_STEP_COMPLETION: Invalid indices', { toggleCompIndex, toggleStepIndex });
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
        IntelliKnitLogger.error('COMPLETE_PROJECT: No current project');
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
      IntelliKnitLogger.warn('Unknown action type', action.type);
      return state;
  }
};