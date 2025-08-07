import React from 'react';

const PutOnHolderConfig = ({ endingData, setEndingData, currentStitches }) => {
    return (
        <div className="stack-lg">
            <div>
                <h2 className="content-header-primary">Put on Holder</h2>
                <p className="content-subheader">
                    Keep these stitches live for later use
                </p>
            </div>

            {/* Stitch Count Display - Similar to BindOffConfig */}
            <div className="success-block">
                <div className="flex items-center justify-between mb-3">
                    <div>
                        <h3 className="text-sm font-semibold text-sage-700">Stitches to Hold</h3>
                        <p className="text-xs text-sage-600 mt-1">
                            All stitches will be placed on holder for later use
                        </p>
                    </div>
                    <div className="text-right">
                        <div className="text-2xl font-bold text-sage-700">{currentStitches}</div>
                        <div className="text-xs text-sage-600">stitches</div>
                    </div>
                </div>
            </div>

            {/* Optional Comments - Similar to AttachmentConfig pattern */}
            <div>
                <label className="form-label">
                    Holder Notes <span className="text-wool-400 text-sm font-normal">(Optional)</span>
                </label>
                <input
                    type="text"
                    value={endingData.customText || ''}
                    onChange={(e) => setEndingData(prev => ({ ...prev, customText: e.target.value }))}
                    placeholder="e.g., Use metal holder, transfer to waste yarn, leave on needle"
                    className="w-full border-2 border-wool-200 rounded-xl px-4 py-4 text-base focus:border-sage-500 focus:ring-0 transition-colors placeholder-wool-400 bg-white"
                />
            </div>

            {/* Helpful Info */}
            <div className="bg-yarn-100 border-2 border-yarn-200 rounded-xl p-4">
                <h4 className="text-sm font-semibold text-yarn-700 mb-2">💡 Holder Tips</h4>
                <div className="text-sm text-yarn-600 space-y-1">
                    <div>• <strong>Stitch holders:</strong> Best for small numbers of stitches</div>
                    <div>• <strong>Waste yarn:</strong> Good for large numbers or tight spaces</div>
                    <div>• <strong>Spare needles:</strong> Keep stitches ready to knit immediately</div>
                    <div>• <strong>Live stitches:</strong> These {currentStitches} stitches will be ready for seaming, grafting, or continuing</div>
                </div>
            </div>
        </div>
    );
};

export default PutOnHolderConfig;
