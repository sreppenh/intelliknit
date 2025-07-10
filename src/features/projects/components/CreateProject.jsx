import React, { useState } from 'react';
import { useProjectsContext } from '../hooks/useProjectsContext';

const CreateProject = ({ onBack, onProjectCreated }) => {
  const { dispatch } = useProjectsContext();
  const [step, setStep] = useState(1); // 1=basics, 2=details
  const [projectData, setProjectData] = useState({
    name: '',
    size: '',
    defaultUnits: 'inches',
    // New personal details
    source: '',
    recipient: '',
    notes: '',
    yarn: '',
    needleSize: ''
  });

  const handleInputChange = (field, value) => {
    setProjectData(prev => ({ ...prev, [field]: value }));
  };

  const canProceedFromStep = (currentStep) => {
    switch (currentStep) {
      case 1:
        return projectData.name.trim() && projectData.defaultUnits; // UPDATED: Size now optional
      case 2:
        return true; // Step 2 details are all optional
      default:
        return false;
    }
  };

  const handleCreateProject = () => {
    const newProject = {
      name: projectData.name.trim(),
      size: projectData.size.trim(),
      defaultUnits: projectData.defaultUnits,
      source: projectData.source.trim(),
      recipient: projectData.recipient.trim(),
      notes: projectData.notes.trim(),
      yarn: projectData.yarn.trim(),
      needleSize: projectData.needleSize.trim(),
      components: [],
      completed: false,
      createdAt: new Date().toISOString()
    };

    dispatch({ type: 'CREATE_PROJECT', payload: newProject });
    onProjectCreated();
  };

  return (
    <div className="min-h-screen bg-yarn-50">
      <div className="max-w-md mx-auto bg-yarn-50 min-h-screen shadow-lg">
        
        {/* Header */}
        <div className="bg-sage-500 text-white px-6 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={step === 1 ? onBack : () => setStep(step - 1)}
              className="text-white text-xl hover:bg-white hover:bg-opacity-20 rounded-full w-10 h-10 flex items-center justify-center transition-colors"
            >
              ←
            </button>
            <div className="flex-1">
              <h1 className="text-lg font-semibold">Create New Project</h1>
              <p className="text-sage-100 text-sm">
                Step {step} of 2: {step === 1 ? 'Project Basics' : 'Additional Details'}
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 bg-yarn-50">
          
          {/* Step 1: Project Basics */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-wool-700 mb-3">Project Basics</h2>
                <p className="text-wool-500 mb-4">Let's start with the essentials</p>
              </div>

              {/* Project Name */}
              <div>
                <label className="block text-sm font-semibold text-wool-700 mb-3">
                  Project Name
                </label>
                <input
                  type="text"
                  value={projectData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="e.g., Mom's Birthday Sweater, Baby Blanket"
                  className="w-full border-2 border-wool-200 rounded-xl px-4 py-4 text-base focus:border-sage-500 focus:ring-0 transition-colors placeholder-wool-400 bg-white"
                />
              </div>

              {/* Size - now optional */}
              <div>
                <label className="block text-sm font-semibold text-wool-700 mb-3">
                  Size (optional)
                </label>
                <input
                  type="text"
                  value={projectData.size}
                  onChange={(e) => handleInputChange('size', e.target.value)}
                  placeholder="e.g., Medium, 36 inches, Newborn"
                  className="w-full border-2 border-wool-200 rounded-xl px-4 py-4 text-base focus:border-sage-500 focus:ring-0 transition-colors placeholder-wool-400 bg-white"
                />
              </div>

              {/* UPDATED: Visual measurement selection instead of dropdown */}
              <div>
                <label className="block text-sm font-semibold text-wool-700 mb-3">
                  Preferred Units
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleInputChange('defaultUnits', 'inches')}
                    className={`p-4 border-2 rounded-xl transition-all duration-200 text-center ${
                      projectData.defaultUnits === 'inches'
                        ? 'border-sage-500 bg-sage-100 text-sage-700 shadow-sm'
                        : 'border-wool-200 bg-white text-wool-700 hover:border-sage-300 hover:bg-sage-50 hover:shadow-sm'
                    }`}
                  >
                    <div className="text-2xl mb-2">📏</div>
                    <div className="font-semibold">Inches</div>
                    <div className="text-xs opacity-75">Imperial (US)</div>
                  </button>
                  
                  <button
                    onClick={() => handleInputChange('defaultUnits', 'cm')}
                    className={`p-4 border-2 rounded-xl transition-all duration-200 text-center ${
                      projectData.defaultUnits === 'cm'
                        ? 'border-sage-500 bg-sage-100 text-sage-700 shadow-sm'
                        : 'border-wool-200 bg-white text-wool-700 hover:border-sage-300 hover:bg-sage-50 hover:shadow-sm'
                    }`}
                  >
                    <div className="text-2xl mb-2">📐</div>
                    <div className="font-semibold">Centimeters</div>
                    <div className="text-xs opacity-75">Metric</div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Additional Details */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-wool-700 mb-3">Additional Details</h2>
                <p className="text-wool-500 mb-4">Add personal touches (all optional)</p>
              </div>

              {/* Personal Details */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-wool-700 mb-3">
                    For Who? (Recipient)
                  </label>
                  <input
                    type="text"
                    value={projectData.recipient}
                    onChange={(e) => handleInputChange('recipient', e.target.value)}
                    placeholder="e.g., Mom, Baby Emma, Myself"
                    className="w-full border-2 border-wool-200 rounded-xl px-4 py-4 text-base focus:border-sage-500 focus:ring-0 transition-colors placeholder-wool-400 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-wool-700 mb-3">
                    Pattern Source
                  </label>
                  <input
                    type="text"
                    value={projectData.source}
                    onChange={(e) => handleInputChange('source', e.target.value)}
                    placeholder="e.g., Ravelry, Book name, Custom design"
                    className="w-full border-2 border-wool-200 rounded-xl px-4 py-4 text-base focus:border-sage-500 focus:ring-0 transition-colors placeholder-wool-400 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-wool-700 mb-3">
                    Yarn Details
                  </label>
                  <input
                    type="text"
                    value={projectData.yarn}
                    onChange={(e) => handleInputChange('yarn', e.target.value)}
                    placeholder="e.g., Cascade 220, Blue Sky Alpaca"
                    className="w-full border-2 border-wool-200 rounded-xl px-4 py-4 text-base focus:border-sage-500 focus:ring-0 transition-colors placeholder-wool-400 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-wool-700 mb-3">
                    Needle Size
                  </label>
                  <input
                    type="text"
                    value={projectData.needleSize}
                    onChange={(e) => handleInputChange('needleSize', e.target.value)}
                    placeholder="e.g., US 8, 5mm"
                    className="w-full border-2 border-wool-200 rounded-xl px-4 py-4 text-base focus:border-sage-500 focus:ring-0 transition-colors placeholder-wool-400 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-wool-700 mb-3">
                    Notes
                  </label>
                  <textarea
                    value={projectData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    placeholder="Special notes, modifications, deadlines..."
                    rows={3}
                    className="w-full border-2 border-wool-200 rounded-xl px-4 py-4 text-base focus:border-sage-500 focus:ring-0 transition-colors placeholder-wool-400 bg-white resize-none"
                  />
                </div>
              </div>

              {/* Preview card */}
              <div className="bg-white border-2 border-sage-200 rounded-xl p-4">
                <h4 className="text-sm font-semibold text-sage-700 mb-3">📋 Project Preview</h4>
                <div className="space-y-2 text-sm">
                  <div><span className="font-semibold text-wool-600">Name:</span> {projectData.name || 'Untitled Project'}</div>
                  <div><span className="font-semibold text-wool-600">Size:</span> {projectData.size || 'Not specified'}</div>
                  <div><span className="font-semibold text-wool-600">Units:</span> {projectData.defaultUnits}</div>
                  {projectData.recipient && <div><span className="font-semibold text-wool-600">For:</span> {projectData.recipient}</div>}
                  {projectData.source && <div><span className="font-semibold text-wool-600">Pattern:</span> {projectData.source}</div>}
                  {projectData.yarn && <div><span className="font-semibold text-wool-600">Yarn:</span> {projectData.yarn}</div>}
                  {projectData.needleSize && <div><span className="font-semibold text-wool-600">Needles:</span> {projectData.needleSize}</div>}
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="pt-6 border-t border-wool-200">
            {step < 2 ? (
              <div className="flex gap-3">
                <button
                  onClick={onBack}
                  className="flex-1 bg-wool-100 text-wool-700 py-4 px-4 rounded-xl font-semibold text-base hover:bg-wool-200 transition-colors border border-wool-200"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setStep(step + 1)}
                  disabled={!canProceedFromStep(step)}
                  className="flex-2 bg-sage-500 text-white py-4 px-6 rounded-xl font-semibold text-base hover:bg-sage-600 disabled:bg-wool-400 disabled:cursor-not-allowed transition-colors shadow-sm"
                  style={{flexGrow: 2}}
                >
                  Continue →
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <button
                  onClick={handleCreateProject}
                  className="w-full bg-yarn-600 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:bg-yarn-700 transition-colors shadow-sm flex items-center justify-center gap-2"
                >
                  <span className="text-xl">🧶</span>
                  Create Project
                </button>
                <button
                  onClick={() => setStep(step - 1)}
                  className="w-full bg-wool-100 text-wool-700 py-3 px-4 rounded-xl font-semibold text-base hover:bg-wool-200 transition-colors border border-wool-200"
                >
                  ← Back to Basics
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateProject;