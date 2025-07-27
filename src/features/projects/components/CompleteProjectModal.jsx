import React, { useEffect } from 'react';

const CompleteProjectModal = ({ projectName, onClose, onComplete }) => {
  // Standardized Simple Action Modal Behavior
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscKey);

    // Focus management - focus the primary (complete) button
    setTimeout(() => {
      const completeButton = document.querySelector('[data-modal-primary]');
      if (completeButton) {
        completeButton.focus();
      }
    }, 100);

    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [onClose]);

  // Handle backdrop click
  const handleBackdropClick = (event) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleBackdropClick}>
      <div className="modal-content-light">

        {/* Header with lighter treatment */}
        <div className="modal-header-light">
          <div className="text-center">
            <div className="text-2xl mb-2">🏆</div>
            <h2 className="text-lg font-semibold">Complete Project?</h2>
            <p className="text-sage-600 text-sm">{projectName}</p>
          </div>
        </div>

        {/* Content with light sage background */}
        <div className="p-6">
          <div className="text-center mb-6">
            <p className="text-wool-600 mb-2">
              Congratulations on finishing your project!
            </p>
            <p className="text-wool-500 text-sm">
              This will mark <strong>{projectName}</strong> as completed and celebrate your achievement.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="stack-sm">
            {/* Primary action - Complete */}
            <button
              onClick={onComplete}
              data-modal-primary
              className="w-full btn-secondary flex items-center justify-center gap-2"
            >
              <span className="text-lg">🎉</span>
              Yes, Complete Project!
            </button>

            {/* Secondary action - Cancel */}
            <button
              onClick={onClose}
              data-modal-cancel
              className="w-full btn-tertiary"
            >
              Not Yet
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompleteProjectModal;