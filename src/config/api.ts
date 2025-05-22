interface ApiConfig {
  baseUrl: string;
  timeout: number;
  headers: Record<string, string>;
}

const isDevelopment = process.env.REACT_APP_ENV === 'development';

const config: ApiConfig = {
  baseUrl: process.env.REACT_APP_API_URL || (isDevelopment 
    ? 'http://localhost:3000/api'
    : 'https://app-controlaivendas.repl.co/api'),
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
};

export const getApiConfig = () => {
  const token = localStorage.getItem('token');
  return {
    ...config,
    headers: {
      ...config.headers,
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    }
  };
};

export default config; 