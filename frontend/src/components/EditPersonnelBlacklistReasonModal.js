import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import api from '../services/api';
import '../styles/EditPersonnelBlacklistReasonModal.css';

const EditPersonnelBlacklistReasonModal = ({ isOpen, onClose, reason, onSave }) => {
    const [formData, setFormData] = useState({
        reason: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    // Modal açıldığında ve düzenlenecek sebep değiştiğinde formData'yı güncelle
    useEffect(() => {
        if (isOpen) {
            if (reason) {
                // Düzenleme modu
                setFormData({
                    reason: reason.reason || ''
                });
            } else {
                // Yeni ekleme modu
                setFormData({
                    reason: ''
                });
            }
            setError(null);
        }
    }, [isOpen, reason]);

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

            // Sebep verisini kontrol et
            if (!formData.reason.trim()) {
                throw new Error('Lütfen sebep alanını doldurunuz.');
            }

            // Yeni ekleme veya düzenleme
            if (reason) {
                // Düzenleme
                response = await api.put(`/api/personnel-blacklist-reasons/${reason.id}`, {
                    reason: formData.reason
                });
            } else {
                // Yeni ekleme
                response = await api.post('/api/personnel-blacklist-reasons', {
                    reason: formData.reason
                });
            }

            // Başarılı sonuç
            onSave(response.data);
            onClose();
        } catch (err) {
            console.error('Kara liste sebebi kaydedilirken hata oluştu:', err);
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
            <div className="edit-blacklist-reason-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{reason ? 'Kara Liste Sebebi Düzenle' : 'Yeni Kara Liste Sebebi Ekle'}</h2>
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
                            <label htmlFor="reason">Sebep</label>
                            <input
                                type="text"
                                id="reason"
                                name="reason"
                                value={formData.reason}
                                onChange={handleChange}
                                placeholder="Kara liste sebebini girin"
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

export default EditPersonnelBlacklistReasonModal;