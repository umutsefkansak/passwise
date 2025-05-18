import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import '../styles/PersonnelBlacklistManagement.css'; // CSS dosyasını oluşturmanız gerekecek
import '../styles/FilterButtonsStandard.css'; // Standart filtreleme stilleri
import Layout from '../components/layout/Layout';
import {
    Search,
    Edit,
    Trash2,
    Ban,
    ChevronLeft,
    ChevronRight,
    AlertTriangle,
    Filter,
    Plus,
    ListFilter,
    X,
    CheckCircle,
    User
} from 'lucide-react';
import ExportToExcel from '../components/ExportToExcel';

// Personel durumu için badge bileşeni
const PersonnelStatusBadge = ({ active }) => {
    return (
        <span className={`status-badge ${active ? 'active' : 'inactive'}`}>
            {active ? 'Aktif' : 'Pasif'}
        </span>
    );
};

// Tarih formatını düzenleme
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

// Ana PersonnelBlacklistManagement bileşeni
const PersonnelBlacklistManagement = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    // State tanımlamaları
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [personnel, setPersonnel] = useState([]);
    const [blacklistedPersonnel, setBlacklistedPersonnel] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [totalItems, setTotalItems] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'blacklisted'
    const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'asc' });
    const [showAddToBlacklistConfirm, setShowAddToBlacklistConfirm] = useState(false);
    const [showRemoveFromBlacklistConfirm, setShowRemoveFromBlacklistConfirm] = useState(false);
    const [personnelToAction, setPersonnelToAction] = useState(null);
    const [filteredData, setFilteredData] = useState([]);

    const [blacklistReasons, setBlacklistReasons] = useState([]);
    const [selectedReasonId, setSelectedReasonId] = useState(null);

    // Excel dışa aktarma için sütun tanımları
    const [excelColumns, setExcelColumns] = useState([
        { key: 'name', header: 'Adı' },
        { key: 'surname', header: 'Soyadı' },
        { key: 'tcNum', header: 'TC Kimlik No' },
        { key: 'active', header: 'Durum', accessor: (personnel) => personnel.active ? 'Aktif' : 'Pasif' },
        { key: 'department.name', header: 'Departman' },
        { key: 'personType.name', header: 'Personel Tipi' },
        { key: 'photoFileName', header: 'Fotoğraf', accessor: (personnel) => personnel.photoFileName ? 'Var' : 'Yok' },
        {
            key: 'blacklistStatus',
            header: 'Kara Liste Durumu',
            accessor: (personnel) => isPersonnelBlacklisted(personnel.id) ? 'Kara Listede' : '-'
        },
        {
            key: 'blacklistReason',
            header: 'Kara Liste Sebebi',
            accessor: (personnel) => {
                const blacklistInfo = getPersonnelBlacklistInfo(personnel.id);
                return blacklistInfo.isBlacklisted ? blacklistInfo.reason : '-';
            }
        },
        {
            key: 'blacklistDate',
            header: 'Kara Liste Tarihi',
            accessor: (personnel) => {
                const blacklistInfo = getPersonnelBlacklistInfo(personnel.id);
                return blacklistInfo.isBlacklisted ? formatDate(blacklistInfo.dateAdded) : '-';
            }
        }
    ]);

    // Personel verilerini ve kara listedeki personelleri çek
    // useEffect hook'unu güncelleyin
    useEffect(() => {
        const fetchBlacklistReasons = async () => {
            try {
                const response = await api.get('/api/personnel-blacklist-reasons');
                setBlacklistReasons(response.data);
                // Varsayılan olarak ilk sebebi seç
                if (response.data.length > 0) {
                    setSelectedReasonId(response.data[0].id);
                }
            } catch (err) {
                console.error('Kara liste sebepleri yüklenirken hata oluştu:', err);
            }
        };

        fetchBlacklistReasons();
        fetchPersonnel();
        fetchBlacklistedPersonnel();
    }, [currentPage, itemsPerPage, filterStatus, sortConfig]);

    // Personel verilerini getir
    const fetchPersonnel = async () => {
        try {
            setLoading(true);
            setError(null);

            // API endpoint'i belirleme
            let endpoint = '/api/personnels';

            const response = await api.get(endpoint);
            let personnelData = response.data;

            // Hata ayıklama için personel verilerini yazdır
            console.log("Personel Verileri:", personnelData);

            // Arama filtresi (personel adı, soyadı ve TC no'ya göre)
            if (searchTerm.trim() !== '') {
                personnelData = personnelData.filter(person =>
                    (person.name && person.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                    (person.surname && person.surname.toLowerCase().includes(searchTerm.toLowerCase())) ||
                    (person.tcNum && person.tcNum.includes(searchTerm))
                );
            }

            // Kara liste filtresi
            if (filterStatus === 'blacklisted') {
                personnelData = personnelData.filter(person =>
                    blacklistedPersonnel.some(blacklisted =>
                        blacklisted.personnel && blacklisted.personnel.id === person.id)
                );
            }

            // Sıralama
            if (sortConfig.key) {
                personnelData.sort((a, b) => {
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

    // Kara listedeki personelleri getir
    const fetchBlacklistedPersonnel = async () => {
        try {
            const response = await api.get('/api/personnel-blacklists');
            setBlacklistedPersonnel(response.data);
            console.log("Kara Listedeki Personeller:", response.data);
        } catch (err) {
            console.error('Kara listedeki personeller yüklenirken hata oluştu:', err);
        }
    };

    // Arama değişikliğinde
    // Arama değişikliğinde
    // Arama değişikliğinde
    // Mevcut handleSearch fonksiyonu
    const handleSearch = (e) => {
        const searchValue = e.target.value;
        setSearchTerm(searchValue);
        setCurrentPage(1); // Aramada ilk sayfaya dön
        // Direkt fetchPersonnel çağrısını kaldırdık
    }

// Yeni bir fonksiyon ekleyin
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

    // Kara listeye eklfeme onay modalını açan handler
    const handleAddToBlacklistClick = (person) => {
        setPersonnelToAction(person);
        setShowAddToBlacklistConfirm(true);
    };

    // Kara listeden çıkarma onay modalını açan handler
    const handleRemoveFromBlacklistClick = (person) => {
        setPersonnelToAction(person);
        setShowRemoveFromBlacklistConfirm(true);
    };

    // Onay sonrası personeli kara listeye ekleyen handler
    const handleConfirmAddToBlacklist = async () => {
        try {
            // Backend'in beklediği formatta veri hazırla
            const blacklistRequest = {
                personnel: { id: personnelToAction.id }, // Personnel nesnesi olarak id ile gönder
                reason: { id: selectedReasonId }, // PersonnelBlacklistReason nesnesi olarak id ile gönder
                dateAdded: new Date().toISOString() // Şimdiki zamanı ISO formatında gönder
            };

            console.log('Kara listeye ekleme isteği:', blacklistRequest);

            // API'ye POST isteği gönder - bu işlem backend tarafında personeli de pasif yapacak
            await api.post('/api/personnel-blacklists', blacklistRequest);

            // Modalı kapat
            setShowAddToBlacklistConfirm(false);
            setPersonnelToAction(null);
            setSelectedReasonId(null);

            // Verileri yeniden yükle
            fetchPersonnel();
            fetchBlacklistedPersonnel();
        } catch (err) {
            console.error('Personel kara listeye eklenirken hata oluştu:', err);
            console.error('Hata detayı:', err.response?.data || err.message);
            setShowAddToBlacklistConfirm(false);
            setPersonnelToAction(null);
            setSelectedReasonId(null);
        }
    };

    // Onay sonrası personeli kara listeden çıkaran handler
    // Onay sonrası personeli kara listeden çıkaran handler
    const handleConfirmRemoveFromBlacklist = async () => {
        try {
            // Personelin kara liste kaydını bul
            const blacklistEntry = blacklistedPersonnel.find(
                entry => entry.personnel && entry.personnel.id === personnelToAction.id
            );

            console.log("Personel ID:", personnelToAction.id);
            console.log("Bulunan kara liste kaydı:", blacklistEntry);

            if (blacklistEntry && blacklistEntry.id) {
                // API'ye DELETE isteği gönder
                console.log("Kara listeden çıkarılacak kayıt ID:", blacklistEntry.id);
                await api.delete(`/api/personnel-blacklists/${blacklistEntry.id}`);

                // Modalı kapat
                setShowRemoveFromBlacklistConfirm(false);
                setPersonnelToAction(null);

                // Verileri yeniden yükle
                await fetchBlacklistedPersonnel(); // Önce kara liste verilerini güncelle
                await fetchPersonnel(); // Sonra personel verilerini güncelle

                // Başarılı mesajı (isteğe bağlı)
                // alert("Personel kara listeden başarıyla çıkarıldı!");
            } else {
                console.error('Kara liste kaydı bulunamadı veya ID eksik:',
                    blacklistEntry ? `Kayıt bulundu ama ID yok: ${JSON.stringify(blacklistEntry)}` : 'Kayıt bulunamadı');
                alert("Kara liste kaydı bulunamadı. Lütfen sayfayı yenileyip tekrar deneyin.");
                setShowRemoveFromBlacklistConfirm(false);
                setPersonnelToAction(null);
            }
        } catch (err) {
            console.error('Personel kara listeden çıkarılırken hata oluştu:', err);
            console.error('Hata detayı:', err.response?.data || err.message);

            // Hata mesajı (isteğe bağlı)
            alert(`Hata: ${err.response?.data?.message || err.message || 'Bilinmeyen hata'}`);

            setShowRemoveFromBlacklistConfirm(false);
            setPersonnelToAction(null);
        }
    };

    // Personelin kara listede olup olmadığını kontrol et
    const isPersonnelBlacklisted = (personnelId) => {
        return blacklistedPersonnel.some(blacklisted =>
            blacklisted.personnel && blacklisted.personnel.id === personnelId
        );
    };

    // Personelin kara liste bilgilerini getir
    const getPersonnelBlacklistInfo = (personnelId) => {
        const blacklisted = blacklistedPersonnel.find(item =>
            item.personnel && item.personnel.id === personnelId
        );

        if (blacklisted) {
            return {
                isBlacklisted: true,
                reason: blacklisted.reason?.reason || 'Sebep belirtilmemiş',
                dateAdded: blacklisted.dateAdded
            };
        }

        return { isBlacklisted: false, reason: null, dateAdded: null };
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
        <Layout pageTitle="Personel Kara Liste Yönetimi">
            {/* Ana içerik */}
            <div className="personnel-tools">
                <div className="search-filter-wrapper">
                    <div className="search-filter">
                        <div className="search-tools">
                            <div className="search-box">
                                <Search size={18} />
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
                                    className={`filter-button ${filterStatus === 'blacklisted' ? 'active' : ''}`}
                                    onClick={() => handleStatusFilterChange('blacklisted')}
                                >
                                    Kara Liste
                                </button>
                                <button className="filter-button">
                                    <ListFilter size={16} />
                                    <span>Detaylı Filtrele</span>
                                </button>
                            </div>
                        </div>
                        
                        <div className="export-button">
                            <ExportToExcel
                                data={filteredData.length > 0 ? filteredData : []}
                                fileName="Personel_Kara_Liste"
                                columns={excelColumns}
                            />
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
                            <th onClick={() => requestSort('name')}>
                                Adı
                                {sortConfig.key === 'name' && (
                                    <span className="sort-icon">
                                        {sortConfig.direction === 'asc' ? '↑' : '↓'}
                                    </span>
                                )}
                            </th>
                            <th onClick={() => requestSort('surname')}>
                                Soyadı
                                {sortConfig.key === 'surname' && (
                                    <span className="sort-icon">
                                        {sortConfig.direction === 'asc' ? '↑' : '↓'}
                                    </span>
                                )}
                            </th>
                            <th onClick={() => requestSort('tcNum')}>
                                TC Kimlik No
                                {sortConfig.key === 'tcNum' && (
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
                            <th onClick={() => requestSort('department.name')}>
                                Departman
                                {sortConfig.key === 'department.name' && (
                                    <span className="sort-icon">
                                        {sortConfig.direction === 'asc' ? '↑' : '↓'}
                                    </span>
                                )}
                            </th>
                            <th onClick={() => requestSort('personType.name')}>
                                Personel Tipi
                                {sortConfig.key === 'personType.name' && (
                                    <span className="sort-icon">
                                        {sortConfig.direction === 'asc' ? '↑' : '↓'}
                                    </span>
                                )}
                            </th>
                            <th>Kara Liste Durumu</th>
                            <th>Kara Liste Sebebi</th>
                            <th>Kara Liste Tarihi</th>
                            <th>İşlemler</th>
                        </tr>
                        </thead>
                        <tbody>
                        {personnel.length > 0 ? (
                            personnel.map((person) => (
                                <tr key={person.id}>
                                    <td>{person.name || '-'}</td>
                                    <td>{person.surname || '-'}</td>
                                    <td>{person.tcNum || '-'}</td>
                                    <td>
                                        <PersonnelStatusBadge active={person.active}/>
                                    </td>
                                    <td>{person.department?.name || '-'}</td>
                                    <td>{person.personType?.name || '-'}</td>
                                    <td>
                                        <span
                                            className={`blacklist-status ${isPersonnelBlacklisted(person.id) ? 'blacklisted' : ''}`}>
                                            {isPersonnelBlacklisted(person.id) ? 'Kara Listede' : '-'}
                                        </span>
                                    </td>
                                    <td>
                                        {(() => {
                                            const blacklistInfo = getPersonnelBlacklistInfo(person.id);
                                            return blacklistInfo.isBlacklisted ? (
                                                <div className="blacklist-info">
                                                    <span className="blacklist-reason">{blacklistInfo.reason}</span>
                                                </div>
                                            ) : (
                                                <span className="blacklist-status">-</span>
                                            )
                                        })()}
                                    </td>
                                    <td>
                                        {(() => {
                                            const blacklistInfo = getPersonnelBlacklistInfo(person.id);
                                            return blacklistInfo.isBlacklisted ? formatDate(blacklistInfo.dateAdded) : '-';
                                        })()}
                                    </td>
                                    <td>
                                        <div className="action-cell">
                                            {isPersonnelBlacklisted(person.id) ? (
                                                <button
                                                    className="action-button remove-blacklist"
                                                    onClick={() => handleRemoveFromBlacklistClick(person)}
                                                    title="Kara Listeden Çıkar"
                                                >
                                                    <CheckCircle size={16}/>
                                                </button>
                                            ) : (
                                                <button
                                                    className="action-button add-blacklist"
                                                    onClick={() => handleAddToBlacklistClick(person)}
                                                    title="Kara Listeye Ekle"
                                                >
                                                    <Ban size={16}/>
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="10" className="no-data">
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

            {/* Kara listeye ekleme onay diyaloğu */}
            {showAddToBlacklistConfirm && (
                <div className="confirm-modal-overlay">
                    <div className="confirm-modal">
                        <div className="confirm-modal-content">
                            <div className="confirm-modal-header">
                                <AlertTriangle size={24} color="#f39c12" />
                                <h3>Kara Listeye Ekle</h3>
                            </div>
                            <div className="confirm-modal-body">
                                <p>
                                    <strong>{personnelToAction ? `${personnelToAction.name} ${personnelToAction.surname}` : 'Bu personeli'}</strong> kara listeye eklemek istediğinize emin misiniz?
                                </p>
                                <p>Bu işlem personeli otomatik olarak pasif duruma getirecektir.</p>

                                {/* Kara liste sebebi seçimi */}
                                <div className="form-group">
                                    <label htmlFor="blacklistReason">Kara Liste Sebebi:</label>
                                    <select
                                        id="blacklistReason"
                                        className="form-select"
                                        value={selectedReasonId || ''}
                                        onChange={(e) => setSelectedReasonId(Number(e.target.value))}
                                    >
                                        {blacklistReasons.map(reason => (
                                            <option key={reason.id} value={reason.id}>
                                                {reason.reason}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="confirm-modal-footer">
                                <button
                                    className="cancel-button"
                                    onClick={() => {
                                        setShowAddToBlacklistConfirm(false);
                                        setPersonnelToAction(null);
                                        setSelectedReasonId(null);
                                    }}
                                >
                                    İptal
                                </button>
                                <button
                                    className="confirm-button blacklist"
                                    onClick={handleConfirmAddToBlacklist}
                                >
                                    Kara Listeye Ekle
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Kara listeden çıkarma onay diyaloğu */}
            {showRemoveFromBlacklistConfirm && (
                <div className="confirm-modal-overlay">
                    <div className="confirm-modal">
                        <div className="confirm-modal-content">
                            <div className="confirm-modal-header">
                                <CheckCircle size={24} color="#27ae60" />
                                <h3>Kara Listeden Çıkar</h3>
                            </div>
                            <div className="confirm-modal-body">
                                <p>
                                    <strong>{personnelToAction ? `${personnelToAction.name} ${personnelToAction.surname}` : 'Bu personeli'}</strong> kara listeden çıkarmak istediğinize emin misiniz?
                                </p>
                                <p>Bu işlem personeli otomatik olarak aktif duruma getirecektir.</p>
                            </div>
                            <div className="confirm-modal-footer">
                                <button
                                    className="cancel-button"
                                    onClick={() => {
                                        setShowRemoveFromBlacklistConfirm(false);
                                        setPersonnelToAction(null);
                                    }}
                                >
                                    İptal
                                </button>
                                <button
                                    className="confirm-button approve"
                                    onClick={handleConfirmRemoveFromBlacklist}
                                >
                                    Kara Listeden Çıkar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default PersonnelBlacklistManagement;