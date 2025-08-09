import React from 'react';

const PageHeader = ({
  title,
  subtitle,
  onBack,
  showBackButton = true,
  showCancelButton = false,
  onCancel,
  showConstructionBar = false,
  constructionInfo = {},
  showContextualBar = false,
  contextualInfo = {},
  // NEW: Sticky behavior props
  sticky = true,
  zIndex = 20
}) => {
  return (
    <>
      {/* Main Header with optional sticky positioning */}
      <div className={`
        bg-sage-500 text-white px-6 py-4
        ${sticky ? `sticky top-0 z-${zIndex} shadow-sm` : ''}
        transition-shadow duration-200
      `}>
        <div className="flex items-center gap-3">
          {showBackButton && (
            <button
              onClick={onBack}
              className="text-white text-xl hover:bg-white hover:bg-opacity-20 rounded-full w-10 h-10 flex items-center justify-center transition-colors"
            >
              ←
            </button>
          )}
          <div className="flex-1">
            <h1 className="text-lg font-semibold">{title}</h1>
            {subtitle && <p className="text-sage-100 text-sm">{subtitle}</p>}
          </div>
          {showCancelButton && onCancel && (
            <button
              onClick={onCancel}
              className="text-white text-xl hover:bg-white hover:bg-opacity-20 rounded-full w-10 h-10 flex items-center justify-center transition-colors"
              title="Cancel"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Optional Construction Info Bar with sticky positioning */}
      {showConstructionBar && (
        <div className={`
          px-6 py-3 bg-sage-100 border-b border-sage-200
          ${sticky ? `sticky top-[72px] z-${zIndex - 1}` : ''}
        `}>
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
              <span className="font-medium text-sage-700">Construction:</span>
              <div className="bg-sage-200 border border-sage-300 rounded-md p-0.5">
                <div className="grid grid-cols-2 gap-1">
                  <button
                    onClick={() => constructionInfo.setConstruction('flat')}
                    className={`px-2 py-1 rounded text-xs font-medium transition-all duration-200 ${constructionInfo.construction === 'flat'
                        ? 'bg-white text-sage-700 shadow-sm'
                        : 'text-sage-600 hover:text-sage-800'
                      }`}
                  >
                    Flat
                  </button>
                  <button
                    onClick={() => constructionInfo.setConstruction('round')}
                    className={`px-2 py-1 rounded text-xs font-medium transition-all duration-200 ${constructionInfo.construction === 'round'
                        ? 'bg-white text-sage-700 shadow-sm'
                        : 'text-sage-600 hover:text-sage-800'
                      }`}
                  >
                    Round
                  </button>
                </div>
              </div>
            </div>
            <div className="text-sage-600 text-xs">
              {constructionInfo.currentStitches} stitches • {constructionInfo.componentName}
            </div>
          </div>
        </div>
      )}

      {/* Generic Contextual Info Bar with sticky positioning */}
      {showContextualBar && (
        <div className={`
          px-6 py-3 bg-sage-100 border-b border-sage-200
          ${sticky ? `sticky top-[${showConstructionBar ? '132px' : '72px'}] z-${zIndex - 2}` : ''}
        `}>
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
              {contextualInfo.label && (
                <span className="font-medium text-sage-700">{contextualInfo.label}:</span>
              )}
              {contextualInfo.leftContent}
            </div>
            {contextualInfo.rightContent && (
              <div className="text-sage-600 text-xs">
                {contextualInfo.rightContent}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default PageHeader;