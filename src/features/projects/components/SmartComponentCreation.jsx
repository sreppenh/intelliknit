import React, { useState } from 'react';
import { useProjectsContext } from '../hooks/useProjectsContext';
import { PrepStepOverlay, usePrepNoteManager, PrepStepButton, getPrepNoteConfig } from '../../../shared/components/PrepStepSystem';

const SmartComponentCreation = ({ onBack, onComponentCreated }) => {
  const { dispatch } = useProjectsContext();
  const [screen, setScreen] = useState(1);
  const [showMoreMethods, setShowMoreMethods] = useState(false);
  
  const [componentData, setComponentData] = useState({
    name: '',
    startType: null,
    startMethod: null,
    startStitches: '',
    startDescription: '',
    prepNote: '' // NEW: Add prep note to component data
  });

  // Prep note management
  const {
    isOverlayOpen,
    currentNote,
    hasNote,
    notePreview,
    handleOpenOverlay,
    handleCloseOverlay,
    handleSaveNote
  } = usePrepNoteManager(componentData.prepNote, (note) => {
    setComponentData(prev => ({ ...prev, prepNote: note }));
  });

  // Get config for component creation
  const prepConfig = getPrepNoteConfig('componentCreation');

  // Method definitions - clean and focused!
  const methodsByStartType = {
    cast_on: {
      primary: [
        { id: 'long_tail', name: 'Long Tail', icon: '🪢', desc: 'Most common, stretchy edge' },
        { id: 'cable', name: 'Cable', icon: '🔗', desc: 'Firm, decorative edge' },
        { id: 'tubular', name: 'Tubular', icon: '🌊', desc: 'Perfect for ribbing!' },
        { id: 'provisional', name: 'Provisional', icon: '📎', desc: 'Removable, for later pickup' }
      ],
      secondary: [
        { id: 'german_twisted', name: 'German Twisted', icon: '🌀', desc: 'Very stretchy' },
        { id: 'backward_loop', name: 'Backward Loop', icon: '↪️', desc: 'Quick and simple' },
        { id: 'other', name: 'Other Method', icon: '📝', desc: 'Specify your own' }
      ]
    },
    pick_up: {
      primary: [
        { id: 'pick_up_knit', name: 'Pick Up & Knit', icon: '🧶', desc: 'Pick up and knit in one motion' },
        { id: 'other', name: 'Other Method', icon: '📝', desc: 'Specify your own' }
      ],
      secondary: []
    },
    continue: {
      primary: [
        { id: 'from_holder', name: 'From Holder', icon: '📎', desc: 'Resume saved stitches' },
        { id: 'other', name: 'Other Method', icon: '📝', desc: 'Specify your own' }
      ],
      secondary: []
    },
    other: {
      primary: [
        { id: 'custom', name: 'Custom Setup', icon: '📝', desc: 'Describe your setup method' }
      ],
      secondary: []
    }
  };

  const startTypes = [
    { id: 'cast_on', name: 'Cast On', icon: '🏗️', desc: 'Start from scratch' },
    { id: 'pick_up', name: 'Pick Up & Knit', icon: '🧶', desc: 'From existing edge' },
    { id: 'continue', name: 'From Holder', icon: '📎', desc: 'Resume saved stitches' },
    { id: 'other', name: 'Other', icon: '📝', desc: 'Complex setup' }
  ];

  const handleStartTypeSelect = (startType) => {
    setComponentData(prev => ({
      ...prev,
      startType,
      startMethod: null // Reset method when changing start type
    }));
    setShowMoreMethods(false); // Reset expanded state
  };

  const handleMethodSelect = (methodId) => {
    setComponentData(prev => ({
      ...prev,
      startMethod: methodId
    }));
  };

  const canProceedToDetails = () => {
    return componentData.name.trim() && 
           componentData.startType && 
           componentData.startMethod;
  };

  const canCreateComponent = () => {
    return componentData.startStitches && 
           parseInt(componentData.startStitches) > 0;
  };

  const handleCreateComponent = () => {
    const newComponent = {
      name: componentData.name.trim(),
      startType: componentData.startType,
      startDescription: componentData.startDescription || getDefaultDescription(),
      startingStitches: parseInt(componentData.startStitches),
      startMethod: componentData.startMethod,
      endType: null,
      endDescription: '',
      endingStitches: null,
      endMethod: '',
      steps: [],
      currentStep: 0,
      prepNote: componentData.prepNote // NEW: Include prep note in component
    };

    dispatch({ 
      type: 'ADD_ENHANCED_COMPONENT', 
      payload: newComponent 
    });

    onComponentCreated(newComponent);
  };

  const getDefaultDescription = () => {
    const typeMap = {
      cast_on: 'Cast on from scratch',
      pick_up: 'Pick up from existing piece',
      continue: 'Continue from previous section',
      other: 'Custom setup'
    };
    return typeMap[componentData.startType] || '';
  };

  const getSelectedMethods = () => {
    if (!componentData.startType) return { primary: [], secondary: [] };
    return methodsByStartType[componentData.startType] || { primary: [], secondary: [] };
  };

  const selectedMethods = getSelectedMethods();
  const hasSecondaryMethods = selectedMethods.secondary.length > 0;

  // Screen 1: Name + Start Type + Method Selection
  if (screen === 1) {
    return (
      <>
        <div className="min-h-screen bg-yarn-50">
          <div className="max-w-md mx-auto bg-yarn-50 min-h-screen shadow-lg">
            
            {/* Header */}
            <div className="bg-sage-500 text-white px-6 py-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={onBack}
                  className="text-white text-xl hover:bg-white hover:bg-opacity-20 rounded-full w-10 h-10 flex items-center justify-center transition-colors"
                >
                  ←
                </button>
                <div className="flex-1">
                  <h1 className="text-lg font-semibold">Add Component</h1>
                  <p className="text-sage-100 text-sm">Setup and method</p>
                </div>
              </div>
            </div>

            <div className="p-6 bg-yarn-50 space-y-6 relative">
              
              {/* Prep Note Button */}
              <PrepStepButton 
                onClick={handleOpenOverlay}
                hasNote={hasNote}
                notePreview={notePreview}
                position="top-right"
                size="normal"
                variant="ghost"
              />
              
              {/* Component Name */}
              <div>
                <h2 className="text-xl font-semibold text-wool-700 mb-3">Component Name</h2>
                <input
                  type="text"
                  value={componentData.name}
                  onChange={(e) => setComponentData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Left Sleeve, Back Panel, Collar"
                  className="w-full border-2 border-wool-200 rounded-xl px-4 py-4 text-base focus:border-sage-500 focus:ring-0 transition-colors placeholder-wool-400 bg-white"
                />
              </div>

              {/* How Does It Start */}
              <div>
                <h2 className="text-xl font-semibold text-wool-700 mb-3">How does it start?</h2>
                <div className="grid grid-cols-2 gap-3">
                  {startTypes.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => handleStartTypeSelect(type.id)}
                      className={`p-4 border-2 rounded-xl transition-all duration-200 text-center ${
                        componentData.startType === type.id
                          ? 'border-sage-500 bg-sage-100 text-sage-700 shadow-sm'
                          : 'border-wool-200 bg-white text-wool-700 hover:border-sage-300 hover:bg-sage-50 hover:shadow-sm'
                      }`}
                    >
                      <div className="text-2xl mb-2">{type.icon}</div>
                      <div className="font-semibold text-sm mb-1">{type.name}</div>
                      <div className="text-xs opacity-75">{type.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Method Selection - Appears when start type is selected */}
              {componentData.startType && (
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold text-wool-700">Choose Method</h2>
                  
                  {/* Primary Methods */}
                  <div className="grid grid-cols-2 gap-3">
                    {selectedMethods.primary.map((method) => (
                      <button
                        key={method.id}
                        onClick={() => handleMethodSelect(method.id)}
                        className={`p-3 border-2 rounded-xl transition-all duration-200 text-center ${
                          componentData.startMethod === method.id
                            ? 'border-yarn-500 bg-yarn-100 text-yarn-700 shadow-sm'
                            : 'border-wool-200 bg-white text-wool-700 hover:border-yarn-300 hover:bg-yarn-50 hover:shadow-sm'
                        }`}
                      >
                        <div className="text-xl mb-1">{method.icon}</div>
                        <div className="font-semibold text-xs mb-1">{method.name}</div>
                        <div className="text-xs opacity-75">{method.desc}</div>
                      </button>
                    ))}
                  </div>

                  {/* More Methods Toggle */}
                  {hasSecondaryMethods && (
                    <div>
                      <button
                        onClick={() => setShowMoreMethods(!showMoreMethods)}
                        className="w-full py-2 px-4 border-2 border-dashed border-wool-300 rounded-lg text-wool-600 hover:border-yarn-400 hover:text-yarn-600 transition-colors text-sm font-medium flex items-center justify-center gap-2"
                      >
                        {showMoreMethods ? '↑ Fewer Methods' : '↓ More Methods'}
                      </button>

                      {/* Secondary Methods */}
                      {showMoreMethods && (
                        <div className="grid grid-cols-2 gap-3 mt-3">
                          {selectedMethods.secondary.map((method) => (
                            <button
                              key={method.id}
                              onClick={() => handleMethodSelect(method.id)}
                              className={`p-3 border-2 rounded-xl transition-all duration-200 text-center ${
                                componentData.startMethod === method.id
                                  ? 'border-yarn-500 bg-yarn-100 text-yarn-700 shadow-sm'
                                  : 'border-wool-200 bg-white text-wool-700 hover:border-yarn-300 hover:bg-yarn-50 hover:shadow-sm'
                              }`}
                            >
                              <div className="text-xl mb-1">{method.icon}</div>
                              <div className="font-semibold text-xs mb-1">{method.name}</div>
                              <div className="text-xs opacity-75">{method.desc}</div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Navigation */}
              <div className="pt-6 border-t border-wool-200">
                <div className="flex gap-3">
                  <button
                    onClick={onBack}
                    className="flex-1 bg-wool-100 text-wool-700 py-4 px-4 rounded-xl font-semibold text-base hover:bg-wool-200 transition-colors border border-wool-200"
                  >
                    Cancel
                  </button>
                  
                  <button
                    onClick={() => setScreen(2)}
                    disabled={!canProceedToDetails()}
                    className="flex-2 bg-sage-500 text-white py-4 px-6 rounded-xl font-semibold text-base hover:bg-sage-600 disabled:bg-wool-400 disabled:cursor-not-allowed transition-colors shadow-sm"
                    style={{flexGrow: 2}}
                  >
                    Continue →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Prep Note Overlay */}
        <PrepStepOverlay
          isOpen={isOverlayOpen}
          onClose={handleCloseOverlay}
          onSave={handleSaveNote}
          existingNote={currentNote}
          {...prepConfig}
        />
      </>
    );
  }

  // Screen 2: Details
  return (
    <>
      <div className="min-h-screen bg-yarn-50">
        <div className="max-w-md mx-auto bg-yarn-50 min-h-screen shadow-lg">
          
          {/* Header */}
          <div className="bg-sage-500 text-white px-6 py-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setScreen(1)}
                className="text-white text-xl hover:bg-white hover:bg-opacity-20 rounded-full w-10 h-10 flex items-center justify-center transition-colors"
              >
                ←
              </button>
              <div className="flex-1">
                <h1 className="text-lg font-semibold">Setup Details</h1>
                <p className="text-sage-100 text-sm">{componentData.name}</p>
              </div>
            </div>
          </div>

          <div className="p-6 bg-yarn-50 space-y-6 relative">
            
            {/* Prep Note Button */}
            <PrepStepButton 
              onClick={handleOpenOverlay}
              hasNote={hasNote}
              notePreview={notePreview}
              position="top-right"
              size="normal"
              variant="ghost"
            />
            
            {/* Summary */}
            <div className="bg-sage-100 border-2 border-sage-200 rounded-xl p-4">
              <div className="text-sm text-sage-700">
                <div className="font-semibold mb-1">{componentData.name}</div>
                <div className="opacity-75">
                  {startTypes.find(t => t.id === componentData.startType)?.name} using{' '}
                  {selectedMethods.primary.find(m => m.id === componentData.startMethod)?.name ||
                   selectedMethods.secondary.find(m => m.id === componentData.startMethod)?.name}
                </div>
              </div>
            </div>

            {/* Stitch Count */}
            <div>
              <label className="block text-sm font-semibold text-wool-700 mb-3">
                Number of Stitches *
              </label>
              <input
                type="number"
                value={componentData.startStitches}
                onChange={(e) => setComponentData(prev => ({ ...prev, startStitches: e.target.value }))}
                placeholder="e.g., 80"
                min="1"
                className="w-full border-2 border-wool-200 rounded-xl px-4 py-4 text-base focus:border-sage-500 focus:ring-0 transition-colors placeholder-wool-400 bg-white"
              />
            </div>

            {/* Description (conditional) */}
            {(componentData.startType === 'pick_up' || 
              componentData.startType === 'continue' || 
              componentData.startType === 'other' ||
              componentData.startMethod === 'other') && (
              <div>
                <label className="block text-sm font-semibold text-wool-700 mb-3">
                  Description {componentData.startMethod === 'other' ? '*' : '(optional)'}
                </label>
                <input
                  type="text"
                  value={componentData.startDescription}
                  onChange={(e) => setComponentData(prev => ({ ...prev, startDescription: e.target.value }))}
                  placeholder={
                    componentData.startType === 'pick_up' ? 'e.g., From body armhole, along neckline edge' :
                    componentData.startType === 'continue' ? 'e.g., From front piece, from sleeve cuff' :
                    componentData.startMethod === 'other' ? 'Describe your method' :
                    'Additional details'
                  }
                  className="w-full border-2 border-wool-200 rounded-xl px-4 py-4 text-base focus:border-sage-500 focus:ring-0 transition-colors placeholder-wool-400 bg-white"
                />
              </div>
            )}

            {/* Create Button */}
            <div className="pt-6 border-t border-wool-200">
              <div className="flex gap-3">
                <button
                  onClick={() => setScreen(1)}
                  className="flex-1 bg-wool-100 text-wool-700 py-4 px-4 rounded-xl font-semibold text-base hover:bg-wool-200 transition-colors border border-wool-200"
                >
                  ← Back
                </button>
                
                <button
                  onClick={handleCreateComponent}
                  disabled={!canCreateComponent()}
                  className="flex-2 bg-yarn-600 text-white py-4 px-6 rounded-xl font-semibold text-base hover:bg-yarn-700 disabled:bg-wool-400 disabled:cursor-not-allowed transition-colors shadow-sm flex items-center justify-center gap-2"
                  style={{flexGrow: 2}}
                >
                  <span className="text-lg">🧶</span>
                  Create Component
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Prep Note Overlay */}
      <PrepStepOverlay
        isOpen={isOverlayOpen}
        onClose={handleCloseOverlay}
        onSave={handleSaveNote}
        existingNote={currentNote}
        {...prepConfig}
      />
    </>
  );
};

export default SmartComponentCreation;