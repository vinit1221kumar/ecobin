const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const REQUEST_TIMEOUT = 30000; // 30 seconds

// API Health Check
let apiHealthStatus = { isHealthy: true, lastChecked: null };
const HEALTH_CHECK_INTERVAL = 60000; // Check every minute

const checkApiHealth = async () => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout for health check
    
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    if (response.ok) {
      apiHealthStatus = { isHealthy: true, lastChecked: new Date() };
      return true;
    } else {
      apiHealthStatus = { isHealthy: false, lastChecked: new Date() };
      return false;
    }
  } catch (error) {
    apiHealthStatus = { isHealthy: false, lastChecked: new Date() };
    return false;
  }
};

// Check API health on module load
checkApiHealth().then(isHealthy => {
  if (!isHealthy) {
    console.warn('⚠️  Backend API is not accessible. Some features may not work.');
  }
});

// Periodically check API health
setInterval(checkApiHealth, HEALTH_CHECK_INTERVAL);

// Export health check function
export const getApiHealth = () => apiHealthStatus;
export { checkApiHealth };

// Helper function to get auth token with error handling
const getToken = () => {
  try {
    return localStorage.getItem('token');
  } catch (error) {
    console.error('Error accessing localStorage for token:', error);
    return null;
  }
};

// Helper function to get user data with error handling
const getUser = () => {
  try {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  } catch (error) {
    console.error('Error accessing localStorage for user:', error);
    return null;
  }
};

// Helper function to set item in localStorage with error handling
const setStorageItem = (key, value) => {
  try {
    localStorage.setItem(key, value);
  } catch (error) {
    if (error.name === 'QuotaExceededError') {
      console.error('Storage quota exceeded. Please clear some space.');
      throw new Error('Storage quota exceeded. Please clear browser storage.');
    } else if (error.name === 'SecurityError') {
      console.error('Storage access denied (private browsing mode).');
      // Fallback to sessionStorage for private browsing
      try {
        sessionStorage.setItem(key, value);
      } catch (sessionError) {
        console.error('SessionStorage also failed:', sessionError);
      }
    } else {
      console.error(`Error setting ${key} in storage:`, error);
      throw error;
    }
  }
};

