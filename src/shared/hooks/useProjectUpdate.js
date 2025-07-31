import { useCallback } from 'react';

/**
 * useProjectUpdate - Standardized debounced project updates
 * Used by DetailsTab and ChecklistTab for consistent data persistence
 * 
 * Features:
 * - Debounced updates (100ms) to prevent excessive saves
 * - Batched updates using window.pendingUpdates
 * - Consistent update patterns across all tabs
 * - Helper methods for common update operations
 */
const useProjectUpdate = (onProjectUpdate) => {
    const updateProject = useCallback((project, updates) => {
        if (!window.pendingUpdates) {
            window.pendingUpdates = {};
        }

        // Merge updates
        Object.assign(window.pendingUpdates, updates);

        // Debounce the actual update
        clearTimeout(window.updateTimeout);
        window.updateTimeout = setTimeout(() => {
            const updatedProject = {
                ...project,
                ...window.pendingUpdates
            };

            onProjectUpdate(updatedProject);
            window.pendingUpdates = {};
        }, 100);
    }, [onProjectUpdate]);

    const updateField = useCallback((project, field, value) => {
        updateProject(project, { [field]: value });
    }, [updateProject]);

    const addArrayItem = useCallback((project, field, itemData) => {
        const currentArray = project[field] || [];
        const newArray = [...currentArray, itemData];
        updateProject(project, { [field]: newArray });
    }, [updateProject]);

    const removeArrayItem = useCallback((project, field, index) => {
        const currentArray = project[field] || [];
        const newArray = currentArray.filter((_, i) => i !== index);
        updateProject(project, { [field]: newArray });
    }, [updateProject]);

    const updateArrayItem = useCallback((project, field, index, itemUpdates) => {
        const currentArray = project[field] || [];
        const newArray = currentArray.map((item, i) =>
            i === index ? { ...item, ...itemUpdates } : item
        );
        updateProject(project, { [field]: newArray });
    }, [updateProject]);

    const toggleArrayItemProperty = useCallback((project, field, index, property) => {
        const currentArray = project[field] || [];
        const newArray = currentArray.map((item, i) =>
            i === index ? { ...item, [property]: !item[property] } : item
        );
        updateProject(project, { [field]: newArray });
    }, [updateProject]);

    return {
        updateProject,
        updateField,
        addArrayItem,
        removeArrayItem,
        updateArrayItem,
        toggleArrayItemProperty
    };
};

export default useProjectUpdate;