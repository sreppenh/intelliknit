// src/shared/components/modals/DeleteStepModal.jsx
import React from 'react';
import { StandardModal } from './StandardModal';

const DeleteStepModal = ({ step, onClose, onDelete }) => {
    const handleDelete = () => {
        onDelete();
        onClose();
    };

    return (
        <StandardModal
            isOpen={!!step}
            onClose={onClose}
            onConfirm={handleDelete}
            category="warning"
            colorScheme="red"
            title="Delete Step?"
            subtitle="This action cannot be undone"
            icon="🗑️"
            primaryButtonText="Delete Step"
            secondaryButtonText="Cancel"
        >
            <div className="text-center space-y-4">
                <p className="text-wool-600">
                    Are you sure you want to delete this step?
                </p>

                <div className="bg-wool-100 rounded-lg p-3 border border-wool-200">
                    <p className="text-sm font-medium text-wool-700">
                        "{step?.description}"
                    </p>
                </div>

                <p className="text-wool-500 text-sm">
                    This action cannot be undone.
                </p>
            </div>
        </StandardModal>
    );
};

export default DeleteStepModal;