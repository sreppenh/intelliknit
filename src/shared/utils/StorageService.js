/**
 * Abstract storage layer - easily swappable for different storage backends
 */

class LocalStorageAdapter {
  async getProjects() {
    try {
      const savedProjects = localStorage.getItem('intelliknit-projects');
      return savedProjects ? JSON.parse(savedProjects) : [];
    } catch (error) {
      console.error('❌ IntelliKnit Error: Error reading from localStorage:', error);
      return [];
    }
  }

  async saveProjects(projects) {
    try {
      localStorage.setItem('intelliknit-projects', JSON.stringify(projects));
      return true;
    } catch (error) {
      console.error('❌ IntelliKnit Error: Error saving to localStorage:', error);
      return false;
    }
  }

  async deleteProject(projectId) {
    try {
      const projects = await this.getProjects();
      const filteredProjects = projects.filter(p => p.id !== projectId);
      return await this.saveProjects(filteredProjects);
    } catch (error) {
      console.error('❌ IntelliKnit Error: Error deleting project:', error);
      return false;
    }
  }

  async clearAll() {
    try {
      localStorage.removeItem('intelliknit-projects');
      return true;
    } catch (error) {
      console.error('❌ IntelliKnit Error: Error clearing localStorage:', error);
      return false;
    }
  }
}

// Future: Can easily swap for API, IndexedDB, etc.
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
    // Default to localStorage for MVP
    this.adapter = new LocalStorageAdapter();
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
      console.error('Error importing projects:', error);
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
export { LocalStorageAdapter, ApiStorageAdapter };