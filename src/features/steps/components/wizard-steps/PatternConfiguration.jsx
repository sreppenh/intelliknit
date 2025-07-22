import React, { useEffect } from 'react';
import { CastOnConfig, BindOffConfig, BasicPatternConfig } from '../pattern-configs';

const PatternConfiguration = ({ wizardData, updateWizardData, navigation }) => {
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
    <div className="stack-lg">
      <div>
        <h2 className="content-header-primary">Configure {pattern}</h2>
        {/*  <p className="content-subheader">Set up the details for your {pattern.toLowerCase()}</p> */}
      </div>

      {renderPatternConfig()}
    </div>
  );
};

export default PatternConfiguration;