import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import '../styles/AccessDirectionManagement.css';
import '../styles/FilterButtonsStandard.css';
import Layout from '../components/layout/Layout';
import {
    Search, Filter, Plus, Edit, Trash2, ChevronLeft, ChevronRight,
    AlertTriangle
} from 'lucide-react';
import EditAccessDirectionModal from '../components/EditAccessDirectionModal';
import ExportToExcel from '../components/ExportToExcel';

const AccessDirectionManagement = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [accessDirections, setAccessDirections] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [totalItems, setTotalItems] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'asc' });

    // Modal için state'ler
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedAccessDirection, setSelectedAccessDirection] = useState(null);

    // Silme onay modalı için state'ler
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [accessDirectionToAction, setAccessDirectionToAction] = useState(null);

    // Excel export için kolon tanımları
    const [excelColumns, setExcelColumns] = useState([
        { key: 'id', header: 'ID' },
        { key: 'name', header: 'Yön Adı' },
        { key: 'description', header: 'Açıklama' }
    ]);

    const [filteredData, setFilteredData] = useState([]);

    // Erişim Yönlerini çek
    useEffect(() => {
        fetchAccessDirections();
    }, [currentPage, itemsPerPage, sortConfig]);

    const fetchAccessDirections = async () => {
        try {
            setLoading(true);
            setError(null);

            // API endpoint'inden verileri çek
            const response = await api.get('/api/access-directions');
            let accessDirectionsData = response.data;

            // Hata ayıklama için verileri konsola yazdır
            console.log("Erişim Yönleri:", accessDirectionsData);

            // Arama filtresi (yön adına göre)
            if (searchTerm.trim() !== '') {
                accessDirectionsData = accessDirectionsData.filter(direction =>
                    (direction.name && direction.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                    (direction.description && direction.description.toLowerCase().includes(searchTerm.toLowerCase()))
                );
            }

            // Sıralama
            if (sortConfig.key) {
                accessDirectionsData.sort((a, b) => {
                    const aValue = a[sortConfig.key];
                    const bValue = b[sortConfig.key];

                    // null kontrolü
                    if (aValue === null) return sortConfig.direction === 'asc' ? 1 : -1;
                    if (bValue === null) return sortConfig.direction === 'asc' ? -1 : 1;

                    if (typeof aValue === 'string') {
                        return sortConfig.direction === 'asc'
                            ? aValue.localeCompare(bValue)
                            : bValue.localeCompare(aValue);
                    } else {
                        return sortConfig.direction === 'asc'
                            ? aValue - bValue
                            : bValue - aValue;
                    }
                });
            }

            setFilteredData(accessDirectionsData);
            setTotalItems(accessDirectionsData.length);

            // Sayfalama
            const startIndex = (currentPage - 1) * itemsPerPage;
            const paginatedData = accessDirectionsData.slice(startIndex, startIndex + itemsPerPage);

            setAccessDirections(paginatedData);
            setLoading(false);
        } catch (err) {
            console.error('Erişim yönleri yüklenirken hata oluştu:', err);
            setError('Erişim yönleri yüklenirken bir hata oluştu. Lütfen tekrar deneyin.');
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
            fetchAccessDirections();
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

    const handleAddNewAccessDirection = () => {
        // Boş yön verisi ile modal'ı aç
        setSelectedAccessDirection(null);
        setIsEditModalOpen(true);
    };

    // Düzenleme modalını açan handler
    const handleEditClick = (direction) => {
        setSelectedAccessDirection(direction);
        setIsEditModalOpen(true);
    };

    // Modal kapatma handler'ı
    const handleCloseModal = () => {
        setIsEditModalOpen(false);
        setSelectedAccessDirection(null);
    };

    // Yön güncellendiğinde çalışacak handler
    const handleAccessDirectionUpdate = (updatedDirection) => {
        // Yön listesini güncelle
        setAccessDirections(prev =>
            prev.map(d => d.id === updatedDirection.id ? updatedDirection : d)
        );
        // Güncellemeden sonra modalı kapat
        handleCloseModal();
        // Verileri yeniden yükle
        fetchAccessDirections();
    };

    const handleDeleteClick = (direction) => {
        setAccessDirectionToAction(direction);
        setShowDeleteConfirm(true);
    };

    // Onay sonrası yönü silen handler
    const handleConfirmDelete = async () => {
        try {
            await api.delete(`/api/access-directions/${accessDirectionToAction.id}`);
            // Yönü listeden kaldır
            setAccessDirections(prev => prev.filter(d => d.id !== accessDirectionToAction.id));
            setShowDeleteConfirm(false);
            setAccessDirectionToAction(null);
            // Verileri yeniden yükle
            fetchAccessDirections();
        } catch (err) {
            console.error('Erişim yönü silinirken hata oluştu:', err);
            // Hata durumunda da diyaloğu kapat
            setShowDeleteConfirm(false);
            setAccessDirectionToAction(null);
        }
    };

    // Yükleme durumu
    if (loading && accessDirections.length === 0) {
        return (
            <div className="direction-loading">
                <div className="spinner"></div>
                <p>Erişim yönleri yükleniyor...</p>
            </div>
        );
    }

    // Hata durumu
    if (error && accessDirections.length === 0) {
        return (
            <div className="direction-error">
                <AlertTriangle size={48} />
                <h2>Hata Oluştu</h2>
                <p>{error}</p>
                <button className="retry-button" onClick={fetchAccessDirections}>
                    Yeniden Dene
                </button>
            </div>
        );
    }

    return (
        <Layout pageTitle="Erişim Yönleri Yönetimi">
            {/* Ana içerik */}
            <div className="direction-tools">
                <div className="search-filter-wrapper">
                    <div className="search-filter">
                        <div className="search-tools">
                            <div className="search-box">
                                <Search size={18}/>
                                <input
                                    type="text"
                                    placeholder="Yön adı veya açıklama ara..."
                                    value={searchTerm}
                                    onChange={handleSearch}
                                    onKeyPress={handleSearchSubmit}
                                />
                            </div>
                            <div className="filter-buttons">
                                <button className="filter-button">
                                    <Filter size={16}/>
                                    <span>Filtrele</span>
                                </button>
                            </div>
                        </div>
                        
                        <div className="export-button">
                            <ExportToExcel
                                data={filteredData.length > 0 ? filteredData : []}
                                fileName="ErişimYönleri"
                                columns={excelColumns}
                            />
                        </div>
                        
                        <div className="action-buttons">
                            <button className="add-button"
                                    onClick={handleAddNewAccessDirection}>
                                <Plus size={16}/>
                                <span>Yeni Erişim Yönü</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Erişim Yönleri tablosu */}
            <div className="direction-table-container">
                <div className="table-wrapper">
                    <table className="direction-table">
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
                            <th onClick={() => requestSort('name')}>
                                Yön Adı
                                {sortConfig.key === 'name' && (
                                    <span className="sort-icon">
                                        {sortConfig.direction === 'asc' ? '↑' : '↓'}
                                    </span>
                                )}
                            </th>
                            <th onClick={() => requestSort('description')}>
                                Açıklama
                                {sortConfig.key === 'description' && (
                                    <span className="sort-icon">
                                        {sortConfig.direction === 'asc' ? '↑' : '↓'}
                                    </span>
                                )}
                            </th>
                            <th>İşlemler</th>
                        </tr>
                        </thead>
                        <tbody>
                        {accessDirections.length > 0 ? (
                            accessDirections.map((direction) => (
                                <tr key={direction.id}>
                                    <td>{direction.id || '-'}</td>
                                    <td>{direction.name || '-'}</td>
                                    <td>{direction.description || '-'}</td>
                                    <td>
                                        <div className="action-cell">
                                            <button
                                                className="action-button edit"
                                                onClick={() => handleEditClick(direction)}
                                            >
                                                <Edit size={16}/>
                                            </button>
                                            <button className="action-button delete"
                                                    onClick={() => handleDeleteClick(direction)}>
                                                <Trash2 size={16}/>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4" className="no-data">
                                    {loading ? 'Veriler yükleniyor...' : 'Erişim yönü bulunamadı'}
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
                                <h3>Erişim Yönü Silme</h3>
                            </div>
                            <div className="confirm-modal-body">
                                <p>
                                    <strong>{accessDirectionToAction ? `"${accessDirectionToAction.name}"` : 'Bu yönü'}</strong> silmek istediğinizden emin misiniz?
                                </p>
                                <p className="warning-text">Bu işlem geri alınamaz.</p>
                            </div>
                            <div className="confirm-modal-footer">
                                <button
                                    className="cancel-button"
                                    onClick={() => {
                                        setShowDeleteConfirm(false);
                                        setAccessDirectionToAction(null);
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

            {/* Erişim yönü düzenleme modalı */}
            <EditAccessDirectionModal
                isOpen={isEditModalOpen}
                onClose={handleCloseModal}
                accessDirection={selectedAccessDirection}
                onSave={handleAccessDirectionUpdate}
            />
        </Layout>
    );
};

export default AccessDirectionManagement;