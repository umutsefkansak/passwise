import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import '../styles/CardTypeManagement.css';
import '../styles/FilterButtonsStandard.css';
import Layout from '../components/layout/Layout';
import {
    Search, Filter, Plus, Edit, Trash2, ChevronLeft, ChevronRight,
    AlertTriangle, X
} from 'lucide-react';
import ExportToExcel from '../components/ExportToExcel';

const CardTypeManagement = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [cardTypes, setCardTypes] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [totalItems, setTotalItems] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'asc' });

    // Modal için state'ler
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedCardType, setSelectedCardType] = useState(null);
    const [editFormData, setEditFormData] = useState({
        name: '',
        description: ''
    });

    // Silme onay modalı için state'ler
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [cardTypeToAction, setCardTypeToAction] = useState(null);

    // Excel export için kolon tanımları
    const [excelColumns, setExcelColumns] = useState([
        { key: 'id', header: 'ID' },
        { key: 'name', header: 'Kart Türü Adı' },
        { key: 'description', header: 'Açıklama' }
    ]);

    const [filteredData, setFilteredData] = useState([]);

    // Kart türlerini çek
    useEffect(() => {
        fetchCardTypes();
    }, [currentPage, itemsPerPage, sortConfig, searchTerm]);

    const fetchCardTypes = async () => {
        try {
            setLoading(true);
            setError(null);

            // API'den kart türlerini çek
            const response = await api.get('/api/card-types');
            let cardTypesData = response.data;

            // Arama filtresi
            if (searchTerm.trim() !== '') {
                cardTypesData = cardTypesData.filter(cardType =>
                    cardType.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    (cardType.description && cardType.description.toLowerCase().includes(searchTerm.toLowerCase()))
                );
            }

            // Sıralama
            if (sortConfig.key) {
                cardTypesData.sort((a, b) => {
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

            setFilteredData(cardTypesData);
            setTotalItems(cardTypesData.length);

            // Sayfalama
            const startIndex = (currentPage - 1) * itemsPerPage;
            const paginatedData = cardTypesData.slice(startIndex, startIndex + itemsPerPage);

            setCardTypes(paginatedData);
            setLoading(false);
        } catch (err) {
            console.error('Kart türleri yüklenirken hata oluştu:', err);
            setError('Kart türleri yüklenirken bir hata oluştu. Lütfen tekrar deneyin.');
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
            fetchCardTypes();
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

    const handleAddNewCardType = () => {
        // Boş form verisi ile modal'ı aç
        setEditFormData({
            name: '',
            description: ''
        });
        setSelectedCardType(null);
        setIsEditModalOpen(true);
    };

    // Düzenleme modalını açan handler
    const handleEditClick = (cardType) => {
        setSelectedCardType(cardType);
        setEditFormData({
            name: cardType.name || '',
            description: cardType.description || ''
        });
        setIsEditModalOpen(true);
    };

    // Modal kapatma handler'ı
    const handleCloseModal = () => {
        setIsEditModalOpen(false);
        setSelectedCardType(null);
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

    // Kart türü kaydetme/güncelleme handler'ı
    const handleSaveCardType = async () => {
        try {
            if (selectedCardType) {
                // Güncelleme
                await api.put(`/api/card-types/${selectedCardType.id}`, editFormData);
            } else {
                // Yeni ekleme
                await api.post('/api/card-types', editFormData);
            }
            
            // Modalı kapat
            handleCloseModal();
            
            // Verileri yeniden yükle
            fetchCardTypes();
        } catch (err) {
            console.error('Kart türü kaydedilirken hata oluştu:', err);
            alert('Kart türü kaydedilirken bir hata oluştu: ' + (err.response?.data || err.message));
        }
    };

    const handleDeleteClick = (cardType) => {
        setCardTypeToAction(cardType);
        setShowDeleteConfirm(true);
    };

    // Onay sonrası kart türünü silen handler
    const handleConfirmDelete = async () => {
        try {
            await api.delete(`/api/card-types/${cardTypeToAction.id}`);
            // Kart türünü listeden kaldır
            setCardTypes(prev => prev.filter(ct => ct.id !== cardTypeToAction.id));
            setShowDeleteConfirm(false);
            setCardTypeToAction(null);
            // Verileri yeniden yükle
            fetchCardTypes();
        } catch (err) {
            console.error('Kart türü silinirken hata oluştu:', err);
            alert('Kart türü silinirken bir hata oluştu: ' + (err.response?.data || err.message));
            // Hata durumunda da diyaloğu kapat
            setShowDeleteConfirm(false);
            setCardTypeToAction(null);
        }
    };

    // Yükleme durumu
    if (loading && cardTypes.length === 0) {
        return (
            <div className="cardtype-loading">
                <div className="spinner"></div>
                <p>Kart türleri yükleniyor...</p>
            </div>
        );
    }

    // Hata durumu
    if (error && cardTypes.length === 0) {
        return (
            <div className="cardtype-error">
                <AlertTriangle size={48} />
                <h2>Hata Oluştu</h2>
                <p>{error}</p>
                <button className="retry-button" onClick={fetchCardTypes}>
                    Yeniden Dene
                </button>
            </div>
        );
    }

    return (
        <Layout pageTitle="Kart Türü Yönetimi">
            {/* Ana içerik */}
            <div className="cardtype-tools">
                <div className="search-filter-wrapper">
                    <div className="search-filter">
                        <div className="search-tools">
                            <div className="search-box">
                                <Search size={18}/>
                                <input
                                    type="text"
                                    placeholder="Kart türü ara..."
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
                                fileName="Kart_Turleri"
                                columns={excelColumns}
                            />
                        </div>
                        
                        <div className="action-buttons">
                            <button className="add-button"
                                    onClick={handleAddNewCardType}>
                                <Plus size={16}/>
                                <span>Yeni Kart Türü</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Kart Türleri tablosu */}
            <div className="cardtype-table-container">
                <div className="table-wrapper">
                    <table className="cardtype-table">
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
                                Kart Türü Adı
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
                        {cardTypes.length > 0 ? (
                            cardTypes.map((cardType) => (
                                <tr key={cardType.id}>
                                    <td>{cardType.id || '-'}</td>
                                    <td>{cardType.name || '-'}</td>
                                    <td>{cardType.description || '-'}</td>
                                    <td>
                                        <div className="action-cell">
                                            <button
                                                className="action-button edit"
                                                onClick={() => handleEditClick(cardType)}
                                            >
                                                <Edit size={16}/>
                                            </button>
                                            <button className="action-button delete"
                                                    onClick={() => handleDeleteClick(cardType)}>
                                                <Trash2 size={16}/>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4" className="no-data">
                                    {loading ? 'Veriler yükleniyor...' : 'Kart türü bulunamadı'}
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
                                <h3>Kart Türü Silme</h3>
                            </div>
                            <div className="confirm-modal-body">
                                <p>
                                    <strong>{cardTypeToAction ? cardTypeToAction.name : ''}</strong> kart türünü silmek istediğinizden emin misiniz?
                                </p>
                                <p className="warning-text">Bu işlem geri alınamaz ve bu türe ait kartlar etkilenebilir.</p>
                            </div>
                            <div className="confirm-modal-footer">
                                <button
                                    className="cancel-button"
                                    onClick={() => {
                                        setShowDeleteConfirm(false);
                                        setCardTypeToAction(null);
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
                    <div className="confirm-modal cardtype-edit-modal">
                        <div className="confirm-modal-content">
                            <div className="confirm-modal-header">
                                <h3>{selectedCardType ? 'Kart Türü Düzenle' : 'Yeni Kart Türü Ekle'}</h3>
                                <button className="close-button" onClick={handleCloseModal}>
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="confirm-modal-body">
                                <div className="form-group">
                                    <label htmlFor="name">Kart Türü Adı:</label>
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
                                    onClick={handleSaveCardType}
                                >
                                    {selectedCardType ? 'Güncelle' : 'Kaydet'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default CardTypeManagement; 