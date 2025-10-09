import React from 'react';
import IncrementInput from '../../../../shared/components/IncrementInput';
import { needsDescriptionInput, needsRowInput, getPatternConfigurationTips } from '../../../../shared/utils/stepDisplayUtils';

const BasicPatternConfig = ({ wizardData, updateWizardData, construction, mode = 'create' }) => {
  // 🔄 REPLACED: Hardcoded arrays with centralized functions
  // OLD: ['Fair Isle', 'Intarsia', 'Stripes'].includes(wizardData.stitchPattern.pattern)
  const needsRowInputValue = needsRowInput(wizardData.stitchPattern.pattern);
  const needsDescriptionValue = needsDescriptionInput(wizardData.stitchPattern.pattern);
  const isOtherPattern = wizardData.stitchPattern.pattern === 'Other';

  // Check if this is a Basic/Rib/Textured pattern that can have optional repeats
  const canHaveOptionalRepeats = () => {
    if (!wizardData.stitchPattern.category) return false;
    return ['basic', 'rib', 'textured'].includes(wizardData.stitchPattern.category);
  };

  // 🆕 NEW: Get configuration tips from centralized config
  const configTips = getPatternConfigurationTips(wizardData.stitchPattern.pattern);

  return (
    <div className="stack-lg">
      {/* Pattern Description - For Lace, Cable, Colorwork patterns */}
      {needsDescriptionValue && (
        <div>
          <label className="form-label">
            Pattern Description
          </label>
          <textarea
            value={wizardData.stitchPattern.customText || ''}
            onChange={(e) => updateWizardData('stitchPattern', { customText: e.target.value })}
            placeholder={`Describe your ${wizardData.stitchPattern.pattern.toLowerCase()}...`}
            rows={3}
            className="input-field-lg resize-none"
          />
          <label className="form-help">
            Describe the pattern sequence, special techniques, or any important notes
          </label>
        </div>
      )}

      {/* Lace/Cable/Colorwork - Required row input */}
      {needsRowInputValue && (
        <div>
          <label className="form-label">
            Rows in Pattern
          </label>
          <IncrementInput
            value={wizardData.stitchPattern.rowsInPattern}
            onChange={(value) => updateWizardData('stitchPattern', { rowsInPattern: value })}
            label="rows in pattern"
            unit="rows"
            construction={construction}
          />
          <label className="form-help">
            Number of {construction === 'round' ? 'rounds' : 'rows'} in one complete pattern repeat
          </label>
        </div>
      )}

      {/* Stitch Change per Repeat - For patterns with rowsInPattern */}
      {(needsRowInputValue || (canHaveOptionalRepeats() && wizardData.stitchPattern.rowsInPattern)) && (
        <div>
          <label className="form-label">
            Stitch Change per Repeat
          </label>
          <IncrementInput
            value={wizardData.stitchPattern.stitchChangePerRepeat || 0}
            onChange={(value) => updateWizardData('stitchPattern', { stitchChangePerRepeat: value })}
            label="stitch change"
            unit="stitches"
            construction={construction}
            min={-20}
            max={20}
            allowNegative={true}
          />
          <label className="form-help">
            Stitches gained (+) or lost (-) per repeat. Use 0 for stitch-neutral patterns (most common).
          </label>
        </div>
      )}

      {/* Basic/Rib/Textured - Optional repeat input */}
      {canHaveOptionalRepeats() && !needsRowInputValue && (
        <div>
          <label className="form-label">
            Pattern Repeat (optional)
          </label>
          <input
            type="number"
            value={wizardData.stitchPattern.rowsInPattern}
            onChange={(e) => updateWizardData('stitchPattern', { rowsInPattern: e.target.value })}
            placeholder="e.g., 6 for stockinette with bobble every 6th row"
            min="1"
            className="w-full border-2 border-wool-200 rounded-xl px-4 py-4 text-base focus:border-sage-500 focus:ring-0 transition-colors placeholder-wool-400 bg-white"
          />
          <p className="text-xs text-wool-500 mt-2">
            Leave blank for simple patterns, or enter the number of {construction === 'round' ? 'rounds' : 'rows'} in your pattern repeat
          </p>
        </div>
      )}

      {/* Other pattern input */}
      {isOtherPattern && (
        <div>
          <label className="form-label">
            Describe Your Pattern *
          </label>
          <textarea
            value={wizardData.stitchPattern.customText}
            onChange={(e) => updateWizardData('stitchPattern', { customText: e.target.value })}
            placeholder="Describe your stitch pattern..."
            rows={3}
            className="input-field-lg resize-none"
          />
        </div>
      )}

      {/* 🔄 REPLACED: Hardcoded pattern tips with centralized configuration */}
      {needsDescriptionValue && configTips.length > 0 && (
        <div className="bg-yarn-100 border-2 border-yarn-200 rounded-xl p-4">
          <h4 className="text-sm font-semibold text-yarn-700 mb-2">💡 Pattern Tips</h4>
          <div className="text-sm text-yarn-600 space-y-1">
            {configTips.map((tip, index) => (
              <div key={index}>• {tip}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BasicPatternConfig;