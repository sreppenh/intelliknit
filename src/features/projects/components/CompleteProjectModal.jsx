import React from 'react';

const CompleteProjectModal = ({ projectName, onClose, onComplete }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-yarn-50 rounded-2xl shadow-xl max-w-sm w-full border-2 border-wool-200">
        
        {/* Header */}
        <div className="bg-sage-500 text-white px-6 py-4 rounded-t-2xl">
          <div className="text-center">
            <div className="text-2xl mb-2">🏆</div>
            <h2 className="text-lg font-semibold">Complete Project?</h2>
            <p className="text-sage-100 text-sm">{projectName}</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 bg-yarn-50">
          <div className="text-center mb-6">
            <p className="text-wool-600 mb-2">
              Congratulations on finishing your project!
            </p>
            <p className="text-wool-500 text-sm">
              This will mark <strong>{projectName}</strong> as completed and celebrate your achievement.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            {/* Primary action - Complete */}
            <button
              onClick={onComplete}
              className="w-full bg-yarn-600 text-white py-4 px-6 rounded-xl font-semibold text-base hover:bg-yarn-700 transition-colors shadow-sm flex items-center justify-center gap-2"
            >
              <span className="text-lg">🎉</span>
              Yes, Complete Project!
            </button>

            {/* Secondary action - Cancel */}
            <button
              onClick={onClose}
              className="w-full bg-wool-100 text-wool-700 py-3 px-6 rounded-xl font-semibold text-base hover:bg-wool-200 transition-colors border border-wool-200"
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