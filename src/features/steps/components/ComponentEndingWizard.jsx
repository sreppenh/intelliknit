import React, { useState } from 'react';
import EndingTypeSelector from './ending-wizard/EndingTypeSelector';
import BindOffConfig from './ending-wizard/BindOffConfig';
import AttachmentConfig from './ending-wizard/AttachmentConfig';
import ContinueConfig from './ending-wizard/ContinueConfig';
import OtherEndingConfig from './ending-wizard/OtherEndingConfig';


const ComponentEndingWizard = ({ component, onBack, onComplete }) => {
  const [step, setStep] = useState(1);
  const [endingData, setEndingData] = useState({
    type: null,
    method: 'standard', // Default to standard bind off
    targetComponent: '',
    customText: '',
    customMethod: ''
  });

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
            <EndingTypeSelector 
              onTypeSelect={handleEndingTypeSelect}
              component={component}
            />
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
          
          {/* Render appropriate configuration component */}
          {endingData.type === 'bind_off_all' && (
            <BindOffConfig 
              endingData={endingData}
              setEndingData={setEndingData}
            />
          )}

          {endingData.type === 'attach_to_piece' && (
            <AttachmentConfig 
              endingData={endingData}
              setEndingData={setEndingData}
            />
          )}

          {endingData.type === 'continue_component' && (
            <ContinueConfig 
              endingData={endingData}
              setEndingData={setEndingData}
            />
          )}

          {endingData.type === 'other' && (
            <OtherEndingConfig 
              endingData={endingData}
              setEndingData={setEndingData}
            />
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