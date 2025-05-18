import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import api from '../services/api';
import '../styles/EditPermissionGroupModal.css';
import SearchableDropdown from '../components/SearchableDropdown';


const EditPermissionGroupModal = ({ isOpen, onClose, permissionGroup, onSave, doors }) => {
    const [formData, setFormData] = useState({
        name: '',
        permissions: []
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [selectedDoors, setSelectedDoors] = useState([]);
    const [selectedDoorId, setSelectedDoorId] = useState('');
    const [availableDoors, setAvailableDoors] = useState([]);

    // Modal açıldığında ve düzenlenecek yetki grubu değiştiğinde formData'yı güncelle
    useEffect(() => {
        if (isOpen) {
            if (permissionGroup) {
                // Düzenleme modu
                setFormData({
                    name: permissionGroup.name || '',
                    permissions: permissionGroup.permissions || []
                });

                // Seçili kapıları ayarla
                const selectedDoorIds = permissionGroup.permissions
                    ? permissionGroup.permissions.map(permission => permission.door.id)
                    : [];

                setSelectedDoors(selectedDoorIds);
            } else {
                // Yeni ekleme modu
                setFormData({
                    name: '',
                    permissions: []
                });
                setSelectedDoors([]);
            }

            // Mevcut kapıları filtrele
            updateAvailableDoors();
            setError(null);
        }
    }, [isOpen, permissionGroup, doors]);

    // Mevcut kapıları güncelleyen fonksiyon
    const updateAvailableDoors = () => {
        if (!doors) return;

        // Eğer yeni ekleme modundaysak, tüm kapıları göster
        if (!permissionGroup) {
            setAvailableDoors(doors);
            return;
        }

        // Düzenleme modundaysak, seçili olmayan kapıları göster
        const selectedDoorIds = permissionGroup.permissions
            ? permissionGroup.permissions.map(permission => permission.door.id)
            : [];

        const availableDoorsList = doors.filter(door => !selectedDoorIds.includes(door.id));
        setAvailableDoors(availableDoorsList);
    };

    // Form verilerini değiştirdiğimizde state'i güncelle
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    // Kapı ekle
    const handleAddDoor = (doorId) => {
        // Kapı datasını bul
        const doorToAdd = doors.find(door => door.id === parseInt(doorId));
        if (!doorToAdd) return;

        // Seçili kapılara ekle
        setSelectedDoors([...selectedDoors, doorToAdd.id]);

        // Mevcut kapılardan çıkar
        setAvailableDoors(availableDoors.filter(door => door.id !== doorToAdd.id));

        // formData permissions'ı güncelle - yeni kapı izni ekle
        const newPermission = {
            door: doorToAdd
        };

        setFormData({
            ...formData,
            permissions: [...formData.permissions, newPermission]
        });
    };

    // Kapı kaldır
    const handleRemoveDoor = (doorId) => {
        // Kapıyı seçili kapılardan çıkar
        setSelectedDoors(selectedDoors.filter(id => id !== doorId));

        // Kapıyı mevcut kapılara geri ekle
        const doorToAdd = doors.find(door => door.id === doorId);
        if (doorToAdd) {
            setAvailableDoors([...availableDoors, doorToAdd]);
        }

        // formData permissions'ı güncelle - kapı iznini çıkar
        setFormData({
            ...formData,
            permissions: formData.permissions.filter(permission => permission.door.id !== doorId)
        });
    };

    // Formu gönder
    // Formu gönder
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        setError(null);

        try {
            let response;

            // Form verilerini kontrol et
            if (!formData.name.trim()) {
                throw new Error('Lütfen yetki grubu adını giriniz.');
            }

            // API'ye gönderilecek veri
            const permissionGroupData = {
                name: formData.name
                // permissions alanını burada göndermiyoruz!
            };

            console.log('Gönderilecek yetki grubu verisi:', permissionGroupData);

            // Yeni ekleme veya düzenleme
            if (permissionGroup) {
                // Düzenleme
                response = await api.put(`/api/permission-groups/${permissionGroup.id}`, permissionGroupData);

                // Yetki grubu güncellendikten sonra, kapı izinlerini ayrı ayrı ekle/güncelle
                for (const permission of formData.permissions) {
                    // Bu kapı zaten bu yetki grubuna ekli mi kontrol et
                    const existingPermission = permissionGroup.permissions?.find(
                        p => p.door.id === permission.door.id
                    );

                    if (!existingPermission) {
                        // Yeni kapı izni ekle
                        await api.post('/api/permissions', {
                            door:{id:permission.door.id} ,
                            permissionGroup: {id:permissionGroup.id}
                        });
                    }
                }

                // Silinmesi gereken izinleri bul ve sil
                if (permissionGroup.permissions) {
                    for (const oldPermission of permissionGroup.permissions) {
                        const stillExists = formData.permissions.some(
                            p => p.door.id === oldPermission.door.id
                        );

                        if (!stillExists) {
                            // Bu izin artık yok, sil
                            await api.delete(`/api/permissions/${oldPermission.id}`);
                        }
                    }
                }
            } else {
                // Yeni ekleme
                response = await api.post('/api/permission-groups', permissionGroupData);

                // Yeni yetki grubu oluşturulduktan sonra, seçilen kapıları ekle
                const newPermissionGroupId = response.data.id;
                for (const permission of formData.permissions) {
                    await api.post('/api/permissions', {
                        door: {id:permission.door.id},
                        permissionGroup: {id:newPermissionGroupId}
                    });
                }
            }

            // Başarılı sonuç
            // Son durumu almak için yetki grubunu tekrar çek
            const updatedGroup = await api.get(`/api/permission-groups/${response.data.id}`);
            onSave(updatedGroup.data);
            onClose();
        } catch (err) {
            console.error('Yetki grubu kaydedilirken hata oluştu:', err);
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
            <div className="edit-permission-group-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{permissionGroup ? 'Yetki Grubu Düzenle' : 'Yeni Yetki Grubu Ekle'}</h2>
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
                            <label htmlFor="name">Yetki Grubu Adı</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Yetki grubu adını girin"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>İzinli Kapılar</label>
                            <div className="permissions-container">
                                <div className="selected-doors">
                                    <h4>Seçili Kapılar</h4>
                                    {formData.permissions.length > 0 ? (
                                        <div className="selected-doors-list">
                                            {formData.permissions.map((permission) => (
                                                <div key={permission.door.id} className="edit-door-badge-item">
                                                    <span className="edit-door-badge">{permission.door.name}</span>
                                                    <button
                                                        type="button"
                                                        className="remove-door-button"
                                                        onClick={() => handleRemoveDoor(permission.door.id)}
                                                        title="Kapıyı Kaldır"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="no-doors-message">Henüz kapı seçilmedi</p>
                                    )}
                                </div>

                                <div className="add-door-container">
                                    <h4>Kapı Ekle</h4>
                                    <div className="add-door-form">
                                        <SearchableDropdown
                                            id="door-select"
                                            name="doorId"
                                            label=""
                                            options={availableDoors}
                                            value={selectedDoorId}
                                            onChange={(e) => setSelectedDoorId(e.target.value)}
                                            labelField="name"
                                            valueField="id"
                                            placeholder="Kapı seçin"
                                        />
                                        <button
                                            type="button"
                                            className="add-door-button"
                                            disabled={!selectedDoorId}
                                            onClick={() => {
                                                handleAddDoor(selectedDoorId);
                                                setSelectedDoorId('');
                                            }}
                                        >
                                            <Plus size={16} />
                                            <span>Ekle</span>
                                        </button>

                                    </div>
                                    {availableDoors.length === 0 && (
                                        <p className="no-doors-available">Eklenecek başka kapı bulunmamaktadır</p>
                                    )}
                                </div>
                            </div>
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

export default EditPermissionGroupModal;