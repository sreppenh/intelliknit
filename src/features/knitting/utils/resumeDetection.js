export const getResumeData = () => {
    const storage = window.localStorage;

    // Filter to only include project-related progress keys, exclude notepad keys
    const progressKeys = Object.keys(storage).filter(key => {
        const isProgressKey = key.startsWith('knitting-progress-') || key.startsWith('row-counter-');
        const isNotepadKey = key.includes('notepad');

        return isProgressKey && !isNotepadKey;
    });

    if (progressKeys.length === 0) {
        return { hasActiveProject: false };
    }

    let mostRecentActivity = null;
    let mostRecentTimestamp = 0;

    progressKeys.forEach(key => {
        try {
            const data = JSON.parse(storage.getItem(key));
            const timestamp = data.lastUpdated || data.timestamp || 0;

            if (timestamp > mostRecentTimestamp) {
                mostRecentTimestamp = timestamp;

                if (key.startsWith('knitting-progress-')) {
                    // Format: knitting-progress-projectId-componentId
                    const parts = key.split('-');
                    const projectId = parts.slice(2, 7).join('-'); // UUID is 5 parts when split by -
                    const componentId = parts.slice(7, 12).join('-');
                    mostRecentActivity = { projectId, componentId };
                } else if (key.startsWith('row-counter-')) {
                    // ✅ FIX: row-counter uses step.id (UUID) not stepIndex in project mode
                    // Don't try to parse stepIndex - we'll determine it using getCurrentStepIndex
                    const parts = key.split('-');
                    const projectId = parts.slice(2, 7).join('-'); // First UUID (5 parts)
                    const componentId = parts.slice(7, 12).join('-'); // Second UUID (5 parts)
                    // ❌ REMOVED: const stepIndex = parseInt(parts[12]); 
                    mostRecentActivity = { projectId, componentId }; // ✅ Don't include stepIndex
                }
            }
        } catch (e) {
            // Skip invalid entries
        }
    });

    return {
        hasActiveProject: !!mostRecentActivity,
        ...mostRecentActivity,
        lastActivity: mostRecentTimestamp
    };
};