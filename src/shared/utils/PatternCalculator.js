/**
 * PatternCalculator - Generates row-by-row instructions with stitch counts
 */

import { PATTERN_TYPES, CONSTRUCTION_TYPES } from './PatternDetector';

class PatternCalculator {
  constructor() {
    this.defaultRowInstructions = {
      stockinette: { 
        flat: { rs: 'Knit across', ws: 'Purl across' },
        round: { rs: 'Knit across', ws: 'Knit across' } // All rounds are RS in round knitting
      },
      garter: { 
        flat: { rs: 'Knit across', ws: 'Knit across' }, // Knit every row when flat
        round: { rs: 'Knit across', ws: 'Purl across' } // Alternate K/P when in round
      },
      seed: { 
        flat: { rs: 'K1, P1 across', ws: 'P1, K1 across' },
        round: { rs: 'K1, P1 across', ws: 'P1, K1 across' }
      },
      rib_1x1: { 
        flat: { rs: 'K1, P1 across', ws: 'P1, K1 across' },
        round: { rs: 'K1, P1 across', ws: 'K1, P1 across' }
      },
      rib_2x2: { 
        flat: { rs: 'K2, P2 across', ws: 'P2, K2 across' },
        round: { rs: 'K2, P2 across', ws: 'K2, P2 across' }
      }
    };
  }

  /**
   * Repeating Sequence calculation (e.g., "Repeat last 2 rows 12 more times")
   * NOTE: This pattern type requires manual setup - we can't auto-detect what the previous rows were
   */
  _calculateRepeatingSequence(data, startingStitches, construction, previousRows = null) {
    const { sequenceLength, additionalRepeats, totalRepeats } = data;
    
    // We can't automatically know what the "last X rows" were - this needs manual input
    const totalRows = sequenceLength * totalRepeats;
    
    return {
      totalRows: totalRows,
      startingStitches: startingStitches,
      endingStitches: startingStitches, // Unknown without knowing the sequence
      needsManualSetup: true,
      sequenceInfo: {
        length: sequenceLength,
        repeats: totalRepeats,
        additionalRepeats: additionalRepeats,
        message: `This pattern repeats ${sequenceLength} rows ${totalRepeats} times (${totalRows} total rows). You'll need to manually define what those ${sequenceLength} rows are.`
      }
    };
  }

  /**
   * Generate default sequence when actual row data isn't available
   */
  _generateDefaultSequence(sequenceLength, construction) {
    const sequence = [];
    
    for (let i = 0; i < sequenceLength; i++) {
      const rowNumber = i + 1;
      
      if (sequenceLength === 2) {
        // Common 2-row sequences
        if (rowNumber === 1) {
          sequence.push("Knit across");
        } else {
          sequence.push("K1, (sl 1 purlwise, K1) across");
        }
      } else if (sequenceLength === 4) {
        // Common 4-row sequences (like seed stitch)
        const side = rowNumber % 2 === 1 ? 'RS' : 'WS';
        sequence.push(this._getBaseInstruction('seed', side));
      } else {
        // Generic sequence
        const side = construction === CONSTRUCTION_TYPES.ROUND ? 'RS' : 
                     (rowNumber % 2 === 1 ? 'RS' : 'WS');
        sequence.push(this._getBaseInstruction('stockinette', side));
      }
    }
    
    return sequence;
  }

