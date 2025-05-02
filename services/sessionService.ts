import axios from 'axios';

// Remplace par ton IP locale (depuis `ipconfig`) si tu testes sur un téléphone
const BASE_URL = 'http://192.168.100.107:8080/api/sessions';

export const getCalendarSessions = async (params: {
  coachId?: number;
  adherentId?: number;
  parentId?: number;
  activiteId?: number;
  equipeId?: number;
  lieuId?: number;
  month?: number;
  year?: number;
}) => {
  const response = await axios.get(`${BASE_URL}/calendar`, {
    params,
  });
  return response.data;
};
