import axios from "axios";

// 1. Create a base instance pointing to your Node backend
const api = axios.create({
  baseURL: "http://localhost:9999/", 
  validateStatus: () => true,
});

// 2. Set up the Interceptor (The "Courier")
api.interceptors.request.use(
  (config) => {
    // Before the request leaves the browser, grab the token
    const token = localStorage.getItem("felicity_token");
    
    // If we have a token, attach it as an "ID Badge" (Bearer token)
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;