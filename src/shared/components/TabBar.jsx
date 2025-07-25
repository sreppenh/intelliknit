import React from 'react';

/**
 * Flexible TabBar Component
 * Replaces the rigid 3-segment ContextualBar with flexible tab-based navigation
 */

const TabBar = ({ activeTab, onTabChange, children, className = "" }) => {
    return (
        <div className={`bg-sage-100 border-b border-sage-200 ${className}`}>
            <div className="flex">
                {React.Children.map(children, (child) => {
                    if (React.isValidElement(child) && child.type === Tab) {
                        return React.cloneElement(child, {
                            isActive: activeTab === child.props.id,
                            onClick: () => onTabChange(child.props.id)
                        });
                    }
                    return child;
                })}
            </div>
        </div>
    );
};

const Tab = ({ id, label, isActive, onClick, className = "" }) => {
    return (
        <button
            onClick={onClick}
            className={`
        flex-1 px-4 py-3 text-sm font-medium transition-all duration-200
        border-b-3 border-transparent
        ${isActive
                    ? 'text-sage-800 border-sage-500 bg-white font-semibold'
                    : 'text-sage-600 hover:text-sage-800 hover:bg-sage-50'
                }
        ${className}
      `}
        >
            {label}
        </button>
    );
};

// Attach Tab as a property for clean usage
TabBar.Tab = Tab;

export default TabBar;