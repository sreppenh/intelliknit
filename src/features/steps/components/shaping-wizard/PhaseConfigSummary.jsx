// src/features/steps/components/shaping-wizard/PhaseConfigSummary.jsx
import React from 'react';

const PhaseConfigSummary = ({ 
  phases,
  phaseTypes,
  result,
  construction,
  onAddPhase,
  onEditPhase,
  onDeletePhase,
  onBack,
  onComplete,
  getPhaseDescription
}) => {
  return (
    <div className="p-6 stack-lg">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-wool-700 mb-3 text-left">📈 Sequential Phases</h2>
        <p className="text-wool-500 mb-4 text-left">
          {phases.length === 0 ? 'Build your shaping sequence step by step' : 'Review and modify your sequence'}
        </p>
      </div>

      {/* Phase List or Empty State */}
      {phases.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-4xl mb-4">🎯</div>
          <h3 className="text-lg font-semibold text-wool-600 mb-2">Ready to build complex shaping?</h3>
          <p className="text-wool-500 mb-4 px-4">Create sophisticated patterns like sleeve caps, shoulder shaping, or gradual waist decreases</p>
          <div className="help-block mb-6 mx-4">
            <div className="text-xs font-semibold text-sage-700 mb-1 text-left">Example: Sleeve Cap Shaping</div>
            <div className="text-xs text-sage-600 text-left">
              • Work 6 plain rows<br/>
              • Dec 1 at each end every other row 5 times<br/>
              • Work 2 plain rows<br/>
              • Dec 1 at each end every row 3 times
            </div>
          </div>
          <button
            onClick={onAddPhase}
            className="btn-primary"
          >
            Add Your First Phase
          </button>
        </div>
      ) : (
        <>
          {/* Phase Summary List */}
          <div>
            <h3 className="text-lg font-semibold text-wool-700 mb-3 text-left">Your Sequence</h3>
            
            <div className="stack-sm">
              {phases.map((phase, index) => (
                <div key={phase.id} className="card">
                  <div className="bg-wool-50 p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-sage-100 rounded-full flex items-center justify-center text-sm font-bold text-sage-700">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-semibold text-wool-700 flex items-center gap-2">
                          <span>{phaseTypes.find(t => t.id === phase.type)?.icon}</span>
                          {phaseTypes.find(t => t.id === phase.type)?.name}
                        </div>
                        <div className="text-sm text-wool-500">
                          {getPhaseDescription(phase)}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => onEditPhase(phase.id)}
                        className="p-2 text-wool-500 hover:bg-wool-200 rounded-lg transition-colors"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => onDeletePhase(phase.id)}
                        className="p-2 text-red-500 hover:bg-red-100 rounded-lg transition-colors"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Add Another Phase */}
          <button
            onClick={onAddPhase}
            className="w-full p-4 border-2 border-dashed border-wool-300 rounded-xl text-wool-500 hover:border-sage-400 hover:text-sage-600 transition-colors flex items-center justify-center gap-2"
          >
            <span className="text-xl">➕</span>
            Add Another Phase
          </button>

          {/* Preview */}
          {result.error ? (
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
              <h4 className="text-sm font-semibold text-red-700 mb-2">⚠️ Error</h4>
              <div className="text-sm text-red-600">
                {result.error}
              </div>
            </div>
          ) : (
            <div className="card-info">
              <h4 className="text-sm font-semibold text-lavender-700 mb-3 text-left">Preview</h4>
              
              <div className="stack-sm text-sm text-left">
                <div className="text-lavender-700">
                  <span className="font-medium">Instruction:</span> {result.instruction}
                </div>
                <div className="text-lavender-600">
                  {result.startingStitches} stitches → {result.endingStitches} stitches 
                  ({Math.abs(result.netStitchChange)} {result.netStitchChange > 0 ? 'increases' : 'decreases'}, {result.totalRows} rows, {construction})
                </div>
                <div className="text-lavender-600">
                  <span className="font-medium">Phases:</span> {phases.length} configured
                </div>
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
              onClick={onComplete}
              disabled={!result.instruction || result.error || phases.length === 0}
              className="btn-primary flex-1"
            >
              Add Step
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default PhaseConfigSummary;