/**
 * Data Migration Helper - MINIMAL VERSION
 * 
 * All migration logic has been disabled to prevent bugs.
 * This file only exports the required functions that return
 * "no changes" to maintain compatibility with existing code.
 */

// No longer needed - removing unused import
// import { getStepPatternName, isInitializationStep } from './stepDisplayUtils';

/**
 * Component migration - DISABLED
 * @param {Object} component - Component to migrate
 * @returns {Object} - Returns component unchanged with hasChanges: false
 */
export const migrateComponentToNewArchitecture = (component) => {
  return { component, hasChanges: false };
};

/**
 * Project migration - DISABLED  
 * @param {Object} project - Project to migrate
 * @returns {Object} - Returns project unchanged with hasChanges: false
 */
export const migrateProjectToNewArchitecture = (project) => {
  return { project, hasChanges: false };
};

/**
 * Bulk migration - DISABLED
 * @param {Array} projects - Array of projects to migrate
 * @returns {Object} - Returns projects unchanged with migratedCount: 0
 */
export const migrateAllProjectsToNewArchitecture = (projects) => {
  return { projects, migratedCount: 0 };
};