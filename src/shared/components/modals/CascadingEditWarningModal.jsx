// src/shared/components/modals/CascadingEditWarningModal.jsx

import React from 'react';
import { StandardModal } from './StandardModal';

/**
 * Warning modal for edits that will cascade to following steps
 * Uses StandardModal with 'warning' category
 */
const CascadingEditWarningModal = ({
    isOpen,
    onClose,
    onDeleteAndContinue,
    stepIndex,
    followingStepsCount,
    stepDescription
}) => {
    return (
        <StandardModal
            isOpen={isOpen}
            onClose={onClose}
            category="simple"
            colorScheme="yarn"
            title="This Edit Will Affect Stitch Counts"
            subtitle={`${followingStepsCount} step${followingStepsCount > 1 ? 's' : ''} after this may need recalculation`}
            icon="⚠️"
            showButtons={false}
        >
            {/* Explanation */}
            <div className="bg-yarn-100 border-2 border-yarn-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-wool-700 mb-3">
                    You're about to edit:
                </p>
                <p className="text-sm font-medium text-wool-800 mb-3">
                    "{stepDescription}"
                </p>
                <p className="text-sm text-wool-700">
                    <strong>{followingStepsCount}</strong> step{followingStepsCount > 1 ? 's' : ''} after this one depend on the stitch count from this step and may need to be recalculated.
                </p>
            </div>

            {/* Options */}
            <div className="space-y-3">
                <p className="text-sm text-wool-600 font-medium">
                    What would you like to do?
                </p>

                {/* Delete and continue button */}
                <button
                    onClick={() => {
                        onDeleteAndContinue();
                        onClose();
                    }}
                    className="w-full btn-secondary flex items-center justify-center gap-2"
                >
                    <span>🗑️</span>
                    <span>Delete {followingStepsCount} Following Step{followingStepsCount > 1 ? 's' : ''} & Continue</span>
                </button>

                {/* Cancel button */}
                <button
                    onClick={onClose}
                    className="w-full btn-tertiary"
                >
                    Cancel This Edit
                </button>
            </div>

            {/* Helper text */}
            <div className="bg-lavender-100 border-2 border-lavender-200 rounded-lg p-3 mt-4">
                <p className="text-xs text-lavender-700">
                    💡 <strong>Tip:</strong> If you only want to change pattern text or colors, use "Edit Pattern" instead - those changes are safe and won't affect other steps.
                </p>
            </div>
        </StandardModal>
    );
};

export default CascadingEditWarningModal;