// Helper function to remove item from localStorage with error handling
const removeStorageItem = (key) => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing ${key} from storage:`, error);
  }
};

// Check if token is expired
const isTokenExpired = (token) => {
  if (!token) return true;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const exp = payload.exp * 1000; // Convert to milliseconds
    return Date.now() >= exp;
  } catch (error) {
    console.error('Error checking token expiration:', error);
    return true; // Assume expired if we can't parse
  }
};

// Create AbortController for timeout
const createTimeoutController = (timeout = REQUEST_TIMEOUT) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  return { controller, timeoutId };
};

// Generic fetch wrapper with comprehensive error handling
const apiRequest = async (endpoint, options = {}) => {
  // Check token expiration
  const token = getToken();
  if (token && isTokenExpired(token)) {
    // Clear expired token
    removeStorageItem('token');
    removeStorageItem('user');
    // Redirect to login if we're not already there
    if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/admin/login')) {
      window.location.href = '/login';
    }
    throw new Error('Session expired. Please login again.');
  }

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Create timeout controller
  const { controller, timeoutId } = createTimeoutController();
  
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // Handle 401 Unauthorized (token expired or invalid)
    if (response.status === 401) {
      removeStorageItem('token');
      removeStorageItem('user');
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/admin/login')) {
        window.location.href = '/login';
      }
      throw new Error('Authentication failed. Please login again.');
    }

    if (!response.ok) {
      let errorMessage = 'Request failed';
      try {
        const error = await response.json();
        errorMessage = error.message || error.error || `HTTP ${response.status}: ${response.statusText}`;
      } catch (parseError) {
        // Response is not JSON
        errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }

    // Parse response with error handling
    let data;
    try {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        // Non-JSON response
        const text = await response.text();
        throw new Error('Server returned non-JSON response');
      }
    } catch (parseError) {
      if (parseError instanceof Error && parseError.message === 'Server returned non-JSON response') {
        throw parseError;
      }
      throw new Error('Failed to parse server response');
    }

    // If response has success and data fields, return data directly
    if (data.success !== undefined && data.data !== undefined) {
      return data.data;
    }
    // If response has success, token, and user (auth responses), return as is
    if (data.success !== undefined && (data.token || data.user)) {
      return data;
    }
    // If response is an array or object without success field, return as is
    // This handles legacy responses that might not have the success wrapper
    return data;
  } catch (error) {
    clearTimeout(timeoutId);
    
    // Handle different error types
    if (error.name === 'AbortError') {
      throw new Error('Request timeout. Please check your connection and try again.');
    }
    
    if (error instanceof TypeError && error.message.includes('fetch')) {
      // Network error (CORS, offline, etc.)
      if (error.message.includes('Failed to fetch')) {
        throw new Error('Cannot connect to server. Please check if the backend is running and try again.');
      }
      throw new Error('Network error. Please check your internet connection.');
    }
    
    // Re-throw if it's already our custom error
    if (error.message && (error.message.includes('Authentication failed') || error.message.includes('Session expired'))) {
      throw error;
    }
    
    // Re-throw other errors
    throw error;
  }
};

// Auth API
export const authAPI = {
  register: (data) => apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  login: (data) => apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  adminLogin: (data) => apiRequest('/auth/admin/login', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  adminRegister: (data) => apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ ...data, role: 'admin' }),
  }),
};

// Pickup API
export const pickupAPI = {
  create: async (data) => {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if (key === 'photo' && data[key]) {
        formData.append('photo', data[key]);
      } else if (data[key] !== null && data[key] !== undefined) {
        formData.append(key, data[key]);
      }
    });
    
    const token = getToken();
    const { controller, timeoutId } = createTimeoutController();
    
    try {
      const response = await fetch(`${API_BASE_URL}/pickups`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Handle 401
      if (response.status === 401) {
        removeStorageItem('token');
        removeStorageItem('user');
        if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/admin/login')) {
          window.location.href = '/login';
        }
        throw new Error('Authentication failed. Please login again.');
      }

      let responseData;
      try {
        responseData = await response.json();
      } catch (parseError) {
        throw new Error('Failed to parse server response');
      }

      if (!response.ok) {
        throw new Error(responseData.message || 'Request failed');
      }

      // Return data field if success wrapper exists, otherwise return full response
      return responseData.success && responseData.data !== undefined ? responseData.data : responseData;
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        throw new Error('Request timeout. Please check your connection and try again.');
      }
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Cannot connect to server. Please check if the backend is running and try again.');
      }
      
      throw error;
    }
  },
  getMy: () => apiRequest('/pickups/my'),
  getAssigned: () => apiRequest('/pickups/assigned'),
  updateStatus: async (id, data) => {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if (key === 'proofPhoto' && data[key]) {
        formData.append('proofPhoto', data[key]);
      } else if (data[key] !== null && data[key] !== undefined) {
        formData.append(key, data[key]);
      }
    });
    
    const token = getToken();
    const { controller, timeoutId } = createTimeoutController();
    
    try {
      const response = await fetch(`${API_BASE_URL}/pickups/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Handle 401
      if (response.status === 401) {
        removeStorageItem('token');
        removeStorageItem('user');
        if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/admin/login')) {
          window.location.href = '/login';
        }
        throw new Error('Authentication failed. Please login again.');
      }

      let responseData;
      try {
        responseData = await response.json();
      } catch (parseError) {
        throw new Error('Failed to parse server response');
      }

      if (!response.ok) {
        throw new Error(responseData.message || 'Request failed');
      }

      // Return data field if success wrapper exists, otherwise return full response
      return responseData.success && responseData.data !== undefined ? responseData.data : responseData;
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        throw new Error('Request timeout. Please check your connection and try again.');
      }
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Cannot connect to server. Please check if the backend is running and try again.');
      }
      
      throw error;
    }
  },
};

