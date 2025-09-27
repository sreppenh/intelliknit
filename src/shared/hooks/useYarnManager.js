import { useProjectsContext } from '../../features/projects/hooks/useProjectsContext';

const useYarnManager = () => {
    const { currentProject, dispatch } = useProjectsContext();

    const getYarns = () => currentProject?.yarns || [];

    const getAvailableLetters = () => {
        const count = currentProject?.colorCount || 2;
        return Array.from({ length: count }, (_, i) => String.fromCharCode(65 + i));
    };

    return {
        yarns: getYarns(),
        availableLetters: getAvailableLetters(),
        currentProject
    };
};

export default useYarnManager;