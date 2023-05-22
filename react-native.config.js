const path = require('path');

const project = (() => {
  try {
    const { configureProjects } = require('react-native-test-app');
    return configureProjects({
      android: {
        sourceDir: path.join('example', 'android'),
      },
      ios: {
        sourceDir: path.join('example', 'ios'),
      },
    });
  } catch (_) {
    return undefined;
  }
})();

module.exports = {
  dependencies: {
    // Help rn-cli find and autolink this library
    '@react-native-google-signin/google-signin': {
      root: __dirname,
    },
    ...(project
      ? {
          expo: {
            // otherwise RN cli will try to autolink expo
            platforms: {
              ios: null,
              android: null,
            },
          },
        }
      : undefined),
  },
  ...(project ? { project } : undefined),
};
