/**
 * Standard Tab Props Interface
 * All tabs should follow this consistent prop structure
 * 
 * This creates a contract that ensures consistent prop patterns across
 * all ProjectDetail tabs and provides validation in development mode.
 */

// Base props that all tabs receive
export const baseTabProps = {
    project: null,           // Current project object (required)
    onProjectUpdate: null,   // Function to update project (required)
};

// Props for tabs that handle components
export const componentTabProps = {
    ...baseTabProps,
    sortedComponents: [],            // Pre-sorted components array
    onComponentAction: null,         // Handler for component actions
    onShowEnhancedCreation: null,    // Show component creation flow
    onComponentManageSteps: null,    // Navigate to manage steps
    onComponentMenuAction: null,     // Handle three-dot menu actions
};

// Props for tabs with navigation capabilities
export const navigationTabProps = {
    ...baseTabProps,
    onChangeTab: null,              // Function to switch tabs
    onNavigate: null,               // Function for external navigation
    onEditProjectDetails: null,     // Navigate to project details edit
    onCompleteProject: null,        // Complete project action
};

// Props for tabs with knitting actions
export const knittingTabProps = {
    ...baseTabProps,
    onStartKnitting: null,          // Start knitting mode
    onManageSteps: null,            // Navigate to step management
    totalComponents: 0,             // Total component count
    completedComponents: 0,         // Completed component count
};

// Props for OverviewTab (combines multiple capabilities)
export const overviewTabProps = {
    ...baseTabProps,
    ...knittingTabProps,
    ...navigationTabProps,
    // Overview-specific props
    onDeleteProject: null,          // Delete project action
    onCopyProject: null,            // Copy project action  
    onShowEnhancedCreation: null,   // Show component creation flow
    onManageSteps: null,            // Navigate to step management
    onStartKnitting: null,          // Start knitting mode
};

// Validation helper for development mode
export const validateTabProps = (props, requiredProps) => {
    if (process.env.NODE_ENV !== 'development') return;

    const missing = requiredProps.filter(prop => {
        return props[prop] === undefined || props[prop] === null;
    });

    if (missing.length > 0) {
    }
};

// Helper to validate specific tab types
export const validateComponentTab = (props) => {
    const required = ['project', 'onProjectUpdate', 'onShowEnhancedCreation', 'onComponentManageSteps', 'onComponentMenuAction'];
    validateTabProps(props, required);
};

export const validateNavigationTab = (props) => {
    const required = ['project', 'onProjectUpdate'];
    validateTabProps(props, required);
};

export const validateKnittingTab = (props) => {
    const required = ['project', 'onProjectUpdate', 'totalComponents', 'completedComponents'];
    validateTabProps(props, required);
};

// Validation for OverviewTab
export const validateOverviewTab = (props) => {
    const required = [
        'project',
        'onProjectUpdate',
        'totalComponents',
        'completedComponents',
        'onCompleteProject',
        'onChangeTab',
        'onShowEnhancedCreation'
    ];
    validateTabProps(props, required);
};

// Prop extraction helpers for cleaner component code
export const extractBaseProps = (props) => {
    const { project, onProjectUpdate } = props;
    return { project, onProjectUpdate };
};

export const extractComponentProps = (props) => {
    const {
        project,
        onProjectUpdate,
        sortedComponents,
        onComponentAction,
        onShowEnhancedCreation,
        onComponentManageSteps,
        onComponentMenuAction
    } = props;

    return {
        project,
        onProjectUpdate,
        sortedComponents,
        onComponentAction,
        onShowEnhancedCreation,
        onComponentManageSteps,
        onComponentMenuAction
    };
};

export const extractNavigationProps = (props) => {
    const {
        project,
        onProjectUpdate,
        onChangeTab,
        onNavigate,
        onEditProjectDetails,
        onCompleteProject
    } = props;

    return {
        project,
        onProjectUpdate,
        onChangeTab,
        onNavigate,
        onEditProjectDetails,
        onCompleteProject
    };
};

// Prop extraction for OverviewTab
export const extractOverviewTabProps = (props) => {
    const {
        project,
        onProjectUpdate,
        totalComponents,
        completedComponents,
        onCompleteProject,
        onEditProjectDetails,
        onManageSteps,
        onStartKnitting,
        onChangeTab,
        onDeleteProject,
        onCopyProject,
        onShowEnhancedCreation
    } = props;

    return {
        project,
        onProjectUpdate,
        totalComponents,
        completedComponents,
        onCompleteProject,
        onEditProjectDetails,
        onManageSteps,
        onStartKnitting,
        onChangeTab,
        onDeleteProject,
        onCopyProject,
        onShowEnhancedCreation
    };
};