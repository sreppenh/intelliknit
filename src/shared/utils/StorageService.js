/**
 * Abstract storage layer - easily swappable for different storage backends
 */

import IntelliKnitLogger from './ConsoleLogging';
import EnhancedLocalStorageAdapter from './EnhancedLocalStorageAdapter';

class ApiStorageAdapter {
  constructor(apiUrl) {
    this.apiUrl = apiUrl;
  }

  async getProjects() {
    // Future API implementation
    throw new Error('API storage not implemented yet');
  }

  async saveProjects(projects) {
    // Future API implementation
    throw new Error('API storage not implemented yet');
  }

  async deleteProject(projectId) {
    // Future API implementation
    throw new Error('API storage not implemented yet');
  }

  async clearAll() {
    // Future API implementation
    throw new Error('API storage not implemented yet');
  }
}

// Storage service that can use different adapters
class StorageServiceClass {
  constructor() {
    // Default to enhanced localStorage for MVP
    this.adapter = new EnhancedLocalStorageAdapter();
  }

  // Method to switch storage adapters
  setAdapter(adapter) {
    this.adapter = adapter;
  }

  // Delegate methods to current adapter
  async getProjects() {
    return await this.adapter.getProjects();
  }

  async saveProjects(projects) {
    return await this.adapter.saveProjects(projects);
  }

  async deleteProject(projectId) {
    return await this.adapter.deleteProject(projectId);
  }

  async clearAll() {
    return await this.adapter.clearAll();
  }

  // Utility methods
  async exportProjects() {
    const projects = await this.getProjects();
    return JSON.stringify(projects, null, 2);
  }

  async importProjects(jsonString) {
    try {
      const projects = JSON.parse(jsonString);
      if (Array.isArray(projects)) {
        return await this.saveProjects(projects);
      }
      throw new Error('Invalid projects format');
    } catch (error) {
      IntelliKnitLogger.error('Error importing projects', error);
      return false;
    }
  }

  // Analytics/reporting methods
  async getProjectStats() {
    const projects = await this.getProjects();
    return {
      totalProjects: projects.length,
      completedProjects: projects.filter(p => p.completed).length,
      totalComponents: projects.reduce((sum, p) => sum + p.components.length, 0),
      totalSteps: projects.reduce((sum, p) => 
        sum + p.components.reduce((compSum, c) => compSum + c.steps.length, 0), 0
      )
    };
  }
}

// Export singleton instance
export const StorageService = new StorageServiceClass();

// Export adapters for testing or manual configuration
export { EnhancedLocalStorageAdapter as LocalStorageAdapter, ApiStorageAdapter };