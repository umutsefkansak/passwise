import React, { useState, useEffect } from 'react';
import { Clock, ChevronDown, User, LogOut, UserPlus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import AlertCenter from '../alerts/AlertCenter';
import AuthLogCenter from '../auth-logs/AuthLogCenter';
import '../../styles/Header.css';

const CurrentTime = () => {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => {
            setTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    return (
        <span className="current-time">
            {time.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </span>
    );
};

const Header = ({ toggleSidebar, pageTitle }) => {
    const { user, logout } = useAuth();
    const [dropdownOpen, setDropdownOpen] = useState(null);

    const toggleDropdown = (id) => {
        if (dropdownOpen === id) {
            setDropdownOpen(null);
        } else {
            setDropdownOpen(id);
        }
    };
    
    const handleLogout = () => {
        logout();
    };

    return (
        <header className="app-header">
            <div className="header-left">
                <button className="menu-toggle" onClick={toggleSidebar}>
                    <i className="fas fa-bars"></i>
                </button>
                <h2>{pageTitle}</h2>
            </div>

            <div className="header-right">
                <div className="header-clock">
                    <Clock size={16} />
                    <CurrentTime />
                </div>

                {/* Bildirim Merkezleri - direkt yan yana */}
                <div className="header-notifications">
                    <AuthLogCenter />
                    <AlertCenter />
                </div>

                <div className="header-user">
                    <div className="user-info" onClick={() => toggleDropdown('user')}>
                        <span className="user-name">{user?.username || 'Admin'}</span>
                        <div className="user-icon">
                            <User size={18} />
                        </div>
                        <ChevronDown size={16} />
                    </div>

                    {dropdownOpen === 'user' && (
                        <div className="user-dropdown">
                            <div className="user-dropdown-header">
                                <div className="user-dropdown-avatar">
                                    <User size={32} />
                                </div>
                                <div className="user-dropdown-info">
                                    <h4>{user?.username || 'Admin'}</h4>
                                </div>
                            </div>
                            <div className="user-dropdown-menu">
                                <Link to="/profile" className="user-dropdown-item" onClick={() => setDropdownOpen(null)}>
                                    <User size={16} />
                                    <span>Profilim</span>
                                </Link>
                                <Link to="/admin-management" className="user-dropdown-item" onClick={() => setDropdownOpen(null)}>
                                    <UserPlus size={16} />
                                    <span>Admin Yönetimi</span>
                                </Link>
                                <div className="dropdown-divider"></div>
                                <button className="user-dropdown-item logout-button" onClick={handleLogout}>
                                    <LogOut size={16} />
                                    <span>Çıkış Yap</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;