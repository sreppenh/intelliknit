import React, { useState } from 'react';
import { useProjectsContext } from '../hooks/useProjectsContext';

const CreateProject = ({ onBack, onProjectCreated, selectedProjectType }) => {
  const { dispatch } = useProjectsContext();
  const [projectData, setProjectData] = useState({
    name: '',
    size: '',
    defaultUnits: 'inches'
  });

  const handleInputChange = (field, value) => {
    setProjectData(prev => ({ ...prev, [field]: value }));
  };

  const canCreateProject = () => {
    return projectData.name.trim().length > 0 && projectData.defaultUnits;
  };

  const handleCreateProject = () => {
    const newProject = {
      name: projectData.name.trim(),
      size: projectData.size.trim() || 'Not specified',
      defaultUnits: projectData.defaultUnits,
      projectType: selectedProjectType,
      // Set empty defaults for additional details (can be added later)
      source: '',
      recipient: '',
      notes: '',
      yarn: '',
      needleSize: '',
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
              onClick={onBack}
              className="text-white text-xl hover:bg-white hover:bg-opacity-20 rounded-full w-10 h-10 flex items-center justify-center transition-colors"
            >
              ←
            </button>
            <div className="flex-1">
              <h1 className="text-lg font-semibold">Create New Project</h1>
              <p className="text-sage-100 text-sm">Just the essentials to get started</p>
            </div>
          </div>
        </div>

        <div className="p-6 bg-yarn-50 space-y-6">
          
          {/* Welcome Message */}
          <div className="text-center">
            <div className="text-4xl mb-3">🧶</div>
            <h2 className="text-xl font-semibold text-wool-700 mb-2">Provide Details</h2>
            <p className="text-wool-500 text-sm">You can always add more details later!</p>
          </div>

          <div className="space-y-6">
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

            {/* Size - Optional */}
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

            {/* Units - Visual Selection */}
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

          {/* Helpful Info */}
          <div className="bg-yarn-100 border-2 border-yarn-200 rounded-xl p-4">
            <h4 className="text-sm font-semibold text-yarn-700 mb-2">💡 Pro Tip</h4>
            <p className="text-sm text-yarn-600">
              Don't worry about yarn details, recipient, or pattern source right now. 
              You can add those later in your project settings when you need them!
            </p>
          </div>

          {/* Action Buttons */}
          <div className="pt-6 border-t border-wool-200">
            <div className="flex gap-3">
              <button
                onClick={onBack}
                className="flex-1 bg-wool-100 text-wool-700 py-4 px-4 rounded-xl font-semibold text-base hover:bg-wool-200 transition-colors border border-wool-200"
              >
                Cancel
              </button>
              
              <button
                onClick={handleCreateProject}
                disabled={!canCreateProject()}
                className="flex-2 bg-yarn-600 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:bg-yarn-700 disabled:bg-wool-400 disabled:cursor-not-allowed transition-colors shadow-sm flex items-center justify-center gap-2"
                style={{flexGrow: 2}}
              >
                <span className="text-xl">🧶</span>
                Create Project
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center pt-4">
            <p className="text-xs text-wool-400">Ready to start knitting! 🎉</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateProject;