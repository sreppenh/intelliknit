import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { projectsReducer, initialState } from './projectsReducer';
import { StorageService } from '../../../shared/utils/StorageService';
import { migrateAllProjectsToNewArchitecture } from '../../../shared/utils/dataMigration';
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
          // Automatically migrate legacy data to new architecture
          const { projects: migratedProjects, migratedCount } = migrateAllProjectsToNewArchitecture(savedProjects);

          if (migratedCount > 0) {
            IntelliKnitLogger.success(`Migrated ${migratedCount} projects to new architecture`);
          }

          dispatch({ type: 'LOAD_PROJECTS', payload: migratedProjects });

          // Save migrated data back to storage if any migrations occurred
          if (migratedCount > 0) {
            await StorageService.saveProjects(migratedProjects);
          }
        }
      } catch (error) {
        IntelliKnitLogger.error('IntelliKnit Error: Failed to load projects', error);
      }
    };

    loadProjects();
  }, []); // Empty dependency array - no more useMigration dependency

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