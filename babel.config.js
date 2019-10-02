module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        alias: {
          '@react-native-community/google-signin': './index.js',
        },
        cwd: 'babelrc',
      },
    ],
  ],
};
