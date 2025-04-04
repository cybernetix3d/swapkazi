// Environment configuration
const ENV = {
  dev: {
    apiUrl: 'http://192.168.1.224:5000/api', // Use your computer's IP address for physical devices
    enableMockData: false, // Using real API data
  },
  staging: {
    apiUrl: 'https://staging-api.swapkazi.com/api',
    enableMockData: false,
  },
  prod: {
    apiUrl: 'https://api.swapkazi.com/api',
    enableMockData: false,
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
