import api from './api';

const AuthLogService = {
    // Tüm yetki loglarını getir
    getAllAuthLogs: async () => {
        try {
            const response = await api.get('/api/auth-logs');
            console.log('Alınan yetki logları:', response.data);
            
            // Tarihe göre sırala (en yeni en üstte)
            const sortedLogs = [...response.data].sort((a, b) => {
                const dateA = new Date(a.authDate);
                const dateB = new Date(b.authDate);
                return dateB - dateA; // Yeniden eskiye sıralama
            });
            
            return sortedLogs;
        } catch (error) {
            console.error('Yetki logları alınamadı:', error);
            throw error;
        }
    },

    // En son yetki loglarını getir
    getRecentAuthLogs: async (limit = 10) => {
        try {
            const response = await api.get(`/api/auth-logs/recent?limit=${limit}`);
            return response.data;
        } catch (error) {
            console.error('Son yetki logları alınamadı:', error);
            throw error;
        }
    },

    // Tek bir yetki logunu getir
    getAuthLogById: async (id) => {
        try {
            const response = await api.get(`/api/auth-logs/${id}`);
            return response.data;
        } catch (error) {
            console.error(`ID=${id} yetki logu alınamadı:`, error);
            throw error;
        }
    },
    
    // Yetki loglarını gruplandır
    groupAuthLogsByBatch: (authLogs) => {
        if (!authLogs || authLogs.length === 0) return [];
        
        console.log('Gruplandırma için gelen loglar:', authLogs.length);
        
        // Aynı personele, aynı admin tarafından ve benzer zamanda verilen yetkileri gruplandır
        const groupedLogs = [];
        const timeThreshold = 5000; // 5 saniye içinde verilen yetkiler aynı grup sayılacak
        
        // Tarih sıralaması (en yeni en üstte)
        const sortedLogs = [...authLogs].sort((a, b) => {
            const dateA = new Date(a.authDate);
            const dateB = new Date(b.authDate);
            return dateB - dateA;
        });
        
        // Gruplanmamış logları saklamak için
        const processedLogIds = new Set();
        
        // Her log için gruplanabilecek diğer logları bul
        sortedLogs.forEach(log => {
            // Zaten işlenmiş logu atla
            if (processedLogIds.has(log.id)) return;
            
            const logDate = new Date(log.authDate).getTime();
            const personnelId = log.personnel?.id;
            const adminId = log.admin?.id;
            
            // Bu log ile aynı gruba girecek logları bul - actionType kontrolünü kaldırdık
            const relatedLogs = sortedLogs.filter(otherLog => {
                // Kendisi veya zaten işlenmiş log ise atla
                if (otherLog.id === log.id || processedLogIds.has(otherLog.id)) return false;
                
                const otherLogDate = new Date(otherLog.authDate).getTime();
                const samePersonnel = otherLog.personnel?.id === personnelId;
                const sameAdmin = otherLog.admin?.id === adminId;
                const withinTimeThreshold = Math.abs(logDate - otherLogDate) < timeThreshold;
                
                // ActionType kontrolünü kaldırarak aynı kişiye farklı türde yetkiler de gruplanabilir
                return samePersonnel && sameAdmin && withinTimeThreshold;
            });
            
            if (relatedLogs.length > 0) {
                // Bir grup oluştur
                const allRelatedLogs = [log, ...relatedLogs];
                const doors = allRelatedLogs
                    .map(l => l.door)
                    .filter(Boolean);
                
                const permissionGroups = allRelatedLogs
                    .map(l => l.permissionGroup)
                    .filter(Boolean);
                
                const group = {
                    id: `group-${log.id}`,
                    mainLog: log,
                    relatedLogs: relatedLogs,
                    doorCount: doors.length, // Gerçek kapı sayısı
                    authDate: log.authDate,
                    admin: log.admin,
                    personnel: log.personnel,
                    actionType: log.actionType,
                    doors: doors,
                    permissionGroups: permissionGroups,
                    isGroup: true
                };
                
                groupedLogs.push(group);
                
                // İşlenen tüm logları işaretler
                processedLogIds.add(log.id);
                relatedLogs.forEach(rl => processedLogIds.add(rl.id));
            } else {
                // Gruplanmayan logu doğrudan ekle
                groupedLogs.push({
                    ...log,
                    isGroup: false,
                    doorCount: log.door ? 1 : 0, // Kapı varsa 1, yoksa 0
                    doors: log.door ? [log.door] : [],
                    permissionGroups: log.permissionGroup ? [log.permissionGroup] : []
                });
                processedLogIds.add(log.id);
            }
        });
        
        console.log('Gruplandırma sonrası loglar:', groupedLogs.length);
        return groupedLogs;
    }
};

export default AuthLogService; 