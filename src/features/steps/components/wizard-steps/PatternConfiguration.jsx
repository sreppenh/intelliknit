import React from 'react';
import { CastOnConfig, BindOffConfig, BasicPatternConfig, ColorworkPatternConfig, RowByRowPatternConfig, StripesConfig } from '../pattern-configs'; import { isAdvancedRowByRowPattern } from '../../../../shared/utils/stepDisplayUtils';


const PatternConfiguration = ({ wizardData, updateWizardData, navigation,
  construction, currentStitches, project, mode }) => {
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
            mode={mode}
          />
        );

      case 'Bind Off':
        return (
          <BindOffConfig
            wizardData={wizardData}
            updateWizardData={updateWizardData}
            construction={construction}
            mode={mode}
          />
        );

      case 'Colorwork':
        return (
          <ColorworkPatternConfig
            wizardData={wizardData}
            updateWizardData={updateWizardData}
            construction={construction}
            mode={mode}
          />
        );

      // 🎯 ADD THIS:
      case 'Stripes':
        return (
          <StripesConfig
            wizardData={wizardData}
            updateWizardData={updateWizardData}
            construction={construction}
            project={project}
            mode={mode}
          />
        );

      case 'Custom':
        return (
          <RowByRowPatternConfig
            wizardData={wizardData}
            updateWizardData={updateWizardData}
            construction={construction}
            currentStitches={currentStitches}
            project={project}
            mode={mode}
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
              currentStitches={currentStitches}  // this may be a lie
              // currentStitches={wizard.currentStitches}  // ✅ CHANGE: was {wizard.currentStitches}

              project={project}
              mode={mode}
            />
          );
        }

        return (
          <BasicPatternConfig
            wizardData={wizardData}
            updateWizardData={updateWizardData}
            construction={construction}
            mode={mode}
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