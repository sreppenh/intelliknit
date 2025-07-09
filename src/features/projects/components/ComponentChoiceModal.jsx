import React from 'react';

const ComponentChoiceModal = ({ componentName, onClose, onAddSteps, onAddAnother }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="text-3xl mb-2">✅</div>
          <h3 className="text-lg font-semibold text-gray-800 mb-1">Component Added!</h3>
          <p className="text-gray-600 text-sm">
            "{componentName}" has been added
          </p>
        </div>
        
        <div className="space-y-3">
          <button
            onClick={onAddSteps}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            📝 Add Steps to This Component
          </button>
          
          <button
            onClick={onAddAnother}
            className="w-full bg-gray-600 text-white py-3 rounded-lg font-medium hover:bg-gray-700 transition-colors"
          >
            ➕ Add Another Component
          </button>
        </div>
        
        <button
          onClick={onClose}
          className="w-full mt-4 text-gray-500 hover:text-gray-700 transition-colors text-sm"
        >
          I'll decide later
        </button>
      </div>
    </div>
  );
};

export default ComponentChoiceModal;