// src/features/steps/components/wizard-steps/PatternConfiguration.jsx
import React from 'react';
import {
  CastOnConfig,
  BindOffConfig,
  BasicPatternConfig,
  ColorworkPatternConfig,
  RowByRowPatternConfig,
  DescriptionPatternConfig, // ✨ NEW
  StripesConfig
} from '../pattern-configs';
import { isAdvancedRowByRowPattern } from '../../../../shared/utils/stepDisplayUtils';


const PatternConfiguration = ({
  wizardData,
  updateWizardData,
  navigation,
  construction,
  currentStitches,
  project,
  mode
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
            <RowByRowPatternConfig
              wizardData={wizardData}
              updateWizardData={updateWizardData}
              construction={construction}
              currentStitches={currentStitches}
              project={project}
              mode={mode}
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
        if (isAdvancedRowByRowPattern(pattern)) {
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
        }

        // Basic patterns
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