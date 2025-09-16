import React, { useState } from 'react';
import UnsavedChangesModal from '../../../shared/components/modals/UnsavedChangesModal';
import IntelliKnitLogger from '../../../shared/utils/ConsoleLogging';
import PageHeader from '../../../shared/components/PageHeader';

const ProjectTypeSelector = ({ onBack, onContinue, selectedType, onTypeSelect, onExitToProjectList, onGoToLanding }) => {
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
      <div className="app-container bg-yarn-50 min-h-screen shadow-lg">

        {/* Compact Header */}

        <PageHeader
          useBranding={true}
          onHome={onGoToLanding}
          compact={true}
          onBack={onBack}
          showCancelButton={true}
          onCancel={handleXButtonClick}
        // Remove title/subtitle
        />

        <div className="p-4 bg-yarn-50 space-y-4">
          {/* Compact Welcome Message */}
          <div className="text-center">
            <div className="text-2xl mb-2">🧶</div>
            <h2 className="content-header-secondary mb-1">Let's Get Started!</h2>
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
                className="card-selectable-compact"
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