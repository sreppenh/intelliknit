// src/features/steps/components/shaping-wizard/SequentialPhasesModal.jsx
import React, { useState, useEffect } from 'react';
import IncrementInput from '../../../../shared/components/IncrementInput';
import { PhaseCalculationService } from '../../../../shared/utils/PhaseCalculationService';

const SequentialPhasesModal = ({
  isOpen,
  onClose,
  onSave,
  phaseTypes,
  editingPhase,
  currentStitches,
  construction,
  phases
}) => {
  const [selectedType, setSelectedType] = useState(null);
  const [phaseConfig, setPhaseConfig] = useState({});

  // Initialize state when overlay opens
  useEffect(() => {
    if (isOpen) {
      if (editingPhase) {
        // Editing existing phase
        setSelectedType(editingPhase.type);
        setPhaseConfig(editingPhase.config || {});
      } else {
        // Adding new phase
        setSelectedType(null);
        setPhaseConfig({});
      }
    }
  }, [isOpen, editingPhase]);

  // Handle ESC key and backdrop click
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isOpen, onClose]);

  const handleBackdropClick = (event) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  // Handle type selection
  const handleTypeSelect = (typeId) => {
    setSelectedType(typeId);

    // Initialize default config based on type
    const defaultConfigs = {
      decrease: { amount: 1, position: 'both_ends', frequency: 2, times: 1 },
      increase: { amount: 1, position: 'both_ends', frequency: 2, times: 1 },
      setup: { rows: 2 },
      bind_off: { amount: 1, frequency: 1 }
    };

    setPhaseConfig(defaultConfigs[typeId] || {});
  };

  // Handle config changes
  const handleConfigChange = (field, value) => {
    setPhaseConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle save
  const handleSave = () => {
    if (!selectedType) return;

    onSave({
      type: selectedType,
      config: phaseConfig
    });
  };

  // Calculate available stitches for this phase
  const getAvailableStitches = () => {
    let runningStitches = currentStitches;

    // Calculate stitches consumed by previous phases
    for (const phase of phases) {
      if (editingPhase && phase.id === editingPhase.id) break;
      const stitchChange = PhaseCalculationService.calculatePhaseStitchChange(phase);
      runningStitches += stitchChange;
    }

    return runningStitches;
  };

  const availableStitches = getAvailableStitches();

  // Validation
  const canSave = () => {
    if (!selectedType) return false;

    switch (selectedType) {
      case 'decrease':
      case 'increase':
        return phaseConfig.amount > 0 && phaseConfig.frequency > 0 && phaseConfig.times > 0;
      case 'setup':
        return phaseConfig.rows > 0;
      case 'bind_off':
        return phaseConfig.amount > 0 && phaseConfig.frequency > 0;
      default:
        return false;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleBackdropClick}>
      <div className="modal-content-light max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="modal-header-light relative flex items-center justify-center py-4 px-6 rounded-t-2xl bg-sage-200">
          <div className="text-center">
            <h2 className="text-lg font-semibold">
              {editingPhase ? 'Edit Phase' : 'Add Phase'}
            </h2>
            <p className="text-sage-600 text-sm">
              {selectedType ? 'Configure your phase' : 'Choose phase type'}
            </p>
          </div>

          <button
            onClick={onClose}
            className="absolute right-4 text-sage-600 text-2xl hover:bg-sage-300 hover:bg-opacity-50 rounded-full w-8 h-8 flex items-center justify-center transition-colors"
            aria-label="Close modal"
          >
            ×
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6">
          {!selectedType ? (
            // Phase Type Selection
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-wool-700 mb-3">Choose Phase Type</h3>
              <div className="grid grid-cols-2 gap-3">
                {phaseTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => handleTypeSelect(type.id)}
                    className="card-selectable text-left"
                  >
                    <div className="text-2xl mb-2">{type.icon}</div>
                    <div className="font-semibold text-wool-700 text-sm">{type.name}</div>
                    <div className="text-xs text-wool-500">{type.description}</div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            // Phase Configuration
            <div className="space-y-4">
              {/* Back to type selection */}
              <button
                onClick={() => setSelectedType(null)}
                className="text-sm text-wool-500 hover:text-wool-700 transition-colors"
              >
                ← Choose different type
              </button>

              {/* Configuration based on selected type */}
              {selectedType === 'decrease' && (
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-wool-700">📉 Decrease Configuration</h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="form-label">Amount per operation</label>
                      <IncrementInput
                        value={phaseConfig.amount || 1}
                        onChange={(value) => handleConfigChange('amount', value)}
                        min={1}
                        contextualMax={Math.floor(availableStitches / 2)}
                        unit="stitches"
                      />
                    </div>

                    <div>
                      <label className="form-label">Position</label>
                      <select
                        value={phaseConfig.position || 'both_ends'}
                        onChange={(e) => handleConfigChange('position', e.target.value)}
                        className="w-full details-input-field"
                      >
                        <option value="both_ends">Both ends</option>
                        <option value="beginning">Beginning only</option>
                        <option value="end">End only</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="form-label">Frequency</label>
                      <IncrementInput
                        value={phaseConfig.frequency || 2}
                        onChange={(value) => handleConfigChange('frequency', value)}
                        min={1}
                        unit="rows"
                      />
                    </div>

                    <div>
                      <label className="form-label">Times</label>
                      <IncrementInput
                        value={phaseConfig.times || 1}
                        onChange={(value) => handleConfigChange('times', value)}
                        min={1}
                        unit="operations"
                      />
                    </div>
                  </div>
                </div>
              )}

              {selectedType === 'increase' && (
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-wool-700">📈 Increase Configuration</h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="form-label">Amount per operation</label>
                      <IncrementInput
                        value={phaseConfig.amount || 1}
                        onChange={(value) => handleConfigChange('amount', value)}
                        min={1}
                        unit="stitches"
                      />
                    </div>

                    <div>
                      <label className="form-label">Position</label>
                      <select
                        value={phaseConfig.position || 'both_ends'}
                        onChange={(e) => handleConfigChange('position', e.target.value)}
                        className="w-full details-input-field"
                      >
                        <option value="both_ends">Both ends</option>
                        <option value="beginning">Beginning only</option>
                        <option value="end">End only</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="form-label">Frequency</label>
                      <IncrementInput
                        value={phaseConfig.frequency || 2}
                        onChange={(value) => handleConfigChange('frequency', value)}
                        min={1}
                        unit="rows"
                      />
                    </div>

                    <div>
                      <label className="form-label">Times</label>
                      <IncrementInput
                        value={phaseConfig.times || 1}
                        onChange={(value) => handleConfigChange('times', value)}
                        min={1}
                        unit="operations"
                      />
                    </div>
                  </div>
                </div>
              )}

              {selectedType === 'setup' && (
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-wool-700">📏 Setup Rows Configuration</h3>

                  <div>
                    <label className="form-label">Number of rows</label>
                    <IncrementInput
                      value={phaseConfig.rows || 2}
                      onChange={(value) => handleConfigChange('rows', value)}
                      min={1}
                      unit="rows"
                    />
                  </div>
                </div>
              )}

              {selectedType === 'bind_off' && (
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-wool-700">🔗 Bind Off Configuration</h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="form-label">Amount to bind off</label>
                      <IncrementInput
                        value={phaseConfig.amount || 1}
                        onChange={(value) => handleConfigChange('amount', value)}
                        min={1}
                        contextualMax={availableStitches}
                        unit="stitches"
                      />
                    </div>

                    <div>
                      <label className="form-label">Frequency</label>
                      <IncrementInput
                        value={phaseConfig.frequency || 1}
                        onChange={(value) => handleConfigChange('frequency', value)}
                        min={1}
                        unit="rows"
                      />
                    </div>
                  </div>

                  {/* Bind off all remaining button */}
                  {availableStitches > 0 && (
                    <button
                      onClick={() => {
                        handleConfigChange('amount', availableStitches);
                        handleConfigChange('frequency', 1);
                      }}
                      className="w-full btn-tertiary text-sm"
                    >
                      Bind off all remaining ({availableStitches} stitches)
                    </button>
                  )}
                </div>
              )}

              {/* Phase preview */}
              {selectedType && phaseConfig && (
                <div className="bg-sage-50 border border-sage-200 rounded-lg p-3">
                  <h4 className="text-xs font-medium text-sage-700 mb-1">Preview</h4>
                  <div className="text-sm text-sage-600">
                    {PhaseCalculationService.getPhaseDescription({ type: selectedType, config: phaseConfig }, construction)}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Modal Actions */}
          <div className="flex gap-3 mt-6">
            <button
              onClick={onClose}
              className="flex-1 btn-tertiary"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!canSave()}
              className="flex-1 btn-primary"
            >
              {editingPhase ? 'Save Changes' : 'Add Phase'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SequentialPhasesModal;