/**
 * Advanced Pattern Calculator - Unified engine for all shaping patterns
 * Combines multi-point, even distribution, stepped bind-off, and sequential shaping
 */

// Pattern Types
export const ADVANCED_PATTERN_TYPES = {
  MULTI_POINT_SHAPING: 'multi_point_shaping',
  EVEN_DISTRIBUTION: 'even_distribution', 
  STEPPED_BINDOFF: 'stepped_bindoff',
  SEQUENTIAL_SHAPING: 'sequential_shaping',
  MANUAL: 'manual'
};

export const CONSTRUCTION_TYPES = {
  FLAT: 'flat',
  ROUND: 'round'
};

// Default technique mapping
const DEFAULT_TECHNIQUES = {
  decrease: {
    beginning: 'SSK',
    end: 'K2tog', 
    center: 'CDD'
  },
  increase: {
    beginning: 'M1L',
    end: 'M1R',
    center: 'M1'
  }
};

// Multi-Point Shaping Calculator
class MultiPointCalculator {
  calculateMultiPointShaping(shapingConfig, startingStitches, construction) {
    const { frequency, points, shapingType } = shapingConfig;
    const rows = [];
    let currentStitches = startingStitches;
    let rowNumber = 1;
    
    // Apply default techniques
    const enhancedPoints = this.applyDefaultTechniques(points, shapingType);
    
    for (let cycle = 0; cycle < frequency.times; cycle++) {
      // Generate shaping row
      const shapingRow = this.generateShapingRow(
        rowNumber, 
        enhancedPoints, 
        currentStitches, 
        construction
      );
      
      rows.push(shapingRow);
      currentStitches += this.calculateNetStitchChange(enhancedPoints);
      rowNumber++;
      
      // Generate plain rows between shaping
      for (let plain = 1; plain < frequency.every; plain++) {
        rows.push(this.generatePlainRow(rowNumber, currentStitches, construction));
        rowNumber++;
      }
    }
    
    return {
      success: true,
      rows,
      totalRows: rows.length,
      startingStitches,
      endingStitches: currentStitches,
      netStitchChange: currentStitches - startingStitches
    };
  }
  
  applyDefaultTechniques(points, shapingType) {
    return points.map(point => ({
      ...point,
      technique: point.technique || DEFAULT_TECHNIQUES[shapingType][point.position] || 
                 (shapingType === 'decrease' ? 'K2tog' : 'M1')
    }));
  }
  
  generateShapingRow(rowNumber, shapingPoints, stitches, construction) {
    const instruction = this.buildShapingInstruction(shapingPoints, stitches);
    const netChange = this.calculateNetStitchChange(shapingPoints);
    
    return {
      rowNumber,
      instruction,
      stitchCount: stitches + netChange,
      side: construction === 'flat' ? (rowNumber % 2 === 1 ? 'RS' : 'WS') : 'RS',
      isShapingRow: true,
      shapingPoints: shapingPoints
    };
  }
  
  generatePlainRow(rowNumber, stitches, construction) {
    const side = construction === 'flat' ? (rowNumber % 2 === 1 ? 'RS' : 'WS') : 'RS';
    const instruction = side === 'RS' ? 'Knit' : 'Purl';
    
    return {
      rowNumber,
      instruction,
      stitchCount: stitches,
      side,
      isShapingRow: false
    };
  }
  