  /**
   * Repeat Across Row calculation (e.g., "[K1, k2tog], rep to last st, k1")
   */
  _calculateRepeatAcrossRow(data, startingStitches, construction) {
    const { repeatPattern, remainingStitches, afterRepeat } = data;
    
    // Analyze the repeat pattern to understand stitch changes
    const patternAnalysis = this._analyzeRepeatPattern(repeatPattern);
    const { stitchesConsumed, stitchesProduced, instruction } = patternAnalysis;
    
    if (stitchesConsumed === 0) {
      throw new Error(`Cannot determine stitch consumption for pattern: ${repeatPattern}`);
    }
    
    // Calculate how many complete repeats fit
    const availableForRepeats = startingStitches - remainingStitches;
    const completeRepeats = Math.floor(availableForRepeats / stitchesConsumed);
    const stitchesFromRepeats = completeRepeats * stitchesProduced;
    
    // Calculate final stitch count
    const endingStitches = stitchesFromRepeats + remainingStitches;
    
    // Generate instruction
    const side = construction === CONSTRUCTION_TYPES.ROUND ? 'RS' : 'RS'; // Assume RS for single row
    let fullInstruction = `${instruction}, repeat ${completeRepeats} times`;
    
    if (remainingStitches > 0 && afterRepeat) {
      fullInstruction += `, ${afterRepeat}`;
    } else if (remainingStitches > 0) {
      fullInstruction += `, work remaining ${remainingStitches} stitches`;
    }
    
    return {
      totalRows: 1,
      startingStitches: startingStitches,
      endingStitches: endingStitches,
      rows: [{
        rowNumber: 1,
        instruction: fullInstruction,
        stitchCount: endingStitches,
        side: side,
        isActionRow: true,
        repeatDetails: {
          pattern: repeatPattern,
          repeats: completeRepeats,
          stitchesPerRepeat: `${stitchesConsumed} → ${stitchesProduced}`,
          remainingStitches: remainingStitches
        }
      }]
    };
  }

  /**
   * Analyze repeat pattern to determine stitch consumption/production
   */
  _analyzeRepeatPattern(pattern) {
    const lowerPattern = pattern.toLowerCase().trim();
    
    // Common decrease patterns
    if (lowerPattern.match(/k1,?\s*k2tog/) || lowerPattern.match(/k2tog,?\s*k1/)) {
      return {
        stitchesConsumed: 3, // K1 + K2tog uses 3 stitches
        stitchesProduced: 2, // Makes 2 stitches
        instruction: "K1, K2tog"
      };
    }
    
    if (lowerPattern.match(/ssk,?\s*k1/) || lowerPattern.match(/k1,?\s*ssk/)) {
      return {
        stitchesConsumed: 3,
        stitchesProduced: 2,
        instruction: "SSK, K1"
      };
    }
    
    // K2tog patterns
    if (lowerPattern.match(/k2tog/)) {
      return {
        stitchesConsumed: 2,
        stitchesProduced: 1,
        instruction: "K2tog"
      };
    }
    
    // SSK patterns  
    if (lowerPattern.match(/ssk/)) {
      return {
        stitchesConsumed: 2,
        stitchesProduced: 1,
        instruction: "SSK"
      };
    }
    
    // Increase patterns
    if (lowerPattern.match(/k1,?\s*yo/) || lowerPattern.match(/yo,?\s*k1/)) {
      return {
        stitchesConsumed: 1,
        stitchesProduced: 2,
        instruction: "K1, YO"
      };
    }
    
    if (lowerPattern.match(/k1,?\s*m1/) || lowerPattern.match(/m1,?\s*k1/)) {
      return {
        stitchesConsumed: 1,
        stitchesProduced: 2,
        instruction: "K1, M1"
      };
    }
    
    // Plain knitting (no change)
    if (lowerPattern.match(/^k\d*$/) || lowerPattern.match(/^knit/)) {
      const stitchCount = parseInt(lowerPattern.match(/\d+/)?.[0]) || 1;
      return {
        stitchesConsumed: stitchCount,
        stitchesProduced: stitchCount,
        instruction: `K${stitchCount}`
      };
    }
    
    // Default: treat as unknown pattern that doesn't change stitch count
    return {
      stitchesConsumed: 0, // Will trigger error
      stitchesProduced: 0,
      instruction: pattern
    };
  }

  /**
   * Calculate complete row-by-row instructions for a pattern
   */
  calculatePattern(patternType, parsedData, startingStitches, construction = CONSTRUCTION_TYPES.FLAT) {
    switch (patternType) {
      case PATTERN_TYPES.CAST_ON:
        return this._calculateCastOn(parsedData);

      case PATTERN_TYPES.BIND_OFF:
        return this._calculateBindOff(parsedData, startingStitches, construction);

      case PATTERN_TYPES.REPEATING_SEQUENCE:
        return this._calculateRepeatingSequence(parsedData, startingStitches, construction);

      case PATTERN_TYPES.REPEAT_ACROSS_ROW:
        return this._calculateRepeatAcrossRow(parsedData, startingStitches, construction);

      case PATTERN_TYPES.INTERVAL_DECREASE:
        return this._calculateIntervalDecrease(parsedData, startingStitches, construction);

      case PATTERN_TYPES.INTERVAL_INCREASE:
        return this._calculateIntervalIncrease(parsedData, startingStitches, construction);

      case PATTERN_TYPES.STITCH_PATTERN:
        return this._calculateStitchPattern(parsedData, startingStitches, construction);

      case PATTERN_TYPES.MEASUREMENT:
        return this._calculateMeasurement(parsedData, startingStitches, construction);

      default:
        throw new Error(`Unsupported pattern type: ${patternType}`);
    }
  }

