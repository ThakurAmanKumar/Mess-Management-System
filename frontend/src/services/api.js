import axios from "axios";

// Determine API URL based on environment
const getApiUrl = () => {
  // Check for Vite environment variable first
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // Production fallback - detect if running on Vercel
  if (typeof window !== 'undefined' && window.location.hostname.includes('vercel.app')) {
    return 'https://mms-rri3.onrender.com/api';
  }
  
  // Local development fallback
  return 'http://localhost:5000/api';
};

const API_BASE_URL = getApiUrl();
const AUTH_STORAGE_KEY = "smartmess_auth";

// Log API URL only in development
if (import.meta.env.DEV) {
  console.log('🔗 API URL:', API_BASE_URL);
}

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Check if token is expired
const isTokenExpired = () => {
  try {
    const storedAuth = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!storedAuth) return true;

    const authData = JSON.parse(storedAuth);
    if (!authData.expiresAt) return true;

    return new Date(authData.expiresAt) <= new Date();
  } catch {
    return true;
  }
};

// Clear auth data
const clearAuth = () => {
  localStorage.removeItem(AUTH_STORAGE_KEY);
  localStorage.removeItem("token");
  window.location.href = "/login";
};

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      // Check if token is expired before making request
      if (isTokenExpired()) {
        clearAuth();
        return Promise.reject(new Error("Token expired"));
      }
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token is invalid or expired
      clearAuth();
    }
    return Promise.reject(error);
  },
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post("/auth/login", credentials),
  register: (userData) => api.post("/auth/register", userData),
  getProfile: () => api.get("/auth/profile"),
  updateProfile: (data) => api.put("/auth/profile", data),
  logout: () => api.post("/auth/logout"),
};

// Menu API
export const menuAPI = {
  getTodayMenu: () => api.get("/menu/today"),
  getMenuByDate: (date) => api.get(`/menu/date/${date}`),
  getWeeklyMenu: () => api.get("/menu/weekly"),
  getAllMenus: () => api.get("/menu"),
  createMenu: (menuData) => api.post("/menu", menuData),
  updateMenu: (id, menuData) => api.put(`/menu/${id}`, menuData),
  deleteMenu: (id) => api.delete(`/menu/${id}`),
};

// Rating API
export const ratingAPI = {
  createRating: (ratingData) => api.post("/ratings", ratingData),
  getMyRatings: () => api.get("/ratings/my-ratings"),
  getRatingById: (id) => api.get(`/ratings/${id}`),
  updateRating: (id, ratingData) => api.put(`/ratings/${id}`, ratingData),
  deleteRating: (id) => api.delete(`/ratings/${id}`),
  getMealRatings: (menuId, mealType) =>
    api.get(`/ratings/meal/${menuId}/${mealType}`),
  getAverageRatings: () => api.get("/ratings/analytics/average"),
  getAllRatings: () => api.get("/ratings/all"),
};

// User API
export const userAPI = {
  getProfile: () => api.get("/users/profile"),
  updateProfile: (data) => api.put("/users/profile", data),
  getAllUsers: () => api.get("/users"),
};

// Admin Auth API
export const adminAuthAPI = {
  login: (credentials) => api.post("/auth/admin/login", credentials),
  getProfile: () => api.get("/auth/profile"),
};

// Admin API
export const adminAPI = {
  // Dashboard Stats
  getDashboardStats: () => api.get("/admin/stats"),

  // Student Management
  getAllStudents: (verified) =>
    api.get("/admin/students", { params: { verified } }),
  addStudent: (studentData) => api.post("/admin/students", studentData),
  verifyStudent: (studentId) =>
    api.put(`/admin/students/${studentId}/verify`),
  deleteStudent: (studentId) => api.delete(`/admin/students/${studentId}`),
  toggleStudentStatus: (studentId) =>
    api.put(`/admin/students/${studentId}/toggle-status`),

  // Menu Management
  createMenu: (menuData) => api.post("/admin/menu", menuData),
  updateMenu: (menuId, menuData) => api.put(`/admin/menu/${menuId}`, menuData),
  deleteMenu: (menuId) => api.delete(`/admin/menu/${menuId}`),

  // Ratings
  getAllRatings: (params) => api.get("/admin/ratings", { params }),
  getRatingStats: () => api.get("/admin/ratings/stats"),

  // Complaints
  getAllComplaints: (status) =>
    api.get("/admin/complaints", { params: { status } }),
  updateComplaintStatus: (complaintId, data) =>
    api.put(`/admin/complaints/${complaintId}`, data),

  // Notifications
  sendNotification: (notificationData) =>
    api.post("/admin/notifications", notificationData),
  getNotifications: () => api.get("/admin/notifications"),
  deleteNotification: (notificationId) =>
    api.delete(`/admin/notifications/${notificationId}`),

  // Meal Attendance
  getMealAttendance: (params) =>
    api.get("/admin/attendance", { params }),
  markAttendance: (attendanceData) =>
    api.post("/admin/attendance", attendanceData),
  getAttendanceStats: () => api.get("/admin/attendance/stats"),
};

// Complaint API (for students)
export const complaintAPI = {
  create: (complaintData) => api.post("/complaints", complaintData),
  getMyComplaints: () => api.get("/complaints/my-complaints"),
  getById: (id) => api.get(`/complaints/${id}`),
};

// Student Attendance API
export const attendanceAPI = {
  markAttendance: (data) => api.post("/student/attendance", data),
  getMyAttendance: (studentId, params) => 
    api.get(`/student/attendance/${studentId}`, { params }),
  getTodayStatus: (studentId) => 
    api.get(`/student/attendance/today/${studentId}`),
};

// Student Notifications API
export const notificationAPI = {
  getAll: () => api.get("/student/notifications"),
  markAsRead: (notificationId) => 
    api.put(`/student/notifications/${notificationId}/read`),
  getUnreadCount: () => api.get("/student/notifications/unread-count"),
};

export default api;
