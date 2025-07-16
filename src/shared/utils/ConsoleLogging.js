// Console Logging Standards Implementation
// This file provides utilities and examples for standardized console output

// Standardized console logging utility
export const IntelliKnitLogger = {
  // Error logs - for actual errors that need attention
  error: (description, error = null, additionalData = null) => {
    const args = ['❌ IntelliKnit Error:', description];
    if (error) args.push(error);
    if (additionalData) args.push(additionalData);
    console.error(...args);
  },

  // Success logs - for positive confirmations of operations
  success: (description, data = null) => {
    const args = ['✅ IntelliKnit:', description];
    if (data) args.push(data);
    console.log(...args);
  },

  // Debug logs - for development and troubleshooting (should be removable in production)
  debug: (category, details = null) => {
    const args = [`🔧 ${category} debug:`, details || ''];
    console.log(...args);
  },

  // Info logs - for general information
  info: (description, data = null) => {
    const args = ['ℹ️ IntelliKnit:', description];
    if (data) args.push(data);
    console.log(...args);
  },

  // Warning logs - for potential issues that don't break functionality
  warn: (description, data = null) => {
    const args = ['⚠️ IntelliKnit Warning:', description];
    if (data) args.push(data);
    console.warn(...args);
  }
};

// EXAMPLES OF CORRECT USAGE:

// ❌ BEFORE (inconsistent):
// console.log('Saving config:', config);
// console.error('Failed to load projects:', error);
// console.log('🔧 Shaping debug:', details);

// ✅ AFTER (standardized):
// IntelliKnitLogger.debug('Shaping', details);
// IntelliKnitLogger.error('Failed to load projects', error);
// IntelliKnitLogger.success('Configuration saved', config);

// SPECIFIC EXAMPLES FOR COMMON SCENARIOS:

// Project Operations
export const logProjectOperation = {
  created: (projectName) => IntelliKnitLogger.success(`Project created: "${projectName}"`),
  loaded: (count) => IntelliKnitLogger.success(`Loaded ${count} projects from storage`),
  saved: () => IntelliKnitLogger.success('Projects saved to storage'),
  migrated: (count) => IntelliKnitLogger.success(`Migrated ${count} projects to new architecture`),
  loadFailed: (error) => IntelliKnitLogger.error('Failed to load projects', error),
  saveFailed: (error) => IntelliKnitLogger.error('Failed to save projects', error),
  deleted: (projectName) => IntelliKnitLogger.success(`Project deleted: "${projectName}"`)
};

// Wizard Operations  
export const logWizardOperation = {
  stepChanged: (from, to) => IntelliKnitLogger.debug('Navigation', `Step ${from} → ${to}`),
  configSaved: (type) => IntelliKnitLogger.debug('Configuration', `${type} config saved`),
  validationFailed: (step, errors) => IntelliKnitLogger.debug('Validation', `Step ${step} validation failed: ${errors.join(', ')}`),
  wizardCompleted: (stepType) => IntelliKnitLogger.success(`Step wizard completed: ${stepType}`),
  wizardCanceled: () => IntelliKnitLogger.debug('Navigation', 'Wizard canceled by user'),
  stateCleanup: (reason) => IntelliKnitLogger.debug('State Management', `Cleanup triggered: ${reason}`),
  navigationError: (error) => IntelliKnitLogger.error('Navigation error in wizard', error)
};

// Shaping Operations
export const logShapingOperation = {
  configStarted: (type) => IntelliKnitLogger.debug('Shaping', `Started ${type} configuration`),
  calculationCompleted: (type, result) => IntelliKnitLogger.debug('Shaping', `${type} calculation completed`, result),
  phaseAdded: (type) => IntelliKnitLogger.debug('Shaping', `Added ${type} phase`),
  phaseValidationFailed: (error) => IntelliKnitLogger.debug('Shaping', `Phase validation failed: ${error}`),
  wizardCompleted: (type) => IntelliKnitLogger.success(`Shaping configuration completed: ${type}`),
  legacyDataMigrated: () => IntelliKnitLogger.debug('Shaping', 'Legacy shaping data migrated to new format')
};