// Credits API
export const creditsAPI = {
  getMy: () => apiRequest('/credits/my'),
  redeem: (data) => apiRequest('/credits/redeem', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
};

// Partners API (public)
export const partnersAPI = {
  getAll: () => apiRequest('/partners'),
};

// Admin API
export const adminAPI = {
  getUsers: () => apiRequest('/admin/users'),
  createUser: (data) => apiRequest('/admin/users', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updateUser: (id, data) => apiRequest(`/admin/users/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),
  deleteUser: (id) => apiRequest(`/admin/users/${id}`, {
    method: 'DELETE',
  }),
  assignCredits: (id, data) => apiRequest(`/admin/users/${id}/credits`, {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  getAllPickups: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/admin/pickups${query ? `?${query}` : ''}`);
  },
  schedulePickup: (data) => apiRequest('/admin/pickups/schedule', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  assignCollector: (id, data) => apiRequest(`/admin/pickups/${id}/assign`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),
  unassignCollector: (id) => apiRequest(`/admin/pickups/${id}/unassign`, {
    method: 'PATCH',
  }),
  updatePickupStatus: (id, data) => apiRequest(`/admin/pickups/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),
  getStats: () => apiRequest('/admin/stats'),
  getTopContributors: (limit = 10) => apiRequest(`/admin/top-contributors?limit=${limit}`),
  getPartners: () => apiRequest('/admin/partners'),
  createPartner: (data) => apiRequest('/admin/partners', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updatePartner: (id, data) => apiRequest(`/admin/partners/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),
  deletePartner: (id) => apiRequest(`/admin/partners/${id}`, {
    method: 'DELETE',
  }),
  getSettings: () => apiRequest('/admin/settings'),
  updateSettings: (data) => apiRequest('/admin/settings', {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),
};

// Notification API
export const notificationAPI = {
  getAll: () => apiRequest('/notifications'),
  getUnreadCount: () => apiRequest('/notifications/unread-count'),
  markAsRead: (id) => apiRequest(`/notifications/${id}/read`, {
    method: 'PATCH',
  }),
  markAllAsRead: () => apiRequest('/notifications/read-all', {
    method: 'PATCH',
  }),
};

// File API
export const fileAPI = {
  getPresignedUrl: async (filename) => {
    const response = await apiRequest(`/files/presigned/${encodeURIComponent(filename)}`);
    return response.data?.url || response.url;
  },
  getFile: (filename) => {
    const token = getToken();
    // Extract just the filename if full URL is provided
    let fileKey = filename;
    if (filename.includes('/ecobin/')) {
      fileKey = filename.split('/ecobin/')[1];
    } else if (filename.includes('/')) {
      fileKey = filename.split('/').pop();
    }
    fileKey = fileKey.split('?')[0]; // Remove query params
    return `${API_BASE_URL}/files/${encodeURIComponent(fileKey)}${token ? `?token=${token}` : ''}`;
  },
};

// Helper function to get accessible image URL
export const getImageUrl = async (imageUrl) => {
  if (!imageUrl) return null;
  
  // If it's already a presigned URL or external URL, return as is
  if (imageUrl.includes('?X-Amz-Algorithm') || imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    // Check if it's a MinIO direct URL that might need conversion
    if (imageUrl.includes('/ecobin/') && !imageUrl.includes('?X-Amz-Algorithm')) {
      try {
        // Extract filename from URL
        const filename = imageUrl.split('/ecobin/')[1];
        if (filename) {
          const presignedUrl = await fileAPI.getPresignedUrl(filename);
          return presignedUrl;
        }
      } catch (err) {
        console.warn('Failed to get presigned URL, using original:', err);
      }
    }
    return imageUrl;
  }
  
  return imageUrl;
};

export { getToken, getUser, setStorageItem, removeStorageItem };

