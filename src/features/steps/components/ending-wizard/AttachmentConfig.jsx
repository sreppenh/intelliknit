import React from 'react';

const AttachmentConfig = ({ endingData, setEndingData }) => {
  // Get existing components for the dropdown (mock data for now)
  const availableComponents = [
    'Left Sleeve',
    'Right Sleeve', 
    'Back Panel',
    'Front Panel',
    'Collar',
    'Other...'
  ];

  const methods = [
    { 
      id: 'mattress_stitch', 
      name: 'Mattress Stitch', 
      icon: '🧵',
      description: 'Invisible side seam'
    },
    { 
      id: 'backstitch', 
      name: 'Backstitch', 
      icon: '⬅️',
      description: 'Strong, visible seam'
    },
    { 
      id: 'kitchener_stitch', 
      name: 'Kitchener Stitch', 
      icon: '🪡',
      description: 'Invisible graft'
    },
    { 
      id: 'other', 
      name: 'Other Method', 
      icon: '📝',
      description: 'Specify your own'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-wool-700 mb-3">Attachment Details</h2>
        <p className="text-wool-500 mb-4">Choose method and target component</p>
      </div>

      {/* Attachment Method - Oval Radio List */}
      <div>
        <h3 className="text-sm font-semibold text-wool-700 mb-3 text-left">Attachment Method</h3>
        <div className="space-y-3">
          {methods.map((method) => (
            <label 
              key={method.id}
              className={`flex items-center cursor-pointer p-4 rounded-2xl border-2 transition-all duration-200 ${
                endingData.method === method.id
                  ? 'border-sage-500 bg-sage-100 text-sage-700 shadow-sm'
                  : 'border-wool-200 bg-white text-wool-700 hover:border-sage-300 hover:bg-sage-50'
              }`}
            >
              <input
                type="radio"
                name="attach_method"
                value={method.id}
                checked={endingData.method === method.id}
                onChange={(e) => setEndingData(prev => ({ ...prev, method: e.target.value }))}
                className="w-4 h-4 text-sage-600 mr-4"
              />
              <div className="flex items-center gap-3 flex-1">
                <span className="text-xl">{method.icon}</span>
                <div className="text-left">
                  <div className="font-medium">{method.name}</div>
                  <div className="text-sm opacity-75">{method.description}</div>
                </div>
              </div>
            </label>
          ))}
        </div>

        {endingData.method === 'other' && (
          <div className="mt-4">
            <input
              type="text"
              value={endingData.customMethod || ''}
              onChange={(e) => setEndingData(prev => ({ ...prev, customMethod: e.target.value }))}
              placeholder="Describe your attachment method"
              className="w-full border-2 border-wool-200 rounded-lg px-3 py-2 text-sm focus:border-sage-500 focus:ring-0 transition-colors placeholder-wool-400 bg-white"
            />
          </div>
        )}
      </div>

      {/* Component Dropdown */}
      <div>
        <label className="block text-sm font-semibold text-wool-700 mb-3 text-left">
          Attach to Component
        </label>
        <select
          value={endingData.targetComponent || ''}
          onChange={(e) => setEndingData(prev => ({ ...prev, targetComponent: e.target.value }))}
          className="w-full border-2 border-wool-200 rounded-xl px-4 py-3 text-base focus:border-sage-500 focus:ring-0 transition-colors bg-white"
        >
          <option value="">Choose component...</option>
          {availableComponents.map(comp => (
            <option key={comp} value={comp}>{comp}</option>
          ))}
        </select>

        {endingData.targetComponent === 'Other...' && (
          <div className="mt-3">
            <input
              type="text"
              value={endingData.customText || ''}
              onChange={(e) => setEndingData(prev => ({ ...prev, customText: e.target.value }))}
              placeholder="Describe the component to attach to"
              className="w-full border-2 border-wool-200 rounded-lg px-3 py-2 text-sm focus:border-sage-500 focus:ring-0 transition-colors placeholder-wool-400 bg-white"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default AttachmentConfig;