  /**
   * Cast On calculation
   */
  _calculateCastOn(data) {
    return {
      totalRows: 1,
      startingStitches: 0,
      endingStitches: data.stitchCount,
      rows: [{
        rowNumber: 1,
        instruction: `Cast on ${data.stitchCount} stitches`,
        stitchCount: data.stitchCount,
        side: 'setup',
        isActionRow: true
      }]
    };
  }

  /**
   * Bind Off calculation
   */
  _calculateBindOff(data, startingStitches, construction) {
    if (data.rows) {
      // "Bind off X sts at beg of next Y rows"
      const rowsNeeded = data.rows;
      const stitchesPerRow = data.stitchCount;
      const rows = [];
      let currentStitches = startingStitches;

      for (let i = 1; i <= rowsNeeded; i++) {
        const side = construction === CONSTRUCTION_TYPES.ROUND ? 'RS' : (i % 2 === 1 ? 'RS' : 'WS');
        currentStitches -= stitchesPerRow;
        
        rows.push({
          rowNumber: i,
          instruction: `Bind off ${stitchesPerRow} stitches, ${this._getBaseInstruction('stockinette', side)} to end`,
          stitchCount: currentStitches,
          side: side,
          isActionRow: true
        });
      }

      return {
        totalRows: rowsNeeded,
        startingStitches: startingStitches,
        endingStitches: currentStitches,
        rows: rows
      };
    } else {
      // Simple "bind off X stitches"
      return {
        totalRows: 1,
        startingStitches: startingStitches,
        endingStitches: 0,
        rows: [{
          rowNumber: 1,
          instruction: `Bind off all ${data.stitchCount} stitches`,
          stitchCount: 0,
          side: 'setup',
          isActionRow: true
        }]
      };
    }
  }

  /**
   * Interval Decrease calculation (e.g., "Dec at end of each 6th row 7 times")
   */
  _calculateIntervalDecrease(data, startingStitches, construction) {
    const { stitchCount, location, interval, repetitions } = data;
    const totalRows = interval * repetitions;
    const rows = [];
    let currentStitches = startingStitches;

    for (let i = 1; i <= totalRows; i++) {
      const side = construction === CONSTRUCTION_TYPES.ROUND ? 'RS' : (i % 2 === 1 ? 'RS' : 'WS');
      const isDecreaseRow = i % interval === 0;

      if (isDecreaseRow) {
        currentStitches -= stitchCount;
        const decreaseInstruction = this._getDecreaseInstruction(location, stitchCount, side);
        
        rows.push({
          rowNumber: i,
          instruction: decreaseInstruction,
          stitchCount: currentStitches,
          side: side,
          isActionRow: true
        });
      } else {
        rows.push({
          rowNumber: i,
          instruction: this._getBaseInstruction('stockinette', side),
          stitchCount: currentStitches,
          side: side,
          isActionRow: false
        });
      }
    }

    return {
      totalRows: totalRows,
      startingStitches: startingStitches,
      endingStitches: currentStitches,
      rows: rows
    };
  }

