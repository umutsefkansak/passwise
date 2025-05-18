import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import '../styles/DoorTypeManagement.css';
import '../styles/FilterButtonsStandard.css';
import Layout from '../components/layout/Layout';
import {
    Search, Filter, Plus, Edit, Trash2, ChevronLeft, ChevronRight,
    AlertTriangle, X
} from 'lucide-react';
import EditDoorTypeModal from '../components/EditDoorTypeModal';
import ExportToExcel from '../components/ExportToExcel';

const DoorTypeManagement = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [doorTypes, setDoorTypes] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [totalItems, setTotalItems] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'asc' });

    // Modal için state'ler
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedDoorType, setSelectedDoorType] = useState(null);

    // Silme onay modalı için state'ler
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [doorTypeToAction, setDoorTypeToAction] = useState(null);

    // Excel export için kolon tanımları
    const [excelColumns, setExcelColumns] = useState([
        { key: 'id', header: 'ID' },
        { key: 'name', header: 'Kapı Türü Adı' }
    ]);

    const [filteredData, setFilteredData] = useState([]);

    // Kapı Türlerini çek
    useEffect(() => {
        fetchDoorTypes();
    }, [currentPage, itemsPerPage, sortConfig]);

    const fetchDoorTypes = async () => {
        try {
            setLoading(true);
            setError(null);

            // API endpoint'inden verileri çek
            const response = await api.get('/api/door-types');
            let doorTypesData = response.data;

            // Arama filtresi
            if (searchTerm.trim() !== '') {
                doorTypesData = doorTypesData.filter(doorType =>
                    doorType.name.toLowerCase().includes(searchTerm.toLowerCase())
                );
            }

            // Sıralama
            if (sortConfig.key) {
                doorTypesData.sort((a, b) => {
                    const aValue = a[sortConfig.key];
                    const bValue = b[sortConfig.key];

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

            setFilteredData(doorTypesData);
            setTotalItems(doorTypesData.length);

            // Sayfalama
            const startIndex = (currentPage - 1) * itemsPerPage;
            const paginatedData = doorTypesData.slice(startIndex, startIndex + itemsPerPage);

            setDoorTypes(paginatedData);
            setLoading(false);
        } catch (err) {
            console.error('Kapı Türleri yüklenirken hata oluştu:', err);
            setError('Kapı Türleri yüklenirken bir hata oluştu. Lütfen tekrar deneyin.');
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
            fetchDoorTypes();
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

    const handleAddNewDoorType = () => {
        // Boş kapı türü verisi ile modal'ı aç
        setSelectedDoorType(null);
        setIsEditModalOpen(true);
    };

    // Düzenleme modalını açan handler
    const handleEditClick = (doorType) => {
        setSelectedDoorType(doorType);
        setIsEditModalOpen(true);
    };

    // Modal kapatma handler'ı
    const handleCloseModal = () => {
        setIsEditModalOpen(false);
        setSelectedDoorType(null);
    };

    // Kapı türü güncellendiğinde çalışacak handler
    const handleDoorTypeUpdate = (updatedDoorType) => {
        // Kapı türü listesini güncelle
        setDoorTypes(prev =>
            prev.map(d => d.id === updatedDoorType.id ? updatedDoorType : d)
        );
        // Güncellemeden sonra modalı kapat
        handleCloseModal();
        // Verileri yeniden yükle
        fetchDoorTypes();
    };

    const handleDeleteClick = (doorType) => {
        setDoorTypeToAction(doorType);
        setShowDeleteConfirm(true);
    };

    // Onay sonrası kapı türünü silen handler
    const handleConfirmDelete = async () => {
        try {
            await api.delete(`/api/door-types/${doorTypeToAction.id}`);
            // Kapı türünü listeden kaldır
            setDoorTypes(prev => prev.filter(d => d.id !== doorTypeToAction.id));
            setShowDeleteConfirm(false);
            setDoorTypeToAction(null);
            // Verileri yeniden yükle
            fetchDoorTypes();
        } catch (err) {
            console.error('Kapı türü silinirken hata oluştu:', err);
            // Hata durumunda da diyaloğu kapat
            setShowDeleteConfirm(false);
            setDoorTypeToAction(null);
            // Hata mesajını göster
            setError(err.response?.data?.message || 'Kapı türü silinemedi. Lütfen tekrar deneyin.');
        }
    };

    // Yükleme durumu
    if (loading && doorTypes.length === 0) {
        return (
            <div className="door-type-loading">
                <div className="spinner"></div>
                <p>Kapı Türleri yükleniyor...</p>
            </div>
        );
    }

    // Hata durumu
    if (error && doorTypes.length === 0) {
        return (
            <div className="door-type-error">
                <AlertTriangle size={48} />
                <h2>Hata Oluştu</h2>
                <p>{error}</p>
                <button className="retry-button" onClick={fetchDoorTypes}>
                    Yeniden Dene
                </button>
            </div>
        );
    }

    return (
        <Layout pageTitle="Kapı Türleri Yönetimi">
            {/* Ana içerik */}
            <div className="door-type-tools">
                <div className="search-filter-wrapper">
                    <div className="search-filter">
                        <div className="search-tools">
                            <div className="search-box">
                                <Search size={18}/>
                                <input
                                    type="text"
                                    placeholder="Kapı türü ara..."
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
                                fileName="Kapı Türleri"
                                columns={excelColumns}
                            />
                        </div>
                        
                        <div className="action-buttons">
                            <button className="add-button"
                                    onClick={handleAddNewDoorType}>
                                <Plus size={16}/>
                                <span>Yeni Kapı Türü</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Kapı Türleri tablosu */}
            <div className="door-type-table-container">
                <div className="table-wrapper">
                    <table className="door-type-table">
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
                                Kapı Türü Adı
                                {sortConfig.key === 'name' && (
                                    <span className="sort-icon">
                                        {sortConfig.direction === 'asc' ? '↑' : '↓'}
                                    </span>
                                )}
                            </th>
                            <th>İşlemler</th>
                        </tr>
                        </thead>
                        <tbody>
                        {doorTypes.length > 0 ? (
                            doorTypes.map((doorType) => (
                                <tr key={doorType.id}>
                                    <td>{doorType.id || '-'}</td>
                                    <td>{doorType.name || '-'}</td>
                                    <td>
                                        <div className="action-cell">
                                            <button
                                                className="action-button edit"
                                                onClick={() => handleEditClick(doorType)}
                                            >
                                                <Edit size={16}/>
                                            </button>
                                            <button
                                                className="action-button delete"
                                                onClick={() => handleDeleteClick(doorType)}
                                            >
                                                <Trash2 size={16}/>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="3" className="no-data">
                                    {loading ? 'Veriler yükleniyor...' : 'Kapı türü bulunamadı'}
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
                                <h3>Kapı Türü Silme</h3>
                            </div>
                            <div className="confirm-modal-body">
                                <p>
                                    <strong>{doorTypeToAction ? `"${doorTypeToAction.name}"` : 'Bu kapı türünü'}</strong> silmek istediğinizden emin misiniz?
                                </p>
                                <p className="warning-text">Bu işlem geri alınamaz.</p>
                            </div>
                            <div className="confirm-modal-footer">
                                <button
                                    className="cancel-button"
                                    onClick={() => {
                                        setShowDeleteConfirm(false);
                                        setDoorTypeToAction(null);
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

            {/* Kapı Türü düzenleme modalı */}
            <EditDoorTypeModal
                isOpen={isEditModalOpen}
                onClose={handleCloseModal}
                doorType={selectedDoorType}
                onSave={handleDoorTypeUpdate}
            />
        </Layout>
    );
};

export default DoorTypeManagement;