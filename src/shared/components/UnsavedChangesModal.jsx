// src/shared/components/UnsavedChangesModal.jsx
import React from 'react';
import { StandardModal } from './StandardModal';

const UnsavedChangesModal = ({
    isOpen,
    onConfirmExit,
    onCancel,
    title = "You have unsaved changes",
    message = "Are you sure you want to exit without saving?"
}) => {
    return (
        <StandardModal
            isOpen={isOpen}
            onClose={onCancel}
            onConfirm={onConfirmExit}
            category="warning"
            colorScheme="yarn"
            title={title}
            subtitle="Time to frog your work?"
            icon="🐸"
            primaryButtonText="Exit Without Saving"
            secondaryButtonText="Stay"
            showButtons={true}
        >
            <div className="text-left">
                <p className="text-wool-600">
                    {message}
                </p>
            </div>
        </StandardModal>
    );
};

export default UnsavedChangesModal;