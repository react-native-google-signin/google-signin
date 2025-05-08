const path = require('path');
const root = path.resolve(__dirname, '..');
const pkg = require('../package.json');

module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    [
      require.resolve('babel-plugin-module-resolver'),
      {
        extensions: ['.tsx', '.ts', '.jsx', '.js', '.json'],
        alias: {
          '@react-native-google-signin/google-signin': path.join(
            root,
            pkg.source,
          ),
        },
      },
    ],
  ],
};
