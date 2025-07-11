import React from 'react';
import { COMPONENT_STEPS, getMethodsForStartType } from './ComponentSteps';

// Step 1: Component Name
export const renderNameStep = (componentData, setComponentData) => (
  <div className="space-y-6">
    <div>
      <h2 className="text-xl font-semibold text-wool-700 mb-3">Component Name</h2>
      <p className="text-wool-500 mb-4">What component are you adding?</p>
    </div>

    <div>
      <label className="block text-sm font-semibold text-wool-700 mb-3">
        Component Name
      </label>
      <input
        type="text"
        value={componentData.name}
        onChange={(e) => setComponentData(prev => ({ ...prev, name: e.target.value }))}
        placeholder="e.g., Left Sleeve, Back Panel, Collar"
        className="w-full border-2 border-wool-200 rounded-xl px-4 py-4 text-base focus:border-sage-500 focus:ring-0 transition-colors placeholder-wool-400"
      />
    </div>

    <div className="bg-sage-100 border-2 border-sage-200 rounded-xl p-4">
      <h3 className="text-sm font-semibold text-sage-700 mb-2">💡 Examples:</h3>
      <div className="text-sm text-sage-600 space-y-1">
        <div>• Left Sleeve, Right Sleeve</div>
        <div>• Front Panel, Back Panel</div>
        <div>• Collar, Cuff, Pocket</div>
      </div>
    </div>
  </div>
);

// Step 2: Start Type Selection
export const renderStartTypeStep = (componentData, handleStartTypeSelect) => (
  <div className="space-y-6">
    <div>
      <h2 className="text-xl font-semibold text-wool-700 mb-3">How does it start?</h2>
      <p className="text-wool-500 mb-4">Choose how you begin this component</p>
    </div>

    <div className="grid grid-cols-2 gap-3">
      <button
        onClick={() => handleStartTypeSelect('cast_on')}
        className="p-4 border-2 rounded-xl transition-all duration-200 text-center border-wool-200 bg-white text-wool-700 hover:border-sage-300 hover:bg-sage-50 hover:shadow-sm"
      >
        <div className="text-2xl mb-2">🏗️</div>
        <div className="font-semibold text-sm">Cast On</div>
        <div className="text-xs opacity-75">Start from scratch</div>
      </button>

      <button
        onClick={() => handleStartTypeSelect('pick_up')}
        className="p-4 border-2 rounded-xl transition-all duration-200 text-center border-wool-200 bg-white text-wool-700 hover:border-sage-300 hover:bg-sage-50 hover:shadow-sm"
      >
        <div className="text-2xl mb-2">📌</div>
        <div className="font-semibold text-sm">Pick Up</div>
        <div className="text-xs opacity-75">From existing piece</div>
      </button>

      <button
        onClick={() => handleStartTypeSelect('continue')}
        className="p-4 border-2 rounded-xl transition-all duration-200 text-center border-wool-200 bg-white text-wool-700 hover:border-sage-300 hover:bg-sage-50 hover:shadow-sm"
      >
        <div className="text-2xl mb-2">↗️</div>
        <div className="font-semibold text-sm">Continue</div>
        <div className="text-xs opacity-75">From saved stitches</div>
      </button>

      <button
        onClick={() => handleStartTypeSelect('other')}
        className="p-4 border-2 rounded-xl transition-all duration-200 text-center border-wool-200 bg-white text-wool-700 hover:border-sage-300 hover:bg-sage-50 hover:shadow-sm"
      >
        <div className="text-2xl mb-2">📝</div>
        <div className="font-semibold text-sm">Other</div>
        <div className="text-xs opacity-75">Complex setup</div>
      </button>
    </div>
  </div>
);

// Step 3: Method Selection
export const renderMethodStep = (componentData, handleMethodSelect) => (
  <div className="space-y-6">
    <div>
      <h2 className="text-xl font-semibold text-wool-700 mb-3">
        {componentData.startType === 'cast_on' && 'Cast On Method'}
        {componentData.startType === 'pick_up' && 'Pick Up Method'}
        {componentData.startType === 'continue' && 'Continue Method'}
        {componentData.startType === 'other' && 'Setup Method'}
      </h2>
      <p className="text-wool-500 mb-4">Choose your preferred method</p>
    </div>

    <div className="grid grid-cols-2 gap-3">
      {getMethodsForStartType(componentData.startType).map((method) => (
        <button
          key={method.id}
          onClick={() => handleMethodSelect(method.id)}
          className="p-4 border-2 rounded-xl transition-all duration-200 text-center border-wool-200 bg-white text-wool-700 hover:border-sage-300 hover:bg-sage-50 hover:shadow-sm"
        >
          <div className="text-2xl mb-2">{method.icon}</div>
          <div className="font-semibold text-sm mb-1">{method.name}</div>
          <div className="text-xs opacity-75">{method.description}</div>
        </button>
      ))}
    </div>
  </div>
);

