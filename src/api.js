
const USE_LOCAL_BACKEND = false;

const API_BASE_URL = USE_LOCAL_BACKEND
  ? "http://localhost:8000"
  : "https://aflit.onrender.com";

export default API_BASE_URL;