  buildShapingInstruction(shapingPoints, totalStitches) {
    // Sort points by position for logical instruction building
    const sortedPoints = [...shapingPoints].sort((a, b) => {
      const order = { beginning: 0, center: 1, end: 2 };
      return (order[a.position] || 99) - (order[b.position] || 99);
    });
    
    let parts = [];
    let stitchesAccountedFor = 0;
    
    // Handle beginning points
    const beginningPoints = sortedPoints.filter(p => p.position === 'beginning');
    beginningPoints.forEach(point => {
      if (point.borderStitches > 0) {
        parts.push(`K${point.borderStitches}`);
        stitchesAccountedFor += point.borderStitches;
      }
      parts.push(point.technique);
      stitchesAccountedFor += this.getTechniqueStitchConsumption(point.technique);
    });
    
    // Handle center points
    const centerPoints = sortedPoints.filter(p => p.position === 'center');
    
    // Handle end points
    const endPoints = sortedPoints.filter(p => p.position === 'end');
    let endStitchReservation = 0;
    endPoints.forEach(point => {
      const techniqueStitches = this.getTechniqueStitchConsumption(point.technique);
      endStitchReservation += techniqueStitches + (point.borderStitches || 0);
    });
    
    // Calculate middle section
    let availableMiddleStitches = totalStitches - stitchesAccountedFor - endStitchReservation;
    
    // Handle center shaping (split middle section)
    if (centerPoints.length > 0) {
      const preCenter = Math.floor(availableMiddleStitches / 2);
      
      if (preCenter > 0) {
        parts.push(`knit ${preCenter}`);
      }
      
      centerPoints.forEach(point => {
        parts.push(point.technique);
        const techniqueStitches = this.getTechniqueStitchConsumption(point.technique);
        availableMiddleStitches -= techniqueStitches;
      });
      
      const postCenter = availableMiddleStitches - preCenter;
      if (postCenter > 0) {
        parts.push(`knit ${postCenter}`);
      }
    } else if (availableMiddleStitches > 0) {
      // No center shaping, just knit to end
      if (endPoints.length > 0) {
        parts.push(`knit to last ${endStitchReservation}`);
      } else {
        parts.push(`knit ${availableMiddleStitches}`);
      }
    }
    
    // Handle end points
    endPoints.forEach(point => {
      parts.push(point.technique);
      if (point.borderStitches > 0) {
        parts.push(`K${point.borderStitches}`);
      }
    });
    
    return parts.join(', ');
  }
  
  getTechniqueStitchConsumption(technique) {
    const consumptionMap = {
      'SSK': 2, 'K2tog': 2, 'CDD': 3, 'K3tog': 3,
      'M1L': 0, 'M1R': 0, 'M1': 0, 'KFB': 1, 'YO': 0
    };
    return consumptionMap[technique] || 1;
  }
  
  calculateNetStitchChange(shapingPoints) {
    return shapingPoints.reduce((total, point) => total + point.stitchChange, 0);
  }
}

// Even Distribution Calculator
class EvenDistributionCalculator {
  calculateEvenDistribution(currentStitches, targetChange, distributionType = 'increase') {
    const targetStitches = distributionType === 'target' ? targetChange : currentStitches + targetChange;
    const actualChange = targetStitches - currentStitches;
    const changeCount = Math.abs(actualChange);
    
    if (changeCount === 0) {
      return { success: false, error: 'No stitch change needed' };
    }
    
    if (changeCount >= currentStitches) {
      return { success: false, error: 'Cannot distribute more changes than available stitches' };
    }
    
    const spacing = this.calculateOptimalSpacing(currentStitches, changeCount);
    const instruction = this.generateDistributionInstruction(
      currentStitches, changeCount, spacing, actualChange > 0 ? 'increase' : 'decrease'
    );
    
    return {
      success: true,
      currentStitches,
      targetStitches,
      changeCount,
      changeType: actualChange > 0 ? 'increase' : 'decrease',
      spacing,
      instruction,
      verification: this.verifyDistribution(currentStitches, spacing, changeCount),
      // Single row result for integration
      rows: [{
        rowNumber: 1,
        instruction,
        stitchCount: targetStitches,
        side: 'RS',
        isShapingRow: true
      }],
      totalRows: 1,
      startingStitches: currentStitches,
      endingStitches: targetStitches
    };
  }
  
