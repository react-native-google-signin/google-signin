/** @type {import('jest').Config} */
const config = {
  preset: 'react-native',
  modulePathIgnorePatterns: [
    '<rootDir>/example/node_modules',
    '<rootDir>/lib/',
  ],
  moduleNameMapper: {
    '@react-native-google-signin/google-signin': '<rootDir>/src/index.ts',
  },
};

module.exports = config;
