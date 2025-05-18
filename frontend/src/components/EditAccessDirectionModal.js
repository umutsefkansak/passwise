import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import api from '../services/api';
import '../styles/EditAccessDirectionModal.css';

const EditAccessDirectionModal = ({ isOpen, onClose, accessDirection, onSave }) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
    });
    const [error, setError] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    // Modal açıldığında ve düzenlenecek erişim yönü değiştiğinde formData'yı güncelle
    useEffect(() => {
        if (isOpen) {
            if (accessDirection) {
                // Düzenleme modu
                setFormData({
                    name: accessDirection.name || '',
                    description: accessDirection.description || '',
                });
            } else {
                // Yeni ekleme modu
                setFormData({
                    name: '',
                    description: '',
                });
            }
            setError(null);
        }
    }, [isOpen, accessDirection]);

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
                throw new Error('Lütfen yön adını giriniz.');
            }

            // API'ye gönderilecek veri
            const directionData = {
                name: formData.name,
                description: formData.description || null,
            };

            // Yeni ekleme veya düzenleme
            if (accessDirection) {
                // Düzenleme
                response = await api.put(`/api/access-directions/${accessDirection.id}`, directionData);
            } else {
                // Yeni ekleme
                response = await api.post('/api/access-directions', directionData);
            }

            // Başarılı sonuç
            onSave(response.data);
            onClose();
        } catch (err) {
            console.error('Erişim yönü kaydedilirken hata oluştu:', err);
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
            <div className="edit-direction-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{accessDirection ? 'Erişim Yönü Düzenle' : 'Yeni Erişim Yönü Ekle'}</h2>
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
                            <label htmlFor="name">Yön Adı</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Yön adını girin"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="description">Açıklama</label>
                            <textarea
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Açıklama girin (isteğe bağlı)"
                                rows="3"
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

export default EditAccessDirectionModal;