  calculateOptimalSpacing(totalStitches, changeCount) {
    const idealSpacing = totalStitches / changeCount;
    const baseSpacing = Math.floor(idealSpacing);
    const remainder = totalStitches % changeCount;
    
    const spacingPattern = [];
    const largerSpacing = baseSpacing + 1;
    const largerSpacingCount = totalStitches - (baseSpacing * changeCount);
    const largerInterval = changeCount > 1 ? Math.floor(changeCount / largerSpacingCount) : 1;
    
    for (let i = 0; i < changeCount; i++) {
      if (largerSpacingCount > 0 && i % largerInterval === 0 && 
          spacingPattern.filter(s => s === largerSpacing).length < largerSpacingCount) {
        spacingPattern.push(largerSpacing);
      } else {
        spacingPattern.push(baseSpacing);
      }
    }
    
    return {
      pattern: spacingPattern,
      average: idealSpacing,
      baseSpacing,
      largerSpacing,
      remainder
    };
  }
  
  generateDistributionInstruction(totalStitches, changeCount, spacing, changeType) {
    const technique = changeType === 'increase' ? 'M1' : 'K2tog';
    const actionWord = changeType === 'increase' ? 'Increase' : 'Decrease';
    const pattern = spacing.pattern;
    
    if (pattern.length === 0) return 'No changes needed';
    
    const allSame = pattern.every(s => s === pattern[0]);
    
    if (allSame) {
      const space = pattern[0];
      if (space === 1) {
        return `${actionWord} evenly: *${technique}* repeat ${changeCount} times across row`;
      } else {
        return `${actionWord} evenly: *K${space - 1}, ${technique}* repeat ${changeCount} times, knit remaining`;
      }
    } else {
      let instruction = `${actionWord} evenly: `;
      let position = 0;
      
      for (let i = 0; i < pattern.length; i++) {
        const spacing = pattern[i];
        if (i === 0) {
          instruction += `K${spacing - 1}, ${technique}`;
          position += spacing;
        } else {
          instruction += `, K${spacing - 1}, ${technique}`;
          position += spacing;
        }
      }
      
      const remaining = totalStitches - position;
      if (remaining > 0) {
        instruction += `, K${remaining}`;
      }
      
      return instruction;
    }
  }
  
  verifyDistribution(totalStitches, spacing, changeCount) {
    const totalSpacing = spacing.pattern.reduce((sum, s) => sum + s, 0);
    const actualChanges = spacing.pattern.length;
    
    return {
      totalSpacingUsed: totalSpacing,
      totalStitches,
      spacingMatch: totalSpacing === totalStitches,
      changeCountMatch: actualChanges === changeCount,
      remainingStitches: totalStitches - totalSpacing
    };
  }
}

// Stepped Bind-Off Calculator
class SteppedBindOffCalculator {
  calculateSteppedBindOff(bindOffSequence, startingStitches, construction = 'flat') {
    const rows = [];
    let currentStitches = startingStitches;
    let rowNumber = 1;
    
    for (let i = 0; i < bindOffSequence.length; i++) {
      const stitchesToBindOff = bindOffSequence[i];
      const side = construction === 'flat' ? (rowNumber % 2 === 1 ? 'RS' : 'WS') : 'RS';
      
      const instruction = this.generateBindOffInstruction(stitchesToBindOff, currentStitches, side);
      
      rows.push({
        rowNumber,
        instruction,
        stitchesToBindOff,
        stitchCountBefore: currentStitches,
        stitchCountAfter: currentStitches - stitchesToBindOff,
        side,
        isBindOffRow: true
      });
      
      currentStitches -= stitchesToBindOff;
      rowNumber++;
      
      if (currentStitches < 0) {
        return {
          success: false,
          error: `Not enough stitches at row ${rowNumber - 1}. Tried to bind off ${stitchesToBindOff} from ${currentStitches + stitchesToBindOff} stitches.`
        };
      }
    }
    
    return {
      success: true,
      startingStitches,
      endingStitches: currentStitches,
      totalStitchesBoundOff: bindOffSequence.reduce((sum, sts) => sum + sts, 0),
      totalRows: rows.length,
      bindOffSequence,
      rows
    };
  }
  
