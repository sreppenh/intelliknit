/**
 * Active Context Hook - Context bridge for seamless project/note integration
 * Allows existing step wizards to work with both projects and notes
 */

import { useProjectsContext } from '../../features/projects/hooks/useProjectsContext';
import { useNotesContext } from '../../features/notes/hooks/useNotesContext';


export const useActiveContext = (mode = 'project') => {
    const projectsContext = useProjectsContext();
    const notesContext = useNotesContext();

    // For notepad mode, use notes context
    if (mode === 'notepad' || mode === 'note') {

        const currentNote = notesContext.currentNote;

        const mappedComponents = currentNote?.components?.map(comp => {
            const result = {
                ...comp,
                startingStitches: comp.startingStitches || currentNote.startingStitches || 0,
                construction: comp.construction || currentNote.construction || 'flat'
            };

            return result;
        }) || [{
            id: 'note-component',
            name: 'Pattern',
            construction: currentNote?.construction || 'flat',
            startingStitches: currentNote?.startingStitches || 0,
            steps: []
        }];



        return {
            // Core state (mapped to project-like structure)
            currentProject: currentNote ? {
                ...currentNote,
                // Ensure components array exists with proper note-to-component mapping
                components: currentNote.components?.map(comp => ({
                    ...comp,
                    // Map note's startingStitches to component level if not already set
                    startingStitches: comp.startingStitches || currentNote.startingStitches || 0,
                    construction: comp.construction || currentNote.construction || 'flat'
                })) || [{
                    id: 'note-component',
                    name: 'Pattern',
                    construction: currentNote.construction || 'flat',
                    startingStitches: currentNote.startingStitches || 0,
                    steps: []
                }]
            } : null,
            projects: notesContext.notes,
            selectedComponentIndex: notesContext.selectedComponentIndex,
            dispatch: notesContext.dispatch,

            // Data access (note-specific)
            yarns: currentNote?.yarns || [],
            gauge: currentNote?.gauge || null,
            colorMapping: currentNote?.colorMapping || {},
            colorCount: currentNote?.numberOfColors || 1,
            defaultUnits: currentNote?.defaultUnits || 'inches',
            needleInfo: currentNote?.needleInfo || '',

            // Actions (mapped to note operations)
            updateProject: notesContext.updateNote,
            addStep: notesContext.addStep,
            updateStep: notesContext.updateStep,
            setCurrentProject: notesContext.setCurrentNote,

            // Mode identification
            isNoteMode: true,
            isProjectMode: false,
            contextType: 'note'
        };
    }

    // Default to projects context
    return {
        // Core state (standard project structure)
        currentProject: projectsContext.currentProject,
        projects: projectsContext.projects,
        selectedComponentIndex: projectsContext.selectedComponentIndex,
        dispatch: projectsContext.dispatch,

        // Data access (project-specific)
        yarns: projectsContext.currentProject?.yarns || [],
        gauge: projectsContext.currentProject?.gauge || null,
        colorMapping: projectsContext.currentProject?.colorMapping || {},
        colorCount: projectsContext.currentProject?.colorCount || projectsContext.currentProject?.yarns?.length || 1,
        defaultUnits: projectsContext.currentProject?.defaultUnits || 'inches',
        needleInfo: projectsContext.currentProject?.needleInfo || '',

        // Actions (standard project operations)
        updateProject: (updatedProject) => {
            projectsContext.dispatch({ type: 'UPDATE_PROJECT', payload: updatedProject });
        },
        addStep: (componentIndex, step) => {
            projectsContext.dispatch({
                type: 'ADD_STEP',
                payload: { componentIndex, step }
            });
        },
        updateStep: (componentIndex, stepIndex, step) => {
            projectsContext.dispatch({
                type: 'UPDATE_STEP',
                payload: { componentIndex, stepIndex, step }
            });
        },
        setCurrentProject: (project) => {
            projectsContext.dispatch({ type: 'SET_CURRENT_PROJECT', payload: project });
        },

        // Mode identification
        isNoteMode: false,
        isProjectMode: true,
        contextType: 'project'
    };
};