import React, { useEffect } from 'react';

const ComponentChoiceModal = ({ componentName, onClose, onAddSteps, onAddAnother }) => {
  // Standardized Simple Action Modal Behavior
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscKey);

    // Focus management - focus the primary (add steps) button
    setTimeout(() => {
      const primaryButton = document.querySelector('[data-modal-primary]');
      if (primaryButton) {
        primaryButton.focus();
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

        {/* Header with lighter celebration treatment */}
        <div className="modal-header-light relative flex items-center justify-center py-4 px-6 rounded-t-2xl bg-sage-200">
          <div className="text-center">
            <div className="text-3xl mb-2">🎉</div>
            <h2 className="text-lg font-semibold">Component Created!</h2>
            <p className="text-sage-600 text-sm">🧶 {componentName} is ready to knit!</p>
          </div>
          <button
            onClick={onClose}  // Swap in your actual close handler
            className="absolute right-3 text-sage-600 text-2xl hover:bg-sage-300 hover:bg-opacity-50 rounded-full w-8 h-8 flex items-center justify-center transition-colors"
            aria-label="Close modal"
          >
            ×
          </button>

        </div>

        {/* Content with light sage background */}
        <div className="p-6">
          <div className="text-center mb-6">
            <p className="text-wool-600 mb-4">What would you like to do next?</p>
          </div>

          {/* Action Options */}
          <div className="stack-sm">
            {/* Primary action - Add Steps */}
            <button
              onClick={onAddSteps}
              data-modal-primary
              className="w-full btn-secondary flex items-center justify-center gap-2"
            >
              <span className="text-lg">📝</span>
              Add Steps to {componentName}
            </button>

            {/* Secondary action - Add Another */}
            <button
              onClick={onAddAnother}
              className="w-full btn-primary flex items-center justify-center gap-2"
            >
              <span className="text-lg">🧶</span>
              Add Another Component
            </button>

            {/* Tertiary action - Close */}
            <button
              onClick={onClose}
              data-modal-cancel
              className="w-full btn-tertiary"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComponentChoiceModal;