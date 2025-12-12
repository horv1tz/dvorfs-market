import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = Cookies.get('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token refresh on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = Cookies.get('refreshToken');
        if (refreshToken) {
          const response = await axios.post(`${API_URL}/auth/refresh`, {
            refreshToken,
          });

          const { accessToken, refreshToken: newRefreshToken } = response.data.data;
          Cookies.set('accessToken', accessToken);
          if (newRefreshToken) {
            Cookies.set('refreshToken', newRefreshToken);
          }

          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        Cookies.remove('accessToken');
        Cookies.remove('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;

// Auth API
export const authAPI = {
  register: (data: { email: string; password: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
  forgotPassword: (email: string) =>
    api.post('/auth/forgot-password', { email }),
  resetPassword: (data: { token: string; password: string }) =>
    api.post('/auth/reset-password', data),
};

// Products API
export const productsAPI = {
  getProducts: (params?: any) => api.get('/products', { params }),
  getProduct: (id: string) => api.get(`/products/${id}`),
  getCategories: () => api.get('/categories'),
  getPopularProducts: (limit?: number) =>
    api.get('/products/popular', { params: { limit } }),
};

// Cart API
export const cartAPI = {
  getCart: () => api.get('/cart'),
  addItem: (data: { product_id: string; quantity: number }) =>
    api.post('/cart/items', data),
  updateItem: (itemId: string, quantity: number) =>
    api.put(`/cart/items/${itemId}`, { quantity }),
  removeItem: (itemId: string) => api.delete(`/cart/items/${itemId}`),
  clearCart: () => api.delete('/cart'),
};

// Orders API
export const ordersAPI = {
  createOrder: (data: { shipping_address: string }) =>
    api.post('/orders', data),
  getOrders: () => api.get('/orders'),
  getOrder: (id: string) => api.get(`/orders/${id}`),
};

// Payments API
export const paymentsAPI = {
  createPayment: (data: { order_id: string; payment_method: string }) =>
    api.post('/payments/create', data),
  getPayment: (id: string) => api.get(`/payments/${id}`),
};

// Wishlist API
export const wishlistAPI = {
  getWishlist: () => api.get('/wishlist'),
  addToWishlist: (productId: string) =>
    api.post('/wishlist', { productId }),
  removeFromWishlist: (productId: string) =>
    api.delete(`/wishlist/${productId}`),
};

// Notifications API
export const notificationsAPI = {
  getNotifications: (params?: any) =>
    api.get('/notifications', { params }),
  markAsRead: (id: string) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
  getUnreadCount: () => api.get('/notifications/unread/count'),
  getPreferences: () => api.get('/notifications/preferences'),
  updatePreferences: (data: any) =>
    api.put('/notifications/preferences', data),
};

