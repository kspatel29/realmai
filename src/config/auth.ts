// Authentication configuration for different environments

export const AUTH_CONFIG = {
  // Production domains that should redirect to dubgate.ca
  PRODUCTION_DOMAINS: ['dubgate.ca', 'www.dubgate.ca'],
  
  // Development domains
  DEVELOPMENT_DOMAINS: ['localhost', '127.0.0.1'],
  
  // Default redirect paths
  DEFAULT_REDIRECT_PATH: '/dashboard',
  SIGNIN_REDIRECT_PATH: '/signin',
  
  // OAuth configuration
  OAUTH_CONFIG: {
    queryParams: {
      access_type: 'offline',
      prompt: 'consent',
    }
  }
};

// Helper function to determine if we're in production
export const isProduction = () => {
  if (typeof window === 'undefined') return false;
  
  const hostname = window.location.hostname;
  return AUTH_CONFIG.PRODUCTION_DOMAINS.includes(hostname);
};

// Helper function to get the correct redirect URL based on environment
export const getAuthRedirectUrl = (path: string = AUTH_CONFIG.DEFAULT_REDIRECT_PATH) => {
  if (typeof window === 'undefined') {
    return `http://localhost:8080${path}`;
  }

  const origin = window.location.origin;

  // Always use the current origin for redirects
  // This ensures localhost stays on localhost and dubgate.ca stays on dubgate.ca
  return `${origin}${path}`;
};

// Helper function to check if current domain is allowed
export const isAllowedDomain = () => {
  if (typeof window === 'undefined') return true;
  
  const hostname = window.location.hostname;
  return [...AUTH_CONFIG.PRODUCTION_DOMAINS, ...AUTH_CONFIG.DEVELOPMENT_DOMAINS].includes(hostname);
};
