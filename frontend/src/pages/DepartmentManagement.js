import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import '../styles/DepartmentManagement.css';
import '../styles/FilterButtonsStandard.css';
import Layout from '../components/layout/Layout';
import {
    Search, Filter, Plus, Edit, Trash2, ChevronLeft, ChevronRight,
    AlertTriangle
} from 'lucide-react';
import EditDepartmentModal from '../components/EditDepartmentModal';
import ExportToExcel from '../components/ExportToExcel';

const DepartmentManagement = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [departments, setDepartments] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [totalItems, setTotalItems] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'asc' });

    // Modal için state'ler
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedDepartment, setSelectedDepartment] = useState(null);

    // Silme onay modalı için state'ler
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [departmentToAction, setDepartmentToAction] = useState(null);

    // Excel export için kolon tanımları
    const [excelColumns, setExcelColumns] = useState([
        { key: 'id', header: 'ID' },
        { key: 'name', header: 'Departman Adı' }
    ]);

    const [filteredData, setFilteredData] = useState([]);

    // Departmanları çek
    useEffect(() => {
        fetchDepartments();
    }, [currentPage, itemsPerPage, sortConfig]);

    const fetchDepartments = async () => {
        try {
            setLoading(true);
            setError(null);

            // API endpoint'inden verileri çek
            const response = await api.get('/api/departments');
            let departmentsData = response.data;

            // Hata ayıklama için verileri konsola yazdır
            console.log("Departmanlar:", departmentsData);

            // Arama filtresi (departman adına göre)
            if (searchTerm.trim() !== '') {
                departmentsData = departmentsData.filter(department =>
                    (department.name && department.name.toLowerCase().includes(searchTerm.toLowerCase()))
                );
            }

            // Sıralama
            if (sortConfig.key) {
                departmentsData.sort((a, b) => {
                    // Nested property sorting
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

            setFilteredData(departmentsData);
            setTotalItems(departmentsData.length);

            // Sayfalama
            const startIndex = (currentPage - 1) * itemsPerPage;
            const paginatedData = departmentsData.slice(startIndex, startIndex + itemsPerPage);

            setDepartments(paginatedData);
            setLoading(false);
        } catch (err) {
            console.error('Departmanlar yüklenirken hata oluştu:', err);
            setError('Departmanlar yüklenirken bir hata oluştu. Lütfen tekrar deneyin.');
            setLoading(false);
        }
    };

    // Nested property değeri alma fonksiyonu
    const getNestedProperty = (obj, path) => {
        return path.split('.').reduce((acc, part) => {
            if (acc && acc[part] !== undefined) {
                return acc[part];
            }
            return null;
        }, obj);
    };

    // Arama değişikliğinde
    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1); // Aramada ilk sayfaya dön
    };

    const handleSearchSubmit = (e) => {
        // Enter tuşuna basıldığında aramayı gerçekleştir
        if (e.key === 'Enter') {
            fetchDepartments();
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

    const handleAddNewDepartment = () => {
        // Boş departman verisi ile modal'ı aç
        setSelectedDepartment(null);
        setIsEditModalOpen(true);
    };

    // Düzenleme modalını açan handler
    const handleEditClick = (department) => {
        setSelectedDepartment(department);
        setIsEditModalOpen(true);
    };

    // Modal kapatma handler'ı
    const handleCloseModal = () => {
        setIsEditModalOpen(false);
        setSelectedDepartment(null);
    };

    // Departman güncellendiğinde çalışacak handler
    const handleDepartmentUpdate = (updatedDepartment) => {
        // Departman listesini güncelle
        setDepartments(prev =>
            prev.map(d => d.id === updatedDepartment.id ? updatedDepartment : d)
        );
        // Güncellemeden sonra modalı kapat
        handleCloseModal();
        // Verileri yeniden yükle
        fetchDepartments();
    };

    const handleDeleteClick = (department) => {
        setDepartmentToAction(department);
        setShowDeleteConfirm(true);
    };

    // Onay sonrası departmanı silen handler
    const handleConfirmDelete = async () => {
        try {
            await api.delete(`/api/departments/${departmentToAction.id}`);
            // Departmanı listeden kaldır
            setDepartments(prev => prev.filter(d => d.id !== departmentToAction.id));
            setShowDeleteConfirm(false);
            setDepartmentToAction(null);
            // Verileri yeniden yükle
            fetchDepartments();
        } catch (err) {
            console.error('Departman silinirken hata oluştu:', err);
            // Hata durumunda da diyaloğu kapat
            setShowDeleteConfirm(false);
            setDepartmentToAction(null);
        }
    };

    // Yükleme durumu
    if (loading && departments.length === 0) {
        return (
            <div className="department-loading">
                <div className="spinner"></div>
                <p>Departmanlar yükleniyor...</p>
            </div>
        );
    }

    // Hata durumu
    if (error && departments.length === 0) {
        return (
            <div className="department-error">
                <AlertTriangle size={48} />
                <h2>Hata Oluştu</h2>
                <p>{error}</p>
                <button className="retry-button" onClick={fetchDepartments}>
                    Yeniden Dene
                </button>
            </div>
        );
    }

    return (
        <Layout pageTitle="Departman Yönetimi">
            {/* Ana içerik */}
            <div className="department-tools">
                <div className="search-filter-wrapper">
                    <div className="search-filter">
                        <div className="search-tools">
                            <div className="search-box">
                                <Search size={18}/>
                                <input
                                    type="text"
                                    placeholder="Departman adı ara..."
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
                                fileName="Departmanlar"
                                columns={excelColumns}
                            />
                        </div>
                        
                        <div className="action-buttons">
                            <button className="add-button"
                                    onClick={handleAddNewDepartment}>
                                <Plus size={16}/>
                                <span>Yeni Departman</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Departmanlar tablosu */}
            <div className="department-table-container">
                <div className="table-wrapper">
                    <table className="department-table">
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
                                Departman Adı
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
                        {departments.length > 0 ? (
                            departments.map((department) => (
                                <tr key={department.id}>
                                    <td>{department.id || '-'}</td>
                                    <td>{department.name || '-'}</td>
                                    <td>
                                        <div className="action-cell">
                                            <button
                                                className="action-button edit"
                                                onClick={() => handleEditClick(department)}
                                            >
                                                <Edit size={16}/>
                                            </button>
                                            <button className="action-button delete"
                                                    onClick={() => handleDeleteClick(department)}>
                                                <Trash2 size={16}/>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="3" className="no-data">
                                    {loading ? 'Veriler yükleniyor...' : 'Departman bulunamadı'}
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
                                <h3>Departman Silme</h3>
                            </div>
                            <div className="confirm-modal-body">
                                <p>
                                    <strong>{departmentToAction ? `"${departmentToAction.name}"` : 'Bu departmanı'}</strong> silmek istediğinizden emin misiniz?
                                </p>
                                <p className="warning-text">Bu işlem geri alınamaz.</p>
                            </div>
                            <div className="confirm-modal-footer">
                                <button
                                    className="cancel-button"
                                    onClick={() => {
                                        setShowDeleteConfirm(false);
                                        setDepartmentToAction(null);
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

            {/* Departman düzenleme modalı */}
            <EditDepartmentModal
                isOpen={isEditModalOpen}
                onClose={handleCloseModal}
                department={selectedDepartment}
                onSave={handleDepartmentUpdate}
            />
        </Layout>
    );
};

export default DepartmentManagement; 