import axios from 'axios';

const API = axios.create({
  baseURL: "https://ecommerce-73js.onrender.com/api",
    // import.meta.env.VITE_API_URL ||  "http://localhost:5000",
    // 'https://ecommerce-73js.onrender.com/api',

  headers: { 
    'Content-Type': 'application/json',
  },

  withCredentials: false,
});


API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("aura_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);


// Response Interceptor (FIXED)
API.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    if (status === 401) {
      localStorage.removeItem("aura_token");
      localStorage.removeItem("aura_user");
      console.warn("🔒 Token expired or invalid - Session Cleared");
      
      // Redirect to login only if we are NOT already on login/register pages
      const isAuthPage = window.location.pathname.includes('/login') || window.location.pathname.includes('/register');
      if (!isAuthPage) {
        window.location.href = '/login?expired=true';
      }
    }

    // ❗ IMPORTANT: return FULL error object
    return Promise.reject(error);
  }
);

export const getActiveOffers = async () => {
  return await API.get("/offers/active");
};

export const resolveImage = (path) => {
  if (!path) return "";
  
  const baseUrl = API.defaults.baseURL?.replace(/\/api\/?$/, '') || "http://localhost:5000";

  // If path is already an absolute URL
  if (path.startsWith("http")) {
    // If it's a localhost URL and we have a different baseUrl (production), swap it
    if (path.includes("localhost:5000") && !baseUrl.includes("localhost:5000")) {
      return path.replace("http://localhost:5000", baseUrl);
    }
    // If it's already absolute (e.g. cloud storage or correct localhost), return as is
    return path;
  }
  
  // If it's a relative path starting with /
  if (path.startsWith("/")) {
    return `${baseUrl}${path}`;
  }
  
  // For any other relative path
  return `${baseUrl}/${path}`;
};

export default API;