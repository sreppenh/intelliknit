import React, { useState } from 'react';

const ComponentEndingWizard = ({ component, onBack, onComplete }) => {
  const [step, setStep] = useState(1);
  const [endingData, setEndingData] = useState({
    type: null,
    method: '',
    targetComponent: '',
    customText: '',
    customMethod: ''
  });

  // Get existing components for the dropdown (mock data for now)
  const availableComponents = [
    'Left Sleeve',
    'Right Sleeve', 
    'Back Panel',
    'Front Panel',
    'Collar',
    'Other...'
  ];

  const handleEndingTypeSelect = (type) => {
    setEndingData(prev => ({ ...prev, type }));
    
    // Put on Holder is instant - no configuration needed
    if (type === 'put_on_holder') {
      handleComplete({
        type,
        description: 'Put all stitches on holder for later use'
      });
      return;
    }
    
    // All other types need configuration
    setStep(2);
  };

  const handleComplete = (finalData = null) => {
    const endingStep = finalData || generateEndingStep();
    onComplete(endingStep);
  };

  const generateEndingStep = () => {
    const { type, method, targetComponent, customText, customMethod } = endingData;
    
    switch (type) {
      case 'bind_off_all':
        const methodName = method === 'other' ? customMethod : getMethodName(method);
        return {
          type,
          method: method || 'standard',
          description: `Bind off all stitches${methodName ? ` using ${methodName}` : ''}`
        };
        
      case 'attach_to_piece':
        const attachMethod = method === 'other' ? customMethod : getMethodName(method);
        const target = targetComponent === 'Other...' ? customText : targetComponent;
        return {
          type,
          method,
          targetComponent: target,
          description: `Attach to ${target}${attachMethod ? ` using ${attachMethod}` : ''}`
        };
        
      case 'continue_component':
        return {
          type,
          description: `Continue to: ${customText}`,
          customText
        };
        
      case 'other':
        return {
          type,
          description: customText,
          customText
        };
        
      default:
        return { type, description: 'Unknown ending' };
    }
  };

  const getMethodName = (methodId) => {
    const methodNames = {
      'standard': 'standard bind off',
      'stretchy': 'stretchy bind off', 
      'picot': 'picot bind off',
      'three_needle': 'three needle bind off',
      'mattress_stitch': 'mattress stitch',
      'backstitch': 'backstitch',
      'kitchener_stitch': 'kitchener stitch',
      'three_needle_bindoff': 'three needle bind off'
    };
    return methodNames[methodId] || methodId;
  };

  const canComplete = () => {
    const { type, method, targetComponent, customText, customMethod } = endingData;
    
    switch (type) {
      case 'bind_off_all':
        return true; // Method is optional
      case 'attach_to_piece':
        return method && targetComponent && (targetComponent !== 'Other...' || customText);
      case 'continue_component':
        return customText && customText.trim() !== '';
      case 'other':
        return customText && customText.trim() !== '';
      default:
        return false;
    }
  };

  // Step 1: What happens to stitches?
  if (step === 1) {
    return (
      <div className="min-h-screen bg-yarn-50">
        <div className="max-w-md mx-auto bg-white min-h-screen shadow-lg">
          
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
                <h1 className="text-lg font-semibold">Finish Component</h1>
                <p className="text-sage-100 text-sm">What happens to the stitches?</p>
              </div>
            </div>
          </div>

          <div className="p-6 bg-yarn-50 space-y-6">
            <div>
              <div className="text-center mb-6">
                <div className="text-2xl mb-2">🏁</div>
                <h2 className="text-xl font-semibold text-wool-700 mb-2">How does {component?.name || 'this component'} end?</h2>
                <p className="text-wool-500">Choose what happens to your stitches</p>
              </div>
            </div>
            
            {/* Clickable cards - no buttons needed */}
            <div className="space-y-3">
              <button
                onClick={() => handleEndingTypeSelect('bind_off_all')}
                className="w-full p-4 border-2 rounded-xl transition-all duration-200 text-left border-wool-200 bg-white text-wool-700 hover:border-sage-300 hover:bg-sage-50 hover:shadow-md hover:transform hover:scale-[1.02]"
              >
                <div className="flex items-center gap-4">
                  <div className="text-3xl">✂️</div>
                  <div>
                    <div className="font-semibold text-base mb-1">Bind Off All Stitches</div>
                    <div className="text-sm opacity-75">Finish the component completely</div>
                  </div>
                </div>
              </button>

              <button
                onClick={() => handleEndingTypeSelect('put_on_holder')}
                className="w-full p-4 border-2 rounded-xl transition-all duration-200 text-left border-wool-200 bg-white text-wool-700 hover:border-sage-300 hover:bg-sage-50 hover:shadow-md hover:transform hover:scale-[1.02]"
              >
                <div className="flex items-center gap-4">
                  <div className="text-3xl">📎</div>
                  <div>
                    <div className="font-semibold text-base mb-1">Put on Holder</div>
                    <div className="text-sm opacity-75">Keep stitches live for later use</div>
                  </div>
                </div>
              </button>

              <button
                onClick={() => handleEndingTypeSelect('attach_to_piece')}
                className="w-full p-4 border-2 rounded-xl transition-all duration-200 text-left border-wool-200 bg-white text-wool-700 hover:border-sage-300 hover:bg-sage-50 hover:shadow-md hover:transform hover:scale-[1.02]"
              >
                <div className="flex items-center gap-4">
                  <div className="text-3xl">🔗</div>
                  <div>
                    <div className="font-semibold text-base mb-1">Attach to Another Piece</div>
                    <div className="text-sm opacity-75">Connect to another component</div>
                  </div>
                </div>
              </button>

              <button
                onClick={() => handleEndingTypeSelect('continue_component')}
                className="w-full p-4 border-2 rounded-xl transition-all duration-200 text-left border-wool-200 bg-white text-wool-700 hover:border-sage-300 hover:bg-sage-50 hover:shadow-md hover:transform hover:scale-[1.02]"
              >
                <div className="flex items-center gap-4">
                  <div className="text-3xl">➡️</div>
                  <div>
                    <div className="font-semibold text-base mb-1">Continue This Component</div>
                    <div className="text-sm opacity-75">Transition to next section</div>
                  </div>
                </div>
              </button>

              <button
                onClick={() => handleEndingTypeSelect('other')}
                className="w-full p-4 border-2 rounded-xl transition-all duration-200 text-left border-wool-200 bg-white text-wool-700 hover:border-sage-300 hover:bg-sage-50 hover:shadow-md hover:transform hover:scale-[1.02]"
              >
                <div className="flex items-center gap-4">
                  <div className="text-3xl">📝</div>
                  <div>
                    <div className="font-semibold text-base mb-1">Other Ending</div>
                    <div className="text-sm opacity-75">Custom ending method</div>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Step 2: Configuration based on ending type
  return (
    <div className="min-h-screen bg-yarn-50">
      <div className="max-w-md mx-auto bg-white min-h-screen shadow-lg">
        
        {/* Header */}
        <div className="bg-sage-500 text-white px-6 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setStep(1)}
              className="text-white text-xl hover:bg-white hover:bg-opacity-20 rounded-full w-10 h-10 flex items-center justify-center transition-colors"
            >
              ←
            </button>
            <div className="flex-1">
              <h1 className="text-lg font-semibold">Configure Ending</h1>
              <p className="text-sage-100 text-sm">Set up the details</p>
            </div>
          </div>
        </div>

        <div className="p-6 bg-yarn-50 space-y-6">
          
          {/* Bind Off All Configuration */}
          {endingData.type === 'bind_off_all' && (
            <>
              <div>
                <h2 className="text-xl font-semibold text-wool-700 mb-3">Bind Off Method</h2>
                <p className="text-wool-500 mb-4">Choose your bind off technique (optional)</p>
              </div>

              {/* Radio list for methods */}
              <div className="space-y-3">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="bindoff_method"
                    value="standard"
                    checked={endingData.method === 'standard'}
                    onChange={(e) => setEndingData(prev => ({ ...prev, method: e.target.value }))}
                    className="w-4 h-4 text-sage-600 mr-3"
                  />
                  <div className="flex items-center gap-3">
                    <span className="text-lg">✂️</span>
                    <div>
                      <div className="font-medium text-wool-700">Standard Bind Off</div>
                      <div className="text-sm text-wool-500">Basic bind off, most common</div>
                    </div>
                  </div>
                </label>

                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="bindoff_method"
                    value="stretchy"
                    checked={endingData.method === 'stretchy'}
                    onChange={(e) => setEndingData(prev => ({ ...prev, method: e.target.value }))}
                    className="w-4 h-4 text-sage-600 mr-3"
                  />
                  <div className="flex items-center gap-3">
                    <span className="text-lg">🌊</span>
                    <div>
                      <div className="font-medium text-wool-700">Stretchy Bind Off</div>
                      <div className="text-sm text-wool-500">Extra stretch for ribbing</div>
                    </div>
                  </div>
                </label>

                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="bindoff_method"
                    value="picot"
                    checked={endingData.method === 'picot'}
                    onChange={(e) => setEndingData(prev => ({ ...prev, method: e.target.value }))}
                    className="w-4 h-4 text-sage-600 mr-3"
                  />
                  <div className="flex items-center gap-3">
                    <span className="text-lg">🌸</span>
                    <div>
                      <div className="font-medium text-wool-700">Picot Bind Off</div>
                      <div className="text-sm text-wool-500">Decorative scalloped edge</div>
                    </div>
                  </div>
                </label>

                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="bindoff_method"
                    value="three_needle"
                    checked={endingData.method === 'three_needle'}
                    onChange={(e) => setEndingData(prev => ({ ...prev, method: e.target.value }))}
                    className="w-4 h-4 text-sage-600 mr-3"
                  />
                  <div className="flex items-center gap-3">
                    <span className="text-lg">🔗</span>
                    <div>
                      <div className="font-medium text-wool-700">Three Needle Bind Off</div>
                      <div className="text-sm text-wool-500">Joins two pieces together</div>
                    </div>
                  </div>
                </label>

                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="bindoff_method"
                    value="other"
                    checked={endingData.method === 'other'}
                    onChange={(e) => setEndingData(prev => ({ ...prev, method: e.target.value }))}
                    className="w-4 h-4 text-sage-600 mr-3"
                  />
                  <div className="flex items-center gap-3">
                    <span className="text-lg">📝</span>
                    <div>
                      <div className="font-medium text-wool-700">Other Method</div>
                      <div className="text-sm text-wool-500">Specify your own</div>
                    </div>
                  </div>
                </label>

                {endingData.method === 'other' && (
                  <div className="ml-7 mt-3">
                    <input
                      type="text"
                      value={endingData.customMethod}
                      onChange={(e) => setEndingData(prev => ({ ...prev, customMethod: e.target.value }))}
                      placeholder="e.g., Jeny's surprisingly stretchy bind off"
                      className="w-full border-2 border-wool-200 rounded-lg px-3 py-2 text-sm focus:border-sage-500 focus:ring-0 transition-colors placeholder-wool-400 bg-white"
                    />
                  </div>
                )}
              </div>
            </>
          )}

          {/* Attach to Piece Configuration */}
          {endingData.type === 'attach_to_piece' && (
            <>
              <div>
                <h2 className="text-xl font-semibold text-wool-700 mb-3">Attachment Details</h2>
                <p className="text-wool-500 mb-4">Choose method and target component</p>
              </div>

              {/* Attachment Method - Radio List */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-wool-700 mb-3">Attachment Method</h3>
                  <div className="space-y-2">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="attach_method"
                        value="mattress_stitch"
                        checked={endingData.method === 'mattress_stitch'}
                        onChange={(e) => setEndingData(prev => ({ ...prev, method: e.target.value }))}
                        className="w-4 h-4 text-sage-600 mr-3"
                      />
                      <div className="flex items-center gap-3">
                        <span className="text-lg">🧵</span>
                        <div>
                          <div className="font-medium text-wool-700">Mattress Stitch</div>
                          <div className="text-sm text-wool-500">Invisible side seam</div>
                        </div>
                      </div>
                    </label>

                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="attach_method"
                        value="backstitch"
                        checked={endingData.method === 'backstitch'}
                        onChange={(e) => setEndingData(prev => ({ ...prev, method: e.target.value }))}
                        className="w-4 h-4 text-sage-600 mr-3"
                      />
                      <div className="flex items-center gap-3">
                        <span className="text-lg">⬅️</span>
                        <div>
                          <div className="font-medium text-wool-700">Backstitch</div>
                          <div className="text-sm text-wool-500">Strong, visible seam</div>
                        </div>
                      </div>
                    </label>

                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="attach_method"
                        value="kitchener_stitch"
                        checked={endingData.method === 'kitchener_stitch'}
                        onChange={(e) => setEndingData(prev => ({ ...prev, method: e.target.value }))}
                        className="w-4 h-4 text-sage-600 mr-3"
                      />
                      <div className="flex items-center gap-3">
                        <span className="text-lg">🪡</span>
                        <div>
                          <div className="font-medium text-wool-700">Kitchener Stitch</div>
                          <div className="text-sm text-wool-500">Invisible graft</div>
                        </div>
                      </div>
                    </label>

                    <label className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="attach_method"
                        value="other"
                        checked={endingData.method === 'other'}
                        onChange={(e) => setEndingData(prev => ({ ...prev, method: e.target.value }))}
                        className="w-4 h-4 text-sage-600 mr-3"
                      />
                      <div className="flex items-center gap-3">
                        <span className="text-lg">📝</span>
                        <div>
                          <div className="font-medium text-wool-700">Other Method</div>
                          <div className="text-sm text-wool-500">Specify your own</div>
                        </div>
                      </div>
                    </label>

                    {endingData.method === 'other' && (
                      <div className="ml-7 mt-2">
                        <input
                          type="text"
                          value={endingData.customMethod}
                          onChange={(e) => setEndingData(prev => ({ ...prev, customMethod: e.target.value }))}
                          placeholder="Describe your attachment method"
                          className="w-full border-2 border-wool-200 rounded-lg px-3 py-2 text-sm focus:border-sage-500 focus:ring-0 transition-colors placeholder-wool-400 bg-white"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Component Dropdown */}
                <div>
                  <label className="block text-sm font-semibold text-wool-700 mb-3">
                    Attach to Component
                  </label>
                  <select
                    value={endingData.targetComponent}
                    onChange={(e) => setEndingData(prev => ({ ...prev, targetComponent: e.target.value }))}
                    className="w-full border-2 border-wool-200 rounded-lg px-3 py-3 text-base focus:border-sage-500 focus:ring-0 transition-colors bg-white"
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
                        value={endingData.customText}
                        onChange={(e) => setEndingData(prev => ({ ...prev, customText: e.target.value }))}
                        placeholder="Describe the component to attach to"
                        className="w-full border-2 border-wool-200 rounded-lg px-3 py-2 text-sm focus:border-sage-500 focus:ring-0 transition-colors placeholder-wool-400 bg-white"
                      />
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Continue Component Configuration */}
          {endingData.type === 'continue_component' && (
            <>
              <div>
                <h2 className="text-xl font-semibold text-wool-700 mb-3">Continue To What?</h2>
                <p className="text-wool-500 mb-4">Describe what section comes next</p>
              </div>

              <div>
                <input
                  type="text"
                  value={endingData.customText}
                  onChange={(e) => setEndingData(prev => ({ ...prev, customText: e.target.value }))}
                  placeholder="e.g., sleeve decreases, neckline shaping, collar"
                  className="w-full border-2 border-wool-200 rounded-xl px-4 py-4 text-base focus:border-sage-500 focus:ring-0 transition-colors placeholder-wool-400 bg-white"
                />
              </div>
            </>
          )}

          {/* Other Ending Configuration */}
          {endingData.type === 'other' && (
            <>
              <div>
                <h2 className="text-xl font-semibold text-wool-700 mb-3">Describe Your Ending</h2>
                <p className="text-wool-500 mb-4">What happens to complete this component?</p>
              </div>

              <div>
                <textarea
                  value={endingData.customText}
                  onChange={(e) => setEndingData(prev => ({ ...prev, customText: e.target.value }))}
                  placeholder="Describe how this component ends..."
                  rows={3}
                  className="w-full border-2 border-wool-200 rounded-xl px-4 py-4 text-base focus:border-sage-500 focus:ring-0 transition-colors placeholder-wool-400 bg-white resize-none"
                />
              </div>
            </>
          )}

          {/* Finish Button */}
          <div className="pt-6 border-t border-wool-200">
            <button
              onClick={() => handleComplete()}
              disabled={!canComplete()}
              className="w-full bg-yarn-600 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:bg-yarn-700 disabled:bg-wool-400 disabled:cursor-not-allowed transition-colors shadow-sm flex items-center justify-center gap-2"
            >
              <span className="text-xl">🏁</span>
              Finish Component
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComponentEndingWizard;