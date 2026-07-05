// Konfigurasi API Base URL dengan fallback ke mock data
const USE_MOCK_DATA = false; // Set false jika backend sudah ready

const API_BASE_URL = USE_MOCK_DATA 
  ? null // Frontend akan menggunakan data dummy
  : (process.env.REACT_APP_API_URL || (
      process.env.NODE_ENV === 'production' 
        ? '/api'
        : 'http://127.0.0.1:5000'
    ));

export default API_BASE_URL;
export { USE_MOCK_DATA };
