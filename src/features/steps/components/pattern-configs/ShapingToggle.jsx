import React from 'react';

const ShapingToggle = ({ hasShaping, onToggle }) => {
  return (
    <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
      <label className="flex items-center cursor-pointer">
        <input
          type="checkbox"
          checked={hasShaping === true}
          onChange={(e) => onToggle(e.target.checked)}
          className="w-5 h-5 text-green-600 border-gray-300 rounded focus:ring-green-500 mr-3"
        />
        <div>
          <span className="text-sm font-medium text-green-800">Add Shaping</span>
          <p className="text-xs text-green-600">Include increases, decreases, or other shaping</p>
        </div>
      </label>
    </div>
  );
};

export default ShapingToggle;