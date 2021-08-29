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
      console.error(
        `RN GoogleSignin native module is not correctly linked. Please read the readme, setup and troubleshooting instructions carefully or try manual linking. If you're using Expo, please use expo-google-sign-in. This is because Expo does not support custom native modules.`,
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
    const isSignedIn = await this.isSignedIn();
    if (!isSignedIn) {
      return null;
    }
    return IS_IOS ? RNGoogleSignin.addScopes(options) : RNGoogleSignin.getCurrentUser();
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
  SIGN_IN_CANCELLED: RNGoogleSignin.SIGN_IN_CANCELLED,
  IN_PROGRESS: RNGoogleSignin.IN_PROGRESS,
  PLAY_SERVICES_NOT_AVAILABLE: RNGoogleSignin.PLAY_SERVICES_NOT_AVAILABLE,
  SIGN_IN_REQUIRED: RNGoogleSignin.SIGN_IN_REQUIRED,
};
