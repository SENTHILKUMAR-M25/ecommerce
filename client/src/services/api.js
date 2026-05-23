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

// Request Interceptor
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('aura_token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor
API.interceptors.response.use(
  (response) => response,

  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      'Something went wrong';

    // Auto logout if token expired
    if (error.response?.status === 401) {
      localStorage.removeItem('aura_token');
    }

    return Promise.reject(message);
  }
  
);

export const getActiveOffers = async () => {
  return await API.get("/offers/active");
};

export const resolveImage = (path) => {
  if (!path) return "";
  if (path.startsWith("http") && !path.includes("localhost:5000")) return path;
  
  const baseUrl = "https://ecommerce-73js.onrender.com";
  
  // If it's an absolute localhost URL from old DB state, swap it
  if (path.includes("localhost:5000")) {
    return path.replace("http://localhost:5000", baseUrl);
  }
  
  // If it's a relative path
  if (path.startsWith("/")) {
    return `${baseUrl}${path}`;
  }
  
  return `${baseUrl}/${path}`;
};

export default API;