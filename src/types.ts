// Type definitions for @react-native-google-signin/google-signin
// Project: https://github.com/react-native-community/google-signin
// Definitions by: Jacob Froman <https://github.com/j-fro>
//                 Michele Bombardi <https://github.com/bm-software>
//                 Christian Chown <https://github.com/christianchown>
//                 Eric Chen <https://github.com/echentw>

import type { StyleProp, ViewProps, ViewStyle } from 'react-native';

export interface HasPlayServicesParams {
  /**
   * When showPlayServicesUpdateDialog is true, the user will be prompted to
   * install Play Services if on Android and they are not installed.
   * Default is true
   */
  showPlayServicesUpdateDialog?: boolean;
}

export interface SignInParams {
  /**
   * iOS ONLY. The user's ID, or email address, to be prefilled in the authentication UI if possible.
   * https://developers.google.com/identity/sign-in/ios/api/interface_g_i_d_sign_in.html#a0a68c7504c31ab0b728432565f6e33fd
   */
  loginHint?: string;
}

export interface AddScopesParams {
  /**
   * The Google API scopes to request access to. Default is email and profile.
   */
  scopes?: string[];
}

export interface ConfigureParams {
  /**
   * The Google API scopes to request access to. Default is email and profile.
   */
  scopes?: string[];
  /**
   * Web client ID from Developer Console. Required for offline access
   */
  webClientId?: string;

  /**
   * If you want to specify the client ID of type iOS
   */
  iosClientId?: string;

  /**
   * If you want to specify a different bundle path name for the GoogleService-Info, e.g. GoogleService-Info-Staging
   */
  googleServicePlistPath?: string;

  /**
   * Must be true if you wish to access user APIs on behalf of the user from
   * your own server
   */
  offlineAccess?: boolean;

  /**
   * Specifies a hosted domain restriction
   */
  hostedDomain?: string;

  /**
   * ANDROID ONLY. If true, the granted server auth code can be exchanged for an access token and a refresh token.
   */
  forceCodeForRefreshToken?: boolean;

  /**
   * ANDROID ONLY. An account name that should be prioritized.
   */
  accountName?: string;

  /**
   * iOS ONLY
   * The OpenID2 realm of the home web server. This allows Google to include the user's OpenID
   * Identifier in the OpenID Connect ID token.
   */
  openIdRealm?: string;
  /**
   * iOS ONLY The desired height (and width) of the profile image. Defaults to 120px
   */
  profileImageSize?: number;
}

export interface User {
  user: {
    id: string;
    name: string | null;
    email: string;
    photo: string | null;
    familyName: string | null;
    givenName: string | null;
  };
  scopes?: string[];
  idToken: string | null;
  /**
   * Not null only if a valid webClientId and offlineAccess: true was
   * specified in configure().
   */
  serverAuthCode: string | null;
}

export interface NativeModuleError extends Error {
  code: string;
}

export interface GoogleSigninButtonProps extends ViewProps {
  style?: StyleProp<ViewStyle>;
  size?: number;
  color?: number;
  disabled?: boolean;
  onPress?(): void;
}
