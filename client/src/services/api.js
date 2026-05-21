// import axios from 'axios';

// const API = axios.create({
//   baseURL: import.meta.env.VITE_API_URL || 'https://aura-2-2b96.onrender.com/api',
//   headers: {
//     'Content-Type': 'application/json'
//   }
// });

// // Request interceptor to dynamically inject the JWT token
// API.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem('aura_token');
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );

// // Response interceptor to clean up error messaging
// API.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     const message = error.response?.data?.message || error.message || 'Something went wrong';
//     return Promise.reject(message);
//   }
// );

// export default API;

import axios from 'axios';

const API = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    'https://ecommerce-73js.onrender.com/api',

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

export default API;