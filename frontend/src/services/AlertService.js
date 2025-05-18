import api from './api';

const AlertService = {
    // Tüm alarmları getir
    getAllAlerts: async () => {
        try {
            const response = await api.get('/api/alerts');
            console.log('Alınan alarmlar:', response.data);
            // Tarihe göre sırala (en yeni en üstte)
            const sortedAlerts = [...response.data].sort((a, b) => {
                const dateA = new Date(a.createdAt);
                const dateB = new Date(b.createdAt);
                return dateB - dateA; // Yeniden eskiye sıralama
            });
            return sortedAlerts;
        } catch (error) {
            console.error('Alarmlar alınamadı:', error);
            throw error;
        }
    },

    // Çözülmemiş alarmları getir
    getUnresolvedAlerts: async () => {
        try {
            const response = await api.get('/api/alerts');
            // En son oluşan çözülmemiş alarmları getir
            const unresolvedAlerts = response.data
                .filter(alert => !alert.resolved)
                .sort((a, b) => {
                    const dateA = new Date(a.createdAt);
                    const dateB = new Date(b.createdAt);
                    return dateB - dateA; // Yeniden eskiye sıralama
                });
            return unresolvedAlerts;
        } catch (error) {
            console.error('Çözülmemiş alarmlar alınamadı:', error);
            throw error;
        }
    },

    // Tek bir alarmı getir
    getAlertById: async (id) => {
        try {
            const response = await api.get(`/api/alerts/${id}`);
            return response.data;
        } catch (error) {
            console.error(`ID=${id} alarmı alınamadı:`, error);
            throw error;
        }
    },

    // Alarmı çözüldü olarak işaretle
    markAsResolved: async (id, adminId) => {
        try {
            // Admin bilgilerini al
            const username = localStorage.getItem('username') || 'Admin';
            
            // Önce mevcut veriyi al
            const response = await api.get(`/api/alerts/${id}`);
            const currentAlert = response.data;
            
            console.log('İşaretlenecek Alert:', currentAlert);
            
            // Güncellenmiş veriyi hazırla - Backend'de bu alanlar kullanılıyor
            const updatedData = {
                id: currentAlert.id,
                personnel: currentAlert.personnel,
                door: currentAlert.door,
                alertType: currentAlert.alertType,
                alertMessage: currentAlert.alertMessage,
                resolved: true,  // Backend'deki alan ismi
                resolvedByAdmin: {
                    id: adminId || 1,
                    username: username
                },
                resolvedAt: new Date().toISOString(),
                createdAt: currentAlert.createdAt
            };
            
            console.log('Güncellenmiş Alert veri:', updatedData);
            
            // PUT isteği gönder
            const updateResponse = await api.put(`/api/alerts/${id}`, updatedData);
            return updateResponse.data;
        } catch (error) {
            console.error(`ID=${id} alarmı çözüldü olarak işaretlenemedi:`, error);
            throw error;
        }
    }
};

export default AlertService; 