import { useState, useEffect, useCallback } from 'react';

/**
 * useThreeDotMenu - Standardized three-dot menu behavior
 * Used by ComponentsTab and ChecklistTab for consistent menu interactions
 * 
 * Features:
 * - Proper z-index management (z-[100] for menu, z-[90] for backdrop)
 * - Click-outside detection with backdrop
 * - ESC key support
 * - Prevents event bubbling issues
 */
const useThreeDotMenu = () => {
    const [openMenuId, setOpenMenuId] = useState(null);

    // Handle ESC key to close menu
    useEffect(() => {
        const handleEscKey = (event) => {
            if (event.key === 'Escape' && openMenuId) {
                setOpenMenuId(null);
            }
        };

        if (openMenuId) {
            document.addEventListener('keydown', handleEscKey);
        }

        return () => {
            document.removeEventListener('keydown', handleEscKey);
        };
    }, [openMenuId]);

    const handleMenuToggle = useCallback((itemId, event) => {
        event?.stopPropagation();
        setOpenMenuId(openMenuId === itemId ? null : itemId);
    }, [openMenuId]);

    const handleMenuAction = useCallback((action, itemId, additionalData = null, event = null) => {
        event?.stopPropagation();
        setOpenMenuId(null);

        return {
            action,
            itemId,
            additionalData,
            timestamp: Date.now()
        };
    }, []);

    const closeMenu = useCallback(() => {
        setOpenMenuId(null);
    }, []);

    // Backdrop click handler for click-outside behavior
    const handleBackdropClick = useCallback((event) => {
        // Only close if clicking the backdrop itself, not child elements
        if (event.target === event.currentTarget) {
            setOpenMenuId(null);
        }
    }, []);

    // Close menu when clicking outside (alternative pattern)
    const handleClickOutside = useCallback((event) => {
        if (!event.target.closest('.three-dot-menu')) {
            setOpenMenuId(null);
        }
    }, []);

    return {
        openMenuId,
        setOpenMenuId,
        handleMenuToggle,
        handleMenuAction,
        closeMenu,
        handleBackdropClick,
        handleClickOutside
    };
};

export default useThreeDotMenu;