  generateBindOffInstruction(stitchesToBindOff, remainingStitches, side) {
    if (stitchesToBindOff === remainingStitches) {
      return `Bind off all remaining ${stitchesToBindOff} stitches`;
    }
    
    const remainingAfterBindOff = remainingStitches - stitchesToBindOff;
    
    if (remainingAfterBindOff > 0) {
      if (side === 'RS') {
        return `Bind off ${stitchesToBindOff} stitches, knit to end (${remainingAfterBindOff} sts remain)`;
      } else {
        return `Bind off ${stitchesToBindOff} stitches, purl to end (${remainingAfterBindOff} sts remain)`;
      }
    } else {
      return `Bind off ${stitchesToBindOff} stitches`;
    }
  }
}

// Sequential Shaping Calculator  
class SequentialShapingCalculator {
  calculateSequentialShaping(phases, startingStitches, construction = 'flat') {
    const allRows = [];
    let currentStitches = startingStitches;
    let rowNumber = 1;
    const phaseResults = [];
    
    for (let phaseIndex = 0; phaseIndex < phases.length; phaseIndex++) {
      const phase = phases[phaseIndex];
      
      const phaseResult = this.calculatePhase(phase, currentStitches, construction, rowNumber);
      
      if (!phaseResult.success) {
        return {
          success: false,
          error: `Phase ${phaseIndex + 1} failed: ${phaseResult.error}`
        };
      }
      
      allRows.push(...phaseResult.rows);
      currentStitches = phaseResult.endingStitches;
      rowNumber = phaseResult.nextRowNumber;
      
      phaseResults.push({
        phaseNumber: phaseIndex + 1,
        phase: phase,
        startingStitches: phaseResult.startingStitches,
        endingStitches: phaseResult.endingStitches,
        rowsInPhase: phaseResult.rows.length,
        netStitchChange: phaseResult.netStitchChange
      });
    }
    
    return {
      success: true,
      startingStitches,
      endingStitches: currentStitches,
      totalRows: allRows.length,
      netStitchChange: currentStitches - startingStitches,
      phases: phaseResults,
      rows: allRows
    };
  }
  
  calculatePhase(phase, startingStitches, construction, startingRowNumber) {
    const { shapingType, positions, frequency, times } = phase;
    const rows = [];
    let currentStitches = startingStitches;
    let rowNumber = startingRowNumber;
    let shapingActionsCompleted = 0;
    
    const stitchChangePerAction = positions.length * (shapingType === 'increase' ? 1 : -1);
    
    while (shapingActionsCompleted < times) {
      const side = construction === 'flat' ? (rowNumber % 2 === 1 ? 'RS' : 'WS') : 'RS';
      
      if ((rowNumber - startingRowNumber) % frequency === 0 && shapingActionsCompleted < times) {
        const instruction = this.generateShapingInstruction(shapingType, positions, currentStitches, side);
        
        rows.push({
          rowNumber,
          instruction,
          stitchCountBefore: currentStitches,
          stitchCountAfter: currentStitches + stitchChangePerAction,
          side,
          isShapingRow: true,
          shapingType,
          positions: positions.slice(),
          stitchChange: stitchChangePerAction
        });
        
        currentStitches += stitchChangePerAction;
        shapingActionsCompleted++;
        
        if (currentStitches <= 0) {
          return {
            success: false,
            error: `Not enough stitches at row ${rowNumber}. Stitch count went to ${currentStitches}.`
          };
        }
      } else {
        const instruction = side === 'RS' ? 'Knit' : 'Purl';
        
        rows.push({
          rowNumber,
          instruction,
          stitchCountBefore: currentStitches,
          stitchCountAfter: currentStitches,
          side,
          isShapingRow: false,
          stitchChange: 0
        });
      }
      
      rowNumber++;
    }
    
    return {
      success: true,
      startingStitches,
      endingStitches: currentStitches,
      netStitchChange: currentStitches - startingStitches,
      rows,
      nextRowNumber: rowNumber
    };
  }
  
