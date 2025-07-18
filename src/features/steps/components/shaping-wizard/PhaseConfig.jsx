import React, { useState } from 'react';
import IncrementInput from '../../../../shared/components/IncrementInput';
import { PhaseCalculationService } from '../../../../shared/utils/PhaseCalculationService';
import IntelliKnitLogger from '../../../../shared/utils/ConsoleLogging';
import PhaseConfigSummary from './PhaseConfigSummary';
import PhaseConfigForm from './PhaseConfigForm';
import PhaseConfigTypeSelector from './PhaseConfigTypeSelector';


const PhaseConfig = ({ 
  shapingData, 
  setShapingData, 
  currentStitches, 
  construction,
  onComplete,
  onBack 
}) => {
  const [phases, setPhases] = useState([]);
  const [currentScreen, setCurrentScreen] = useState('summary'); // 'summary', 'type-select', 'configure'
  const [editingPhaseId, setEditingPhaseId] = useState(null);
  const [tempPhaseConfig, setTempPhaseConfig] = useState({});

  const phaseTypes = [
    {
      id: 'decrease',
      name: 'Decrease Phase',
      icon: '📉',
      description: 'Remove stitches over multiple rows'
    },
    {
      id: 'increase',
      name: 'Increase Phase', 
      icon: '📈',
      description: 'Add stitches over multiple rows'
    },
    {
      id: 'setup',
      name: 'Setup Rows',
      icon: '📐',
      description: 'Work plain rows between shaping'
    },
    {
      id: 'bind_off',
      name: 'Bind Off',
      icon: '📤',
      description: 'Remove stitches by binding off'
    }
  ];

  const getDefaultConfigForType = (type) => {
    return PhaseCalculationService.getDefaultConfigForType(type);
  };

  const handleAddPhase = () => {
    setEditingPhaseId(null);
    setCurrentScreen('type-select');
  };

  const handleEditPhase = (phaseId) => {
    const phase = phases.find(p => p.id === phaseId);
    setEditingPhaseId(phaseId);
    setTempPhaseConfig(phase.config);
    setCurrentScreen('configure');
  };

  const handleTypeSelect = (type) => {
    if (editingPhaseId) {
      // Editing existing phase - keep existing config but change type
      const existingPhase = phases.find(p => p.id === editingPhaseId);
      setTempPhaseConfig({ ...existingPhase.config, type });
    } else {
      // Adding new phase
      setTempPhaseConfig({ type, ...getDefaultConfigForType(type) });
    }
    setCurrentScreen('configure');
  };

const handleSavePhaseConfig = () => {
  // Create corrected config with validated values
  const correctedConfig = { ...tempPhaseConfig };
  
  // Apply corrections for decrease/increase phases
  if (tempPhaseConfig.type === 'decrease' || tempPhaseConfig.type === 'increase') {
    if (tempPhaseConfig.times && tempPhaseConfig.position) {
      const availableStitches = getStitchContext().availableStitches;
      const stitchesPerRow = tempPhaseConfig.position === 'both_ends' ? 2 : 1;
      const maxTimes = Math.max(1, Math.floor((availableStitches - 2) / stitchesPerRow));
      correctedConfig.times = Math.min(tempPhaseConfig.times, maxTimes);
    }
    if (tempPhaseConfig.frequency) {
      correctedConfig.frequency = Math.max(tempPhaseConfig.frequency, 1);
    }
  }
  
  // Apply corrections for other phase types
  if (tempPhaseConfig.type === 'setup' && tempPhaseConfig.rows) {
    correctedConfig.rows = Math.max(tempPhaseConfig.rows, 1);
  }
  if (tempPhaseConfig.type === 'bind_off') {
    if (tempPhaseConfig.amount) {
      correctedConfig.amount = Math.max(tempPhaseConfig.amount, 1);
    }
    if (tempPhaseConfig.frequency) {
      correctedConfig.frequency = Math.max(tempPhaseConfig.frequency, 1);
    }
  }

  if (editingPhaseId) {
    // Update existing phase
    setPhases(phases.map(p => 
      p.id === editingPhaseId 
        ? { ...p, type: tempPhaseConfig.type, config: correctedConfig }
        : p
    ));
  } else {
    // Add new phase
    const newPhase = {
      id: crypto.randomUUID(),
      type: tempPhaseConfig.type,
      config: correctedConfig
    };
    setPhases([...phases, newPhase]);
  }
  
  setCurrentScreen('summary');
  setEditingPhaseId(null);
  setTempPhaseConfig({});
};

  const handleDeletePhase = (phaseId) => {
    setPhases(phases.filter(p => p.id !== phaseId));
  };

  const calculateSequentialPhases = () => {
    return PhaseCalculationService.calculateSequentialPhases(phases, currentStitches, construction);
  };

  const getPhaseDescription = (phase) => {
    return PhaseCalculationService.getPhaseDescription(phase);
  };

  const getStitchContext = () => {
    return PhaseCalculationService.calculateStitchContext(phases, editingPhaseId, currentStitches);
  };

  const getPhasePreview = (config) => {
    if (!config.type) return 'Select options above';
    
    switch (config.type) {
      case 'decrease':
        if (!config.frequency || !config.times || !config.position) {
          return 'Configure decrease options above';
        }
        const amount = config.amount || 1; // Default to 1 for simplified model
        const decFreq = config.frequency === 1 ? 'every row' : 
                       config.frequency === 2 ? 'every other row' :
                       `every ${config.frequency} rows`;
        const decPos = config.position === 'both_ends' ? 'at each end' : `at ${config.position}`;
        //const decRows = config.frequency === 1 ? config.times : (config.times - 1) * config.frequency + 1;
        const decRows = config.times * config.frequency;
        return `Dec ${amount} st ${decPos} ${decFreq} ${config.times} times (${decRows} rows)`;
        
      case 'increase':
        if (!config.frequency || !config.times || !config.position) {
          return 'Configure increase options above';
        }
        const incAmount = config.amount || 1; // Default to 1 for simplified model
        const incFreq = config.frequency === 1 ? 'every row' : 
                       config.frequency === 2 ? 'every other row' :
                       `every ${config.frequency} rows`;
        const incPos = config.position === 'both_ends' ? 'at each end' : `at ${config.position}`;
        const incRows = config.frequency === 1 ? config.times : (config.times - 1) * config.frequency + 1;
        return `Inc ${incAmount} st ${incPos} ${incFreq} ${config.times} times (${incRows} rows)`;
        
      case 'setup':
        if (!config.rows) return 'Configure row count above';
        return `Work ${config.rows} plain ${config.rows === 1 ? 'row' : 'rows'}`;
        
      case 'bind_off':
        if (!config.amount || !config.frequency) return 'Configure bind off options above';
        const bindPos = config.position === 'beginning' ? 'at beginning' : 'at end';
        return `Bind off ${config.amount} sts ${bindPos} of next ${config.frequency} ${config.frequency === 1 ? 'row' : 'rows'}`;
        
      default:
        return 'Unknown phase type';
    }
  };

  const calculatePhaseEndingStitches = () => {
    if (!tempPhaseConfig.type) return getStitchContext().availableStitches;
    
    const startingStitches = getStitchContext().availableStitches;
    
    switch (tempPhaseConfig.type) {
      case 'decrease':
  if (!tempPhaseConfig.times || !tempPhaseConfig.position) return startingStitches;
  const amount = tempPhaseConfig.amount || 1; // Default to 1 for simplified model
  
  // Apply the same max constraint logic as the input
  const availableStitches = getStitchContext().availableStitches;
  const stitchesPerRow = tempPhaseConfig.position === 'both_ends' ? 2 : 1;
  const maxTimes = Math.max(1, Math.floor((availableStitches - 2) / stitchesPerRow));
  const correctedTimes = Math.min(tempPhaseConfig.times, maxTimes);
  
  const decChange = tempPhaseConfig.position === 'both_ends' ? 
    amount * 2 * correctedTimes : 
    amount * correctedTimes;
  return startingStitches - decChange;
        
      case 'increase':
        if (!tempPhaseConfig.times || !tempPhaseConfig.position) return startingStitches;
        const incAmount = tempPhaseConfig.amount || 1; // Default to 1 for simplified model
        const incChange = tempPhaseConfig.position === 'both_ends' ? 
          incAmount * 2 * tempPhaseConfig.times : 
          incAmount * tempPhaseConfig.times;
        return startingStitches + incChange;
        
      case 'bind_off':
        if (!tempPhaseConfig.amount || !tempPhaseConfig.frequency) return startingStitches;
        return startingStitches - (tempPhaseConfig.amount * tempPhaseConfig.frequency);
        
      case 'setup':
        return startingStitches; // No stitch change
        
      default:
        return startingStitches;
    }
  };

  const result = calculateSequentialPhases();
  
  const handleComplete = () => {
    onComplete({
      phases: phases,
      construction: construction,
      calculation: result
    });
  };

  // Screen 1: Summary (main screen)
  if (currentScreen === 'summary') {
    return (
      <PhaseConfigSummary
        phases={phases}
        phaseTypes={phaseTypes}
        result={result}
        construction={construction}
        onAddPhase={handleAddPhase}
        onEditPhase={handleEditPhase}
        onDeletePhase={handleDeletePhase}
        onBack={onBack}
        onComplete={handleComplete}
        getPhaseDescription={getPhaseDescription}
      />
    );
  }

  // Screen 2: Type Selection
  if (currentScreen === 'type-select') {
    return (
      <PhaseConfigTypeSelector
        phaseTypes={phaseTypes}
        onTypeSelect={handleTypeSelect}
        onBackToSummary={() => setCurrentScreen('summary')}
      />
    );
  }

  // Screen 3: Configure Phase
  if (currentScreen === 'configure') {
    return (
      <PhaseConfigForm
        tempPhaseConfig={tempPhaseConfig}
        setTempPhaseConfig={setTempPhaseConfig}
        phaseTypes={phaseTypes}
        phases={phases}
        currentStitches={currentStitches}
        construction={construction}
        editingPhaseId={editingPhaseId}
        onSave={handleSavePhaseConfig}
        onBack={() => {
          if (editingPhaseId) {
            setCurrentScreen('summary');
            setEditingPhaseId(null);
            setTempPhaseConfig({});
          } else {
            setCurrentScreen('type-select');
          }
        }}
        getPhasePreview={getPhasePreview}
        getStitchContext={getStitchContext}
        calculatePhaseEndingStitches={calculatePhaseEndingStitches}
      />
    );
  }

  return null;
};

export default PhaseConfig;