import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import api from '../services/api';
import '../styles/EditDepartmentModal.css';

const EditDepartmentModal = ({ isOpen, onClose, department, onSave }) => {
    const [formData, setFormData] = useState({
        name: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    // Modal açıldığında ve düzenlenecek departman değiştiğinde formData'yı güncelle
    useEffect(() => {
        if (isOpen) {
            if (department) {
                // Düzenleme modu
                setFormData({
                    name: department.name || ''
                });
            } else {
                // Yeni ekleme modu
                setFormData({
                    name: ''
                });
            }
            setError(null);
        }
    }, [isOpen, department]);

    // Form verilerini değiştirdiğimizde state'i güncelle
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    // Formu gönder
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        setError(null);

        try {
            let response;

            // Form verilerini kontrol et
            if (!formData.name.trim()) {
                throw new Error('Lütfen departman adını giriniz.');
            }

            // API'ye gönderilecek veri
            const departmentData = {
                name: formData.name
            };

            console.log(departmentData)

            // Yeni ekleme veya düzenleme
            if (department) {
                // Düzenleme
                response = await api.put(`/api/departments/${department.id}`, departmentData);
            } else {
                // Yeni ekleme
                response = await api.post('/api/departments', departmentData);
            }

            // Başarılı sonuç
            onSave(response.data);
            onClose();
        } catch (err) {
            console.error('Departman kaydedilirken hata oluştu:', err);
            setError(err.response?.data?.message || err.message || 'Bir hata oluştu. Lütfen tekrar deneyin.');
        } finally {
            setIsSaving(false);
        }
    };

    // Modal kapalıysa hiçbir şey render etme
    if (!isOpen) {
        return null;
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="edit-department-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{department ? 'Departman Düzenle' : 'Yeni Departman Ekle'}</h2>
                    <button className="close-button" onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>

                <div className="modal-body">
                    {error && (
                        <div className="error-message">
                            <p>{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="name">Departman Adı</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Departman adını girin"
                                required
                            />
                        </div>

                        <div className="modal-footer">
                            <button
                                type="button"
                                className="cancel-button"
                                onClick={onClose}
                                disabled={isSaving}
                            >
                                İptal
                            </button>
                            <button
                                type="submit"
                                className="save-button"
                                disabled={isSaving}
                            >
                                {isSaving ? 'Kaydediliyor...' : 'Kaydet'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EditDepartmentModal; 