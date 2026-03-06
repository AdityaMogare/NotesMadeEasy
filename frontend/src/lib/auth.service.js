import api from './axios';

class AuthService {
  constructor() {
    this.sessionKey = 'sessionId';
    this.userKey = 'userData';
  }

  // Get stored session ID
  getSessionId() {
    return localStorage.getItem(this.sessionKey);
  }

  // Get stored user data
  getUser() {
    const userData = localStorage.getItem(this.userKey);
    return userData ? JSON.parse(userData) : null;
  }

  // Set auth headers for API requests
  setAuthHeaders() {
    const sessionId = this.getSessionId();
    if (sessionId) {
      api.defaults.headers.common['Authorization'] = `Bearer ${sessionId}`;
    } else {
      delete api.defaults.headers.common['Authorization'];
    }
  }

  // Login user
  async login(email, password) {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { sessionId, user } = response.data;
      
      // Store session ID and user data
      localStorage.setItem(this.sessionKey, sessionId);
      localStorage.setItem(this.userKey, JSON.stringify(user));
      
      // Set auth headers
      this.setAuthHeaders();
      
      return { success: true, user };
    } catch (error) {
      console.error('Login error:', error);
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  }

  // Register user
  async register(name, email, password) {
    try {
      const response = await api.post('/auth/register', { name, email, password });
      const { sessionId, user } = response.data;
      
      // Store session ID and user data
      localStorage.setItem(this.sessionKey, sessionId);
      localStorage.setItem(this.userKey, JSON.stringify(user));
      
      // Set auth headers
      this.setAuthHeaders();
      
      return { success: true, user };
    } catch (error) {
      console.error('Registration error:', error);
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  }

  // Logout user
  logout() {
    localStorage.removeItem(this.sessionKey);
    localStorage.removeItem(this.userKey);
    delete api.defaults.headers.common['Authorization'];
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!this.getSessionId();
  }

  // Get current user
  getCurrentUser() {
    return this.getUser();
  }

  // Initialize auth state (call on app startup)
  init() {
    this.setAuthHeaders();
    return this.isAuthenticated();
  }
}

// Create singleton instance
const authService = new AuthService();

export default authService; 