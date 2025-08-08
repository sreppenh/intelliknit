/**
 * Data Migration Helper - Convert legacy components to new architecture
 * Converts components with startingStitches/endingStep to proper step arrays
 */

import { getStepPatternName } from './stepDisplayUtils';

export const migrateComponentToNewArchitecture = (component) => {
  const migratedComponent = { ...component };
  const newSteps = [...(component.steps || [])];
  let hasChanges = false;

  // 1. Convert startingStitches to Cast On step (if not already present)
  if (component.startingStitches && component.startingStitches > 0) {
    const hasCastOnStep = newSteps.some(step =>
      getStepPatternName(step) === 'Cast On'
    );

    if (!hasCastOnStep) {
      const castOnStep = {
        id: `step-migration-cast-on-${crypto.randomUUID()}`,
        description: `Cast on ${component.startingStitches} stitches`,
        type: 'calculated',
        wizardConfig: {
          stitchPattern: {
            pattern: 'Cast On',
            stitchCount: component.startingStitches.toString(),
            method: 'long_tail' // Default method for migrated steps
          }
        },
        startingStitches: 0,
        endingStitches: component.startingStitches,
        totalRows: 1,
        construction: component.construction || 'flat',
        completed: true // Mark as completed since it's legacy data
      };

      // Insert at beginning
      newSteps.unshift(castOnStep);
      hasChanges = true;
    }

    // Remove startingStitches property
    delete migratedComponent.startingStitches;
    hasChanges = true;
  }

  // 2. Convert endingStep to Bind Off step (if present)
  if (component.endingStep) {
    const hasBindOffStep = newSteps.some(step =>
      getStepPatternName(step) === 'Bind Off'
    );

    if (!hasBindOffStep) {
      const lastStep = newSteps[newSteps.length - 1];
      const startingStitches = lastStep?.endingStitches || lastStep?.expectedStitches || 0;

      const bindOffStep = {
        id: `step-migration-bind-off-${crypto.randomUUID()}`,
        description: component.endingStep.description || 'Bind off all stitches',
        type: 'calculated',
        wizardConfig: {
          stitchPattern: {
            pattern: 'Bind Off',
            method: component.endingStep.method || 'standard',
            customText: component.endingStep.customText,
            stitchCount: component.endingStep.stitchCount
          }
        },
        startingStitches: startingStitches,
        endingStitches: 0,
        totalRows: 1,
        construction: component.construction || 'flat',
        completed: true // Mark as completed since it's legacy data
      };

      // Add at end
      newSteps.push(bindOffStep);
      hasChanges = true;
    }

    // Remove endingStep property
    delete migratedComponent.endingStep;
    hasChanges = true;
  }

  // 3. Ensure all steps have proper startingStitches/endingStitches
  for (let i = 0; i < newSteps.length; i++) {
    const step = newSteps[i];

    // Set startingStitches from previous step's endingStitches
    if (i > 0 && !step.startingStitches) {
      const prevStep = newSteps[i - 1];
      step.startingStitches = prevStep.endingStitches || prevStep.expectedStitches || 0;
      hasChanges = true;
    }

    // Ensure endingStitches is set
    if (!step.endingStitches && step.expectedStitches) {
      step.endingStitches = step.expectedStitches;
      hasChanges = true;
    }
  }

  migratedComponent.steps = newSteps;

  return {
    component: migratedComponent,
    hasChanges
  };
};

export const migrateProjectToNewArchitecture = (project) => {
  const migratedProject = { ...project };
  let hasAnyChanges = false;

  migratedProject.components = project.components.map(component => {
    const { component: migratedComponent, hasChanges } = migrateComponentToNewArchitecture(component);
    if (hasChanges) hasAnyChanges = true;
    return migratedComponent;
  });

  // NEW: Add activity tracking to projects
  if (!migratedProject.activityLog) {
    migratedProject.activityLog = [];
    hasAnyChanges = true;
  }

  // NEW: Initialize lastActivityAt if not present  
  if (!migratedProject.lastActivityAt) {
    migratedProject.lastActivityAt = migratedProject.createdAt;
    hasAnyChanges = true;
  }

  // NEW: Add initial activity for recently created projects
  const now = new Date();
  const createdAt = new Date(migratedProject.createdAt);
  const hoursSinceCreation = (now - createdAt) / (1000 * 60 * 60);

  if (hoursSinceCreation < 24 && migratedProject.activityLog.length === 0) {
    const today = now.toISOString().split('T')[0];
    migratedProject.activityLog = [today];
    hasAnyChanges = true;
  }



  return {
    project: migratedProject,
    hasChanges: hasAnyChanges
  };
};

export const migrateAllProjectsToNewArchitecture = (projects) => {
  const migratedProjects = [];
  let totalChanges = 0;

  projects.forEach(project => {
    const { project: migratedProject, hasChanges } = migrateProjectToNewArchitecture(project);
    migratedProjects.push(migratedProject);
    if (hasChanges) totalChanges++;
  });

  return {
    projects: migratedProjects,
    migratedCount: totalChanges
  };
};