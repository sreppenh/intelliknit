// src/shared/components/modals/ComponentCompletionModal.jsx
import React from 'react';
import { StandardModal } from './StandardModal';

const ComponentCompletionModal = ({
    isOpen,
    componentName,
    projectName,
    endingType,
    currentStitches,
    onViewComponent,
    onViewProject,
    onClose
}) => {
    // Get content based on ending type
    const getContent = () => {
        switch (endingType) {
            case 'put_on_holder':
                return {
                    icon: '🔒',
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

    const content = getContent();

    return (
        <StandardModal
            isOpen={isOpen}
            onClose={onClose}
            category="complex"
            colorScheme="sage"
            title={content.title}
            subtitle={content.message}
            icon={content.icon}
            showButtons={false}
        >
            {/* Success info */}
            <div className="bg-sage-50 border-2 border-sage-200 rounded-xl p-4 mb-6">
                <h4 className="text-sm font-semibold text-sage-700 mb-2">💡 What's Next?</h4>
                <div className="text-sm text-sage-600">{content.subtext}</div>
            </div>

            <div className="text-center mb-6">
                <p className="text-wool-600 font-medium">Component ending configured successfully!</p>
            </div>

            {/* Custom navigation buttons */}
            <div className="space-y-3">
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
        </StandardModal>
    );
};

export default ComponentCompletionModal;