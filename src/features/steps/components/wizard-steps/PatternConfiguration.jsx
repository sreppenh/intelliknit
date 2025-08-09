import React, { useEffect } from 'react';
import { CastOnConfig, BindOffConfig, BasicPatternConfig, ColorworkPatternConfig, RowByRowPatternConfig } from '../pattern-configs';
import { isAdvancedRowByRowPattern } from '../../../../shared/utils/stepDisplayUtils';

const PatternConfiguration = ({ wizardData, updateWizardData, navigation, construction }) => {
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
            construction={construction}
          />
        );

      case 'Bind Off':
        return (
          <BindOffConfig
            wizardData={wizardData}
            updateWizardData={updateWizardData}
            construction={construction}
          />
        );

      case 'Colorwork':
        return (
          <ColorworkPatternConfig
            wizardData={wizardData}
            updateWizardData={updateWizardData}
            construction={construction}
          />
        );

      default:
        // ===== UPDATED: Use utility function to determine routing =====
        if (isAdvancedRowByRowPattern(pattern)) {
          return (
            <RowByRowPatternConfig
              wizardData={wizardData}
              updateWizardData={updateWizardData}
              construction={construction}
            />
          );
        }

        return (
          <BasicPatternConfig
            wizardData={wizardData}
            updateWizardData={updateWizardData}
            construction={construction}
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