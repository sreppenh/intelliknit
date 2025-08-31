/**
 * Notes Storage Adapter - Simplified version of Enhanced LocalStorage Adapter
 * Handles note-specific storage with same reliability patterns as projects
 */

import IntelliKnitLogger from '../../../shared/utils/ConsoleLogging';

class NotesStorageAdapter {
    constructor() {
        this.storageKey = 'intelliknit-notes';
        this.backupKey = 'intelliknit-notes-backup';
        this.isStorageAvailable = this.checkStorageAvailability();
        this.inMemoryFallback = []; // Fallback for when localStorage unavailable
    }

    // Storage availability detection
    checkStorageAvailability() {
        try {
            const testKey = 'intelliknit-notes-test';
            localStorage.setItem(testKey, 'test');
            localStorage.removeItem(testKey);
            return true;
        } catch (error) {
            IntelliKnitLogger.warn('localStorage unavailable for notes, using in-memory storage', error);
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

            // Basic validation of note structure
            const validNotes = parsed.filter(note => {
                return note &&
                    typeof note === 'object' &&
                    typeof note.id === 'string' &&
                    typeof note.name === 'string' &&
                    note.isNote === true &&
                    Array.isArray(note.components);
            });

            if (validNotes.length !== parsed.length) {
                IntelliKnitLogger.warn(`Filtered ${parsed.length - validNotes.length} invalid notes during recovery`);
            }

            return { success: true, data: validNotes };
        } catch (error) {
            IntelliKnitLogger.error('Notes JSON parsing failed', error);
            return { success: false, error: error.message, data: [] };
        }
    }

    // Create backup before saving
    async createBackup(currentData) {
        if (!this.isStorageAvailable) return;

        try {
            localStorage.setItem(this.backupKey, JSON.stringify(currentData));
            IntelliKnitLogger.debug('Notes Storage', 'Backup created');
        } catch (error) {
            IntelliKnitLogger.warn('Could not create notes backup', error);
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
                IntelliKnitLogger.success('Recovered notes from backup');
                return { success: true, data: parseResult.data };
            }

            return { success: false, data: [] };
        } catch (error) {
            IntelliKnitLogger.error('Notes backup recovery failed', error);
            return { success: false, data: [] };
        }
    }

    // Get all notes
    async getNotes() {
        // Fallback to in-memory storage if localStorage unavailable
        if (!this.isStorageAvailable) {
            IntelliKnitLogger.debug('Notes Storage', 'Using in-memory fallback');
            return this.inMemoryFallback;
        }

        try {
            const savedNotes = localStorage.getItem(this.storageKey);
            const parseResult = this.safeJsonParse(savedNotes);

            if (parseResult.success) {
                return parseResult.data;
            }

            // JSON parsing failed, try to recover from backup
            IntelliKnitLogger.warn('Primary notes data corrupted, attempting backup recovery');
            const backupResult = await this.recoverFromBackup();

            if (backupResult.success) {
                // Restore from backup
                await this.saveNotes(backupResult.data);
                return backupResult.data;
            }

            // Both primary and backup failed
            IntelliKnitLogger.error('Both primary and backup notes data corrupted, starting fresh');
            return [];

        } catch (error) {
            IntelliKnitLogger.error('Critical error in getNotes', error);
            return [];
        }
    }

    // Save all notes
    async saveNotes(notes) {
        // Validate input
        if (!Array.isArray(notes)) {
            IntelliKnitLogger.error('saveNotes: Invalid input - not an array');
            return false;
        }

        // Fallback to in-memory storage if localStorage unavailable
        if (!this.isStorageAvailable) {
            this.inMemoryFallback = notes;
            IntelliKnitLogger.debug('Notes Storage', 'Saved to in-memory fallback');
            return true;
        }

        try {
            // Create backup of current data first
            await this.createBackup(notes);

            // Attempt to save
            const dataString = JSON.stringify(notes);
            localStorage.setItem(this.storageKey, dataString);

            IntelliKnitLogger.debug('Notes Storage', `Saved ${notes.length} notes`);
            return true;

        } catch (error) {
            if (error.name === 'QuotaExceededError') {
                IntelliKnitLogger.error('Notes storage quota exceeded');
                return false;
            }

            IntelliKnitLogger.error('Error saving notes to localStorage', error);
            return false;
        }
    }

    // Delete a specific note
    async deleteNote(noteId) {
        if (!noteId) {
            IntelliKnitLogger.error('deleteNote: No note ID provided');
            return false;
        }

        try {
            const notes = await this.getNotes();
            const initialLength = notes.length;
            const filteredNotes = notes.filter(n => n.id !== noteId);

            if (filteredNotes.length === initialLength) {
                IntelliKnitLogger.warn(`Note ${noteId} not found for deletion`);
                return false;
            }

            const saveResult = await this.saveNotes(filteredNotes);
            if (saveResult) {
                IntelliKnitLogger.success(`Note ${noteId} deleted`);
            }
            return saveResult;

        } catch (error) {
            IntelliKnitLogger.error('Error deleting note', error);
            return false;
        }
    }

    // Clear all notes (with backup)
    async clearAll() {
        try {
            // Create backup before clearing
            const currentNotes = await this.getNotes();
            if (currentNotes.length > 0) {
                await this.createBackup(currentNotes);
            }

            if (this.isStorageAvailable) {
                localStorage.removeItem(this.storageKey);
                IntelliKnitLogger.success('All notes cleared from storage');
            } else {
                this.inMemoryFallback = [];
                IntelliKnitLogger.success('All notes cleared from memory');
            }

            return true;

        } catch (error) {
            IntelliKnitLogger.error('Error clearing notes storage', error);
            return false;
        }
    }

    // Get storage diagnostics
    async getStorageInfo() {
        const notes = await this.getNotes();

        return {
            storageAvailable: this.isStorageAvailable,
            noteCount: notes.length,
            hasBackup: this.isStorageAvailable && localStorage.getItem(this.backupKey) !== null
        };
    }
}

export default NotesStorageAdapter;