import axios from 'axios';
import toast from 'react-hot-toast';

const API_BASE_URL = 'http://localhost:8080';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      toast.error('Session expired. Please login again.');
    } else if (error.response?.status === 403) {
      toast.error('Access denied. Insufficient permissions.');
    } else {
      toast.error(error.response?.data?.error || 'Something went wrong');
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
};

export const doctorAPI = {
  getAll: () => api.get('/doctors'),
  getById: (id) => api.get(`/doctors/${id}`),
  create: (data) => api.post('/doctors', data),
  approve: (id) => api.put(`/doctors/${id}/approve`),
  delete: (id) => api.delete(`/doctors/${id}`),
};

export const patientAPI = {
  getAll: () => api.get('/patients'),
  getById: (id) => api.get(`/patients/${id}`),
  getMyProfile: () => api.get('/patients/my-profile'),
  create: (data) => api.post('/patients', data),
  update: (id, data) => api.put(`/patients/${id}`, data),
  delete: (id) => api.delete(`/patients/${id}`),
};

export const appointmentAPI = {
  getAll: () => api.get('/appointments'),
  getByPatient: (patientId) => api.get(`/appointments/patient/${patientId}`),
  getByDoctor: () => api.get('/appointments/doctor'),
  book: (data) => api.post('/appointments', data),
  updateStatus: (id, status) => api.put(`/appointments/${id}/status?status=${status}`),
  cancel: (id) => api.put(`/appointments/${id}/cancel`),
};

export const billingAPI = {
  getAll: () => api.get('/billing'),
  getMyInvoices: () => api.get('/billing/my-invoices'),
  getByAppointment: (appointmentId) => api.get(`/billing/appointment/${appointmentId}`),
  create: (data) => api.post('/billing', data),
  updateStatus: (id, status) => api.put(`/billing/${id}/status?status=${status}`),
  payInvoice: (id, paymentMethod) => api.put(`/billing/${id}/pay?paymentMethod=${paymentMethod}`),
  markPaid: (id) => api.put(`/billing/${id}/mark-paid`),
};

export default api;
