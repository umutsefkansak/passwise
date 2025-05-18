import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import api from '../services/api';
import '../styles/EditDoorModal.css';

const EditDoorModal = ({ isOpen, onClose, door, onSave, doorTypes, accessDirections }) => {
    const [formData, setFormData] = useState({
        name: '',
        location: '',
        isMainDoor: false,
        doorType: null,
        accessDirection: null
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    // Modal açıldığında ve düzenlenecek kapı değiştiğinde formData'yı güncelle
    useEffect(() => {
        if (isOpen) {
            if (door) {
                // Düzenleme modu
                setFormData({
                    name: door.name || '',
                    location: door.location || '',
                    isMainDoor: door.mainDoor || false,
                    doorType: door.doorType?.id || '',
                    accessDirection: door.accessDirection?.id || ''
                });
            } else {
                // Yeni ekleme modu
                setFormData({
                    name: '',
                    location: '',
                    isMainDoor: false,
                    doorType: doorTypes?.length > 0 ? doorTypes[0].id : '',
                    accessDirection: accessDirections?.length > 0 ? accessDirections[0].id : ''
                });
            }
            setError(null);
        }
    }, [isOpen, door, doorTypes, accessDirections]);

    // Form verilerini değiştirdiğimizde state'i güncelle
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
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
                throw new Error('Lütfen kapı adını giriniz.');
            }

            if (!formData.location.trim()) {
                throw new Error('Lütfen konum bilgisini giriniz.');
            }

            // DoorType ve AccessDirection için ID'leri int'e çevir
            const doorTypeId = formData.doorType ? parseInt(formData.doorType) : null;
            const accessDirectionId = formData.accessDirection ? parseInt(formData.accessDirection) : null;

            // API'ye gönderilecek veri
            const doorData = {
                name: formData.name,
                location: formData.location,
                mainDoor: formData.isMainDoor,
                doorType: doorTypeId ? { id: doorTypeId } : null,
                accessDirection: accessDirectionId ? { id: accessDirectionId } : null
            };

            console.log(doorData)

            // Yeni ekleme veya düzenleme
            if (door) {
                // Düzenleme
                response = await api.put(`/api/doors/${door.id}`, doorData);
            } else {
                // Yeni ekleme
                response = await api.post('/api/doors', doorData);
            }

            // Başarılı sonuç
            onSave(response.data);
            onClose();
        } catch (err) {
            console.error('Kapı kaydedilirken hata oluştu:', err);
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
            <div className="edit-door-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{door ? 'Kapı Düzenle' : 'Yeni Kapı Ekle'}</h2>
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
                            <label htmlFor="name">Kapı Adı</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Kapı adını girin"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="location">Konum</label>
                            <input
                                type="text"
                                id="location"
                                name="location"
                                value={formData.location}
                                onChange={handleChange}
                                placeholder="Kapı konumunu girin"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="doorType">Kapı Tipi</label>
                            <select
                                id="doorType"
                                name="doorType"
                                value={formData.doorType}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Seçiniz</option>
                                {doorTypes && doorTypes.map(type => (
                                    <option key={type.id} value={type.id}>
                                        {type.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="accessDirection">Erişim Yönü</label>
                            <select
                                id="accessDirection"
                                name="accessDirection"
                                value={formData.accessDirection}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Seçiniz</option>
                                {accessDirections && accessDirections.map(direction => (
                                    <option key={direction.id} value={direction.id}>
                                        {direction.name} {direction.description ? `(${direction.description})` : ''}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group checkbox-group">
                            <input
                                type="checkbox"
                                id="isMainDoor"
                                name="isMainDoor"
                                checked={formData.isMainDoor}
                                onChange={handleChange}
                            />
                            <label htmlFor="isMainDoor">Ana Kapı</label>
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

export default EditDoorModal;