import React from 'react';

const SelectionGrid = ({
    options,
    selected,
    onSelect,
    columns = 3,
    compact = false,
    disabled = []  // Array of values that should be disabled
}) => {
    const getGridClass = () => {
        switch (columns) {
            case 2: return 'grid-cols-2';
            case 3: return 'grid-cols-3';
            case 4: return 'grid-cols-4';
            default: return 'grid-cols-3';
        }
    };

    const isOptionDisabled = (value) => disabled.includes(value);

    return (
        <div className={`grid ${getGridClass()} gap-2`}>
            {options.map(option => {
                const isDisabled = isOptionDisabled(option.value);

                return (
                    <div
                        key={option.value}
                        onClick={() => !isDisabled && onSelect(option.value)}
                        className={`card-marker-select${compact ? '-compact' : ''} 
                        ${isDisabled
                                ? 'opacity-50 cursor-not-allowed bg-wool-100 text-wool-400 border-wool-200'
                                : selected === option.value
                                    ? `${compact ? 'card-marker-select-compact-selected' : 'card-marker-select-selected'}`
                                    : ''
                            }`}
                    >
                        <div className="font-medium text-sm">{option.label}</div>
                    </div>
                );
            })}
        </div>
    );
};

export default SelectionGrid;