import React, { useState } from 'react';
import { useProjectsContext } from '../hooks/useProjectsContext';

const EditProjectDetails = ({ onBack }) => {
  const { currentProject, dispatch } = useProjectsContext();
  
  const [projectData, setProjectData] = useState({
    name: currentProject?.name || '',
    size: currentProject?.size || '',
    defaultUnits: currentProject?.defaultUnits || 'inches',
    gauge: currentProject?.gauge || '',
    yarns: currentProject?.yarns || [''],
    needles: currentProject?.needles || [''],
    source: currentProject?.source || '',
    designer: currentProject?.designer || '',
    recipient: currentProject?.recipient || '',
    notes: currentProject?.notes || ''
  });

  if (!currentProject) {
    return (
      <div className="min-h-screen bg-yarn-50 flex items-center justify-center">
        <div className="text-center bg-white rounded-xl p-6 shadow-lg border-2 border-wool-200">
          <div className="text-4xl mb-4">❌</div>
          <h3 className="text-lg font-medium text-wool-600 mb-2">No project selected</h3>
          <button 
            onClick={onBack}
            className="bg-sage-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-sage-600 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const handleInputChange = (field, value) => {
    setProjectData(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayChange = (field, index, value) => {
    setProjectData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const addArrayItem = (field) => {
    setProjectData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const removeArrayItem = (field, index) => {
    setProjectData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const handleSave = () => {
    const updatedProject = {
      ...currentProject,
      ...projectData,
      // Clean up empty array items
      yarns: projectData.yarns.filter(yarn => yarn.trim() !== ''),
      needles: projectData.needles.filter(needle => needle.trim() !== '')
    };

    dispatch({
      type: 'UPDATE_PROJECT',
      payload: updatedProject
    });

    onBack();
  };

  const hasChanges = () => {
    return JSON.stringify(projectData) !== JSON.stringify({
      name: currentProject.name || '',
      size: currentProject.size || '',
      defaultUnits: currentProject.defaultUnits || 'inches',
      gauge: currentProject.gauge || '',
      yarns: currentProject.yarns || [''],
      needles: currentProject.needles || [''],
      source: currentProject.source || '',
      designer: currentProject.designer || '',
      recipient: currentProject.recipient || '',
      notes: currentProject.notes || ''
    });
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
              <h1 className="text-lg font-semibold">Edit Project Details</h1>
              <p className="text-sage-100 text-sm">{currentProject.name}</p>
            </div>
          </div>
        </div>

        <div className="p-6 bg-yarn-50 space-y-8">
          
          {/* Basic Info Section */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-wool-700 flex items-center gap-2">
              📋 Basic Info
            </h2>
            
            <div>
              <label className="block text-sm font-semibold text-wool-700 mb-3">
                Project Name
              </label>
              <input
                type="text"
                value={projectData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full border-2 border-wool-200 rounded-xl px-4 py-3 text-base focus:border-sage-500 focus:ring-0 transition-colors bg-white"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-wool-700 mb-3">
                Size
              </label>
              <input
                type="text"
                value={projectData.size}
                onChange={(e) => handleInputChange('size', e.target.value)}
                placeholder="e.g., Medium, 36 inches, Newborn"
                className="w-full border-2 border-wool-200 rounded-xl px-4 py-3 text-base focus:border-sage-500 focus:ring-0 transition-colors bg-white"
              />
            </div>

<div>
              <label className="block text-sm font-semibold text-wool-700 mb-3">
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

          {/* Gauge Section - Prominent! */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-wool-700 flex items-center gap-2">
              📐 Gauge
            </h2>
            
            <div className="bg-yarn-100 border-2 border-yarn-200 rounded-xl p-4">
              <div className="mb-3">
                <label className="block text-sm font-semibold text-yarn-700 mb-2">
                  Your Gauge
                </label>
                <input
                  type="text"
                  value={projectData.gauge}
                  onChange={(e) => handleInputChange('gauge', e.target.value)}
                  placeholder="e.g., 18 sts and 24 rows = 4 inches"
                  className="w-full border-2 border-yarn-300 rounded-lg px-4 py-3 text-base focus:border-yarn-500 focus:ring-0 transition-colors bg-white"
                />
              </div>
              
              <div className="text-xs text-yarn-600">
                💡 <strong>Pro tip:</strong> Accurate gauge helps with length calculations in your pattern steps
              </div>
            </div>
          </div>

          {/* Materials Section */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-wool-700 flex items-center gap-2">
              🧶 Materials
            </h2>
            
            {/* Yarns */}
            <div>
              <label className="block text-sm font-semibold text-wool-700 mb-3">
                Yarns
              </label>
              {projectData.yarns.map((yarn, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={yarn}
                    onChange={(e) => handleArrayChange('yarns', index, e.target.value)}
                    placeholder={index === 0 ? "e.g., Cascade 220 Worsted - Navy" : "Additional yarn"}
                    className="flex-1 border-2 border-wool-200 rounded-lg px-4 py-3 text-base focus:border-sage-500 focus:ring-0 transition-colors bg-white"
                  />
                  {projectData.yarns.length > 1 && (
                    <button
                      onClick={() => removeArrayItem('yarns', index)}
                      className="px-3 py-3 text-wool-500 hover:text-red-600 transition-colors"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={() => addArrayItem('yarns')}
                className="w-full mt-2 py-2 px-4 border-2 border-dashed border-wool-300 rounded-lg text-wool-600 hover:border-sage-400 hover:text-sage-600 transition-colors text-sm font-medium"
              >
                + Add Another Yarn
              </button>
            </div>

            {/* Needles */}
            <div>
              <label className="block text-sm font-semibold text-wool-700 mb-3">
                Needles
              </label>
              {projectData.needles.map((needle, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={needle}
                    onChange={(e) => handleArrayChange('needles', index, e.target.value)}
                    placeholder={index === 0 ? "e.g., US 8 (5mm) circular" : "Additional needles"}
                    className="flex-1 border-2 border-wool-200 rounded-lg px-4 py-3 text-base focus:border-sage-500 focus:ring-0 transition-colors bg-white"
                  />
                  {projectData.needles.length > 1 && (
                    <button
                      onClick={() => removeArrayItem('needles', index)}
                      className="px-3 py-3 text-wool-500 hover:text-red-600 transition-colors"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={() => addArrayItem('needles')}
                className="w-full mt-2 py-2 px-4 border-2 border-dashed border-wool-300 rounded-lg text-wool-600 hover:border-sage-400 hover:text-sage-600 transition-colors text-sm font-medium"
              >
                + Add Another Needle
              </button>
            </div>
          </div>

          {/* Project Details Section */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-wool-700 flex items-center gap-2">
              📝 Project Details
            </h2>
            
            <div>
              <label className="block text-sm font-semibold text-wool-700 mb-3">
                Pattern Source
              </label>
              <input
                type="text"
                value={projectData.source}
                onChange={(e) => handleInputChange('source', e.target.value)}
                placeholder="e.g., Ravelry, Book name, Magazine"
                className="w-full border-2 border-wool-200 rounded-xl px-4 py-3 text-base focus:border-sage-500 focus:ring-0 transition-colors bg-white"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-wool-700 mb-3">
                Designer
              </label>
              <input
                type="text"
                value={projectData.designer}
                onChange={(e) => handleInputChange('designer', e.target.value)}
                placeholder="e.g., Jane Doe, Custom design"
                className="w-full border-2 border-wool-200 rounded-xl px-4 py-3 text-base focus:border-sage-500 focus:ring-0 transition-colors bg-white"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-wool-700 mb-3">
                For Who?
              </label>
              <input
                type="text"
                value={projectData.recipient}
                onChange={(e) => handleInputChange('recipient', e.target.value)}
                placeholder="e.g., Mom, Baby Emma, Myself"
                className="w-full border-2 border-wool-200 rounded-xl px-4 py-3 text-base focus:border-sage-500 focus:ring-0 transition-colors bg-white"
              />
            </div>
          </div>

          {/* Notes Section */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-wool-700 flex items-center gap-2">
              💭 Notes
            </h2>
            
            <div>
              <label className="block text-sm font-semibold text-wool-700 mb-3">
                Project Notes
              </label>
              <textarea
                value={projectData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder="Special notes, modifications, deadlines, or anything else you want to remember..."
                rows={4}
                className="w-full border-2 border-wool-200 rounded-xl px-4 py-3 text-base focus:border-sage-500 focus:ring-0 transition-colors bg-white resize-none"
              />
            </div>
          </div>

          {/* Save Button */}
          <div className="pt-6 border-t border-wool-200">
            <div className="flex gap-3">
              <button
                onClick={onBack}
                className="flex-1 bg-wool-100 text-wool-700 py-4 px-4 rounded-xl font-semibold text-base hover:bg-wool-200 transition-colors border border-wool-200"
              >
                Cancel
              </button>
              
              <button
                onClick={handleSave}
                disabled={!projectData.name.trim()}
                className="flex-2 bg-yarn-600 text-white py-4 px-6 rounded-xl font-semibold text-base hover:bg-yarn-700 disabled:bg-wool-400 disabled:cursor-not-allowed transition-colors shadow-sm flex items-center justify-center gap-2"
                style={{flexGrow: 2}}
              >
                <span className="text-lg">💾</span>
                {hasChanges() ? 'Save Changes' : 'Done'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProjectDetails;