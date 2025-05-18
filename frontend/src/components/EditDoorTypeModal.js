import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import api from '../services/api';
import '../styles/EditDoorTypeModal.css';

const EditDoorTypeModal = ({ isOpen, onClose, doorType, onSave }) => {
    const [formData, setFormData] = useState({
        name: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    // Modal açıldığında ve düzenlenecek kapı türü değiştiğinde formData'yı güncelle
    useEffect(() => {
        if (isOpen) {
            if (doorType) {
                // Düzenleme modu
                setFormData({
                    name: doorType.name || ''
                });
            } else {
                // Yeni ekleme modu
                setFormData({
                    name: ''
                });
            }
            setError(null);
        }
    }, [isOpen, doorType]);

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
            // Form verilerini kontrol et
            if (!formData.name.trim()) {
                throw new Error('Lütfen kapı türü adını giriniz.');
            }

            // API'ye gönderilecek veri
            const doorTypeData = {
                name: formData.name.trim()
            };

            let response;

            // Yeni ekleme veya düzenleme
            if (doorType) {
                // Düzenleme
                response = await api.put(`/api/door-types/${doorType.id}`, doorTypeData);
            } else {
                // Yeni ekleme
                response = await api.post('/api/door-types', doorTypeData);
            }

            // Başarılı sonuç
            onSave(response.data);
            onClose();
        } catch (err) {
            console.error('Kapı türü kaydedilirken hata oluştu:', err);
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
            <div className="edit-door-type-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{doorType ? 'Kapı Türü Düzenle' : 'Yeni Kapı Türü Ekle'}</h2>
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
                            <label htmlFor="name">Kapı Türü Adı</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Kapı türü adını girin"
                                required
                                maxLength={100}
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

export default EditDoorTypeModal;