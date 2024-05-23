/**
 * @group Original Google sign in
 * */
export type SignInParams = {
  /**
   * iOS only. The user's ID, or email address, to be prefilled in the authentication UI if possible.
   * [See docs here](https://developers.google.com/identity/sign-in/ios/reference/Classes/GIDSignIn#-signinwithpresentingviewcontroller:hint:completion:)
   */
  loginHint?: string;
};

/**
 * @group Original Google sign in
 * */
export type ConfigureParams = {
  /**
   * The Google API scopes to request access to. Default is email and profile.
   */
  scopes?: string[];
  /**
   * Web client ID from Developer Console. Required for offline access.
   */
  webClientId?: string;

  /**
   * Must be true if you wish to access user APIs on behalf of the user from your own server.
   *
   * When offline access is requested, an authorization code is returned so the server can use the authorization code to exchange for a refresh token.
   * The refresh token allows the server to access Google data when the user is not actively using the app.
   */
  offlineAccess?: boolean;

  /**
   * Specifies a hosted domain restriction. By setting this, authorization will be restricted to accounts of the user in the specified domain.
   */
  hostedDomain?: string;

  /**
   * ANDROID ONLY. Only use `true` if your server has suffered some failure and lost the user's refresh token.
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
   * iOS ONLY: The desired height and width of the profile image. Defaults to 120px
   */
  profileImageSize?: number;
} & ClientIdOrPlistPath;

export type ClientIdOrPlistPath =
  | {
      /**
       * If you want to specify the client ID of type iOS
       */
      iosClientId?: string;
    }
  | {
      /**
       * iOS only: If you want to specify a different bundle path name for the GoogleService-Info, e.g. GoogleService-Info-Staging
       */
      googleServicePlistPath?: string;
    };

/**
 * @group Original Google sign in
 * */
export type HasPlayServicesParams = {
  /**
   * Optional. Whether to show a dialog that promps the user to install Google Play Services,
   * if they don't have them installed
   */
  showPlayServicesUpdateDialog: boolean;
};

/**
 * @group Original Google sign in
 * */
export type AddScopesParams = {
  /**
   * The Google API scopes to request access to. Default is email and profile.
   */
  scopes: string[];
};

/**
 * @group Original Google sign in
 * */
export type GetTokensResponse = {
  idToken: string;
  accessToken: string;
};

/**
 * @group Original Google sign in
 * */
export type User = {
  user: {
    id: string;
    name: string | null;
    email: string;
    photo: string | null;
    familyName: string | null;
    givenName: string | null;
  };
  scopes: string[];
  /**
   * JWT (JSON Web Token) that serves as a secure credential for your user's identity.
   */
  idToken: string | null;
  /**
   * Not null only if a valid webClientId and offlineAccess: true was
   * specified in configure().
   */
  serverAuthCode: string | null;
};

/**
 * @hidden
 * */
export interface NativeModuleError extends Error {
  code: string;
}

/**
 * TypeScript helper to check if an object has the `code` property.
 * This is used to avoid `as` casting when you access the `code` property on errors returned by the module.
 */
export const isErrorWithCode = (error: any): error is NativeModuleError => {
  // to account for https://github.com/facebook/react-native/issues/41950
  const isNewArchErrorIOS = typeof error === 'object' && error != null;
  return (error instanceof Error || isNewArchErrorIOS) && 'code' in error;
};
