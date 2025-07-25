import React, { useState, useEffect } from 'react';

/**
 * Enhanced TabBar Component with Memory Management
 * 
 * Features:
 * - Smooth transition animations
 * - Visual feedback for touch interactions
 * - Accessibility improvements
 * - Performance optimizations
 * - Mobile-optimized touch targets
 * - Backward compatible with existing TabBar API
 */

const TabBar = ({
    activeTab,
    onTabChange,
    children,
    className = "",
    animated = true
}) => {
    const [isTransitioning, setIsTransitioning] = useState(false);

    // Handle tab change with smooth transition
    const handleTabChange = (tabId) => {
        if (tabId === activeTab || isTransitioning) return;

        if (animated) {
            setIsTransitioning(true);
            // Brief transition state for visual feedback
            setTimeout(() => {
                onTabChange(tabId);
                setIsTransitioning(false);
            }, 50);
        } else {
            onTabChange(tabId);
        }
    };

    return (
        <div className={`bg-sage-100 border-b border-sage-200 ${className}`}>
            <div className="flex relative">
                {React.Children.map(children, (child) => {
                    if (React.isValidElement(child) && child.type === Tab) {
                        return React.cloneElement(child, {
                            isActive: activeTab === child.props.id,
                            onClick: () => handleTabChange(child.props.id),
                            isTransitioning,
                            animated
                        });
                    }
                    return child;
                })}
            </div>
        </div>
    );
};

const Tab = ({
    id,
    label,
    isActive,
    onClick,
    className = "",
    isTransitioning = false,
    animated = true
}) => {
    const [isPressed, setIsPressed] = useState(false);

    const handleTouchStart = () => setIsPressed(true);
    const handleTouchEnd = () => {
        setIsPressed(false);
        onClick();
    };

    const getTabClasses = () => {
        const baseClasses = `
      flex-1 px-4 py-3 text-sm font-medium transition-all duration-200
      border-b-3 border-transparent min-h-[44px] flex items-center justify-center
      ${animated ? 'transform' : ''}
    `;

        const stateClasses = isActive
            ? 'text-sage-800 border-sage-500 bg-white font-semibold shadow-sm'
            : 'text-sage-600 hover:text-sage-800 hover:bg-sage-50';

        const interactionClasses = isPressed
            ? 'scale-95 bg-sage-200'
            : 'scale-100';

        const transitionClasses = isTransitioning
            ? 'opacity-75'
            : 'opacity-100';

        return `${baseClasses} ${stateClasses} ${interactionClasses} ${transitionClasses} ${className}`;
    };

    return (
        <button
            onClick={onClick}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onMouseLeave={() => setIsPressed(false)}
            className={getTabClasses()}
            aria-selected={isActive}
            role="tab"
            tabIndex={isActive ? 0 : -1}
        >
            <span className="relative z-10">
                {label}
            </span>

            {/* Active indicator with smooth animation */}
            {isActive && animated && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-sage-500 rounded-t-full transform transition-all duration-300 ease-out" />
            )}
        </button>
    );
};

// Attach Tab as a property for clean usage
TabBar.Tab = Tab;

export default TabBar;