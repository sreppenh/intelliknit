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
        
        {/* Compact Header */}
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
              <p className="text-sage-100 text-sm">Just the essentials</p>
            </div>
          </div>
        </div>

        <div className="p-4 bg-yarn-50 space-y-4">
          
          {/* Compact Welcome Message */}
          <div className="text-center">
            <div className="text-2xl mb-2">🧶</div>
            <h2 className="text-lg font-semibold text-wool-700 mb-1">Project Details</h2>
            <p className="text-wool-500 text-sm">Add more details later!</p>
          </div>

          <div className="space-y-4">
            {/* Project Name */}
            <div>
              <label className="form-label">
                Project Name
              </label>
              <input
                type="text"
                value={projectData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="e.g., Mom's Birthday Sweater"
                className="input-field"
              />
            </div>

            {/* Size - Optional */}
            <div>
              <label className="form-label">
                Size (optional)
              </label>
              <input
                type="text"
                value={projectData.size}
                onChange={(e) => handleInputChange('size', e.target.value)}
                placeholder="e.g., Medium, 36 inches"
                className="input-field"
              />
            </div>

            {/* Segmented Units Control */}
            <div>
              <label className="form-label">
                Preferred Units
              </label>
              <div className="bg-wool-100 border-2 border-wool-200 rounded-xl p-1">
                <div className="grid grid-cols-2 gap-1">
                  <button
                    onClick={() => handleInputChange('defaultUnits', 'inches')}
                    className={`py-2 px-4 rounded-lg text-sm font-semibold transition-all duration-200 ${
                      projectData.defaultUnits === 'inches'
                        ? 'bg-sage-500 text-white shadow-sm'
                        : 'text-wool-600 hover:text-sage-600'
                    }`}
                  >
                    🇺🇸 Inches
                  </button>
                  
                  <button
                    onClick={() => handleInputChange('defaultUnits', 'cm')}
                    className={`py-2 px-4 rounded-lg text-sm font-semibold transition-all duration-200 ${
                      projectData.defaultUnits === 'cm'
                        ? 'bg-sage-500 text-white shadow-sm'
                        : 'text-wool-600 hover:text-sage-600'
                    }`}
                  >
                    🇬🇧 Centimeters
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Compact Pro Tip */}
          <div className="bg-yarn-100 border-2 border-yarn-200 rounded-xl p-3">
            <h4 className="text-sm font-semibold text-yarn-700 mb-1">💡 Pro Tip</h4>
            <p className="text-sm text-yarn-600">
              Don't worry about yarn details or pattern info right now - add those later!
            </p>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-wool-200">
            <div className="flex gap-3">
              <button
                onClick={onBack}
                className="flex-1 btn-tertiary"
              >
                Back
              </button>
              
              <button
                onClick={handleCreateProject}
                disabled={!canCreateProject()}
                className="flex-2 bg-yarn-600 text-white py-3 px-6 rounded-xl font-semibold text-base hover:bg-yarn-700 disabled:bg-wool-400 disabled:cursor-not-allowed transition-colors shadow-sm flex items-center justify-center gap-2"
                style={{flexGrow: 2}}
              >
                <span className="text-lg">🧶</span>
                Create Project
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateProject;