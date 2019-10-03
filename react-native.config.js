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
    // the key here does not matter as long as it's not referenced from native files
    // CLI will use root to find podspec and android module.
    'react-native-google-signin': {
      root,
    },
  },
};