  generateShapingInstruction(shapingType, positions, currentStitches, side) {
    const techniques = this.getDefaultTechniques(shapingType);
    
    if (positions.length === 1) {
      const position = positions[0];
      const technique = techniques[position];
      
      if (position === 'beginning') {
        const remaining = currentStitches - 1;
        return `${technique}, ${side === 'RS' ? 'knit' : 'purl'} ${remaining}`;
      } else if (position === 'end') {
        const beforeEnd = currentStitches - 1;
        return `${side === 'RS' ? 'Knit' : 'Purl'} ${beforeEnd}, ${technique}`;
      }
    } else if (positions.length === 2 && positions.includes('beginning') && positions.includes('end')) {
      const beginTechnique = techniques.beginning;
      const endTechnique = techniques.end;
      const middle = currentStitches - 2;
      
      return `${beginTechnique}, ${side === 'RS' ? 'knit' : 'purl'} ${middle}, ${endTechnique}`;
    }
    
    return `${shapingType} at ${positions.join(' and ')}`;
  }
  
  getDefaultTechniques(shapingType) {
    return DEFAULT_TECHNIQUES[shapingType] || DEFAULT_TECHNIQUES.decrease;
  }
}

// Main Advanced Pattern Calculator
export class AdvancedPatternCalculator {
  constructor() {
    this.multiPointCalculator = new MultiPointCalculator();
    this.evenDistributionCalculator = new EvenDistributionCalculator();
    this.steppedBindOffCalculator = new SteppedBindOffCalculator();
    this.sequentialShapingCalculator = new SequentialShapingCalculator();
  }
  
  // Multi-Point Shaping
  calculateMultiPointShaping(config, startingStitches, construction) {
    return this.multiPointCalculator.calculateMultiPointShaping(config, startingStitches, construction);
  }
  
  // Even Distribution  
  calculateEvenDistribution(currentStitches, targetChange, distributionType = 'increase') {
    return this.evenDistributionCalculator.calculateEvenDistribution(currentStitches, targetChange, distributionType);
  }
  
  // Stepped Bind-Off
  calculateSteppedBindOff(bindOffSequence, startingStitches, construction = 'flat') {
    return this.steppedBindOffCalculator.calculateSteppedBindOff(bindOffSequence, startingStitches, construction);
  }
  
  // Sequential Shaping
  calculateSequentialShaping(phases, startingStitches, construction = 'flat') {
    return this.sequentialShapingCalculator.calculateSequentialShaping(phases, startingStitches, construction);
  }
  
  // Unified calculation method
  calculateAdvancedPattern(patternConfig, startingStitches, construction = 'flat') {
    const { type } = patternConfig;
    
    try {
      switch (type) {
        case ADVANCED_PATTERN_TYPES.MULTI_POINT_SHAPING:
          return this.calculateMultiPointShaping(patternConfig.config, startingStitches, construction);
          
        case ADVANCED_PATTERN_TYPES.EVEN_DISTRIBUTION:
          return this.calculateEvenDistribution(
            startingStitches, 
            patternConfig.config.targetChange, 
            patternConfig.config.distributionType
          );
          
        case ADVANCED_PATTERN_TYPES.STEPPED_BINDOFF:
          return this.calculateSteppedBindOff(
            patternConfig.config.bindOffSequence, 
            startingStitches, 
            construction
          );
          
        case ADVANCED_PATTERN_TYPES.SEQUENTIAL_SHAPING:
          return this.calculateSequentialShaping(
            patternConfig.config.phases, 
            startingStitches, 
            construction
          );
          
        default:
          return {
            success: false,
            error: `Unknown pattern type: ${type}`
          };
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

export default AdvancedPatternCalculator;