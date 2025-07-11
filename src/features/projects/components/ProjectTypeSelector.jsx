import React from 'react';

const ProjectTypeSelector = ({ onBack, onContinue, selectedType, onTypeSelect }) => {
  const projectTypes = [
    // Clothing
    { id: 'sweater', name: 'Sweater', icon: '🧥' },
    { id: 'shawl', name: 'Shawl', icon: '🌙' },
    
    // Accessories
    { id: 'hat', name: 'Hat', icon: '🎩' },
    { id: 'scarf_cowl', name: 'Scarf & Cowl', icon: '🧣' },
    { id: 'socks', name: 'Socks', icon: '🧦' },
    
    // Non-wearables
    { id: 'blanket', name: 'Blanket', icon: '🛏️' },
    { id: 'toys', name: 'Toys', icon: '🧸' },
    
    // Other
    { id: 'other', name: 'Other', icon: '✨' }
  ];

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
              <h1 className="text-lg font-semibold">What are you making?</h1>
              <p className="text-sage-100 text-sm">Choose your project type</p>
            </div>
          </div>
        </div>

        <div className="p-6 bg-yarn-50 space-y-6">
          {/* Welcome Message */}
          <div className="text-center mb-6">
            <div className="text-4xl mb-3">🧶</div>
            <h2 className="text-xl font-semibold text-wool-700 mb-2">Let's Get Started!</h2>
            <p className="text-wool-500 text-sm">What kind of project are you excited to create?</p>
          </div>

          {/* Project Type Grid */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            {projectTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => onTypeSelect(type.id)}
                className={`p-5 border-2 rounded-xl transition-all duration-200 text-center ${
                  selectedType === type.id
                    ? 'border-sage-500 bg-sage-100 text-sage-700 shadow-lg transform scale-105'
                    : 'border-wool-200 bg-white text-wool-700 hover:border-sage-300 hover:bg-sage-50 hover:shadow-md hover:transform hover:scale-102'
                }`}
              >
                <div className="text-3xl mb-3">{type.icon}</div>
                <div className="font-semibold text-base">{type.name}</div>
              </button>
            ))}
          </div>

          {/* Continue Button */}
          {selectedType && (
            <div className="space-y-4">
              <div className="bg-sage-100 border-2 border-sage-200 rounded-xl p-4 text-center">
                <div className="text-2xl mb-2">
                  {projectTypes.find(t => t.id === selectedType)?.icon}
                </div>
                <p className="text-sage-700 text-sm font-medium">
                  Perfect! Let's create your {projectTypes.find(t => t.id === selectedType)?.name.toLowerCase()} project
                </p>
              </div>

              <button
                onClick={onContinue}
                className="w-full bg-yarn-600 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:bg-yarn-700 transition-colors shadow-sm flex items-center justify-center gap-2"
              >
                <span className="text-xl">✨</span>
                Continue to Details
              </button>
            </div>
          )}

          {/* Footer */}
          <div className="text-center pt-6">
            <p className="text-xs text-wool-400">You can always change this later! 🎉</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectTypeSelector;