// src/shared/utils/ConstructionTerminology.js

/**
 * Construction-aware terminology utility
 * Provides dynamic text based on flat vs round construction
 */

export const getConstructionTerms = (construction) => {
  const isRound = construction === 'round';
  
  return {
    // Row/Round terminology
    row: isRound ? 'round' : 'row',
    rows: isRound ? 'rounds' : 'rows',
    Row: isRound ? 'Round' : 'Row', 
    Rows: isRound ? 'Rounds' : 'Rows',
    
    // Position terminology  
    bothEnds: isRound ? 'Both' : 'Both Ends',
    atBothEnds: isRound ? 'both' : 'at each end',
    
    // Common phrases
    everyRow: isRound ? 'every round' : 'every row',
    everyOtherRow: isRound ? 'every other round' : 'every other row',
    everyNthRow: (n) => isRound ? `every ${n} rounds` : `every ${n} rows`,
    
    // Pattern instructions
    plainRow: (count) => {
      const term = isRound ? (count === 1 ? 'round' : 'rounds') : (count === 1 ? 'row' : 'rows');
      return `Work ${count} plain ${term}`;
    }
  };
};

// Hook version for components that have construction in context
export const useConstructionTerms = (construction) => {
  return getConstructionTerms(construction);
};