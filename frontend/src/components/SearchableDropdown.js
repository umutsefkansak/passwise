import React, { useState, useEffect, useRef } from 'react';
import { Search, ChevronDown, X } from 'lucide-react';
import '../styles/SearchableDropdown.css';

// Aramalı Açılır Menü Komponenti
const SearchableDropdown = ({
                                id,
                                name,
                                label,
                                options,
                                value,
                                onChange,
                                labelField = 'name',
                                valueField = 'id',
                                required = false,
                                placeholder = "Seçiniz"
                            }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredOptions, setFilteredOptions] = useState([]);
    const dropdownRef = useRef(null);

    // Seçilen öğenin etiketi
    const selectedLabel = value
        ? options.find(option => option && option[valueField] && option[valueField].toString() === value.toString())?.[labelField]
        : '';

    // Seçenekleri filtrele
    useEffect(() => {
        if (options && options.length > 0) {
            if (searchTerm.trim() === '') {
                setFilteredOptions(options);
            } else {
                const filtered = options.filter(option =>
                    option && option[labelField] &&
                    option[labelField].toString().toLowerCase().includes(searchTerm.toLowerCase())
                );
                setFilteredOptions(filtered);
            }
        } else {
            setFilteredOptions([]);
        }
    }, [searchTerm, options, labelField]);

    // Dışarı tıklama için event listener
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Dropdown'ı aç/kapat
    const toggleDropdown = () => {
        setIsOpen(!isOpen);
        if (!isOpen) {
            setSearchTerm('');
        }
    };

    // Seçim değiştiğinde
    const handleOptionSelect = (option) => {
        onChange({
            target: {
                name: name,
                value: option ? option[valueField].toString() : ''
            }
        });
        setIsOpen(false);
        setSearchTerm('');
    };

    // Seçimi temizle
    const clearSelection = (e) => {
        e.stopPropagation();
        onChange({
            target: {
                name: name,
                value: ''
            }
        });
    };

    return (
        <div className="searchable-dropdown-container" ref={dropdownRef}>
            <label htmlFor={id} className="dropdown-label">
                {label}
                {required && <span className="required-mark">*</span>}
            </label>

            <div
                className={`dropdown-control ${isOpen ? 'open' : ''}`}
                onClick={toggleDropdown}
            >
                <div className="selected-value">
                    {selectedLabel || <span className="placeholder">{placeholder}</span>}
                </div>

                {value && (
                    <button type="button" className="clear-button" onClick={clearSelection}>
                        <X size={16} />
                    </button>
                )}

                <div className="dropdown-indicators">
                    <ChevronDown size={18} className={`dropdown-arrow ${isOpen ? 'up' : ''}`} />
                </div>
            </div>

            {isOpen && (
                <div className="dropdown-menu">
                    <div className="search-container">
                        <Search size={16} className="search-icon" />
                        <input
                            type="text"
                            className="dropdown-search"
                            placeholder="Ara..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            autoFocus
                        />
                    </div>

                    <div className="dropdown-options">
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map((option) => (
                                <div
                                    key={option[valueField]}
                                    className={`dropdown-option ${value && option[valueField].toString() === value.toString() ? 'selected' : ''}`}
                                    onClick={() => handleOptionSelect(option)}
                                >
                                    {option[labelField]}
                                </div>
                            ))
                        ) : (
                            <div className="no-options">Sonuç bulunamadı</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SearchableDropdown;