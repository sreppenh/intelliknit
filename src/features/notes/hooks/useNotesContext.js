/**
 * Notes Context - Mirrors projects context API for seamless integration
 */

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { notesReducer, initialState } from './notesReducer';
import NotesStorageAdapter from '../utils/NotesStorageAdapter';
import IntelliKnitLogger from '../../../shared/utils/ConsoleLogging';

const NotesContext = createContext();
const notesStorage = new NotesStorageAdapter();

export const NotesProvider = ({ children }) => {
    const [state, dispatch] = useReducer(notesReducer, initialState);

    // Load notes from storage on mount
    useEffect(() => {
        const loadNotes = async () => {
            try {
                const savedNotes = await notesStorage.getNotes();
                if (savedNotes && savedNotes.length > 0) {
                    dispatch({ type: 'LOAD_NOTES', payload: savedNotes });
                }
            } catch (error) {
                IntelliKnitLogger.error('Failed to load notes', error);
            }
        };

        loadNotes();
    }, []);

    // Save notes to storage whenever they change
    useEffect(() => {
        if (state.notes.length > 0) {
            notesStorage.saveNotes(state.notes).catch(error => {
                IntelliKnitLogger.error('Failed to save notes', error);
            });
        }
    }, [state.notes]);

    // Helper methods that mirror projects context API
    const notesApi = {
        // Create new note
        createNote: async (noteData) => {
            try {
                const newNote = {
                    id: `note_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    ...noteData,
                    isNote: true,
                    createdAt: new Date().toISOString(),
                    lastActivityAt: new Date().toISOString()
                };

                dispatch({ type: 'ADD_NOTE', payload: newNote });
                return newNote;
            } catch (error) {
                IntelliKnitLogger.error('Failed to create note', error);
                return null;
            }
        },

        // Update existing note
        updateNote: (updatedNote) => {
            dispatch({ type: 'UPDATE_NOTE', payload: updatedNote });
        },

        // Delete note
        deleteNote: async (noteId) => {
            try {
                const success = await notesStorage.deleteNote(noteId);
                if (success) {
                    dispatch({ type: 'DELETE_NOTE', payload: noteId });
                }
                return success;
            } catch (error) {
                IntelliKnitLogger.error('Failed to delete note', error);
                return false;
            }
        },

        // Set current note (for editing/viewing)
        setCurrentNote: (note) => {
            dispatch({ type: 'SET_CURRENT_NOTE', payload: note });
        },

        // Add step to note (mimics project step addition)
        addStep: (componentIndex, step) => {
            dispatch({
                type: 'ADD_STEP_TO_NOTE',
                payload: { componentIndex, step }
            });
        },

        // Update step in note
        updateStep: (componentIndex, stepIndex, step) => {
            dispatch({
                type: 'UPDATE_STEP_IN_NOTE',
                payload: { componentIndex, stepIndex, step }
            });
        },

        // Clear all notes (for testing/reset)
        clearAll: async () => {
            try {
                await notesStorage.clearAll();
                dispatch({ type: 'CLEAR_ALL_NOTES' });
                return true;
            } catch (error) {
                IntelliKnitLogger.error('Failed to clear all notes', error);
                return false;
            }
        },

        // Get storage info (for debugging)
        getStorageInfo: () => notesStorage.getStorageInfo()
    };

    const value = {
        // State (mirrors projects context)
        ...state,
        dispatch,

        // API methods
        ...notesApi,

        // Aliases for compatibility with existing project-based components
        currentProject: state.currentNote, // Allow existing components to work
        projects: state.notes, // For components that expect projects array
        selectedComponentIndex: state.selectedComponentIndex
    };

    return (
        <NotesContext.Provider value={value}>
            {children}
        </NotesContext.Provider>
    );
};

export const useNotesContext = () => {
    const context = useContext(NotesContext);
    if (!context) {
        throw new Error('useNotesContext must be used within a NotesProvider');
    }
    return context;
};