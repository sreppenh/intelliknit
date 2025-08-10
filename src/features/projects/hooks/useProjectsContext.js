import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { projectsReducer, initialState } from './projectsReducer';
import { StorageService } from '../../../shared/utils/StorageService';
import IntelliKnitLogger from '../../../shared/utils/ConsoleLogging';

const ProjectsContext = createContext();

export const ProjectsProvider = ({ children }) => {
  const [state, dispatch] = useReducer(projectsReducer, initialState);

  // Load projects from storage on mount
  useEffect(() => {
    const loadProjects = async () => {
      try {
        const savedProjects = await StorageService.getProjects();
        if (savedProjects && savedProjects.length > 0) {
          dispatch({ type: 'LOAD_PROJECTS', payload: savedProjects });
        }
      } catch (error) {
        IntelliKnitLogger.error('IntelliKnit Error: Failed to load projects', error);
      }
    };

    loadProjects();
  }, []);

  // Save projects to storage whenever they change
  useEffect(() => {
    if (state.projects.length > 0) {
      StorageService.saveProjects(state.projects).catch(error => {
        IntelliKnitLogger.error('IntelliKnit Error: Failed to save projects', error);
      });
    }
  }, [state.projects]);

  const value = {
    ...state,
    dispatch
  };

  return (
    <ProjectsContext.Provider value={value}>
      {children}
    </ProjectsContext.Provider>
  );
};

export const useProjectsContext = () => {
  const context = useContext(ProjectsContext);
  if (!context) {
    throw new Error('useProjectsContext must be used within a ProjectsProvider');
  }
  return context;
};