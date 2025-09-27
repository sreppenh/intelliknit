// src/shared/hooks/useYarnManager.js
import { useProjectsContext } from '../../features/projects/hooks/useProjectsContext';

/**
 * 🧶 Custom hook for managing project yarns
 * Provides consistent yarn operations across the app
 */
const useYarnManager = () => {
    const { currentProject, dispatch } = useProjectsContext();

    // Get available letters based on project color count
    const getAvailableLetters = () => {
        const count = currentProject?.colorCount || 2;
        return Array.from({ length: count }, (_, i) => String.fromCharCode(65 + i));
    };

    // Get current yarns
    const getYarns = () => {
        return currentProject?.yarns || [];
    };

    // Add new yarn
    const addYarn = (yarnData, conflictYarn = null) => {
        let updatedYarns = [...getYarns()];
        let updatedMapping = { ...currentProject?.colorMapping || {} };

        // Handle conflict (unassign existing yarn's letter)
        if (conflictYarn) {
            const conflictIndex = updatedYarns.findIndex(y => y.id === conflictYarn.id);
            if (conflictIndex !== -1) {
                updatedYarns[conflictIndex] = {
                    ...updatedYarns[conflictIndex],
                    letter: ''
                };
                if (conflictYarn.letter) {
                    delete updatedMapping[conflictYarn.letter];
                }
            }
        }

        // Add new yarn
        const newYarn = {
            ...yarnData,
            id: yarnData.id || Date.now()
        };
        updatedYarns.push(newYarn);

        // Update mapping
        if (yarnData.letter) {
            updatedMapping[yarnData.letter] = `${yarnData.brand} - ${yarnData.color}`;
        }

        // Auto-update color count if needed
        const newColorCount = Math.max(
            currentProject?.colorCount || 2,
            updatedYarns.length
        );

        // Dispatch update
        dispatch({
            type: 'UPDATE_PROJECT',
            payload: {
                ...currentProject,
                yarns: updatedYarns,
                colorMapping: updatedMapping,
                colorCount: newColorCount
            }
        });

        return newYarn;
    };

    // Update existing yarn
    const updateYarn = (yarnId, yarnData, conflictYarn = null) => {
        let updatedYarns = [...getYarns()];
        let updatedMapping = { ...currentProject?.colorMapping || {} };

        const yarnIndex = updatedYarns.findIndex(y => y.id === yarnId);
        if (yarnIndex === -1) return null;

        // Handle conflict
        if (conflictYarn) {
            const conflictIndex = updatedYarns.findIndex(y => y.id === conflictYarn.id);
            if (conflictIndex !== -1 && conflictIndex !== yarnIndex) {
                updatedYarns[conflictIndex] = {
                    ...updatedYarns[conflictIndex],
                    letter: ''
                };
                if (conflictYarn.letter) {
                    delete updatedMapping[conflictYarn.letter];
                }
            }
        }

        // Remove old letter mapping
        const oldYarn = updatedYarns[yarnIndex];
        if (oldYarn.letter && oldYarn.letter !== yarnData.letter) {
            delete updatedMapping[oldYarn.letter];
        }

        // Update yarn
        updatedYarns[yarnIndex] = {
            ...oldYarn,
            ...yarnData,
            id: yarnId
        };

        // Update mapping
        if (yarnData.letter) {
            updatedMapping[yarnData.letter] = `${yarnData.brand} - ${yarnData.color}`;
        }

        // Dispatch update
        dispatch({
            type: 'UPDATE_PROJECT',
            payload: {
                ...currentProject,
                yarns: updatedYarns,
                colorMapping: updatedMapping
            }
        });

        return updatedYarns[yarnIndex];
    };

    // Delete yarn
    const deleteYarn = (yarnId) => {
        const updatedYarns = getYarns().filter(y => y.id !== yarnId);
        const updatedMapping = { ...currentProject?.colorMapping || {} };

        // Remove letter mapping for deleted yarn
        const deletedYarn = getYarns().find(y => y.id === yarnId);
        if (deletedYarn?.letter) {
            delete updatedMapping[deletedYarn.letter];
        }

        // Dispatch update
        dispatch({
            type: 'UPDATE_PROJECT',
            payload: {
                ...currentProject,
                yarns: updatedYarns,
                colorMapping: updatedMapping
            }
        });
    };

    // Get yarn by ID
    const getYarnById = (yarnId) => {
        return getYarns().find(y => y.id === yarnId);
    };

    // Get yarn by letter
    const getYarnByLetter = (letter) => {
        return getYarns().find(y => y.letter === letter);
    };

    // Get color info for a letter (useful for display)
    const getColorInfo = (letter) => {
        const yarn = getYarnByLetter(letter);
        const mapping = currentProject?.colorMapping || {};

        return {
            name: yarn?.color || mapping[letter] || `Color ${letter}`,
            displayName: yarn?.color || `Color ${letter}`,
            hex: yarn?.colorHex || '#f3f4f6',
            hasMapping: !!(yarn?.color || mapping[letter]),
            hasYarn: !!yarn,
            yarn: yarn
        };
    };

    return {
        // Data
        yarns: getYarns(),
        availableLetters: getAvailableLetters(),
        currentProject,

        // CRUD operations
        addYarn,
        updateYarn,
        deleteYarn,

        // Getters
        getYarnById,
        getYarnByLetter,
        getColorInfo
    };
};

export default useYarnManager;