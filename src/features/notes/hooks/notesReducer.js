/**
 * Notes Reducer - Simplified version of projects reducer for notes management
 */

import IntelliKnitLogger from '../../../shared/utils/ConsoleLogging';

export const initialState = {
    notes: [],
    currentNote: null,
    selectedComponentIndex: null
};

export const notesReducer = (state, action) => {
    switch (action.type) {
        case 'LOAD_NOTES':
            return {
                ...state,
                notes: action.payload || []
            };

        case 'SET_CURRENT_NOTE':
            return {
                ...state,
                currentNote: action.payload,
                selectedComponentIndex: null
            };

        case 'ADD_NOTE': {
            const newNote = action.payload;

            if (!newNote || !newNote.id) {
                IntelliKnitLogger.error('ADD_NOTE: Invalid note data');
                return state;
            }

            // Ensure note has required structure
            const formattedNote = {
                ...newNote,
                isNote: true,
                createdAt: new Date().toISOString(),
                lastActivityAt: new Date().toISOString(),
                components: newNote.components || []
            };

            return {
                ...state,
                notes: [formattedNote, ...state.notes],
                currentNote: formattedNote
            };
        }

        case 'UPDATE_NOTE': {
            const updatedNote = {
                ...action.payload,
                lastActivityAt: new Date().toISOString()
            };

            const updatedNotes = state.notes.map(note =>
                note.id === updatedNote.id ? updatedNote : note
            );

            return {
                ...state,
                notes: updatedNotes,
                currentNote: state.currentNote?.id === updatedNote.id ? updatedNote : state.currentNote
            };
        }

        case 'DELETE_NOTE': {
            const noteId = action.payload;
            const filteredNotes = state.notes.filter(note => note.id !== noteId);

            return {
                ...state,
                notes: filteredNotes,
                currentNote: state.currentNote?.id === noteId ? null : state.currentNote
            };
        }

        case 'SET_SELECTED_COMPONENT_INDEX':
            return {
                ...state,
                selectedComponentIndex: action.payload
            };


        case 'ADD_STEP_TO_NOTE': {
            if (!state.currentNote) {
                IntelliKnitLogger.error('ADD_STEP_TO_NOTE: No current note');
                return state;
            }

            const { componentIndex, step } = action.payload;
            const updatedNote = { ...state.currentNote };

            if (!updatedNote.components[componentIndex]) {
                IntelliKnitLogger.error('ADD_STEP_TO_NOTE: Invalid component index');
                return state;
            }

            // Add step to component
            updatedNote.components[componentIndex].steps.push(step);
            updatedNote.lastActivityAt = new Date().toISOString();

            // Update notes array
            const updatedNotes = state.notes.map(note =>
                note.id === updatedNote.id ? updatedNote : note
            );

            return {
                ...state,
                notes: updatedNotes,
                currentNote: updatedNote
            };
        }

        case 'UPDATE_STEP_IN_NOTE': {
            if (!state.currentNote) {
                IntelliKnitLogger.error('UPDATE_STEP_IN_NOTE: No current note');
                return state;
            }

            const { componentIndex, stepIndex, step } = action.payload;
            const updatedNote = { ...state.currentNote };

            if (!updatedNote.components[componentIndex] || !updatedNote.components[componentIndex].steps[stepIndex]) {
                IntelliKnitLogger.error('UPDATE_STEP_IN_NOTE: Invalid indices');
                return state;
            }

            // Update step
            updatedNote.components[componentIndex].steps[stepIndex] = step;
            updatedNote.lastActivityAt = new Date().toISOString();

            // Update notes array
            const updatedNotes = state.notes.map(note =>
                note.id === updatedNote.id ? updatedNote : note
            );

            return {
                ...state,
                notes: updatedNotes,
                currentNote: updatedNote
            };
        }

        case 'SET_SELECTED_COMPONENT_INDEX':
            return {
                ...state,
                selectedComponentIndex: action.payload
            };

        case 'CLEAR_ALL_NOTES':
            return {
                ...initialState
            };

        default:
            IntelliKnitLogger.warn(`Unknown action type: ${action.type}`);
            return state;
    }
};