import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import '../styles/EditTeamModal.css';
import PropTypes from 'prop-types';

const EditTeamModal = ({ isOpen, onClose, team, onSave, departments }) => {
    const [formData, setFormData] = useState({
        id: null,
        name: '',
        description: '',
        department: {
            id: '',
            name: ''
        }
    });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (team) {
            setFormData({
                id: team.id || null,
                name: team.name || '',
                description: team.description || '',
                department: {
                    id: team.department?.id || '',
                    name: team.department?.name || ''
                }
            });
        } else {
            // Reset form for new team
            setFormData({
                id: null,
                name: '',
                description: '',
                department: {
                    id: '',
                    name: ''
                }
            });
        }
        setErrors({});
    }, [team]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        
        if (name === 'departmentId') {
            const selectedDept = departments.find(dept => dept.id === parseInt(value));
            setFormData({
                ...formData,
                department: {
                    id: selectedDept ? selectedDept.id : '',
                    name: selectedDept ? selectedDept.name : ''
                }
            });
        } else {
            setFormData({
                ...formData,
                [name]: value
            });
        }
        
        // Hata mesajını temizle
        if (errors[name]) {
            setErrors({
                ...errors,
                [name]: null
            });
        }
    };

    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.name.trim()) {
            newErrors.name = 'Takım adı gereklidir.';
        }
        
        if (!formData.department.id) {
            newErrors.departmentId = 'Departman seçimi gereklidir.';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (validateForm()) {
            onSave(formData);
        }
    };

    const handleBackdropClick = (e) => {
        if (e.target.classList.contains('modal-overlay')) {
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={handleBackdropClick}>
            <div className="edit-team-modal">
                <div className="modal-header">
                    <h2>{team ? 'Takım Düzenle' : 'Yeni Takım Ekle'}</h2>
                    <button className="close-button" onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>
                <div className="modal-content">
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="name">Takım Adı</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className={errors.name ? 'error' : ''}
                            />
                            {errors.name && <div className="error-message">{errors.name}</div>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="description">Açıklama</label>
                            <textarea
                                id="description"
                                name="description"
                                rows="3"
                                value={formData.description}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="departmentId">Departman</label>
                            <select
                                id="departmentId"
                                name="departmentId"
                                value={formData.department.id}
                                onChange={handleChange}
                                className={errors.departmentId ? 'error' : ''}
                            >
                                <option value="">Departman Seçiniz</option>
                                {departments.map(dept => (
                                    <option key={dept.id} value={dept.id}>
                                        {dept.name}
                                    </option>
                                ))}
                            </select>
                            {errors.departmentId && <div className="error-message">{errors.departmentId}</div>}
                        </div>

                        <div className="form-actions">
                            <button type="button" className="cancel-button" onClick={onClose}>
                                İptal
                            </button>
                            <button type="submit" className="save-button">
                                {team ? 'Güncelle' : 'Ekle'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

EditTeamModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    team: PropTypes.object,
    onSave: PropTypes.func.isRequired,
    departments: PropTypes.array.isRequired
};

export default EditTeamModal; 