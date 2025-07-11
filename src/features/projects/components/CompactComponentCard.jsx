import React, { useState } from 'react';

const CompactComponentCard = ({ component, onManageSteps, onMenuAction }) => {
  const [openMenuId, setOpenMenuId] = useState(null);

  // Determine component state
  const getComponentState = () => {
    if (!component.steps || component.steps.length === 0) return 'planned';
    
    const hasCastOn = component.steps.some(step => 
      step.wizardConfig?.stitchPattern?.pattern === 'Cast On' ||
      step.description?.toLowerCase().includes('cast on')
    );
    
    const hasBindOff = component.steps.some(step => 
      step.wizardConfig?.stitchPattern?.pattern === 'Bind Off' ||
      step.description?.toLowerCase().includes('bind off')
    );
    
    if (hasBindOff) return 'complete';
    if (hasCastOn && component.steps.some(s => s.completed)) return 'in_progress';
    if (hasCastOn) return 'ready';
    return 'planned';
  };

  const getStateConfig = (state) => {
    const configs = {
      planned: {
        label: 'Planned',
        color: 'border-wool-200 bg-wool-50 hover:bg-wool-100',
        textColor: 'text-wool-600',
        icon: '📝'
      },
      ready: {
        label: 'Ready',
        color: 'border-yarn-200 bg-yarn-50 hover:bg-yarn-100',
        textColor: 'text-yarn-700',
        icon: '⚡'
      },
      in_progress: {
        label: 'In Progress',
        color: 'border-sage-200 bg-sage-50 hover:bg-sage-100',
        textColor: 'text-sage-700',
        icon: '🧶'
      },
      complete: {
        label: 'Complete',
        color: 'border-sage-300 bg-sage-100 hover:bg-sage-200',
        textColor: 'text-sage-800',
        icon: '✅'
      }
    };
    return configs[state] || configs.planned;
  };

  const state = getComponentState();
  const stateConfig = getStateConfig(state);
  const stepCount = component.steps?.length || 0;

  const handleCardClick = () => {
    onManageSteps(component.id);
  };

  const handleMenuToggle = (e) => {
    e.stopPropagation(); // Prevent card click
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
      className={`border-2 rounded-xl p-3 cursor-pointer transition-all duration-200 hover:shadow-md hover:transform hover:scale-105 relative ${stateConfig.color}`}
    >
      {/* Header with name and menu */}
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-medium text-sm text-wool-700 flex-1 pr-1 leading-tight">
          {component.name}
        </h3>
        
        {/* Three-dot Menu */}
        <div className="relative flex-shrink-0">
          <button
            onClick={handleMenuToggle}
            className="p-0.5 text-wool-400 hover:text-wool-600 hover:bg-wool-200 rounded-full transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
              <circle cx="8" cy="3" r="1.5"/>
              <circle cx="8" cy="8" r="1.5"/>
              <circle cx="8" cy="13" r="1.5"/>
            </svg>
          </button>

          {openMenuId === component.id && (
            <div className="absolute right-0 top-6 bg-white border border-wool-200 rounded-lg shadow-lg z-10 min-w-24">
              <button
                onClick={(e) => handleMenuAction('rename', e)}
                className="w-full px-2 py-1.5 text-left text-wool-600 hover:bg-sage-50 rounded-t-lg text-xs flex items-center gap-1 transition-colors"
              >
                ✏️ Rename
              </button>
              <button
                onClick={(e) => handleMenuAction('copy', e)}
                className="w-full px-2 py-1.5 text-left text-wool-600 hover:bg-sage-50 text-xs flex items-center gap-1 transition-colors"
              >
                📋 Copy
              </button>
              <button
                onClick={(e) => handleMenuAction('delete', e)}
                className="w-full px-2 py-1.5 text-left text-wool-600 hover:bg-red-50 rounded-b-lg text-xs flex items-center gap-1 transition-colors"
              >
                🗑️ Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Status and Step Count */}
      <div className="space-y-1">
        <div className={`flex items-center gap-1 text-xs font-medium ${stateConfig.textColor}`}>
          <span className="text-xs">{stateConfig.icon}</span>
          <span>{stateConfig.label}</span>
        </div>
        
        <div className="text-xs text-wool-500">
          {stepCount} step{stepCount !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Visual hint for clickability */}
      <div className="absolute bottom-2 right-2 text-wool-300 text-xs opacity-50">
        →
      </div>
    </div>
  );
};

export default CompactComponentCard;