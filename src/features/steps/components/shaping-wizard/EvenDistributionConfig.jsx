import React, { useState } from 'react';

const EvenDistributionConfig = ({ 
  shapingData, 
  setShapingData, 
  currentStitches, 
  construction,
  onComplete,
  onBack 
}) => {
  const [config, setConfig] = useState({
    action: 'decrease',
    amount: 6,
    description: ''
  });

  // Even distribution calculator (simplified - always uses construction from header)
  const calculateEvenDistribution = () => {
    const { action, amount } = config;
    
    const targetStitches = action === 'increase' ? currentStitches + amount : currentStitches - amount;
    const stitchChange = targetStitches - currentStitches;
    const numChanges = Math.abs(stitchChange);
    
    if (numChanges === 0) return { instruction: 'No changes needed', sections: [] };
    
    // Error checking for impossible scenarios
    if (targetStitches <= 0) {
      return { 
        error: `Cannot end with ${targetStitches} stitches - must be at least 1 stitch`,
        instruction: '',
        sections: []
      };
    }
    
    // Calculate sections: circular = numChanges, flat = numChanges + 1
    const numSections = construction === 'round' ? numChanges : numChanges + 1;
    const totalStitchesInSections = construction === 'round' ? currentStitches : targetStitches;
    
    // Check if we have enough stitches for the sections
    if (totalStitchesInSections < numSections) {
      return {
        error: `Impossible: ${numChanges} ${action}s would create ${numSections} sections, but only ${totalStitchesInSections} stitches available`,
        instruction: '',
        sections: []
      };
    }
    
    const avgSectionSize = totalStitchesInSections / numSections;
    
    // Check if sections would be too small
    if (avgSectionSize < 1) {
      return {
        error: `Impossible: Each section would need ${avgSectionSize.toFixed(1)} stitches - must be at least 1 stitch per section`,
        instruction: '',
        sections: []
      };
    }
    
    // Create sections with varying sizes
    const sections = [];
    const baseSize = Math.floor(avgSectionSize);
    const remainder = totalStitchesInSections % numSections;
    
    for (let i = 0; i < numSections; i++) {
      const sectionSize = i < remainder ? baseSize + 1 : baseSize;
      sections.push(sectionSize);
    }
    
    // Generate instruction
    const changeType = stitchChange > 0 ? 'inc' : 'K2tog';
    const parts = [];
    
    for (let i = 0; i < sections.length; i++) {
      if (sections[i] > 0) {  // Only add if section has stitches
        parts.push(`K${sections[i]}`);
      }
      if (i < sections.length - 1 || construction === 'round') {
        parts.push(changeType);
      }
    }
    
    return {
      instruction: parts.join(', '),
      sections,
      startingStitches: currentStitches,
      endingStitches: targetStitches,
      changeCount: numChanges,
      construction
    };
  };

  const result = calculateEvenDistribution();

  const handleComplete = () => {
    onComplete({
      ...config,
      construction, // Use construction from header
      calculation: result
    });
  };

  return (
    <div className="p-6 stack-lg">
      {/* Page Header */}
      <div>
        <h2 className="text-xl font-semibold text-wool-700 mb-3">⚖️ Even Distribution</h2>
        <p className="text-wool-500 mb-4">Spread increases or decreases evenly across the row</p>
      </div>

      {/* Action Selection - Radio button style with integrated input */}
      <div>
        <div className="space-y-3">
          <label className={`block cursor-pointer p-4 rounded-xl border-2 transition-all duration-200 ${
            config.action === 'decrease'
              ? 'border-sage-500 bg-sage-100 text-sage-700 shadow-sm'
              : 'border-wool-200 bg-white text-wool-700 hover:border-sage-300 hover:bg-sage-50'
          }`}>
            <div className="flex items-start gap-4">
              <input
                type="radio"
                name="action_type"
                value="decrease"
                checked={config.action === 'decrease'}
                onChange={() => setConfig(prev => ({ ...prev, action: 'decrease' }))}
                className="w-4 h-4 text-sage-600 mt-1"
              />
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="text-2xl">📉</div>
                  <div className="text-left">
                    <div className="font-semibold text-base">Decrease</div>
                    <div className="text-sm opacity-75">Remove stitches evenly across row</div>
                  </div>
                </div>
                
                {config.action === 'decrease' && (
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={config.amount}
                        onChange={(e) => setConfig(prev => ({ ...prev, amount: parseInt(e.target.value) || 0 }))}
                        className="w-20 border-2 border-sage-300 rounded-lg px-3 py-2 text-base focus:border-sage-500 focus:ring-0 transition-colors bg-white"
                        placeholder="6"
                      />
                      <span className="text-sm text-sage-700">stitches</span>
                    </div>
                    
                    {config.amount > 0 && (
                      <div className="text-xs text-sage-600 bg-sage-50 rounded-lg p-2">
                        <strong>Result:</strong> {currentStitches} → {currentStitches - config.amount} stitches
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </label>

          <label className={`block cursor-pointer p-4 rounded-xl border-2 transition-all duration-200 ${
            config.action === 'increase'
              ? 'border-sage-500 bg-sage-100 text-sage-700 shadow-sm'
              : 'border-wool-200 bg-white text-wool-700 hover:border-sage-300 hover:bg-sage-50'
          }`}>
            <div className="flex items-start gap-4">
              <input
                type="radio"
                name="action_type"
                value="increase"
                checked={config.action === 'increase'}
                onChange={() => setConfig(prev => ({ ...prev, action: 'increase' }))}
                className="w-4 h-4 text-sage-600 mt-1"
              />
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="text-2xl">📈</div>
                  <div className="text-left">
                    <div className="font-semibold text-base">Increase</div>
                    <div className="text-sm opacity-75">Add stitches evenly across row</div>
                  </div>
                </div>
                
                {config.action === 'increase' && (
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={config.amount}
                        onChange={(e) => setConfig(prev => ({ ...prev, amount: parseInt(e.target.value) || 0 }))}
                        className="w-20 border-2 border-sage-300 rounded-lg px-3 py-2 text-base focus:border-sage-500 focus:ring-0 transition-colors bg-white"
                        placeholder="8"
                      />
                      <span className="text-sm text-sage-700">stitches</span>
                    </div>
                    
                    {config.amount > 0 && (
                      <div className="text-xs text-sage-600 bg-sage-50 rounded-lg p-2">
                        <strong>Result:</strong> {currentStitches} → {currentStitches + config.amount} stitches
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </label>
        </div>
      </div>

      {/* Optional Description */}
      <div>
        <input
          type="text"
          value={config.description}
          onChange={(e) => setConfig(prev => ({ ...prev, description: e.target.value }))}
          className="input-field"
          placeholder="Notes (optional) - e.g., 'for crown decreases'"
        />
      </div>

      {/* Preview */}
      {result.error ? (
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
          <h4 className="text-sm font-semibold text-red-700 mb-2">⚠️ Error</h4>
          <div className="text-sm text-red-600">
            {result.error}
          </div>
        </div>
      ) : result.instruction && (
        <div className="card-info">
          <h4 className="text-sm font-semibold text-lavender-700 mb-3">Preview</h4>
          
          <div className="space-y-2 text-sm">
            <div className="text-lavender-700">
              <span className="font-medium">Instruction:</span> {result.instruction}
            </div>
            <div className="text-lavender-600">
              {result.startingStitches} stitches → {result.endingStitches} stitches 
              ({result.changeCount} {config.action}s, {result.construction})
            </div>
            {result.sections && (
              <div className="text-lavender-600">
                <span className="font-medium">Sections:</span> {result.sections.join(', ')} stitches
              </div>
            )}
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex gap-3 pt-4">
        <button
          onClick={onBack}
          className="btn-tertiary flex-1"
        >
          Back
        </button>
        <button
          onClick={handleComplete}
          disabled={!result.instruction || result.changeCount === 0 || result.error}
          className="btn-primary flex-1"
        >
          Add Step
        </button>
      </div>
    </div>
  );
};

export default EvenDistributionConfig;