import firebaseConfig from './firebase';

// Environment configuration
const ENV = {
  dev: {
    apiUrl: 'http://localhost:5000/api', // Use localhost for development
    enableMockData: false, // Using real API data
    firebase: firebaseConfig
  },
  staging: {
    apiUrl: 'https://staging-api.swapkazi.com/api',
    enableMockData: false,
    firebase: firebaseConfig
  },
  prod: {
    apiUrl: 'https://api.swapkazi.com/api',
    enableMockData: false,
    firebase: firebaseConfig
  }
};

// Default to dev environment
const getEnvVars = (env = 'dev') => {
  // For future use with environment switching
  if (env === 'staging') return ENV.staging;
  if (env === 'prod') return ENV.prod;
  return ENV.dev;
};

export default getEnvVars();
