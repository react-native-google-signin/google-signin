import { appendScheme } from '@expo/config-plugins/build/ios/Scheme';
import type { ExpoConfig } from 'expo/config';
import {
  ConfigPlugin,
  AndroidConfig,
  IOSConfig,
  createRunOncePlugin,
  withPlugins,
  withInfoPlist,
} from 'expo/config-plugins';

const pkg = require('@react-native-google-signin/google-signin/package.json');

type Options = {
  iosUrlScheme: string;
};

function validateOptions(options: Options) {
  const messagePrefix = `google-sign-in without Firebase config plugin`;
  if (!options?.iosUrlScheme) {
    throw new Error(
      `${messagePrefix}: Missing \`iosUrlScheme\` in provided options: ${JSON.stringify(
        options,
      )}`,
    );
  }
  if (!options.iosUrlScheme.startsWith('com.googleusercontent.apps.')) {
    throw new Error(
      `${messagePrefix}: \`iosUrlScheme\` must start with "com.googleusercontent.apps": ${JSON.stringify(
        options,
      )}`,
    );
  }
}

const withGoogleSignInWithoutFirebase: ConfigPlugin<Options> = (
  config: ExpoConfig,
  options,
) => {
  validateOptions(options);
  return withPlugins(config, [
    // iOS
    (cfg) => withGoogleUrlScheme(cfg, options),
  ]);
};

export const withGoogleUrlScheme: ConfigPlugin<Options> = (config, options) => {
  return withInfoPlist(config, (config) => {
    config.modResults = appendScheme(options.iosUrlScheme, config.modResults);
    return config;
  });
};

/**
 * Apply google-signin configuration for Expo SDK 47+ projects. This plugin reads information from the Firebase config file.
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

const withGoogleSignInRoot: ConfigPlugin<Options | void> = (
  config: ExpoConfig,
  options,
) => {
  return options
    ? withGoogleSignInWithoutFirebase(config, options)
    : withGoogleSignIn(config);
};

export default createRunOncePlugin<Options>(
  withGoogleSignInRoot,
  pkg.name,
  pkg.version,
);
