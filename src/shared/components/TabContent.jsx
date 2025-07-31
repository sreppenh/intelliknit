import React from 'react';

/**
 * TabContent - Standardized tab content wrapper
 * Provides consistent spacing, error boundaries, and loading states
 * 
 * Features:
 * - Consistent background and spacing across all tabs
 * - Built-in loading state with spinner
 * - Error state handling with user-friendly messages
 * - Empty state support with custom content
 * - Flexible className override for special cases
 */
const TabContent = ({
    children,
    className = "",
    loading = false,
    error = null,
    emptyState = null,
    showEmptyState = false
}) => {
    if (loading) {
        return (
            <div className={`p-6 text-center py-12 ${className}`}>
                <div className="text-4xl mb-3">⏳</div>
                <h3 className="font-semibold text-wool-700 mb-2">Loading...</h3>
                <p className="text-wool-500 text-sm">Please wait while we load your data</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className={`p-6 text-center py-12 ${className}`}>
                <div className="text-4xl mb-3">⚠️</div>
                <h3 className="font-semibold text-red-700 mb-2">Something went wrong</h3>
                <p className="text-red-600 text-sm">{error}</p>
            </div>
        );
    }

    if (showEmptyState && emptyState) {
        return (
            <div className={`p-6 text-center py-12 ${className}`}>
                {emptyState}
            </div>
        );
    }

    return (
        <div className={`bg-yarn-50 min-h-screen ${className}`}>
            {children}
        </div>
    );
};

export default TabContent;