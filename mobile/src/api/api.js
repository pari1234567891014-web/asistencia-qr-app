import axios from 'axios';

// NOTA: Para probar en un emulador Android local, se usa 10.0.2.2 en lugar de localhost.
// Para un dispositivo físico o Render, cambia esto por tu URL real (ej: https://tu-backend.render.com/api)
const API_URL = 'http://10.0.2.2:3000/api'; 

export const loginAdmin = async (login, contrasena) => {
  return axios.post(`${API_URL}/admin/login`, { login, contrasena });
};

export const scanQRCode = async (qr_token) => {
  return axios.post(`${API_URL}/asistencia/scan`, { qr_token });
};

export const getReports = async (fecha, mes, anio) => {
  return axios.get(`${API_URL}/reportes`, { params: { fecha, mes, anio } });
};
