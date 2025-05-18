import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import '../styles/PersonnelManagement.css';
import '../styles/FilterButtonsStandard.css';
import Layout from '../components/layout/Layout';
import PersonnelImage from '../components/PersonnelImage';
import EditPersonnelModal from '../components/EditPersonnelModal';
import ExportToExcel from '../components/ExportToExcel';
import PersonnelFilters from '../components/PersonnelFilters';

import {
    Search, UserPlus, Edit, Trash2, UserMinus, ChevronLeft, ChevronRight,
    AlertTriangle, Filter, X, Image as ImageIcon
} from 'lucide-react';

const PersonnelManagement = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [personnel, setPersonnel] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [totalItems, setTotalItems] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'active', 'inactive'
    const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'asc' });
    const [selectedImage, setSelectedImage] = useState(null);
    const [imageLoadErrors, setImageLoadErrors] = useState({});

    // EditPersonnelModal için state'ler
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedPersonnel, setSelectedPersonnel] = useState(null);

    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showDeactivateConfirm, setShowDeactivateConfirm] = useState(false);
    const [personToAction, setPersonToAction] = useState(null);

    const [excelColumns, setExcelColumns] = useState([
        { key: 'name', header: 'Ad' },
        { key: 'surname', header: 'Soyad' },
        { key: 'tcNum', header: 'TC Numarası' },
        { key: 'active', header: 'Durum', accessor: (person) => person.active ? 'Aktif' : 'Pasif' },
        { key: 'hireDate', header: 'Başlama Tarihi', accessor: (person) => formatDate(person.hireDate) },
        { key: 'personType.name', header: 'Personel Türü' },
        { key: 'department.name', header: 'Departman' },
        { key: 'title.name', header: 'Ünvan' },
        { key: 'createdAt', header: 'Oluşturulma Tarihi', accessor: (person) => formatDate(person.createdAt) },
        { key: 'createdByAdmin.username', header: 'Oluşturan Admin' },
        { key: 'updatedAt', header: 'Son Düzenleme Tarihi', accessor: (person) => formatDate(person.updatedAt) },
        { key: 'lastModifiedByAdmin.username', header: 'Son Düzenleyen Admin' }
    ]);

    const [filteredData, setFilteredData] = useState([]);

    const [detailedFilters, setDetailedFilters] = useState({
        name: '',
        surname: '',
        tcNum: '',
        departmentId: '',
        titleId: '',
        personTypeId: '',
        status: '',
        startDate: '',
        endDate: ''
    });

    // Personel verilerini çek
    useEffect(() => {
        fetchPersonnel();
    }, [currentPage, itemsPerPage, filterStatus, sortConfig, searchTerm, detailedFilters]);

    const fetchPersonnel = async () => {
        try {
            setLoading(true);
            setError(null);

            // API endpoint'i belirleme
            let endpoint = '/api/personnels';

            // Aktif/pasif filtresi
            if (filterStatus === 'active') {
                endpoint = '/api/personnels/is-active-true';
            } else if (filterStatus === 'inactive') {
                endpoint = '/api/personnels/is-active-false';
            }

            const response = await api.get(endpoint);
            let personnelData = response.data;

            // Hata ayıklama için personel verilerini yazdır
            console.log("Personel Verileri:", personnelData);

            // Arama filtresi (isim, soyisim ve TC no'ya göre)
            if (searchTerm.trim() !== '') {
                personnelData = personnelData.filter(person =>
                    (person.name && person.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                    (person.surname && person.surname.toLowerCase().includes(searchTerm.toLowerCase())) ||
                    (person.tcNum && person.tcNum.includes(searchTerm))
                );
            }

            // Detaylı filtrelemeler
            if (detailedFilters) {
                // Filtreleme ayarlarını konsola yazarak hata ayıklama
                console.log("Uygulanacak filtreler:", detailedFilters);
                
                personnelData = personnelData.filter(person => {
                    // İsim filtresi
                    if (detailedFilters.name && 
                        (!person.name || !person.name.toLowerCase().includes(detailedFilters.name.toLowerCase()))) {
                        return false;
                    }
                    
                    // Soyisim filtresi
                    if (detailedFilters.surname && 
                        (!person.surname || !person.surname.toLowerCase().includes(detailedFilters.surname.toLowerCase()))) {
                        return false;
                    }
                    
                    // TC No filtresi
                    if (detailedFilters.tcNum && 
                        (!person.tcNum || !person.tcNum.includes(detailedFilters.tcNum))) {
                        return false;
                    }
                    
                    // Departman ID filtresi
                    if (detailedFilters.departmentId && 
                        (!person.department || person.department.id.toString() !== detailedFilters.departmentId.toString())) {
                        return false;
                    }
                    
                    // Unvan ID filtresi
                    if (detailedFilters.titleId && 
                        (!person.title || person.title.id.toString() !== detailedFilters.titleId.toString())) {
                        return false;
                    }
                    
                    // Personel Türü ID filtresi
                    if (detailedFilters.personTypeId && 
                        (!person.personType || person.personType.id.toString() !== detailedFilters.personTypeId.toString())) {
                        return false;
                    }
                    
                    // Durum filtresi
                    if (detailedFilters.status && detailedFilters.status !== '') {
                        // Hata ayıklama için person.active ve person.isActive değerlerini kontrol et
                        console.log(`Personel ${person.id} - ${person.name} ${person.surname} durumu:`, 
                            { active: person.active, isActive: person.isActive });
                            
                        const boolStatus = detailedFilters.status === 'true';
                        // Hem active hem de isActive alanlarını kontrol edelim
                        if ((person.active === undefined && person.isActive === undefined) || 
                            (person.active !== boolStatus && person.isActive !== boolStatus)) {
                            return false;
                        }
                    }
                    
                    // Kayıt tarihi aralığı filtreleri
                    if (detailedFilters.startDate && detailedFilters.startDate.trim() !== '') {
                        try {
                            const startDate = new Date(detailedFilters.startDate);
                            startDate.setHours(0, 0, 0, 0); // Günün başlangıcına ayarla
                            
                            console.log(`Filtering by start date: ${startDate.toISOString()}`);
                            
                            // Specifically use hireDate for filtering (işe başlama tarihi)
                            if (!person.hireDate) {
                                console.log(`Person ${person.id} (${person.name}) has no hire date, filtering out`);
                                return false; // Filter out people without a hire date
                            }
                            
                            const personDate = new Date(person.hireDate);
                            console.log(`Person ${person.id} (${person.name}) hireDate: ${person.hireDate}, parsed as ${personDate.toISOString()}`);
                            
                            if (personDate.getTime() < startDate.getTime()) {
                                console.log(`Person ${person.id} filtered out by start date`);
                                return false;
                            }
                        } catch (error) {
                            console.error('Error comparing start date:', error);
                        }
                    }
                    
                    if (detailedFilters.endDate && detailedFilters.endDate.trim() !== '') {
                        try {
                            const endDate = new Date(detailedFilters.endDate);
                            endDate.setHours(23, 59, 59, 999); // Günün sonuna ayarla
                            
                            console.log(`Filtering by end date: ${endDate.toISOString()}`);
                            
                            // Specifically use hireDate for filtering (işe başlama tarihi)
                            if (!person.hireDate) {
                                console.log(`Person ${person.id} (${person.name}) has no hire date, filtering out`);
                                return false; // Filter out people without a hire date
                            }
                            
                            const personDate = new Date(person.hireDate);
                            
                            if (personDate.getTime() > endDate.getTime()) {
                                console.log(`Person ${person.id} filtered out by end date`);
                                return false;
                            }
                        } catch (error) {
                            console.error('Error comparing end date:', error);
                        }
                    }
                    
                    return true;
                });
                
                // Filtreleme sonuçlarını konsola yazarak hata ayıklama
                console.log(`Filtreleme sonucu: ${personnelData.length} kayıt bulundu`);
            }

            // Sıralama
            if (sortConfig.key) {
                personnelData.sort((a, b) => {
                    // null kontrolü
                    if (a[sortConfig.key] === null) return sortConfig.direction === 'asc' ? 1 : -1;
                    if (b[sortConfig.key] === null) return sortConfig.direction === 'asc' ? -1 : 1;

                    if (typeof a[sortConfig.key] === 'string') {
                        return sortConfig.direction === 'asc'
                            ? a[sortConfig.key].localeCompare(b[sortConfig.key])
                            : b[sortConfig.key].localeCompare(a[sortConfig.key]);
                    } else {
                        return sortConfig.direction === 'asc'
                            ? a[sortConfig.key] - b[sortConfig.key]
                            : b[sortConfig.key] - a[sortConfig.key];
                    }
                });
            }

            setFilteredData(personnelData);
            setTotalItems(personnelData.length);

            // Sayfalama
            const startIndex = (currentPage - 1) * itemsPerPage;
            const paginatedData = personnelData.slice(startIndex, startIndex + itemsPerPage);

            setPersonnel(paginatedData);
            setLoading(false);
        } catch (err) {
            console.error('Personel verileri yüklenirken hata oluştu:', err);
            setError('Personel verileri yüklenirken bir hata oluştu. Lütfen tekrar deneyin.');
            setLoading(false);
        }
    };

    // Resim yükleme hatası kontrolü
    const handleImageError = (personId) => {
        console.error(`Resim yüklenemedi: ID=${personId}`);
        setImageLoadErrors(prev => ({
            ...prev,
            [personId]: true
        }));
    };

    // Arama değişikliğinde
    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1); // Aramada ilk sayfaya dön
    };

    const handleSearchSubmit = (e) => {
        // Enter tuşuna basıldığında aramayı gerçekleştir
        if (e.key === 'Enter') {
            fetchPersonnel();
        }
    }

    // Durum filtresini değiştiğinde
    const handleStatusFilterChange = (status) => {
        setFilterStatus(status);
        setCurrentPage(1);
    };

    // Sıralama işlemi
    const requestSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    // Tarih formatla
    const formatDate = (timestamp) => {
        if (!timestamp) return '-';
        const date = new Date(timestamp);

        // Tarih ve saat formatı
        const dateString = date.toLocaleDateString('tr-TR'); // Gün-Ay-Yıl
        const timeString = date.toLocaleTimeString('tr-TR', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        }); // Saat:Dakika:Saniye

        return `${dateString} ${timeString}`; // Tarih ve saati birleştir
    };

    // Sonraki sayfa
    const nextPage = () => {
        if (currentPage < Math.ceil(totalItems / itemsPerPage)) {
            setCurrentPage(currentPage + 1);
        }
    };

    // Önceki sayfa
    const prevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    // Sayfadaki öğe sayısını değiştir
    const handleItemsPerPageChange = (e) => {
        setItemsPerPage(Number(e.target.value));
        setCurrentPage(1);
    };

    // Resim önizleme modalını göster
    const showImagePreview = (personId, photoFileName) => {
        if (photoFileName) {
            try {
                const token = localStorage.getItem('accessToken');
                if (!token) {
                    console.error('Token bulunamadı, resim yüklenemedi');
                    return;
                }

                console.log(`Resim önizleme açılıyor: PersonID=${personId}, PhotoFileName=${photoFileName}`);

                // Resmi yükle ve Blob URL oluştur
                api.get(`/api/personnels/${personId}/photo`, {
                    responseType: 'blob',
                    headers: { 'Authorization': `Bearer ${token}` }
                })
                    .then(response => {
                        // Eski bir URL varsa, onu serbest bırak
                        if (selectedImage && !selectedImage.includes('/photo')) {
                            URL.revokeObjectURL(selectedImage);
                        }
                        
                        const imageUrl = URL.createObjectURL(response.data);
                        setSelectedImage(imageUrl);
                        
                        // Modal açıldığında, dışarıdaki tıklamaları engelleyelim
                        document.body.style.overflow = 'hidden';
                        
                        // Event listener'ları ayarlayacak timeout
                        setTimeout(() => {
                            // Modal kapatma işlevi için event listener
                            const handleKeyDown = (e) => {
                                if (e.key === 'Escape') {
                                    closeImagePreview();
                                }
                            };
                            
                            // Döküman üzerinde keydown event listener'ı ekle
                            document.addEventListener('keydown', handleKeyDown);
                            
                            // Modal içeriğine focus ver
                            const modalContent = document.querySelector('.image-preview-content');
                            if (modalContent) {
                                modalContent.focus();
                            }
                            
                            // Modal kapandığında event listener'ı temizle
                            const cleanup = () => {
                                document.removeEventListener('keydown', handleKeyDown);
                            };
                            
                            // Temizleme fonksiyonunu state'e ekleyelim
                            window._modalCleanup = cleanup;
                        }, 100);
                    })
                    .catch(error => {
                        console.error(`Resim yüklenirken hata oluştu: ${error}`);
                    });
            } catch (err) {
                console.error('Resim önizleme açılırken beklenmeyen hata:', err);
            }
        }
    };

    // Resim önizleme modalını kapat
    const closeImagePreview = () => {
        try {
            // Temizleme fonksiyonunu çağır
            if (window._modalCleanup) {
                window._modalCleanup();
                window._modalCleanup = null;
            }
            
            // Body overflow'u düzelt
            document.body.style.overflow = '';
            
            // Blob URL oluşturulduysa, kaynakları serbest bırak
            if (selectedImage && !selectedImage.includes('/')) {
                URL.revokeObjectURL(selectedImage);
            }
            setSelectedImage(null);
        } catch (err) {
            console.error('Modal kapatılırken hata:', err);
            // Hata olsa da state'i temizle
            setSelectedImage(null);
        }
    };

    const handleAddNewPersonnel = () => {
        // Boş personel verisi ile modal'ı aç
        setSelectedPersonnel(null); // null olarak ayarlayarak yeni personel olduğunu belirtiyoruz
        setIsEditModalOpen(true);
    };

    // Düzenleme modalını açan handler
    const handleEditClick = (person) => {
        setSelectedPersonnel(person);
        setIsEditModalOpen(true);
    };

    // Modal kapatma handler'ı
    const handleCloseModal = () => {
        setIsEditModalOpen(false);
        setSelectedPersonnel(null);
    };

    // Personel güncellendiğinde çalışacak handler
    const handlePersonnelUpdate = (updatedPersonnel) => {
        // Personel listesini güncelle
        setPersonnel(prev =>
            prev.map(p => p.id === updatedPersonnel.id ? updatedPersonnel : p)
        );
        // Güncellemeden sonra modalı kapat
        handleCloseModal();
        // Verileri yeniden yükle
        fetchPersonnel();
    };

    const handleDeleteClick = (person) => {
        setPersonToAction(person);
        setShowDeleteConfirm(true);
    };

    // Onay sonrası personeli silen handler
    const handleConfirmDelete = async () => {
        try {
            await api.delete(`/api/personnels/${personToAction.id}`);
            // Personeli listeden kaldır
            setPersonnel(prev => prev.filter(p => p.id !== personToAction.id));
            setShowDeleteConfirm(false);
            setPersonToAction(null);
            // Verileri yeniden yükle
            fetchPersonnel();
        } catch (err) {
            console.error('Personel silinirken hata oluştu:', err);
            // Hata durumunda da diyaloğu kapat
            setShowDeleteConfirm(false);
            setPersonToAction(null);
        }
    };

    // Deaktif etme onay diyaloğunu gösteren handler
    const handleDeactivateClick = (person) => {
        setPersonToAction(person);
        setShowDeactivateConfirm(true);
    };

    // Onay sonrası personeli deaktif eden handler
    const handleConfirmDeactivate = async () => {
        try {
            // Personel verisini alın
            const updatedPersonnel = { ...personToAction, active: false };
            // API'ye PUT isteği gönderin
            await api.put(`/api/personnels/${personToAction.id}`, updatedPersonnel);
            // Personeli listede güncelle
            setPersonnel(prev =>
                prev.map(p => p.id === personToAction.id ? { ...p, active: false } : p)
            );
            setShowDeactivateConfirm(false);
            setPersonToAction(null);
            // Verileri yeniden yükle
            fetchPersonnel();
        } catch (err) {
            console.error('Personel deaktif edilirken hata oluştu:', err);
            // Hata durumunda da diyaloğu kapat
            setShowDeactivateConfirm(false);
            setPersonToAction(null);
        }
    };

    // Detaylı filtreleri uygula
    const handleDetailedFilterChange = (filters) => {
        console.log("Filtreleme yapılıyor:", filters);
        // Status değerini kontrol et
        if (filters.status) {
            console.log(`Status filtresi: ${filters.status}, tip: ${typeof filters.status}`);
        }
        setDetailedFilters(filters);
        setCurrentPage(1); // Filtreleme yapıldığında ilk sayfaya dön
    };

    // Yükleme durumu
    if (loading && personnel.length === 0) {
        return (
            <div className="personnel-loading">
                <div className="spinner"></div>
                <p>Personel verileri yükleniyor...</p>
            </div>
        );
    }

    // Hata durumu
    if (error && personnel.length === 0) {
        return (
            <div className="personnel-error">
                <AlertTriangle size={48} />
                <h2>Hata Oluştu</h2>
                <p>{error}</p>
                <button className="retry-button" onClick={fetchPersonnel}>
                    Yeniden Dene
                </button>
            </div>
        );
    }

    return (
        <Layout pageTitle="Personel Yönetimi">
            {/* Ana içerik */}
            <div className="personnel-tools">
                <div className="search-filter-wrapper">
                    <div className="search-filter">
                        <div className="search-tools">
                            <div className="search-box">
                                <Search size={18}/>
                                <input
                                    type="text"
                                    placeholder="Personel ara..."
                                    value={searchTerm}
                                    onChange={handleSearch}
                                    onKeyPress={handleSearchSubmit}
                                />
                            </div>

                            <div className="filter-buttons">
                                <button
                                    className={`filter-button ${filterStatus === 'all' ? 'active' : ''}`}
                                    onClick={() => handleStatusFilterChange('all')}
                                >
                                    Tümü
                                </button>
                                <button
                                    className={`filter-button ${filterStatus === 'active' ? 'active' : ''}`}
                                    onClick={() => handleStatusFilterChange('active')}
                                >
                                    Aktif
                                </button>
                                <button
                                    className={`filter-button ${filterStatus === 'inactive' ? 'active' : ''}`}
                                    onClick={() => handleStatusFilterChange('inactive')}
                                >
                                    Pasif
                                </button>
                                <PersonnelFilters onFilterChange={handleDetailedFilterChange} />
                            </div>
                        </div>
                        
                        <div className="export-button">
                            <ExportToExcel
                                data={filteredData.length > 0 ? filteredData : []}
                                fileName="Personel_bilgileri"
                                columns={excelColumns}
                            />
                        </div>

                        <div className="action-buttons">
                            <button className="add-button"
                                    onClick={handleAddNewPersonnel}>
                                <UserPlus size={16}/>
                                <span>Yeni Personel</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Personel tablosu */}
            <div className="personnel-table-container">
                <div className="table-wrapper">
                    <table className="personnel-table">
                        <thead>
                        <tr>
                            <th>Fotoğraf</th>
                            <th onClick={() => requestSort('name')}>
                                Ad
                                {sortConfig.key === 'name' && (
                                    <span className="sort-icon">
                                        {sortConfig.direction === 'asc' ? '↑' : '↓'}
                                    </span>
                                )}
                            </th>
                            <th onClick={() => requestSort('surname')}>
                                Soyad
                                {sortConfig.key === 'surname' && (
                                    <span className="sort-icon">
                                        {sortConfig.direction === 'asc' ? '↑' : '↓'}
                                    </span>
                                )}
                            </th>
                            <th onClick={() => requestSort('tcNum')}>
                                TC Numarası
                                {sortConfig.key === 'tcNum' && (
                                    <span className="sort-icon">
                                        {sortConfig.direction === 'asc' ? '↑' : '↓'}
                                    </span>
                                )}
                            </th>
                            <th onClick={() => requestSort('isActive')}>
                                Durum
                                {sortConfig.key === 'isActive' && (
                                    <span className="sort-icon">
                                        {sortConfig.direction === 'asc' ? '↑' : '↓'}
                                    </span>
                                )}
                            </th>
                            <th onClick={() => requestSort('hireDate')}>
                                Başlama Tarihi
                                {sortConfig.key === 'hireDate' && (
                                    <span className="sort-icon">
                                        {sortConfig.direction === 'asc' ? '↑' : '↓'}
                                    </span>
                                )}
                            </th>
                            <th onClick={() => requestSort('personType')}>
                                Personel Türü
                                {sortConfig.key === 'personType' && (
                                    <span className="sort-icon">
                                        {sortConfig.direction === 'asc' ? '↑' : '↓'}
                                    </span>
                                )}
                            </th>
                            <th onClick={() => requestSort('department')}>
                                Departman
                                {sortConfig.key === 'department' && (
                                    <span className="sort-icon">
                                        {sortConfig.direction === 'asc' ? '↑' : '↓'}
                                    </span>
                                )}
                            </th>
                            <th onClick={() => requestSort('title')}>
                                Ünvan
                                {sortConfig.key === 'title' && (
                                    <span className="sort-icon">
                                        {sortConfig.direction === 'asc' ? '↑' : '↓'}
                                    </span>
                                )}
                            </th>
                            <th onClick={() => requestSort('createdAt')}>
                                Oluşturulma
                                {sortConfig.key === 'createdAt' && (
                                    <span className="sort-icon">
                                        {sortConfig.direction === 'asc' ? '↑' : '↓'}
                                    </span>
                                )}
                            </th>
                            <th onClick={() => requestSort('updatedAt')}>
                                Son Düzenleme
                                {sortConfig.key === 'updatedAt' && (
                                    <span className="sort-icon">
                                        {sortConfig.direction === 'asc' ? '↑' : '↓'}
                                    </span>
                                )}
                            </th>
                            <th>İşlemler</th>
                        </tr>
                        </thead>
                        <tbody>
                        {personnel.length > 0 ? (
                            personnel.map((person) => (
                                <tr key={person.id}>
                                    <td className="photo-cell">
                                        <PersonnelImage
                                            personId={person.id}
                                            photoFileName={person.photoFileName}
                                            name={person.name}
                                            surname={person.surname}
                                            isPreviewable={true}
                                            onPreviewClick={(id, filename) => showImagePreview(id, filename)}
                                        />
                                    </td>
                                    <td>{person.name || '-'}</td>
                                    <td>{person.surname || '-'}</td>
                                    <td>{person.tcNum || '-'}</td>
                                    <td>
                                        <span className={`status-badge ${person.active ? 'active' : 'inactive'}`}>
                                            {person.active ? 'Aktif' : 'Pasif'}
                                        </span>
                                    </td>
                                    <td>{formatDate(person.hireDate)}</td>
                                    <td>{person.personType?.name || '-'}</td>
                                    <td>{person.department?.name || '-'}</td>
                                    <td>{person.title?.name || '-'}</td>
                                    <td>
                                        {person.createdByAdmin?.username ? (
                                            <div className="user-info-cell">
                                                <span>{person.createdByAdmin?.username}</span>
                                                <small>{formatDate(person.createdAt)}</small>
                                            </div>
                                        ) : (
                                            '-'
                                        )}
                                    </td>
                                    <td>
                                        {person.lastModifiedByAdmin?.username ? (
                                            <div className="user-info-cell">
                                                <span>{person.lastModifiedByAdmin?.username}</span>
                                                <small>{formatDate(person.updatedAt)}</small>
                                            </div>
                                        ) : (
                                            '-'
                                        )}
                                    </td>
                                    <td>
                                        <div className="action-cell">
                                            <button
                                                className="action-button edit"
                                                onClick={() => handleEditClick(person)}
                                            >
                                                <Edit size={16}/>
                                            </button>
                                            <button className="action-button delete"
                                                    onClick={() => handleDeleteClick(person)}>
                                                <Trash2 size={16}/>
                                            </button>
                                            <button className="action-button deactivate"
                                                    onClick={() => handleDeactivateClick(person)}>
                                                <UserMinus size={16}/>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="12" className="no-data">
                                    {loading ? 'Veriler yükleniyor...' : 'Personel kaydı bulunamadı'}
                                </td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Sayfalama */}
            <div className="pagination-container">
                <div className="items-per-page">
                    <span>Sayfa başına:</span>
                    <select value={itemsPerPage} onChange={handleItemsPerPageChange}>
                        <option value="5">5</option>
                        <option value="10">10</option>
                        <option value="20">20</option>
                        <option value="50">50</option>
                    </select>
                </div>

                <div className="pagination-info">
                    <span>
                        {currentPage * itemsPerPage - itemsPerPage + 1}-
                        {Math.min(currentPage * itemsPerPage, totalItems)} / {totalItems}
                    </span>
                </div>

                <div className="pagination-controls">
                    <button
                        className="pagination-button"
                        onClick={prevPage}
                        disabled={currentPage === 1}
                    >
                        <ChevronLeft size={18} />
                    </button>
                    <span className="pagination-page">{currentPage}</span>
                    <button
                        className="pagination-button"
                        onClick={nextPage}
                        disabled={currentPage >= Math.ceil(totalItems / itemsPerPage)}
                    >
                        <ChevronRight size={18} />
                    </button>
                </div>
            </div>

            {/* Resim önizleme modalı */}
            {selectedImage && (
                <div 
                    className="image-preview-modal"
                    onMouseDown={(e) => {
                        // Sadece arka plana tıklandığında kapat (modal dışına)
                        if (e.target.className === "image-preview-modal") {
                            closeImagePreview();
                        }
                    }}
                >
                    <div className="image-preview-content" tabIndex={-1}>
                        <div className="image-preview-header">
                            <button 
                                className="close-button"
                                onClick={(e) => {
                                    e.preventDefault();
                                    closeImagePreview();
                                }}
                                aria-label="Kapat"
                            >
                                <X size={24} />
                            </button>
                        </div>
                        <div className="image-preview-body">
                            <img
                                src={selectedImage}
                                alt="Personel fotoğrafı"
                                className="preview-image"
                            />
                        </div>
                    </div>
                </div>
            )}
            {showDeleteConfirm && (
                <div className="confirm-modal-overlay">
                    <div className="confirm-modal">
                        <div className="confirm-modal-content">
                            <div className="confirm-modal-header">
                                <AlertTriangle size={24} color="#e74c3c" />
                                <h3>Personel Silme</h3>
                            </div>
                            <div className="confirm-modal-body">
                                <p>
                                    <strong>{personToAction ? `${personToAction.name} ${personToAction.surname}` : 'Bu personeli'}</strong> silmek istediğinizden emin misiniz?
                                </p>
                                <p className="warning-text">Bu işlem geri alınamaz.</p>
                            </div>
                            <div className="confirm-modal-footer">
                                <button
                                    className="cancel-button"
                                    onClick={() => {
                                        setShowDeleteConfirm(false);
                                        setPersonToAction(null);
                                    }}
                                >
                                    İptal
                                </button>
                                <button
                                    className="confirm-button delete"
                                    onClick={handleConfirmDelete}
                                >
                                    Sil
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Deaktif etme onay diyaloğu */}
            {showDeactivateConfirm && (
                <div className="confirm-modal-overlay">
                    <div className="confirm-modal">
                        <div className="confirm-modal-content">
                            <div className="confirm-modal-header">
                                <AlertTriangle size={24} color="#f39c12" />
                                <h3>Personel Devre Dışı Bırakma</h3>
                            </div>
                            <div className="confirm-modal-body">
                                <p>
                                    <strong>{personToAction ? `${personToAction.name} ${personToAction.surname}` : 'Bu personeli'}</strong> birlikten ayırmak istediğinize emin misiniz?
                                </p>
                            </div>
                            <div className="confirm-modal-footer">
                                <button
                                    className="cancel-button"
                                    onClick={() => {
                                        setShowDeactivateConfirm(false);
                                        setPersonToAction(null);
                                    }}
                                >
                                    İptal
                                </button>
                                <button
                                    className="confirm-button deactivate"
                                    onClick={handleConfirmDeactivate}
                                >
                                    Devre Dışı Bırak
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Personel düzenleme modalı */}
            <EditPersonnelModal
                isOpen={isEditModalOpen}
                onClose={handleCloseModal}
                personnel={selectedPersonnel}
                onSave={handlePersonnelUpdate}
            />
        </Layout>
    );
};

export default PersonnelManagement;