import { useMemo } from 'react';
import PatternDetector, { PATTERN_TYPES } from '../../../shared/utils/PatternDetector';
import PatternCalculator from '../../../shared/utils/PatternCalculator';
import { AdvancedPatternCalculator, ADVANCED_PATTERN_TYPES } from '../../../shared/utils/AdvancedPatternCalculator';

export const useStepCalculation = () => {
  const detector = useMemo(() => new PatternDetector(), []);
  const calculator = useMemo(() => new PatternCalculator(), []);
  const advancedCalculator = useMemo(() => new AdvancedPatternCalculator(), []);

  const calculateEffect = useMemo(() => (wizardData, currentStitches, construction) => {
    // Handle Cast On specially - it sets the stitch count from 0
    if (wizardData.stitchPattern.pattern === 'Cast On') {
      const stitchCount = parseInt(wizardData.stitchPattern.stitchCount) || 0;
      return {
        success: true,
        totalRows: 1,
        startingStitches: 0,
        endingStitches: stitchCount,
        isCastOn: true
      };
    }
    
    // Handle Bind Off specially
    if (wizardData.stitchPattern.pattern === 'Bind Off') {
      const stitchesToBindOff = wizardData.duration.value ? parseInt(wizardData.duration.value) : currentStitches;
      return {
        success: true,
        totalRows: 1,
        startingStitches: currentStitches,
        endingStitches: Math.max(0, currentStitches - stitchesToBindOff),
        isBindOff: true
      };
    }
    
    // NEW: Handle patterns with advanced shaping using AdvancedPatternCalculator
    if (wizardData.hasShaping && wizardData.shapingConfig) {
      try {
        const { shapingMode, shapingType, positions, frequency, times, bindOffSequence, distributionType, targetChange } = wizardData.shapingConfig;
        
        // Stepped Bind-Off
        if (shapingMode === 'bindoff') {
          const bindOffResult = advancedCalculator.calculateSteppedBindOff(bindOffSequence, currentStitches, construction);
          if (bindOffResult.success) {
            return {
              success: true,
              totalRows: bindOffResult.totalRows,
              startingStitches: bindOffResult.startingStitches,
              endingStitches: bindOffResult.endingStitches,
              rows: bindOffResult.rows,
              hasShaping: true,
              shapingMode: 'bindoff'
            };
          }
        } 
        
        // Even Distribution
        else if (shapingMode === 'distribution') {
          const distributionResult = advancedCalculator.calculateEvenDistribution(
            currentStitches,
            targetChange,
            distributionType
          );
          if (distributionResult.success) {
            return {
              success: true,
              totalRows: distributionResult.totalRows,
              startingStitches: distributionResult.startingStitches,
              endingStitches: distributionResult.endingStitches,
              rows: distributionResult.rows,
              hasShaping: true,
              shapingMode: 'distribution'
            };
          }
        } 
        
        // Regular and Raglan Shaping - use Multi-Point Shaping
        else if (shapingMode === 'regular' || shapingMode === 'raglan') {
          const shapingConfig = {
            frequency: { every: frequency, times: times },
            points: [],
            shapingType
          };

          // Configure points based on shaping mode
          if (shapingMode === 'raglan') {
            // Raglan: 4-point shaping (decrease 4 stitches per shaping row)
            shapingConfig.points = [
              { position: 'beginning', technique: null, stitchChange: shapingType === 'increase' ? 1 : -1, borderStitches: 1 },
              { position: 'center', technique: null, stitchChange: shapingType === 'increase' ? 2 : -2, borderStitches: 0 },
              { position: 'end', technique: null, stitchChange: shapingType === 'increase' ? 1 : -1, borderStitches: 1 }
            ];
          } else {
            // Regular shaping
            if (positions.includes('both_ends')) {
              shapingConfig.points = [
                { position: 'beginning', technique: null, stitchChange: shapingType === 'increase' ? 1 : -1, borderStitches: 1 },
                { position: 'end', technique: null, stitchChange: shapingType === 'increase' ? 1 : -1, borderStitches: 1 }
              ];
            } else {
              shapingConfig.points = positions.map(pos => ({
                position: pos,
                technique: null,
                stitchChange: shapingType === 'increase' ? 1 : -1,
                borderStitches: pos === 'center' ? 0 : 1
              }));
            }
          }

          const multiPointResult = advancedCalculator.calculateMultiPointShaping(shapingConfig, currentStitches, construction);
          if (multiPointResult.success) {
            return {
              success: true,
              totalRows: multiPointResult.totalRows,
              startingStitches: multiPointResult.startingStitches,
              endingStitches: multiPointResult.endingStitches,
              rows: multiPointResult.rows,
              hasShaping: true,
              shapingMode: shapingMode,
              netStitchChange: multiPointResult.netStitchChange
            };
          }
        }
      } catch (error) {
        console.error('Advanced shaping calculation error:', error);
      }
    }
    
    // Handle patterns with repeats (Lace, Cable, Colorwork)
    if (wizardData.duration.type === 'repeats' && wizardData.stitchPattern.rowsInPattern) {
      const rowsPerRepeat = parseInt(wizardData.stitchPattern.rowsInPattern) || 1;
      const numberOfRepeats = parseInt(wizardData.duration.value) || 1;
      const totalRows = rowsPerRepeat * numberOfRepeats;
      
      return {
        success: true,
        totalRows: totalRows,
        startingStitches: currentStitches,
        endingStitches: currentStitches,
        isPatternRepeat: true
      };
    }
    
    try {
      // Use existing PatternDetector for other patterns
      const instruction = generateInstructionForDetection(wizardData);
      const detection = detector.detectPattern(instruction);
      
      if (detection.type !== PATTERN_TYPES.MANUAL) {
        const calculation = calculator.calculatePattern(
          detection.type,
          detection.parsedData,
          currentStitches,
          construction
        );
        
        return {
          success: true,
          detection,
          calculation,
          totalRows: calculation.totalRows,
          startingStitches: currentStitches,
          endingStitches: calculation.endingStitches
        };
      }
    } catch (error) {
      console.error('Calculation error:', error);
    }
    
    // Fallback for patterns we can't calculate yet
    return {
      success: false,
      totalRows: wizardData.duration.type === 'rows' ? parseInt(wizardData.duration.value) : null,
      startingStitches: currentStitches,
      endingStitches: currentStitches
    };
  }, [detector, calculator, advancedCalculator]);

  const generateInstructionForDetection = (wizardData) => {
    // Simple instruction generation for pattern detection
    const pattern = wizardData.stitchPattern.pattern === 'Other' ? 
      wizardData.stitchPattern.customText : 
      wizardData.stitchPattern.pattern;
    
    let instruction = pattern;
    
    if (wizardData.duration.type === 'rows') {
      instruction += ` for ${wizardData.duration.value} rows`;
    } else if (wizardData.duration.type === 'measurement') {
      instruction += ` until piece measures ${wizardData.duration.value} ${wizardData.duration.units}`;
    }
    
    return instruction;
  };

  return { calculateEffect };
};