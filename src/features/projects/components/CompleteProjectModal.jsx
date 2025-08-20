// src/features/projects/components/CompleteProjectModal.jsx
import React from 'react';
import { CelebrationModal } from '../../../shared/components/modals/StandardModal';

const CompleteProjectModal = ({ projectName, onClose, onComplete }) => {
  return (
    <CelebrationModal
      isOpen={!!projectName}
      onClose={onClose}
      onConfirm={onComplete}
      title="Complete Project?"
      subtitle={projectName}
      icon="🏆"
      primaryButtonText="Yes, Complete Project!"
      secondaryButtonText="Not Yet"
    >
      <div className="text-center mb-6">
        <p className="text-wool-600 mb-2">
          Congratulations on finishing your project!
        </p>
        <p className="text-wool-500 text-sm">
          This will mark <strong>{projectName}</strong> as completed and celebrate your achievement.
        </p>
      </div>
    </CelebrationModal>
  );
};

export default CompleteProjectModal;