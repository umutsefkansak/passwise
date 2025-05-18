import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import '../styles/DoorManagement.css';
import '../styles/FilterButtonsStandard.css';
import Layout from '../components/layout/Layout';
import {
    Search, Plus, Edit, Trash2, ChevronLeft, ChevronRight,
    AlertTriangle, Filter, X
} from 'lucide-react';
import EditDoorModal from '../components/EditDoorModal';
import ExportToExcel from '../components/ExportToExcel';

const DoorManagement = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [doors, setDoors] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [totalItems, setTotalItems] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'asc' });

    // Modal için state'ler
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedDoor, setSelectedDoor] = useState(null);

    // Silme onay modalı için state'ler
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [doorToAction, setDoorToAction] = useState(null);

    // Door Type ve Access Direction seçenekleri
    const [doorTypes, setDoorTypes] = useState([]);
    const [accessDirections, setAccessDirections] = useState([]);

    // Excel export için kolon tanımları
    const [excelColumns, setExcelColumns] = useState([
        { key: 'id', header: 'ID' },
        { key: 'name', header: 'Kapı Adı' },
        { key: 'location', header: 'Konum' },
        { key: 'doorType.name', header: 'Kapı Tipi' },
        { key: 'accessDirection.name', header: 'Erişim Yönü' },
        { key: 'mainDoor', header: 'Ana Kapı' }
    ]);

    const [filteredData, setFilteredData] = useState([]);

    // Kapıları çek
    useEffect(() => {
        fetchDoors();
        fetchDoorTypes();
        fetchAccessDirections();
    }, [currentPage, itemsPerPage, sortConfig]);

    const fetchDoors = async () => {
        try {
            setLoading(true);
            setError(null);

            // API endpoint'inden verileri çek
            const response = await api.get('/api/doors');
            let doorsData = response.data;

            // Hata ayıklama için verileri konsola yazdır
            console.log("Kapılar:", doorsData);

            // Arama filtresi (kapı adına ve konuma göre)
            if (searchTerm.trim() !== '') {
                doorsData = doorsData.filter(door =>
                    (door.name && door.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                    (door.location && door.location.toLowerCase().includes(searchTerm.toLowerCase()))
                );
            }

            // Sıralama
            if (sortConfig.key) {
                doorsData.sort((a, b) => {
                    // Nested property sorting (door.doorType.name gibi)
                    const aValue = sortConfig.key.includes('.')
                        ? getNestedProperty(a, sortConfig.key)
                        : a[sortConfig.key];
                    const bValue = sortConfig.key.includes('.')
                        ? getNestedProperty(b, sortConfig.key)
                        : b[sortConfig.key];

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

            setFilteredData(doorsData);
            setTotalItems(doorsData.length);

            // Sayfalama
            const startIndex = (currentPage - 1) * itemsPerPage;
            const paginatedData = doorsData.slice(startIndex, startIndex + itemsPerPage);

            setDoors(paginatedData);
            setLoading(false);
        } catch (err) {
            console.error('Kapılar yüklenirken hata oluştu:', err);
            setError('Kapılar yüklenirken bir hata oluştu. Lütfen tekrar deneyin.');
            setLoading(false);
        }
    };

    // Nested property değeri alma fonksiyonu (örn: "doorType.name")
    const getNestedProperty = (obj, path) => {
        return path.split('.').reduce((acc, part) => {
            if (acc && acc[part] !== undefined) {
                return acc[part];
            }
            return null;
        }, obj);
    };

    // Kapı tiplerini getir
    const fetchDoorTypes = async () => {
        try {
            const response = await api.get('/api/door-types');
            setDoorTypes(response.data);
        } catch (err) {
            console.error('Kapı tipleri yüklenirken hata oluştu:', err);
        }
    };

    // Erişim yönlerini getir
    const fetchAccessDirections = async () => {
        try {
            const response = await api.get('/api/access-directions');
            setAccessDirections(response.data);
        } catch (err) {
            console.error('Erişim yönleri yüklenirken hata oluştu:', err);
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
            fetchDoors();
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

    const handleAddNewDoor = () => {
        // Boş kapı verisi ile modal'ı aç
        setSelectedDoor(null);
        setIsEditModalOpen(true);
    };

    // Düzenleme modalını açan handler
    const handleEditClick = (door) => {
        setSelectedDoor(door);
        setIsEditModalOpen(true);
    };

    // Modal kapatma handler'ı
    const handleCloseModal = () => {
        setIsEditModalOpen(false);
        setSelectedDoor(null);
    };

    // Kapı güncellendiğinde çalışacak handler
    const handleDoorUpdate = (updatedDoor) => {
        // Kapı listesini güncelle
        setDoors(prev =>
            prev.map(d => d.id === updatedDoor.id ? updatedDoor : d)
        );
        // Güncellemeden sonra modalı kapat
        handleCloseModal();
        // Verileri yeniden yükle
        fetchDoors();
    };

    const handleDeleteClick = (door) => {
        setDoorToAction(door);
        setShowDeleteConfirm(true);
    };

    // Onay sonrası kapıyı silen handler
    const handleConfirmDelete = async () => {
        try {
            await api.delete(`/api/doors/${doorToAction.id}`);
            // Kapıyı listeden kaldır
            setDoors(prev => prev.filter(d => d.id !== doorToAction.id));
            setShowDeleteConfirm(false);
            setDoorToAction(null);
            // Verileri yeniden yükle
            fetchDoors();
        } catch (err) {
            console.error('Kapı silinirken hata oluştu:', err);
            // Hata durumunda da diyaloğu kapat
            setShowDeleteConfirm(false);
            setDoorToAction(null);
        }
    };

    // Yükleme durumu
    if (loading && doors.length === 0) {
        return (
            <div className="door-loading">
                <div className="spinner"></div>
                <p>Kapılar yükleniyor...</p>
            </div>
        );
    }

    // Hata durumu
    if (error && doors.length === 0) {
        return (
            <div className="door-error">
                <AlertTriangle size={48} />
                <h2>Hata Oluştu</h2>
                <p>{error}</p>
                <button className="retry-button" onClick={fetchDoors}>
                    Yeniden Dene
                </button>
            </div>
        );
    }

    return (
        <Layout pageTitle="Kapı Yönetimi">
            {/* Ana içerik */}
            <div className="door-tools">
                <div className="search-filter-wrapper">
                    <div className="search-filter">
                        <div className="search-tools">
                            <div className="search-box">
                                <Search size={18}/>
                                <input
                                    type="text"
                                    placeholder="Kapı ara..."
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
                                data={doors.length > 0 ? doors : []}
                                fileName="Kapılar"
                                columns={[
                                    { key: 'id', header: 'ID' },
                                    { key: 'name', header: 'Kapı Adı' },
                                    { key: 'location', header: 'Konum' },
                                    { key: 'doorType.name', header: 'Kapı Tipi' },
                                    { key: 'accessDirection.name', header: 'Erişim Yönü' },
                                    { key: 'mainDoor', header: 'Ana Kapı',
                                      accessor: (item) => item.mainDoor ? 'Evet' : 'Hayır' }
                                ]}
                            />
                        </div>

                        <div className="action-buttons">
                            <button className="add-button"
                                    onClick={handleAddNewDoor}>
                                <Plus size={16}/>
                                <span>Yeni Kapı</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Kapılar tablosu */}
            <div className="door-table-container">
                <div className="table-wrapper">
                    <table className="door-table">
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
                                Kapı Adı
                                {sortConfig.key === 'name' && (
                                    <span className="sort-icon">
                                        {sortConfig.direction === 'asc' ? '↑' : '↓'}
                                    </span>
                                )}
                            </th>
                            <th onClick={() => requestSort('location')}>
                                Konum
                                {sortConfig.key === 'location' && (
                                    <span className="sort-icon">
                                        {sortConfig.direction === 'asc' ? '↑' : '↓'}
                                    </span>
                                )}
                            </th>
                            <th onClick={() => requestSort('doorType.name')}>
                                Kapı Tipi
                                {sortConfig.key === 'doorType.name' && (
                                    <span className="sort-icon">
                                        {sortConfig.direction === 'asc' ? '↑' : '↓'}
                                    </span>
                                )}
                            </th>
                            <th onClick={() => requestSort('accessDirection.name')}>
                                Erişim Yönü
                                {sortConfig.key === 'accessDirection.name' && (
                                    <span className="sort-icon">
                                        {sortConfig.direction === 'asc' ? '↑' : '↓'}
                                    </span>
                                )}
                            </th>
                            <th onClick={() => requestSort('mainDoor')}>
                                Ana Kapı
                                {sortConfig.key === 'mainDoor' && (
                                    <span className="sort-icon">
                                        {sortConfig.direction === 'asc' ? '↑' : '↓'}
                                    </span>
                                )}
                            </th>
                            <th>İşlemler</th>
                        </tr>
                        </thead>
                        <tbody>
                        {doors.length > 0 ? (
                            doors.map((door) => (
                                <tr key={door.id}>
                                    <td>{door.id || '-'}</td>
                                    <td>{door.name || '-'}</td>
                                    <td>{door.location || '-'}</td>
                                    <td>{door.doorType?.name || '-'}</td>
                                    <td>{door.accessDirection?.name || '-'}</td>
                                    <td>{door.mainDoor ? 'Evet' : 'Hayır'}</td>
                                    <td>
                                        <div className="action-cell">
                                            <button
                                                className="action-button edit"
                                                onClick={() => handleEditClick(door)}
                                            >
                                                <Edit size={16}/>
                                            </button>
                                            <button className="action-button delete"
                                                    onClick={() => handleDeleteClick(door)}>
                                                <Trash2 size={16}/>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="7" className="no-data">
                                    {loading ? 'Veriler yükleniyor...' : 'Kapı bulunamadı'}
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
                                <h3>Kapı Silme</h3>
                            </div>
                            <div className="confirm-modal-body">
                                <p>
                                    <strong>{doorToAction ? `"${doorToAction.name}"` : 'Bu kapıyı'}</strong> silmek istediğinizden emin misiniz?
                                </p>
                                <p className="warning-text">Bu işlem geri alınamaz.</p>
                            </div>
                            <div className="confirm-modal-footer">
                                <button
                                    className="cancel-button"
                                    onClick={() => {
                                        setShowDeleteConfirm(false);
                                        setDoorToAction(null);
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

            {/* Kapı düzenleme modalı */}
            <EditDoorModal
                isOpen={isEditModalOpen}
                onClose={handleCloseModal}
                door={selectedDoor}
                onSave={handleDoorUpdate}
                doorTypes={doorTypes}
                accessDirections={accessDirections}
            />
        </Layout>
    );
};

export default DoorManagement;