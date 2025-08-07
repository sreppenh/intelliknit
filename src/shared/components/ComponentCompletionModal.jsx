import React, { useEffect } from 'react';

const ComponentCompletionModal = ({
    isOpen,
    componentName,
    projectName,
    endingType,
    currentStitches,
    onViewComponent, // ✅ View component steps (stays on ManageSteps)
    onViewProject,   // ✅ View project overview (goes to ProjectDetail)
    onClose
}) => {
    // Standardized Simple Action Modal Behavior
    useEffect(() => {
        const handleEscKey = (event) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscKey);

            // Focus management - focus the primary button
            setTimeout(() => {
                const primaryButton = document.querySelector('[data-modal-primary]');
                if (primaryButton) {
                    primaryButton.focus();
                }
            }, 100);
        }

        return () => {
            document.removeEventListener('keydown', handleEscKey);
        };
    }, [isOpen, onClose]);

    // Handle backdrop click
    const handleBackdropClick = (event) => {
        if (event.target === event.currentTarget) {
            onClose();
        }
    };

    // Correct messaging - step is CONFIGURED, not physically completed
    const getContent = () => {
        switch (endingType) {
            case 'put_on_holder':
                return {
                    icon: '📎',
                    title: 'Holder Step Added!',
                    message: `Added step to put ${currentStitches} stitches on holder for ${componentName}.`,
                    subtext: 'This step is ready to knit when you get to it. The stitches will be saved for later use.'
                };
            case 'bind_off_all':
                return {
                    icon: '✂️',
                    title: 'Bind Off Step Added!',
                    message: `Added final bind off step for ${componentName} (${currentStitches} stitches).`,
                    subtext: 'This finishing step is now in your pattern sequence, ready to knit when you reach it.'
                };
            case 'attach_to_piece':
                return {
                    icon: '🔗',
                    title: 'Attachment Step Added!',
                    message: `Added step to attach ${componentName} to another component.`,
                    subtext: 'This joining step is configured and ready for when you knit this component.'
                };
            case 'other':
                return {
                    icon: '✅',
                    title: 'Custom Ending Added!',
                    message: `Added custom finishing step for ${componentName}.`,
                    subtext: 'Your custom ending step is now part of the pattern sequence.'
                };
            default:
                return {
                    icon: '🎉',
                    title: 'Step Added!',
                    message: `New step added to ${componentName} successfully.`,
                    subtext: 'Your step is configured and ready to knit.'
                };
        }
    };

    if (!isOpen) return null;

    const content = getContent();

    return (
        <div className="modal-overlay" onClick={handleBackdropClick}>
            <div className="modal-content-light">

                {/* Header with celebration treatment */}
                <div className="modal-header-light relative flex items-center justify-center py-6 px-6 rounded-t-2xl bg-sage-200">
                    <div className="text-center">
                        <div className="text-4xl mb-3">{content.icon}</div>
                        <h2 className="text-xl font-semibold text-sage-800">{content.title}</h2>
                        <p className="text-sage-600 text-sm mt-1">{content.message}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="absolute right-4 top-4 text-sage-600 text-2xl hover:bg-sage-300 hover:bg-opacity-50 rounded-full w-8 h-8 flex items-center justify-center transition-colors"
                        aria-label="Close modal"
                    >
                        ×
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {/* Success info */}
                    <div className="bg-sage-50 border-2 border-sage-200 rounded-xl p-4 mb-6">
                        <h4 className="text-sm font-semibold text-sage-700 mb-2">💡 What's Next?</h4>
                        <div className="text-sm text-sage-600">{content.subtext}</div>
                    </div>

                    <div className="text-center mb-6">
                        <p className="text-wool-600 font-medium">Component ending configured successfully!</p>
                    </div>

                    {/* ✅ TWO NAVIGATION OPTIONS */}
                    <div className="stack-sm">
                        {/* Primary: View Component (Pattern Steps) */}
                        <button
                            onClick={onViewComponent}
                            data-modal-primary
                            className="w-full btn-secondary flex items-center justify-center gap-3 py-4"
                        >
                            <span className="text-lg">👁️</span>
                            <div className="text-left">
                                <div className="font-semibold">View {componentName}</div>
                                <div className="text-sm opacity-75">Review all pattern steps</div>
                            </div>
                        </button>

                        {/* Secondary: View Project (Overview Tab) */}
                        <button
                            onClick={onViewProject}
                            className="w-full btn-tertiary flex items-center justify-center gap-3 py-4"
                        >
                            <span className="text-lg">🏠</span>
                            <div className="text-left">
                                <div className="font-semibold">View {projectName}</div>
                                <div className="text-sm opacity-75">Return to project overview</div>
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ComponentCompletionModal;