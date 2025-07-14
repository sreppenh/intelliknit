import React, { useState } from 'react';
import ShapingTypeSelector from './shaping-wizard/ShapingTypeSelector';
import EvenDistributionConfig from './shaping-wizard/EvenDistributionConfig';
import PhaseConfig from './shaping-wizard/PhaseConfig';

const ShapingWizard = ({ wizardData, updateWizardData, currentStitches, construction, onBack, setConstruction, component }) => {
  const [step, setStep] = useState(1);
  const [shapingData, setShapingData] = useState({
    type: null,
    config: {},
    description: ''
  });

  const handleShapingTypeSelect = (type) => {
    setShapingData(prev => ({ ...prev, type }));
    
    // Some types might auto-complete (future feature)
    // For now, all types go to step 2
    setStep(2);
  };

  const handleConfigComplete = (config) => {
    // Update wizard data with shaping configuration
    updateWizardData('shapingConfig', {
      type: shapingData.type,
      config: config,
      description: shapingData.description
    });
    updateWizardData('hasShaping', true);
    
    // Navigate back to main wizard flow
    onBack();
  };

  const renderConfigStep = () => {
    switch (shapingData.type) {
      case 'even_distribution':
        return (
          <EvenDistributionConfig
            shapingData={shapingData}
            setShapingData={setShapingData}
            currentStitches={currentStitches}
            construction={construction}
            onComplete={handleConfigComplete}
            onBack={() => setStep(1)}
          />
        );
      
      case 'phases':
        return (
          <PhaseConfig
            shapingData={shapingData}
            setShapingData={setShapingData}
            currentStitches={currentStitches}
            construction={construction}
            onComplete={handleConfigComplete}
            onBack={() => setStep(1)}
          />
        );
      
      case 'single_row_repeat':
        // Future implementation
        return (
          <div className="p-6 text-center">
            <div className="text-4xl mb-4">🚧</div>
            <h3 className="text-lg font-semibold text-wool-700 mb-2">Coming Soon!</h3>
            <p className="text-wool-500 mb-4">Single row repeat shaping is in development.</p>
            <button 
              onClick={() => setStep(1)}
              className="btn-tertiary btn-sm"
            >
              Back to Types
            </button>
          </div>
        );
      
      case 'marker_based':
        // Future implementation  
        return (
          <div className="p-6 text-center">
            <div className="text-4xl mb-4">🚧</div>
            <h3 className="text-lg font-semibold text-wool-700 mb-2">Coming Soon!</h3>
            <p className="text-wool-500 mb-4">Marker-based shaping is in development.</p>
            <button 
              onClick={() => setStep(1)}
              className="btn-tertiary btn-sm"
            >
              Back to Types
            </button>
          </div>
        );
      
      default:
        return null;
    }
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
              <h1 className="text-lg font-semibold">
                {step === 1 ? 'Shaping Type' : 'Configure Shaping'}
              </h1>
              <p className="text-sage-100 text-sm">
                {step === 1 ? 'Choose your shaping method' : 'Set up your shaping details'}
              </p>
            </div>
          </div>
        </div>

        {/* Construction info bar - COPIED FROM YOUR WizardHeader.jsx */}
        <div className="px-6 py-3 bg-sage-100 border-b border-sage-200">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
              <span className="font-medium text-sage-700">Construction:</span>
              <div className="bg-sage-200 border border-sage-300 rounded-md p-0.5">
                <div className="grid grid-cols-2 gap-1">
                  <button
                    onClick={() => setConstruction && setConstruction('flat')}
                    className={`px-2 py-1 rounded text-xs font-medium transition-all duration-200 ${
                      construction === 'flat'
                        ? 'bg-white text-sage-700 shadow-sm'
                        : 'text-sage-600 hover:text-sage-800'
                    }`}
                  >
                    Flat
                  </button>
                  
                  <button
                    onClick={() => setConstruction && setConstruction('round')}
                    className={`px-2 py-1 rounded text-xs font-medium transition-all duration-200 ${
                      construction === 'round'
                        ? 'bg-white text-sage-700 shadow-sm'
                        : 'text-sage-600 hover:text-sage-800'
                    }`}
                  >
                    Round
                  </button>
                </div>
              </div>
            </div>
            
            <div className="text-sage-600 text-xs">
              {currentStitches} stitches • {component?.name}
            </div>
          </div>
        </div>

        <div className="bg-yarn-50 min-h-screen">
          {step === 1 ? (
            <ShapingTypeSelector 
              onTypeSelect={handleShapingTypeSelect}
              currentStitches={currentStitches}
            />
          ) : (
            renderConfigStep()
          )}
        </div>
      </div>
    </div>
  );
};

export default ShapingWizard;