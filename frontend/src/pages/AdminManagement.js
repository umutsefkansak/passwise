import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import '../styles/AdminManagement.css';
import '../styles/FilterButtonsStandard.css';
import Layout from '../components/layout/Layout';
import { Search, Plus, AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react';

const AdminManagement = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [admins, setAdmins] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [totalItems, setTotalItems] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'asc' });
    
    // New admin form
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newAdmin, setNewAdmin] = useState({
        name: '',
        surname: '',
        username: '',
        password: ''
    });
    const [confirmPassword, setConfirmPassword] = useState('');
    const [formError, setFormError] = useState(null);
    const [formSuccess, setFormSuccess] = useState(null);

    // Fetch admins when needed
    useEffect(() => {
        fetchAdmins();
    }, [currentPage, itemsPerPage, sortConfig, searchTerm]);

    const fetchAdmins = async () => {
        try {
            setLoading(true);
            setError(null);

            // API endpoint'inden verileri çek
            const response = await api.get('/api/admins');
            let adminsData = response.data;

            // Arama filtresi
            if (searchTerm.trim() !== '') {
                adminsData = adminsData.filter(admin =>
                    (admin.name && admin.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                    (admin.surname && admin.surname.toLowerCase().includes(searchTerm.toLowerCase())) ||
                    (admin.username && admin.username.toLowerCase().includes(searchTerm.toLowerCase()))
                );
            }

            // Sıralama
            if (sortConfig.key) {
                adminsData.sort((a, b) => {
                    const aValue = a[sortConfig.key] || '';
                    const bValue = b[sortConfig.key] || '';

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

            setTotalItems(adminsData.length);

            // Sayfalama
            const startIndex = (currentPage - 1) * itemsPerPage;
            const paginatedData = adminsData.slice(startIndex, startIndex + itemsPerPage);

            setAdmins(paginatedData);
            setLoading(false);
        } catch (err) {
            console.error('Adminler yüklenirken hata oluştu:', err);
            setError('Adminler yüklenirken bir hata oluştu. Lütfen tekrar deneyin.');
            setLoading(false);
        }
    };

    // Arama değişikliğinde
    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1); // Aramada ilk sayfaya dön
    };

    // Sıralama işlemi
    const requestSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    // Sayfalama işlemleri
    const nextPage = () => {
        if (currentPage < Math.ceil(totalItems / itemsPerPage)) {
            setCurrentPage(currentPage + 1);
        }
    };

    const prevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const handleItemsPerPageChange = (e) => {
        setItemsPerPage(parseInt(e.target.value));
        setCurrentPage(1); // Sayfa başına öğe sayısı değiştiğinde ilk sayfaya dön
    };

    // Yeni admin ekleme
    const handleAddAdmin = () => {
        setIsAddModalOpen(true);
        setFormError(null);
        setFormSuccess(null);
        setNewAdmin({
            name: '',
            surname: '',
            username: '',
            password: ''
        });
        setConfirmPassword('');
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewAdmin(prev => ({
            ...prev,
            [name]: value
        }));
        // Form hatasını temizle
        setFormError(null);
        setFormSuccess(null);
    };

    const handleConfirmPasswordChange = (e) => {
        setConfirmPassword(e.target.value);
        setFormError(null);
    };

    const handleCloseModal = () => {
        setIsAddModalOpen(false);
    };

    const handleSubmitAdmin = async (e) => {
        e.preventDefault();
        setFormError(null);
        setFormSuccess(null);

        // Form validasyonu
        if (!newAdmin.name || !newAdmin.surname || !newAdmin.username || !newAdmin.password) {
            setFormError('Tüm alanları doldurunuz.');
            return;
        }

        if (newAdmin.password.length < 6) {
            setFormError('Şifre en az 6 karakter olmalıdır.');
            return;
        }

        if (newAdmin.password !== confirmPassword) {
            setFormError('Şifreler eşleşmiyor.');
            return;
        }

        try {
            // AuthenticationController'daki signup endpoint'ini kullan
            const response = await api.post('/auth/signup', newAdmin);
            
            // Listeyi yenile
            fetchAdmins();
            
            // Modal'ı kapat ve başarı mesajını göster
            setFormSuccess('Admin başarıyla eklendi.');
            setTimeout(() => {
                setIsAddModalOpen(false);
                setFormSuccess(null);
            }, 2000);
        } catch (err) {
            console.error('Admin eklenirken hata:', err);
            setFormError(err.response?.data || 'Admin eklenirken bir hata oluştu.');
        }
    };

    if (loading) {
        return (
            <Layout pageTitle="Admin Yönetimi">
                <div className="admin-management-loading">
                    <div className="spinner"></div>
                    <p>Adminler yükleniyor...</p>
                </div>
            </Layout>
        );
    }

    if (error) {
        return (
            <Layout pageTitle="Admin Yönetimi">
                <div className="admin-management-error">
                    <AlertTriangle size={48} />
                    <h2>Hata Oluştu</h2>
                    <p>{error}</p>
                </div>
            </Layout>
        );
    }

    return (
        <Layout pageTitle="Admin Yönetimi">
            <div className="admin-management-container">
                <div className="admin-management-header">
                    <h1>Admin Yönetimi</h1>
                    <div className="admin-management-actions">
                        <div className="search-bar">
                            <Search size={18} />
                            <input
                                type="text"
                                placeholder="Admin ara..."
                                value={searchTerm}
                                onChange={handleSearch}
                            />
                        </div>
                        <button className="add-button" onClick={handleAddAdmin}>
                            <Plus size={16} />
                            Yeni Admin Ekle
                        </button>
                    </div>
                </div>

                <div className="admin-management-content">
                    <div className="admin-table-container">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th onClick={() => requestSort('id')}>
                                        ID
                                        {sortConfig.key === 'id' && (
                                            <span className={`sort-indicator ${sortConfig.direction}`}></span>
                                        )}
                                    </th>
                                    <th onClick={() => requestSort('name')}>
                                        Ad
                                        {sortConfig.key === 'name' && (
                                            <span className={`sort-indicator ${sortConfig.direction}`}></span>
                                        )}
                                    </th>
                                    <th onClick={() => requestSort('surname')}>
                                        Soyad
                                        {sortConfig.key === 'surname' && (
                                            <span className={`sort-indicator ${sortConfig.direction}`}></span>
                                        )}
                                    </th>
                                    <th onClick={() => requestSort('username')}>
                                        Kullanıcı Adı
                                        {sortConfig.key === 'username' && (
                                            <span className={`sort-indicator ${sortConfig.direction}`}></span>
                                        )}
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {admins.length > 0 ? (
                                    admins.map(admin => (
                                        <tr key={admin.id}>
                                            <td>{admin.id}</td>
                                            <td>{admin.name}</td>
                                            <td>{admin.surname}</td>
                                            <td>{admin.username}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="no-data">
                                            Kayıtlı admin bulunamadı veya arama sonucu boş.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="pagination-controls">
                        <div className="page-info">
                            Toplam {totalItems} admin, Sayfa {currentPage} / {Math.ceil(totalItems / itemsPerPage)}
                        </div>
                        <div className="page-controls">
                            <button
                                className="pagination-button"
                                onClick={prevPage}
                                disabled={currentPage === 1}
                            >
                                <ChevronLeft size={18} />
                            </button>
                            <select
                                value={itemsPerPage}
                                onChange={handleItemsPerPageChange}
                                className="items-per-page"
                            >
                                <option value="5">5</option>
                                <option value="10">10</option>
                                <option value="20">20</option>
                                <option value="50">50</option>
                            </select>
                            <button
                                className="pagination-button"
                                onClick={nextPage}
                                disabled={currentPage >= Math.ceil(totalItems / itemsPerPage)}
                            >
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Admin Ekleme Modal */}
            {isAddModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>Yeni Admin Ekle</h2>
                            <button className="close-button" onClick={handleCloseModal}>×</button>
                        </div>
                        <form onSubmit={handleSubmitAdmin} className="admin-form">
                            <div className="form-group">
                                <label htmlFor="name">Ad</label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={newAdmin.name}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="surname">Soyad</label>
                                <input
                                    type="text"
                                    id="surname"
                                    name="surname"
                                    value={newAdmin.surname}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="username">Kullanıcı Adı</label>
                                <input
                                    type="text"
                                    id="username"
                                    name="username"
                                    value={newAdmin.username}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="password">Şifre</label>
                                <input
                                    type="password"
                                    id="password"
                                    name="password"
                                    value={newAdmin.password}
                                    onChange={handleInputChange}
                                    required
                                />
                                <small>En az 6 karakter olmalıdır.</small>
                            </div>
                            <div className="form-group">
                                <label htmlFor="confirmPassword">Şifre Tekrar</label>
                                <input
                                    type="password"
                                    id="confirmPassword"
                                    value={confirmPassword}
                                    onChange={handleConfirmPasswordChange}
                                    required
                                />
                            </div>
                            
                            {formError && (
                                <div className="form-error">
                                    <AlertTriangle size={16} />
                                    {formError}
                                </div>
                            )}
                            
                            {formSuccess && (
                                <div className="form-success">
                                    {formSuccess}
                                </div>
                            )}
                            
                            <div className="form-actions">
                                <button type="button" className="cancel-button" onClick={handleCloseModal}>İptal</button>
                                <button type="submit" className="submit-button">Kaydet</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default AdminManagement; 