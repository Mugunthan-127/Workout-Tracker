import axios from "axios";

const API_URL = "http://localhost:5000/api";

const api = axios.create({
    baseURL: API_URL,
});

/* Add token to requests */
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

/* Auth Endpoints */
export const authAPI = {
    register: (data) => api.post("/auth/register", data),
    login: (data) => api.post("/auth/login", data),
    getUser: () => api.get("/auth/user"),
    deleteUser: () => api.delete("/auth/user"),
    getAllUsers: () => api.get("/auth/all-users"),
};

export default api;
