import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import '../styles/PermissionGroupManagement.css';
import '../styles/FilterButtonsStandard.css';
import Layout from '../components/layout/Layout';

import {
    Search, Plus, Edit, Trash2, ChevronLeft, ChevronRight,
    AlertTriangle, Filter, X, ChevronDown, List
} from 'lucide-react';
import EditPermissionGroupModal from '../components/EditPermissionGroupModal';
import ExportToExcel from '../components/ExportToExcel';

const PermissionGroupManagement = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [permissionGroups, setPermissionGroups] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [totalItems, setTotalItems] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'asc' });

    // Modal için state'ler
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedPermissionGroup, setSelectedPermissionGroup] = useState(null);

    // Silme onay modalı için state'ler
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [permissionGroupToAction, setPermissionGroupToAction] = useState(null);

    // Kapılar listesi (izinler için)
    const [doors, setDoors] = useState([]);

    // Excel export için kolon tanımları
    const [excelColumns, setExcelColumns] = useState([
        { key: 'id', header: 'ID' },
        { key: 'name', header: 'Yetki Grubu Adı' },
        { key: 'permissions.length', header: 'İzin Sayısı' }
    ]);

    const [filteredData, setFilteredData] = useState([]);

    // Kaç kapı gösterileceği
    const [doorsToShow, setDoorsToShow] = useState(3);
    
    // Detaylı kapı listesi modalı için state
    const [showDoorsModal, setShowDoorsModal] = useState(false);
    const [selectedDoors, setSelectedDoors] = useState([]);
    const [selectedGroupName, setSelectedGroupName] = useState('');
    const [doorSearchTerm, setDoorSearchTerm] = useState('');
    const [filteredDoors, setFilteredDoors] = useState([]);

    // Yetki gruplarını çek
    useEffect(() => {
        fetchPermissionGroups();
        fetchDoors();
    }, [currentPage, itemsPerPage, sortConfig]);

    const fetchPermissionGroups = async () => {
        try {
            setLoading(true);
            setError(null);

            // API endpoint'inden verileri çek
            const response = await api.get('/api/permission-groups');
            let permissionGroupsData = response.data;

            // Hata ayıklama için verileri konsola yazdır
            console.log("Yetki Grupları:", permissionGroupsData);

            // Arama filtresi (yetki grubu adına göre)
            if (searchTerm.trim() !== '') {
                permissionGroupsData = permissionGroupsData.filter(group =>
                    (group.name && group.name.toLowerCase().includes(searchTerm.toLowerCase()))
                );
            }

            // Sıralama
            if (sortConfig.key) {
                permissionGroupsData.sort((a, b) => {
                    // Nested property sorting (group.permissions.length gibi)
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

            setFilteredData(permissionGroupsData);
            setTotalItems(permissionGroupsData.length);

            // Sayfalama
            const startIndex = (currentPage - 1) * itemsPerPage;
            const paginatedData = permissionGroupsData.slice(startIndex, startIndex + itemsPerPage);

            setPermissionGroups(paginatedData);
            setLoading(false);
        } catch (err) {
            console.error('Yetki grupları yüklenirken hata oluştu:', err);
            setError('Yetki grupları yüklenirken bir hata oluştu. Lütfen tekrar deneyin.');
            setLoading(false);
        }
    };

    // Kapıları getir (izinler için)
    const fetchDoors = async () => {
        try {
            const response = await api.get('/api/doors');
            setDoors(response.data);
        } catch (err) {
            console.error('Kapılar yüklenirken hata oluştu:', err);
        }
    };

    // Nested property değeri alma fonksiyonu (örn: "permissions.length")
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
            fetchPermissionGroups();
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

    const handleAddNewPermissionGroup = () => {
        // Boş yetki grubu verisi ile modal'ı aç
        setSelectedPermissionGroup(null);
        setIsEditModalOpen(true);
    };

    // Düzenleme modalını açan handler
    const handleEditClick = (permissionGroup) => {
        setSelectedPermissionGroup(permissionGroup);
        setIsEditModalOpen(true);
    };

    // Modal kapatma handler'ı
    const handleCloseModal = () => {
        setIsEditModalOpen(false);
        setSelectedPermissionGroup(null);
    };

    // Yetki grubu güncellendiğinde çalışacak handler
    const handlePermissionGroupUpdate = (updatedPermissionGroup) => {
        // Yetki grubu listesini güncelle
        setPermissionGroups(prev =>
            prev.map(pg => pg.id === updatedPermissionGroup.id ? updatedPermissionGroup : pg)
        );
        // Güncellemeden sonra modalı kapat
        handleCloseModal();
        // Verileri yeniden yükle
        fetchPermissionGroups();
    };

    const handleDeleteClick = (permissionGroup) => {
        setPermissionGroupToAction(permissionGroup);
        setShowDeleteConfirm(true);
    };

    // Onay sonrası yetki grubunu silen handler
    const handleConfirmDelete = async () => {
        try {
            await api.delete(`/api/permission-groups/${permissionGroupToAction.id}`);
            // Yetki grubunu listeden kaldır
            setPermissionGroups(prev => prev.filter(pg => pg.id !== permissionGroupToAction.id));
            setShowDeleteConfirm(false);
            setPermissionGroupToAction(null);
            // Verileri yeniden yükle
            fetchPermissionGroups();
        } catch (err) {
            console.error('Yetki grubu silinirken hata oluştu:', err);
            // Hata durumunda da diyaloğu kapat
            setShowDeleteConfirm(false);
            setPermissionGroupToAction(null);
        }
    };

    // Kapı adlarını içeren formatlanmış izin listesi oluştur
    const formatPermissions = (permissions, groupName) => {
        if (!permissions || permissions.length === 0) return "-";

        // Kapı listesini oluştur
        const doorList = permissions.map(permission =>
            permission.door ? permission.door.name : "Bilinmeyen Kapı"
        );

        // Gösterilecek kapılar ve kalan sayı
        const visibleDoors = doorList.slice(0, doorsToShow);
        const remainingCount = doorList.length - doorsToShow;

        return (
            <div className="door-badges">
                {visibleDoors.map((doorName, index) => (
                    <span key={index} className="door-badge">{doorName}</span>
                ))}
                {remainingCount > 0 && (
                    <span 
                        className="door-badge more-doors"
                        onClick={() => handleShowAllDoors(doorList, groupName)}
                    >
                        +{remainingCount}
                    </span>
                )}
            </div>
        );
    };

    // Tüm kapıları gösteren modal için handler
    const handleShowAllDoors = (doorList, groupName) => {
        setSelectedDoors(doorList);
        setSelectedGroupName(groupName);
        setFilteredDoors(doorList);
        setDoorSearchTerm('');
        setShowDoorsModal(true);
    };

    // Kapı arama handler'ı
    const handleDoorSearch = (e) => {
        const searchValue = e.target.value;
        setDoorSearchTerm(searchValue);
        
        if (searchValue.trim() === '') {
            setFilteredDoors(selectedDoors);
        } else {
            const filtered = selectedDoors.filter(doorName => 
                doorName.toLowerCase().includes(searchValue.toLowerCase())
            );
            setFilteredDoors(filtered);
        }
    };

    // Modal kapatma handler'ı
    const handleCloseDoorsModal = () => {
        setShowDoorsModal(false);
        setSelectedDoors([]);
        setSelectedGroupName('');
        setDoorSearchTerm('');
        setFilteredDoors([]);
    };

    // Yükleme durumu
    if (loading && permissionGroups.length === 0) {
        return (
            <div className="permission-group-loading">
                <div className="spinner"></div>
                <p>Yetki grupları yükleniyor...</p>
            </div>
        );
    }

    // Hata durumu
    if (error && permissionGroups.length === 0) {
        return (
            <div className="permission-group-error">
                <AlertTriangle size={48} />
                <h2>Hata Oluştu</h2>
                <p>{error}</p>
                <button className="retry-button" onClick={fetchPermissionGroups}>
                    Yeniden Dene
                </button>
            </div>
        );
    }

    return (
        <Layout pageTitle="Yetki Grubu Yönetimi">
            {/* Ana içerik */}
            <div className="permission-group-tools">
                <div className="search-filter-wrapper">
                    <div className="search-filter">
                        <div className="search-tools">
                            <div className="search-box">
                                <Search size={18}/>
                                <input
                                    type="text"
                                    placeholder="Yetki grubu adı ara..."
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
                                fileName="YetkiGruplari"
                                columns={excelColumns}
                            />
                        </div>
                        
                        <div className="action-buttons">
                            <button className="add-button"
                                    onClick={handleAddNewPermissionGroup}>
                                <Plus size={16}/>
                                <span>Yeni Yetki Grubu</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Yetki grupları tablosu */}
            <div className="permission-group-table-container">
                <div className="table-wrapper">
                    <table className="permission-group-table">
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
                                Yetki Grubu Adı
                                {sortConfig.key === 'name' && (
                                    <span className="sort-icon">
                                        {sortConfig.direction === 'asc' ? '↑' : '↓'}
                                    </span>
                                )}
                            </th>
                            <th onClick={() => requestSort('permissions.length')}>
                                İzin Sayısı
                                {sortConfig.key === 'permissions.length' && (
                                    <span className="sort-icon">
                                        {sortConfig.direction === 'asc' ? '↑' : '↓'}
                                    </span>
                                )}
                            </th>
                            <th>İzinli Kapılar</th>
                            <th>İşlemler</th>
                        </tr>
                        </thead>
                        <tbody>
                        {permissionGroups.length > 0 ? (
                            permissionGroups.map((permissionGroup) => (
                                <tr key={permissionGroup.id}>
                                    <td>{permissionGroup.id || '-'}</td>
                                    <td>{permissionGroup.name || '-'}</td>
                                    <td>{permissionGroup.permissions?.length || 0}</td>
                                    <td>{formatPermissions(permissionGroup.permissions, permissionGroup.name)}</td>
                                    <td>
                                        <div className="action-cell">
                                            <button
                                                className="action-button edit"
                                                onClick={() => handleEditClick(permissionGroup)}
                                            >
                                                <Edit size={16}/>
                                            </button>
                                            <button className="action-button delete"
                                                    onClick={() => handleDeleteClick(permissionGroup)}>
                                                <Trash2 size={16}/>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="no-data">
                                    {loading ? 'Veriler yükleniyor...' : 'Yetki grubu bulunamadı'}
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
                                <h3>Yetki Grubu Silme</h3>
                            </div>
                            <div className="confirm-modal-body">
                                <p>
                                    <strong>{permissionGroupToAction ? `"${permissionGroupToAction.name}"` : 'Bu yetki grubunu'}</strong> silmek istediğinizden emin misiniz?
                                </p>
                                <p className="warning-text">Bu işlem geri alınamaz ve buna bağlı tüm izinler de silinecektir.</p>
                            </div>
                            <div className="confirm-modal-footer">
                                <button
                                    className="cancel-button"
                                    onClick={() => {
                                        setShowDeleteConfirm(false);
                                        setPermissionGroupToAction(null);
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

            {/* Yetki grubu düzenleme modalı */}
            <EditPermissionGroupModal
                isOpen={isEditModalOpen}
                onClose={handleCloseModal}
                permissionGroup={selectedPermissionGroup}
                onSave={handlePermissionGroupUpdate}
                doors={doors}
            />

            {/* Kapı listesi modalı */}
            {showDoorsModal && (
                <div className="confirm-modal-overlay">
                    <div className="confirm-modal door-list-modal">
                        <div className="confirm-modal-content">
                            <div className="confirm-modal-header">
                                <div className="modal-title">
                                    <List size={20} />
                                    <h3>"{selectedGroupName}" - İzinli Kapılar</h3>
                                </div>
                                <button className="close-button" onClick={handleCloseDoorsModal}>
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="confirm-modal-body door-list-body">
                                <div className="door-list">
                                    <div className="search-box">
                                        <Search size={18}/>
                                        <input
                                            type="text"
                                            placeholder="Kapı adı ara..."
                                            value={doorSearchTerm}
                                            onChange={handleDoorSearch}
                                        />
                                    </div>
                                    {filteredDoors.length > 0 ? (
                                        filteredDoors.map((doorName, index) => (
                                            <div key={index} className="door-list-item">
                                                <span className="door-name">{doorName}</span>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="no-doors-found">
                                            <p>"{doorSearchTerm}" ile eşleşen kapı bulunamadı.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="confirm-modal-footer">
                                <button
                                    className="close-button-secondary"
                                    onClick={handleCloseDoorsModal}
                                >
                                    Kapat
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default PermissionGroupManagement;