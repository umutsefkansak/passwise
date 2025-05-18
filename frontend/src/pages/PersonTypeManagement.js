import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import '../styles/PersonTypeManagement.css';
import '../styles/FilterButtonsStandard.css';
import Layout from '../components/layout/Layout';
import {
    Search, Filter, Plus, Edit, Trash2, ChevronLeft, ChevronRight,
    AlertTriangle, X
} from 'lucide-react';
import ExportToExcel from '../components/ExportToExcel';

const PersonTypeManagement = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [personTypes, setPersonTypes] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [totalItems, setTotalItems] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'asc' });

    // Modal için state'ler
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedPersonType, setSelectedPersonType] = useState(null);
    const [editFormData, setEditFormData] = useState({
        name: '',
        description: ''
    });

    // Silme onay modalı için state'ler
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [personTypeToAction, setPersonTypeToAction] = useState(null);

    // Excel export için kolon tanımları
    const [excelColumns, setExcelColumns] = useState([
        { key: 'id', header: 'ID' },
        { key: 'name', header: 'Personel Türü Adı' },
        { key: 'description', header: 'Açıklama' }
    ]);

    const [filteredData, setFilteredData] = useState([]);

    // Personel türlerini çek
    useEffect(() => {
        fetchPersonTypes();
    }, [currentPage, itemsPerPage, sortConfig, searchTerm]);

    const fetchPersonTypes = async () => {
        try {
            setLoading(true);
            setError(null);

            // API'den personel türlerini çek
            const response = await api.get('/api/person-types');
            let personTypesData = response.data;

            // Arama filtresi
            if (searchTerm.trim() !== '') {
                personTypesData = personTypesData.filter(personType =>
                    personType.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    (personType.description && personType.description.toLowerCase().includes(searchTerm.toLowerCase()))
                );
            }

            // Sıralama
            if (sortConfig.key) {
                personTypesData.sort((a, b) => {
                    // null kontrolü
                    if (!a[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
                    if (!b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;

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

            setFilteredData(personTypesData);
            setTotalItems(personTypesData.length);

            // Sayfalama
            const startIndex = (currentPage - 1) * itemsPerPage;
            const paginatedData = personTypesData.slice(startIndex, startIndex + itemsPerPage);

            setPersonTypes(paginatedData);
            setLoading(false);
        } catch (err) {
            console.error('Personel türleri yüklenirken hata oluştu:', err);
            setError('Personel türleri yüklenirken bir hata oluştu. Lütfen tekrar deneyin.');
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
            fetchPersonTypes();
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

    const handleAddNewPersonType = () => {
        // Boş form verisi ile modal'ı aç
        setEditFormData({
            name: '',
            description: ''
        });
        setSelectedPersonType(null);
        setIsEditModalOpen(true);
    };

    // Düzenleme modalını açan handler
    const handleEditClick = (personType) => {
        setSelectedPersonType(personType);
        setEditFormData({
            name: personType.name || '',
            description: personType.description || ''
        });
        setIsEditModalOpen(true);
    };

    // Modal kapatma handler'ı
    const handleCloseModal = () => {
        setIsEditModalOpen(false);
        setSelectedPersonType(null);
        setEditFormData({
            name: '',
            description: ''
        });
    };

    // Form değişikliklerini izleyen handler
    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setEditFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Personel türü kaydetme/güncelleme handler'ı
    const handleSavePersonType = async () => {
        try {
            if (selectedPersonType) {
                // Güncelleme
                await api.put(`/api/person-types/${selectedPersonType.id}`, editFormData);
            } else {
                // Yeni ekleme
                await api.post('/api/person-types', editFormData);
            }
            
            // Modalı kapat
            handleCloseModal();
            
            // Verileri yeniden yükle
            fetchPersonTypes();
        } catch (err) {
            console.error('Personel türü kaydedilirken hata oluştu:', err);
            alert('Personel türü kaydedilirken bir hata oluştu: ' + (err.response?.data || err.message));
        }
    };

    const handleDeleteClick = (personType) => {
        setPersonTypeToAction(personType);
        setShowDeleteConfirm(true);
    };

    // Onay sonrası personel türünü silen handler
    const handleConfirmDelete = async () => {
        try {
            await api.delete(`/api/person-types/${personTypeToAction.id}`);
            // Personel türünü listeden kaldır
            setPersonTypes(prev => prev.filter(pt => pt.id !== personTypeToAction.id));
            setShowDeleteConfirm(false);
            setPersonTypeToAction(null);
            // Verileri yeniden yükle
            fetchPersonTypes();
        } catch (err) {
            console.error('Personel türü silinirken hata oluştu:', err);
            alert('Personel türü silinirken bir hata oluştu: ' + (err.response?.data || err.message));
            // Hata durumunda da diyaloğu kapat
            setShowDeleteConfirm(false);
            setPersonTypeToAction(null);
        }
    };

    // Yükleme durumu
    if (loading && personTypes.length === 0) {
        return (
            <div className="persontype-loading">
                <div className="spinner"></div>
                <p>Personel türleri yükleniyor...</p>
            </div>
        );
    }

    // Hata durumu
    if (error && personTypes.length === 0) {
        return (
            <div className="persontype-error">
                <AlertTriangle size={48} />
                <h2>Hata Oluştu</h2>
                <p>{error}</p>
                <button className="retry-button" onClick={fetchPersonTypes}>
                    Yeniden Dene
                </button>
            </div>
        );
    }

    return (
        <Layout pageTitle="Personel Türü Yönetimi">
            {/* Ana içerik */}
            <div className="persontype-tools">
                <div className="search-filter-wrapper">
                    <div className="search-filter">
                        <div className="search-tools">
                            <div className="search-box">
                                <Search size={18}/>
                                <input
                                    type="text"
                                    placeholder="Personel türü ara..."
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
                                fileName="Personel_Turleri"
                                columns={excelColumns}
                            />
                        </div>
                        
                        <div className="action-buttons">
                            <button className="add-button"
                                    onClick={handleAddNewPersonType}>
                                <Plus size={16}/>
                                <span>Yeni Personel Türü</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Personel Türleri tablosu */}
            <div className="persontype-table-container">
                <div className="table-wrapper">
                    <table className="persontype-table">
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
                                Personel Türü Adı
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
                        {personTypes.length > 0 ? (
                            personTypes.map((personType) => (
                                <tr key={personType.id}>
                                    <td>{personType.id || '-'}</td>
                                    <td>{personType.name || '-'}</td>
                                    <td>{personType.description || '-'}</td>
                                    <td>
                                        <div className="action-cell">
                                            <button
                                                className="action-button edit"
                                                onClick={() => handleEditClick(personType)}
                                            >
                                                <Edit size={16}/>
                                            </button>
                                            <button className="action-button delete"
                                                    onClick={() => handleDeleteClick(personType)}>
                                                <Trash2 size={16}/>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4" className="no-data">
                                    {loading ? 'Veriler yükleniyor...' : 'Personel türü bulunamadı'}
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

            {/* Silme onay modalı */}
            {showDeleteConfirm && (
                <div className="confirm-modal-overlay">
                    <div className="confirm-modal">
                        <div className="confirm-modal-content">
                            <div className="confirm-modal-header">
                                <AlertTriangle size={24} color="#e74c3c" />
                                <h3>Personel Türü Silme</h3>
                            </div>
                            <div className="confirm-modal-body">
                                <p>
                                    <strong>{personTypeToAction ? personTypeToAction.name : ''}</strong> personel türünü silmek istediğinizden emin misiniz?
                                </p>
                                <p className="warning-text">Bu işlem geri alınamaz ve bu türe ait personeller etkilenebilir.</p>
                            </div>
                            <div className="confirm-modal-footer">
                                <button
                                    className="cancel-button"
                                    onClick={() => {
                                        setShowDeleteConfirm(false);
                                        setPersonTypeToAction(null);
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

            {/* Düzenleme/Ekleme Modalı */}
            {isEditModalOpen && (
                <div className="confirm-modal-overlay">
                    <div className="confirm-modal persontype-edit-modal">
                        <div className="confirm-modal-content">
                            <div className="confirm-modal-header">
                                <h3>{selectedPersonType ? 'Personel Türü Düzenle' : 'Yeni Personel Türü Ekle'}</h3>
                                <button className="close-button" onClick={handleCloseModal}>
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="confirm-modal-body">
                                <div className="form-group">
                                    <label htmlFor="name">Personel Türü Adı:</label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={editFormData.name}
                                        onChange={handleFormChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="description">Açıklama:</label>
                                    <textarea
                                        id="description"
                                        name="description"
                                        value={editFormData.description}
                                        onChange={handleFormChange}
                                        rows="3"
                                    />
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
                                    onClick={handleSavePersonType}
                                >
                                    {selectedPersonType ? 'Güncelle' : 'Kaydet'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default PersonTypeManagement; 