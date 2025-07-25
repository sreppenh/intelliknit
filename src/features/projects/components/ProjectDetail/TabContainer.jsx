import React, { useMemo } from 'react';

/**
 * TabContainer - Intelligent tab content management system
 * 
 * Features:
 * - Handles tab content switching logic
 * - Manages tab-specific loading states
 * - Coordinates tab-to-tab data flow
 * - Handles empty state delegation
 * - Performance: only renders active tab content
 */

const TabContainer = ({
    activeTab,
    project,
    onTabAction,
    children,
    className = ""
}) => {

    // Map children to tab IDs for efficient lookup
    const tabComponents = useMemo(() => {
        const components = {};

        React.Children.forEach(children, (child) => {
            if (React.isValidElement(child) && child.props.tabId) {
                components[child.props.tabId] = child;
            }
        });

        return components;
    }, [children]);

    // Get the currently active tab component
    const activeTabComponent = tabComponents[activeTab];

    // Handle tab actions (delegated from tabs to parent)
    const handleTabAction = (action) => {
        if (onTabAction) {
            onTabAction({
                ...action,
                sourceTab: activeTab,
                timestamp: Date.now()
            });
        }
    };

    // Enhanced props to pass to tab components
    const enhancedProps = {
        project,
        isActive: true,
        onTabAction: handleTabAction,
        // Add any cross-tab data sharing here in the future
    };

    if (!activeTabComponent) {
        // Fallback for unknown tab
        return (
            <div className={`p-6 text-center ${className}`}>
                <div className="text-4xl mb-3">❓</div>
                <h3 className="font-semibold text-wool-700 mb-2">Tab Not Found</h3>
                <p className="text-wool-500 text-sm">The requested tab could not be loaded.</p>
            </div>
        );
    }

    return (
        <div className={`bg-yarn-50 transition-all duration-200 ${className}`}>
            {React.cloneElement(activeTabComponent, enhancedProps)}
        </div>
    );
};

// Tab wrapper component for consistent tab registration
TabContainer.Tab = ({ tabId, children, ...props }) => {
    return React.cloneElement(children, { tabId, ...props });
};

export default TabContainer;