// import api from './api';
//
// const DashboardService = {
//     // Dashboard istatistiklerini getir
//     getStatistics: async () => {
//         try {
//             const response = await api.get('/api/dashboard/statistics');
//             return response.data;
//         } catch (error) {
//             console.error('İstatistik verileri alınamadı:', error);
//             throw error;
//         }
//     },
//
//     // Geçiş trend verilerini getir
//     getAccessTrend: async () => {
//         try {
//             const response = await api.get('/api/dashboard/access-trend');
//             return response.data;
//         } catch (error) {
//             console.error('Geçiş trend verileri alınamadı:', error);
//             throw error;
//         }
//     },
//
//     // Kapı kullanım verilerini getir
//     getDoorUsage: async () => {
//         try {
//             const response = await api.get('/api/dashboard/door-usage');
//             return response.data;
//         } catch (error) {
//             console.error('Kapı kullanım verileri alınamadı:', error);
//             throw error;
//         }
//     },
//
//     // Geçiş dağılım verilerini getir
//     getAccessDistribution: async () => {
//         try {
//             const response = await api.get('/api/dashboard/access-distribution');
//             return response.data;
//         } catch (error) {
//             console.error('Geçiş dağılım verileri alınamadı:', error);
//             throw error;
//         }
//     },
//
//     // Son erişim kayıtlarını getir
//     getRecentAccessLogs: async () => {
//         try {
//             const response = await api.get('/api/access-logs');
//             return response.data;
//         } catch (error) {
//             console.error('Erişim kayıtları alınamadı:', error);
//             throw error;
//         }
//     }
// };
//
// export default DashboardService;
import api from './api';

const DashboardService = {
    // Dashboard istatistiklerini getir
    getStatistics: async () => {
        try {
            const response = await api.get('/api/dashboard/statistics');
            return response.data;
        } catch (error) {
            console.error('İstatistik verileri alınamadı:', error);
            throw error;
        }
    },

    // Geçiş trend verilerini getir (period parametresi ekledik)
    getAccessTrend: async (period = 7) => {
        try {
            const response = await api.get(`/api/dashboard/access-trend?period=${period}`);
            return response.data;
        } catch (error) {
            console.error('Geçiş trend verileri alınamadı:', error);
            throw error;
        }
    },

    // Kapı kullanım verilerini getir
    getDoorUsage: async () => {
        try {
            const response = await api.get('/api/dashboard/door-usage');
            return response.data;
        } catch (error) {
            console.error('Kapı kullanım verileri alınamadı:', error);
            throw error;
        }
    },

    // Geçiş dağılım verilerini getir
    getAccessDistribution: async () => {
        try {
            const response = await api.get('/api/dashboard/access-distribution');
            return response.data;
        } catch (error) {
            console.error('Geçiş dağılım verileri alınamadı:', error);
            throw error;
        }
    },

    // Son erişim kayıtlarını getir
    getRecentAccessLogs: async () => {
        try {
            // /api/access-logs endpoint'ine istek at - bu AccessLogHistory'nin kullandığı aynı endpoint
            // Query parametreleri kullanarak son 5 kaydı talep et
            const response = await api.get('/api/access-logs');
            
            // API'den gelen verileri tarih sırasına göre sırala (en yeni önce)
            const sortedLogs = [...response.data].sort((a, b) => {
                return new Date(b.accessTimestamp) - new Date(a.accessTimestamp);
            });
            
            // Sadece ilk 5 kaydı döndür
            return sortedLogs.slice(0, 5);
        } catch (error) {
            console.error('Erişim kayıtları alınamadı:', error);
            throw error;
        }
    }
};

export default DashboardService;