// src/shared/components/SegmentedControl.jsx
import React from 'react';

/**
 * SegmentedControl - Shared radio-button style selector
 * Used for Units, Construction, and other binary/multiple choice selections
 * 
 * Features:
 * - Consistent styling using existing .segmented-control CSS classes
 * - Flexible options array for different use cases
 * - Proper accessibility with aria labels
 * - Prevention of null states
 */
const SegmentedControl = ({
    label,
    value,
    onChange,
    options = [],
    className = '',
    disabled = false,
    required = false,
    ...props
}) => {
    return (
        <div className={className}>
            {label && (
                <label className="form-label">
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}

            <div className="segmented-control">
                <div className={`grid gap-1 ${options.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
                    {options.map((option) => (
                        <button
                            key={option.value}
                            type="button"
                            onClick={() => !disabled && onChange(option.value)}
                            disabled={disabled}
                            className={`segmented-option ${value === option.value
                                ? 'segmented-option-active'
                                : ''
                                } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                            aria-pressed={value === option.value}
                            {...props}
                        >
                            {option.icon && <span className="mr-1">{option.icon}</span>}
                            {option.label}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

// Preset configurations for common use cases
SegmentedControl.Units = ({ value, onChange, ...props }) => (
    <SegmentedControl
        label="Units"
        value={value}
        onChange={onChange}
        options={[
            { value: 'inches', label: 'Inches', icon: '🇺🇸' },
            { value: 'cm', label: 'Centimeters', icon: '🇪🇺' }
        ]}
        {...props}
    />
);

SegmentedControl.Construction = ({ value, onChange, ...props }) => (
    <SegmentedControl
        label="Construction"
        value={value}
        onChange={onChange}
        options={[
            { value: 'flat', label: 'Flat', icon: '📐' },
            { value: 'round', label: 'Round', icon: '⭕' }
        ]}
        {...props}
    />
);

export default SegmentedControl;