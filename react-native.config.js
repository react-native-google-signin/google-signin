const root = process.cwd();

module.exports = {
  dependency: {
    platforms: {
      ios: {
        project: 'ios/RNGoogleSignin.xcodeproj',
      },
    },
  },
  dependencies: {
    'react-native-google-signin': {
      root,
    },
  },
};
