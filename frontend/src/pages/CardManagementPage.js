import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import '../styles/CardManagement.css'; // Aynı stilleri yeniden kullanıyoruz
import '../styles/FilterButtonsStandard.css'; // Standart filtreleme stilleri
import Layout from '../components/layout/Layout';
import {
    Search,
    CreditCard,
    Edit,
    Trash2,
    ChevronLeft,
    ChevronRight,
    AlertTriangle,
    Filter,
    X,
    Plus,
    ListFilter
} from 'lucide-react';
import ExportToExcel from '../components/ExportToExcel';

// CardStatusBadge bileşeni - Kart durumunu göstermek için
const CardStatusBadge = ({ active }) => {
    return (
        <span className={`status-badge ${active ? 'active' : 'inactive'}`}>
            {active ? 'Aktif' : 'Pasif'}
        </span>
    );
};

// Kart zaman bilgisini formatlama
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

// Ana CardManagementPage bileşeni
const CardManagementPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    // State tanımlamaları
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [cards, setCards] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [totalItems, setTotalItems] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'active', 'inactive'
    const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'asc' });
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDetailedFilterModal, setShowDetailedFilterModal] = useState(false);
    const [detailedFilters, setDetailedFilters] = useState({
        cardType: '',
        department: '',
        registeredDateStart: '',
        registeredDateEnd: '',
        personelName: ''
    });
    const [cardToAction, setCardToAction] = useState(null);
    const [filteredData, setFilteredData] = useState([]);
    const [editCardData, setEditCardData] = useState({
        cardNumber: '',
        cardType: { id: 1 }
    });
    const [blacklistedCards, setBlacklistedCards] = useState([]);
    const [cardTypes, setCardTypes] = useState([]);
    const [departments, setDepartments] = useState([]);

    // Excel dışa aktarma için sütun tanımları
    const [excelColumns, setExcelColumns] = useState([
        { key: 'cardNumber', header: 'Kart Numarası' },
        { key: 'active', header: 'Durum', accessor: (card) => card.active ? 'Aktif' : 'Pasif' },
        { key: 'cardType.name', header: 'Kart Tipi' },
        { key: 'registeredAt', header: 'Kayıt Tarihi', accessor: (card) => formatDate(card.registeredAt) },
        { key: 'deactivatedAt', header: 'Deaktif Edilme Tarihi', accessor: (card) => formatDate(card.deactivatedAt) },
        { key: 'personel.name', header: 'Personel Adı' },
        { key: 'personel.surname', header: 'Personel Soyadı' },
        { key: 'personel.department.name', header: 'Departman' }
    ]);

    // Kart verilerini ve kart tiplerini çek
    useEffect(() => {
        fetchCardTypes();
        fetchDepartments();
        fetchCards();
        fetchBlacklistedCards();
    }, [currentPage, itemsPerPage, filterStatus, sortConfig, searchTerm, detailedFilters]);

    // Kart tiplerini getir
    const fetchCardTypes = async () => {
        try {
            const response = await api.get('/api/card-types');
            setCardTypes(response.data);
        } catch (err) {
            console.error('Kart tipleri yüklenirken hata oluştu:', err);
        }
    };

    // Departmanları getir
    const fetchDepartments = async () => {
        try {
            const response = await api.get('/api/departments');
            setDepartments(response.data);
        } catch (err) {
            console.error('Departmanlar yüklenirken hata oluştu:', err);
        }
    };

    // Kartları getir
    const fetchCards = async () => {
        try {
            setLoading(true);
            setError(null);

            // API'den tüm kartları çek
            const response = await api.get('/api/cards');
            let cardsData = response.data;

            // Hata ayıklama için kart verilerini yazdır
            console.log("Kart Verileri:", cardsData);

            // Aktif/pasif filtresi uygula
            if (filterStatus === 'active') {
                cardsData = cardsData.filter(card => card.active === true);
            } else if (filterStatus === 'inactive') {
                cardsData = cardsData.filter(card => card.active === false);
            }

            // Arama filtresi (kart numarası, personel adı, soyadı ve TC no'ya göre)
            if (searchTerm.trim() !== '') {
                cardsData = cardsData.filter(card =>
                    (card.cardNumber && card.cardNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
                    (card.personel && card.personel.name && card.personel.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                    (card.personel && card.personel.surname && card.personel.surname.toLowerCase().includes(searchTerm.toLowerCase())) ||
                    (card.personel && card.personel.tcNum && card.personel.tcNum.includes(searchTerm))
                );
            }

            // Detaylı Filtreleri Uygula
            if (detailedFilters.cardType) {
                cardsData = cardsData.filter(card => 
                    card.cardType && Number(card.cardType.id) === Number(detailedFilters.cardType)
                );
            }
            
            if (detailedFilters.department) {
                cardsData = cardsData.filter(card => 
                    card.personel && 
                    card.personel.department && 
                    Number(card.personel.department.id) === Number(detailedFilters.department)
                );
            }
            
            if (detailedFilters.personelName) {
                const searchName = detailedFilters.personelName.toLowerCase();
                cardsData = cardsData.filter(card => 
                    card.personel && 
                    ((card.personel.name && card.personel.name.toLowerCase().includes(searchName)) ||
                    (card.personel.surname && card.personel.surname.toLowerCase().includes(searchName)))
                );
            }
            
            if (detailedFilters.registeredDateStart) {
                const startDate = new Date(detailedFilters.registeredDateStart);
                startDate.setHours(0, 0, 0, 0);
                cardsData = cardsData.filter(card => 
                    card.registeredAt && new Date(card.registeredAt) >= startDate
                );
            }
            
            if (detailedFilters.registeredDateEnd) {
                const endDate = new Date(detailedFilters.registeredDateEnd);
                endDate.setHours(23, 59, 59, 999);
                cardsData = cardsData.filter(card => 
                    card.registeredAt && new Date(card.registeredAt) <= endDate
                );
            }

            // Sıralama
            if (sortConfig.key) {
                cardsData.sort((a, b) => {
                    // null kontrolü
                    if (!a[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
                    if (!b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;

                    // Nested properties için
                    if (sortConfig.key.includes('.')) {
                        const keys = sortConfig.key.split('.');
                        let aValue = a;
                        let bValue = b;

                        for (const key of keys) {
                            aValue = aValue?.[key];
                            bValue = bValue?.[key];

                            if (!aValue) break;
                            if (!bValue) break;
                        }

                        if (typeof aValue === 'string') {
                            return sortConfig.direction === 'asc'
                                ? aValue.localeCompare(bValue)
                                : bValue.localeCompare(aValue);
                        } else {
                            return sortConfig.direction === 'asc'
                                ? aValue - bValue
                                : bValue - aValue;
                        }
                    } else {
                        if (typeof a[sortConfig.key] === 'string') {
                            return sortConfig.direction === 'asc'
                                ? a[sortConfig.key].localeCompare(b[sortConfig.key])
                                : b[sortConfig.key].localeCompare(a[sortConfig.key]);
                        } else {
                            return sortConfig.direction === 'asc'
                                ? a[sortConfig.key] - b[sortConfig.key]
                                : b[sortConfig.key] - a[sortConfig.key];
                        }
                    }
                });
            }

            setFilteredData(cardsData);
            setTotalItems(cardsData.length);

            // Sayfalama
            const startIndex = (currentPage - 1) * itemsPerPage;
            const paginatedData = cardsData.slice(startIndex, startIndex + itemsPerPage);

            setCards(paginatedData);
            setLoading(false);
        } catch (err) {
            console.error('Kart verileri yüklenirken hata oluştu:', err);
            setError('Kart verileri yüklenirken bir hata oluştu. Lütfen tekrar deneyin.');
            setLoading(false);
        }
    };

    // Kara listedeki kartları getir
    const fetchBlacklistedCards = async () => {
        try {
            const response = await api.get('/api/card-blacklists');
            setBlacklistedCards(response.data);
            console.log("Kara Listedeki Kartlar:", response.data);
        } catch (err) {
            console.error('Kara listedeki kartlar yüklenirken hata oluştu:', err);
        }
    };

    // Arama değişikliğinde
    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1); // Aramada ilk sayfaya dön
    };

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

    // Silme işlemi için onay modalını açan handler
    const handleDeleteClick = (card) => {
        setCardToAction(card);
        setShowDeleteConfirm(true);
    };

    // Kartın kara listede olup olmadığını kontrol et
    const isCardBlacklisted = (cardId) => {
        return blacklistedCards.some(blacklistedCard =>
            blacklistedCard.card && blacklistedCard.card.id === cardId
        );
    };

    // Onay sonrası kartı silen handler
    const handleConfirmDelete = async () => {
        try {
            // Önce kartın kara listede olup olmadığını kontrol et
            if (isCardBlacklisted(cardToAction.id)) {
                // Kartın kara liste kaydını bul
                const blacklistEntry = blacklistedCards.find(
                    entry => entry.card && entry.card.id === cardToAction.id
                );
                
                if (blacklistEntry && blacklistEntry.id) {
                    // Önce kara listeden kaldır
                    await api.delete(`/api/card-blacklists/${blacklistEntry.id}`);
                    console.log("Kart kara listeden kaldırıldı, şimdi silinecek:", cardToAction.id);
                }
            }
            
            // Sonra kartı sil
            await api.delete(`/api/cards/${cardToAction.id}`);
            
            // Kartı listeden kaldır
            setCards(prev => prev.filter(c => c.id !== cardToAction.id));
            setShowDeleteConfirm(false);
            setCardToAction(null);
            
            // Verileri yeniden yükle
            fetchBlacklistedCards();
            fetchCards();
        } catch (err) {
            console.error('Kart silinirken hata oluştu:', err);
            console.error('Hata detayı:', err.response?.data || err.message);
            alert('Kart silinirken bir hata oluştu: ' + (err.response?.data || err.message));
            // Hata durumunda da diyaloğu kapat
            setShowDeleteConfirm(false);
            setCardToAction(null);
        }
    };

    // Düzenleme modalını açan handler
    const handleEditClick = (card) => {
        setCardToAction(card);
        setEditCardData({
            id: card.id,
            cardNumber: card.cardNumber,
            cardType: card.cardType || { id: 1 },
            active: card.active
        });
        setShowEditModal(true);
    };

    // Form alanlarındaki değişiklikleri izleyen handler
    const handleEditCardChange = (e) => {
        const { name, value, type, checked } = e.target;
        
        if (name === 'cardType') {
            setEditCardData(prev => ({
                ...prev,
                cardType: { id: parseInt(value) }
            }));
        } else {
            setEditCardData(prev => ({
                ...prev,
                [name]: type === 'checkbox' ? checked : value
            }));
        }
    };

    // Kartı güncelleyen handler
    const handleUpdateCard = async () => {
        try {
            const response = await api.put(`/api/cards/${editCardData.id}`, editCardData);
            
            // Modalı kapat
            setShowEditModal(false);
            setCardToAction(null);
            
            // Verileri yeniden yükle
            fetchCards();
        } catch (err) {
            console.error('Kart güncellenirken hata oluştu:', err);
            alert('Kart güncellenirken bir hata oluştu: ' + (err.response?.data || err.message));
        }
    };

    // Yeni kart ekleme modalını açan handler
    const handleAddCardClick = () => {
        setEditCardData({
            cardNumber: '',
            cardType: { id: 1 },
            active: true
        });
        setShowEditModal(true);
    };

    // Yeni kart oluşturan handler
    const handleCreateCard = async () => {
        try {
            const response = await api.post('/api/cards', editCardData);
            
            // Modalı kapat
            setShowEditModal(false);
            
            // Verileri yeniden yükle
            fetchCards();
        } catch (err) {
            console.error('Kart oluşturulurken hata oluştu:', err);
            alert('Kart oluşturulurken bir hata oluştu: ' + (err.response?.data || err.message));
        }
    };

    // Modalı kapatma handler
    const handleCloseModal = () => {
        setShowEditModal(false);
        setCardToAction(null);
        setEditCardData({
            cardNumber: '',
            cardType: { id: 1 }
        });
    };

    // Detaylı filtreleme modalını açan handler
    const handleDetailedFilterClick = () => {
        setShowDetailedFilterModal(true);
    };

    // Detaylı filtreleme değişiklik handler'ı
    const handleDetailedFilterChange = (e) => {
        const { name, value } = e.target;
        setDetailedFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Detaylı filtreleme uygulama handler'ı
    const applyDetailedFilters = () => {
        // Filtrelemeleri uygula ve modalı kapat
        setCurrentPage(1); // İlk sayfaya dön
        setShowDetailedFilterModal(false);
    };

    // Detaylı filtreleri temizleme handler'ı
    const clearDetailedFilters = () => {
        setDetailedFilters({
            cardType: '',
            department: '',
            registeredDateStart: '',
            registeredDateEnd: '',
            personelName: ''
        });
        setShowDetailedFilterModal(false);
    };

    // Yükleme durumu
    if (loading && cards.length === 0) {
        return (
            <div className="card-loading">
                <div className="spinner"></div>
                <p>Kart verileri yükleniyor...</p>
            </div>
        );
    }

    // Hata durumu
    if (error && cards.length === 0) {
        return (
            <div className="card-error">
                <AlertTriangle size={48} />
                <h2>Hata Oluştu</h2>
                <p>{error}</p>
                <button className="retry-button" onClick={fetchCards}>
                    Yeniden Dene
                </button>
            </div>
        );
    }

    return (
        <Layout pageTitle="Kart Yönetimi">
            {/* Ana içerik */}
            <div className="card-tools">
                <div className="search-filter-wrapper">
                    <div className="search-filter">
                        <div className="search-tools">
                            <div className="search-box">
                                <Search size={18} />
                                <input
                                    type="text"
                                    placeholder="Kart veya personel ara..."
                                    value={searchTerm}
                                    onChange={handleSearch}
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
                                <button 
                                    className={`filter-button ${Object.values(detailedFilters).some(v => v !== '') ? 'active' : ''}`}
                                    onClick={handleDetailedFilterClick}
                                >
                                    <ListFilter size={16} />
                                    <span>Detaylı Filtrele</span>
                                </button>
                            </div>
                        </div>
                        
                        <div className="export-button">
                            <ExportToExcel
                                data={filteredData.length > 0 ? filteredData : []}
                                fileName="Kart_bilgileri"
                                columns={excelColumns}
                            />
                        </div>
                        
                        <div className="action-buttons">
                            <button className="add-button" onClick={handleAddCardClick}>
                                <Plus size={16} />
                                <span>Yeni Kart</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Kart tablosu */}
            <div className="card-table-container">
                <div className="table-wrapper">
                    <table className="card-table">
                        <thead>
                        <tr>
                            <th onClick={() => requestSort('cardNumber')}>
                                Kart Numarası
                                {sortConfig.key === 'cardNumber' && (
                                    <span className="sort-icon">
                                        {sortConfig.direction === 'asc' ? '↑' : '↓'}
                                    </span>
                                )}
                            </th>
                            <th onClick={() => requestSort('personel.name')}>
                                Personel Adı
                                {sortConfig.key === 'personel.name' && (
                                    <span className="sort-icon">
                                        {sortConfig.direction === 'asc' ? '↑' : '↓'}
                                    </span>
                                )}
                            </th>
                            <th onClick={() => requestSort('personel.surname')}>
                                Personel Soyadı
                                {sortConfig.key === 'personel.surname' && (
                                    <span className="sort-icon">
                                        {sortConfig.direction === 'asc' ? '↑' : '↓'}
                                    </span>
                                )}
                            </th>
                            <th onClick={() => requestSort('cardType.name')}>
                                Kart Tipi
                                {sortConfig.key === 'cardType.name' && (
                                    <span className="sort-icon">
                                        {sortConfig.direction === 'asc' ? '↑' : '↓'}
                                    </span>
                                )}
                            </th>
                            <th onClick={() => requestSort('active')}>
                                Durum
                                {sortConfig.key === 'active' && (
                                    <span className="sort-icon">
                                        {sortConfig.direction === 'asc' ? '↑' : '↓'}
                                    </span>
                                )}
                            </th>
                            <th onClick={() => requestSort('registeredAt')}>
                                Kayıt Tarihi
                                {sortConfig.key === 'registeredAt' && (
                                    <span className="sort-icon">
                                        {sortConfig.direction === 'asc' ? '↑' : '↓'}
                                    </span>
                                )}
                            </th>
                            <th onClick={() => requestSort('deactivatedAt')}>
                                Deaktif Edilme Tarihi
                                {sortConfig.key === 'deactivatedAt' && (
                                    <span className="sort-icon">
                                        {sortConfig.direction === 'asc' ? '↑' : '↓'}
                                    </span>
                                )}
                            </th>
                            <th onClick={() => requestSort('personel.department.name')}>
                                Departman
                                {sortConfig.key === 'personel.department.name' && (
                                    <span className="sort-icon">
                                        {sortConfig.direction === 'asc' ? '↑' : '↓'}
                                    </span>
                                )}
                            </th>
                            <th>İşlemler</th>
                        </tr>
                        </thead>
                        <tbody>
                        {cards.length > 0 ? (
                            cards.map((card) => (
                                <tr key={card.id}>
                                    <td>{card.cardNumber || '-'}</td>
                                    <td>{card.personel?.name || '-'}</td>
                                    <td>{card.personel?.surname || '-'}</td>
                                    <td>{card.cardType?.name || '-'}</td>
                                    <td>
                                        <CardStatusBadge active={card.active}/>
                                    </td>
                                    <td>{formatDate(card.registeredAt)}</td>
                                    <td>{formatDate(card.deactivatedAt)}</td>
                                    <td>{card.personel?.department?.name || '-'}</td>
                                    <td>
                                        <div className="action-cell">
                                            <button
                                                className="action-button edit"
                                                onClick={() => handleEditClick(card)}
                                            >
                                                <Edit size={16}/>
                                            </button>
                                            <button
                                                className="action-button delete"
                                                onClick={() => handleDeleteClick(card)}
                                            >
                                                <Trash2 size={16}/>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="9" className="no-data">
                                    {loading ? 'Veriler yükleniyor...' : 'Kart kaydı bulunamadı'}
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
                        {totalItems > 0 ?
                            `${currentPage * itemsPerPage - itemsPerPage + 1}-${Math.min(currentPage * itemsPerPage, totalItems)} / ${totalItems}` :
                            '0-0 / 0'
                        }
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

            {/* Silme onay diyaloğu */}
            {showDeleteConfirm && (
                <div className="confirm-modal-overlay">
                    <div className="confirm-modal">
                        <div className="confirm-modal-content">
                            <div className="confirm-modal-header">
                                <AlertTriangle size={24} color="#e74c3c" />
                                <h3>Kart Silme</h3>
                            </div>
                            <div className="confirm-modal-body">
                                <p>
                                    <strong>{cardToAction ? `${cardToAction.cardNumber}` : 'Bu kartı'}</strong> silmek istediğinizden emin misiniz?
                                </p>
                                <p className="warning-text">Bu işlem geri alınamaz.</p>
                            </div>
                            <div className="confirm-modal-footer">
                                <button
                                    className="cancel-button"
                                    onClick={() => {
                                        setShowDeleteConfirm(false);
                                        setCardToAction(null);
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

            {/* Kart Düzenleme/Ekleme Modalı */}
            {showEditModal && (
                <div className="confirm-modal-overlay">
                    <div className="confirm-modal card-edit-modal">
                        <div className="confirm-modal-content">
                            <div className="confirm-modal-header">
                                <CreditCard size={24} color="#3498db" />
                                <h3>{cardToAction ? 'Kart Düzenle' : 'Yeni Kart Ekle'}</h3>
                                <button className="close-button" onClick={handleCloseModal}>
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="confirm-modal-body">
                                <div className="form-group">
                                    <label htmlFor="cardNumber">Kart Numarası:</label>
                                    <input
                                        type="text"
                                        id="cardNumber"
                                        name="cardNumber"
                                        value={editCardData.cardNumber || ''}
                                        onChange={handleEditCardChange}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="cardType">Kart Tipi:</label>
                                    <select
                                        id="cardType"
                                        name="cardType"
                                        value={editCardData.cardType?.id || 1}
                                        onChange={handleEditCardChange}
                                        required
                                    >
                                        {cardTypes.map(type => (
                                            <option key={type.id} value={type.id}>
                                                {type.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group checkbox-group">
                                    <input
                                        type="checkbox"
                                        id="active"
                                        name="active"
                                        checked={editCardData.active}
                                        onChange={handleEditCardChange}
                                    />
                                    <label htmlFor="active">Aktif</label>
                                </div>
                            </div>
                            <div className="confirm-modal-footer">
                                <button
                                    className="cancel-button"
                                    onClick={handleCloseModal}
                                >
                                    İptal
                                </button>
                                <button
                                    className="confirm-button save"
                                    onClick={cardToAction ? handleUpdateCard : handleCreateCard}
                                >
                                    {cardToAction ? 'Güncelle' : 'Kaydet'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Detaylı Filtreleme Modalı */}
            {showDetailedFilterModal && (
                <div className="confirm-modal-overlay">
                    <div className="confirm-modal card-edit-modal">
                        <div className="confirm-modal-content">
                            <div className="confirm-modal-header">
                                <Filter size={24} color="#3498db" />
                                <h3>Detaylı Filtreleme</h3>
                                <button className="close-button" onClick={() => setShowDetailedFilterModal(false)}>
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="confirm-modal-body">
                                <div className="form-group">
                                    <label htmlFor="personelName">Personel Adı/Soyadı:</label>
                                    <input
                                        type="text"
                                        id="personelName"
                                        name="personelName"
                                        value={detailedFilters.personelName}
                                        onChange={handleDetailedFilterChange}
                                        placeholder="Personel adı veya soyadı ara..."
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="cardType">Kart Tipi:</label>
                                    <select
                                        id="cardType"
                                        name="cardType"
                                        value={detailedFilters.cardType}
                                        onChange={handleDetailedFilterChange}
                                    >
                                        <option value="">Tüm Kart Tipleri</option>
                                        {cardTypes.map(type => (
                                            <option key={type.id} value={type.id}>
                                                {type.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="department">Departman:</label>
                                    <select
                                        id="department"
                                        name="department"
                                        value={detailedFilters.department}
                                        onChange={handleDetailedFilterChange}
                                    >
                                        <option value="">Tüm Departmanlar</option>
                                        {departments.map(dept => (
                                            <option key={dept.id} value={dept.id}>
                                                {dept.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="registeredDateStart">Kayıt Tarihi (Başlangıç):</label>
                                    <input
                                        type="date"
                                        id="registeredDateStart"
                                        name="registeredDateStart"
                                        value={detailedFilters.registeredDateStart}
                                        onChange={handleDetailedFilterChange}
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="registeredDateEnd">Kayıt Tarihi (Bitiş):</label>
                                    <input
                                        type="date"
                                        id="registeredDateEnd"
                                        name="registeredDateEnd"
                                        value={detailedFilters.registeredDateEnd}
                                        onChange={handleDetailedFilterChange}
                                    />
                                </div>
                            </div>
                            <div className="confirm-modal-footer">
                                <button
                                    className="cancel-button"
                                    onClick={clearDetailedFilters}
                                >
                                    Temizle
                                </button>
                                <button
                                    className="confirm-button"
                                    onClick={applyDetailedFilters}
                                >
                                    Uygula
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default CardManagementPage; 