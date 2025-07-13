import React, { useState } from 'react';

const EndingTypeSelector = ({ onTypeSelect, component, currentStitches }) => {
  const [showHolderSuccess, setShowHolderSuccess] = useState(false);

  const handlePutOnHolderClick = () => {
    setShowHolderSuccess(true);
    
    // Show success message briefly, then complete
    setTimeout(() => {
      onTypeSelect('put_on_holder');
    }, 1500);
  };

  // Show success message for "Put on Holder"
  if (showHolderSuccess) {
    return (
      <div className="stack-lg">
        <div className="text-center">
          <div className="text-4xl mb-4">✅</div>
          <h2 className="text-xl font-semibold text-sage-700 mb-2">Stitches on Holder!</h2>
          <p className="text-sage-600">
            All {currentStitches} stitches for {component?.name || 'this component'} are now safely on a holder.
          </p>
        </div>
        
        <div className="success-block">
          <h4 className="text-sm font-semibold text-sage-700 mb-2">💡 What's Next?</h4>
          <div className="text-sm text-sage-600">
            These stitches are ready to be picked up later for seaming, grafting, or continuing the pattern.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="stack-lg">
      <div>
        <div className="text-center mb-6">
          <div className="text-2xl mb-2">🏁</div>
          <h2 className="text-xl font-semibold text-wool-700 mb-2">
            How does {component?.name || 'this component'} end?
          </h2>
          <p className="text-wool-500">
            Choose what happens to your {currentStitches} stitches
          </p>
        </div>
      </div>
      
      {/* Clickable cards - Clean 4 options */}
      <div className="stack-sm">
        
        {/* Bind Off All Stitches - Most common, show stitch count */}
        <button
          onClick={() => onTypeSelect('bind_off_all')}
          className="w-full p-4 border-2 rounded-xl transition-all duration-200 text-left border-wool-200 bg-white text-wool-700 hover:border-sage-300 hover:bg-sage-50 hover:shadow-md hover:transform hover:scale-[1.02]"
        >
          <div className="flex items-center gap-4">
            <div className="text-3xl">✂️</div>
            <div>
              <div className="font-semibold text-base mb-1">Bind Off All Stitches</div>
              <div className="text-sm opacity-75">
                Finish the component completely ({currentStitches} stitches)
              </div>
            </div>
          </div>
        </button>

        {/* Put on Holder */}
        <button
          onClick={handlePutOnHolderClick}
          className="w-full p-4 border-2 rounded-xl transition-all duration-200 text-left border-wool-200 bg-white text-wool-700 hover:border-sage-300 hover:bg-sage-50 hover:shadow-md hover:transform hover:scale-[1.02]"
        >
          <div className="flex items-center gap-4">
            <div className="text-3xl">📎</div>
            <div>
              <div className="font-semibold text-base mb-1">Put on Holder</div>
              <div className="text-sm opacity-75">
                Keep {currentStitches} stitches live for later use
              </div>
            </div>
          </div>
        </button>

        {/* Attach to Another Piece */}
        <button
          onClick={() => onTypeSelect('attach_to_piece')}
          className="w-full p-4 border-2 rounded-xl transition-all duration-200 text-left border-wool-200 bg-white text-wool-700 hover:border-sage-300 hover:bg-sage-50 hover:shadow-md hover:transform hover:scale-[1.02]"
        >
          <div className="flex items-center gap-4">
            <div className="text-3xl">🔗</div>
            <div>
              <div className="font-semibold text-base mb-1">Attach to Another Piece</div>
              <div className="text-sm opacity-75">Connect to another component</div>
            </div>
          </div>
        </button>

        {/* Other Ending - For complex scenarios */}
        <button
          onClick={() => onTypeSelect('other')}
          className="w-full p-4 border-2 rounded-xl transition-all duration-200 text-left border-wool-200 bg-white text-wool-700 hover:border-sage-300 hover:bg-sage-50 hover:shadow-md hover:transform hover:scale-[1.02]"
        >
          <div className="flex items-center gap-4">
            <div className="text-3xl">📝</div>
            <div>
              <div className="font-semibold text-base mb-1">Other Ending</div>
              <div className="text-sm opacity-75">Custom finishing method</div>
            </div>
          </div>
        </button>
      </div>

      {/* Helpful context for complex scenarios */}
      <div className="bg-yarn-100 border-2 border-yarn-200 rounded-xl p-4">
        <h4 className="text-sm font-semibold text-yarn-700 mb-2">💡 Need Something Complex?</h4>
        <div className="text-sm text-yarn-600">
          Use "Other Ending" for scenarios like "Bind off center 24 stitches, put remaining 20 on holders" or other custom combinations.
        </div>
      </div>
    </div>
  );
};

export default EndingTypeSelector;