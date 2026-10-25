import type { ExpoConfig } from 'expo/config';
import {
  type ConfigPlugin,
  AndroidConfig,
  IOSConfig,
  createRunOncePlugin,
  withPlugins,
  withInfoPlist,
  withPodfile,
} from 'expo/config-plugins';

const pkg = require('@react-native-google-signin/google-signin/package.json');

type IosDependencyManager = 'cocoapods' | 'spm';

type Options = {
  iosUrlScheme: string;
  iosDependencyManager?: IosDependencyManager;
};

type DependencyManagerOptions = {
  iosDependencyManager: IosDependencyManager;
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
    const scheme = options.iosUrlScheme;
    const infoPlist = config.modResults;
    if (!IOSConfig.Scheme.hasScheme(scheme, infoPlist)) {
      config.modResults = IOSConfig.Scheme.appendScheme(scheme, infoPlist);
    }
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

// Marks the Podfile line this plugin writes, so it only ever replaces its own line.
const DEPENDENCY_MANAGER_MARKER =
  '# @react-native-google-signin/google-signin iosDependencyManager';

/**
 * Sets `$RNGoogleSigninDependencyManager` in the Podfile, which selects how the podspecs resolve
 * the GoogleSignIn SDK. `spm` also needs `useFrameworks: "dynamic"` from expo-build-properties.
 */
export function setIosDependencyManager(
  podfile: string,
  manager: IosDependencyManager,
): string {
  const lines = podfile.split('\n');
  const existing = lines.findIndex((line) =>
    line.includes(DEPENDENCY_MANAGER_MARKER),
  );
  if (existing !== -1) {
    // also drop the blank line written after it
    lines.splice(existing, lines[existing + 1] === '' ? 2 : 1);
  }
  if (manager === 'cocoapods') {
    return lines.join('\n');
  }
  const setting = `$RNGoogleSigninDependencyManager = '${manager}' ${DEPENDENCY_MANAGER_MARKER}`;
  const targetIndex = lines.findIndex((line) => line.startsWith('target '));
  lines.splice(targetIndex === -1 ? 0 : targetIndex, 0, setting, '');
  return lines.join('\n');
}

export const withIosDependencyManager: ConfigPlugin<IosDependencyManager> = (
  config,
  manager,
) => {
  if (manager !== 'cocoapods' && manager !== 'spm') {
    throw new Error(
      `google-sign-in config plugin: \`iosDependencyManager\` must be "cocoapods" or "spm": ${JSON.stringify(
        manager,
      )}`,
    );
  }
  return withPodfile(config, (config) => {
    config.modResults.contents = setIosDependencyManager(
      config.modResults.contents,
      manager,
    );
    return config;
  });
};

const withGoogleSignInRoot: ConfigPlugin<
  Options | DependencyManagerOptions | void
> = (config: ExpoConfig, options) => {
  const { iosDependencyManager, ...signInOptions } = options ?? {};
  if (iosDependencyManager !== undefined) {
    config = withIosDependencyManager(config, iosDependencyManager);
  }
  // Options with only `iosDependencyManager` keep the Firebase setup.
  const withoutFirebase =
    options &&
    (iosDependencyManager === undefined ||
      Object.keys(signInOptions).length > 0);
  return withoutFirebase
    ? withGoogleSignInWithoutFirebase(config, options as Options)
    : withGoogleSignIn(config);
};

export default createRunOncePlugin<Options | DependencyManagerOptions | void>(
  withGoogleSignInRoot,
  pkg.name,
  pkg.version,
);
