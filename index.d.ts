// Type definitions for @react-native-community/google-signin 3.0
// Project: https://github.com/react-native-community/react-native-google-signin
// Definitions by: Jacob Froman <https://github.com/j-fro>
//                 Michele Bombardi <https://github.com/bm-software>
//                 Christian Chown <https://github.com/christianchown>
//                 Eric Chen <https://github.com/echentw>

import * as React from 'react';
import { StyleProp, ViewProps, ViewStyle } from 'react-native';

export interface GoogleSigninButtonProps extends ViewProps {
  style?: StyleProp<ViewStyle>;
  size?: GoogleSigninButton.Size;
  color?: GoogleSigninButton.Color;
  disabled?: boolean;
  onPress?(): void;
}

export class GoogleSigninButton extends React.Component<GoogleSigninButtonProps> {
  constructor(props: GoogleSigninButtonProps);
}

export namespace GoogleSigninButton {
  enum Size {
    Standard,
    Wide,
    Icon,
  }

  enum Color {
    Light,
    Dark,
  }
}

export interface HasPlayServicesParams {
  /**
   * When showPlayServicesUpdateDialog is true, the user will be prompted to
   * install Play Services if on Android and they are not installed.
   * Default is true
   */
  showPlayServicesUpdateDialog?: boolean;
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
   * Must be true if you wish to access user APIs on behalf of the user from
   * your own server
   */
  offlineAccess?: boolean;

  /**
   * Specifies a hosted domain restriction
   */
  hostedDomain?: string;

  /**
   * iOS ONLY.[iOS] The user's ID, or email address, to be prefilled in the authentication UI if possible.
   * https://developers.google.com/identity/sign-in/ios/api/interface_g_i_d_sign_in.html#a0a68c7504c31ab0b728432565f6e33fd
   */
  loginHint?: string;

  /**
   * ANDROID ONLY. Specifies if the consent prompt should be shown at each login.
   */
  forceConsentPrompt?: boolean;

  /**
   * ANDROID ONLY. An account name that should be prioritized.
   */
  accountName?: string;
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

export namespace GoogleSignin {
  /**
   * Check if the device has Google Play Services installed. Always resolves
   * true on iOS
   */
  function hasPlayServices(params?: HasPlayServicesParams): Promise<boolean>;

  /**
   * Configures the library for login. MUST be called before attempting login
   */
  function configure(params?: ConfigureParams): void;

  /**
   * Returns a Promise that resolves with the current signed in user or rejects
   * if not signed in.
   */
  function signInSilently(): Promise<User>;

  /**
   * Prompts the user to sign in with their Google account. Resolves with the
   * user if successful.
   */
  function signIn(): Promise<User>;

  /**
   * Signs the user out.
   */
  function signOut(): Promise<null>;

  /**
   * Removes your application from the user's authorized applications
   */
  function revokeAccess(): Promise<null>;

  /**
   * Returns whether the user is currently signed in
   */
  function isSignedIn(): Promise<boolean>;

  function getCurrentUser(): Promise<User | null>;

  function clearCachedToken(token: string): Promise<null>;

  function getTokens(): Promise<{ idToken: string; accessToken: string }>;
}

export const statusCodes: {
  SIGN_IN_CANCELLED: string;
  IN_PROGRESS: string;
  PLAY_SERVICES_NOT_AVAILABLE: string;
  SIGN_IN_REQUIRED: string;
};
