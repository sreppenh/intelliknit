/**
 * PatternDetector - Analyzes text input to identify calculable knitting patterns
 */

export const PATTERN_TYPES = {
  CAST_ON: 'CAST_ON',
  BIND_OFF: 'BIND_OFF', 
  SIMPLE_INCREASE: 'SIMPLE_INCREASE',
  SIMPLE_DECREASE: 'SIMPLE_DECREASE',
  INTERVAL_DECREASE: 'INTERVAL_DECREASE',
  INTERVAL_INCREASE: 'INTERVAL_INCREASE',
  REPEAT_ACROSS_ROW: 'REPEAT_ACROSS_ROW',
  REPEATING_SEQUENCE: 'REPEATING_SEQUENCE',
  STITCH_PATTERN: 'STITCH_PATTERN',
  MEASUREMENT: 'MEASUREMENT',
  MANUAL: 'MANUAL'
};

export const STITCH_PATTERNS = {
  STOCKINETTE: 'stockinette',
  GARTER: 'garter', 
  SEED: 'seed',
  RIB_1x1: 'rib_1x1',
  RIB_2x2: 'rib_2x2'
};

export const CONSTRUCTION_TYPES = {
  FLAT: 'flat',
  ROUND: 'round'
};

class PatternDetector {
  constructor() {
    this.patterns = {
      // Cast On patterns
      [PATTERN_TYPES.CAST_ON]: [
        /cast\s+on\s+(\d+)\s+st(?:itch)?(?:es)?/i,
        /co\s+(\d+)\s+st(?:s)?/i
      ],

      // Bind Off patterns  
      [PATTERN_TYPES.BIND_OFF]: [
        /bind\s+off\s+(\d+)\s+st(?:s|itches?)?\s+at\s+(?:the\s+)?(?:beg|beginning)\s+of\s+(?:the\s+)?next\s+(\d+)\s+rows?/i,
        /bind\s+off\s+(\d+)\s+st(?:s|itches?)?/i,
        /bo\s+(\d+)\s+st(?:s)?\s+at\s+(?:the\s+)?(?:beg|beginning)\s+of\s+(?:the\s+)?next\s+(\d+)\s+rows?/i,
        /bo\s+(\d+)\s+st(?:s)?/i
      ],

      // Repeating Sequence patterns (new!)
      [PATTERN_TYPES.REPEATING_SEQUENCE]: [
        /repeat\s+(?:the\s+)?last\s+(\d+)\s+rows?\s+(\d+)\s+more\s+times?/i,
        /repeat\s+(?:these\s+)?(\d+)\s+rows?\s+(\d+)\s+(?:more\s+)?times?/i,
        /repeat\s+rows?\s+\d+(?:\s*-\s*\d+)?\s+(\d+)\s+(?:more\s+)?times?/i
      ],

      // Repeat Across Row patterns (new!)
      [PATTERN_TYPES.REPEAT_ACROSS_ROW]: [
        /\[(.*?)\],?\s*rep(?:eat)?\s+to\s+last\s+(\d+)\s+st(?:s)?(?:,\s*(.*))?/i,
        /\[(.*?)\],?\s*rep(?:eat)?\s+to\s+last\s+st(?:itch)?(?:,\s*(.*))?/i,
        /\[(.*?)\],?\s*rep(?:eat)?\s+to\s+end(?:,\s*(.*))?/i,
        /\[(.*?)\]\s*(?:across|to\s+end)/i,
        /\((.*?)\)\s*rep(?:eat)?\s+to\s+last\s+(\d+)\s+st(?:s)?(?:,\s*(.*))?/i,
        /\((.*?)\)\s*rep(?:eat)?\s+to\s+last\s+st(?:itch)?(?:,\s*(.*))?/i,
        /\((.*?)\)\s*rep(?:eat)?\s+to\s+end/i
      ],

      // Interval Decrease (our complex example)
      [PATTERN_TYPES.INTERVAL_DECREASE]: [
        /dec(?:rease)?\s+(?:(\d+)\s+st(?:s)?\s+)?at\s+(?:the\s+)?(end|beg|beginning)\s+of\s+(?:each\s+)?(?:the\s+)?(\d+)(?:st|nd|rd|th)\s+row\s+(\d+)\s+times?/i,
        /dec(?:rease)?\s+(\d+)\s+st(?:s)?\s+every\s+(\d+)(?:st|nd|rd|th)\s+row\s+(\d+)\s+times?/i
      ],

      // Interval Increase
      [PATTERN_TYPES.INTERVAL_INCREASE]: [
        /inc(?:rease)?\s+(?:(\d+)\s+st(?:s)?\s+)?at\s+(?:the\s+)?(end|beg|beginning)\s+of\s+(?:each\s+)?(?:the\s+)?(\d+)(?:st|nd|rd|th)\s+row\s+(\d+)\s+times?/i,
        /inc(?:rease)?\s+(\d+)\s+st(?:s)?\s+every\s+(\d+)(?:st|nd|rd|th)\s+row\s+(\d+)\s+times?/i
      ],

      // Stitch Pattern rows
      [PATTERN_TYPES.STITCH_PATTERN]: [
        /(?:knit\s+in\s+|work\s+in\s+)?(stockinette|garter|seed|moss)(?:\s+st(?:itch)?)?(?:\s+for)?\s+(\d+)\s+rows?/i,
        /(?:knit\s+in\s+|work\s+in\s+)?garter\s+st(?:itch)?\s+(?:for\s+)?(\d+)\s+rows?/i,
        /(?:knit\s+in\s+|work\s+in\s+)?(?:st\s+st|stockinette)\s+(?:for\s+)?(\d+)\s+rows?/i,
        /(?:knit\s+in\s+|work\s+in\s+)?(\d+k[,\s]*\d+p|k\d+[,\s]*p\d+)\s+rib(?:\s+for)?\s+(\d+)\s+rows?/i,
        /knit\s+(\d+)\s+rows?/i,
        /knit\s+across\s+for\s+(\d+)\s+rows?/i
      ],

      // Measurement-based instructions
      [PATTERN_TYPES.MEASUREMENT]: [
        /(?:knit|work)(?:\s+(?:in|flat))?\s+(?:in\s+)?(stockinette|garter|seed|moss)(?:\s+st(?:itch)?)?(?:\s+for)?\s+(\d+(?:\.\d+)?)\s+inch(?:es)?/i,
        /(?:knit|work)\s+(?:flat\s+)?(?:in\s+)?(stockinette|garter|seed|moss)(?:\s+st(?:itch)?)?(?:\s+for)?\s+(\d+(?:\.\d+)?)\s+(?:inch(?:es)?|")/i
      ]
    };
  }

  /**
   * Analyze input text and return pattern type + extracted data
   */
  detectPattern(inputText) {
    const cleanText = inputText.trim();
    
    for (const [patternType, regexes] of Object.entries(this.patterns)) {
      for (const regex of regexes) {
        const match = cleanText.match(regex);
        if (match) {
          return {
            type: patternType,
            confidence: 'high',
            match: match,
            originalText: cleanText,
            parsedData: this._parseMatch(patternType, match)
          };
        }
      }
    }

    // No pattern detected - return manual
    return {
      type: PATTERN_TYPES.MANUAL,
      confidence: 'none',
      originalText: cleanText,
      parsedData: { description: cleanText }
    };
  }

  /**
   * Parse regex matches into structured data
   */
  _parseMatch(patternType, match) {
    switch (patternType) {
      case PATTERN_TYPES.CAST_ON:
        return {
          stitchCount: parseInt(match[1]),
          needleSize: this._extractNeedleSize(match.input)
        };

      case PATTERN_TYPES.BIND_OFF:
        // Check if we captured the multi-row pattern first
        if (match[2]) {
          // "bind off X sts at beg of next Y rows"
          return {
            stitchCount: parseInt(match[1]),
            rows: parseInt(match[2]),
            location: 'beginning'
          };
        }
        // Simple "bind off X stitches"
        return {
          stitchCount: parseInt(match[1])
        };

      case PATTERN_TYPES.REPEATING_SEQUENCE:
        return {
          sequenceLength: parseInt(match[1]),
          additionalRepeats: parseInt(match[2]),
          totalRepeats: parseInt(match[2]) + 1 // +1 for the initial sequence
        };

      case PATTERN_TYPES.REPEAT_ACROSS_ROW:
        // Handle different regex capture groups
        if (match[2] && !isNaN(parseInt(match[2]))) {
          // Pattern with numbered stitches: "rep to last 3 sts"
          return {
            repeatPattern: match[1].trim(),
            remainingStitches: parseInt(match[2]),
            afterRepeat: match[3] ? match[3].trim() : null
          };
        } else if (match[2] && isNaN(parseInt(match[2]))) {
          // Pattern with "rep to last st, something"
          return {
            repeatPattern: match[1].trim(),
            remainingStitches: 1, // "last st" = 1 stitch
            afterRepeat: match[2].trim()
          };
        } else {
          // Pattern with "rep to end" or similar
          return {
            repeatPattern: match[1].trim(),
            remainingStitches: 0,
            afterRepeat: match[2] ? match[2].trim() : null
          };
        }
        return {
          stitchCount: match[1] ? parseInt(match[1]) : 1, // Default to 1 if not specified
          location: match[2] || 'end',
          interval: parseInt(match[3]),
          repetitions: parseInt(match[4])
        };

      case PATTERN_TYPES.INTERVAL_INCREASE:
        return {
          stitchCount: match[1] ? parseInt(match[1]) : 1,
          location: match[2] || 'end', 
          interval: parseInt(match[3]),
          repetitions: parseInt(match[4])
        };

      case PATTERN_TYPES.STITCH_PATTERN:
        // Handle different stitch pattern formats
        if (match[1] && match[2]) {
          // Named pattern with rows: "garter stitch for 20 rows"
          return {
            patternName: match[1].toLowerCase(),
            rows: parseInt(match[2])
          };
        } else if (match[1] && !match[2] && !isNaN(parseInt(match[1]))) {
          // Just "knit X rows" 
          return {
            patternName: 'stockinette',
            rows: parseInt(match[1])
          };
        } else if (match[1] && match[1].toLowerCase().includes('garter')) {
          // "garter stitch for X rows"
          return {
            patternName: 'garter',
            rows: parseInt(match[2] || match[1].match(/\d+/)?.[0])
          };
        } else if (match[1] && (match[1].toLowerCase().includes('st st') || match[1].toLowerCase().includes('stockinette'))) {
          // "st st for X rows" or "stockinette for X rows"
          return {
            patternName: 'stockinette',
            rows: parseInt(match[2] || match[1].match(/\d+/)?.[0])
          };
        } else {
          // Fallback
          return {
            patternName: 'stockinette',
            rows: parseInt(match[2] || match[1])
          };
        }

      case PATTERN_TYPES.MEASUREMENT:
        return {
          patternName: match[1] ? match[1].toLowerCase() : 'stockinette',
          inches: parseFloat(match[2]),
          construction: this._detectConstruction(match.input)
        };

      default:
        return {};
    }
  }

  /**
   * Extract needle size if mentioned
   */
  _extractNeedleSize(text) {
    const needleMatch = text.match(/us\s+(\d+(?:\.\d+)?)|(\d+(?:\.\d+)?)\s*mm/i);
    if (needleMatch) {
      return needleMatch[1] ? `US ${needleMatch[1]}` : `${needleMatch[2]}mm`;
    }
    return null;
  }

  /**
   * Detect if knitting flat or in the round
   */
  _detectConstruction(text) {
    if (text.match(/flat|back\s+and\s+forth|turn/i)) {
      return CONSTRUCTION_TYPES.FLAT;
    }
    if (text.match(/round|circular|in\s+the\s+round/i)) {
      return CONSTRUCTION_TYPES.ROUND;
    }
    return CONSTRUCTION_TYPES.FLAT; // Default assumption
  }

  /**
   * Get list of supported pattern types for UI
   */
  getSupportedPatterns() {
    return Object.values(PATTERN_TYPES).filter(type => type !== PATTERN_TYPES.MANUAL);
  }
}

export default PatternDetector;