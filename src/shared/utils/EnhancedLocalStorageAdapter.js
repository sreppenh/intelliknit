/**
 * Enhanced LocalStorageAdapter with robust error handling and recovery
 * Addresses: JSON parsing, quota management, storage availability, user notifications
 */

import IntelliKnitLogger from '../../shared/utils/ConsoleLogging';

class EnhancedLocalStorageAdapter {
  constructor() {
    this.storageKey = 'intelliknit-projects';
    this.backupKey = 'intelliknit-projects-backup';
    this.isStorageAvailable = this.checkStorageAvailability();
    this.inMemoryFallback = []; // Fallback for when localStorage unavailable
  }

  // Storage availability detection
  checkStorageAvailability() {
    try {
      const testKey = 'intelliknit-storage-test';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      return true;
    } catch (error) {
      IntelliKnitLogger.warn('localStorage unavailable, using in-memory storage', error);
      return false;
    }
  }

  // JSON validation and parsing with recovery
  safeJsonParse(jsonString) {
    if (!jsonString || jsonString.trim() === '') {
      return { success: true, data: [] };
    }

    try {
      const parsed = JSON.parse(jsonString);
      
      // Validate that it's an array
      if (!Array.isArray(parsed)) {
        throw new Error('Data is not an array');
      }

      // Basic validation of project structure
      const validProjects = parsed.filter(project => {
        return project && 
               typeof project === 'object' && 
               typeof project.id === 'string' && 
               typeof project.name === 'string' &&
               Array.isArray(project.components);
      });

      if (validProjects.length !== parsed.length) {
        IntelliKnitLogger.warn(`Filtered ${parsed.length - validProjects.length} invalid projects during recovery`);
      }

      return { success: true, data: validProjects };
    } catch (error) {
      IntelliKnitLogger.error('JSON parsing failed', error);
      return { success: false, error: error.message, data: [] };
    }
  }

  // Quota checking and cleanup
  async checkStorageQuota() {
    if (!this.isStorageAvailable) return { available: false, quota: 0, used: 0 };

    try {
      // Estimate current usage
      let totalSize = 0;
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          totalSize += localStorage[key].length;
        }
      }

      // Typical localStorage quota is 5-10MB
      const estimatedQuota = 5 * 1024 * 1024; // 5MB
      const usagePercent = (totalSize / estimatedQuota) * 100;

      return {
        available: true,
        quota: estimatedQuota,
        used: totalSize,
        usagePercent: usagePercent,
        nearLimit: usagePercent > 80
      };
    } catch (error) {
      IntelliKnitLogger.warn('Could not check storage quota', error);
      return { available: false, quota: 0, used: 0 };
    }
  }

  // Clean up old backup data if storage is getting full
  async cleanupStorage() {
    if (!this.isStorageAvailable) return;

    try {
      const quota = await this.checkStorageQuota();
      
      if (quota.nearLimit) {
        IntelliKnitLogger.info('Storage near limit, cleaning up old backups');
        
        // Remove backup if storage is getting full
        localStorage.removeItem(this.backupKey);
        
        // Could add more cleanup logic here (e.g., compress data, remove old projects)
      }
    } catch (error) {
      IntelliKnitLogger.warn('Storage cleanup failed', error);
    }
  }

  // Create backup before saving
  async createBackup(currentData) {
    if (!this.isStorageAvailable) return;

    try {
      localStorage.setItem(this.backupKey, JSON.stringify(currentData));
      IntelliKnitLogger.debug('Storage', 'Backup created');
    } catch (error) {
      IntelliKnitLogger.warn('Could not create backup', error);
      // Non-critical error, don't fail the operation
    }
  }

  // Attempt to recover from backup
  async recoverFromBackup() {
    if (!this.isStorageAvailable) return { success: false, data: [] };

    try {
      const backupData = localStorage.getItem(this.backupKey);
      if (!backupData) {
        return { success: false, data: [] };
      }

      const parseResult = this.safeJsonParse(backupData);
      if (parseResult.success) {
        IntelliKnitLogger.success('Recovered data from backup');
        return { success: true, data: parseResult.data };
      }

      return { success: false, data: [] };
    } catch (error) {
      IntelliKnitLogger.error('Backup recovery failed', error);
      return { success: false, data: [] };
    }
  }

  // Enhanced getProjects with full error handling
  async getProjects() {
    // Fallback to in-memory storage if localStorage unavailable
    if (!this.isStorageAvailable) {
      IntelliKnitLogger.debug('Storage', 'Using in-memory fallback');
      return this.inMemoryFallback;
    }

    try {
      const savedProjects = localStorage.getItem(this.storageKey);
      const parseResult = this.safeJsonParse(savedProjects);

      if (parseResult.success) {
        return parseResult.data;
      }

      // JSON parsing failed, try to recover from backup
      IntelliKnitLogger.warn('Primary data corrupted, attempting backup recovery');
      const backupResult = await this.recoverFromBackup();
      
      if (backupResult.success) {
        // Restore from backup
        await this.saveProjects(backupResult.data);
        return backupResult.data;
      }

      // Both primary and backup failed
      IntelliKnitLogger.error('Both primary and backup data corrupted, starting fresh');
      return [];

    } catch (error) {
      IntelliKnitLogger.error('Critical error in getProjects', error);
      return [];
    }
  }

  // Enhanced saveProjects with quota management
  async saveProjects(projects) {
    // Validate input
    if (!Array.isArray(projects)) {
      IntelliKnitLogger.error('saveProjects: Invalid input - not an array');
      return false;
    }

    // Fallback to in-memory storage if localStorage unavailable
    if (!this.isStorageAvailable) {
      this.inMemoryFallback = projects;
      IntelliKnitLogger.debug('Storage', 'Saved to in-memory fallback');
      return true;
    }

    try {
      // Create backup of current data first
      await this.createBackup(projects);

      // Check storage quota
      const quota = await this.checkStorageQuota();
      if (quota.nearLimit) {
        await this.cleanupStorage();
      }

      // Attempt to save
      const dataString = JSON.stringify(projects);
      localStorage.setItem(this.storageKey, dataString);
      
      IntelliKnitLogger.debug('Storage', `Saved ${projects.length} projects`);
      return true;

    } catch (error) {
      if (error.name === 'QuotaExceededError') {
        IntelliKnitLogger.error('Storage quota exceeded - cleaning up and retrying');
        
        // Try cleanup and retry once
        await this.cleanupStorage();
        
        try {
          const dataString = JSON.stringify(projects);
          localStorage.setItem(this.storageKey, dataString);
          IntelliKnitLogger.success('Save successful after cleanup');
          return true;
        } catch (retryError) {
          IntelliKnitLogger.error('Save failed even after cleanup', retryError);
          return false;
        }
      }

      IntelliKnitLogger.error('Error saving to localStorage', error);
      return false;
    }
  }

  // Enhanced deleteProject with better error handling
  async deleteProject(projectId) {
    if (!projectId) {
      IntelliKnitLogger.error('deleteProject: No project ID provided');
      return false;
    }

    try {
      const projects = await this.getProjects();
      const initialLength = projects.length;
      const filteredProjects = projects.filter(p => p.id !== projectId);
      
      if (filteredProjects.length === initialLength) {
        IntelliKnitLogger.warn(`Project ${projectId} not found for deletion`);
        return false;
      }

      const saveResult = await this.saveProjects(filteredProjects);
      if (saveResult) {
        IntelliKnitLogger.success(`Project ${projectId} deleted`);
      }
      return saveResult;

    } catch (error) {
      IntelliKnitLogger.error('Error deleting project', error);
      return false;
    }
  }

  // Enhanced clearAll with backup
  async clearAll() {
    try {
      // Create backup before clearing
      const currentProjects = await this.getProjects();
      if (currentProjects.length > 0) {
        await this.createBackup(currentProjects);
      }

      if (this.isStorageAvailable) {
        localStorage.removeItem(this.storageKey);
        IntelliKnitLogger.success('All projects cleared from storage');
      } else {
        this.inMemoryFallback = [];
        IntelliKnitLogger.success('All projects cleared from memory');
      }
      
      return true;

    } catch (error) {
      IntelliKnitLogger.error('Error clearing storage', error);
      return false;
    }
  }

  // Diagnostic methods for debugging
  async getStorageInfo() {
    const quota = await this.checkStorageQuota();
    const projects = await this.getProjects();
    
    return {
      storageAvailable: this.isStorageAvailable,
      projectCount: projects.length,
      quotaInfo: quota,
      hasBackup: this.isStorageAvailable && localStorage.getItem(this.backupKey) !== null
    };
  }

  // Manual backup recovery (for support/debugging)
  async forceRecoverFromBackup() {
    const backupResult = await this.recoverFromBackup();
    if (backupResult.success) {
      await this.saveProjects(backupResult.data);
      return backupResult.data;
    }
    return null;
  }
}

export default EnhancedLocalStorageAdapter;