import React, { useState, useEffect, useRef } from 'react';
import { Filter, ChevronDown, X, Calendar, Search } from 'lucide-react';
import '../styles/PersonnelFilters.css';
import api from '../services/api';
import SearchableDropdown from './SearchableDropdown';

const PersonnelFilters = ({ onFilterChange }) => {
    // Filtreleme state'leri
    const [isOpen, setIsOpen] = useState(false);
    const [filters, setFilters] = useState({
        name: '',
        surname: '',
        tcNum: '',
        departmentId: '',
        titleId: '',
        personTypeId: '',
        status: '',
        startDate: '',
        endDate: ''
    });

    // API'den alınacak referans verileri
    const [departments, setDepartments] = useState([]);
    const [titles, setTitles] = useState([]);
    const [personTypes, setPersonTypes] = useState([]);
    const [loading, setLoading] = useState(false);

    // Durum için sabit değerler
    const statusOptions = [
        { id: '', name: 'Tümü' },
        { id: 'true', name: 'Aktif' },
        { id: 'false', name: 'Pasif' }
    ];

    // Filtreleme paneli referansı
    const filterPanelRef = useRef(null);

    // Referans verilerini yükle
    useEffect(() => {
        fetchReferenceData();
    }, []);

    // Panel dışına tıklandığında filtreleme panelini kapat
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (filterPanelRef.current && !filterPanelRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Departman, Unvan ve Personel Türü verilerini çek
    const fetchReferenceData = async () => {
        try {
            setLoading(true);
            const [departmentsResponse, titlesResponse, personTypesResponse] = await Promise.all([
                api.get('/api/departments'),
                api.get('/api/titles'),
                api.get('/api/person-types')
            ]);

            setDepartments(departmentsResponse.data || []);
            setTitles(titlesResponse.data || []);
            setPersonTypes(personTypesResponse.data || []);
            setLoading(false);
        } catch (error) {
            console.error('Referans verileri yüklenirken hata oluştu:', error);
            setLoading(false);
        }
    };

    // Filtre değişikliklerini kontrol et
    const handleFilterChange = (field, value) => {
        const newFilters = { ...filters, [field]: value };
        setFilters(newFilters);
    };

    // Dropdown değişimlerini ele al
    const handleDropdownChange = (e) => {
        const { name, value } = e.target;
        // Hata ayıklama için değişiklikleri gösterelim
        console.log(`Dropdown değişimi: ${name} = ${value}`);
        handleFilterChange(name, value);
    };

    // Filtreleri uygula
    const applyFilters = () => {
        // Hata ayıklama
        console.log("Uygulanan filtreler:", filters);
        onFilterChange(filters);
        setIsOpen(false);
    };

    // Filtreleri temizle
    const clearFilters = () => {
        const emptyFilters = {
            name: '',
            surname: '',
            tcNum: '',
            departmentId: '',
            titleId: '',
            personTypeId: '',
            status: '',
            startDate: '',
            endDate: ''
        };
        setFilters(emptyFilters);
        onFilterChange(emptyFilters);
    };

    // Filtrelerin herhangi birinde değer var mı kontrol et
    const hasActiveFilters = () => {
        return Object.values(filters).some(value => value !== '');
    };

    return (
        <div className="personnel-advanced-filters">
            <button
                className={`filter-button ${isOpen ? 'active' : ''} ${hasActiveFilters() ? 'has-filters' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
            >
                <Filter size={16} />
                <span>Detaylı Filtrele</span>
                {hasActiveFilters() && <span className="filter-badge"></span>}
                <ChevronDown size={16} className={`chevron ${isOpen ? 'open' : ''}`} />
            </button>

            {isOpen && (
                <div className="filter-panel" ref={filterPanelRef}>
                    <div className="filter-panel-header">
                        <h3>Detaylı Filtreleme</h3>
                        <button className="close-button" onClick={() => setIsOpen(false)}>
                            <X size={18} />
                        </button>
                    </div>

                    <div className="filter-panel-content">
                        <div className="filter-section">
                            <h4>Kişisel Bilgiler</h4>
                            <div className="filter-row">
                                <div className="filter-field">
                                    <label>Ad</label>
                                    <div className="input-with-icon">
                                        <Search size={16} />
                                        <input
                                            type="text"
                                            placeholder="İsim ara..."
                                            value={filters.name}
                                            onChange={e => handleFilterChange('name', e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="filter-field">
                                    <label>Soyad</label>
                                    <div className="input-with-icon">
                                        <Search size={16} />
                                        <input
                                            type="text"
                                            placeholder="Soyisim ara..."
                                            value={filters.surname}
                                            onChange={e => handleFilterChange('surname', e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="filter-row">
                                <div className="filter-field">
                                    <label>TC Kimlik No</label>
                                    <div className="input-with-icon">
                                        <Search size={16} />
                                        <input
                                            type="text"
                                            placeholder="TC No ara..."
                                            value={filters.tcNum}
                                            onChange={e => handleFilterChange('tcNum', e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="filter-field">
                                    <label>Durum</label>
                                    <SearchableDropdown
                                        id="status"
                                        name="status"
                                        options={statusOptions}
                                        value={filters.status}
                                        onChange={handleDropdownChange}
                                        labelField="name"
                                        valueField="id"
                                        placeholder="Seçiniz"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="filter-section">
                            <h4>İş Bilgileri</h4>
                            <div className="filter-row">
                                <div className="filter-field">
                                    <label>Personel Türü</label>
                                    <SearchableDropdown
                                        id="personTypeId"
                                        name="personTypeId"
                                        options={personTypes}
                                        value={filters.personTypeId}
                                        onChange={handleDropdownChange}
                                        labelField="name"
                                        valueField="id"
                                        placeholder="Seçiniz"
                                    />
                                </div>
                                <div className="filter-field">
                                    <label>Departman</label>
                                    <SearchableDropdown
                                        id="departmentId"
                                        name="departmentId"
                                        options={departments}
                                        value={filters.departmentId}
                                        onChange={handleDropdownChange}
                                        labelField="name"
                                        valueField="id"
                                        placeholder="Seçiniz"
                                    />
                                </div>
                            </div>
                            <div className="filter-row">
                                <div className="filter-field">
                                    <label>Unvan</label>
                                    <SearchableDropdown
                                        id="titleId"
                                        name="titleId"
                                        options={titles}
                                        value={filters.titleId}
                                        onChange={handleDropdownChange}
                                        labelField="name"
                                        valueField="id"
                                        placeholder="Seçiniz"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="filter-section">
                            <h4>İşe Başlama Tarih Aralığı</h4>
                            <div className="filter-row">
                                <div className="filter-field">
                                    <label>Başlangıç Tarihi</label>
                                    <div className="input-with-icon">
                                        <Calendar size={16} />
                                        <input
                                            type="date"
                                            value={filters.startDate}
                                            onChange={e => handleFilterChange('startDate', e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="filter-field">
                                    <label>Bitiş Tarihi</label>
                                    <div className="input-with-icon">
                                        <Calendar size={16} />
                                        <input
                                            type="date"
                                            value={filters.endDate}
                                            onChange={e => handleFilterChange('endDate', e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="filter-panel-footer">
                        <button className="clear-button" onClick={clearFilters}>
                            Temizle
                        </button>
                        <button className="apply-button" onClick={applyFilters}>
                            Uygula
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PersonnelFilters; 