import React from 'react';

const LandingPage = ({ onAddNewProject, onViewProjects, onContinueKnitting, onNotepad }) => {
  
  // Smart greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    
    if (hour < 12) {
      return "Good morning! Ready to knit?";
    } else if (hour < 17) {
      return "Good afternoon! Time for some stitches?";
    } else {
      return "Good evening! Perfect for a cozy knitting session";
    }
  };

  const handleContinueKnitting = () => {
    // For now, show coming soon - will implement session resume later
    alert("Continue Knitting coming soon! This will drop you right back into your active knitting session.");
  };

  const handleNotepad = () => {
    // Placeholder for future notepad feature
    alert("Notepad coming soon! Quick notes and calculations for your knitting.");
  };

  return (
    <div className="min-h-screen bg-yarn-50">
      <div className="max-w-md mx-auto bg-yarn-50 min-h-screen shadow-lg">
        
        {/* Header with app branding */}
        <div className="bg-sage-500 text-white px-6 py-6">
          <div className="text-center">
            <div className="text-3xl mb-2">🧶</div>
            <h1 className="text-xl font-bold">IntelliKnit</h1>
          </div>
        </div>

        {/* Greeting Section */}
        <div className="px-6 py-6 bg-gradient-to-b from-sage-100 to-yarn-50">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-wool-700 mb-2">
              {getGreeting()}
            </h2>
            <p className="text-wool-500 text-sm">
              What would you like to do today?
            </p>
          </div>
        </div>

        {/* Action Cards - 2x2 Grid */}
        <div className="p-6 space-y-4">
          
          {/* Top Row */}
          <div className="grid-2-equal">
            
            {/* Add New Project - Top Left */}
            <button
              onClick={onAddNewProject}
              className="bg-white border-2 border-wool-200 rounded-2xl p-6 text-center hover:border-sage-300 hover:bg-sage-50 hover:shadow-lg hover:transform hover:scale-[1.02] transition-all duration-200 active:scale-95"
            >
              <div className="text-4xl mb-3">✨</div>
              <div className="font-semibold text-base text-wool-700 mb-1">Add New Project</div>
              <div className="text-xs text-wool-500">Start something amazing</div>
            </button>

            {/* Continue Knitting - Top Right (Primary Action) */}
            <button
              onClick={handleContinueKnitting}
              className="bg-gradient-to-br from-sage-500 to-sage-600 text-white rounded-xl p-6 text-center hover:from-sage-600 hover:to-sage-700 hover:shadow-lg hover:transform hover:scale-[1.02] transition-all duration-200 active:scale-95 shadow-md"
            >
              <div className="text-4xl mb-3">🧶</div>
              <div className="font-semibold text-base mb-1">Continue Knitting</div>
              <div className="text-xs text-sage-100">Pick up where you left off</div>
            </button>
          </div>

          {/* Bottom Row */}
          <div className="grid-2-equal">
            
            {/* View Projects - Bottom Left */}
            <button
              onClick={onViewProjects}
              className="card-interactive"
            >
              <div className="text-4xl mb-3">📋</div>
              <div className="font-semibold text-base text-wool-700 mb-1">View Projects</div>
              <div className="text-xs text-wool-500">Manage your patterns</div>
            </button>

            {/* Notepad - Bottom Right (Placeholder) */}
            <button
              onClick={handleNotepad}
              className="card-interactive relative"
            >
              <div className="text-4xl mb-3">📝</div>
              <div className="font-semibold text-base text-wool-700 mb-1">Notepad</div>
              <div className="text-xs text-wool-500">Quick notes & calculations</div>
              
              {/* Coming Soon Badge */}
              <div className="absolute top-2 right-2 badge badge-coming-soon">
                Soon
              </div>
            </button>
          </div>

          {/* Inspirational Footer */}
          <div className="text-center pt-4">
            <p className="text-xs text-wool-400">Happy knitting! 🧶</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;