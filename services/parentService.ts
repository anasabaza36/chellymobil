import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://192.168.100.107:8080/api/parents';

/**
 * 🧠 Décodage d’un token JWT en toute sécurité (sans atob car non supporté dans React Native).
 */
const parseJwt = (token: string): any => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error('❌ Erreur lors du décodage du token JWT :', e);
    return null;
  }
};

/**
 * 🔐 Récupère l'ID du parent connecté à partir du token JWT.
 */
const getConnectedParentId = async (): Promise<number> => {
  const token = await AsyncStorage.getItem('token');
  if (!token) throw new Error('Aucun token trouvé');

  const decoded = parseJwt(token);
  if (!decoded?.id) throw new Error("ID du parent introuvable dans le token");
  return decoded.id;
};

/**
 * 📦 Récupère les données du parent connecté via son ID.
 */
export const getParentById = async (): Promise<any> => {
  try {
    const token = await AsyncStorage.getItem('token');
    if (!token) throw new Error('Token manquant');

    const parentId = await getConnectedParentId();

    const response = await axios.get(`${API_BASE_URL}/${parentId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error: any) {
    if (error.response) {
      console.error('❌ Erreur HTTP:', error.response.status, error.response.data);
    } else {
      console.error('❌ Erreur de requête:', error.message);
    }
    throw error;
  }
};
