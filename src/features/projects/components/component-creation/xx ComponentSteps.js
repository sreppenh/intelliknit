// Component creation step configuration
export const COMPONENT_STEPS = {
  NAME: 1,
  START_TYPE: 2,
  METHOD: 3,
  DETAILS: 4,
  CREATE: 5
};

// Navigation logic for component creation
export const createComponentNavigator = (currentStep, componentData) => {
  const canProceed = () => {
    switch (currentStep) {
      case COMPONENT_STEPS.NAME:
        return componentData.name && componentData.name.trim().length > 0;
        
      case COMPONENT_STEPS.START_TYPE:
        return componentData.startType !== null;
        
      case COMPONENT_STEPS.METHOD:
        return componentData.startMethod !== null && componentData.startMethod !== '';
        
      case COMPONENT_STEPS.DETAILS:
        return componentData.startStitches && 
               parseInt(componentData.startStitches) > 0;
               
      case COMPONENT_STEPS.CREATE:
        return true; // Always ready to create
               
      default:
        return false;
    }
  };

  const shouldShowNavigation = () => {
    // Only show navigation buttons for steps that need manual advancement
    return currentStep === COMPONENT_STEPS.NAME || 
           currentStep === COMPONENT_STEPS.DETAILS ||
           currentStep === COMPONENT_STEPS.CREATE;
  };

  const getNextStep = () => {
    switch (currentStep) {
      case COMPONENT_STEPS.NAME:
        return COMPONENT_STEPS.START_TYPE;
      case COMPONENT_STEPS.START_TYPE:
        return COMPONENT_STEPS.METHOD;
      case COMPONENT_STEPS.METHOD:
        return COMPONENT_STEPS.DETAILS;
      case COMPONENT_STEPS.DETAILS:
        return COMPONENT_STEPS.CREATE;
      default:
        return currentStep;
    }
  };

  const getPreviousStep = () => {
    switch (currentStep) {
      case COMPONENT_STEPS.CREATE:
        return COMPONENT_STEPS.DETAILS;
      case COMPONENT_STEPS.DETAILS:
        return COMPONENT_STEPS.METHOD;
      case COMPONENT_STEPS.METHOD:
        return COMPONENT_STEPS.START_TYPE;
      case COMPONENT_STEPS.START_TYPE:
        return COMPONENT_STEPS.NAME;
      default:
        return currentStep;
    }
  };

  return {
    canProceed,
    shouldShowNavigation,
    getNextStep,
    getPreviousStep
  };
};

// Helper to handle start type selection with auto-advance
export const handleStartTypeSelection = (type, setComponentData, setStep) => {
  setComponentData(prev => ({
    ...prev,
    startType: type,
    startDescription: type === 'cast_on' ? 'Cast on from scratch' : '',
    startStitches: type === 'cast_on' ? prev.startStitches : '',
    startMethod: '' // Reset method when changing start type
  }));
  
  // Auto-advance to method selection step
  setTimeout(() => setStep(COMPONENT_STEPS.METHOD), 50);
};

// Helper to handle method selection with auto-advance
export const handleMethodSelection = (method, setComponentData, setStep) => {
  setComponentData(prev => ({
    ...prev,
    startMethod: method
  }));
  
  // Auto-advance to details step
  setTimeout(() => setStep(COMPONENT_STEPS.DETAILS), 50);
};

// Get available methods based on start type
export const getMethodsForStartType = (startType) => {
  switch (startType) {
    case 'cast_on':
      return [
        { id: 'long_tail', name: 'Long Tail', icon: '🪢', description: 'Most common, stretchy edge' },
        { id: 'cable', name: 'Cable Cast On', icon: '🔗', description: 'Firm, decorative edge' },
        { id: 'provisional', name: 'Provisional', icon: '📎', description: 'Removable, for later picking up' },
        { id: 'german_twisted', name: 'German Twisted', icon: '🌀', description: 'Very stretchy, great for ribbing' },
        { id: 'backward_loop', name: 'Backward Loop', icon: '↪️', description: 'Quick and simple' },
        { id: 'other', name: 'Other Method', icon: '📝', description: 'Specify your own' }
      ];
    case 'pick_up':
      return [
        { id: 'standard', name: 'Standard Pick Up', icon: '📌', description: 'Pick up from edge' },
        { id: 'pick_up_knit', name: 'Pick Up & Knit', icon: '🧶', description: 'Pick up and knit in one motion' },
        { id: 'other', name: 'Other Method', icon: '📝', description: 'Specify your own' }
      ];
    case 'continue':
      return [
        { id: 'from_holder', name: 'From Holder', icon: '📎', description: 'Continue from saved stitches' },
        { id: 'from_previous', name: 'From Previous Section', icon: '↗️', description: 'Continue from last worked' },
        { id: 'other', name: 'Other Method', icon: '📝', description: 'Specify your own' }
      ];
    case 'other':
      return [
        { id: 'custom', name: 'Custom Setup', icon: '📝', description: 'Describe your setup method' }
      ];
    default:
      return [];
  }
};