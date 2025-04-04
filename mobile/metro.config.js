// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Add support for TypeScript
config.resolver.sourceExts = ['js', 'jsx', 'json', 'ts', 'tsx'];

// Add support for Node.js modules
config.resolver.extraNodeModules = {
  // Add any Node.js modules that need to be resolved here
  'nanoid': path.resolve(__dirname, 'node_modules/nanoid'),
};

// Fix for nanoid/non-secure
config.resolver.resolveRequest = (context, moduleName, platform) => {
  // Special case for nanoid/non-secure
  if (moduleName === 'nanoid/non-secure') {
    return {
      filePath: path.resolve(__dirname, 'src/utils/nanoidShim.js'),
      type: 'sourceFile',
    };
  }

  // Default behavior for all other modules
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
