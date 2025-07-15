// src/shared/components/IncrementInput.jsx
import React from 'react';

/**
 * AA Compliant Increment Input Component
 * 
 * Features:
 * - 44px minimum touch targets
 * - Proper ARIA labels
 * - Keyboard accessible
 * - High contrast colors from IntelliKnit palette
 * - Mobile-optimized numeric input
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
  ...props 
}) => {
  const handleIncrement = () => {
    const currentValue = parseInt(value) || min;
    const newValue = currentValue + 1;
    if (!max || newValue <= max) {
      onChange(newValue);
    }
  };

  const handleDecrement = () => {
    const currentValue = parseInt(value) || min;
    const newValue = Math.max(min, currentValue - 1);
    onChange(newValue);
  };

  const handleInputChange = (e) => {
    const inputValue = e.target.value.replace(/[^0-9]/g, '');
    if (inputValue === '') {
      onChange('');
      return;
    }
    const numValue = parseInt(inputValue);
    const clampedValue = Math.min(max || Infinity, Math.max(min, numValue));
    onChange(clampedValue);
  };

  const handleInputBlur = () => {
    // If empty on blur, set to minimum value
    if (!value || value === '') {
      onChange(min);
    }
  };

  const sizeClasses = {
    sm: { button: 'btn-increment-sm', input: 'input-numeric-sm' },
    default: { button: 'btn-increment', input: 'input-numeric' },
    lg: { button: 'btn-increment-lg', input: 'input-numeric-lg' }
  };

  const { button: buttonClass, input: inputClass } = sizeClasses[size];

  const isAtMin = (parseInt(value) || min) <= min;
  const isAtMax = max && (parseInt(value) || 0) >= max;

  return (
    <div className={`increment-input-group justify-start ${className}`}>
      <button
        onClick={handleDecrement}
        disabled={disabled || isAtMin}
        className={`${buttonClass} btn-increment-minus`}
        aria-label={`Decrease ${label}`}
        type="button"
      >
        −
      </button>
      
      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        value={value === 0 ? '0' : (value || '')}
        onChange={handleInputChange}
        onBlur={handleInputBlur}
        className={inputClass}
        disabled={disabled}
        aria-label={label}
        placeholder={placeholder}
        {...props}
      />
      
      <button
        onClick={handleIncrement}
        disabled={disabled || isAtMax}
        className={`${buttonClass} btn-increment-plus`}
        aria-label={`Increase ${label}`}
        type="button"
      >
        +
      </button>
      
      {unit && (
        <span className="text-sm text-wool-600 ml-1">{unit}</span>
      )}
    </div>
  );
};

export default IncrementInput;