// Storage Operations
export const logStorageOperation = {
  read: (key) => IntelliKnitLogger.debug('Storage', `Reading ${key}`),
  write: (key) => IntelliKnitLogger.debug('Storage', `Writing ${key}`),
  readFailed: (key, error) => IntelliKnitLogger.error(`Failed to read ${key} from storage`, error),
  writeFailed: (key, error) => IntelliKnitLogger.error(`Failed to write ${key} to storage`, error),
  cleared: () => IntelliKnitLogger.success('Storage cleared'),
  migrated: (from, to) => IntelliKnitLogger.success(`Storage migrated from ${from} to ${to}`)
};

// Component Lifecycle
export const logComponentOperation = {
  mounted: (componentName) => IntelliKnitLogger.debug('Component', `${componentName} mounted`),
  unmounted: (componentName) => IntelliKnitLogger.debug('Component', `${componentName} unmounted`),
  errorCaught: (componentName, error) => IntelliKnitLogger.error(`Error in ${componentName}`, error),
  stateUpdated: (componentName, updateType) => IntelliKnitLogger.debug('Component', `${componentName} ${updateType} updated`),
  propsChanged: (componentName, changedProps) => IntelliKnitLogger.debug('Component', `${componentName} props changed: ${changedProps.join(', ')}`)
};

// Pattern Processing
export const logPatternOperation = {
  detected: (patternType) => IntelliKnitLogger.debug('Pattern Detection', `Detected ${patternType} pattern`),
  calculated: (patternType, result) => IntelliKnitLogger.debug('Pattern Calculation', `${patternType} calculated`, result),
  generationCompleted: (stepType) => IntelliKnitLogger.debug('Pattern Generation', `${stepType} generation completed`),
  calculationFailed: (patternType, error) => IntelliKnitLogger.error(`Pattern calculation failed for ${patternType}`, error),
  invalidPattern: (input) => IntelliKnitLogger.warn('Invalid pattern input detected', input)
};

// AUDIT CHECKLIST FOR EXISTING CODE:
/*
1. Search for: console.log( - Replace with appropriate IntelliKnitLogger method
2. Search for: console.error( - Replace with IntelliKnitLogger.error
3. Search for: console.warn( - Replace with IntelliKnitLogger.warn
4. Search for: console.info( - Replace with IntelliKnitLogger.info
5. Search for: console.debug( - Replace with IntelliKnitLogger.debug

SPECIFIC PATTERNS TO FIND AND REPLACE:

❌ console.log('🔧 Shaping debug:', details)
✅ IntelliKnitLogger.debug('Shaping', details)

❌ console.error('Error saving projects:', error)
✅ IntelliKnitLogger.error('Failed to save projects', error)

❌ console.log('✅ Migrated', count, 'projects')
✅ IntelliKnitLogger.success(`Migrated ${count} projects to new architecture`)

❌ console.log('About to render StepPreview...')
✅ IntelliKnitLogger.debug('Rendering', 'About to render StepPreview')

❌ console.warn('Invalid navigation state...')
✅ IntelliKnitLogger.warn('Invalid navigation state detected', stateDetails)
*/

// PRODUCTION CONSIDERATIONS:
// In production builds, debug logs can be removed by setting a flag:
export const ENABLE_DEBUG_LOGS = process.env.NODE_ENV === 'development';

// Conditional debug logging for production optimization
export const IntelliKnitLoggerProduction = {
  ...IntelliKnitLogger,
  debug: ENABLE_DEBUG_LOGS ? IntelliKnitLogger.debug : () => {},
};

// REGEX PATTERNS FOR CODE SEARCH:
/*
To find and fix inconsistent console statements, use these regex patterns:

1. Find all console.log statements:
   console\.log\([^)]*\)

2. Find all console.error statements:
   console\.error\([^)]*\)

3. Find console statements with emoji prefixes:
   console\.[a-z]+\(['"]\s*[🔧✅❌⚠️📝]\s*[^'"]*['"][^)]*\)

4. Find debug-style console statements:
   console\.log\(['"]\s*🔧[^'"]*['"][^)]*\)

5. Find error-style console statements:
   console\.error\(['"]\s*❌[^'"]*['"][^)]*\)
*/

export default IntelliKnitLogger;