import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user && user.userId) {
          config.headers['X-User-Id'] = user.userId;
          config.headers['X-User-Role'] = user.role || 'USER';
        }
      } catch (e) {
        console.error('Error parsing user from localStorage', e);
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const signup = (data) => api.post('/auth/signup', data);
export const login = (data) => api.post('/auth/login', data);
export const logout = () => api.post('/auth/logout');

// Events
export const getEvents = (params) => api.get('/events', { params });
export const getEvent = (id) => api.get(`/events/${id}`);
export const getEventSeats = (id) => api.get(`/events/${id}/seats`);
export const createEvent = (data) => api.post('/events', data);
export const updateEvent = (id, data) => api.put(`/events/${id}`, data);
export const deleteEvent = (id) => api.delete(`/events/${id}`);

// Bookings
export const createBooking = (data) => api.post('/bookings', data);
export const getUserBookings = (userId) => api.get(`/bookings/user/${userId}`);
export const cancelBooking = (id) => api.put(`/bookings/${id}/cancel`);

// Users
export const getUser = (id) => api.get(`/users/${id}`);
export const updateUser = (id, data) => api.put(`/users/${id}`, data);

// Dashboard
export const getDashboardStats = () => api.get('/dashboard/stats');

export default api;
