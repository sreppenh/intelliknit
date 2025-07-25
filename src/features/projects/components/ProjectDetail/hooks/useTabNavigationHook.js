import { useState, useEffect, useCallback } from 'react';

/**
 * useTabNavigation - Intelligent tab navigation with memory management
 * 
 * Features:
 * - Per-project tab memory: Remembers last active tab for each project
 * - Default routing: Always starts new projects on 'overview' tab
 * - State persistence: Survives browser refresh and app restart
 * - Memory cleanup: Removes memory for deleted projects
 */

const TAB_MEMORY_KEY = 'intelliknit_tab_memory';
const DEFAULT_TAB = 'overview';

const useTabNavigation = (projectId) => {
    const [currentTab, setCurrentTab] = useState(DEFAULT_TAB);
    const [projectTabMemory, setProjectTabMemory] = useState({});

    // Load saved tab memory from localStorage on mount
    useEffect(() => {
        try {
            const savedMemory = localStorage.getItem(TAB_MEMORY_KEY);
            if (savedMemory) {
                const parsedMemory = JSON.parse(savedMemory);
                setProjectTabMemory(parsedMemory);

                // Set current tab based on project memory or default
                if (projectId && parsedMemory[projectId]) {
                    setCurrentTab(parsedMemory[projectId]);
                } else {
                    setCurrentTab(DEFAULT_TAB);
                }
            }
        } catch (error) {
            console.warn('Failed to load tab memory from localStorage:', error);
            setProjectTabMemory({});
            setCurrentTab(DEFAULT_TAB);
        }
    }, [projectId]);

    // Save tab memory to localStorage whenever it changes
    useEffect(() => {
        try {
            localStorage.setItem(TAB_MEMORY_KEY, JSON.stringify(projectTabMemory));
        } catch (error) {
            console.warn('Failed to save tab memory to localStorage:', error);
        }
    }, [projectTabMemory]);

    // Change tab and remember it for this project
    const changeTab = useCallback((tabId) => {
        setCurrentTab(tabId);

        if (projectId) {
            setProjectTabMemory(prev => ({
                ...prev,
                [projectId]: tabId
            }));
        }
    }, [projectId]);

    // Clean up memory for deleted projects
    const cleanupProjectMemory = useCallback((deletedProjectIds) => {
        if (!deletedProjectIds || deletedProjectIds.length === 0) return;

        setProjectTabMemory(prev => {
            const cleaned = { ...prev };
            deletedProjectIds.forEach(id => {
                delete cleaned[id];
            });
            return cleaned;
        });
    }, []);

    // Reset to default tab (useful for new projects)
    const resetToDefault = useCallback(() => {
        setCurrentTab(DEFAULT_TAB);
    }, []);

    // Get tab for specific project without changing current
    const getProjectTab = useCallback((targetProjectId) => {
        return projectTabMemory[targetProjectId] || DEFAULT_TAB;
    }, [projectTabMemory]);

    return {
        // Current state
        currentTab,
        defaultTab: DEFAULT_TAB,

        // Actions
        changeTab,
        resetToDefault,
        cleanupProjectMemory,
        getProjectTab,

        // Memory state (for debugging/admin)
        projectTabMemory,

        // Utility
        hasMemoryFor: (targetProjectId) => Boolean(projectTabMemory[targetProjectId])
    };
};

export default useTabNavigation;