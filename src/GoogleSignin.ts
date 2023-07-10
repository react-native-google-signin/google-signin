import { Platform } from 'react-native';
import type { User } from './types';
import {
  AddScopesParams,
  ConfigureParams,
  GetTokensResponse,
  HasPlayServicesParams,
  SignInParams,
  NativeModule,
} from './spec/NativeGoogleSignin';

const IS_IOS = Platform.OS === 'ios';

class GoogleSignin {
  configPromise?: Promise<void>;

  async signIn(options: SignInParams = {}): Promise<User> {
    await this.configPromise;
    return (await NativeModule.signIn(options)) as User;
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
      return NativeModule.playServicesAvailable(options);
    }
  }

  configure(options: ConfigureParams = {}): void {
    if (options.offlineAccess && !options.webClientId) {
      throw new Error('RNGoogleSignin: offline use requires server web ClientID');
    }

    this.configPromise = NativeModule.configure(options);
  }

  async addScopes(options: AddScopesParams): Promise<User | null> {
    if (IS_IOS) {
      return NativeModule.addScopes(options) as Promise<User | null>;
    } else {
      const hasUser = await NativeModule.addScopes(options);
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
    return NativeModule.signInSilently() as Promise<User>;
  }

  async signOut(): Promise<null> {
    return NativeModule.signOut();
  }

  async revokeAccess(): Promise<null> {
    return NativeModule.revokeAccess();
  }

  // TODO breaking!
  hasPreviousSignIn(): boolean {
    return NativeModule.hasPreviousSignIn();
  }

  getCurrentUser(): User | null {
    return NativeModule.getCurrentUser() as User | null;
  }

  async clearCachedAccessToken(tokenString: string): Promise<null> {
    if (!tokenString || typeof tokenString !== 'string') {
      return Promise.reject('GoogleSignIn: clearCachedAccessToken() expects a string token.');
    }
    return IS_IOS ? null : NativeModule.clearCachedAccessToken(tokenString);
  }

  async getTokens(): Promise<GetTokensResponse> {
    if (IS_IOS) {
      return NativeModule.getTokens();
    } else {
      const userObject = await NativeModule.getTokens();
      return {
        idToken: userObject.idToken,
        accessToken: userObject.accessToken,
      };
    }
  }
}

export const GoogleSigninSingleton = new GoogleSignin();

const { SIGN_IN_CANCELLED, IN_PROGRESS, PLAY_SERVICES_NOT_AVAILABLE, SIGN_IN_REQUIRED } =
  NativeModule.getConstants();
export const statusCodes = Object.freeze({
  SIGN_IN_CANCELLED,
  IN_PROGRESS,
  PLAY_SERVICES_NOT_AVAILABLE,
  SIGN_IN_REQUIRED,
} as const);
