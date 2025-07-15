import React, { useState } from 'react';
import { useProjectsContext } from '../hooks/useProjectsContext';
import { PrepStepOverlay, usePrepNoteManager, PrepStepButton, getPrepNoteConfig } from '../../../shared/components/PrepStepSystem';

const SmartComponentCreation = ({ onBack, onComponentCreated }) => {
  const { dispatch } = useProjectsContext();
  
  const [screen, setScreen] = useState(1);
  const [componentData, setComponentData] = useState({
    name: '',
    startType: null,
    startMethod: null,
    startStitches: '',
    startDescription: '',
    prepNote: ''
  });

  // State for which start type is expanded (like selectedQuickCategory)
  const [selectedStartType, setSelectedStartType] = useState(null);

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

  const prepConfig = getPrepNoteConfig('componentCreation');

  // Method definitions - organized by start type
  const methodsByStartType = {
    cast_on: [
      { id: 'long_tail', name: 'Long Tail', icon: '🪢' },
      { id: 'cable', name: 'Cable', icon: '🔗' },
      { id: 'provisional', name: 'Provisional', icon: '📎' },
      { id: 'tubular', name: 'Tubular', icon: '🌊' },
      { id: 'german_twisted', name: 'German Twisted', icon: '🌀' },
      { id: 'backward_loop', name: 'Backward Loop', icon: '↪️' },
      { id: 'other', name: 'Other', icon: '📝' }
    ],
    pick_up: [
      { id: 'pick_up_knit', name: 'Pick Up & Knit', icon: '🧶' },
      { id: 'standard', name: 'Standard Pick Up', icon: '📌' },
      { id: 'other', name: 'Other', icon: '📝' }
    ],
    continue: [
      { id: 'from_holder', name: 'From Holder', icon: '📎' },
      { id: 'from_previous', name: 'From Previous', icon: '↗️' },
      { id: 'other', name: 'Other', icon: '📝' }
    ],
    other: [
      { id: 'custom', name: 'Custom Setup', icon: '📝' }
    ]
  };

  const startTypes = [
    { id: 'cast_on', name: 'Cast On', icon: '🏗️', desc: 'Start from scratch' },
    { id: 'pick_up', name: 'Pick Up & Knit', icon: '🧶', desc: 'From existing edge' },
    { id: 'continue', name: 'From Holder', icon: '📎', desc: 'Resume saved stitches' },
    { id: 'other', name: 'Other', icon: '📝', desc: 'Complex setup' }
  ];

  const handleStartTypeSelect = (startTypeId) => {
    setSelectedStartType(selectedStartType === startTypeId ? null : startTypeId);
    // Reset component data when changing start type
    setComponentData(prev => ({
      ...prev,
      startType: null,
      startMethod: null,
      startStitches: '',
      startDescription: ''
    }));
  };

  const handleMethodSelect = (startTypeId, methodId) => {
    setComponentData(prev => ({
      ...prev,
      startType: startTypeId,
      startMethod: methodId
    }));
    
    // Auto-advance to screen 2 after a brief delay (like PatternSelector)
    setTimeout(() => {
      setScreen(2);
    }, 50);
  };

  const needsDescription = () => {
    return componentData.startType === 'pick_up' || 
           componentData.startType === 'continue' || 
           componentData.startMethod === 'other';
  };

  const canProceedToDetails = () => {
    return componentData.name.trim() && 
           componentData.startType && 
           componentData.startMethod;
  };

  const canCreateComponent = () => {
    if (!componentData.startStitches || parseInt(componentData.startStitches) <= 0) {
      return false;
    }
    
    if (needsDescription() && !componentData.startDescription?.trim()) {
      return false;
    }
    
    return true;
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
      prepNote: componentData.prepNote
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

  return (
    <div className="min-h-screen bg-yarn-50">
      <div className="max-w-md mx-auto bg-yarn-50 min-h-screen shadow-lg">
        
        {/* Header */}
        <div className="bg-sage-500 text-white px-6 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={screen === 1 ? onBack : () => setScreen(1)}
              className="text-white text-lg hover:bg-white hover:bg-opacity-20 rounded-full w-10 h-10 flex items-center justify-center transition-colors flex-shrink-0"
            >
              ←
            </button>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-semibold">Add Component</h1>
              <p className="text-sage-100 text-sm">{screen === 1 ? 'Setup and method' : 'Final details'}</p>
            </div>
          </div>
        </div>

        {screen === 1 ? (
          // Screen 1: Name + Integrated Start Type & Method Selection
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
              <h2 className="text-xl font-semibold text-wool-700 mb-3 text-left">Component Name</h2>
              <input
                type="text"
                value={componentData.name}
                onChange={(e) => setComponentData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Left Sleeve, Back Panel, Collar"
                className="input-field-lg"
              />
            </div>

            {/* How Does It Start - PatternSelector Style */}
            <div>
              <h2 className="text-xl font-semibold text-wool-700 mb-4 text-left">How does it start?</h2>
              
              {/* Start Type Selection in Card */}
              <div className="bg-white rounded-2xl border-2 border-wool-200 shadow-sm p-4">
                
                {/* Start Type Grid */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {startTypes.map((startType) => (
                    <button
                      key={startType.id}
                      onClick={() => handleStartTypeSelect(startType.id)}
                      className={`p-3 rounded-xl border-2 transition-all duration-200 text-center ${
                        selectedStartType === startType.id
                          ? 'border-sage-500 bg-sage-100 text-sage-700 shadow-sm'
                          : 'border-wool-200 bg-sage-50 text-wool-700 hover:border-sage-300 hover:bg-sage-100 hover:shadow-sm'
                      }`}
                    >
                      <div className="text-xl mb-1">{startType.icon}</div>
                      <div className="text-xs font-medium">{startType.name}</div>
                    </button>
                  ))}
                </div>

                {/* Method Selection - Appears inline when start type selected */}
                {selectedStartType && (
                  <div className="border-t border-wool-200 pt-4">
                    <div className="grid grid-cols-3 gap-2">
                      {methodsByStartType[selectedStartType].map(method => (
                        <button
                          key={method.id}
                          onClick={() => handleMethodSelect(selectedStartType, method.id)}
                          className={`card-pattern-option ${
                            componentData.startMethod === method.id
                              ? 'border-sage-500 bg-sage-100 text-sage-700'
                              : ''
                          }`}
                        >
                          <div className="text-lg mb-1">{method.icon}</div>
                          <div className="text-xs font-medium mb-0.5">{method.name}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Help Section */}
            <div className="success-block">
              <h4 className="text-sm font-semibold text-sage-700 mb-2 text-left">💡 Examples</h4>
              <div className="text-sm text-sage-600 space-y-1 text-left">
                <div>• <strong>Cast On:</strong> Starting a new sleeve or body panel</div>
                <div>• <strong>Pick Up:</strong> Adding a collar or button band</div>
                <div>• <strong>From Holder:</strong> Resuming shoulder or neck stitches</div>
              </div>
            </div>
          </div>
        ) : (
          // Screen 2: Configuration Fields - Standard Pattern
          <div className="p-6 bg-yarn-50 stack-lg relative">
            
            {/* Prep Note Button */}
            <PrepStepButton 
              onClick={handleOpenOverlay}
              hasNote={hasNote}
              notePreview={notePreview}
              position="top-right"
              size="normal"
              variant="ghost"
            />
            
            {/* Standard Header Pattern */}
            <div>
              <h2 className="text-xl font-semibold text-wool-700 mb-3 text-left">Component Details</h2>
              <p className="text-wool-500 mb-4 text-left">Configure your {componentData.startType?.replace('_', ' ').toLowerCase()} setup</p>
            </div>

            {/* Summary */}
            <div className="success-block">
              <div className="text-sm text-sage-700 text-left">
                <div className="font-semibold mb-1 text-left">Selected Configuration:</div>
                <div>• <strong>Component:</strong> {componentData.name}</div>
                <div>• <strong>Start Type:</strong> {componentData.startType?.replace('_', ' ')}</div>
                <div>• <strong>Method:</strong> {componentData.startMethod?.replace('_', ' ')}</div>
              </div>
            </div>

            {/* Stitch Count - Standard Label Pattern */}
            <div>
              <label className="block text-sm font-semibold text-wool-700 mb-3 text-left">
                Starting Stitch Count
              </label>
              <input
                type="number"
                value={componentData.startStitches}
                onChange={(e) => setComponentData(prev => ({ ...prev, startStitches: e.target.value }))}
                placeholder="e.g., 80"
                className="w-full border-2 border-wool-200 rounded-xl px-4 py-4 text-base focus:border-sage-500 focus:ring-0 transition-colors placeholder-wool-400 bg-white"
                min="1"
              />
            </div>

            {/* Description - Only when needed */}
            {needsDescription() && (
              <div>
                <label className="block text-sm font-semibold text-wool-700 mb-3 text-left">
                  {componentData.startType === 'pick_up' ? 'Pick Up From' :
                   componentData.startType === 'continue' ? 'Continue From' :
                   'Method Description'} {componentData.startMethod === 'other' ? ' *' : ''}
                </label>
                <input
                  type="text"
                  value={componentData.startDescription}
                  onChange={(e) => setComponentData(prev => ({ ...prev, startDescription: e.target.value }))}
                  placeholder={
                    componentData.startType === 'pick_up' ? 'e.g., From body armhole, along neckline edge' :
                    componentData.startType === 'continue' ? 'e.g., From front piece, from sleeve cuff' :
                    'Describe your method'
                  }
                  className="w-full border-2 border-wool-200 rounded-xl px-4 py-4 text-base focus:border-sage-500 focus:ring-0 transition-colors placeholder-wool-400 bg-white"
                />
              </div>
            )}

            {/* Create Button */}
            <div className="pt-4">
              <div className="flex gap-3">
                <button
                  onClick={() => setScreen(1)}
                  className="flex-1 btn-tertiary"
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
        )}

        {/* Prep Note Overlay */}
        <PrepStepOverlay
          isOpen={isOverlayOpen}
          onClose={handleCloseOverlay}
          onSave={handleSaveNote}
          existingNote={currentNote}
          {...prepConfig}
        />
      </div>
    </div>
  );
};

export default SmartComponentCreation;