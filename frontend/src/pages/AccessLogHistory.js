import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import '../styles/AccessLogHistory.css';
import Layout from '../components/layout/Layout';
import PersonnelImage from '../components/PersonnelImage';
import AccessLogFilters from '../components/AccessLogFilters';
import DoorService from '../services/DoorService';

import {
    Search, Filter, ChevronLeft, ChevronRight,
    AlertTriangle, Calendar, Clock, DoorOpen, UserCheck,
    CheckCircle, XCircle, Info, ArrowUpRight, ArrowDownLeft
} from 'lucide-react';

import ExportToExcel from '../components/ExportToExcel';
import * as XLSX from 'xlsx';
const AccessLogHistory = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [accessLogs, setAccessLogs] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [totalItems, setTotalItems] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'approved', 'rejected'
    const [sortConfig, setSortConfig] = useState({ key: 'accessTimestamp', direction: 'desc' });
    const [selectedImage, setSelectedImage] = useState(null);
    const [imageLoadErrors, setImageLoadErrors] = useState({});
    const [selectedLog, setSelectedLog] = useState(null);
    const [showLogDetails, setShowLogDetails] = useState(false);
    const [filteredData, setFilteredData] = useState([]);

    // Detaylı filtreler state'i
    const [detailedFilters, setDetailedFilters] = useState({
        personnelName: '',
        personnelSurname: '',
        tcNum: '',
        cardNumber: '',
        doorName: '',
        doorLocation: '',
        accessDirection: '',
        doorType: '',
        accessMethod: '',
        accessResult: '',
        startDate: '',
        endDate: ''
    });

    // Excel sütunları yapılandırması
    const excelColumns = [
        { key: 'personnel.name', header: 'Ad' },
        { key: 'personnel.surname', header: 'Soyad' },
        { key: 'personnel.tcNum', header: 'TC Kimlik No' },
        { key: 'personnel.department.name', header: 'Departman' },
        { key: 'card.cardNumber', header: 'Kart No' },
        { key: 'door.name', header: 'Kapı' },
        { key: 'door.location', header: 'Konum' },
        { key: 'door.accessDirection.name', header: 'Erişim Yönü' },
        { key: 'accessTimestamp', header: 'Erişim Zamanı',
            accessor: (item) => formatDate(item.accessTimestamp) },
        { key: 'accessMethod.name', header: 'Erişim Yöntemi' },
        { key: 'accessResult.name', header: 'Sonuç' },
        { key: 'details', header: 'Detaylar' },
    ];

    // Erişim kayıtlarını çek
    useEffect(() => {
        fetchAccessLogs();
    }, [currentPage, itemsPerPage, filterStatus, sortConfig,searchTerm, detailedFilters]);

    // Detaylı filtreleri uygula
    const handleDetailedFilterChange = (filters) => {
        setDetailedFilters(filters);
        setCurrentPage(1); // Filtreleme yapıldığında ilk sayfaya dön
    };

    const fetchAccessLogs = async () => {
        try {
            setLoading(true);
            setError(null);

            // API endpoint'i belirleme
            let endpoint = '/api/access-logs';

            const response = await api.get(endpoint);
            let logsData = response.data;

            // Hata ayıklama için log verilerini yazdır
            console.log("Erişim Kayıtları:", logsData);

            // Arama filtresi (Personel ismi, kapı adı, kart no'ya göre)
            if (searchTerm.trim() !== '') {
                logsData = logsData.filter(log =>
                    (log.personnel?.name && log.personnel.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                    (log.personnel?.surname && log.personnel.surname.toLowerCase().includes(searchTerm.toLowerCase())) ||
                    (log.door?.name && log.door.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                    (log.card?.cardNumber && log.card.cardNumber.includes(searchTerm))
                );
            }

            // Erişim sonucu filtresi
            if (filterStatus === 'approved') {
                logsData = logsData.filter(log =>
                    log.accessResult && log.accessResult.name === 'ONAYLANDI'
                );
            } else if (filterStatus === 'rejected') {
                logsData = logsData.filter(log =>
                    log.accessResult && log.accessResult.name === 'REDDEDILDI'
                );
            }
            // Detaylı filtreler uygulanması
            if (detailedFilters) {
                // Personel adı filtresi
                if (detailedFilters.personnelName) {
                    logsData = logsData.filter(log =>
                        log.personnel?.name && log.personnel.name.toLowerCase().includes(detailedFilters.personnelName.toLowerCase())
                    );
                }

                // Personel soyadı filtresi
                if (detailedFilters.personnelSurname) {
                    logsData = logsData.filter(log =>
                        log.personnel?.surname && log.personnel.surname.toLowerCase().includes(detailedFilters.personnelSurname.toLowerCase())
                    );
                }

                // TC No filtresi
                if (detailedFilters.tcNum) {
                    logsData = logsData.filter(log =>
                        log.personnel?.tcNum && log.personnel.tcNum.includes(detailedFilters.tcNum)
                    );
                }

                // Kart numarası filtresi
                if (detailedFilters.cardNumber) {
                    logsData = logsData.filter(log =>
                        log.card?.cardNumber && log.card.cardNumber.includes(detailedFilters.cardNumber)
                    );
                }

                // Kapı adı filtresi
                if (detailedFilters.doorName) {
                    logsData = logsData.filter(log =>
                        log.door?.name && log.door.name.toLowerCase().includes(detailedFilters.doorName.toLowerCase())
                    );
                }

                // Kapı konumu filtresi
                if (detailedFilters.doorLocation) {
                    logsData = logsData.filter(log =>
                        log.door?.location && log.door.location.toLowerCase().includes(detailedFilters.doorLocation.toLowerCase())
                    );
                }

                // Kapı türü filtresi
                if (detailedFilters.doorType) {
                    logsData = logsData.filter(log =>
                        log.door?.doorType?.name && log.door.doorType.name.toLowerCase().includes(detailedFilters.doorType.toLowerCase())
                    );
                }

                // Erişim yönü filtresi
                if (detailedFilters.accessDirection) {
                    logsData = logsData.filter(log =>
                        log.door?.accessDirection?.name === detailedFilters.accessDirection
                    );
                }

                // Erişim yöntemi filtresi
                if (detailedFilters.accessMethod) {
                    logsData = logsData.filter(log =>
                        log.accessMethod?.name && log.accessMethod.name.toLowerCase().includes(detailedFilters.accessMethod.toLowerCase())
                    );
                }

                // Erişim sonucu filtresi (eğer zaten filterStatus ile filtrelenmiyorsa)
                if (detailedFilters.accessResult && filterStatus === 'all') {
                    logsData = logsData.filter(log =>
                        log.accessResult?.name === detailedFilters.accessResult
                    );
                }

                // Tarih aralığı - başlangıç tarihi
                if (detailedFilters.startDate) {
                    const startDate = new Date(detailedFilters.startDate);
                    logsData = logsData.filter(log =>
                        log.accessTimestamp && new Date(log.accessTimestamp) >= startDate
                    );
                }

                // Tarih aralığı - bitiş tarihi
                if (detailedFilters.endDate) {
                    const endDate = new Date(detailedFilters.endDate);
                    logsData = logsData.filter(log =>
                        log.accessTimestamp && new Date(log.accessTimestamp) <= endDate
                    );
                }
            }

            // Sıralama
            if (sortConfig.key) {
                logsData.sort((a, b) => {
                    // null kontrolü
                    if (!a[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
                    if (!b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;

                    // Eğer sıralama timestamp'e göre ise
                    if (sortConfig.key === 'accessTimestamp') {
                        return sortConfig.direction === 'asc'
                            ? new Date(a[sortConfig.key]) - new Date(b[sortConfig.key])
                            : new Date(b[sortConfig.key]) - new Date(a[sortConfig.key]);
                    }

                    // Daha karmaşık objeleri kontrol et (personnel.name, door.name gibi)
                    if (sortConfig.key.includes('.')) {
                        const keys = sortConfig.key.split('.');
                        let valueA = a;
                        let valueB = b;

                        for (const key of keys) {
                            valueA = valueA?.[key];
                            valueB = valueB?.[key];
                        }

                        // Null kontrolü
                        if (!valueA) return sortConfig.direction === 'asc' ? 1 : -1;
                        if (!valueB) return sortConfig.direction === 'asc' ? -1 : 1;

                        if (typeof valueA === 'string') {
                            return sortConfig.direction === 'asc'
                                ? valueA.localeCompare(valueB)
                                : valueB.localeCompare(valueA);
                        } else {
                            return sortConfig.direction === 'asc'
                                ? valueA - valueB
                                : valueB - valueA;
                        }
                    }

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

            setFilteredData(logsData); // Tüm filtrelenmiş verileri sakla
            setTotalItems(logsData.length);

            // Sayfalama
            const startIndex = (currentPage - 1) * itemsPerPage;
            const paginatedData = logsData.slice(startIndex, startIndex + itemsPerPage);

            setAccessLogs(paginatedData);
            setLoading(false);
        } catch (err) {
            console.error('Erişim kayıtları yüklenirken hata oluştu:', err);
            setError('Erişim kayıtları yüklenirken bir hata oluştu. Lütfen tekrar deneyin.');
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

    // Filtre değiştiğinde
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

    // Detay modalını göster
    const showDetails = (log) => {
        setSelectedLog(log);
        setShowLogDetails(true);
    };

    // Detay modalını kapat
    const closeDetails = () => {
        setShowLogDetails(false);
        setSelectedLog(null);
    };

    // Erişim sonucuna göre ikon ve renk belirle
    const getAccessResultIcon = (result) => {
        if (!result) return <AlertTriangle size={20} color="#f39c12" />;

        switch (result.name) {
            case 'ONAYLANDI':
                return <CheckCircle size={20} color="#2ecc71" />;
            case 'REDDEDILDI':
                return <XCircle size={20} color="#e74c3c" />;
            default:
                return <AlertTriangle size={20} color="#f39c12" />;
        }
    };

    // Erişim yönüne göre ikon ve stil belirleme
    const getAccessDirectionIcon = (direction) => {
        if (!direction) return null;

        switch (direction.name) {
            case 'Giris':
                return (
                    <div className="direction-badge entry">
                        <ArrowUpRight size={14} />
                        <span>Giriş</span>
                    </div>
                );
            case 'Cikis':
                return (
                    <div className="direction-badge exit">
                        <ArrowDownLeft size={14} />
                        <span>Çıkış</span>
                    </div>
                );
            default:
                return <span>{direction.name}</span>;
        }
    };

    // Yükleme durumu
    if (loading && accessLogs.length === 0) {
        return (
            <div className="access-log-loading">
                <div className="spinner"></div>
                <p>Erişim kayıtları yükleniyor...</p>
            </div>
        );
    }

    // Hata durumu
    if (error && accessLogs.length === 0) {
        return (
            <div className="access-log-error">
                <AlertTriangle size={48} />
                <h2>Hata Oluştu</h2>
                <p>{error}</p>
                <button className="retry-button" onClick={fetchAccessLogs}>
                    Yeniden Dene
                </button>
            </div>
        );
    }

    return (
        <Layout pageTitle="Geçmiş Kart Okutmaları">
            {/* Ana içerik */}
            <div className="access-log-tools">
                <div className="search-filter-wrapper">
                    <div className="search-filter">
                        <div className="search-box">
                            <Search size={18} />
                            <input
                                type="text"
                                placeholder="Personel, kapı veya kart ara..."
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
                                className={`filter-button ${filterStatus === 'approved' ? 'active' : ''}`}
                                onClick={() => handleStatusFilterChange('approved')}
                            >
                                Onaylı
                            </button>
                            <button
                                className={`filter-button ${filterStatus === 'rejected' ? 'active' : ''}`}
                                onClick={() => handleStatusFilterChange('rejected')}
                            >
                                Reddedilmiş
                            </button>
                            <AccessLogFilters onFilterChange={handleDetailedFilterChange} />
                        </div>
                        <ExportToExcel
                            data={filteredData.length > 0 ? filteredData : []}
                            fileName="Erişim_Kayıtları"
                            columns={excelColumns}
                        />
                    </div>
                </div>
            </div>

            {/* Erişim kayıtları tablosu */}
            <div className="access-log-table-container">
                <div className="table-wrapper">
                    <table className="access-log-table">
                        <thead>
                        <tr>
                            <th>Personel</th>
                            <th onClick={() => requestSort('card.cardNumber')}>
                                Kart No
                                {sortConfig.key === 'card.cardNumber' && (
                                    <span className="sort-icon">
                                        {sortConfig.direction === 'asc' ? '↑' : '↓'}
                                    </span>
                                )}
                            </th>
                            <th onClick={() => requestSort('door.name')}>
                                Kapı
                                {sortConfig.key === 'door.name' && (
                                    <span className="sort-icon">
                                        {sortConfig.direction === 'asc' ? '↑' : '↓'}
                                    </span>
                                )}
                            </th>
                            <th onClick={() => requestSort('door.location')}>
                                Konum
                                {sortConfig.key === 'door.location' && (
                                    <span className="sort-icon">
                                        {sortConfig.direction === 'asc' ? '↑' : '↓'}
                                    </span>
                                )}
                            </th>
                            <th onClick={() => requestSort('door.accessDirection.name')}>
                                Yön
                                {sortConfig.key === 'door.accessDirection.name' && (
                                    <span className="sort-icon">
                                        {sortConfig.direction === 'asc' ? '↑' : '↓'}
                                    </span>
                                )}
                            </th>
                            <th onClick={() => requestSort('accessTimestamp')}>
                                Tarih/Saat
                                {sortConfig.key === 'accessTimestamp' && (
                                    <span className="sort-icon">
                                        {sortConfig.direction === 'asc' ? '↑' : '↓'}
                                    </span>
                                )}
                            </th>
                            <th onClick={() => requestSort('accessMethod.name')}>
                                Erişim Yöntemi
                                {sortConfig.key === 'accessMethod.name' && (
                                    <span className="sort-icon">
                                        {sortConfig.direction === 'asc' ? '↑' : '↓'}
                                    </span>
                                )}
                            </th>
                            <th onClick={() => requestSort('accessResult.name')}>
                                Sonuç
                                {sortConfig.key === 'accessResult.name' && (
                                    <span className="sort-icon">
                                        {sortConfig.direction === 'asc' ? '↑' : '↓'}
                                    </span>
                                )}
                            </th>
                            <th>Detaylar</th>
                        </tr>
                        </thead>
                        <tbody>
                        {accessLogs.length > 0 ? (
                            accessLogs.map((log, index) => (
                                <tr key={index} className={log.accessResult?.name === 'REDDEDILDI' ? 'rejected-row' : ''}>
                                    <td className="personnel-cell">
                                        {log.personnel ? (
                                            <div className="personnel-info">
                                                <PersonnelImage
                                                    personId={log.personnel.id}
                                                    photoFileName={log.personnel.photoFileName}
                                                    name={log.personnel.name}
                                                    surname={log.personnel.surname}
                                                    isPreviewable={true}
                                                    onPreviewClick={(id, filename) => showImagePreview(id, filename)}
                                                />
                                                <div className="personnel-name">
                                                    <span>{log.personnel.name} {log.personnel.surname}</span>
                                                    <small>{log.personnel.department?.name || ''}</small>
                                                </div>
                                            </div>
                                        ) : (
                                            '-'
                                        )}
                                    </td>
                                    <td>{log.card?.cardNumber || '-'}</td>
                                    <td>{log.door?.name || '-'}</td>
                                    <td>{log.door?.location || '-'}</td>
                                    <td className="direction-cell">
                                        {getAccessDirectionIcon(log.door?.accessDirection)}
                                    </td>
                                    <td className="date-cell">
                                        <div className="date-info">
                                            <span className="date-value">{formatDate(log.accessTimestamp)}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <span className="method-badge">
                                            {log.accessMethod?.name || '-'}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="result-cell">
                                            {getAccessResultIcon(log.accessResult)}
                                            <span className={`result-text ${log.accessResult?.name === 'ONAYLANDI' ? 'approved' : 'rejected'}`}>
                                                {log.accessResult?.name || '-'}
                                            </span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="action-cell">
                                            <button
                                                className="action-button details"
                                                onClick={() => showDetails(log)}
                                            >
                                                <Info size={16}/>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="9" className="no-data">
                                    {loading ? 'Veriler yükleniyor...' : 'Erişim kaydı bulunamadı'}
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
                        {totalItems > 0 ? `${currentPage * itemsPerPage - itemsPerPage + 1}-${Math.min(currentPage * itemsPerPage, totalItems)} / ${totalItems}` : '0-0 / 0'}
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
                <div className="image-preview-modal" onClick={closeImagePreview}>
                    <div className="image-preview-content" onClick={(e) => e.stopPropagation()} tabIndex={0}>
                        <div className="image-preview-header">
                            <button className="close-button" onClick={(e) => {
                                e.stopPropagation();
                                closeImagePreview();
                            }}>
                                <span>&times;</span>
                            </button>
                        </div>
                        <div className="image-preview-body" onClick={(e) => e.stopPropagation()}>
                            <img
                                src={selectedImage}
                                alt="Personel fotoğrafı"
                                onClick={(e) => e.stopPropagation()} 
                                onError={(e) => {
                                    console.error("Modal resim yükleme hatası:", e);
                                    e.target.src = ''; // Hata durumunda kaynağı temizle
                                    e.target.alt = 'Resim yüklenemedi';
                                }}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Detay modalı */}
            {showLogDetails && selectedLog && (
                <div className="log-details-modal-overlay" onClick={closeDetails}>
                    <div className="log-details-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="log-details-header">
                            <h3>Erişim Kaydı Detayları</h3>
                            <button className="close-button" onClick={closeDetails}>
                                <span>&times;</span>
                            </button>
                        </div>
                        <div className="log-details-content">
                            <div className="detail-group">
                                <h4>Personel Bilgileri</h4>
                                <div className="detail-row">
                                    <div className="detail-label">Ad Soyad:</div>
                                    <div className="detail-value">{selectedLog.personnel?.name} {selectedLog.personnel?.surname}</div>
                                </div>
                                <div className="detail-row">
                                    <div className="detail-label">TC Numarası:</div>
                                    <div className="detail-value">{selectedLog.personnel?.tcNum || '-'}</div>
                                </div>
                                <div className="detail-row">
                                    <div className="detail-label">Departman:</div>
                                    <div className="detail-value">{selectedLog.personnel?.department?.name || '-'}</div>
                                </div>
                                <div className="detail-row">
                                    <div className="detail-label">Ünvan:</div>
                                    <div className="detail-value">{selectedLog.personnel?.title?.name || '-'}</div>
                                </div>
                            </div>

                            <div className="detail-group">
                                <h4>Kart Bilgileri</h4>
                                <div className="detail-row">
                                    <div className="detail-label">Kart Numarası:</div>
                                    <div className="detail-value">{selectedLog.card?.cardNumber || '-'}</div>
                                </div>
                                <div className="detail-row">
                                    <div className="detail-label">Kart Türü:</div>
                                    <div className="detail-value">{selectedLog.card?.cardType?.name || '-'}</div>
                                </div>
                            </div>

                            <div className="detail-group">
                                <h4>Erişim Bilgileri</h4>
                                <div className="detail-row">
                                    <div className="detail-label">Kapı:</div>
                                    <div className="detail-value">{selectedLog.door?.name || '-'}</div>
                                </div>
                                <div className="detail-row">
                                    <div className="detail-label">Konum:</div>
                                    <div className="detail-value">{selectedLog.door?.location || '-'}</div>
                                </div>
                                <div className="detail-row">
                                    <div className="detail-label">Kapı Türü:</div>
                                    <div className="detail-value">{selectedLog.door?.doorType?.name || '-'}</div>
                                </div>
                                <div className="detail-row">
                                    <div className="detail-label">Erişim Yönü:</div>
                                    <div className="detail-value">{selectedLog.door?.accessDirection?.name || '-'}</div>
                                </div>
                                <div className="detail-row">
                                    <div className="detail-label">Erişim Zamanı:</div>
                                    <div className="detail-value">{formatDate(selectedLog.accessTimestamp)}</div>
                                </div>
                                <div className="detail-row">
                                    <div className="detail-label">Erişim Yöntemi:</div>
                                    <div className="detail-value">{selectedLog.accessMethod?.name || '-'}</div>
                                </div>
                                <div className="detail-row">
                                    <div className="detail-label">Erişim Sonucu:</div>
                                    <div className={`detail-value ${selectedLog.accessResult?.name === 'ONAYLANDI' ? 'result-approved' : 'result-rejected'}`}>
                                        {selectedLog.accessResult?.name || '-'}
                                    </div>
                                </div>
                                <div className="detail-row">
                                    <div className="detail-label">Detaylar:</div>
                                    <div className="detail-value detail-message">{selectedLog.details || '-'}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default AccessLogHistory;