// Step 4: Details Entry - Smart fields based on start type and method
export const renderDetailsStep = (componentData, setComponentData) => {
  const getFieldsForType = () => {
    const { startType, startMethod } = componentData;
    
    switch (startType) {
      case 'cast_on':
        return {
          title: 'Cast On Details',
          subtitle: 'Specify your cast on requirements',
          fields: [
            {
              key: 'startStitches',
              label: 'Number of Stitches',
              type: 'number',
              placeholder: 'e.g., 80',
              required: true,
              min: 1
            },
            ...(startMethod === 'other' ? [{
              key: 'startDescription',
              label: 'Cast On Method Description',
              type: 'text',
              placeholder: 'e.g., Italian cast on, Judy\'s magic cast on',
              required: false
            }] : [])
          ]
        };
        
      case 'pick_up':
        return {
          title: 'Pick Up Details',
          subtitle: 'Specify where and how many stitches to pick up',
          fields: [
            {
              key: 'startStitches',
              label: 'Number of Stitches to Pick Up',
              type: 'number',
              placeholder: 'e.g., 76',
              required: true,
              min: 1
            },
            {
              key: 'startDescription',
              label: 'Pick Up From',
              type: 'text',
              placeholder: 'e.g., From body armhole, along neckline edge',
              required: true
            }
          ]
        };
        
      case 'continue':
        return {
          title: 'Continue Details',
          subtitle: 'Specify what you\'re continuing from',
          fields: [
            {
              key: 'startStitches',
              label: 'Starting Stitch Count',
              type: 'number',
              placeholder: 'e.g., 76',
              required: true,
              min: 1
            },
            {
              key: 'startDescription',
              label: 'Continuing From',
              type: 'text',
              placeholder: 'e.g., From front piece, from sleeve cuff',
              required: true
            }
          ]
        };
        
      case 'other':
        return {
          title: 'Custom Setup Details',
          subtitle: 'Describe your custom setup method',
          fields: [
            {
              key: 'startDescription',
              label: 'Setup Description',
              type: 'text',
              placeholder: 'e.g., Pick up 40, cast on 4, complex cable setup',
              required: true
            },
            {
              key: 'startStitches',
              label: 'Starting Stitch Count',
              type: 'number',
              placeholder: 'e.g., 44',
              required: true,
              min: 1
            }
          ]
        };
        
      default:
        return { title: 'Details', subtitle: '', fields: [] };
    }
  };

  const fieldConfig = getFieldsForType();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-wool-700 mb-3">{fieldConfig.title}</h2>
        <p className="text-wool-500 mb-4">{fieldConfig.subtitle}</p>
      </div>

      {fieldConfig.fields.map((field) => (
        <div key={field.key}>
          <label className="block text-sm font-semibold text-wool-700 mb-3">
            {field.label} {field.required && '*'}
          </label>
          <input
            type={field.type}
            value={componentData[field.key] || ''}
            onChange={(e) => setComponentData(prev => ({ ...prev, [field.key]: e.target.value }))}
            placeholder={field.placeholder}
            min={field.min}
            className="w-full border-2 border-wool-200 rounded-xl px-4 py-4 text-base focus:border-sage-500 focus:ring-0 transition-colors placeholder-wool-400"
          />
        </div>
      ))}
    </div>
  );
};

// Main renderer function
export const renderComponentStep = (step, componentData, setComponentData, handlers) => {
  const { handleStartTypeSelect, handleMethodSelect } = handlers;

  switch (step) {
    case COMPONENT_STEPS.NAME:
      return renderNameStep(componentData, setComponentData);
      
    case COMPONENT_STEPS.START_TYPE:
      return renderStartTypeStep(componentData, handleStartTypeSelect);
      
    case COMPONENT_STEPS.METHOD:
      return renderMethodStep(componentData, handleMethodSelect);
      
    case COMPONENT_STEPS.DETAILS:
      return renderDetailsStep(componentData, setComponentData);
      
    default:
      return <div>Step not found</div>;
  }
};