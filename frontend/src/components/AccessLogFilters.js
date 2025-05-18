import React, { useState, useEffect, useRef } from 'react';
import { Filter, ChevronDown, X, Calendar, Search } from 'lucide-react';
import '../styles/AccessLogFilters.css';
import SearchableDropdown from './SearchableDropdown';
import DoorService from '../services/DoorService';

const AccessLogFilters = ({ onFilterChange }) => {
    // Filtreleme state'leri
    const [isOpen, setIsOpen] = useState(false);
    const [filters, setFilters] = useState({
        personnelName: '',
        personnelSurname: '',
        tcNum: '',
        cardNumber: '',
        doorName: '',
        doorLocation: '',
        accessDirection: '',
        doorType: '',
        accessMethod: '',
        accessResult: '',
        startDate: '',
        endDate: ''
    });

    // API'den çekilecek veriler için state'ler
    const [doors, setDoors] = useState([]);
    const [doorTypes, setDoorTypes] = useState([]);
    const [accessDirections, setAccessDirections] = useState([
        { id: '', name: 'Tümü' },
        { id: 'Giris', name: 'Giriş' },
        { id: 'Cikis', name: 'Çıkış' }
    ]);
    const [accessResults, setAccessResults] = useState([
        { id: '', name: 'Tümü' },
        { id: 'ONAYLANDI', name: 'Onaylandı' },
        { id: 'REDDEDILDI', name: 'Reddedildi' }
    ]);

    // Verileri yükleme durumu
    const [loading, setLoading] = useState(false);

    // Filtreleme paneli referansı
    const filterPanelRef = useRef(null);

    // Component mount olduğunda verileri çek
    useEffect(() => {
        fetchData();
    }, []);

    // Kapı ve kapı tipi verilerini API'den çek
    const fetchData = async () => {
        setLoading(true);
        try {
            // Door Service kullanarak verileri getir
            const doorData = await DoorService.getAllDoors();
            const doorTypeData = await DoorService.getAllDoorTypes();
            
            // Kapıları dropdown için formatla
            const formattedDoors = [
                { id: '', name: 'Tümü' },
                ...doorData.map(door => ({ id: door.name, name: door.name }))
            ];
            
            // Kapı tiplerini dropdown için formatla
            const formattedDoorTypes = [
                { id: '', name: 'Tümü' },
                ...doorTypeData.map(type => ({ id: type.name, name: type.name }))
            ];
            
            setDoors(formattedDoors);
            setDoorTypes(formattedDoorTypes);
        } catch (error) {
            console.error('Veri yüklenirken hata oluştu:', error);
        } finally {
            setLoading(false);
        }
    };

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

    // Filtre değişikliklerini kontrol et
    const handleFilterChange = (field, value) => {
        const newFilters = { ...filters, [field]: value };
        setFilters(newFilters);
    };

    // SearchableDropdown için değişim işleyicisi
    const handleDropdownChange = (e) => {
        const { name, value } = e.target;
        handleFilterChange(name, value);
    };

    // Filtreleri uygula
    const applyFilters = () => {
        onFilterChange(filters);
        setIsOpen(false);
    };

    // Filtreleri temizle
    const clearFilters = () => {
        const emptyFilters = {
            personnelName: '',
            personnelSurname: '',
            tcNum: '',
            cardNumber: '',
            doorName: '',
            doorLocation: '',
            accessDirection: '',
            doorType: '',
            accessMethod: '',
            accessResult: '',
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
        <div className="access-log-advanced-filters">
            <button
                className={`detailed-filter-button ${isOpen ? 'active' : ''} ${hasActiveFilters() ? 'has-filters' : ''}`}
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
                            <h4>Personel Bilgileri</h4>
                            <div className="filter-row">
                                <div className="filter-field">
                                    <label>Ad</label>
                                    <div className="input-with-icon">
                                        <Search size={16} />
                                        <input
                                            type="text"
                                            placeholder="İsim ara..."
                                            value={filters.personnelName}
                                            onChange={e => handleFilterChange('personnelName', e.target.value)}
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
                                            value={filters.personnelSurname}
                                            onChange={e => handleFilterChange('personnelSurname', e.target.value)}
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
                                    <label>Kart Numarası</label>
                                    <div className="input-with-icon">
                                        <Search size={16} />
                                        <input
                                            type="text"
                                            placeholder="Kart no ara..."
                                            value={filters.cardNumber}
                                            onChange={e => handleFilterChange('cardNumber', e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="filter-section">
                            <h4>Kapı Bilgileri</h4>
                            <div className="filter-row">
                                <div className="filter-field">
                                    <SearchableDropdown
                                        id="doorName"
                                        name="doorName"
                                        label="Kapı Adı"
                                        options={doors}
                                        value={filters.doorName}
                                        onChange={handleDropdownChange}
                                        placeholder="Kapı seçiniz"
                                    />
                                </div>
                                <div className="filter-field">
                                    <label>Konum</label>
                                    <div className="input-with-icon">
                                        <Search size={16} />
                                        <input
                                            type="text"
                                            placeholder="Konum ara..."
                                            value={filters.doorLocation}
                                            onChange={e => handleFilterChange('doorLocation', e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="filter-row">
                                <div className="filter-field">
                                    <SearchableDropdown
                                        id="doorType"
                                        name="doorType"
                                        label="Kapı Türü"
                                        options={doorTypes}
                                        value={filters.doorType}
                                        onChange={handleDropdownChange}
                                        placeholder="Kapı türü seçiniz"
                                    />
                                </div>
                                <div className="filter-field">
                                    <SearchableDropdown
                                        id="accessDirection"
                                        name="accessDirection"
                                        label="Yön"
                                        options={accessDirections}
                                        value={filters.accessDirection}
                                        onChange={handleDropdownChange}
                                        placeholder="Yön seçiniz"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="filter-section">
                            <h4>Erişim Bilgileri</h4>
                            <div className="filter-row">
                                <div className="filter-field">
                                    <label>Erişim Yöntemi</label>
                                    <div className="input-with-icon">
                                        <Search size={16} />
                                        <input
                                            type="text"
                                            placeholder="Erişim yöntemi ara..."
                                            value={filters.accessMethod}
                                            onChange={e => handleFilterChange('accessMethod', e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="filter-field">
                                    <SearchableDropdown
                                        id="accessResult"
                                        name="accessResult"
                                        label="Erişim Sonucu"
                                        options={accessResults}
                                        value={filters.accessResult}
                                        onChange={handleDropdownChange}
                                        placeholder="Sonuç seçiniz"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="filter-section">
                            <h4>Tarih Aralığı</h4>
                            <div className="filter-row">
                                <div className="filter-field">
                                    <label>Başlangıç Tarihi</label>
                                    <div className="input-with-icon">
                                        <Calendar size={16} />
                                        <input
                                            type="datetime-local"
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
                                            type="datetime-local"
                                            value={filters.endDate}
                                            onChange={e => handleFilterChange('endDate', e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="filter-panel-footer">
                        <button className="clear-button" onClick={clearFilters}>Filtreleri Temizle</button>
                        <button className="apply-button" onClick={applyFilters}>Uygula</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AccessLogFilters;