// src/shared/components/DeleteComponentModal.jsx
import React from 'react';
import { DangerModal } from './StandardModal';
import { getComponentStatusWithDisplay } from '../../utils/stepDisplayUtils';

const DeleteComponentModal = ({ component, onClose, onDelete }) => {
    if (!component) return null;

    // Check if component has completed steps
    const hasCompletedSteps = component.steps?.some(s => s.completed) || false;
    const completedCount = component.steps?.filter(s => s.completed).length || 0;
    const totalSteps = component.steps?.length || 0;

    // Get component status for additional context
    const componentStatus = getComponentStatusWithDisplay(component);

    // Determine warning level
    const showWarning = hasCompletedSteps;
    const isFinished = componentStatus.status === 'finished' || componentStatus.status === 'finishing_done';

    return (
        <DangerModal
            isOpen={!!component}
            onClose={onClose}
            onConfirm={onDelete}
            title={showWarning ? "⚠️ Delete Component with Progress?" : "Delete Component?"}
            subtitle={component?.name}
            icon={showWarning ? "⚠️" : "🗑️"}
            primaryButtonText={showWarning ? "Delete Anyway" : "Delete Component"}
            secondaryButtonText="Cancel"
        >
            <div className="text-center mb-6">
                {/* Basic deletion message */}
                <p className="text-wool-600 mb-2">
                    This will permanently delete <strong>{component?.name}</strong> and all its steps.
                </p>

                {/* Warning section for components with progress */}
                {showWarning && (
                    <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4 mb-4">
                        <div className="text-red-800 font-medium mb-2">
                            ⚠️ This component has progress that will be lost:
                        </div>
                        <div className="text-sm text-red-700 space-y-1">
                            <div>• <strong>{completedCount} of {totalSteps}</strong> steps completed</div>
                            <div>• Status: <strong>{componentStatus.display}</strong></div>
                            {isFinished && (
                                <div className="font-medium text-red-800 mt-2">
                                    🏁 This is a finished component!
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Reassuring note for empty components */}
                {!showWarning && (
                    <div className="bg-sage-50 border border-sage-200 rounded-lg p-3 mb-3">
                        <p className="text-sm text-sage-700">
                            ✅ This component has no completed steps, so it's safe to delete.
                        </p>
                    </div>
                )}

                <p className="text-wool-500 text-sm">
                    This action cannot be undone.
                </p>
            </div>
        </DangerModal>
    );
};

export default DeleteComponentModal;