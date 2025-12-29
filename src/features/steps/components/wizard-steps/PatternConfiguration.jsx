// src/features/steps/components/wizard-steps/PatternConfiguration.jsx
import React from 'react';
import {
  CastOnConfig,
  BindOffConfig,
  BasicPatternConfig,
  ColorworkPatternConfig,
  DescriptionPatternConfig, // ✨ NEW
  StripesConfig
} from '../pattern-configs';
import SimpleRowBuilder from '../pattern-configs/SimpleRowBuilder';

const PatternConfiguration = ({
  wizardData,
  updateWizardData,
  navigation,
  construction,
  currentStitches,
  project,
  mode,
  startingSide = 'RS'  // ✅ ADD THIS LINE
}) => {
  const { pattern, entryMode } = wizardData.stitchPattern;

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

      // ✨ NEW: Route Custom pattern based on entryMode
      case 'Custom':
        if (entryMode === 'row_by_row') {
          return (
            <SimpleRowBuilder    // ← Direct call, no wrapper!
              wizardData={wizardData}
              updateWizardData={updateWizardData}
              construction={construction}
              currentStitches={currentStitches}
              startingSide={startingSide}  // ✅ ADD THIS LINE
            />
          );
        } else if (entryMode === 'description') {
          return (
            <DescriptionPatternConfig
              wizardData={wizardData}
              updateWizardData={updateWizardData}
              construction={construction}
              mode={mode}
            />
          );
        } else {
          // No entry mode selected yet - shouldn't happen but handle gracefully
          return (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">⚠️</div>
              <p className="text-wool-600">Please select an entry method</p>
            </div>
          );
        }

      default:
        // For other advanced patterns (backward compatibility)

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
      </div>

      {renderPatternConfig()}
    </div>
  );
};

export default PatternConfiguration;