import React, { useState, useEffect } from 'react';
import { ImageIcon } from 'lucide-react';
import api from '../services/api'; // api servisinizi import edin

/**
 * Personel fotoğrafını görüntüleyen bileşen
 * @param {number} personId - Personel ID'si
 * @param {string} photoFileName - Fotoğraf dosya adı (null ise profil fotoğrafı yok demektir)
 * @param {string} name - Personel adı (avatar için ilk harfi kullanılır)
 * @param {string} surname - Personel soyadı (avatar için ilk harfi kullanılır)
 * @param {boolean} isPreviewable - Tıklandığında büyük görüntüleme açılsın mı?
 * @param {function} onPreviewClick - Önizleme moduna tıklandığında çalışacak fonksiyon
 */
const PersonnelImage = ({ personId, photoFileName, name, surname, isPreviewable = true, onPreviewClick }) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [imageUrl, setImageUrl] = useState('');

    useEffect(() => {
        // Fotoğraf yoksa yüklemeye çalışma
        if (!photoFileName) {
            setLoading(false);
            return;
        }

        // API URL'i oluştur
        const apiBaseUrl = api.defaults.baseURL;
        const token = localStorage.getItem('accessToken');

        if (!token) {
            console.error('Personel fotoğrafı için token bulunamadı');
            setError(true);
            setLoading(false);
            return;
        }

        // Blob olarak fotoğrafı yükle
        const fetchImage = async () => {
            try {
                setLoading(true);
                setError(false);

                // API'ye istek at ve blob olarak yanıtı al
                const response = await api.get(`/api/personnels/${personId}/photo`, {
                    responseType: 'blob',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                // Blob'dan URL oluştur
                const objectUrl = URL.createObjectURL(response.data);
                setImageUrl(objectUrl);
                setLoading(false);

                // Component unmount olduğunda URL'i serbest bırak
                return () => URL.revokeObjectURL(objectUrl);

            } catch (err) {
                console.error(`Personel fotoğrafı yüklenirken hata: ID=${personId}`, err);
                setError(true);
                setLoading(false);
            }
        };

        // Fotoğrafı yükle
        fetchImage();

    }, [personId, photoFileName]);

    // Yükleniyor durumu
    if (loading && photoFileName) {
        return (
            <div className="personnel-photo loading">
                <div className="spinner-small"></div>
            </div>
        );
    }

    // Fotoğraf yok veya hata durumu - Avatar göster
    if (!photoFileName || error) {
        return (
            <div
                className="no-photo"
                onClick={isPreviewable && photoFileName ? () => onPreviewClick(personId, photoFileName) : undefined}
            >
                <span>
                    {name && surname ?
                        `${name.charAt(0)}${surname.charAt(0)}` :
                        '?'
                    }
                </span>
            </div>
        );
    }

    // Fotoğraf var - Göster
    return (
        <div
            className="personnel-photo"
            onClick={isPreviewable ? () => onPreviewClick(personId, photoFileName) : undefined}
        >
            <img
                src={imageUrl}
                alt={`${name || ''} ${surname || ''}`}
                className="profile-thumbnail"
            />
        </div>
    );
};

export default PersonnelImage;