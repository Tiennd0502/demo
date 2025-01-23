const config = {
  development: {
    apiUrl: 'http://localhost:3000',
  },
  production: {
    apiUrl: 'https://demo-nine-liart.vercel.app/api',
  },
};

export const getApiUrl = () => {
  // Check if window exists to determine if we're in a browser environment
  return config.production.apiUrl;
};
