// src/shared/components/ContextualBar.jsx
import React from 'react';

/**
 * ContextualBar - A flexible contextual information bar that extends headers
 * Matches the styling and behavior of WizardHeader's contextual bar
 * 
 * Usage:
 * <ContextualBar>
 *   <ContextualBar.Left>Filter content</ContextualBar.Left>
 *   <ContextualBar.Middle>Status info</ContextualBar.Middle>
 *   <ContextualBar.Right>Action buttons</ContextualBar.Right>
 * </ContextualBar>
 */

const ContextualBar = ({ children, className = "", ...props }) => {
    return (
        <div
            className={`px-4 sm:px-6 py-2 sm:py-3 bg-sage-100 border-b border-sage-200 ${className}`}
            {...props}
        >
            <div className="flex items-center justify-between text-sm">
                {children}
            </div>
        </div>
    );
};

// Left section - typically for filters, controls, or labels
const ContextualBarLeft = ({ children, className = "", ...props }) => {
    return (
        <div
            className={`flex items-center gap-2 sm:gap-4 ${className}`}
            {...props}
        >
            {children}
        </div>
    );
};

// Middle section - typically for status info, counts, or descriptions
const ContextualBarMiddle = ({ children, className = "", ...props }) => {
    return (
        <div
            className={`flex items-center gap-2 text-sage-600 text-sm font-medium ${className}`}
            {...props}
        >
            {children}
        </div>
    );
};

// Right section - typically for action buttons or additional info
const ContextualBarRight = ({ children, className = "", ...props }) => {
    return (
        <div
            className={`flex items-center gap-2 sm:gap-3 ${className}`}
            {...props}
        >
            {children}
        </div>
    );
};

// Attach sub-components to main component for clean API
ContextualBar.Left = ContextualBarLeft;
ContextualBar.Middle = ContextualBarMiddle;
ContextualBar.Right = ContextualBarRight;

export default ContextualBar;