  /**
   * Interval Increase calculation
   */
  _calculateIntervalIncrease(data, startingStitches, construction) {
    const { stitchCount, location, interval, repetitions } = data;
    const totalRows = interval * repetitions;
    const rows = [];
    let currentStitches = startingStitches;

    for (let i = 1; i <= totalRows; i++) {
      const side = construction === CONSTRUCTION_TYPES.ROUND ? 'RS' : (i % 2 === 1 ? 'RS' : 'WS');
      const isIncreaseRow = i % interval === 0;

      if (isIncreaseRow) {
        currentStitches += stitchCount;
        const increaseInstruction = this._getIncreaseInstruction(location, stitchCount, side);
        
        rows.push({
          rowNumber: i,
          instruction: increaseInstruction,
          stitchCount: currentStitches,
          side: side,
          isActionRow: true
        });
      } else {
        rows.push({
          rowNumber: i,
          instruction: this._getBaseInstruction('stockinette', side),
          stitchCount: currentStitches,
          side: side,
          isActionRow: false
        });
      }
    }

    return {
      totalRows: totalRows,
      startingStitches: startingStitches,
      endingStitches: currentStitches,
      rows: rows
    };
  }

  /**
   * Stitch Pattern calculation (e.g., "Knit in seed stitch for 20 rows")
   */
  _calculateStitchPattern(data, startingStitches, construction) {
    const { patternName, rows: totalRows } = data;
    const rows = [];

    for (let i = 1; i <= totalRows; i++) {
      const side = construction === CONSTRUCTION_TYPES.ROUND ? 'RS' : (i % 2 === 1 ? 'RS' : 'WS');
      
      // For garter stitch in the round, we need to alternate knit/purl rounds
      let actualSide = side;
      if (construction === CONSTRUCTION_TYPES.ROUND && patternName === 'garter') {
        actualSide = (i % 2 === 1) ? 'RS' : 'WS'; // Force alternation for garter in round
      }
      
      rows.push({
        rowNumber: i,
        instruction: this._getBaseInstruction(patternName, actualSide, construction),
        stitchCount: startingStitches,
        side: actualSide,
        isActionRow: false
      });
    }

    return {
      totalRows: totalRows,
      startingStitches: startingStitches,
      endingStitches: startingStitches,
      rows: rows
    };
  }

  /**
   * Measurement calculation (e.g., "Knit flat in garter st for 5 inches")
   */
  _calculateMeasurement(data, startingStitches, construction) {
    const { patternName, inches } = data;
    
    // For now, return placeholder - will implement gauge learning later
    return {
      totalRows: null, // Will be determined by gauge
      startingStitches: startingStitches,
      endingStitches: startingStitches,
      measurementTarget: inches,
      patternName: patternName,
      construction: construction,
      isLearning: true,
      rows: [] // Will be populated as user knits
    };
  }

  /**
   * Get base instruction for stitch pattern and side
   */
  _getBaseInstruction(patternName, side, construction = CONSTRUCTION_TYPES.FLAT) {
    const pattern = this.defaultRowInstructions[patternName] || this.defaultRowInstructions.stockinette;
    const constructionType = construction === CONSTRUCTION_TYPES.ROUND ? 'round' : 'flat';
    const instructions = pattern[constructionType] || pattern.flat || pattern;
    
    return side === 'RS' ? instructions.rs : instructions.ws;
  }

  /**
   * Generate decrease instruction based on location
   */
  _getDecreaseInstruction(location, stitchCount, side) {
    if (location === 'end') {
      if (stitchCount === 1) {
        return side === 'RS' ? 'Knit to last 2 stitches, K2tog' : 'Purl to last 2 stitches, P2tog';
      } else {
        return `${this._getBaseInstruction('stockinette', side)}, decrease ${stitchCount} stitches at end`;
      }
    } else if (location === 'beg' || location === 'beginning') {
      if (stitchCount === 1) {
        return side === 'RS' ? 'SSK, knit to end' : 'SSP, purl to end';
      } else {
        return `Decrease ${stitchCount} stitches at beginning, ${this._getBaseInstruction('stockinette', side)} to end`;
      }
    }
    return `Decrease ${stitchCount} stitches`;
  }

  /**
   * Generate increase instruction based on location
   */
  _getIncreaseInstruction(location, stitchCount, side) {
    if (location === 'end') {
      return `${this._getBaseInstruction('stockinette', side)}, M1 ${stitchCount} time${stitchCount > 1 ? 's' : ''} at end`;
    } else if (location === 'beg' || location === 'beginning') {
      return `M1 ${stitchCount} time${stitchCount > 1 ? 's' : ''} at beginning, ${this._getBaseInstruction('stockinette', side)} to end`;
    }
    return `Increase ${stitchCount} stitches`;
  }
}

export default PatternCalculator;