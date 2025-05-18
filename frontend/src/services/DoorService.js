import api from './api';

const DoorService = {
    // Tüm kapı bilgilerini getir
    getAllDoors: async () => {
        try {
            const response = await api.get('/api/doors');
            return response.data;
        } catch (error) {
            console.error('Kapı bilgileri alınamadı:', error);
            throw error;
        }
    },

    // Kapı tiplerini getir
    getAllDoorTypes: async () => {
        try {
            const response = await api.get('/api/door-types');
            return response.data;
        } catch (error) {
            console.error('Kapı tipleri alınamadı:', error);
            throw error;
        }
    },

    // Erişim yönlerini getir
    getAccessDirections: async () => {
        try {
            const response = await api.get('/api/access-directions');
            return response.data;
        } catch (error) {
            console.error('Erişim yönleri alınamadı:', error);
            throw error;
        }
    }
};

export default DoorService; 