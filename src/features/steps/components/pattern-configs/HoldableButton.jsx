// src/features/steps/components/pattern-configs/HoldableButton.jsx
import React, { useState } from 'react';
import { shouldMultiplyAction } from '../../../../shared/utils/patternInputUtils';

const HoldableButton = ({ action, className, children, disabled, onClick, tempRowText }) => {
    const [holdState, setHoldState] = useState({
        isHolding: false,
        count: 0,
        timer: null,
        intervalTimer: null,
        pointerDown: false
    });

    const canHold = action && shouldMultiplyAction(action) && !disabled;

    const getDisplayCount = () => {
        const currentText = tempRowText || '';
        const actions = currentText.split(', ').filter(a => a.trim() !== '');
        if (actions.length > 0) {
            const lastAction = actions[actions.length - 1];

            // FIXED: Handle both simple (K2) and complex (K2tog × 3) formats
            const simpleMatch = lastAction.match(/^([A-Za-z]+)(\d*)$/);
            const complexMatch = lastAction.match(/^(.+?)\s*×\s*(\d+)$/);

            if (complexMatch && complexMatch[1].trim() === action) {
                // Handle "K2tog × 3" format
                const existingCount = parseInt(complexMatch[2]);
                return existingCount + holdState.count;
            } else if (simpleMatch && simpleMatch[1] === action) {
                // Handle "K2" format  
                const existingCount = parseInt(simpleMatch[2] || '1');
                return existingCount + holdState.count;
            } else if (lastAction === action) {
                // Handle plain action "K2tog" → should show count + 1
                return 1 + holdState.count;
            }
        }
        return holdState.count;
    };

    const startHoldAction = (e) => {
        e.preventDefault();
        if (!canHold) {
            onClick(action);
            return;
        }

        setHoldState(prev => ({ ...prev, isHolding: true, pointerDown: true, count: 1 }));

        const initialTimer = setTimeout(() => {
            let currentCount = 1;
            const intervalTimer = setInterval(() => {
                currentCount++;
                setHoldState(prev => ({ ...prev, count: currentCount }));
            }, 150);

            setHoldState(prev => ({ ...prev, intervalTimer }));
        }, 500);

        setHoldState(prev => ({ ...prev, timer: initialTimer }));
    };

    const stopHoldAction = (e) => {
        e.preventDefault();
        if (!holdState.pointerDown) return;

        if (holdState.timer) clearTimeout(holdState.timer);
        if (holdState.intervalTimer) clearInterval(holdState.intervalTimer);

        if (holdState.isHolding) {
            if (holdState.count > 1) {
                const isSimpleAction = ['K', 'P', 'YO'].includes(action);
                const accumulatedAction = isSimpleAction
                    ? `${action}${holdState.count}`
                    : `${action} × ${holdState.count}`;
                onClick(accumulatedAction);
            } else {
                onClick(action);
            }
        }

        setHoldState({ isHolding: false, count: 0, timer: null, intervalTimer: null, pointerDown: false });
    };

    return (
        <button
            className={`${className} ${holdState.isHolding ? 'ring-2 ring-sage-400 bg-sage-200' : ''}`}
            onPointerDown={startHoldAction}
            onPointerUp={stopHoldAction}
            onPointerLeave={stopHoldAction}
            onContextMenu={(e) => e.preventDefault()}
            disabled={disabled}
            style={{ userSelect: 'none', touchAction: 'manipulation' }}
        >
            <span className="flex items-center justify-center">
                {children}
                {holdState.isHolding && holdState.count > 1 && (
                    <span className="ml-1 text-xs bg-sage-600 text-white px-1.5 py-0.5 rounded-full font-bold">
                        {getDisplayCount()}
                    </span>
                )}
            </span>
        </button>
    );
};

export default HoldableButton;