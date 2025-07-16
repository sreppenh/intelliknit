// src/shared/components/IncrementInput.jsx
import React from 'react';

/**
 * Enhanced IncrementInput Component with proper value handling
 * 
 * Features:
 * - Always defaults to min value (never empty)
 * - Proper max limits with reasonable defaults
 * - Consistent increment/decrement behavior
 * - Mobile-optimized with AA compliance
 * - Surgical fix for empty field issue
 */
const IncrementInput = ({ 
  value, 
  onChange, 
  min = 1, 
  max = undefined,
  label = 'value',
  unit = '',
  size = 'default', // 'sm', 'default', 'lg'
  className = '',
  disabled = false,
  placeholder = '',
  contextualMax = undefined, // For context-aware max limits
  ...props 
}) => {
  // Determine appropriate max based on context
  const getContextualMax = () => {
    if (max !== undefined) return max;
    if (contextualMax !== undefined) return contextualMax;
    
    // Smart defaults based on typical knitting values
    if (unit === 'rows' || label.includes('row')) return 999;
    if (unit === 'times' || label.includes('time')) return 999;
    if (unit === 'stitches' || label.includes('stitch')) return 999;
    if (label.includes('amount') || label.includes('count')) return 20;
    
    return 999; // Fallback for edge cases
  };

  const effectiveMax = getContextualMax();

  // Enhanced value handling - always ensure valid number
  const getCurrentValue = () => {
    const parsed = parseInt(value);
    if (isNaN(parsed) || parsed < min) return min;
    if (parsed > effectiveMax) return effectiveMax;
    return parsed;
  };

  const handleIncrement = () => {
    const currentValue = getCurrentValue();
    const newValue = Math.min(effectiveMax, currentValue + 1);
    onChange(newValue);
  };

  const handleDecrement = () => {
    const currentValue = getCurrentValue();
    const newValue = Math.max(min, currentValue - 1);
    onChange(newValue);
  };

  const handleInputChange = (e) => {
    const inputValue = e.target.value.replace(/[^0-9]/g, '');
    
    // FIXED: Never allow empty state - always default to min
    if (inputValue === '') {
      onChange(min);
      return;
    }
    
    const numValue = parseInt(inputValue);
    
    // Validate against min/max bounds
    if (numValue < min) {
      onChange(min);
      return;
    }
    
    if (numValue > effectiveMax) {
      onChange(effectiveMax);
      return;
    }
    
    onChange(numValue);
  };

  const handleInputBlur = () => {
    // FIXED: Always ensure we have a valid value on blur
    const currentValue = getCurrentValue();
    onChange(currentValue);
  };

  const handleInputFocus = (e) => {
    // Select all text on focus for easy editing
    e.target.select();
  };

  // Size classes
  const sizeClasses = {
    sm: { button: 'btn-increment-sm', input: 'input-numeric-sm' },
    default: { button: 'btn-increment', input: 'input-numeric' },
    lg: { button: 'btn-increment-lg', input: 'input-numeric-lg' }
  };

  const { button: buttonClass, input: inputClass } = sizeClasses[size];

  // Button state logic
  const currentValue = getCurrentValue();
  const isAtMin = currentValue <= min;
  const isAtMax = currentValue >= effectiveMax;

  // Display value - always show the current valid value
  const displayValue = currentValue.toString();

  return (
    <div className={`increment-input-group ${className}`}>
      <button
        onClick={handleDecrement}
        disabled={disabled || isAtMin}
        className={`${buttonClass} btn-increment-minus ${isAtMin ? 'opacity-50 cursor-not-allowed' : ''}`}
        aria-label={`Decrease ${label}`}
        type="button"
      >
        −
      </button>
      
      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        value={displayValue}
        onChange={handleInputChange}
        onBlur={handleInputBlur}
        onFocus={handleInputFocus}
        className={`${inputClass} text-center`}
        disabled={disabled}
        aria-label={`${label} (${min} to ${effectiveMax})`}
        placeholder={placeholder || min.toString()}
        min={min}
        max={effectiveMax}
        {...props}
      />
      
      <button
        onClick={handleIncrement}
        disabled={disabled || isAtMax}
        className={`${buttonClass} btn-increment-plus ${isAtMax ? 'opacity-50 cursor-not-allowed' : ''}`}
        aria-label={`Increase ${label}`}
        type="button"
      >
        +
      </button>
      
      {unit && (
        <span className="text-sm text-wool-600 ml-2 whitespace-nowrap min-w-0 flex-shrink-0">{unit}</span>
      )}
      

    </div>
  );
};

export default IncrementInput;