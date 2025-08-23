const getApiUrl = () => {
  const isDevelopment = import.meta.env.DEV || import.meta.env.MODE === 'development';
  
  // Get environment variables
  const localUrl = import.meta.env.VITE_URL_API_LOCAL || 'http://localhost:5000';
  const prodUrl = import.meta.env.VITE_URL_API_PROD;
  
  // If we have both URLs defined, use based on environment
  if (localUrl && prodUrl) {
    return isDevelopment ? localUrl : prodUrl;
  }
  
  // Fallback logic
  if (isDevelopment) {
    return localUrl;
  } else {
    // In production, if no prod URL is set, use your actual backend URL
    return prodUrl || 'https://east-side-urban.onrender.com';
  }
};

// Auto-detect based on current domain
const getApiUrlByDomain = () => {
  const currentDomain = window.location.hostname;
  
  if (currentDomain === 'localhost' || currentDomain === '127.0.0.1') {
    // Development
    return import.meta.env.VITE_URL_API_LOCAL || 'http://localhost:5000';
  } else {
    // Production
    return import.meta.env.VITE_URL_API_PROD || 'https://east-side-urban.onrender.com';
  }
};

// Export the API URL
export const API_URL = getApiUrl();

// You can also export the function if you need it elsewhere
export { getApiUrl, getApiUrlByDomain };

// For debugging
console.log('🌐 API Configuration:', {
  mode: import.meta.env.MODE,
  isDev: import.meta.env.DEV,
  currentDomain: window.location.hostname,
  apiUrl: API_URL
});
