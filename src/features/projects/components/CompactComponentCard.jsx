import React, { useState } from 'react';

const CompactComponentCard = ({ component, onManageSteps, onMenuAction }) => {
  const [openMenuId, setOpenMenuId] = useState(null);

  // Enhanced component state detection
  const getComponentState = () => {
    if (!component.steps || component.steps.length === 0) return 'edit_mode';

    const hasCastOn = component.steps.some(step =>
      step.wizardConfig?.stitchPattern?.pattern === 'Cast On' ||
      step.description?.toLowerCase().includes('cast on')
    );

    const hasBindOff = component.steps.some(step =>
      step.wizardConfig?.stitchPattern?.pattern === 'Bind Off' ||
      step.description?.toLowerCase().includes('bind off')
    );

    const hasProgress = component.steps.some(s => s.completed);
    const allStepsComplete = component.steps.length > 0 && component.steps.every(s => s.completed);

    // Check if this is a finishing component
    const isFinishing = component.type === 'finishing' ||
      component.name?.toLowerCase().includes('finishing') ||
      component.name?.toLowerCase().includes('seaming') ||
      component.name?.toLowerCase().includes('blocking');

    if (isFinishing) {
      if (allStepsComplete) return 'finished';
      if (hasProgress) return 'currently_knitting';
      if (hasBindOff) return 'ready_to_knit';
      return 'edit_mode';
    }

    // Regular component logic
    if (hasBindOff && allStepsComplete) return 'finished';
    if (hasCastOn && hasProgress) return 'currently_knitting';
    if (hasCastOn && hasBindOff && !hasProgress) return 'ready_to_knit';
    return 'edit_mode';
  };

  const getStateConfig = (state) => {
    const configs = {
      currently_knitting: {
        label: 'Currently Knitting',
        background: 'bg-sage-100 border-sage-200 hover:bg-sage-150',
        textColor: 'text-sage-800',
        icon: '🧶',
        priority: 1
      },
      ready_to_knit: {
        label: 'Ready to Knit',
        background: 'bg-yarn-100 border-yarn-200 hover:bg-yarn-150',
        textColor: 'text-yarn-800',
        icon: '⚡',
        priority: 2
      },
      edit_mode: {
        label: 'Edit Mode',
        background: 'bg-lavender-50 border-lavender-200 hover:bg-lavender-100',
        textColor: 'text-lavender-700',
        icon: '✏️',
        priority: 3
      },
      finished: {
        label: 'Finished',
        background: 'bg-sage-150 border-sage-250 hover:bg-sage-200',
        textColor: 'text-sage-800',
        icon: '✅',
        priority: 4
      }
    };
    return configs[state] || configs.edit_mode;
  };

  const state = getComponentState();
  const stateConfig = getStateConfig(state);
  const stepCount = component.steps?.length || 0;

  // Check if this is a finishing component for special icon
  const isFinishing = component.type === 'finishing' ||
    component.name?.toLowerCase().includes('finishing') ||
    component.name?.toLowerCase().includes('seaming') ||
    component.name?.toLowerCase().includes('blocking');

  const handleCardClick = () => {
    onManageSteps(component.id);
  };

  const handleMenuToggle = (e) => {
    e.stopPropagation();
    setOpenMenuId(openMenuId === component.id ? null : component.id);
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
        relative cursor-pointer transition-all duration-200 rounded-xl p-3 border-2
        hover:shadow-md hover:transform hover:scale-[1.01] active:scale-[0.99]
        ${stateConfig.background}
      `}
    >
      {/* True single column layout */}
      <div className="space-y-1.5">
        {/* Row 1: Component name with menu */}
        <div className="flex items-start justify-between">
          <h3 className={`font-semibold text-base leading-tight ${stateConfig.textColor}`}>
            {component.name}
          </h3>

          {/* Three-dot menu */}
          <div className="relative ml-2 flex-shrink-0">
            <button
              onClick={handleMenuToggle}
              className="p-1 text-wool-400 hover:text-wool-600 hover:bg-wool-200 rounded-full transition-colors"
            >
              <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor">
                <circle cx="8" cy="3" r="1.5" />
                <circle cx="8" cy="8" r="1.5" />
                <circle cx="8" cy="13" r="1.5" />
              </svg>
            </button>

            {openMenuId === component.id && (
              <div className="absolute right-0 top-6 bg-white border border-wool-200 rounded-lg shadow-lg z-20 min-w-28 overflow-hidden">
                <button
                  onClick={(e) => handleMenuAction('rename', e)}
                  className="w-full px-3 py-2 text-left text-wool-600 hover:bg-sage-50 text-sm flex items-center gap-2 transition-colors"
                >
                  ✏️ Rename
                </button>
                <button
                  onClick={(e) => handleMenuAction('copy', e)}
                  className="w-full px-3 py-2 text-left text-wool-600 hover:bg-sage-50 text-sm flex items-center gap-2 transition-colors border-t border-wool-100"
                >
                  📋 Copy
                </button>
                <button
                  onClick={(e) => handleMenuAction('delete', e)}
                  className="w-full px-3 py-2 text-left text-red-600 hover:bg-red-50 text-sm flex items-center gap-2 transition-colors border-t border-wool-100"
                >
                  🗑️ Delete
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Row 2: Icon + Status */}
        <div className="flex items-center gap-1.5">
          <span className="text-lg">
            {isFinishing ? '🪡' : stateConfig.icon}
          </span>
          <span className={`text-sm font-medium ${stateConfig.textColor}`}>
            {stateConfig.label}
          </span>
        </div>

        {/* Row 3: Step count - tiny and subtle */}
        {stepCount > 0 && (
          <div className="text-xs text-wool-500">
            {stepCount} steps
          </div>
        )}
      </div>
    </div>
  );
};

export default CompactComponentCard;