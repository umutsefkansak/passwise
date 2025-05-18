import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, User, Save, XCircle,Plus } from 'lucide-react';
import api from '../services/api';
import '../styles/EditPersonnelModal.css';
import SearchableDropdown from '../components/SearchableDropdown';


const EditPersonnelModal = ({ isOpen, onClose, personnel, onSave }) => {
    const [formData, setFormData] = useState({
        id: '',
        name: '',
        surname: '',
        tcNum: '',
        isActive: true,
        hireDate: '',
        personType: null,
        department: null,
        team: null,
        title: null,
        photoFileName: null,
        contactlessCardNumber: '' // Kart numarası için yeni alan
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [personTypes, setPersonTypes] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [teams, setTeams] = useState([]);
    const [titles, setTitles] = useState([]);
    const [adminId, setAdminId] = useState(null);


    // Yetkiler ve yetki grupları
    const [doorPermissions, setDoorPermissions] = useState([]);
    const [permissionGroups, setPermissionGroups] = useState([]);
    const [availableDoors, setAvailableDoors] = useState([]);
    const [availableGroups, setAvailableGroups] = useState([]);

    // Yetki yönetim modalları için state'ler
    const [doorsModalOpen, setDoorsModalOpen] = useState(false);
    const [groupsModalOpen, setGroupsModalOpen] = useState(false);

    const [cardError, setCardError] = useState(null);
    const [isCheckingCard, setIsCheckingCard] = useState(false);

    const [selectedPhoto, setSelectedPhoto] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(null);

    const loadPersonnelPhoto = async (personId) => {
        try {
            const token = localStorage.getItem('accessToken');
            if (!token) {
                console.error('Personel fotoğrafı için token bulunamadı');
                return;
            }

            const response = await api.get(`/api/personnels/${personId}/photo`, {
                responseType: 'blob',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            // Blob'dan URL oluştur
            const objectUrl = URL.createObjectURL(response.data);
            setPhotoPreview(objectUrl);
        } catch (err) {
            console.error(`Personel fotoğrafı yüklenirken hata: ID=${personId}`, err);
        }
    };

    // Personel bilgilerini yükle
    // Personel bilgilerini yükle
    useEffect(() => {
        setCardError(null);
        setIsCheckingCard(false);
        setError(null);

        if (isOpen && personnel && personnel.id && personnel.photoFileName) {
            loadPersonnelPhoto(personnel.id);
        }


        const fetchAdminInfo = async () => {
            try {
                // localStorage'dan username bilgisini al
                const username = localStorage.getItem('username');

                if (username) {
                    // Backend'den admin bilgilerini çek
                    const response = await api.get(`/api/admins/by-username/${username}`);
                    if (response.data && response.data.id) {
                        setAdminId(response.data.id);
                        console.log('Admin ID bulundu:', response.data.id);
                    } else {
                        console.warn('Admin ID bulunamadı, varsayılan ID kullanılacak');
                        setAdminId(1); // Varsayılan değeri atayalım
                    }
                } else {
                    console.warn('Username bulunamadı, varsayılan admin ID kullanılacak');
                    setAdminId(1); // Varsayılan değeri atayalım
                }
            } catch (error) {
                console.error('Admin bilgileri yüklenirken hata oluştu:', error);
                setAdminId(1); // Hata durumunda varsayılan değeri atayalım
            }
        };

        fetchAdminInfo();

        if (isOpen) {
            // Personel null ise form verilerini sıfırla (yeni personel ekleme durumu)
            if (!personnel) {
                setFormData({
                    id: '',
                    name: '',
                    surname: '',
                    tcNum: '',
                    isActive: true,
                    hireDate: '',
                    personType: null,
                    department: null,
                    team: null,
                    title: null,
                    photoFileName: null,
                    contactlessCardNumber: ''
                });
                // Yetkileri sıfırla
                setDoorPermissions([]);
                setPermissionGroups([]);
                // Fotoğraf önizlemeyi temizle
                setPhotoPreview(null);
                setSelectedPhoto(null);
            }
            // Personel nesnesi varsa (düzenleme durumu) o zaman verileri doldur
            else if (personnel) {
                // Format the hire date properly if it exists
                let formattedHireDate = '';
                if (personnel.hireDate) {
                    try {
                        formattedHireDate = new Date(personnel.hireDate).toISOString().split('T')[0];
                    } catch (e) {
                        console.error('Date formatting error:', e);
                        formattedHireDate = '';
                    }
                }

                setFormData({
                    id: personnel.id || '',
                    name: personnel.name || '',
                    surname: personnel.surname || '',
                    tcNum: personnel.tcNum || '',
                    isActive: personnel.active !== undefined ? personnel.active : true,
                    hireDate: formattedHireDate,
                    personType: personnel.personType || null,
                    department: personnel.department || null,
                    team: personnel.team || null,
                    title: personnel.title || null,
                    photoFileName: personnel.photoFileName || null,
                    contactlessCardNumber: personnel.card?.cardNumber || ''
                });

                // Personel ID'si varsa yetkileri yükle
                if (personnel.id) {
                    // Personel nesnesinin içindeki yetkileri kullan
                    if (personnel.doorPermissions) {
                        setDoorPermissions(personnel.doorPermissions.map(perm => ({
                            id: perm.id,
                            door: perm.door,
                            personnel: perm.personnel,
                            admin: perm.admin,
                            grantedAt: perm.grantedAt
                        })));
                    }

                    if (personnel.permissionGroupMemberships) {
                        setPermissionGroups(personnel.permissionGroupMemberships.map(group => ({
                            id: group.id,
                            permissionGroup: group.permissionGroup,
                            personnel: group.personnel,
                            grantedByAdmin: group.grantedByAdmin,
                            grantedAt: group.grantedAt
                        })));
                    }

                    // Mevcut ve kullanılabilir kapıları & grupları yükle
                    fetchAvailablePermissions();
                }
            }
        }
        return () => {
            if (photoPreview) {
                URL.revokeObjectURL(photoPreview);
            }
        };
    }, [isOpen, personnel]);

    // Referans verilerini yükle
    useEffect(() => {
        if (isOpen) {
            fetchReferenceLists();
        }
    }, [isOpen]);

    const fetchReferenceLists = async () => {
        try {
            const personTypesResponse = await api.get('/api/person-types');
            const departmentsResponse = await api.get('/api/departments');
            const teamsResponse = await api.get('/api/teams');
            const titlesResponse = await api.get('/api/titles');

            setPersonTypes(personTypesResponse.data || []);
            setDepartments(departmentsResponse.data || []);
            setTeams(teamsResponse.data || []);
            setTitles(titlesResponse.data || []);
        } catch (err) {
            console.error('Referans verileri yüklenirken hata oluştu:', err);
            setError('Referans verileri yüklenirken bir hata oluştu.');
        }
    };

    // Kullanılabilir kapıları ve grupları yükle
    const fetchAvailablePermissions = async () => {
        try {
            // Tüm kapıları yükle
            const doorsResponse = await api.get('/api/doors');
            setAvailableDoors(doorsResponse.data || []);

            // Tüm grupları yükle
            const groupsResponse = await api.get('/api/permission-groups');
            setAvailableGroups(groupsResponse.data || []);
        } catch (err) {
            console.error('Kullanılabilir yetkiler yüklenirken hata oluştu:', err);
        }
    };

    // handleInputChange fonksiyonunda kart numarası değiştiğinde kontrol edin (227. satır civarında)
    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });

        // Eğer kart numarası değiştiyse kontrol et
        if (name === 'contactlessCardNumber') {
            checkCardAvailability(value);
        }
    };
    const checkCardAvailability = async (cardNumber) => {
        if (!cardNumber || cardNumber.trim() === '') {
            setCardError(null);
            return;
        }

        setIsCheckingCard(true);
        try {
            // Tüm kartları getir
            const response = await api.get('/api/cards');
            const cards = response.data;

            // Bu kart var mı kontrol et
            const foundCard = cards.find(card => card.cardNumber === cardNumber);

            if (!foundCard) {
                setCardError("Bu kart numarası sisteme kayıtlı değil!");
                return;
            }

            // Kart başka bir personele atanmış mı kontrol et
            if (foundCard.personel && foundCard.personel.id !== formData.id) {
                setCardError(`Bu kart numarası başka bir personele (${foundCard.personel.name} ${foundCard.personel.surname}) atanmış!`);
                return;
            }

            // Kart bu personele atanmış veya boşta
            setCardError(null);
        } catch (err) {
            console.error("Kart kontrolü sırasında hata oluştu:", err);
            setCardError("Kart kontrol edilirken bir hata oluştu");
        } finally {
            setIsCheckingCard(false);
        }
    };

    const handlePhotoChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedPhoto(file);

            // Fotoğraf önizleme için
            const reader = new FileReader();
            reader.onload = (e) => {
                setPhotoPreview(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    };
    const handleRemovePhoto = () => {
        if (photoPreview) {
            // Blob URL'i serbest bırak
            URL.revokeObjectURL(photoPreview);
        }
        setSelectedPhoto(null);
        setPhotoPreview(null);
        // Eğer mevcut fotoğraf varsa, silme işaretini belirt
        setFormData({
            ...formData,
            photoFileName: null
        });
    };

    const uploadPhoto = async (personnelId) => {
        if (!selectedPhoto) return;

        const formData = new FormData();
        formData.append('file', selectedPhoto);

        try {
            await api.post(`/api/personnels/${personnelId}/photo`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            // Başarılı yükleme
            setSelectedPhoto(null);
        } catch (err) {
            console.error("Fotoğraf yüklenirken hata oluştu:", err);
            setError("Fotoğraf yüklenirken bir hata oluştu");
        }
    };
//
    const handleSelectChange = (e, fieldName) => {
        const { value } = e.target;
        
        // Eğer boş seçim yapıldıysa null olarak ayarla
        if (value === "") {
            setFormData(prev => ({
                ...prev,
                [fieldName]: null
            }));
            return;
        }
        
        // İlgili referans listesini bul
        let dataArray;
        switch (fieldName) {
            case 'personType': dataArray = personTypes || []; break;
            case 'department': dataArray = departments || []; break;
            case 'team': dataArray = teams || []; break;
            case 'title': dataArray = titles || []; break;
            default: dataArray = [];
        }

        // ID'ye göre seçilen öğeyi bul (null kontrolü ekleyerek)
        const selected = dataArray.find(item =>
            item && item.id && item.id.toString() === value.toString()
        );
        
        setFormData(prev => ({
            ...prev,
            [fieldName]: selected || null
        }));
    };
    // Form gönderme
    // handleSubmit fonksiyonunda kart numarasını da gönderin ve fotoğraf yükleyin (284. satır civarında)
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // Kart hatası varsa engelle
        if (cardError) {
            setError("Lütfen geçerli bir kart numarası girin: " + cardError);
            setLoading(false);
            return;
        }

        try {
            // API isteği için veriyi hazırla
            const requestData = {
                ...formData,
                active: formData.isActive,
                lastModifiedByAdmin: { id: adminId },
                contactlessCardNumber: formData.contactlessCardNumber || null,
                removePhoto: formData.photoFileName && !selectedPhoto && !photoPreview,
            };

            let response;
            if (personnel && personnel.id) {
                // Güncelleme yaparken mevcut createdByAdmin değerini koru
                if (personnel.createdByAdmin) {
                    requestData.createdByAdmin = personnel.createdByAdmin;
                }
                response = await api.put(`/api/personnels/${personnel.id}`, requestData);
            } else {
                // Yeni kayıt
                requestData.createdByAdmin = { id: adminId };
                response = await api.post('/api/personnels', requestData);
            }

            // Fotoğraf yükle (eğer seçildiyse)
            if (selectedPhoto) {
                await uploadPhoto(response.data.id);
            }

            onSave(response.data);
            setLoading(false);
            onClose();
        } catch (err) {
            console.error('Personel kaydedilirken hata oluştu:', err);
            setError('Personel kaydedilirken bir hata oluştu. Lütfen tekrar deneyin.');
            setLoading(false);
        }
    };

    // Kapı yetkisi modalını aç
    const openDoorsModal = () => {
        setDoorsModalOpen(true);
    };

    // Yetki grubu modalını aç
    const openGroupsModal = () => {
        setGroupsModalOpen(true);
    };

    // Personel kapı yetkilerini güncelle
    const updateDoorPermissions = async (addedDoorIds, removedDoorIds) => {
        setLoading(true);
        try {
            // Yetki ekle
            if (addedDoorIds.length > 0) {
                await api.post('/api/personnel-permissions/bulk', {
                    personnelId: personnel.id,
                    doorIds: addedDoorIds,
                    adminId: adminId // Şu anki admin ID'si
                });
            }

            // Yetki kaldır
            if (removedDoorIds.length > 0) {
                await api.delete('/api/personnel-permissions/bulk', {
                    data: {
                        personnelId: personnel.id,
                        doorIds: removedDoorIds,
                        adminId: adminId // Şu anki admin ID'si
                    }
                });
            }

            // Yeni personel bilgilerini al (yetkiler dahil)
            const updatedPersonnel = await api.get(`/api/personnels/${personnel.id}`);
            if (updatedPersonnel.data && updatedPersonnel.data.doorPermissions) {
                setDoorPermissions(updatedPersonnel.data.doorPermissions);
            }
        } catch (err) {
            console.error('Kapı yetkileri güncellenirken hata oluştu:', err);
            setError('Kapı yetkileri güncellenirken bir hata oluştu.');
        } finally {
            setLoading(false);
        }
    };

    // Personel grup yetkilerini güncelle
    const updateGroupPermissions = async (addedGroupIds, removedGroupIds) => {
        setLoading(true);
        try {
            // Grup yetkileri ekle
            if (addedGroupIds.length > 0) {
                await api.post('/api/personnel-permission-groups/bulk', {
                    personnelId: personnel.id,
                    permissionGroupIds: addedGroupIds,
                    adminId: adminId // Şu anki admin ID'si
                });
            }

            // Grup yetkileri kaldır
            if (removedGroupIds.length > 0) {
                await api.delete('/api/personnel-permission-groups/bulk', {
                    data: {
                        personnelId: personnel.id,
                        permissionGroupIds: removedGroupIds,
                        adminId: adminId // Şu anki admin ID'si
                    }
                });
            }

            // Yeni personel bilgilerini al (yetkiler dahil)
            const updatedPersonnel = await api.get(`/api/personnels/${personnel.id}`);
            if (updatedPersonnel.data && updatedPersonnel.data.permissionGroupMemberships) {
                setPermissionGroups(updatedPersonnel.data.permissionGroupMemberships);
            }
        } catch (err) {
            console.error('Grup yetkileri güncellenirken hata oluştu:', err);
            setError('Grup yetkileri güncellenirken bir hata oluştu.');
        } finally {
            setLoading(false);
        }
    };

    // Modal dışına tıklandığında kapat
    const handleBackdropClick = (e) => {
        if (e.target.classList.contains('modal-overlay')) {
            if (photoPreview) {
                URL.revokeObjectURL(photoPreview);
            }
            setCardError(null);
            setIsCheckingCard(false);
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={handleBackdropClick}>
            <div className="edit-personnel-modal">
                <div className="modal-header">
                    <h2>{personnel && personnel.id ? 'Personel Düzenle' : 'Yeni Personel Ekle'}</h2>
                    <button className="close-button" onClick={() => {
                        if (photoPreview) {
                            URL.revokeObjectURL(photoPreview);
                        }
                        onClose();
                    }}>
                        <X size={24}/>
                    </button>
                </div>

                <div className="modal-content">
                    {error && <div className="error-message">{error}</div>}

                    <form onSubmit={handleSubmit}>
                        <div className="form-grid">
                            {/* Temel bilgiler */}
                            <div className="form-section">
                                <h3>Temel Bilgiler</h3>

                                <div className="form-group">
                                    <label htmlFor="name">Ad</label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="surname">Soyad</label>
                                    <input
                                        type="text"
                                        id="surname"
                                        name="surname"
                                        value={formData.surname}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="tcNum">TC Kimlik No</label>
                                    <input
                                        type="text"
                                        id="tcNum"
                                        name="tcNum"
                                        value={formData.tcNum || ''}
                                        onChange={handleInputChange}
                                        maxLength="11"
                                        pattern="[0-9]{11}"
                                        title="TC Kimlik No 11 haneli olmalıdır"
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="hireDate">İşe Başlangıç Tarihi</label>
                                    <input
                                        type="date"
                                        id="hireDate"
                                        name="hireDate"
                                        value={formData.hireDate || ''}
                                        onChange={handleInputChange}
                                    />
                                </div>

                                <div className="form-group checkbox-group">
                                    <label>
                                        <input
                                            type="checkbox"
                                            name="isActive"
                                            checked={formData.isActive || false}
                                            onChange={handleInputChange}
                                        />
                                        Aktif
                                    </label>
                                </div>
                            </div>

                            <div className="photo-card-section">
                                {/* Fotoğraf seçimi */}
                                <div className="form-section">
                                    <h3>Fotoğraf</h3>
                                    <div className="form-group">
                                        <div className="photo-upload-container">
                                            {photoPreview ? (
                                                <div className="photo-preview">
                                                    <img
                                                        src={photoPreview}
                                                        alt="Personel Fotoğrafı"
                                                    />
                                                    <label htmlFor="personPhoto" className="photo-overlay">
                                                        <Plus size={36}/>
                                                    </label>
                                                    <button
                                                        type="button"
                                                        className="remove-photo-button-icon"
                                                        onClick={handleRemovePhoto}
                                                        title="Fotoğrafı Kaldır"
                                                    >
                                                        <XCircle size={24}/>
                                                    </button>
                                                </div>
                                            ) : formData.photoFileName ? (
                                                <div className="photo-preview loading">
                                                    <div className="spinner-small"></div>
                                                    <label htmlFor="personPhoto" className="photo-overlay">
                                                        <Plus size={36}/>
                                                    </label>
                                                </div>
                                            ) : (
                                                <div className="photo-placeholder">
                                                    <User size={50}/>
                                                    <label htmlFor="personPhoto" className="photo-overlay">
                                                        <Plus size={36}/>
                                                    </label>
                                                </div>
                                            )}
                                            <input
                                                type="file"
                                                id="personPhoto"
                                                name="personPhoto"
                                                accept="image/*"
                                                onChange={handlePhotoChange}
                                                className="photo-input"
                                            />
                                            <div className="photo-actions">
                                                <label htmlFor="personPhoto" className="photo-upload-button">
                                                    <Plus size={16}/> Fotoğraf Seç
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Kart numarası */}
                                <div className="form-section">
                                    <h3>Kart Bilgileri</h3>
                                    <div className="form-group">
                                        <label htmlFor="contactlessCardNumber">Temassız Kart Numarası</label>
                                        <div className="card-input-container">
                                            <input
                                                type="text"
                                                id="contactlessCardNumber"
                                                name="contactlessCardNumber"
                                                value={formData.contactlessCardNumber || ''}
                                                onChange={handleInputChange}
                                            />
                                            {isCheckingCard &&
                                                <span className="checking-card">Kontrol ediliyor...</span>}
                                            {cardError && <div className="card-error">{cardError}</div>}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Organizasyon bilgileri */}
                            <div className="form-section">
                                <h3>Organizasyon Bilgileri</h3>

                                <div className="form-group">
                                    <SearchableDropdown
                                        id="personType"
                                        name="personType"
                                        label="Personel Türü"
                                        options={personTypes}
                                        value={formData.personType?.id || ''}
                                        onChange={(e) => handleSelectChange(e, 'personType')}
                                        labelField="name"
                                        valueField="id"
                                        placeholder="Seçiniz"
                                    />
                                </div>

                                <div className="form-group">
                                    <SearchableDropdown
                                        id="department"
                                        name="department"
                                        label="Departman"
                                        options={departments}
                                        value={formData.department?.id || ''}
                                        onChange={(e) => handleSelectChange(e, 'department')}
                                        labelField="name"
                                        valueField="id"
                                        placeholder="Seçiniz"
                                    />
                                </div>

                                <div className="form-group">
                                    <SearchableDropdown
                                        id="team"
                                        name="team"
                                        label="Takım"
                                        options={teams}
                                        value={formData.team?.id || ''}
                                        onChange={(e) => handleSelectChange(e, 'team')}
                                        labelField="name"
                                        valueField="id"
                                        placeholder="Seçiniz"
                                    />
                                </div>

                                <div className="form-group">
                                    <SearchableDropdown
                                        id="title"
                                        name="title"
                                        label="Ünvan"
                                        options={titles}
                                        value={formData.title?.id || ''}
                                        onChange={(e) => handleSelectChange(e, 'title')}
                                        labelField="name"
                                        valueField="id"
                                        placeholder="Seçiniz"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Yetkiler ve yetki grupları */}
                        <div className="permissions-section">
                            <h3>Geçiş Yetkileri</h3>

                            {/* Doğrudan kapı yetkileri */}
                            <div className="permission-block">
                                <div className="permission-header">
                                    <h4>Kapı Yetkileri</h4>
                                    <button
                                        type="button"
                                        className="add-permission-button"
                                        onClick={openDoorsModal}
                                        disabled={!personnel?.id}
                                    >
                                        Yetki Ekle
                                    </button>
                                </div>

                                <div className="permission-items">
                                    {doorPermissions && doorPermissions.length > 0 ? (
                                        doorPermissions.map(permission => (
                                            <div key={permission.id} className="permission-item">
                                                <span>{permission.door?.name || 'İsimsiz Kapı'}</span>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="no-permissions">Kapı yetkisi bulunmamaktadır</div>
                                    )}
                                </div>
                            </div>

                            {/* Yetki grup üyelikleri */}
                            <div className="permission-block">
                                <div className="permission-header">
                                    <h4>Grup Yetkileri</h4>
                                    <button
                                        type="button"
                                        className="add-permission-button"
                                        onClick={openGroupsModal}
                                        disabled={!personnel?.id}
                                    >
                                        Yetki Grubu Ekle
                                    </button>
                                </div>

                                <div className="permission-items">
                                    {permissionGroups && permissionGroups.length > 0 ? (
                                        permissionGroups.map(group => (
                                            <div key={group.id} className="permission-item">
                                                <span>{group.permissionGroup?.name || 'İsimsiz Grup'}</span>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="no-permissions">Grup yetkisi bulunmamaktadır</div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="form-actions">
                            <button type="button" className="cancel-button" onClick={() => {
                                if (photoPreview) {
                                    URL.revokeObjectURL(photoPreview);
                                }
                                onClose();
                            }}>
                                <XCircle size={16} />
                                İptal
                            </button>
                            <button type="submit" className="save-button" disabled={loading}>
                                <Save size={16}/>
                                {loading ? 'Kaydediliyor...' : (personnel && personnel.id ? 'Güncelle' : 'Ekle')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Kapı yetkileri modalı */}
            {doorsModalOpen && (
                <PermissionTransferModal
                    title="Kapı Yetkileri"
                    isOpen={doorsModalOpen}
                    onClose={() => setDoorsModalOpen(false)}
                    allItems={availableDoors || []}
                    assignedItems={doorPermissions && doorPermissions.length > 0 ?
                        doorPermissions.map(perm => perm.door).filter(Boolean) : []}
                    itemLabelField="name"
                    onSave={(added, removed) => {
                        updateDoorPermissions(added, removed);
                        setDoorsModalOpen(false);
                    }}
                />
            )}

            {/* Grup yetkileri modalı */}
            {groupsModalOpen && (
                <PermissionTransferModal
                    title="Yetki Grupları"
                    isOpen={groupsModalOpen}
                    onClose={() => setGroupsModalOpen(false)}
                    allItems={availableGroups || []}
                    assignedItems={permissionGroups && permissionGroups.length > 0 ?
                        permissionGroups.map(group => group.permissionGroup).filter(Boolean) : []}
                    itemLabelField="name"
                    onSave={(added, removed) => {
                        updateGroupPermissions(added, removed);
                        setGroupsModalOpen(false);
                    }}
                />
            )}
        </div>
    );
};

// Yetki transfer modalı
// Yetki transfer modalı
const PermissionTransferModal = ({ title, isOpen, onClose, allItems, assignedItems, itemLabelField, onSave }) => {
    const [available, setAvailable] = useState([]);
    const [assigned, setAssigned] = useState([]);
    const [selectedAvailable, setSelectedAvailable] = useState([]);
    const [selectedAssigned, setSelectedAssigned] = useState([]);

    // Arama özellikleri için state'ler
    const [availableSearch, setAvailableSearch] = useState('');
    const [assignedSearch, setAssignedSearch] = useState('');

    // Filtrelenmiş liste state'leri
    const [filteredAvailable, setFilteredAvailable] = useState([]);
    const [filteredAssigned, setFilteredAssigned] = useState([]);

    // İlk yükleme
    useEffect(() => {
        if (isOpen) {
            try {
                // Güvenlik kontrolü
                const validAssignedItems = Array.isArray(assignedItems) ? assignedItems.filter(Boolean) : [];
                const validAllItems = Array.isArray(allItems) ? allItems.filter(Boolean) : [];

                // Atanmış ID'ler
                const assignedIds = validAssignedItems.map(item => item.id);

                // Kullanılabilir öğeleri ayarla (atanmış olmayanlar)
                const availableItems = validAllItems.filter(item => !assignedIds.includes(item.id));

                setAvailable(availableItems);
                setAssigned([...validAssignedItems]);

                // Filtrelenmiş listeleri de ayarla
                setFilteredAvailable(availableItems);
                setFilteredAssigned([...validAssignedItems]);

                // Seçimleri sıfırla
                setSelectedAvailable([]);
                setSelectedAssigned([]);

                // Arama kutularını temizle
                setAvailableSearch('');
                setAssignedSearch('');
            } catch (error) {
                console.error('Yetki modalı yüklenirken hata oluştu:', error);
                setAvailable([]);
                setAssigned([]);
                setFilteredAvailable([]);
                setFilteredAssigned([]);
            }
        }
    }, [isOpen, allItems, assignedItems]);

    // Mevcut yetkiler araması değiştikçe filtreleme yap
    useEffect(() => {
        if (availableSearch.trim() === '') {
            setFilteredAvailable(available);
        } else {
            const searchTerm = availableSearch.toLowerCase();
            const filtered = available.filter(item =>
                item[itemLabelField]?.toLowerCase().includes(searchTerm)
            );
            setFilteredAvailable(filtered);
        }
    }, [availableSearch, available, itemLabelField]);

    // Atanmış yetkiler araması değiştikçe filtreleme yap
    useEffect(() => {
        if (assignedSearch.trim() === '') {
            setFilteredAssigned(assigned);
        } else {
            const searchTerm = assignedSearch.toLowerCase();
            const filtered = assigned.filter(item =>
                item[itemLabelField]?.toLowerCase().includes(searchTerm)
            );
            setFilteredAssigned(filtered);
        }
    }, [assignedSearch, assigned, itemLabelField]);

    // Kullanılabilir öğelerden seçim
    const toggleSelectAvailable = (item) => {
        setSelectedAvailable(prev => {
            if (prev.some(i => i.id === item.id)) {
                return prev.filter(i => i.id !== item.id);
            } else {
                return [...prev, item];
            }
        });
    };

    // Atanmış öğelerden seçim
    const toggleSelectAssigned = (item) => {
        setSelectedAssigned(prev => {
            if (prev.some(i => i.id === item.id)) {
                return prev.filter(i => i.id !== item.id);
            } else {
                return [...prev, item];
            }
        });
    };

    // Tüm kullanılabilir öğeleri seç/kaldır
    const toggleSelectAllAvailable = () => {
        if (selectedAvailable.length === filteredAvailable.length) {
            // Tüm seçimleri kaldır
            setSelectedAvailable([]);
        } else {
            // Tümünü seç (filtrelenmiş listeyi)
            setSelectedAvailable([...filteredAvailable]);
        }
    };

    // Tüm atanmış öğeleri seç/kaldır
    const toggleSelectAllAssigned = () => {
        if (selectedAssigned.length === filteredAssigned.length) {
            // Tüm seçimleri kaldır
            setSelectedAssigned([]);
        } else {
            // Tümünü seç (filtrelenmiş listeyi)
            setSelectedAssigned([...filteredAssigned]);
        }
    };

    // Sağa taşı (Atama)
    const moveToAssigned = () => {
        if (selectedAvailable.length === 0) return;

        // Atanmış listeye ekle
        setAssigned(prev => [...prev, ...selectedAvailable]);

        // Kullanılabilir listeden çıkar
        setAvailable(prev => prev.filter(item => !selectedAvailable.some(selected => selected.id === item.id)));

        // Seçimi temizle
        setSelectedAvailable([]);
    };

    // Sola taşı (Kaldırma)
    const moveToAvailable = () => {
        if (selectedAssigned.length === 0) return;

        // Kullanılabilir listeye ekle
        setAvailable(prev => [...prev, ...selectedAssigned]);

        // Atanmış listeden çıkar
        setAssigned(prev => prev.filter(item => !selectedAssigned.some(selected => selected.id === item.id)));

        // Seçimi temizle
        setSelectedAssigned([]);
    };

    // Değişiklikleri kaydet ve kapat
    const handleSave = () => {
        try {
            // Önceki ve şimdiki ID'leri karşılaştır
            const originalAssignedIds = (Array.isArray(assignedItems) ? assignedItems : [])
                .filter(Boolean)
                .map(item => item.id);

            const newAssignedIds = assigned
                .filter(Boolean)
                .map(item => item.id);

            // Yeni eklenen ve çıkarılan ID'leri hesapla
            const addedIds = newAssignedIds.filter(id => !originalAssignedIds.includes(id));
            const removedIds = originalAssignedIds.filter(id => !newAssignedIds.includes(id));

            // Değişiklikleri kaydet
            onSave(addedIds, removedIds);
        } catch (error) {
            console.error('Yetki değişiklikleri kaydedilirken hata oluştu:', error);
        }
    };

    // Modal dışına tıklandığında kapat
    const handleBackdropClick = (e) => {
        if (e.target.classList.contains('modal-overlay')) {
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={handleBackdropClick}>
            <div className="permission-transfer-modal">
                <div className="modal-header">
                    <h2>{title}</h2>
                    <button className="close-button" onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>

                <div className="transfer-container">
                    {/* Sol panel - Kullanılabilir */}
                    <div className="transfer-panel">
                        <h3>Tüm Yetkiler</h3>

                        {/* Arama ve Tümünü seç butonları */}
                        <div className="panel-actions">
                            <div className="search-box">
                                <input
                                    type="text"
                                    placeholder="Ara..."
                                    value={availableSearch}
                                    onChange={(e) => setAvailableSearch(e.target.value)}
                                />
                            </div>
                            <button
                                className={`select-all-btn ${selectedAvailable.length === filteredAvailable.length && filteredAvailable.length > 0 ? 'active' : ''}`}
                                onClick={toggleSelectAllAvailable}
                                disabled={filteredAvailable.length === 0}
                            >
                                Tümünü {selectedAvailable.length === filteredAvailable.length && filteredAvailable.length > 0 ? 'Kaldır' : 'Seç'}
                            </button>
                        </div>

                        <div className="items-list">
                            {filteredAvailable && filteredAvailable.length > 0 ? (
                                filteredAvailable.map(item => (
                                    <div
                                        key={item.id}
                                        className={`item ${selectedAvailable.some(i => i.id === item.id) ? 'selected' : ''}`}
                                        onClick={() => toggleSelectAvailable(item)}
                                    >
                                        <span>{item[itemLabelField] || 'İsimsiz Öğe'}</span>
                                    </div>
                                ))
                            ) : (
                                <div className="no-items">
                                    {availableSearch ? 'Arama sonucu bulunamadı' : 'Tüm yetkiler atanmış'}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Orta panel - Transfer butonları */}
                    <div className="transfer-controls">
                        <button
                            className="transfer-button"
                            onClick={moveToAssigned}
                            disabled={selectedAvailable.length === 0}
                        >
                            <ChevronRight size={20} />
                        </button>
                        <button
                            className="transfer-button"
                            onClick={moveToAvailable}
                            disabled={selectedAssigned.length === 0}
                        >
                            <ChevronLeft size={20} />
                        </button>
                    </div>

                    {/* Sağ panel - Atanmış */}
                    <div className="transfer-panel">
                        <h3>Atanmış Yetkiler</h3>

                        {/* Arama ve Tümünü seç butonları */}
                        <div className="panel-actions">
                            <div className="search-box">
                                <input
                                    type="text"
                                    placeholder="Ara..."
                                    value={assignedSearch}
                                    onChange={(e) => setAssignedSearch(e.target.value)}
                                />
                            </div>
                            <button
                                className={`select-all-btn ${selectedAssigned.length === filteredAssigned.length && filteredAssigned.length > 0 ? 'active' : ''}`}
                                onClick={toggleSelectAllAssigned}
                                disabled={filteredAssigned.length === 0}
                            >
                                Tümünü {selectedAssigned.length === filteredAssigned.length && filteredAssigned.length > 0 ? 'Kaldır' : 'Seç'}
                            </button>
                        </div>

                        <div className="items-list">
                            {filteredAssigned && filteredAssigned.length > 0 ? (
                                filteredAssigned.map(item => (
                                    <div
                                        key={item.id}
                                        className={`item ${selectedAssigned.some(i => i.id === item.id) ? 'selected' : ''}`}
                                        onClick={() => toggleSelectAssigned(item)}
                                    >
                                        <span>{item[itemLabelField] || 'İsimsiz Öğe'}</span>
                                    </div>
                                ))
                            ) : (
                                <div className="no-items">
                                    {assignedSearch ? 'Arama sonucu bulunamadı' : 'Atanmış yetki yok'}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="modal-footer">
                    <button className="cancel-button" onClick={onClose}>
                        İptal
                    </button>
                    <button className="save-button" onClick={handleSave}>
                        Kaydet
                    </button>
                </div>
            </div>
        </div>
    );
};


export default EditPersonnelModal;