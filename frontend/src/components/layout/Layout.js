// src/components/layout/Layout.js
import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import '../../styles/Layout.css';

const Layout = ({ children, pageTitle }) => {
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    return (
        <div className={`app-container ${sidebarOpen ? '' : 'sidebar-collapsed'}`}>
            <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
            <div className="app-main">
                <Header toggleSidebar={toggleSidebar} pageTitle={pageTitle} />
                <main className="app-content">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default Layout;