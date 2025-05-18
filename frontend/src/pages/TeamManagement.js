import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import '../styles/TeamManagement.css';
import '../styles/FilterButtonsStandard.css';
import Layout from '../components/layout/Layout';
import {
    Search, Filter, Plus, Edit, Trash2, ChevronLeft, ChevronRight,
    AlertTriangle
} from 'lucide-react';
import EditTeamModal from '../components/EditTeamModal';
import ExportToExcel from '../components/ExportToExcel';

const TeamManagement = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [teams, setTeams] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [totalItems, setTotalItems] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'asc' });
    const [departments, setDepartments] = useState([]);
    const [selectedDepartment, setSelectedDepartment] = useState('');

    // Modal için state'ler
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedTeam, setSelectedTeam] = useState(null);

    // Silme onay modalı için state'ler
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [teamToAction, setTeamToAction] = useState(null);

    // Excel export için kolon tanımları
    const [excelColumns, setExcelColumns] = useState([
        { key: 'id', header: 'ID' },
        { key: 'name', header: 'Takım Adı' },
        { key: 'description', header: 'Açıklama' },
        { key: 'department.name', header: 'Departman' }
    ]);

    const [filteredData, setFilteredData] = useState([]);

    // Takımları çek
    useEffect(() => {
        fetchTeams();
        fetchDepartments();
    }, [currentPage, itemsPerPage, sortConfig, searchTerm, selectedDepartment]);

    const fetchTeams = async () => {
        try {
            setLoading(true);
            setError(null);

            // API endpoint'inden verileri çek
            const response = await api.get('/api/teams');
            let teamsData = response.data;

            // API çağrısı başarısız olursa örnek veri kullan
            if (!teamsData || teamsData.length === 0) {
                teamsData = [
                    {
                        "id": 1,
                        "name": "Siber Guvenlik Takımı",
                        "description": "Sirketin Siber Güvenlik İhtiyaçlarını Karşılar",
                        "department": {
                            "id": 1,
                            "name": "Bilgi ve İletişim Teknolojileri"
                        }
                    },
                    {
                        "id": 2,
                        "name": "Yapay Zeka Takımı",
                        "description": "Yeni Modeller Geliştirerek Şirketin Gelişimine Katkı Sağlarlar",
                        "department": {
                            "id": 2,
                            "name": "İnovasyon Departmanı"
                        }
                    }
                ];
            }

            // Arama filtresi
            if (searchTerm.trim() !== '') {
                teamsData = teamsData.filter(team =>
                    (team.name && team.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                    (team.description && team.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
                    (team.department && team.department.name && team.department.name.toLowerCase().includes(searchTerm.toLowerCase()))
                );
            }

            // Departman filtresi
            if (selectedDepartment) {
                teamsData = teamsData.filter(team => 
                    team.department && team.department.id.toString() === selectedDepartment.toString()
                );
            }

            // Sıralama
            if (sortConfig.key) {
                teamsData.sort((a, b) => {
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

            setFilteredData(teamsData);
            setTotalItems(teamsData.length);

            // Sayfalama
            const startIndex = (currentPage - 1) * itemsPerPage;
            const paginatedData = teamsData.slice(startIndex, startIndex + itemsPerPage);

            setTeams(paginatedData);
            setLoading(false);
        } catch (err) {
            console.error('Takımlar yüklenirken hata oluştu:', err);
            setError('Takımlar yüklenirken bir hata oluştu. Lütfen tekrar deneyin.');
            setLoading(false);
        }
    };

    const fetchDepartments = async () => {
        try {
            const response = await api.get('/api/departments');
            setDepartments(response.data || []);
        } catch (err) {
            console.error('Departmanlar yüklenirken hata oluştu:', err);
            setDepartments([]);
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

    // Departman filtresi değişikliğinde
    const handleDepartmentChange = (e) => {
        setSelectedDepartment(e.target.value);
        setCurrentPage(1); // Filtreleme sonrası ilk sayfaya dön
    };

    const resetFilters = () => {
        setSearchTerm('');
        setSelectedDepartment('');
        setCurrentPage(1);
        // Since we're using the useEffect dependency array to trigger fetches,
        // the data will automatically refresh when the state updates
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

    const handleAddNewTeam = () => {
        // Boş takım verisi ile modal'ı aç
        setSelectedTeam(null);
        setIsEditModalOpen(true);
    };

    // Düzenleme modalını açan handler
    const handleEditClick = (team) => {
        setSelectedTeam(team);
        setIsEditModalOpen(true);
    };

    // Modal kapatma handler'ı
    const handleCloseModal = () => {
        setIsEditModalOpen(false);
        setSelectedTeam(null);
    };

    // Takım güncellendiğinde çalışacak handler
    const handleTeamUpdate = async (updatedTeam) => {
        try {
            let response;
            const isNewTeam = !updatedTeam.id;
            
            if (updatedTeam.id) {
                // Mevcut takımı güncelle
                response = await api.put(`/api/teams/${updatedTeam.id}`, updatedTeam);
            } else {
                // Yeni takım ekle
                response = await api.post('/api/teams', updatedTeam);
            }
            
            // API'den dönen güncel veriyi kullan
            const savedTeam = response.data;
            
            // Takım listesini güncelle
            if (updatedTeam.id) {
                setTeams(prev =>
                    prev.map(t => t.id === savedTeam.id ? savedTeam : t)
                );
            }
            
            // Güncellemeden sonra modalı kapat
            handleCloseModal();
            // Verileri yeniden yükle
            fetchTeams();
        } catch (err) {
            console.error('Takım kaydedilirken hata oluştu:', err);
            // Hata durumunda modalı kapatma, kullanıcı düzenlemeye devam edebilir
        }
    };

    const handleDeleteClick = (team) => {
        setTeamToAction(team);
        setShowDeleteConfirm(true);
    };

    // Onay sonrası takımı silen handler
    const handleConfirmDelete = async () => {
        try {
            await api.delete(`/api/teams/${teamToAction.id}`);
            // Takımı listeden kaldır
            setTeams(prev => prev.filter(t => t.id !== teamToAction.id));
            setShowDeleteConfirm(false);
            setTeamToAction(null);
            // Verileri yeniden yükle
            fetchTeams();
        } catch (err) {
            console.error('Takım silinirken hata oluştu:', err);
            // Hata durumunda da diyaloğu kapat
            setShowDeleteConfirm(false);
            setTeamToAction(null);
        }
    };

    // Yükleme durumu
    if (loading && teams.length === 0) {
        return (
            <div className="team-loading">
                <div className="spinner"></div>
                <p>Takımlar yükleniyor...</p>
            </div>
        );
    }

    // Hata durumu
    if (error && teams.length === 0) {
        return (
            <div className="team-error">
                <AlertTriangle size={48} />
                <h2>Hata Oluştu</h2>
                <p>{error}</p>
                <button className="retry-button" onClick={fetchTeams}>
                    Yeniden Dene
                </button>
            </div>
        );
    }

    return (
        <Layout pageTitle="Takım Yönetimi">
            {/* Ana içerik */}
            <div className="team-tools">
                <div className="search-filter-wrapper">
                    <div className="search-filter">
                        <div className="search-tools">
                            <div className="search-box">
                                <Search size={18}/>
                                <input
                                    type="text"
                                    placeholder="Takım ara..."
                                    value={searchTerm}
                                    onChange={handleSearch}
                                />
                            </div>
                            <div className="filter-buttons">
                                <button className="filter-button">
                                    <Filter size={16}/>
                                    <span>Filtrele</span>
                                </button>
                                <select
                                    value={selectedDepartment}
                                    onChange={handleDepartmentChange}
                                    className="filter-select"
                                >
                                    <option value="">Tüm Departmanlar</option>
                                    {departments.map(dept => (
                                        <option key={dept.id} value={dept.id}>
                                            {dept.name}
                                        </option>
                                    ))}
                                </select>
                                <button className="filter-button" onClick={resetFilters}>
                                    <span>Filtreleri Temizle</span>
                                </button>
                            </div>
                        </div>
                        
                        <div className="export-button">
                            <ExportToExcel
                                data={filteredData.length > 0 ? filteredData : []}
                                fileName="Takımlar"
                                columns={excelColumns}
                            />
                        </div>
                        
                        <div className="action-buttons">
                            <button className="add-button"
                                    onClick={handleAddNewTeam}>
                                <Plus size={16}/>
                                <span>Yeni Takım</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Takımlar tablosu */}
            <div className="team-table-container">
                <div className="table-wrapper">
                    <table className="team-table">
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
                                Takım Adı
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
                            <th onClick={() => requestSort('department.name')}>
                                Departman
                                {sortConfig.key === 'department.name' && (
                                    <span className="sort-icon">
                                        {sortConfig.direction === 'asc' ? '↑' : '↓'}
                                    </span>
                                )}
                            </th>
                            <th>İşlemler</th>
                        </tr>
                        </thead>
                        <tbody>
                        {teams.length > 0 ? (
                            teams.map((team) => (
                                <tr key={team.id}>
                                    <td>{team.id || '-'}</td>
                                    <td>{team.name || '-'}</td>
                                    <td>{team.description || '-'}</td>
                                    <td>{team.department?.name || '-'}</td>
                                    <td>
                                        <div className="action-cell">
                                            <button
                                                className="action-button edit"
                                                onClick={() => handleEditClick(team)}
                                            >
                                                <Edit size={16}/>
                                            </button>
                                            <button className="action-button delete"
                                                    onClick={() => handleDeleteClick(team)}>
                                                <Trash2 size={16}/>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="no-data">
                                    {loading ? 'Veriler yükleniyor...' : 'Takım bulunamadı'}
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
                        <div className="confirm-modal-header">
                            <h3>Takım Silme</h3>
                        </div>
                        <div className="confirm-modal-content">
                            <div className="confirm-modal-body">
                                <p className="warning-text">
                                    <strong>{teamToAction?.name}</strong> takımını silmek istediğinizden emin misiniz?
                                </p>
                                <p>Bu işlem geri alınamaz.</p>
                            </div>
                            <div className="confirm-modal-footer">
                                <button className="cancel-button" onClick={() => setShowDeleteConfirm(false)}>
                                    İptal
                                </button>
                                <button className="confirm-button delete" onClick={handleConfirmDelete}>
                                    Sil
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Düzenleme modalı */}
            <EditTeamModal
                isOpen={isEditModalOpen}
                onClose={handleCloseModal}
                team={selectedTeam}
                onSave={handleTeamUpdate}
                departments={departments}
            />
        </Layout>
    );
};

export default TeamManagement; 