import { Platform } from 'react-native';
import type {
  AddScopesParams,
  ConfigureParams,
  GetTokensResponse,
  HasPlayServicesParams,
  SignInParams,
  User,
} from '../types';
import { NativeModule } from '../spec/NativeGoogleSignin';

let configPromise = Promise.resolve();

function configure(options: ConfigureParams = {}): void {
  if (options.offlineAccess && !options.webClientId) {
    throw new Error('RNGoogleSignin: offline use requires server web ClientID');
  }

  configPromise = NativeModule.configure(options);
}

async function signIn(options: SignInParams = {}): Promise<User> {
  await configPromise;
  return (await NativeModule.signIn(options)) as User;
}

async function hasPlayServices(
  options: HasPlayServicesParams = { showPlayServicesUpdateDialog: true },
): Promise<boolean> {
  if (Platform.OS === 'ios') {
    return true;
  } else {
    if (options && options.showPlayServicesUpdateDialog === undefined) {
      throw new Error(
        'RNGoogleSignin: Missing property `showPlayServicesUpdateDialog` in options object for `hasPlayServices`',
      );
    }
    return NativeModule.playServicesAvailable(
      options.showPlayServicesUpdateDialog,
    );
  }
}

async function addScopes(options: AddScopesParams): Promise<User | null> {
  if (Platform.OS === 'ios') {
    return NativeModule.addScopes(options) as Promise<User | null>;
  } else {
    const hasUser = await NativeModule.addScopes(options);
    if (!hasUser) {
      return null;
    }
    // on Android, the user returned in onActivityResult() will contain only the scopes added, not the ones present previously
    // we work around it by calling signInSilently() which returns the user object with all scopes
    return signInSilently();
  }
}

async function signInSilently(): Promise<User> {
  await configPromise;
  return NativeModule.signInSilently() as Promise<User>;
}

async function signOut(): Promise<null> {
  return NativeModule.signOut();
}

async function revokeAccess(): Promise<null> {
  return NativeModule.revokeAccess();
}

function hasPreviousSignIn(): boolean {
  return NativeModule.hasPreviousSignIn();
}

function getCurrentUser(): User | null {
  return NativeModule.getCurrentUser() as User | null;
}

async function clearCachedAccessToken(tokenString: string): Promise<null> {
  if (!tokenString || typeof tokenString !== 'string') {
    return Promise.reject(
      'GoogleSignIn: clearCachedAccessToken() expects a string token.',
    );
  }
  return Platform.OS === 'ios'
    ? null
    : NativeModule.clearCachedAccessToken(tokenString);
}

async function getTokens(): Promise<GetTokensResponse> {
  if (Platform.OS === 'ios') {
    return NativeModule.getTokens();
  } else {
    const userObject = await NativeModule.getTokens();
    return {
      idToken: userObject.idToken,
      accessToken: userObject.accessToken,
    };
  }
}

/**
 * The entry point of the Google Sign In API, exposed as `GoogleSignin`.
 * @group Original Google sign in
 * */
export const GoogleSignin = {
  hasPlayServices,
  configure,
  signIn,
  addScopes,
  signInSilently,
  signOut,
  revokeAccess,
  hasPreviousSignIn,
  getCurrentUser,
  clearCachedAccessToken,
  getTokens,
};
