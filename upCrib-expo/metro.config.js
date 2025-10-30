const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Ensure Metro looks in the correct node_modules directory
config.resolver.nodeModulesPaths = [
  __dirname + '/node_modules',
];

// Clear any parent project interference
config.watchFolders = [];

module.exports = config;