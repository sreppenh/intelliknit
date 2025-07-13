import React from 'react';

const ComponentChoiceModal = ({ componentName, onClose, onAddSteps, onAddAnother }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-yarn-50 rounded-2xl shadow-xl max-w-sm w-full border-2 border-wool-200">
        
        {/* Header with more celebration */}
        <div className="bg-yarn-600 text-white px-6 py-4 rounded-t-2xl">
          <div className="text-center">
            <div className="text-3xl mb-2">🎉</div>
            <h2 className="text-lg font-semibold">Component Created!</h2>
            <p className="text-yarn-100 text-sm">🧶 {componentName} is ready to knit!</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 bg-yarn-50">
          <div className="text-center mb-6">
            <p className="text-wool-600 mb-4">What would you like to do next?</p>
          </div>

          {/* Action Options */}
          <div className="space-y-3">
            {/* Primary action - Add Steps */}
            <button
              onClick={onAddSteps}
              className="w-full bg-yarn-600 text-white py-4 px-6 rounded-xl font-semibold text-base hover:bg-yarn-700 transition-colors shadow-sm flex items-center justify-center gap-2"
            >
              <span className="text-lg">📝</span>
              Add Steps to {componentName}
            </button>

            {/* Secondary action - Add Another */}
            <button
              onClick={onAddAnother}
              className="w-full bg-sage-500 text-white py-4 px-6 rounded-xl font-semibold text-base hover:bg-sage-600 transition-colors shadow-sm flex items-center justify-center gap-2"
            >
              <span className="text-lg">🧶</span>
              Add Another Component
            </button>

            {/* Tertiary action - Close */}
            <button
              onClick={onClose}
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