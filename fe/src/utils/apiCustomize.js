import axios from "axios";

const instance = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
});

// Add a request interceptor
instance.interceptors.request.use(
  function (config) {
    const token = localStorage.getItem("access_token");
    config.headers.Authorization = token ? `Bearer ${token}` : "";
    return config;
  },
  function (error) {
    return Promise.reject(error);
  }
);

// Add a response interceptor
instance.interceptors.response.use(
  function (response) {
    return response;
  },
  function (error) {
    // if (error?.response?.data) {
    //   return error?.response?.data;
    // }
    return Promise.reject(error);
  }
);

// API login with Google
export const loginWithGoogleApi = (userData) => {
  return instance.post("/api/v1/auth/google-login", userData); // Route này cần được tạo trên backend
};

export default instance;