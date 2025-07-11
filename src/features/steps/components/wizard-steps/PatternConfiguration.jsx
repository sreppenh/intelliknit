import React from 'react';
import { CastOnConfig, BindOffConfig, BasicPatternConfig } from '../pattern-configs';

const PatternConfiguration = ({ wizardData, updateWizardData }) => {
  const { pattern } = wizardData.stitchPattern;

  if (!pattern) {
    return (
      <div className="text-center py-8">
        <div className="text-4xl mb-4">❌</div>
        <p className="text-wool-600">No pattern selected</p>
      </div>
    );
  }

  const renderPatternConfig = () => {
    switch (pattern) {
      case 'Cast On':
        return (
          <CastOnConfig 
            wizardData={wizardData}
            updateWizardData={updateWizardData}
          />
        );
      
      case 'Bind Off':
        return (
          <BindOffConfig 
            wizardData={wizardData}
            updateWizardData={updateWizardData}
          />
        );
      
      default:
        return (
          <BasicPatternConfig 
            wizardData={wizardData}
            updateWizardData={updateWizardData}
          />
        );
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-wool-700 mb-3">Configure {pattern}</h2>
        <p className="text-wool-500 mb-4">Set up the details for your {pattern.toLowerCase()}</p>
      </div>

      {renderPatternConfig()}
    </div>
  );
};

export default PatternConfiguration;