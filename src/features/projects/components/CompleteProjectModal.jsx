import React from 'react';

const CompleteProjectModal = ({ projectName, onClose, onComplete }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">🏆</div>
          <h3 className="text-lg font-semibold text-gray-800 mb-1">Complete Project?</h3>
          <p className="text-gray-600 text-sm">
            Mark "{projectName}" as finished. You can always add more components later if needed.
          </p>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-500 text-white py-3 rounded-lg font-medium hover:bg-gray-600 transition-colors"
          >
            Not Yet
          </button>
          <button
            onClick={onComplete}
            className="flex-1 bg-purple-600 text-white py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors"
          >
            Complete!
          </button>
        </div>
      </div>
    </div>
  );
};

export default CompleteProjectModal;