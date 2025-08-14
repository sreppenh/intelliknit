// src/shared/hooks/useStandardModal.js

import { useEffect, useRef, useCallback } from 'react';

/**
 * Universal Modal Behavior Hook
 * 
 * Provides standardized keyboard shortcuts, click behaviors, and focus management
 * for all IntelliKnit modals based on the Standardized Modal Behavior document.
 * 
 * @param {Object} config - Modal configuration
 * @param {boolean} config.isOpen - Whether modal is open
 * @param {Function} config.onClose - Close/cancel handler
 * @param {Function} config.onConfirm - Primary action handler (optional)
 * @param {string} config.category - Modal category: 'simple', 'input', 'warning', 'complex'
 * @param {boolean} config.allowBackdropClick - Override backdrop click behavior
 * @param {boolean} config.allowEscKey - Override ESC key behavior
 * @param {boolean} config.allowEnterKey - Override Enter key behavior
 * @param {boolean} config.focusFirstInput - Focus first input instead of button
 * @param {boolean} config.selectInputText - Select text in focused input
 * @param {string} config.focusSelector - Custom selector for initial focus
 * 
 * @returns {Object} - Event handlers and refs for modal implementation
 */
export const useStandardModal = (config = {}) => {
    const {
        isOpen = false,
        onClose = () => { },
        onConfirm = null,
        category = 'simple',
        allowBackdropClick = null,
        allowEscKey = null,
        allowEnterKey = null,
        focusFirstInput = false,
        selectInputText = false,
        focusSelector = null
    } = config;

    const modalRef = useRef(null);
    const previousFocusRef = useRef(null);

    // ===== CATEGORY DEFAULTS =====
    const getCategoryDefaults = (category) => {
        switch (category) {
            case 'simple':
                return {
                    escKey: true,
                    backdropClick: true,
                    enterKey: false,
                    defaultFocus: '[data-modal-primary]'
                };

            case 'input':
                return {
                    escKey: true,
                    backdropClick: true,
                    enterKey: true,
                    defaultFocus: 'input:not([type="hidden"]), textarea'
                };

            case 'warning':
                return {
                    escKey: true,  // Goes to safe action (cancel)
                    backdropClick: true,  // Goes to safe action (cancel)
                    enterKey: false,  // Force deliberate choice
                    defaultFocus: '[data-modal-exit]'  // Focus destructive button
                };

            case 'complex':
                return {
                    escKey: true,
                    backdropClick: false,  // Prevent accidental loss
                    enterKey: false,
                    defaultFocus: '[data-modal-primary]'
                };

            default:
                return {
                    escKey: true,
                    backdropClick: true,
                    enterKey: false,
                    defaultFocus: '[data-modal-primary]'
                };
        }
    };

    const defaults = getCategoryDefaults(category);

    // Allow overrides
    const shouldAllowEsc = allowEscKey !== null ? allowEscKey : defaults.escKey;
    const shouldAllowBackdrop = allowBackdropClick !== null ? allowBackdropClick : defaults.backdropClick;
    const shouldAllowEnter = allowEnterKey !== null ? allowEnterKey : defaults.enterKey;

    // ===== KEYBOARD HANDLERS =====
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (event) => {
            // ESC Key Handler
            if (event.key === 'Escape' && shouldAllowEsc) {
                event.preventDefault();
                event.stopPropagation();
                onClose();
                return;
            }

            // Enter Key Handler (only for input modals with confirm)
            if (event.key === 'Enter' && shouldAllowEnter && onConfirm) {
                // Don't trigger on textareas (they need line breaks)
                if (event.target.tagName === 'TEXTAREA') return;

                // Check if we're in a form that might have validation
                const form = event.target.closest('form');
                if (form) {
                    const isValid = form.checkValidity();
                    if (!isValid) return;
                }

                event.preventDefault();
                onConfirm();
                return;
            }

            // Tab Trap (keep focus within modal)
            if (event.key === 'Tab') {
                const focusableElements = modalRef.current?.querySelectorAll(
                    'button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'
                );

                if (focusableElements && focusableElements.length > 0) {
                    const firstElement = focusableElements[0];
                    const lastElement = focusableElements[focusableElements.length - 1];

                    if (event.shiftKey && document.activeElement === firstElement) {
                        event.preventDefault();
                        lastElement.focus();
                    } else if (!event.shiftKey && document.activeElement === lastElement) {
                        event.preventDefault();
                        firstElement.focus();
                    }
                }
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, shouldAllowEsc, shouldAllowEnter, onClose, onConfirm]);

    // ===== FOCUS MANAGEMENT =====
    useEffect(() => {
        if (!isOpen) {
            // Restore focus when closing
            if (previousFocusRef.current) {
                previousFocusRef.current.focus();
                previousFocusRef.current = null;
            }
            return;
        }

        // Store current focus
        previousFocusRef.current = document.activeElement;

        // Set initial focus with a small delay for render
        const focusTimer = setTimeout(() => {
            if (!modalRef.current) return;

            let elementToFocus = null;

            // Priority order for focus:
            // 1. Custom selector
            // 2. First input (if focusFirstInput is true)
            // 3. Category default
            // 4. First focusable element

            if (focusSelector) {
                elementToFocus = modalRef.current.querySelector(focusSelector);
            } else if (focusFirstInput || category === 'input') {
                elementToFocus = modalRef.current.querySelector('input:not([type="hidden"]), textarea');
            } else {
                elementToFocus = modalRef.current.querySelector(defaults.defaultFocus);
            }

            // Fallback to first focusable element
            if (!elementToFocus) {
                elementToFocus = modalRef.current.querySelector(
                    'button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), a[href]'
                );
            }

            if (elementToFocus) {
                elementToFocus.focus();

                // Select text if it's an input and selectInputText is true
                if (selectInputText && (elementToFocus.tagName === 'INPUT' || elementToFocus.tagName === 'TEXTAREA')) {
                    elementToFocus.select();
                }
            }
        }, 100);

        return () => clearTimeout(focusTimer);
    }, [isOpen, category, focusFirstInput, selectInputText, focusSelector, defaults.defaultFocus]);

    // ===== BACKDROP CLICK HANDLER =====
    const handleBackdropClick = useCallback((event) => {
        // Only close if clicking the backdrop itself, not children
        if (shouldAllowBackdrop && event.target === event.currentTarget) {
            onClose();
        }
    }, [shouldAllowBackdrop, onClose]);

    // ===== ARIA HELPERS =====
    const getModalProps = () => ({
        ref: modalRef,
        role: 'dialog',
        'aria-modal': 'true',
        'aria-labelledby': 'modal-title',
        'aria-describedby': 'modal-description'
    });

    const getBackdropProps = () => ({
        onClick: handleBackdropClick,
        className: 'modal-backdrop' // You can customize this
    });

    // ===== PUBLIC API =====
    return {
        // Event handlers
        handleBackdropClick,

        // Refs
        modalRef,

        // Props helpers
        getModalProps,
        getBackdropProps,

        // State
        isOpen,

        // Actions
        close: onClose,
        confirm: onConfirm
    };
};

/**
 * Simple Modal Hook - Convenience wrapper for simple action modals
 */
export const useSimpleModal = (isOpen, onClose) => {
    return useStandardModal({
        isOpen,
        onClose,
        category: 'simple'
    });
};

/**
 * Input Modal Hook - Convenience wrapper for input modals
 */
export const useInputModal = (isOpen, onClose, onConfirm) => {
    return useStandardModal({
        isOpen,
        onClose,
        onConfirm,
        category: 'input'
    });
};

/**
 * Warning Modal Hook - Convenience wrapper for warning modals
 */
export const useWarningModal = (isOpen, onCancel, onConfirmDestructive) => {
    return useStandardModal({
        isOpen,
        onClose: onCancel,
        onConfirm: onConfirmDestructive,
        category: 'warning'
    });
};

/**
 * Complex Modal Hook - Convenience wrapper for complex modals
 */
export const useComplexModal = (isOpen, onClose, options = {}) => {
    return useStandardModal({
        isOpen,
        onClose,
        category: 'complex',
        ...options
    });
};

export default useStandardModal;