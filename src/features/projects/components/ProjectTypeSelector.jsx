import React, { useState } from 'react';
import UnsavedChangesModal from '../../../shared/components/UnsavedChangesModal';
import IntelliKnitLogger from '../../../shared/utils/ConsoleLogging';

const ProjectTypeSelector = ({ onBack, onContinue, selectedType, onTypeSelect, onExitToProjectList }) => {
  const [showExitModal, setShowExitModal] = useState(false);

  const projectTypes = [
    // Clothing
    { id: 'sweater', name: 'Sweater', icon: '🧥' },
    { id: 'shawl', name: 'Shawl', icon: '🌙' },

    // Accessories
    { id: 'hat', name: 'Hat', icon: '🎩' },
    { id: 'scarf_cowl', name: 'Scarf & Cowl', icon: '🧣' },
    { id: 'socks', name: 'Socks', icon: '🧦' },

    // Non-wearables
    { id: 'blanket', name: 'Blanket', icon: '🛏️' },
    { id: 'toys', name: 'Toys', icon: '🧸' },

    // Other
    { id: 'other', name: 'Other', icon: '✨' }
  ];


  // Check if user has made a selection (unsaved data)
  const hasUnsavedData = () => {
    return selectedType !== null;
  };

  const handleXButtonClick = () => {
    if (hasUnsavedData()) {
      setShowExitModal(true);
    } else {
      // Exit directly to Project List
      onExitToProjectList();
    }
  };

  const handleConfirmExit = () => {
    setShowExitModal(false);
    onExitToProjectList();
  };

  const handleCancelExit = () => {
    setShowExitModal(false);
    // Stay on current screen
  };


  return (
    <div className="min-h-screen bg-yarn-50">
      <div className="max-w-md mx-auto bg-yarn-50 min-h-screen shadow-lg">

        {/* Compact Header */}

        <div className="bg-sage-500 text-white px-6 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="text-white text-xl hover:bg-white hover:bg-opacity-20 rounded-full w-10 h-10 flex items-center justify-center transition-colors"
            >
              ←
            </button>
            <div className="flex-1">
              <h1 className="text-lg font-semibold">What are you making?</h1>
              <p className="text-sage-100 text-sm">Choose your project type</p>
            </div>
            <button
              onClick={handleXButtonClick}
              className="text-white text-xl hover:bg-white hover:bg-opacity-20 rounded-full w-10 h-10 flex items-center justify-center transition-colors"
              title="Exit Project Creation"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-4 bg-yarn-50 space-y-4">
          {/* Compact Welcome Message */}
          <div className="text-center">
            <div className="text-2xl mb-2">🧶</div>
            <h2 className="text-lg font-semibold text-wool-700 mb-1">Let's Get Started!</h2>
            <p className="text-wool-500 text-sm">What are you excited to create?</p>
          </div>

          {/* Compact Project Type Grid */}
          <div className="grid grid-cols-2 gap-3">
            {projectTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => {
                  onTypeSelect(type.id);
                  setTimeout(() => onContinue(), 50);
                }}
                className="p-3 border-2 rounded-xl transition-all duration-200 text-center border-wool-200 bg-white text-wool-700 hover:border-sage-300 hover:bg-sage-50 hover:shadow-md hover:transform hover:scale-102"
              >
                <div className="text-2xl mb-1">{type.icon}</div>
                <div className="font-semibold text-sm">{type.name}</div>
              </button>
            ))}
          </div>

          {/* Compact Footer */}
          <div className="text-center pt-2">
            <p className="text-xs text-wool-400">You can change this later! 🎉</p>
          </div>


        </div>


      </div>

      {/* Unsaved Changes Modal */}
      <UnsavedChangesModal
        isOpen={showExitModal}
        onConfirmExit={handleConfirmExit}
        onCancel={handleCancelExit}
      />


    </div>
  );
};

export default ProjectTypeSelector;