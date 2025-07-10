import React, { useState } from 'react';

const ComponentEndingWizard = ({ component, onBack, onComplete }) => {
  const [step, setStep] = useState(1); // 1 = ending type, 2 = details
  const [endingData, setEndingData] = useState({
    type: 'bind_off_all', // Default to bind off all for new architecture
    method: 'standard',
    stitchCount: '',
    customText: '',
    attachmentMethod: '',
    targetComponent: '',
    instructions: '',
    additionalDetails: ''
  });

  const endingTypes = [
    {
      id: 'bind_off_all',
      name: 'Bind Off All',
      icon: '✂️',
      description: 'Finish component completely'
    },
    {
      id: 'bind_off_partial', 
      name: 'Bind Off Some',
      icon: '🔄',
      description: 'Bind off specific number of stitches'
    },
    {
      id: 'put_on_holder',
      name: 'Put on Holder',
      icon: '📎',
      description: 'Keep stitches live for later'
    },
    {
      id: 'attach_to_piece',
      name: 'Attach to Piece',
      icon: '🔗',
      description: 'Connect to another component'
    },
    {
      id: 'continue_component',
      name: 'Continue Component',
      icon: '➡️',
      description: 'Transition to next section'
    },
    {
      id: 'other',
      name: 'Other Ending',
      icon: '📝',
      description: 'Custom ending method'
    }
  ];

  const bindOffMethods = [
    {
      id: 'standard',
      name: 'Standard',
      icon: '✂️',
      description: 'Basic bind off',
      instructions: 'Knit 2 stitches, *slip left stitch over right stitch, knit 1* repeat across.'
    },
    {
      id: 'stretchy',
      name: 'Stretchy',
      icon: '🌊',
      description: 'Extra stretch for ribbing',
      instructions: '*K2, slip both stitches back to left needle, K2tog through back loops* repeat across.'
    },
    {
      id: 'italian',
      name: 'Italian',
      icon: '🇮🇹',
      description: 'Invisible elastic edge',
      instructions: 'Cut yarn 3x fabric width. Thread tapestry needle. Work in ribbing pattern, pulling stitches through in sequence to create invisible edge.'
    },
    {
      id: 'tubular',
      name: 'Tubular',
      icon: '🔄',
      description: 'Perfect for ribbing',
      instructions: 'Setup: *K1, slip 1 purlwise* for 4 rounds. Then graft live stitches together using kitchener stitch.'
    },
    {
      id: 'three_needle',
      name: 'Three-Needle',
      icon: '🔗',
      description: 'Joins two pieces',
      instructions: 'Hold pieces with right sides together. Insert 3rd needle through first stitch of each needle and knit together, binding off as you go.'
    },
    {
      id: 'other',
      name: 'Other Method',
      icon: '📝',
      description: 'Specify your own',
      instructions: ''
    }
  ];

  const attachmentMethods = [
    {
      id: 'mattress_stitch',
      name: 'Mattress Stitch',
      icon: '🧵',
      description: 'Invisible side seam',
      instructions: 'Pick up horizontal bars between edge stitches, alternating sides every 1-2 rows. Pull tight to close seam.'
    },
    {
      id: 'backstitch',
      name: 'Backstitch',
      icon: '⬅️',
      description: 'Strong, visible seam',
      instructions: 'Work from right to left, inserting needle one stitch back and emerging one stitch ahead.'
    },
    {
      id: 'kitchener_stitch',
      name: 'Kitchener Stitch',
      icon: '🪡',
      description: 'Invisible graft',
      instructions: 'Setup: Purl through first stitch on front needle, knit through first stitch on back needle. Then alternate: front - knit off, purl on; back - purl off, knit on.'
    },
    {
      id: 'three_needle_bindoff',
      name: 'Three-Needle Bind Off',
      icon: '🔗',
      description: 'Joins with seam',
      instructions: 'Hold pieces right sides together. Knit one stitch from each needle together, then bind off as normal.'
    },
    {
      id: 'other',
      name: 'Other Method',
      icon: '📝',
      description: 'Specify your own',
      instructions: ''
    }
  ];

  const handleEndingTypeSelect = (type) => {
    setEndingData(prev => ({ 
      ...prev, 
      type, 
      method: type === 'bind_off_all' || type === 'bind_off_partial' ? 'standard' : '',
      instructions: '' 
    }));
  };

  const handleMethodSelect = (method) => {
    const methodData = (endingData.type === 'bind_off_all' || endingData.type === 'bind_off_partial')
      ? bindOffMethods.find(m => m.id === method)
      : attachmentMethods.find(m => m.id === method);
    
    setEndingData(prev => ({ 
      ...prev, 
      method,
      instructions: methodData?.instructions || ''
    }));
  };

  const handleContinue = () => {
    if (step === 1) {
      setStep(2);
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    // Generate description for the ending step
    let description = '';
    const endingType = endingTypes.find(t => t.id === endingData.type);
    
    if (endingData.type === 'bind_off_all') {
      description = `Bind off all stitches`;
    } else if (endingData.type === 'bind_off_partial') {
      description = `Bind off ${endingData.stitchCount || 'some'} stitches`;
    } else if (endingData.type === 'put_on_holder') {
      description = `Put all stitches on holder for later use`;
    } else if (endingData.type === 'attach_to_piece') {
      description = `Attach to ${endingData.targetComponent || 'another piece'} using ${endingData.attachmentMethod || 'seaming'}`;
    } else if (endingData.type === 'continue_component') {
      description = `Continue to: ${endingData.customText || 'next section'}`;
    } else {
      description = endingData.customText || 'Custom ending';
    }

    // Create the ending step data in the new format
    const endingStep = {
      description,
      method: endingData.method,
      stitchCount: endingData.stitchCount,
      customText: endingData.customText,
      attachmentMethod: endingData.attachmentMethod,
      targetComponent: endingData.targetComponent,
      additionalDetails: endingData.additionalDetails,
      endingType: endingData.type
    };

    onComplete(endingStep);
  };

  const canContinue = () => {
    if (step === 1) {
      return endingData.type !== null;
    }
    
    // Step 2 validation
    if (endingData.type === 'continue_component' && !endingData.customText) return false;
    if (endingData.type === 'attach_to_piece' && (!endingData.targetComponent || !endingData.attachmentMethod)) return false;
    if (endingData.type === 'bind_off_partial' && !endingData.stitchCount) return false;
    
    return true;
  };

  const needsBindOffMethods = () => {
    return endingData.type === 'bind_off_all' || endingData.type === 'bind_off_partial';
  };

  return (
    <div className="min-h-screen bg-yarn-50">
      <div className="max-w-md mx-auto bg-white min-h-screen shadow-lg">
        
        {/* Header */}
        <div className="bg-sage-500 text-white px-6 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={step === 1 ? onBack : () => setStep(1)}
              className="text-white text-xl hover:bg-white hover:bg-opacity-20 rounded-full w-10 h-10 flex items-center justify-center transition-colors"
            >
              ←
            </button>
            <div className="flex-1">
              <h1 className="text-lg font-semibold">Finish Component</h1>
              <p className="text-sage-100 text-sm">
                Step {step} of 2: {step === 1 ? 'Ending Type' : 'Configuration'}
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 bg-yarn-50 space-y-6">
          
          {/* Step 1: How does it end? */}
          {step === 1 && (
            <>
              <div>
                <h2 className="text-xl font-semibold text-wool-700 mb-3">How does it end?</h2>
                <p className="text-wool-500 mb-4">Choose how {component?.name || 'this component'} finishes</p>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                {endingTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => handleEndingTypeSelect(type.id)}
                    className={`p-4 border-2 rounded-xl transition-all duration-200 text-center ${
                      endingData.type === type.id
                        ? 'border-sage-500 bg-sage-100 text-sage-700 shadow-sm'
                        : 'border-wool-200 bg-white text-wool-700 hover:border-sage-300 hover:bg-sage-50 hover:shadow-sm'
                    }`}
                  >
                    <div className="text-2xl mb-2">{type.icon}</div>
                    <div className="font-semibold text-sm mb-1">{type.name}</div>
                    <div className="text-xs opacity-75">{type.description}</div>
                  </button>
                ))}
              </div>
            </>
          )}

          {/* Step 2: Configuration Details */}
          {step === 2 && (
            <>
              <div>
                <h2 className="text-xl font-semibold text-wool-700 mb-3">Configure Details</h2>
                <p className="text-wool-500 mb-4">Set up your {endingTypes.find(t => t.id === endingData.type)?.name.toLowerCase()}</p>
              </div>

              <div className="space-y-6">
                {/* Bind Off Partial - Stitch Count */}
                {endingData.type === 'bind_off_partial' && (
                  <div>
                    <label className="block text-sm font-semibold text-wool-700 mb-3">
                      Number of Stitches to Bind Off
                    </label>
                    <input
                      type="number"
                      value={endingData.stitchCount}
                      onChange={(e) => setEndingData(prev => ({ ...prev, stitchCount: e.target.value }))}
                      placeholder="e.g., 20"
                      className="w-full border-2 border-wool-200 rounded-xl px-4 py-4 text-base focus:border-sage-500 focus:ring-0 transition-colors placeholder-wool-400 bg-white"
                    />
                  </div>
                )}

                {/* Bind Off Methods - for bind_off_all and bind_off_partial */}
                {needsBindOffMethods() && (
                  <div>
                    <label className="block text-sm font-semibold text-wool-700 mb-3">
                      Bind Off Method
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {bindOffMethods.map((method) => (
                        <button
                          key={method.id}
                          onClick={() => handleMethodSelect(method.id)}
                          className={`p-3 border-2 rounded-xl transition-all duration-200 text-center ${
                            endingData.method === method.id
                              ? 'border-yarn-500 bg-yarn-100 text-yarn-700 shadow-sm'
                              : 'border-wool-200 bg-white text-wool-700 hover:border-yarn-300 hover:bg-yarn-50'
                          }`}
                        >
                          <div className="text-lg mb-1">{method.icon}</div>
                          <div className="font-semibold text-xs mb-1">{method.name}</div>
                          <div className="text-xs opacity-75">{method.description}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Attach to Piece - Component and Method */}
                {endingData.type === 'attach_to_piece' && (
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-wool-700 mb-3">
                        Attach to Which Component?
                      </label>
                      <input
                        type="text"
                        value={endingData.targetComponent}
                        onChange={(e) => setEndingData(prev => ({ ...prev, targetComponent: e.target.value }))}
                        placeholder="e.g., Right Sleeve, Back Panel"
                        className="w-full border-2 border-wool-200 rounded-xl px-4 py-4 text-base focus:border-sage-500 focus:ring-0 transition-colors placeholder-wool-400 bg-white"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-wool-700 mb-3">
                        Attachment Method
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        {attachmentMethods.map((method) => (
                          <button
                            key={method.id}
                            onClick={() => {
                              setEndingData(prev => ({ ...prev, attachmentMethod: method.id, instructions: method.instructions }));
                            }}
                            className={`p-3 border-2 rounded-xl transition-all duration-200 text-center ${
                              endingData.attachmentMethod === method.id
                                ? 'border-yarn-500 bg-yarn-100 text-yarn-700 shadow-sm'
                                : 'border-wool-200 bg-white text-wool-700 hover:border-yarn-300 hover:bg-yarn-50'
                            }`}
                          >
                            <div className="text-lg mb-1">{method.icon}</div>
                            <div className="font-semibold text-xs mb-1">{method.name}</div>
                            <div className="text-xs opacity-75">{method.description}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* Continue Component - Description */}
                {endingData.type === 'continue_component' && (
                  <div>
                    <label className="block text-sm font-semibold text-wool-700 mb-3">
                      Continue to What?
                    </label>
                    <input
                      type="text"
                      value={endingData.customText}
                      onChange={(e) => setEndingData(prev => ({ ...prev, customText: e.target.value }))}
                      placeholder="e.g., sleeve decreases, neckline shaping"
                      className="w-full border-2 border-wool-200 rounded-xl px-4 py-4 text-base focus:border-sage-500 focus:ring-0 transition-colors placeholder-wool-400 bg-white"
                    />
                  </div>
                )}

                {/* Other - Custom Description */}
                {endingData.type === 'other' && (
                  <div>
                    <label className="block text-sm font-semibold text-wool-700 mb-3">
                      Describe Your Ending Method
                    </label>
                    <input
                      type="text"
                      value={endingData.customText}
                      onChange={(e) => setEndingData(prev => ({ ...prev, customText: e.target.value }))}
                      placeholder="Describe how this component ends..."
                      className="w-full border-2 border-wool-200 rounded-xl px-4 py-4 text-base focus:border-sage-500 focus:ring-0 transition-colors placeholder-wool-400 bg-white"
                    />
                  </div>
                )}

                {/* Instructions Display */}
                {endingData.instructions && (
                  <div className="bg-yarn-100 border-2 border-yarn-200 rounded-xl p-4">
                    <h4 className="text-sm font-semibold text-yarn-700 mb-2">💡 Instructions</h4>
                    <p className="text-sm text-yarn-600 text-left">{endingData.instructions}</p>
                  </div>
                )}

                {/* Additional Details - Always Available */}
                <div>
                  <label className="block text-sm font-semibold text-wool-700 mb-3">
                    Additional Details (optional)
                  </label>
                  <textarea
                    value={endingData.additionalDetails}
                    onChange={(e) => setEndingData(prev => ({ ...prev, additionalDetails: e.target.value }))}
                    placeholder="Add any special notes or modifications..."
                    rows={3}
                    className="w-full border-2 border-wool-200 rounded-xl px-4 py-4 text-base focus:border-sage-500 focus:ring-0 transition-colors placeholder-wool-400 bg-white resize-none"
                  />
                </div>
              </div>
            </>
          )}

          {/* Navigation */}
          <div className="pt-6 border-t border-wool-200">
            <div className="flex gap-3">
              <button
                onClick={step === 1 ? onBack : () => setStep(1)}
                className="flex-1 bg-wool-100 text-wool-700 py-4 px-4 rounded-xl font-semibold text-base hover:bg-wool-200 transition-colors border border-wool-200"
              >
                {step === 1 ? 'Cancel' : '← Back'}
              </button>
              <button
                onClick={handleContinue}
                disabled={!canContinue()}
                className="flex-2 bg-yarn-600 text-white py-4 px-6 rounded-xl font-semibold text-base hover:bg-yarn-700 disabled:bg-wool-400 disabled:cursor-not-allowed transition-colors shadow-sm"
                style={{flexGrow: 2}}
              >
                {step === 1 ? 'Continue →' : '🏁 Finish Component'}
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ComponentEndingWizard;