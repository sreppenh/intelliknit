// src/shared/components/modals/StandardModal.jsx
import React from 'react';
import ReactDOM from 'react-dom';
import { useStandardModal } from '../../hooks/useStandardModal';

export const StandardModal = ({
    isOpen,
    onClose,
    onConfirm,
    category = 'simple',
    colorScheme = 'sage',
    title,
    subtitle,
    icon,
    children,
    primaryButtonText = 'Confirm',
    secondaryButtonText = 'Cancel',
    showButtons = true,
    fullScreen = false,
    backgroundTheme = null, // For full-screen background colors
    className = '',
    primaryButtonProps = {},
    ...modalOptions
}) => {
    const { handleBackdropClick, modalRef, getModalProps } = useStandardModal({
        isOpen,
        onClose,
        onConfirm,
        category,
        allowBackdropClick: fullScreen ? false : null, // Disable backdrop click for full-screen
        ...modalOptions
    });

    if (!isOpen) return null;

    // Color scheme mapping
    const colorSchemes = {
        sage: {
            headerBg: 'bg-sage-200',
            headerText: 'text-sage-800',
            closeBtn: 'modal-close-light',
            contentBg: 'bg-white',
            borderColor: 'border-sage-300',
            modalBorder: 'border-sage-200'
        },
        lavender: {
            headerBg: 'bg-lavender-200',
            headerText: 'text-lavender-800',
            closeBtn: 'modal-close-light',
            contentBg: 'bg-white',
            borderColor: 'border-lavender-300',
            modalBorder: 'border-lavender-200'
        },
        yarn: {
            headerBg: 'bg-yarn-200',
            headerText: 'text-yarn-800',
            closeBtn: 'modal-close-light',
            contentBg: 'bg-white',
            borderColor: 'border-yarn-300',
            modalBorder: 'border-yarn-200'
        },
        red: {
            headerBg: 'bg-red-100',
            headerText: 'text-red-800',
            closeBtn: 'modal-close-danger',
            contentBg: 'bg-white',
            borderColor: 'border-red-300',
            modalBorder: 'border-red-200'
        }
    };

    // Background theme mapping for full-screen modes
    const backgroundThemes = {
        yarn: 'bg-yarn-50',
        sage: 'bg-sage-50',
        lavender: 'bg-lavender-50',
        wool: 'bg-wool-50'
    };

    const colors = colorSchemes[colorScheme] || colorSchemes.sage;
    const backgroundClass = backgroundTheme ? backgroundThemes[backgroundTheme] : null;

    // Full-screen modal layout
    if (fullScreen) {
        const fullScreenContent = (
            <div className={`fixed inset-0 z-50 min-h-screen overflow-y-auto ${backgroundClass || 'bg-white'}`}>
                <div className={`absolute inset-0 ${backgroundClass || 'bg-white'}`}></div>

                {/* Full-screen content container */}
                <div className={`relative app-container min-h-screen shadow-lg ${backgroundClass || 'bg-white'} ${className}`}
                    style={{ transform: 'none' }}
                    {...getModalProps()}
                >
                    {children}
                </div>
            </div>
        );

        return ReactDOM.createPortal(fullScreenContent, document.body);
    }

    // Standard modal layout
    const modalContent = (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
            onClick={handleBackdropClick}
        >
            <div className={`bg-white rounded-2xl shadow-xl w-full border-2 ${colors.modalBorder} max-h-[80vh] overflow-y-auto max-w-[90vw] sm:max-w-md lg:max-w-lg ${className}`}
                {...getModalProps()}
            >
                {/* Connected header - no floating content! */}
                <div className={`${colors.headerBg} ${colors.headerText} px-6 py-4 rounded-t-2xl border-b-2 ${colors.borderColor}`}>
                    <div className="flex justify-between items-start">
                        <div className="flex-1">
                            <div className="flex items-center gap-3">
                                {icon && <div className="text-2xl">{icon}</div>}
                                <div className="flex-1">
                                    <h2 className="text-lg font-semibold" id="modal-title">{title}</h2>
                                    {subtitle && <p className="text-sm opacity-75 mt-1" id="modal-description">{subtitle}</p>}
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={onClose}
                            className={`modal-close-md ${colors.closeBtn} ml-4 flex-shrink-0`}
                            aria-label="Close modal"
                        >
                            ×
                        </button>
                    </div>
                </div>

                {/* Connected content */}
                <div className={`${colors.contentBg} px-6 py-6`}>
                    {children}

                    {/* Standard action buttons for simple/input modals */}
                    {showButtons && category !== 'complex' && (
                        <div className="flex gap-3 mt-6">
                            <button onClick={onClose} className="flex-1 btn-tertiary">
                                {secondaryButtonText}
                            </button>
                            {onConfirm && (
                                <button
                                    onClick={onConfirm}
                                    data-modal-primary
                                    className={`flex-1 ${colorScheme === 'red' ? 'btn-danger' : 'btn-primary'}`}
                                    {...primaryButtonProps}
                                >
                                    {primaryButtonText}
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    // Render modal content in a portal attached to document.body
    return ReactDOM.createPortal(modalContent, document.body);
};

// New FullScreenModal convenience component
export const FullScreenModal = ({
    isOpen,
    onClose,
    backgroundTheme = 'yarn',
    title,
    children,
    className = '',
    ...props
}) => (
    <StandardModal
        isOpen={isOpen}
        onClose={onClose}
        fullScreen={true}
        backgroundTheme={backgroundTheme}
        category="complex"
        showButtons={false}
        title={title}
        className={className}
        {...props}
    >
        {children}
    </StandardModal>
);

// Convenience components for common patterns
export const ConfirmationModal = (props) => (
    <StandardModal category="simple" colorScheme="sage" {...props} />
);

export const DangerModal = (props) => (
    <StandardModal category="simple" colorScheme="red" {...props} />
);

export const InputModal = (props) => (
    <StandardModal category="input" colorScheme="sage" {...props} />
);

export const CelebrationModal = (props) => (
    <StandardModal category="simple" colorScheme="yarn" {...props} />
);

export default StandardModal;