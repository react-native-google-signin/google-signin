import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

export interface SignInParams {
  /**
   * iOS ONLY. The user's ID, or email address, to be prefilled in the authentication UI if possible.
   * https://developers.google.com/identity/sign-in/ios/api/interface_g_i_d_sign_in.html#a0a68c7504c31ab0b728432565f6e33fd
   */
  loginHint?: string;
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

export interface HasPlayServicesParams {
  showPlayServicesUpdateDialog: boolean;
}

export interface AddScopesParams {
  /**
   * The Google API scopes to request access to. Default is email and profile.
   */
  scopes?: string[];
}

export interface GetTokensResponse {
  idToken: string;
  accessToken: string;
}
export interface Spec extends TurboModule {
  // using Object to be compatible with paper
  signIn(params: Object): Promise<Object>;
  configure(params: Object): Promise<void>;
  addScopes(params: Object): Promise<Object | null>;
  playServicesAvailable(params: Object): Promise<boolean>;
  signInSilently(): Promise<Object>;
  signOut(): Promise<null>;
  revokeAccess(): Promise<null>;
  clearCachedAccessToken(tokenString: string): Promise<null>;
  hasPreviousSignIn(): boolean;
  getCurrentUser(): Object | null;
  getTokens(): Promise<GetTokensResponse>;
  getConstants(): {
    SIGN_IN_CANCELLED: string;
    IN_PROGRESS: string;
    PLAY_SERVICES_NOT_AVAILABLE: string;
    SIGN_IN_REQUIRED: string;
    BUTTON_SIZE_ICON: number;
    BUTTON_SIZE_WIDE: number;
    BUTTON_SIZE_STANDARD: number;
    BUTTON_COLOR_DARK: number;
    BUTTON_COLOR_LIGHT: number;
  };
}

export const NativeModule = TurboModuleRegistry.getEnforcing<Spec>('RNGoogleSignin');
