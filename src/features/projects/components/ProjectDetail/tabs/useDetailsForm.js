import React from 'react';

/**
 * useDetailsForm - All form logic extracted from actual DetailsTabEdit.jsx
 * 
 * Extracted exactly from your working code - zero functionality changes.
 */
const useDetailsForm = (formData, setFormData, project, onSave, onCancel) => {
    // Handle input changes
    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleArrayChange = (field, index, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: prev[field].map((item, i) => i === index ? value : item)
        }));
    };

    const handleYarnChange = (yarnIndex, field, value) => {
        setFormData(prev => ({
            ...prev,
            yarns: prev.yarns.map((yarn, i) =>
                i === yarnIndex ? { ...yarn, [field]: value } : yarn
            )
        }));
    };

    const handleYarnColorChange = (yarnIndex, colorIndex, field, value) => {
        setFormData(prev => ({
            ...prev,
            yarns: prev.yarns.map((yarn, i) =>
                i === yarnIndex ? {
                    ...yarn,
                    colors: yarn.colors.map((color, ci) =>
                        ci === colorIndex ? { ...color, [field]: value } : color
                    )
                } : yarn
            )
        }));
    };

    const addYarnColor = (yarnIndex) => {
        setFormData(prev => ({
            ...prev,
            yarns: prev.yarns.map((yarn, i) =>
                i === yarnIndex ? {
                    ...yarn,
                    colors: [...yarn.colors, { color: '', skeins: '' }]
                } : yarn
            )
        }));
    };

    const removeYarnColor = (yarnIndex, colorIndex) => {
        setFormData(prev => ({
            ...prev,
            yarns: prev.yarns.map((yarn, i) =>
                i === yarnIndex ? {
                    ...yarn,
                    colors: yarn.colors.filter((_, ci) => ci !== colorIndex)
                } : yarn
            )
        }));
    };

    // NEW: Handle structured needle changes
    const handleNeedleChange = (needleIndex, field, value) => {
        setFormData(prev => ({
            ...prev,
            needles: prev.needles.map((needle, i) =>
                i === needleIndex ? { ...needle, [field]: value } : needle
            )
        }));
    };

    const addArrayItem = (field) => {
        if (field === 'yarns') {
            setFormData(prev => ({
                ...prev,
                yarns: [...prev.yarns, { name: '', colors: [{ color: '', skeins: '' }] }]
            }));

        } else if (field === 'needles') {
            // NEW: Add structured needle object
            setFormData(prev => ({
                ...prev,
                needles: [...prev.needles, { size: '', mm: '', type: 'straight', length: '' }]
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [field]: [...prev[field], '']
            }));
        }
    };

    const removeArrayItem = (field, index) => {
        setFormData(prev => ({
            ...prev,
            [field]: prev[field].filter((_, i) => i !== index)
        }));
    };

    // Enhanced save with data transformation and auto-date logic
    const handleSave = () => {
        if (!formData.name.trim()) return;

        const transformedData = {
            ...formData,
            // Auto-set completion date if completed is newly checked
            completedAt: formData.completed && !formData.completedAt ?
                new Date().toISOString().split('T')[0] : formData.completedAt,
            // Auto-set started date from creation if not set
            startedAt: formData.startedAt || project?.createdAt?.split('T')[0],
            // Keep enhanced yarn format but clean up empty entries
            yarns: formData.yarns.filter(yarn => yarn.name && yarn.name.trim() !== ''),
            // Clean up empty needle items
            needles: formData.needles.filter(needle =>
                typeof needle === 'string' ? needle.trim() !== '' : needle.size && needle.size.trim() !== ''
            )
        };

        onSave(transformedData);
    };

    // Handle status changes with smart date setting
    const handleStatusChange = (field, value) => {
        setFormData(prev => {
            const newData = { ...prev, [field]: value };

            // If marking as completed, clear frogged
            if (field === 'completed' && value) {
                newData.frogged = false;
                if (!newData.completedAt) {
                    newData.completedAt = new Date().toISOString().split('T')[0];
                }
            }

            // If marking as frogged, clear completed
            if (field === 'frogged' && value) {
                newData.completed = false;
                newData.completedAt = '';
            }

            return newData;
        });
    };

    const handleCancel = () => {
        onCancel();
    };

    // Initialize defaults
    React.useEffect(() => {
        if (!formData.construction) {
            handleInputChange('construction', 'flat');
        }
        if (formData.priority === undefined) {
            handleInputChange('priority', 'normal');
        }

        // Convert old yarn format to new format if needed
        if (formData.yarns && formData.yarns.length > 0) {
            const hasOldFormat = formData.yarns.some(yarn =>
                typeof yarn === 'string' || (yarn && !yarn.colors)
            );

            if (hasOldFormat) {
                const updatedYarns = formData.yarns.map(yarn => {
                    if (typeof yarn === 'string') {
                        return { name: yarn, colors: [{ color: '', skeins: '' }] };
                    } else if (yarn && !yarn.colors) {
                        return {
                            name: yarn.name || '',
                            colors: [{ color: yarn.color || '', skeins: '' }]
                        };
                    }
                    return yarn;
                });
                setFormData(prev => ({ ...prev, yarns: updatedYarns }));
            }
        }
    }, []);

    return {
        handleInputChange,
        handleArrayChange,
        handleNeedleChange,
        handleYarnChange,
        handleYarnColorChange,
        addYarnColor,
        removeYarnColor,
        addArrayItem,
        removeArrayItem,
        handleSave,
        handleStatusChange,
        handleCancel
    };
};

export default useDetailsForm;