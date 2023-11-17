import { NativeModules, Platform } from 'react-native';
import type {
  AddScopesParams,
  SignInParams,
  ConfigureParams,
  HasPlayServicesParams,
  User,
} from './types';

const { RNGoogleSignin } = NativeModules;

const IS_IOS = Platform.OS === 'ios';

class GoogleSignin {
  configPromise?: Promise<void>;

  constructor() {
    if (__DEV__ && !RNGoogleSignin) {
      throw new Error(
        `RN GoogleSignin native module is not correctly linked. Please read the readme, setup and troubleshooting instructions carefully.\nIf you are using Expo, make sure you are using Custom dev client, not Expo go.`,
      );
    }
  }

  async signIn(options: SignInParams = {}): Promise<User> {
    await this.configPromise;
    return await RNGoogleSignin.signIn(options);
  }

  async hasPlayServices(
    options: HasPlayServicesParams = { showPlayServicesUpdateDialog: true },
  ): Promise<boolean> {
    if (IS_IOS) {
      return true;
    } else {
      if (options && options.showPlayServicesUpdateDialog === undefined) {
        throw new Error(
          'RNGoogleSignin: Missing property `showPlayServicesUpdateDialog` in options object for `hasPlayServices`',
        );
      }
      return RNGoogleSignin.playServicesAvailable(options.showPlayServicesUpdateDialog);
    }
  }

  configure(options: ConfigureParams = {}): void {
    if (options.offlineAccess && !options.webClientId) {
      throw new Error('RNGoogleSignin: offline use requires server web ClientID');
    }

    this.configPromise = RNGoogleSignin.configure(options);
  }

  async addScopes(options: AddScopesParams): Promise<User | null> {
    if (IS_IOS) {
      return RNGoogleSignin.addScopes(options);
    } else {
      const hasUser = await RNGoogleSignin.addScopes(options);
      if (!hasUser) {
        return null;
      }
      // on Android, the user returned in onActivityResult() will contain only the scopes added, not the ones present previously
      // we work around it by calling signInSilently() which returns the user object with all scopes
      return this.signInSilently();
    }
  }

  async signInSilently(): Promise<User> {
    await this.configPromise;
    return RNGoogleSignin.signInSilently();
  }

  async signOut(): Promise<null> {
    return RNGoogleSignin.signOut();
  }

  async revokeAccess(): Promise<null> {
    return RNGoogleSignin.revokeAccess();
  }

  async isSignedIn(): Promise<boolean> {
    return RNGoogleSignin.isSignedIn();
  }

  async getCurrentUser(): Promise<User | null> {
    return RNGoogleSignin.getCurrentUser();
  }

  async clearCachedAccessToken(tokenString: string): Promise<null> {
    if (!tokenString || typeof tokenString !== 'string') {
      return Promise.reject('GoogleSignIn: clearCachedAccessToken() expects a string token.');
    }
    return IS_IOS ? null : await RNGoogleSignin.clearCachedAccessToken(tokenString);
  }

  async getTokens(): Promise<{ idToken: string; accessToken: string }> {
    if (IS_IOS) {
      const tokens = await RNGoogleSignin.getTokens();
      return tokens;
    } else {
      const userObject = await RNGoogleSignin.getTokens();
      return {
        idToken: userObject.idToken,
        accessToken: userObject.accessToken,
      };
    }
  }
}

export const GoogleSigninSingleton = new GoogleSignin();

export const statusCodes = {
  SIGN_IN_CANCELLED: RNGoogleSignin.SIGN_IN_CANCELLED as string,
  IN_PROGRESS: RNGoogleSignin.IN_PROGRESS as string,
  PLAY_SERVICES_NOT_AVAILABLE: RNGoogleSignin.PLAY_SERVICES_NOT_AVAILABLE as string,
  SIGN_IN_REQUIRED: RNGoogleSignin.SIGN_IN_REQUIRED as string,
} as const;
