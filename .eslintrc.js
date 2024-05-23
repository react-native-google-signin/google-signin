module.exports = {
  root: true,
  extends: [
    '@react-native',
    'plugin:prettier/recommended',
    'plugin:jest/recommended',
  ],
  rules: {
    'no-console': ['error', { allow: ['warn', 'error'] }],
  },
  ignorePatterns: ['lib/*', 'node_modules/*', '**/build/*'],
};
