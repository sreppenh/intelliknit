import React, { useState } from 'react';
import DeleteComponentModal from '../../../shared/components/DeleteComponentModal';
import { getComponentState as getUtilityComponentState } from '../../../shared/utils/stepDisplayUtils';
import { getComponentProgressStats } from '../../../shared/utils/progressTracking';

const getCardClassName = (state) => {
  switch (state) {
    case 'ready_to_knit':
      return 'card-component-ready relative';
    case 'currently_knitting':
      return 'card-component-progress relative';
    case 'finished':
      return 'card-component-complete relative';
    case 'finishing_in_progress':
    case 'finishing_done':
      return 'card-component-finishing relative';
    case 'edit_mode':
    default:
      return 'card-component relative';
  }
};

const CompactComponentCard = ({ component, projectId, onManageSteps, onMenuAction, openMenuId, setOpenMenuId }) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Enhanced component state detection with finishing steps support
  const getComponentState = () => {
    // Handle finishing steps (keep existing logic with step.completed fallback)
    if (component.type === 'finishing') {
      if (component.isPlaceholder || !component.steps || component.steps.length === 0) {
        return 'finishing_in_progress';
      }

      const allComplete = component.steps.every(s => s.completed);
      const manuallyConfirmed = component.finishingComplete;

      if (allComplete && manuallyConfirmed) return 'finishing_done';
      return 'finishing_in_progress';
    }

    // ✅ FIXED: Pass projectId to utility function
    return getUtilityComponentState(component, projectId);
  };

  const getStateConfig = (state) => {
    const configs = {
      edit_mode: {
        label: 'Edit Mode',
        background: 'card-component',
        textColor: 'text-yarn-800',
        icon: '✏️',
        priority: 3
      },
      ready_to_knit: {
        label: 'Ready to Knit',
        background: 'card-component-ready',
        textColor: 'text-sage-800',
        icon: '⚡',
        priority: 2
      },
      currently_knitting: {
        label: 'Currently Knitting',
        background: 'card-component-progress',
        textColor: 'text-sage-900',
        icon: '🧶',
        priority: 1
      },
      finished: {
        label: 'Finished',
        background: 'card-component-complete',
        textColor: 'text-sage-900',
        icon: '✅',
        priority: 4
      },
      finishing_in_progress: {
        label: 'In Progress',
        background: 'card-component-finishing',
        textColor: 'text-lavender-800',
        icon: '🪡',
        priority: 3
      },
      finishing_done: {
        label: 'Completed',
        background: 'card-component-finishing',
        textColor: 'text-lavender-800',
        icon: '🪡',
        priority: 6
      }
    };
    return configs[state] || configs.edit_mode;
  };

  const state = getComponentState();
  const stateConfig = getStateConfig(state);
  const stepCount = component.steps?.length || 0;

  // ✅ FIXED: Get completed count from progress tracking system
  const getCompletedCount = () => {
    if (component.type === 'finishing') {
      // For finishing tasks, use step.completed as fallback
      return component.steps?.filter(s => s.completed).length || 0;
    }

    // For regular components, use progress tracking
    if (projectId && component.id && component.steps) {
      const stats = getComponentProgressStats(component.steps, component.id, projectId);
      return stats.completed;
    }

    // Fallback to step.completed
    return component.steps?.filter(s => s.completed).length || 0;
  };

  const completedCount = getCompletedCount();

  // Check if this is a finishing component for special icon handling
  const isFinishing = component.type === 'finishing';

  const handleCardClick = () => {
    onManageSteps(component.id);
  };

  const handleMenuToggle = (e) => {
    e.stopPropagation();
    if (openMenuId === component.id) {
      setOpenMenuId(null);
    } else {
      setOpenMenuId(component.id);
    }
  };

  const handleMenuAction = (action, e) => {
    e.stopPropagation();
    onMenuAction(action, component.id);
    setOpenMenuId(null);
  };

  return (
    <div
      onClick={handleCardClick}
      className={`
        ${getCardClassName(state)} ${openMenuId === component.id ? 'z-20' : 'z-10'}
      `}
    >
      {/* True single column layout */}
      <div className="space-y-1.5">
        {/* Row 1: Component name with menu */}
        <div className="flex items-start justify-between">
          <h3 className={`font-medium text-sm leading-tight ${stateConfig.textColor}`}>
            {component.name}
          </h3>

          {/* Three-dot menu */}
          <div className="relative ml-2 flex-shrink-0">
            <button
              onClick={handleMenuToggle}
              className={`p-1.5 text-wool-400 hover:text-wool-600 hover:bg-wool-200 rounded-full transition-colors ${openMenuId === component.id ? 'relative z-[101]' : ''}`}
              aria-label={`Menu for ${component.name}`}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <circle cx="8" cy="3" r="1.5" />
                <circle cx="8" cy="8" r="1.5" />
                <circle cx="8" cy="13" r="1.5" />
              </svg>
            </button>

            {openMenuId === component.id && (
              <>
                {/* Backdrop for click-outside */}
                <div
                  className="fixed inset-0 z-[90]"
                  onMouseDown={() => setOpenMenuId(null)}
                  aria-hidden="true"
                />

                {/* Menu with smooth animation */}
                <div className="absolute right-0 top-10 bg-white border-2 border-wool-200 rounded-xl shadow-xl z-[100] min-w-32 whitespace-nowrap overflow-hidden transform transition-all duration-200 ease-out animate-in">
                  <button
                    onClick={(e) => handleMenuAction('rename', e)}
                    className="w-full px-4 py-3 text-left text-wool-600 hover:bg-sage-50 text-sm flex items-center gap-2 transition-colors font-medium"
                  >
                    ✏️ Rename
                  </button>
                  <button
                    onClick={(e) => handleMenuAction('copy', e)}
                    className="w-full px-4 py-3 text-left text-wool-600 hover:bg-sage-50 text-sm flex items-center gap-2 transition-colors font-medium border-t border-wool-100"
                  >
                    📋 Copy
                  </button>
                  <button
                    onClick={(e) => handleMenuAction('delete', e)}
                    className="w-full px-4 py-3 text-left text-red-600 hover:bg-red-50 text-sm flex items-center gap-2 transition-colors font-medium border-t border-wool-100"
                  >
                    🗑️ Delete
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Row 2: Icon + Status */}
        <div className="flex items-center gap-1.5">
          <span className="text-lg">
            {isFinishing ? '🪡' : stateConfig.icon}
          </span>
          <span className={`text-xs ${stateConfig.textColor}`}>
            {stateConfig.label}
          </span>
        </div>

        {/* Row 3: Step count or placeholder text */}
        {component.type === 'finishing' && component.isPlaceholder ? (
          <div className="text-xs text-lavender-600">
            Add finishing tasks
          </div>
        ) : stepCount > 0 ? (
          <div className="text-xs text-wool-500">
            {component.type === 'finishing' ? (
              `${completedCount} of ${stepCount} tasks complete`
            ) : (
              `${stepCount} steps`
            )}
          </div>
        ) : null}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <DeleteComponentModal
          component={component}
          onClose={() => setShowDeleteModal(false)}
          onDelete={() => {
            handleMenuAction('delete', { stopPropagation: () => { } });
            setShowDeleteModal(false);
          }}
        />
      )}
    </div>
  );
};

export default CompactComponentCard;