import type { ExpoConfig } from 'expo/config';
import {
  ConfigPlugin,
  AndroidConfig,
  IOSConfig,
  createRunOncePlugin,
  withPlugins,
} from 'expo/config-plugins';

const pkg = require('@react-native-google-signin/google-signin/package.json');

/**
 * Apply google-signin configuration for Expo SDK 47+ projects.
 */
const withGoogleSignIn: ConfigPlugin = (config: ExpoConfig) => {
  return withPlugins(config, [
    // Android
    AndroidConfig.GoogleServices.withClassPath,
    AndroidConfig.GoogleServices.withApplyPlugin,
    AndroidConfig.GoogleServices.withGoogleServicesFile,

    // iOS
    IOSConfig.Google.withGoogle,
    IOSConfig.Google.withGoogleServicesFile,
  ]);
};

export default createRunOncePlugin(withGoogleSignIn, pkg.name, pkg.version);
