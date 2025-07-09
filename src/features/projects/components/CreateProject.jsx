import React, { useState } from 'react';
import { useProjectsContext } from '../hooks/useProjectsContext';

const CreateProject = ({ onBack, onProjectCreated }) => {
  const { dispatch } = useProjectsContext();
  const [projectName, setProjectName] = useState('');
  const [projectSize, setProjectSize] = useState('');
  const [defaultUnits, setDefaultUnits] = useState('inches');

  const handleCreateProject = () => {
    if (!projectName.trim()) return;

    dispatch({ 
      type: 'CREATE_PROJECT', 
      payload: { 
        name: projectName, 
        size: projectSize,
        defaultUnits: defaultUnits
      } 
    });

    // Reset form
    setProjectName('');
    setProjectSize('');
    setDefaultUnits('inches');

    // Navigate to project detail
    onProjectCreated();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto bg-white min-h-screen shadow-lg">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="text-2xl"
            >
              ←
            </button>
            <h1 className="text-xl font-bold">Create New Project</h1>
          </div>
        </div>

        <div className="p-6">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project Name
              </label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="Christmas Sweater"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Size (optional)
              </label>
              <input
                type="text"
                value={projectSize}
                onChange={(e) => setProjectSize(e.target.value)}
                placeholder="Medium, 32-34, Baby, etc."
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Default Measurement Unit
              </label>
              <select
                value={defaultUnits}
                onChange={(e) => setDefaultUnits(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="inches">Inches</option>
                <option value="cm">Centimeters</option>
              </select>
              <p className="text-sm text-gray-500 mt-1">
                You can change this for individual steps later
              </p>
            </div>
            
            <button
              onClick={handleCreateProject}
              disabled={!projectName.trim()}
              className="w-full bg-blue-600 text-white py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              Create Project
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateProject;