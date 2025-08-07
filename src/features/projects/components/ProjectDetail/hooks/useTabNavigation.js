import { useState, useCallback } from 'react';

/**
 * useTabNavigation - Simplified tab navigation without memory
 * 
 * Features:
 * - Always starts on 'overview' tab
 * - No localStorage, no flash
 * - Clean and simple
 */

const DEFAULT_TAB = 'overview';

const useTabNavigation = (projectId, initialTab = 'overview') => {
    const [currentTab, setCurrentTab] = useState(initialTab);

    // Change tab - simple state update only
    const changeTab = useCallback((tabId) => {
        setCurrentTab(tabId);
    }, []);

    // Reset to default tab (useful for new projects)
    const resetToDefault = useCallback(() => {
        setCurrentTab(DEFAULT_TAB);
    }, []);

    return {
        // Current state
        currentTab,
        defaultTab: DEFAULT_TAB,

        // Actions
        changeTab,
        resetToDefault
    };
};

export default useTabNavigation;