import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import '../styles/PersonnelBlacklistReasonManagement.css';
import Layout from '../components/layout/Layout';
import {
    Search, Plus, Edit, Trash2, ChevronLeft, ChevronRight,
    AlertTriangle, Filter, X
} from 'lucide-react';
import EditBlacklistReasonModal from '../components/EditPersonnelBlacklistReasonModal';
import ExportToExcel from '../components/ExportToExcel';

const PersonnelBlacklistReasonManagement = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [blacklistReasons, setBlacklistReasons] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [totalItems, setTotalItems] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'asc' });

    // Modal için state'ler
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedReason, setSelectedReason] = useState(null);

    // Silme onay modalı için state'ler
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [reasonToAction, setReasonToAction] = useState(null);

    const [excelColumns, setExcelColumns] = useState([
        { key: 'id', header: 'ID' },
        { key: 'reason', header: 'Sebep' }
    ]);

    const [filteredData, setFilteredData] = useState([]);

    // Kara liste sebeplerini çek
    useEffect(() => {
        fetchBlacklistReasons();
    }, [currentPage, itemsPerPage, sortConfig]);

    const fetchBlacklistReasons = async () => {
        try {
            setLoading(true);
            setError(null);

            // API endpoint'inden verileri çek
            const response = await api.get('/api/personnel-blacklist-reasons');
            let reasonsData = response.data;

            // Hata ayıklama için verileri konsola yazdır
            console.log("Kara Liste Sebepleri:", reasonsData);

            // Arama filtresi (sebebe göre)
            if (searchTerm.trim() !== '') {
                reasonsData = reasonsData.filter(reason =>
                    reason.reason && reason.reason.toLowerCase().includes(searchTerm.toLowerCase())
                );
            }

            // Sıralama
            if (sortConfig.key) {
                reasonsData.sort((a, b) => {
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

            setFilteredData(reasonsData);
            setTotalItems(reasonsData.length);

            // Sayfalama
            const startIndex = (currentPage - 1) * itemsPerPage;
            const paginatedData = reasonsData.slice(startIndex, startIndex + itemsPerPage);

            setBlacklistReasons(paginatedData);
            setLoading(false);
        } catch (err) {
            console.error('Kara liste sebepleri yüklenirken hata oluştu:', err);
            setError('Kara liste sebepleri yüklenirken bir hata oluştu. Lütfen tekrar deneyin.');
            setLoading(false);
        }
    };

    // Arama değişikliğinde
    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1); // Aramada ilk sayfaya dön
    };

    const handleSearchSubmit = (e) => {
        // Enter tuşuna basıldığında aramayı gerçekleştir
        if (e.key === 'Enter') {
            fetchBlacklistReasons();
        }
    }

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

    const handleAddNewReason = () => {
        // Boş sebep verisi ile modal'ı aç
        setSelectedReason(null);
        setIsEditModalOpen(true);
    };

    // Düzenleme modalını açan handler
    const handleEditClick = (reason) => {
        setSelectedReason(reason);
        setIsEditModalOpen(true);
    };

    // Modal kapatma handler'ı
    const handleCloseModal = () => {
        setIsEditModalOpen(false);
        setSelectedReason(null);
    };

    // Sebep güncellendiğinde çalışacak handler
    const handleReasonUpdate = (updatedReason) => {
        // Sebep listesini güncelle
        setBlacklistReasons(prev =>
            prev.map(r => r.id === updatedReason.id ? updatedReason : r)
        );
        // Güncellemeden sonra modalı kapat
        handleCloseModal();
        // Verileri yeniden yükle
        fetchBlacklistReasons();
    };

    const handleDeleteClick = (reason) => {
        setReasonToAction(reason);
        setShowDeleteConfirm(true);
    };

    // Onay sonrası sebebi silen handler
    const handleConfirmDelete = async () => {
        try {
            await api.delete(`/api/personnel-blacklist-reasons/${reasonToAction.id}`);
            // Sebebi listeden kaldır
            setBlacklistReasons(prev => prev.filter(r => r.id !== reasonToAction.id));
            setShowDeleteConfirm(false);
            setReasonToAction(null);
            // Verileri yeniden yükle
            fetchBlacklistReasons();
        } catch (err) {
            console.error('Sebep silinirken hata oluştu:', err);
            // Hata durumunda da diyaloğu kapat
            setShowDeleteConfirm(false);
            setReasonToAction(null);
        }
    };

    // Yükleme durumu
    if (loading && blacklistReasons.length === 0) {
        return (
            <div className="blacklist-reason-loading">
                <div className="spinner"></div>
                <p>Kara liste sebepleri yükleniyor...</p>
            </div>
        );
    }

    // Hata durumu
    if (error && blacklistReasons.length === 0) {
        return (
            <div className="blacklist-reason-error">
                <AlertTriangle size={48} />
                <h2>Hata Oluştu</h2>
                <p>{error}</p>
                <button className="retry-button" onClick={fetchBlacklistReasons}>
                    Yeniden Dene
                </button>
            </div>
        );
    }

    return (
        <Layout pageTitle="Kara Liste Sebep Yönetimi">
            {/* Ana içerik */}
            <div className="blacklist-reason-tools">
                <div className="search-filter">
                    <div className="search-box">
                        <Search size={18}/>
                        <input
                            type="text"
                            placeholder="Sebep ara..."
                            value={searchTerm}
                            onChange={handleSearch}
                            onKeyPress={handleSearchSubmit}
                        />
                    </div>

                    <ExportToExcel
                        data={filteredData.length > 0 ? filteredData : []}
                        fileName="Kara_Liste_Sebepleri"
                        columns={excelColumns}
                    />

                    <div className="filter-dropdown">
                        <button className="filter-dropdown-button">
                            <Filter size={16}/>
                            <span>Filtrele</span>
                        </button>
                    </div>
                    <div className="action-buttons">
                        <button className="add-button"
                                onClick={handleAddNewReason}>
                            <Plus size={16}/>
                            <span>Yeni Sebep</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Kara liste sebepleri tablosu */}
            <div className="blacklist-reason-table-container">
                <div className="table-wrapper">
                    <table className="blacklist-reason-table">
                        <thead>
                        <tr>
                            <th onClick={() => requestSort('id')}>
                                ID
                                {sortConfig.key === 'id' && (
                                    <span className="sort-icon">
                                        {sortConfig.direction === 'asc' ? '↑' : '↓'}
                                    </span>
                                )}
                            </th>
                            <th onClick={() => requestSort('reason')}>
                                Sebep
                                {sortConfig.key === 'reason' && (
                                    <span className="sort-icon">
                                        {sortConfig.direction === 'asc' ? '↑' : '↓'}
                                    </span>
                                )}
                            </th>
                            <th>İşlemler</th>
                        </tr>
                        </thead>
                        <tbody>
                        {blacklistReasons.length > 0 ? (
                            blacklistReasons.map((reason) => (
                                <tr key={reason.id}>
                                    <td>{reason.id || '-'}</td>
                                    <td>{reason.reason || '-'}</td>
                                    <td>
                                        <div className="action-cell">
                                            <button
                                                className="action-button edit"
                                                onClick={() => handleEditClick(reason)}
                                            >
                                                <Edit size={16}/>
                                            </button>
                                            <button className="action-button delete"
                                                    onClick={() => handleDeleteClick(reason)}>
                                                <Trash2 size={16}/>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="3" className="no-data">
                                    {loading ? 'Veriler yükleniyor...' : 'Kara liste sebebi bulunamadı'}
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

            {/* Silme onay modalı */}
            {showDeleteConfirm && (
                <div className="confirm-modal-overlay">
                    <div className="confirm-modal">
                        <div className="confirm-modal-content">
                            <div className="confirm-modal-header">
                                <AlertTriangle size={24} color="#e74c3c" />
                                <h3>Sebep Silme</h3>
                            </div>
                            <div className="confirm-modal-body">
                                <p>
                                    <strong>{reasonToAction ? `"${reasonToAction.reason}"` : 'Bu sebebi'}</strong> silmek istediğinizden emin misiniz?
                                </p>
                                <p className="warning-text">Bu işlem geri alınamaz.</p>
                            </div>
                            <div className="confirm-modal-footer">
                                <button
                                    className="cancel-button"
                                    onClick={() => {
                                        setShowDeleteConfirm(false);
                                        setReasonToAction(null);
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

            {/* Kara liste sebebi düzenleme modalı */}
            <EditBlacklistReasonModal
                isOpen={isEditModalOpen}
                onClose={handleCloseModal}
                reason={selectedReason}
                onSave={handleReasonUpdate}
            />
        </Layout>
    );
};

export default PersonnelBlacklistReasonManagement;