import React from 'react';
import { useProjectsContext } from '../hooks/useProjectsContext';

const ProjectList = ({ onCreateProject, onOpenProject }) => {
  const { projects, dispatch } = useProjectsContext();

  const handleDeleteProject = (projectId, event) => {
    event.stopPropagation();
    const confirmed = window.confirm('Delete this project? This cannot be undone.');
    if (confirmed) {
      dispatch({ type: 'DELETE_PROJECT', payload: projectId });
    }
  };

  if (projects.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-md mx-auto bg-white min-h-screen shadow-lg">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
            <h1 className="text-2xl font-bold text-center">Intelliknit</h1>
            <p className="text-center text-blue-100 mt-2">Your knitting project tracker</p>
          </div>

          <div className="p-6">
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🧶</div>
              <h3 className="text-lg font-medium text-gray-600 mb-2">No projects yet</h3>
              <p className="text-gray-500 mb-6">Create your first knitting project to get started!</p>
              <button 
                onClick={onCreateProject}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Create Your First Project
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto bg-white min-h-screen shadow-lg">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <h1 className="text-2xl font-bold text-center">IntelliKnit</h1>
          <p className="text-center text-blue-100 mt-2">The smart project tracker</p>
        </div>

        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800">My Projects</h2>
            <button 
              onClick={onCreateProject}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              + New Project
            </button>
          </div>
          
          <div className="space-y-4">
            {projects.map(project => (
              <div 
                key={project.id}
                className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition-all"
              >
                <div className="flex justify-between items-start mb-2">
                  <div 
                    onClick={() => onOpenProject(project)}
                    className="flex-1 cursor-pointer"
                  >
                    <h3 className="font-semibold text-gray-800">{project.name}</h3>
                    <span className="text-sm text-gray-500">{project.size}</span>
                  </div>
                  <button
                    onClick={(e) => handleDeleteProject(project.id, e)}
                    className="text-red-500 hover:text-red-700 p-2 rounded hover:bg-red-50"
                  >
                    🗑️
                  </button>
                </div>
                <p className="text-sm text-gray-600">
                  {project.components.length} component{project.components.length !== 1 ? 's' : ''}
                  {project.completed && (
                    <span className="ml-2 text-green-600 font-medium">✓ Completed</span>
                  )}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectList;