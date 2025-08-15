// src/shared/components/DeleteComponentModal.jsx
import React from 'react';
import { DangerModal } from './StandardModal';

const DeleteComponentModal = ({ component, onClose, onDelete }) => {
    return (
        <DangerModal
            isOpen={!!component}
            onClose={onClose}
            onConfirm={onDelete}
            title="Delete Component?"
            subtitle={component?.name}
            icon="⚠️"
            primaryButtonText="Delete Component"
            secondaryButtonText="Cancel"
        >
            <div className="text-center mb-6">
                <p className="text-wool-600 mb-2">
                    This will permanently delete <strong>{component?.name}</strong> and all its steps.
                </p>
                <p className="text-wool-500 text-sm">
                    This action cannot be undone.
                </p>
            </div>
        </DangerModal>
    );
};

export default DeleteComponentModal;