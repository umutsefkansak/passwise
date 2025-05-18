import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const Sidebar = ({ isOpen, toggleSidebar }) => {
    const [dropdownOpen, setDropdownOpen] = useState(null);
    const location = useLocation();

    const toggleDropdown = (id) => {
        if (dropdownOpen === id) {
            setDropdownOpen(null);
        } else {
            setDropdownOpen(id);
        }
    };

    // Active menu item kontrolü
    const isActive = (path) => {
        return location.pathname === path;
    };

    return (
        <div className={`app-sidebar ${isOpen ? 'open' : 'collapsed'}`}>
            <div className="sidebar-header">
                <h1 className="sidebar-logo">PassWise</h1>
                <button className="sidebar-toggle" onClick={toggleSidebar}>
                    <i className={`fas fa-${isOpen ? 'times' : 'bars'}`}></i>
                </button>
            </div>

            <div className="sidebar-content">
                <ul className="sidebar-menu">
                    <li className={`menu-item ${isActive('/dashboard') ? 'active' : ''}`}>
                        <a href="/dashboard" className="menu-link">
                            <i className="fas fa-chart-line"></i>
                            <span className="menu-text">Dashboard</span>
                        </a>
                    </li>

                    {/* Personel Yönetimi */}
                    <li className={`menu-item ${location.pathname.includes('/personnel') || location.pathname.includes('/person-types') ? 'active' : ''}`}>
                        <a href="#" className="menu-link" onClick={() => toggleDropdown('personnel')}>
                            <i className="fas fa-users"></i>
                            <span className="menu-text">Personel Yönetimi</span>
                            <ChevronDown className={`dropdown-icon ${dropdownOpen === 'personnel' ? 'rotated' : ''}`} size={16} />
                        </a>
                        {dropdownOpen === 'personnel' && (
                            <ul className="submenu">
                                <li className={`submenu-item ${isActive('/personnel') ? 'active' : ''}`}>
                                    <a href="/personnel" className="submenu-link">
                                        <span className="submenu-text">Personeller</span>
                                    </a>
                                </li>
                                <li className={`submenu-item ${isActive('/permission-groups-management') ? 'active' : ''}`}>
                                    <a href="/permission-groups-management" className="submenu-link">
                                        <span className="submenu-text">Personel Yetki Grupları</span>
                                    </a>
                                </li>
                                {/* Personel Türü Tanımlamaları */}
                                <li className={`submenu-item ${isActive('/person-types-management') ? 'active' : ''}`}>
                                    <a href="/person-types-management" className="submenu-link">
                                        <span className="submenu-text">Personel Türü Tanımlamaları</span>
                                    </a>
                                </li>
                            </ul>
                        )}
                    </li>

                    {/* Diğer menü öğeleri */}
                    <li className={`menu-item ${location.pathname.includes('/blacklist') ? 'active' : ''}`}>
                        <a href="#" className="menu-link" onClick={() => toggleDropdown('blacklist')}>
                            <i className="fas fa-ban"></i>
                            <span className="menu-text">Kara Liste Yönetimi</span>
                            <ChevronDown className={`dropdown-icon ${dropdownOpen === 'blacklist' ? 'rotated' : ''}`} size={16} />
                        </a>
                        {dropdownOpen === 'blacklist' && (
                            <ul className="submenu">
                                <li className={`submenu-item ${isActive('/cardmanagement') ? 'active' : ''}`}>
                                    <a href="/cardmanagement" className="submenu-link">
                                        <span className="submenu-text">Kara Listedeki Kartlar</span>
                                    </a>
                                </li>
                                <li className={`submenu-item ${isActive('/personnelblacklistmanagement') ? 'active' : ''}`}>
                                    <a href="/personnelblacklistmanagement" className="submenu-link">
                                        <span className="submenu-text">Kara Listedeki Personeller</span>
                                    </a>
                                </li>
                                <li className={`submenu-item ${isActive('/card-blacklist-reasons') ? 'active' : ''}`}>
                                    <a href="/card-blacklist-reasons" className="submenu-link">
                                        <span className="submenu-text">Kara Liste Kart Sebepleri</span>
                                    </a>
                                </li>
                                <li className={`submenu-item ${isActive('/personnel-blacklist-reasons') ? 'active' : ''}`}>
                                    <a href="/personnel-blacklist-reasons" className="submenu-link">
                                        <span className="submenu-text">Kara Liste Kişi Sebepleri</span>
                                    </a>
                                </li>
                            </ul>
                        )}
                    </li>

                    {/* Kart Yönetimi */}
                    <li className={`menu-item ${location.pathname.includes('/card-') ? 'active' : ''}`}>
                        <a href="#" className="menu-link" onClick={() => toggleDropdown('cards')}>
                            <i className="fas fa-id-card"></i>
                            <span className="menu-text">Kart Yönetimi</span>
                            <ChevronDown className={`dropdown-icon ${dropdownOpen === 'cards' ? 'rotated' : ''}`} size={16} />
                        </a>
                        {dropdownOpen === 'cards' && (
                            <ul className="submenu">
                                {/* Kart Tanımlamaları */}
                                <li className={`submenu-item ${isActive('/card-management') ? 'active' : ''}`}>
                                    <a href="/card-management" className="submenu-link">
                                        <span className="submenu-text">Kart Tanımlamaları</span>
                                    </a>
                                </li>
                                
                                {/* Kart Türü Tanımlamaları */}
                                <li className={`submenu-item ${isActive('/card-types-management') ? 'active' : ''}`}>
                                    <a href="/card-types-management" className="submenu-link">
                                        <span className="submenu-text">Kart Türü Tanımlamaları</span>
                                    </a>
                                </li>
                            </ul>
                        )}
                    </li>

                    <li className={`menu-item ${location.pathname.includes('/reports') ? 'active' : ''}`}>
                        <a href="#" className="menu-link" onClick={() => toggleDropdown('reports')}>
                            <i className="fas fa-chart-bar"></i>
                            <span className="menu-text">Raporlar</span>
                            <ChevronDown className={`dropdown-icon ${dropdownOpen === 'reports' ? 'rotated' : ''}`}
                                         size={16}/>
                        </a>
                        {dropdownOpen === 'reports' && (
                            <ul className="submenu">
                                <li className={`submenu-item ${isActive('/accessloghistory') ? 'active' : ''}`}>
                                    <a href="/accessloghistory" className="submenu-link">
                                        <span className="submenu-text">Okuyucu Raporları</span>
                                    </a>
                                </li>
                            </ul>
                        )}
                    </li>

                    {/* Kapı Yönetimi */}
                    <li className={`menu-item ${location.pathname.includes('/door') ? 'active' : ''}`}>
                        <a href="#" className="menu-link" onClick={() => toggleDropdown('doors')}>
                            <i className="fas fa-door-open"></i>
                            <span className="menu-text">Kapı Yönetimi</span>
                            <ChevronDown className={`dropdown-icon ${dropdownOpen === 'doors' ? 'rotated' : ''}`} size={16} />
                        </a>
                        {dropdownOpen === 'doors' && (
                            <ul className="submenu">
                                {/* Kapı Tanımlamaları */}
                                <li className={`submenu-item ${isActive('/doors-management') ? 'active' : ''}`}>
                                    <a href="/doors-management" className="submenu-link">
                                        <span className="submenu-text">Kapı Tanımlamaları</span>
                                    </a>
                                </li>

                                {/* Kapı Türleri Tanımlamaları */}
                                <li className={`submenu-item ${isActive('/door-types-management') ? 'active' : ''}`}>
                                    <a href="/door-types-management" className="submenu-link">
                                        <span className="submenu-text">Kapı Türleri Tanımlamaları</span>
                                    </a>
                                </li>

                                {/* Kapı Yönleri Tanımlamaları */}
                                <li className={`submenu-item ${isActive('/door-directions-management') ? 'active' : ''}`}>
                                    <a href="/door-directions-management" className="submenu-link">
                                        <span className="submenu-text">Kapı Yönleri Tanımlamaları</span>
                                    </a>
                                </li>
                            </ul>
                        )}
                    </li>

                    {/* Departman Yönetimi */}
                    <li className={`menu-item ${location.pathname.includes('/department') || location.pathname.includes('/teams') ? 'active' : ''}`}>
                        <a href="#" className="menu-link" onClick={() => toggleDropdown('departments')}>
                            <i className="fas fa-building"></i>
                            <span className="menu-text">Departman Yönetimi</span>
                            <ChevronDown className={`dropdown-icon ${dropdownOpen === 'departments' ? 'rotated' : ''}`} size={16} />
                        </a>
                        {dropdownOpen === 'departments' && (
                            <ul className="submenu">
                                {/* Departman Tanımlamaları */}
                                <li className={`submenu-item ${isActive('/departments-management') ? 'active' : ''}`}>
                                    <a href="/departments-management" className="submenu-link">
                                        <span className="submenu-text">Departman Tanımlamaları</span>
                                    </a>
                                </li>

                                {/* Takım Tanımlamaları */}
                                <li className={`submenu-item ${isActive('/teams-management') ? 'active' : ''}`}>
                                    <a href="/teams-management" className="submenu-link">
                                        <span className="submenu-text">Takım Tanımlamaları</span>
                                    </a>
                                </li>
                            </ul>
                        )}
                    </li>
                </ul>
            </div>
        </div>
    );
};

export default Sidebar;