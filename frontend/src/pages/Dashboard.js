import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Dashboard.css';
import {
    BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { 
    Clock, Bell, ChevronDown, Activity, Users, UserCheck, AlertTriangle, Lock,
    CheckCircle, XCircle, Info, ArrowUpRight, ArrowDownLeft, ExternalLink
} from 'lucide-react';
import DashboardService from '../services/DashboardService';
import Layout from '../components/layout/Layout';
import PersonnelImage from '../components/PersonnelImage';

const Dashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [statistics, setStatistics] = useState({
        dailyAccessCount: 0,
        activeVisitorsCount: 0,
        activePersonnelCount: 0,
        unauthorizedAttempts: 0
    });
    const [recentAccess, setRecentAccess] = useState([]);
    const [accessTrend, setAccessTrend] = useState([]);
    const [doorUsage, setDoorUsage] = useState([]);
    const [accessDistribution, setAccessDistribution] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [trendPeriod, setTrendPeriod] = useState('week'); // Trend için seçilen periyod

    useEffect(() => {
        // Tüm dashboard verilerini getir
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                setError(null);

                // Periyod değerine göre gün sayısını belirle
                const periodDays = trendPeriod === 'week' ? 7 : 30;

                // Her API çağrısını ayrı ayrı yap ve hata durumlarını ele al
                try {
                    const statsData = await DashboardService.getStatistics();
                    // API'den geçerli veri döndüyse state'i güncelle
                    if (statsData) {
                        setStatistics(statsData);
                    }
                } catch (e) {
                    console.error('İstatistik verileri alınamadı:', e);
                    // Hata durumunda varsayılan değerleri kullan
                }

                try {
                    const accessTrendData = await DashboardService.getAccessTrend(periodDays);
                    // Dizi kontrolü yap
                    if (Array.isArray(accessTrendData)) {
                        setAccessTrend(accessTrendData);
                    } else {
                        setAccessTrend([]);
                    }
                } catch (e) {
                    console.error('Geçiş trend verileri alınamadı:', e);
                    setAccessTrend([]);
                }

                try {
                    const doorUsageData = await DashboardService.getDoorUsage();
                    // Dizi kontrolü yap
                    if (Array.isArray(doorUsageData)) {
                        setDoorUsage(doorUsageData);
                    } else {
                        setDoorUsage([]);
                    }
                } catch (e) {
                    console.error('Kapı kullanım verileri alınamadı:', e);
                    setDoorUsage([]);
                }

                try {
                    const distributionData = await DashboardService.getAccessDistribution();
                    // Dizi kontrolü yap
                    if (Array.isArray(distributionData)) {
                        setAccessDistribution(distributionData);
                    } else {
                        setAccessDistribution([]);
                    }
                } catch (e) {
                    console.error('Geçiş dağılım verileri alınamadı:', e);
                    setAccessDistribution([]);
                }

                try {
                    const recentAccessData = await DashboardService.getRecentAccessLogs();
                    // Dizi kontrolü yap
                    if (Array.isArray(recentAccessData)) {
                        setRecentAccess(recentAccessData);
                    } else {
                        setRecentAccess([]);
                    }
                } catch (e) {
                    console.error('Erişim kayıtları alınamadı:', e);
                    setRecentAccess([]);
                }

                setLoading(false);
            } catch (mainError) {
                console.error('Dashboard veri yükleme hatası:', mainError);
                setError('Veriler yüklenirken bir hata oluştu.');
                setLoading(false);

                // Hata durumunda güvenli boş değerler ata
                setStatistics({
                    dailyAccessCount: 0,
                    activeVisitorsCount: 0,
                    activePersonnelCount: 0,
                    unauthorizedAttempts: 0
                });
                setAccessTrend([]);
                setDoorUsage([]);
                setAccessDistribution([]);
                setRecentAccess([]);
            }
        };

        // Timestamp'i formatla (Unix timestamp'i saat:dakika:saniye formatına çevir)
        const formatTimestamp = (timestamp) => {
            if (!timestamp) return '';
            const date = new Date(timestamp);
            return date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        };

        // Mock veri
        const setMockData = () => {
            setStatistics({
                dailyAccessCount: 247,
                activeVisitorsCount: 12,
                activePersonnelCount: 83,
                unauthorizedAttempts: 3
            });

            setRecentAccess([
                { id: 1, personnelName: 'Ahmet Yılmaz', doorName: 'Ana Giriş', timestamp: '10:45:22', result: 'Başarılı' },
                { id: 2, personnelName: 'Ayşe Kaya', doorName: 'A Blok', timestamp: '10:43:15', result: 'Başarılı' },
                { id: 3, personnelName: 'Ziyaretçi: Mehmet Demir', doorName: 'Ziyaretçi Girişi', timestamp: '10:40:05', result: 'Başarılı' },
                { id: 4, personnelName: 'Tanınmayan Kart', doorName: 'Arka Giriş', timestamp: '10:35:44', result: 'Reddedildi' },
                { id: 5, personnelName: 'Zeynep Aydın', doorName: 'B Blok', timestamp: '10:30:21', result: 'Başarılı' }
            ]);

            setAccessTrend([
                { name: 'Pzt', personel: 145, ziyaretci: 35 },
                { name: 'Sal', personel: 132, ziyaretci: 42 },
                { name: 'Çar', personel: 151, ziyaretci: 29 },
                { name: 'Per', personel: 149, ziyaretci: 38 },
                { name: 'Cum', personel: 136, ziyaretci: 44 },
                { name: 'Cmt', personel: 35, ziyaretci: 10 },
                { name: 'Paz', personel: 20, ziyaretci: 5 }
            ]);

            setDoorUsage([
                { name: 'Ana Giriş', value: 120 },
                { name: 'A Blok', value: 85 },
                { name: 'B Blok', value: 70 },
                { name: 'Yemekhane', value: 95 }
            ]);

            setAccessDistribution([
                { name: 'Personel', value: 80 },
                { name: 'Ziyaretçi', value: 20 }
            ]);
        };

        fetchDashboardData();

        // Otomatik yenileme için zamanlayıcı
        const intervalId = setInterval(() => {
            fetchDashboardData();
        }, 60000); // Her dakika güncelle

        return () => clearInterval(intervalId);
    }, [trendPeriod]); // trendPeriod değiştiğinde useEffect tetiklenecek

    // Periyod değiştiğinde tetiklenecek fonksiyon
    const handlePeriodChange = (e) => {
        setTrendPeriod(e.target.value);
    };

    // Renk paleti
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];
    const COLORS_PIE = ['#4CAF50', '#FF9800'];

    // Eğer yüklüyorsa yükleme ekranı göster
    if (loading) {
        return (
            <div className="dashboard-loading">
                <div className="spinner"></div>
                <p>Yükleniyor...</p>
            </div>
        );
    }

    // Hata durumunda hata mesajı göster
    if (error) {
        return (
            <div className="dashboard-error">
                <AlertTriangle size={48} />
                <h2>Hata Oluştu</h2>
                <p>{error}</p>
                <button className="retry-button" onClick={() => window.location.reload()}>
                    Yeniden Dene
                </button>
            </div>
        );
    }

    // Erişim sonucuna göre ikon ve renk belirle
    const getAccessResultIcon = (result) => {
        if (!result) return <AlertTriangle size={20} color="#f39c12" />;

        if (result.name === 'ONAYLANDI') {
            return <CheckCircle size={20} color="#2ecc71" />;
        } else {
            return <XCircle size={20} color="#e74c3c" />;
        }
    };

    // Erişim yönüne göre ikon belirle
    const getAccessDirectionIcon = (direction) => {
        if (!direction) return null;

        if (direction.name === 'Giris') {
            return (
                <div className="direction-badge entry">
                    <ArrowUpRight size={14} />
                    <span>Giriş</span>
                </div>
            );
        } else if (direction.name === 'Cikis') {
            return (
                <div className="direction-badge exit">
                    <ArrowDownLeft size={14} />
                    <span>Çıkış</span>
                </div>
            );
        } else {
            return <span>{direction.name}</span>;
        }
    };

    // Tarih formatla (tam tarih ve saat)
    const formatDateTime = (timestamp) => {
        if (!timestamp) return '-';
        const date = new Date(timestamp);

        // Tarih ve saat formatı
        const dateString = date.toLocaleDateString('tr-TR'); // Gün-Ay-Yıl
        const timeString = date.toLocaleTimeString('tr-TR', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        }); // Saat:Dakika:Saniye

        return `${dateString} ${timeString}`; // Tarih ve saati birleştir
    };

    return (
        <Layout pageTitle="Kontrol Paneli">
            {/* İstatistik kartları */}
            <div className="stats-cards">
                <div className="stat-card">
                    <div className="stat-icon">
                        <Activity size={24} />
                    </div>
                    <div className="stat-info">
                        <h3 className="stat-title">Günlük Geçiş</h3>
                        <p className="stat-value">{statistics.dailyAccessCount}</p>
                    </div>
                    <div className="stat-trend positive">
                        <span>↑ 8%</span>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon visitors">
                        <Users size={24} />
                    </div>
                    <div className="stat-info">
                        <h3 className="stat-title">Aktif Ziyaretçi</h3>
                        <p className="stat-value">{statistics.activeVisitorsCount}</p>
                    </div>
                    <div className="stat-trend positive">
                        <span>↑ 12%</span>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon personnel">
                        <UserCheck size={24} />
                    </div>
                    <div className="stat-info">
                        <h3 className="stat-title">Aktif Personel</h3>
                        <p className="stat-value">{statistics.activePersonnelCount}</p>
                    </div>
                    <div className="stat-trend negative">
                        <span>↓ 3%</span>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon unauthorized">
                        <AlertTriangle size={24} />
                    </div>
                    <div className="stat-info">
                        <h3 className="stat-title">Yetkisiz Giriş</h3>
                        <p className="stat-value">{statistics.unauthorizedAttempts}</p>
                    </div>
                    <div className="stat-trend neutral">
                        <span>%0</span>
                    </div>
                </div>
            </div>

            {/* Grafikler */}
            <div className="chart-container">
                <div className="chart-card">
                    <div className="chart-header">
                        <h3>Haftalık Geçiş Trendi</h3>
                        <div className="chart-actions">
                            <select
                                value={trendPeriod}
                                onChange={handlePeriodChange}
                            >
                                <option value="week">Son 7 Gün</option>
                                <option value="month">Son 30 Gün</option>
                            </select>
                        </div>
                    </div>

                    <div className="chart-body">
                        <ResponsiveContainer width="100%" height={250}>
                            <LineChart
                                data={accessTrend}
                                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line
                                    type="monotone"
                                    dataKey="personel"
                                    stroke="#4CAF50"
                                    strokeWidth={2}
                                    activeDot={{ r: 8 }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="ziyaretci"
                                    stroke="#FF9800"
                                    strokeWidth={2}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="charts-row">
                    <div className="chart-card half">
                        <div className="chart-header">
                            <h3>Kapı Kullanım Oranları</h3>
                        </div>

                        <div className="chart-body">
                            <ResponsiveContainer width="100%" height={250}>
                                <BarChart
                                    data={doorUsage}
                                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="value" fill="#3498db">
                                        {Array.isArray(doorUsage) && doorUsage.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="chart-card half">
                        <div className="chart-header">
                            <h3>Geçiş Dağılımı</h3>
                        </div>

                        <div className="chart-body pie-chart">
                            <ResponsiveContainer width="100%" height={250}>
                                <PieChart>
                                    <Pie
                                        data={accessDistribution}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                    >
                                        {Array.isArray(accessDistribution) && accessDistribution.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS_PIE[index % COLORS_PIE.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>

            {/* Son aktiviteler tablosu */}
            <div className="dashboard-card latest-activity">
                <div className="card-header">
                    <h3>Son Aktiviteler</h3>
                    <Link to="/accessloghistory" className="see-all-link">
                        <span>Tümünü Gör</span>
                        <ExternalLink size={16} />
                    </Link>
                </div>
                <div className="card-content">
                    <div className="access-log-table-container">
                        {loading ? (
                            <div className="loading-container">
                                <div className="spinner-small"></div>
                                <p>Erişim kayıtları yükleniyor...</p>
                            </div>
                        ) : (
                            <table className="access-log-table">
                                <thead>
                                    <tr>
                                        <th>Personel</th>
                                        <th>Kart No</th>
                                        <th>Kapı</th>
                                        <th>Yön</th>
                                        <th>Tarih/Saat</th>
                                        <th>Sonuç</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentAccess && Array.isArray(recentAccess) && recentAccess.length > 0 ? (
                                        recentAccess.map((log, index) => (
                                            <tr key={index} className={log.accessResult?.name === 'REDDEDILDI' ? 'rejected-row' : ''}>
                                                <td className="personnel-cell">
                                                    {log.personnel ? (
                                                        <div className="personnel-info">
                                                            <PersonnelImage
                                                                personId={log.personnel.id}
                                                                photoFileName={log.personnel.photoFileName}
                                                                name={log.personnel.name}
                                                                surname={log.personnel.surname}
                                                                isPreviewable={false}
                                                            />
                                                            <div className="personnel-name">
                                                                <span>{log.personnel.name} {log.personnel.surname}</span>
                                                                <small>{log.personnel.department?.name || ''}</small>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        '-'
                                                    )}
                                                </td>
                                                <td>{log.card?.cardNumber || '-'}</td>
                                                <td>{log.door?.name || '-'}</td>
                                                <td className="direction-cell">
                                                    {getAccessDirectionIcon(log.door?.accessDirection)}
                                                </td>
                                                <td className="date-cell">
                                                    <div className="date-info">
                                                        <span className="date-value">{formatDateTime(log.accessTimestamp)}</span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="result-cell">
                                                        {getAccessResultIcon(log.accessResult)}
                                                        <span className={`result-text ${log.accessResult?.name === 'ONAYLANDI' ? 'approved' : 'rejected'}`}>
                                                            {log.accessResult?.name || '-'}
                                                        </span>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="6" className="no-data">
                                                Erişim kaydı bulunamadı
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Dashboard;