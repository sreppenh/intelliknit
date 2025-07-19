import React from 'react';
import IncrementInput from '../../../../shared/components/IncrementInput';
import { getConstructionTerms } from '../../../../shared/utils/ConstructionTerminology';

const BasicPatternConfig = ({ wizardData, updateWizardData, construction }) => {
  const needsRowInput = ['Lace Pattern', 'Cable Pattern', 'Fair Isle', 'Intarsia', 'Stripes', 'Custom pattern'].includes(wizardData.stitchPattern.pattern);
  const needsDescription = ['Lace Pattern', 'Cable Pattern', 'Fair Isle', 'Intarsia', 'Stripes'].includes(wizardData.stitchPattern.pattern);
  const isCustomPattern = wizardData.stitchPattern.pattern === 'Custom pattern';
  const isOtherPattern = wizardData.stitchPattern.pattern === 'Other';

  // Check if this is a Basic/Rib/Textured pattern that can have optional repeats
  const canHaveOptionalRepeats = () => {
    if (!wizardData.stitchPattern.category) return false;
    return ['basic', 'rib', 'textured'].includes(wizardData.stitchPattern.category);
  };

  return (
    <div className="stack-lg">
      {/* Pattern Description - For Lace, Cable, Colorwork patterns */}
      {needsDescription && (
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

      {/* Custom pattern input */}
      {isCustomPattern && (
        <div>
          <label className="form-label">
            Pattern Description
          </label>
          <textarea
            value={wizardData.stitchPattern.customText}
            onChange={(e) => updateWizardData('stitchPattern', { customText: e.target.value })}
            placeholder="e.g., '5 rows stockinette, 1 bobble row'"
            rows={3}
            className="input-field-lg resize-none"
          />
        </div>
      )}


      {/* Lace/Cable/Colorwork - Required row input */}
      {needsRowInput && (
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

      {/* Basic/Rib/Textured - Optional repeat input */}
      {canHaveOptionalRepeats() && !needsRowInput && (
        <div>
          <label className="block text-sm font-semibold text-wool-700 mb-3">
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
          <label className="block text-sm font-semibold text-wool-700 mb-3">
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



      {/* Helper info for complex patterns */}
      {needsDescription && (
        <div className="bg-yarn-100 border-2 border-yarn-200 rounded-xl p-4">
          <h4 className="text-sm font-semibold text-yarn-700 mb-2">💡 Pattern Tips</h4>
          <div className="text-sm text-yarn-600 space-y-1">
            {wizardData.stitchPattern.pattern === 'Lace Pattern' && (
              <>
                <div>• Include key techniques: YO, K2tog, SSK, etc.</div>
                <div>• Note any edge stitches or pattern placement</div>
                <div>• Mention if it's a chart-based pattern</div>
              </>
            )}
            {wizardData.stitchPattern.pattern === 'Stripes' && (
              <>
                <div>• List colors and row counts: "2 rows Navy, 4 rows Cream"</div>
                <div>• Note any special color change techniques</div>
                <div>• Include total repeat if complex sequence</div>
              </>
            )}
            {wizardData.stitchPattern.pattern === 'Cable Pattern' && (
              <>
                <div>• Describe cable crossings and directions</div>
                <div>• Note cable needle size if specific</div>
                <div>• Include any background stitches (reverse stockinette, etc.)</div>
              </>
            )}
            {(wizardData.stitchPattern.pattern === 'Fair Isle' || wizardData.stitchPattern.pattern === 'Intarsia') && (
              <>
                <div>• List color names or codes</div>
                <div>• Describe the motif or pattern sequence</div>
                <div>• Note any chart references</div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BasicPatternConfig;