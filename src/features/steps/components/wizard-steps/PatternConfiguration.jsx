import React, { useEffect } from 'react';
import { CastOnConfig, BindOffConfig, BasicPatternConfig } from '../pattern-configs';

const PatternConfiguration = ({ wizardData, updateWizardData, navigation }) => {
  const { pattern } = wizardData.stitchPattern;

  // Basic patterns that should skip this step
  const basicPatterns = [
    'Stockinette', 'Garter', 'Reverse Stockinette',
    '1x1 Rib', '2x2 Rib', '3x3 Rib', '2x1 Rib', '1x1 Twisted Rib', '2x2 Twisted Rib',
    'Seed Stitch', 'Moss Stitch', 'Double Seed', 'Basketweave'
  ];

  // Auto-advance for basic patterns
  useEffect(() => {
    if (pattern && basicPatterns.includes(pattern) && navigation) {
      // Set hasShaping to false for basic patterns and advance
      updateWizardData('hasShaping', false);
      // Small delay to let React complete the render
      setTimeout(() => {
        navigation.nextStep();
      }, 100);
    }
  }, [pattern, navigation]);

  if (!pattern) {
    return (
      <div className="text-center py-8">
        <div className="text-4xl mb-4">❌</div>
        <p className="text-wool-600">No pattern selected</p>
      </div>
    );
  }

  // Show loading state for basic patterns while auto-advancing
  if (basicPatterns.includes(pattern)) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="text-4xl mb-3">🧶</div>
          <h2 className="text-xl font-semibold text-wool-700 mb-2">
            Setting up {pattern}...
          </h2>
          <p className="text-wool-500">Preparing your pattern</p>
        </div>
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